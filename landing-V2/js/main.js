
"use strict";

/*
 * CONFIGURACIÓN DEL SITIO
 * WhatsApp: código de país + número, solo dígitos.
 * Ejemplo Bolivia: 59170207287
 */
const CONFIG = {
  whatsappNumber: "59170207287",
  corporateEmail: "comercial@empresa.com"
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
  initInterestShortcuts();
  initContactForm();
  initContactChannels();
  initFooterYear();
});

/* Menú móvil */
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
    if (window.innerWidth > 767) closeMenu();
  });
}

/* Navegación con desplazamiento suave */
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

/* Los enlaces de maquinaria precargan el área de interés */
function initInterestShortcuts() {
  const interestSelect = document.getElementById("interest");

  if (!interestSelect) return;

  document.querySelectorAll("[data-interest]").forEach((link) => {
    link.addEventListener("click", () => {
      const interest = link.dataset.interest;

      const optionExists = Array.from(interestSelect.options).some(
        (option) => option.value === interest
      );

      if (!optionExists) return;

      interestSelect.value = interest;
      interestSelect.dispatchEvent(
        new Event("change", { bubbles: true })
      );
    });
  });
}

/* Formulario corporativo */
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
    if (!status) return;

    status.replaceChildren();
    status.className = "form-status";
    status.textContent = message;

    if (type) {
      status.classList.add(`status-${type}`);
    }
  }

  // Limpiar mensajes cuando el usuario corrige un campo.
  Object.keys(fields).forEach((fieldName) => {
    const field = fields[fieldName];

    if (!field) return;

    const clearFieldMessage = () => {
      clearError(fieldName);
      setStatus("");
    };

    field.addEventListener("input", clearFieldMessage);
    field.addEventListener("change", clearFieldMessage);
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

    if (name.length < 2 || name.length > 100) {
      invalidate(
        "name",
        "Ingrese un nombre válido de entre 2 y 100 caracteres."
      );
    }

    if (company.length < 2 || company.length > 150) {
      invalidate(
        "company",
        "Ingrese el nombre de la empresa o su identificación tributaria."
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length > 150 || !emailPattern.test(email)) {
      invalidate(
        "email",
        "Ingrese una dirección de correo electrónico válida."
      );
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (
      !/^\+?[\d\s().-]+$/.test(phone) ||
      phoneDigits.length < 8 ||
      phoneDigits.length > 15
    ) {
      invalidate(
        "phone",
        "Ingrese un teléfono válido con código de país si corresponde."
      );
    }

    const allowedInterests = Array.from(fields.interest.options)
      .map((option) => option.value)
      .filter(Boolean);

    if (!allowedInterests.includes(interest)) {
      invalidate(
        "interest",
        "Seleccione una de las áreas de requerimiento disponibles."
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
      `https://wa.me/${CONFIG.whatsappNumber}?text=` +
      encodeURIComponent(message);

    /*
     * Abrir la ventana durante el envío del formulario ayuda
     * a evitar bloqueos de ventanas emergentes.
     */
    const whatsappWindow = window.open(whatsappURL, "_blank");

    if (whatsappWindow) {
      whatsappWindow.opener = null;

      setStatus(
        "Se abrió WhatsApp con la solicitud preparada. Revise el mensaje y confirme el envío.",
        "success"
      );
    } else {
      setStatus(
        "El navegador bloqueó la apertura automática. Utilice el enlace alternativo.",
        "error"
      );

      if (status) {
        const fallbackLink = document.createElement("a");

        fallbackLink.href = whatsappURL;
        fallbackLink.target = "_blank";
        fallbackLink.rel = "noopener noreferrer";
        fallbackLink.textContent = "Continuar a WhatsApp";

        status.appendChild(document.createTextNode(" "));
        status.appendChild(fallbackLink);
      }
    }
  });
}

/* Mensaje formal para el área comercial */
function buildCorporateMessage(data) {
  const lines = [
    "SOLICITUD CORPORATIVA DE INFORMACIÓN Y COTIZACIÓN",
    "",
    "Estimado equipo comercial:",
    "Me comunico para presentar el siguiente requerimiento.",
    "",
    "DATOS DEL CONTACTO",
    `Nombre: ${data.name}`,
    `Empresa / RIF / NIT: ${data.company}`,
    `Correo corporativo: ${data.email}`,
    `Teléfono: ${data.phone}`,
    "",
    "ÁREA DEL REQUERIMIENTO",
    data.interest
  ];

  if (data.details) {
    lines.push(
      "",
      "INFORMACIÓN ADICIONAL",
      data.details
    );
  }

  lines.push(
    "",
    "Agradeceré información sobre las especificaciones técnicas,",
    "disponibilidad, condiciones comerciales y próximos pasos",
    "para atender este requerimiento.",
    "",
    "Mensaje generado desde el sitio web corporativo."
  );

  return lines.join("\n");
}

/* Configuración de los canales alternativos */
function initContactChannels() {
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
    emailLink.href = `mailto:${CONFIG.corporateEmail}`;
  }

  if (emailDisplay) {
    emailDisplay.textContent = CONFIG.corporateEmail;
  }
}

/* Actualizar automáticamente el año */
function initFooterYear() {
  const year = document.getElementById("current-year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}
