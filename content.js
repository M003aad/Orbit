(() => {
  if (window.__orbitLoaded) return;
  window.__orbitLoaded = true;

  const CONFIG = {
    hoverCloseDelay: 150,
    closeAfterActionInHover: true,
    edge: 16, // gap between the menu and the screen corner, in px
  };

  const CSS = `
    *, *::before, *::after { box-sizing: border-box; }

    .root {
      --r: min(70px, 36.84cqw);
      --size: min(34px, 17.9cqw);
      --logo: min(46px, 24.2cqw);
      --zone: var(--logo);
      --icon: min(15px, 8cqw);
      --x-size: min(19px, 10cqw);
      --label-size: min(9px, 4.7cqw);
      --label-width: min(58px, 30.5cqw);
      --hide-size: min(25px, 13.2cqw);
      --hide-icon: min(12px, 6.3cqw);
      --cyan: #35e0ff;
      --text: #dff1ff;
      position: absolute;
      inset: 0;
      pointer-events: none;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      animation: appear .24s cubic-bezier(.2,.9,.25,1.08) both;
    }
    :host {
      --ring: min(190px, calc(100vw - 32px), calc(100vh - 32px)) !important;
    }
    @keyframes appear {
      from { opacity: 0; transform: scale(.88); }
      to { opacity: 1; transform: scale(1); }
    }

    .zone {
      position: absolute; left: 50%; top: 50%;
      width: var(--zone); height: var(--zone);
      margin: calc(var(--zone) / -2) 0 0 calc(var(--zone) / -2);
      border-radius: 50%;
      pointer-events: auto;
    }
    .is-open .zone {
      width: var(--ring); height: var(--ring);
      margin: calc(var(--ring) / -2) 0 0 calc(var(--ring) / -2);
    }

    .ring {
      position: absolute; left: 50%; top: 50%;
      width: var(--ring); height: var(--ring);
      margin: calc(var(--ring) / -2) 0 0 calc(var(--ring) / -2);
      border-radius: 50%;
      background: radial-gradient(circle, rgba(6,10,22,.94) 0%, rgba(10,18,40,.84) 60%, rgba(12,26,58,.72) 100%);
      border: 1px solid rgba(80,170,255,.22);
      backdrop-filter: blur(9px) saturate(140%);
      -webkit-backdrop-filter: blur(9px) saturate(140%);
      box-shadow: 0 14px 36px rgba(0,0,0,.55), inset 0 0 24px rgba(30,110,255,.12);
      transform: scale(.25);
      opacity: 0;
      pointer-events: none;
      transition: transform .4s cubic-bezier(.2,.9,.25,1.08), opacity .22s ease,
                  border-color .3s ease, box-shadow .3s ease;
    }
    .ring::after {
      content: ""; position: absolute; inset: 21%; border-radius: 50%;
      border: 1px solid rgba(90,170,255,.12);
    }
    .is-open .ring { transform: scale(1); opacity: 1; }
    .is-locked .ring {
      border-color: rgba(120,220,255,.65);
      box-shadow: 0 14px 36px rgba(0,0,0,.55), 0 0 19px rgba(0,190,255,.35), inset 0 0 24px rgba(30,110,255,.18);
    }

    .item {
      --a: calc(var(--i) * 45deg);
      position: absolute; left: 50%; top: 50%;
      width: var(--size); height: var(--size);
      margin: calc(var(--size) / -2) 0 0 calc(var(--size) / -2);
      transform: rotate(var(--a)) translateY(0) rotate(calc(var(--a) * -1)) scale(.2);
      opacity: 0;
      pointer-events: none;
      transition: transform .2s cubic-bezier(.4,0,.6,1), opacity .14s ease;
    }
    .is-open .item {
      transform: rotate(var(--a)) translateY(calc(var(--r) * -1)) rotate(calc(var(--a) * -1)) scale(1);
      opacity: 1;
      pointer-events: auto;
      transition: transform .46s cubic-bezier(.2,.9,.25,1.15) calc(var(--i) * 26ms),
                  opacity .22s ease calc(var(--i) * 26ms);
    }

    .btn, .hide-btn {
      all: unset; box-sizing: border-box;
      display: grid; place-items: center;
      border-radius: 50%;
      cursor: pointer;
      color: #cfe8ff;
      background: linear-gradient(160deg, rgba(24,38,74,.96), rgba(10,16,36,.96));
      border: 1px solid rgba(90,170,255,.28);
      box-shadow: 0 4px 10px rgba(0,0,0,.45);
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, color .18s ease;
    }
    .btn { width: 100%; height: 100%; }
    .btn svg { width: var(--icon); height: var(--icon); fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
    .btn:hover, .btn:focus-visible, .hide-btn:hover, .hide-btn:focus-visible {
      transform: scale(1.12);
      color: #fff;
      border-color: var(--cyan);
      box-shadow: 0 0 0 1px rgba(53,224,255,.4), 0 0 14px rgba(0,190,255,.55);
    }
    .btn:focus-visible, .center:focus-visible, .hide-btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

    .center {
      all: unset; box-sizing: border-box;
      position: absolute; left: 50%; top: 50%;
      width: var(--logo); height: var(--logo);
      margin: calc(var(--logo) / -2) 0 0 calc(var(--logo) / -2);
      border-radius: 50%;
      cursor: pointer;
      z-index: 2;
      transition: transform .32s cubic-bezier(.2,.9,.25,1.1);
    }
    .center:hover { transform: scale(1.06); }
    .is-open .center { transform: scale(1.06); }

    .logo {
      display: block; width: 100%; height: 100%; border-radius: 50%;
      filter: drop-shadow(0 0 7px rgba(0,150,255,.65));
      transition: transform .55s cubic-bezier(.2,.9,.25,1), filter .25s ease;
      user-select: none; -webkit-user-drag: none;
    }
    .is-open .logo { transform: rotate(180deg); }
    .is-open .center:hover .logo,
    .is-open .center:focus-visible .logo { filter: brightness(.5) drop-shadow(0 0 7px rgba(0,150,255,.4)); }

    .x {
      position: absolute; inset: 0; border-radius: 50%;
      display: grid; place-items: center;
      color: #fff; opacity: 0;
      transform: rotate(-90deg) scale(.6);
      pointer-events: none;
      transition: opacity .2s ease, transform .3s cubic-bezier(.2,.9,.25,1.2);
    }
    .x svg { width: var(--x-size); height: var(--x-size); fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; }
    .is-open .center:hover .x,
    .is-open .center:focus-visible .x { opacity: 1; transform: none; }

    .label {
      position: absolute; left: 50%; top: calc(50% + 15cqw);
      width: var(--label-width); transform: translateX(-50%);
      text-align: center; font-size: var(--label-size); line-height: 1.2; font-weight: 600;
      letter-spacing: .01em; color: var(--text);
      text-shadow: 0 0 6px rgba(0,160,255,.6);
      opacity: 0; pointer-events: none; transition: opacity .15s ease;
    }
    .label.show { opacity: 1; }
    .label.ok { color: #9dffd0; text-shadow: 0 0 6px rgba(0,255,150,.4); }
    .label.error { color: #ff9db0; text-shadow: none; }

    .hide-btn {
      position: absolute;
      left: calc(50% + 35cqw); top: 2.6cqw;
      width: var(--hide-size); height: var(--hide-size);
      opacity: 0; pointer-events: none; transform: scale(.7);
      color: #e6f4ff;
      transition: opacity .18s ease, transform .2s ease, border-color .18s ease, box-shadow .18s ease;
    }
    .hide-btn svg { width: var(--hide-icon); height: var(--hide-icon); fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .is-open .hide-btn { opacity: 1; pointer-events: auto; transform: scale(1); }

    @media print { .root { display: none; } }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { transition-duration: .01ms !important; transition-delay: 0s !important; animation-duration: .01ms !important; }
    }
  `;

  const currentHost = Orbit.getSupportedHost(window.location.href);

  let hostElement = null;
  let cleanupMenu = null;
  let renderedSignature = "";
  let revision = 0;

  function removeMenu() {
    if (!hostElement) return;
    cleanupMenu();
    hostElement.remove();
    hostElement = null;
    cleanupMenu = null;
    renderedSignature = "";
  }

  async function copyLink() {
    const text = window.location.href;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to the legacy copy command below.
    }
    try {
      const box = document.createElement("textarea");
      box.value = text;
      box.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
      document.documentElement.appendChild(box);
      box.select();
      const ok = document.execCommand("copy");
      box.remove();
      return ok;
    } catch {
      return false;
    }
  }

  function createMenu(settings) {
    if (hostElement || !document.documentElement || !currentHost) return;

    const lang = Orbit.resolveLang(settings.lang);
    const messages = Orbit.MESSAGES[lang];
    const msg = (code) => messages[code] || Orbit.MESSAGES.en[code] || code;
    const items = settings.actions.map((id) => ({
      id,
      label: Orbit.ACTIONS[id][lang] || Orbit.ACTIONS[id].en,
      icon: Orbit.ACTIONS[id].icon,
    }));

    const vertical = settings.corner[0] === "t" ? "top" : "bottom";
    const horizontal = settings.corner[1] === "l" ? "left" : "right";

    const host = document.createElement("div");
    host.id = "orbit-menu-host";
    host.style.cssText =
      "all:initial !important;position:fixed !important;" +
      `${horizontal}:${CONFIG.edge}px !important;${vertical}:${CONFIG.edge}px !important;` +
      "width:var(--ring) !important;height:var(--ring) !important;" +
      "container-type:size !important;z-index:2147483647 !important;" +
      "pointer-events:none !important;";

    const shadow = host.attachShadow({ mode: "closed" });
    shadow.innerHTML = `
      <style>${CSS}</style>
      <div class="root">
        <div class="zone">
          <div class="ring"></div>
          ${items.map(
            (item, index) => `
              <div class="item" style="--i:${index}">
                <button class="btn" data-id="${item.id}" data-label="${item.label}"
                        aria-label="${item.label}" tabindex="-1">
                  <svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg>
                </button>
              </div>`
          ).join("")}
          <div class="label" aria-live="polite" dir="${lang === "ar" ? "rtl" : "ltr"}"></div>
          <button class="hide-btn" type="button" aria-label="Hide on this site"
                  title="Hide on this site" tabindex="-1">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3l18 18"/>
              <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 4 10 6a13 13 0 0 1-2.5 3.2M6.6 7.6C4.3 9 2.8 11 2 12c1 1.9 4.8 5.7 9.6 6"/>
            </svg>
          </button>
          <button class="center" aria-label="Open menu" aria-expanded="false">
            <img class="logo" alt="" draggable="false">
            <span class="x" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>
            </span>
          </button>
        </div>
      </div>`;

    shadow.querySelector(".logo").src = Orbit.LOGO;

    document.documentElement.appendChild(host);
    hostElement = host;
    renderedSignature = JSON.stringify(settings);

    const root = shadow.querySelector(".root");
    const zone = shadow.querySelector(".zone");
    const center = shadow.querySelector(".center");
    const label = shadow.querySelector(".label");
    const hideButton = shadow.querySelector(".hide-btn");
    const buttons = [...shadow.querySelectorAll(".btn")];

    let mode = "closed";
    let closeTimer = null;
    let labelTimer = null;

    // kind: "" (plain hover label), "ok" or "error" (both clear themselves).
    function setLabel(text, kind = "") {
      clearTimeout(labelTimer);
      label.textContent = text;
      label.classList.toggle("show", Boolean(text));
      label.classList.toggle("error", kind === "error");
      label.classList.toggle("ok", kind === "ok");
      if (kind && text) {
        labelTimer = setTimeout(() => setLabel(""), kind === "error" ? 2400 : 1500);
      }
    }

    function setMode(next) {
      mode = next;
      const open = next !== "closed";
      root.classList.toggle("is-open", open);
      root.classList.toggle("is-locked", next === "locked");
      center.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      center.setAttribute("aria-expanded", String(open));
      buttons.forEach((button) => (button.tabIndex = open ? 0 : -1));
      hideButton.tabIndex = open ? 0 : -1;
      if (!open) setLabel("");
    }

    function cancelClose() {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    zone.addEventListener("pointerenter", (event) => {
      cancelClose();
      if (event.pointerType === "mouse" && mode === "closed") setMode("hover");
    });

    zone.addEventListener("pointerleave", (event) => {
      if (event.pointerType !== "mouse" || mode !== "hover") return;
      cancelClose();
      closeTimer = setTimeout(() => {
        if (mode === "hover") setMode("closed");
      }, CONFIG.hoverCloseDelay);
    });

    zone.addEventListener("click", () => {
      if (mode === "hover") setMode("locked");
    });

    center.addEventListener("click", (event) => {
      event.stopPropagation();
      cancelClose();
      setMode(mode === "closed" ? "locked" : "closed");
    });

    const onKeyDown = (event) => {
      if (event.key === "Escape" && mode !== "closed") setMode("closed");
    };
    document.addEventListener("keydown", onKeyDown);

    function send(action) {
      return new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage({ type: "orbit-action", action }, (response) => {
            if (chrome.runtime.lastError) resolve({ ok: false, error: "reload-page" });
            else resolve(response);
          });
        } catch {
          resolve({ ok: false, error: "reload-page" });
        }
      });
    }

    buttons.forEach((button) => {
      button.addEventListener("pointerenter", () => setLabel(button.dataset.label));
      button.addEventListener("pointerleave", () => setLabel(""));
      button.addEventListener("focus", () => setLabel(button.dataset.label));
      button.addEventListener("blur", () => setLabel(""));

      button.addEventListener("click", async (event) => {
        event.stopPropagation();
        const id = button.dataset.id;

        // Copying needs the page itself, so it never goes through the background.
        const response =
          id === "copy-url"
            ? ((await copyLink()) ? { ok: true, note: "copied" } : { ok: false, error: "failed" })
            : await send(id);

        if (!response || response.ok === false) {
          setLabel(msg((response && response.error) || "failed"), "error");
          return;
        }
        if (response.note) {
          setLabel(msg(response.note), "ok");
          return;
        }
        if (mode === "hover" && CONFIG.closeAfterActionInHover) setMode("closed");
      });
    });

    hideButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      try {
        const sites = await Orbit.readSites();
        await Orbit.writeSites(sites.filter((site) => !Orbit.hostMatches(currentHost, site)));
      } catch (error) {
        console.error("Orbit: could not hide the menu for this site.", error);
        setLabel(msg("hide-failed"), "error");
      }
    });

    cleanupMenu = () => {
      cancelClose();
      clearTimeout(labelTimer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }

  function apply(sites, settings) {
    const enabled = currentHost && sites.some((site) => Orbit.hostMatches(currentHost, site));
    if (!enabled) {
      removeMenu();
      return;
    }
    // Rebuild when the settings changed (actions, corner, language).
    if (hostElement && renderedSignature !== JSON.stringify(settings)) removeMenu();
    createMenu(settings);
  }

  async function refresh() {
    const mine = ++revision;
    try {
      const [sites, settings] = await Promise.all([Orbit.readSites(), Orbit.readSettings()]);
      if (mine === revision) apply(sites, settings); // ignore stale reads
    } catch (error) {
      console.error("Orbit: could not update the menu state.", error);
    }
  }

  refresh();

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[Orbit.SITES_KEY] || changes[Orbit.SETTINGS_KEY]) refresh();
  });
})();
