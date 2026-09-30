/* Renders all config-driven content into the page skeleton. */
(function () {
  "use strict";

  const { C, fmt, h, imgUrl, srcset, get, addDays, raceStart, closes, minFee } = window.Race;
  const loc = C.event.location;

  /* ---------- Simple text bindings: [data-bind="path.or.computedKey"] ---------- */
  const computed = {
    raceDate: fmt.date(raceStart),
    raceWeekday: fmt.weekday(raceStart),
    raceTime: fmt.time(raceStart),
    closesDate: fmt.date(closes),
    closesTime: fmt.time(closes),
    feeFrom: fmt.money(minFee),
    minAgeHint: `You must be at least ${C.form.minAge} years old on race day.`,
    year: String(new Date().getFullYear())
  };

  document.querySelectorAll("[data-bind]").forEach((node) => {
    const key = node.dataset.bind;
    const value = key in computed ? computed[key] : get(key);
    if (value != null) node.textContent = value;
  });

  document.querySelectorAll("[data-href]").forEach((a) => {
    a.href = get(a.dataset.href) || "#";
  });
  document.querySelectorAll("[data-map-link]").forEach((a) => {
    a.href = loc.mapUrl;
  });
  document.querySelectorAll("[data-mailto]").forEach((a) => {
    a.href = `mailto:${C.contact.email}`;
    a.textContent = C.contact.email;
  });
  document.querySelectorAll("[data-tel]").forEach((a) => {
    a.href = `tel:${C.contact.phone.replace(/[^\d+]/g, "")}`;
    a.textContent = C.contact.phone;
  });

  document.title = `${C.event.name} · ${computed.raceDate} · ${loc.city}`;
  document.querySelector('meta[name="description"]')
    .setAttribute("content", `${C.event.name}, ${computed.raceDate} in ${loc.city}, ${loc.country}. ${C.event.tagline}`);

  /* ---------- Hero image (art-directed crop for portrait screens) ---------- */
  const heroImg = C.hero.image;
  document.querySelector("[data-hero-media]").append(
    h("picture", null, [
      h("source", {
        media: "(orientation: portrait)",
        srcset: srcset(heroImg.src, [640, 900, 1200], 9 / 16),
        sizes: "100vw"
      }),
      h("img", {
        src: imgUrl(heroImg.src, 1600),
        srcset: srcset(heroImg.src, [960, 1600, 2400], 16 / 9),
        sizes: "100vw",
        alt: heroImg.alt,
        fetchpriority: "high",
        decoding: "async"
      })
    ])
  );

  /* ---------- Details ---------- */
  const details = document.querySelector("[data-details]");

  C.categories.forEach((cat) => {
    details.append(
      h("article", { class: "cat" }, [
        h("h3", { class: "label cat__name", text: cat.name }),
        h("p", { class: "cat__distance" }, [
          fmt.number(cat.distanceKm),
          h("span", { class: "cat__unit", text: "km" })
        ]),
        h("dl", { class: "cat__meta" }, [
          h("div", null, [h("dt", { text: "Elevation" }), h("dd", { text: `${fmt.number(cat.elevationM)} m` })]),
          h("div", null, [h("dt", { text: "Time limit" }), h("dd", { text: `${cat.timeLimitHours} h` })]),
          h("div", null, [h("dt", { text: "Entry fee" }), h("dd", { class: "cat__fee", text: fmt.money(cat.fee) })])
        ]),
        h("p", { class: "cat__desc", text: cat.description })
      ])
    );
  });

  C.stats.forEach((s) => {
    let value = s.value;
    if (s.format === "number") value = fmt.number(value);
    if (s.format === "currency") value = fmt.money(value);
    details.append(
      h("div", { class: "stat" }, [
        h("p", { class: "label", text: s.label }),
        h("p", { class: "stat__value" }, [
          String(value),
          s.unit ? h("span", { class: "stat__unit", text: ` ${s.unit}` }) : null
        ]),
        s.note ? h("p", { class: "stat__note", text: s.note }) : null
      ])
    );
  });

  if (C.starterPack && C.starterPack.length) {
    details.append(
      h("div", { class: "pack" }, [
        h("p", { class: "label", text: "Starter pack" }),
        h(
          "ol",
          { class: "pack__list" },
          C.starterPack.map((item, i) =>
            h("li", null, [h("span", { class: "pack__num", text: String(i + 1).padStart(2, "0") }), item])
          )
        )
      ])
    );
  }

  /* ---------- Schedule ---------- */
  const schedule = document.querySelector("[data-schedule]");
  C.schedule.forEach((day) => {
    const date = addDays(raceStart, day.offsetDays || 0);
    schedule.append(
      h("div", { class: "day" }, [
        h("h3", { class: "day__title" }, [
          day.title,
          h("span", { class: "day__date", text: fmt.dayMonth(date) })
        ]),
        h(
          "ol",
          { class: "day__list" },
          day.items.map((item) => {
            const time = String(item.time).includes("T") ? fmt.time(new Date(item.time)) : item.time;
            return h("li", { class: `slot${item.highlight ? " slot--highlight" : ""}` }, [
              h("time", { class: "slot__time", text: time }),
              h("div", null, [
                h("p", { class: "slot__title", text: item.title }),
                item.text ? h("p", { class: "slot__text", text: item.text }) : null
              ])
            ]);
          })
        )
      ])
    );
  });

  /* ---------- Gallery slides (carousel.js wires behaviour) ---------- */
  const track = document.querySelector("[data-carousel-track]");
  const total = C.gallery.length;
  C.gallery.forEach((img, i) => {
    track.append(
      h(
        "figure",
        {
          class: "slide",
          role: "group",
          "aria-roledescription": "slide",
          "aria-label": `${i + 1} of ${total}`
        },
        [
          h("img", {
            src: imgUrl(img.src, 1200, 3 / 2),
            srcset: srcset(img.src, [600, 900, 1200, 1600], 3 / 2),
            sizes: "(min-width: 1100px) 58vw, (min-width: 700px) 70vw, 86vw",
            width: 1200,
            height: 800,
            alt: img.alt,
            loading: i < 2 ? "eager" : "lazy",
            decoding: "async",
            draggable: "false"
          }),
          h("figcaption", { class: "slide__caption" }, [
            h("span", { class: "slide__num", text: String(i + 1).padStart(2, "0") }),
            img.caption
          ])
        ]
      )
    );
  });

  /* ---------- Sponsors marquee ---------- */
  const marquee = document.querySelector("[data-marquee]");
  const marqueeTrack = document.querySelector("[data-marquee-track]");

  const sponsorItem = (s, hidden) =>
    h("li", { class: "marquee__item" }, [
      h("a", { href: s.url, target: "_blank", rel: "noopener", tabindex: hidden ? "-1" : null }, [
        h("img", { src: s.logo, alt: hidden ? "" : s.name, height: 48, loading: "lazy", decoding: "async" })
      ])
    ]);

  const primary = h("ul", { class: "marquee__list", "aria-label": "Sponsors" }, C.sponsors.map((s) => sponsorItem(s, false)));
  const copy = h("ul", { class: "marquee__list", "aria-hidden": "true" }, C.sponsors.map((s) => sponsorItem(s, true)));
  marqueeTrack.append(primary, copy);
  marquee.style.setProperty("--marquee-duration", `${Math.max(C.sponsors.length, 4) * 4.5}s`);

  const toggle = document.querySelector("[data-marquee-toggle]");
  toggle.addEventListener("click", () => {
    const paused = toggle.getAttribute("aria-pressed") !== "true";
    toggle.setAttribute("aria-pressed", String(paused));
    marquee.classList.toggle("is-paused", paused);
  });

  /* ---------- FAQ ---------- */
  document.querySelector("[data-faq]").append(
    ...C.faq.map((item) =>
      h("details", { class: "faq__item" }, [
        h("summary", { class: "faq__q" }, [
          h("span", { text: item.q }),
          h("span", { class: "faq__icon", "aria-hidden": "true" })
        ]),
        h("div", { class: "faq__a" }, [h("p", { text: item.a })])
      ])
    )
  );

  /* ---------- Footer social ---------- */
  document.querySelector("[data-social]").append(
    ...C.contact.social.map((s) =>
      h("li", null, [h("a", { href: s.url, target: "_blank", rel: "noopener", text: s.label })])
    )
  );

  /* ---------- Header: solid once the hero is scrolled past ---------- */
  const header = document.querySelector("[data-header]");
  const hero = document.querySelector(".hero");
  const headerH = header.offsetHeight;
  new IntersectionObserver(
    ([entry]) => header.classList.toggle("is-solid", !entry.isIntersecting),
    { rootMargin: `-${headerH}px 0px 0px 0px` }
  ).observe(hero);
})();
