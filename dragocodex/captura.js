/***** =========================
 * ESCENA CONFIRMACIÓN DE CAPTURA
 * ========================== */

class SceneCapturaConfirmacion extends Phaser.Scene {
  constructor(){ super("SceneCapturaConfirmacion"); }

  init(data){
    this.dragon = data.dragon;
  }

  preload(){
    if(this.dragon && this.dragon.mini && !this.textures.exists(this.dragon.name+"_mini")){
      this.load.image(this.dragon.name+"_mini", this.dragon.mini);
    }
    

    // Asegurar que la textura del cebo está cargada
    if(!this.textures.exists("cebo")){
      this.load.image("cebo", "assets/inventario/cebodragonesMED.png");
    }

     if(!this.textures.exists("cebolegend")){
  this.load.image("cebolegend", "assets/inventario/cebolegendMED.png");
}
if(!this.textures.exists("ceboepico")){
  this.load.image("ceboepico", "assets/inventario/cebodragonesepicoMED.png");
}
  }

 

 create(){
  let d = this.dragon;
  const { width: W, height: H } = this.sys.game.config;

  // Fondo oscuro centrado
  this.add.rectangle(W / 2, H / 2, W * 0.9, H * 0.85, 0x000000, 0.85);

  // Título centrado arriba
  this.add.text(W / 2, H * 0.15, "✨ ¡Has encontrado un nuevo dragón!", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"32px",
    fill:"#ffd700",
    fontStyle:"bold"
  }).setOrigin(0.5);

  // Imagen del dragón centrada a la izquierda
  this.add.image(W * 0.35, H * 0.5, d.name+"_mini").setScale(0.8);

  // Nombre y rareza
  let colorRareza = "#aaa";
  if(d.rareza==="Raro") colorRareza="#00bfff";
  if(d.rareza==="Épico") colorRareza="#bf00ff";
  if(d.rareza==="Legendario") colorRareza="#ffd700";

  this.add.text(W * 0.55, H * 0.38, `${d.name} [${d.rareza}]`, {
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"26px",
    fill:colorRareza
  }).setOrigin(0,0.5);

  // Stats
  let statsTxt = 
    `❤️ Vida: ${d.vidaMax}\n`+
    `🗡️ Mordisco: ${d.mordisco}\n`+
    `🔥 Aliento: ${d.aliento}\n`+
    `🛡️ Armadura: ${d.armadura}\n`+
    `💨 Velocidad: ${d.velocidad}\n`+
    `🌬️ Alientos: ${d.numAlientos}`;

  this.add.text(W * 0.55, H * 0.45, statsTxt, {
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#fff", align:"left"
  }).setOrigin(0,0);

  // ==========================================================
  // 🔹 Nueva función de probabilidad reducida por Tier
  // ==========================================================
  function calcularProbabilidadCaptura(rareza, tier, nivelDragon){
    let penalR = 0;
    if(rareza === "Raro") penalR = 10;
    if(rareza === "Épico") penalR = 20;
    if(rareza === "Legendario") penalR = 30;

    let baseMax = 20;
    if(tier === "B") baseMax = 30;
    if(tier === "A") baseMax = 20;
    if(tier === "S") baseMax = 10;

    let prob = baseMax - penalR;

    // 📊 Penalización por nivel superior del enemigo
    let maxNivelColeccion = 1;
    if(window.dragonesJugador && window.dragonesJugador.length > 0){
      maxNivelColeccion = Math.max(...window.dragonesJugador.map(d=>d.nivel || 1));
    }

    let desfase = nivelDragon - maxNivelColeccion;
    if(desfase > 0){
      if(desfase <= 2) prob *= 0.9;
      else {
        let exceso = Math.min(desfase, 8) - 2;
        let factor = 1 - (exceso / 6);
        prob = prob * factor;
      }
    }

    // límites globales
    if(prob < 3) prob = 3; // mínimo 3 %
    if(prob > baseMax) prob = baseMax; // nunca superar su tier máximo
    return Math.floor(prob);
  }

  // ==========================================================
  // 🧭 Popup de resultado
  // ==========================================================
  let popup = this.add.container(W / 2, H / 2).setVisible(false);
  let fondoPopup = this.add.rectangle(0, 0, W * 0.6, H * 0.6, 0x222222, 0.95)
    .setStrokeStyle(4, 0xffffff);
  let tituloPopup = this.add.text(0, -H * 0.22, "", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "28px", fill: "#ffd700", fontStyle: "bold"
  }).setOrigin(0.5);
  let miniImg = this.add.image(-W * 0.18, -H * 0.03, d.name + "_mini").setScale(0.7);
  let statsPopup = this.add.text(-W * 0.1, -H * 0.10, "", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px", fill: "#fff", align: "left"
  }).setOrigin(0, 0);
  let probTxt = this.add.text(0, H * 0.15, "", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px", fill: "#0f0"
  }).setOrigin(0.5);

 // ==========================================================
// 🎣 Lógica de cebos (limitada a 2 usos)
// ==========================================================
let cebosUsados = 0;
const MAX_CEBOS = 2;

// Texto de pregunta
let txtPreguntaCebo = this.add.text(0, 160, "¿Usar cebo?", {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "22px",
  fill: "#ffd700"
}).setOrigin(0.5).setVisible(false);

// === ICONOS Y CANTIDADES ===
let iconCebo = this.add.image(-80, 180, "cebo")
  .setScale(0.48).setInteractive().setVisible(false);
let txtNumCebo = this.add.text(-80, 215, "", {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "16px",
  fill: "#fff",
  backgroundColor: "#000"
}).setOrigin(0.5).setVisible(false);

let iconCeboEpico = this.add.image(0, 180, "ceboepico")
  .setScale(0.48).setInteractive().setVisible(false);
let txtNumCeboEpico = this.add.text(0, 215, "", {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "16px",
  fill: "#fff",
  backgroundColor: "#000"
}).setOrigin(0.5).setVisible(false);

let iconCeboLegend = this.add.image(80, 180, "cebolegend")
  .setScale(0.48).setInteractive().setVisible(false);
let txtNumCeboLegend = this.add.text(80, 215, "", {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "16px",
  fill: "#fff",
  backgroundColor: "#000"
}).setOrigin(0.5).setVisible(false);

// ==========================================================
// 🧭 Función para mostrar cebos disponibles
// ==========================================================
const mostrarCebosDisponibles = () => {
  // Buscar cantidades reales en inventario
  const ceboN = window.inventarioJugador?.find(it => it.nombre === "Cebo para dragones");
  const ceboE = window.inventarioJugador?.find(it => it.nombre === "Cebo para dragones épicos");
  const ceboL = window.inventarioJugador?.find(it => it.nombre === "Cebo para dragones legendarios");

  // Mostrar solo si hay cantidad > 0
  const visibleNormal = ceboN?.cantidad > 0;
  const visibleEpico = ceboE?.cantidad > 0;
  const visibleLegend = ceboL?.cantidad > 0;

  iconCebo.setVisible(visibleNormal);
  txtNumCebo.setVisible(visibleNormal);
  iconCeboEpico.setVisible(visibleEpico);
  txtNumCeboEpico.setVisible(visibleEpico);
  iconCeboLegend.setVisible(visibleLegend);
  txtNumCeboLegend.setVisible(visibleLegend);

  txtNumCebo.setText(visibleNormal ? ceboN.cantidad : "");
  txtNumCeboEpico.setText(visibleEpico ? ceboE.cantidad : "");
  txtNumCeboLegend.setText(visibleLegend ? ceboL.cantidad : "");

  // 🔄 Efecto palpitante (tween muy suave)
  [iconCebo, iconCeboEpico, iconCeboLegend].forEach(icon => {
    if (icon.visible) {
      this.tweens.add({
        targets: icon,
        scale: { from: 0.46, to: 0.5 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }
  });
};

// ==========================================================
// 🧭 Lógica de intento de captura (con bonus acumulativo y 3 intentos)
// ==========================================================
let mejorProb = 0;
let intentosRealizados = 0;
const MAX_INTENTOS = 3;

const intentarCaptura = (probExtra = 0) => {
  // 🔹 Actualizar el mejor bonus obtenido hasta ahora
  mejorProb = Math.max(mejorProb, probExtra);
  intentosRealizados++;

  // 🔹 Calcular probabilidad efectiva total
  let probBase = calcularProbabilidadCaptura(d.rareza, d.tier, d.nivel);
  let prob = Math.min(probBase + mejorProb, 95);

  // 🔹 Determinar si se captura
  let capturado = Math.random() * 100 <= prob;

  if (capturado) {
    // ==============================================
    // ✅ CAPTURA EXITOSA
    // ==============================================
    if (!window.dragonesJugador) window.dragonesJugador = [];
    window.dragonesJugador.push(d);

    // 📜 Registrar misión y StoryMode
    Misiones.registrarEvento("dragonCapturado", { name: d.name });
    if (window.storyMode) window.storyMode.trigger("captureDragon");

    // 📜 STORYMODE — verificar si ya hay 20 dragones para misión 20
    const total = (window.dragonesJugador || []).length;
    if (window.storyMode && total >= 20)
      window.storyMode.trigger("captureDragon");

    // Mostrar mensaje de éxito
    tituloPopup.setText(`🎉 ¡Capturado!`);
    probTxt.setText(`Probabilidad final: ${prob}% ✅`);

    // Volver al mapa
    this.time.delayedCall(2000, () => {
      this.scene.stop("SceneCapturaConfirmacion");
      this.scene.start("SceneMapa");
    });

  } else {
    // ==============================================
    // ❌ FALLA DE CAPTURA
    // ==============================================
    tituloPopup.setText(`💨 ¡Escapó!`);
    probTxt.setText(`Probabilidad final: ${prob}% ❌`);

    if (intentosRealizados < MAX_INTENTOS && cebosUsados < MAX_CEBOS) {
      // Aún puede intentar otra vez con cebo
      txtPreguntaCebo.setVisible(true);
      mostrarCebosDisponibles();
    } else {
      // Ya no se permiten más intentos ni cebos
      txtPreguntaCebo.setText("Ya no puedes usar más cebos")
        .setFill("#f55")
        .setVisible(true);
      iconCebo.setVisible(false);
      iconCeboEpico.setVisible(false);
      iconCeboLegend.setVisible(false);
      txtNumCebo.setVisible(false);
      txtNumCeboEpico.setVisible(false);
      txtNumCeboLegend.setVisible(false);
    }
  }

  // ==============================================
  // 🔹 Refrescar popup con stats actualizados
  // ==============================================
  statsPopup.setText(
    `❤️ Vida: ${d.vidaMax}\n` +
    `🗡️ Mordisco: ${d.mordisco}\n` +
    `🔥 Aliento: ${d.aliento}\n` +
    `🛡️ Armadura: ${d.armadura}\n` +
    `💨 Velocidad: ${d.velocidad}\n` +
    `🌬️ Alientos: ${d.numAlientos}`
  );

  // Mostrar popup
  popup.setVisible(true);
};


// ==========================================================
// 🎣 Interacciones con los 3 cebos (con confirmación de uso)
// ==========================================================
const mostrarPopupConfirmacionCebo = (nombreCebo, ceboItem, bonus, txtCantidad) => {
  if (cebosUsados >= MAX_CEBOS) return;
  if (!ceboItem || ceboItem.cantidad <= 0) return;

  const probBase = calcularProbabilidadCaptura(d.rareza, d.tier, d.nivel);
  const probFinal = Math.min(probBase + bonus, 95);

  // === Crear overlay ===
  const cam = this.cameras.main;
  const cx = cam.worldView.x + cam.width / 2;
  const cy = cam.worldView.y + cam.height / 2;

  const overlay = this.add.rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.6)
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(3000);

  const box = this.add.rectangle(cx, cy, 480, 220, 0x111111, 0.9)
    .setStrokeStyle(3, 0xffffff)
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(3001);

  const txtTitulo = this.add.text(cx, cy - 60, `¿Usar ${nombreCebo}?`, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "24px",
    fill: "#ffd700"
  }).setOrigin(0.5).setDepth(3002);

  const txtProb = this.add.text(cx, cy - 10, `💫 Probabilidad total: ${probFinal}%`, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "22px",
    fill: "#0f0"
  }).setOrigin(0.5).setDepth(3002);

  const btnSi = this.add.text(cx - 100, cy + 55, "✅", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "38px",
    fill: "#0f0"
  }).setOrigin(0.5).setInteractive().setDepth(3002);

  const btnNo = this.add.text(cx + 100, cy + 55, "❌", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "38px",
    fill: "#f55"
  }).setOrigin(0.5).setInteractive().setDepth(3002);

  // ✨ Animación de aparición
  [overlay, box, txtTitulo, txtProb, btnSi, btnNo].forEach(obj => obj.setScale(0.8).setAlpha(0));
  this.tweens.add({
    targets: [overlay, box, txtTitulo, txtProb, btnSi, btnNo],
    scale: 1,
    alpha: 1,
    duration: 250,
    ease: "Back.Out"
  });

  // ✅ Confirmar uso
  btnSi.on("pointerdown", () => {
    ceboItem.cantidad--;
    cebosUsados++;
    if (ceboItem.cantidad <= 0) {
      const idx = window.inventarioJugador.indexOf(ceboItem);
      if (idx >= 0) window.inventarioJugador.splice(idx, 1);
    }
    txtCantidad.setText(ceboItem?.cantidad || "0");

    // Destruir popup
    overlay.destroy(); box.destroy(); txtTitulo.destroy();
    txtProb.destroy(); btnSi.destroy(); btnNo.destroy();

    // Ejecutar intento
    intentarCaptura(bonus);
  });

  // ❌ Cancelar
  btnNo.on("pointerdown", () => {
    overlay.destroy(); box.destroy(); txtTitulo.destroy();
    txtProb.destroy(); btnSi.destroy(); btnNo.destroy();
  });
};

// ==========================================================
// Asignar handlers con popup de confirmación
// ==========================================================
iconCebo.on("pointerdown", () => {
  const cebo = window.inventarioJugador?.find(it => it.nombre === "Cebo para dragones");
  mostrarPopupConfirmacionCebo("Cebo para dragones", cebo, 15, txtNumCebo);
});

iconCeboEpico.on("pointerdown", () => {
  const ceboE = window.inventarioJugador?.find(it => it.nombre === "Cebo para dragones épicos");
  mostrarPopupConfirmacionCebo("Cebo para dragones épicos", ceboE, 25, txtNumCeboEpico);
});

iconCeboLegend.on("pointerdown", () => {
  const ceboL = window.inventarioJugador?.find(it => it.nombre === "Cebo para dragones legendarios");
  mostrarPopupConfirmacionCebo("Cebo para dragones legendarios", ceboL, 40, txtNumCeboLegend);
});

// ==========================================================
// Añadir al popup
// ==========================================================
popup.add([
  fondoPopup, tituloPopup, miniImg, statsPopup, probTxt,
  txtPreguntaCebo,
  iconCebo, txtNumCebo,
  iconCeboEpico, txtNumCeboEpico,
  iconCeboLegend, txtNumCeboLegend
]);
  // ==========================================================
  // 🟢 BOTONES PRINCIPALES
  // ==========================================================
  let btnAceptar = this.add.text(W / 2 - 120, H * 0.85, "✅ Aceptar (Capturar)", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"22px", fill:"#0f0", backgroundColor:"#333",
    padding:{left:15,right:15,top:8,bottom:8}
  }).setOrigin(0.5).setInteractive();

  let btnCancelar = this.add.text(W / 2 + 180, H * 0.85, "❌ Rechazar", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"22px", fill:"#f55", backgroundColor:"#333",
    padding:{left:15,right:15,top:8,bottom:8}
  }).setOrigin(0.5).setInteractive();

  btnAceptar.on("pointerdown",()=>{
    btnAceptar.setVisible(false);
    intentarCaptura(0);
  });

  btnCancelar.on("pointerdown",()=>{
    this.scene.stop("SceneCapturaConfirmacion");
    this.scene.start("SceneMapa");
  });
}

}
