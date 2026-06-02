// Iara AI extension popup — embeds /iara directly via iframe.
// The popup is sized to Chrome's max (780x600) and the entire Iara experience
// (broker check, account ID, print upload, slide-to-hack, terminal, signals)
// runs inside the iframe with full functionality.

const DEFAULT_APP_URL = "https://v1-jarvis.lovable.app";
const IARA_PATH = "/iara";
const STORAGE_KEY = "iara_app_url";

const $ = (id) => document.getElementById(id);

function normalize(url) {
  if (!url) return "";
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u.replace(/\/+$/, "");
}

function getStoredUrl() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([STORAGE_KEY], (r) => resolve(r[STORAGE_KEY] || ""));
    } catch {
      resolve("");
    }
  });
}

function setStoredUrl(url) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: url }, resolve);
    } catch {
      resolve();
    }
  });
}

async function currentBase() {
  return (await getStoredUrl()) || DEFAULT_APP_URL;
}

function openTab(url) {
  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, "_blank", "noopener");
  }
}

async function loadIara() {
  const base = await currentBase();
  const url = base + IARA_PATH;
  const iframe = $("appFrame");
  const loader = $("loader");
  loader.classList.remove("fade-out");
  // Cache-bust opcional para garantir recarga após mudança de domínio
  iframe.src = url;
  // Esconde o loader quando o iframe terminar de carregar (ou após timeout)
  let hidden = false;
  const hide = () => {
    if (hidden) return;
    hidden = true;
    loader.classList.add("fade-out");
    setTimeout(() => loader.classList.add("hidden"), 400);
  };
  iframe.addEventListener("load", hide, { once: true });
  setTimeout(hide, 6000); // fallback se o evento load demorar
}

// --- Topbar actions ---
$("openTab").addEventListener("click", async () => {
  const base = await currentBase();
  openTab(base + IARA_PATH);
});

$("openSettings").addEventListener("click", async () => {
  const input = $("domainInput");
  input.value = await currentBase();
  $("domainHint").textContent = `Padrão: ${DEFAULT_APP_URL}`;
  $("domainStatus").className = "status hidden";
  $("view-settings").classList.remove("hidden");
});

$("backFromSettings").addEventListener("click", () => {
  $("view-settings").classList.add("hidden");
});

$("resetDomain").addEventListener("click", async () => {
  await setStoredUrl("");
  $("domainInput").value = DEFAULT_APP_URL;
  const s = $("domainStatus");
  s.textContent = "Domínio restaurado para o padrão.";
  s.className = "status ok";
});

$("domainForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const s = $("domainStatus");
  const url = normalize($("domainInput").value);
  try {
    new URL(url);
  } catch {
    s.textContent = "URL inválida.";
    s.className = "status err";
    return;
  }
  await setStoredUrl(url);
  s.textContent = `Salvo · usando ${url}`;
  s.className = "status ok";
  $("domainInput").value = url;
  // Recarrega a Iara com o novo domínio e fecha o painel
  await loadIara();
  setTimeout(() => $("view-settings").classList.add("hidden"), 600);
});

// Boot
loadIara();
