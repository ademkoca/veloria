/* Registration modal: native <dialog>, config-driven options, validation and submit. */
(function () {
  "use strict";

  const { C, fmt, h, raceStart, isClosed } = window.Race;
  const dialog = document.getElementById("register-dialog");
  const form = dialog.querySelector("form");
  const views = {
    form: dialog.querySelector('[data-view="form"]'),
    success: dialog.querySelector('[data-view="success"]')
  };
  const summary = form.querySelector("[data-form-summary]");
  const submitBtn = form.querySelector("[data-submit]");
  const submitLabel = form.querySelector("[data-submit-label]");
  const feeTotal = form.querySelector("[data-fee-total]");
  const html = document.documentElement;

  let opener = null;
  let completed = false;
  let submitted = false;

  /* ---------- Options from config ---------- */
  const catWrap = form.querySelector('[data-options="category"]');
  C.categories.forEach((cat, i) => {
    catWrap.append(
      h("label", { class: "choice" }, [
        h("input", { type: "radio", name: "category", value: cat.id, checked: i === 0 }),
        h("span", { class: "choice__body" }, [
          h("span", { class: "choice__name", text: cat.name }),
          h("span", { class: "choice__meta", text: `${fmt.number(cat.distanceKm)} km · ${fmt.number(cat.elevationM)} m` }),
          h("span", { class: "choice__fee", text: fmt.money(cat.fee) })
        ])
      ])
    );
  });

  const sizeWrap = form.querySelector('[data-options="shirtSize"]');
  C.form.shirtSizes.forEach((size) => {
    sizeWrap.append(
      h("label", { class: "segment" }, [
        h("input", { type: "radio", name: "shirtSize", value: size }),
        h("span", { text: size })
      ])
    );
  });

  /* Birth-date limits relative to race day. Dates compare as YYYY-MM-DD strings. */
  const isoDay = (d) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: C.event.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const yearsBefore = (years) => {
    const d = new Date(raceStart);
    d.setFullYear(d.getFullYear() - years);
    return isoDay(d);
  };
  const maxBirth = yearsBefore(C.form.minAge);
  const minBirth = yearsBefore(100);
  const birthInput = form.elements.birthDate;
  birthInput.max = maxBirth;
  birthInput.min = minBirth;

  const categoryById = (id) => C.categories.find((c) => c.id === id);

  function updateFee() {
    const cat = categoryById(form.elements.category.value);
    feeTotal.textContent = cat ? fmt.money(cat.fee) : "";
  }
  catWrap.addEventListener("change", updateFee);
  updateFee();

  /* ---------- Validation ---------- */
  const PHONE = /^\+?[\d\s().-]{7,20}$/;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const required = (msg) => (v) => (v.trim() ? "" : msg);
  const phone = (emptyMsg) => (v) =>
    !v.trim() ? emptyMsg : PHONE.test(v.trim()) && v.replace(/\D/g, "").length >= 7 ? "" : "Enter a valid phone number, including the country code.";

  const rules = {
    firstName: required("Enter your first name."),
    lastName: required("Enter your last name."),
    email: (v) => (!v.trim() ? "Enter your email address." : EMAIL.test(v.trim()) ? "" : "Enter an email like name@example.com."),
    phone: phone("Enter your phone number."),
    birthDate: (v) => {
      if (!v) return "Enter your date of birth.";
      if (v > maxBirth) return `You must be at least ${C.form.minAge} on race day.`;
      if (v < minBirth) return "Check the year of your date of birth.";
      return "";
    },
    category: (v) => (v ? "" : "Choose a distance."),
    shirtSize: (v) => (v ? "" : "Choose a jersey size."),
    emergencyName: required("Enter the name of your emergency contact."),
    emergencyPhone: phone("Enter a phone number for your emergency contact."),
    terms: (_, el) => (el.checked ? "" : "Accept the terms to complete your registration.")
  };

  function control(name) {
    return form.elements[name];
  }

  function isInvalid(name) {
    const group = form.querySelector(`[data-group="${name}"]`);
    return group ? group.hasAttribute("data-invalid") : control(name).getAttribute("aria-invalid") === "true";
  }

  function validate(name) {
    const el = control(name);
    const message = rules[name](el.value, el);
    const error = form.querySelector(`#err-${name}`);
    const group = form.querySelector(`[data-group="${name}"]`);
    if (error) error.textContent = message;
    if (group) {
      group.toggleAttribute("data-invalid", !!message);
      group.setAttribute("aria-invalid", String(!!message));
    } else {
      el.setAttribute("aria-invalid", String(!!message));
    }
    return message;
  }

  function focusTarget(name) {
    const el = control(name);
    if (el instanceof RadioNodeList) return form.querySelector(`[name="${name}"]:checked`) || el[0];
    return el;
  }

  // Validate on blur once touched; re-validate live while a field is invalid.
  Object.keys(rules).forEach((name) => {
    const el = control(name);
    const nodes = el instanceof RadioNodeList ? Array.from(el) : [el];
    nodes.forEach((node) => {
      const toggleable = node.type === "checkbox" || node.type === "radio";
      node.addEventListener("blur", () => {
        if (submitted || (!toggleable && node.value)) validate(name);
      });
      node.addEventListener(toggleable ? "change" : "input", () => {
        if (isInvalid(name)) validate(name);
      });
    });
  });

  function setLoading(on) {
    submitBtn.disabled = on;
    submitBtn.setAttribute("aria-busy", String(on));
    submitLabel.textContent = on ? C.copy.form.submitting : C.copy.form.submit;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitted = true;
    summary.textContent = "";

    const invalid = Object.keys(rules).filter((name) => validate(name));
    if (invalid.length) {
      summary.textContent =
        invalid.length === 1 ? "Please correct the highlighted field." : `Please correct the ${invalid.length} highlighted fields.`;
      focusTarget(invalid[0]).focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    data.terms = true;
    data.event = C.event.name;
    data.raceStart = C.event.raceStart;
    data.submittedAt = new Date().toISOString();

    setLoading(true);
    try {
      if (C.form.endpoint) {
        const res = await fetch(C.form.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      showSuccess(data);
    } catch (err) {
      console.error(err);
      summary.textContent = C.copy.form.submitError;
    } finally {
      setLoading(false);
    }
  });

  function showSuccess(data) {
    completed = true;
    const cat = categoryById(data.category);
    const title = dialog.querySelector("[data-success-title]");
    title.textContent = C.copy.form.successTitle.replace("{firstName}", data.firstName.trim());

    const rows = [
      ["Rider", `${data.firstName.trim()} ${data.lastName.trim()}`],
      ["Distance", cat ? `${cat.name}, ${fmt.number(cat.distanceKm)} km` : ""],
      ["Race day", `${fmt.date(raceStart)}, ${fmt.time(raceStart)}`],
      ["Jersey", data.shirtSize],
      ["Entry fee", cat ? fmt.money(cat.fee) : ""],
      ["Confirmation to", data.email.trim()]
    ];
    const list = dialog.querySelector("[data-success-list]");
    list.replaceChildren(...rows.map(([k, v]) => h("div", null, [h("dt", { text: k }), h("dd", { text: v })])));

    views.form.hidden = true;
    views.success.hidden = false;
    title.focus();
  }

  function reset() {
    form.reset();
    submitted = false;
    completed = false;
    summary.textContent = "";
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    form.querySelectorAll("[data-invalid]").forEach((el) => el.removeAttribute("data-invalid"));
    form.querySelectorAll(".field__error").forEach((el) => (el.textContent = ""));
    views.form.hidden = false;
    views.success.hidden = true;
    updateFee();
  }

  /* ---------- Open / close ---------- */
  function open(trigger) {
    if (isClosed()) return;
    opener = trigger;
    if (completed) reset();
    dialog.showModal();
    html.classList.add("has-modal");
    dialog.querySelector(".modal__body").scrollTop = 0;
  }

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-register]");
    if (trigger && !trigger.disabled) open(trigger);
  });

  dialog.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) dialog.close();
  });

  // Backdrop click closes, but not when a text selection drag ends outside the panel.
  let downOnBackdrop = false;
  dialog.addEventListener("pointerdown", (e) => (downOnBackdrop = e.target === dialog));
  dialog.addEventListener("pointerup", (e) => {
    if (downOnBackdrop && e.target === dialog) dialog.close();
    downOnBackdrop = false;
  });

  dialog.addEventListener("close", () => {
    html.classList.remove("has-modal");
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  });
})();
