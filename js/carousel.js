/* Accessible gallery carousel built on native scroll-snap.
   Touch: native swipe with momentum. Mouse: drag, click a side slide, or buttons.
   Keyboard: ←/→ and Home/End while focus is inside the carousel. */
(function () {
  "use strict";

  const { h, reducedMotion } = window.Race;
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-carousel-track]");
  const slides = Array.from(track.children);
  const prev = root.querySelector("[data-carousel-prev]");
  const next = root.querySelector("[data-carousel-next]");
  const dotsWrap = root.querySelector("[data-carousel-dots]");
  const current = root.querySelector("[data-carousel-current]");
  const status = root.querySelector("[data-carousel-status]");
  const pad = (n) => String(n).padStart(2, "0");
  const last = slides.length - 1;

  if (!slides.length) {
    root.hidden = true;
    return;
  }

  let index = -1;
  let announced = -1;

  root.querySelector("[data-carousel-total]").textContent = pad(slides.length);

  const dots = slides.map((_, i) => {
    const dot = h("button", {
      type: "button",
      class: "carousel__dot",
      "aria-label": `Go to slide ${i + 1}`,
      onclick: () => goTo(i)
    });
    dotsWrap.append(dot);
    return dot;
  });

  const behavior = () => (reducedMotion.matches ? "auto" : "smooth");

  function goTo(i, instant) {
    const target = Math.max(0, Math.min(last, i));
    const slide = slides[target];
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior: instant ? "auto" : behavior()
    });
  }

  function nearest() {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    slides.forEach((s, i) => {
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - center);
      if (d < dist) {
        dist = d;
        best = i;
      }
    });
    return best;
  }

  function setActive(i) {
    if (i === index) return;
    index = i;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === i));
    dots.forEach((d, k) => (k === i ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current")));
    prev.setAttribute("aria-disabled", String(i === 0));
    next.setAttribute("aria-disabled", String(i === last));
    current.textContent = pad(i + 1);
  }

  function announce() {
    if (announced === index) return;
    announced = index;
    const caption = slides[index].querySelector("figcaption");
    status.textContent = `Slide ${index + 1} of ${slides.length}${caption ? `: ${caption.textContent.replace(/^\d+/, "")}` : ""}`;
  }

  /* Track position → active slide (rAF-throttled), announce once scrolling settles. */
  let frame = 0;
  let settle = 0;
  track.addEventListener(
    "scroll",
    () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          setActive(nearest());
        });
      }
      clearTimeout(settle);
      settle = setTimeout(announce, 250);
    },
    { passive: true }
  );

  prev.addEventListener("click", () => index > 0 && goTo(index - 1));
  next.addEventListener("click", () => index < last && goTo(index + 1));

  root.addEventListener("keydown", (e) => {
    if (e.target.closest("[data-carousel-dots]") && (e.key === "Enter" || e.key === " ")) return;
    const map = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: last };
    if (!(e.key in map)) return;
    e.preventDefault();
    goTo(map[e.key]);
  });

  /* Mouse drag (touch and trackpads already scroll natively). */
  let drag = null;
  let suppressClick = false;

  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { x: e.clientX, left: track.scrollLeft, moved: false };
  });

  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) {
      drag.moved = true;
      track.classList.add("is-dragging");
    }
    if (drag.moved) track.scrollLeft = drag.left - dx;
  });

  window.addEventListener("pointerup", () => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    if (!moved) return;
    suppressClick = true;
    track.classList.remove("is-dragging");
    goTo(nearest());
  });

  /* Clicking a peeking side slide brings it to the centre. */
  track.addEventListener("click", (e) => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    const slide = e.target.closest(".slide");
    if (!slide) return;
    const i = slides.indexOf(slide);
    if (i !== index) goTo(i);
  });

  /* Keep the active slide centred when the layout changes. */
  let resizeTimer = 0;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(index < 0 ? 0 : index, true), 100);
  }).observe(track);

  setActive(0);
  announced = 0;
})();
