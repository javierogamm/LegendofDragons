/***** =========================
 * ESCENA COLECCIÓN DE DRAGONES (DRAGOCODEX)
 * ========================== */
class SceneDragocodex extends Phaser.Scene {
  constructor(){ super("SceneDragocodex"); }

  preload(){
    // Usamos tu array maestro
    if(!Array.isArray(window.todosDragones)){
      window.todosDragones = dragones; // 👈 aquí usamos el array global de dragones
    }

    // Cargar todas las minis con clave única
    window.todosDragones.forEach(d=>{
      if(d.mini){
        d.miniKey = d.name+"_mini"; // igual que en SceneColeccion
        this.load.image(d.miniKey, d.mini);
      }
    });
  }

  create(){
  // === Fondo adaptado a resolución ===
  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;

  // Fondo oscuro semi-transparente
  this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.85);

  // === Título centrado ===
  this.add.text(W/2, 80, "📖 Dragocodex de Dragones", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "38px",
    fill: "#ffd700",
    stroke: "#000",
    strokeThickness: 4
  }).setOrigin(0.5);

  // Si no hay dragones
  if(window.todosDragones.length === 0){
    this.add.text(W/2, H/2, "⚠️ No hay dragones en el Dragocodex", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"22px", fill:"#fff"
    }).setOrigin(0.5);
    return;
  }

  // === Contenedor con scroll vertical ===
  let container = this.add.container(0,0);

  // 🧩 Configuración de cuadrícula
  const startX = W/2 - 350;   // centro ajustado
  const startY = 160;
  const colWidth = 240;
  const rowHeight = 180;
  const cols = 4;

  let dragonesPorTier = {
    "TierB": window.todosDragones.filter(d=>d.tier==="B"),
    "TierA": window.todosDragones.filter(d=>d.tier==="A"),
    "TierS": window.todosDragones.filter(d=>d.tier==="S")
  };

  let row = 0;
  let col = 0;

  Object.keys(dragonesPorTier).forEach(tier=>{
    if(dragonesPorTier[tier].length === 0) return;

    // Subtítulo de Tier
    const titulo = this.add.text(W/2, startY + row*rowHeight - 50, tier, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"28px", fill:"#00ffff", stroke:"#000", strokeThickness:2
    }).setOrigin(0.5);
    container.add(titulo);

    dragonesPorTier[tier].forEach(d=>{
      const x = startX + col*colWidth;
      const y = startY + row*rowHeight;

      const miDragon = (window.dragonesJugador||[]).find(j=>j.name===d.name) 
                    || (window.coleccionJugador||[]).find(j=>j.name===d.name);

      if(miDragon){
        let colorRareza = "#aaa";
        if(miDragon.rareza==="Raro") colorRareza="#00bfff";
        if(miDragon.rareza==="Épico") colorRareza="#bf00ff";
        if(miDragon.rareza==="Legendario") colorRareza="#ffd700";

        container.add(this.add.rectangle(x,y,130,130,0x000000,0.6)
          .setStrokeStyle(3,Phaser.Display.Color.HexStringToColor(colorRareza).color));
        container.add(this.add.image(x,y-10,d.miniKey).setDisplaySize(110,110));
        container.add(this.add.text(x,y+75,d.name,{fontFamily: "'Cinzel Decorative', serif",
fontSize:"14px",fill:colorRareza}).setOrigin(0.5));
      } else {
        container.add(this.add.rectangle(x,y,130,130,0x000000,0.6).setStrokeStyle(2,0x555555));
        container.add(this.add.image(x,y-10,d.miniKey).setDisplaySize(110,110).setTint(0x000000).setAlpha(0.6));
        container.add(this.add.text(x,y+75,"???",{fontFamily: "'Cinzel Decorative', serif",
fontSize:"14px",fill:"#777"}).setOrigin(0.5));
      }

      col++;
      if(col >= cols){ col = 0; row++; }
    });

    col = 0;
    row++;
  });

 // === Scroll con máscara (idéntico a la tienda) ===

// 🧭 Caja visible del scroll
const maskTop = 140;         // justo debajo del título
const maskHeight = H - 260;  // deja espacio para el botón Volver
const maskWidth = W - 200;   // centrado visualmente

// 🟦 Dibujar el área visible (transparente, solo para la máscara)
const maskShape = this.add.rectangle(W / 2, maskTop + maskHeight / 2, maskWidth, maskHeight, 0x000000, 0)
  .setOrigin(0.5)
  .setDepth(100);

// ✂️ Crear y aplicar la máscara
const mask = maskShape.createGeometryMask();
container.setMask(mask);

// === Scroll con rueda ===
const maxScroll = Math.max(0, (row * rowHeight + 300) - maskHeight);
container.y = maskTop;

this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
  container.y -= deltaY * 0.5;
  const topLimit = maskTop;
  const bottomLimit = maskTop - maxScroll;
  if (container.y > topLimit) container.y = topLimit;
  if (container.y < bottomLimit) container.y = bottomLimit;
});

  // === Botón Volver centrado al final ===
  const btnVolver = this.add.text(W/2, H - 80, "⬅ Volver", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"24px",
    backgroundColor:"#333",
    color:"#fff",
    padding:{ left:20, right:20, top:10, bottom:10 }
  }).setOrigin(0.5).setInteractive().setDepth(1000);

  btnVolver.on("pointerdown",()=> this.scene.start(window.ultimaEscena || "SceneCiudad"));
  btnVolver.on("pointerover",()=>btnVolver.setStyle({backgroundColor:"#555",color:"#ffd700"}));
  btnVolver.on("pointerout",()=>btnVolver.setStyle({backgroundColor:"#333",color:"#fff"}));
}

}
