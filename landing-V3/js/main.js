
"use strict";

/*
 * CONFIGURACIÓN COMERCIAL
 *
 * Sustituye estos valores antes de publicar.
 * WhatsApp: código de país + número, solo dígitos.
 * Ejemplo Bolivia: 59170207287
 */
const CONFIG = {
  companyName: "Industrial",
  whatsappNumber: 59170207287
  corporateEmail: "comercial@empresa.com",
  corporatePhone: "+591 702 07287",
  showroomAddress: "Dirección corporativa por confirmar"
};

const INTEREST_LABELS = {
  "montacargas": "Montacargas industriales",
  "maquinaria-vehicular": "Maquinaria vehicular industrial",
  "repuestos": "Importación y suministro de repuestos",
  "postventa": "Servicio postventa y mantenimiento"
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
  initInterestShortcuts();
  initContactForm();
  initContactChannels();
  initDetailsCounter();
  initFooterYear();
});

/* -------------------------------------------------------
   MENÚ RESPONSIVE
------------------------------------------------------- */

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("main-navigation");
  const openIcon = document.getElementById("menu-open-icon");
  const closeIcon = document.getElementById("menu-close-icon");

  if (!toggle || !navigation) return;

  const setMenuState = (isOpen) => {
    navigation.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú"
    );

    openIcon?.classList.toggle("hidden", isOpen);
    closeIcon?.classList.toggle("hidden", !isOpen);
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") !== "true";
    setMenuState(isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      toggle.getAttribute("aria-expanded") === "true" &&
      !navigation.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      setMenuState(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      setMenuState(false);
    }
  });
}

/* -------------------------------------------------------
   DESPLAZAMIENTO SUAVE
------------------------------------------------------- */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      if (window.location.hash !== href) {
        history.replaceState(null, "", href);
      }
    });
  });
}

/* -------------------------------------------------------
   ACCESOS RÁPIDOS DESDE LAS TARJETAS DE MAQUINARIA
------------------------------------------------------- */

function initInterestShortcuts() {
  const form = document.getElementById("contact-form");

  if (!form) return;

  document.querySelectorAll("[data-interest]").forEach((link) => {
    link.addEventListener("click", () => {
      const value = link.dataset.interest;

      const option = form.querySelector(
        `input[name="interest"][value="${CSS.escape(value)}"]`
      );

      if (option) {
        option.checked = true;
        clearFieldError("interest");
      }
    });
  });
}

/* -------------------------------------------------------
   FORMULARIO CORPORATIVO
------------------------------------------------------- */

function initContactForm() {
  const form = document.getElementById("contact-form");

  if (!form) return;

  const fields = {
    name: document.getElementById("contact-name"),
    company: document.getElementById("company"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    details: document.getElementById("details"),
    consent: document.getElementById("consent")
  };

  const status = document.getElementById("form-status");

  const submitButtons = Array.from(
    form.querySelectorAll('button[name="submit-action"]')
  );

  /*
   * El formulario no almacena datos en un servidor.
   * Solo prepara la solicitud para el canal que el usuario elige.
   */
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (status) {
      status.textContent = "";
      delete status.dataset.type;
    }

    const submitter = event.submitter;

    const action =
      submitter?.value === "email" ? "email" : "whatsapp";

    const data = collectFormData(fields);
    const validation = validateForm(data, fields);

    if (!validation.valid) {
      showStatus(
        status,
        "Revisa los campos indicados antes de continuar.",
        "error"
      );

      if (validation.firstInvalid) {
        validation.firstInvalid.focus();
      }

      return;
    }

    const message = buildCorporateMessage(data);

    if (action === "whatsapp") {
      openWhatsApp(message, status);
      return;
    }

    if (action === "email") {
      openCorporateEmail(data, message, status);
    }
  });

  /*
   * Al corregir un campo, retiramos su mensaje de error.
   */
  [
    fields.name,
    fields.company,
    fields.email,
    fields.phone,
    fields.details,
    fields.consent
  ].forEach((field) => {
    if (!field) return;

    const eventName =
      field.type === "checkbox" ? "change" : "input";

    field.addEventListener(eventName, () => {
      const key = getFieldKey(field);

      if (key) clearFieldError(key);

      if (status?.dataset.type === "error") {
        status.textContent = "";
        delete status.dataset.type;
      }
    });
  });

  form.querySelectorAll('input[name="interest"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      clearFieldError("interest");
    });
  });

  /*
   * Evita envíos repetidos mientras el usuario está
   * abriendo el canal de comunicación.
   */
  submitButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;

      submitButtons.forEach((item) => {
        item.dataset.originalText = item.innerHTML;
      });
    });
  });
}

/* -------------------------------------------------------
   RECOPILAR DATOS
------------------------------------------------------- */

function collectFormData(fields) {
  const selectedInterest = document.querySelector(
    'input[name="interest"]:checked'
  );

  return {
    name: fields.name?.value.trim() ?? "",
    company: fields.company?.value.trim() ?? "",
    email: fields.email?.value.trim() ?? "",
    phone: fields.phone?.value.trim() ?? "",
    interest: selectedInterest?.value ?? "",
    details: fields.details?.value.trim() ?? "",
    consent: fields.consent?.checked ?? false
  };
}

/* -------------------------------------------------------
   VALIDACIÓN
------------------------------------------------------- */

function validateForm(data, fields) {
  const errors = {};
  let firstInvalid = null;

  if (data.name.length < 2) {
    errors.name = "Introduce tu nombre y apellido.";
  } else if (data.name.length > 100) {
    errors.name = "El nombre no puede superar los 100 caracteres.";
  }

  if (data.company.length < 2) {
    errors.company = "Introduce el nombre de la empresa.";
  } else if (data.company.length > 120) {
    errors.company = "El nombre de la empresa es demasiado largo.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!emailPattern.test(data.email) || data.email.length > 150) {
    errors.email = "Introduce una dirección de correo válida.";
  }

  const phoneDigits = data.phone.replace(/\D/g, "");

  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = "Introduce un teléfono válido con código de país si corresponde.";
  }

  if (!INTEREST_LABELS[data.interest]) {
    errors.interest = "Selecciona un área de interés.";
  }

  if (!data.consent) {
    errors.consent = "Debes autorizar el uso de tus datos para gestionar la solicitud.";
  }

  if (data.details.length > 2000) {
    errors.details = "Los detalles no pueden superar los 2000 caracteres.";
  }

  /*
   * Limpiar errores anteriores antes de presentar
   * los resultados de esta validación.
   */
  Object.keys(FIELD_ERROR_MAP).forEach(clearFieldError);

  Object.entries(errors).forEach(([key, message]) => {
    setFieldError(key, message);
  });

  const invalidOrder = [
    "name",
    "company",
    "email",
    "phone",
    "interest",
    "details",
    "consent"
  ];

  const firstInvalidKey = invalidOrder.find((key) => errors[key]);

  if (firstInvalidKey) {
    if (firstInvalidKey === "interest") {
      firstInvalid = document.querySelector(
        'input[name="interest"]'
      );
    } else {
      firstInvalid = fields[firstInvalidKey];
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    firstInvalid
  };
}

const FIELD_ERROR_MAP = {
  name: {
    field: "contact-name",
    error: "name-error"
  },
  company: {
    field: "company",
    error: "company-error"
  },
  email: {
    field: "email",
    error: "email-error"
  },
  phone: {
    field: "phone",
    error: "phone-error"
  },
  interest: {
    field: null,
    error: "interest-error"
  },
  details: {
    field: "details",
    error: null
  },
  consent: {
    field: "consent",
    error: "consent-error"
  }
};

function setFieldError(key, message) {
  const config = FIELD_ERROR_MAP[key];

  if (!config) return;

  if (config.field) {
    const field = document.getElementById(config.field);
    field?.setAttribute("aria-invalid", "true");
  }

  if (config.error) {
    const errorElement = document.getElementById(config.error);

    if (errorElement) {
      errorElement.textContent = message;
    }
  }
}

function clearFieldError(key) {
  const config = FIELD_ERROR_MAP[key];

  if (!config) return;

  if (config.field) {
    const field = document.getElementById(config.field);
    field?.removeAttribute("aria-invalid");
  }

  if (config.error) {
    const errorElement = document.getElementById(config.error);

    if (errorElement) {
      errorElement.textContent = "";
    }
  }
}

function getFieldKey(field) {
  const idToKey = {
    "contact-name": "name",
    company: "company",
    email: "email",
    phone: "phone",
    details: "details",
    consent: "consent"
  };

  return idToKey[field.id] ?? null;
}

/* -------------------------------------------------------
   MENSAJE CORPORATIVO
------------------------------------------------------- */

function buildCorporateMessage(data) {
  const interestLabel =
    INTEREST_LABELS[data.interest] ?? "Consulta comercial";

  const lines = [
    `SOLICITUD COMERCIAL PRIORITARIA — ${CONFIG.companyName}`,
    "",
    "Estimado equipo comercial:",
    "",
    "Solicito información y asesoramiento para el siguiente requerimiento empresarial.",
    "",
    "DATOS DEL SOLICITANTE",
    `Nombre: ${data.name}`,
    `Empresa: ${data.company}`,
    `Correo corporativo: ${data.email}`,
    `Teléfono: ${data.phone}`,
    "",
    "ÁREA DE INTERÉS",
    interestLabel,
    "",
    "DETALLES DEL REQUERIMIENTO",
    data.details || "No se añadieron detalles adicionales.",
    "",
    "Agradeceré recibir información sobre disponibilidad, especificaciones técnicas, precio, garantía, plazo de entrega y condiciones comerciales aplicables.",
    "",
    "Quedo atento/a a su respuesta.",
    "",
    "Saludos cordiales,",
    data.name,
    data.company
  ];

  return lines.join("\n");
}

/* -------------------------------------------------------
   SALIDA 1: WHATSAPP
------------------------------------------------------- */

function openWhatsApp(message, status) {
  const number = CONFIG.whatsappNumber.replace(/\D/g, "");

  if (!number || number.length < 8 || number === "59170000000") {
    showStatus(
      status,
      "Configura el número real de WhatsApp en js/main.js antes de utilizar este canal.",
      "error"
    );
    return;
  }

  const url =
    `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

  /*
   * Se abre directamente desde la interacción del usuario
   * para reducir el riesgo de bloqueo de ventanas emergentes.
   */
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");

  if (!newWindow) {
    showStatus(
      status,
      "El navegador bloqueó la apertura de WhatsApp. Permite las ventanas emergentes o abre este enlace: " + url,
      "info"
    );
    return;
  }

  showStatus(
    status,
    "La solicitud está preparada en WhatsApp. Revisa el mensaje y pulsa Enviar para completar el contacto.",
    "success"
  );
}

/* -------------------------------------------------------
   SALIDA 2: CORREO CORPORATIVO
------------------------------------------------------- */

function openCorporateEmail(data, message, status) {
  const email = CONFIG.corporateEmail.trim();

  if (!isValidConfiguredEmail(email)) {
    showStatus(
      status,
      "Configura el correo comercial real en js/main.js antes de utilizar este canal.",
      "error"
    );
    return;
  }

  const subject =
    `Solicitud comercial prioritaria | ${data.company} | ${INTEREST_LABELS[data.interest]}`;

  const mailtoUrl = new URL(`mailto:${email}`);

  mailtoUrl.searchParams.set("subject", subject);
  mailtoUrl.searchParams.set("body", message);

  /*
   * mailto abre el cliente de correo del usuario.
   * No envía el mensaje automáticamente.
   */
  window.location.href = mailtoUrl.toString();

  showStatus(
    status,
    "La solicitud está preparada para tu correo. Revisa el destinatario y el contenido, y envíala desde tu aplicación de correo.",
    "info"
  );
}

function isValidConfiguredEmail(email) {
  return (
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) &&
    email !== "comercial@empresa.com"
  );
}

/* -------------------------------------------------------
   CANALES DE CONTACTO
------------------------------------------------------- */

function initContactChannels() {
  const phoneLink = document.getElementById("phone-contact");
  const phoneDisplay = document.getElementById("phone-display");
  const emailLink = document.getElementById("email-sidebar");
  const emailDisplay = document.getElementById("email-sidebar-display");
  const addressDisplay = document.getElementById("address-display");

  if (phoneLink) {
    const digits = CONFIG.corporatePhone.replace(/\D/g, "");

    if (digits && digits !== "59100000000") {
      phoneLink.href = `tel:+${digits}`;
    } else {
      phoneLink.removeAttribute("href");
      phoneLink.setAttribute("aria-disabled", "true");
    }
  }

  if (phoneDisplay) {
    phoneDisplay.textContent = CONFIG.corporatePhone;
  }

  if (emailLink) {
    if (isValidConfiguredEmail(CONFIG.corporateEmail)) {
      emailLink.href = `mailto:${CONFIG.corporateEmail}`;
    } else {
      emailLink.removeAttribute("href");
    }
  }

  if (emailDisplay) {
    emailDisplay.textContent = CONFIG.corporateEmail;
  }

  if (addressDisplay) {
    addressDisplay.textContent = CONFIG.showroomAddress;
  }
}

/* -------------------------------------------------------
   CONTADOR DE CARACTERES
------------------------------------------------------- */

function initDetailsCounter() {
  const details = document.getElementById("details");
  const counter = document.getElementById("details-count");

  if (!details || !counter) return;

  const updateCounter = () => {
    counter.textContent = `${details.value.length}/2000`;
  };

  details.addEventListener("input", updateCounter);
  updateCounter();
}

/* -------------------------------------------------------
   ESTADO DEL FORMULARIO
------------------------------------------------------- */

function showStatus(element, message, type = "info") {
  if (!element) return;

  element.textContent = message;
  element.dataset.type = type;
}

/* -------------------------------------------------------
   AÑO DEL FOOTER
------------------------------------------------------- */

function initFooterYear() {
  const year = document.getElementById("current-year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}
