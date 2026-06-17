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

    // ✅ FIX CHAT (supporta array di messaggi)
    const messages = Array.isArray(message)
      ? message
      : [{ role: "user", content: message }];

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
Sei un assistente IT esperto.

Rispondi SEMPRE in JSON valido, senza markdown.

Formato:
{
  "summary": "",
  "probableCause": "",
  "suggestedSteps": ["", ""],
  "confidence": "bassa/media/alta",
  "ticketRecommended": true
}
`
          },
          ...messages  // ✅ QUI PASSIAMO LA CHAT COMPLETA
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Errore OpenAI:", errorText);

      return res.status(200).json({
        summary: "Errore nella risposta AI.",
        probableCause: errorText,
        suggestedSteps: ["Riprovare tra qualche minuto"],
        confidence: "bassa",
        ticketRecommended: true
      });
    }

    const data = await response.json();
    console.log("✅ OpenAI RAW:", data);

    const text = data?.choices?.[0]?.message?.content || "";

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.warn("⚠️ JSON non valido, uso fallback", text);

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
    console.error("❌ Errore backend:", error);

    return res.status(200).json({
      summary: "Errore durante l'elaborazione.",
