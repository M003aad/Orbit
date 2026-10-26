(() => {
  const STRINGS = {
    en: {
      sub: "Changes save automatically and apply to every open tab.",
      lang: "Language", auto: "Automatic (browser language)",
      corner: "Menu position",
      corners: { tl: "Top left", tr: "Top right", bl: "Bottom left", br: "Bottom right" },
      actions: "Menu actions (8 slots)",
      reset: "Reset to defaults",
      sites: "Enabled sites",
      none: "No sites yet. Click the Orbit toolbar button on a site to enable it.",
      remove: "Remove", export: "Export", import: "Import",
    },
    ar: {
      sub: "تُحفظ التغييرات تلقائياً وتُطبَّق على كل التبويبات المفتوحة.",
      lang: "اللغة", auto: "تلقائي (لغة المتصفح)",
      corner: "موضع القائمة",
      corners: { tl: "أعلى اليسار", tr: "أعلى اليمين", bl: "أسفل اليسار", br: "أسفل اليمين" },
      actions: "إجراءات القائمة (8 خانات)",
      reset: "استرجاع الافتراضي",
      sites: "المواقع المفعّلة",
      none: "لا توجد مواقع بعد. اضغط زر Orbit في شريط الأدوات داخل أي موقع لتفعيله.",
      remove: "إزالة", export: "تصدير", import: "استيراد",
    },
  };

  const $ = (id) => document.getElementById(id);
  const svg = (id) => `<svg viewBox="0 0 24 24" aria-hidden="true">${Orbit.ACTIONS[id].icon}</svg>`;
  let settings = Orbit.normalizeSettings();
  let lang = "en";

  const t = () => STRINGS[lang];
  const actionLabel = (id) => Orbit.ACTIONS[id][lang] || Orbit.ACTIONS[id].en;

  function save() {
    return Orbit.writeSettings(settings).catch((e) => console.error("Orbit: could not save settings.", e));
  }

  function renderStatic() {
    lang = Orbit.resolveLang(settings.lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $("sub").textContent = t().sub;
    $("hLang").textContent = t().lang;
    $("hCorner").textContent = t().corner;
    $("hActions").textContent = t().actions;
    $("hSites").textContent = t().sites;
    $("reset").textContent = t().reset;
    $("export").textContent = t().export;
    $("import").textContent = t().import;

    $("lang").innerHTML =
      `<option value="auto">${t().auto}</option><option value="en">English</option><option value="ar">العربية</option>`;
    $("lang").value = settings.lang;

    $("corners").innerHTML = Orbit.CORNERS.map(
      (c) => `<button type="button" data-c="${c}" class="${c === settings.corner ? "on" : ""}">${t().corners[c]}</button>`
    ).join("");
  }

  function renderSlots() {
    const ids = Object.keys(Orbit.ACTIONS);
    $("slots").innerHTML = settings.actions.map((current, i) => `
      <div class="row">
        <span class="n">${i + 1}</span>${svg(current)}
        <select data-i="${i}">
          ${ids.map((id) => `<option value="${id}"${id === current ? " selected" : ""}>${actionLabel(id)}</option>`).join("")}
        </select>
      </div>`).join("");

    // Preview: same layout as the real menu (slot 1 at the top, clockwise).
    const preview = $("preview");
    preview.querySelectorAll(".pv").forEach((n) => n.remove());
    preview.querySelector("img").src = Orbit.LOGO;
    settings.actions.forEach((id, i) => {
      const a = (i * Math.PI) / 4;
      const node = document.createElement("div");
      node.className = "pv";
      node.title = actionLabel(id);
      node.innerHTML = svg(id);
      node.style.left = `${100 + Math.sin(a) * 70}px`;
      node.style.top = `${100 - Math.cos(a) * 70}px`;
      preview.appendChild(node);
    });
  }

  async function renderSites() {
    const sites = await Orbit.readSites();
    $("sites").innerHTML = sites.length
      ? sites.map((s) => `<div class="site"><span dir="ltr">${s.replace(/[<>&"]/g, "")}</span><button type="button" data-s="${s.replace(/[<>&"]/g, "")}">${t().remove}</button></div>`).join("")
      : `<p class="muted">${t().none}</p>`;
  }

  function renderAll() {
    renderStatic();
    renderSlots();
    renderSites();
  }

  $("lang").addEventListener("change", async (e) => {
    settings.lang = e.target.value;
    await save();
    renderAll();
  });

  $("corners").addEventListener("click", async (e) => {
    const c = e.target.dataset && e.target.dataset.c;
    if (!c) return;
    settings.corner = c;
    await save();
    renderStatic();
  });

  $("slots").addEventListener("change", async (e) => {
    const i = Number(e.target.dataset.i);
    const next = e.target.value;
    const old = settings.actions[i];
    const other = settings.actions.indexOf(next);
    if (other !== -1 && other !== i) settings.actions[other] = old; // swap, never duplicate
    settings.actions[i] = next;
    await save();
    renderSlots();
  });

  $("reset").addEventListener("click", async () => {
    settings = Orbit.normalizeSettings({ ...Orbit.DEFAULT_SETTINGS, lang: settings.lang });
    await save();
    renderAll();
  });

  $("sites").addEventListener("click", async (e) => {
    const host = e.target.dataset && e.target.dataset.s;
    if (!host) return;
    const sites = await Orbit.readSites();
    await Orbit.writeSites(sites.filter((s) => s !== host));
  });

  $("export").addEventListener("click", async () => {
    const sites = await Orbit.readSites();
    const blob = new Blob([JSON.stringify({ enabledSites: sites }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "orbit-sites.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  $("import").addEventListener("click", () => $("file").click());
  $("file").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const incoming = Array.isArray(data) ? data : data.enabledSites;
      const merged = Orbit.cleanSites([...(await Orbit.readSites()), ...Orbit.cleanSites(incoming)]);
      await Orbit.writeSites(merged);
    } catch (error) {
      console.error("Orbit: could not import sites.", error);
    }
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes[Orbit.SITES_KEY]) renderSites();
    if (changes[Orbit.SETTINGS_KEY]) {
      Orbit.readSettings().then((s) => {
        if (JSON.stringify(s) !== JSON.stringify(settings)) {
          settings = s;
          renderAll();
        }
      });
    }
  });

  Orbit.readSettings().then((s) => {
    settings = s;
    renderAll();
  });
})();
