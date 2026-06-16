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
            content: "Sei un help desk IT e rispondi in JSON."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        summary: text,
        probableCause: "Non determinato",
        suggestedSteps: ["Verifica manuale"],
        confidence: "bassa",
        ticketRecommended: true
      };
    }

    return res.status(200).json(parsed);

  } catch (error) {
    return res.status(500).json({ error: "Errore server" });
  }
}
