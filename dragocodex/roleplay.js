/***** =========================
 * ROLEPLAY: experiencia, niveles y mejora de stats 
 * ========================== */

const roleplay = {
  maxNivel: 30,

  colaSubidas: [],
  subidaEnCurso: false, // 🔒 Candado para que no se abran varias ventanas a la vez

  // Curva de experiencia
  expNecesaria(nivel){
    if (nivel <= 1) return 80;
    if (nivel <= 9){
      return 100 + (nivel-1) * 40; 
    }
    if (nivel <= 19){
      return 500 + (nivel-10) * 120; 
    }
    return 1700 + (nivel-20) * 250; 
  },

  // XP por victoria
  calcularXP(ganador, derrotado){
    const nivelDerrotado = Math.max(1, derrotado?.nivel || 1);
    let xp = 30 * nivelDerrotado; 
    if ((ganador?.nivel || 1) < 8) {
      xp = Math.floor(xp * 1.5); 
    }
    return Math.max(50, xp); 
  },

  // Repartir XP entre todos los dragones activos (incluidos KO) de forma igualitaria
  repartirXP(ganador, derrotado, scene){
    let xpTotal = this.calcularXP(ganador, derrotado);

    // Todos los dragones activos del jugador (los que estaban en combate)
    let combatientes = window.dragonesJugador
      ? window.dragonesJugador.filter(d => d.activo)
      : [];

    // Si no hay combatientes → XP solo para el ganador
    if(combatientes.length === 0){
      this.addXP(ganador, xpTotal, scene);
      this.mostrarResumenXP(scene, [{ dragon: ganador, xp: xpTotal }]);
      return [{ dragon: ganador, xp: xpTotal }];
    }

    // Dividir XP en partes iguales entre todos los dragones activos
    let xpPorDragon = Math.floor(xpTotal / combatientes.length);
    let resultados = [];

    combatientes.forEach(dragon=>{
      if(xpPorDragon > 0){
        this.addXP(dragon, xpPorDragon, scene);
        resultados.push({ dragon, xp: xpPorDragon });
      }
    });

    // 👉 Mostrar popup único al final
    this.mostrarResumenXP(scene, resultados);

    return resultados;
  },

  addXP(dragon, cantidad, scene, onFinish){
    dragon.exp = (dragon.exp || 0) + cantidad;
    dragon.nivel = dragon.nivel || 1;

    let expNecesaria = this.expNecesaria(dragon.nivel);

    while(dragon.exp >= expNecesaria && dragon.nivel < this.maxNivel){
      dragon.exp -= expNecesaria;
      dragon.nivel++;

      // Guardar en cola para procesar después
      this.colaSubidas.push(dragon);

      expNecesaria = this.expNecesaria(dragon.nivel);
    }

    dragon.vida = Math.min(dragon.vida, dragon.vidaMax);
    this.actualizarDragonColeccion(dragon);

    if(scene.text1){
      scene.text1.setText(`${dragon.name} Nv.${dragon.nivel}`);
    }
    if(scene.stats1){
      scene.stats1.setText(
        `🗡️ ${dragon.mordisco}  🔥 ${dragon.aliento}\n🛡️ ${dragon.armadura}  ⚡ ${dragon.velocidad}`
      );
    }
    if(scene.vidaText1){
      scene.vidaText1.setText(`${scene.vida1}/${dragon.vidaMax}`);
    }
    if(scene.updateHUD){
      scene.updateHUD();
    }

    if(onFinish){ onFinish(); }
  },

  // Procesa la cola de subidas de nivel en orden
  procesarColaSubidas(scene, onFinish){
    if(this.colaSubidas.length === 0){
      if(onFinish) onFinish();
      return;
    }

    // 🔒 Evitar que se abran varias ventanas a la vez
    if(this.subidaEnCurso) return;

    let dragon = this.colaSubidas.shift();
    this.subidaEnCurso = true;

    this.subirStatsElegir(dragon, scene, ()=>{
      this.subidaEnCurso = false; // liberar candado
      this.procesarColaSubidas(scene, onFinish);
    });
  },

  subirStatsElegir(dragon, scene, callback) {
  const { width: W, height: H } = scene.sys.game.config;

  const stats = ["vida", "mordisco", "aliento", "armadura", "velocidad"];
  const nombres = {
    vida: "❤️ Vida (+5)",
    mordisco: "🗡️ Mordisco",
    aliento: "🔥 Aliento",
    armadura: "🛡️ Armadura",
    velocidad: "💨 Velocidad"
  };

  // === Fondo oscuro centrado ===
  const overlay = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6)
    .setDepth(199).setInteractive();

  // === Popup centrado (proporcional) ===
  const popup = scene.add.rectangle(W / 2, H / 2, W * 0.45, H * 0.55, 0x111111, 0.95)
    .setStrokeStyle(3, 0xffffff)
    .setDepth(200);

  const titulo = scene.add.text(W / 2, H / 2 - H * 0.22,
    `¡${dragon.name} sube a nivel ${dragon.nivel}!`, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "28px",
      fill: "#ffd700",
      align: "center",
      fontStyle: "bold"
    })
    .setOrigin(0.5)
    .setDepth(201);

  const subtitulo = scene.add.text(W / 2, H / 2 - H * 0.17, "Reparte 2 mejoras:", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
    fill: "#ffffff"
  }).setOrigin(0.5).setDepth(201);

  // === Contador de puntos restantes ===
  this.puntosDisponibles = 2;
  this.historial = [];
  const txtRestantes = scene.add.text(W / 2, H / 2 - H * 0.12,
    `🧩 Puntos restantes: ${this.puntosDisponibles}`, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px",
      fill: "#00ffcc"
    })
    .setOrigin(0.5)
    .setDepth(201);

  const statTexts = {};
  const botones = {};
  let y = H / 2 - H * 0.07;

  const actualizarContador = () => {
    txtRestantes.setText(`🧩 Puntos restantes: ${this.puntosDisponibles}`);
    let color = "#00ffcc";
    if (this.puntosDisponibles === 1) color = "#ffff66";
    if (this.puntosDisponibles === 0) color = "#ff6666";
    txtRestantes.setColor(color);
  };

  const lanzarBrillo = () => {
    const estrellas = [];
    for (let i = 0; i < 12; i++) {
      const star = scene.add.star(
        W / 2 + Phaser.Math.Between(-150, 150),
        H / 2 + Phaser.Math.Between(-100, 100),
        5,
        5,
        10,
        0xffff99
      ).setAlpha(0).setDepth(210);
      estrellas.push(star);
      scene.tweens.add({
        targets: star,
        alpha: 1,
        scale: { from: 0.5, to: 1.2 },
        duration: 300,
        yoyo: true,
        delay: i * 50,
        onComplete: () => star.destroy()
      });
    }
  };

  // === Crear botones y textos por stat ===
  stats.forEach((s) => {
    statTexts[s] = scene.add.text(W / 2 - 100, y,
      `${nombres[s]}: ${s === "vida" ? dragon.vidaMax : dragon[s]}`, {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px",
        fill: "#fff"
      })
      .setOrigin(0, 0.5)
      .setDepth(201);

    const btnMas = scene.add.text(W / 2 + 160, y, "＋", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "26px",
      fill: "#0f0",
      backgroundColor: "#222",
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5).setDepth(201).setInteractive();

    const btnMenos = scene.add.text(W / 2 + 220, y, "－", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "26px",
      fill: "#555",
      backgroundColor: "#222",
      padding: { left: 10, right: 10, top: 4, bottom: 4 }
    }).setOrigin(0.5).setDepth(201);
    btnMenos.disableInteractive();

    botones[s] = { mas: btnMas, menos: btnMenos };

    btnMas.on("pointerdown", () => {
      if (this.puntosDisponibles <= 0) return;

      if (s === "vida") {
        dragon.vidaMax += 5;
        statTexts[s].setText(`${nombres[s]}: ${dragon.vidaMax}`);
      } else {
        dragon[s]++;
        statTexts[s].setText(`${nombres[s]}: ${dragon[s]}`);
      }

      this.historial.push({ stat: s, tipo: "mas" });
      this.puntosDisponibles--;
      actualizarContador();

      btnMenos.setInteractive().setStyle({ backgroundColor: "#333", fill: "#f00" });

      if (this.puntosDisponibles <= 0) {
        Object.values(botones).forEach(b =>
          b.mas.disableInteractive().setStyle({ backgroundColor: "#555", fill: "#888" })
        );
        lanzarBrillo();
      }
    });

    btnMenos.on("pointerdown", () => {
      const idx = this.historial.findIndex(h => h.stat === s && h.tipo === "mas");
      if (idx === -1) return;

      if (s === "vida") {
        dragon.vidaMax -= 5;
        dragon.vida = Math.min(dragon.vida, dragon.vidaMax);
        statTexts[s].setText(`${nombres[s]}: ${dragon.vidaMax}`);
      } else {
        dragon[s]--;
        statTexts[s].setText(`${nombres[s]}: ${dragon[s]}`);
      }

      this.historial.splice(idx, 1);
      this.puntosDisponibles++;
      actualizarContador();

      Object.values(botones).forEach(b =>
        b.mas.setInteractive().setStyle({ backgroundColor: "#222", fill: "#0f0" })
      );

      const aunTiene = this.historial.some(h => h.stat === s);
      if (!aunTiene) {
        btnMenos.disableInteractive().setStyle({ backgroundColor: "#222", fill: "#555" });
      }
    });

    y += 60;
  });

  const btnOK = scene.add.text(W / 2, y + 40, "✅ Confirmar", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
    fill: "#fff",
    backgroundColor: "#333",
    padding: { left: 14, right: 14, top: 8, bottom: 8 }
  }).setOrigin(0.5).setDepth(201).setInteractive();

 btnOK.on("pointerdown", () => {
  if (this.puntosDisponibles > 0) return;

  dragon.vida = Math.min(dragon.vida, dragon.vidaMax);

  // 💥✨ EFECTO VISUAL DE SUBIDA DE NIVEL (SEGURO) ✨💥
  const colorBrillo = 0xffd700;
  const aura = scene.add.circle(W / 2, H / 2, 60, colorBrillo, 0.4).setDepth(210);
  scene.tweens.add({
    targets: aura,
    scale: { from: 1, to: 8 },
    alpha: { from: 0.6, to: 0 },
    duration: 900,
    ease: "Cubic.easeOut",
    onComplete: () => aura.destroy()
  });

  const flash = scene.add.rectangle(W / 2, H / 2, W, H, colorBrillo, 0.2).setDepth(209);
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 500,
    ease: "Quad.easeOut",
    onComplete: () => flash.destroy()
  });

  // 🌟 Chispas doradas (círculos compatibles)
  for (let i = 0; i < 12; i++) {
    const spark = scene.add.circle(
      W / 2 + Phaser.Math.Between(-120, 120),
      H / 2 + Phaser.Math.Between(-80, 80),
      Phaser.Math.Between(3, 6),
      0xffffcc
    ).setAlpha(0).setDepth(211);

    scene.tweens.add({
      targets: spark,
      alpha: { from: 1, to: 0 },
      y: spark.y - Phaser.Math.Between(30, 60),
      scale: { from: 1, to: 0.3 },
      duration: 600,
      delay: i * 40,
      onComplete: () => spark.destroy()
    });
  }
  // 💥 FIN DEL EFECTO VISUAL

  overlay.destroy();
  popup.destroy();
  titulo.destroy();
  subtitulo.destroy();
  txtRestantes.destroy();
  Object.values(statTexts).forEach(t => t.destroy());
  Object.values(botones).forEach(b => { b.mas.destroy(); b.menos.destroy(); });
  btnOK.destroy();
// 🧭 Al cerrar el popup, comprobar desbloqueos del modo historia
setTimeout(() => {
  if (window.storyMode) {
    console.log("🧭 Revisión automática del modo historia (tras subida de nivel)");
    window.storyMode.checkLevelUnlocks();
  }
}, 250);
  callback(this.historial);
});

}


,

  aplicarBoostPrincipal(dragon){
    if(dragon.isPrincipal){
      dragon.vidaMax   = Math.floor(dragon.vidaMax * 1.3);
      dragon.mordisco  = Math.floor(dragon.mordisco * 1.3);
      dragon.aliento   = Math.floor(dragon.aliento * 1.3);
      dragon.armadura  = Math.floor(dragon.armadura * 1.3);
      dragon.velocidad = Math.floor(dragon.velocidad * 1.3);
    }
// 📌 Bonificaciones pasivas por clase/rol
const bonusClase = {
  "Rogue":       { esquiva: 0.10 },
  "Rogue/":      { esquiva: 0.05 },
  "Tanque":      { bloqueo: 0.08 },
  "Tanque/":     { bloqueo: 0.04 },
  "Equilibrado": { esquiva: 0.02, bloqueo: 0.02, crit: 0.02 },
  "Equilibrado/":{ esquiva: 0.01, bloqueo: 0.01, crit: 0.01 },
  "Luchador":    { crit: 0.10 },
  "Luchador/":   { crit: 0.05 }
};

// 🔹 Devuelve los bonus aplicables al dragón según clase y nivel
function getBonusesForDragon(dragon){
  if(!dragon || !dragon.clase) return { esquiva:0, bloqueo:0, crit:0 };
  let base = bonusClase[dragon.clase] || {};
  let mult = (dragon.nivel >= 20) ? 2 : 1;

  return {
    esquiva: (base.esquiva || 0) * mult,
    bloqueo: (base.bloqueo || 0) * mult,
    crit:    (base.crit    || 0) * mult
  };
}
    
  },
  

  asignarNivel(dragon, nivel){
    if(!dragon._baseStats){
      dragon._baseStats = {
        vida: dragon.vidaMax || dragon.vida,
        mordisco: dragon.mordisco,
        aliento: dragon.aliento,
        armadura: dragon.armadura,
        velocidad: dragon.velocidad
      };
    }

    let vidaActual = dragon.vida;

    dragon.vidaMax   = dragon._baseStats.vida;
    dragon.mordisco  = dragon._baseStats.mordisco;
    dragon.aliento   = dragon._baseStats.aliento;
    dragon.armadura  = dragon._baseStats.armadura;
    dragon.velocidad = dragon._baseStats.velocidad;

    dragon.nivel = Math.max(1, nivel);
    dragon.exp = 0;

    // 🆙 Nueva lógica: el dragón gana 2 stats aleatorios por nivel
for (let i = 1; i < dragon.nivel; i++) {
  let stats = ["vida","mordisco","aliento","armadura","velocidad"];

  for (let j = 0; j < 2; j++) {
    const elegido = stats[Math.floor(Math.random() * stats.length)];

    if (elegido === "vida") {
      dragon.vidaMax += 5;
    } else {
      dragon[elegido] += 1;
    }
  }
}

    this.aplicarBoostPrincipal(dragon);
    dragon.vida = Math.min(vidaActual, dragon.vidaMax);
  },

  // Rival según dragón más fuerte de tu colección (±4 niveles)
 // LO LLEVAMOS A ENCUENTROS

  mostrarResumenXP(scene, resultados){
  let elementos = [];

  const { width: W, height: H } = scene.sys.game.config;

  // === Fondo oscuro centrado ===
  let overlay = scene.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6)
    .setDepth(199).setInteractive();
  elementos.push(overlay);

  // === Popup centrado y más grande ===
  let popup = scene.add.rectangle(W/2, H/2, W * 0.45, H * 0.45, 0x111111, 0.95)
    .setStrokeStyle(2, 0xffffff)
    .setDepth(200);
  elementos.push(popup);

  // === Título ===
  let titulo = scene.add.text(W/2, H/2 - 120, "🏆 Experiencia ganada", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "26px",
    fill: "#ffd700",
    fontStyle: "bold",
    align: "center"
  }).setOrigin(0.5).setDepth(201);
  elementos.push(titulo);

  // === Listado de resultados ===
  let y = H/2 - 60;
  resultados.forEach(r=>{
    let t = scene.add.text(W/2, y, `${r.dragon.name}: +${r.xp} PX`, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "20px",
      fill: "#00ffff",
      align: "center"
    }).setOrigin(0.5).setDepth(201);
    elementos.push(t);
    y += 35;
  });

  // === Botón OK ===
  let btn = scene.add.text(W/2, H/2 + 100, "Aceptar", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "22px",
    fill: "#fff",
    backgroundColor: "#333",
    padding: { left: 14, right: 14, top: 8, bottom: 8 }
  }).setOrigin(0.5).setInteractive().setDepth(201);
  elementos.push(btn);

  btn.on("pointerdown",()=>{
    elementos.forEach(el => el.destroy());
    this._continuarDespuesDeSubidas(scene);
  });
},


  _continuarDespuesDeSubidas(scene){
  this.procesarColaSubidas(scene, ()=>{
    
    // ✅ Solo continuar a captura si realmente hay un combate reciente
    if(window.ultimoCombate && window.ultimoCombate.dragon){
      console.log("🎯 Continuando a escena de captura real tras combate...");

      // Registrar dragón derrotado
      window.dragonesDerrotados = window.dragonesDerrotados || [];
      window.dragonesDerrotados.push({
        col: window.ultimoCombate.col,
        row: window.ultimoCombate.row,
        key: window.ultimoCombate.dragon.name + "_mini"
      });

      // Preparar dragón capturado
      let capturado = JSON.parse(JSON.stringify(dragon2 || window.ultimoCombate.dragon));
      capturado.mini = window.ultimoCombate?.dragon.mini || capturado.mini;
      capturado.img  = window.ultimoCombate?.dragon.img  || capturado.img;
      capturado.vida = capturado.vidaMax;
      capturado.numAlientos = calcularAlientosPorNivel(capturado);
      capturado.numAlientosInicial = capturado.numAlientos;

      // Actualizar vida del jugador
      let d = window.dragonesJugador.find(dd => dd.name === dragon1?.name);
      if(d){ d.vida = scene.vida1; }
      // 📜 Si el combate fue en una isla legendaria → activar misión storymode
      if (window.ultimoCombate && window.ultimoCombate.dragon && window.storyMode) {
        const nombre = (window.ultimoCombate.dragon.name || "").toLowerCase();
        if (nombre.includes("frozencrown") || nombre.includes("scorchia") ||
            nombre.includes("hellfire") || nombre.includes("stormcloud") ||
            nombre.includes("jadeisland")) {
          window.storyMode.trigger("islaLegendariaCompletada");
        }
      }
      // 👉 Pasar a captura
      scene.scene.start("SceneCapturaConfirmacion", { dragon: capturado });

      // Limpieza post captura
      delete window.ultimoCombate;
      return;
    }

    // 🔥 Si no hay último combate (misión pasiva, XP por evento, etc.), NO lanzar captura
    console.log("🧹 Sin combate reciente → no se inicia captura.");
  });
},


  actualizarDragonColeccion(dragon){
    if(window.dragonesJugador){
      let d = window.dragonesJugador.find(dd => dd.name === dragon.name);
      if(d){
        d.nivel     = dragon.nivel;
        d.exp       = dragon.exp;
        d.vidaMax   = dragon.vidaMax;
        d.vida      = dragon.vida;
        d.mordisco  = dragon.mordisco;
        d.aliento   = dragon.aliento;
        d.armadura  = dragon.armadura;
        d.velocidad = dragon.velocidad;
      }
    }
  }
};
