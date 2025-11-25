/***** =========================
 * SISTEMA DE ENCUENTROS (dragones enemigos)
 * ========================== */

// Probabilidades de tier según nivel (0-1)
const PROB_TIERS = {
  A: { base: 0.25, max: 0.4 },  // empieza en 15% y escala hasta 35%
  S: { base: 0.1, max: 0.2 }   // empieza en 3% y escala hasta 15%
};

// Pesos extra según bioma y tipo de dragón
const BONUS_BIOMA = {
  helado:      { Agua: 2, Misterio: 2, Trueno: 1 },
  volcan:      { Fuego: 4, Trueno: 2 },
  jungle:      { Striker: 2, Agua: 2, Roca: 2 },
  cuevadragon: { Trueno: 2, Striker: 2 },
  desert:      { Roca: 2, Fuego: 2, Misterio: 1 },
  scorchia:    { Roca: 3, Fuego: 2, Misterio: 1 },
  pantano:     { Trueno: 2, Misterio: 2, Agua: 2 },
  pradera:     { Fuego: 1, Roca: 1, Agua: 1, Misterio: 1, Striker: 1, Trueno: 1 }, // neutro
  frozencrown: { Agua: 10, Misterio: 10 }, // especial
  jadeisland: { Misterio: 8, Roca: 2 },
  stormcloud: { Trueno: 8, Striker: 3 },
  hellfire:   { Fuego: 10, Trueno: 3 },

  // 🌪️ Volante2 → dragones veloces y aéreos
  volante2:    { Trueno: 3, Striker: 3 },

  // 🏜️ Desert4 → dragones de arena y fuego
  desert4:     { Roca: 3, Fuego: 3, Trueno: 1 },

  // 🌲 Forest → dragones de naturaleza y agua
  forest:      { Agua: 2, Striker: 2, Misterio: 1 }
};

// ==========================
// Objeto principal ENCUENTROS
// ==========================

const encuentros = {

  // 📌 Calcula el nivel del enemigo normal
 // 📌 Calcula el nivel del enemigo normal según el dragón ACTIVO
nivelRival() {
  // 🐉 Buscar dragón activo
  let dragonActivo = null;

  // Primero intentamos por el flag .activo
  if (Array.isArray(window.dragonesJugador)) {
    dragonActivo = window.dragonesJugador.find(d => d.activo);
  }

  // Si no hay ninguno activo, usar window.dragon1 (fallback clásico)
  if (!dragonActivo && window.dragon1) {
    dragonActivo = window.dragon1;
  }

  // Si aún así no hay dragón, nivel 1-3 aleatorio
  if (!dragonActivo) {
    return Phaser.Math.Between(1, 3);
  }

  const nivelBase = dragonActivo.nivel || 1;

  // Ajuste ±2 niveles respecto al dragón activo
  const minNivel = Math.max(1, nivelBase - 2);
  const maxNivel = Math.min(roleplay.maxNivel, nivelBase + 2);

  const nivelFinal = Phaser.Math.Between(minNivel, maxNivel);

  console.log(`🐉 Nivel rival derivado del dragón activo (${dragonActivo.name} nivel ${nivelBase}) → nivel enemigo ${nivelFinal}`);

  return nivelFinal;
},


  // 📌 Encuentro normal (por tier y bioma)
 // 📌 Encuentro normal (por tier y bioma)
elegirRival(nivel, jugador, islaTipo) {
  if (!Array.isArray(dragones) || dragones.length === 0) {
    console.warn("⚠️ No hay dragones definidos en el array global.");
    return null;
  }

  console.log("DEBUG bonusAtraccion:", window.bonusAtraccion);

  // ===== Probabilidad por TIER =====
  const probA = PROB_TIERS.A.base + (nivel - 1) * (PROB_TIERS.A.max - PROB_TIERS.A.base) / 9;
  const probS = PROB_TIERS.S.base + (nivel - 1) * (PROB_TIERS.S.max - PROB_TIERS.S.base) / 9;
  const r = Math.random();

  let candidatos;

  // ===== Selección aleatoria normal por TIER =====
  if (r < probS) {
    candidatos = dragones.filter(d => d.tier === "S" && (!jugador || d.name !== jugador.name));
  } else if (r < probS + probA) {
    candidatos = dragones.filter(d => d.tier === "A" && (!jugador || d.name !== jugador.name));
  } else {
    candidatos = dragones.filter(d => d.tier === "B" && (!jugador || d.name !== jugador.name));
  }

  // ===== Ajuste según bioma =====
  const bonus = BONUS_BIOMA[islaTipo] || {};
  let bolsa = [];

  candidatos.forEach(d => {
    let peso = bonus[d.tipo] || 1;
    for (let i = 0; i < peso; i++) { bolsa.push(d); }
  });

  if (bolsa.length === 0) {
    console.warn("⚠️ No hay candidatos disponibles, se devuelve cualquier dragón aleatorio.");
    return dragones[Math.floor(Math.random() * dragones.length)];
  }

  // 🎲 Elegir dragón final
  let dragonElegido = bolsa[Math.floor(Math.random() * bolsa.length)];

  // ======================
  // 🌀 Aplicar efecto de Runa de Atracción (forzar rareza)
  // ======================
  if (window.bonusAtraccion && window.bonusAtraccion.activo && window.bonusAtraccion.usosRestantes > 0) {
    const tipoRuna = (window.bonusAtraccion.rareza || "").toLowerCase();

    if (tipoRuna === "epica" || tipoRuna === "épica") {
      dragonElegido.rareza = "Épico";
    } else if (tipoRuna === "legendaria" || tipoRuna === "legendario") {
      dragonElegido.rareza = "Legendario";
    }

    console.log(`✨ Runa de Atracción activa → forzando rareza ${dragonElegido.rareza}`);

    // Consumir el uso
    window.bonusAtraccion.usosRestantes--;
    if (window.bonusAtraccion.usosRestantes <= 0) {
      window.bonusAtraccion.activo = false;
    }
  }

  // ✅ Devolver dragón final con rareza aplicada
  return dragonElegido;
},


// 📌 Encuentro especial FROSTEND (solo boss de Frozencrown)
lanzarFrostend(scene){
  let candidatos = dragones.filter(d => d.tier === "S" && d.tipo === "Agua");
  if (candidatos.length === 0) candidatos = dragones.filter(d => d.tier === "S");
  const baseDragon = Phaser.Utils.Array.GetRandom(candidatos);

  const activos = (window.dragonesJugador || []).filter(d => d.activo);
  const maxNivelJugador = activos.length > 0 ? Math.max(...activos.map(d=>d.nivel||1)) : 1;
  const nivelFinal = Math.min(roleplay.maxNivel, maxNivelJugador + 6);

  dragon2 = { ...baseDragon, nivel: nivelFinal, rareza: "Legendario", tier: "S" };
  dragon2.vidaMax = baseDragon.vida;
  dragon2.vida = dragon2.vidaMax;
  if (scene.aplicarSubidasNivel) scene.aplicarSubidasNivel(dragon2, nivelFinal);
  roleplay.asignarNivel(dragon2, nivelFinal);
  if (typeof asignarRareza === "function") asignarRareza(dragon2, "Legendario");
  dragon2.rareza = "Legendario"; dragon2.tier = "S";
  dragon2.numAlientos = calcularAlientos(baseDragon, nivelFinal);
  dragon2.numAlientosInicial = dragon2.numAlientos;

  // 💾 Registrar combate para roleplay (necesario para captura)
  window.ultimoCombate = { col: scene.posCol || 0, row: scene.posRow || 0, dragon: dragon2 };

  scene.scene.start("SceneCombate");
},

// 📌 Encuentro especial JADEISLAND (boss Misterio)
lanzarJadeisland(scene){
  let candidatos = dragones.filter(d => d.tier === "S" && d.tipo === "Misterio");
  if (candidatos.length === 0) candidatos = dragones.filter(d => d.tier === "S");
  const baseDragon = Phaser.Utils.Array.GetRandom(candidatos);

  const activos = (window.dragonesJugador || []).filter(d => d.activo);
  const maxNivelJugador = activos.length > 0 ? Math.max(...activos.map(d=>d.nivel||1)) : 1;
  const nivelFinal = Math.min(roleplay.maxNivel, maxNivelJugador + 6);

  dragon2 = { ...baseDragon, nivel: nivelFinal, rareza: "Legendario", tier: "S" };
  dragon2.vidaMax = baseDragon.vida; 
  dragon2.vida = dragon2.vidaMax;
  if (scene.aplicarSubidasNivel) scene.aplicarSubidasNivel(dragon2, nivelFinal);
  roleplay.asignarNivel(dragon2, nivelFinal);
  if (typeof asignarRareza === "function") asignarRareza(dragon2, "Legendario");
  dragon2.rareza = "Legendario"; 
  dragon2.tier = "S";
  dragon2.numAlientos = calcularAlientos(baseDragon, nivelFinal);
  dragon2.numAlientosInicial = dragon2.numAlientos;

  window.ultimoCombate = { col: scene.posCol || 0, row: scene.posRow || 0, dragon: dragon2 };

  scene.scene.start("SceneCombate");
},

// 📌 Encuentro especial STORMCLOUD (boss Trueno)
lanzarStormcloud(scene){
  let candidatos = dragones.filter(d => /rayo\\s*a/i.test(d.name));
  if (candidatos.length === 0) candidatos = dragones.filter(d => d.tier === "S" && d.tipo === "Trueno");
  if (candidatos.length === 0) candidatos = dragones.filter(d => d.tier === "S");
  const baseDragon = Phaser.Utils.Array.GetRandom(candidatos);

  const activos = (window.dragonesJugador || []).filter(d => d.activo);
  const maxNivelJugador = activos.length > 0 ? Math.max(...activos.map(d=>d.nivel||1)) : 1;
  const nivelFinal = Math.min(roleplay.maxNivel, maxNivelJugador + 6);

  dragon2 = { ...baseDragon, nivel: nivelFinal, rareza: "Legendario", tier: "S" };
  dragon2.vidaMax = baseDragon.vida; 
  dragon2.vida = dragon2.vidaMax;
  if (scene.aplicarSubidasNivel) scene.aplicarSubidasNivel(dragon2, nivelFinal);
  roleplay.asignarNivel(dragon2, nivelFinal);
  if (typeof asignarRareza === "function") asignarRareza(dragon2, "Legendario");
  dragon2.rareza = "Legendario"; 
  dragon2.tier = "S";
  dragon2.numAlientos = calcularAlientos(baseDragon, nivelFinal);
  dragon2.numAlientosInicial = dragon2.numAlientos;

  window.ultimoCombate = { col: scene.posCol || 0, row: scene.posRow || 0, dragon: dragon2 };

  scene.scene.start("SceneCombate");
},

// 📌 Encuentro especial HELLFIRE (boss Fuego)
lanzarHellfire(scene){
  let candidatos = dragones.filter(d => d.tier === "S" && d.tipo === "Fuego");
  if (candidatos.length === 0) candidatos = dragones.filter(d => d.tier === "S");
  const baseDragon = Phaser.Utils.Array.GetRandom(candidatos);

  const activos = (window.dragonesJugador || []).filter(d => d.activo);
  const maxNivelJugador = activos.length > 0 ? Math.max(...activos.map(d=>d.nivel||1)) : 1;
  const nivelFinal = Math.min(roleplay.maxNivel, maxNivelJugador + 6);

  dragon2 = { ...baseDragon, nivel: nivelFinal, rareza: "Legendario", tier: "S" };
  dragon2.vidaMax = baseDragon.vida; 
  dragon2.vida = dragon2.vidaMax;
  if (scene.aplicarSubidasNivel) scene.aplicarSubidasNivel(dragon2, nivelFinal);
  roleplay.asignarNivel(dragon2, nivelFinal);
  if (typeof asignarRareza === "function") asignarRareza(dragon2, "Legendario");
  dragon2.rareza = "Legendario"; 
  dragon2.tier = "S";
  dragon2.numAlientos = calcularAlientos(baseDragon, nivelFinal);
  dragon2.numAlientosInicial = dragon2.numAlientos;

  window.ultimoCombate = { col: scene.posCol || 0, row: scene.posRow || 0, dragon: dragon2 };

  scene.scene.start("SceneCombate");
},

// 📌 Encuentro especial SCORCHIA (boss Fuego)
lanzarScorchia(scene){
  let candidatos = dragones.filter(d => d.tier === "S" && d.tipo === "Fuego");
  if (candidatos.length === 0) candidatos = dragones.filter(d => d.tier === "S");
  const baseDragon = Phaser.Utils.Array.GetRandom(candidatos);

  const activos = (window.dragonesJugador || []).filter(d => d.activo);
  const maxNivelJugador = activos.length > 0 ? Math.max(...activos.map(d=>d.nivel||1)) : 1;
  const nivelFinal = Math.min(roleplay.maxNivel, maxNivelJugador + 6);

  dragon2 = { ...baseDragon, nivel: nivelFinal, rareza: "Legendario", tier: "S" };
  dragon2.vidaMax = baseDragon.vida;
  dragon2.vida = dragon2.vidaMax;
  if (scene.aplicarSubidasNivel) scene.aplicarSubidasNivel(dragon2, nivelFinal);
  roleplay.asignarNivel(dragon2, nivelFinal);
  if (typeof asignarRareza === "function") asignarRareza(dragon2, "Legendario");
  dragon2.rareza = "Legendario"; 
  dragon2.tier = "S";
  dragon2.numAlientos = calcularAlientos(baseDragon, nivelFinal);
  dragon2.numAlientosInicial = dragon2.numAlientos;

  window.ultimoCombate = { col: scene.posCol || 0, row: scene.posRow || 0, dragon: dragon2 };

  scene.scene.start("SceneCombate");
},


};



// ===================================================
// 🔗 Exportar función global
// ===================================================
window.encuentros = encuentros;
window.generarEncuentro = encuentros.generarEncuentro.bind(encuentros);