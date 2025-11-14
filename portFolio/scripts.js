document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menuFijo");
  const boton = document.getElementById("hamburguesa");
  const secciones = document.querySelectorAll("section");
  const enlaces = document.querySelectorAll(".menuFijo a");

  // Abrir / cerrar menú
  boton.addEventListener("click", () => menu.classList.toggle("activo"));

  // Cerrar menú al hacer clic en un enlace
  enlaces.forEach((link) =>
    link.addEventListener("click", () => menu.classList.remove("activo"))
  );

  // Resaltar enlace según scroll
  window.addEventListener("scroll", () => {
    const scrollPos = window.scrollY + 100;
    let seccionActivaId = null;

    secciones.forEach((sec) => {
      if (
        scrollPos >= sec.offsetTop &&
        scrollPos < sec.offsetTop + sec.offsetHeight
      ) {
        seccionActivaId = sec.id;
      }
    });

    enlaces.forEach((enlace) =>
      enlace.classList.toggle(
        "activo",
        enlace.getAttribute("href") === `#${seccionActivaId}`
      )
    );

    // Animación de secciones
    const trigger = window.innerHeight * 0.8;
    secciones.forEach((sec) => {
      if (sec.getBoundingClientRect().top < trigger) {
        sec.classList.add("visible");
      }
    });
  });
});

// ---- Vvalidadcion del formulario----
const form = document.querySelector("form");

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const [nombre, email, mensaje] = [
    form.querySelector('input[type="text"]').value.trim(),
    form.querySelector('input[type="email"]').value.trim(),
    form.querySelector("textarea").value.trim(),
  ];

  if (!nombre || !email || !mensaje)
    return alert("Por favor, completa todos los campos 📩");
  if (!email.includes("@") || !email.includes("."))
    return alert("Por favor, ingresa un correo válido!!!");

  alert("¡Mensaje enviado correctamente!!!!");
  form.reset();
});
