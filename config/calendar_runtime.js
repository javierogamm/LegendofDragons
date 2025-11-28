/***** =========================
 * CALENDARIO GLOBAL (Legends of Dragons)
 * - Avanza con acciones (movimiento / combate)
 * - 4 estaciones (Primavera, Verano, Otoño, Invierno)
 * - Muestra Día / Mes / Estación en pantalla
 * ========================== */
(function (global) {
  "use strict";

  const ESTACIONES = ["🌸 Brotix", "☀️ Ardentia", "🍂 Ocasul", "❄️ Frosta"];
  const DIAS_POR_MES = 25;
  const MESES_POR_ESTACION = 3;
  const TOTAL_MESES = 12;

  // Estado persistente en ventana global
  const RUNTIME = (global.__CALENDAR_STATE = global.__CALENDAR_STATE || {
    dia: 1,
    mes: 1,
    anio: 1
  });

  /** 🔹 Devuelve estación actual */
  function getEstacion() {
    const idx = Math.floor((RUNTIME.mes - 1) / MESES_POR_ESTACION);
    return ESTACIONES[idx] || ESTACIONES[0];
  }

    /** 🔹 Lista de callbacks al avanzar día */
  const listeners = [];

  /** 🔹 Avanza el calendario (por defecto 1 día) */
 function avanzar(dias = 1) {
  RUNTIME.dia += dias;

  while (RUNTIME.dia > DIAS_POR_MES) {
    RUNTIME.dia -= DIAS_POR_MES;
    RUNTIME.mes++;
    if (RUNTIME.mes > TOTAL_MESES) {
      RUNTIME.mes = 1;
      RUNTIME.anio++;
    }
  }

  actualizarDisplay();

  // 🔔 Notificar a todos los listeners (por ejemplo, repelente)
  if (Calendario._listeners) {
    Calendario._listeners.forEach(fn => {
      try {
        fn(RUNTIME);
      } catch (error) {
        console.warn("⚠️ Error en listener del calendario:", error);
      }
    });
  }
}

  /** 🔹 Permite registrar funciones que se ejecutan al avanzar día */
  function onAvanzarDia(fn) {
    if (typeof fn === "function") listeners.push(fn);
  }


  /** 🔹 Formato de texto */
  function texto() {
    return `📅 Mes ${RUNTIME.mes} · Día ${RUNTIME.dia}  (${getEstacion()})`;
  }

  /** 🔹 Actualiza el texto visible en la UI */
  function actualizarDisplay() {
    const div = document.getElementById("calendarDisplay");
    if (div) div.textContent = texto();
  }

  /** 🔹 Reinicio manual */
  function reset() {
    RUNTIME.dia = 1;
    RUNTIME.mes = 1;
    RUNTIME.anio = 1;
    actualizarDisplay();
  }

  /** 🔹 Inicialización al cargar */
  window.addEventListener("load", () => {
    setTimeout(actualizarDisplay, 300);
  });

    // API pública
  global.Calendario = {
    avanzar,
    texto,
    getEstacion,
    reset,
    _state: RUNTIME,
    actualizarDisplay,
onAvanzarDia(callback) {
  if (typeof callback !== "function") return () => {};
  this._listeners = this._listeners || [];
  this._listeners.push(callback);
  return () => {
    this._listeners = this._listeners.filter(fn => fn !== callback);
  };
},
clearAllListeners() {
  console.log("🧹 Limpiando todos los listeners del calendario...");
  this._listeners = [];
},

  };
  /***** =========================
 * INCUBACIÓN DE HUEVOS
 * ========================== */

// 🔹 Estado global de huevos incubando
window.huevosIncubando = window.huevosIncubando || [];

// 🔹 Al avanzar día, reducir los días restantes
Calendario.onAvanzarDia(() => {
  if (!Array.isArray(window.huevosIncubando)) return;

  window.huevosIncubando.forEach(huevo => {
    if (huevo.diasRestantes > 0) {
      huevo.diasRestantes--;
    }
  });

  // 🐣 Verificar eclosiones
  const eclosionados = window.huevosIncubando.filter(h => h.diasRestantes === 0 && !h.notificado);
  eclosionados.forEach(huevo => {
    huevo.notificado = true;
    Calendario.mostrarAvisoEclosion(huevo.tipo);
  });

  // 🔢 Actualizar contador visual del HTML
  const contador = document.getElementById("eggCounter");
  if (contador) {
    const activos = window.huevosIncubando.filter(h => h.diasRestantes > 0);
    contador.textContent = `🥚 ${activos.length}`;
  }
});

// 🔹 Mostrar aviso de eclosión
Calendario.mostrarAvisoEclosion = function(tipo) {
  const aviso = document.createElement("div");
  aviso.style.position = "absolute";
  aviso.style.top = "60px";
  aviso.style.left = "50%";
  aviso.style.transform = "translateX(-50%)";
  aviso.style.background = "#222";
  aviso.style.color = "#ffd700";
  aviso.style.padding = "10px 20px";
  aviso.style.border = "2px solid #fff";
  aviso.style.borderRadius = "10px";
  aviso.style.fontSize = "20px";
  aviso.style.fontFamily = "'MedievalSharp', cursive";
  aviso.style.zIndex = 9999;
  aviso.textContent = `🐣 ¡Ha nacido un dragón de ${tipo}!`;

  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), 4000);
};
// === Mostrar contador al cargar ===
window.addEventListener("load", () => {
  const contador = document.getElementById("eggCounter");
  if (contador) {
    const activos = (window.huevosIncubando || []).filter(h => h.diasRestantes > 0);
    contador.textContent = `🥚 ${activos.length}`;
  }

   Calendario.onAvanzarDia(() => {
    const nuevaEstacion = Calendario.getEstacion();
    if (Calendario._ultimaEstacion !== nuevaEstacion) {
      console.log(`🍃 Cambio de estación detectado: ${Calendario._ultimaEstacion} → ${nuevaEstacion}`);
      Calendario._ultimaEstacion = nuevaEstacion;
      // 🔹 Ya no llamamos a SceneWorld.onCambioEstacion()
      // Solo mostramos en consola para referencia
    }
  });
}); // ✅ Cierra correctamente el addEventListener("load")
// =======================================================
// 🔄 BLOQUE FIJO — REENGANCHE AUTOMÁTICO DE MISIONES PASIVAS
// =======================================================
(function forzarReengancheMisiones() {
  let intentos = 0;
  const timer = setInterval(() => {
    intentos++;
    try {
      // Requisitos mínimos
      if (!window.Calendario || typeof Calendario.onAvanzarDia !== "function") return;
      if (!Array.isArray(window.misionesPasivas) || window.misionesPasivas.length === 0) return;
      if (window._mp_listenerOn) return; // Ya enganchado

      console.log("🧩 Reenganche automático: conectando Misiones Pasivas al Calendario...");

      // Asegurar globals
      if (window.SceneMisionesPasivas && typeof SceneMisionesPasivas.ensureGlobals === "function") {
        SceneMisionesPasivas.ensureGlobals();
      }

      // Vincular al avance de día
      Calendario.onAvanzarDia(() => {
        const lista = window.misionesPasivas || [];
        for (const m of lista) {
          if (m.estado === "En curso") {
            m.diasRestantes = Math.max(0, (m.diasRestantes || 0) - 1);
            if (m.diasRestantes === 0) {
              // Marcar como completada o pendiente
              m.estado = "PendienteBotin";
              console.log(`📜 Misión ${m.titulo || m.id} completada automáticamente.`);
            }
          }
        }

        // Spawner cada 5 días
        if (typeof window._mp_spawnCountdown === "number") {
          window._mp_spawnCountdown--;
          if (window._mp_spawnCountdown <= 0) {
            if (SceneMisionesPasivas?.prototype?._spawnLoteMisiones) {
              SceneMisionesPasivas.prototype._spawnLoteMisiones.call({ _toast: console.log }, 5);
              console.log("🪶 Nuevo lote de misiones pasivas generado.");
            }
            window._mp_spawnCountdown = 5;
          }
        }
      });

      window._mp_listenerOn = true;
      clearInterval(timer);
      console.log("✅ Misiones Pasivas reenganchadas correctamente al Calendario.");
    } catch (err) {
      console.warn("⚠️ Error al intentar reenganchar Misiones Pasivas:", err);
    }

    // tras 10 segundos dejamos de intentarlo
    if (intentos > 20) {
      clearInterval(timer);
      console.warn("⚠️ No se pudo reenganchar Misiones Pasivas tras 10s.");
    }
  }, 500);
})();

})(window); // ✅ Cierra correctamente la función autoejecutable principal