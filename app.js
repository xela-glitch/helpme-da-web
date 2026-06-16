const SUPPORT_EMAIL = "a2x@hotmail.it";
// =============================
// ✅ AI REALE (backend Vercel)
// =============================
async function callRealAi(request) {
  const response = await fetch("https://helpme-da-c2yvk6lne-xela-s-projects1.vercel.app/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: JSON.stringify(request)
    })
  });

  if (!response.ok) {
    throw new Error("Errore chiamata API");
  }

  return await response.json();
}
const STORAGE_KEY = "help-me-da-web-requests";

const form = document.querySelector("#request-form");
const formError = document.querySelector("#form-error");
const emptyState = document.querySelector("#empty-state");
const analysisResult = document.querySelector("#analysis-result");
const requestIdEl = document.querySelector("#request-id");
const summaryEl = document.querySelector("#summary");
const probableCauseEl = document.querySelector("#probable-cause");
const suggestedStepsEl = document.querySelector("#suggested-steps");
const confidenceEl = document.querySelector("#confidence");
const recommendationEl = document.querySelector("#recommendation");
const markResolvedButton = document.querySelector("#mark-resolved");
const sendEmailButton = document.querySelector("#send-email");
const clearHistoryButton = document.querySelector("#clear-history");
const historyList = document.querySelector("#history-list");
const emailFallback = document.querySelector("#email-fallback");
const emailFallbackMessage = document.querySelector("#email-fallback-message");
const outlookLink = document.querySelector("#outlook-link");
const mailtoLink = document.querySelector("#mailto-link");
const copyEmailButton = document.querySelector("#copy-email");
const emailBodyPreview = document.querySelector("#email-body-preview");

let currentRequestId = null;

function getRequests() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRequests(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function updateRequest(id, changes) {
  const requests = getRequests();
  const request = requests.find((item) => item.id === id);
  if (!request) return;
  Object.assign(request, changes, { updatedAt: new Date().toISOString() });
  saveRequests(requests);
  renderStats();
  renderHistory();
}

function collectFormData() {
  return {
    requesterName: form.requesterName.value.trim(),
    requesterEmail: form.requesterEmail.value.trim(),
    category: form.category.value,
    priority: form.priority.value,
    subject: form.subject.value.trim(),
    description: form.description.value.trim(),
    affectedService: form.affectedService.value.trim()
  };
}

function validateRequest(request) {
  if (!request.requesterName || request.requesterName.length < 2) return "Inserisci nome e cognome.";
  if (!request.requesterEmail || !request.requesterEmail.includes("@")) return "Inserisci un indirizzo e-mail valido.";
  if (!request.category) return "Seleziona una categoria.";
  if (!request.subject || request.subject.length < 3) return "Inserisci un oggetto di almeno 3 caratteri.";
  if (!request.description || request.description.length < 10) return "Descrivi il problema con almeno 10 caratteri.";
  return "";
}

function analyzeWithLocalAi(request) {
  const text = `${request.subject} ${request.description} ${request.affectedService} ${request.category}`.toLowerCase();
  const critical = request.priority === "alta" || request.priority === "critica";

  if (
    text.includes("word") ||
    text.includes("excel") ||
    text.includes("powerpoint") ||
    text.includes("outlook") ||
    text.includes("office") ||
    text.includes("microsoft 365")
  ) {
    const product = text.includes("word")
      ? "Word"
      : text.includes("excel")
        ? "Excel"
        : text.includes("powerpoint")
          ? "PowerPoint"
          : text.includes("outlook")
            ? "Outlook"
            : "Microsoft 365";

    return {
      summary: `La richiesta riguarda ${product} o un'applicazione Microsoft 365 che non si avvia correttamente.`,
      probableCause: "Possibile componente aggiuntivo difettoso, profilo utente corrotto, aggiornamento incompleto o file temporanei/cache danneggiati.",
      suggestedSteps: [
        `Chiudi completamente ${product} e verifica dal Task Manager che non restino processi aperti.`,
        `Prova ad avviare ${product} in modalita provvisoria. Per Word puoi usare Win + R e digitare: winword /safe.`,
        "Se si apre in modalita provvisoria, disattiva i componenti aggiuntivi e riavvia normalmente.",
        "Esegui una riparazione di Microsoft 365 da Impostazioni > App > Microsoft 365 > Modifica > Ripristino rapido.",
        "Se il problema continua, invia la richiesta al supporto includendo eventuali messaggi di errore."
      ],
      confidence: "alta",
      ticketRecommended: true
    };
  }

  if (text.includes("password") || text.includes("accesso") || text.includes("login")) {
    return {
      summary: "La richiesta sembra riguardare accesso, credenziali o autenticazione.",
      probableCause: "Credenziali scadute, account bloccato o sessione non valida.",
      suggestedSteps: [
        "Verifica di usare l'account corretto e riprova da una finestra privata del browser.",
        "Se disponibile, usa la procedura aziendale di reset password.",
        "Controlla eventuali messaggi di blocco account o autenticazione a piu fattori.",
        "Se l'accesso resta bloccato, prepara l'invio della richiesta al supporto."
      ],
      confidence: "alta",
      ticketRecommended: critical
    };
  }

  if (text.includes("rete") || text.includes("wifi") || text.includes("vpn") || text.includes("connessione")) {
    return {
      summary: "La richiesta sembra collegata alla connettivita di rete.",
      probableCause: "Connessione instabile, VPN non attiva o configurazione di rete non corretta.",
      suggestedSteps: [
        "Verifica se altri siti o servizi aziendali sono raggiungibili.",
        "Disconnetti e riconnetti la VPN, se prevista.",
        "Riavvia la connessione Wi-Fi o prova una rete alternativa.",
        "Annota eventuali codici errore prima di inviare la richiesta al supporto."
      ],
      confidence: "media",
      ticketRecommended: critical
    };
  }

  if (text.includes("stampante") || text.includes("pc") || text.includes("monitor") || text.includes("hardware")) {
    return {
      summary: "La richiesta potrebbe riguardare un dispositivo fisico o una periferica.",
      probableCause: "Dispositivo non collegato, driver non aggiornato o guasto hardware.",
      suggestedSteps: [
        "Controlla alimentazione, cavi e collegamenti.",
        "Riavvia il dispositivo coinvolto.",
        "Verifica se il problema riguarda anche altri utenti o solo la tua postazione.",
        "Se il problema persiste, invia la richiesta al supporto."
      ],
      confidence: "media",
      ticketRecommended: true
    };
  }

  if (text.includes("errore") || text.includes("app") || text.includes("software") || text.includes("applicazione")) {
    return {
      summary: "La richiesta sembra riguardare un'applicazione o un errore software.",
      probableCause: "Cache applicativa, versione non aggiornata o anomalia del servizio.",
      suggestedSteps: [
        "Chiudi e riapri l'applicazione.",
        "Riprova da browser o dispositivo diverso, se possibile.",
        "Copia il messaggio di errore completo.",
        "Se l'errore si ripete, invia la richiesta al supporto."
      ],
      confidence: "media",
      ticketRecommended: critical
    };
  }

  return {
    summary: "La richiesta e stata analizzata con le informazioni disponibili.",
    probableCause: "Non emerge una causa univoca dalla descrizione.",
    suggestedSteps: [
      "Rileggi la descrizione e aggiungi eventuali messaggi di errore.",
      "Verifica se il problema si presenta sempre o solo in alcune condizioni.",
      "Prova un riavvio dell'applicazione o del dispositivo coinvolto.",
      "Se il problema non si risolve, invia la richiesta al supporto."
    ],
    confidence: "bassa",
    ticketRecommended: true
  };
}

function renderAnalysis(requestRecord) {
  currentRequestId = requestRecord.id;
  emptyState.hidden = true;
  analysisResult.hidden = false;
  requestIdEl.textContent = `Richiesta ${requestRecord.id}`;
  summaryEl.textContent = requestRecord.ai.summary;
  probableCauseEl.textContent = requestRecord.ai.probableCause;
  confidenceEl.textContent = requestRecord.ai.confidence;
  recommendationEl.textContent = requestRecord.ai.ticketRecommended
    ? "Se i passaggi non risolvono il problema, e consigliato inviare la richiesta al supporto."
    : "Prova prima i passaggi suggeriti. Puoi comunque inviare una richiesta se il problema persiste.";

  suggestedStepsEl.innerHTML = "";
  requestRecord.ai.suggestedSteps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    suggestedStepsEl.appendChild(item);
  });
}

function createMailtoUrl(record) {
  const email = createEmailPayload(record);
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
}

function createOutlookUrl(record) {
  const email = createEmailPayload(record);
  const params = new URLSearchParams({
    to: SUPPORT_EMAIL,
    subject: email.subject,
    body: email.body
  });
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
}

function createEmailPayload(record) {
  const subject = `[Help-Me DA Vers. web] ${record.request.subject}`;
  const body = [
    "Richiesta generata da Help-Me DA Vers. web",
    "",
    `ID richiesta: ${record.id}`,
    `Data: ${new Date(record.createdAt).toLocaleString("it-IT")}`,
    `Richiedente: ${record.request.requesterName}`,
    `E-mail richiedente: ${record.request.requesterEmail}`,
    `Categoria: ${record.request.category}`,
    `Priorita: ${record.request.priority}`,
    `Servizio coinvolto: ${record.request.affectedService || "Non indicato"}`,
    "",
    "Oggetto:",
    record.request.subject,
    "",
    "Descrizione:",
    record.request.description,
    "",
    "Analisi AI:",
    record.ai.summary,
    "",
    "Possibile causa:",
    record.ai.probableCause,
    "",
    "Passaggi suggeriti:",
    ...record.ai.suggestedSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    `Attendibilita: ${record.ai.confidence}`,
    `Ticket consigliato: ${record.ai.ticketRecommended ? "Si" : "No"}`
  ].join("\n");

  return { to: SUPPORT_EMAIL, subject, body };
}

function showEmailFallback(record, message) {
  const email = createEmailPayload(record);
  emailFallback.hidden = false;
  emailFallbackMessage.textContent = message;
  outlookLink.href = createOutlookUrl(record);
  mailtoLink.href = createMailtoUrl(record);
  emailBodyPreview.value = email.body;
}

function renderStats() {
  const requests = getRequests();
  document.querySelector("#stat-total").textContent = String(requests.length);
  document.querySelector("#stat-ai").textContent = String(requests.filter((item) => item.outcome === "ai_resolved").length);
  document.querySelector("#stat-email").textContent = String(requests.filter((item) => item.outcome === "email_prepared").length);
  document.querySelector("#stat-pending").textContent = String(requests.filter((item) => item.outcome === "pending_user_confirmation").length);
}

function renderHistory() {
  const requests = getRequests().slice().reverse();
  historyList.innerHTML = "";

  if (requests.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-history";
    empty.textContent = "Nessuna richiesta registrata in questo browser.";
    historyList.appendChild(empty);
    return;
  }

  requests.forEach((record) => {
    const item = document.createElement("article");
    item.className = "history-item";
    const statusLabel = {
      ai_resolved: "Risolta con AI",
      email_prepared: "E-mail preparata",
      pending_user_confirmation: "In attesa"
    }[record.outcome] || record.outcome;

    item.innerHTML = `
      <h4></h4>
      <p></p>
      <p></p>
      <span class="badge"></span>
    `;
    item.querySelector("h4").textContent = record.request.subject;
    item.querySelectorAll("p")[0].textContent = `${record.request.category} · priorita ${record.request.priority}`;
    item.querySelectorAll("p")[1].textContent = new Date(record.createdAt).toLocaleString("it-IT");
    item.querySelector(".badge").textContent = statusLabel;
    historyList.appendChild(item);
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const request = collectFormData();
  const error = validateRequest(request);

  if (error) {
    formError.textContent = error;
    formError.hidden = false;
    return;
  }

  formError.hidden = true;
  let ai;

try {
  ai = await callRealAi(request);
} catch (error) {
  console.error("Errore AI, uso fallback locale:", error);
  ai = analyzeWithLocalAi(request);
}

const record = {
  id: `HMW-${Date.now()}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  request,
  ai,
  outcome: "pending_user_confirmation"
};
  const requests = getRequests();
  requests.push(record);
  saveRequests(requests);
  renderAnalysis(record);
  renderStats();
  renderHistory();
});

form.addEventListener("reset", () => {
  formError.hidden = true;
});

markResolvedButton.addEventListener("click", () => {
  if (!currentRequestId) return;
  updateRequest(currentRequestId, { outcome: "ai_resolved" });
  recommendationEl.textContent = "Richiesta registrata come risolta con il supporto dell'AI.";
});

sendEmailButton.addEventListener("click", () => {
  if (!currentRequestId) return;
  const record = getRequests().find((item) => item.id === currentRequestId);
  if (!record) return;
  sendEmailButton.disabled = true;
  sendEmailButton.textContent = "Invio in corso...";

  fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createEmailPayload(record))
  })
    .then(async (response) => {
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Invio automatico non disponibile.");
      }

      updateRequest(currentRequestId, { outcome: "email_prepared" });
      recommendationEl.textContent = "Richiesta inviata via e-mail al supporto.";
      emailFallback.hidden = true;
    })
    .catch((error) => {
      updateRequest(currentRequestId, { outcome: "email_prepared" });
      showEmailFallback(record, `${error.message} Puoi aprire Outlook Web oppure copiare il testo della richiesta.`);
    })
    .finally(() => {
      sendEmailButton.disabled = false;
      sendEmailButton.textContent = "Invia richiesta di assistenza";
    });
});

copyEmailButton.addEventListener("click", () => {
  emailBodyPreview.select();
  navigator.clipboard
    .writeText(emailBodyPreview.value)
    .then(() => {
      copyEmailButton.textContent = "Testo copiato";
      setTimeout(() => {
        copyEmailButton.textContent = "Copia testo";
      }, 1800);
    })
    .catch(() => {
      document.execCommand("copy");
    });
});

clearHistoryButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  currentRequestId = null;
  emptyState.hidden = false;
  analysisResult.hidden = true;
  emailFallback.hidden = true;
  renderStats();
  renderHistory();
});

renderStats();
renderHistory();
