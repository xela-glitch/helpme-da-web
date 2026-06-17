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

    // ✅ SUPPORTO CHAT
    const messages = Array.isArray(message)
      ? message
      : [{ role: "user", content: message }];

    // ✅ CALL OPENAI SICURA
    let rawText;
    let data;

    try {
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

Rispondi SEMPRE in JSON valido (senza markdown).

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
            ...messages
          ]
        })
      });

      // ✅ leggo SEMPRE testo grezzo
      rawText = await response.text();
      console.log("🔎 RAW RESPONSE:", rawText);

      // ✅ provo parse JSON OpenAI
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        console.error("❌ risposta OpenAI non JSON valida");

        return res.status(200).json({
          summary: "Errore nella risposta AI.",
          probableCause: "Output OpenAI non valido",
          suggestedSteps: ["Riprovare"],
          confidence: "bassa",
          ticketRecommended: true
        });
      }

    } catch (err) {
      console.error("❌ ERRORE CHIAMATA OPENAI:", err);

      return res.status(200).json({
        summary: "Errore server AI.",
        probableCause: err.message,
        suggestedSteps: ["Riprovare tra poco"],
        confidence: "bassa",
