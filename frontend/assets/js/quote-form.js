(() => {
  const form = document.querySelector("[data-quote-form]");

  if (!form) {
    return;
  }

  const API_BASE_URL =
    window.MICO_API_BASE_URL ||
    document.querySelector('meta[name="api-base-url"]')?.content ||
    "https://mico-industrial-press-api.onrender.com";
  const QUOTE_ENDPOINT = `${API_BASE_URL.replace(/\/$/, "")}/api/quote`;

  const errorAlert = form.querySelector("[data-form-error]");
  const successAlert = form.querySelector("[data-form-success]");
  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent || "Submit";
  const allowedFileTypes = ["pdf", "jpg", "jpeg", "png", "doc", "docx"];

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
    if (!control.required && control.value.trim() === "") {
      setFieldState(control, true);
      return true;
    }

    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(control.value.trim());

    setFieldState(control, isValid);
    return isValid;
  };

  const validatePhone = (control) => {
    if (!control.required && control.value.trim() === "") {
      setFieldState(control, true);
      return true;
    }

    const digits = control.value.replace(/\D/g, "");
    const isValid = digits.length >= 7 && digits.length <= 15;

    setFieldState(control, isValid);
    return isValid;
  };

  const validateFile = (control) => {
    if (!control.files || control.files.length === 0) {
      setFieldState(control, true);
      return true;
    }

    const fileName = control.files[0].name;
    const extension = fileName.split(".").pop().toLowerCase();
    const isValid = allowedFileTypes.includes(extension);

    setFieldState(control, isValid);
    return isValid;
  };

  const validateForm = () => {
    const requiredControls = form.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    let isValid = true;

    requiredControls.forEach((control) => {
      if (!validateRequiredControl(control)) {
        isValid = false;
      }
    });

    const email = form.querySelector('input[type="email"]');
    if (email && !validateEmail(email)) {
      isValid = false;
    }

    const phone = form.querySelector('input[type="tel"]');
    if (phone && !validatePhone(phone)) {
      isValid = false;
    }

    const upload = form.querySelector('input[type="file"]');
    if (upload && !validateFile(upload)) {
      isValid = false;
    }

    return isValid;
  };

  const buildQuoteFormData = () => {
    const formData = new FormData(form);
    const upload = form.querySelector('input[type="file"]');

    if (upload && (!upload.files || upload.files.length === 0)) {
      formData.delete(upload.name);
    }

    return formData;
  };

  const getErrorMessage = async (response) => {
    try {
      const payload = await response.json();
      return (
        payload.message ||
        "The request could not be sent. Please call or use WhatsApp."
      );
    } catch (_error) {
      return "The request could not be sent. Please call or use WhatsApp.";
    }
  };

  form.addEventListener("input", (event) => {
    const control = event.target;

    if (control.matches("input[required], select[required], textarea[required]")) {
      validateRequiredControl(control);
    }

    if (control.matches('input[type="email"]')) {
      validateEmail(control);
    }

    if (control.matches('input[type="tel"]')) {
      validatePhone(control);
    }
  });

  form.addEventListener("change", (event) => {
    const control = event.target;

    if (control.matches('input[type="file"]')) {
      validateFile(control);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearAlerts();

    if (!validateForm()) {
      setAlert("error", "Please check the highlighted fields before sending.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(QUOTE_ENDPOINT, {
        method: "POST",
        body: buildQuoteFormData(),
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
          "Quote request sent successfully. Mico Industrial Press will follow up."
      );
    } catch (error) {
      setAlert(
        "error",
        error.message ||
          "The quote request could not be sent. Please call or use WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  });
})();
