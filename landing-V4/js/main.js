
"use strict";

/*
 * CONFIGURACIÓN DE CONTACTO
 *
 * Reemplaza estos datos antes de publicar la landing.
 * WhatsApp debe incluir código de país y solo números.
 */
const CONFIG = {
  companyName: "IndustrialPro",
  whatsappNumber: "59170207287",
  corporateEmail: "comercial@empresa.com"
};

const INTEREST_LABELS = {
  montacargas: "Montacargas industriales",
  maquinaria: "Equipamiento vehicular industrial",
  soporte: "Soporte postventa",
  repuestos: "Repuestos"
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
  initInterestShortcuts();
  initContactForm();
  initModal();
  initFooterYear();
});

/* -----------------------------------------------
   MENÚ MÓVIL
------------------------------------------------ */

function initMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const navigation = document.getElementById("main-navigation");
  const openIcon = document.getElementById("menu-open-icon");
  const closeIcon = document.getElementById("menu-close-icon");

  if (!toggle || !navigation) return;

  function setMenuOpen(isOpen) {
    navigation.classList.toggle("is-open", isOpen);

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú"
    );

    openIcon?.classList.toggle("hidden", isOpen);
    closeIcon?.classList.toggle("hidden", !isOpen);
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") !== "true";
    setMenuOpen(isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (
      toggle.getAttribute("aria-expanded") === "true" &&
      !navigation.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      setMenuOpen(false);
    }
  });
}

/* -----------------------------------------------
   DESPLAZAMIENTO SUAVE
------------------------------------------------ */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches ? "auto" : "smooth",
        block: "start"
      });

      if (window.location.hash !== href) {
        history.replaceState(null, "", href);
      }
    });
  });
}

/* -----------------------------------------------
   ACCESOS DESDE LAS TARJETAS
------------------------------------------------ */

function initInterestShortcuts() {
  document.querySelectorAll("[data-interest]").forEach((link) => {
    link.addEventListener("click", () => {
      const interest = link.dataset.interest;

      const radio = document.querySelector(
        `input[name="interest"][value="${interest}"]`
      );

      if (radio) {
        radio.checked = true;
      }
    });
  });
}

/* -----------------------------------------------
   FORMULARIO PRINCIPAL
------------------------------------------------ */

function initContactForm() {
  const form = document.getElementById("contact-form");
  const destination = document.getElementById("contact-destination");
  const destinationError = document.getElementById("destination-error");
  const interestError = document.getElementById("interest-error");

  if (!form || !destination) return;

  destination.addEventListener("input", () => {
    destination.removeAttribute("aria-invalid");

    if (destinationError) {
      destinationError.textContent = "";
    }
  });

  form.querySelectorAll('input[name="interest"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (interestError) {
        interestError.textContent = "";
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const destinationValue = destination.value.trim();
    const selectedInterest = form.querySelector(
      'input[name="interest"]:checked'
    );

    clearErrors();

    if (!selectedInterest) {
      if (interestError) {
        interestError.textContent = "Selecciona un área de interés.";
      }

      form.querySelector('input[name="interest"]')?.focus();
      return;
    }

    if (!destinationValue) {
      showDestinationError(
        "Introduce tu WhatsApp o correo corporativo."
      );
      destination.focus();
      return;
    }

    const contactType = detectContactType(destinationValue);

    if (contactType === "invalid") {
      showDestinationError(
        "Introduce un correo válido o un número telefónico con código de país."
      );
      destination.focus();
      return;
    }

    const request = {
      contact: destinationValue,
      contactType,
      interest: selectedInterest.value,
      interestLabel: INTEREST_LABELS[selectedInterest.value]
    };

    if (contactType === "phone") {
      handleWhatsAppRequest(request);
      return;
    }

    handleEmailRequest(request);
  });

  function clearErrors() {
    destination.removeAttribute("aria-invalid");

    if (destinationError) {
      destinationError.textContent = "";
    }

    if (interestError) {
      interestError.textContent = "";
    }
  }

  function showDestinationError(message) {
    destination.setAttribute("aria-invalid", "true");

    if (destinationError) {
      destinationError.textContent = message;
    }
  }
}

/* -----------------------------------------------
   DETECCIÓN DEL CONTACTO
------------------------------------------------ */

function detectContactType(value) {
  const input = value.trim();

  /*
   * Validación básica de email:
   * usuario@dominio.extensión
   */
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (emailPattern.test(input) && input.length <= 150) {
    return "email";
  }

  /*
   * Teléfono internacional o local.
   * Se permiten espacios, +, paréntesis y guiones.
   */
  const phonePattern = /^\+?[\d\s().-]+$/;
  const digits = input.replace(/\D/g, "");

  if (
    phonePattern.test(input) &&
    digits.length >= 7 &&
    digits.length <= 15
  ) {
    return "phone";
  }

  return "invalid";
}

/* -----------------------------------------------
   SOLICITUD POR WHATSAPP
------------------------------------------------ */

function handleWhatsAppRequest(request) {
  const whatsappNumber = CONFIG.whatsappNumber.replace(/\D/g, "");

  if (
    !whatsappNumber ||
    whatsappNumber.length < 8 ||
    whatsappNumber === "59170000000"
  ) {
    openSuccessModal({
      title: "Contacto pendiente",
      message:
        "El canal de WhatsApp todavía no está configurado. Por favor, intenta más tarde o configura el número comercial en js/main.js.",
      showEmailAction: false
    });
    return;
  }

  const message = buildRequestMessage(request);

  const whatsappURL =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  /*
   * La apertura se realiza durante la interacción del usuario,
   * para reducir el riesgo de bloqueo del navegador.
   */
  const whatsappWindow = window.open(
    whatsappURL,
    "_blank",
    "noopener,noreferrer"
  );

  if (!whatsappWindow) {
    openSuccessModal({
      title: "Continúa por WhatsApp",
      message:
        "El navegador bloqueó la nueva ventana. Permite las ventanas emergentes para continuar con tu solicitud.",
      showEmailAction: false
    });
    return;
  }

  openSuccessModal({
    title: "Solicitud preparada",
    message:
      `Tu consulta sobre ${request.interestLabel.toLowerCase()} está preparada en WhatsApp. Revisa el mensaje y pulsa Enviar para completar el contacto.`,
    showEmailAction: false
  });
}

/* -----------------------------------------------
   SOLICITUD POR CORREO
------------------------------------------------ */

function handleEmailRequest(request) {
  const corporateEmail = CONFIG.corporateEmail.trim();

  if (!isConfiguredCorporateEmail(corporateEmail)) {
    openSuccessModal({
      title: "Contacto pendiente",
      message:
        "El correo comercial todavía no está configurado. Actualiza corporateEmail en js/main.js antes de publicar la página.",
      showEmailAction: false
    });
    return;
  }

  const subject =
    `Consulta comercial | ${request.interestLabel}`;

  const body = buildRequestMessage(request);

  const mailtoURL = new URL(`mailto:${corporateEmail}`);
  mailtoURL.searchParams.set("subject", subject);
  mailtoURL.searchParams.set("body", body);

  const mailtoLink = document.getElementById("modal-email-link");

  if (mailtoLink) {
    mailtoLink.href = mailtoURL.toString();
    mailtoLink.textContent = "Abrir correo";
    mailtoLink.classList.remove("hidden");
  }

  openSuccessModal({
    title: "Un paso más.",
    message:
      `Preparamos tu consulta sobre ${request.interestLabel.toLowerCase()}. Abre tu aplicación de correo para revisar el mensaje y enviarlo a nuestro equipo.`,
    showEmailAction: true
  });
}

function isConfiguredCorporateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return (
    emailPattern.test(email) &&
    email !== "comercial@empresa.com"
  );
}

/* -----------------------------------------------
   MENSAJE COMERCIAL
------------------------------------------------ */

function buildRequestMessage(request) {
  return [
    `SOLICITUD COMERCIAL — ${CONFIG.companyName}`,
    "",
    "Estimado equipo comercial:",
    "",
    "Me interesa recibir asesoramiento sobre la siguiente área:",
    request.interestLabel,
    "",
    "DATOS DE CONTACTO",
    `${request.contactType === "phone" ? "WhatsApp" : "Correo"}: ${request.contact}`,
    "",
    "Agradeceré que un asesor me contacte para ampliar la información y conocer las opciones disponibles.",
    "",
    "Saludos cordiales."
  ].join("\n");
}

/* -----------------------------------------------
   MODAL
------------------------------------------------ */

function initModal() {
  const modal = document.getElementById("success-modal");
  const closeButton = document.getElementById("modal-close");
  const doneButton = document.getElementById("modal-done");

  if (!modal) return;

  function closeModal() {
    if (modal.open) {
      modal.close();
    }
  }

  closeButton?.addEventListener("click", closeModal);
  doneButton?.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  modal.addEventListener("close", () => {
    document.getElementById("contact-destination")?.focus({
      preventScroll: true
    });
  });
}

function openSuccessModal({
  title,
  message,
  showEmailAction
}) {
  const modal = document.getElementById("success-modal");
  const titleElement = document.getElementById("modal-title");
  const messageElement = document.getElementById("modal-message");
  const emailLink = document.getElementById("modal-email-link");

  if (!modal) {
    window.alert(message);
    return;
  }

  if (titleElement) {
    titleElement.textContent = title;
  }

  if (messageElement) {
    messageElement.textContent = message;
  }

  if (emailLink) {
    emailLink.classList.toggle("hidden", !showEmailAction);
  }

  if (!modal.open) {
    modal.showModal();
  }
}

/* -----------------------------------------------
   FOOTER
------------------------------------------------ */

function initFooterYear() {
  const year = document.getElementById("current-year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
}
