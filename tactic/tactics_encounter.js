/***** =========================
 * TACTICS_ENCOUNTER.JS
 * Sistema de generación de enemigos tácticos 3v3 / Monolitos
 * ========================== */

const tacticsEncounter = {

  // 📈 Probabilidades de tier (idénticas a encuentros.js)
  PROB_TIERS: {
    A: { base: 0.15, max: 0.35 },
    S: { base: 0.03, max: 0.15 }
  },

  // 🧮 Genera enemigos estándar (no monolito)
  generarEnemigosTacticos() {
    console.log("⚔️ Generando enemigos tácticos...");

    if (!Array.isArray(window.dragones) || dragones.length === 0) {
      console.warn("⚠️ No hay dragones definidos en el array global.");
      return [];
    }

    const nivelBase = this.calcularNivelBaseJugador();
    const enemigos = [];

    for (let i = 0; i < 4; i++) {
      const base = this.elegirRivalTactico(nivelBase);
      if (!base) continue;

      const copia = JSON.parse(JSON.stringify(base));
      copia.nivel = nivelBase;
      copia.vidaMax = copia.vida || 30;
      copia.vida = copia.vidaMax;
      copia.mini = copia.mini || copia.img || "assets/Dragones/default.png";
      copia.name = copia.name || "Enemigo desconocido";
      copia.tipo = copia.tipo || "Desconocido";
      copia.tier = copia.tier || "B";

      if (typeof asignarRareza === "function") asignarRareza(copia);
      else copia.rareza = "Común";

      // 💪 Boost por rareza
      if (window.rarezas?.[copia.rareza]) {
        const boost = window.rarezas[copia.rareza].boost || 0;
        copia.vidaMax = Math.ceil(copia.vidaMax * (1 + boost));
        copia.vida = copia.vidaMax;
        copia.mordisco = Math.ceil(copia.mordisco * (1 + boost));
        copia.aliento = Math.ceil(copia.aliento * (1 + boost));
        copia.armadura = Math.ceil(copia.armadura * (1 + boost));
        copia.velocidad = Math.ceil(copia.velocidad * (1 + boost));
      }

      if (typeof roleplay?.asignarNivel === "function")
        roleplay.asignarNivel(copia, nivelBase);

      enemigos.push(copia);
    }

    console.log(`✅ ${enemigos.length} enemigos tácticos generados (nivel ${nivelBase})`);
    return enemigos;
  },

  // ========================================================
  // 🟢 MONOLITO VERDE — 1 agua, 1 roca, 2 aleatorios
  // ========================================================
  generarEnemigosMonolitoVerde() {
    console.log("🍃💎 Generando enemigos del Monolito Verde...");

    if (!Array.isArray(window.dragones) || dragones.length === 0) return [];
    const nivelBase = this.calcularNivelBaseJugador() + 1;
    const enemigos = [];

    const tiposFijos = ["agua", "roca"];
    tiposFijos.forEach(tipo => {
      const base = Phaser.Utils.Array.GetRandom(dragones.filter(d => (d.tipo || "").toLowerCase() === tipo));
      if (base) enemigos.push(this._crearEnemigoConRareza(base, nivelBase, "verde"));
    });

    while (enemigos.length < 4) {
      const base = Phaser.Utils.Array.GetRandom(dragones);
      if (base) enemigos.push(this._crearEnemigoConRareza(base, nivelBase, "verde"));
    }

    console.log(`✅ ${enemigos.length} enemigos del Monolito Verde generados (nivel ${nivelBase})`);
    return enemigos;
  },

  // ========================================================
  // 🔵 MONOLITO AZUL — 1 agua, 1 trueno, 2 aleatorios
  // ========================================================
  generarEnemigosMonolitoAzul() {
    console.log("💠❄️ Generando enemigos del Monolito Azul...");

    if (!Array.isArray(window.dragones) || dragones.length === 0) return [];
    const nivelBase = this.calcularNivelBaseJugador() + 1;
    const enemigos = [];

    const tiposFijos = ["agua", "trueno"];
    tiposFijos.forEach(tipo => {
      const base = Phaser.Utils.Array.GetRandom(dragones.filter(d => (d.tipo || "").toLowerCase() === tipo));
      if (base) enemigos.push(this._crearEnemigoConRareza(base, nivelBase, "azul"));
    });

    while (enemigos.length < 4) {
      const base = Phaser.Utils.Array.GetRandom(dragones);
      if (base) enemigos.push(this._crearEnemigoConRareza(base, nivelBase, "azul"));
    }

    console.log(`✅ ${enemigos.length} enemigos del Monolito Azul generados (nivel ${nivelBase})`);
    return enemigos;
  },

  // ========================================================
  // 🔴 MONOLITO ROJO — 1 agua, 1 fuego, 2 aleatorios
  // ========================================================
  generarEnemigosMonolitoRojo() {
    console.log("🔥🪨 Generando enemigos del Monolito Rojo...");

    if (!Array.isArray(window.dragones) || dragones.length === 0) return [];
    const nivelBase = this.calcularNivelBaseJugador() + 1;
    const enemigos = [];

    const tiposFijos = ["agua", "fuego"];
    tiposFijos.forEach(tipo => {
      const base = Phaser.Utils.Array.GetRandom(dragones.filter(d => (d.tipo || "").toLowerCase() === tipo));
      if (base) enemigos.push(this._crearEnemigoConRareza(base, nivelBase, "rojo"));
    });

    while (enemigos.length < 4) {
      const base = Phaser.Utils.Array.GetRandom(dragones);
      if (base) enemigos.push(this._crearEnemigoConRareza(base, nivelBase, "rojo"));
    }

    console.log(`✅ ${enemigos.length} enemigos del Monolito Rojo generados (nivel ${nivelBase})`);
    return enemigos;
  },

  // ========================================================
  // 🟡 MONOLITO DORADO — 1 agua, 1 striker, 2 aleatorios
  // ========================================================
  generarEnemigosMonolitoDorado() {
    console.log("⚡💛 Generando enemigos del Monolito Dorado...");

    if (!Array.isArray(window.dragones) || dragones.length === 0) return [];
    const nivelBase = this.calcularNivelBaseJugador() + 2;
    const enemigos = [];

    const tiposFijos = ["agua", "striker"];
    tiposFijos.forEach(tipo => {
      const base = Phaser.Utils.Array.GetRandom(dragones.filter(d => (d.tipo || "").toLowerCase() === tipo));
      if (base) enemigos.push(this._crearEnemigoConRareza(base, nivelBase, "dorado"));
    });

    while (enemigos.length < 4) {
      const base = Phaser.Utils.Array.GetRandom(dragones);
      if (base) enemigos.push(this._crearEnemigoConRareza(base, nivelBase, "dorado"));
    }

    console.log(`✅ ${enemigos.length} enemigos del Monolito Dorado generados (nivel ${nivelBase})`);
    return enemigos;
  },

  // ========================================================
// 🧬 FUNCIÓN AUXILIAR – Aplica rareza, boosts y bonus de vida por monolito
// ========================================================
_crearEnemigoConRareza(base, nivelBase, tipoMonolito) {
  const copia = JSON.parse(JSON.stringify(base));
  copia.nivel = nivelBase;

  // 🎲 Rareza personalizada según monolito
  const r = Math.random();
  if (tipoMonolito === "verde") {
    if (r < 0.67) copia.rareza = "Raro";
    else if (r < 0.90) copia.rareza = "Épico";
    else copia.rareza = "Legendario";
  } else if (tipoMonolito === "azul") {
    if (r < 0.50) copia.rareza = "Raro";
    else if (r < 0.85) copia.rareza = "Épico";
    else copia.rareza = "Legendario";
  } else if (tipoMonolito === "rojo") {
    if (r < 0.30) copia.rareza = "Raro";
    else if (r < 0.70) copia.rareza = "Épico";
    else copia.rareza = "Legendario";
  } else if (tipoMonolito === "dorado") {
    if (r < 0.10) copia.rareza = "Raro";
    else if (r < 0.60) copia.rareza = "Épico";
    else copia.rareza = "Legendario";
  }

  // ⚙️ Escalar por nivel antes del boost de rareza
  if (typeof roleplay?.asignarNivel === "function") {
    roleplay.asignarNivel(copia, nivelBase);
  }

  // 💪 Boost de rareza (multiplicador)
  if (window.rarezas?.[copia.rareza]) {
    const boost = window.rarezas[copia.rareza].boost || 0;
    copia.vidaMax = Math.ceil(copia.vidaMax * (1 + boost));
    copia.mordisco = Math.ceil(copia.mordisco * (1 + boost));
    copia.aliento = Math.ceil(copia.aliento * (1 + boost));
    copia.armadura = Math.ceil(copia.armadura * (1 + boost));
    copia.velocidad = Math.ceil(copia.velocidad * (1 + boost));
  }

  // ❤️ BOOST PLANO DE VIDA POR COLOR DE MONOLITO
  const bonusVida = {
    verde: 30,
    azul: 45,
    rojo: 60,
    dorado: 75
  }[tipoMonolito] || 0;

  copia.vidaMax += bonusVida;

  // ❤️ Asegurar vida llena
  copia.vida = copia.vidaMax;

  return copia;
},

  // ========================================================
  // 🔹 NIVEL BASE DEL ENEMIGO SEGÚN EL JUGADOR
  // ========================================================
  calcularNivelBaseJugador() {
    if (!window.dragonesJugador || window.dragonesJugador.length === 0)
      return Phaser.Math.Between(1, 3);

    const maxNivel = Math.max(...window.dragonesJugador.map(d => d.nivel || 1));
    const minNivel = Math.max(1, maxNivel - 3);
    const maxFinal = Math.min(roleplay.maxNivel, maxNivel + 2);

    return Phaser.Math.Between(minNivel, maxFinal);
    console.log(
  copia.name, copia.nivel, copia.rareza,
  copia.vidaMax, copia.mordisco, copia.aliento, copia.armadura, copia.velocidad
);
  },

  // ========================================================
  // 🔹 RIVAL TÁCTICO GENERAL (modo normal)
  // ========================================================
  elegirRivalTactico(nivel) {
    const { A, S } = this.PROB_TIERS;
    const probA = A.base + (nivel - 1) * (A.max - A.base) / 9;
    const probS = S.base + (nivel - 1) * (S.max - S.base) / 9;
    const r = Math.random();

    let candidatos;
    if (r < probS) candidatos = dragones.filter(d => d.tier === "S");
    else if (r < probS + probA) candidatos = dragones.filter(d => d.tier === "A");
    else candidatos = dragones.filter(d => d.tier === "B");

    if (!candidatos.length) return Phaser.Utils.Array.GetRandom(dragones);
    return Phaser.Utils.Array.GetRandom(candidatos);
  }
};

// 🔗 Export global
window.tacticsEncounter = tacticsEncounter;
