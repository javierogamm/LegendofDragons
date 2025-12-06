/***** =========================
 * ESCENA MAPA WORLD (dragón centrado + franja UI 200px + HUD + botones Poblado, Colección, Inventario + eventos de islas persistentes + minimapa con imagen real + ciudades fijas sin auto-entrar)
 * ========================== */
class SceneWorld extends Phaser.Scene {
  constructor(){ super("SceneWorld"); }

  preload(){
    this.load.image("world", "assets/mapas/world.png");

    // Dragones
    if (Array.isArray(dragones)) {
      dragones.forEach(d=>{
        const key = d.name + "_mini";
        if (!this.textures.exists(key)) this.load.image(key, d.mini);
      });
    }

    // Iconos de mapas (islas)
    this.load.image("volcanICON", "assets/mapas/volcanICONO.png");
    this.load.image("jungleICON", "assets/mapas/jungleICONO.png");
    this.load.image("heladoICON", "assets/mapas/heladoICONO.png");
    this.load.image("cuevadragonICON", "assets/mapas/cuevadragonICONO.png");
    this.load.image("desertICON", "assets/mapas/desertICONO.png");
    this.load.image("pantanoICON", "assets/mapas/forestICONO.png");
    this.load.image("praderaICON", "assets/mapas/praderasICONO.png");
    this.load.image("frozencrownICON", "assets/mapas/frozencrownICONO.png");
    this.load.image("scorchiaICON", "assets/mapas/scorchiaICONO.png");
    this.load.image("volante2ICON", "assets/mapas/volante2ICONO.png");
    this.load.image("desert4ICON",  "assets/mapas/desert4ICONO.png");
    this.load.image("forestICON",   "assets/mapas/forestICONO.png");
    this.load.image("jadeislandICON", "assets/mapas/jadeislandICONO.png");
    this.load.image("stormcloudICON","assets/mapas/stormcloudICONO.png");
    this.load.image("hellfireICON",  "assets/mapas/hellfireICONO.png");
   // nubes
      this.load.image("nube1", "assets/animaciones/nube1.png");
      this.load.image("nube2", "assets/animaciones/nube2.png");
      this.load.image("nube3", "assets/animaciones/nube3.png");
      this.load.image("nube4", "assets/animaciones/nube4.png");
      this.load.image("nube5", "assets/animaciones/nube5.png");
      this.load.image("nube6", "assets/animaciones/nube6.png");
      this.load.image("nube7", "assets/animaciones/nube7.png");

    // === CIUDADES: iconos en el world ===
    this.load.image("luminariaICON", "assets/ciudades/luminaria.png");
    this.load.image("silvanostICON", "assets/ciudades/silvanost.png");
    this.load.image("harruniICON", "assets/ciudades/harruni.png");
    this.load.image("frostgaardICON", "assets/ciudades/frostgaard.png"); // ❄️ nueva ciudad
      // MONOLITOS
    this.load.image("monolitoverde","assets/tactic/monolitoverde.png");
    this.load.image("monolitorojo","assets/tactic/monolitorojo.png");
    this.load.image("monolitoazul","assets/tactic/monolitoazul.png");
    this.load.image("monolitodorado","assets/tactic/monolitodorado.png");

 //Huevos
    this.load.image("huevoroca","assets/inventario/huevoroca.png");
      this.load.image("huevoagua","assets/inventario/huevoagua.png");
       this.load.image("huevofuego","assets/inventario/huevofuego.png");
        this.load.image("huevotrueno","assets/inventario/huevotrueno.png");
         this.load.image("huevomisterio","assets/inventario/huevomisterio.png");
         this.load.image("huevostriker","assets/inventario/huevostriker.png");
  
  }

  create(data){

window.sceneWorld = this;

// 🩹 FIX: liberar dragones atascados en misiones pasivas al cargar partida
if (Array.isArray(window.dragonesJugador)) {
  const misiones = Array.isArray(window.misionesPasivas) ? window.misionesPasivas : [];

  window.dragonesJugador.forEach(d => {
    // Si está marcado como ocupado pero no está realmente en ninguna misión activa
    const sigueEnMision = misiones.some(m => 
      m.estado === "En curso" &&
      Array.isArray(m.dragonesAsignados) &&
      m.dragonesAsignados.some(md => md && (md.__uid === d.__uid || md.name === d.name))
    );

    if (d.busy && !sigueEnMision) {
      console.warn(`🐉 Dragón liberado del estado 'busy' al cargar: ${d.name}`);
      d.busy = false;
    }

    // Repara estado "activo" perdido (si no hay ningún activo)
    if (typeof d.activo !== "boolean") d.activo = false;
  });

  // Garantiza que al menos un dragón esté activo
  const hayActivo = window.dragonesJugador.some(d => d.activo);
  if (!hayActivo && window.dragonesJugador.length > 0) {
    window.dragonesJugador[0].activo = true;
    window.dragon1 = window.dragonesJugador[0];
    console.log("⚙️ No había dragón activo; activado por defecto:", window.dragon1.name);
  }
}

// ==========================================================
// 🧩 FIX CARGA DESDE PARTIDA (asegurar dragones activos válidos)
// ==========================================================
if (window.__FROM_SAVEGAME__) {
  if (!window.dragon1 || typeof window.dragon1.nivel !== "number") {
    console.warn("⚠️ dragon1 inválido al entrar en SceneWorld, intentando recuperar...");
    const activos = Array.isArray(window.dragonesJugador)
      ? window.dragonesJugador.filter(d => d.activo)
      : [];

    if (activos.length > 0) {
      window.dragon1 = activos[0];
      window.dragon2 = activos[1] || null;
      console.log("🐉 Dragones restaurados al entrar en SceneWorld:", activos.map(d => d.name));
    } else if (window.dragonesJugador?.length > 0) {
      window.dragonesJugador[0].activo = true;
      window.dragon1 = window.dragonesJugador[0];
      console.warn("⚠️ Activando primer dragón por defecto:", window.dragon1.name);
    } else {
      // 🔸 Dragón de emergencia si no hay datos
      window.dragon1 = {
        name: "Dragón Perdido",
        nivel: 1, exp: 0,
        vida: 50, vidaMax: 50,
        mordisco: 5, aliento: 5,
        armadura: 5, velocidad: 5,
        rareza: "Común", activo: true
      };
      window.dragonesJugador = [window.dragon1];
      console.error("🚨 No se encontraron dragones; creado temporal.");
    }
  }
}
// ==========================================================
// 🔹 Corrección automática tras cargar partida (dragones activos)
// ==========================================================
if (window.__FROM_SAVEGAME__ && (!window.dragon1 || !window.dragon1.nivel)) {
  const activos = Array.isArray(window.dragonesJugador)
    ? window.dragonesJugador.filter(d => d.activo)
    : [];

  if (activos.length > 0) {
    window.dragon1 = activos[0];
    window.dragon2 = activos[1] || null;
    console.log("🐉 Dragones activos restaurados:", activos.map(d => d.name));
  } else if (window.dragonesJugador?.length > 0) {
    // fallback: usar el primero de la colección si ninguno está activo
    window.dragon1 = window.dragonesJugador[0];
    window.dragon2 = null;
    console.warn("⚠️ No había dragones activos; usando el primero de la colección:", window.dragon1.name);
  } else {
    console.error("🚨 No hay dragones disponibles al cargar partida");
  }
}
// 🐉 Asegurar que la mini del dragón activo está cargada
if (window.dragon1 && window.dragon1.mini) {
  const miniKey = window.dragon1.name + "_mini";
  if (!this.textures.exists(miniKey)) {
    this.load.image(miniKey, window.dragon1.mini);
  }
}

// 🖼️ Si no estaba cargada aún, asegurar que se aplica la textura correcta al jugador
this.textures.once(Phaser.Textures.Events.ADD, () => {
  if (this.jugador && window.dragon1) {
    this.jugador.setTexture(window.dragon1.name + "_mini");
  }
});

// ==========================================================
// 🧩 Reforzar regeneración de misiones normales tras carga
// ==========================================================
if (window.__FROM_SAVEGAME__ && typeof window.MISIONES === "object") {
  const numMisiones = Array.isArray(window.MISIONES) ? window.MISIONES.length : 0;
  if (numMisiones === 0) {
    console.warn("⚠️ [SceneWorld] MISIONES vacío tras carga. Regenerando...");
    if (typeof generarMisiones === "function") {
      try {
        window.MISIONES = generarMisiones();
        console.log("✅ [SceneWorld] MISIONES regenerado:", window.MISIONES.length, "misiones disponibles.");
      } catch (err) {
        console.error("💥 [SceneWorld] Error al regenerar MISIONES:", err);
      }
    } else {
      console.warn("⚠️ [SceneWorld] generarMisiones() no encontrado en misiones.js");
    }
  } else {
    console.log("🧩 [SceneWorld] MISIONES ya contenía", numMisiones, "entradas.");
  }
}
 // ♻️ Restaurar recompensa si existe en RUNTIME_STATE
  if (!window.recompensaPendiente && window.__RUNTIME_STATE?.recompensaPendiente) {
    window.recompensaPendiente = window.__RUNTIME_STATE.recompensaPendiente;
    console.log("♻️ RecompensaPendiente restaurada desde RUNTIME_STATE:", window.recompensaPendiente);
  } // 👈 ESTA LLAVE FALTABA

  console.log("🌍 SceneWorld creada. tacticsEvents?", typeof window.tacticsEvents);
  console.log("🌍 RecompensaPendiente al crear:", window.recompensaPendiente);
// Referencia global a la escena actual
window.sceneWorld = this;

     // 🔧 OJO ESTA ES EXPERIMENTAL Asegurar que dragon1 tiene vidaMax, numAlientosInicial, etc.
  if (typeof normalizarDragon === "function" && dragon1) {
    normalizarDragon(dragon1);
  }
    
    const offsetX = 200; 
    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;

    this.worldLayer = this.add.layer(); 
    this.uiLayer    = this.add.layer(); 

    const bg = this.add.image(offsetX, 0, "world").setOrigin(0);
    this.worldLayer.add(bg);

    const worldW = bg.width;
    const worldH = bg.height;
// === ☁️ NUBES FIJAS SOBRE EL MAPA (dirección global, cambio suave y regeneración) ===
this.nubes = [];
const texturasNubes = ["nube1", "nube2", "nube3", "nube4", "nube5", "nube6", "nube7"];
const numNubes = Phaser.Math.Between(22, 30); // más nubes

// === Variables de control global de dirección ===
let direccionGlobal = Phaser.Math.FloatBetween(0, Math.PI * 2); // ángulo inicial en radianes
const cambiarDireccionCada = 180000; // 3 min

// Genera una nueva dirección global aleatoria cada X ms
this.time.addEvent({
  delay: cambiarDireccionCada,
  loop: true,
  callback: () => {
    direccionGlobal = Phaser.Math.FloatBetween(0, Math.PI * 2);
  }
});

// --- función para mover cada nube de forma continua ---
const moverNube = (nube) => {
  // velocidad base en píxeles/segundo
  const velocidad = Phaser.Math.FloatBetween(10, 25);

  // calculamos componentes x,y según el ángulo global
  const vx = Math.cos(direccionGlobal) * velocidad;
  const vy = Math.sin(direccionGlobal) * velocidad;

  nube.x += vx * (this.game.loop.delta / 1000);
  nube.y += vy * (this.game.loop.delta / 1000);

  // si sale del mapa por cualquier borde → reaparece por el opuesto
  if (nube.x < -300) nube.x = worldW + 300;
  if (nube.x > worldW + 300) nube.x = -300;
  if (nube.y < -200) nube.y = worldH + 200;
  if (nube.y > worldH + 200) nube.y = -200;
};

// --- crear las nubes ---
for (let i = 0; i < numNubes; i++) {
  const tex = Phaser.Utils.Array.GetRandom(texturasNubes);
  const x = Phaser.Math.Between(200, worldW - 200);
  const y = Phaser.Math.Between(100, worldH / 2);
  const escala = Phaser.Math.FloatBetween(0.8, 1.5);
  const alpha = Phaser.Math.FloatBetween(0.8, 0.95);

  const nube = this.add.image(x, y, tex)
    .setScale(escala)
    .setAlpha(alpha)
    .setDepth(25);

  this.worldLayer.add(nube);
  this.nubes.push(nube);
}

// --- actualizador en el update principal ---
this.events.on("update", () => {
  for (const nube of this.nubes) moverNube(nube);
});
// FIN NUBES
    this.cameras.main.setBounds(offsetX, 0, worldW, worldH);
    this.physics.world.setBounds(offsetX, 0, worldW, worldH);

    // ===== POSICIÓN DEL JUGADOR =====
let spawnX, spawnY, zoom;

// 1) Retorno desde islas
if(window.retornoIsla){
  this.pendingRetorno = window.retornoIsla;
  window.retornoIsla = null;
}

// 2) Teleports → usan mapCol/mapRow
if(typeof window.mapCol === "number" && typeof window.mapRow === "number"){
  spawnX = window.mapCol;
  spawnY = window.mapRow;
  zoom   = 1.8;
}
// 3) Posición guardada en worldPos
else if(window.worldPos){
  spawnX = window.worldPos.x;
  spawnY = window.worldPos.y;
  zoom   = window.worldPos.zoom || 1.8;
}
// 4) Default center
else {
  spawnX = offsetX + worldW/2;
  spawnY = worldH/2;
  zoom   = 1.8;
}
// 🚀 Teleport directo a ciudad
if(window.teleportDestino){
  const ciudad = this.ciudades?.find(c=>c.id === window.teleportDestino);
  if(ciudad){
    spawnX = ciudad.x;
    spawnY = ciudad.y + 100; // lo pone debajo del icono
  }
  window.teleportDestino = null;
}
    // Fallback por si no hay mini del dragón
    let miniKey = (dragon1 && dragon1.name) ? dragon1.name + "_mini" : null;
    if (!miniKey || !this.textures.exists(miniKey)) {
      if (!this.textures.exists("jugador_fallback")) {
        this.textures.addBase64("jugador_fallback",
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAMAAAC67D+PAAAAUVBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////8l5u3rAAAAGHRSTlMA+v0QG1o6bq7k8fX7+Pj5/f3s7vCqjYpQ8dK1NwAAADZJREFUGNNjYGBgZGJiYGBkA2RkAEMTAwMDIwMjAwQZGBgYGBgI4GQYJgRBEQyGgYJgBqgA0gNQjQGQAAhxoAl0f5hP0AAAAASUVORK5CYII="
        );
      }
      miniKey = "jugador_fallback";
    }

    this.jugador = this.physics.add.image(spawnX, spawnY, miniKey).setScale(0.6);
    this.jugador.setCollideWorldBounds(true);
    this.jugador.body.setAllowGravity(false);
    this.worldLayer.add(this.jugador);

    this.cameras.main.startFollow(this.jugador, true, 0.15, 0.15);
    this.cameras.main.setBackgroundColor("#000");
    this.cameras.main.setZoom(zoom);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,E");
    this.velBase = 100;

// ===== ISLAS DESDE IslaWorld =====

// 🧭 Restaurar o generar seed del mundo
if (!window.seedWorld) {
  if (window.__RUNTIME_STATE?.seedWorld) {
    window.seedWorld = window.__RUNTIME_STATE.seedWorld;
    console.log("🧭 Seed restaurada desde __RUNTIME_STATE:", window.seedWorld);
  } else {
    window.seedWorld = Math.random().toString(36).substring(2, 10);
    if (!window.__RUNTIME_STATE) window.__RUNTIME_STATE = {};
    window.__RUNTIME_STATE.seedWorld = window.seedWorld;
    console.log("🧭 Nueva seed generada:", window.seedWorld);
  }
}

// ⚙️ Comprobación de caché (no regenerar si ya tenemos cacheIslas válida)
if (
  window.__RUNTIME_STATE?.cacheIslas &&
  Array.isArray(window.__RUNTIME_STATE.cacheIslas) &&
  window.__RUNTIME_STATE.cacheIslas.length > 0
) {
  console.log("♻️ Reutilizando mapa existente con seed:", window.seedWorld);
} else {
  console.log("🌍 No hay caché válida, generando nuevo mapa...");
  IslaWorld.init({ w: worldW, h: worldH, offsetX }, window.seedWorld);
}

// === Generar lista de islas para render ===
let islands = IslaWorld.list();


// ✅ Filtrado más permisivo: mantiene casi todas las islas visibles
let filtered = [];

const spawnXc = offsetX + worldW / 2;
const spawnYc = worldH / 2;
const noSpawnRadius = 100;   // solo evita 150px del centro (más razonable)
const minDist = 180;          // reduce separación mínima entre iconos

islands.forEach(isla => {
  // 🔹 Siempre incluir legendarias
  if (
    isla.bioma === "frozencrown" || isla.islandId === "frozencrown" ||
    isla.bioma === "scorchia"    || isla.islandId === "scorchia"    ||
    isla.bioma === "jadeisland"  || isla.islandId === "jadeisland"  ||
    isla.bioma === "stormcloud"  || isla.islandId === "stormcloud"  ||
    isla.bioma === "hellfire"    || isla.islandId === "hellfire"
  ) {
    filtered.push(isla);
    return;
  }

  // 🚫 Evita solo un pequeño círculo en el centro
  if (Phaser.Math.Distance.Between(isla.x, isla.y, spawnXc, spawnYc) < noSpawnRadius) return;

  // ⚖️ Permite más proximidad entre islas
  const tooClose = filtered.some(p =>
    Phaser.Math.Distance.Between(isla.x, isla.y, p.x, p.y) < minDist
  );
  if (tooClose) return;

  filtered.push(isla);
});

islands = filtered;
console.log(`✅ Islas renderizadas: ${islands.length} / ${IslaWorld.list().length}`);




    this.eventIcons = [];
    const iconForBiome = {
  volcan: "volcanICON",
  jungle: "jungleICON",
  helado: "heladoICON",
  cuevadragon: "cuevadragonICON",
  desert: "desertICON",
  pantano: "pantanoICON",
  pradera: "praderaICON",
  // nuevos
  volante2: "volante2ICON",
  desert4:  "desert4ICON",
  forest:   "forestICON",
  
  // 🔥 legendarias
  frozencrown: "frozencrownICON",
  scorchia: "scorchiaICON",  
  jadeisland: "jadeislandICON",
  stormcloud: "stormcloudICON",
  hellfire:   "hellfireICON"

  
};

    islands.forEach(isla=>{
      const textureKey = iconForBiome[isla.bioma] || "jungleICON";
      const icon = this.physics.add.image(isla.x, isla.y, textureKey)
        .setScale(0.2).setInteractive().setDepth(10);

      const txt = this.add.text(isla.x, isla.y+35, isla.nombre, {
  fontSize: "16px",
  fill: "#fff",
  fontFamily: "'Cinzel Decorative', serif",
   padding: { left: 6, right: 6, top: 3, bottom: 3 }
}).setOrigin(0.5, 0).setDepth(11);

// ⚔️ Colisión más precisa (solo si está muy cerca del centro)
this.physics.add.overlap(this.jugador, icon, () => {
  // Distancia real entre jugador e icono
  const dist = Phaser.Math.Distance.Between(this.jugador.x, this.jugador.y, icon.x, icon.y);

  // Solo entra si está muy cerca del centro (ajustable)
  const radioEntrada = 40; // 🔸 cuanto menor, más preciso (30–50 ideal)

  if (dist <= radioEntrada) {
    window.islaSeleccionada = { id: isla.islandId, tipo: isla.bioma };
    window.retornoIsla = isla.islandId;
    window.worldPos = { x: this.jugador.x, y: this.jugador.y, zoom: this.cameras.main.zoom };
    this.scene.start("SceneMapa");
  }
}, null, this);

      this.eventIcons.push({icon,txt,id:isla.islandId});
      this.worldLayer.add(icon); this.worldLayer.add(txt);

      if (window.islasCompletadas && window.islasCompletadas.includes(String(isla.islandId))) {
        const check = this.add.text(isla.x, isla.y - 30, "✔", {
          fontSize: "40px", fontFamily: "'Cinzel Decorative', serif",fontStyle: "bold", color: "#00bfff"
        }).setOrigin(0.5).setDepth(20);
        this.worldLayer.add(check);
      }
    });

// === MONOLITOS GLOBALES (aparecen en el WORLD directamente) ===
this.monolitos = [];
const monolitos = IslaWorld.listMonolitos();
console.log("Texturas cargadas:", this.textures.list);
monolitos.forEach(m => {
 const key =
  m.color === "rojo"   ? "monolitorojo"  :
  m.color === "verde"  ? "monolitoverde" :
  m.color === "azul"   ? "monolitoazul"  :
  m.color === "dorado" ? "monolitodorado" :
  "monolitorojo"; // valor por defecto de seguridad

  const icon = this.physics.add.image(m.x, m.y, key)
    .setScale(0.3)
    .setInteractive()
    .setDepth(13);

  // 🔒 Si ya está completado, aplicar un tinte o transparencia
  if (m.completado) {
    icon.setTint(0x555555);
    icon.setAlpha(0.6);
  }

  const txt = this.add.text(m.x, m.y + 40, `Monolito ${m.color}`, {
    fontSize: "14px",
    fontFamily: "'Cinzel Decorative', serif",
    fill: "#fff",
    backgroundColor: "#00000088",
    padding: { left: 4, right: 4, top: 2, bottom: 2 }
  }).setOrigin(0.5, 0).setDepth(16);

  this.worldLayer.add(icon);
  this.worldLayer.add(txt);

  this.physics.add.overlap(this.jugador, icon, () => {
  if (m.completado) return; // no hacer nada si ya está hecho

  // Distancia precisa
  const dist = Phaser.Math.Distance.Between(this.jugador.x, this.jugador.y, icon.x, icon.y);
  const radioEntrada = 45;
  if (dist > radioEntrada) return;

  // Evita repetir prompt si ya está activo
  if (this.promptMonolitoActivo) return;
  this.promptMonolitoActivo = true;

  // 🧱 Mostrar cuadro de confirmación
  const overlay = this.add.rectangle(600, 300, 900, 300, 0x000000, 0.8).setDepth(3000);
  const texto = this.add.text(600, 250, `¿Deseas activar el Monolito ${m.color.toUpperCase()}?`, {
    fontSize: "26px",
    fill: "#ffd700",
    fontFamily: "'Cinzel Decorative', serif",
    align: "center",
    wordWrap: { width: 800 }
  }).setOrigin(0.5).setDepth(3001);

  const btnSi = this.add.text(500, 340, "✅ SÍ", {
    fontSize: "24px",
     fontFamily: "'Cinzel Decorative', serif",
    fill: "#00ff00",
    backgroundColor: "#333",
    padding: { left: 20, right: 20, top: 10, bottom: 10 }
  }).setOrigin(0.5).setInteractive().setDepth(3001);

  const btnNo = this.add.text(700, 340, "❌ NO", {
    fontSize: "24px",
     fontFamily: "'Cinzel Decorative', serif",
    fill: "#ff5555",
    backgroundColor: "#333",
    padding: { left: 20, right: 20, top: 10, bottom: 10 }
  }).setOrigin(0.5).setInteractive().setDepth(3001);

  // 👉 Acción "NO": cierra el prompt
  const cerrarPrompt = () => {
    overlay.destroy();
    texto.destroy();
    btnSi.destroy();
    btnNo.destroy();
    this.promptMonolitoActivo = false;
  };
  btnNo.on("pointerdown", cerrarPrompt);

  // 👉 Acción "SÍ": entra al monolito
  btnSi.on("pointerdown", () => {
    cerrarPrompt();

    console.log(`🧱 Entrando al Monolito ${m.id} (${m.color})`);

    // Guarda posición para volver después
    window.worldPos = { x: this.jugador.x, y: this.jugador.y, zoom: this.cameras.main.zoom };

    // Pasa opciones al táctico con el ID concreto de este monolito
    const opts = { monolitoId: m.id };
    if (m.color === "rojo")  opts.monolitoRojo  = true;
    if (m.color === "verde") opts.monolitoVerde = true;
    if (m.color === "azul")  opts.monolitoAzul  = true;
    if (m.color === "dorado") opts.monolitoDorado = true; // 💛 NUEVO MONOLITO DORADO

    if (typeof window.lanzarTacticoDesdeMundo === "function") {
      window.lanzarTacticoDesdeMundo(this, opts);
    }
  });

}, null, this);

  this.monolitos.push({ icon, txt, data: m });
});

// === 🔵 DEBUG: puntos de monolitos en el minimapa ===
if (this.minimapContainer && Array.isArray(monolitos)) {
  monolitos.forEach(m => {
    const px = (m.x - this.physics.world.bounds.x) * this.escalaMiniX;
    const py = (m.y - this.physics.world.bounds.y) * this.escalaMiniY;

    const dot = this.add.graphics();

   // 🎨 Color según tipo de monolito
if (m.color === "rojo") {
  dot.fillStyle(0xff3333, 1);     // 🔴 Rojo
} else if (m.color === "verde") {
  dot.fillStyle(0x33ff33, 1);     // 🟢 Verde
} else if (m.color === "azul") {
  dot.fillStyle(0x3399ff, 1);     // 🔵 Azul
} else if (m.color === "dorado") {
  dot.fillStyle(0xffd700, 1);     // 💛 Dorado (nuevo)
} else {
  dot.fillStyle(0xffffff, 1);     // Blanco por defecto
}

    // Dibuja un pequeño cuadrado
    dot.fillRect(px - 3, py - 3, 6, 6);
    dot.setDepth(2500);

    // Añadir al minimapa
    this.minimapContainer.add(dot);
  });
  console.log("🧭 Puntos de monolitos dibujados en minimapa:", monolitos.length);
}


    // ===== CIUDADES FIJAS =====
    this.ciudades = [];
    this.ciudadLabels = [];

    // Luminaria
    const cxLum = offsetX + Math.floor(worldW/2) + 1080;
    const cyLum = Math.floor(worldH/2) + 620;
    const iconLum = this.add.image(cxLum, cyLum, "luminariaICON").setScale(0.25).setInteractive().setDepth(12);
    const txtLum = this.add.text(cxLum, cyLum+40, "Ciudad de Luminaria", {
      fontSize: "16px", fill: "#ffd700", backgroundColor: "#000000aa", fontFamily: "'Cinzel Decorative', serif",
      padding:{left:4,right:4,top:2,bottom:2}
    }).setOrigin(0.5,0).setDepth(13);
    this.worldLayer.add(iconLum); this.worldLayer.add(txtLum);
    this.ciudades.push({ id:"luminaria", x:cxLum, y:cyLum, icon:iconLum, nombre:"Ciudad de Luminaria" });
    this.ciudadLabels.push(txtLum);

    // Silvanost
    const cxSil = offsetX + Math.floor(worldW/2) -500;
    const cySil = Math.floor(worldH/2) -250;
    const iconSil = this.add.image(cxSil, cySil, "silvanostICON").setScale(0.25).setInteractive().setDepth(12);
    const txtSil = this.add.text(cxSil, cySil+40, "Ciudad de Silvanost", {
      fontSize: "16px", fill: "#90ee90", backgroundColor: "#000000aa", fontFamily: "'Cinzel Decorative', serif",
      padding:{left:4,right:4,top:2,bottom:2}
    }).setOrigin(0.5,0).setDepth(13);
    this.worldLayer.add(iconSil); this.worldLayer.add(txtSil);
    this.ciudades.push({ id:"silvanost", x:cxSil, y:cySil, icon:iconSil, nombre:"Ciudad de Silvanost" });
    this.ciudadLabels.push(txtSil);

    // Harruni
    const cxHar = offsetX + Math.floor(worldW/2) -1680;
    const cyHar = Math.floor(worldH/2) +150;
    const iconHar = this.add.image(cxHar, cyHar, "harruniICON").setScale(0.25).setInteractive().setDepth(12);
    const txtHar = this.add.text(cxHar, cyHar+40, "Ciudad de Harruni", {
      fontSize: "16px", fill: "#ff8800", backgroundColor: "#000000aa", fontFamily: "'Cinzel Decorative', serif",
      padding:{left:4,right:4,top:2,bottom:2}
    }).setOrigin(0.5,0).setDepth(13);
    this.worldLayer.add(iconHar); this.worldLayer.add(txtHar);
    this.ciudades.push({ id:"harruni", x:cxHar, y:cyHar, icon:iconHar, nombre:"Ciudad de Harruni" });
    this.ciudadLabels.push(txtHar);

    // Frostgaard
    const cxFro = offsetX + Math.floor(worldW/2) +580;
    const cyFro = Math.floor(worldH/2) -850;
    const iconFro = this.add.image(cxFro, cyFro, "frostgaardICON").setScale(0.25).setInteractive().setDepth(12);
    const txtFro = this.add.text(cxFro, cyFro+40, "Ciudad de Frostgaard", {
      fontSize: "16px", fill: "#66ccff", backgroundColor: "#000000aa", fontFamily: "'Cinzel Decorative', serif",
      padding:{left:4,right:4,top:2,bottom:2}
    }).setOrigin(0.5,0).setDepth(13);
    this.worldLayer.add(iconFro); this.worldLayer.add(txtFro);
    this.ciudades.push({ id:"frostgaard", x:cxFro, y:cyFro, icon:iconFro, nombre:"Ciudad de Frostgaard" });
    this.ciudadLabels.push(txtFro);

    // Tooltip / prompt
    this.promptCiudad = this.add.text(0, 0, "Pulsa E para entrar", {
      fontSize: "16px", fill: "#fff", backgroundColor: "#000000cc", fontFamily: "'Cinzel Decorative', serif",
      padding:{left:8,right:8,top:4,bottom:4}
    }).setDepth(3000).setScrollFactor(0).setVisible(false);
    this.uiLayer.add(this.promptCiudad);

    this.ciudades.forEach(c=>{
      c.icon.on("pointerdown", ()=>{
        const d = Phaser.Math.Distance.Between(this.jugador.x, this.jugador.y, c.x, c.y);
        if (d <= 80){
          window.ciudadSeleccionada = c.id;
          window.worldPos = { x:this.jugador.x, y:this.jugador.y, zoom:this.cameras.main.zoom };
          
          window.ultimaEscena = "SceneWorld";
          if (window.storyMode) window.storyMode.trigger("enterCity");
        this.scene.start("SceneCiudad");
        }
      });
    });

    // ===== RETORNO DESDE ISLAS =====
    if (this.pendingRetorno !== null && this.pendingRetorno !== undefined) {
      const target = this.eventIcons.find(e => e.id === this.pendingRetorno);
      if (target && target.icon) {
        const nx = target.icon.x;
        const ny = target.icon.y + 100;
        this.jugador.setPosition(nx, ny);
        this.cameras.main.centerOn(nx, ny);
        window.worldPos = { x: nx, y: ny, zoom: this.cameras.main.zoom };
      }
      this.pendingRetorno = null;
    }

    // ===== FRANJA UI =====
    const franja = this.add.rectangle(0, 0, offsetX, H, 0x000000, 0.75).setOrigin(0); 
    franja.setScrollFactor(0);
    franja.setDepth(900);
    this.uiLayer.add(franja);




this.hud = crearHUD(this);
    if (this.updateHUD) this.updateHUD();

    // ===== BOTONES UI =====
   // ===== BOTÓN CAMPAMENTO (ahora abre ColecciónPoblado) =====
this.btnPoblado = this.add.text(W - 40, 40, "🏕️ Campamento", {
  fontSize: "18px",
   fontFamily: "'Cinzel Decorative', serif",
  fill: "#fff",
  backgroundColor: "#333",
  padding: { left: 10, right: 10, top: 5, bottom: 5 }
})
.setOrigin(1, 0)
.setInteractive()
.setScrollFactor(0)
.setDepth(1200);

this.uiLayer.add(this.btnPoblado);

this.btnPoblado
  .on("pointerover", () => {
    this.btnPoblado.setStyle({ backgroundColor: "#555", fill: "#ffd700" });
  })
  .on("pointerout", () => {
    this.btnPoblado.setStyle({ backgroundColor: "#333", fill: "#fff" });
  })
  .on("pointerdown", () => {
    // 💾 Guardar posición actual antes de salir
    window.worldPos = {
      x: this.jugador.x,
      y: this.jugador.y,
      zoom: this.cameras.main.zoom
    };

    // 📍 Registrar de dónde venimos
    window.origenColeccion = "SceneWorld";
    window.ultimaEscena = "SceneWorld";

    // 🚪 Ir a la escena de colección en poblado
    this.scene.start("SceneColeccionPoblado");
  });

   
    this.btnInventario = this.add.text(W - 40, 80, "🎒 Inventario", {
      fontSize: "18px", fontFamily: "'Cinzel Decorative', serif", fill: "#fff", backgroundColor: "#333", fontFamily: "'Cinzel Decorative', serif",
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(1, 0).setInteractive().setScrollFactor(0).setDepth(1200);
    this.uiLayer.add(this.btnInventario);
    this.btnInventario.on("pointerover", () => { this.btnInventario.setStyle({ backgroundColor: "#555", fill: "#ffd700" }); });
    this.btnInventario.on("pointerout", () => { this.btnInventario.setStyle({ backgroundColor: "#333", fill: "#fff" }); });
    this.btnInventario.on("pointerdown", () => {
      window.origenInventario = "SceneWorld";
      window.worldPos = { x:this.jugador.x, y:this.jugador.y, zoom:this.cameras.main.zoom };
      this.scene.start("SceneInventario");
    });
// ===== BOTÓN MISIONES =====
this.btnMisiones = this.add.text(W - 40, 120, "📜 Misiones", {
  fontSize: "18px",
   fontFamily: "'Cinzel Decorative', serif",
  fill: "#fff",
  backgroundColor: "#333",
  padding: { left: 10, right: 10, top: 5, bottom: 5 }
})
.setOrigin(1, 0)
.setInteractive()
.setScrollFactor(0)
.setDepth(1200);

this.uiLayer.add(this.btnMisiones);

this.btnMisiones
  .on("pointerover", () => {
    this.btnMisiones.setStyle({ backgroundColor: "#555", fill: "#ffd700" });
  })
  .on("pointerout", () => {
    this.btnMisiones.setStyle({ backgroundColor: "#333", fill: "#fff" });
  })
  .on("pointerdown", () => {
    // 💾 Guardar posición actual antes de salir
    if (this.jugador && this.cameras?.main) {
      window.worldPos = { 
        x: this.jugador.x, 
        y: this.jugador.y, 
        zoom: this.cameras.main.zoom 
      };
    }

    window.ultimaEscena = "SceneWorld";
    this.scene.start("SceneMisionesActivas", { ciudad: null });
  });
// === BOTÓN: Eventos completados ===
const btnEventos = this.add.text(W - 40, 180, "📜 Eventos", {
  fontSize: "18px",
  fontFamily: "'Cinzel Decorative', serif",
  fill: "#fff",
  backgroundColor: "#333",
  padding: { left: 10, right: 10, top: 6, bottom: 6 }
})
.setOrigin(1, 0.5)
.setInteractive()
.setScrollFactor(0)     // ✅ ← Esta línea fija el botón a la cámara de interfaz
.setDepth(1200);

btnEventos.on("pointerover", () => btnEventos.setStyle({ backgroundColor: "#555", fill: "#ffd700" }));
btnEventos.on("pointerout",  () => btnEventos.setStyle({ backgroundColor: "#333", fill: "#fff" }));
btnEventos.on("pointerdown", () => {
  console.log("📜 Abriendo EventosCompletados. __RUNTIME_STATE actual:", window.__RUNTIME_STATE);
  this.scene.start("SceneEventosCompletados");
});

// ✅ Añadir el botón al layer de interfaz para que se mueva contigo
this.uiLayer.add(btnEventos);

    // ===== CÁMARAS UI =====
    this.cameras.main.ignore(this.uiLayer);
    this.uiCam = this.cameras.add(0, 0, W, H);
    this.uiCam.setScroll(0, 0);
    this.uiCam.setZoom(1);
    this.uiCam.ignore(this.worldLayer);

    // ===== MINIMAPA =====
    const miniW = 200;       // ancho fijo
    const miniH = miniW / 2; // proporción 2:1 igual que el mapa

this.minimapContainer = this.add.container(offsetX - miniW - 10, H - miniH - 20)
  .setScrollFactor(0)
  .setDepth(2000);    const miniMapImage = this.add.image(0, 0, "world").setOrigin(0, 0).setDisplaySize(miniW, miniH);
    this.minimapContainer.add(miniMapImage);

    this.minimapPlayer = this.add.graphics();
    this.minimapPlayer.fillStyle(0x00ff00, 1);
    this.minimapPlayer.fillRect(0, 0, 6, 6);
    this.minimapContainer.add(this.minimapPlayer);

    this.escalaMiniX = miniW / this.physics.world.bounds.width;
    this.escalaMiniY = miniH / this.physics.world.bounds.height;

    // === CIUDADES EN EL MINIMAPA ===
    this.minimapCities = [];
    this.ciudades.forEach(c=>{
      const px = (c.x - this.physics.world.bounds.x) * this.escalaMiniX;
      const py = c.y * this.escalaMiniY;

      const cityDot = this.add.graphics();
      if(c.id === "luminaria"){
        cityDot.fillStyle(0xffff00, 1); // amarillo
      } else if(c.id === "silvanost"){
        cityDot.fillStyle(0x00ffcc, 1); // turquesa
      } else if(c.id === "harruni"){
        cityDot.fillStyle(0xff6600, 1); // naranja
      } else if(c.id === "frostgaard"){
        cityDot.fillStyle(0x66ccff, 1); // azul hielo
      }
      cityDot.fillRect(px-2, py-2, 4, 4);
      this.minimapContainer.add(cityDot);

      this.minimapCities.push({ id:c.id, dot:cityDot });
    });

   
    // Captura de teclado
    this.input.keyboard.addCapture(['W','A','S','D','UP','DOWN','LEFT','RIGHT','E']);
  
// === ICONOS DE ISLAS ESPECIALES EN EL MINIMAPA ===
const drawSpecialDot = (islandId, colorHex, size=6) => {
  const isla = islands.find(i => i.islandId === islandId);
  if (isla) {
    const px = (isla.x - this.physics.world.bounds.x) * this.escalaMiniX;
    const py = (isla.y - this.physics.world.bounds.y) * this.escalaMiniY;

    const dot = this.add.graphics();
    dot.fillStyle(colorHex, 1);
    dot.fillRect(px - size/2, py - size/2, size, size);
    this.minimapContainer.add(dot);
  }
};

// ❄️ Frozencrown
if (IslaWorld.isFrozencrownUnlocked && IslaWorld.isFrozencrownUnlocked()) {
  drawSpecialDot("frozencrown", 0x66ccff);
}

// 🔥 Scorchia
if (IslaWorld.isScorchiaUnlocked && IslaWorld.isScorchiaUnlocked()) {
  drawSpecialDot("scorchia", 0xff4500);
}

// 🌿 Jadeisland
if (IslaWorld.isJadeislandUnlocked && IslaWorld.isJadeislandUnlocked()) {
  drawSpecialDot("jadeisland", 0x00ff66);
}
// ⚡ Stormcloud
if (IslaWorld.isStormcloudUnlocked && IslaWorld.isStormcloudUnlocked()) {
  drawSpecialDot("stormcloud", 0xccccff);
}
// 🔥 Hellfire
if (IslaWorld.isHellfireUnlocked && IslaWorld.isHellfireUnlocked()) {
  drawSpecialDot("hellfire", 0xff3300);
}


  // 🔸 POPUP DE ISLAS LEGENDARIAS DESBLOQUEADAS (centrado en pantalla)
if (window.mensajePendienteWorld) {
  const tipo = window.mensajePendienteWorld;
  let texto = "";

  if (tipo === "frozencrown") {
    texto = "❄️ ¡Has desbloqueado la isla legendaria: Frozencrown!";
  } else if (tipo === "scorchia") {
    texto = "🔥 ¡Has desbloqueado la isla ardiente: Scorchia!";
  } else if (tipo === "jadeisland") {
    texto = "🌿 ¡Has desbloqueado la isla mística: Jadeisland!";
  } else if (tipo === "stormcloud") {
    texto = "⚡ ¡Has desbloqueado la isla tormentosa: Stormcloud!";
  } else if (tipo === "hellfire") {
    texto = "🔥 ¡Has desbloqueado la isla infernal: Hellfire!";
  }

  // 🧭 Centramos en base a resolución actual
  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;
  const cx = W / 2;
  const cy = H / 2;

  // 🪟 Overlay semitransparente centrado
  const overlay = this.add.rectangle(cx, cy, W * 0.9, H * 0.6, 0x000000, 0.7).setDepth(500);

  // ✨ Texto principal centrado
  const msg = this.add.text(cx, cy - 50, texto, {
    fontSize: "28px",
    fontFamily: "'Cinzel Decorative', serif",
    fill: "#ffd700",
    align: "center",
    wordWrap: { width: W * 0.8 }
  }).setOrigin(0.5).setDepth(501);

  // ✅ Botón OK centrado bajo el texto
  const btnOk = this.add.text(cx, cy + 80, "✅ OK", {
    fontSize: "26px",
    fontFamily: "'Cinzel Decorative', serif",
    fill: "#00ff00",
    backgroundColor: "#333",
    padding: { left: 20, right: 20, top: 10, bottom: 10 }
  }).setOrigin(0.5).setInteractive().setDepth(501);

  btnOk.on("pointerdown", () => {
    overlay.destroy();
    msg.destroy();
    btnOk.destroy();

    console.log("🔥 [SceneWorld] Desbloqueo legendaria confirmado — sin regenerar mapa");
    window.mensajePendienteWorld = null;

    // 🔄 Redibuja el punto en el minimapa si corresponde
    const drawSpecialDot = (id, color) => {
      const isla = IslaWorld.list().find(i => i.islandId === id);
      if (!isla) return;
      const px = (isla.x - this.physics.world.bounds.x) * this.escalaMiniX;
      const py = (isla.y - this.physics.world.bounds.y) * this.escalaMiniY;
      const dot = this.add.graphics();
      dot.fillStyle(color, 1);
      dot.fillRect(px - 3, py - 3, 6, 6);
      this.minimapContainer.add(dot);
    };

    if (tipo === "frozencrown") drawSpecialDot("frozencrown", 0x66ccff);
    if (tipo === "scorchia")    drawSpecialDot("scorchia", 0xff4500);
    if (tipo === "jadeisland")  drawSpecialDot("jadeisland", 0x00ff66);
    if (tipo === "stormcloud")  drawSpecialDot("stormcloud", 0xccccff);
    if (tipo === "hellfire")    drawSpecialDot("hellfire", 0xff3300);
  });
}
 // === RECOMPENSA PENDIENTE TRAS COMBATE MONOLITO ===
if (window.recompensaPendiente && typeof window.tacticsEvents !== "undefined") {
  console.log("🏆 Detectada recompensa pendiente, mostrando popup...");
  const data = window.recompensaPendiente;

  this.time.delayedCall(800, () => {
    // 🔹 Forzar campos mínimos para evitar nulos
    data.islaId = data.islaId || (window.islaSeleccionada?.id ?? "world-debug");
    data.eventoId = data.eventoId || data.monolitoId || "debug-evento";
    data.monolitoId = data.monolitoId || data.eventoId || "debug-monolito";

    console.log("📦 Mostrando popup con datos:", data);

    // Mostrar popup de victoria con recompensas
    tacticsEvents.mostrarRecompensaMonolito(this, data);
   // ✅ STORYMODE: marcar misión de monolito completada
    if (window.storyMode && typeof window.storyMode.trigger === "function") {
      const tipo = (data.tipo || "").toLowerCase();
      if (tipo === "monolitoverde")  storyMode.trigger("winMonolitoVerde");
      if (tipo === "monolitorojo")   storyMode.trigger("winMonolitoRojo");
      if (tipo === "monolitoazul")   storyMode.trigger("winMonolitoAzul");
      if (tipo === "monolitodorado") storyMode.trigger("winMonolitoDorado");
    }
    // 🔹 Marcar monolito completado si aplica
    if (data.monolitoId && typeof IslaWorld !== "undefined") {
      IslaWorld.marcarMonolitoCompletado(data.monolitoId);
    }

    // 🔹 Limpiar variable para evitar repetición
    window.recompensaPendiente = null;
    if (window.__RUNTIME_STATE) delete window.__RUNTIME_STATE.recompensaPendiente;
  });
}
// 🌊 Variables para animación de flotación mínima
this.flotacionOffset = 0;
this.flotacionTween = null;


/***** =========================
 * HUD DE HUEVOS INCUBANDO
 * ========================== */
if (Array.isArray(window.huevosIncubando) && window.huevosIncubando.length > 0) {

  // 🟩 Grupo de HUD (centrado arriba)
  this.hudHuevos = this.add.container(this.sys.game.config.width / 2, 60).setDepth(999);
this.uiLayer.add(this.hudHuevos);
  const renderHUDHuevos = () => {
    this.hudHuevos.removeAll(true); // limpia los elementos previos

    // 🔹 Mostrar todos los huevos, incluso los de 0 días
    const activos = window.huevosIncubando;
    const separacion = 120;
    const startX = -((activos.length - 1) * separacion) / 2;

    activos.forEach((huevo, i) => {
      const x = startX + i * separacion;
      const y = 0;
      const iconKey = huevo.key || `huevo${huevo.tipo.toLowerCase()}`;

      const icon = this.add.image(x, y, iconKey)
        .setDisplaySize(60, 60)
        .setOrigin(0.5);

      // 🔸 Si ya eclosionó, ponemos brillo o efecto distinto
      if (huevo.diasRestantes === 0) {
        icon.setTint(0xffff99); // dorado suave
      }

      const textoEstado = (huevo.diasRestantes > 0)
        ? `${huevo.diasRestantes} días`
        : "Eclosionado";

      const txt = this.add.text(x, y + 45, textoEstado, {
        fontSize: "18px",
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 3,
        fontFamily: "'Cinzel Decorative', serif"
      }).setOrigin(0.5);

      // Animación pulso suave
      this.tweens.add({
        targets: icon,
        scale: { from: 0.9, to: 1.1 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      });

      this.hudHuevos.add([icon, txt]);
    });
  };

  // Render inicial
  renderHUDHuevos();

  // 🔄 Suscribir al calendario (actualiza sin reiniciar la escena)
  Calendario.onAvanzarDia(() => {
    if (!this.scene.isActive("SceneWorld")) return;
    renderHUDHuevos(); // solo repinta los textos/íconos
  });

  // 🔔 Detectar eclosión (mantiene el huevo en el HUD pero avisa una vez)
  const nacidos = window.huevosIncubando.filter(h => h.diasRestantes === 0 && !h.notificado);
  nacidos.forEach(huevo => {
    huevo.notificado = true; // evita repetir mensaje
    this.mostrarAvisoEclosion(huevo.tipo);
  });
}
/***** =========================
 * HUD DE MISIONES ACTIVAS (parte inferior, iconos pequeños)
 * ========================== */
if (Array.isArray(window.misionesPasivas)) {

  // 📦 Contenedor general del HUD
  this.hudMisiones = this.add.container(this.sys.game.config.width / 2, this.sys.game.config.height - 50)
    .setDepth(999);
this.uiLayer.add(this.hudMisiones);
  const renderHUDMisiones = () => {
    this.hudMisiones.removeAll(true);

    // Solo misiones en curso
    const activas = window.misionesPasivas.filter(m => m.estado === "En curso");
    if (activas.length === 0) return;

    const separacionX = 60;
    const startX = -((activas.length - 1) * separacionX) / 2;

    activas.forEach((m, i) => {
      const x = startX + i * separacionX;
      const y = 0;

      // Dragones asignados (1–3)
      const dragones = (m.dragonesAsignados && m.dragonesAsignados.length > 0)
        ? m.dragonesAsignados
        : (m.dragonId
          ? [(window.dragonesJugador || []).find(d => (d.__uid || "") === m.dragonId)]
          : []);

      const overlap = 12; // solapado leve entre minis
      const startSubX = -((dragones.length - 1) * overlap) / 2;

      dragones.forEach((d, idx) => {
        if (!d) return;
        const dx = startSubX + idx * overlap;
        const keyMini = d.name + "_mini";

        const icon = this.add.image(x + dx, y, keyMini)
          .setDisplaySize(30, 30)
          .setOrigin(0.5)
          .setAlpha(1);

        // sin efecto ni tween
        this.hudMisiones.add(icon);
      });

      // 🕒 Texto de días restantes
      const dias = m.diasRestantes ?? m.diasTotales ?? "?";
      const txtDias = this.add.text(x, y + 22, `${dias}`, {
        fontSize: "10px",
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 2,
        fontFamily: "'Cinzel Decorative', serif"
      }).setOrigin(0.5);

      this.hudMisiones.add(txtDias);
    });
  };

  // render inicial
  renderHUDMisiones();

  // actualizar cada día del calendario
  if (typeof Calendario?.onAvanzarDia === "function") {
    Calendario.onAvanzarDia(() => {
      if (this.scene.isActive("SceneWorld")) renderHUDMisiones();
    });
  }
}


// ✅ Restaurar posición del jugador si venimos de un SaveGame
if (window.__FROM_SAVEGAME__ && window.worldPos && this.jugador) {
  const { x, y, zoom } = window.worldPos;
  this.jugador.setPosition(x, y);
  this.cameras.main.centerOn(x, y);
  this.cameras.main.setZoom(zoom || 1.8);
  console.log(`📍 Posición restaurada desde savegame: (${x}, ${y})`);
  window.__FROM_SAVEGAME__ = false; // solo la primera vez
}


// === BOTÓN: Reiniciar Monolitos ===
const btnReiniciarMonos = this.add.text(W - 60, 780, "♻️ Reiniciar Monolitos", {
  fontSize: "18px",
  fontFamily: "'Cinzel Decorative', serif",
  fill: "#fff",
  backgroundColor: "#333",
  padding: { left: 10, right: 10, top: 6, bottom: 6 }
})
.setOrigin(1, 0)
.setInteractive()
.setScrollFactor(0)
.setDepth(1200);

btnReiniciarMonos.on("pointerover", () => btnReiniciarMonos.setStyle({ backgroundColor: "#555", fill: "#ffd700" }));
btnReiniciarMonos.on("pointerout",  () => btnReiniciarMonos.setStyle({ backgroundColor: "#333", fill: "#fff" }));

btnReiniciarMonos.on("pointerdown", () => {
  // 🧱 Eliminar monolitos actuales
  if (this.monolitos && this.monolitos.length > 0) {
    this.monolitos.forEach(m => {
      m.icon.destroy();
      m.txt.destroy();
    });
    this.monolitos = [];
  }

  // ⚙️ Regenerar usando el método global del runtime
  if (typeof IslaWorld !== "undefined" && typeof IslaWorld.init === "function") {
    const bounds = window.__RUNTIME_STATE?._lastWorldBounds || {
      w: this.physics.world.bounds.width,
      h: this.physics.world.bounds.height,
      offsetX: 200
    };

    const nuevos = IslaWorld.buildMonolitosGlobales
      ? IslaWorld.buildMonolitosGlobales(bounds)
      : (window.__RUNTIME_STATE.monolitosGlobalesTodos = []);

    window.__RUNTIME_STATE.monolitosGlobalesTodos = nuevos;
    console.log("♻️ Monolitos regenerados:", nuevos.length);

    // 🔁 Volver a dibujar y añadir interacción
    nuevos.forEach(m => {
      const key =
        m.color === "rojo"   ? "monolitorojo"  :
        m.color === "verde"  ? "monolitoverde" :
        m.color === "azul"   ? "monolitoazul"  :
        m.color === "dorado" ? "monolitodorado" :
        "monolitorojo";

      const icon = this.physics.add.image(m.x, m.y, key)
        .setScale(0.3)
        .setInteractive()
        .setDepth(13);

      // 🔒 Si ya está completado, aplicar un tinte o transparencia
      if (m.completado) {
        icon.setTint(0x555555);
        icon.setAlpha(0.6);
      }

      const txt = this.add.text(m.x, m.y + 40, `Monolito ${m.color}`, {
        fontSize: "14px",
        fontFamily: "'Cinzel Decorative', serif",
        fill: "#fff",
        backgroundColor: "#00000088",
        padding: { left: 4, right: 4, top: 2, bottom: 2 }
      }).setOrigin(0.5, 0).setDepth(16);

      this.worldLayer.add(icon);
      this.worldLayer.add(txt);

      // 🧩 Añadir interacción y overlap
      this.physics.add.overlap(this.jugador, icon, () => {
        if (m.completado) return;

        const dist = Phaser.Math.Distance.Between(this.jugador.x, this.jugador.y, icon.x, icon.y);
        const radioEntrada = 45;
        if (dist > radioEntrada) return;
        if (this.promptMonolitoActivo) return;
        this.promptMonolitoActivo = true;

        const overlay = this.add.rectangle(600, 300, 900, 300, 0x000000, 0.8).setDepth(3000);
        const texto = this.add.text(600, 250, `¿Deseas activar el Monolito ${m.color.toUpperCase()}?`, {
          fontSize: "26px",
          fill: "#ffd700",
          fontFamily: "'Cinzel Decorative', serif",
          align: "center",
          wordWrap: { width: 800 }
        }).setOrigin(0.5).setDepth(3001);

        const btnSi = this.add.text(500, 340, "✅ SÍ", {
          fontSize: "24px",
          fontFamily: "'Cinzel Decorative', serif",
          fill: "#00ff00",
          backgroundColor: "#333",
          padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive().setDepth(3001);

        const btnNo = this.add.text(700, 340, "❌ NO", {
          fontSize: "24px",
          fontFamily: "'Cinzel Decorative', serif",
          fill: "#ff5555",
          backgroundColor: "#333",
          padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive().setDepth(3001);

        const cerrarPrompt = () => {
          overlay.destroy();
          texto.destroy();
          btnSi.destroy();
          btnNo.destroy();
          this.promptMonolitoActivo = false;
        };
        btnNo.on("pointerdown", cerrarPrompt);

        btnSi.on("pointerdown", () => {
          cerrarPrompt();
          console.log(`🧱 Entrando al Monolito ${m.id} (${m.color})`);

          window.worldPos = { x: this.jugador.x, y: this.jugador.y, zoom: this.cameras.main.zoom };

          const opts = { monolitoId: m.id };
          if (m.color === "rojo")  opts.monolitoRojo  = true;
          if (m.color === "verde") opts.monolitoVerde = true;
          if (m.color === "azul")  opts.monolitoAzul  = true;
          if (m.color === "dorado") opts.monolitoDorado = true;

          if (typeof window.lanzarTacticoDesdeMundo === "function") {
            window.lanzarTacticoDesdeMundo(this, opts);
          }
        });
      }, null, this);

      this.monolitos.push({ icon, txt, data: m });
    });

    // ✅ Mensaje visual de confirmación
    const overlay = this.add.rectangle(600, 300, 800, 200, 0x000000, 0.7).setDepth(4000);
    const msg = this.add.text(600, 300, "✅ Monolitos regenerados correctamente", {
      fontSize: "24px",
      fill: "#00ff00",
      fontFamily: "'Cinzel Decorative', serif"
    }).setOrigin(0.5).setDepth(4001);
    this.time.delayedCall(2000, () => { overlay.destroy(); msg.destroy(); });
  }
});

this.uiLayer.add(btnReiniciarMonos);



// === BOTÓN: Regenerar Islas ===
const btnRegenIslas = this.add.text(W - 300, 740, "🔄 Regenerar Islas", {
  fontSize: "20px",
  fill: "#fff",
  backgroundColor: "#333",
  padding: { left: 10, right: 10, top: 5, bottom: 5 },
  borderRadius: 8,
  fontFamily: "'Cinzel Decorative', serif"
})
  .setInteractive({ useHandCursor: true })
  .setScrollFactor(0)
  .setDepth(999)
  .on("pointerover", () => btnRegenIslas.setStyle({ fill: "#ffd700" }))
  .on("pointerout",  () => btnRegenIslas.setStyle({ fill: "#fff" }))
  .on("pointerdown", () => {
    if (!confirm("¿Regenerar islas normales? Las completadas permanecerán intactas.")) return;

    console.log("🌍 Regenerando nuevas islas normales (manteniendo completadas)");

    const RUNTIME = window.__RUNTIME_STATE || {};
    const bounds = RUNTIME._lastWorldBounds || { w: 3000, h: 1800, offsetX: 0 };
    const existentes = IslaWorld.list(); // mantenemos todas, incluso completas
    const nuevas = [];

    const biomasNormales = [
      "volcan","jungle","helado","cuevadragon","desert",
      "pantano","pradera","volante2","desert4","forest"
    ];
    const rng = Math.random;
    const seleccionadas = Phaser.Utils.Array.Shuffle(biomasNormales).slice(0, 4); // 4 nuevas islas

    seleccionadas.forEach((bioma, idx) => {
      const nueva = genIsla(`regen_${Date.now()}_${idx}`, rng, bounds, bioma, existentes);
      nuevas.push(nueva);
      existentes.push(nueva);

      const iconKey = `${bioma}ICON`;
      const icon = this.physics.add.image(nueva.x, nueva.y, iconKey)
        .setScale(0.2).setInteractive().setDepth(10);

      const txt = this.add.text(nueva.x, nueva.y + 35, nueva.nombre, {
        fontSize: "16px",
        fill: "#fff",
        fontFamily: "'Cinzel Decorative', serif'"
      }).setOrigin(0.5, 0).setDepth(11);

      this.worldLayer.add(icon);
      this.worldLayer.add(txt);

      if (!this.eventIcons) this.eventIcons = [];
      this.eventIcons.push({ icon, txt, id: nueva.islandId });
    });

    console.log(`✅ ${nuevas.length} nuevas islas agregadas sin eliminar las anteriores.`);

    // Pequeño aviso visual
    const aviso = this.add.text(W / 2, 100, "🌍 Nuevas islas generadas", {
      fontSize: "28px",
      fill: "#ffd700",
      fontFamily: "'Cinzel Decorative', serif",
      backgroundColor: "#000000aa",
      padding: { left: 15, right: 15, top: 8, bottom: 8 }
    }).setOrigin(0.5).setDepth(2000);
    this.time.delayedCall(3000, () => aviso.destroy());
  });

this.uiLayer.add(btnRegenIslas);


  } // ← cierra create()




/***** =========================
 * AVISO DE ECLOSIÓN
 * ========================== */
mostrarAvisoEclosion(tipo) {
  const msg = this.add.text(this.sys.game.config.width / 2, 100, 
    `🐣 ¡Ha nacido un huevo de ${tipo}!`,
    {
      fontSize: "28px",
      fontFamily: "'Cinzel Decorative', serif",
      fill: "#ffd700",
      stroke: "#000",
      strokeThickness: 4,
      fontFamily: "'Cinzel Decorative', serif"
    }
  ).setOrigin(0.5).setDepth(2000);

  this.tweens.add({
    targets: msg,
    alpha: { from: 1, to: 0 },
    y: 50,
    duration: 4000,
    onComplete: () => msg.destroy()
  });
}
  update(){
    if(!this.jugador) return;
    let vx = 0, vy = 0;
    const left  = this.cursors.left.isDown  || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up    = this.cursors.up.isDown    || this.keys.W.isDown;
    const down  = this.cursors.down.isDown  || this.keys.S.isDown;

    if(left)  vx -= 1;
    if(right) vx += 1;
    if(up)    vy -= 1;
    if(down)  vy += 1;
// 🌊 Controlar animación de flotación (según dirección)
if (vx !== 0 || vy !== 0) {
  const esVertical = Math.abs(vy) > Math.abs(vx);
  const nuevaDireccion = esVertical ? "horizontal" : "vertical";

  if (!this.flotacionTween || this.flotacionTween.direccion !== nuevaDireccion) {
    // Si la dirección cambia, detenemos el tween actual
    if (this.flotacionTween) {
      this.flotacionTween.stop();
      this.flotacionTween = null;
    }

    // Reiniciamos el offset
    this.flotacionOffset = 0;

    // Crear tween en la dirección adecuada
    this.flotacionTween = this.tweens.add({
      targets: this,
      flotacionOffset: { from: -8, to: 8 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.flotacionTween.direccion = nuevaDireccion;
  }
} else {
  if (this.flotacionTween) {
    this.flotacionTween.stop();
    this.flotacionTween = null;
    this.flotacionOffset = 0;
  }
}
    if(vx || vy){
      const len = Math.hypot(vx, vy);
      vx = (vx/len) * this.velBase;
      vy = (vy/len) * this.velBase;
    }

    this.jugador.setVelocity(vx, vy);
    if(vx !== 0) this.jugador.setFlipX(vx < 0);
// Aplicar desplazamiento visual sin tocar la física
this.jugador.y += this.flotacionOffset * this.game.loop.delta / 1000;
    const px = (this.jugador.x - this.physics.world.bounds.x) * this.escalaMiniX;
    const py = this.jugador.y * this.escalaMiniY;
    this.minimapPlayer.setPosition(px, py);

    // ===== Proximidad a ciudades =====
    let showPrompt = false;
    let promptX = 0, promptY = 0;

    for (const c of this.ciudades){
      const d = Phaser.Math.Distance.Between(this.jugador.x, this.jugador.y, c.x, c.y);
      if (d <= 80){
        showPrompt = true;
        const cam = this.cameras.main;
        promptX = (c.x - cam.worldView.x);
        promptY = (c.y - cam.worldView.y) - 40;
        if (Phaser.Input.Keyboard.JustDown(this.keys.E)){
          window.ciudadSeleccionada = c.id;
          window.worldPos = { x:this.jugador.x, y:this.jugador.y, zoom:this.cameras.main.zoom };
          window.ultimaEscena = "SceneWorld";
this.scene.start("SceneCiudad");
          
          return;
        }
        break;
      }
    }

    if (showPrompt){
      this.promptCiudad.setPosition(promptX, promptY).setVisible(true);
    } else {
      this.promptCiudad.setVisible(false);
    }// 🕒 Calendario: avanzar un día cada X píxeles recorridos
if (typeof Calendario !== "undefined" && this.jugador) {
  if (!this.lastCalendarPos) {
    this.lastCalendarPos = { x: this.jugador.x, y: this.jugador.y };
    this.distanciaAcumulada = 0;
  }

  const dx = this.jugador.x - this.lastCalendarPos.x;
  const dy = this.jugador.y - this.lastCalendarPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  this.distanciaAcumulada += dist;
  this.lastCalendarPos = { x: this.jugador.x, y: this.jugador.y };

  // 🔹 Cada 400 píxeles recorridos = 1 día (ajusta a gusto)
  const PIXELES_POR_DIA = 400;

  while (this.distanciaAcumulada >= PIXELES_POR_DIA) {
    Calendario.avanzar();
    this.distanciaAcumulada -= PIXELES_POR_DIA;
  }
}
  }
  
}

