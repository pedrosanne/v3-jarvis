// Iara AI extension popup — focused launcher with configurable domain.
//
// The extension does NOT embed the app: the Iara experience needs real-time
// loops, image paste, drag&drop, and a big canvas that won't fit a 360px popup.
// Instead we open /iara in a new tab, on a configurable base URL so the same
// extension works against any deployment (production, staging, custom domain,
// self-hosted).

const DEFAULT_APP_URL = "https://v1-jarvis.lovable.app";
const IARA_PATH = "/iara";
const STORAGE_KEY = "iara_app_url";

const $ = (id) => document.getElementById(id);
const views = {
  main: $("view-main"),
  settings: $("view-settings"),
};
function show(name) {
  Object.entries(views).forEach(([k, el]) => el.classList.toggle("hidden", k !== name));
}

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

// --- ACTIONS ---
$("openIara").addEventListener("click", async () => {
  const base = await currentBase();
  openTab(base + IARA_PATH);
});

$("openFullApp").addEventListener("click", async () => {
  const base = await currentBase();
  openTab(base + "/");
});

$("openSettings").addEventListener("click", async () => {
  const input = $("domainInput");
  input.value = await currentBase();
  $("domainHint").textContent = `Padrão: ${DEFAULT_APP_URL}`;
  $("domainStatus").className = "status hidden";
  show("settings");
});

$("backFromSettings").addEventListener("click", () => show("main"));

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
    // Validate
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
});

show("main");
