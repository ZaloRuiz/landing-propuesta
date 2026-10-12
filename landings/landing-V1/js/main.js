
"use strict";

/*
 * CONFIGURACIÓN CORPORATIVA
 * Sustituye estos valores por los datos reales de la empresa.
 *
 * WhatsApp: código de país + número, sin +, espacios ni guiones.
 * Ejemplo Bolivia: 59170207287
 */
const CONFIG = {
  whatsappNumber: "59170207287",
  email: "ventas@tuempresa.com"
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
  initContactForm();
  initInterestShortcuts();
  initContactChannels();
  initFooterYear();
});

/* =========================================
   MENÚ RESPONSIVE
========================================= */

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("main-navigation");

  if (!toggle || !navigation) return;

  function closeMenu() {
    navigation.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú de navegación");
  }

  toggle.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
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
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches ? "auto" : "smooth",
        block: "start"
      });

      // Actualiza la dirección sin provocar un salto brusco.
      if (history.replaceState) {
        history.replaceState(null, "", targetId);
      }
    });
  });
}

/* =========================================
   FORMULARIO Y VALIDACIÓN
========================================= */

function initContactForm() {
  const form = document.getElementById("contact-form");

  if (!form) return;

  const fields = {
    name: document.getElementById("full-name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    interest: document.getElementById("interest"),
    details: document.getElementById("details"),
    consent: document.getElementById("consent")
  };

  const status = document.getElementById("form-status");
  const submitButton = document.getElementById("whatsapp-submit");

  const errors = {
    name: document.getElementById("name-error"),
    email: document.getElementById("email-error"),
    phone: document.getElementById("phone-error"),
    interest: document.getElementById("interest-error"),
    consent: document.getElementById("consent-error")
  };

  /*
   * Limpia un error individual cuando el usuario
   * modifica el campo correspondiente.
   */
  function clearError(fieldName) {
    const field = fields[fieldName];
    const error = errors[fieldName];

    if (error) error.textContent = "";

    if (field) field.removeAttribute("aria-invalid");

    if (fieldName === "phone") {
      const wrapper = field.closest(".phone-input");
      if (wrapper) wrapper.removeAttribute("aria-invalid");
    }
  }

  function showError(fieldName, message) {
    const field = fields[fieldName];
    const error = errors[fieldName];

    if (error) error.textContent = message;

    if (field) field.setAttribute("aria-invalid", "true");

    if (fieldName === "phone" && field) {
      const wrapper = field.closest(".phone-input");
      if (wrapper) wrapper.setAttribute("aria-invalid", "true");
    }
  }

  function setStatus(message, type = "") {
    status.textContent = message;
    status.className = "mt-4 text-sm leading-6";

    if (type) {
      status.classList.add(`status-${type}`);
    }
  }

  Object.keys(fields).forEach((fieldName) => {
    const field = fields[fieldName];

    if (!field) return;

    field.addEventListener("input", () => {
      clearError(fieldName);
      setStatus();
    });

    field.addEventListener("change", () => {
      clearError(fieldName);
      setStatus();
    });
  });

  function validateForm() {
    Object.keys(errors).forEach(clearError);
    setStatus();

    let firstInvalid = null;

    function invalidate(fieldName, message) {
      showError(fieldName, message);

      if (!firstInvalid) {
        firstInvalid = fields[fieldName];
      }
    }

    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const phone = fields.phone.value.trim();
    const interest = fields.interest.value;

    if (name.length < 2 || name.length > 100) {
      invalidate(
        "name",
        "Ingrese su nombre completo (entre 2 y 100 caracteres)."
      );
    }

    // Comprobación básica de formato de correo.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      email.length > 150 ||
      !emailPattern.test(email)
    ) {
      invalidate("email", "Ingrese un correo electrónico válido.");
    }

    /*
     * Permite formatos como:
     * +591 70000000
     * 591-70000000
     * 70000000
     *
     * Se comprueba la cantidad de dígitos.
     * Si el número no tiene código de país, se advierte
     * al usuario para evitar dirigir mal la consulta.
     */
    const phoneDigits = phone.replace(/\D/g, "");

    if (!/^\+?[\d\s().-]+$/.test(phone) ||
        phoneDigits.length < 8 ||
        phoneDigits.length > 15) {
      invalidate(
        "phone",
        "Ingrese un teléfono válido con su código de país."
      );
    }

    if (!interest) {
      invalidate(
        "interest",
        "Seleccione el producto o servicio de su interés."
      );
    }

    if (!fields.consent.checked) {
      invalidate(
        "consent",
        "Debe autorizar el uso de sus datos para continuar."
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
        "El número corporativo de WhatsApp aún no está configurado. Contacte a la empresa por correo.",
        "error"
      );

      return;
    }

    const data = {
      name: fields.name.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      interest: fields.interest.value,
      details: fields.details.value.trim()
    };

    const message = buildWhatsAppMessage(data);

    const whatsappURL =
      `https://wa.me/${CONFIG.whatsappNumber}` +
      `?text=${encodeURIComponent(message)}`;

    /*
     * Se abre directamente desde el evento del usuario.
     * WhatsApp mostrará el mensaje preparado; el usuario
     * deberá confirmar su envío.
     */
    const newWindow = window.open(
      whatsappURL,
      "_blank",
      "noopener,noreferrer"
    );

    if (newWindow) {
      setStatus(
        "Se preparó su consulta. Revise la ventana de WhatsApp y confirme el envío.",
        "success"
      );
    } else {
      setStatus(
        "El navegador bloqueó la ventana emergente. Utilice el enlace alternativo que aparece a continuación.",
        "error"
      );

      // Alternativa accesible si el navegador bloquea la ventana.
      const fallback = document.createElement("a");
      fallback.href = whatsappURL;
      fallback.target = "_blank";
      fallback.rel = "noopener noreferrer";
      fallback.className = "card-link mt-3";
      fallback.textContent = "Abrir WhatsApp con mi consulta →";

      status.appendChild(document.createElement("br"));
      status.appendChild(fallback);
    }
  });
}

/* =========================================
   GENERACIÓN DEL MENSAJE
========================================= */

function buildWhatsAppMessage(data) {
  const lines = [
    "SOLICITUD DE INFORMACIÓN COMERCIAL",
    "",
    `Nombre: ${data.name}`,
    `Correo: ${data.email}`,
    `Teléfono: ${data.phone}`,
    "",
    `Interés: ${data.interest}`
  ];

  if (data.details) {
    lines.push("", "Detalles adicionales:", data.details);
  }

  lines.push(
    "",
    "Solicito información sobre disponibilidad, características técnicas y condiciones comerciales.",
    "",
    "Mensaje enviado desde la página web corporativa."
  );

  return lines.join("\n");
}

/* =========================================
   ATAJOS DESDE LAS TARJETAS
========================================= */

function initInterestShortcuts() {
  const interestSelect = document.getElementById("interest");
  const nameInput = document.getElementById("full-name");

  if (!interestSelect) return;

  document.querySelectorAll("[data-interest]").forEach((link) => {
    link.addEventListener("click", () => {
      const interest = link.dataset.interest;

      const matchingOption = Array.from(
        interestSelect.options
      ).find((option) => option.value === interest);

      if (matchingOption) {
        interestSelect.value = matchingOption.value;
        interestSelect.dispatchEvent(new Event("change", {
          bubbles: true
        }));
      }

      // El enlace ya lleva a #contacto mediante su href.
      // El foco ayuda a continuar la consulta.
      if (nameInput) {
        window.setTimeout(() => nameInput.focus(), 350);
      }
    });
  });
}

/* =========================================
   CORREO Y CANALES DE CONTACTO
========================================= */

function initContactChannels() {
  const emailLink = document.getElementById("contact-email-link");
  const emailButton = document.getElementById("email-submit");
  const phoneLink = document.getElementById("contact-phone-link");
  const whatsappFloat = document.getElementById("whatsapp-float");
  const form = document.getElementById("contact-form");

  if (emailLink) {
    emailLink.href = `mailto:${CONFIG.email}`;
    emailLink.textContent = CONFIG.email;
  }

  function buildEmailURL() {
    const subject = "Consulta comercial desde la página web";
    const bodyLines = [
      "Hola, deseo recibir información comercial.",
      ""
    ];

    if (form) {
      const name = document.getElementById("full-name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const interest = document.getElementById("interest").value;
      const details = document.getElementById("details").value.trim();

      if (name) bodyLines.push(`Nombre: ${name}`);
      if (email) bodyLines.push(`Correo: ${email}`);
      if (phone) bodyLines.push(`Teléfono: ${phone}`);
      if (interest) bodyLines.push(`Interés: ${interest}`);

      if (details) {
        bodyLines.push("", "Detalles adicionales:", details);
      }
    }

    bodyLines.push("", "Quedo atento/a a su respuesta.");

    return `mailto:${CONFIG.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyLines.join("\n"))}`;
  }

  if (emailButton) {
    emailButton.href = buildEmailURL();

    emailButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = buildEmailURL();
    });

    if (form) {
      form.addEventListener("input", () => {
        emailButton.href = buildEmailURL();
      });

      form.addEventListener("change", () => {
        emailButton.href = buildEmailURL();
      });
    }
  }

  const validNumber = /^\d{8,15}$/.test(CONFIG.whatsappNumber);

  const directWhatsAppURL = validNumber
    ? `https://wa.me/${CONFIG.whatsappNumber}`
    : "#contacto";

  if (phoneLink) {
    phoneLink.href = directWhatsAppURL;

    if (!validNumber) {
      phoneLink.removeAttribute("target");
    }
  }

  if (whatsappFloat) {
    whatsappFloat.href = directWhatsAppURL;

    if (!validNumber) {
      whatsappFloat.removeAttribute("target");
      whatsappFloat.setAttribute(
        "aria-label",
        "Configurar el contacto corporativo de WhatsApp"
      );
    }
  }
}

/* =========================================
   AÑO AUTOMÁTICO DEL FOOTER
========================================= */

function initFooterYear() {
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
