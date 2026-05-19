(() => {
  const form = document.querySelector("[data-contact-form]");

  if (!form) {
    return;
  }

  const API_BASE_URL =
    window.MICO_API_BASE_URL ||
    document.querySelector('meta[name="api-base-url"]')?.content ||
    "https://mico-industrial-press-api.onrender.com";
  const CONTACT_ENDPOINT = `${API_BASE_URL.replace(/\/$/, "")}/api/contact`;

  const errorAlert = form.querySelector("[data-form-error]");
  const successAlert = form.querySelector("[data-form-success]");
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent || "Submit";

  const setAlert = (type, message) => {
    errorAlert.classList.remove("is-visible");
    successAlert.classList.remove("is-visible");
    errorAlert.textContent = "";
    successAlert.textContent = "";

    const target = type === "success" ? successAlert : errorAlert;
    target.textContent = message;
    target.classList.add("is-visible");
    target.scrollIntoView({ block: "center" });
  };

  const clearAlerts = () => {
    errorAlert.classList.remove("is-visible");
    successAlert.classList.remove("is-visible");
    errorAlert.textContent = "";
    successAlert.textContent = "";
  };

  const setLoading = (isLoading) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? "Sending..." : originalButtonText;
  };

  const setFieldState = (control, isValid) => {
    const field = control.closest("[data-field]");

    if (!field) {
      return;
    }

    field.classList.toggle("is-invalid", !isValid);
    control.setAttribute("aria-invalid", String(!isValid));
  };

  const validateRequiredControl = (control) => {
    const value = control.value.trim();
    const isValid = !control.required || value.length > 0;

    setFieldState(control, isValid);
    return isValid;
  };

  const validateEmail = (control) => {
    if (control.value.trim() === "") {
      setFieldState(control, true);
      return true;
    }

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value.trim());

    setFieldState(control, isValid);
    return isValid;
  };

  const validatePhone = (control) => {
    if (control.value.trim() === "") {
      setFieldState(control, true);
      return true;
    }

    const digits = control.value.replace(/\D/g, "");
    const isValid = digits.length >= 7 && digits.length <= 15;

    setFieldState(control, isValid);
    return isValid;
  };

  const validateContactMethod = () => {
    const phone = form.querySelector("#contact-phone");
    const email = form.querySelector("#contact-email");
    const hasContactMethod =
      phone.value.trim().length > 0 || email.value.trim().length > 0;

    if (!hasContactMethod) {
      setFieldState(phone, false);
      setFieldState(email, false);
      return false;
    }

    if (phone.value.trim().length === 0) {
      setFieldState(phone, true);
    }

    if (email.value.trim().length === 0) {
      setFieldState(email, true);
    }

    return true;
  };

  const refreshContactMethodIfNeeded = () => {
    const phone = form.querySelector("#contact-phone");
    const email = form.querySelector("#contact-email");
    const hasVisibleContactError =
      phone.getAttribute("aria-invalid") === "true" ||
      email.getAttribute("aria-invalid") === "true";

    if (hasVisibleContactError || phone.value.trim() || email.value.trim()) {
      validateContactMethod();
    }
  };

  const validateForm = () => {
    const requiredControls = form.querySelectorAll(
      "input[required], textarea[required]"
    );
    let isValid = true;

    requiredControls.forEach((control) => {
      if (!validateRequiredControl(control)) {
        isValid = false;
      }
    });

    const email = form.querySelector("#contact-email");
    const phone = form.querySelector("#contact-phone");

    if (!validateEmail(email)) {
      isValid = false;
    }

    if (!validatePhone(phone)) {
      isValid = false;
    }

    if (!validateContactMethod()) {
      isValid = false;
    }

    return isValid;
  };

  const getErrorMessage = async (response) => {
    try {
      const payload = await response.json();
      return (
        payload.message ||
        "The message could not be sent. Please call or use WhatsApp."
      );
    } catch (_error) {
      return "The message could not be sent. Please call or use WhatsApp.";
    }
  };

  form.addEventListener("input", (event) => {
    const control = event.target;

    if (control.matches("input[required], textarea[required]")) {
      validateRequiredControl(control);
    }

    if (control.matches('input[type="email"]')) {
      validateEmail(control);
    }

    if (control.matches('input[type="tel"]')) {
      validatePhone(control);
    }

    if (control.matches('input[type="email"], input[type="tel"]')) {
      refreshContactMethodIfNeeded();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAlerts();

    if (!validateForm()) {
      setAlert(
        "error",
        "Please check the highlighted fields before sending your message."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const payload = await response.json();
      form.reset();
      form
        .querySelectorAll("[data-field].is-invalid")
        .forEach((field) => field.classList.remove("is-invalid"));
      form
        .querySelectorAll("[aria-invalid='true']")
        .forEach((control) => control.setAttribute("aria-invalid", "false"));
      setAlert(
        "success",
        payload.message ||
          "Message sent successfully. Mico Industrial Press will respond as soon as possible."
      );
    } catch (error) {
      setAlert(
        "error",
        error.message ||
          "The message could not be sent. Please call or use WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  });
})();
