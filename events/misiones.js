// misiones.js
(function (w) {
  "use strict";
// ===================================================
// 🧺 FUNCIÓN GLOBAL PARA AÑADIR ÍTEMS AL INVENTARIO
// ===================================================
function pushItem(nombre, cantidad = 1, key = null) {
  if (!window.inventarioJugador) window.inventarioJugador = [];

  // Buscar si el ítem ya existe (por nombre o key)
  const existente = window.inventarioJugador.find(
    i => i.nombre === nombre || i.key === nombre || i.key === key
  );

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    window.inventarioJugador.push({
      nombre,
      cantidad,
      key: key || nombre
    });
  }

  console.log(`🧺 Añadido al inventario: ${cantidad}x ${nombre}`);
}

// 🔹 Exportar globalmente para que todas las escenas puedan usarla
window.pushItem = pushItem;
 // 🧠 No sobreescribir si ya existe (por ejemplo, cargado desde SaveGame)
if (!w.__QUESTS_STATE) {
  w.__QUESTS_STATE = { activas: [], completadas: [] };
}
const RUNTIME = w.__QUESTS_STATE;

// === Catálogo base de misiones ===
const MISIONES = (() => {
  // 🔹 Selecciona dragones aleatorios por tier
  function elegirDragonPorTier(tier){
    const candidatos = dragones.filter(d => d.tier === tier);
    return candidatos[Math.floor(Math.random() * candidatos.length)];
  }

  const dragB = elegirDragonPorTier("B");
  const dragA = elegirDragonPorTier("A");
  const dragS = elegirDragonPorTier("S");

  // 🔹 Misiones de exploración (todas tus islas)
  const misionesExploracion = [
    { id:"m01", nombre:"Explorador del Hielo", descripcion:"Completa una isla de tipo helado.", ciudad:["frostgaard","luminaria","silvanost","harruni"], objetivo:{ islasCompletas:1, bioma:["helado"] }, recompensa:{ oro:1000 } },
    { id:"m02", nombre:"Maestro del Fuego", descripcion:"Explora una isla volcánica y domina su calor infernal.", ciudad:["frostgaard","luminaria","silvanost","harruni"], objetivo:{ islasCompletas:1, bioma:["volcan"] }, recompensa:{ oro:1000 } },
    { id:"m03", nombre:"Aventurero Selvático", descripcion:"Adéntrate en una isla selvática y sobrevive a su espesura.", ciudad:["frostgaard","luminaria","silvanost","harruni"], objetivo:{ islasCompletas:1, bioma:["jungle"] }, recompensa:{ oro:1000 } },
    { id:"m04", nombre:"Explorador de la Cueva del Dragón", descripcion:"Supera los peligros de una isla de la cueva del dragón.", ciudad:["frostgaard","luminaria","silvanost","harruni"], objetivo:{ islasCompletas:1, bioma:["cuevadragon"] }, recompensa:{ oro:1200 } },
    { id:"m05", nombre:"Nómada del Desierto", descripcion:"Sobrevive a los peligros del sol en una isla desértica.", ciudad:["frostgaard","luminaria","silvanost","harruni"], objetivo:{ islasCompletas:1, bioma:["desert"] }, recompensa:{ oro:1000 } },
    { id:"m06", nombre:"Viajero del Pantano", descripcion:"Recorre una isla pantanosa y vence a sus criaturas viscosas.", ciudad:["frostgaard","luminaria","silvanost","harruni"], objetivo:{ islasCompletas:1, bioma:["pantano"] }, recompensa:{ oro:1000 } },
    { id:"m07", nombre:"Guardián de la Pradera", descripcion:"Completa una isla de pradera y ayuda a mantener su equilibrio natural.", ciudad:["frostgaard","luminaria","silvanost","harruni"], objetivo:{ islasCompletas:1, bioma:["pradera"] }, recompensa:{ oro:900 } },
    { id:"m08", nombre:"Explorador de las Alturas", descripcion:"Llega hasta las islas flotantes y conquista los cielos.", ciudad:["frostgaard","luminaria","silvanost","harruni"], objetivo:{ islasCompletas:1, bioma:["volante2"] }, recompensa:{ oro:1300 } },
    { id:"m09", nombre:"Aventurero del Desierto IV", descripcion:"Explora una isla del Desierto IV y sobrevive a su aridez extrema.", ciudad:["frostgaard","luminaria","silvanost","harruni"], objetivo:{ islasCompletas:1, bioma:["desert4"] }, recompensa:{ oro:1200 } },
    { id:"m10", nombre:"Explorador del Bosque Antiguo", descripcion:"Descubre los secretos del bosque antiguo y sus guardianes.", ciudad:["frostgaard","luminaria","silvanost","harruni"], objetivo:{ islasCompletas:1, bioma:["forest"] }, recompensa:{ oro:1100 } }
  ];

  // 🔹 Misiones nuevas de captura de dragones (con nivel de dificultad visible)
const misionesCaptura = [
  {
    id: "capB",
    nombre: `Captura a ${dragB.name}`,
    descripcion: `Captura al dragón ${dragB.name}, de tipo ${dragB.tipo}.  
Dificultad: 🟢 Fácil`,
    ciudad: ["frostgaard", "luminaria", "silvanost", "harruni"],
    objetivo: { capturar: 1, dragon: dragB.name },
    recompensa: { objeto: "runarara", cantidad: 1 }
  },
  {
    id: "capA",
    nombre: `Captura a ${dragA.name}`,
    descripcion: `Captura al poderoso ${dragA.name}, de tipo ${dragA.tipo}.  
Dificultad: 🟠 Difícil`,
    ciudad: ["frostgaard", "luminaria", "silvanost", "harruni"],
    objetivo: { capturar: 1, dragon: dragA.name },
    recompensa: { objeto: "runaepica", cantidad: 1 }
  },
  {
    id: "capS",
    nombre: `Captura a ${dragS.name}`,
    descripcion: `Captura al legendario ${dragS.name}, de tipo ${dragS.tipo}.  
Dificultad: 🔴 Muy difícil`,
    ciudad: ["frostgaard", "luminaria", "silvanost", "harruni"],
    objetivo: { capturar: 1, dragon: dragS.name },
    recompensa: { objeto: "runalegendaria", cantidad: 1 }
  }
];

// 🔹 Misiones nuevas: Derrotar a un dragón Épico de cada tipo elemental
const misionesDerrotarEpico = [
  // --- SILVANOST ---
  {
    id: "derrotaEpicoAgua",
    nombre: "Derrota a un dragón épico de Agua",
    descripcion: `Demuestra tu poder derrotando a un dragón de tipo Agua con rareza Épico.  
Recompensa: 🥚 Huevo de Agua  
Dificultad: 🟠 Difícil`,
    ciudad: ["silvanost", "frostgaard"],
    objetivo: { derrotar: 1, tipo: "Agua", rareza: "Épico" },
    recompensa: { objeto: "huevoagua", cantidad: 1 }
  },
  {
    id: "derrotaEpicoRoca",
    nombre: "Derrota a un dragón épico de Roca",
    descripcion: `Derrota a un dragón de tipo Roca con rareza Épico.  
Recompensa: 🥚 Huevo de Roca  
Dificultad: 🟠 Difícil`,
    ciudad: ["silvanost", "luminaria"],
    objetivo: { derrotar: 1, tipo: "Roca", rareza: "Épico" },
    recompensa: { objeto: "huevoroca", cantidad: 1 }
  },
  {
    id: "derrotaEpicoStriker",
    nombre: "Derrota a un dragón épico Striker",
    descripcion: `Derrota a un dragón de tipo Striker con rareza Épico.  
Recompensa: 🥚 Huevo Striker  
Dificultad: 🟠 Difícil`,
    ciudad: ["silvanost", "frostgaard"],
    objetivo: { derrotar: 1, tipo: "Striker", rareza: "Épico" },
    recompensa: { objeto: "huevostriker", cantidad: 1 }
  },

  // --- HARRUNI ---
  {
    id: "derrotaEpicoFuego",
    nombre: "Derrota a un dragón épico de Fuego",
    descripcion: `Derrota a un dragón de tipo Fuego con rareza Épico.  
Recompensa: 🥚 Huevo de Fuego  
Dificultad: 🟠 Difícil`,
    ciudad: ["harruni", "luminaria"],
    objetivo: { derrotar: 1, tipo: "Fuego", rareza: "Épico" },
    recompensa: { objeto: "huevofuego", cantidad: 1 }
  },
  {
    id: "derrotaEpicoTrueno",
    nombre: "Derrota a un dragón épico de Trueno",
    descripcion: `Derrota a un dragón de tipo Trueno con rareza Épico.  
Recompensa: 🥚 Huevo de Trueno  
Dificultad: 🟠 Difícil`,
    ciudad: ["harruni", "luminaria"],
    objetivo: { derrotar: 1, tipo: "Trueno", rareza: "Épico" },
    recompensa: { objeto: "huevotrueno", cantidad: 1 }
  },
  {
    id: "derrotaEpicoMisterio",
    nombre: "Derrota a un dragón épico de Misterio",
    descripcion: `Derrota a un dragón de tipo Misterio con rareza Épico.  
Recompensa: 🥚 Huevo Misterioso  
Dificultad: 🟠 Difícil`,
    ciudad: ["harruni", "frostgaard"],
    objetivo: { derrotar: 1, tipo: "Misterio", rareza: "Épico" },
    recompensa: { objeto: "huevomisterio", cantidad: 1 }
  }
];


 // 🔹 Misión especial de monolito 
 const misionesMonolito = [
  {
    id: "mMonolitoRojo",
    nombre: "Vencedor del Monolito Rojo",
    descripcion: "Derrota a los dragones guardianes del Monolito Rojo, símbolo del fuego y la fuerza.",
    ciudad: [ "luminaria", "harruni"],
    objetivo: { monolitoRojo: 1 },
    recompensa: {
      oro: 3000,
      huevo: {
        prob: [
          { tipo: "Fuego", prob: 40 },
          { tipo: "Roca", prob: 25 },
          { tipo: "Striker", prob: 20 },
          { tipo: "Trueno", prob: 15 }
        ]
      }
    }
  },
  {
    id: "mMonolitoVerde",
    nombre: "Vencedor del Monolito Verde",
    descripcion: "Vence a los dragones guardianes del Monolito Verde, emblema de la naturaleza y el equilibrio.",
    ciudad: ["frostgaard", "luminaria", "silvanost", "harruni"],
    objetivo: { monolitoVerde: 1 },
    recompensa: {
      oro: 2000,
      huevo: {
        prob: [
          { tipo: "Agua", prob: 30 },
          { tipo: "Roca", prob: 30 },
          { tipo: "Striker", prob: 20 },
          { tipo: "Misterio", prob: 20 }
        ]
      }
    }
  },
  {
    id: "mMonolitoAzul",
    nombre: "Vencedor del Monolito Azul",
    descripcion: "Derrota a los dragones guardianes del Monolito Azul, símbolo del conocimiento y la sabiduría.",
    ciudad: ["frostgaard", "silvanost"],
    objetivo: { monolitoAzul: 1 },
    recompensa: {
      oro: 2000,
      huevo: {
        prob: [
          { tipo: "Agua", prob: 40 },
          { tipo: "Trueno", prob: 40 },
          { tipo: "Misterio", prob: 20 }
        ]
      }
    }
  },

  {
  id: "mMonolitoCuatricolor",
  nombre: "Vencedor del Monolito Cuatricolor",
  descripcion: "Demuestra tu maestría derrotando un Monolito Rojo, uno Verde, uno dorado y uno Azul.",
  ciudad: ["frostgaard", "luminaria"],
  objetivo: {
    monolitoRojo: 1,
    monolitoVerde: 1,
    monolitoAzul: 1
  },
  recompensa: {
    oro: 3500,
    huevo: {
      cantidad: 2,
      prob: [
        { tipo: "Fuego", prob: 20 },
        { tipo: "Agua", prob: 20 },
        { tipo: "Trueno", prob: 20 },
        { tipo: "Roca", prob: 20 },
        { tipo: "Misterio", prob: 20 }
      ]
    }
  }
},
{
  id: "mMonolitoDorado",
  nombre: "Vencedor del Monolito Dorado",
  descripcion: "Supera la prueba del Monolito Dorado, donde los elementos convergen.",
  ciudad: ["frostgaard","luminaria","silvanost","harruni"],
  objetivo: { monolitoDorado: 1 },
  recompensa: {
    oro: 4000,
    huevo: { cantidad: 1, prob: [
      { tipo: "Fuego", prob: 33 },
      { tipo: "Trueno", prob: 33 },
      { tipo: "Misterio", prob: 33 }
    ]
  }
  }
},

{
  id: "mTodosMonolitosRojos",
  nombre: "Maestro de los Monolitos Rojos",
  descripcion: "Derrota a todos los monolitos rojos y domina el fuego ancestral que enciende el mundo.",
  ciudad: ["harruni"], // Solo disponible en Frostgaard
  objetivo: { monolitosRojosCompletados: "todos" },
  recompensa: {
    oro: 6000,
    objeto: "cebolegend",      // Cebo para dragones legendarios
    cantidad: 1,
    runa: {                    // Probabilidad de runa adicional
      rara: 65,
      epica: 25,
      legendaria: 10
    },
     huevo: {
  fijo: [
    { tipo: "Fuego" },
    { tipo: "Striker" },
    { tipo: "Trueno" }
  ]
}
    
  }
},
{
  id: "mTodosMonolitosVerdes",
  nombre: "Maestro de los Monolitos Verdes",
  descripcion: "Completa todos los monolitos verdes y alcanza la armonía con la esencia de la naturaleza.",
  ciudad: ["silvanost"], // Solo disponible en Frostgaard
  objetivo: { monolitosVerdesCompletados: "todos" },
  recompensa: {
    oro: 6000,
    objeto: "cebolegend",
    cantidad: 1,
    runa: {
      rara: 65,
      epica: 25,
      legendaria: 10
    },
    huevo: {
  fijo: [
    { tipo: "Roca" },
    { tipo: "Striker" },
    { tipo: "Misterio" }
  ]
}
  }
},
{
  id: "mTodosMonolitosAzules",
  nombre: "Maestro de los Monolitos Azules",
  descripcion: "Completa todos los monolitos azules y demuestra tu sabiduría suprema.",
  ciudad: ["frostgaard"], // Solo disponible en Frostgaard
  objetivo: { monolitosAzulesCompletados: "todos" },
  recompensa: {
    oro: 6000,
    objeto: "cebolegend",
    cantidad: 1,
    runa: {
      rara: 65,
      epica: 25,
      legendaria: 10
    },
    huevo: {
  fijo: [
    { tipo: "Agua" },
    { tipo: "Trueno" },
    { tipo: "Misterio" }
  ]
}
  }
  
}


  ];
  // 🔹 Devolvemos todas combinadas
 return [
  ...misionesExploracion,
  ...misionesCaptura,
  ...misionesDerrotarEpico, // ✅ añadidas aquí
  ...misionesMonolito
];})();

  // === API pública ===
  const Misiones = {
listar(ciudad){
  // 🔎 Nivel máximo del jugador (según tus dragones)
  const nivelMaxJugador = (window.dragonesJugador || [])
    .reduce((max, d) => Math.max(max, d.nivel || 0), 0);

  return MISIONES.filter(m => {
    const esValida =
      (Array.isArray(m.ciudad) && m.ciudad.includes(ciudad)) ||
      m.ciudad === ciudad;

    // 🚫 Evitar mostrar si ya está activa o completada
    if (!esValida) return false;
    if (RUNTIME.activas.find(a => a.id === m.id)) return false;
    if (RUNTIME.completadas.find(c => c.id === m.id)) return false;

    // === 🧩 RESTRICCIÓN DE NIVEL: "todos los monolitos" solo si nivel ≥ 20 ===
    if (
      ["mTodosMonolitosRojos", "mTodosMonolitosVerdes", "mTodosMonolitosAzules"].includes(m.id) &&
      nivelMaxJugador < 20
    ) {
      return false;
    }

    return true;
  });
},


    aceptar(mision){
      if(!RUNTIME.activas.find(m=>m.id===mision.id)){
        RUNTIME.activas.push({...mision, progreso:{}});
      }
    },

    registrarEvento(tipo, data){
  for(const m of RUNTIME.activas){
    const o = m.objetivo || {};

    if (tipo === "islaCompletada") {
      // ✅ Sumar si el bioma coincide (si lo tiene definido)
      if (!o.bioma || o.bioma.includes(data.bioma)) {
        m.progreso.islas = (m.progreso.islas || 0) + 1;
        m.progreso.islasCompletas = (m.progreso.islasCompletas || 0) + 1;
      }
    }

  if (tipo === "dragonDerrotado") {
  console.log("🐉 Evento recibido: dragonDerrotado =>", data);

  // ✅ Misiones genéricas (antiguas)
  if (!o.bioma || o.bioma.includes(data.bioma)) {
    m.progreso.dragones = (m.progreso.dragones || 0) + 1;
  }

  // 🆕 Misiones específicas de derrotar dragones épicos por tipo
  if (o.derrotar && o.tipo && o.rareza) {
    const tipoMatch = data.tipo?.toLowerCase() === o.tipo.toLowerCase();
    const rarezaMatch = data.rareza?.toLowerCase() === o.rareza.toLowerCase();

    console.log(
      `🎯 Comprobando misión ${m.id}:`,
      `tipoMatch=${tipoMatch}`,
      `rarezaMatch=${rarezaMatch}`,
      `(esperado ${o.tipo}/${o.rareza}, recibido ${data.tipo}/${data.rareza})`
    );

    if (tipoMatch && rarezaMatch) {
      m.progreso.derrotar = (m.progreso.derrotar || 0) + 1;
      console.log(
        `✅ Progreso misión ${m.id}: ${m.progreso.derrotar}/${o.derrotar} (${data.tipo} épico derrotado)`
      );

      // 🏁 Marca la misión como completada
      if (m.progreso.derrotar >= o.derrotar && m.estado !== "completada") {
        m.estado = "completada";
        console.log(`🎉 Misión completada: ${m.nombre}`);
      }
    }
  }
}

if (tipo === "dragonCapturado") {
  // Verifica si la misión es de captura y coincide el dragón
  if (o.dragon && data.name === o.dragon) {
    m.progreso.capturar = (m.progreso.capturar || 0) + 1;
  }
}
// === Monolitos completados (eventos por color explícitos) ===
if (tipo === "monolitoRojoCompletado") {
  const c = (data?.color || "").toLowerCase().replace("monolito", "");
  if (o.monolitoRojo && c === "rojo") {
    // Evita dobles incrementos: estas misiones suelen ser 1/1
    m.progreso.monolitoRojo = Math.min(1, (m.progreso.monolitoRojo || 0) + 1);
  }
}

if (tipo === "monolitoVerdeCompletado") {
  const c = (data?.color || "").toLowerCase().replace("monolito", "");
  if (o.monolitoVerde && c === "verde") {
    m.progreso.monolitoVerde = Math.min(1, (m.progreso.monolitoVerde || 0) + 1);
  }
}

if (tipo === "monolitoAzulCompletado") {
  const c = (data?.color || "").toLowerCase().replace("monolito", "");
  if (o.monolitoAzul && c === "azul") {
    m.progreso.monolitoAzul = Math.min(1, (m.progreso.monolitoAzul || 0) + 1);
  }
}

// === NUEVO BLOQUE: seguimiento cuando llega el evento genérico ===
if (tipo === "monolitoCompletado") {
  // Normalizamos el color por seguridad
  const c = (data?.color || "").toLowerCase().replace("monolito", "");

  // ✅ Progreso de misiones de 1× monolito por color (si existen)
  //    Usamos Math.min(1, ...) para no sobre-contar si el evento se dispara dos veces.
  if (c === "rojo" && o.monolitoRojo) {
    m.progreso.monolitoRojo = Math.min(1, (m.progreso.monolitoRojo || 0) + 1);
  }
  if (c === "verde" && o.monolitoVerde) {
    m.progreso.monolitoVerde = Math.min(1, (m.progreso.monolitoVerde || 0) + 1);
  }
  if (c === "azul" && o.monolitoAzul) {
    m.progreso.monolitoAzul = Math.min(1, (m.progreso.monolitoAzul || 0) + 1);
  }

  // 🔢 Contamos globalmente cuántos monolitos de cada color hay completados
  const totalPorColor = { rojo: 0, verde: 0, azul: 0 };
  if (window.IslaWorld && typeof IslaWorld.listMonolitosCompletados === "function") {
    try {
      IslaWorld.listMonolitosCompletados().forEach(mono => {
        const color = (mono?.color || "").toLowerCase();
        if (mono?.completado && totalPorColor.hasOwnProperty(color)) {
          totalPorColor[color]++;
        }
      });
    } catch (e) {
      console.warn("IslaWorld.listMonolitosCompletados() lanzó un error:", e);
    }
  }

  // 🟥 Misión: Maestro de los Monolitos Rojos
  if (o.monolitosRojosCompletados && c === "rojo") {
    m.progreso.monolitosRojosCompletados = totalPorColor.rojo;
    if (totalPorColor.rojo >= 5) {
      console.log("✅ Todos los monolitos rojos completados");
    }
  }

  // 🟩 Misión: Maestro de los Monolitos Verdes
  if (o.monolitosVerdesCompletados && c === "verde") {
    m.progreso.monolitosVerdesCompletados = totalPorColor.verde;
    if (totalPorColor.verde >= 5) {
      console.log("✅ Todos los monolitos verdes completados");
    }
  }

  // 🟦 Misión: Maestro de los Monolitos Azules
  if (o.monolitosAzulesCompletados && c === "azul") {
    m.progreso.monolitosAzulesCompletados = totalPorColor.azul;
    if (totalPorColor.azul >= 5) {
      console.log("✅ Todos los monolitos azules completados");
    }
  }
}


  }
},


    comprobarCumplidas(ciudad) {
  const cumplidas = [];

  for (const m of RUNTIME.activas) {
    const p = m.progreso || {};
    const o = m.objetivo || {};
    let completada = true;

    for (const key in o) {
      const requerido = o[key];
      const hecho = p[key] || 0;

      // 🧩 CASOS ESPECIALES: misiones "todos los monolitos"
      if (requerido === "todos") {
        let totalColor = 0;
        let completadosColor = 0;
        const monolitosGlobales = window.__RUNTIME_STATE?.monolitosGlobalesTodos || [];

        if (key.includes("Rojos")) {
          totalColor = monolitosGlobales.filter(m => m.color === "rojo").length;
          completadosColor = monolitosGlobales.filter(m => m.color === "rojo" && m.completado).length;
        } else if (key.includes("Verdes")) {
          totalColor = monolitosGlobales.filter(m => m.color === "verde").length;
          completadosColor = monolitosGlobales.filter(m => m.color === "verde" && m.completado).length;
        } else if (key.includes("Azules")) {
          totalColor = monolitosGlobales.filter(m => m.color === "azul").length;
          completadosColor = monolitosGlobales.filter(m => m.color === "azul" && m.completado).length;
        }

        // ✅ Solo se marca como completada si ha vencido todos los monolitos de ese color
        if (totalColor === 0 || completadosColor < totalColor) {
          completada = false;
          break;
        }
      } 
      // 🧮 CASOS NORMALES (comparación numérica)
      else {
        if (hecho < requerido) {
          completada = false;
          break;
        }
      }
    }

    if (completada) cumplidas.push(m);
  }

  // ✅ Entrega manual (solo cuando se llama desde el tablón)
  cumplidas.forEach(m => {
    // Quitar de activas y pasar a completadas
    RUNTIME.activas = RUNTIME.activas.filter(a => a.id !== m.id);
    RUNTIME.completadas.push(m);

    // Recompensa: añadir oro al inventario del jugador
    if (!window.inventarioJugador) window.inventarioJugador = [];
    let oro = window.inventarioJugador.find(i => i.nombre === "Monedas");
    if (oro) oro.cantidad += m.recompensa.oro;
    else window.inventarioJugador.push({ nombre: "Monedas", cantidad: m.recompensa.oro });
  });

  return cumplidas;
},



    estado(){ return RUNTIME; }
  };

  w.Misiones = Misiones;
})(window);

/***** =========================
 * ESCENA TABLÓN DE MISIONES
 * ========================== */
class SceneTablonMisiones extends Phaser.Scene {
  constructor() { super("SceneTablonMisiones"); }

  init(data) {
    this.ciudad = data.ciudad || "luminaria";
  }

 create() {
  // Fondo y título fijos
  this.add.rectangle(500, 300, 1000, 600, 0x000000, 0.85);
  this.add.text(500, 70, `📜 Tablón de ${this.ciudad}`, {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "32px",
    fill: "#ffd700",
    stroke: "#000",
    strokeThickness: 4
  }).setOrigin(0.5);

  // --- Contenedor scrollable ---
  const container = this.add.container(0, 0);
  let y = 140;

  // Misiones
  let disponibles = Misiones.listar(this.ciudad);
  if (disponibles.length > 3) {
    Phaser.Utils.Array.Shuffle(disponibles);
    disponibles = disponibles.slice(0, 3);
  }

  // === MISIONES ACTIVAS ===
const todasActivas = Misiones.estado().activas || [];
const activas = todasActivas
  .map(m => {
    // Si es string, buscar el objeto base por ID
    if (typeof m === "string") {
      return (Misiones.listar(this.ciudad).find(x => x.id === m)) ||
             (window.MISIONES?.find?.(x => x.id === m)) || null;
    }
    // Si es objeto, usar directamente
    return m;
  })
  .filter(m => m && (
    (Array.isArray(m.ciudad) && m.ciudad.includes(this.ciudad)) ||
    m.ciudad === this.ciudad
  ));

  const completadas = Misiones.estado().completadas.filter(m =>
    (Array.isArray(m.ciudad) && m.ciudad.includes(this.ciudad)) ||
    m.ciudad === this.ciudad
  );

  // === MISIONES DISPONIBLES ===
  container.add(this.add.text(180, y, "🆕 Misiones disponibles:", { fontFamily: "'Cinzel Decorative', serif",
fontSize:"22px", fill:"#0f0" }));
  y += 40;

  if (disponibles.length === 0) {
    container.add(this.add.text(200, y, "No hay nuevas misiones en esta ciudad.", { fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#ccc" }));
    y += 40;
  } else {
    disponibles.forEach((m) => {
      container.add(this.add.text(180, y, `🗺️ ${m.nombre}`, { fontFamily: "'Cinzel Decorative', serif",
fontSize:"22px", fill:"#fff" }));
      container.add(this.add.text(200, y + 25, m.descripcion, { fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#ccc", wordWrap:{width:600} }));

      const btn = this.add.text(850, y + 10, "✅ Aceptar", {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px", fill: "#0f0", backgroundColor: "#333",
        padding: { left: 10, right: 10, top: 4, bottom: 4 }
      }).setInteractive();

      btn.on("pointerdown", () => {
        Misiones.aceptar(m);
        btn.setText("✔ Aceptada").setStyle({ fill: "#aaa" });
      });
      btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#555", fill: "#ffd700" }));
      btn.on("pointerout", () => btn.setStyle({ backgroundColor: "#333", fill: "#0f0" }));

      container.add(btn);
      y += 90;
    });
  }

  // === MISIONES ACTIVAS ===
  y += 30;
  container.add(this.add.text(180, y, "📌 Misiones activas:", { fontFamily: "'Cinzel Decorative', serif",
fontSize:"22px", fill:"#ffd700" }));
  y += 40;

  if (activas.length === 0) {
    container.add(this.add.text(200, y, "No tienes misiones activas en esta ciudad.", { fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#ccc" }));
    y += 40;
  } else {
    activas.forEach(m => {
      const prog = m.progreso || {};
      const o = m.objetivo || {};
      const textoProg = Object.keys(o).map(k => `${k}: ${(prog[k]||0)}/${o[k]}`).join(" | ");

      container.add(this.add.text(180, y, `🔹 ${m.nombre}`, { fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#fff" }));
      container.add(this.add.text(200, y + 22, textoProg, { fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px", fill:"#ccc" }));

      // Comprobación universal de cumplimiento
      // Comprobación universal de cumplimiento
let completada = true;
for (const key in o) {
  const requerido = o[key];
  const hecho = prog[key] || 0;

  if (requerido === "todos") {
    let totalColor = 0;
    let completadosColor = 0;
    const monolitosGlobales = window.__RUNTIME_STATE?.monolitosGlobalesTodos || [];

    if (key.includes("Rojos")) {
      totalColor = monolitosGlobales.filter(m => m.color === "rojo").length;
      completadosColor = monolitosGlobales.filter(m => m.color === "rojo" && m.completado).length;
    } else if (key.includes("Verdes")) {
      totalColor = monolitosGlobales.filter(m => m.color === "verde").length;
      completadosColor = monolitosGlobales.filter(m => m.color === "verde" && m.completado).length;
    } else if (key.includes("Azules")) {
      totalColor = monolitosGlobales.filter(m => m.color === "azul").length;
      completadosColor = monolitosGlobales.filter(m => m.color === "azul" && m.completado).length;
    }

    if (totalColor === 0 || completadosColor < totalColor) {
      completada = false;
      break;
    }
  } else {
    if (hecho < requerido) { completada = false; break; }
  }
}

      if (completada) {
        const btnEntregar = this.add.text(850, y + 15, "🎁 Entregar", {
          fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#0f0", backgroundColor: "#333",
          padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setInteractive();

       btnEntregar.on("pointerdown", () => {
  // ✅ Entrega solo esta misión
  const idx = Misiones.estado().activas.findIndex(a => a.id === m.id);
  if (idx !== -1) {
    const entregada = Misiones.estado().activas[idx];
    Misiones.estado().activas.splice(idx, 1);
    Misiones.estado().completadas.push(entregada);
       // 📜 Notificar modo historia: misión normal completada
    if (window.storyMode) window.storyMode.trigger("normalQuestCompleted");

    if (!window.inventarioJugador) window.inventarioJugador = [];

    // === 1️⃣ Recompensa de oro ===
    if (entregada.recompensa?.oro) {
      let oro = window.inventarioJugador.find(i => i.nombre === "Monedas");
      if (oro) oro.cantidad += entregada.recompensa.oro;
      else window.inventarioJugador.push({ nombre: "Monedas", cantidad: entregada.recompensa.oro });
    }

    // === 2️⃣ Recompensa de huevo (probabilística) ===
    let huevoGanado = null;
    if (entregada.recompensa?.huevo?.prob?.length) {
      const lista = entregada.recompensa.huevo.prob;
      const total = lista.reduce((sum, h) => sum + h.prob, 0);
      const rnd = Math.random() * total;
      let acum = 0;
      for (const h of lista) {
        acum += h.prob;
        if (rnd <= acum) {
          huevoGanado = h.tipo.toLowerCase();
          break;
        }
      }

      if (huevoGanado) {
        const key = "huevo" + huevoGanado;
        const nombre = `Huevo de dragón de ${huevoGanado.charAt(0).toUpperCase() + huevoGanado.slice(1)}`;
        pushItem(nombre, 1, key);
      }
    }
  // === 🥚 Recompensa de huevos fijos (misiones especiales) ===
    if (entregada.recompensa?.huevo?.fijo?.length) {
      if (!window.huevosIncubando) window.huevosIncubando = [];

      entregada.recompensa.huevo.fijo.forEach(h => {
        window.huevosIncubando.push({
          tipo: h.tipo,
          diasRestantes: 3 + Math.floor(Math.random() * 3),
          notificado: false
        });

        // También se puede registrar visualmente como ítem
        const key = "huevo" + h.tipo.toLowerCase();
        const nombre = `Huevo de dragón de ${h.tipo}`;
        pushItem(nombre, 1, key);
      });

      console.log("🥚 Huevos fijos añadidos:", entregada.recompensa.huevo.fijo.map(h => h.tipo).join(", "));
    }
    // === 3️⃣ Popup visual de recompensa ===
    const popup = this.add.container(500, 300).setDepth(9999);
    const fondo = this.add.rectangle(0, 0, 550, 280, 0x000000, 0.85)
      .setStrokeStyle(3, 0xffd700);
    popup.add(fondo);

    const titulo = this.add.text(0, -100, "🏅 ¡Misión completada!", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "28px", fill: "#ffd700", stroke: "#000", strokeThickness: 3
    }).setOrigin(0.5);
    popup.add(titulo);

    const nombreTxt = this.add.text(0, -60, entregada.nombre, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px", fill: "#fff"
    }).setOrigin(0.5);
    popup.add(nombreTxt);

    let textoRecomp = `💰 ${entregada.recompensa.oro} monedas`;
    if (huevoGanado) textoRecomp += `\n🥚 + Huevo de ${huevoGanado}`;
    const recompensaTxt = this.add.text(0, 10, textoRecomp, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px", fill: "#0f0", align: "center"
    }).setOrigin(0.5);
    popup.add(recompensaTxt);

    // Mostrar icono del huevo si hay
    if (huevoGanado) {
      const img = this.add.image(0, -10, "huevo" + huevoGanado).setScale(0.8).setDepth(1000);
      popup.add(img);
    }

    const btnOK = this.add.text(0, 90, "Aceptar", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px", fill: "#fff", backgroundColor: "#333",
      padding: { left: 20, right: 20, top: 8, bottom: 8 }
    }).setOrigin(0.5).setInteractive();

    btnOK.on("pointerdown", () => {
      popup.destroy();
      this.scene.restart({ ciudad: this.ciudad });
    });
    btnOK.on("pointerover", () => btnOK.setStyle({ backgroundColor: "#555", fill: "#ffd700" }));
    btnOK.on("pointerout", () => btnOK.setStyle({ backgroundColor: "#333", fill: "#fff" }));

    popup.add(btnOK);
  }
});

        btnEntregar.on("pointerover", () => btnEntregar.setStyle({ backgroundColor: "#555", fill: "#ffd700" }));
        btnEntregar.on("pointerout", () => btnEntregar.setStyle({ backgroundColor: "#333", fill: "#0f0" }));

        container.add(btnEntregar);
      }

      y += 60;
    });
  }

  // === MISIONES COMPLETADAS ===
  y += 30;
  container.add(this.add.text(180, y, "🏅 Misiones completadas:", { fontFamily: "'Cinzel Decorative', serif",
fontSize:"22px", fill:"#0af" }));
  y += 40;

  if (completadas.length === 0) {
    container.add(this.add.text(200, y, "Aún no has completado misiones aquí.", { fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#ccc" }));
  } else {
    completadas.slice(-3).forEach(m => {
      container.add(this.add.text(180, y, `✅ ${m.nombre}`, { fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#aaa" }));
      container.add(this.add.text(200, y + 22, `Recompensa: ${m.recompensa.oro}💰`, { fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px", fill:"#777" }));
      y += 50;
    });
  }

  // === SCROLL ===
  const maxScroll = Math.max(0, y - 450);
  container.y = 0;
  this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
    container.y -= deltaY * 0.5;
    if (container.y > 0) container.y = 0;
    if (container.y < -maxScroll) container.y = -maxScroll;
  });

  // === Botón Volver fijo ===
// === Botón Volver fijo ===
const btnVolver = this.add.text(1200, 100, "⬅ Volver", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "24px", fill: "#fff", backgroundColor: "#333",
  padding: { left: 15, right: 15, top: 5, bottom: 5 }
}).setOrigin(0.5).setInteractive();

btnVolver.on("pointerdown", () => this.scene.start("SceneCiudad"));
btnVolver.on("pointerover", () => btnVolver.setStyle({ backgroundColor: "#555", fill: "#ffd700" }));
btnVolver.on("pointerout", () => btnVolver.setStyle({ backgroundColor: "#333", fill: "#fff" }));
}

}
// =======================================================
// 🐉 FIX — Inicialización diferida del catálogo de misiones
// =======================================================
(function esperarDragonesYReinicializarMisiones() {
  let intentos = 0;
  const timer = setInterval(() => {
    intentos++;
    if (Array.isArray(window.dragones) && window.dragones.length > 0) {
      clearInterval(timer);

      console.log("🧩 Dragones cargados, regenerando catálogo de misiones...");

      // Recalcular dragones por tier
      const elegirDragonPorTier = (tier) => {
        const candidatos = window.dragones.filter(d => d.tier === tier);
        return candidatos[Math.floor(Math.random() * candidatos.length)];
      };

      const dragB = elegirDragonPorTier("B");
      const dragA = elegirDragonPorTier("A");
      const dragS = elegirDragonPorTier("S");

      // Actualizar misiones dinámicas (solo si no existen aún)
      if (window.MISIONES && window.MISIONES.length < 5) {
        const nuevasCapturas = [
          {
            id: "capB",
            nombre: `Captura a ${dragB.name}`,
            descripcion: `Captura al dragón ${dragB.name}, de tipo ${dragB.tipo}. Dificultad: 🟢 Fácil`,
            ciudad: ["frostgaard", "luminaria", "silvanost", "harruni"],
            objetivo: { capturar: 1, dragon: dragB.name },
            recompensa: { objeto: "runarara", cantidad: 1 }
          },
          {
            id: "capA",
            nombre: `Captura a ${dragA.name}`,
            descripcion: `Captura al poderoso ${dragA.name}, de tipo ${dragA.tipo}. Dificultad: 🟠 Difícil`,
            ciudad: ["frostgaard", "luminaria", "silvanost", "harruni"],
            objetivo: { capturar: 1, dragon: dragA.name },
            recompensa: { objeto: "runaepica", cantidad: 1 }
          },
          {
            id: "capS",
            nombre: `Captura a ${dragS.name}`,
            descripcion: `Captura al legendario ${dragS.name}, de tipo ${dragS.tipo}. Dificultad: 🔴 Muy difícil`,
            ciudad: ["frostgaard", "luminaria", "silvanost", "harruni"],
            objetivo: { capturar: 1, dragon: dragS.name },
            recompensa: { objeto: "runalegendaria", cantidad: 1 }
          }
        ];

        // Fusionar con las misiones ya existentes
        window.MISIONES = [...(window.MISIONES || []), ...nuevasCapturas];
        console.log("✅ Catálogo MISIONES regenerado correctamente");
      }
    }

    if (intentos > 20) clearInterval(timer); // 10 segundos de intentos
  }, 500);
})();
// =======================================================
// 🧩 LOG DE DEPURACIÓN — Diagnóstico de MISIONES
// =======================================================
(function debugMisionesInit() {
  console.log("🔍 [DEBUG MISIONES] Bloque de depuración iniciado.");
  console.log("🟢 Estado inicial de window.MISIONES:", Array.isArray(window.MISIONES) ? window.MISIONES.length : "no existe");
  console.log("🟢 Estado inicial de window.dragones:", Array.isArray(window.dragones) ? window.dragones.length : "no existe");

  let intentos = 0;
  const timer = setInterval(() => {
    intentos++;

    // Log de seguimiento
    console.log(`[DEBUG MISIONES] Intento ${intentos}...`);
    if (!window.dragones) {
      console.log("⚠️ Aún no existe window.dragones.");
    } else {
      console.log(`✅ window.dragones existe con ${window.dragones.length} dragones.`);
    }

    if (Array.isArray(window.dragones) && window.dragones.length > 0) {
      clearInterval(timer);
      console.log("✅ [DEBUG] Dragones detectados. Iniciando reconstrucción de misiones...");

      try {
        const elegirDragonPorTier = (tier) => {
          const candidatos = window.dragones.filter(d => d.tier === tier);
          console.log(`🎯 Tier ${tier}: ${candidatos.length} candidatos.`);
          return candidatos[Math.floor(Math.random() * candidatos.length)];
        };

        const dragB = elegirDragonPorTier("B");
        const dragA = elegirDragonPorTier("A");
        const dragS = elegirDragonPorTier("S");

        console.log("🐉 Elegidos:", { dragB, dragA, dragS });

        const nuevas = [
          {
            id: "capB",
            nombre: `Captura a ${dragB?.name || "???"}`,
            descripcion: `Captura al dragón ${dragB?.name || "???"}.`,
            ciudad: ["frostgaard", "luminaria"],
            recompensa: { objeto: "runarara", cantidad: 1 }
          },
          {
            id: "capA",
            nombre: `Captura a ${dragA?.name || "???"}`,
            descripcion: `Captura al dragón ${dragA?.name || "???"}.`,
            ciudad: ["frostgaard", "luminaria"],
            recompensa: { objeto: "runaepica", cantidad: 1 }
          },
          {
            id: "capS",
            nombre: `Captura a ${dragS?.name || "???"}`,
            descripcion: `Captura al dragón ${dragS?.name || "???"}.`,
            ciudad: ["frostgaard", "luminaria"],
            recompensa: { objeto: "runalegendaria", cantidad: 1 }
          }
        ];

        if (!Array.isArray(window.MISIONES) || window.MISIONES.length === 0) {
          window.MISIONES = nuevas;
          console.log("✅ [DEBUG] Catálogo MISIONES regenerado desde cero.");
        } else {
          console.log("ℹ️ [DEBUG] MISIONES ya existente. No se sobrescribe.");
        }

        console.log("📜 [DEBUG] Resultado final:", window.MISIONES);
      } catch (err) {
        console.error("❌ Error reconstruyendo MISIONES:", err);
      }
    }

    if (intentos > 20) {
      clearInterval(timer);
      console.warn("⚠️ [DEBUG] Se agotaron los intentos de detección (10s).");
    }
  }, 500);
})();
window.SceneTablonMisiones = SceneTablonMisiones;

/***** =========================
 * ESCENA MISIONES ACTIVAS
 * ========================== */
class SceneMisionesActivas extends Phaser.Scene {
  constructor() { super("SceneMisionesActivas"); }

  init(data) {
    this.ciudad = data?.ciudad || "luminaria";
    window.ultimaEscena = data?.from || "SceneWorld";
  }

  create() {
    this.add.rectangle(500, 300, 1000, 600, 0x000000, 0.8);

    this.add.text(500, 60, "📋 Misiones activas", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "34px", fill: "#ffd700", stroke: "#000", strokeThickness: 5
    }).setOrigin(0.5);

    const activas = Misiones.estado().activas;
    let y = 130;

    if (activas.length === 0) {
      this.add.text(500, 300, "No tienes misiones activas.", { fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px", fill: "#ccc" }).setOrigin(0.5);
    } else {
      activas.forEach(m=>{
        const p = m.progreso || {};
        const o = m.objetivo || {};

        let totalObjetivos = 0, totalCumplido = 0;

          // 🏝️ Islas normales
          if (o.islas) { totalObjetivos++; if ((p.islas||0) >= o.islas) totalCumplido++; }
          if (o.islasCompletas) { totalObjetivos++; if ((p.islasCompletas||0) >= o.islasCompletas) totalCumplido++; }

          // 🐉 Dragones vencidos
          if (o.dragones) { totalObjetivos++; if ((p.dragones||0) >= o.dragones) totalCumplido++; }

          // 🧩 Monolitos individuales
          if (o.monolitoRojo)  { totalObjetivos++; if ((p.monolitoRojo||0)  >= o.monolitoRojo)  totalCumplido++; }
          if (o.monolitoVerde) { totalObjetivos++; if ((p.monolitoVerde||0) >= o.monolitoVerde) totalCumplido++; }
          if (o.monolitoAzul)  { totalObjetivos++; if ((p.monolitoAzul||0)  >= o.monolitoAzul)  totalCumplido++; }

          // 🔢 Misiones “Maestro de todos los monolitos”
          if (o.monolitosRojosCompletados)  { totalObjetivos++; if ((p.monolitosRojosCompletados||0)  >= o.monolitosRojosCompletados)  totalCumplido++; }
          if (o.monolitosVerdesCompletados) { totalObjetivos++; if ((p.monolitosVerdesCompletados||0) >= o.monolitosVerdesCompletados) totalCumplido++; }
          if (o.monolitosAzulesCompletados) { totalObjetivos++; if ((p.monolitosAzulesCompletados||0) >= o.monolitosAzulesCompletados) totalCumplido++; }

          // 🎯 Capturas
          if (o.capturar) { totalObjetivos++; if ((p.capturar||0) >= o.capturar) totalCumplido++; }
        const completado = totalCumplido >= totalObjetivos;
        const progresoTxt = [
          o.islas ? `🌍 Islas: ${p.islas||0}/${o.islas}` : null,
          o.dragones ? `🐉 Dragones: ${p.dragones||0}/${o.dragones}` : null,
          o.islasCompletas ? `🏝️ Islas completas: ${p.islas||0}/${o.islasCompletas}` : null
        ].filter(Boolean).join("   |   ");

        const color = completado ? "#0f0" : "#fff";

        this.add.rectangle(500, y + 30, 800, 80, 0x111111, 0.6)
          .setStrokeStyle(2, completado ? 0x00ff00 : 0xffffff);

        this.add.text(180, y, `${m.nombre}`, { fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px", fill: color });
        this.add.text(200, y + 26, progresoTxt, { fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#ccc" });

        if (completado) {
          this.add.text(850, y + 20, "✅", { fontFamily: "'Cinzel Decorative', serif",
fontSize: "28px", fill: "#0f0" }).setOrigin(0.5);
        }
        y += 90;
      });
    }

    // Botón volver (arriba derecha)
    const W = this.sys.game.config.width;
    const btnVolver = this.add.text(W - 40, 25, "⬅ Volver", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "24px", fill: "#fff", backgroundColor: "#333",
      padding: { left: 14, right: 14, top: 6, bottom: 6 }
    }).setOrigin(1,0).setScrollFactor(0).setDepth(2000).setInteractive();

    btnVolver.on("pointerover", ()=> btnVolver.setStyle({ backgroundColor:"#555", fill:"#ffd700" }));
    btnVolver.on("pointerout", ()=> btnVolver.setStyle({ backgroundColor:"#333", fill:"#fff" }));
    btnVolver.on("pointerdown", ()=> this.scene.start(window.ultimaEscena || "SceneWorld"));
  }
}

/***** =========================
 * ESCENA EVENTOS COMPLETADOS
 * ========================== */
class SceneEventosCompletados extends Phaser.Scene {
  constructor() { super("SceneEventosCompletados"); }

  create() {
    // Fondo oscuro y marco
    this.add.rectangle(500, 300, 1000, 600, 0x000000, 0.85);

    this.add.text(500, 70, "📜 Eventos completados", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "32px",
      fill: "#ffd700",
      stroke: "#000",
      strokeThickness: 5
    }).setOrigin(0.5);

    // Contenedor scrollable (por si hay muchas islas)
    const cont = this.add.container(0, 0);
    let y = 140;

    // --- Datos globales de eventos completados ---
    const eventosState = window.__RUNTIME_STATE?.eventosCompletados || {};
    // Estructura esperada:
    // { volcan: 5, jungle: 3, desert: 2, monolitoAzul: 1, monolitoVerde: 0, monolitoRojo: 2, ... }

    const keys = Object.keys(eventosState);
    if (keys.length === 0) {
      cont.add(this.add.text(500, 300, "Aún no has completado ningún evento.", {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
        fill: "#ccc"
      }).setOrigin(0.5));
    } else {
      // --- Mostrar islas y biomas ---
      for (const [key, valor] of Object.entries(eventosState)) {
        const esMonolito = key.toLowerCase().includes("monolito");
        const texto = esMonolito
          ? `🏛️ ${key.replace("monolito", "Monolito ")}: ${valor}`
          : `🌍 Isla ${key}: ${valor} eventos completados`;

        cont.add(this.add.text(180, y, texto, {
          fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
          fill: esMonolito ? "#00bfff" : "#fff"
        }));
        y += 50;
      }
    }

    // === Scroll con rueda (idéntico a Dragocodex/Inventario) ===
    const maxScroll = Math.max(0, y - 480);
    cont.y = 0;
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
      cont.y -= deltaY * 0.5;
      if (cont.y > 0) cont.y = 0;
      if (cont.y < -maxScroll) cont.y = -maxScroll;
    });

    // === Botón Volver ===
    const btnVolver = this.add.text(500, 550, "⬅ Volver", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "24px",
      fill: "#fff",
      backgroundColor: "#333",
      padding: { left: 15, right: 15, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive();

    btnVolver.on("pointerover", () => btnVolver.setStyle({ backgroundColor: "#555", fill: "#ffd700" }));
    btnVolver.on("pointerout",  () => btnVolver.setStyle({ backgroundColor: "#333", fill: "#fff" }));
    btnVolver.on("pointerdown", () => this.scene.start("SceneWorld"));
  }
}

window.SceneEventosCompletados = SceneEventosCompletados;

window.SceneMisionesActivas = SceneMisionesActivas;
