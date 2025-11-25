/***** =========================
 * ESCENA SELECTOR (solo Tier B en la selección inicial)
 * ========================== */
class SceneSelector extends Phaser.Scene {
  constructor(){ super("SceneSelector"); }

  preload(){
    this.load.image("fondo","assets/fondos/selector_fondo.png"); 
    dragones.forEach(d=>{
      this.load.image(d.name+"_mini", d.mini);
      this.load.image(d.name+"_img", d.img);
      if(d.carta){ this.load.image(d.name+"_carta", d.carta); }
    });
  }

  create() {
  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;

  // 🖼️ Fondo adaptado
  this.add.image(W / 2, H / 2, "fondo").setDisplaySize(W, H).setAlpha(0.3);
  this.scrollContainer = this.add.container(0, 0);

  // === CONFIGURACIÓN VISUAL ACTUALIZADA ===
  const maxPorFila = 6;          // 🔹 menos por fila
  const espacioX = 1500 / (maxPorFila + 1);
  let x = espacioX;
  let y = 260;                   // 🔹 más abajo
  let count = 0;

  const dragonesIniciales = dragones.filter(d => d.tier === "B");

  dragonesIniciales.forEach(d => {
    const card = this.add.container(x, y);

    // Fondo del marco más grande
    const bg = this.add.rectangle(0, 0, 160, 160, 0x111111, 0.8)
      .setStrokeStyle(2, 0xffffff, 0.3);
    card.add(bg);

    // Imagen completa (no mini)
    const imgKey = d.name + "_img";
    const mini = this.add.image(0, -10, imgKey)
      .setInteractive()
      .setScale(0.35) // 🔹 ajustado para tamaño uniforme
      .setOrigin(0.5);

    mini.on("pointerover", () => bg.setStrokeStyle(3, 0xffd700, 1));
    mini.on("pointerout", () => bg.setStrokeStyle(2, 0xffffff, 0.3));
    mini.on("pointerdown", () => this.mostrarCarta(d));
    card.add(mini);

    // Color por tier
    let color = "#fff";
    if (d.tier === "A") color = "#00bfff";
    if (d.tier === "S") color = "#ffd700";

    // Nombre del dragón debajo
    const nameText = this.add.text(0, 85, `${d.name} (${d.tier})`, {
      fontSize: "16px",
      fontFamily: "'Cinzel Decorative', serif",
      fill: color,
      align: "center",
      wordWrap: { width: 140 }
    }).setOrigin(0.5);
    card.add(nameText);

    this.scrollContainer.add(card);

    count++;
    if (count % maxPorFila === 0) {
      x = espacioX;
      y += 220; // 🔹 más separación vertical
    } else {
      x += espacioX;
    }
  });

  this.panel = null;
}

  mostrarCarta(dragon) {
  if (this.panel) { this.panel.destroy(); this.panel = null; }

  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;

  // === Panel centrado dinámico (grande pero equilibrado) ===
  this.panel = this.add.container(W / 2, H / 2);
  this.panel.setScale(0);
  this.panel.setAlpha(0);

  // Fondo oscuro central
  const fondo = this.add.rectangle(0, 0, 900, 650, 0x000000, 0.9)
    .setStrokeStyle(4, 0xffffff)
    .setOrigin(0.5);
  this.panel.add(fondo);

  // Imagen del dragón arriba
  const carta = this.add.image(0, -170, dragon.name + "_img")
    .setScale(0.65)
    .setOrigin(0.5);
  this.panel.add(carta);

  // Color por tier
  let color = "#fff";
  if (dragon.tier === "A") color = "#00bfff";
  if (dragon.tier === "S") color = "#ffd700";

  // === Nombre + Clase ===
  const claseTexto = dragon.clase ? `⚔️ Clase: ${dragon.clase}` : "";
  const nombreClase = this.add.text(0, 110,
    `🐉 ${dragon.name} (Tier ${dragon.tier})\n${claseTexto}`,
    {
      fontSize: "22px",
      fontFamily: "'Cinzel Decorative', serif",
      fill: color,
      align: "center",
      wordWrap: { width: 800 }
    }
  ).setOrigin(0.5);
  this.panel.add(nombreClase);

  // === Stats del dragón (más arriba y fuente más pequeña) ===
  const texto = this.add.text(0, 200,
    `❤️ Vida: ${dragon.vida}\n` +
    `🗡️ Mordisco: ${dragon.mordisco}\n` +
    `🔥 Aliento: ${dragon.aliento}\n` +
    `🛡️ Armadura: ${dragon.armadura}\n` +
    `⚡ Velocidad: ${dragon.velocidad}\n` +
    `💨 Alientos: ${dragon.numAlientos}`,
    {
      fontSize: "16px", // 🔹 fuente más pequeña
      fontFamily: "'Cinzel Decorative', serif",
      fill: color,
      align: "center",
      wordWrap: { width: 700 }
    }
  ).setOrigin(0.5);
  this.panel.add(texto);

  // === Botones confirmación/cancelar centrados ===
  const btnConfirm = this.add.text(-180, 290, "✅ Confirmar", {
    fontSize: "22px",
    fontFamily: "'Cinzel Decorative', serif",
    fill: "#0f0",
    backgroundColor: "#000",
    padding: { left: 16, right: 16, top: 8, bottom: 8 }
  }).setInteractive().setOrigin(0.5);
  this.panel.add(btnConfirm);

  const btnCancel = this.add.text(180, 290, "❌ Cancelar", {
    fontSize: "22px",
    fontFamily: "'Cinzel Decorative', serif",
    fill: "#f00",
    backgroundColor: "#000",
    padding: { left: 16, right: 16, top: 8, bottom: 8 }
  }).setInteractive().setOrigin(0.5);
  this.panel.add(btnCancel);

  // === Eventos de botones ===
  btnConfirm.on("pointerdown", () => {
    dragon1 = {
      ...dragon,
      numAlientosInicial: dragon.numAlientos,
      esPrincipal: true
    };

    dragon1.vidaMax = Math.round(dragon.vida * 1.3);
    dragon1.vida = dragon1.vidaMax;
    dragon1.mordisco = Math.round(dragon.mordisco * 1.3);
    dragon1.aliento = Math.round(dragon.aliento * 1.3);
    dragon1.armadura = Math.round(dragon.armadura * 1.3);
    dragon1.velocidad = Math.round(dragon.velocidad * 1.3);

    roleplay.asignarNivel(dragon1, 1);

    if (typeof asignarRareza === "function") {
      asignarRareza(dragon1, true);
    }

    this.mostrarPopupApodo(dragon1);
  });

  btnCancel.on("pointerdown", () => {
    this.panel.destroy();
    this.panel = null;
  });

  // === Animación de aparición ===
  this.tweens.add({
    targets: this.panel,
    scale: 1,
    alpha: 1,
    duration: 400,
    ease: "Back.Out"
  });
}



  // === Popup para poner apodo inicial ===
 // === Popup para poner apodo inicial ===
mostrarPopupApodo(dragon){
  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;

  // Fondo oscuro semitransparente
  let overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.7)
    .setDepth(200).setInteractive();

  // Caja centrada
  let caja = this.add.rectangle(W/2, H/2, 420, 200, 0x111111, 0.9)
    .setDepth(201).setStrokeStyle(2, 0xffffff);

  // Texto
  let texto = this.add.text(W/2, H/2 - 50, "Pon un apodo para tu dragón:", {
    fontSize: "20px",
    fontFamily: "'Cinzel Decorative', serif",

    fill: "#fff",
    align: "center"
  }).setOrigin(0.5).setDepth(202);

  // === Campo INPUT HTML ===
  let input = document.createElement("input");
  input.type = "text";
  input.maxLength = 20;
  input.style.position = "absolute";
  input.style.left = "50%";
  input.style.top = "50%";
  input.style.transform = "translate(-50%, -50%)";
  input.style.fontSize = "18px";
  fontFamily: "'Cinzel Decorative', serif",

  input.style.padding = "6px 10px";
  input.style.borderRadius = "6px";
  input.style.border = "2px solid #888";
  input.style.background = "#222";
  input.style.color = "#fff";
  input.style.textAlign = "center";
  input.style.zIndex = 9999;
  document.body.appendChild(input);
  input.focus();

  // Botones OK / Saltar
  let btnOk = this.add.text(W/2 - 60, H/2 + 50, "✅ OK", {
    fontSize: "18px",
    fontFamily: "'Cinzel Decorative', serif",

    fill: "#0f0",
    backgroundColor: "#333",
    padding: { left: 10, right: 10, top: 5, bottom: 5 }
  }).setOrigin(0.5).setInteractive().setDepth(202);

  let btnNo = this.add.text(W/2 + 60, H/2 + 50, "❌ Saltar", {
    fontSize: "18px",
    fontFamily: "'Cinzel Decorative', serif",

    fill: "#f55",
    backgroundColor: "#333",
    padding: { left: 10, right: 10, top: 5, bottom: 5 }
  }).setOrigin(0.5).setInteractive().setDepth(202);

  // Confirmar función
  let confirmar = ()=>{
    dragon.apodo = input.value.trim();
    document.body.removeChild(input);
    overlay.destroy(); caja.destroy(); texto.destroy(); btnOk.destroy(); btnNo.destroy();

    if(!window.dragonesJugador) window.dragonesJugador = [];
    if(window.dragonesJugador.length === 0){
      dragon.vida = dragon.vidaMax;
      dragon.activo = true;
      window.dragonesJugador.push(dragon);
    }

    // Ir al mundo
    this.scene.start("SceneWorld");
  };

  btnOk.on("pointerdown", confirmar);
  btnNo.on("pointerdown", confirmar);
}

}
