/* Registration countdown. Drives every [data-countdown] and closes registration at zero. */
(function () {
  "use strict";

  const { C, closes } = window.Race;
  const counters = document.querySelectorAll("[data-countdown]");
  const UNITS = ["days", "hours", "minutes", "seconds"];
  let lastMinute = null;

  if (isNaN(closes)) {
    counters.forEach((c) => (c.hidden = true));
    return;
  }

  function split(ms) {
    const s = Math.floor(ms / 1000);
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60
    };
  }

  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  /* Screen readers get a calm, minute-level summary instead of a ticking clock. */
  function spoken(p) {
    return `${C.copy.countdownLabel} ${plural(p.days, "day")}, ${plural(p.hours, "hour")} and ${plural(p.minutes, "minute")}.`;
  }

  function closeRegistration() {
    document.documentElement.classList.add("is-closed");
    counters.forEach((c) => (c.hidden = true));
    document.querySelectorAll("[data-closed-msg]").forEach((m) => (m.hidden = false));
    document.querySelectorAll("[data-register]").forEach((btn) => {
      btn.disabled = true;
      const label = btn.querySelector("[data-register-label]");
      if (label) label.textContent = C.copy.closedCta;
    });
    const dialog = document.getElementById("register-dialog");
    if (dialog && dialog.open) dialog.close();
  }

  function tick() {
    const ms = closes.getTime() - Date.now();
    if (ms <= 0) return closeRegistration();

    const parts = split(ms);
    counters.forEach((counter) => {
      UNITS.forEach((unit) => {
        const el = counter.querySelector(`[data-unit="${unit}"]`);
        const text = String(parts[unit]).padStart(2, "0");
        if (el && el.textContent !== text) el.textContent = text;
      });
    });

    const minute = Math.floor(ms / 60000);
    if (minute !== lastMinute) {
      lastMinute = minute;
      const text = spoken(parts);
      counters.forEach((c) => {
        const sr = c.querySelector("[data-countdown-sr]");
        if (sr) sr.textContent = text;
      });
    }

    // Align ticks to the wall-clock second so the display never skips.
    setTimeout(tick, 1000 - (Date.now() % 1000) + 10);
  }

  tick();
})();
