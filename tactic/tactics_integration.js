/***** =========================
 * tactic_integration.js – Integración real del modo táctico en el mundo
 * ========================== */

/**
 * 🔁 Clonado profundo para no mutar arrays/objetos reales durante el combate.
 */
function _deepClone(obj) {
  return JSON.parse(JSON.stringify(obj || {}));
}

/**
 * 🐉 Selecciona los dragones activos del jugador (máximo 4).
 * === CAMBIO 4v4 ===
 */
function _seleccionarDragonesActivos() {
  const coleccion = window.dragonesJugador || [];
  let activos = coleccion.filter(d => d && d.activo);

  if (activos.length === 0) {
    console.warn("⚠️ No hay dragones activos. Usando los primeros disponibles (máx 4).");
    activos = coleccion.slice(0, 4);
  }

  // Clonamos para evitar mutaciones durante el combate
  return activos.map(d => _deepClone(d)).slice(0, 4);
}


/**
 * ⚔️ Genera enemigos tácticos según reglas de tactics_encounter.js
 * Soporta encuentros especiales como Monolitos.
 */
function _generarEnemigosTacticos(opciones = {}) {
  if (!window.tacticsEncounter) {
    console.error("❌ No se encontró tacticsEncounter");
    return [];
  }

  let enemigos = [];
  let tipoCombate = "Normal";

  // 🔥 MONOLITO ROJO
  if (opciones.monolitoRojo && typeof tacticsEncounter.generarEnemigosMonolitoRojo === "function") {
    console.log("🔥 Generando enemigos especiales: MONOLITO ROJO");
    enemigos = tacticsEncounter.generarEnemigosMonolitoRojo();
    tipoCombate = "Monolito Rojo";
  }
  // 🍃 MONOLITO VERDE
  else if (opciones.monolitoVerde && typeof tacticsEncounter.generarEnemigosMonolitoVerde === "function") {
    console.log("🍃 Generando enemigos especiales: MONOLITO VERDE");
    enemigos = tacticsEncounter.generarEnemigosMonolitoVerde();
    tipoCombate = "Monolito Verde";
  }
  // 💠 MONOLITO AZUL
  else if (opciones.monolitoAzul && typeof tacticsEncounter.generarEnemigosMonolitoAzul === "function") {
    console.log("💠 Generando enemigos especiales: MONOLITO AZUL");
    enemigos = tacticsEncounter.generarEnemigosMonolitoAzul();
    tipoCombate = "Monolito Azul";
  }
  // 💛 MONOLITO DORADO (nuevo)
  else if (opciones.monolitoDorado && typeof tacticsEncounter.generarEnemigosMonolitoDorado === "function") {
    console.log("💛 Generando enemigos especiales: MONOLITO DORADO");
    enemigos = tacticsEncounter.generarEnemigosMonolitoDorado();
    tipoCombate = "Monolito Dorado";
  }
  // ⚔️ ENCUENTRO NORMAL
  else if (typeof tacticsEncounter.generarEnemigosTacticos === "function") {
    enemigos = tacticsEncounter.generarEnemigosTacticos();
  }

  if (!Array.isArray(enemigos) || enemigos.length === 0) {
    console.warn("⚠️ tacticsEncounter no devolvió enemigos válidos.");
    return [];
  }

  console.log(`🧬 Generados ${enemigos.length} enemigos tácticos (${tipoCombate}).`);
  return enemigos.map(e => _deepClone(e));
}

/**
 * 🌍 Lanza SceneCombateTactico desde el mundo principal (SceneWorld).
 * Carga los dragones activos del jugador y genera enemigos con la nueva lógica táctica.
 */
window.lanzarTacticoDesdeMundo = function(sceneWorld, opciones = {}) {

  // 🐲 Aliados = dragones activos o primeros 3
  const aliados = _seleccionarDragonesActivos();

  // 🧭 Bioma actual (por ahora no afecta en táctico, pero se mantiene para futuro)
  let bioma = sceneWorld.biomaActual;
  if (!bioma || bioma === "undefined" || bioma === "none") {
    bioma = "pradera"; // 🌿 Bioma neutro
  }

  // 👹 Enemigos generados por tactics_encounter.js
const enemigos = _generarEnemigosTacticos(opciones);

  if (aliados.length === 0 || enemigos.length === 0) {
    console.warn("⚠️ No se pudo generar combate táctico (aliados/enemigos vacíos).");
    return;
  }

  // 🧭 Guardar posición del mapa para volver luego
 const volverData = {
  scrollX: sceneWorld.cameras?.main?.scrollX || 0,
  scrollY: sceneWorld.cameras?.main?.scrollY || 0,
  mapCol: window.mapCol,
  mapRow: window.mapRow,
  biomaActual: sceneWorld.biomaActual,
  ...opciones // ← aquí viajan monolitoId y el color del monolito
};
  console.log("🚀 Iniciando combate táctico desde el mapa...");
  console.log("Aliados:", aliados.map(a => a.name));
  console.log("Enemigos:", enemigos.map(e => e.name));
// 🧩 Depuración profunda antes de lanzar la escena
console.log("🔎 DEPURACIÓN TÁCTICO =====================");
console.log("Aliados:", aliados);
console.log("Enemigos:", enemigos);
enemigos.forEach((e, i) => {
  console.log(`Enemigo ${i}:`, e ? Object.keys(e) : "❌ undefined");
});
console.log("==========================================");
  // 🎬 Lanzar la escena táctica real
  sceneWorld.scene.start("SceneCombateTactico", {
    modo: "real_desde_mapa",
    aliados,
    enemigos,
    volverA: "SceneWorld",
    volverData
  });
};
