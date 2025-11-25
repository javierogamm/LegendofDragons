/***** =========================
 * ESCENA EVENTOS COMPLETADOS
 * ========================== */
if (!window.SceneEventosCompletados) {
class SceneEventosCompletados extends Phaser.Scene {
  constructor() {
    super("SceneEventosCompletados");
  }

  create() {
    // Fondo semitransparente
    this.add.rectangle(500, 300, 1000, 600, 0x000000, 0.85);

    // Título
    this.add.text(500, 70, "📜 Eventos completados", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "32px",
      fill: "#ffd700",
      stroke: "#000",
      strokeThickness: 5
    }).setOrigin(0.5);

    // Contenedor scrollable
    const cont = this.add.container(0, 0);
    let y = 140;

// === RECONSTRUCCIÓN DE EVENTOS (UNIVERSAL) ===
let eventosState = {};
console.group("🧭 CARGA EVENTOS COMPLETADOS (UNIVERSAL)");

if (window.__RUNTIME_STATE) {
  const R = window.__RUNTIME_STATE;
  const src = R.eventosCompletados;

  console.log("🔍 Tipo real:", Object.prototype.toString.call(src));
  console.log("🔍 Constructor:", src?.constructor?.name);
  console.log("🔍 Object.keys:", Object.keys(src || {}));
  console.log("🔍 Contenido bruto:", src);

  if (src) {
    // ✅ Caso 1: Map real o iterable
    if (typeof src[Symbol.iterator] === "function") {
      console.log("✅ Iterando Map real");
      for (const [k, v] of src) eventosState[k] = v;
    }
    // ✅ Caso 2: objeto plano con pares
    else if (typeof src === "object") {
      const keys = Object.keys(src);
      console.log("🧩 Detectado objeto plano con", keys.length, "claves");
      for (const k of keys) {
        const val = src[k];
        if (Array.isArray(val) && val.length === 2 && typeof val[0] === "string") {
          // tipo [['volcan',1]]
          eventosState[val[0]] = val[1];
        } else if (typeof val === "object" && "key" in val && "value" in val) {
          eventosState[val.key] = val.value;
        } else {
          eventosState[k] = val;
        }
      }
    }
  } else {
    console.warn("🚫 Sin eventosCompletados en RUNTIME");
  }

  // Complementar con globales y meta
  if (R.eventosCompletadosGlobal && typeof R.eventosCompletadosGlobal === "object")
    Object.assign(eventosState, R.eventosCompletadosGlobal);
  if (R.meta && typeof R.meta === "object") {
  const metaFiltrado = {};
  for (const [k, v] of Object.entries(R.meta)) {
    if (!k.toLowerCase().includes("monolito")) metaFiltrado[k] = v;
  }
  Object.assign(eventosState, metaFiltrado);
}
} else {
  console.warn("🚫 __RUNTIME_STATE no existe todavía");
}

console.log("✅ EVENTOSSTATE FINAL:", eventosState);
console.groupEnd();


    const keys = Object.keys(eventosState);

    if (keys.length === 0) {
      cont.add(this.add.text(500, 300, "Aún no has completado ningún evento.", {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
        fill: "#ccc"
      }).setOrigin(0.5));
    } else {
      // Orden alfabético (biomas y monolitos)
      keys.sort();

     for (const [key, valor] of Object.entries(eventosState)) {
  const esMonolito = key.toLowerCase().includes("monolito");
  const texto = esMonolito
    ? `${key.replace("monolito", "Monolito ")}`
    : key;

  // Determinar la textura según el tipo
  let iconKey = null;
 if (esMonolito) {
  // nombres exactos según tus imágenes
  if (key.toLowerCase().includes("verde")) iconKey = "monolitoverde";
  else if (key.toLowerCase().includes("rojo")) iconKey = "monolitorojo";
  else if (key.toLowerCase().includes("azul")) iconKey = "monolitoazul";
} else {
  // iconos de biomas normales (usa sufijo ICON)
  const iconoBase = key.toLowerCase() + "icon";
  if (this.textures.exists(iconoBase)) {
    iconKey = iconoBase;
  } else if (this.textures.exists(key.toLowerCase() + "ICON")) {
    // en caso de mayúsculas mezcladas como "forestICON"
    iconKey = key.toLowerCase() + "ICON";
  }
}


  // Crear grupo de icono + texto
  const group = this.add.container(0, 0);

  // 🔹 Icono
  if (iconKey && this.textures.exists(iconKey)) {
    const icon = this.add.image(150, y + 12, iconKey)
      .setOrigin(0, 0.5)
      .setScale(0.2); // 20 % del tamaño original
    group.add(icon);
  }

  // 🔹 Texto
  const txt = this.add.text(190, y, `${texto}: ${valor}`, {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
    fill: esMonolito ? "#00bfff" : "#fff"
  }).setOrigin(0, 0.5);

  group.add(txt);
  cont.add(group);

  y += 50;
}
    }

    // Scroll con rueda del ratón
    const maxScroll = Math.max(0, y - 480);
    cont.y = 0;
    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
      cont.y -= deltaY * 0.5;
      if (cont.y > 0) cont.y = 0;
      if (cont.y < -maxScroll) cont.y = -maxScroll;
    });

    // Botón Volver
    const btnVolver = this.add.text(500, 550, "⬅ Volver", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "24px",
      fill: "#fff",
      backgroundColor: "#333",
      padding: { left: 15, right: 15, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive();

    btnVolver.on("pointerdown", () => this.scene.start("SceneWorld"));
    btnVolver.on("pointerover", () => btnVolver.setStyle({ backgroundColor: "#555", fill: "#ffd700" }));
    btnVolver.on("pointerout", () => btnVolver.setStyle({ backgroundColor: "#333", fill: "#fff" }));
  }
}

window.SceneEventosCompletados = SceneEventosCompletados;
}