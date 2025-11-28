/***** =========================
 * ESCENA MAPA (cuadrícula 20x15 con niebla de guerra + eventos + progresión de niveles enemigos + HUD lateral + restos de dragones vencidos + evento recompensa final)
 * ========================== */

// Posición global en el mapa para que se mantenga entre combates o al volver del poblado
let mapCol = 5;
let mapRow = 4;

// Array global de dragones derrotados
if(!window.dragonesDerrotados){
  window.dragonesDerrotados = [];
}
// Estado global de niebla por isla
if(!window.nieblaPorIsla){
  window.nieblaPorIsla = {};
}
// 🔧 Función para calcular alientos según nivel
function calcularAlientos(dragon, nivel){
  if(!dragon.numAlientosPorNivel) return 0;
  let niveles = Object.keys(dragon.numAlientosPorNivel).map(n=>parseInt(n)).sort((a,b)=>a-b);
  let alientos = 0;
  for(let n of niveles){
    if(nivel >= n){
      alientos = dragon.numAlientosPorNivel[n];
    }
  }
  return alientos;
}

class SceneMapa extends Phaser.Scene {
  constructor(){ super("SceneMapa"); }

  preload(){
    // Fondos de islas
    this.load.image("volcan","assets/mapas/volcan.png");
    this.load.image("jungle","assets/mapas/jungle.png");
    this.load.image("helado","assets/mapas/helado.png");
    this.load.image("cuevadragon","assets/mapas/cuevadragon.png");
    this.load.image("desert","assets/mapas/desert.png");
    this.load.image("pantano","assets/mapas/forest.png");
    this.load.image("pradera","assets/mapas/praderas.png");
    this.load.image("frozencrown","assets/Mapas/frozencrown.png");
    this.load.image("scorchia","assets/Mapas/scorchia.png");

    this.load.image("jadeisland","assets/Mapas/jadeisland.png");
    this.load.image("stormcloud","assets/Mapas/stormcloud.png");
    this.load.image("hellfire","assets/Mapas/hellfire.png");

    this.load.image("volante2","assets/mapas/volante2.png");
    this.load.image("desert4","assets/mapas/desert4.png");
    this.load.image("forest","assets/mapas/forest.png");
    // Jugador
    this.load.image("jugador", dragon1 ? dragon1.mini : "assets/minis/player.png");

    // Minis de dragones
    dragones.forEach(d=>{
      this.load.image(d.name+"_mini", d.mini);
    });

    // Eventos
    this.load.image("menhir","assets/events/menhir.png");
    this.load.image("cueva","assets/events/cueva.png");
    this.load.image("torre","assets/events/torre.png");
    this.load.image("hut","assets/events/hut.png");
    this.load.image("bosque","assets/events/bosque.png");
    this.load.image("torremago","assets/events/torremago.png");
    this.load.image("dungeonnieve","assets/events/dungeonnieve.png");
    this.load.image("mapacompletado","assets/events/mapacompletado.png");
    // Nuevos eventos
    this.load.image("ruina","assets/events/ruina.png");
    this.load.image("ruinanieve","assets/events/ruinanieve.png");
    this.load.image("abadia","assets/events/abadia.png");
    this.load.image("abadianieve","assets/events/abadianieve.png");
    this.load.image("alquimista","assets/events/alquimista.png");
    this.load.image("alquimistanieve","assets/events/alquimistanieve.png");
    this.load.image("arbolantiguo","assets/events/arbolantiguo.png");
    this.load.image("carromato","assets/events/carromato.png");
    this.load.image("cementerio","assets/events/cementerio.png");
    this.load.image("piramide","assets/events/piramide.png");
    
    // MONOLITOS
    this.load.image("monolitoverde","assets/tactic/monolitoverde.png");
    this.load.image("monolitorojo","assets/tactic/monolitorojo.png");
    this.load.image("monolitoazul","assets/tactic/monolitoazul.png");
    // Inventario (precarga para eventos)
    this.load.image("curacion_inventario","assets/inventario/curaMED.png");
    this.load.image("tomo_inventario","assets/inventario/tomoMED.png");
    this.load.image("pocionroja","assets/potis/pocionrojaMED.png");
    this.load.image("pocionazul","assets/potis/pocionazulMED.png");
    this.load.image("Monedas","assets/inventario/monedasMED.png");
     this.load.image("Repelente de dragones","assets/inventario/repelenteMED.png");
 //Huevos
    this.load.image("huevoroca","assets/inventario/huevorocaMED.png");
      this.load.image("huevoagua","assets/inventario/huevoaguaMED.png");
       this.load.image("huevofuego","assets/inventario/huevofuegoMED.png");
        this.load.image("huevotrueno","assets/inventario/huevotruenoMED.png");
         this.load.image("huevomisterio","assets/inventario/huevomisterioMED.png");
         this.load.image("huevostriker","assets/inventario/huevostrikerMED.png");
 // nubes
      this.load.image("nube1", "assets/animaciones/nube1.png");
      this.load.image("nube2", "assets/animaciones/nube2.png");
      this.load.image("nube3", "assets/animaciones/nube3.png");
      this.load.image("nube4", "assets/animaciones/nube4.png");
      this.load.image("nube5", "assets/animaciones/nube5.png");
      this.load.image("nube6", "assets/animaciones/nube6.png");
      this.load.image("nube7", "assets/animaciones/nube7.png");
// === NUEVO EVENTO: Banco de Peces ===
this.load.image("bancopeces1","assets/events/bancopeces1.png");
this.load.image("bancopeces2","assets/events/bancopeces2.png");
this.load.image("bancopeces3","assets/events/bancopeces3.png");
  }

  create(){
// 🩹 FIX MOVIMIENTO — reactivar input al entrar en una isla
this.input.keyboard.enabled = true;
this.bloqueado = false;
console.log("🎮 Controles activados y movimiento desbloqueado en SceneMapa");
    // 🔹 Vincular referencias globales
const dragon1 = window.dragon1;
const dragon2 = window.dragon2 || null;
    // ===== Fondo del mapa según isla =====
   this.add.image(880, 400, window.islaSeleccionada.tipo)
  .setDisplaySize(1280, 840);
// === ☁️ NUBES FIJAS SOBRE EL MAPA (viento global, debajo del HUD) ===
this.nubes = [];
const texturasNubes = ["nube1", "nube2", "nube3", "nube4", "nube5", "nube6", "nube7"];
const numNubes = Phaser.Math.Between(6, 10);
const anchoMapa = 1280;
const altoMapa = 840;

// 🌬️ Dirección global del viento (una sola vez por mapa)
this.vientoDerecha = Math.random() < 0.5;

// --- función de movimiento en bucle continuo ---
const moverNube = (scene, nube) => {
  const desplazamiento = scene.vientoDerecha
    ? Phaser.Math.Between(800, 1400)
    : Phaser.Math.Between(-1400, -800);
  const duracion = Phaser.Math.Between(70000, 110000);

  scene.tweens.add({
    targets: nube,
    x: nube.x + desplazamiento,
    duration: duracion,
    ease: "Sine.easeInOut",
    onComplete: () => {
      // 🔁 reaparece por el otro lado
      if (scene.vientoDerecha) nube.x = -200;
      else nube.x = anchoMapa + 200;

      nube.y = Phaser.Math.Between(100, altoMapa / 2);
      nube.setTexture(Phaser.Utils.Array.GetRandom(texturasNubes));
      moverNube(scene, nube);
    }
  });
};

// --- crear las nubes ---
for (let i = 0; i < numNubes; i++) {
  const tex = Phaser.Utils.Array.GetRandom(texturasNubes);

  // ⚠️ margen mínimo a la derecha del HUD lateral (HUD ~ ancho 400 px)
  const x = Phaser.Math.Between(420, anchoMapa - 100);
  const y = Phaser.Math.Between(100, altoMapa / 2);
  const escala = Phaser.Math.FloatBetween(0.9, 1.5);
  const alpha = Phaser.Math.FloatBetween(0.6, 0.9);

  const nube = this.add.image(x, y, tex)
    .setScale(escala)
    .setAlpha(alpha)
    .setDepth(5); // 💡 bajo el HUD

  this.nubes.push(nube);
  moverNube(this, nube);
}

    // Parámetros del tablero
    this.cellSize = 45;
    this.cols = 20;
    this.rows = 15;
    this.grid = [];

    // Dibujar cuadrícula
    for(let col=0; col<this.cols; col++){
      this.grid[col] = [];
      for(let row=0; row<this.rows; row++){
       let x = col * this.cellSize + this.cellSize/2 + 400; // 🔸 desplazamiento horizontal mayor 
        let y = row * this.cellSize + this.cellSize/2;
        let cell = this.add.rectangle(x,y,this.cellSize,this.cellSize,0x000000,0)
          .setStrokeStyle(1,0x444444,0.4);
        this.grid[col][row] = cell;
      }
    }

    // ===== ID único del mapa =====
const mapaId = String(window.islaSeleccionada.id);
this.islandId = mapaId;

// Inicializar estado global de niebla si no existe
if(!window.nieblaPorIsla[mapaId]){
  window.nieblaPorIsla[mapaId] = Array(this.cols).fill().map(()=>Array(this.rows).fill(false));
}

// Usamos la referencia global como estado
this.explorado = window.nieblaPorIsla[mapaId];

// === 🌫️ CAPA DE NIEBLA DE GUERRA EXTENDIDA (alineada con cuadrícula real) ===
this.fog = [];

const offsetX = 400;       // mismo desplazamiento horizontal que las celdas del grid
const cellSize = this.cellSize; // 45 px exactos

for (let col = 0; col < this.cols; col++) {
  this.fog[col] = [];
  for (let row = 0; row < this.rows; row++) {

    // 🟩 Mismo cálculo de posición que la cuadrícula base
    const x = col * cellSize + cellSize / 2 + offsetX;
    const y = row * cellSize + cellSize / 2;

    const fogRect = this.add.rectangle(
      x, y,
      cellSize + 2, cellSize + 2, // +2 evita líneas por redondeo
      0x000000, 0.001
    ).setDepth(500);

    this.fog[col][row] = fogRect;

    // Ocultar si ya estaba explorado
    if (this.explorado[col][row]) fogRect.setVisible(false);
  }
}

   

    // 📌 Posición inicial del jugador
    if(window.ultimoCombate){
      this.posCol = window.ultimoCombate.col;
      this.posRow = window.ultimoCombate.row;
      window.ultimoCombate = null; 
    } else if(typeof mapCol !== "undefined" && typeof mapRow !== "undefined"){
      this.posCol = mapCol;
      this.posRow = mapRow;
    } else {
      let pos = this.getSpawnAleatorio();
      this.posCol = pos.col;
      this.posRow = pos.row;
      mapCol = this.posCol;
      mapRow = this.posRow;
    }

    let startCell = this.grid[this.posCol][this.posRow];
    this.jugador = this.add.image(startCell.x, startCell.y, dragon1.name+"_mini").setScale(0.6);

    // Revelar alrededor del jugador al inicio
    this.revelarAlrededor(this.posCol,this.posRow);

    // ===== Dragones derrotados por isla =====
    if(!window.dragonesDerrotadosPorIsla){
      window.dragonesDerrotadosPorIsla = {};
    }
    if(!window.dragonesDerrotadosPorIsla[mapaId]){
      window.dragonesDerrotadosPorIsla[mapaId] = [];
    }
    window.dragonesDerrotadosPorIsla[mapaId].forEach(d=>{
      let x = d.col * this.cellSize + this.cellSize/2 + 200;
      let y = d.row * this.cellSize + this.cellSize/2;
      this.add.image(x,y,d.key)
        .setScale(0.3)
        .setTint(0x432454)
        .setAlpha(0.9)
        .setDepth(501);
    });

   // ===== Eventos =====
this.eventos = [];
const isla = IslaWorld.get(this.islandId);
if(isla && isla.eventos){
  isla.eventos.forEach(e=>{
    const col = Phaser.Math.Clamp(e.x, 1, this.cols-2);
    const row = Phaser.Math.Clamp(e.y, 1, this.rows-2);

    // 🚫 Evitar solapamiento: chequear distancia mínima 2 casillas
    const tooClose = this.eventos.some(ev => {
      return Math.abs(ev.col - col) < 2 && Math.abs(ev.row - row) < 2;
    });
    if(tooClose) return; // si está demasiado cerca, no se coloca

    const cell = this.grid[col][row];
    const sprite = this.add.image(cell.x, cell.y, e.tipo)
      .setScale(0.6)
      .setDepth(4);

    if(e.visitado){
      sprite.setTint(0x888888);
      let xMark = this.add.text(sprite.x, sprite.y, "❌", {
        fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px",
        fontFamily: "'Cinzel Decorative', serif",
        color:"#ff0000",
        fontStyle:"bold"
      }).setOrigin(0.5).setDepth(499).setAlpha(0.6);
      e.marcaVisitado = xMark;
    }

    const evento = { ...e, col, row, sprite };
    this.eventos.push(evento);
  });
}


    // Callback al cerrar evento
    this.onCerrarEvento = (evento)=>{
      this.visitarEvento(evento);
      if(this.eventos.every(e=>e.visitado)){
        this.time.delayedCall(300, ()=>{ this.mostrarRecompensaFinal(); });
      }
    };

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");
    this.bloqueado = false;

    // Contador combates
    if(typeof window.contadorCombates === "undefined"){
      window.contadorCombates = 0;
    }

    // HUD lateral
    this.hud = crearHUD(this);
    this.updateHUD();

    // 🔧 Asegurar alientos iniciales del jugador
    if(dragon1){
      let alientos = calcularAlientos(dragon1, dragon1.nivel || 1);
      dragon1.numAlientosInicial = alientos;
      dragon1.numAlientos = alientos;
      if(!dragon1.vidaMax) dragon1.vidaMax = dragon1.vida;
    }

    // Colección inicial
    if(!window.dragonesJugador || window.dragonesJugador.length === 0){
      window.dragonesJugador = [dragon1];
    }

   // --- Botón Mundo ---
this.btnWorld = this.add.text(1500, 120, "🗺️ Mundo", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
  fill: "#fff",
  backgroundColor: "#333",
  padding: { left: 10, right: 10, top: 5, bottom: 5 }
}).setOrigin(1,0).setInteractive().setDepth(501);

    this.btnWorld.on("pointerover",()=>this.btnWorld.setStyle({backgroundColor:"#555",fill:"#ffd700"}));
    this.btnWorld.on("pointerout",()=>this.btnWorld.setStyle({backgroundColor:"#333",fill:"#fff"}));
    this.btnWorld.on("pointerdown",()=>{
  if (window.islaSeleccionada) {
    window.retornoIsla = String(window.islaSeleccionada.id);
    // 👇 desplazamiento extra: 2 casillas a la derecha
    window.retornoOffset = { dx: 2, dy: 0 };
  }
  this.scene.start("SceneWorld");
});

 // --- Botón Colección ---
this.btnColeccion = this.add.text(1500, 40, "📜 Colección", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
  fill: "#fff",
  backgroundColor: "#333",
  padding: { left: 10, right: 10, top: 5, bottom: 5 }
}).setOrigin(1,0).setInteractive().setDepth(502);

this.btnColeccion.on("pointerdown",()=> {
  window.origenColeccion = "SceneMapa";
  window.ultimaEscena = "SceneMapa";   // 👈 añadimos esto
  this.scene.start("SceneColeccionPoblado");
});

  // --- Botón Inventario ---
this.btnInventario = this.add.text(1500, 80, "🎒 Inventario", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
  fill: "#fff",
  backgroundColor: "#333",
  padding: { left: 10, right: 10, top: 5, bottom: 5 }
}).setOrigin(1,0).setInteractive().setDepth(503);

    this.btnInventario.on("pointerover",()=>this.btnInventario.setStyle({backgroundColor:"#555",fill:"#ffd700"}));
    this.btnInventario.on("pointerout",()=>this.btnInventario.setStyle({backgroundColor:"#333",fill:"#fff"}));
    this.btnInventario.on("pointerdown",()=> {
      window.origenInventario = "SceneMapa";
      this.scene.start("SceneInventario");
    });

    if(!window.casillasEvento){
      window.casillasEvento = {};
    }
// 💎 Si hay una recompensa pendiente de monolito, mostrarla
if (window.recompensaPendiente) {
  const r = window.recompensaPendiente;
  this.time.delayedCall(800, () => {
    if (typeof tacticsEvents !== "undefined" && tacticsEvents.mostrarRecompensaMonolito) {
      tacticsEvents.mostrarRecompensaMonolito(this, r);
    } else {
      console.warn("⚠️ tacticsEvents no disponible. No se pudo mostrar la recompensa.");
    }
  });
}
// === 🧿 Indicador de Repelente Activo ===
if (window.repelenteActivo && window.repelenteActivo.diasRestantes > 0) {
  // 💣 Antes de nada: eliminar listener previo (si existe)
  if (Calendario._repelenteListener && typeof Calendario._repelenteListenerOff === "function") {
    Calendario._repelenteListenerOff();
  }

  const icono = this.add.text(100, 40,
    `🧿 Repelente activo · ${window.repelenteActivo.diasRestantes} días restantes`, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
      color: "#00ffff",
      backgroundColor: "#002244",
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }
  )
  .setOrigin(0, 0)
  .setScrollFactor(0)
  .setDepth(999);

  // 🧭 Listener que se ejecuta cada vez que pasa un día
  const off = Calendario.onAvanzarDia(() => {
    // ✅ Solo ejecutar si estamos en la escena SceneMapa
    if (!this.scene.isActive("SceneMapa")) return;

    if (!window.repelenteActivo) return;

    window.repelenteActivo.diasRestantes--;
    const restantes = window.repelenteActivo.diasRestantes;

    if (restantes > 0) {
      let color = "#00ffff";
      if (restantes === 4) color = "#33ccff";
      if (restantes === 3) color = "#99ccff";
      if (restantes === 2) color = "#ffff66";
      if (restantes === 1) color = "#ff6666";

      icono.setText(`🧿 Repelente activo · ${restantes} día${restantes === 1 ? "" : "s"} restante${restantes === 1 ? "" : "s"}`);
      icono.setColor(color);
    } else {
      // 💨 Cuando llega a 0, desaparecer
      this.tweens.add({
        targets: icono,
        alpha: 0,
        duration: 1500,
        onComplete: () => {
          icono.destroy();
          delete window.repelenteActivo;
        }
      });

      const aviso = this.add.text(100, 70, "🧿 El efecto repelente ha desaparecido", {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "16px",
        color: "#ff9999",
        backgroundColor: "#220000",
        padding: { left: 10, right: 10, top: 4, bottom: 4 }
      }).setScrollFactor(0).setDepth(998).setAlpha(0);

      this.tweens.add({
        targets: aviso,
        alpha: 1,
        duration: 400,
        yoyo: true,
        hold: 1500,
        repeat: 0,
        onComplete: () => aviso.destroy()
      });

      off(); // 👈 Desactiva el listener para no acumularlo
    }
  });

  // Guarda referencias para eliminarlo si se renueva
  Calendario._repelenteListener = true;
  Calendario._repelenteListenerOff = off;
}

// === ⚡ CONTROL DE PROBABILIDAD DE ENCUENTROS ===
this.probEncuentro = window.probEncuentro ?? 0.15; // valor global persistente

const txtProb = this.add.text(100, 780, `🐉 Encuentros: ${(this.probEncuentro * 100).toFixed(0)}%`, {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px",
  fill: "#fff",
  backgroundColor: "#222",
  padding: { left: 10, right: 10, top: 5, bottom: 5 }
}).setDepth(999).setInteractive().setScrollFactor(0);

// 🟢 Botón subir probabilidad
const btnMas = this.add.text(340, 780, "➕", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px",
  fill: "#0f0",
  backgroundColor: "#333",
  padding: { left: 10, right: 10, top: 5, bottom: 5 }
}).setDepth(999).setInteractive().setScrollFactor(0);

// 🔴 Botón bajar probabilidad
const btnMenos = this.add.text(380, 780, "➖", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px",
  fill: "#f00",
  backgroundColor: "#333",
  padding: { left: 10, right: 10, top: 5, bottom: 5 }
}).setDepth(999).setInteractive().setScrollFactor(0);

const actualizarTexto = () => {
  txtProb.setText(`🐉 Encuentros: ${(this.probEncuentro * 100).toFixed(0)}%`);
  window.probEncuentro = this.probEncuentro; // guardar globalmente
};

// Eventos de botones
btnMas.on("pointerdown", () => {
  this.probEncuentro = Math.min(1, this.probEncuentro + 0.05);
  actualizarTexto();
});

btnMenos.on("pointerdown", () => {
  this.probEncuentro = Math.max(0, this.probEncuentro - 0.05);
  actualizarTexto();
});

// === 🧩 TRUCO DEV: Completar isla actual al pulsar U ===
this.input.keyboard.on("keydown-U", () => {
  if (!this.islandId) return;
  console.log("⚡ Truco: completando isla actual:", this.islandId);

  const isla = IslaWorld.get(this.islandId);
  if (!isla) {
    console.warn("No se encontró la isla en IslaWorld:", this.islandId);
    return;
  }

  // Marcar todos los eventos como completados
  isla.eventos.forEach(ev => {
    if (!ev.visitado) {
      ev.visitado = true;
      IslaWorld.markEventCompleted(this.islandId, ev.id);
    }
  });

  // Guardar en lista de islas completadas
  if (!window.islasCompletadas) window.islasCompletadas = [];
  if (!window.islasCompletadas.includes(this.islandId)) {
    window.islasCompletadas.push(this.islandId);
  }

  // Mostrar mensaje de confirmación
  const aviso = this.add.text(640, 320, `✅ Isla ${isla.nombre} marcada como completada`, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "26px",
    fill: "#00ff00",
    backgroundColor: "#000000aa",
    padding: { left: 20, right: 20, top: 10, bottom: 10 }
  }).setOrigin(0.5).setDepth(999);

  this.time.delayedCall(2500, () => aviso.destroy());

  // 🔔 Trigger de historia (por si aplica)
  if (window.storyMode) {
    window.storyMode.trigger("completeIsland");
  }

  console.log("🎯 Isla completada por truco dev:", isla.nombre);
});
  
}

  getSpawnAleatorio(){
    let col,row;
    do {
      col = Phaser.Math.Between(1,this.cols-2);
      row = Phaser.Math.Between(1,this.rows-2);
      let centroCol = Math.floor(this.cols/2);
      let centroRow = Math.floor(this.rows/2);
      if(Math.abs(col-centroCol)<=1 && Math.abs(row-centroRow)<=1){
        continue;
      }
      break;
    } while(true);
    return {col,row};
  }

  update() {
  if (this.bloqueado) return;

  // Si está actualmente moviéndose, no aceptar otra orden
  if (this.jugadorEnMovimiento) return;

  // Movimiento continuo al mantener tecla
  const left  = this.cursors.left.isDown  || this.keys.A.isDown;
  const right = this.cursors.right.isDown || this.keys.D.isDown;
  const up    = this.cursors.up.isDown    || this.keys.W.isDown;
  const down  = this.cursors.down.isDown  || this.keys.S.isDown;

  if (left)  this.intentarMoverSuave(-1, 0);
  else if (right) this.intentarMoverSuave(1, 0);
  else if (up)    this.intentarMoverSuave(0, -1);
  else if (down)  this.intentarMoverSuave(0, 1);
}

  intentarMover(dCol,dRow){
    let newCol = this.posCol + dCol;
    let newRow = this.posRow + dRow;
    if(this.grid[newCol] && this.grid[newRow]){
      this.moverJugador(newCol,newRow);
    }
  }
intentarMoverSuave(dCol, dRow) {
  const newCol = this.posCol + dCol;
  const newRow = this.posRow + dRow;

  // Fuera del mapa
  if (newCol < 0 || newCol >= this.cols || newRow < 0 || newRow >= this.rows) return;
  if (!this.grid[newCol] || !this.grid[newCol][newRow]) return;

  this.moverJugadorSuave(newCol, newRow);
}

moverJugadorSuave(col, row) {
  // ✅ Evita que se lance el tween si ya se está moviendo
  if (this.jugadorEnMovimiento) return;
  this.jugadorEnMovimiento = true;

  const cell = this.grid[col][row];

  // 🐉 === Giro del dragón según la dirección de movimiento ===
  if (col < this.posCol) this.jugador.flipX = true;
  else if (col > this.posCol) this.jugador.flipX = false;

  // 🎬 === Movimiento con tween ===
  this.tweens.add({
    targets: this.jugador,
    x: cell.x,
    y: cell.y,
    duration: 250,
    ease: "Sine.easeInOut",
    onComplete: () => {
      const prevCol = this.posCol;
      const prevRow = this.posRow;

      this.posCol = col;
      this.posRow = row;
      mapCol = col;
      mapRow = row;

      // Revelar tiles adyacentes
      this.revelarAlrededor(col, row);

      // ⚡ Buscar evento en la nueva posición
      let evento = this.eventos?.find(e => e.col === col && e.row === row);

      if (evento && !evento.visitado) {
        this.visitarEvento(evento);
        eventos.disparar(this, evento);
      } else {
        // 🔹 Probabilidad de encuentro salvaje (mantenida del original)
        const key = `${col},${row}`;
        const repelenteActivo = window.repelenteActivo && window.repelenteActivo.diasRestantes > 0;
        const casillaUsada = window.casillasEvento && window.casillasEvento[key];

if (!repelenteActivo && !casillaUsada && Math.random() < (window.probEncuentro ?? 0.15)) {          if (!window.casillasEvento) window.casillasEvento = {};
          window.casillasEvento[key] = true;
          this.encontrarDragon();
          this.jugadorEnMovimiento = false;
          return; // 👈 detener el resto del movimiento si entra en combate
        }
      }

      // 🕒 Avanzar calendario con la distancia recorrida
      if (typeof Calendario !== "undefined" && this.jugador) {
        const dx = (col - prevCol) * this.cellSize;
        const dy = (row - prevRow) * this.cellSize;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (!this.distanciaAcumulada) this.distanciaAcumulada = 0;
        this.distanciaAcumulada += dist;

        const PIXELES_POR_DIA = 180;
        while (this.distanciaAcumulada >= PIXELES_POR_DIA) {
          Calendario.avanzar();
          this.distanciaAcumulada -= PIXELES_POR_DIA;
          console.log(`📅 Día avanzado (dist total ${dist.toFixed(1)} px)`);
        }
      }

      this.jugadorEnMovimiento = false;
    }
  });
}





 revelarAlrededor(col,row,radio=2){
  for(let dx=-radio; dx<=radio; dx++){
    for(let dy=-radio; dy<=radio; dy++){
      let c = col+dx;
      let r = row+dy;
      if(c>=0 && c<this.cols && r>=0 && r<this.rows){
        if(!this.explorado[c][r]){
          this.explorado[c][r] = true; // ← actualiza el global
          this.fog[c][r].setVisible(false);
        }
      }
    }
  }
}


  visitarEvento(evento){
  if(evento.visitado) return;

  // 🚫 No marcar todavía los eventos protegidos (ej: dungeonnieve)
  if(evento.protegido){
    return;
  }

  evento.visitado = true;

  if(typeof IslaWorld !== "undefined"){
    IslaWorld.markEventCompleted(this.islandId, evento.id);
  }

  evento.sprite.setTint(0x888888);
  let xMark = this.add.text(evento.sprite.x, evento.sprite.y, "❌", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px",
    color:"#ff0000",
    fontStyle:"bold"
  })
  .setOrigin(0.5)
  .setDepth(510)
  .setAlpha(0.6);

  evento.marcaVisitado = xMark;
}


  mostrarRecompensaFinal(){
  this.bloqueado = true;
  let overlay = this.add.rectangle(600,300,1000,600,0x000000,0.85).setDepth(300);
  let txt = this.add.text(600,220,"🎁 ¡Recompensa Final!",{
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"28px",fill:"#ffd700"
  }).setOrigin(0.5).setDepth(800);

  const curas = Phaser.Math.Between(2,5);
  const monedas = Phaser.Math.Between(750,1000);
  const potRoja = Phaser.Math.Between(0,2);
  const potAzul = Phaser.Math.Between(0,2);

  if(!window.inventarioJugador){ window.inventarioJugador = []; }
  const addItem = (nombre,cantidad)=>{
    let item = window.inventarioJugador.find(i=>i.nombre===nombre);
    if(item){ item.cantidad+=cantidad; } else { window.inventarioJugador.push({nombre,cantidad}); }
  };
  
  addItem("Materiales de curación",curas);
  addItem("Monedas",monedas);
 
  if(potRoja > 0) addItem("Poción Roja", potRoja);
  if(potAzul > 0) addItem("Poción Azul", potAzul);

   // === 🥚 NUEVO: Recompensa de huevo con probabilidad 50% ===
  let detalle = `+${curas} Materiales de curación\n+${monedas} Monedas`;
  if(potRoja) detalle += `\n+${potRoja} Poción Roja`;
  if(potAzul) detalle += `\n+${potAzul} Poción Azul`;

  const procHuevo = Math.random() < 0.85; // 85% chance de recibir un huevo
  if(procHuevo){
    const isla = (window.runtimeIsla || "").toLowerCase();
    let tiposPosibles = [];

    switch(true){
      case isla.includes("helada"):
        tiposPosibles = ["Agua", "Misterio", "Striker"];
        break;
      case isla.includes("volcan"):
        tiposPosibles = ["Fuego", "Roca", "Trueno"];
        break;
      case isla.includes("cueva"):
        tiposPosibles = ["Fuego", "Misterio", "Striker"];
        break;
      case isla.includes("pantano"):
        tiposPosibles = ["Misterio", "Roca", "Agua"];
        break;
      case isla.includes("pradera"):
        tiposPosibles = ["Trueno", "Fuego", "Agua"];
        break;
      case isla.includes("jungla"):
        tiposPosibles = ["Striker", "Agua", "Misterio"];
        break;
      case isla.includes("desierto"):
        tiposPosibles = ["Roca", "Trueno", "Fuego"];
        break;
      default:
        tiposPosibles = ["Agua", "Fuego", "Misterio"];
        break;
    }

    const tipoElegido = Phaser.Utils.Array.GetRandom(tiposPosibles);
    const nombreHuevo = "Huevo " + tipoElegido;
    const keyHuevo = "huevo" + tipoElegido.toLowerCase();

    // Añadir al inventario con su key e imagen
    const itemExistente = window.inventarioJugador.find(i => i.nombre === nombreHuevo);
    if(itemExistente){
      itemExistente.cantidad += 1;
    } else {
      window.inventarioJugador.push({
        nombre: nombreHuevo,
        key: keyHuevo,
        cantidad: 1
      });
    }

    detalle += `\n🥚 ${nombreHuevo}`;
  }
  let txtDet = this.add.text(600,300,detalle,{
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"22px",fill:"#fff",align:"center"
  }).setOrigin(0.5).setDepth(510);

  let btnOk = this.add.text(600,400,"✅ OK",{
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"24px",fill:"#0f0",backgroundColor:"#333",padding:{left:15,right:15,top:8,bottom:8}
  }).setOrigin(0.5).setInteractive().setDepth(511);

 btnOk.on("pointerdown",()=>{
  // 🔒 Asegurar que todos los eventos de esta isla se marcan completados
  if (typeof IslaWorld !== "undefined") {
    const islaData = IslaWorld.get(this.islandId);
    if (islaData && islaData.eventos) {
      islaData.eventos.forEach(ev=>{
        IslaWorld.markEventCompleted(this.islandId, ev.id);
      });
    }
  }

  // === Marcar la isla como completada (✔ azul en World) ===
  if(!window.islasCompletadas) window.islasCompletadas = [];
  const idStr = String(this.islandId);
  if (!window.islasCompletadas.includes(idStr)) {
    window.islasCompletadas.push(idStr);
  }
    // === 📜 Notificar misión historia: completar una isla ===
  if (window.storyMode) {
    window.storyMode.trigger("completeIsland");
  }

  overlay.destroy(); txt.destroy(); txtDet.destroy(); btnOk.destroy();

  if(this.islandId.includes("frozencrown")){
    this.time.delayedCall(500, ()=>{ encuentros.lanzarFrostend(this); });
  }
  else if(this.islandId.includes("scorchia")){
    this.time.delayedCall(500, ()=>{ encuentros.lanzarScorchia(this); });
  }
  else if(this.islandId.includes("jadeisland")){
    this.time.delayedCall(500, ()=>{ encuentros.lanzarJadeisland(this); });
  }
  else if(this.islandId.includes("stormcloud")){
    this.time.delayedCall(500, ()=>{ encuentros.lanzarStormcloud(this); });
  }
  else if(this.islandId.includes("hellfire")){
    this.time.delayedCall(500, ()=>{ encuentros.lanzarHellfire(this); });
  }

  else {
    this.bloqueado = false;
  }
});

}


  encontrarDragon(){
  this.bloqueado = true;
  window.contadorCombates++;

  // 🔹 Ahora el nivel del rival lo calcula encuentros.js
  let nivelRival = encuentros.nivelRival();

  // 👉 Elegir dragón según nivel y bioma
  let aleatorio = encuentros.elegirRival(nivelRival, dragon1, window.islaSeleccionada.tipo);    let alientos = calcularAlientos(aleatorio, nivelRival);

    dragon2 = {
      ...aleatorio,
      vida: aleatorio.vida,
      vidaMax: aleatorio.vida,
      numAlientosInicial: alientos,
      numAlientos: alientos
    };

    asignarRareza(dragon2);

    this.aplicarSubidasNivel(dragon2, nivelRival);
    roleplay.asignarNivel(dragon2, nivelRival);

    window.ultimoCombate = { col:this.posCol, row:this.posRow, dragon:aleatorio };
    let msg = this.add.text(600,300,"🐉 ¡ENCUENTRAS UN DRAGÓN!",{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"32px",fill:"#ffd700",fontStyle:"bold",backgroundColor:"#000000aa",
      padding:{left:20,right:20,top:10,bottom:10}
    }).setOrigin(0.5).setDepth(510);

    this.time.delayedCall(3000,()=>{ 
      msg.destroy(); 
      this.scene.start("SceneChooseDragon"); 
    });
  }

  aplicarSubidasNivel(dragon, nivel){
    for(let lvl=2; lvl<=nivel; lvl++){
      let stats = ["vida","mordisco","aliento","armadura","velocidad"];
      Phaser.Utils.Array.Shuffle(stats);
      let elegidos = stats.slice(0,2);
      elegidos.forEach(stat=>{
        switch(stat){
          case "vida": dragon.vidaMax += 4; dragon.vida = dragon.vidaMax; break;
          case "mordisco": dragon.mordisco += 1; break;
          case "aliento": dragon.aliento += 1; break;
          case "armadura": dragon.armadura += 1; break;
          case "velocidad": dragon.velocidad += 1; break;
        }
      });
    }
  }
}
