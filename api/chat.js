export default async function handler(req, res) {
  // ✅ CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const { message } = req.body;

    // ✅ NORMALIZZA MESSAGGI (importantissimo)
    let messages = [];

    if (Array.isArray(message)) {
      messages = message.map(m => ({
        role: m.role || "user",
        content: String(m.content || "")
      }));
    } else {
      messages = [
        {
          role: "user",
          content: String(message || "")
        }
      ];
    }

    // ✅ CHIAMATA OPENAI SICURA
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Sei un assistente IT.

Rispondi SOLO con JSON valido:

{
  "summary": "",
  "probableCause": "",
  "suggestedSteps": ["", ""],
  "confidence": "",
  "ticketRecommended": true
}
`
          },
          ...messages
        ]
      })
    });

    // ✅ controlla risposta
    const raw = await response.text();
    console.log("RAW:", raw);

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(200).json({
        summary: "Errore nella risposta AI.",
        probableCause: "Formato non valido",
        suggestedSteps: ["Riprovare"],
        confidence: "bassa",
        ticketRecommended: true
      });
    }

    const content = data?.choices?.[0]?.message?.content || "";

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        summary: content,
        probableCause: "Non determinato",
        suggestedSteps: ["Verifica manuale"],
        confidence: "bassa",
        ticketRecommended: true
      };
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("Errore backend:", error);

    return res.status(200).json({
      summary: "Errore server.",
      probableCause: error.message,
      suggestedSteps: ["Riprovare"],
      confidence: "bassa",
      ticketRecommended: true
    });
  }
}
