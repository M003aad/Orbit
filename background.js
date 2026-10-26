// Background service worker: performs the privileged actions the menu requests.
// Content scripts cannot open chrome:// pages or create windows, so they message us.

importScripts("shared.js");

const isEdge = /Edg\//.test(navigator.userAgent);
const scheme = isEdge ? "edge" : "chrome";

const PAGES = {
  history: `${scheme}://history`,
  extensions: `${scheme}://extensions`,
  passwords: isEdge ? "edge://wallet/passwords" : "chrome://password-manager/passwords",
  settings: `${scheme}://settings`,
  downloads: `${scheme}://downloads`,
  bookmarks: `${scheme}://bookmarks`,
  "clear-data": `${scheme}://settings/clearBrowserData`,
};

const BADGE_COLOR = "#00cfef";

async function updateBadge(tab) {
  if (tab?.id == null) return;

  const hostname = Orbit.getSupportedHost(tab.url);
  if (!hostname) {
    await chrome.action.setBadgeText({ tabId: tab.id, text: "" });
    return;
  }

  const sites = await Orbit.readSites();
  const enabled = sites.some((site) => Orbit.hostMatches(hostname, site));
  await chrome.action.setBadgeText({ tabId: tab.id, text: enabled ? "ON" : "" });
  if (enabled) {
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: BADGE_COLOR });
  }
}

function logBadgeError(error) {
  console.error("Orbit: could not update the toolbar badge.", error);
}

chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR }).catch((error) => {
  console.error("Orbit: could not set the toolbar badge color.", error);
});

// Turn Orbit on/off for the tab's site (toolbar button and keyboard shortcut).
async function toggleForTab(tab) {
  const hostname = Orbit.getSupportedHost(tab?.url);
  if (!hostname) return;

  try {
    const sites = await Orbit.readSites();
    const isEnabled = sites.some((site) => Orbit.hostMatches(hostname, site));
    const nextSites = isEnabled
      ? sites.filter((site) => !Orbit.hostMatches(hostname, site))
      : [...sites, hostname];

    await Orbit.writeSites(nextSites);
    await updateBadge(tab);
  } catch (error) {
    console.error("Orbit: could not toggle the menu for this site.", error);
  }
}

chrome.action.onClicked.addListener(toggleForTab);

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-site") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) toggleForTab(tab);
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId).then(updateBadge).catch(logBadgeError);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    updateBadge(tab).catch(logBadgeError);
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (!changes[Orbit.SITES_KEY]) return;

  chrome.tabs.query({}).then((tabs) => {
    tabs.forEach((tab) => updateBadge(tab).catch(logBadgeError));
  }).catch((error) => {
    console.error("Orbit: could not refresh toolbar badges.", error);
  });
});

// An error the user can act on; `code` maps to a message in Orbit.MESSAGES.
class OrbitError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

async function run(action, sender) {
  const tab = sender?.tab;
  const windowId = tab?.windowId;
  const needTab = () => {
    if (tab?.id == null) throw new OrbitError("failed");
    return tab.id;
  };

  switch (action) {
    case "new-window":
      await chrome.windows.create({});
      return {};

    case "new-tab":
      await chrome.tabs.create(windowId ? { windowId } : {});
      return {};

    case "private":
      try {
        await chrome.windows.create({ incognito: true });
      } catch {
        // Fails unless the user ticked "Allow in Incognito" for this extension.
        throw new OrbitError("incognito");
      }
      return {};

    case "reopen":
      try {
        await chrome.sessions.restore();
      } catch {
        throw new OrbitError("nothing-to-reopen");
      }
      return {};

    case "duplicate":
      await chrome.tabs.duplicate(needTab());
      return {};

    case "pin": {
      const current = await chrome.tabs.get(needTab());
      await chrome.tabs.update(current.id, { pinned: !current.pinned });
      return { note: current.pinned ? "unpinned" : "pinned" };
    }

    case "mute": {
      const current = await chrome.tabs.get(needTab());
      const muted = Boolean(current.mutedInfo?.muted);
      await chrome.tabs.update(current.id, { muted: !muted });
      return { note: muted ? "unmuted" : "muted" };
    }

    case "reload":
      await chrome.tabs.reload(needTab());
      return {};

    case "close-tab":
      await chrome.tabs.remove(needTab());
      return {};

    default:
      if (PAGES[action]) {
        await chrome.tabs.create({ url: PAGES[action], ...(windowId ? { windowId } : {}) });
        return {};
      }
      throw new OrbitError("failed");
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "orbit-action") return;

  run(msg.action, sender)
    .then((result) => sendResponse({ ok: true, ...result }))
    .catch((err) => {
      if (!(err instanceof OrbitError)) console.error("Orbit: action failed.", err);
      sendResponse({ ok: false, error: err instanceof OrbitError ? err.code : "failed" });
    });

  return true; // keep the message channel open for the async response
});
