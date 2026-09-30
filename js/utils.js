/* Shared helpers: formatting, DOM building, image URLs. Exposed as window.Race. */
(function () {
  "use strict";

  const C = window.RACE_CONFIG;

  const dtf = (opts) =>
    new Intl.DateTimeFormat(C.locale, { timeZone: C.event.timeZone, ...opts });

  const fmt = {
    date: (d) => dtf({ day: "numeric", month: "long", year: "numeric" }).format(d),
    dayMonth: (d) => dtf({ weekday: "long", day: "numeric", month: "long" }).format(d),
    weekday: (d) => dtf({ weekday: "long" }).format(d),
    time: (d) => dtf({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d),
    money: (n) =>
      new Intl.NumberFormat(C.locale, {
        style: "currency",
        currency: C.currency,
        maximumFractionDigits: 0
      }).format(n),
    number: (n) => new Intl.NumberFormat(C.locale).format(n)
  };

  /* Minimal element builder. Strings become text nodes, never HTML. */
  function h(tag, props, children) {
    const node = document.createElement(tag);
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value == null || value === false) continue;
        if (key === "class") node.className = value;
        else if (key === "text") node.textContent = value;
        else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value === true ? "" : value);
      }
    }
    if (children) [].concat(children).forEach((c) => c != null && node.append(c));
    return node;
  }

  /* Resize/crop Unsplash images; leave other URLs untouched. */
  function imgUrl(src, width, ratio) {
    if (!/images\.unsplash\.com/.test(src)) return src;
    const url = new URL(src);
    url.searchParams.set("auto", "format");
    url.searchParams.set("q", "70");
    url.searchParams.set("w", String(width));
    if (ratio) {
      url.searchParams.set("h", String(Math.round(width / ratio)));
      url.searchParams.set("fit", "crop");
    }
    return url.toString();
  }

  function srcset(src, widths, ratio) {
    return widths.map((w) => `${imgUrl(src, w, ratio)} ${w}w`).join(", ");
  }

  /* "a.b.c" lookup on the config object. */
  function get(path, obj = C) {
    return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  const raceStart = new Date(C.event.raceStart);
  const closes = new Date(C.event.registrationCloses);

  if (isNaN(raceStart) || isNaN(closes)) {
    console.error("RACE_CONFIG: event.raceStart or event.registrationCloses is not a valid ISO date.");
  }

  window.Race = {
    C,
    fmt,
    h,
    imgUrl,
    srcset,
    get,
    addDays,
    raceStart,
    closes,
    minFee: Math.min(...C.categories.map((c) => c.fee)),
    isClosed: () => Date.now() >= closes.getTime(),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
  };
})();
