// Shared by the content script, the background service worker and the options page.
// Everything lives on one global `Orbit` object so scripts never collide.
const Orbit = (() => {
  const SITES_KEY = "enabledSites";
  const SETTINGS_KEY = "settings";
  const SLOT_COUNT = 8;
  const CORNERS = ["tl", "tr", "bl", "br"];

  // Every action Orbit knows. The menu shows SLOT_COUNT of them (chosen in Options).
  const ACTIONS = {
    "new-window": {
      en: "New window", ar: "نافذة جديدة",
      icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 9v6M9 12h6"/>',
    },
    "new-tab": {
      en: "New tab", ar: "تبويب جديد",
      icon: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>',
    },
    private: {
      en: "Private window", ar: "نافذة خاصة",
      icon: '<path d="M3 3l18 18"/><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 4 10 6a13 13 0 0 1-2.5 3.2M6.6 7.6C4.3 9 2.8 11 2 12c1 2 5 6 10 6 1.5 0 2.9-.4 4.1-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    },
    history: {
      en: "History", ar: "السجل",
      icon: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    },
    extensions: {
      en: "Extensions", ar: "الإضافات",
      icon: '<path d="M10 4a2 2 0 1 1 4 0v1h4a1 1 0 0 1 1 1v4h-1a2 2 0 1 0 0 4h1v4a1 1 0 0 1-1 1h-4v-1a2 2 0 1 0-4 0v1H6a1 1 0 0 1-1-1v-4h1a2 2 0 1 0 0-4H5V6a1 1 0 0 1 1-1h4z"/>',
    },
    passwords: {
      en: "Passwords", ar: "كلمات المرور",
      icon: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
    },
    settings: {
      en: "Settings", ar: "الإعدادات",
      icon: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    },
    downloads: {
      en: "Downloads", ar: "التنزيلات",
      icon: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    },
    bookmarks: {
      en: "Bookmarks", ar: "الإشارات المرجعية",
      icon: '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>',
    },
    reopen: {
      en: "Reopen tab", ar: "إعادة فتح تبويب",
      icon: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    },
    duplicate: {
      en: "Duplicate tab", ar: "نسخ التبويب",
      icon: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    },
    pin: {
      en: "Pin tab", ar: "تثبيت التبويب",
      icon: '<path d="M12 17v5"/><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/>',
    },
    mute: {
      en: "Mute tab", ar: "كتم التبويب",
      icon: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M16 9l5 6M21 9l-5 6"/>',
    },
    reload: {
      en: "Reload", ar: "إعادة تحميل",
      icon: '<path d="M20 12a8 8 0 1 1-2.3-5.7L20 8"/><path d="M20 3v5h-5"/>',
    },
    "copy-url": {
      en: "Copy link", ar: "نسخ الرابط",
      icon: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    },
    "clear-data": {
      en: "Clear data", ar: "مسح البيانات",
      icon: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    },
    "close-tab": {
      en: "Close tab", ar: "إغلاق التبويب",
      icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9.5 10l5 5M14.5 10l-5 5"/>',
    },
  };

  const DEFAULT_ACTIONS = [
    "new-window", "new-tab", "private", "history",
    "extensions", "passwords", "settings", "downloads",
  ];

  const DEFAULT_SETTINGS = { actions: DEFAULT_ACTIONS, corner: "br", lang: "auto" };

  // Short messages shown in the menu's center label.
  const MESSAGES = {
    en: {
      incognito: "Enable Incognito access",
      "nothing-to-reopen": "Nothing to reopen",
      failed: "Action failed",
      "reload-page": "Reload the page",
      "hide-failed": "Could not hide menu",
      copied: "Link copied",
      pinned: "Tab pinned",
      unpinned: "Tab unpinned",
      muted: "Tab muted",
      unmuted: "Tab unmuted",
    },
    ar: {
      incognito: "فعّل الوصول في التصفح الخفي",
      "nothing-to-reopen": "لا يوجد ما يُعاد فتحه",
      failed: "فشل الإجراء",
      "reload-page": "أعد تحميل الصفحة",
      "hide-failed": "تعذّر إخفاء القائمة",
      copied: "تم نسخ الرابط",
      pinned: "تم تثبيت التبويب",
      unpinned: "أُلغي تثبيت التبويب",
      muted: "تم كتم التبويب",
      unmuted: "أُلغي كتم التبويب",
    },
  };

  // ---------- hosts ----------
  function normalizeHost(hostname) {
    return String(hostname).toLowerCase().replace(/\.$/, "");
  }

  // `example.com` matches example.com and every subdomain (www.example.com, ...).
  function hostMatches(hostname, savedHost) {
    return hostname === savedHost || hostname.endsWith(`.${savedHost}`);
  }

  // Returns the hostname Orbit may run on, or null for pages extensions can't touch.
  function getSupportedHost(rawUrl) {
    if (!rawUrl) return null;
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      const host = normalizeHost(url.hostname);
      if (
        (host === "chrome.google.com" && url.pathname.startsWith("/webstore")) ||
        host === "chromewebstore.google.com" ||
        (host === "microsoftedge.microsoft.com" &&
          (url.pathname.startsWith("/addons") || url.pathname.startsWith("/add-ons")))
      ) {
        return null;
      }
      return host || null;
    } catch {
      return null;
    }
  }

  // ---------- storage (local only) ----------
  // v1.0 mixed sync + local storage, which could return a stale list after a sync
  // failure. Everything now lives in chrome.storage.local.
  function cleanSites(list) {
    const out = [];
    for (const site of Array.isArray(list) ? list : []) {
      if (typeof site !== "string") continue;
      const host = normalizeHost(site.trim());
      if (host && !out.includes(host)) out.push(host);
    }
    return out;
  }

  async function readSites() {
    const local = await chrome.storage.local.get(SITES_KEY);
    if (Array.isArray(local[SITES_KEY])) return cleanSites(local[SITES_KEY]);

    // One-time migration from the old sync-storage list.
    try {
      const sync = await chrome.storage.sync.get(SITES_KEY);
      if (Array.isArray(sync[SITES_KEY])) {
        const sites = cleanSites(sync[SITES_KEY]);
        await chrome.storage.local.set({ [SITES_KEY]: sites });
        await chrome.storage.sync.remove(SITES_KEY);
        return sites;
      }
    } catch {
      // Sync storage unavailable: nothing to migrate.
    }
    return [];
  }

  async function writeSites(sites) {
    await chrome.storage.local.set({ [SITES_KEY]: cleanSites(sites) });
  }

  function normalizeActions(list) {
    const seen = new Set();
    const out = [];
    for (const id of Array.isArray(list) ? list : []) {
      if (ACTIONS[id] && !seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    }
    for (const id of DEFAULT_ACTIONS) {
      if (out.length < SLOT_COUNT && !seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    }
    return out.slice(0, SLOT_COUNT);
  }

  function normalizeSettings(raw) {
    const s = raw && typeof raw === "object" ? raw : {};
    return {
      actions: normalizeActions(s.actions),
      corner: CORNERS.includes(s.corner) ? s.corner : DEFAULT_SETTINGS.corner,
      lang: ["auto", "en", "ar"].includes(s.lang) ? s.lang : "auto",
    };
  }

  async function readSettings() {
    const stored = await chrome.storage.local.get(SETTINGS_KEY);
    return normalizeSettings(stored[SETTINGS_KEY]);
  }

  async function writeSettings(settings) {
    await chrome.storage.local.set({ [SETTINGS_KEY]: normalizeSettings(settings) });
  }

  function resolveLang(pref) {
    if (pref === "en" || pref === "ar") return pref;
    return String(navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
  }

  return {
    SITES_KEY, SETTINGS_KEY, SLOT_COUNT, CORNERS, ACTIONS, DEFAULT_ACTIONS,
    DEFAULT_SETTINGS, MESSAGES,
    normalizeHost, hostMatches, getSupportedHost,
    cleanSites, readSites, writeSites,
    normalizeActions, normalizeSettings, readSettings, writeSettings,
    resolveLang,
  };
})();
