// Open the side panel when the user clicks the toolbar icon.
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((err) => console.error("[JARVIS] sidePanel setPanelBehavior", err));
  }
});

chrome.action?.onClicked.addListener(async (tab) => {
  try {
    if (tab?.windowId != null && chrome.sidePanel?.open) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    }
  } catch (err) {
    console.error("[JARVIS] sidePanel open", err);
  }
});
