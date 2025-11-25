/***** =============================
 * SISTEMA GLOBAL DE MODO HISTORIA (v7)
 * Estados: locked / active / ready / done
 * ============================= *****/

window.storyMode = {
    /** ===========================
   * Seguimiento global de eventos completados (islas + monolitos)
   * =========================== **/
  _eventTracker: {
    islas: {},          // { volcan:true, jungle:true, ... }
    monolitos: {},      // { monolitorojo:true, monolitoverde:true, ... }
    totalIslas: 0,
    totalMonolitos: 0
  },
  missions: [
    { 
      id: 1, 
      title: "Ve a una ciudad", 
      trigger: "enterCity", 
      state: "active", // 🔹 empieza activa
      rewards: [
        { key: "Monedas", nombre: "Monedas", cantidad: 500 }
      ]
    },
    { 
      id: 2, 
      title: "Completa una isla", 
      trigger: "completeIsland", 
      state: "active",
      rewards: [
        { key: "Monedas", nombre: "Monedas", cantidad: 500 }
      ]
    },
    { 
      id: 3, 
      title: "Captura 1 dragón", 
      trigger: "captureDragon", 
      state: "locked", // se activa tras la 1
      rewards: [
        { key: "Monedas", nombre: "Monedas", cantidad: 500 },
        { key: "cebo", nombre: "Cebo para dragones", cantidad: 1 }
      ]
    },
    {
      id: 4,
      title: "Completa una misión normal",
      trigger: "normalQuestCompleted",
      state: "locked", // se activa tras la 2
      rewards: [
        { key: "Monedas", nombre: "Monedas", cantidad: 500 },
        { key: "runarara", nombre: "Runa rara", cantidad: 1 }
      ]
    },
   {
  id: 5,
  title: "Eclosiona un huevo",
  trigger: "eggHatched",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 1000 },
    { key: "pezagua", nombre: "Pez de Agua", cantidad: 1 },
    { key: "pezroca", nombre: "Pez de Roca", cantidad: 1 },
    { key: "pezfuego", nombre: "Pez de Fuego", cantidad: 1 },
    { key: "peztrueno", nombre: "Pez de Trueno", cantidad: 1 },
    { key: "pezmisterio", nombre: "Pez Misterioso", cantidad: 1 }
  ]
},
{
  id: 6,
  title: "Haz crecer un dragón bebé",
  trigger: "babyGrown",
  state: "locked", // se activa tras misión 5
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 500 },
    // 🥚 huevo aleatorio (lo añadiremos dinámicamente al completar)
    { key: "randomEgg", nombre: "Huevo aleatorio", cantidad: 1 }
  ]
},
{
  id: 7,
  title: "Completa una misión pasiva fácil",
  trigger: "easyPassiveQuestCompleted",
  requireLevel: 5,
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 750 },
    { key: "Curacion", nombre: "Poción de curación", cantidad: 5 }
  ]
},

{
  id: 8,
  title: "Completa una misión pasiva épica",
  trigger: "epicPassiveQuestCompleted",
  state: "locked", // 🔒 se activa tras completar la misión 7
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 1500 },
    { key: "ceboepico", nombre: "Cebo para dragones épicos", cantidad: 1 }
  ]
},
{
  id: 9,
  title: "Usa una runa rara para mejorar un dragón",
  trigger: "useRareRune",
  requireLevel: 5,
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 1000 }
  ]
},
{
  id: 10,
  title: "Usa una runa épica para mejorar un dragón",
  trigger: "useEpicRune",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 1500 }
  ]
},
{
  id: 11,
  title: "Completa desierto, desierto 4 y jungla",
  trigger: "multiIslandComplete", // trigger personalizado
  requireLevel: 10,
  state: "locked", // 🔒 se activará al alcanzar nivel 10
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 2000 },
    { key: "huevomisterio", nombre: "Huevo de dragón Misterio", cantidad: 1 },
    { key: "huevoroca", nombre: "Huevo de dragón de Roca", cantidad: 1 }
  ]
},
{
  id: 12,
  title: "Completa volcán, cueva dragón y bosque antiguo",
  trigger: "multiIslandComplete2",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 2000 },
    { key: "huevofuego", nombre: "Huevo de dragón de Fuego", cantidad: 1 },
    { key: "huevostriker", nombre: "Huevo de dragón Striker", cantidad: 1 }
  ]
},
{
  id: 13,
  title: "Completa helada, pradera y voladora",
  trigger: "multiIslandComplete3",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 2000 },
    { key: "huevoagua", nombre: "Huevo de dragón de Agua", cantidad: 1 },
    { key: "huevotrueno", nombre: "Huevo de dragón de Trueno", cantidad: 1 }
  ]
},
{
  id: 14,
  title: "Derrota los rivales de un monolito verde",
  trigger: "winMonolitoVerde", // se lanzará desde tactics_combate.js
  requireLevel: 12,
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 1000 },
    { key: "ceboepico", nombre: "Cebo de dragones épico", cantidad: 1 }
  ]
},

{
  id: 15,
  title: "Derrota los rivales de un monolito azul",
  trigger: "winMonolitoAzul",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 1500 },
    { key: "ceboepico", nombre: "Cebo de dragones épico", cantidad: 1 }
  ]
},
{
  id: 16,
  title: "Derrota los rivales de un monolito rojo",
  trigger: "winMonolitoRojo",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 2000 },
    { key: "ceboepico", nombre: "Cebo de dragones épico", cantidad: 1 }
  ]
},
{
  id: 17,
  title: "Derrota los rivales de un monolito dorado",
  trigger: "winMonolitoDorado",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 2500 },
    { key: "cebolegend", nombre: "Cebo de dragones legendario", cantidad: 1 }
  ]
},
{
  id: 18,
  title: "Haz aparecer una isla legendaria",
  trigger: "islaLegendariaAparecida",
  requireLevel: 14,
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 2000 },
    { key: "cebolegend", nombre: "Cebo de dragones legendario", cantidad: 1 }
  ]
},
{
  id: 19,
  title: "Completa una isla legendaria",
  trigger: "islaLegendariaCompletada",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 5000 }
  ]
},
// === 🐲 MISIÓN 20 ===
{
  id: 20,
  title: "Captura 20 dragones",
  trigger: "captureDragon",
  requireLevel: 10,
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 2000 },
    { key: "ceboepico", nombre: "Cebo de dragones épico", cantidad: 2 }
  ],
  condition: () => {
    const total = (window.dragonesJugador || []).length;
    return total >= 20; // ✅ solo se completa si hay 20 o más
  }
},

// === 🐲 MISIÓN 21 ===
{
  id: 21,
  title: "Colección de 5 dragones de clase A",
  trigger: "captureDragon",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 3000 }
  ],
  condition: () => {
    if (!Array.isArray(window.dragonesJugador)) return false;

    // 🔹 Filtrar solo dragones válidos con tier A (normalizado)
    const claseA = window.dragonesJugador.filter(d => {
      if (!d || !d.tier) return false;
      const tier = String(d.tier).trim().toUpperCase();
      return tier === "A";
    });

    console.log("🐉 Dragones Tier A reales:", claseA.map(x => x.name));

    // ✅ Requiere al menos 5 A reales
    return claseA.length >= 5;
  }
},

// === 🐲 MISIÓN 22 ===
{
  id: 22,
  title: "Colección de 5 dragones de clase S",
  trigger: "captureDragon",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 5000 }
  ],
  condition: () => {
    if (!Array.isArray(window.dragonesJugador)) return false;

    // 🔹 Filtrar solo dragones válidos con tier S (normalizado)
    const claseS = window.dragonesJugador.filter(d => {
      if (!d || !d.tier) return false;
      const tier = String(d.tier).trim().toUpperCase();
      return tier === "S";
    });

    console.log("🐉 Dragones Tier S reales:", claseS.map(x => x.name));

    // ✅ Solo se cumple si hay al menos 5 dragones S reales
    return claseS.length >= 5;
  }
},
// === 🐉 MISIÓN 23 ===
{
  id: 23,
  title: "Colección de 10 dragones legendarios",
  trigger: "captureDragon",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 10000 }
  ],
  condition: () => {
    if (!Array.isArray(window.dragonesJugador)) return false;

    // 🔹 Filtrar dragones legendarios con rareza bien definida
    const legendarios = window.dragonesJugador.filter(d => {
      if (!d || !d.rareza) return false;
      const rareza = String(d.rareza).trim().toLowerCase();
      return rareza === "legendario";
    });

    console.log("🐉 Dragones legendarios reales:", legendarios.map(x => x.name));

    // ✅ Solo se cumple si hay al menos 10 legendarios reales
    return legendarios.length >= 10;
  }
},

// === 🐉 MISIÓN 24 ===
{
  id: 24,
  title: "Colección de 10 dragones legendarios clase S",
  trigger: "captureDragon",
  state: "locked",
  rewards: [
    { key: "Monedas", nombre: "Monedas", cantidad: 20000 }
  ],
  condition: () => {
    if (!Array.isArray(window.dragonesJugador)) return false;

    // 🔹 Filtrar dragones con rareza 'Legendario' y tier 'S' (ambos normalizados)
    const legendariosS = window.dragonesJugador.filter(d => {
      if (!d || !d.rareza || !d.tier) return false;
      const rareza = String(d.rareza).trim().toLowerCase();
      const tier = String(d.tier).trim().toUpperCase();
      return rareza === "legendario" && tier === "S";
    });

    console.log("🐉 Dragones legendarios clase S reales:", legendariosS.map(x => x.name));

    // ✅ Solo se cumple si hay al menos 10 legendarios S reales
    return legendariosS.length >= 10;
  }
},

  ],

  /** ===========================
   * Inicialización
   * =========================== **/
  init() {
    if (!window.storyProgress) window.storyProgress = {};
    this.updateHUD();
    this.checkLevelUnlocks();
  },

 /** ===========================
 * HUD lateral actualizado (v2 con check animado)
 * =========================== **/
updateHUD() {
  const hud = document.getElementById("storyHUD");
  const text = document.getElementById("storyText");
  const btn = document.getElementById("storyButton");
  if (!hud || !text) return;

  // 🔄 Limpiar contenido anterior
  text.innerHTML = "";
  const active = this.missions.filter(m => m.state === "active" || m.state === "ready");
  if (active.length === 0) {
    hud.style.display = "none";
    return;
  }

  hud.style.display = "block";

  // 🧱 Contenedor visual
  const list = document.createElement("div");
  list.style.display = "flex";
  list.style.flexDirection = "column";
  list.style.gap = "6px";

  active.forEach(m => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.justifyContent = "space-between";
    row.style.background = "rgba(0,0,0,0.3)";
    row.style.border = "1px solid rgba(255,255,255,0.1)";
    row.style.padding = "4px 10px";
    row.style.borderRadius = "6px";
    row.style.minWidth = "260px";
    row.style.fontSize = "16px";
    row.style.fontFamily = "'Cinzel Decorative', serif";
    row.style.color = m.state === "ready" ? "#aaffaa" : "#ffffff";

    // Texto de la misión
    const label = document.createElement("div");

// 🧭 Si es misión de varias islas, resaltar las completadas
let titleHTML = m.title;

// 🔹 Leer del nuevo sistema de storyMode._eventTracker.islas
if ([11, 12, 13].includes(m.id) && storyMode._eventTracker?.islas) {
  const completadas = Object.keys(storyMode._eventTracker.islas)
    .map(k => k.toLowerCase());

  // 🔹 Pinta en verde las que ya estén completadas
  titleHTML = titleHTML
    .replace(/desierto4/gi, completadas.includes("desert4") ? '<span style="color:#00ff88">Desierto 4</span>' : 'Desierto 4')
    .replace(/desierto/gi, completadas.includes("desert") ? '<span style="color:#00ff88">Desierto</span>' : 'Desierto')
    .replace(/jungla/gi, completadas.includes("jungle") ? '<span style="color:#00ff88">Jungla</span>' : 'Jungla')
    .replace(/volcán|volcan/gi, completadas.includes("volcan") ? '<span style="color:#00ff88">Volcán</span>' : 'Volcán')
    .replace(/cueva dragón|cuevadragon/gi, completadas.includes("cuevadragon") ? '<span style="color:#00ff88">Cueva Dragón</span>' : 'Cueva Dragón')
    .replace(/bosque|forest/gi, completadas.includes("forest") ? '<span style="color:#00ff88">Bosque</span>' : 'Bosque')
    .replace(/helada|helado/gi, completadas.includes("helado") ? '<span style="color:#00ff88">Helada</span>' : 'Helada')
    .replace(/pradera/gi, completadas.includes("pradera") ? '<span style="color:#00ff88">Pradera</span>' : 'Pradera')
    .replace(/voladora|volante2/gi, completadas.includes("volante2") ? '<span style="color:#00ff88">Voladora</span>' : 'Voladora');
}
// 🌀 o ✅ al principio
label.innerHTML = (m.state === "ready" ? "✅ " : "🌀 ") + titleHTML;
label.style.flex = "1";
label.style.paddingRight = "10px";
row.appendChild(label); 
    label.style.flex = "1";
    label.style.paddingRight = "10px";
    row.appendChild(label);

    // Check animado (solo si está lista)
    if (m.state === "ready") {
      const check = document.createElement("div");
      check.textContent = "✔";
      Object.assign(check.style, {
        fontSize: "22px",
        color: "#00ff99",
        cursor: "pointer",
        userSelect: "none",
        animation: "pulseCheck 1s infinite ease-in-out"
      });
      check.onclick = () => this.completeMission(m);
      row.appendChild(check);
    }

    list.appendChild(row);
  });

  text.appendChild(list);

  // 🔘 Ocultamos el botón global
  if (btn) btn.style.display = "none";

  // 💓 Añadimos animación CSS global si no existe
  if (!document.getElementById("storyCheckStyle")) {
    const style = document.createElement("style");
    style.id = "storyCheckStyle";
    style.textContent = `
      @keyframes pulseCheck {
        0% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.3); opacity: 1; text-shadow: 0 0 6px #00ffcc; }
        100% { transform: scale(1); opacity: 0.9; }
      }
    `;
    document.head.appendChild(style);
  }
},


  /** ===========================
 * Recompensas (ajustadas y normalizadas)
 * =========================== **/
giveRewards(rewards) {
  if (!Array.isArray(rewards) || rewards.length === 0) return;
  if (!window.inventarioJugador) window.inventarioJugador = [];

  rewards.forEach(r => {
    const key = (r.key || "").toLowerCase();
    const nombre = r.nombre || key || "Recompensa";
    const cantidad = r.cantidad || 1;

    // 🥚 Recompensa especial: huevo aleatorio
    if (key === "randomegg") {
      const tipos = ["fuego", "agua", "roca", "trueno", "striker", "misterio"];
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const keyEgg = "huevo" + tipo;
      const nombreEgg = "Huevo de dragón de " + tipo.charAt(0).toUpperCase() + tipo.slice(1);
      window.inventarioJugador.push({ key: keyEgg, nombre: nombreEgg, cantidad: 1 });
      console.log(`🥚 Recompensa especial: ${nombreEgg}`);
      return;
    }

    // 💰 Si es oro → también añadir al inventario visual
    if (key === "monedas" || key === "oro") {
      let oroItem = window.inventarioJugador.find(i => i.key?.toLowerCase() === "monedas");
      if (oroItem) oroItem.cantidad += cantidad;
      else window.inventarioJugador.push({ key: "Monedas", nombre: "Monedas", cantidad });
      console.log(`💰 Has recibido ${cantidad} monedas.`);
      return;
    }

    // 💊 Resto de objetos → añadir o sumar cantidad
    let item = window.inventarioJugador.find(i => i.key?.toLowerCase() === key);
    if (item) item.cantidad += cantidad;
    else window.inventarioJugador.push({ key, nombre, cantidad });

    console.log(`🎁 Recompensa: ${nombre} x${cantidad}`);
  });

  // ✅ Normalizar inventario tras añadir recompensas
  if (typeof SceneInventario?.prototype?.normalizarInventario === "function") {
    window.inventarioJugador = SceneInventario.prototype.normalizarInventario(window.inventarioJugador);
  }
},

  /** ===========================
 * Completar misión (con popup de recompensa bloqueante)
 * =========================== **/
completeMission(m) {
  if (m.state !== "ready") return; // solo si está lista

  m.state = "done";
  console.log(`✅ Misión completada manualmente: ${m.title}`);

  // 🔒 Bloquear flujo hasta que se confirme el popup
  const continuarDespues = () => {
    // === Desbloqueos progresivos ===
    if (m.id === 1) {
      const m3 = this.missions.find(x => x.id === 3);
      if (m3 && m3.state === "locked") {
        m3.state = "active";
        this.showPopup("Nueva misión", m3.title);
      }
    }

    if (m.id === 2) {
      const m4 = this.missions.find(x => x.id === 4);
      if (m4 && m4.state === "locked") {
        m4.state = "active";
        this.showPopup("Nueva misión", m4.title);
      }
    }

    // 🔄 Desbloqueos en cadena (mismo flujo que ya tenías)
    const m3 = this.missions.find(x => x.id === 3);
    const m4 = this.missions.find(x => x.id === 4);
    const m5 = this.missions.find(x => x.id === 5);
    if (m5 && m5.state === "locked" && m3?.state === "done" && m4?.state === "done") {
      m5.state = "active";
      this.showPopup("Nueva misión", m5.title);
    }

    if (m.id === 5) {
      const m6 = this.missions.find(x => x.id === 6);
      if (m6 && m6.state === "locked") {
        m6.state = "active";
        this.showPopup("Nueva misión", m6.title);
      }
    }

    if (m.id === 7) {
      const m8 = this.missions.find(x => x.id === 8);
      if (m8 && m8.state === "locked") {
        m8.state = "active";
        this.showPopup("Nueva misión", m8.title);
      }
    }

    if (m.id === 9) {
      const m10 = this.missions.find(x => x.id === 10);
      if (m10 && m10.state === "locked") {
        m10.state = "active";
        this.showPopup("Nueva misión", m10.title);
      }
    }

    if (m.id === 11) {
      const m12 = this.missions.find(x => x.id === 12);
      const m13 = this.missions.find(x => x.id === 13);
      if (m12 && m12.state === "locked") {
        m12.state = "active";
        this.showPopup("Nueva misión", m12.title);
      }
      if (m13 && m13.state === "locked") {
        m13.state = "active";
        this.showPopup("Nueva misión", m13.title);
      }
    }

    if (m.id === 14) {
      const m15 = this.missions.find(x => x.id === 15);
      if (m15 && m15.state === "locked") {
        m15.state = "active";
        this.showPopup("Nueva misión", m15.title);
      }
    }

    if (m.id === 15) {
      const m16 = this.missions.find(x => x.id === 16);
      if (m16 && m16.state === "locked") {
        m16.state = "active";
        this.showPopup("Nueva misión", m16.title);
      }
    }

    if (m.id === 16) {
      const m17 = this.missions.find(x => x.id === 17);
      if (m17 && m17.state === "locked") {
        m17.state = "active";
        this.showPopup("Nueva misión", m17.title);
      }
    }

    const m18 = this.missions.find(x => x.id === 18);
    const m19 = this.missions.find(x => x.id === 19);
    if (m18 && m18.state === "done" && m19 && m19.state === "locked") {
      m19.state = "active";
      this.showPopup("Nueva misión", m19.title);
    }

    if (m.id === 20) {
      const m21 = this.missions.find(x => x.id === 21);
      if (m21 && m21.state === "locked") {
        m21.state = "active";
        this.showPopup("Nueva misión", m21.title);
      }
    }

    if (m.id === 21) {
      const m22 = this.missions.find(x => x.id === 22);
      if (m22 && m22.state === "locked") {
        m22.state = "active";
        this.showPopup("Nueva misión", m22.title);
      }
    }

    if (m.id === 22) {
      const m23 = this.missions.find(x => x.id === 23);
      if (m23 && m23.state === "locked") {
        m23.state = "active";
        this.showPopup("Nueva misión", m23.title);
      }
    }

    if (m.id === 23) {
      const m24 = this.missions.find(x => x.id === 24);
      if (m24 && m24.state === "locked") {
        m24.state = "active";
        this.showPopup("Nueva misión", m24.title);
      }
    }

    this.updateHUD();
  }; // 🔚 fin de continuarDespues

  // 🎁 Mostrar popup de recompensa (bloqueante)
  if (m.rewards?.length) {
    this.giveRewards(m.rewards);
    this.showRewardPopup(
      `🎉 Misión completada: ${m.title}`,
      m.rewards,
      continuarDespues // ⬅️ ahora solo se llama al cerrar el popup
    );
  } else {
    this.showPopup("🎉 Misión completada", m.title);
    continuarDespues();
  }
},


  // DESBLOQUEOS POR NIVEL DEL DRAGON
  /** 🔎 Nivel máximo entre los dragones del jugador **/
getHighestLevel() {
  if (!Array.isArray(window.dragonesJugador)) return 0;
  return window.dragonesJugador.reduce((max, d) => Math.max(max, d?.nivel || 0), 0);
},
/** 🧭 Revisa condiciones de nivel y activa misiones por nivel **/
checkLevelUnlocks() {
  const lvl = this.getHighestLevel();

  // 🔹 Desbloquear Misión 7 cuando el dragón más alto tenga nivel 5+
  const m7 = this.missions.find(m => m.id === 7);
  if (m7 && m7.state === "locked" && lvl >= 5) {
    m7.state = "active";
    console.log("📜 Misión 7 activada: Completa una misión pasiva fácil (nivel 5 alcanzado)");
    this.showPopup("Nueva misión", m7.title);
    this.updateHUD();
  }

  // 🔹 Desbloquear Misión 9 cuando el dragón más alto tenga nivel 7+
const m9 = this.missions.find(m => m.id === 9);
if (m9 && m9.state === "locked" && lvl >= 7) {
  m9.state = "active";
  console.log("📜 Misión 9 activada: Usa una runa rara para mejorar un dragón");
  this.showPopup("Nueva misión", m9.title);
  this.updateHUD();
}

// 🔹 Desbloquear Misión 11 cuando el dragón más alto tenga nivel 10+
const m11 = this.missions.find(m => m.id === 11);
if (m11 && m11.state === "locked" && lvl >= 10) {
  m11.state = "active";
  console.log("📜 Misión 11 activada: Completa desierto, desierto 4 y jungla");
  this.showPopup("Nueva misión", m11.title);
  this.updateHUD();
}
// 🔹 Desbloquear Misión 14 cuando el dragón más alto tenga nivel 12+
const m14 = this.missions.find(m => m.id === 14);
if (m14 && m14.state === "locked" && lvl >= 12) {
  m14.state = "active";
  console.log("📜 Misión 14 activada: Derrota los rivales de un monolito verde");
  this.showPopup("Nueva misión", m14.title);
  this.updateHUD();
}
// 🔹 Desbloquear Misión 18 cuando el dragón más alto tenga nivel 14+
const m18 = this.missions.find(m => m.id === 18);
if (m18 && m18.state === "locked" && lvl >= 14) {
  m18.state = "active";
  console.log("📜 Misión 18 activada: Haz aparecer una isla legendaria");
  this.showPopup("Nueva misión", m18.title);
  this.updateHUD();
}

// 🔹 Desbloquear Misión 20 cuando el dragón más alto tenga nivel 10+
const m20 = this.missions.find(m => m.id === 20);
if (m20 && m20.state === "locked" && lvl >= 10) {
  m20.state = "active";
  console.log("📜 Misión 20 activada: Captura 20 dragones");
  this.showPopup("Nueva misión", m20.title);
  this.updateHUD();
}
},

  /** ===========================
 * Activar trigger (marca misión como lista + registra evento si aplica)
 * =========================== **/
trigger(eventKey, extraData = {}) {
  console.log(`(storyMode) Trigger recibido: "${eventKey}"`, extraData);

  // 🔹 Auto-registro de islas completadas (usa islaSeleccionada si no hay datos)
  if (eventKey === "completeIsland") {
    const bioma =
      extraData.bioma ||
      (window.islaSeleccionada?.tipo || window.islaSeleccionada?.bioma || "").toLowerCase();
    if (bioma) {
      this.markEventCompleted("isla", bioma);
    } else {
      console.warn("⚠️ No se detectó bioma para registrar la isla completada.");
    }
  }

  // 🔹 Auto-registro de monolitos ganados
  if (eventKey.startsWith("winMonolito")) {
    const tipo = eventKey.replace("win", "").toLowerCase(); // ej. monolitoverde
    this.markEventCompleted("monolito", tipo);
  }

  const affected = this.missions.filter(m => m.trigger === eventKey && m.state === "active");
  if (affected.length === 0) {
    console.log(`(storyMode) Trigger "${eventKey}" sin misiones activas que coincidan.`);
    return;
  }

  affected.forEach(m => {
    const condicionCumplida = typeof m.condition === "function" ? m.condition(extraData) : true;

    if (!condicionCumplida) {
      console.log(`⏳ Misión todavía no cumple requisitos: ${m.title}`);
      return;
    }

    m.state = "ready";
    console.log(`📜 Misión lista: ${m.title}`);
    this.showPopup("Misión completada", `${m.title} — Ahora puedes entregarla desde el HUD.`);
  });

  // 🧭 Revisar misiones de varias islas
  if (eventKey === "completeIsland") {
    this.checkMultiIslandCompletion?.();
    this.checkMultiIslandCompletion2?.();
    this.checkMultiIslandCompletion3?.();
  }

  this.updateHUD();
},



  /** ===========================
   * Popups
   * =========================== **/
  /** ===========================
 * Popups de recompensas (mejorado con texto descriptivo)
 * =========================== **/
showRewardPopup(title, rewards, callback) {
  const old = document.getElementById("storyPopupOverlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "storyPopupOverlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.8)",
    zIndex: "999999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "all",
    cursor: "default"
  });

  // 🔒 Evitar propagación accidental
  overlay.addEventListener("pointerdown", e => e.stopPropagation());
  overlay.addEventListener("wheel", e => e.preventDefault());

  const box = document.createElement("div");
  Object.assign(box.style, {
    background: "#222",
    border: "2px solid #888",
    borderRadius: "16px",
    padding: "30px",
    width: "600px",
    textAlign: "center",
    color: "#fff",
    fontFamily: "'Cinzel Decorative', serif",
    boxShadow: "0 0 20px #000"
  });

  // 🏆 Título principal
  const titleEl = document.createElement("div");
  titleEl.textContent = title;
  Object.assign(titleEl.style, { 
    fontSize: "26px", 
    color: "#ffd700", 
    marginBottom: "14px" 
  });
  box.appendChild(titleEl);

  // 💬 Texto adicional con resumen
  const resumen = document.createElement("div");
  resumen.textContent = "Has recibido las siguientes recompensas:";
  Object.assign(resumen.style, {
    fontSize: "18px",
    color: "#ccc",
    marginBottom: "12px",
    fontStyle: "italic"
  });
  box.appendChild(resumen);

  // 📦 Lista de recompensas
  const list = document.createElement("div");
  list.style.fontSize = "18px";
  list.innerHTML = rewards
    .map(r => `💠 ${r.nombre} ×${r.cantidad}`)
    .join("<br>");
  box.appendChild(list);

  // 🔘 Botón continuar
  const btn = document.createElement("button");
  btn.textContent = "Continuar";
  Object.assign(btn.style, {
    marginTop: "18px",
    padding: "10px 24px",
    background: "#333",
    border: "1px solid #aaa",
    borderRadius: "8px",
    color: "#ffd700",
    fontSize: "18px",
    cursor: "pointer",
    fontFamily: "'MedievalSharp', cursive"
  });
  btn.onclick = () => {
    overlay.remove();
    if (callback) callback();
  };
  box.appendChild(btn);

  overlay.appendChild(box);
  document.body.appendChild(overlay);
},


  showPopup(title, description) {
  // 🧹 Eliminar popup anterior
  const old = document.getElementById("storyPopupOverlay");
  if (old) old.remove();

  // 🔒 Crear capa bloqueante total
  const overlay = document.createElement("div");
  overlay.id = "storyPopupOverlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.85)",
    zIndex: "999999", // más alto que cualquier canvas
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "auto",
  });

  // ⚡ Bloquear propagación de eventos (ratón / scroll / toque)
  overlay.addEventListener("pointerdown", e => { e.stopPropagation(); e.preventDefault(); });
  overlay.addEventListener("click", e => { e.stopPropagation(); e.preventDefault(); });
  overlay.addEventListener("wheel", e => { e.preventDefault(); });
  overlay.addEventListener("touchstart", e => { e.preventDefault(); });

  // 🧱 Caja del popup
  const box = document.createElement("div");
  Object.assign(box.style, {
    background: "#222",
    border: "2px solid #888",
    borderRadius: "16px",
    padding: "30px",
    width: "600px",
    textAlign: "center",
    color: "#fff",
    fontFamily: "'Cinzel Decorative', serif",
    boxShadow: "0 0 20px #000",
    zIndex: "1000000",
    pointerEvents: "auto"
  });

  const titleEl = document.createElement("div");
  titleEl.textContent = title;
  Object.assign(titleEl.style, { fontSize: "26px", color: "#ffd700", marginBottom: "10px" });
  box.appendChild(titleEl);

  const descEl = document.createElement("div");
  descEl.textContent = description;
  descEl.style.fontSize = "18px";
  descEl.style.marginBottom = "20px";
  box.appendChild(descEl);

  const btn = document.createElement("button");
  btn.textContent = "Cerrar";
  Object.assign(btn.style, {
    padding: "10px 24px",
    background: "#333",
    border: "1px solid #aaa",
    borderRadius: "8px",
    color: "#ffd700",
    fontSize: "18px",
    cursor: "pointer",
    fontFamily: "'MedievalSharp', cursive"
  });
  btn.onclick = () => overlay.remove();
  box.appendChild(btn);

  overlay.appendChild(box);
  document.body.appendChild(overlay);
},
/** ===========================
 * Verificar si se completaron las tres islas necesarias (Misión 11)
 * =========================== **/
checkMultiIslandCompletion() {
  const completadas = Object.keys(this._eventTracker?.islas || {});
  const tiposNecesarios = ["desert", "desert4", "jungle"];
  const tieneTodas = tiposNecesarios.every(t => completadas.includes(t));

  if (tieneTodas) {
    const m11 = this.missions.find(m => m.id === 11);
    if (m11 && m11.state === "active") {
      m11.state = "ready";
      console.log("📜 Misión 11 completada (Desierto, Desierto4, Jungla)");
      this.showPopup("Misión completada", m11.title);
      this.updateHUD();
    }
  }
},

/** ===========================
 * Verificar si se completaron las islas necesarias (Misión 12)
 * =========================== **/
checkMultiIslandCompletion2() {
  const completadas = Object.keys(this._eventTracker?.islas || {});
  const tiposNecesarios = ["volcan", "cuevadragon", "forest"];
  const tieneTodas = tiposNecesarios.every(t => completadas.includes(t));

  if (tieneTodas) {
    const m12 = this.missions.find(m => m.id === 12);
    if (m12 && m12.state === "active") {
      m12.state = "ready";
      console.log("📜 Misión 12 completada (Volcán, Cueva Dragón, Bosque)");
      this.showPopup("Misión completada", m12.title);
      this.updateHUD();
    }
  }
},

/** ===========================
 * Verificar si se completaron las islas necesarias (Misión 13)
 * =========================== **/
checkMultiIslandCompletion3() {
  const completadas = Object.keys(this._eventTracker?.islas || {});
  const tiposNecesarios = ["helado", "pradera", "volante2"];
  const tieneTodas = tiposNecesarios.every(t => completadas.includes(t));

  if (tieneTodas) {
    const m13 = this.missions.find(m => m.id === 13);
    if (m13 && m13.state === "active") {
      m13.state = "ready";
      console.log("📜 Misión 13 completada (Helada, Pradera, Voladora)");
      this.showPopup("Misión completada", m13.title);
      this.updateHUD();
    }
  }
},

/** ===========================
 * Registro global de eventos completados
 * =========================== **/
_eventTracker: {
  islas: {},        // ejemplo: { volcan: true, jungle: true }
  monolitos: {},    // ejemplo: { rojo: true, azul: true }
  totalIslas: 0,
  totalMonolitos: 0
},

/** ===========================
 * Registrar evento completado (isla, monolito, etc.)
 * =========================== **/
markEventCompleted(tipo, nombre) {
  if (!this._eventTracker) this._eventTracker = { islas: {}, monolitos: {} };

  // Normalizar
  const key = String(nombre || "").toLowerCase().trim();
  if (!key) return;

  if (tipo === "isla") {
    if (!this._eventTracker.islas[key]) {
      this._eventTracker.islas[key] = true;
      console.log(`📍 ISLA COMPLETA registrada: ${key}`);

      // 💡 Mostrar progreso según misión
      const completadas = Object.keys(this._eventTracker.islas);
      const grupos = [
        { id: 11, tipos: ["desert", "desert4", "jungle"], nombre: "Misión 11" },
        { id: 12, tipos: ["volcan", "cuevadragon", "forest"], nombre: "Misión 12" },
        { id: 13, tipos: ["helado", "pradera", "volante2"], nombre: "Misión 13" }
      ];

      grupos.forEach(g => {
        const cuenta = g.tipos.filter(t => completadas.includes(t));
        console.log(
          `🧭 Progreso ${g.nombre}: ${cuenta.length} / ${g.tipos.length} islas completadas (${cuenta.join(", ") || "ninguna"})`
        );
      });

      // 💥 Refrescar el HUD inmediatamente para pintar el nuevo color
      if (typeof this.updateHUD === "function") {
        this.updateHUD();
      }

      // ⚙️ Re-evaluar si se ha completado alguna misión multi-isla
      if (typeof this.checkMultiIslandCompletion === "function") this.checkMultiIslandCompletion();
      if (typeof this.checkMultiIslandCompletion2 === "function") this.checkMultiIslandCompletion2();
      if (typeof this.checkMultiIslandCompletion3 === "function") this.checkMultiIslandCompletion3();
    } else {
      console.log(`⚙️ Isla '${key}' ya estaba completada anteriormente.`);
    }
  }

  if (tipo === "monolito") {
    if (!this._eventTracker.monolitos[key]) {
      this._eventTracker.monolitos[key] = true;
      console.log(`💎 MONOLITO completado: ${key}`);
      if (typeof this.updateHUD === "function") this.updateHUD();
    }
  }
},


/** ===========================
 * Devuelve resumen del progreso de eventos
 * =========================== **/
getEventProgress() {
  return {
    islasCompletadas: Object.keys(this._eventTracker.islas).length,
    monolitosCompletados: Object.keys(this._eventTracker.monolitos).length,
    listaIslas: Object.keys(this._eventTracker.islas),
    listaMonolitos: Object.keys(this._eventTracker.monolitos)
  };
},
};

/** ===========================
 * Inicializar automáticamente
 * =========================== **/
window.addEventListener("load", () => {
  if (window.storyMode) {
    window.storyMode.init();
  }
});
