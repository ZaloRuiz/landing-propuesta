
"use strict";

/*
 * CONFIGURACIÓN DEL SITIO
 * Reemplazar los valores de ejemplo antes de publicar.
 * Formato WhatsApp: código de país + número, solo dígitos.
 * Bolivia: 591XXXXXXXX
 */
const CONFIG = {
  whatsappNumber: "59170207287",
  supportPhone: "+59170207287"
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
  initPriorityShortcuts();
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

/* Desplazamiento suave entre secciones */
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

      // Mantiene la navegación identificable sin añadir una entrada al historial.
      history.replaceState(null, "", selector);
    });
  });
}

/* Los botones de maquinaria y soporte seleccionan una prioridad */
function initPriorityShortcuts() {
  const prioritySelect = document.getElementById("priority");

  if (!prioritySelect) return;

  document.querySelectorAll("[data-priority]").forEach((link) => {
    link.addEventListener("click", () => {
      const priority = link.dataset.priority;

      const optionExists = Array.from(prioritySelect.options).some(
        (option) => option.value === priority
      );

      if (!optionExists) return;

      prioritySelect.value = priority;
      prioritySelect.dispatchEvent(
        new Event("change", { bubbles: true })
      );
    });
  });
}

/* Formulario de contacto y generación de WhatsApp */
function initContactForm() {
  const form = document.getElementById("contact-form");

  if (!form) return;

  const fields = {
    name: document.getElementById("contact-name"),
    company: document.getElementById("company"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email"),
    priority: document.getElementById("priority"),
    details: document.getElementById("details"),
    consent: document.getElementById("consent")
  };

  const errors = {
    name: document.getElementById("name-error"),
    company: document.getElementById("company-error"),
    phone: document.getElementById("phone-error"),
    email: document.getElementById("email-error"),
    priority: document.getElementById("priority-error"),
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

  // Limpiar errores mientras el usuario corrige los campos.
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
    const phone = fields.phone.value.trim();
    const email = fields.email.value.trim();
    const priority = fields.priority.value;

    if (name.length < 2 || name.length > 100) {
      invalidate(
        "name",
        "Ingresa un nombre válido de entre 2 y 100 caracteres."
      );
    }

    if (company.length < 2 || company.length > 150) {
      invalidate(
        "company",
        "Ingresa el nombre de la empresa o negocio."
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
        "Ingresa un teléfono válido, incluyendo el código de país si corresponde."
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      email.length > 150 ||
      !emailPattern.test(email)
    ) {
      invalidate(
        "email",
        "Ingresa una dirección de correo electrónico válida."
      );
    }

    const allowedPriorities = Array.from(fields.priority.options)
      .map((option) => option.value)
      .filter(Boolean);

    if (!allowedPriorities.includes(priority)) {
      invalidate(
        "priority",
        "Selecciona una de las áreas de atención disponibles."
      );
    }

    if (!fields.consent.checked) {
      invalidate(
        "consent",
        "Autoriza el uso de tus datos para gestionar la solicitud."
      );
    }

    if (firstInvalid) {
      firstInvalid.focus();
      setStatus(
        "Revisa los campos señalados antes de continuar.",
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
        "Configura el número corporativo de WhatsApp antes de utilizar el formulario.",
        "error"
      );
      return;
    }

    const data = {
      name: fields.name.value.trim(),
      company: fields.company.value.trim(),
      phone: fields.phone.value.trim(),
      email: fields.email.value.trim(),
      priority: fields.priority.value,
      details: fields.details.value.trim()
    };

    const message = buildUrgentMessage(data);
    const whatsappURL =
      `https://wa.me/${CONFIG.whatsappNumber}?text=` +
      encodeURIComponent(message);

    /*
     * Abrir la ventana durante el evento de envío ayuda a evitar
     * que el navegador la bloquee como una ventana emergente.
     */
    const whatsappWindow = window.open(
      whatsappURL,
      "_blank"
    );

    if (whatsappWindow) {
      // Impide que la nueva pestaña pueda manipular la página de origen.
      whatsappWindow.opener = null;

      setStatus(
        "WhatsApp se ha abierto con tu solicitud preparada. Confirma el envío en la aplicación.",
        "success"
      );
    } else {
      // Alternativa cuando el navegador bloquea las ventanas emergentes.
      setStatus(
        "El navegador bloqueó la apertura automática. Utiliza el enlace para continuar.",
        "error"
      );

      if (status) {
        const fallbackLink = document.createElement("a");

        fallbackLink.href = whatsappURL;
        fallbackLink.target = "_blank";
        fallbackLink.rel = "noopener noreferrer";
        fallbackLink.textContent = "Abrir solicitud en WhatsApp";

        status.appendChild(document.createTextNode(" "));
        status.appendChild(fallbackLink);
      }
    }
  });
}

/* Mensaje urgente con los datos principales del solicitante */
function buildUrgentMessage(data) {
  const lines = [
    `URGENTE: Hola, mi nombre es ${data.name} de la empresa ${data.company}.`,
    `Requiero atención en el área de ${data.priority}.`,
    `Mi teléfono de contacto es ${data.phone}.`
  ];

  // Información adicional opcional, sin alterar el mensaje principal.
  if (data.email) {
    lines.push(`Correo electrónico: ${data.email}`);
  }

  if (data.details) {
    lines.push(`Detalle del requerimiento: ${data.details}`);
  }

  return lines.join("\n");
}

/* Enlaces directos de WhatsApp y llamada */
function initContactChannels() {
  const whatsappLink = document.getElementById("whatsapp-contact");
  const phoneLink = document.getElementById("phone-contact");

  const validWhatsApp = /^\d{8,15}$/.test(CONFIG.whatsappNumber);

  if (whatsappLink && validWhatsApp) {
    whatsappLink.href = `https://wa.me/${CONFIG.whatsappNumber}`;
  }

  if (phoneLink) {
    const phoneDigits = CONFIG.supportPhone.replace(/\D/g, "");

    if (phoneDigits.length >= 8 && phoneDigits.length <= 15) {
      phoneLink.href = `tel:+${phoneDigits}`;
    } else {
      phoneLink.href = "#contacto";
      phoneLink.removeAttribute("target");
      phoneLink.removeAttribute("rel");
    }
  }
}

/* Año actualizado automáticamente */
function initFooterYear() {
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
}
