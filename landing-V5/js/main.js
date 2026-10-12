
"use strict";

/*
 * CONFIGURACIÓN CORPORATIVA
 * WhatsApp: código de país + número, solo dígitos.
 * Ejemplo Bolivia: 59170000000
 */
const CONFIG = {
  whatsappNumber: "59170207287",
  email: "info@empresa.com"
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
  initInterestShortcuts();
  initContactForm();
  initAlternativeChannels();
  initFooterYear();
});

/* =========================================
   NAVEGACIÓN RESPONSIVE
========================================= */

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("main-navigation");

  if (!toggle || !navigation) return;

  function closeMenu() {
    navigation.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  }

  toggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú"
    );
  });

  navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) closeMenu();
  });
}

/* =========================================
   DESPLAZAMIENTO SUAVE
========================================= */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const selector = link.getAttribute("href");

      if (!selector || selector === "#") return;

      const target = document.querySelector(selector);

      if (!target) return;

      event.preventDefault();

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });

      history.replaceState(null, "", selector);
    });
  });
}

/* =========================================
   ATAJOS DE COTIZACIÓN
========================================= */

function initInterestShortcuts() {
  const interestSelect = document.getElementById("interest");

  if (!interestSelect) return;

  document.querySelectorAll("[data-interest]").forEach((link) => {
    link.addEventListener("click", () => {
      const selectedInterest = link.dataset.interest;

      const optionExists = Array.from(
        interestSelect.options
      ).some((option) => option.value === selectedInterest);

      if (!optionExists) return;

      interestSelect.value = selectedInterest;

      interestSelect.dispatchEvent(
        new Event("change", { bubbles: true })
      );
    });
  });
}

/* =========================================
   FORMULARIO B2B
========================================= */

function initContactForm() {
  const form = document.getElementById("contact-form");

  if (!form) return;

  const fields = {
    name: document.getElementById("contact-name"),
    company: document.getElementById("company"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    interest: document.getElementById("interest"),
    details: document.getElementById("details"),
    consent: document.getElementById("consent")
  };

  const errors = {
    name: document.getElementById("name-error"),
    company: document.getElementById("company-error"),
    email: document.getElementById("email-error"),
    phone: document.getElementById("phone-error"),
    interest: document.getElementById("interest-error"),
    consent: document.getElementById("consent-error")
  };

  const status = document.getElementById("form-status");
  const submitButton = document.getElementById("whatsapp-submit");

  function clearError(fieldName) {
    const field = fields[fieldName];
    const error = errors[fieldName];

    if (error) error.textContent = "";

    if (field) field.removeAttribute("aria-invalid");
  }

  function showError(fieldName, message) {
    const field = fields[fieldName];
    const error = errors[fieldName];

    if (error) error.textContent = message;

    if (field) field.setAttribute("aria-invalid", "true");
  }

  function setStatus(message, type = "") {
    status.replaceChildren();
    status.className = "form-status";
    status.textContent = message;

    if (type) {
      status.classList.add(`status-${type}`);
    }
  }

  Object.keys(fields).forEach((fieldName) => {
    const field = fields[fieldName];

    if (!field) return;

    field.addEventListener("input", () => {
      clearError(fieldName);
      setStatus("");
    });

    field.addEventListener("change", () => {
      clearError(fieldName);
      setStatus("");
    });
  });

  function validateForm() {
    Object.keys(errors).forEach(clearError);
    setStatus("");

    let firstInvalid = null;

    function invalidate(fieldName, message) {
      showError(fieldName, message);

      if (!firstInvalid) {
        firstInvalid = fields[fieldName];
      }
    }

    const name = fields.name.value.trim();
    const company = fields.company.value.trim();
    const email = fields.email.value.trim();
    const phone = fields.phone.value.trim();
    const interest = fields.interest.value;

    // Contacto y empresa
    if (name.length < 2 || name.length > 100) {
      invalidate(
        "name",
        "Ingrese el nombre del contacto (2 a 100 caracteres)."
      );
    }

    if (company.length < 2 || company.length > 150) {
      invalidate(
        "company",
        "Ingrese la razón social o identificación de su empresa."
      );
    }

    // Validación básica del correo electrónico
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length > 150 || !emailPattern.test(email)) {
      invalidate(
        "email",
        "Ingrese una dirección de correo electrónico válida."
      );
    }

    // Acepta números internacionales con espacios, +, guiones o paréntesis.
    const phoneDigits = phone.replace(/\D/g, "");

    if (
      !/^\+?[\d\s().-]+$/.test(phone) ||
      phoneDigits.length < 8 ||
      phoneDigits.length > 15
    ) {
      invalidate(
        "phone",
        "Ingrese un teléfono válido con código de país."
      );
    }

    if (!interest) {
      invalidate(
        "interest",
        "Seleccione el área de su requerimiento."
      );
    }

    if (!fields.consent.checked) {
      invalidate(
        "consent",
        "Autorice el uso de sus datos para gestionar la solicitud."
      );
    }

    if (firstInvalid) {
      firstInvalid.focus();

      setStatus(
        "Revise los campos señalados antes de continuar.",
        "error"
      );

      return false;
    }

    return true;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    if (!/^\d{8,15}$/.test(CONFIG.whatsappNumber)) {
      setStatus(
        "El número corporativo de WhatsApp no está configurado correctamente.",
        "error"
      );
      return;
    }

    const data = {
      name: fields.name.value.trim(),
      company: fields.company.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      interest: fields.interest.value,
      details: fields.details.value.trim()
    };

    const message = buildCorporateMessage(data);

    const whatsappURL =
      `https://wa.me/${CONFIG.whatsappNumber}` +
      `?text=${encodeURIComponent(message)}`;

    /*
     * Abrir la ventana dentro del evento del usuario.
     * No se envía información hasta que el usuario
     * confirme el mensaje en WhatsApp.
     */
    const whatsappWindow = window.open(
      whatsappURL,
      "_blank",
      "noopener,noreferrer"
    );

    if (whatsappWindow) {
      setStatus(
        "La solicitud está preparada. Revise WhatsApp y confirme el envío.",
        "success"
      );
    } else {
      // Alternativa cuando el navegador bloquea ventanas emergentes.
      setStatus(
        "El navegador bloqueó la apertura automática. Utilice el enlace alternativo:",
        "error"
      );

      const fallbackLink = document.createElement("a");
      fallbackLink.href = whatsappURL;
      fallbackLink.target = "_blank";
      fallbackLink.rel = "noopener noreferrer";
      fallbackLink.textContent = "Abrir solicitud en WhatsApp";
      fallbackLink.className = "fallback-link";

      status.appendChild(document.createElement("br"));
      status.appendChild(fallbackLink);
    }
  });
}

/* =========================================
   MENSAJE COMERCIAL FORMAL
========================================= */

function buildCorporateMessage(data) {
  const lines = [
    "SOLICITUD CORPORATIVA DE COTIZACIÓN",
    "===================================",
    "",
    "DATOS DEL SOLICITANTE",
    `Nombre del contacto: ${data.name}`,
    `Empresa / RIF / NIT: ${data.company}`,
    `Correo corporativo: ${data.email}`,
    `Teléfono de contacto: ${data.phone}`,
    "",
    "ÁREA DEL REQUERIMIENTO",
    data.interest
  ];

  if (data.details) {
    lines.push(
      "",
      "DETALLES TÉCNICOS Y COMERCIALES",
      data.details
    );
  }

  lines.push(
    "",
    "Solicito información sobre las especificaciones técnicas,",
    "disponibilidad, condiciones comerciales y plazo estimado",
    "de atención correspondiente a este requerimiento.",
    "",
    "Solicitud generada desde el sitio web corporativo."
  );

  return lines.join("\n");
}

/* =========================================
   CANALES ALTERNATIVOS
========================================= */

function initAlternativeChannels() {
  const whatsappLink = document.getElementById("whatsapp-contact");
  const emailLink = document.getElementById("email-contact");
  const emailDisplay = document.getElementById("email-display");

  const validWhatsApp = /^\d{8,15}$/.test(CONFIG.whatsappNumber);

  if (whatsappLink) {
    if (validWhatsApp) {
      whatsappLink.href = `https://wa.me/${CONFIG.whatsappNumber}`;
    } else {
      whatsappLink.href = "#contacto";
      whatsappLink.removeAttribute("target");
      whatsappLink.removeAttribute("rel");
    }
  }

  if (emailLink) {
    emailLink.href = `mailto:${CONFIG.email}`;
  }

  if (emailDisplay) {
    emailDisplay.textContent = CONFIG.email;
  }
}

/* =========================================
   AÑO DEL FOOTER
========================================= */

function initFooterYear() {
  const year = document.getElementById("current-year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }
}
