/***** =========================
 * ESCENA COMBATE (fichas de dragones a izquierda/derecha + botones abajo + XP + efectos)
 * ========================== */

const coloresTipo = {
  "Fuego": 0xff4500,
  "Agua": 0x1e90ff,
  "Roca": 0x8b4513,
  "Misterio": 0x800080,
  "Striker": 0xffff00,
  "Trueno": 0x00ffff
};

// 🎨 Colores por rareza
function colorRareza(r){
  switch(r){
    case "Común": return "#aaa";
    case "Raro": return "#1e90ff";
    case "Épico": return "#9932cc";
    case "Legendario": return "#ffd700";
    default: return "#fff";
  }
}
// 📈 Calcula multiplicador de boost temporal según nivel enemigo (solo a partir de nivel 10)
function getBoostFactor(nivel) {
  const n = Math.min(Math.max(nivel || 1, 1), 30);

  // 🔸 Sin boost por debajo de nivel 10
  if (n < 10) return 1.0;

  // 🔸 Escalado lineal de 10 a 30 → +0% → +40%
  const t = (n - 10) / (30 - 10); // 0 → 1 entre nivel 10–30
  const boost = 1 + t * 0.40;     // multiplica hasta +40%

  return boost;
}

class SceneCombate extends Phaser.Scene {
  constructor(){ super("SceneCombate"); }

  preload(){
    this.load.image("bg","assets/bg/fondo1.png");
  //Efectos

    this.load.image("alientoFuego", "assets/alientos/fuego.png");
    this.load.image("alientoAgua", "assets/alientos/agua.png");
    this.load.image("alientoTrueno", "assets/alientos/trueno.png");
    this.load.image("alientoRoca", "assets/alientos/roca.png");
    this.load.image("alientoStriker", "assets/alientos/striker.png");
    this.load.image("alientoMisterio", "assets/alientos/misterio.png");

    // Cargar todos los dragones del array global
    if(typeof dragones !== "undefined" && Array.isArray(dragones)){
      dragones.forEach(d=>{
        if(!this.textures.exists(d.name)){
          this.load.image(d.name, d.img);
        }
        if(!this.textures.exists(d.name + "_mini")){
          this.load.image(d.name + "_mini", d.mini);
        }
      });
    }

    // Pociones
    this.load.image("pocionrojaICON","assets/potis/pocionroja.png");
    this.load.image("pocionazulICON","assets/potis/pocionazul.png");

  
  }

  create(){

      // 🔄 Cooldown inicial del especial
  this.cooldownEspecial1 = 0; // jugador
  this.cooldownEspecial2 = 0; // enemigo
  this.txtCooldownEspecial = null;
  // 🔒 Establecer de forma explícita quién es cada uno
  if(typeof window !== "undefined"){
    window.dragon1 = dragon1; // jugador
    window.dragon2 = dragon2; // enemigo
    if(!dragon1.side){ dragon1.side = "player"; dragon1.isEnemy = false; }
    if(!dragon2.side){ dragon2.side = "enemy";  dragon2.isEnemy = true;  }
  }
// 💀 BOOST simulado de dificultad enemigo (solo afecta a cálculos en runtime)
this.boostEnemigo = getBoostFactor(dragon2.nivel || 1);
console.log(`⚔️ Boost simulado enemigo: +${((this.boostEnemigo - 1) * 100).toFixed(1)}% (nivel ${dragon2.nivel})`);

  // Pilla bonus por clase
  dragon1.bonosClase = getBonusesForDragon(dragon1);
  dragon2.bonosClase = getBonusesForDragon(dragon2);

  // Inicializar contadores de bloqueo
  [dragon1, dragon2].forEach(d => {
    d.bloqueosUsados = 0;
    d.bloqueosMax = calcularBloqueosMax(d);
  });

  // === Bloque 1: resetear especial por combate ===
  dragon1.especialUsado = false;
  dragon2.especialUsado = false;

  if(window.dragonesJugador){
    window.dragonesJugador.forEach(d => d.especialUsado = false);
  }

  // === Fondo ===
  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;
  this.add.image(W/2, H/2, "bg").setDisplaySize(W, H).setAlpha(0.35);

  // --- Jugador ---
this.p1 = this.add.image(W * 0.3, H * 0.55, dragon1.name)
  .setScale(0.9)
  .setDepth(5);

// --- Enemigo ---
this.p2 = this.add.image(W * 0.7, H * 0.55, dragon2.name)
  .setFlipX(true)
  .setScale(0.9)
  .setDepth(5);


// 💀 BOOST VISUAL: simulamos que el enemigo entra con vida llena según boost, sin tocar su stat real
this.vida1 = dragon1.vida;
this.vida2 = dragon2.vidaMax * (this.boostEnemigo || 1);
this.turno = 1;

  // === Normalizar Alientos ===
  dragon1.numAlientos = calcularAlientosPorNivel(dragon1);
  dragon1.numAlientosInicial = dragon1.numAlientos;
  dragon2.numAlientos = calcularAlientosPorNivel(dragon2);
  dragon2.numAlientosInicial = dragon2.numAlientos;

 // --- HUD Jugador ---
let colorRareza1 = colorRareza(dragon1.rareza);
let mostrado1 = dragon1.apodo ? `${dragon1.apodo} (${dragon1.name})` : dragon1.name;
this.name1 = this.add.text(180, 40, mostrado1, { fontFamily: "'Cinzel Decorative', serif",fontSize: "18px", fill: colorRareza1 });

let colorTier1 = "#fff";
if (dragon1.tier === "A") colorTier1 = "#00bfff";
if (dragon1.tier === "S") colorTier1 = "#ffd700";
this.tier1 = this.add.text(180, 65, `Tier ${dragon1.tier}`, { fontFamily: "'Cinzel Decorative', serif",fontSize: "15px", fill: colorTier1 });
this.text1 = this.add.text(180, 90, `Nv.${dragon1.nivel}`, { fontFamily: "'Cinzel Decorative', serif",fontSize: "15px", fill: "#ccc" });

// === VIDA y BOLITAS JUGADOR ===
this.barraVida1 = this.add.graphics();
this.vidaText1 = this.add.text(180, 80, `${this.vida1}/${dragon1.vidaMax}`, { fontFamily: "'Cinzel Decorative', serif",fontSize: "15px", fill: "#fff" });
this.aliento1 = this.add.group();

// 📍 Posiciones para las barras y bolitas del jugador
this.posVida1 = { x: 260, y: 80 };
this.posBolitas1 = { x: 280, y: 100 };

this.stats1 = this.add.text(
  180,
  130,
  `⚔️ ${dragon1.mordisco}  🔥 ${dragon1.aliento}\n🛡️ ${dragon1.armadura}  ⚡ ${dragon1.velocidad}`,
  { fontFamily: "'Cinzel Decorative', serif",fontSize: "14px", fill: "#ccc" }
);

// --- HUD Enemigo ---
let colorRareza2 = colorRareza(dragon2.rareza);
let mostrado2 = dragon2.apodo ? `${dragon2.apodo} (${dragon2.name})` : dragon2.name;
this.name2 = this.add.text(W - 380, 40, mostrado2, { fontFamily: "'Cinzel Decorative', serif",fontSize: "18px", fill: colorRareza2 });

let colorTier2 = "#fff";
if (dragon2.tier === "A") colorTier2 = "#00bfff";
if (dragon2.tier === "S") colorTier2 = "#ffd700";
this.tier2 = this.add.text(W - 380, 65, `Tier ${dragon2.tier}`, { fontFamily: "'Cinzel Decorative', serif",fontSize: "15px", fill: colorTier2 });
this.text2 = this.add.text(W - 380, 90, `Nv.${dragon2.nivel}`, { fontFamily: "'Cinzel Decorative', serif",fontSize: "15px", fill: "#ccc" });

// === VIDA y BOLITAS ENEMIGO ===
this.barraVida2 = this.add.graphics();
this.vidaText2 = this.add.text(W - 380, 80, `${this.vida2}/${dragon2.vidaMax}`, { fontFamily: "'Cinzel Decorative', serif",fontSize: "15px", fill: "#fff" });
this.aliento2 = this.add.group();

// 📍 Posiciones para las barras y bolitas del enemigo
this.posVida2 = { x: W - 580, y: 80 };
this.posBolitas2 = { x: W - 500, y: 100 };

this.stats2 = this.add.text(
  W - 380,
  130,
  `⚔️ ${dragon2.mordisco}  🔥 ${dragon2.aliento}\n🛡️ ${dragon2.armadura}  ⚡ ${dragon2.velocidad}`,
  { fontFamily: "'Cinzel Decorative', serif",fontSize: "14px", fill: "#ccc" }
);


  // --- Log ---
  this.logBox = this.add.rectangle(W/2, H - 40, W * 0.85, 60, 0x000000, 0.4)
    .setOrigin(0.5,1).setDepth(49);
  this.log = this.add.text(W * 0.08, H - 80, "", {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "15px", fill: "#ccc", align: "left", wordWrap: { width: W * 0.8 }
  }).setOrigin(0,0).setDepth(50);

  // --- Botones de ataque ---
  const yBtns = H - 140;
  const spacing = 240;
  this.btnMordisco = this.crearBoton(W / 2 - spacing, yBtns, "⚔️ Mordisco", ()=>this.atacar("mordisco"));
  this.btnAliento  = this.crearBoton(W / 2, yBtns, "🔥 Aliento", ()=>this.atacar("aliento"));
  this.btnEspecial = this.crearBoton(W / 2, yBtns + 60, "✨ Especial", ()=>this.usarEspecial());
  this.setBotonesActivos(true);

  // --- Botón Inventario ---
  this.btnInventario = this.add.text(W - 60, 40, "🎒 Inventario", {
    fontFamily: "'Cinzel Decorative', serif",fontSize:"20px",
    fill:"#fff",
    backgroundColor:"#333",
    padding:{left:10,right:10,top:5,bottom:5}
  }).setOrigin(1,0).setInteractive().setDepth(100);

  this.btnInventario.on("pointerover",()=>this.btnInventario.setStyle({backgroundColor:"#555",fill:"#ffd700"}));
  this.btnInventario.on("pointerout",()=>this.btnInventario.setStyle({backgroundColor:"#333",fill:"#fff"}));
  this.btnInventario.on("pointerdown",()=> {
    this.scene.start("SceneInventario", { from: "SceneCombate", dragonActivo: dragon1 });
  });

  // === Botones pociones con numerito ===
  const potBaseX = 220;
  const potBaseY = 200;
  this.btnPocionRoja = this.add.image(potBaseX, potBaseY, "pocionrojaICON").setScale(0.7).setInteractive().setDepth(100);
  this.btnPocionAzul = this.add.image(potBaseX + 60, potBaseY, "pocionazulICON").setScale(0.7).setInteractive().setDepth(100);
  this.txtPocionRoja = this.add.text(potBaseX + 20, potBaseY + 40, "x0", {fontFamily: "'Cinzel Decorative', serif",fontSize:"16px",fill:"#fff"}).setOrigin(1,1).setDepth(101);
  this.txtPocionAzul = this.add.text(potBaseX + 80, potBaseY + 40, "x0", {fontFamily: "'Cinzel Decorative', serif",fontSize:"16px",fill:"#fff"}).setOrigin(1,1).setDepth(101);

  this.btnPocionRoja.on("pointerdown", ()=> {
    let item = window.inventarioJugador?.find(i=>i.nombre==="Poción Roja");
    if(item && item.cantidad>0){
      dragon1.vida = Math.min(dragon1.vidaMax, dragon1.vida + 20);
      this.vida1 = dragon1.vida;
      item.cantidad--;
      this.updateVida();
      this.updatePociones();
      this.showMessage("❤️ +20 Vida", H/2, 1000, "#ff4444", "28px");
    }
  });

  this.btnPocionAzul.on("pointerdown", ()=> {
    let item = window.inventarioJugador?.find(i=>i.nombre==="Poción Azul");
    if(item && item.cantidad>0){
      dragon1.numAlientos = dragon1.numAlientosInicial;
      item.cantidad--;
      this.drawBolitas();
      this.updatePociones();
      this.showMessage("💨 Alientos restaurados", H/2, 1000, "#00bfff", "28px");
    }
  });

  // Inicializar
  this.updateVida(true);
  this.drawBolitas();
  this.dibujarEscudos();
  this.updatePociones();

  // 🚩 Estado inicial del combate
  this.combateTerminado = false;
}


usarEspecial(){
  // 🔒 Desactiva botones mientras se resuelve
  this.setBotonesActivos(false);

  // 📌 Determinar atacante y defensor
  let atacante = this.turno % 2 === 1 ? dragon1 : dragon2;
  let defensor  = this.turno % 2 === 1 ? dragon2 : dragon1;
  let spriteAtacante = this.turno % 2 === 1 ? this.p1 : this.p2;
  let spriteDefensor = this.turno % 2 === 1 ? this.p2 : this.p1;

  // ⚙️ Control de cooldown
  const esJugador = (atacante === dragon1);
  const cdActual = esJugador ? this.cooldownEspecial1 : this.cooldownEspecial2;
  if (cdActual > 0) {
    this.showMessage("⌛ Habilidad en recarga", esJugador ? 250 : 400, 1200, "#ccc", "28px");
    this.addLog(atacante.name + " no puede usar su habilidad aún (" + cdActual + " turnos)");
    this.time.delayedCall(600, ()=>this.pasarTurno());
    return;
  }

  // 🚀 Ejecutar skill según tipo
  switch(atacante.tipo){
    case "Agua":     skillAgua(this, atacante, defensor, spriteAtacante, spriteDefensor); break;
    case "Trueno":   skillTrueno(this, atacante, defensor, spriteAtacante, spriteDefensor); break;
    case "Fuego":    skillFuego(this, atacante, defensor, spriteAtacante, spriteDefensor); break;
    case "Roca":     skillRoca(this, atacante, defensor, spriteAtacante, spriteDefensor); break;
    case "Misterio": skillMisterio(this, atacante, defensor, spriteAtacante, spriteDefensor); break;
    case "Striker":  skillStriker(this, atacante, defensor, spriteAtacante, spriteDefensor); break;
  }

  // ⚡ Aplicar cooldown
  if (esJugador) {
    this.cooldownEspecial1 = 5;
    this.actualizarCooldownEspecial();
  } else {
    this.cooldownEspecial2 = 5;
  }

  // 🕓 Avanza turno
  // ⚡ Aplicar cooldown
  if (esJugador) {
    this.cooldownEspecial1 = 5;
    this.actualizarCooldownEspecial();
  } else {
    this.cooldownEspecial2 = 5;
  }

  // ⚠️ NO llamamos a pasarTurno aquí.
  // Las skills ya lo hacen al terminar su animación/efecto.
}

  updateVida(initial = false) {
  this.barraVida1.clear();
  this.barraVida2.clear();

 // 💀 BOOST VISUAL: ajusta las barras al boost del enemigo sin alterar stats reales
let vidaMaxVisual1 = dragon1.vidaMax;
let vidaMaxVisual2 = dragon2.vidaMax * (this.boostEnemigo || 1);

let pct1 = this.vida1 / vidaMaxVisual1;
let pct2 = this.vida2 / vidaMaxVisual2;
  let verde = 0x228b22, amarillo = 0xcccc00, rojo = 0x8b0000;
  let color1 = pct1 > 0.5 ? verde : (pct1 > 0.2 ? amarillo : rojo);
  let color2 = pct2 > 0.5 ? verde : (pct2 > 0.2 ? amarillo : rojo);

  if (initial) {
    this.barraVida1
      .fillStyle(color1, 1)
      .fillRect(this.posVida1.x, this.posVida1.y, 200 * pct1, 12);

    this.barraVida2
      .fillStyle(color2, 1)
      .fillRect(this.posVida2.x, this.posVida2.y, 200 * pct2, 12);
  } else {
    this.tweens.addCounter({
      from: this.prevVidaPct1 || pct1,
      to: pct1,
      duration: 500,
      onUpdate: t => {
        let val = t.getValue();
        this.barraVida1
          .clear()
          .fillStyle(color1, 1)
          .fillRect(this.posVida1.x, this.posVida1.y, 200 * val, 12);
      }
    });

    this.tweens.addCounter({
      from: this.prevVidaPct2 || pct2,
      to: pct2,
      duration: 500,
      onUpdate: t => {
        let val = t.getValue();
        this.barraVida2
          .clear()
          .fillStyle(color2, 1)
          .fillRect(this.posVida2.x, this.posVida2.y, 200 * val, 12);
      }
    });
  }

  this.prevVidaPct1 = pct1;
  this.prevVidaPct2 = pct2;

  // 💀 BOOST VISUAL: también refleja el boost en el número mostrado del enemigo
const vidaMaxVisual = Math.round(dragon2.vidaMax * (this.boostEnemigo || 1));

this.vidaText1.setText(`${this.vida1}/${dragon1.vidaMax}`);
this.vidaText2.setText(`${this.vida2}/${vidaMaxVisual}`);
}

dibujarEscudos(){
  // 🔄 borrar anteriores si existen
  if(this.escudosText1){
    this.escudosText1.forEach(t => t.destroy());
  }
  if(this.escudosText2){
    this.escudosText2.forEach(t => t.destroy());
  }
  this.escudosText1 = [];
  this.escudosText2 = [];

  // --- Jugador (dragon1) ---
  let restantes1 = Math.max(0, dragon1.bloqueosMax - (dragon1.bloqueosUsados || 0));
  for(let i=0; i<restantes1; i++){
    let x = this.name1.x + this.name1.width + 20 + i*18;
    let y = this.name1.y;
    let txt = this.add.text(x, y, "🛡️", {
      fontFamily: "'Cinzel Decorative', serif",fontSize:"18px", fill:"#00ff00"
    }).setOrigin(0,0).setDepth(200);
    this.escudosText1.push(txt);
  }

  // --- Enemigo (dragon2) ---
  let restantes2 = Math.max(0, dragon2.bloqueosMax - (dragon2.bloqueosUsados || 0));
  for(let i=0; i<restantes2; i++){
    let x = this.name2.x - 20 - i*18;
    let y = this.name2.y;
    let txt = this.add.text(x, y, "🛡️", {
      fontFamily: "'Cinzel Decorative', serif",fontSize:"18px", fill:"#00ff00"
    }).setOrigin(1,0).setDepth(200);
    this.escudosText2.push(txt);
  }
}




 drawBolitas() {
  this.aliento1.clear(true, true);
  this.aliento2.clear(true, true);

  let color1 = coloresTipo[dragon1.tipo] || 0xffff00;
  let color2 = coloresTipo[dragon2.tipo] || 0xffff00;

  // 🟢 Jugador
  for (let i = 0; i < dragon1.numAlientosInicial; i++) {
    let c = this.add.circle(
      this.posBolitas1.x + i * 18,   // 👉 posición dinámica
      this.posBolitas1.y,            // 👉 justo debajo de la barra
      6,
      i < dragon1.numAlientos ? color1 : 0x555555
    );
    this.aliento1.add(c);
  }

  // 🔴 Enemigo
  for (let i = 0; i < dragon2.numAlientosInicial; i++) {
    let c = this.add.circle(
      this.posBolitas2.x + i * 18,   // 👉 posición dinámica
      this.posBolitas2.y,
      6,
      i < dragon2.numAlientos ? color2 : 0x555555
    );
    this.aliento2.add(c);
  }
}

updateEstadoIcons(){
  // Borrar textos anteriores si existen
  if(this.estadoText1) this.estadoText1.destroy();
  if(this.estadoText2) this.estadoText2.destroy();

  let estados1 = "";
  if(dragon1.dotFuego && dragon1.dotFuego>0) estados1 += "🔥";        // quemadura
  if(dragon1.regenAgua && dragon1.regenAgua>0) estados1 += "💧";      // regen agua
  if(dragon1.aturdido && dragon1.aturdido>0) estados1 += "💫";        // stun trueno
  if(dragon1.debuffFalloTurnos && dragon1.debuffFalloTurnos>0) estados1 += "🕸️"; // precisión reducida
  if(dragon1.bloqueoTurnos && dragon1.bloqueoTurnos>0) estados1 += "⛰️";  // muro roca
  if(dragon1.enDefensa) estados1 += "🛡️";                            // postura defensiva

  let estados2 = "";
  if(dragon2.dotFuego && dragon2.dotFuego>0) estados2 += "🔥";
  if(dragon2.regenAgua && dragon2.regenAgua>0) estados2 += "💧";
  if(dragon2.aturdido && dragon2.aturdido>0) estados2 += "💫";
  if(dragon2.debuffFalloTurnos && dragon2.debuffFalloTurnos>0) estados2 += "🕸️";
  if(dragon2.bloqueoTurnos && dragon2.bloqueoTurnos>0) estados2 += "⛰️";
  if(dragon2.enDefensa) estados2 += "🛡️";

  this.estadoText1 = this.add.text(120, 160, estados1, {
    fontFamily: "'Cinzel Decorative', serif",fontSize:"20px", fill:"#fff"
  }).setDepth(200);

  this.estadoText2 = this.add.text(650, 160, estados2, {
    fontFamily: "'Cinzel Decorative', serif",fontSize:"20px", fill:"#fff"
  }).setDepth(200);
}

  updatePociones(){
    let roja = window.inventarioJugador?.find(i=>i.nombre==="Poción Roja");
    let azul = window.inventarioJugador?.find(i=>i.nombre==="Poción Azul");
    this.txtPocionRoja.setText("x"+(roja?.cantidad||0));
    this.txtPocionAzul.setText("x"+(azul?.cantidad||0));
  }

  crearBoton(x,y,texto,accion){
    let btn=this.add.text(x,y,texto,{
      fontFamily: "'Cinzel Decorative', serif",fontSize:"26px",
      fill:"#fff",
      backgroundColor:"#333",
      padding:{left:20,right:20,top:10,bottom:10}
    }).setOrigin(0.5).setInteractive().setDepth(100);

    btn.on("pointerover",()=>btn.setStyle({backgroundColor:"#555",fill:"#ffd700"}));
    btn.on("pointerout",()=>btn.setStyle({backgroundColor:"#333",fill:"#fff"}));
    btn.on("pointerdown",()=>{
      this.tweens.add({
        targets:btn,scale:0.9,duration:100,yoyo:true,
        onComplete:()=>accion()
      });
    });
    return btn;
  }

 setBotonesActivos(activo){
  [ this.btnMordisco, this.btnAliento ].forEach(btn=>{
    if(activo){
      btn.setInteractive().setStyle({backgroundColor:"#333",fill:"#fff"});
    } else {
      btn.disableInteractive().setStyle({backgroundColor:"#222",fill:"#888"});
    }
  });

  // ⚡ Botón Especial: solo se activa si no hay cooldown
  if (activo){
    if (this.cooldownEspecial1 > 0){
      this.btnEspecial.disableInteractive().setStyle({backgroundColor:"#222",fill:"#888"});
    } else {
      this.btnEspecial.setInteractive().setStyle({backgroundColor:"#333",fill:"#fff"});
    }
  } else {
    this.btnEspecial.disableInteractive().setStyle({backgroundColor:"#222",fill:"#888"});
  }
}


  addLog(msg){
    this.log.text += msg + "\n";
    let lines=this.log.text.split("\n");
    if(lines.length>8){
      lines=lines.slice(lines.length-8);
      this.log.text=lines.join("\n");
    }
  }

  showMessage(texto, yPos=250, dur=1000, color="#fff", size="32px"){
    let msg=this.add.text(500,yPos,texto,{
      fontFamily: "'Cinzel Decorative', serif",fontSize:size,fill:color,fontStyle:"bold"
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      duration: dur,
      onComplete: ()=> msg.destroy()
    });
  }

  showDamage(dmg,target){
    let dmgText=this.add.text(target.x,target.y-50,"-"+dmg,{
      fontFamily: "'Cinzel Decorative', serif",fontSize:"36px",fill:"#ff4444",fontStyle:"bold"
    }).setOrigin(0.5).setDepth(150);

    this.tweens.add({
      targets:dmgText,
      y: target.y-120,
      alpha: 0,
      duration: 1800,
      onComplete:()=>dmgText.destroy()
    });
  }
dispararAliento(spriteAtacante, spriteDefensor, tipo) {
  // === 🔹 Seleccionar textura según tipo elemental ===
  let tex = "alientoGenerico";
  switch ((tipo || "").toLowerCase()) {
    case "fuego": tex = "alientoFuego"; break;
    case "agua": tex = "alientoAgua"; break;
    case "trueno": tex = "alientoTrueno"; break;
    case "roca": tex = "alientoRoca"; break;
    case "misterio": tex = "alientoMisterio"; break;
    case "striker": tex = "alientoStriker"; break;
  }

  if (!this.textures.exists(tex)) tex = "alientoGenerico";

  // === Crear sprite del proyectil ===
  const proyectil = this.add.image(spriteAtacante.x, spriteAtacante.y - 20, tex)
    .setScale(0.8)
    .setDepth(8)
    .setAlpha(1);

  // 👉 Determinar dirección (izquierda o derecha)
  const haciaDerecha = spriteAtacante.x < spriteDefensor.x;
  proyectil.flipX = !haciaDerecha; // si dispara hacia la izquierda, se voltea

  // === Animación de vuelo ===
  this.tweens.add({
    targets: proyectil,
    x: spriteDefensor.x,
    y: spriteDefensor.y - 40,
    duration: 600,
    ease: "Cubic.easeOut",
    onComplete: () => {
      // 💥 Efecto de impacto coherente con la dirección
      const flash = this.add.image(spriteDefensor.x, spriteDefensor.y - 40, tex)
        .setScale(1.3)
        .setDepth(9)
        .setAlpha(0.7);

      // Mantener la misma orientación que el disparo
      flash.flipX = proyectil.flipX;

      // 🔁 Animación de expansión/desvanecimiento
      this.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 2.2,
        duration: 400,
        ease: "Sine.easeOut",
        onComplete: () => flash.destroy()
      });

      proyectil.destroy();
    }
  });
}

  efectoMordisco(dragon){
    this.tweens.add({
      targets: dragon,
      x: dragon.x + (dragon===this.p1 ? 40 : -40),
      duration: 150,
      yoyo: true
    });
  }

  efectoAliento(dragon, tipo){
    let color = coloresTipo[tipo] || 0xffffff;
    let clone = this.add.image(dragon.x, dragon.y, dragon.texture.key)
      .setScale(dragon.scale * 1.05)
      .setFlipX(dragon.flipX)
      .setTint(color)
      .setAlpha(0.6)
      .setDepth(6);

    this.tweens.add({
      targets: clone,
      alpha: 0,
      duration: 2000,
      onComplete: ()=> clone.destroy()
    });
  }

  efectoEsquiva(dragon){
    this.tweens.add({
      targets: dragon,
      alpha: 0,
      duration: 150,
      yoyo: true,
      repeat: 1
    });
  }

  resplandorGolpe(dragonSprite, tipo){
    let color = coloresTipo[tipo] || 0xffffff;
    let baseDelay = 150;
    let baseDur = 800;
    let stroke = 4;

    switch(tipo){
      case "Fuego": color=0xff4500;baseDur=600;stroke=5;break;
      case "Agua": color=0x1e90ff;baseDur=1000;stroke=3;break;
      case "Roca": color=0x8b4513;baseDur=1200;stroke=6;break;
      case "Misterio": color=0x800080;baseDur=1100;stroke=4;break;
      case "Striker": color=0xffff00;baseDur=700;baseDelay=100;stroke=4;break;
      case "Trueno": color=0x00ffff;baseDur=500;stroke=3;break;
    }

    for(let i=0;i<3;i++){
      let ring = this.add.circle(dragonSprite.x, dragonSprite.y, 20, color, 0)
        .setStrokeStyle(stroke,color,0.8)
        .setDepth(12);

      this.tweens.add({
        targets: ring,
        radius: { from: 20, to: 100 },
        alpha: { from: 0.8, to: 0 },
        duration: baseDur,
        delay: i*baseDelay,
        ease: "Cubic.easeOut",
        onComplete: ()=> ring.destroy()
      });
    }
  }
pasarTurno(){
  if(this.combateTerminado) return; // ⛔ ya terminó
  if(this.turnoEnCurso) return;     // 🚫 evita dobles saltos de turno

  // 🔒 activa candado
  this.turnoEnCurso = true;
  this.time.delayedCall(50, ()=>{   // pequeño delay para liberar
    this.turnoEnCurso = false;
  });

  this.turno++;

  // 👊 Determinar quién juega ahora
  let actual   = this.turno % 2 === 1 ? dragon1 : dragon2; 
  let oponente = this.turno % 2 === 1 ? dragon2 : dragon1; 

  /* ============================
   * EFECTOS DE ESTADO
   * ============================ */

  // 🌊 Regeneración Agua (cura 15% vida máx durante X turnos)
if(actual.regenAgua && actual.regenAgua > 0){
  let cura = Math.floor(actual.vidaMax * (actual.regenAguaPct || 0));
  if(cura > 0){
    actual.vida = Math.min(actual.vidaMax, actual.vida + cura);

    if(actual === dragon1){ this.vida1 = actual.vida; }
    else { this.vida2 = actual.vida; }

    this.updateVida();
    this.showMessage("💧 Regeneración +" + cura, actual.side==="player"?200:400, 1000, "#00bfff", "28px");
    this.addLog(actual.name+" regenera "+cura+" vida");
  }
  actual.regenAgua--;
  if(actual.regenAgua <= 0){
    delete actual.regenAgua;
    delete actual.regenAguaPct;
  }
}

  // 🔥 Quemadura
  if(actual.dotFuego && actual.dotFuego > 0){
    if(actual.dotFuego > 1){ // primer tick pendiente, no daña
      let dot = rnd(2,5);   // 🔥 daño aleatorio de 2 a 5 por tic

      if(actual === dragon1){ this.vida1 = Math.max(0, this.vida1 - dot); }
      else { this.vida2 = Math.max(0, this.vida2 - dot); }

      this.updateVida();
      this.showDamage(dot, actual === dragon1 ? this.p1 : this.p2, "Fuego", true);
      this.addLog(actual.name+" sufre quemadura ("+dot+")");
    }
    actual.dotFuego--;
  }

  // ⛰️ Bloqueo (Roca)
  if(actual.bloqueoTurnos && actual.bloqueoTurnos > 0){
    if(actual.bloqueoTurnos > 1){ 
      actual.bloqueoProbActivo = true;
      this.addLog(actual.name+" mantiene su muro de bloqueo ("+(actual.bloqueoTurnos-1)+" turnos restantes)");
    }
    actual.bloqueoTurnos--;
    if(actual.bloqueoTurnos <= 0){
      delete actual.bloqueoProb;
      delete actual.bloqueoProbActivo;
      this.addLog(actual.name+" pierde el muro de bloqueo");
    }
  }

  // 🕸️ Debuff Misterio (fallo 75%)
  if(actual.debuffFalloTurnos && actual.debuffFalloTurnos > 0){
    if(actual.debuffFalloTurnos > 1){ 
      actual.debuffFalloProbActivo = true;
      this.addLog(actual.name+" está atrapado en ilusiones (75% fallará)");
    } else {
      actual.debuffFalloProbActivo = false;
    }
    actual.debuffFalloTurnos--;
  } else {
    actual.debuffFalloProbActivo = false;
  }

  // 💫 Aturdido (Trueno) → ÚNICO que hace perder turno
if(actual.aturdido && actual.aturdido > 0){
  actual.aturdido--;
  this.showMessage("💫 ATURDIDO", 300, 1000, "#ffff00", "40px");
  this.addLog(actual.name+" está aturdido y pierde el turno");
  this.updateEstadoIcons();

  // 👇 en lugar de llamar recursivamente, salto turno con delay
  this.time.delayedCall(800, ()=>this.pasarTurno());
  return;
}
   /* ============================
   * ACTUALIZAR COOLDOWN Y REGENERAR ALIENTOS
   * ============================ */

  // Solo baja el cooldown del dragón que actúa este turno
  if (actual === dragon1 && this.cooldownEspecial1 > 0) {
    this.cooldownEspecial1--;
    this.actualizarCooldownEspecial();
  }
  if (actual === dragon2 && this.cooldownEspecial2 > 0) {
    this.cooldownEspecial2--;
  }

  /* ============================
   * REGENERACIÓN DE ALIENTOS INDEPENDIENTE (cada 5 turnos propios)
   * ============================ */
  if (!dragon1.turnosDesdeAliento) dragon1.turnosDesdeAliento = 0;
  if (!dragon2.turnosDesdeAliento) dragon2.turnosDesdeAliento = 0;

  // 🔁 Cada dragón cuenta solo sus turnos
  if (actual === dragon1) dragon1.turnosDesdeAliento++;
  if (actual === dragon2) dragon2.turnosDesdeAliento++;

  // 🐉 Jugador: cada 5 turnos suyos → +1 aliento
  if (dragon1.turnosDesdeAliento >= 5) {
    if (dragon1.numAlientos < dragon1.numAlientosInicial) {
      dragon1.numAlientos = Math.min(dragon1.numAlientosInicial, dragon1.numAlientos + 1);
      this.showMessage("💨 +1 Aliento", this.p1.y - 100, 1000, "#00bfff", "28px");
      this.addLog(dragon1.name + " recupera 1 aliento");
      this.drawBolitas();
    }
    dragon1.turnosDesdeAliento = 0; // reset contador
  }

  // 🐲 Enemigo: cada 5 turnos suyos → +1 aliento
  if (dragon2.turnosDesdeAliento >= 5) {
    if (dragon2.numAlientos < dragon2.numAlientosInicial) {
      dragon2.numAlientos = Math.min(dragon2.numAlientosInicial, dragon2.numAlientos + 1);
      this.showMessage("💨 +1 Aliento enemigo", this.p2.y - 100, 1000, "#00bfff", "28px");
      this.addLog(dragon2.name + " recupera 1 aliento");
      this.drawBolitas();
    }
    dragon2.turnosDesdeAliento = 0; // reset contador
  }

  /* ============================
   * FIN EFECTOS DE ESTADO
   * ============================ */

  // 🩸 comprobar fin de combate
  if(this.vida1 <= 0 || this.vida2 <= 0){
    this.checkEnd();
    return;
  }

  // 👾 turno enemigo
  if(this.turno % 2 === 0 && this.vida1 > 0 && this.vida2 > 0){
    this.time.delayedCall(1000, ()=>IAattack(this, dragon2, dragon1));
  }

  // 🙋 turno jugador
  if(this.turno % 2 === 1 && this.vida1 > 0 && this.vida2 > 0){
    this.time.delayedCall(1000, ()=>this.setBotonesActivos(true));
  }

  // 🔔 refrescar iconos
  this.updateEstadoIcons();
}

actualizarCooldownEspecial(){
  // === Si hay cooldown activo ===
  if (this.cooldownEspecial1 > 0){
    // 🔒 Desactivar completamente interacción y cambiar estilo
    this.btnEspecial.disableInteractive();
    this.btnEspecial.setStyle({ backgroundColor:"#222", fill:"#888" });

    // 🧭 Si ya hay numerito, lo actualizamos
    if (!this.txtCooldownEspecial) {
      this.txtCooldownEspecial = this.add.text(
        this.btnEspecial.x, this.btnEspecial.y,
        this.cooldownEspecial1.toString(),
        { 
          fontFamily:"'Cinzel Decorative', serif",
          fontSize:"22px",
          fill:"#ffd700",
          stroke:"#000",
          strokeThickness:3
        }
      ).setOrigin(0.5).setDepth(300);
    } else {
      this.txtCooldownEspecial.setText(this.cooldownEspecial1);
    }
  } 
  else {
    // ✅ Cooldown terminado → se reactiva el botón
    this.btnEspecial.setInteractive();
    this.btnEspecial.setStyle({ backgroundColor:"#333", fill:"#fff" });

    // 💥 Efecto visual de reactivación (parpadeo breve)
    this.tweens.add({
      targets: this.btnEspecial,
      alpha: { from: 0.5, to: 1 },
      duration: 300,
      yoyo: true,
      repeat: 2
    });

    // 🧹 Eliminar numerito si existía
    if (this.txtCooldownEspecial) {
      this.txtCooldownEspecial.destroy();
      this.txtCooldownEspecial = null;
    }
  }
}


 atacar(tipo){
  if(this.vida1<=0 || this.vida2<=0) return;

  this.setBotonesActivos(false);

  let atacante, defensor, targetDef, spriteAtacante;
  if(this.turno%2===1){ 
    atacante=dragon1; defensor=dragon2; 
    spriteAtacante=this.p1; targetDef=this.p2; 
  }
  else { 
    atacante=dragon2; defensor=dragon1; 
    spriteAtacante=this.p2; targetDef=this.p1; 
  }

  // === Mensaje de acción ===
  let accion = tipo==="mordisco" ? "Mordisco" : "Aliento";
  this.showMessage(tipo==="mordisco" ? "⚔️ MORDISCO" : "🔥 ALIENTO", 200, 1000, "#ffd700", "40px");

  let dmg=0;

  // === Mordisco ===
  if(tipo==="mordisco"){
    // 💪 daño base con boost enemigo
    let mordiscoBase = atacante.isEnemy ? atacante.mordisco * this.boostEnemigo : atacante.mordisco;
    dmg = Math.round((d(12) + mordiscoBase) - defensor.armadura * 1.5); // 🛡️ escudo pasivo potenciado por armadura

    // 🎯 Crítico
    if(dmg > 0){
      let probCrit = Math.min(0.25, (atacante.velocidad*0.01)+(atacante.mordisco*0.005));
      probCrit += atacante.bonosClase?.crit || 0; 
      if(Math.random() < probCrit){
        dmg = Math.floor(dmg*1.5);
        this.showMessage("💥 CRÍTICO!", 350, 1500, "#ff0000", "38px");
        this.addLog("¡Golpe crítico!");
      }
    }

    this.efectoMordisco(spriteAtacante);
  }

  // === Aliento ===
  if(tipo==="aliento"){
    if (atacante.numAlientos<=0){
      this.addLog(accion+" → Sin aliento");
      this.pasarTurno();
      return;
    }

    atacante.numAlientos--;
    this.drawBolitas();

    let probFallo = 0.15; // base
    if(Math.random() < probFallo){
      dmg = 0;
    } else {
      let alientoBase = atacante.isEnemy ? atacante.aliento * this.boostEnemigo : atacante.aliento;
      dmg = Math.floor(alientoBase * 1.7) + Phaser.Math.Between(-5,5);
    }

    this.efectoAliento(spriteAtacante, atacante.tipo);
    this.dispararAliento(spriteAtacante, targetDef, atacante.tipo);
    if(atacante===dragon1 && atacante.numAlientos<=0){
      this.btnAliento.disableInteractive();
      this.btnAliento.setStyle({backgroundColor:"#222",fill:"#888"});
    }
  }

  // ⚡ Esquiva: velocidad + bonus de clase
  let probEsquiva = Math.min(0.40, defensor.velocidad*0.018);
  probEsquiva += defensor.bonosClase?.esquiva || 0;
  if(Math.random()<probEsquiva){
    this.showMessage("⚡ ESQUIVA", 400, 1500, "#00ffff", "36px");
    this.addLog(accion+" → Esquiva");
    this.efectoEsquiva(targetDef);
    this.pasarTurno();
    return;
  }

  // 🕸️ Misterio → fallo directo
  if(atacante.debuffFalloProbActivo && Math.random() < atacante.debuffFalloProb){
    this.showMessage("❌ Confusión", 400, 1500, "#9932cc", "36px");
    this.addLog(accion+" → Falla por ilusiones");
    this.pasarTurno();
    return;
  }

  // ⛰️ Roca → muro de bloqueo + bonus de clase
  let probBloqueoExtra = defensor.bonosClase?.bloqueo || 0;
  if(defensor.bloqueoProbActivo && Math.random() < (defensor.bloqueoProb + probBloqueoExtra)){
    this.showMessage("⛰️ BLOQUEADO", 400, 1500, "#aaaaaa", "36px");
    this.addLog(accion+" → Bloqueado por muro pétreo");
    this.pasarTurno();
    return;
  }

  // === Resolución de daño ===
  dmg = Math.max(0, dmg);

  if(dmg === 0){
    // 🛡️ Defensa pasiva
    this.showMessage("🛡️ DEFENSA", 400, 1500, "#ccc", "34px");
    this.addLog(accion+" → Defensa");

    // 💥 Contraataque si tiene escudos disponibles
    let restantes = Math.max(0, defensor.bloqueosMax - (defensor.bloqueosUsados || 0));
    if(restantes > 0){
      defensor.bloqueosUsados++;
      this.dibujarEscudos();

      this.time.delayedCall(600, ()=>{
        let contraDmg = Math.round((d(10) + defensor.mordisco) - atacante.armadura);
        if(atacante.buffDefensa && atacante.buffDefensa > 0){
          contraDmg = Math.max(0, contraDmg - 2);
        }
        contraDmg = Math.floor(Math.max(0, contraDmg)*1.2); // más fuerte

        this.efectoMordisco(targetDef);
        if(atacante===dragon1){ this.vida1 = Math.max(0, this.vida1 - contraDmg); }
        else { this.vida2 = Math.max(0, this.vida2 - contraDmg); }

        this.updateVida();
        this.showDamage(contraDmg, spriteAtacante, "Normal");
        this.showMessage("⚔️ CONTRAATAQUE!", 300, 1500, "#ff4444", "36px");
        this.addLog("Contraataque por escudo ("+contraDmg+")");
        this.pasarTurno();
      });
      return;
    }

  } else {
    // 💥 Daño normal
    if(defensor===dragon2){ this.vida2=Math.max(0,this.vida2-dmg); }
    else { this.vida1=Math.max(0,this.vida1-dmg); }

    this.updateVida();
    this.showDamage(dmg, targetDef, tipo==="mordisco" ? "Normal" : atacante.tipo);
    this.showMessage("💥 GOLPE", 400, 1500, "#ff4444", "38px");
    this.addLog(accion+" → Golpe ("+dmg+")");

    if(tipo==="aliento"){
      this.resplandorGolpe(targetDef, atacante.tipo);
    }
  }

  this.pasarTurno();
}





 checkEnd(){
    if(this.combateTerminado) return;   // 🚩 evita repetir
    this.combateTerminado = true;       // marca combate terminado

    // ⚖️ Empate
    if(this.vida1<=0 && this.vida2<=0){
      this.addLog("Empate");
      this.showMessage("🤝 EMPATE", 300, 2000, "#fff", "48px");
      return;
    }

    // ☠️ Derrota del jugador
    if(this.vida1<=0){
      if(window.dragonesJugador){
        let d = window.dragonesJugador.find(dd => dd.name === dragon1.name);
        if(d){
          d.vida = 0;
                 }
      }

      let vivosActivos = window.dragonesJugador.filter(d => d.activo && d.vida > 0);
      if(vivosActivos.length > 0){
        combatUI.mostrarOpcionesDerrota(this, vivosActivos);
      } else {
        this.addLog("¡Todos tus dragones activos han caído!");
        this.showMessage("☠️ DERROTA FINAL", 300, 2000, "#ff4444", "48px");
        this.time.delayedCall(2500, () => {
          // 🗺️ Guardar posición del jugador si existe
          if (window.mapCol !== undefined && window.mapRow !== undefined) {
            window.ultimoCombate = { col: window.mapCol, row: window.mapRow };
          }

          // 🧭 Volver al mapa actual
          const volverA = window.ultimaEscena === "SceneMapa" ? "SceneMapa" : "SceneMapa";
          this.scene.start(volverA);
        });      }
      return;
    }

    // 🏆 Victoria del jugador
    if(this.vida2<=0){
      this.addLog("Victoria");
      this.showMessage("🏆 VICTORIA", 300, 2000, "#ffd700", "48px");

      // 📊 Solo mostrar XP, roleplay se encargará de lanzar las subidas después del popup
      roleplay.repartirXP(dragon1, dragon2, this);

      // Guardar dragón derrotado
      if(window.ultimoCombate){
        window.dragonesDerrotados.push({
          col: window.ultimoCombate.col,
          row: window.ultimoCombate.row,
          key: window.ultimoCombate.dragon.name + "_mini"
        });
      }

      // Preparar dragón capturado
      let capturado = JSON.parse(JSON.stringify(dragon2));
      capturado.mini = window.ultimoCombate?.dragon.mini || capturado.mini;
      capturado.img  = window.ultimoCombate?.dragon.img  || capturado.img;
      capturado.vida = capturado.vidaMax;
      capturado.numAlientos = calcularAlientosPorNivel(capturado);
      capturado.numAlientosInicial = capturado.numAlientos;

      // Actualizar vida y estado especial del dragón jugador
      let d = window.dragonesJugador.find(dd => dd.name === dragon1.name);
      if(d){
        d.vida = this.vida1;
        }

      // 👉 IMPORTANTE: ya no llamamos aquí a procesarColaSubidas.
      // Ese paso lo hace roleplay.mostrarResumenXP cuando se cierra el popup de XP.
      // Después, en roleplay.procesarColaSubidas() lanzas la captura.

      // 🟢 Registrar derrota para misiones
if (window.Misiones && dragon2) {
  Misiones.registrarEvento("dragonDerrotado", {
    name: dragon2.name,
    tipo: dragon2.tipo,
    rareza: dragon2.rareza,
    bioma: window.runtimeIsla
  });
}

      return;
    }
}


  getState(){
    return {
      vida1: this.vida1,
      vida2: this.vida2,
      numAlientos1: dragon1.numAlientos,
      numAlientos2: dragon2.numAlientos,
      turno: this.turno || 1
    };
  }

  setState(state){
    this.vida1 = state.vida1;
    this.vida2 = state.vida2;
    dragon1.numAlientos = state.numAlientos1;
    dragon2.numAlientos = state.numAlientos2;
    this.turno = state.turno || 1;
    this.updateVida();
    this.drawBolitas();
    this.updatePociones();
    // 🚩 Estado de combate
    this.combateTerminado = false;
  }
}

/***** =========================
 * Utilidad: calcular alientos por nivel
 * ========================== */
function calcularAlientosPorNivel(dragon){
  if(!dragon) return 0;
  const nivel = dragon.nivel || 1;
  const base = dragones.find(dd => dd.name === dragon.name);
  if(!base || !base.numAlientosPorNivel) return dragon.numAlientos ?? 0;
  const niveles = Object.keys(base.numAlientosPorNivel).map(n=>parseInt(n)).sort((a,b)=>a-b);
  let alientos = 0;
  for(const n of niveles){ if(nivel >= n){ alientos = base.numAlientosPorNivel[n]; } }
  return alientos;
}

/***** =========================
 * Utilidad: calcular bloqueos máximos según clase + nivel
 * ========================== */
function calcularBloqueosMax(dragon){
  let base = String(dragon.clase).includes("Tanque") ? 3 : 2;
  let nivel = dragon.nivel || 1;

  if(String(dragon.clase).includes("Tanque")){
    if(nivel >= 10) base++;
    if(nivel >= 20) base++;
    if(nivel >= 30) base++;
  } else {
    if(nivel >= 15) base++;
    if(nivel >= 25) base++;
  }

  return base;
}