/***** =========================
 * ESCENA CRIADERO DE DRAGONES (visualiza bebés eclosionados)
 * ========================== */
class SceneCriadero extends Phaser.Scene {
  constructor() { super("SceneCriadero"); }

  preload() {

    if (!window.dragones && window.dragonesBase) {
  window.dragones = window.dragonesBase; // por si lo tienes duplicado
}
    // Cargar imágenes baby si existen
    if (window.dragonesBaby) {
      window.dragonesBaby.forEach(d => {
        const babyKey = d.name + "_Baby";
        if (!this.textures.exists(babyKey)) {
          this.load.image(babyKey, "assets/baby/" + d.name + "_Baby.png");
        }
      });
    }

// === Cargar imágenes de dragones adultos (independiente de mayúsculas o espacios) ===
if (window.dragones) {
  window.dragones.forEach(d => {
    if (!d.name) return;

    // 🔹 Normalizar nombre (quita espacios dobles)
    const baseName = d.name.trim().replace(/\s+/g, " ");

    // 🔹 Generar las posibles rutas según capitalización
    const rutaNormal = "assets/Dragones/" + baseName + ".png";
    const rutaMinus  = "assets/Dragones/" + baseName.charAt(0).toLowerCase() + baseName.slice(1) + ".png";

    // 🔹 Key tal cual (respetando nombre original del dragón)
    const key = d.name;

    if (!this.textures.exists(key)) {
      try {
        // Carga priorizando la ruta exacta (como “Canto Mortal.png”)
        this.load.image(key, rutaNormal);

        // Por seguridad: si falla la primera, intenta con la inicial minúscula
        this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file) => {
          if (file.key === key) {
            console.warn("⚠️ Reintentando carga en minúsculas:", rutaMinus);
            this.load.image(key, rutaMinus);
            this.load.start();
          }
        });

      } catch (e) {
        console.warn("⚠️ No se pudo cargar imagen de", key, "→", rutaNormal);
      }
    }
  });
}


   // 🐟 Peces elementales (no usables desde el inventario)
    this.load.image("pezfuego", "assets/inventario/pezfuegoMED.png");
    this.load.image("pezagua", "assets/inventario/pezaguaMED.png");
    this.load.image("pezroca", "assets/inventario/pezrocaMED.png");
    this.load.image("peztrueno", "assets/inventario/peztruenoMED.png");
    this.load.image("pezstriker", "assets/inventario/pezstrikerMED.png");
    this.load.image("pezmisterio", "assets/inventario/pezmisterioMED.png");
    // Icono volver
    if (!this.textures.exists("volverICON")) {
      this.load.image("volverICON", "assets/iconos/volver.png");
    }
  }

  create() {
    const { width: W, height: H } = this.sys.game.config;

    this.add.text(W / 2, 60, "🪺 Criadero de Dragones", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "34px",
      fill: "#ffd700",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Contenedor principal con scroll
    this.scrollGroup = this.add.container(0, 0);
    this.scrollY = window.scrollCriadero || 0;

   if (!Array.isArray(window.dragonesBaby) || window.dragonesBaby.length === 0) {
  this.add.text(W / 2, H / 2 - 40, "No hay dragones bebé aún.", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "26px",
    fill: "#ffffff",
    fontStyle: "bold"
  }).setOrigin(0.5);

  // 🪺 Ilustración opcional (puedes comentar si no tienes la imagen)
  if (this.textures.exists("huevoVacio")) {
    this.add.image(W / 2, H / 2 + 60, "huevoVacio").setScale(0.6).setAlpha(0.8);
  }

  // 🔹 Botón Volver SIEMPRE disponible
  const btnVolver = this.add.text(W / 2, H - 80, "⬅ Volver", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "26px",
    fill: "#ffffff",
    backgroundColor: "#333",
    padding: { left: 25, right: 25, top: 10, bottom: 10 }
  })
    .setOrigin(0.5)
    .setInteractive()
    .setDepth(999);

  btnVolver.on("pointerover", () => btnVolver.setStyle({ backgroundColor: "#555" }));
  btnVolver.on("pointerout", () => btnVolver.setStyle({ backgroundColor: "#333" }));
  btnVolver.on("pointerdown", () => {
    this.scene.start(window.ultimaEscena || "SceneCiudad");
  });

  return; // 👈 solo después de crear el botón
}

    // === Renderizado de bebés (alineado, scrollable) ===
    const startY = 320;
    const separacionY = 340;
    const separacionX = 560;
    const porFila = 2;

    const getColorRareza = (r) => {
      switch ((r || "").toLowerCase()) {
        case "legendario": return "#ffd700";
        case "épico": return "#bf00ff";
        case "raro": return "#00bfff";
        case "común": return "#cccccc";
        default: return "#ffffff";
      }
    };

    window.dragonesBaby.forEach((d, i) => {
      const col = i % porFila;
      const fila = Math.floor(i / porFila);
      let x = W / 2 - separacionX / 2 + col * separacionX;
      const y = startY + fila * separacionY;
      if (col === 0) x -= 100;

      const babyKey = d.name + "_Baby";
      const colorRareza = getColorRareza(d.rareza);

      // Contenedor individual
      const item = this.add.container(0, 0);

      // Marco
      const marco = this.add.rectangle(x, y, 260, 260, 0x000000, 0)
        .setStrokeStyle(4, Phaser.Display.Color.HexStringToColor(colorRareza).color);
      item.add(marco);

      // Imagen del bebé
      const img = this.add.image(x, y, babyKey).setScale(0.9).setInteractive();
      img.on("pointerdown", () => this.mostrarFichaBaby(d));
      item.add(img);

      // Textos a la derecha
      const infoX = x + 200;
      const infoY = y - 90;

      item.add(this.add.text(infoX, infoY, d.name, {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px",
        fill: colorRareza,
        fontStyle: "bold"
      }).setOrigin(0, 0));

      item.add(this.add.text(infoX, infoY + 28, `Rareza: ${d.rareza}`, {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "16px",
        fill: colorRareza
      }).setOrigin(0, 0));

      item.add(this.add.text(infoX, infoY + 56, `Tipo: ${d.tipo}`, {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "16px",
        fill: "#ffffff"
      }).setOrigin(0, 0));

      item.add(this.add.text(infoX, infoY + 84, `Clase: ${d.clase}`, {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "16px",
        fill: "#cccccc"
      }).setOrigin(0, 0));

      this.scrollGroup.add(item);
    });

    // === Scroll con máscara ===
    const maskTop = 100;
    const maskHeight = H - 180;
    const maskWidth = W;
    const maskShape = this.add.rectangle(W / 2, maskTop + maskHeight / 2, maskWidth, maskHeight, 0x000000, 0);
    const mask = maskShape.createGeometryMask();
    this.scrollGroup.setMask(mask);

    const totalAltura = Math.ceil(window.dragonesBaby.length / porFila) * separacionY;
    const maxScroll = Math.max(0, totalAltura - maskHeight);
    this.scrollGroup.y = this.scrollY;

    this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
      this.scrollY -= deltaY * 0.4;
      if (this.scrollY > 0) this.scrollY = 0;
      if (this.scrollY < -maxScroll) this.scrollY = -maxScroll;
      this.scrollGroup.y = this.scrollY;
      window.scrollCriadero = this.scrollY;
    });

    // === Botón Volver ===
    const btnVolver = this.add.text(80, H - 40, "⬅ Volver", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
      fill: "#ffffff"
    }).setInteractive().setDepth(999);

    btnVolver.on("pointerdown", () => {
      this.scene.start(window.ultimaEscena || "SceneCiudad");
    });
  }

  // === Popup informativo del bebé ===
  mostrarFichaBaby(d) {
    const { width: W, height: H } = this.sys.game.config;

    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.8)
      .setDepth(400)
      .setInteractive();

    const caja = this.add.rectangle(W / 2, H / 2, 880, 600, 0x111111, 0.95)
      .setDepth(401)
      .setStrokeStyle(3, 0xffffff);

    const getColorRareza = (r) => {
      switch ((r || "").toLowerCase()) {
        case "legendario": return "#ffd700";
        case "épico": return "#bf00ff";
        case "raro": return "#00bfff";
        case "común": return "#cccccc";
        default: return "#ffffff";
      }
    };
    const colorRareza = getColorRareza(d.rareza);

    const nameTxt = this.add.text(W / 2, H / 2 - 230, d.name, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "38px",
      fill: colorRareza,
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(410);

    const babyKey = d.name + "_Baby";
    const img = this.add.image(W / 2, H / 2 + 40, babyKey)
      .setScale(1.2)
      .setDepth(402);

// === Barra de confianza (visible solo en la ficha) ===
const confianzaMax = 100;
const conf = Phaser.Math.Clamp(d.confianza || 0, 0, confianzaMax);
const progreso = conf / confianzaMax;
const colorBarra = this.obtenerColorRareza(d.rareza);

// 📍 Ajustes de posición general
const posBaseX = W / 2 - 360;
const posBaseY = H / 2 - 40;
const altoTotal = 250;
const anchoBarra = 30;

// === Fondo de barra ===
const barraFondo = this.add.rectangle(posBaseX, posBaseY, anchoBarra, altoTotal, 0x000000, 0)
  .setOrigin(0.5, 0.5)
  .setDepth(402);

// === Barra de progreso perfectamente alineada con el fondo ===
const yBaseInferior = posBaseY + altoTotal / 2; // borde inferior del fondo
const barraProgreso = this.add.rectangle(
  posBaseX,
  yBaseInferior,        // 👈 base en el mismo punto
  anchoBarra,
  altoTotal * progreso, // altura proporcional
  colorBarra
)
  .setOrigin(0.5, 1)     // 👈 anclada abajo
  .setDepth(403);


// Texto de porcentaje
const txtConfianza = this.add.text(posBaseX - 45, posBaseY + 150, `${conf}%`, {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
  color: "#fff"
}).setDepth(403);

// Etiqueta
this.add.text(posBaseX - 60, posBaseY - 160, "🤝 Confianza", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px",
  fill: "#ffd700"
}).setDepth(403);

// === Botones alineados horizontalmente ===
const yBotones = H / 2 + 290; // altura común
const separacionBotones = 200; // distancia horizontal entre ellos

// 🍖 Botón Alimentar
const btnFeed = this.add.text(W / 2 - separacionBotones / 2, yBotones, "🍖 Alimentar", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px",
  fill: "#fff",
  backgroundColor: "#444",
  padding: { left: 15, right: 15, top: 8, bottom: 8 }
})
  .setOrigin(0.5)
  .setDepth(403)
  .setInteractive();

btnFeed.on("pointerover", () => btnFeed.setStyle({ backgroundColor: "#666" }));
btnFeed.on("pointerout", () => btnFeed.setStyle({ backgroundColor: "#444" }));
btnFeed.on("pointerdown", () => this.mostrarPopupPeces(d, barraProgreso, txtConfianza));

// 🧬 Botón Hacer Adulto (solo si raro o más)
if (["raro", "épico", "legendario"].includes(d.rareza.toLowerCase())) {
  const btnAdulto = this.add.text(W / 2 + separacionBotones / 2, yBotones, "🧬 Hacer Adulto", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px",
    fill: "#fff",
    backgroundColor: "#226622",
    padding: { left: 15, right: 15, top: 8, bottom: 8 }
  })
    .setOrigin(0.5)
    .setInteractive()
    .setDepth(403);

  btnAdulto.on("pointerover", () => btnAdulto.setStyle({ backgroundColor: "#339933" }));
  btnAdulto.on("pointerout", () => btnAdulto.setStyle({ backgroundColor: "#226622" }));
  btnAdulto.on("pointerdown", () => this.hacerAdulto(d));
}


// === Rareza y tipo/clase debajo del dragón ===
this.add.text(W / 2, H / 2 + 220, `Rareza: ${d.rareza}`, {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
  fill: this.colorHexPorRareza(d.rareza)
}).setOrigin(0.5).setDepth(402);

this.add.text(W / 2, H / 2 + 250, `Tipo: ${d.tipo}   •   Clase: ${d.clase}`, {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px",
  fill: "#ccc"
}).setOrigin(0.5).setDepth(402);

// === Mensaje inferior ===
this.add.text(W / 2, H / 2 + 285, "🐣 Aún es un bebé, sus stats se revelarán al crecer.", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
  fill: "#bbb"
}).setOrigin(0.5).setDepth(402);

// === Botón Cerrar centrado abajo ===
const btnCerrar = this.add.text(W / 2, H / 2 + 330, "Cerrar", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
  fill: "#fff",
  backgroundColor: "#444",
  padding: { left: 30, right: 30, top: 10, bottom: 10 }
})
  .setOrigin(0.5)
  .setInteractive()
  .setDepth(403);

btnCerrar.on("pointerover", () => btnCerrar.setStyle({ backgroundColor: "#666" }));
btnCerrar.on("pointerout", () => btnCerrar.setStyle({ backgroundColor: "#444" }));
btnCerrar.on("pointerdown", () => {
  overlay.destroy();
  caja.destroy();
  nameTxt.destroy();
  img.destroy();
  btnCerrar.destroy();
  this.children.list
    .filter(c => c.depth === 402 || c.depth === 403)
    .forEach(c => c.destroy());
});

  }

 /***** === Popup de alimentación con barra de progreso integrada === *****/
mostrarPopupPeces(d, barraProgresoExterno, txtConfianzaExterno) {
  const { width: W, height: H } = this.sys.game.config;

  // Filtrar solo peces del inventario
  const peces = (window.inventarioJugador || []).filter(it =>
    it.key?.startsWith("pez")
  );

  if (peces.length === 0) {
    alert("🐟 No tienes peces en tu inventario.");
    return;
  }

  const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
    .setDepth(500)
    .setInteractive();

  // === Caja principal más grande ===
  const caja = this.add.rectangle(W / 2, H / 2, 1000, 640, 0x111111, 0.95)
    .setStrokeStyle(3, 0xffffff)
    .setDepth(501);

  // === Título ===
  this.add.text(W / 2, H / 2 - 280, `🍖 Alimentar a ${d.name}`, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "32px",
    fill: "#ffd700",
    fontStyle: "bold",
    stroke: "#000",
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(502);

  // === Barra de progreso de confianza (solo visual) ===
  const confianzaMax = 100;
  const conf = Phaser.Math.Clamp(d.confianza || 0, 0, confianzaMax);
  const progreso = conf / confianzaMax;
  const colorBarra = this.obtenerColorRareza(d.rareza);

  const anchoBarra = 600;
  const altoBarra = 30;
  const baseY = H / 2 - 200;

  // Fondo de la barra
  const fondoBarra = this.add.rectangle(W / 2, baseY, anchoBarra, altoBarra, 0x000000, 0.7)
    .setStrokeStyle(2, 0xffffff)
    .setDepth(502);

  // Barra rellena
  const barra = this.add.rectangle(
    W / 2 - anchoBarra / 2,
    baseY,
    anchoBarra * progreso,
    altoBarra,
    colorBarra
  )
    .setOrigin(0, 0.5)
    .setDepth(503);

  // Texto %
  const txtPorcentaje = this.add.text(W / 2, baseY - 35, `${conf}% confianza`, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "20px",
    fill: "#fff"
  }).setOrigin(0.5).setDepth(503);

  // === Configuración de grilla de peces ===
  const columnas = 3;
  const espacioX = 290;
  const espacioY = 150;
  const inicioX = W / 2 - espacioX;
  const inicioY = H / 2 - 100;

  const tipoDragon = (d.tipo || "").toLowerCase();
  const opuestos = {
    fuego: "agua",
    agua: "fuego",
    trueno: "roca",
    roca: "trueno",
    striker: "misterio",
    misterio: "striker"
  };
  const rareza = (d.rareza || "").toLowerCase();

  peces.forEach((p, i) => {
    const col = i % columnas;
    const fila = Math.floor(i / columnas);
    const x = inicioX + col * espacioX;
    const y = inicioY + fila * espacioY;
    const tipoPez = (p.key || "").replace("pez", "").toLowerCase();

    // === Calcular puntos según rareza y afinidad ===
    let puntosFinal = 0;
    if (rareza === "común") {
      if (tipoPez === tipoDragon) puntosFinal = 30;
      else if (opuestos[tipoDragon] === tipoPez) puntosFinal = 10;
      else puntosFinal = 15;
    } else if (rareza === "raro") {
      if (tipoPez === tipoDragon) puntosFinal = 15;
      else if (opuestos[tipoDragon] === tipoPez) puntosFinal = 5;
      else puntosFinal = 10;
    } else if (rareza === "épico") {
      if (tipoPez === tipoDragon) puntosFinal = 10;
      else if (opuestos[tipoDragon] === tipoPez) puntosFinal = 3;
      else puntosFinal = 6;
    } else if (rareza === "legendario") {
      if (tipoPez === tipoDragon) puntosFinal = 6;
      else if (opuestos[tipoDragon] === tipoPez) puntosFinal = 2;
      else puntosFinal = 4;
    }

    // === Render de cada pez ===
    const icon = this.add.image(x - 80, y, p.key)
      .setScale(1)
      .setDepth(502)
      .setInteractive({ useHandCursor: true });

    const nombreTxt = this.add.text(x - 20, y - 25, p.nombre, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "20px",
      fill: "#fff"
    }).setOrigin(0, 0.5).setDepth(502);

    const cantidadTxt = this.add.text(x - 20, y + 10, `x${p.cantidad}`, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "18px",
      fill: "#ccc"
    }).setOrigin(0, 0.5).setDepth(502);

    const tooltip = this.add.text(x - 80, y - 80, `+${puntosFinal} confianza`, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "16px",
      fill: "#ffd700",
      backgroundColor: "rgba(0,0,0,0.6)",
      padding: { left: 6, right: 6, top: 4, bottom: 4 }
    }).setOrigin(0.5, 1).setAlpha(0).setDepth(503);

    icon.on("pointerover", () => tooltip.setAlpha(1));
    icon.on("pointerout", () => tooltip.setAlpha(0));

    icon.on("pointerdown", () => {
      this.alimentarDragonConPez(d, p, barra, txtPorcentaje, barraProgresoExterno, txtConfianzaExterno);
      cantidadTxt.setText(`x${p.cantidad}`);
      if (p.cantidad <= 0) {
        icon.destroy();
        nombreTxt.destroy();
        cantidadTxt.destroy();
        tooltip.destroy();
      }
    });
  });

  // === Botón cerrar (único modo de salir) ===
  const btnCerrar = this.add.text(W / 2, H / 2 + 270, "Cerrar", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "24px",
    fill: "#fff",
    backgroundColor: "#333",
    padding: { left: 30, right: 30, top: 10, bottom: 10 }
  }).setOrigin(0.5).setInteractive().setDepth(503);

  btnCerrar.on("pointerover", () => btnCerrar.setStyle({ backgroundColor: "#555" }));
  btnCerrar.on("pointerout", () => btnCerrar.setStyle({ backgroundColor: "#333" }));
  btnCerrar.on("pointerdown", () => {
    overlay.destroy();
    caja.destroy();
    barra.destroy();
    fondoBarra.destroy();
    txtPorcentaje.destroy();
    btnCerrar.destroy();
    this.children.list.filter(c => c.depth >= 502 && c.depth <= 503).forEach(c => c.destroy());
  });
}


/***** === Alimentación (actualiza barra interna y externa) === *****/
alimentarDragonConPez(d, pez, barraPopup, txtPorcentaje, barraExterna, txtExterno) {
  const opuestos = {
    fuego: "agua",
    agua: "fuego",
    trueno: "roca",
    roca: "trueno",
    striker: "misterio",
    misterio: "striker"
  };

  const tipoDragon = (d.tipo || "").toLowerCase();
  const tipoPez = pez.key.replace("pez", "").toLowerCase();
  const rareza = (d.rareza || "").toLowerCase();

  let puntos = 0;
  if (rareza === "común") {
    if (tipoPez === tipoDragon) puntos = 30;
    else if (opuestos[tipoDragon] === tipoPez) puntos = 10;
    else puntos = 15;
  } else if (rareza === "raro") {
    if (tipoPez === tipoDragon) puntos = 15;
    else if (opuestos[tipoDragon] === tipoPez) puntos = 5;
    else puntos = 10;
  } else if (rareza === "épico") {
    if (tipoPez === tipoDragon) puntos = 10;
    else if (opuestos[tipoDragon] === tipoPez) puntos = 3;
    else puntos = 6;
  } else if (rareza === "legendario") {
    if (tipoPez === tipoDragon) puntos = 6;
    else if (opuestos[tipoDragon] === tipoPez) puntos = 2;
    else puntos = 4;
  }

  // Consumir pez
  pez.cantidad--;
  if (pez.cantidad <= 0) {
    const idx = window.inventarioJugador.indexOf(pez);
    if (idx >= 0) window.inventarioJugador.splice(idx, 1);
  }

  // Aplicar confianza
  d.confianza = Math.min((d.confianza || 0) + puntos, 100);

  const progreso = d.confianza / 100;
  const colorBarra = this.obtenerColorRareza(d.rareza);

  // Animar barra del popup
  this.tweens.add({
    targets: barraPopup,
    width: 600 * progreso,
    fillColor: colorBarra,
    duration: 300
  });
  txtPorcentaje.setText(`${Math.floor(d.confianza)}% confianza`);

  // Actualizar barra externa de ficha si estaba abierta
  if (barraExterna && txtExterno) {
    this.tweens.add({
      targets: barraExterna,
      height: 250 * progreso,
      y: (this.sys.game.config.height / 2 + 165) - (250 * progreso),
      fillColor: colorBarra,
      duration: 300
    });
    txtExterno.setText(`${Math.floor(d.confianza)}%`);
  }

  // Guardar en global
  const babyGlobal = window.dragonesBaby.find(b => b.name === d.name);
  if (babyGlobal) babyGlobal.confianza = d.confianza;

  // === Subida de rareza si llega a 100% ===
if (d.confianza >= 100) {
  const escalas = ["común", "raro", "épico", "legendario"];
  const idxActual = escalas.indexOf(rareza);

  if (idxActual < escalas.length - 1) {
    d.rareza = escalas[idxActual + 1];
    d.confianza = 0;

    const babyGlobal = window.dragonesBaby.find(b => b.name === d.name);
    if (babyGlobal) {
      babyGlobal.rareza = d.rareza;
      babyGlobal.confianza = 0;
    }

    // 🔹 Efecto visual al subir rareza
    const { width: W, height: H } = this.sys.game.config;
    const colorAura = this.obtenerColorRareza(d.rareza);
    const aura = this.add.circle(W / 2, H / 2, 60, colorAura, 0.6)
      .setDepth(610)
      .setScale(0)
      .setAlpha(0.8);

    this.tweens.add({
      targets: aura,
      scale: 6,
      alpha: 0,
      duration: 1000,
      ease: "Cubic.easeOut",
      onComplete: () => aura.destroy()
    });

    // 🟣 Actualizar color visual del dragón en el criadero
    const item = this.scrollGroup.list.find(obj => {
      const text = obj.list?.find?.(t => t.text === d.name);
      return !!text;
    });

    if (item) {
      const colorHex = this.colorHexPorRareza(d.rareza);
      // Marco
      const marco = item.list?.find?.(e => e.geom && e.strokeColor);
      if (marco) marco.setStrokeStyle(4, Phaser.Display.Color.HexStringToColor(colorHex).color);

      // Textos
      item.list?.forEach(el => {
        if (el.text && el.text.startsWith("Rareza")) el.setText(`Rareza: ${d.rareza}`);
        if (el.text === d.name) el.setColor(colorHex);
      });
    }

    // 🌀 Reiniciar barras
    if (barraPopup && txtPorcentaje) {
      this.tweens.add({
        targets: barraPopup,
        width: 0,
        duration: 300
      });
      txtPorcentaje.setText("0% confianza");
    }

    if (barraExterna && txtExterno) {
      this.tweens.add({
        targets: barraExterna,
        height: 0,
        duration: 300
      });
      txtExterno.setText("0%");
    }

    // 🔹 Actualizar ficha del bebé si está abierta
    this.time.delayedCall(1000, () => {
      this.children.list
        .filter(c => c.depth >= 400 && c.depth <= 600)
        .forEach(c => c.destroy());
      this.mostrarFichaBaby(d);
    });
  }
}
}
  // === Helpers ===
  getPuntosPorPez(key) {
    const puntosPorTipo = {
      pezfuego: 5,
      pezagua: 5,
      pezroca: 6,
      peztrueno: 7,
      pezstriker: 8,
      pezmisterio: 10
    };
    return puntosPorTipo[key] || 3;
  }

  obtenerColorRareza(r) {
    switch ((r || "").toLowerCase()) {
      case "legendario": return 0xffd700;
      case "épico": return 0xbf00ff;
      case "raro": return 0x00bfff;
      case "común": return 0xaaaaaa;
      default: return 0xffffff;
    }
  }
colorHexPorRareza(r) {
  switch ((r || "").toLowerCase()) {
    case "legendario": return "#ffd700";
    case "épico": return "#bf00ff";
    case "raro": return "#00bfff";
    case "común": return "#cccccc";
    default: return "#ffffff";
  }
}

// === 🌟 Convertir dragón bebé en adulto (evolución completa con cuadro de stats) ===
hacerAdulto(d) {
  if (!d || !d.rareza) return;

  const rarezaNivel = ["nada", "común", "raro", "épico", "legendario"];
  const idx = rarezaNivel.indexOf(d.rareza.toLowerCase());
  if (idx < 2) {
    alert("❌ Este dragón aún no tiene la suficiente confianza para crecer.");
    return;
  }

  // Buscar modelo base
// 🔍 Buscar el modelo base del dragón sin importar mayúsculas, tildes o espacios
const normalizar = s => (s || "")
  .toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // elimina tildes
  .replace(/\s+/g, ""); // elimina espacios

const base = (window.dragones || []).find(b =>
  normalizar(b.name) === normalizar(d.name)
);  if (!base) {
    alert("⚠️ No se encontró el modelo base de este dragón.");
    return;
  }

  // Crear clon adulto (sin random, rareza fija)
  const nuevo = JSON.parse(JSON.stringify(base));
  nuevo.name = d.name;
  nuevo.tipo = base.tipo;
  nuevo.clase = base.clase;
  nuevo.tier = base.tier;
  nuevo.nivel = 1;
  nuevo.exp = 0;
  nuevo.rareza = d.rareza.charAt(0).toUpperCase() + d.rareza.slice(1);
  nuevo.img = `assets/dragones/${nuevo.name}.png`;
  nuevo.mini = `assets/mini/${nuevo.name}_mini.png`;

  // Multiplicadores por rareza (deterministas)
  const multiplicadores = {
    común: 1.0,
    raro: 1.15,
    épico: 1.3,
    legendario: 1.5
  };
  const mult = multiplicadores[d.rareza.toLowerCase()] || 1;

  nuevo.vidaMax = Math.round((base.vida || 100) * mult);
  nuevo.vida = nuevo.vidaMax;
  nuevo.mordisco = Math.round((base.mordisco || 10) * mult);
  nuevo.aliento = Math.round((base.aliento || 10) * mult);
  nuevo.armadura = Math.round((base.armadura || 10) * mult);
  nuevo.velocidad = Math.round((base.velocidad || 10) * mult);
  nuevo.numAlientos = base.numAlientos || 1;

  if (window.roleplay && typeof roleplay.asignarNivel === "function") {
    roleplay.asignarNivel(nuevo, 1);
  }

  // Eliminar baby del criadero
  window.dragonesBaby = window.dragonesBaby.filter(b => b.name !== d.name);

  // === 🎬 Animación de evolución ===
  const { width: W, height: H } = this.sys.game.config;
  const colorAura = this.obtenerColorRareza(d.rareza);

  // Imagen del baby centrada
  const babyKey = d.name + "_Baby";
  const babySprite = this.add.image(W / 2, H / 2 + 40, babyKey)
    .setScale(1.2)
    .setDepth(601);

  // Aura
  const aura = this.add.circle(W / 2, H / 2 + 40, 60, colorAura, 0.5).setDepth(600);

  // Baby pulsa y desaparece
  this.tweens.add({
    targets: babySprite,
    scale: 1.4,
    duration: 500,
    yoyo: true,
    ease: "Sine.easeInOut"
  });

  this.tweens.add({
    targets: aura,
    radius: 300,
    alpha: 0,
    duration: 900,
    delay: 400,
    ease: "Cubic.easeOut",
    onComplete: () => aura.destroy()
  });

  this.tweens.add({
    targets: babySprite,
    alpha: 0,
    duration: 700,
    delay: 600,
    onComplete: () => babySprite.destroy()
  });

  // === 💥 Eliminar todos los elementos del popup anterior (ficha baby) ===
this.children.list.forEach(obj => {
  // Cierra todos los elementos que estaban en la ficha del baby (niveles 400–450)
  if (obj.depth >= 400 && obj.depth < 500) obj.destroy();
});

  // === Aparece adulto + cuadro de stats ===
  this.time.delayedCall(1000, () => {
    // Imagen del adulto
    const adultoSprite = this.add.image(W / 2, H / 2 - 60, nuevo.name)
      .setScale(0.8)
      .setAlpha(0)
      .setDepth(602);

    // Brillo de aparición
    const flash = this.add.rectangle(W / 2, H / 2, W, H, colorAura, 0.5).setDepth(603);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy()
    });

    this.tweens.add({
      targets: adultoSprite,
      alpha: 1,
      scale: 1.1,
      duration: 800,
      ease: "Back.easeOut"
    });

// === Cuadro de stats (ajustado verticalmente) ===
const offsetX = W / 2 + 480; // sigue a la derecha
const offsetY = H / 2 + 40;  // 🔹 bajamos el conjunto unos 100 px

const caja = this.add.rectangle(offsetX, offsetY + 100, 340, 260, 0x111111, 0.9)
  .setStrokeStyle(3, 0xffffff)
  .setDepth(604);

const colorHex = Phaser.Display.Color.IntegerToColor(colorAura).rgba;

// 🔸 Título bien centrado dentro del cuadro
this.add.text(offsetX, offsetY - 10, `🐉 ${nuevo.name} (${nuevo.rareza})`, {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "24px",
  fill: colorHex,
  stroke: "#000",
  strokeThickness: 3
}).setOrigin(0.5).setDepth(605);

// 🔹 Stats más centrados verticalmente
const stats = [
  `❤️ Vida: ${nuevo.vidaMax}`,
  `🦷 Mordisco: ${nuevo.mordisco}`,
  `🔥 Aliento: ${nuevo.aliento}`,
  `🛡️ Armadura: ${nuevo.armadura}`,
  `💨 Velocidad: ${nuevo.velocidad}`,
  `🌬️ Nº Alientos: ${nuevo.numAlientos}`
];

stats.forEach((t, i) => {
  this.add.text(offsetX, offsetY + 25 + i * 28, t, {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
    fill: "#fff"
  }).setOrigin(0.5).setDepth(605);
});


    // === Botón OK para volver al criadero ===
    const btnOK = this.add.text(W / 2, H / 2 + 300, "✅ OK", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
      fill: "#fff",
      backgroundColor: "#444",
      padding: { left: 30, right: 30, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(606);

    btnOK.on("pointerover", () => btnOK.setStyle({ backgroundColor: "#666" }));
    btnOK.on("pointerout", () => btnOK.setStyle({ backgroundColor: "#444" }));

    btnOK.on("pointerdown", () => {
      if (!window.dragonesJugador) window.dragonesJugador = [];
      window.dragonesJugador.push(nuevo);
      // 🐣 Notificar al modo historia que un bebé ha crecido
      if (window.storyMode) window.storyMode.trigger("babyGrown");
      // Limpia elementos y vuelve al criadero
      adultoSprite.destroy();
      caja.destroy();
      btnOK.destroy();
      this.children.list
        .filter(c => c.depth >= 604)
        .forEach(c => c.destroy());

      this.scene.restart(); // recarga el criadero actualizado
    });
  });
}

}

window.SceneCriadero = SceneCriadero;
