/***** =========================
 * ESCENA INVENTARIO
 * ========================== */

class SceneInventario extends Phaser.Scene {
  constructor(){ super("SceneInventario"); }

  preload(){
    // Cargar iconos de inventario
    this.load.image("Curacion", "assets/inventario/curaMED.png");
    this.load.image("Tomo", "assets/inventario/TomoMED.png");
    this.load.image("pocionroja", "assets/potis/pocionrojaMED.png"); 
    this.load.image("pocionazul", "assets/potis/pocionazulMED.png"); 
    this.load.image("Monedas", "assets/inventario/monedasMED.png");   
    this.load.image("cebo", "assets/inventario/cebodragonesMED.png");
    this.load.image("ceboepico", "assets/inventario/cebodragonesepicoMED.png"); 
    this.load.image("cebolegend", "assets/inventario/cebolegendMED.png"); 
    this.load.image("runarara", "assets/inventario/runararaMED.png");
    this.load.image("runaepica", "assets/inventario/runaepicaMED.png");
    this.load.image("runalegendaria", "assets/inventario/runalegendariaMED.png");

    // ✨ Nuevos pergaminos de teleport
    this.load.image("teleportharruni", "assets/inventario/teleportharruniMED.png");
    this.load.image("teleportluminaria", "assets/inventario/teleportluminariaMED.png");
    this.load.image("teleportsilvanost", "assets/inventario/teleportsilvanostMED.png");
    this.load.image("teleportdrakengaard", "assets/inventario/teleportdrakengaardMED.png");

    // Repelente
    this.load.image("repelente","assets/inventario/repelenteMED.png");

    //Huevos
    this.load.image("huevoroca","assets/inventario/huevorocaMED.png");
      this.load.image("huevoagua","assets/inventario/huevoaguaMED.png");
       this.load.image("huevofuego","assets/inventario/huevofuegoMED.png");
        this.load.image("huevotrueno","assets/inventario/huevotruenoMED.png");
         this.load.image("huevomisterio","assets/inventario/huevomisterioMED.png");
         this.load.image("huevostriker","assets/inventario/huevostrikerMED.png");
        
   // Runas de atracción

    this.load.image("runaatraccionepica", "assets/inventario/runaatraccionepicaMED.png");
    this.load.image("runaatraccionlegend", "assets/inventario/runaatraccionlegendMED.png");

     // 🐟 Peces elementales (no usables desde el inventario)
    this.load.image("pezfuego", "assets/inventario/pezfuegoMED.png");
    this.load.image("pezagua", "assets/inventario/pezaguaMED.png");
    this.load.image("pezroca", "assets/inventario/pezrocaMED.png");
    this.load.image("peztrueno", "assets/inventario/peztruenoMED.png");
    this.load.image("pezstriker", "assets/inventario/pezstrikerMED.png");
    this.load.image("pezmisterio", "assets/inventario/pezmisterioMED.png");
  }

  create(data){
    this.origen = window.origenInventario || data?.from || "SceneMapa";
    this.dragonActivo = data?.dragonActivo || null;
    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;
    // Fondo
    this.add.rectangle(600,300,1200,600,0x000000,0.8);

    // Título
    this.add.text(600,40,"🎒 Inventario del Jugador",{
      fontSize:"32px",
      color:"#ffd700",
      fontFamily:"Cinzel Decorative, serif"
    }).setOrigin(0.5);

if(!window.inventarioJugador){
  window.inventarioJugador = [];
}

// 🧩 Normalizar nombres y unificar duplicados
window.inventarioJugador = this.normalizarInventario(window.inventarioJugador);

    // === INVENTARIO CENTRADO ===
const centerX = this.sys.game.config.width / 2;
let startY = 130;

if (window.inventarioJugador.length === 0) {
  this.add.text(centerX, startY, "Inventario vacío...", {
    fontSize: "22px",
    color: "#ccc"
  }).setOrigin(0.5);
} else {
  // 📦 Contenedor principal centrado
  let itemsContainer = this.add.container(centerX, 0).setDepth(50);

  window.inventarioJugador.forEach((item, i) => {
    let y = startY + i * 60;

    // Caja de fondo
    let marco = this.add.rectangle(0, y, 700, 50, 0x000000, 0.3)
      .setStrokeStyle(1, 0xffffff)
      .setOrigin(0.5, 0.5);
    itemsContainer.add(marco);

    // Icono
    let iconX = -300;
    if (item.key && this.textures.exists(item.key)) {
      let icon = this.add.image(iconX, y, item.key)
        .setOrigin(0.5)
        .setScale(0.5);
      itemsContainer.add(icon);
    }

    // Texto
    let txt = this.add.text(-240, y, `${item.nombre} x${item.cantidad}`, {
      fontSize: "20px",
      color: "#fff"
    }).setOrigin(0, 0.5);
    itemsContainer.add(txt);

    // === Interacciones ===
    if (this.origen === "SceneCombate" && (item.nombre === "Poción Roja" || item.nombre === "Poción Azul")) {
      txt.setInteractive({ useHandCursor: true });
      txt.on("pointerdown", () => this.usarPocion(item));
    }

    if (item.nombre === "Cebo para dragones") {
      txt.setInteractive({ useHandCursor: true });
      txt.on("pointerdown", () =>
        alert("🌠 Usaste un cebo para dragones.\nEsto podría aumentar tus probabilidades de encontrar o capturar uno.")
      );
    }

    if (item.nombre === "Cebo para dragones épicos") {
  txt.setInteractive({ useHandCursor: true });
  txt.on("pointerdown", () => {
    alert("🌠 Usaste un cebo para dragones épicos.\nAhora aumentan tus probabilidades de encontrar dragones épicos.");
    window.bonusEpico = true;
  });
}
    if (item.nombre === "Cebo para dragones legendarios") {
      txt.setInteractive({ useHandCursor: true });
      txt.on("pointerdown", () => {
        alert("🌟 Usaste un cebo para dragones legendarios.\nAhora es más probable encontrar un dragón legendario.");
        window.bonusLegendario = true;
      });
    }
    if (item.nombre === "Repelente de dragones") {
      txt.setInteractive({ useHandCursor: true });
      txt.on("pointerdown", () => this.usarRepelente(item));
    }
    if (item.key?.startsWith("teleport")) {
      txt.setInteractive({ useHandCursor: true });
      txt.on("pointerdown", () => this.usarTeleport(item));
    }

    // === Usar Runa de Atracción de Dragones ===
    if (item.nombre === "Runa de Atracción Épica") {
      txt.setInteractive({ useHandCursor: true });
      txt.on("pointerdown", () => this.usarRunaAtraccion(item, "epica"));
    }
    if (item.nombre === "Runa de Atracción Legendaria") {
      txt.setInteractive({ useHandCursor: true });
      txt.on("pointerdown", () => this.usarRunaAtraccion(item, "legendaria"));
    }
      });

 // === Scroll con máscara (idéntico a tienda y colección) ===

// 🧭 Área visible
const maskTop = 140;           // justo debajo del título "🎒 Inventario"
const maskHeight = H - 260;    // deja espacio arriba y para el botón Volver
const maskWidth = W - 200;     // ancho centrado

// 🟦 Capa invisible para máscara
const maskShape = this.add.rectangle(W / 2, maskTop + maskHeight / 2, maskWidth, maskHeight, 0x000000, 0)
  .setOrigin(0.5)
  .setDepth(100);

// ✂️ Aplicar máscara
const mask = maskShape.createGeometryMask();
itemsContainer.setMask(mask);

// === Scroll con rueda ===
const maxScroll = Math.max(0, (window.inventarioJugador.length * 60 + startY) - maskHeight);
itemsContainer.y = maskTop;

this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
  itemsContainer.y -= deltaY * 0.5;

  const topLimit = maskTop;
  const bottomLimit = maskTop - maxScroll;
  if (itemsContainer.y > topLimit) itemsContainer.y = topLimit;
  if (itemsContainer.y < bottomLimit) itemsContainer.y = bottomLimit;
});
}



    // === BOTÓN VOLVER CENTRADO ===
const btnVolver = this.add.text(centerX, 750, "⬅ Volver", {
  fontSize: "22px",
  backgroundColor: "#333",
  padding: { left: 20, right: 20, top: 10, bottom: 10 },
  color: "#fff"
})
  .setOrigin(0.5)
  .setInteractive();

btnVolver.on("pointerdown", () => {
  if (this.origen === "SceneCombate") this.scene.start("SceneCombate");
  else if (this.origen === "SceneWorld") this.scene.start("SceneWorld");
  else if (this.origen === "SceneMapa") this.scene.start("SceneMapa");
  else this.scene.start("ScenePoblado");
});

btnVolver.on("pointerover", () =>
  btnVolver.setStyle({ backgroundColor: "#555", color: "#ffd700" })
);
btnVolver.on("pointerout", () =>
  btnVolver.setStyle({ backgroundColor: "#333", color: "#fff" })
);

  }
// === Usar Runa de Atracción ===
usarRunaAtraccion(item, rareza) {
  if (!item || item.cantidad <= 0) {
    alert("❌ No tienes esta runa disponible");
    return;
  }

  // Consumir una unidad
  item.cantidad--;
  if (item.cantidad <= 0) {
    let idx = window.inventarioJugador.indexOf(item);
    if (idx >= 0) window.inventarioJugador.splice(idx, 1);
  }

  // 🔮 Guardar el efecto activo de atracción
  window.bonusAtraccion = {
    rareza: rareza,     // "epica" o "legendaria"
    activo: true,
    usosRestantes: 1    // Solo afecta al siguiente encuentro
  };
window.bonusAtraccion = {
  rareza: rareza,     // "epica" o "legendaria"
  activo: true,
  usosRestantes: 1
};

// 🔐 Refuerzo: persistirlo en global explícitamente
globalThis.bonusAtraccion = window.bonusAtraccion;
  alert(`✨ Has activado una Runa de Atracción ${rareza.toUpperCase()}.\nEl próximo dragón salvaje será de rareza ${rareza}.`);

  // Volver al mapa
  this.scene.start("SceneMapa");
}
  // === Usar poción ===
  usarPocion(item){
    const esObjetoPocion = (item && (item.nombre === "Poción Roja" || item.nombre === "Poción Azul"));
    if(!esObjetoPocion) return;

    let dragonJugador = window.dragon1 || null;
    if(!dragonJugador){
      alert("❌ No se encontró el dragón del jugador");
      return;
    }

    let dPersist = (Array.isArray(window.dragonesJugador))
      ? window.dragonesJugador.find(d => d && d.name === dragonJugador.name)
      : null;

    if(item.nombre === "Poción Roja"){
      const vidaMax = dragonJugador.vidaMax ?? 0;
      const nuevaVida = Math.min(dragonJugador.vida + 20, vidaMax);
      dragonJugador.vida = nuevaVida;
      if(dPersist) dPersist.vida = nuevaVida;
      alert(`❤️ ${dragonJugador.name} ha recuperado 20 de vida`);
    }
    else if(item.nombre === "Poción Azul"){
      const maxAl = dragonJugador.numAlientosInicial ?? dragonJugador.numAlientosMax ?? 0;
      dragonJugador.numAlientos = maxAl;
      if(dPersist) dPersist.numAlientos = maxAl;
      alert(`💨 ${dragonJugador.name} ha recuperado todos los alientos`);
    }

    item.cantidad -= 1;
    if(item.cantidad <= 0){
      let idx = window.inventarioJugador.indexOf(item);
      if(idx>=0) window.inventarioJugador.splice(idx,1);
    }

    this.scene.start("SceneCombate");
  }

  
// === Usar teleport ===
usarTeleport(item){
  if(!item || item.cantidad <= 0){
    alert("❌ No tienes este pergamino de teleportación");
    return;
  }

  // Quitar uno del inventario
  item.cantidad--;
  if(item.cantidad <= 0){
    let idx = window.inventarioJugador.indexOf(item);
    if(idx >= 0) window.inventarioJugador.splice(idx,1);
  }

  // Detectar ciudad destino según la key
  let ciudadDestino = null;
  switch(item.key){
    case "teleportharruni":     ciudadDestino = "harruni"; break;
    case "teleportluminaria":  ciudadDestino = "luminaria"; break;
    case "teleportsilvanost":  ciudadDestino = "silvanost"; break;
    case "teleportdrakengaard":ciudadDestino = "frostgaard"; break; // drakengaard usa icono frostgaard
  }

  if(!ciudadDestino){
    alert("❌ No se reconoce el destino del pergamino");
    return;
  }

  // 🚀 Guardamos el destino y que SceneWorld lo coloque al crear
  window.teleportDestino = ciudadDestino;

  alert(`✨ El pergamino te transporta cerca de ${ciudadDestino.toUpperCase()}`);

  // Volvemos al world
  this.scene.start("SceneWorld");
}
// === Usar Repelente de Dragones ===
usarRepelente(item) {
  if (!item || item.cantidad <= 0) {
    alert("❌ No tienes repelentes disponibles");
    return;
  }

  // Consumir 1
  item.cantidad--;
  if (item.cantidad <= 0) {
    let idx = window.inventarioJugador.indexOf(item);
    if (idx >= 0) window.inventarioJugador.splice(idx, 1);
  }

  // 🔥 Reinicia siempre el estado del repelente
  window.repelenteActivo = {
    diasRestantes: 5,
    icono: "🧿"
  };

  alert("🧿 Has usado un Repelente de Dragones.\nDurará 5 días de calendario.");

  // Volvemos al mapa
  this.scene.start("SceneMapa");
}

// =========================================================
// 🔹 NORMALIZADOR DE INVENTARIO (versión definitiva)
// Basado en los nombres y keys del init original del juego
// =========================================================
normalizarInventario(inventario) {
  if (!Array.isArray(inventario)) return [];

  // === Diccionario base (de tu init) ===
  const base = {
    curacion: { key: "Curacion", nombre: "Materiales de curación" },
    pocionroja: { key: "pocionroja", nombre: "Poción Roja" },
    pocionazul: { key: "pocionazul", nombre: "Poción Azul" },
    monedas: { key: "Monedas", nombre: "Monedas" },
    runarara: { key: "runarara", nombre: "Runa rara" },
    runaepica: { key: "runaepica", nombre: "Runa épica" },
    runalegendaria: { key: "runalegendaria", nombre: "Runa legendaria" },
    cebo: { key: "cebo", nombre: "Cebo para dragones" },
    ceboepico: { key: "ceboepico", nombre: "Cebo para dragones épicos" },
    cebolegend: { key: "cebolegend", nombre: "Cebo para dragones legendarios" },
    repelente: { key: "repelente", nombre: "Repelente de dragones" },
    teleportluminaria: { key: "teleportluminaria", nombre: "Pergamino a Luminaria" },
    teleportharruni: { key: "teleportharruni", nombre: "Pergamino a Harruni" },
    teleportsilvanost: { key: "teleportsilvanost", nombre: "Pergamino a Silvanost" },
    teleportdrakengaard: { key: "teleportdrakengaard", nombre: "Pergamino a Drakengaard" },
    runaatraccionepica: { key: "runaatraccionepica", nombre: "Runa de Atracción Épica" },
    runaatraccionlegend: { key: "runaatraccionlegend", nombre: "Runa de Atracción Legendaria" },

    // 🥚 Huevos
    huevotrueno: { key: "huevotrueno", nombre: "Huevo de dragón de trueno" },
    huevofuego: { key: "huevofuego", nombre: "Huevo de dragón de fuego" },
    huevostriker: { key: "huevostriker", nombre: "Huevo de dragón striker" },
    huevomisterio: { key: "huevomisterio", nombre: "Huevo de dragón misterio" },
    huevoroca: { key: "huevoroca", nombre: "Huevo de dragón de roca" },
    huevoagua: { key: "huevoagua", nombre: "Huevo de dragón de agua" },

    // 🐟 Peces
    pezmisterio: { key: "pezmisterio", nombre: "Pez púrpura" },
    pezstriker: { key: "pezstriker", nombre: "Pez irisado" },
    peztrueno: { key: "peztrueno", nombre: "Pez dorado" },
    pezroca: { key: "pezroca", nombre: "Pez pétreo" },
    pezagua: { key: "pezagua", nombre: "Pez gélido" },
    pezfuego: { key: "pezfuego", nombre: "Pez ardiente" },
    tomo: { key: "Tomo", nombre: "Tomo de técnicas de entrenamiento de dragones" }
  };

  // === Equivalencias flexibles (para formas alternativas) ===
  const equivalencias = {
    "huevo agua": "huevoagua",
    "huevo de agua": "huevoagua",
    "huevo de dragón de agua": "huevoagua",
    "huevo fuego": "huevofuego",
    "huevo de fuego": "huevofuego",
    "huevo roca": "huevoroca",
    "huevo de roca": "huevoroca",
    "huevo trueno": "huevotrueno",
    "huevo de trueno": "huevotrueno",
    "huevo striker": "huevostriker",
    "huevo misterio": "huevomisterio",
    "huevo misterioso": "huevomisterio",
    "pez agua": "pezagua",
    "pez gelido": "pezagua",
    "pez gélido": "pezagua",
    "pez hielo": "pezagua",
    "pez roca": "pezroca",
    "pez fuego": "pezfuego",
    "pez ardiente": "pezfuego",
    "pez trueno": "peztrueno",
    "pez dorado": "peztrueno",
    "pez striker": "pezstriker",
    "pez irisado": "pezstriker",
    "pez misterio": "pezmisterio",
    "pez misterioso": "pezmisterio",
    "runa epica": "runaepica",
    "runa épica": "runaepica",
    "runa legendaria": "runalegendaria",
    "runa rara": "runarara",
    "cebo epico": "ceboepico",
    "cebo épico": "ceboepico",
    "cebo legendario": "cebolegend",
    "cebo de dragones": "cebo",
    "cebo para dragones": "cebo",
  };

  const limpio = [];

  inventario.forEach(item => {
    if (!item || !item.nombre) return;
    let nombre = item.nombre.toLowerCase().trim();
    nombre = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // sin acentos
    let key = (item.key || "").toLowerCase();

    // Buscar equivalencia flexible
    let canonica = null;
    if (equivalencias[nombre]) canonica = equivalencias[nombre];
    else if (base[key]) canonica = key;
    else {
      // Si no está, intenta emparejar por coincidencia parcial
      const match = Object.keys(base).find(k => nombre.includes(k));
      if (match) canonica = match;
    }

    if (!canonica) canonica = key || nombre.replace(/\s+/g, "");

    // Unificar
    let existente = limpio.find(i => i.key === canonica);
    const cantidad = item.cantidad || 1;
    if (existente) existente.cantidad += cantidad;
    else {
      const datos = base[canonica] || { key: canonica, nombre: item.nombre };
      limpio.push({ ...datos, cantidad });
    }
  });

  return limpio;
}

}
