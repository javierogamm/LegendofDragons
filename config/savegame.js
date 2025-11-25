/* ==========================================================
 * SAVEGAME.JS – Sistema independiente de guardado/carga
 * ==========================================================
 * ✦ No afecta a ninguna otra parte del juego.
 * ✦ SOLO responde a los botones "💾 Guardar" y "📂 Cargar".
 * ✦ No carga automáticamente al inicio.
 * ✦ Guarda absolutamente todo el estado global del juego.
 * ========================================================== */

const SaveGame = (() => {

  /** 🔹 Crea el objeto completo de estado actual */
  function getGameState() {
    const RUNTIME = window.__RUNTIME_STATE || {};
// 🧩 FIX: sincronizar siempre con el estado actual de Misiones antes de guardar
let QUESTS = window.__QUESTS_STATE || { activas: [], completadas: [] };
if (typeof Misiones !== "undefined" && Misiones.estado) {
  const estadoActual = Misiones.estado();
  if (estadoActual && Array.isArray(estadoActual.activas)) {
    QUESTS = estadoActual;
    window.__QUESTS_STATE = estadoActual; // mantener coherencia global
  }
}
    return {
      escena: getEscenaActiva(),
      dragon1: window.dragon1 || null,
      dragon2: window.dragon2 || null,
      dragonesJugador: window.dragonesJugador || [],
      dragonesEnemigos: window.dragonesEnemigos || [],
      dragocodex: window.dragocodex || [],
      coleccionJugador: window.coleccionJugador || [],
      worldPos: window.worldPos || null,
      ultimaEscena: window.ultimaEscena || null,
      ciudadSeleccionada: window.ciudadSeleccionada || null,
      retornoIsla: window.retornoIsla || null,
      monedas: window.monedas || 0,
      jugador: window.jugador || { nombre: "Jugador", nivel: 1, exp: 0, oro: 0, gemas: 0 },
      inventarioJugador: window.inventarioJugador || [],
      misionesActivas: QUESTS.activas,
      misionesCompletadas: QUESTS.completadas,
      ajustes: window.ajustesJuego || { musica: true, sonido: true, dificultad: "normal" },

      // ===== Runtime de islas / mundo =====
      runtimeIsla: {
        meta: RUNTIME.meta || {},
        eventosCompletados: serializeMap(RUNTIME.eventosCompletados),
        eventosCompletadosGlobal: RUNTIME.eventosCompletadosGlobal || {},
        metaEventos: RUNTIME.meta || {},
        ultimaPosIsla: serializeMap(RUNTIME.ultimaPosIsla),
        monolitosGlobalesTodos: RUNTIME.monolitosGlobalesTodos || [],
        islasContadas: RUNTIME.islasContadas || {},
        cacheIslas: RUNTIME.cacheIslas || null,
        cacheParams: RUNTIME.cacheParams || null,
        seedWorld: window.seedWorld || RUNTIME.seedWorld || null
      },

      // Copia adicional por compatibilidad
      eventosCompletados: serializeMap(RUNTIME.eventosCompletados),

      // Otros estados globales
      islasCompletadas: window.islasCompletadas || [],
      eventosTerminados: window.eventosTerminados || [],
      nieblaPorIsla: window.nieblaPorIsla || {},
      dragonesDerrotadosPorIsla: window.dragonesDerrotadosPorIsla || {},
      recompensaPendiente: window.recompensaPendiente || null,
         // === Estado del calendario e incubaciones ===
      calendario: window.__CALENDAR_STATE || { dia: 1, mes: 1, anio: 1 },
   // === Estado del calendario e incubaciones ===
      calendario: window.__CALENDAR_STATE || { dia: 1, mes: 1, anio: 1 },

      // 🥚 Huevos en incubación (con todos sus campos)
      huevosIncubando: Array.isArray(window.huevosIncubando)
        ? window.huevosIncubando.map(h => ({
            tipo: h.tipo || "Desconocido",
            diasRestantes: h.diasRestantes ?? 15,
            diasTotales: h.diasTotales ?? h.diasRestantes ?? 15,
            notificado: !!h.notificado,
            key: h.key || null
          }))
        : [],

      // 🐣 Dragones bebé del criadero
      dragonesBaby: Array.isArray(window.dragonesBaby)
        ? window.dragonesBaby.map(d => ({
            name: d.name,
            tipo: d.tipo,
            clase: d.clase,
            rareza: d.rareza,
            confianza: d.confianza ?? 0,
            img: d.img || null
          }))
        : [],


// 🪶 Misiones pasivas (guardar TODA la información)
// 🔥 CAMBIO: ya no guardamos misiones pasivas ni normales
misionesPasivas: [],
misionesActivas: [],
misionesCompletadas: [],
  
// 🧭 Modo Historia (StoryMode)
storyMode: Array.isArray(window.storyMode?.missions)
  ? window.storyMode.missions.map(m => ({
      id: m.id,
      title: m.title,
      trigger: m.trigger,
      state: m.state,
      rewards: m.rewards || [],
      requireLevel: m.requireLevel || null
    }))
  : [],

      fechaGuardado: new Date().toISOString()
    };
  }

  /** 🔹 Determina la escena activa */
  function getEscenaActiva() {
    if (!window.game || !window.game.scene) return "SceneSelector";
    const lista = [
      "SceneCombate", "SceneCombateTactico", "SceneMapa", "SceneWorld",
      "SceneSeleccionIsla", "ScenePoblado", "SceneColeccion",
      "SceneCiudad", "SceneChooseDragon"
    ];
    return lista.find(k => game.scene.isActive(k)) || "SceneSelector";
  }

  /** 🔹 Serializa Map → Objeto plano */
  function serializeMap(map) {
    if (!(map instanceof Map)) return map || {};
    const obj = {};
    for (let [k, v] of map.entries()) obj[k] = v instanceof Set ? Array.from(v) : v;
    return obj;
  }

  /** 🔹 Deserializa Objeto → Map */
  function deserializeMap(obj, toSet = false) {
    const map = new Map();
    for (let k in obj || {}) map.set(k, toSet ? new Set(obj[k]) : obj[k]);
    return map;
  }

  /* ==========================================================
   * 💾 GUARDAR PARTIDA (archivo + localStorage)
   * ========================================================== */
  function save() {
    try {
      const state = getGameState();
      const data = JSON.stringify(state, null, 2);

      // Descargar archivo
      const blob = new Blob([data], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "savegame.json";
      a.click();

      // Guardar también en localStorage
      localStorage.setItem("savegame_dragons", data);
      alert("✅ Partida guardada correctamente");
    } catch (err) {
      console.error("⚠️ Error al guardar partida:", err);
      alert("⚠️ Error al guardar partida (ver consola)");
    }
  }

  /* ==========================================================
   * 📂 CARGAR DESDE ARCHIVO
   * ========================================================== */
  function loadFromFile(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const state = JSON.parse(ev.target.result);
        apply(state);
        alert("📂 Partida cargada correctamente");
      } catch (err) {
        console.error("⚠️ Error al cargar partida:", err);
        alert("⚠️ Error al cargar partida (ver consola)");
      }
    };
    reader.readAsText(file);
  }

  /* ==========================================================
   * ♻️ APLICAR ESTADO DE PARTIDA (versión final completa)
   * ========================================================== */
  function apply(state) {
    if (!state) return;
    console.log("♻️ Aplicando savegame...");

    // ==========================================================
    // 🔹 Restaurar variables globales básicas
    // ==========================================================
    window.dragon1 = state.dragon1 || null;
    window.dragon2 = state.dragon2 || null;
    window.dragonesJugador = state.dragonesJugador || [];
    // ==========================================================
// 🐉 Normalizar dragones cargados (fix vida undefined, etc.)
// ==========================================================
if (Array.isArray(window.dragonesJugador)) {
  window.dragonesJugador.forEach(d => {
    // Vida
    if (typeof d.vida === "undefined" || d.vida === null) {
      d.vida = d.vidaMax ?? 100;
    }
    // Vida máxima
    if (typeof d.vidaMax === "undefined" || d.vidaMax === null) {
      d.vidaMax = d.vida ?? 100;
    }
    // Nivel por defecto
    if (typeof d.nivel === "undefined" || d.nivel === null) {
      d.nivel = 1;
    }
    // Rareza por defecto
    if (!d.rareza) d.rareza = "Común";
    // Tipo por seguridad
    if (!d.tipo) d.tipo = "Desconocido";
  });
  console.log(`✅ Dragones normalizados: ${window.dragonesJugador.length}`);
}

    window.dragonesEnemigos = state.dragonesEnemigos || [];
    window.dragocodex = state.dragocodex || [];
    window.coleccionJugador = state.coleccionJugador || [];
    window.inventarioJugador = state.inventarioJugador || [];
    window.monedas = state.monedas || 0;
    window.ajustesJuego = state.ajustes || {};
    window.worldPos = state.worldPos || null;
    window.ultimaEscena = state.ultimaEscena || null;
    window.ciudadSeleccionada = state.ciudadSeleccionada || null;
    window.retornoIsla = state.retornoIsla || null;
    window.islasCompletadas = state.islasCompletadas || [];
    window.eventosTerminados = state.eventosTerminados || [];
    window.nieblaPorIsla = state.nieblaPorIsla || {};
    window.dragonesDerrotadosPorIsla = state.dragonesDerrotadosPorIsla || {};
    window.recompensaPendiente = state.recompensaPendiente || null;
// ==========================================================
// 🗓️ Calendario e incubaciones (restauración completa y segura)
// ==========================================================
if (state.calendario) {
  // Guardar los valores restaurados en memoria
  const savedCalendar = {
    dia: state.calendario.dia || 1,
    mes: state.calendario.mes || 1,
    anio: state.calendario.anio || 1
  };

  // Si el calendario ya existe, actualizarlo directamente
  if (window.__CALENDAR_STATE) {
    Object.assign(window.__CALENDAR_STATE, savedCalendar);
  } else {
    // Si aún no existe (el script Calendario no se ha cargado),
    // guardamos el estado y lo aplicamos en cuanto se cargue
    window.__PENDING_CALENDAR_STATE = savedCalendar;
  }

  console.log(
    `📅 Calendario restaurado desde save: Día ${savedCalendar.dia}, Mes ${savedCalendar.mes}, Año ${savedCalendar.anio}`
  );

  // Refrescar visualmente cuando esté listo el calendario
  const refrescarCalendario = () => {
    if (window.Calendario && typeof Calendario.actualizarDisplay === "function") {
      Calendario.actualizarDisplay();
      console.log("✅ Calendario visual actualizado tras carga.");
      return true;
    }
    return false;
  };

  // Intentar refrescar varias veces por seguridad
  let intentos = 0;
  const timer = setInterval(() => {
    if (refrescarCalendario() || intentos++ > 10) clearInterval(timer);
  }, 300);
}

// 🥚 Huevos en incubación (restauración completa)
window.huevosIncubando = Array.isArray(state.huevosIncubando)
  ? state.huevosIncubando.map(h => ({
      tipo: h.tipo || "Desconocido",
      diasRestantes: h.diasRestantes ?? 15,
      diasTotales: h.diasTotales ?? h.diasRestantes ?? 15,
      notificado: !!h.notificado,
      key: h.key || null
    }))
  : [];

console.log("🥚 Huevos incubando restaurados:", window.huevosIncubando.length);    
// 🐣 Dragones bebé del criadero (restauración)
window.dragonesBaby = Array.isArray(state.dragonesBaby)
  ? state.dragonesBaby.map(d => ({
      name: d.name,
      tipo: d.tipo,
      clase: d.clase,
      rareza: d.rareza,
      confianza: d.confianza ?? 0,
      img: d.img || null
    }))
  : [];

console.log("🐣 Dragones bebé restaurados:", window.dragonesBaby.length);
// ==========================================================
// 🔥 CAMBIO: No restaurar misiones pasivas. 
// Todos los dragones vuelven libres.
// ==========================================================
if (Array.isArray(window.dragonesJugador)) {
  window.dragonesJugador.forEach(d => {
    d.enMisionPasiva = false;
    d.busy = false;
     });
}
window.misionesPasivas = [];
window._mp_spawnCountdown = 0;
window._mp_listenerOn = false;
console.log("🧹 Misiones pasivas omitidas. Dragones liberados.");

// ==========================================================
// 🐉 REGENERACIÓN POST-CARGA DE MISIONES (garantizada)
// ==========================================================
try {
  console.log("🧩 [SaveGame] Comprobando estado de MISIONES tras carga...");

  // Esperar a que existan los dragones antes de regenerar
  let intentos = 0;
  const timer = setInterval(() => {
    intentos++;
    if (Array.isArray(window.dragones) && window.dragones.length > 0) {
      clearInterval(timer);

      console.log("✅ [SaveGame] Dragones detectados. Verificando MISIONES...");

      // Si el catálogo está vacío o undefined, reconstruimos lo básico
      if (!Array.isArray(window.MISIONES) || window.MISIONES.length === 0) {
        console.log("⚙️ [SaveGame] Regenerando catálogo base de misiones...");
        const elegirDragonPorTier = (tier) => {
          const candidatos = window.dragones.filter(d => d.tier === tier);
          return candidatos[Math.floor(Math.random() * candidatos.length)];
        };

        const dragB = elegirDragonPorTier("B");
        const dragA = elegirDragonPorTier("A");
        const dragS = elegirDragonPorTier("S");

        window.MISIONES = [
          {
            id: "capB",
            nombre: `Captura a ${dragB?.name || "Dragón B"}`,
            descripcion: `Captura al dragón ${dragB?.name || "de tipo desconocido"}.`,
            ciudad: ["frostgaard", "luminaria"],
            recompensa: { objeto: "runarara", cantidad: 1 }
          },
          {
            id: "capA",
            nombre: `Captura a ${dragA?.name || "Dragón A"}`,
            descripcion: `Captura al poderoso ${dragA?.name || "de tipo desconocido"}.`,
            ciudad: ["frostgaard", "silvanost"],
            recompensa: { objeto: "runaepica", cantidad: 1 }
          },
          {
            id: "capS",
            nombre: `Captura a ${dragS?.name || "Dragón S"}`,
            descripcion: `Captura al legendario ${dragS?.name || "de tipo desconocido"}.`,
            ciudad: ["frostgaard", "harruni"],
            recompensa: { objeto: "runalegendaria", cantidad: 1 }
          }
        ];

        console.log("✅ [SaveGame] Catálogo MISIONES regenerado:", window.MISIONES.length);
      } else {
        console.log("ℹ️ [SaveGame] MISIONES ya existente, no se toca.");
      }
    }

    if (intentos > 20) {
      clearInterval(timer);
      console.warn("⚠️ [SaveGame] No se detectaron dragones tras 10 segundos. MISIONES no regeneradas.");
    }
  }, 500);
} catch (err) {
  console.warn("⚠️ [SaveGame] Error comprobando o regenerando MISIONES:", err);
}
// ==========================================================
// 🔥 CAMBIO: No restaurar misiones normales
// ==========================================================
window.__QUESTS_STATE = { activas: [], completadas: [] };
console.log("💾 Misiones normales omitidas (reiniciadas).");


    // ==========================================================
    // 🌍 RUNTIME DE ISLAS Y MUNDO
    // ==========================================================
    const data = state.runtimeIsla || {};
    const RUNTIME = (window.__RUNTIME_STATE = window.__RUNTIME_STATE || {});

    // 🔹 Restaurar estructura base
    RUNTIME.meta = data.meta || {};
    RUNTIME.eventosCompletados = deserializeMap(data.eventosCompletados, true);
    RUNTIME.ultimaPosIsla = deserializeMap(data.ultimaPosIsla);
    RUNTIME.monolitosGlobalesTodos = data.monolitosGlobalesTodos || [];
    RUNTIME.eventosCompletadosGlobal = data.eventosCompletadosGlobal || {};
    RUNTIME.islasContadas = data.islasContadas || {};
    RUNTIME.cacheIslas = data.cacheIslas || null;
    RUNTIME.cacheParams = data.cacheParams || null;

    // 🧭 Restaurar seed y cache de islas
    if (data.seedWorld) {
      window.seedWorld = data.seedWorld;
      RUNTIME.seedWorld = data.seedWorld;
      console.log("🧭 Seed del mundo restaurada:", window.seedWorld);
    }

    if (data.cacheIslas) {
      RUNTIME.cacheIslas = data.cacheIslas;
      console.log("♻️ Cache de islas restaurada desde guardado:", RUNTIME.cacheIslas.length, "islas");
    }

    // 🧩 Sincronizar eventos completados y meta global (compatibilidad con saves antiguos)
    if (state.eventosCompletadosGlobal) {
      RUNTIME.eventosCompletadosGlobal = state.eventosCompletadosGlobal;
      console.log("🌍 Eventos completados global restaurados:", Object.keys(RUNTIME.eventosCompletadosGlobal).length);
    }
    if (state.metaEventos) {
      RUNTIME.meta = state.metaEventos;
      console.log("📜 Meta de eventos restaurada:", Object.keys(RUNTIME.meta).length);
    }

    // 🪄 Unificar por compatibilidad
    if ((!RUNTIME.eventosCompletados || RUNTIME.eventosCompletados.size === 0) && RUNTIME.eventosCompletadosGlobal) {
      const map = new Map();
      for (const k in RUNTIME.eventosCompletadosGlobal) {
        map.set(k, RUNTIME.eventosCompletadosGlobal[k]);
      }
      RUNTIME.eventosCompletados = map;
      console.log("✅ Eventos completados sincronizados desde global -> mapa");
    }

    // 🔹 Restaurar eventos completados del mundo si vienen fuera
    if (data.eventosCompletados && Object.keys(data.eventosCompletados).length > 0) {
      try {
        RUNTIME.eventosCompletados = deserializeMap(data.eventosCompletados, true);
        console.log("📜 Eventos completados restaurados:", RUNTIME.eventosCompletados.size);
      } catch (err) {
        console.warn("⚠️ No se pudieron restaurar los eventos completados:", err);
      }
    }

    // 🔒 Asegurar que los Map queden válidos (para que IslaWorld no regenere)
    if (!(RUNTIME.eventosCompletados instanceof Map)) {
      RUNTIME.eventosCompletados = deserializeMap(RUNTIME.eventosCompletados, true);
    }
    if (!(RUNTIME.ultimaPosIsla instanceof Map)) {
      RUNTIME.ultimaPosIsla = deserializeMap(RUNTIME.ultimaPosIsla);
    }
// ==========================================================
// 🧭 Restaurar StoryMode (modo historia)
// ==========================================================
if (Array.isArray(state.storyMode) && window.storyMode && Array.isArray(window.storyMode.missions)) {
  try {
    // Aplicar estados guardados a las misiones existentes
    state.storyMode.forEach(saved => {
      const mission = window.storyMode.missions.find(m => m.id === saved.id);
      if (mission) {
        mission.state = saved.state;
      }
    });

    console.log(`📖 StoryMode restaurado (${state.storyMode.length} misiones)`);
    if (typeof window.storyMode.updateHUD === "function") {
      window.storyMode.updateHUD();
    }
  } catch (e) {
    console.warn("⚠️ Error al restaurar StoryMode:", e);
  }
}

    // ==========================================================
    // 🔹 Señal para SceneWorld (no regenerar)
    // ==========================================================
    window.__FROM_SAVEGAME__ = true;

    // ==========================================================
    // 🧩 Reforzar sincronización de eventos (fix visual)
    // ==========================================================
    if (RUNTIME && (!RUNTIME.eventosCompletados || RUNTIME.eventosCompletados.size === 0)) {
      if (data.eventosCompletados && Object.keys(data.eventosCompletados).length > 0) {
        RUNTIME.eventosCompletados = deserializeMap(data.eventosCompletados, true);
        console.log("✅ Reforzado: eventosCompletados restaurados manualmente tras carga:", RUNTIME.eventosCompletados.size);
      } else if (RUNTIME.eventosCompletadosGlobal) {
        const map = new Map();
        for (const k in RUNTIME.eventosCompletadosGlobal) map.set(k, RUNTIME.eventosCompletadosGlobal[k]);
        RUNTIME.eventosCompletados = map;
        console.log("✅ Reforzado: eventosCompletados reconstruidos desde global.");
      }
    }

 // 🧭 Reanudar escena exacta (último paso)
try {
  // Asegurar flag de carga desde save
  window.__FROM_SAVEGAME__ = true;

  // 🟢 Si venimos del título: NO iniciar ninguna escena aquí.
  // El título (title.js) será quien arranque SceneCargarPartida.
  if (window.__FROM_TITLE__) {
    console.log("🎯 Carga iniciada desde título → SceneCargarPartida la lanzará.");
    return;
  }

  // 🔵 Si NO venimos del título: reanuda la escena guardada normalmente
  const targetScene = state.escena || "SceneWorld";
  console.log(`🌍 Reanudando escena: ${targetScene}`);

  // Cerrar escenas activas y arrancar destino (UNA sola vez)
  const actives = game.scene.getScenes(true);
  actives.forEach(sc => game.scene.stop(sc.scene.key));
  game.scene.start(targetScene, { fromLoad: true });

} catch (e) {
  console.error("⚠️ Error al reanudar escena:", e);
}
  }

  // 🔹 Devuelve la API pública
  return { save, loadFromFile, apply, getGameState, serializeMap, deserializeMap };
})();

/***************************************************************
 * 🧩 SISTEMA ADICIONAL DE GUARDADO POR CÓDIGO (NO ROMPE NADA)
 * - Codifica TODO el estado (getGameState) a Base64 seguro
 * - Usa '.' para '+' y '_' para '/'  (guiones solo como separador visual)
 ***************************************************************/
Object.assign(SaveGame, (function () {
  // 🔸 Agrupa en bloques legibles (5 chars) con guiones
  function groupChars(str, n = 5) {
    return (str.match(new RegExp(`.{1,${n}}`, "g")) || []).join("-");
  }

  // 🔸 Restaura padding Base64 si falta
  function restorePadding(b64) {
    const mod = b64.length % 4;
    if (mod === 2) return b64 + "==";
    if (mod === 3) return b64 + "=";
    if (mod === 1) return b64 + "==="; // raro, por seguridad
    return b64;
  }

  /** 🔹 Codifica objeto en string alfanumérico seguro */
  function encodeToCode() {
    try {
      const state = SaveGame.getGameState();
      const json  = JSON.stringify(state);

      // Base64 seguro para Unicode
      const b64   = btoa(unescape(encodeURIComponent(json)));

      // Sanitiza: '.' sustituye a '+', '_' a '/'
      const safe  = b64.replace(/\+/g, ".").replace(/\//g, "_").replace(/=+$/,"");

      const code  = groupChars(safe, 5);
      console.log("🧩 Código generado:", code);

      // Copiado al portapapeles (best-effort)
      if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(code).catch(()=>{}); }

      prompt("💠 Guarda este código de tu partida:", code);
      return code;
    } catch (e) {
      console.error("⚠️ Error generando código:", e);
      alert("⚠️ No se pudo generar el código de guardado (ver consola)");
    }
  }

  /** 🔹 Decodifica código → estado del juego */
  function decodeFromCode() {
    try {
      const code = prompt("📜 Introduce el código de tu partida:");
      if (!code) return;

      // Quitar separadores/espacios
      const compact = code.replace(/[\s\-]/g, "");

      // Des-sanitizar
      let b64 = compact.replace(/\./g, "+").replace(/_/g, "/");
      b64 = restorePadding(b64);

      const json  = decodeURIComponent(escape(atob(b64)));
      const state = JSON.parse(json);

      if (!state || typeof state !== "object") throw new Error("Formato inválido");

      console.log("📥 Cargando partida desde código...");
      SaveGame.apply(state);
      alert("✅ Partida cargada correctamente desde código");
    } catch (e) {
      console.error("⚠️ Error al cargar desde código:", e);
      alert("⚠️ Código no válido o corrupto");
    }
  }

  return { encodeToCode, decodeFromCode };
})());

// 🌍 Hacerlo global para poder invocarlo desde botones HTML
window.SaveGame = SaveGame;
