/* Capsules AIH — rendu de la page (bascule FR/EN, capsule active via #capsule-N, quiz corrigé). */
(function () {
  "use strict";
  const D = window.AIH;
  const $ = (s, el = document) => el.querySelector(s);
  const DL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 19h16"/></svg>';

  const state = { lang: initialLang(), n: initialCapsule() };

  function initialLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "fr" || q === "en") return q;
    try { const s = localStorage.getItem("aih-lang"); if (s === "fr" || s === "en") return s; } catch (e) { /* stockage indisponible */ }
    return (navigator.language || "fr").toLowerCase().startsWith("fr") ? "fr" : "en";
  }
  function initialCapsule() {
    const m = location.hash.match(/capsule-(\d)/);
    const n = m ? Number(m[1]) : 1;
    return n >= 1 && n <= D.capsules.length ? n : 1;
  }
  const ui = () => D.ui[state.lang];
  const cap = (n = state.n) => D.capsules[n - 1];
  const fmt = (d) => d.replace(":", " min ") ;

  function renderStatic() {
    const t = ui();
    document.documentElement.lang = t.lang;
    document.title = `${t.siteTitle} — ${state.lang === "fr" ? "Capsules vidéo" : "Video capsules"} · IMT Business School`;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t[el.dataset.i18n];
      if (typeof v === "string") el.textContent = v;
    });
    $("#steps").innerHTML = t.steps.map((s) => `<li>${s}</li>`).join("");
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  }

  function renderCards() {
    const t = ui();
    $("#cards").innerHTML = D.capsules.map((c) => {
      const d = c[state.lang];
      const cur = c.n === state.n;
      return `<li><a class="card" href="#capsule-${c.n}" ${cur ? 'aria-current="true"' : ""}>
        <img src="assets/vignettes/capsule${c.n}-${state.lang}.jpg" alt="" width="960" height="540" loading="lazy">
        <span class="card-body"><span class="card-n">${t.capsule} ${c.n}</span><span class="card-t">${d.title}</span><span class="card-d">${fmt(d.duration)}</span></span>
      </a></li>`;
    }).join("");
  }

  function renderCapsule() {
    const t = ui();
    const c = cap();
    const d = c[state.lang];
    const L = state.lang.toUpperCase();
    const total = D.capsules.length;
    $("#capsule").innerHTML = `
      <article aria-labelledby="cap-title">
        <header class="cap-head">
          <span class="badge">${t.capsule} ${c.n} / ${total}</span>
          <span class="dur">${fmt(d.duration)}</span>
          <h2 id="cap-title">${d.title}</h2>
        </header>
        <div class="grid">
          <div>
            <div class="video">
              <iframe src="${d.iframe}" title="${t.videoTitle(c.n, d.title).replace(/"/g, "&quot;")}" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>
            </div>
            <section class="panel summary" aria-labelledby="sum-h">
              <h3 id="sum-h">${t.summary}</h3>
              <p>${d.summary}</p>
            </section>
          </div>
          <aside>
            <section class="panel" aria-labelledby="kp-h">
              <h3 id="kp-h">${t.keyPoints}</h3>
              <ul class="points">${d.points.map((p) => `<li>${p}</li>`).join("")}</ul>
            </section>
            <section class="panel dl" aria-labelledby="dl-h">
              <h3 id="dl-h">${t.script}</h3>
              <p>${t.scriptText}</p>
              <a class="btn" href="scripts/AIH_Capsule${c.n}_Script_${L}.pdf" download>${DL_ICON}<span>${t.download}</span></a>
            </section>
          </aside>
        </div>
        <section class="quiz" aria-labelledby="quiz-h">
          <h3 id="quiz-h">${t.quiz}</h3>
          <p class="quiz-intro">${t.quizIntro}</p>
          <div class="qs">${d.quiz.map((q, i) => `
            <fieldset class="q" data-i="${i}">
              <legend><span class="qn" aria-hidden="true">${i + 1}</span><span>${q.q}</span></legend>
              <div class="opts">${q.options.map((o, j) => `<button type="button" class="opt" data-j="${j}">${o}</button>`).join("")}</div>
              <div class="fb" aria-live="polite"></div>
            </fieldset>`).join("")}
          </div>
          <div class="score" hidden aria-live="polite"><b></b><span></span><button type="button" class="btn btn-ghost retry">${t.retry}</button></div>
        </section>
        <nav class="pager" aria-label="${t.prev} / ${t.next}">
          <a class="btn btn-ghost" href="#capsule-${c.n - 1}" ${c.n === 1 ? "hidden" : ""}>← ${t.prev}</a>
          <span class="spacer"></span>
          <a class="btn" href="#capsule-${c.n + 1}" ${c.n === total ? "hidden" : ""}>${t.next} →</a>
        </nav>
      </article>`;
    bindQuiz();
  }

  function bindQuiz() {
    const t = ui();
    const d = cap()[state.lang];
    const root = $("#capsule .quiz");
    let answered = 0, score = 0;
    root.querySelectorAll(".q").forEach((fs) => {
      const q = d.quiz[Number(fs.dataset.i)];
      fs.querySelectorAll(".opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const j = Number(btn.dataset.j);
          const ok = j === q.answer;
          fs.querySelectorAll(".opt").forEach((b) => {
            b.disabled = true;
            if (Number(b.dataset.j) === q.answer) b.classList.add("is-right");
          });
          if (!ok) btn.classList.add("is-wrong");
          const fb = $(".fb", fs);
          fb.className = "fb " + (ok ? "ok" : "ko");
          fb.innerHTML = `<strong>${ok ? t.correct : t.wrong}</strong>${q.explain}`;
          answered += 1; if (ok) score += 1;
          if (answered === d.quiz.length) {
            const box = $(".score", root);
            $("b", box).textContent = t.score(score, d.quiz.length);
            $("span", box).textContent = t.scoreMsg(score, d.quiz.length);
            box.hidden = false;
          }
        });
      });
    });
    $(".retry", root).addEventListener("click", () => { renderCapsule(); $("#quiz-h").scrollIntoView({ block: "start" }); });
  }

  function renderAll() { renderStatic(); renderCards(); renderCapsule(); }

  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => {
    if (state.lang === b.dataset.lang) return;
    state.lang = b.dataset.lang;
    try { localStorage.setItem("aih-lang", state.lang); } catch (e) { /* stockage indisponible */ }
    const url = new URL(location.href); url.searchParams.set("lang", state.lang);
    history.replaceState(null, "", url);
    renderAll();
  }));

  window.addEventListener("hashchange", () => {
    const n = initialCapsule();
    if (n === state.n) return;
    state.n = n;
    renderCards(); renderCapsule();
    const main = $("#capsule");
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });

  renderAll();
})();
