// JARVIS side panel — embeds the full app via iframe.
// Rebranded from JARVIS to JARVIS. The panel auto-resizes to whatever width
// the user drags the Chrome side panel to.

const DEFAULT_APP_URL = "https://v3-jarvis.lovable.app";
const DEFAULT_PATH = "/jarvis";
const URL_KEY = "jarvis_app_url";
const PATH_KEY = "jarvis_app_path";

const $ = (id) => document.getElementById(id);

function normalize(url) {
  if (!url) return "";
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u.replace(/\/+$/, "");
}
function normalizePath(p) {
  if (!p) return DEFAULT_PATH;
  let path = p.trim();
  if (!path.startsWith("/")) path = "/" + path;
  return path.replace(/\/+$/, "") || "/";
}

function getStored(key) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([key], (r) => resolve(r[key] || ""));
    } catch {
      resolve("");
    }
  });
}
function setStored(key, value) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set({ [key]: value }, resolve);
    } catch {
      resolve();
    }
  });
}

async function currentBase() {
  return (await getStored(URL_KEY)) || DEFAULT_APP_URL;
}
async function currentPath() {
  return (await getStored(PATH_KEY)) || DEFAULT_PATH;
}

function openTab(url) {
  if (typeof chrome !== "undefined" && chrome.tabs?.create) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, "_blank", "noopener");
  }
}

async function loadJarvis() {
  const base = await currentBase();
  const path = await currentPath();
  const url = base + path;
  const iframe = $("appFrame");
  const preloader = $("preloader");
  const video = $("preloaderVideo");

  preloader.classList.remove("fade-out", "hidden");
  iframe.src = url;

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    preloader.classList.add("fade-out");
    setTimeout(() => preloader.classList.add("hidden"), 500);
  };

  video.addEventListener("ended", finish, { once: true });
  video.addEventListener("error", finish, { once: true });
  setTimeout(finish, 15000);

  try {
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => finish());
  } catch {
    finish();
  }
}

$("openTab").addEventListener("click", async () => {
  openTab((await currentBase()) + (await currentPath()));
});

$("reloadFrame").addEventListener("click", () => {
  loadJarvis();
});

$("openSettings").addEventListener("click", async () => {
  $("domainInput").value = await currentBase();
  $("pathInput").value = await currentPath();
  $("domainHint").textContent = `Padrão: ${DEFAULT_APP_URL}${DEFAULT_PATH}`;
  $("domainStatus").className = "status hidden";
  $("view-settings").classList.remove("hidden");
});

$("backFromSettings").addEventListener("click", () => {
  $("view-settings").classList.add("hidden");
});

$("resetDomain").addEventListener("click", async () => {
  await setStored(URL_KEY, "");
  await setStored(PATH_KEY, "");
  $("domainInput").value = DEFAULT_APP_URL;
  $("pathInput").value = DEFAULT_PATH;
  const s = $("domainStatus");
  s.textContent = "Restaurado para o padrão.";
  s.className = "status ok";
});

$("domainForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const s = $("domainStatus");
  const url = normalize($("domainInput").value);
  const path = normalizePath($("pathInput").value);
  try {
    new URL(url);
  } catch {
    s.textContent = "URL inválida.";
    s.className = "status err";
    return;
  }
  await setStored(URL_KEY, url);
  await setStored(PATH_KEY, path);
  s.textContent = `Salvo · ${url}${path}`;
  s.className = "status ok";
  await loadJarvis();
  setTimeout(() => $("view-settings").classList.add("hidden"), 600);
});

loadJarvis();
