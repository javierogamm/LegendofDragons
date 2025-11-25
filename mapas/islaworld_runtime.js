// islaworld_runtime.js
(function (global) {
  "use strict";

  // ====== Config ======
  const VERSION = "0.41";

  // ⚠️ Importante: NO incluimos "frozencrown" en los biomas aleatorios
  const BIOMAS_RANDOM = ["volcan", "jungle", "helado", "cuevadragon", "desert", "pantano", "pradera", // nuevos
  "volante2", "desert4", "forest"
];

  const NOMBRES_BIOMA = {

    // legenedarias
    frozencrown: "Frozencrown",
    scorchia:    "Scorchia", // 🔥 nueva isla
    jadeisland: "Jadeisland",
    stormcloud: "Stormcloud",
    hellfire:   "Hellfire",
    //Normales
    volcan:      "Isla Volcánica",
    jungle:      "Isla Selvática",
    helado:      "Isla Helada",
    cuevadragon: "Isla de la Cueva",
    desert:      "Isla Desértica",
    pantano:     "Isla Pantanosa",
    pradera:     "Isla de la Pradera",
  volante2: "Isla Volante",
  desert4:  "Isla Desierto IV",
  forest:   "Isla Bosque Antiguo"
};

    
  
 const EVENT_POOL = {

  // ======== ISLAS NORMALES (con probabilidades implícitas) ========

  volcan: [
  "torre","cueva","cueva","menhir","piramide","torremago","carromato",
],

  jungle: [
    "bosque","bosque","hut","hut","menhir","cueva","arbolantiguo","carromato"
  ],

  helado: [
    "torre","menhir","cueva","cueva","ruinanieve","abadianieve","carromato","carromato"
  ],

  cuevadragon: [
    "cueva","cueva","menhir","ruina","torremago","cementerio","carromato"
  ],

  desert: [
  "torre","menhir","hut","piramide","piramide","ruina","cementerio"
],

  pantano: [
    "hut","hut","bosque","cementerio","ruina","menhir","carromato","carromato"
  ],

  pradera: [
    "bosque","hut","torre","abadia","arbolantiguo","carromato","carromato"
  ],

  volante2: [
    "torre","bosque","bosque","arbolantiguo","torremago","menhir","carromato"
  ],

  desert4: [
    "torre","menhir","hut","piramide","ruina","carromato","carromato"
  ],

  forest: [
    "bosque","bosque","cueva","hut","arbolantiguo","menhir","carromato"
  ],

  // ======== ISLAS LEGENDARIAS (sin tocar) ========

  frozencrown: [
    "torre","menhir","cueva","ruinanieve","ruina"
  ],

  scorchia: [
    "torre","cueva","torremago","piramide","ruina"
  ],

  jadeisland: [
    "bosque","arbolantiguo","cueva","hut","ruina"
  ],

  stormcloud: [
    "torre","torremago","menhir","bosque","ruina"
  ],

  hellfire: [
    "cueva","torremago","piramide","ruina","ruina"
  ]

};


  // ====== Estado runtime (persistente en window) ======
  const RUNTIME = (global.__RUNTIME_STATE = global.__RUNTIME_STATE || {
    meta: { 
      ultimaIslaVisitada: null,
      // 🔒 bloquea Frozencrown por defecto
      frozencrownUnlocked: false,
      jadeislandUnlocked: false,
      stormcloudUnlocked: false,
      hellfireUnlocked: false,
      scorchiaUnlocked: false   // 🔥 nuevo
    },
    eventosCompletados: new Map(), // islandId -> Set(eventId)
    ultimaPosIsla: new Map(),      // islandId -> { col,row }
    cacheIslas: null,              // última lista construida
    cacheParams: null              // stringificado de bounds/seed
  });
// === NUEVO BLOQUE: Estado de monolitos globales ===
if (!RUNTIME.monolitosGlobales) {
  RUNTIME.monolitosGlobales = {
    rojo: [],
    verde: [],
    azul: [],
    dorado: []
  };
}
  // ====== Utils RNG ======
  function hashStringToSeed(str){
    let h = 0x811c9dc5;
    for (let i=0; i<str.length; i++){
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  function lcg(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xFFFFFFFF;
    };
  }

  function pick(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }

  // ====== Generadores ======
  function genEvento(islandId, idx, rng, bioma) {
    const tipo = pick(rng, EVENT_POOL[bioma] || ["menhir","bosque","torre","torremago","hut","cueva"]);
    return {
      id: `${islandId}-e${idx}`,
      tipo,
      x: Math.floor(rng() * 12) + 4,
      y: Math.floor(rng() * 9)  + 3,
      data: {}
    };
  }

/** 🔹 Genera una isla con bioma opcional (si no se pasa, elige aleatorio)
 *  — Evita superposiciones con otras islas ya generadas (hasta 25 intentos)
 *  — Si no puede evitarla, muestra aviso en consola con ambas islas implicadas
 */
function genIsla(islandId, rng, worldBounds, biomaForzada, existentes = []) {
  const bioma = biomaForzada || pick(rng, BIOMAS_RANDOM);
  const numEventos = 5 + Math.floor(rng() * 3);
  let eventos = [];
  for (let i = 0; i < numEventos; i++) {
    eventos.push(genEvento(islandId, i, rng, bioma));
  }

  const pad = 100;
  let xMin = (worldBounds.offsetX || 0) + pad / 2;
  let xMax = (worldBounds.offsetX || 0) + worldBounds.w - pad / 2;
  let yMin = pad / 2;
  let yMax = worldBounds.h - pad / 2;

  // ===== Restricciones verticales (Y) =====
  if (bioma === "helado") {
    yMax = worldBounds.h * 0.25;
  } else if (bioma === "jungle") {
    yMin = worldBounds.h * 0.35;
    yMax = worldBounds.h * 0.65;
  } else if (bioma === "desert") {
    yMin = worldBounds.h * 0.66;
  } else if (bioma === "pantano") {
    yMin = worldBounds.h * 0.60;
    xMin = (worldBounds.offsetX || 0) + worldBounds.w * 0.30;
    xMax = (worldBounds.offsetX || 0) + worldBounds.w;
  } else if (bioma === "pradera") {
    yMin = worldBounds.h * 0.25;
    yMax = worldBounds.h * 0.75;
  } else if (bioma === "volante2") {
    yMin = 0;
    yMax = worldBounds.h * 0.50;
    xMin = (worldBounds.offsetX || 0);
    xMax = (worldBounds.offsetX || 0) + worldBounds.w * 0.50;
  } else if (bioma === "volcan") {
    yMin = worldBounds.h * 0.375;
    yMax = worldBounds.h * 0.625;
    xMin = (worldBounds.offsetX || 0) + worldBounds.w * 0.30;
    xMax = (worldBounds.offsetX || 0) + worldBounds.w * 0.65;
  } else if (bioma === "desert4") {
    yMin = worldBounds.h * 0.60;
    xMin = (worldBounds.offsetX || 0) + worldBounds.w * 0.70;
    xMax = (worldBounds.offsetX || 0) + worldBounds.w;
  } else if (bioma === "forest") {
    yMin = worldBounds.h * 0.375;
    yMax = worldBounds.h * 0.625;
    xMin = (worldBounds.offsetX || 0);
    xMax = (worldBounds.offsetX || 0) + worldBounds.w * 0.25;
  }

  // ===== Generación con reintentos anti-colisión =====
  const nombre = NOMBRES_BIOMA[bioma] || `Isla ${parseInt(islandId, 10) + 1}`;
  const radioIsla = Math.min(worldBounds.w, worldBounds.h) * 0.8; // ~4% del mapa
  let x, y, intentos = 0;
  let solapa = false;
  let ultimaColision = null;

  do {
    x = Math.floor(rng() * Math.max(1, (xMax - xMin))) + xMin;
    y = Math.floor(rng() * Math.max(1, (yMax - yMin))) + yMin;

    // comprobar solapamiento
    solapa = false;
   for (const o of existentes) {
  // 💡 Ignorar las islas completadas (pueden liberar su hueco)
  if (o.estado === "completa") continue;

  const dx = o.x - x;
  const dy = o.y - y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < radioIsla) {
    solapa = true;
    ultimaColision = o;
    break;
  }
}

    intentos++;
  } while (solapa && intentos < 25);

  if (solapa && ultimaColision) {
    console.warn(
      `[IslaWorld ⚠️] ${nombre} (${bioma}) quedó solapada con ${ultimaColision.nombre} (${ultimaColision.bioma}) tras ${intentos} intentos.`
    );
  }
// === 🐟 NUEVO: Bancos de Peces (versión final - bordes del mapa, sin afectar niebla) ===
const legendarias = ["frozencrown", "jadeisland", "stormcloud", "hellfire", "scorchia"];
if (!legendarias.includes(bioma)) {
  const numPeces = Math.floor(rng() * 4); // entre 0 y 3 bancos
  const cols = 20; // tamaño base de mapa
  const rows = 15;

  for (let i = 0; i < numPeces; i++) {
    const tipoBanco = ["bancopeces1","bancopeces2","bancopeces3"][Math.floor(rng() * 3)];

    // 📍 Solo en los laterales y fondo
    const zona = rng();
    let x, y;

    if (zona < 0.33) {
      // 🔹 Lateral izquierdo
      x = 0;
      y = Math.floor(rng() * rows);
    } else if (zona < 0.66) {
      // 🔹 Lateral derecho
      x = cols - 1;
      y = Math.floor(rng() * rows);
    } else {
      // 🔹 Fila inferior
      x = Math.floor(rng() * cols);
      y = rows - 1;
    }

    eventos.push({
      id: `${islandId}-pez${i}`,
      tipo: tipoBanco,
      clase: "bancopeces",
      x,
      y,
      data: {}
    });
  }
}

  return { islandId, nombre, bioma, x, y, eventos };


}



  function buildAllIslands(worldBounds, seedStr){
    const seed = hashStringToSeed(String(seedStr ?? `${VERSION}-default`));
    const rng = lcg(seed);

    const list = [];

    // ===== Crear al menos 10 de cada bioma estándar =====
let islandIndex = 0;
BIOMAS_RANDOM.forEach(bioma => {
  for (let i = 0; i < 10; i++) {
    list.push(genIsla(String(islandIndex++), rng, worldBounds, bioma));
  }
});

// ===== Rellenar hasta 144 con biomas aleatorios =====
while (list.length < 144) {
  list.push(genIsla(String(islandIndex++), rng, worldBounds));
}

    // 👑 Isla especial Frozencrown
    const frozId = "frozencrown";

    // Y fija (10% superior)
    const frozY  = Math.floor(worldBounds.h * 0.10);

    // X aleatoria en los laterales (20% izquierda o 20% derecha)
    let frozX;
    if (rng() < 0.5) {
      // 20% izquierda
      frozX = Math.floor(rng() * (worldBounds.w * 0.20));
    } else {
      // 20% derecha
      frozX = Math.floor(worldBounds.w * 0.80 + rng() * (worldBounds.w * 0.20));
    }

    // genera N eventos usando el pool del bioma "frozencrown"
    const frozEventos = [];
    const numFrozEventos = 6;
    for (let i = 0; i < numFrozEventos; i++) {
      frozEventos.push(genEvento(frozId, i, rng, "frozencrown"));
    }

    // 👑 Isla especial Frozencrown
if (RUNTIME.meta.frozencrownUnlocked) {
  list.push({
    islandId: frozId,
    nombre:   "Frozencrown",
    bioma:    "frozencrown",
    x:        frozX,
    y:        frozY,
    eventos:  frozEventos
  });
}
// 👑 Isla especial Jadeisland (bosque místico, arriba-izda)
const jadeId = "jadeisland";
const jadeX  = Math.floor(worldBounds.w * 0.15);
const jadeY  = Math.floor(worldBounds.h * 0.22);
const jadeEventos = [];
for (let i=0;i<6;i++) jadeEventos.push(genEvento(jadeId, i, rng, "jadeisland"));
if (RUNTIME.meta.jadeislandUnlocked) {
  list.push({ islandId: jadeId, nombre:"Jadeisland", bioma:"jadeisland", x: jadeX, y: jadeY, eventos: jadeEventos });
}

// 👑 Isla especial Stormcloud (volante/tormentas, arriba-dcha)
const stormId = "stormcloud";
const stormX  = Math.floor(worldBounds.w * 0.80);
const stormY  = Math.floor(worldBounds.h * 0.18);
const stormEventos = [];
for (let i=0;i<6;i++) stormEventos.push(genEvento(stormId, i, rng, "stormcloud"));
if (RUNTIME.meta.stormcloudUnlocked) {
  list.push({ islandId: stormId, nombre:"Stormcloud", bioma:"stormcloud", x: stormX, y: stormY, eventos: stormEventos });
}

// 👑 Isla especial Hellfire (volcán ígneo, abajo-izda)
const hellId = "hellfire";
const hellX  = Math.floor(worldBounds.w * 0.18);
const hellY  = Math.floor(worldBounds.h * 0.85);
const hellEventos = [];
for (let i=0;i<6;i++) hellEventos.push(genEvento(hellId, i, rng, "hellfire"));
if (RUNTIME.meta.hellfireUnlocked) {
  list.push({ islandId: hellId, nombre:"Hellfire", bioma:"hellfire", x: hellX, y: hellY, eventos: hellEventos });
}


// 👑 Isla especial Scorchia
const scorId = "scorchia";

// posición fija: parte inferior derecha
const scorX = Math.floor(worldBounds.w * 0.85);
const scorY = Math.floor(worldBounds.h * 0.85);

// genera N eventos usando el pool del bioma "scorchia"
const scorEventos = [];
const numScorEventos = 6;
for (let i = 0; i < numScorEventos; i++) {
  scorEventos.push(genEvento(scorId, i, rng, "scorchia"));
}

// 🔥 Isla especial Scorchia
if (RUNTIME.meta.scorchiaUnlocked) {
  list.push({
    islandId: scorId,
    nombre:   "Scorchia",
    bioma:    "scorchia",
    x:        scorX,
    y:        scorY,
    eventos:  scorEventos
  });
}

//LOG
console.log("🔍 [IslaWorld] Total generadas:", list.length);
const conteoPorBioma = {};
list.forEach(i => {
  conteoPorBioma[i.bioma] = (conteoPorBioma[i.bioma] || 0) + 1;
});
console.table(conteoPorBioma);

    return list;
  }
function buildMonolitosGlobales(worldBounds) {
  // ======================
  //  RNG determinista
  // ======================
  const seed = Date.now() % 1000000000;
  const rng = (function (seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xFFFFFFFF;
    };
  })(seed);

  // ======================
  //  Parámetros globales
  // ======================
  const colores = ["verde", "azul", "rojo", "dorado"];
  const lista = [];

  // ⚠️ Anchura real del mapa mundial (no solo pantalla)
  // si el mapa es de ~9000 px de ancho y 2000 px de alto, ponlo aquí o detecta dinámicamente:
 // ✅ Ajuste: dimensiones reales del mapa (para tu world de 4000x2000)
const MAP_W = 4096;
const MAP_H = 2048;

  // offset de inicio del mapa
  const offsetX = worldBounds.offsetX || 0;
  const offsetY = 0;

  // ======================
  //  Zonas amplias (25% reales del mapa completo)
  // ======================
  const zonas = {
    verde:  { xMin: 0.00, xMax: 1.00, yMin: 0.33, yMax: 0.66 }, // centro
    azul:   { xMin: 0.50, xMax: 1.00, yMin: 0.00, yMax: 0.33 }, // arriba derecha
    rojo:   { xMin: 0.00, xMax: 0.50, yMin: 0.66, yMax: 1.00 }, // abajo izquierda
    dorado: { xMin: 0.50, xMax: 1.00, yMin: 0.66, yMax: 1.00 }  // abajo derecha
  };

  const distMin = 300; // separación mínima entre monolitos del mismo color

  colores.forEach(color => {
    const cfg = zonas[color];
    const colocados = [];

    for (let i = 1; i <= 5; i++) {
      let x, y, valido = false, intentos = 0;

      do {
        // coordenadas proporcionales sobre TODO el mapa
        x = offsetX + MAP_W * Phaser.Math.FloatBetween(cfg.xMin, cfg.xMax);
        y = offsetY + MAP_H * Phaser.Math.FloatBetween(cfg.yMin, cfg.yMax);

        valido = true;

        // evitar agrupamiento
        for (const otro of colocados) {
          const dx = otro.x - x;
          const dy = otro.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < distMin) {
            valido = false;
            break;
          }
        }

        intentos++;
      } while (!valido && intentos < 40);

      colocados.push({ x, y });
      lista.push({
        id: `${color}-${i}`,
        color,
        x: Math.floor(x),
        y: Math.floor(y),
        completado: false
      });
    }
  });

  console.log(`[MONOLITOS] Generados ${lista.length} (${new Date().toLocaleString()})`);
  console.table(
    lista.reduce((acc, m) => {
      acc[m.color] = (acc[m.color] || 0) + 1;
      return acc;
    }, {})
  );

  // Guardar para depuración
  window.__RUNTIME_STATE = window.__RUNTIME_STATE || {};
  window.__RUNTIME_STATE.monolitosGlobalesTodos = lista;

  return lista;
}

  // ====== Estado/consultas ======
  function computeEstado(isla) {
  const doneSet = RUNTIME.eventosCompletados.get(String(isla.islandId));
  if (!doneSet) return "incompleta";

  // 🐟 Excluir todos los eventos relacionados con bancos de peces (cualquier variante)
  const eventosValidos = isla.eventos.filter(e => {
    const t = (e.tipo || "").toLowerCase();
    const c = (e.clase || "").toLowerCase();
    // Excluir cualquier evento que contenga "bancopeces"
    return !(t.includes("bancopeces") || c.includes("bancopeces"));
  });

  const totalValidos = eventosValidos.length;
  const completadosValidos = eventosValidos.filter(e => doneSet.has(String(e.id))).length;

  return completadosValidos >= totalValidos ? "completa" : "incompleta";
}


  function isEventDone(islandId, eventId){
    const s = RUNTIME.eventosCompletados.get(String(islandId));
    return !!(s && s.has(String(eventId)));
  }

    // ====== API pública ======
  const IslaWorld = {
    init(worldBounds, seedStr){
      if(!worldBounds || typeof worldBounds.w!=="number"){
        console.warn("[IslaWorld.init] worldBounds inválido");
        return;
      }
    // 🔑 Clave de caché: solo depende de dimensiones y semilla
const paramsKey = JSON.stringify({
  w: worldBounds.w,
  h: worldBounds.h,
  offsetX: worldBounds.offsetX || 0,
  seedStr: seedStr ?? `${VERSION}-default`
});

      if(!RUNTIME.cacheIslas || RUNTIME.cacheParams !== paramsKey){
        RUNTIME.cacheIslas = buildAllIslands(
          { w:worldBounds.w, h:worldBounds.h, offsetX:worldBounds.offsetX||0 },
          seedStr
        );
        RUNTIME.cacheParams = paramsKey;
      }
// === Guardar bounds y generar monolitos solo si el maxNivel ya permite verdes (≥3) ===
RUNTIME._lastWorldBounds = { w: worldBounds.w, h: worldBounds.h, offsetX: worldBounds.offsetX || 0 };

const nivelesInit = (window.dragonesJugador || []).map(d => Number(d?.nivel || 1));
const maxNivelInit = nivelesInit.length ? Math.max(...nivelesInit) : 1;

// Genera la lista global cuando al menos habilitas algún color (verde = 3)
if (maxNivelInit >= 4) {
  if (!RUNTIME.monolitosGlobalesTodos || !Array.isArray(RUNTIME.monolitosGlobalesTodos) || RUNTIME.monolitosGlobalesTodos.length === 0) {
    RUNTIME.monolitosGlobalesTodos = buildMonolitosGlobales(worldBounds); // crea todos (verde/azul/rojo)
  }
} else {
  // Aún no generes; listMonolitos() construirá cuando llegue el nivel
  if (typeof RUNTIME.monolitosGlobalesTodos === "undefined") {
    RUNTIME.monolitosGlobalesTodos = null;
  }
}


    },
refresh(worldBounds, seedStr){
  console.groupCollapsed("♻️ [IslaWorld.refresh] DEBUG — Inicio");
  console.log("🌍 worldBounds:", worldBounds);
  console.log("🌱 seedStr:", seedStr);
  console.log("📦 cacheIslas antes:", RUNTIME.cacheIslas ? RUNTIME.cacheIslas.length : "null");
  console.log("📦 cacheParams antes:", RUNTIME.cacheParams);
  console.log("🔐 meta desbloqueos:", JSON.stringify(RUNTIME.meta));

  // Detectar si la cache se pierde
  const antes = RUNTIME.cacheIslas ? RUNTIME.cacheIslas.length : 0;

  if (!RUNTIME.cacheIslas || RUNTIME.cacheIslas.length === 0) {
    console.warn("⚠️ No hay cacheIslas — se llama a init() por primera vez");
    this.init(worldBounds, seedStr);
    console.groupEnd();
    return;
  }

  const existentesIds = new Set(RUNTIME.cacheIslas.map(i => i.islandId));
  console.log("📋 IDs actuales:", Array.from(existentesIds));

  const wb = RUNTIME._lastWorldBounds || worldBounds || { w: 4000, h: 2000, offsetX: 0 };
  const rng = lcg(hashStringToSeed(String(seedStr || "refresh")));
  const faltantes = [];

  function addLegendaria(flag, id, bioma, x, y) {
    if (RUNTIME.meta[flag] && !existentesIds.has(id)) {
      console.log(`➕ Añadiendo ${id} (${bioma})`);
      const evs = [];
      for (let i = 0; i < 6; i++) evs.push(genEvento(id, i, rng, bioma));
      const isla = { islandId: id, nombre: NOMBRES_BIOMA[bioma], bioma, x, y, eventos: evs };
      RUNTIME.cacheIslas.push(isla);
      faltantes.push(id);
    } else if (RUNTIME.meta[flag]) {
      console.log(`✅ ${id} ya existente, no se duplica.`);
    } else {
      console.log(`🚫 ${id} aún bloqueada.`);
    }
  }

  // === Coordenadas fijas (idénticas a las usadas en buildAllIslands) ===
  addLegendaria("frozencrownUnlocked", "frozencrown", "frozencrown", Math.floor(wb.w * 0.85), Math.floor(wb.h * 0.15));
  addLegendaria("jadeislandUnlocked",   "jadeisland",   "jadeisland",   Math.floor(wb.w * 0.15), Math.floor(wb.h * 0.22));
  addLegendaria("stormcloudUnlocked",   "stormcloud",   "stormcloud",   Math.floor(wb.w * 0.80), Math.floor(wb.h * 0.18));
  addLegendaria("hellfireUnlocked",     "hellfire",     "hellfire",     Math.floor(wb.w * 0.18), Math.floor(wb.h * 0.85));
  addLegendaria("scorchiaUnlocked",     "scorchia",     "scorchia",     Math.floor(wb.w * 0.85), Math.floor(wb.h * 0.85));

  const despues = RUNTIME.cacheIslas.length;
  console.log(`📦 cacheIslas después: ${despues} (Δ ${despues - antes})`);
  console.log("🆕 Añadidas:", faltantes);

  console.log("📦 cacheParams después:", RUNTIME.cacheParams);
  console.groupEnd();

  // No regeneramos ni tocamos cacheParams
  return RUNTIME.cacheIslas;
}
,


    list(){
      return (RUNTIME.cacheIslas || []).map(isla => ({
        ...isla,
        estado: computeEstado(isla),
        ultimaPosIsla: RUNTIME.ultimaPosIsla.get(String(isla.islandId)) || null
      }));
    },

    get(islandId){
      const base = (RUNTIME.cacheIslas || []).find(i=>i.islandId===String(islandId));
      if(!base) return null;
      const eventosConEstado = base.eventos.map(e => ({ ...e, visitado: isEventDone(islandId, e.id) }));
      return {
        ...base,
        eventos: eventosConEstado,
        estado: computeEstado(base),
        ultimaPosIsla: RUNTIME.ultimaPosIsla.get(String(islandId)) || null
      };
    },

    markEventCompleted(islandId, eventId){
  const key = String(islandId);
  if(!RUNTIME.eventosCompletados.has(key)){
    RUNTIME.eventosCompletados.set(key, new Set());
  }
  RUNTIME.eventosCompletados.get(key).add(String(eventId));

  const isla = this.get(islandId);
  if (!isla) return;

  // Recalcular estado ahora que hemos añadido el evento
  const estadoAhora = computeEstado(isla);
  console.log("[DEBUG markEventCompleted]", {
    islandId,
    bioma: isla.bioma,
    estadoAhora,
    completados: RUNTIME.eventosCompletados.get(key)?.size,
    totalEventos: isla.eventos.length
  });


  // ✅ Notificar a Misiones cuando una isla se completa
  if (estadoAhora === "completa") {
    if (window.Misiones) {
      Misiones.registrarEvento("islaCompletada", { bioma: isla.bioma });
      console.log("[MISION] Isla completada:", isla.bioma);
    }
   // === 🔹 Registrar conteo global de ISLAS completadas por bioma (solo una vez) ===
    window.__RUNTIME_STATE = window.__RUNTIME_STATE || {};
    window.__RUNTIME_STATE.eventosCompletados = window.__RUNTIME_STATE.eventosCompletados || {};

    const bioma = isla.bioma || "desconocido";

    // Evitar duplicados si ya se registró esta isla
    window.__RUNTIME_STATE.islasContadas = window.__RUNTIME_STATE.islasContadas || {};
    if (!window.__RUNTIME_STATE.islasContadas[islandId]) {
      window.__RUNTIME_STATE.eventosCompletados[bioma] =
        (window.__RUNTIME_STATE.eventosCompletados[bioma] || 0) + 1;

      window.__RUNTIME_STATE.islasContadas[islandId] = true;
      console.log(`[📜 ISLA COMPLETA] +1 isla en bioma ${bioma}`);
    }

console.log(`[📜 ISLA] +1 isla COMPLETA en bioma ${bioma}`);
  }

// === Desbloqueo seguro de islas legendarias (solo una vez por tipo) ===
function desbloquearLegendaria(flag, nombre, biomas, umbral) {
  // Ya desbloqueada → no repetir
  if (RUNTIME.meta[flag]) return;

  const completas = (RUNTIME.cacheIslas || [])
    .filter(i => biomas.includes(i.bioma) && computeEstado(i) === "completa").length;

  if (completas < umbral) return; // aún no cumple

  // === MARCAR DESBLOQUEO PERSISTENTE ===
  RUNTIME.meta[flag] = true;

  // === EVITAR REPETICIÓN GLOBAL ===
  window.__RUNTIME_STATE = window.__RUNTIME_STATE || {};
  window.__RUNTIME_STATE.legendariasDesbloqueadas =
    window.__RUNTIME_STATE.legendariasDesbloqueadas || {};

  if (window.__RUNTIME_STATE.legendariasDesbloqueadas[nombre]) {
    console.log(`ℹ️ ${nombre} ya estaba desbloqueada, se ignora.`);
    return;
  }

  // === REGISTRAR SOLO UNA VEZ ===
  window.__RUNTIME_STATE.legendariasDesbloqueadas[nombre] = true;
  window.mensajePendienteWorld = nombre.toLowerCase();

  console.log(`🌟 Desbloqueada ${nombre}! (${biomas.join(", ")})`);
  if (window.storyMode && typeof window.storyMode.trigger === "function") {
    window.storyMode.trigger("islaLegendariaAparecida");
  }

  // 🧭 Añadir la isla legendaria al cache inmediatamente (sin reiniciar escena)
  const wb = RUNTIME._lastWorldBounds || { w: 4000, h: 2000, offsetX: 0 };
  const rng = lcg(hashStringToSeed("legendRefresh"));
  const coords = {
    frozencrown: [Math.floor(wb.w * 0.85), Math.floor(wb.h * 0.15)],
    jadeisland: [Math.floor(wb.w * 0.15), Math.floor(wb.h * 0.22)],
    stormcloud: [Math.floor(wb.w * 0.80), Math.floor(wb.h * 0.18)],
    hellfire: [Math.floor(wb.w * 0.18), Math.floor(wb.h * 0.85)],
    scorchia: [Math.floor(wb.w * 0.85), Math.floor(wb.h * 0.85)]
  };

  const [x, y] = coords[nombre.toLowerCase()] || [wb.w / 2, wb.h / 2];
  const evs = [];
  for (let i = 0; i < 6; i++) evs.push(genEvento(nombre.toLowerCase(), i, rng, nombre.toLowerCase()));

  // 🚫 Evitar duplicar si ya está en cache
  const existe = (RUNTIME.cacheIslas || []).some(i => i.islandId === nombre.toLowerCase());
  if (!existe) {
    RUNTIME.cacheIslas.push({
      islandId: nombre.toLowerCase(),
      nombre,
      bioma: nombre.toLowerCase(),
      x, y,
      eventos: evs
    });
    console.log(`🗺️ Isla ${nombre} añadida dinámicamente al mapa.`);
  } else {
    console.log(`ℹ️ Isla ${nombre} ya existía en el cache (no se duplica).`);
  }
}


// === Aplicaciones concretas de la función ===
desbloquearLegendaria("frozencrownUnlocked", "Frozencrown", ["helado"], 4);
desbloquearLegendaria("scorchiaUnlocked", "Scorchia", ["desert", "desert4"], 4);
desbloquearLegendaria("jadeislandUnlocked", "Jadeisland", ["forest", "jungle"], 3);
desbloquearLegendaria("stormcloudUnlocked", "Stormcloud", ["volante2", "pradera"], 4);
desbloquearLegendaria("hellfireUnlocked", "Hellfire", ["volcan", "cuevadragon"], 4);


  
},



    isEventCompleted(islandId, eventId){
      return isEventDone(islandId, eventId);
    },

    setUltimaPosIsla(islandId, pos){
      const key = String(islandId);
      if(pos) RUNTIME.ultimaPosIsla.set(key, { col: pos.col, row: pos.row });
      else    RUNTIME.ultimaPosIsla.delete(key);
    },

    getUltimaPosIsla(islandId){
      return RUNTIME.ultimaPosIsla.get(String(islandId)) || null;
    },

    setUltimaIslaVisitada(islandId){
      RUNTIME.meta.ultimaIslaVisitada = String(islandId);
    },

    getUltimaIslaVisitada(){
      return RUNTIME.meta.ultimaIslaVisitada ?? null;
    },

    // ===== Helpers de desbloqueo manual =====
    unlockFrozencrown(){
      if (!RUNTIME.meta.frozencrownUnlocked){
        RUNTIME.meta.frozencrownUnlocked = true;
       //RUNTIME.cacheIslas = null;
      //RUNTIME.cacheParams = null;
      }
    },
    isFrozencrownUnlocked(){
      return !!RUNTIME.meta.frozencrownUnlocked;
    },

    unlockJadeisland(){ if(!RUNTIME.meta.jadeislandUnlocked){ RUNTIME.meta.jadeislandUnlocked=true; RUNTIME.cacheIslas=null; RUNTIME.cacheParams=null; } },
isJadeislandUnlocked(){ return !!RUNTIME.meta.jadeislandUnlocked; },

unlockStormcloud(){ if(!RUNTIME.meta.stormcloudUnlocked){ RUNTIME.meta.stormcloudUnlocked=true; RUNTIME.cacheIslas=null; RUNTIME.cacheParams=null; } },
isStormcloudUnlocked(){ return !!RUNTIME.meta.stormcloudUnlocked; },

unlockHellfire(){ if(!RUNTIME.meta.hellfireUnlocked){ RUNTIME.meta.hellfireUnlocked=true; RUNTIME.cacheIslas=null; RUNTIME.cacheParams=null; } },
isHellfireUnlocked(){ return !!RUNTIME.meta.hellfireUnlocked; },

unlockScorchia(){
  if (!RUNTIME.meta.scorchiaUnlocked){
    RUNTIME.meta.scorchiaUnlocked = true;
   //RUNTIME.cacheIslas = null;
      //RUNTIME.cacheParams = null;
  }
},
isScorchiaUnlocked(){
  return !!RUNTIME.meta.scorchiaUnlocked;
},
    // (opcional) Forzar rebuild
    refresh(worldBounds, seedStr){
    //RUNTIME.cacheIslas = null;
      //RUNTIME.cacheParams = null;
      this.init(worldBounds, seedStr);
    },
// ======== MONOLITOS GLOBALES ========

/** 🔹 Devuelve monolitos filtrados por umbrales de nivel por color.
 *   Verde ≥3, Azul ≥5, Rojo ≥10.
 *   También genera perezosamente si ya cumples algún umbral y aún no hay lista.
 */
listMonolitos() {
  // Umbrales por color (ajústalos aquí si cambian en el futuro)
  const UMBRAL_MONOLITO = { verde: 4, azul: 8, rojo: 12, dorado: 15 };

  // Nivel máximo actual del jugador
  const niveles = (window.dragonesJugador || []).map(d => Number(d?.nivel || 1));
  const maxNivel = niveles.length ? Math.max(...niveles) : 1;

  // Generación perezosa: si ya cumples el umbral mínimo (3) y aún no existen, créalos ahora
  if (maxNivel >= Math.min(...Object.values(UMBRAL_MONOLITO))) {
    if (!RUNTIME.monolitosGlobalesTodos || !Array.isArray(RUNTIME.monolitosGlobalesTodos) || RUNTIME.monolitosGlobalesTodos.length === 0) {
      const wb = RUNTIME._lastWorldBounds || { w: 2000, h: 1200, offsetX: 200 }; // fallback seguro
      RUNTIME.monolitosGlobalesTodos = buildMonolitosGlobales(wb);
    }
  }

  const todos = RUNTIME.monolitosGlobalesTodos || [];

  // Filtra por el umbral específico de cada color
  return todos.filter(m => {
    const req = UMBRAL_MONOLITO[m.color] ?? Infinity;
    return maxNivel >= req;
  });
},

/** 🔹 Devuelve un monolito concreto por ID */
getMonolito(id) {
  return (RUNTIME.monolitosGlobalesTodos || []).find(m => m.id === id) || null;
},

/** 🔹 Marca un monolito como completado y notifica a Misiones */
marcarMonolitoCompletado(id) {
  const m = (RUNTIME.monolitosGlobalesTodos || []).find(x => x.id === id);
  if (m && !m.completado) {
    m.completado = true;
    console.log(`[MONOLITO] Completado ${m.id} (${m.color})`);

    if (window.Misiones) {
      Misiones.registrarEvento("monolitoCompletado", { color: m.color, id: m.id });
    }
// BORRAR SI FALLA=== 🔹 Registrar conteo global de monolitos completados ===
window.__RUNTIME_STATE = window.__RUNTIME_STATE || {};
window.__RUNTIME_STATE.eventosCompletados = window.__RUNTIME_STATE.eventosCompletados || {};

const key = `monolito${m.color.charAt(0).toUpperCase() + m.color.slice(1)}`;
window.__RUNTIME_STATE.eventosCompletados[key] =
  (window.__RUNTIME_STATE.eventosCompletados[key] || 0) + 1;

console.log(`[📜 MONOLITO] +1 monolito ${m.color} completado`);

  }
},

/** 🔹 Devuelve los monolitos completados */
listMonolitosCompletados() {
  return (RUNTIME.monolitosGlobalesTodos || []).filter(m => m.completado);
},

/** 🔹 Reinicia el progreso de monolitos (para debug o reinicio de partida) */
resetMonolitos() {
  (RUNTIME.monolitosGlobalesTodos || []).forEach(m => m.completado = false);
  console.log("[MONOLITOS] Reiniciados todos los estados.");
},

    
  };

  global.IslaWorld = IslaWorld;


// =============================================================
// 🧩 EXPORTS GLOBALES NECESARIOS PARA OTRAS ESCENAS (WORLD, ETC.)
// =============================================================

// Exponer funciones internas que SceneWorld necesita
window.genIsla = genIsla;        // 🌍 Generador de islas individuales
window.hashStringToSeed = hashStringToSeed;  // opcional (si se usa)
window.lcg = lcg;                // opcional (si se usa fuera)

})(window);