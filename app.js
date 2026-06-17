// =============================
// ✅ STATO CHAT
// =============================
let messages = [];

// =============================
// ✅ ELEMENTI
// =============================
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

// ✅ sicurezza (evita errori null)
if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

if (input) {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

// =============================
// ✅ INVIO MESSAGGIO
// =============================
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // 👤 messaggio utente
  addMessage("user", text);
  messages.push({ role: "user", content: text });

  input.value = "";

  // 🤖 loading
  const loading = addMessage("ai", "Scrivendo...");

  try {
    const response = await fetch("https://helpme-da-web.vercel.app/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: messages })
    });

    const data = await response.json();

    console.log("✅ Risposta AI:", data);

    const reply = `
🧠 ${data.summary}

🔍 Possibile causa:
${data.probableCause}

🛠️ Passaggi suggeriti:
${data.suggestedSteps?.join("\n- ")}

📊 Attendibilità: ${data.confidence}
`;


    // aggiorno messaggio
    updateMessage(loading, reply);

    messages.push({ role: "assistant", content: reply });

  } catch (error) {
    console.error("Errore:", error);
    updateMessage(loading, "Errore nella risposta AI");
  }
}

// =============================
// ✅ UI MESSAGGI
// =============================
function addMessage(role, text) {
  if (!chatBox) return;

  const msg = document.createElement("div");
  msg.className = `msg ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.innerText = text;

  msg.appendChild(bubble);
  chatBox.appendChild(msg);

  chatBox.scrollTop = chatBox.scrollHeight;

  return bubble;
}

function updateMessage(element, text) {
  element.innerText = text;
}
