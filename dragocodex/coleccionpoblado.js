/***** =========================
 * ESCENA COLECCIÓN (curar +15, tomos +100 XP, activar, exportar/apodo/liberar; ficha popup; volver según origen)
 * Usa window.inventarioJugador (array de {nombre, cantidad}) como fuente de verdad
 * ========================== */
class SceneColeccionPoblado extends Phaser.Scene {
  constructor(){ super("SceneColeccionPoblado"); }

  preload(){
    // Cargar minis e imágenes grandes si existen
    if(window.dragonesJugador){
      window.dragonesJugador.forEach(d=>{
        if(d.mini && !this.textures.exists(d.name+"_mini")){
          this.load.image(d.name+"_mini", d.mini);
        }
        if(d.img && !this.textures.exists(d.name+"_img")){
          this.load.image(d.name+"_img", d.img);
        }
      });
    }

    // Iconos necesarios
    if(!this.textures.exists("curacionMini")){
      this.load.image("curacionMini","assets/inventario/Curacion.png");
    }
    if(!this.textures.exists("iconoTomo")){
      this.load.image("iconoTomo","assets/inventario/tomo.png");
    }
    if(!this.textures.exists("iconoLiberar")){
      this.load.image("iconoLiberar","assets/coleccion/liberacionMini.png");
    }
    if(!this.textures.exists("iconoNombre")){
      this.load.image("iconoNombre","assets/coleccion/nombre.png");
    }
    if(!this.textures.exists("iconoExportar")){
      this.load.image("iconoExportar","assets/iconos/alientomini.png");
    }
  }

  create(){
  // Inventario tipo lista (mismo formato que SceneInventario)
  if(!Array.isArray(window.inventarioJugador)) window.inventarioJugador = [];

  const { width: W, height: H } = this.sys.game.config;

  // 🏰 Título
  this.add.text(W / 2, H * 0.08, "🏰 Cueva de Dragones", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"32px", fill:"#ffd700", fontStyle:"bold"
  }).setOrigin(0.5);

  // Contenedor con scroll
  this.scrollGroup = this.add.container(W * 0.1, H * 0.18);
  this.scrollY = window.scrollColeccion || 0;
  this.scrollGroup.y = H * 0.18 + this.scrollY;

  // Guardar referencias a “chapitas” para refrescarlas tras consumir
  this.badgesCuras = [];
  this.badgesTomos = [];

  if(!window.dragonesJugador || window.dragonesJugador.length === 0){
    this.scrollGroup.add(
      this.add.text(W / 2, H / 2, "No tienes dragones aún.", {
        fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#fff"
      }).setOrigin(0.5)
    );
  } else {

    // 🔹 Dividir dragones en activos e inactivos
    const activos = window.dragonesJugador.filter(d => d.activo);
    const inactivos = window.dragonesJugador.filter(d => !d.activo);

    // 🔹 Orden común: Nivel DESC > Rareza > Tier
    const prioridadRareza = { "Común":1, "Raro":2, "Épico":3, "Legendario":4 };
    const prioridadTier = { "B":1, "A":2, "S":3 };

    function ordenarLista(lista){
      lista.sort((a,b)=>{
        if(b.nivel !== a.nivel) return b.nivel - a.nivel;
        const rA = prioridadRareza[a.rareza] || 0;
        const rB = prioridadRareza[b.rareza] || 0;
        if(rB !== rA) return rB - rA;
        const tA = prioridadTier[a.tier] || 0;
        const tB = prioridadTier[b.tier] || 0;
        return tB - tA;
      });
    }

    ordenarLista(activos);
    ordenarLista(inactivos);

   // 🔹 Coordenadas base (ajustadas visualmente)
const baseY = 60;       // antes 0 → bajamos todo el bloque
const colLeftX = 200;   // ligera corrección horizontal
const colRightX = 760;  // más a la derecha para espaciar
const separacionY = 90; // mantiene la altura entre dragones

    // 🔹 Títulos de columnas
    this.scrollGroup.add(this.add.text(colLeftX, baseY - 40, "🐲 Dragones Activos", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#0f0", fontStyle:"bold"
    }).setOrigin(0.5));

    this.scrollGroup.add(this.add.text(colRightX, baseY - 40, "💤 Dragones Inactivos", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#ccc", fontStyle:"bold"
    }).setOrigin(0.5));

    // 🔹 Función de renderizado común (columna)
    const renderColumna = (lista, xBase, esActivo) => {
      let y = baseY;
      lista.forEach((d, idx) => {
        const miniKey = d.name + "_mini";
        if(d.activo === undefined) d.activo = esActivo;

        // Color por rareza
        let colorRareza = "#aaa";
        if(d.rareza==="Raro") colorRareza="#00bfff";
        if(d.rareza==="Épico") colorRareza="#bf00ff";
        if(d.rareza==="Legendario") colorRareza="#ffd700";

        // Marco y mini
        const marco = this.add.rectangle(xBase-40, y, 70, 70, 0x000000, 0.4)
          .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(colorRareza).color);

        const mini = this.add.image(xBase-40,y,miniKey).setScale(0.5).setInteractive();
        mini.on("pointerdown",()=>{ this.mostrarFichaDragon(d); });
        // 🕐 Si el dragón está en misión pasiva, mostrar icono de reloj encima
if (d.enMisionPasiva) {
  const relojTxt = this.add.text(xBase - 40, y, "⏳", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "28px",
    fill: "#ffd700",
    stroke: "#000",
    strokeThickness: 3
  }).setOrigin(0.5).setDepth(1000);
  this.scrollGroup.add(relojTxt);
}

        // Textos
        const mostrado = d.apodo ? `${d.apodo} (${d.name})` : d.name;
        const nameTxt = this.add.text(xBase+5,y-10,`${mostrado} [${d.rareza || "Común"}]`,{
          fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px",fill:colorRareza
        }).setOrigin(0,0.5);

        const vidaTxt = this.add.text(xBase+5,y+10,`❤️ ${d.vida}/${d.vidaMax}`,{
          fontFamily: "'Cinzel Decorative', serif",
fontSize:"14px",fill:"#0f0"
        }).setOrigin(0,0.5);

        let xpNecesaria = roleplay.expNecesaria(d.nivel);
        const xpTxt = this.add.text(xBase+5,y+30,
          `⭐ Nivel ${d.nivel} | XP ${d.exp}/${xpNecesaria}`,{
            fontFamily: "'Cinzel Decorative', serif",
fontSize:"14px", fill:"#ffd700"
        }).setOrigin(0,0.5);

        /********* BOTONES *********/

        // 💊 Curar (full)
        const btnCurar = this.add.image(xBase+230,y,"curacionMini").setScale(0.5).setInteractive();
        const badgeCuras = this.add.text(btnCurar.x+12, btnCurar.y+12, this.getCantidadInv("Materiales de curación"), {
          fontFamily: "'Cinzel Decorative', serif",
fontSize:"12px", fill:"#fff", backgroundColor:"#000000aa"
        }).setOrigin(0.5);
        this.badgesCuras.push(badgeCuras);

        btnCurar.on("pointerdown",()=>{
          if(d.vida >= d.vidaMax){
            this.mostrarAviso("Este dragón ya está a tope de vida");
            return;
          }
          if(this.getCantidadInv("Materiales de curación") <= 0){
            this.mostrarAviso("No tienes materiales de curación");
            return;
          }
          this.consumirItem("Materiales de curación", 1);
          d.vida = Math.min(d.vida + 1000, d.vidaMax);
          vidaTxt.setText(`❤️ ${d.vida}/${d.vidaMax}`);
          this.actualizarBadges();
        });

        // 📖 Tomo (+250 XP)
        const btnTomo = this.add.image(xBase+270,y,"iconoTomo").setScale(0.5).setInteractive();
        const badgeTomos = this.add.text(btnTomo.x+12, btnTomo.y+12, this.getCantidadInv("Tomo de técnicas de entrenamiento de dragones"), {
        fontFamily: "'Cinzel Decorative', serif",
        fontSize:"12px", fill:"#fff", backgroundColor:"#000000aa"
        }).setOrigin(0.5);
        this.badgesTomos.push(badgeTomos);

        btnTomo.on("pointerdown",()=>{
          if(this.getCantidadInv("Tomo de técnicas de entrenamiento de dragones") <= 0){
            this.mostrarAviso("No tienes tomos disponibles");
            return;
          }
          this.consumirItem("Tomo de técnicas de entrenamiento de dragones", 1);

          roleplay.addXP(d, 250, this, ()=>{
            let need = roleplay.expNecesaria(d.nivel);
            xpTxt.setText(`⭐ Nivel ${d.nivel} | XP ${d.exp}/${need}`);
            vidaTxt.setText(`❤️ ${d.vida}/${d.vidaMax}`);
            this.actualizarBadges();
            this.mostrarAviso(`${mostrado} ganó +100 PX`);
            roleplay.procesarColaSubidas(this);
          });
        });

        // ⭐ Activar/Reserva
        const btnActivo = this.add.text(xBase+310,y, d.activo ? "⭐" : "☆",{
          fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px",fill:d.activo?"#0f0":"#aaa",backgroundColor:"#222"
        }).setOrigin(0.5).setInteractive();

       btnActivo.on("pointerdown", () => {
  // 🚫 No permitir activar si está en misión pasiva
  if (d.enMisionPasiva) {
    this.mostrarAviso(`${d.apodo || d.name} está en una misión pasiva ⏳`);
    return;
  }

  if (d.activo) {
    d.activo = false;
    btnActivo.setText("☆").setFill("#aaa");
    this.scene.restart(); // recargar para reordenar
  } else {
    const activosNow = window.dragonesJugador.filter(dd => dd.activo);
    if (activosNow.length >= 3) {
      this.mostrarAviso("Máximo 3 dragones activos");
      return;
    }
    d.activo = true;
    btnActivo.setText("⭐").setFill("#0f0");
    this.scene.restart(); // recargar para reflejar cambio
  }
});

        // 🔤 Apodo
        const btnApodo = this.add.image(xBase+350,y,"iconoNombre").setScale(0.5).setInteractive();
        btnApodo.on("pointerdown",()=>{ this.mostrarPopupApodo(d); });

        // 🕊️ Liberar
        const btnLiberar = this.add.image(xBase+390,y,"iconoLiberar").setScale(0.5).setInteractive();
        btnLiberar.on("pointerdown",()=>{ this.mostrarConfirmacionLiberar(d, idx); });

        // 📤 Exportar
        const btnExportar = this.add.image(xBase+430,y,"iconoExportar").setScale(0.5).setInteractive();
        btnExportar.on("pointerdown",()=>{ this.exportarDragon(d); });
// 🔹 Terminar misión pasiva (solo si está en misión)
if (d.enMisionPasiva) {
  const btnTerminar = this.add.text(xBase + 470, y, "🛑 Terminar misión", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "14px",
    fill: "#fff",
    backgroundColor: "#880000",
    padding: { left: 6, right: 6, top: 4, bottom: 4 }
  }).setOrigin(0.5).setInteractive();

  btnTerminar.on("pointerover", () => {
    btnTerminar.setStyle({ backgroundColor: "#aa0000" });
  });
  btnTerminar.on("pointerout", () => {
    btnTerminar.setStyle({ backgroundColor: "#880000" });
  });

  btnTerminar.on("pointerdown", () => {
    const nombre = d.apodo || d.name;
    if (confirm(`¿Terminar la misión pasiva de ${nombre}?`)) {

      // Buscar y eliminar misión pasiva asociada
      if (Array.isArray(window.misionesPasivas)) {
        const antes = window.misionesPasivas.length;
        window.misionesPasivas = window.misionesPasivas.filter(m => {
          if (!Array.isArray(m.dragonesAsignados)) return true;
          const pertenece = m.dragonesAsignados.some(md => md && (md.__uid === d.__uid || md.name === d.name));
          return !pertenece; // elimina la misión si estaba dentro
        });
        const despues = window.misionesPasivas.length;
        console.log(`🧭 Misiones canceladas: ${antes - despues}`);
      }

     // 🐉 Liberar dragón REAL del roster (mantiene todas las stats)
const real = (window.dragonesJugador || []).find(
  x => 
    (x.__uid && d.__uid && x.__uid === d.__uid) ||
    (x.name && d.name && x.name === d.name) ||
    (x.apodo && d.apodo && x.apodo === d.apodo)
);

if (real) {
  real.busy = false;
  real.enMisionPasiva = false;
  real.activo = false;
  console.log(`✅ Liberado dragón real: ${real.apodo || real.name}`);
} else {
  console.warn(`⚠️ No se encontró el dragón real en roster: ${d.apodo || d.name}`);
}

      this.mostrarAviso(`Misión de ${nombre} terminada`);
      this.time.delayedCall(800, () => this.scene.restart());
    }
  });

  this.scrollGroup.add(btnTerminar);
}
        // Separador
        const linea = this.add.rectangle(xBase+150, y+40, 360, 1, 0x555555, 0.3).setOrigin(0.5);

        this.scrollGroup.add([
          marco, mini, nameTxt, vidaTxt, xpTxt,
          btnCurar, badgeCuras, btnTomo, badgeTomos,
          btnActivo, btnApodo, btnLiberar, btnExportar, linea
        ]);

        y += separacionY;
      });
    };

    // 🔹 Renderizar ambas columnas
    renderColumna(activos, colLeftX, true);
    renderColumna(inactivos, colRightX, false);
  }

  // 🔙 Botón Volver
  const btnVolver = this.add.text(W / 2, H * 0.92, "⬅ Volver", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px",fill:"#fff",backgroundColor:"#444",
    padding:{left:12,right:12,top:6,bottom:6}
  }).setOrigin(0.5).setInteractive();

  btnVolver.on("pointerdown",()=>{
    window.scrollColeccion = this.scrollY;
    this.scene.start(window.ultimaEscena || "ScenePoblado"); 
  });

// === Scroll con máscara para que no se salga del área visible ===

// 🧭 Área visible del scroll
const maskTop = H * 0.18;      // justo debajo del título
const maskHeight = H * 0.65;   // altura visible hasta justo encima del botón Volver
const maskWidth = W * 0.8;     // centrado visualmente

// 🟦 Capa de recorte (invisible, solo para la máscara)
const maskShape = this.add.rectangle(W / 2, maskTop + maskHeight / 2, maskWidth, maskHeight, 0x000000, 0)
  .setOrigin(0.5)
  .setDepth(100);

// ✂️ Crear y aplicar máscara
const mask = maskShape.createGeometryMask();
this.scrollGroup.setMask(mask);

// === Scroll con rueda (controla desplazamiento) ===
const maxScroll = Math.max(0, (this.scrollGroup.list.length * 25) - maskHeight);
this.scrollGroup.y = maskTop;

this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY) => {
  this.scrollY -= deltaY * 0.5;

  const topLimit = maskTop;
  const bottomLimit = maskTop - maxScroll;
  if (this.scrollY > topLimit) this.scrollY = topLimit;
  if (this.scrollY < bottomLimit) this.scrollY = bottomLimit;

  this.scrollGroup.y = this.scrollY;
});

}


  // === Utilidades de inventarioJugador ===
  getCantidadInv(nombre){
    if(!Array.isArray(window.inventarioJugador)) return 0;
    const item = window.inventarioJugador.find(it=>it && it.nombre === nombre);
    return item ? (item.cantidad||0) : 0;
  }

  consumirItem(nombre, n=1){
    if(!Array.isArray(window.inventarioJugador)) return false;
    const item = window.inventarioJugador.find(it=>it && it.nombre === nombre);
    if(!item || (item.cantidad||0) < n) return false;
    item.cantidad -= n;
    if(item.cantidad <= 0){
      const idx = window.inventarioJugador.indexOf(item);
      if(idx>=0) window.inventarioJugador.splice(idx,1);
    }
    return true;
  }

  actualizarBadges(){
    const cur = this.getCantidadInv("Materiales de curación");
    const tm  = this.getCantidadInv("Tomo de técnicas de entrenamiento de dragones");
    this.badgesCuras.forEach(b => b.setText(cur));
    this.badgesTomos.forEach(b => b.setText(tm));
  }

  // === Popup ficha dragón ===
 mostrarFichaDragon(d) {
  const { width: W, height: H } = this.sys.game.config;

  // 🔳 Fondo translúcido a toda pantalla
  const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
    .setDepth(400)
    .setInteractive();

  // 🔲 Caja principal centrada
  const caja = this.add.rectangle(W / 2, H / 2, 950, 620, 0x111111, 0.92)
    .setStrokeStyle(3, 0xffffff)
    .setDepth(401)
    .setInteractive();

  // 🔍 Buscar datos base en el array global
  const baseData = window.dragones?.find(dr => dr.name === d.name);
  const tipoBase = baseData?.tipo || "Desconocido";
  const claseBase = baseData?.clase || "Sin clase";

  // 🎨 Colores por tipo
  const colorTipo = {
    Fuego: "#ff6b6b",
    Agua: "#4db8ff",
    Trueno: "#f9d71c",
    Roca: "#c49a6c",
    Misterio: "#c17aff",
    Striker: "#00ffaa"
  }[tipoBase] || "#ffffff";

  // 🎨 Color por rareza
  let colorRareza = "#aaaaaa";
  if (d.rareza === "Raro") colorRareza = "#00bfff";
  if (d.rareza === "Épico") colorRareza = "#bf00ff";
  if (d.rareza === "Legendario") colorRareza = "#ffd700";

  // 🖼️ Imagen principal (NO la mini)
  const marcoImg = this.add.rectangle(W / 2 - 260, H / 2 + 20, 380, 380, 0x000000, 0.4)
    .setStrokeStyle(5, Phaser.Display.Color.HexStringToColor(colorRareza).color)
    .setDepth(402);

  const keyImg = d.name + "_img"; // usa la imagen grande
  const img = this.add.image(W / 2 - 260, H / 2 + 20, keyImg)
    .setScale(0.95)
    .setDepth(403);

  // 🏷️ Nombre grande y centrado arriba
  const mostrado = d.apodo ? `${d.apodo} (${d.name})` : d.name;
  this.add.text(W / 2, H / 2 - 260, mostrado, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "42px",
    fill: "#ffd700",
    fontStyle: "bold"
  }).setOrigin(0.5).setDepth(404);

  // 🌈 Tipo y clase — más espacio vertical
  this.add.text(W / 2, H / 2 - 200, `🌈 ${tipoBase}   🎭 ${claseBase}`, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "30px",
    fill: colorTipo,
    fontStyle: "bold"
  }).setOrigin(0.5).setDepth(404);

  // 📈 Stats del dragón
  const xpNecesaria = roleplay.expNecesaria(d.nivel || 1);
  const alientos = calcularAlientosPorNivel(d);

  const ficha = [
    `⭐ Nivel: ${d.nivel || 1}`,
    `📅 XP: ${d.exp || 0}/${xpNecesaria}`,
    "",
    `❤️ Vida: ${d.vida}/${d.vidaMax}`,
    `🗡️ Mordisco: ${d.mordisco}`,
    `🔥 Aliento: ${d.aliento}`,
    `🛡️ Armadura: ${d.armadura}`,
    `💨 Velocidad: ${d.velocidad}`,
    `🌬️ Alientos disponibles: ${alientos}`
  ].join("\n");

  this.add.text(W / 2 + 150, H / 2 - 110, ficha, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "22px",
    fill: "#ffffff",
    align: "left",
    lineSpacing: 10
  }).setOrigin(0, 0).setDepth(404);

  // 🔘 Botón cerrar grande y centrado
  const btnCerrar = this.add.text(W / 2, H / 2 + 265, "❌ CERRAR", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "26px",
    fill: "#fff",
    backgroundColor: "#333",
    padding: { left: 24, right: 24, top: 12, bottom: 12 }
  }).setOrigin(0.5).setInteractive().setDepth(405);

  btnCerrar.on("pointerdown", () => {
    overlay.destroy();
    caja.destroy();
    marcoImg.destroy();
    img.destroy();
    btnCerrar.destroy();
    this.children.list
      .filter(o => o.depth >= 404)
      .forEach(o => o.destroy());
  });

  btnCerrar.on("pointerover", () => btnCerrar.setStyle({ backgroundColor: "#555", fill: "#ffd700" }));
  btnCerrar.on("pointerout", () => btnCerrar.setStyle({ backgroundColor: "#333", fill: "#fff" }));
}


  mostrarConfirmacionLiberar(dragon) {
  const nombre = dragon.apodo || dragon.name;
  if (!confirm(`¿Liberar a ${nombre}? Esta acción no se puede deshacer.`)) return;

  // ✅ Buscar el dragón exacto dentro del roster global
  if (Array.isArray(window.dragonesJugador)) {
    const antes = window.dragonesJugador.length;

    window.dragonesJugador = window.dragonesJugador.filter(dReal => {
      // compara por __uid si existe, o por nombre/apodo
      if (dragon.__uid && dReal.__uid) return dReal.__uid !== dragon.__uid;
      return !(
        (dReal.name === dragon.name) ||
        (dReal.apodo && dragon.apodo && dReal.apodo === dragon.apodo)
      );
    });

    const despues = window.dragonesJugador.length;
    console.log(`🕊️ Liberados: ${antes - despues}`);
  }

  // 🧹 Refrescar la escena
  this.mostrarAviso(`${nombre} ha sido liberado 🕊️`);
  this.time.delayedCall(600, () => this.scene.restart());
}


  mostrarPopupApodo(dragon){
    const nuevo = prompt("Apodo para el dragón:", dragon.apodo||"");
    if(nuevo!==null){
      dragon.apodo = nuevo.trim();
      this.scene.restart();
    }
  }

  exportarDragon(d){
    const dataDragon = {
      name: d.name,
      apodo: d.apodo || null,
      rareza: d.rareza || "Común",
      nivel: d.nivel || 1,
      exp: d.exp || 0,
      vida: d.vida,
      vidaMax: d.vidaMax,
      mordisco: d.mordisco,
      aliento: d.aliento,
      armadura: d.armadura,
      velocidad: d.velocidad,
      numAlientos: d.numAlientos,
      activo: d.activo || false
    };
    const jsonStr = JSON.stringify(dataDragon, null, 2);
    const blob = new Blob([jsonStr], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (d.apodo||d.name)+".json";
    a.click();
    URL.revokeObjectURL(url);
  }

  mostrarAviso(msg){
    const aviso = this.add.text(400,300,msg,{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px",fill:"#f55",backgroundColor:"#000000dd",
      padding:{left:10,right:10,top:6,bottom:6}
    }).setOrigin(0.5).setDepth(500);
    this.tweens.add({
      targets: aviso, alpha:0, y:260, duration:1200,
      onComplete: ()=>aviso.destroy()
    });
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
