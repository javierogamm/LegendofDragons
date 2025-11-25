/***** =========================
 * ESCENA CIUDAD (con accesos extra a Colección, Portal y Dragocodex)
 * ========================== */
class SceneCiudad extends Phaser.Scene {
  constructor(){ super("SceneCiudad"); }

  preload(){
    // === ICONOS COMUNES (siempre cargados) ===
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
    this.load.image("mapaICON", "assets/iconos/mapaicono.png");
    this.load.image("coleccionICON", "assets/iconos/cuevadragones.png");
    this.load.image("portalICON", "assets/iconos/portal.png");
    this.load.image("dragocodexICON", "assets/iconos/dragocodex.png");
    this.load.image("botonMas", "assets/inventario/iconocruz.png");
    this.load.image("iconomenos", "assets/inventario/iconomenos.png");
    this.load.image("iconoMoneda", "assets/inventario/monedas.png");
     // Repelente
    this.load.image("repelente","assets/inventario/repelenteMED.png");

    //Huevos
    this.load.image("nidodragones", "assets/ciudades/nidodragones.png");
     this.load.image("criadero", "assets/ciudades/criadero.png");
     this.load.image("huevoroca","assets/inventario/huevorocaMED.png");
      this.load.image("huevoagua","assets/inventario/huevoaguaMED.png");
       this.load.image("huevofuego","assets/inventario/huevofuegoMED.png");
        this.load.image("huevotrueno","assets/inventario/huevotruenoMED.png");
         this.load.image("huevomisterio","assets/inventario/huevomisterioMED.png");
         this.load.image("huevostriker","assets/inventario/huevostrikerMED.png");
          //Huevos BIG
     this.load.image("huevorocaBIG","assets/inventario/huevorocaBIG.png");
      this.load.image("huevoaguaBIG","assets/inventario/huevoaguaBIG.png");
       this.load.image("huevofuegoBIG","assets/inventario/huevofuegoBIG.png");
        this.load.image("huevotruenoBIG","assets/inventario/huevotruenoBIG.png");
         this.load.image("huevomisterioBIG","assets/inventario/huevomisterioBIG.png");
         this.load.image("huevostrikerBIG","assets/inventario/huevostrikerBIG.png");
    
    // tablones de misiones
    this.load.image("luminariaMISIONES", "assets/ciudades/luminariamisiones.png");
    this.load.image("silvanostMISIONES", "assets/ciudades/silvanostmisiones.png");
    this.load.image("frostgaardMISIONES", "assets/ciudades/frostgaardmisiones.png");
    this.load.image("harruniMISIONES", "assets/ciudades/harrunimisiones.png");

    // en preload de SceneCiudad
this.load.image("misionesPasivasICON", "assets/ciudades/silvanostmisiones.png");

    
    // Teleports específicos
    this.load.image("teleportharruni", "assets/inventario/teleportharruniMED.png");
    this.load.image("teleportluminaria", "assets/inventario/teleportluminariaMED.png");
    this.load.image("teleportsilvanost", "assets/inventario/teleportsilvanostMED.png");
    this.load.image("teleportdrakengaard", "assets/inventario/teleportdrakengaardMED.png");
    // === IMÁGENES DE CIUDADES ===
    if(window.ciudadSeleccionada === "luminaria"){
      this.load.image("luminariaCITY", "assets/ciudades/luminariaCITY.png");
      this.load.image("luminariaSHOPicon", "assets/ciudades/luminariaSHOPicon.png");
       this.load.image("altarrunicolegendario", "assets/ciudades/altarrunicolegendario.png");
      this.load.image("luminariaSHOP", "assets/ciudades/luminariaSHOP.png");
      this.load.image("luminariaVOLVER", "assets/ciudades/luminaria.png");
    }

    if(window.ciudadSeleccionada === "silvanost"){
      this.load.image("silvanostCITY", "assets/ciudades/silvanostCITY.png");
      this.load.image("silvanostSHOPicon", "assets/ciudades/silvanostSHOPicon.png");
      this.load.image("silvanostSHOP", "assets/ciudades/silvanostSHOP.png");
      this.load.image("silvanostVOLVER", "assets/ciudades/silvanost.png");
    }

    if(window.ciudadSeleccionada === "harruni"){
      this.load.image("harruniCITY", "assets/ciudades/harruniCITY.png");
      this.load.image("harruniSHOPicon", "assets/ciudades/harruniSHOPicon.png");
      this.load.image("harruniSHOP", "assets/ciudades/harruniSHOP.png");
      this.load.image("altarrunicoraro", "assets/ciudades/altarrunicoraro.png");
      this.load.image("harruniVOLVER", "assets/ciudades/harruni.png");
    }

    if(window.ciudadSeleccionada === "frostgaard"){
      this.load.image("frostgaardCITY", "assets/ciudades/frostgaardCITY.png");
      this.load.image("frostgaardSHOPicon", "assets/ciudades/frostgaardSHOPicon.png");
       this.load.image("altarrunicoepico", "assets/ciudades/altarrunicoepico.png");
      this.load.image("frostgaardSHOP", "assets/ciudades/frostgaardSHOP.png");
      this.load.image("frostgaardVOLVER", "assets/ciudades/frostgaard.png");
    }
  
 

    this.load.image("mapaICON", "assets/iconos/mapaicono.png");

    // === 🐣 Cargar imágenes baby si existen ===
if (window.dragones && Array.isArray(window.dragones)) {
  window.dragones.forEach(d => {
    if (!d.name) return;
    const babyKey = d.name + "_Baby";
    const rutaBaby = "assets/baby/" + d.name + "_Baby.png";
    if (!this.textures.exists(babyKey)) {
      try {
        this.load.image(babyKey, rutaBaby);
      } catch (e) {
        console.warn("⚠️ No se pudo cargar baby de", d.name, "→", rutaBaby);
      }
    }
  });
}
  }

  create(){
    if (!Array.isArray(window.inventarioJugador)) {
      window.inventarioJugador = [];
    }

   this.monedasItem = window.inventarioJugador.find(obj => obj.key === "Monedas");
if (!this.monedasItem) {
  this.monedasItem = { nombre:"Monedas", cantidad:0, key:"Monedas" };
  window.inventarioJugador.push(this.monedasItem);
}
// Normalizar inventario: asegurar que todos tienen key
window.inventarioJugador.forEach(obj => {
  // Buscar el item en la lista de tienda para sacar la key
  const itemCatalogo = this.catalogoItems().find(it => it.nombre === obj.nombre);
  if(itemCatalogo && !obj.key) obj.key = itemCatalogo.key;
});

   
    let ciudad = window.ciudadSeleccionada || "luminaria";
if (window.storyMode) window.storyMode.trigger("enterCity");


   const { width, height } = this.sys.game.config;
const centroX = width / 2;
const centroY = height / 2;

// === Fondo y título según la ciudad ===
if (ciudad === "luminaria") {
  this.add.image(centroX, centroY, "luminariaCITY")
    .setDisplaySize(width, height);
  this.add.text(centroX, 100, "Ciudad de Luminaria", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "36px",
    fontFamily: "'Cinzel Decorative', serif",
    fill: "#ffd700",
    fontStyle: "bold",
    stroke: "#000",
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(10);
  this.mostrarIconosCiudad("luminaria");

} else if (ciudad === "silvanost") {
  this.add.image(centroX, centroY, "silvanostCITY")
    .setDisplaySize(width, height);
  this.add.text(centroX, 100, "Ciudad de Silvanost", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "36px",
     fontFamily: "'Cinzel Decorative', serif",
    fill: "#90ee90",
    fontStyle: "bold",
    stroke: "#000",
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(10);
  this.mostrarIconosCiudad("silvanost");

} else if (ciudad === "harruni") {
  this.add.image(centroX, centroY, "harruniCITY")
    .setDisplaySize(width, height);
  this.add.text(centroX, 100, "Ciudad de Harruni", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "36px",
     fontFamily: "'Cinzel Decorative', serif",
    fill: "#ff8800",
    fontStyle: "bold",
    stroke: "#000",
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(10);
  this.mostrarIconosCiudad("harruni");

} else if (ciudad === "frostgaard") {
  this.add.image(centroX, centroY, "frostgaardCITY")
    .setDisplaySize(width, height);
  this.add.text(centroX, 100, "Ciudad de Frostgaard", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "36px",
     fontFamily: "'Cinzel Decorative', serif",
    fill: "#00bfff",
    fontStyle: "bold",
    stroke: "#000",
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(10);
  this.mostrarIconosCiudad("frostgaard");

} else {
  this.scene.start("SceneWorld");
}
  }
catalogoItems(){
  return [
    { nombre:"Materiales de curación", key:"Curacion", precio:100 },
    { nombre:"Poción Roja", key:"pocionroja", precio:250 },
    { nombre:"Poción Azul", key:"pocionazul", precio:250 },
    { nombre:"Cebo para dragones", key:"cebo", precio:100 },
    { nombre:"Cebo para dragones épicos", key:"ceboepico", precio:500 },
    { nombre:"Cebo para dragones legendarios", key:"cebolegend", precio:2000 },
    { nombre:"Tomo de técnicas de entrenamiento de dragones", key:"Tomo", precio:300 },
    { nombre:"Runa rara", key:"runarara", precio:500 },
    { nombre:"Runa épica", key:"runaepica", precio:5000 },
    { nombre:"Runa legendaria", key:"runalegendaria", precio:10000 },
    { nombre:"Repelente de dragones", key:"repelente", precio:150 },
    { nombre:"Pergamino a Harruni", key:"teleportharruni", precio:200 },
    { nombre:"Pergamino a Luminaria", key:"teleportluminaria", precio:200 },
    { nombre:"Pergamino a Silvanost", key:"teleportsilvanost", precio:200 },
    { nombre:"Pergamino a Drakengaard", key:"teleportdrakengaard", precio:200 }
    
  ];
}

  /***** === POPUP CURACIÓN === *****/
  mostrarPopupCuracion(nombres){
    let popup = this.add.container(0,0).setDepth(200);

    let fondo = this.add.rectangle(500,300,600,200,0x000000,0.8).setStrokeStyle(2,0xffffff);
    popup.add(fondo);

    let texto = this.add.text(500,260,"🏥 Tus dragones activos han sido curados",{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"22px", fill:"#0f0"
    }).setOrigin(0.5);
    popup.add(texto);

    let lista = this.add.text(500,310,nombres.join(", "),{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#fff"
    }).setOrigin(0.5);
    popup.add(lista);

    let btnOk = this.add.text(500,360,"Aceptar",{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", backgroundColor:"#333", color:"#fff", padding:{left:20,right:20,top:10,bottom:10}
    }).setOrigin(0.5).setInteractive();
    popup.add(btnOk);

    btnOk.on("pointerdown",()=> popup.destroy());
    btnOk.on("pointerover",()=> btnOk.setStyle({backgroundColor:"#555", color:"#0f0"}));
    btnOk.on("pointerout",()=> btnOk.setStyle({backgroundColor:"#333", color:"#fff"}));
  }

/***** === ICONOS DE CADA CIUDAD (centrados y más grandes) === *****/
mostrarIconosCiudad(ciudad) {
  const centroX = this.sys.game.config.width / 2;
  const yIcons = 500;   // altura base
  const spacing = 180;  // separación entre iconos (ajustado)
  const escalaIcono = 1.4; // tamaño global aumentado

  // 🌍 MAPA
  let btnMapa = this.add.image(centroX - spacing * 2, yIcons, "mapaICON")
    .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
    .setInteractive().setDepth(20);
  this.add.text(centroX - spacing * 2, yIcons + 100, "Mundo", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#fff", backgroundColor: "#000000aa"
  }).setOrigin(0.5).setDepth(21);
  btnMapa.on("pointerdown", () => { this.scene.start("SceneWorld"); });

  // 🏪 TIENDA
  let shopIcon = this.add.image(centroX - spacing, yIcons, ciudad + "SHOPicon")
    .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
    .setInteractive().setDepth(20);
  this.add.text(centroX - spacing, yIcons + 100, "Tienda", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#fff", backgroundColor: "#000000aa"
  }).setOrigin(0.5).setDepth(21);
  shopIcon.on("pointerdown", () => { this.mostrarTienda(ciudad); });

  // 📜 COLECCIÓN
  let coleccionIcon = this.add.image(centroX, yIcons, "coleccionICON")
    .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
    .setInteractive().setDepth(20);
  this.add.text(centroX, yIcons + 100, "Colección", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#fff", backgroundColor: "#000000aa"
  }).setOrigin(0.5).setDepth(21);
  coleccionIcon.on("pointerdown", () => {
    window.ultimaEscena = "SceneCiudad";
    this.scene.start("SceneColeccionPoblado");
  });

  // 🔮 PORTAL
  let portalIcon = this.add.image(centroX + spacing, yIcons, "portalICON")
    .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
    .setInteractive().setDepth(20);
  this.add.text(centroX + spacing, yIcons + 100, "Invocar", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#fff", backgroundColor: "#000000aa"
  }).setOrigin(0.5).setDepth(21);
  portalIcon.on("pointerdown", () => { this.importarDragon(); });

  // 📚 DRAGOCODEX
  let dragocodexIcon = this.add.image(centroX + spacing * 2, yIcons, "dragocodexICON")
    .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
    .setInteractive().setDepth(20);
  this.add.text(centroX + spacing * 2, yIcons + 100, "Dragocodex", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#fff", backgroundColor: "#000000aa"
  }).setOrigin(0.5).setDepth(21);
  dragocodexIcon.on("pointerdown", () => {
    window.ultimaEscena = "SceneCiudad";
    this.scene.start("SceneDragocodex");
  });

  // 🪺 NIDO + 🍼 CRIADERO (solo Silvanost)
 if (ciudad === "silvanost") {
  // 🪺 Nido
  let nidoIcon = this.add.image(centroX + spacing * 3, yIcons, "nidodragones")
    .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
    .setInteractive().setDepth(20);
  this.add.text(centroX + spacing * 3, yIcons + 100, "Nido", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
    fill: "#fff",
    backgroundColor: "#000000aa"
  }).setOrigin(0.5).setDepth(21);
  nidoIcon.on("pointerdown", () => {
    window.ultimaEscena = "SceneCiudad";
    this.mostrarNidoDragones();
  });

  // 🍼 Criadero — centrado sobre Colección / Invocar
  let criaderoIcon = this.add.image(centroX + spacing * 0.5, yIcons - 170, "criadero")
    .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
    .setInteractive().setDepth(25); // un poco más arriba en capa

  this.add.text(centroX + spacing * 0.5, yIcons - 70, "Criadero", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
    fill: "#fff",
    backgroundColor: "#000000aa"
  }).setOrigin(0.5).setDepth(26);

  criaderoIcon.on("pointerdown", () => {
    window.ultimaEscena = "SceneCiudad";
    this.scene.start("SceneCriadero");
  });
}


  // === TABLÓN DE MISIONES ===
  if (["harruni", "luminaria", "silvanost", "frostgaard"].includes(ciudad)) {
    const iconoTablon = {
      harruni: "harruniMISIONES",
      luminaria: "luminariaMISIONES",
      silvanost: "silvanostMISIONES",
      frostgaard: "frostgaardMISIONES"
    }[ciudad];

    const xPos = centroX - spacing * 2.8;
    const yPos = yIcons - 180;

    let tablonIcon = this.add.image(xPos, yPos, iconoTablon)
      .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
      .setInteractive().setDepth(20);

    this.add.text(xPos, yPos + 100, "Misiones", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
      fill: "#fff",
      backgroundColor: "#000000aa"
    }).setOrigin(0.5).setDepth(21);

    tablonIcon.on("pointerdown", () => {
      window.ultimaEscena = "SceneCiudad";
      this.scene.start("SceneTablonMisiones", { ciudad });
    });
  }

  // === ALTARES SEGÚN CIUDAD ===
  if (ciudad === "harruni") {
    let altarIcon = this.add.image(centroX, yIcons - 180, "altarrunicoraro")
      .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
      .setInteractive().setDepth(20);
    this.add.text(centroX, yIcons - 80, "Altar rúnico", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#fff", backgroundColor: "#000000aa"
    }).setOrigin(0.5).setDepth(21);
    altarIcon.on("pointerdown", () => { this.mostrarAltarRunicoRaro(); });

     let pasivas = this.add.image(centroX - spacing * 3.8, yIcons, "misionesPasivasICON")
  .setDisplaySize(120*1.4, 120*1.4)
  .setInteractive().setDepth(20);
this.add.text(centroX - spacing * 3.8, yIcons + 100, "Pasivas", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#fff", backgroundColor:"#000000aa"
}).setOrigin(0.5).setDepth(21);
pasivas.on("pointerdown", ()=> this.scene.start("SceneMisionesPasivas"));
  }

  if (ciudad === "frostgaard") {
    let altarIcon = this.add.image(centroX, yIcons - 180, "altarrunicoepico")
      .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
      .setInteractive().setDepth(20);
    this.add.text(centroX, yIcons - 80, "Altar épico", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#fff", backgroundColor: "#000000aa"
    }).setOrigin(0.5).setDepth(21);
    altarIcon.on("pointerdown", () => { this.mostrarAltarRunicoEpico(); });
   
    let pasivas = this.add.image(centroX - spacing * 3.8, yIcons, "misionesPasivasICON")
  .setDisplaySize(120*1.4, 120*1.4)
  .setInteractive().setDepth(20);
this.add.text(centroX - spacing * 3.8, yIcons + 100, "Pasivas", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#fff", backgroundColor:"#000000aa"
}).setOrigin(0.5).setDepth(21);
pasivas.on("pointerdown", ()=> this.scene.start("SceneMisionesPasivas"));




  }

  if (ciudad === "luminaria") {
    let altarIcon = this.add.image(centroX, yIcons - 180, "altarrunicolegendario")
      .setDisplaySize(120 * escalaIcono, 120 * escalaIcono)
      .setInteractive().setDepth(20);
    this.add.text(centroX, yIcons - 80, "Altar legendario", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#fff", backgroundColor: "#000000aa"
    }).setOrigin(0.5).setDepth(21);
    altarIcon.on("pointerdown", () => { this.mostrarAltarRunicoLegendario(); });

     let pasivas = this.add.image(centroX - spacing * 3.8, yIcons, "misionesPasivasICON")
  .setDisplaySize(120*1.4, 120*1.4)
  .setInteractive().setDepth(20);
this.add.text(centroX - spacing * 3.8, yIcons + 100, "Pasivas", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#fff", backgroundColor:"#000000aa"
}).setOrigin(0.5).setDepth(21);
pasivas.on("pointerdown", ()=> this.scene.start("SceneMisionesPasivas"));
  }
}


mostrarError(msg){
  let msgError = this.add.text(500,500,msg,{
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px", fill:"#f00", backgroundColor:"#000000aa"
  }).setOrigin(0.5).setDepth(200);
  this.tweens.add({
    targets: msgError,
    alpha: 0,
    duration: 1500,
    onComplete: ()=> msgError.destroy()
  });
}
 /***** === TIENDA POPUP CON SCROLL === *****/
mostrarTienda(ciudad = "luminaria") {
  const tiendaGroup = this.add.container(0, 0).setDepth(100);

  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;
  const centroX = W / 2;
  const centroY = H / 2 - 60;

  const overlay = this.add.rectangle(centroX, centroY, W, H, 0x000000, 0.65)
    .setDepth(100)
    .setInteractive();
  tiendaGroup.add(overlay);

  const caja = this.add.rectangle(centroX, centroY, 900, 600, 0x222222, 1)
    .setStrokeStyle(2, 0xffffff)
    .setDepth(101);
  tiendaGroup.add(caja);

  const btnVolver = this.add.image(centroX + 500, centroY - 230, ciudad + "VOLVER")
    .setDisplaySize(90, 90)
    .setInteractive()
    .setDepth(102);
  tiendaGroup.add(btnVolver);
  btnVolver.on("pointerdown", () => {
    tiendaGroup.destroy();
    if (this.iconMonedaHUD) this.iconMonedaHUD.destroy();
    if (this.txtMonedasHUD) this.txtMonedasHUD.destroy();
  });

  // HUD de monedas
  this.iconMonedaHUD = this.add.image(centroX - 420, centroY - 250, "iconoMoneda")
    .setScale(1.3)
    .setScrollFactor(0)
    .setDepth(103);
  this.txtMonedasHUD = this.add.text(centroX - 380, centroY - 260, this.monedasItem.cantidad, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "22px",
    fill: "#ffd700",
    stroke: "#000",
    strokeThickness: 3
  }).setScrollFactor(0).setDepth(103);

  const tituloTxt = {
    silvanost: "🌿 Tienda de Silvanost",
    harruni: "🔥 Tienda de Harruni",
    frostgaard: "❄️ Tienda de Frostgaard",
    luminaria: "🛒 Tienda de Luminaria"
  }[ciudad] || "🛒 Tienda";

  const titulo = this.add.text(centroX, centroY - 250, tituloTxt, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "28px",
    fill: "#fff",
    fontStyle: "bold"
  }).setOrigin(0.5).setDepth(102);
  tiendaGroup.add(titulo);

  const items = this.catalogoItems();
  const itemsContainer = this.add.container(0, 0).setDepth(103);
  tiendaGroup.add(itemsContainer);

  const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  maskGraphics.fillStyle(0xffffff);
  maskGraphics.beginPath();
  maskGraphics.fillRect(centroX - 450, centroY - 210, 900, 440);
  maskGraphics.closePath();
  const mask = maskGraphics.createGeometryMask();
  itemsContainer.setMask(mask);

  const txtCantidadRefs = [];
  const startY = centroY - 180;

  items.forEach((item, i) => {
    const y = startY + i * 90;
    const bordeDerecho = centroX + 300;

    const marco = this.add.rectangle(centroX, y, 780, 70, 0x000000, 0.6)
      .setStrokeStyle(1, 0xffffff);
    itemsContainer.add(marco);

    const icon = this.add.image(centroX - 330, y, item.key).setScale(0.5);
    itemsContainer.add(icon);

    const txtNombre = this.add.text(centroX - 280, y - 10, item.nombre, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "16px",
      fill: "#fff"
    }).setOrigin(0, 0);
    itemsContainer.add(txtNombre);

    const precioTxt = this.add.text(bordeDerecho - 200, y - 10, item.precio, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "16px",
      fill: "#ffd700"
    }).setOrigin(1, 0);
    itemsContainer.add(precioTxt);

    const precioIcono = this.add.image(bordeDerecho - 170, y, "iconoMoneda").setScale(0.9);
    itemsContainer.add(precioIcono);

    // === BOTÓN COMPRAR (usa iconocruz.png)
    const btnMas = this.add.image(bordeDerecho - 110, y, "botonMas")
      .setDisplaySize(34, 34)
      .setInteractive();
    itemsContainer.add(btnMas);

    // === BOTÓN VENDER (usa iconomenos.png) ===
    const btnMenos = this.add.image(bordeDerecho - 60, y, "iconomenos")
      .setDisplaySize(34, 34)
      .setInteractive();
    itemsContainer.add(btnMenos);

    const existente = window.inventarioJugador.find(obj => obj.key === item.key);
    const txtCantidad = this.add.text(bordeDerecho - 10, y - 10, "x" + (existente?.cantidad || 0), {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "16px",
      fill: "#0f0"
    }).setOrigin(1, 0);
    itemsContainer.add(txtCantidad);
    txtCantidadRefs.push(txtCantidad);

    // === LÓGICA DE BOTONES ===

    // Comprar
    btnMas.on("pointerdown", () => {
      if (this.monedasItem.cantidad >= item.precio) {
        this.monedasItem.cantidad -= item.precio;
        let existente = window.inventarioJugador.find(obj => obj.key === item.key);
        if (existente) existente.cantidad++;
        else window.inventarioJugador.push({ nombre: item.nombre, cantidad: 1, key: item.key });
        this.txtMonedasHUD.setText(this.monedasItem.cantidad);
        txtCantidad.setText("x" + (existente?.cantidad || 1));
      } else {
        this.mostrarError("No tienes suficientes monedas!");
      }
    });

    // Vender
    btnMenos.on("pointerdown", () => {
      let existente = window.inventarioJugador.find(obj => obj.key === item.key);
      if (existente && existente.cantidad > 0) {
        existente.cantidad--;
        const devolucion = Math.floor(item.precio * 0.6);
        this.monedasItem.cantidad += devolucion;
        this.txtMonedasHUD.setText(this.monedasItem.cantidad);
        txtCantidad.setText("x" + existente.cantidad);
        if (existente.cantidad <= 0) {
          window.inventarioJugador.splice(window.inventarioJugador.indexOf(existente), 1);
        }
      } else {
        this.mostrarError("No tienes este objeto para vender!");
      }
    });
  });

  const maxScroll = Math.max(0, (items.length * 90 + 100) - 400);
  itemsContainer.y = 0;
  this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
    itemsContainer.y -= deltaY * 0.5;
    if (itemsContainer.y > 0) itemsContainer.y = 0;
    if (itemsContainer.y < -maxScroll) itemsContainer.y = -maxScroll;
  });
}



/***** === ALTAR RÚNICO RARO (mejorar rareza) === *****/
mostrarAltarRunicoRaro(){
  let altarGroup = this.add.container(0,0).setDepth(150).setVisible(true);

  let caja = this.add.rectangle(500,300,800,500,0x111111,0.9)
    .setStrokeStyle(2,0x00ccff).setDepth(151); // azul celeste
  altarGroup.add(caja);

  let btnVolver = this.add.text(850,100,"❌ Cerrar",{
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#fff", backgroundColor:"#900",
    padding:{left:10,right:10,top:5,bottom:5}
  }).setInteractive().setDepth(152);
  altarGroup.add(btnVolver);
  btnVolver.on("pointerdown",()=> altarGroup.destroy());

  let runaItem = window.inventarioJugador.find(obj => obj.key === "runarara");
  if(!runaItem){
    runaItem = { nombre:"Runa rara", cantidad:0, key:"runarara" };
    window.inventarioJugador.push(runaItem);
  }

  let iconRuna = this.add.image(200,70,"runarara").setScale(1.2).setDepth(152);
  let txtRuna  = this.add.text(240,60,"x"+runaItem.cantidad,{
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#00ccff", stroke:"#000", strokeThickness:3
  }).setDepth(152);

  // 🔹 Filtrar dragones comunes
  let comunes = (window.dragonesJugador||[]).filter(d=>d.rareza==="Común");

  if(comunes.length === 0){
    let aviso = this.add.text(500,300,"No tienes dragones Comunes para mejorar",{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#fff"
    }).setOrigin(0.5).setDepth(152);
    altarGroup.add(aviso);
    return;
  }

  let startY = 160;
  comunes.forEach((dragon,i)=>{
    let y = startY + i*100;
    let marco = this.add.rectangle(500,y,700,80,0x000000,0.6)
      .setStrokeStyle(1,0x00ccff);
    altarGroup.add(marco);

    let miniKey = dragon.name+"_mini";
    if(this.textures.exists(miniKey)){
      let mini = this.add.image(180,y,miniKey).setScale(0.5);
      altarGroup.add(mini);
    }

    let txt = this.add.text(230,y-15,
      `${dragon.apodo||dragon.name} [${dragon.rareza}]`,{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px", fill: rarezas[dragon.rareza].color
    }).setOrigin(0,0);
    altarGroup.add(txt);

    let btnMejorar = this.add.text(750,y,"Mejorar",{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px", fill:"#fff", backgroundColor:"#0077aa",
      padding:{left:10,right:10,top:5,bottom:5}
    }).setOrigin(0.5).setInteractive();
    altarGroup.add(btnMejorar);

    btnMejorar.on("pointerdown",()=>{
      if(runaItem.cantidad >= 1){
        runaItem.cantidad--;
        dragon.rareza = "Raro";
        let boost = rarezas["Raro"].boost;
        dragon.vidaMax   = Math.ceil(dragon.vidaMax   * (1 + boost));
        dragon.vida      = dragon.vidaMax;
        dragon.mordisco  = Math.ceil(dragon.mordisco  * (1 + boost));
        dragon.aliento   = Math.ceil(dragon.aliento  * (1 + boost));
        dragon.armadura  = Math.ceil(dragon.armadura  * (1 + boost));
        dragon.velocidad = Math.ceil(dragon.velocidad * (1 + boost));

        txtRuna.setText("x"+runaItem.cantidad);
        this.mostrarError(`✅ ${dragon.apodo||dragon.name} ha ascendido a Raro!`);

        txt.setText(`${dragon.apodo||dragon.name} [${dragon.rareza}]`);
        txt.setStyle({fill: rarezas["Raro"].color});
        // 🧭 STORYMODE: Misión 9 — Usa una runa rara para mejorar un dragón
        if (window.storyMode) {
          window.storyMode.trigger("useRareRune");
        }
      } else {
        this.mostrarError("❌ No tienes runas raras suficientes");
      }
    });
  });
}
/***** === ALTAR RÚNICO ÉPICO (mejorar rareza) === *****/
mostrarAltarRunicoEpico(){
  let altarGroup = this.add.container(0,0).setDepth(150).setVisible(true);

  let caja = this.add.rectangle(500,300,800,500,0x111111,0.9)
    .setStrokeStyle(2,0x800080).setDepth(151); // morado
  altarGroup.add(caja);

  let btnVolver = this.add.text(850,100,"❌ Cerrar",{
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#fff", backgroundColor:"#900",
    padding:{left:10,right:10,top:5,bottom:5}
  }).setInteractive().setDepth(152);
  altarGroup.add(btnVolver);
  btnVolver.on("pointerdown",()=> altarGroup.destroy());

  let runaItem = window.inventarioJugador.find(obj => obj.key === "runaepica");
  if(!runaItem){
    runaItem = { nombre:"Runa épica", cantidad:0, key:"runaepica" };
    window.inventarioJugador.push(runaItem);
  }

  let iconRuna = this.add.image(200,70,"runaepica").setScale(1.2).setDepth(152);
  let txtRuna  = this.add.text(240,60,"x"+runaItem.cantidad,{
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#800080", stroke:"#000", strokeThickness:3
  }).setDepth(152);

  let raros = (window.dragonesJugador||[]).filter(d=>d.rareza==="Raro");

  if(raros.length === 0){
    let aviso = this.add.text(500,300,"No tienes dragones Raros para mejorar",{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#fff"
    }).setOrigin(0.5).setDepth(152);
    altarGroup.add(aviso);
    return;
  }

  let startY = 160;
  raros.forEach((dragon,i)=>{
    let y = startY + i*100;
    let marco = this.add.rectangle(500,y,700,80,0x000000,0.6)
      .setStrokeStyle(1,0x800080);
    altarGroup.add(marco);

    let miniKey = dragon.name+"_mini";
    if(this.textures.exists(miniKey)){
      let mini = this.add.image(180,y,miniKey).setScale(0.5);
      altarGroup.add(mini);
    }

    let txt = this.add.text(230,y-15,
      `${dragon.apodo||dragon.name} [${dragon.rareza}]`,{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px", fill: rarezas[dragon.rareza].color
    }).setOrigin(0,0);
    altarGroup.add(txt);

    let btnMejorar = this.add.text(750,y,"Mejorar",{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px", fill:"#fff", backgroundColor:"#551177",
      padding:{left:10,right:10,top:5,bottom:5}
    }).setOrigin(0.5).setInteractive();
    altarGroup.add(btnMejorar);

    btnMejorar.on("pointerdown",()=>{
      if(runaItem.cantidad >= 1){
        runaItem.cantidad--;
        dragon.rareza = "Épico";
        let boost = rarezas["Épico"].boost;
        dragon.vidaMax   = Math.ceil(dragon.vidaMax   * (1 + boost));
        dragon.vida      = dragon.vidaMax;
        dragon.mordisco  = Math.ceil(dragon.mordisco  * (1 + boost));
        dragon.aliento   = Math.ceil(dragon.aliento   * (1 + boost));
        dragon.armadura  = Math.ceil(dragon.armadura  * (1 + boost));
        dragon.velocidad = Math.ceil(dragon.velocidad * (1 + boost));

        txtRuna.setText("x"+runaItem.cantidad);
        this.mostrarError(`✅ ${dragon.apodo||dragon.name} ha ascendido a Épico!`);

        txt.setText(`${dragon.apodo||dragon.name} [${dragon.rareza}]`);
        txt.setStyle({fill: rarezas["Épico"].color});

        // 🧭 STORYMODE: Misión 10 — Usa una runa épica para mejorar un dragón
        if (window.storyMode) {
          window.storyMode.trigger("useEpicRune");
        }
      } else {
        this.mostrarError("❌ No tienes runas épicas suficientes");
      }
    });
  });
}

/***** === ALTAR RÚNICO LEGENDARIO (mejorar rareza) === *****/
mostrarAltarRunicoLegendario(){
  let altarGroup = this.add.container(0,0).setDepth(150).setVisible(true);

  let caja = this.add.rectangle(500,300,800,500,0x111111,0.9)
    .setStrokeStyle(2,0xffd700).setDepth(151); // dorado
  altarGroup.add(caja);

  let btnVolver = this.add.text(850,100,"❌ Cerrar",{
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#fff", backgroundColor:"#900",
    padding:{left:10,right:10,top:5,bottom:5}
  }).setInteractive().setDepth(152);
  altarGroup.add(btnVolver);
  btnVolver.on("pointerdown",()=> altarGroup.destroy());

  let runaItem = window.inventarioJugador.find(obj => obj.key === "runalegendaria");
  if(!runaItem){
    runaItem = { nombre:"Runa legendaria", cantidad:0, key:"runalegendaria" };
    window.inventarioJugador.push(runaItem);
  }

  let iconRuna = this.add.image(200,70,"runalegendaria").setScale(1.2).setDepth(152);
  let txtRuna  = this.add.text(240,60,"x"+runaItem.cantidad,{
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#ffd700", stroke:"#000", strokeThickness:3
  }).setDepth(152);

  let epicos = (window.dragonesJugador||[]).filter(d=>d.rareza==="Épico");

  if(epicos.length === 0){
    let aviso = this.add.text(500,300,"No tienes dragones Épicos para mejorar",{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#fff"
    }).setOrigin(0.5).setDepth(152);
    altarGroup.add(aviso);
    return;
  }

  let startY = 160;
  epicos.forEach((dragon,i)=>{
    let y = startY + i*100;
    let marco = this.add.rectangle(500,y,700,80,0x000000,0.6)
      .setStrokeStyle(1,0xffd700);
    altarGroup.add(marco);

    let miniKey = dragon.name+"_mini";
    if(this.textures.exists(miniKey)){
      let mini = this.add.image(180,y,miniKey).setScale(0.5);
      altarGroup.add(mini);
    }

    let txt = this.add.text(230,y-15,
      `${dragon.apodo||dragon.name} [${dragon.rareza}]`,{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px", fill: rarezas[dragon.rareza].color
    }).setOrigin(0,0);
    altarGroup.add(txt);

    let btnMejorar = this.add.text(750,y,"Mejorar",{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px", fill:"#fff", backgroundColor:"#aa8800",
      padding:{left:10,right:10,top:5,bottom:5}
    }).setOrigin(0.5).setInteractive();
    altarGroup.add(btnMejorar);

    btnMejorar.on("pointerdown",()=>{
      if(runaItem.cantidad >= 1){
        runaItem.cantidad--;
        dragon.rareza = "Legendario";
        let boost = rarezas["Legendario"].boost;
        dragon.vidaMax   = Math.ceil(dragon.vidaMax   * (1 + boost));
        dragon.vida      = dragon.vidaMax;
        dragon.mordisco  = Math.ceil(dragon.mordisco  * (1 + boost));
        dragon.aliento   = Math.ceil(dragon.aliento  * (1 + boost));
        dragon.armadura  = Math.ceil(dragon.armadura  * (1 + boost));
        dragon.velocidad = Math.ceil(dragon.velocidad * (1 + boost));

        txtRuna.setText("x"+runaItem.cantidad);
        this.mostrarError(`✅ ${dragon.apodo||dragon.name} ha ascendido a Legendario!`);

        txt.setText(`${dragon.apodo||dragon.name} [${dragon.rareza}]`);
        txt.setStyle({fill: rarezas["Legendario"].color});
      } else {
        this.mostrarError("❌ No tienes runas legendarias suficientes");
      }
    });
  });
}



  /***** === PORTAL: Importar Dragón === *****/
  importarDragon(){
    let input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";

    input.onchange = (e)=>{
      let file = e.target.files[0];
      if(!file) return;

      let reader = new FileReader();
      reader.onload = (event)=>{
        try {
          let data = JSON.parse(event.target.result);
          if(!data.name || !data.vidaMax || !data.mordisco){
            alert("❌ Archivo no válido como dragón");
            return;
          }
          if(!window.dragonesJugador) window.dragonesJugador = [];

          data.vida = data.vida || data.vidaMax;
          data.exp = data.exp || 0;
          data.nivel = data.nivel || 1;
          data.activo = false;

          window.dragonesJugador.push(data);
          alert(`✅ Dragón importado: ${data.apodo || data.name}`);
        } catch(err){
          alert("❌ Error al leer el archivo JSON");
          console.error(err);
        }
      };
      reader.readAsText(file);
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

/***** === NIDO DE DRAGONES (solo Silvanost) === *****/
/***** =========================
 * 🪺 NIDO DE DRAGONES
 * ========================== */
mostrarNidoDragones() {
  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;
  const centroX = W / 2;
  const centroY = H / 2 - 40;

  const nidoGroup = this.add.container(0, 0).setDepth(200);

  // Fondo translúcido
  const overlay = this.add.rectangle(centroX, centroY, W, H, 0x000000, 0.7)
    .setInteractive()
    .setDepth(200);
  nidoGroup.add(overlay);

  // Marco principal
  const caja = this.add.rectangle(centroX, centroY, 900, 600, 0x222222, 1)
    .setStrokeStyle(2, 0xffffff)
    .setDepth(201);
  nidoGroup.add(caja);

  const titulo = this.add.text(centroX, centroY - 250, "🪺 Nido de Dragones", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "28px",
    fill: "#90ee90",
    stroke: "#000",
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(202);
  nidoGroup.add(titulo);

  // Botón Cerrar
  const btnCerrar = this.add.text(centroX + 400, centroY - 260, "❌", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "24px",
    fill: "#fff",
    backgroundColor: "#900",
    padding: { left: 10, right: 10, top: 5, bottom: 5 }
  }).setInteractive().setDepth(202);
  nidoGroup.add(btnCerrar);
  btnCerrar.on("pointerdown", () => nidoGroup.destroy());

  // === Configuración de huevos ===
  const tiposHuevos = [
    { tipo: "fuego",  key: "huevofuego",  nombre: "Huevo de dragón de Fuego" },
    { tipo: "agua",   key: "huevoagua",   nombre: "Huevo de dragón de Agua" },
    { tipo: "trueno", key: "huevotrueno", nombre: "Huevo de dragón de Trueno" },
    { tipo: "roca",   key: "huevoroca",   nombre: "Huevo de dragón de Roca" },
    { tipo: "misterio", key: "huevomisterio", nombre: "Huevo de dragón Misterioso" },
    { tipo: "striker", key: "huevostriker", nombre: "Huevo de dragón Striker" }
  ];

  if (!Array.isArray(window.huevosIncubando)) window.huevosIncubando = [];

  const itemsContainer = this.add.container(0, 0).setDepth(203);
  nidoGroup.add(itemsContainer);

  const startY = centroY - 180;

  tiposHuevos.forEach((info, i) => {
    const y = startY + i * 90;
    const marco = this.add.rectangle(centroX, y, 780, 70, 0x000000, 0.6)
      .setStrokeStyle(1, 0xffffff);
    itemsContainer.add(marco);

    const icon = this.add.image(centroX - 330, y, info.key).setScale(0.6);
    itemsContainer.add(icon);

    const txtNombre = this.add.text(centroX - 260, y - 15, info.nombre, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: "#90ee90"
    }).setOrigin(0, 0.5);
    itemsContainer.add(txtNombre);

    // Cantidad en inventario
    const invent = (window.inventarioJugador || []).find(it => it.key === info.key);
    const cantidad = invent ? invent.cantidad : 0;

    const txtCantidad = this.add.text(centroX - 260, y + 18, `Cantidad: x${cantidad}`, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "16px",
      fill: cantidad > 0 ? "#fff" : "#777"
    }).setOrigin(0, 0.5);
    itemsContainer.add(txtCantidad);

    // Datos de incubación
    let inc = window.huevosIncubando.find(h => h.tipo === info.tipo);
    if (inc && inc.diasRestantes === undefined) inc.diasRestantes = 15;

    // Texto estado
    let txtEstado;
    if (!inc) {
      txtEstado = this.add.text(centroX + 40, y, "—", {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "16px", fill: "#aaa"
      }).setOrigin(0.5);
    } else if (inc.diasRestantes > 0) {
      txtEstado = this.add.text(centroX + 40, y, `⏳ ${inc.diasRestantes} días restantes`, {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "16px", fill: "#ccc"
      }).setOrigin(0.5);
    } else {
      txtEstado = this.add.text(centroX + 40, y, "✅ Listo para eclosionar!", {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "16px", fill: "#0f0"
      }).setOrigin(0.5);
    }
    itemsContainer.add(txtEstado);

    // Botón incubar/eclosionar
    const btn = this.add.text(centroX + 280, y, "Incubar", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "16px",
      fill: "#fff",
      backgroundColor: "#444",
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive();
    itemsContainer.add(btn);

    // Estado del botón
    if (inc && inc.diasRestantes > 0) {
      btn.setText("Incubando").setBackgroundColor("#228822").disableInteractive();
    } else if (inc && inc.diasRestantes === 0) {
      btn.setText("Abrir huevo").setBackgroundColor("#00aa00");
    }

    // Evento botón
    btn.on("pointerdown", () => {
      if (cantidad <= 0) {
        this.mostrarError("No tienes este tipo de huevo.");
        return;
      }

      if (!inc) {
  // Empieza incubación → gastar 1 huevo del inventario
 

  // Añadir a huevos incubando
  window.huevosIncubando.push({ tipo: info.tipo, diasRestantes: 15, key: info.key });

  btn.setText("Incubando").setBackgroundColor("#228822").disableInteractive();
  this.mostrarError(`🥚 ${info.nombre} está incubándose...`);

  // (opcional) refrescar texto cantidad visual
  txtCantidad.setText(`Cantidad: x${Math.max(item ? item.cantidad : 0, 0)}`);
} 

else if (inc.diasRestantes === 0) {
        // Eclosionar con animación
        this.animacionEclosion(info);
        const idx = window.huevosIncubando.indexOf(inc);
        if (idx >= 0) window.huevosIncubando.splice(idx, 1);
        nidoGroup.destroy();
      }
    });
  });

  // === BOTÓN PARA IR AL CRIADERO ===
const btnCriadero = this.add.text(centroX, centroY + 280, "🍼 Ver Criadero", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
  fill: "#fff",
  backgroundColor: "#0066cc",
  padding: { left: 20, right: 20, top: 10, bottom: 10 }
})
.setOrigin(0.5)
.setInteractive()
.setDepth(204);

nidoGroup.add(btnCriadero);

btnCriadero.on("pointerover", () => btnCriadero.setStyle({ backgroundColor: "#0099ff" }));
btnCriadero.on("pointerout", () => btnCriadero.setStyle({ backgroundColor: "#0066cc" }));

btnCriadero.on("pointerdown", () => {
  // Cierra el popup actual
  nidoGroup.destroy();

  // Guarda la escena actual para volver luego si quieres
  window.ultimaEscena = "SceneCiudad";

  // Abre el criadero
  this.scene.start("SceneCriadero");
});

}

/***** =========================
 * 🌫️ ANIMACIÓN DE ECLOSIÓN + HUEVO VISIBLE (usa huevos BIG)
 * ========================== */
animacionEclosion(info) {
  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;
  const centroX = W / 2;
  const centroY = H / 2 + 20;

  // Fondo oscuro con leve transparencia
  const overlay = this.add.rectangle(centroX, centroY, W, H, 0x000000, 0.85)
    .setDepth(999)
    .setInteractive();

  // === Imagen grande del huevo (usa key con sufijo BIG)
  const keyBig = "huevo" + (info.tipo || "fuego") + "BIG"; // ejemplo: "huevorocaBIG"

  if (!this.textures.exists(keyBig)) {
    console.warn("⚠️ Textura no encontrada:", keyBig);
  }

  const huevoImg = this.add.image(centroX, centroY, keyBig)
    .setDisplaySize(750, 750)
    .setDepth(1000)
    .setOrigin(0.5)
    .setAlpha(1);

  // === Texto inicial debajo
  const texto = this.add.text(centroX, centroY + 340, "✨ El huevo empieza a brillar...", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "28px",
    fill: "#ffd700",
    fontStyle: "bold",
    stroke: "#000",
    strokeThickness: 4,
    align: "center"
  }).setOrigin(0.5).setDepth(1001);

  // === Movimiento suave del huevo
  const moverHuevo = (intensidad = 15) => {
    this.tweens.add({
      targets: huevoImg,
      x: centroX + Phaser.Math.Between(-intensidad, intensidad),
      y: centroY + Phaser.Math.Between(-intensidad / 2, intensidad / 2),
      duration: 300,
      ease: "Sine.easeInOut",
      yoyo: true,
    });
  };

  // === Secuencia de mensajes y movimiento ===
  moverHuevo();
  this.time.delayedCall(1800, () => {
    texto.setText("💫 Algo se mueve dentro...");
    moverHuevo();
  });

  this.time.delayedCall(3600, () => {
    texto.setText("🔥 ¡Está a punto de eclosionar!");
    moverHuevo(25);
  });

  // === Vibración final (temblores rápidos)
  this.time.delayedCall(5500, () => {
    texto.setText("💥 ¡El huevo se rompe!");
    this.tweens.add({
      targets: huevoImg,
      angle: { from: -10, to: 10 },
      duration: 80,
      repeat: 8,
      yoyo: true,
    });
  });

  // === Fade out del huevo y aparición del dragón bebé
  this.time.delayedCall(7200, () => {
    this.tweens.add({
      targets: [huevoImg, texto],
      alpha: 0,
      duration: 700,
     onComplete: () => {
        huevoImg.destroy();
        texto.destroy();
        overlay.destroy();
        this.generarDragonDeHuevo(info);

        // 🪺 Notificar al modo historia que un huevo ha eclosionado
        if (window.storyMode) window.storyMode.trigger("eggHatched");
      }
    });
  });
}

//***** =========================
//* //🐉 GENERAR DRAGÓN DEL HUEVO (coincide tipo de huevo con tipo de dragón)
//* ========================== *//
generarDragonDeHuevo(huevo) {
  console.group("🐣 Eclosionando huevo (según tipo de dragón del array base)...");
  console.log("📦 Datos recibidos:", huevo);

  try {
    // 🔹 Consumir huevo del inventario
    const item = (window.inventarioJugador || []).find(it =>
      it.key === "huevo" + (huevo.tipo || "").toLowerCase()
    );
    if (item && item.cantidad > 0) {
      item.cantidad--;
      if (item.cantidad <= 0) {
        window.inventarioJugador.splice(window.inventarioJugador.indexOf(item), 1);
      }
      console.log(`🥚 Consumido 1 ${item.nombre}. Restan: ${item.cantidad}`);
    }

    // --- Validaciones críticas ---
    if (!Array.isArray(window.dragones) || window.dragones.length === 0) {
      this.mostrarError("No hay dragones base disponibles.");
      return;
    }
    if (!window.dragonesBaby) window.dragonesBaby = [];

    // === 🧭 FILTRAR por tipo coincidente ===
    const tipoBuscado = (huevo.tipo || "").charAt(0).toUpperCase() + (huevo.tipo || "").slice(1).toLowerCase();
    let candidatos = window.dragones.filter(d => d.tipo.toLowerCase() === tipoBuscado.toLowerCase());

    // Si no hay de ese tipo, usar todos
    if (candidatos.length === 0) {
      console.warn(`⚠️ No se encontraron dragones tipo ${tipoBuscado}, eligiendo aleatorio global.`);
      candidatos = window.dragones;
    }

    // 🐉 Elegir dragón aleatorio del tipo
    const base = Phaser.Utils.Array.GetRandom(candidatos);

    // 💎 Rareza SOLO Común o Raro (60 % / 40 %)
    const r = Math.random() * 100;
    let rareza = (r < 60) ? "Común" : "Raro";

    const colorRareza = {
      "Común": "#aaaaaa",
      "Raro": "#00bfff"
    }[rareza] || "#fff";

    // 🧬 Crear versión Baby
    const nuevoBaby = {
      name: base.name,
      tipo: base.tipo,
      clase: base.clase,
      tier: base.tier,
      rareza,
      confianza: 0,
      esBebe: true,
      img: `assets/baby/${base.name}_Baby.png`,
      mini: `assets/baby/${base.name}_Baby.png`
    };

    // Guardar en global
    window.dragonesBaby.push(nuevoBaby);
    console.log("✅ Nuevo dragón baby generado:", nuevoBaby);

    // === POPUP VISUAL ===
    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;
    const centroX = W / 2;
    const centroY = H / 2;

    const popup = this.add.container(0, 0).setDepth(1000);
    const fondo = this.add.rectangle(centroX, centroY, 950, 550, 0x000000, 0.9)
      .setStrokeStyle(2, 0xffffff);
    popup.add(fondo);

    popup.add(this.add.text(centroX, centroY - 230, "🐣 ¡Ha nacido un dragón bebé!", {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "34px",
      fill: "#ffd700",
      stroke: "#000",
      strokeThickness: 5
    }).setOrigin(0.5));

    // Imagen Baby
    const texKey = base.name + "_Baby";
    if (!this.textures.exists(texKey)) {
      this.load.image(texKey, `assets/baby/${base.name}_Baby.png`);
      this.load.start();
    }

    const img = this.add.image(centroX - 260, centroY + 20, texKey);
    img.setScale(0.8);
    popup.add(img);

    popup.add(this.add.text(centroX + 140, centroY - 90, base.name, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "28px",
      fill: colorRareza,
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5));

    popup.add(this.add.text(centroX + 140, centroY - 55, `Rareza: ${rareza}   Tier: ${base.tier}`, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "18px",
      fill: "#fff"
    }).setOrigin(0.5));

    popup.add(this.add.text(centroX + 140, centroY - 30, `Tipo: ${base.tipo}`, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "18px",
      fill: "#00bfff"
    }).setOrigin(0.5));

    popup.add(this.add.text(centroX + 140, centroY - 5, `Clase: ${base.clase}`, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "18px",
      fill: "#ccc"
    }).setOrigin(0.5));

    popup.add(this.add.text(centroX, centroY + 90,
      "Este pequeño dragón crecerá con el tiempo 🍼",
      { fontFamily: "'Cinzel Decorative', serif",
        fontSize: "20px", fill: "#ccc" }).setOrigin(0.5));

    const btn = this.add.text(centroX, centroY + 220, "Aceptar", {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "22px",
      fill: "#fff",
      backgroundColor: "#333",
      padding: { left: 20, right: 20, top: 8, bottom: 8 }
    }).setOrigin(0.5).setInteractive();
    popup.add(btn);
    btn.on("pointerdown", () => popup.destroy());

    popup.alpha = 0;
    this.tweens.add({ targets: popup, alpha: 1, duration: 800 });

  } catch (err) {
    console.error("💥 Error al generar dragón BABY:", err);
    this.mostrarError("❌ Fallo al crear el dragón bebé.");
  } finally {
    console.groupEnd();
  }
}




}
