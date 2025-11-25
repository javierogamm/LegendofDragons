/***** =========================
 * ESCENA COMBATE TÁCTICO 3v3 (modo real o modo pruebas)
 * ========================== */
class SceneCombateTactico extends Phaser.Scene {
  constructor() { super("SceneCombateTactico"); }

  /** 🔹 Recibe datos al iniciar la escena */
  init(data) {
    // Permite iniciar tanto desde el mapa como desde menú de pruebas
    this.modo = data?.modo || "prueba";
    this.volverA = data?.volverA || null;
    this.volverData = data?.volverData || null;

    // 🐲 Dragones aliados y enemigos
    this.aliados = data?.aliados || (window.dragonesJugador || []).slice(0, 4);
    this.enemigos = data?.enemigos || (window.dragonesEnemigos || []).slice(0, 4);

    // Backup por si se reinicia
    window.dragonesAliados = this.aliados;
    window.dragonesEnemigos = this.enemigos;
  }

  preload() {
    // Fondo de combate
    this.load.image("tacticblue1", "assets/tactic/tacticblue1.png");
  this.load.image("tacticblue2", "assets/tactic/tacticblue2.png");
  this.load.image("tacticgreen1", "assets/tactic/tacticgreen1.png");
  this.load.image("tacticgreen2", "assets/tactic/tacticgreen2.png");
  this.load.image("tacticred1", "assets/tactic/tacticred1.png");
  this.load.image("tacticred2", "assets/tactic/tacticred2.png");
   this.load.image("tacticyellow1", "assets/tactic/tacticyellow1.png");
    this.load.image("tacticyellow2", "assets/tactic/tacticyellow2.png");
    this.load.image("mapacombate", "assets/tactic/tacticdesert.png");
    this.load.image("iconoEscudo", "assets/hud/iconoEscudo.png"); 
//Efectos

    this.load.image("alientoFuego", "assets/alientos/fuego.png");
    this.load.image("alientoAgua", "assets/alientos/agua.png");
    this.load.image("alientoTrueno", "assets/alientos/trueno.png");
    this.load.image("alientoRoca", "assets/alientos/roca.png");
    this.load.image("alientoStriker", "assets/alientos/striker.png");
    this.load.image("alientoMisterio", "assets/alientos/misterio.png");


    // 🧴 Cargar iconos de pociones (importante)
  this.load.image("pocionrojaICON", "assets/potis/pocionroja.png");
  this.load.image("pocionazulICON", "assets/potis/pocionazul.png");
    // Precargar sprites de aliados y enemigos
    const todos = [...(this.aliados || []), ...(this.enemigos || [])];
    todos.forEach(d => {
      const key = d.name + "_mini";
      if (d.mini && !this.textures.exists(key)) {
        this.load.image(key, d.mini);
      }
    });

   window.dragones.forEach(d => {
    this.load.image(d.name + "_mini", d.mini);
    this.load.image(d.name + "_img", d.img);
  });
    
  }

  create() {
  
  
  
    // === DIMENSIONES BASE ===
  const W = this.game.config.width;
  const H = this.game.config.height;
  this.W = W;
  this.H = H;

  // === ARRAYS BASE ===
  this.resaltados = [];
  this.seleccionado = null;

 // === MAPA HEX ===
// 🗺️ Fondo dinámico según monolito
const color =
  this.volverData?.monolitoRojo   ? "rojo"   :
  this.volverData?.monolitoVerde  ? "verde"  :
  this.volverData?.monolitoAzul   ? "azul"   :
  this.volverData?.monolitoDorado ? "dorado" :
  (data?.monolitoRojo   ? "rojo"   :
   data?.monolitoVerde  ? "verde"  :
   data?.monolitoAzul   ? "azul"   :
   data?.monolitoDorado ? "dorado" : "verde");

let fondoKey = "tacticgreen1";

if (color === "rojo") {
  fondoKey = Phaser.Math.RND.pick(["tacticred1", "tacticred2"]);
} else if (color === "azul") {
  fondoKey = Phaser.Math.RND.pick(["tacticblue1", "tacticblue2"]);
} else if (color === "verde") {
  fondoKey = Phaser.Math.RND.pick(["tacticgreen1", "tacticgreen2"]);
} else if (color === "dorado") {
  fondoKey = Phaser.Math.RND.pick(["tacticyellow1", "tacticyellow2"]); // 💛 NUEVO
}
// 🗺️ Fondo perfectamente alineado al mapa táctico
this.add.image(this.W / 2, this.H / 2, fondoKey)
  .setDisplaySize(this.W, this.H)
  .setDepth(-10)
  .setOrigin(0.5, 0.5);console.log(`🌈 Fondo táctico usado: ${fondoKey} (${color})`);
this.turno = 0;
this.hexSize = 45;
this.hexW = this.hexSize * 2;
this.hexH = Math.sqrt(3) * this.hexSize;
this.cols = 8;   // columnas (ancho)
this.rows = 5;   // filas (alto)


this.centerX = this.W / 2;
this.centerY = this.H / 2;
this.startX = this.centerX - (this.cols - 1) * this.hexW * 0.43;
this.startY = this.centerY - (this.rows - 1) * this.hexH * 0.45;

this.casillas = [];

  // === Normalizar rarezas y stats ===
  const aplicarRarezaSiFalta = (d) => {
    if (!d.rareza) {
      if (typeof asignarRareza === "function") asignarRareza(d);
      else d.rareza = "Común";
    }
    const r = window.rarezas?.[d.rareza];
    if (r && r.boost && !d._boostAplicado) {
      const boost = r.boost;
      d.vidaMax = Math.ceil(d.vidaMax * (1 + boost));
      d.vida = d.vidaMax;
      d.mordisco = Math.ceil(d.mordisco * (1 + boost));
      d.aliento = Math.ceil(d.aliento * (1 + boost));
      d.armadura = Math.ceil(d.armadura * (1 + boost));
      d.velocidad = Math.ceil(d.velocidad * (1 + boost));
      d._boostAplicado = true;
    }
  };
  [...(this.aliados || []), ...(this.enemigos || [])].forEach(aplicarRarezaSiFalta);

 // 💀 BOOST GLOBAL ENEMIGOS (versión ajustada):
// 👉 Hasta nivel 15 no hay aumento.
// 👉 De nivel 15 a 30 escala linealmente desde 0% hasta +40%.
this.enemigos.forEach(d => {
  const nivel = Phaser.Math.Clamp(d.nivel || 1, 1, 30);
  let factor = 0;

  if (nivel > 15) {
    // Escala lineal entre 15 y 30 → de 0 a +0.40
    factor = ((nivel - 15) / 15) * 0.40;
  }

  // Aplicar el multiplicador
  d.vidaMax   = Math.round(d.vidaMax * (1 + factor));
  d.vida      = d.vidaMax;
  d.mordisco  = Math.round(d.mordisco * (1 + factor));
  d.aliento   = Math.round(d.aliento * (1 + factor));
  d.armadura  = Math.round(d.armadura * (1 + factor));
  d.velocidad = Math.round(d.velocidad * (1 + factor));

  d._boostTactico = factor;
  console.log(`💀 BOOST táctico aplicado a ${d.name}: +${Math.round(factor * 100)}%`);
});
// 💚 RESTAURAR VIDA COMPLETA A TODOS LOS DRAGONES (aliados y enemigos)
[...(this.aliados || []), ...(this.enemigos || [])].forEach(d => {
  if (d.vidaMax && d.vida < d.vidaMax) {
    d.vida = d.vidaMax;
  } else if (!d.vidaMax && d.vida) {
    // fallback por si algún dragón no tiene vidaMax definida
    d.vidaMax = d.vida;
  }
});
console.log("💚 Todos los dragones inician con vida completa");
// === Asignar número de alientos inicial ===
if (typeof calcularAlientos === "function") {
  [...(this.aliados || []), ...(this.enemigos || [])].forEach(d => {
    // calcular alientos en base a nivel y plantilla base
    d.numAlientos = calcularAlientos(d, d.nivel || 1);
    d.numAlientosInicial = d.numAlientos;
  });
} else {
  // fallback si la función no existe
  [...(this.aliados || []), ...(this.enemigos || [])].forEach(d => {
    d.numAlientos = 1;
    d.numAlientosInicial = 1;
  });
}
// === Inicializar escudos ===
[...(this.aliados || []), ...(this.enemigos || [])].forEach(d => {
  d.bloqueosMax = d.bloqueosMax || (typeof calcularBloqueosMax === "function" ? calcularBloqueosMax(d) : 1);
  d.bloqueosUsados = d.bloqueosUsados || 0;
});
  // === Dibujar rejilla hexagonal ===
  const g = this.add.graphics();
  g.lineStyle(1, 0xffff00, 0.25);
  for (let c = 0; c < this.cols; c++) {
    for (let r = 0; r < this.rows; r++) {
      const x = this.startX + c * (this.hexW * 0.75);
      const y = this.startY + r * this.hexH + (c % 2 ? this.hexH / 2 : 0);
      this.casillas.push({ col: c, row: r, x, y, ocupante: null });
      const pts = this.hexPointsFlat(x, y, this.hexSize);
      g.beginPath();
      g.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
      g.closePath();
      g.strokePath();
    }
  }

  // === COLOCAR DRAGONES ===
  this.sprites = [];

  // Posiciones base para 4v4 (ajustables)
  const posAliados = [
    { col: 1, row: 1 },
    { col: 1, row: 2 },
    { col: 1, row: 3 },
    { col: 1, row: 4 }  // === CAMBIO 4v4: cuarta posición añadida
  ];
  const posEnemigos = [
    { col: 6, row: 1 },
    { col: 6, row: 2 },
    { col: 6, row: 3 },
    { col: 6, row: 4 }  // === CAMBIO 4v4: cuarta posición añadida
  ];

  posAliados.forEach((p, i) => {
    const d = this.aliados[i];
    if (!d) return;
    const c = this.getCell(p.col, p.row);
    if (!c) return;
    const s = this.crearDragonSprite(c.x, c.y, d);
    c.ocupante = s;
    s.setData("col", p.col);
    s.setData("row", p.row);
    this.sprites.push(s);
  });

  posEnemigos.forEach((p, i) => {
    const d = this.enemigos[i];
    if (!d) return;
    const c = this.getCell(p.col, p.row);
    if (!c) return;
    const s = this.crearDragonSprite(c.x, c.y, d);
    c.ocupante = s;
    s.setData("col", p.col);
    s.setData("row", p.row);
    this.sprites.push(s);
  });

// 🌬️ Inicializar contador de turnos propios para regenerar alientos
[...this.aliados, ...this.enemigos].forEach(d => {
  d.turnosDesdeUltimaRegen = 0;
});
 // === Inicializar puntos de acción (base + velocidad, mínimo 20) ===
[...this.aliados, ...this.enemigos].forEach(d => {
  const paBase = 10;
  const paVelocidad = Math.floor((d.velocidad * 10) / 4);
  let totalPA = paBase + paVelocidad;

  if (totalPA < 20) totalPA = 20; // 🔒 mínimo absoluto

  d.puntosAccion = totalPA;
  d.puntosAccionMax = totalPA; // opcional, por si lo usas en barras
  console.log(`⚙️ ${d.name} inicia con ${totalPA} PA (velocidad ${d.velocidad})`);
});

 // === HUD LATERAL (más centrado) ===
const offsetX = 280; // 🔹 cuanto más pequeño, más cerca del centro

this.hudAliados = this.add.container(offsetX, 80).setDepth(1000);
this.hudEnemigos = this.add.container(this.W - offsetX, 80).setDepth(1000);

const colorPorRareza = (rareza) => {
  switch (rareza) {
    case "Común": return 0xaaaaaa;
    case "Raro": return 0x1e90ff;
    case "Épico": return 0x9932cc;
    case "Legendario": return 0xffd700;
    default: return 0xffffff;
  }
};

// 🔹 Fichas finas verticales (mini a la izquierda, texto a la derecha)
this.crearFichaHUD = (dragon) => {
  const grupo = this.add.container(0, 0);
  const marcoColor = colorPorRareza(dragon.rareza);

  // Fondo rectangular fino
  const fondo = this.add.rectangle(0, 0, 160, 40, 0x000000, 0.45).setOrigin(0.5);
  grupo.add(fondo);

  // Marco e imagen mini
  const marco = this.add.rectangle(-55, 0, 34, 34)
    .setStrokeStyle(2, marcoColor)
    .setOrigin(0.5);
  grupo.add(marco);

  const key = dragon.name + "_mini";
  const mini = this.add.image(-55, 0, key).setDisplaySize(30, 30);
  grupo.add(mini);

  // Texto a la derecha
  const txt = this.add.text(-35, -8, `${dragon.name}`, {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "13px",
    fill: "#ffffff",
    fontFamily: "monospace"
  }).setOrigin(0, 0);

  const lvl = this.add.text(-35, 8, `Lv.${dragon.nivel || 1}`, {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "12px",
    fill: "#cccccc",
    fontFamily: "monospace"
  }).setOrigin(0, 0);

  grupo.add(txt);
  grupo.add(lvl);

  // 🖱️ Click en la ficha HUD para abrir popup
  grupo.setData("dragon", dragon);
  grupo.setSize(160, 40);
  grupo.setInteractive(new Phaser.Geom.Rectangle(-80, -20, 160, 40), Phaser.Geom.Rectangle.Contains)
    .on("pointerdown", () => {
      this.mostrarPopupDragon(dragon);
    });
// 🧾 Inicializar HUD de pociones
this.actualizarPocionesHUD();
// === 🧴 Iconos de POCIONES (solo para aliados) ===
if (this.aliados.includes(dragon)) {

  // Coordenadas relativas dentro del HUD
  const baseX = 55;     // esquina derecha de la ficha
  const baseY = 12;     // parte inferior
  const scalePoti = 0.34; // 15% más pequeño

  // Obtener cantidades actuales del inventario
  const itemRoja = window.inventarioJugador?.find(i => i.nombre === "Poción Roja");
  const itemAzul = window.inventarioJugador?.find(i => i.nombre === "Poción Azul");
  const nRoja = itemRoja?.cantidad ?? 0;
  const nAzul = itemAzul?.cantidad ?? 0;

  // 🔴 Poción Roja
  const pocRoja = this.add.image(baseX, baseY, "pocionrojaICON")
    .setScale(scalePoti)
    .setInteractive({ useHandCursor: true });
  const txtRoja = this.add.text(baseX + 7, baseY + 7, "x" + nRoja, {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "11px",
    fill: "#fff",
    stroke: "#000",
    strokeThickness: 2
  }).setOrigin(1, 1); // abajo a la derecha del icono

  // 💨 Poción Azul
  const pocAzul = this.add.image(baseX + 26, baseY, "pocionazulICON")
    .setScale(scalePoti)
    .setInteractive({ useHandCursor: true });
  const txtAzul = this.add.text(baseX + 33, baseY + 7, "x" + nAzul, {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "11px",
    fill: "#fff",
    stroke: "#000",
    strokeThickness: 2
  }).setOrigin(1, 1);

  // 👉 Añadirlos al grupo (para que se muevan con la ficha)
  grupo.add(pocRoja);
  grupo.add(txtRoja);
  grupo.add(pocAzul);
  grupo.add(txtAzul);

  // ❤️ Click poción roja
  pocRoja.on("pointerdown", () => {
    const item = window.inventarioJugador?.find(i => i.nombre === "Poción Roja");
    if (item && item.cantidad > 0) {
      dragon.vida = Math.min(dragon.vidaMax, dragon.vida + 25);
      item.cantidad--;
      this.addLog(`❤️ ${dragon.name} recupera vida (+25)`);
      const sp = this.sprites.find(s => s.getData("dragon") === dragon);
      this.actualizarBarras(sp);
      this.actualizarPocionesHUD();
      const fx = this.add.circle(sp.x, sp.y - 40, 20, 0xff4444, 0.5).setDepth(50);
      this.tweens.add({ targets: fx, alpha: 0, scale: 3, duration: 800, onComplete: () => fx.destroy() });
    }
  });

  // 💨 Click poción azul
  pocAzul.on("pointerdown", () => {
    const item = window.inventarioJugador?.find(i => i.nombre === "Poción Azul");
    if (item && item.cantidad > 0) {
      dragon.numAlientos = dragon.numAlientosInicial;
      item.cantidad--;
      this.addLog(`💨 ${dragon.name} restaura alientos`);
      const sp = this.sprites.find(s => s.getData("dragon") === dragon);
      this.actualizarBolitas(sp);
      this.actualizarPocionesHUD();
      const fx = this.add.circle(sp.x, sp.y - 40, 20, 0x00bfff, 0.5).setDepth(50);
      this.tweens.add({ targets: fx, alpha: 0, scale: 3, duration: 800, onComplete: () => fx.destroy() });
    }
  });

  // Guardar referencias
  grupo.pocRoja = pocRoja;
  grupo.txtRoja = txtRoja;
  grupo.pocAzul = pocAzul;
  grupo.txtAzul = txtAzul;
}
  return grupo;
};

// Aliados (izquierda, uno encima de otro)
this.aliados.forEach((d, i) => {
  const f = this.crearFichaHUD(d);
  f.y = i * 48; // separación vertical
  this.hudAliados.add(f);
});

// Enemigos (derecha, uno encima de otro)
this.enemigos.forEach((d, i) => {
  const f = this.crearFichaHUD(d);
  f.y = i * 48;
  this.hudEnemigos.add(f);
});

// === BARRA DE SKILLS IZQUIERDA ===
this.barraSkills = this.add.container(280, this.H - 220).setDepth(1000);

// Fondo gris translúcido
const fondoSkills = this.add.rectangle(0, 0, 180, 260, 0x000000, 0.45)
  .setOrigin(0.5)
  .setStrokeStyle(2, 0xffffff, 0.15)
  .setDepth(999);
this.barraSkills.add(fondoSkills);

// Título "Skills"
const tituloSkills = this.add.text(0, -110, "🧩 Skills", {
  fontFamily: "'Cinzel Decorative', serif",fontSize: "1px",
  fill: "#ffffff",
  fontFamily: "monospace",
  fontStyle: "bold"
}).setOrigin(0.5);
this.barraSkills.add(tituloSkills);

// Contenedor interno para botones
this.skillsContainer = this.add.container(0, -70);
this.barraSkills.add(this.skillsContainer);

// === BOTONES DE SKILLS REALES (según tipo del dragón activo) ===
this.crearBotonSkill = (skill, dragon) => {
  const cooldowns = dragon.cooldowns || {};
  const cdRestante = cooldowns[skill.nombre] || 0;
  const enCooldown = cdRestante > 0;

  // 🔹 Texto con contador de cooldown
  const texto = enCooldown ? `${skill.icono} ${skill.nombre} (${cdRestante})` : `${skill.icono} ${skill.nombre}`;
  const fillColor = enCooldown ? "#999" : "#fff";
  const bgColor = enCooldown ? "#111" : "#333";

  const btn = this.add.text(0, 0, texto, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "12px",
    fill: fillColor,
    backgroundColor: bgColor,
    padding: { left: 10, right: 10, top: 5, bottom: 5 },
    align: "center"
  }).setOrigin(0.5);

  // Si está en cooldown, no es interactivo
  if (enCooldown) {
    btn.setAlpha(0.6);
  } else {
    btn.setInteractive()
      .on("pointerover", () => btn.setStyle({ backgroundColor: "#555", fill: "#ffd700" }))
      .on("pointerout", () => btn.setStyle({ backgroundColor: bgColor, fill: fillColor }))
      .on("pointerdown", () => {
        this.tweens.add({
          targets: btn,
          scale: 0.92,
          duration: 80,
          yoyo: true
        });
        // Ejecutar la skill si está lista
        if (skill.ejecutar && tacticsSkills.puedeUsarSkill(dragon, skill, this)) {
          skill.ejecutar(this, this.dragonActivo);
          tacticsSkills.marcarSkillUsada(dragon, skill);
          this.actualizarHUDSkills(); // 🔁 refrescar texto y cooldown
        }
      });
  }

  return btn;
};


// 🧩 Refrescar las skills visibles en el HUD (versión dinámica)
this.actualizarHUDSkills = () => {
  // Limpiar anteriores
  if (this.skillsContainer) this.skillsContainer.removeAll(true);

  const d = this.dragonActivo?.getData?.("dragon");
  if (!d || !window.tacticsSkills) {
    console.warn("⚠️ Sin dragón activo o sin tacticsSkills cargado");
    return;
  }

  // 🧩 Obtener skills según su tipo real
  const tipo = (d.tipo || "").toLowerCase();
  const skillsDisponibles = tacticsSkills.obtenerSkillsPorTipo(tipo);

  console.log(
    "🧩 DEBUG Skills del dragón:",
    d.name,
    "tipo detectado:",
    tipo,
    "→ Skills cargadas:",
    skillsDisponibles.map(s => s.nombre)
  );

  if (!skillsDisponibles || skillsDisponibles.length === 0) {
    const txt = this.add.text(0, 0, "Sin skills disponibles", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "14px",
      fill: "#999"
    }).setOrigin(0.5);
    this.skillsContainer.add(txt);
    return;
  }

  // Crear botones (con cooldown visible)
skillsDisponibles.forEach((skill, i) => {
  const btn = this.crearBotonSkill(skill, d);
  btn.y = i * 40;
  this.skillsContainer.add(btn);
});
};



  // === HUD SUPERIOR ===
  this.add.text(500, 30, "COMBATE TÁCTICO 4 v 4", {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "28px", fill: "#ffd700"
  }).setOrigin(0.5);
  this.txtTurno = this.add.text(500, 60, "", { fontFamily: "'Cinzel Decorative', serif",fontSize: "20px", fill: "#fff" }).setOrigin(0.5);

 // === BOTÓN FIN DE TURNO (centro)
this.btnPasarTurno = this.add.text(this.W / 2, this.H - 42, "⏭️ Fin turno", {
  fontFamily: "'Cinzel Decorative', serif",fontSize: "20px",
  fill: "#fff",
  backgroundColor: "#222",
  padding: { left: 10, right: 10, top: 6, bottom: 6 }
})
  .setOrigin(0.5)
  .setInteractive()
  .setDepth(1000)
  .on("pointerover", () => this.btnPasarTurno.setStyle({ backgroundColor: "#444", fill: "#ffd700" }))
  .on("pointerout", () => this.btnPasarTurno.setStyle({ backgroundColor: "#222", fill: "#fff" }))
  .on("pointerdown", () => this.finalizarTurno());

// === BOTÓN MORDISCO (a la derecha con separación)
this.btnMordiscoTactico = this.add.text(this.W / 2 + 190, this.H - 42, "⚔️ Mordisco", {
  fontFamily: "'Cinzel Decorative', serif",fontSize: "20px",
  fill: "#fff",
  backgroundColor: "#222",
  padding: { left: 10, right: 10, top: 6, bottom: 6 }
})
  .setOrigin(0.5)
  .setInteractive()
  .setDepth(1000)
  .on("pointerover", () => this.btnMordiscoTactico.setStyle({ backgroundColor: "#444", fill: "#ffd700" }))
  .on("pointerout", () => this.btnMordiscoTactico.setStyle({ backgroundColor: "#222", fill: "#fff" }))
  .on("pointerdown", () => {
    this.tweens.add({ targets: this.btnMordiscoTactico, scale: 0.92, duration: 90, yoyo: true });
    if (!this.aliados.includes(this.dragonActivo?.getData("dragon"))) return;
    if (this.haAtacadoJugador) {
      const t = this.add.text(this.W / 2 + 190, this.H - 80, "Ya atacaste este turno", {
        fontFamily: "'Cinzel Decorative', serif",fontSize: "18px",
        fill: "#ff6666"
      }).setOrigin(0.5);
      this.time.delayedCall(900, () => t.destroy());
      return;
    }
    if (this.attackMode) this.exitAttackMode();
    else this.enterAttackMode();
  });

// === BOTÓN ALIENTO (aún más a la derecha, con separación igual)
this.btnAliento = this.add.text(this.W / 2 + 380, this.H - 42, "🔥 Aliento", {
  fontFamily: "'Cinzel Decorative', serif",fontSize: "20px",
  fill: "#fff",
  backgroundColor: "#222",
  padding: { left: 10, right: 10, top: 6, bottom: 6 }
})
  .setOrigin(0.5)
  .setInteractive()
  .setDepth(1000)
  .on("pointerover", () => this.btnAliento.setStyle({ backgroundColor: "#444", fill: "#ffd700" }))
  .on("pointerout", () => this.btnAliento.setStyle({ backgroundColor: "#222", fill: "#fff" }))
  .on("pointerdown", () => {
    if (this.alientoMode) this.exitAlientoMode();
    else this.enterAlientoMode();
  });

  // === Inicialización de estados ===
  this.haMovidoJugador = false;
  this.haAtacadoJugador = false;
  this.attackMode = false;
  this.attackHighlights = [];

  // === Input de movimiento ===
  this.input.on("pointerdown", p => this.intentarMover(p));

  // === 🧾 LOG DE COMBATE (lado derecho) ===
this.logContainer = this.add.container(this.sys.game.config.width - 560, 690).setDepth(999);

// Fondo del log (alineado al lado derecho)
const logBg = this.add.rectangle(0, 0, 340, 100, 0x000000, 0.45)
  .setOrigin(0, 1)
  .setStrokeStyle(2, 0xffffff, 0.15);
this.logContainer.add(logBg);

this.logLines = [];
this.maxLogLines = 6;
this.lineHeight = 18;

// Contenedor de texto alineado dentro del bloque
this.logTextContainer = this.add.container(10, -90);
this.logContainer.add(this.logTextContainer);

// Función de añadir línea al log
this.addLog = (msg, color = "#ddd") => {
  const line = this.add.text(0, 0, msg, {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "14px",
    fill: color,
    align: "left"
  }).setOrigin(0, 0);

  // Desplazar líneas existentes hacia arriba
  this.logLines.forEach(txt => {
    this.tweens.add({
      targets: txt,
      y: txt.y - this.lineHeight,
      duration: 250,
      ease: "Cubic.easeOut"
    });
  });

  const newY = this.logLines.length * this.lineHeight;
  line.y = newY;
  this.logTextContainer.add(line);
  this.logLines.push(line);

  // Eliminar las más antiguas si hay demasiadas
  if (this.logLines.length > this.maxLogLines) {
    const old = this.logLines.shift();
    this.tweens.add({
      targets: old,
      alpha: 0,
      duration: 100,
      onComplete: () => old.destroy()
    });
  }

  // Pequeño parpadeo visual del fondo
  this.tweens.add({
    targets: logBg,
    alpha: { from: 0.8, to: 0.45 },
    duration: 150,
    yoyo: true
  });
};


   this.turns = new TurnManager(this);
this.turns.start();
console.log("🎯 Combate táctico iniciado");


// Inicializar textos
this.actualizarPocionesHUD();
/******************************
 * 🧨 TRUCO DEBUG: tecla U mata a todos los enemigos y fuerza victoria
 * (versión funcional con auto-win si hay solo 1 enemigo)
 ******************************/

// ✅ AUTO-WIN tras breve delay (espera a que todo esté cargado)
this.time.delayedCall(800, () => {
  if ((this.enemigos?.length || 0) === 1) {
    console.log("💀 TRUCO AUTO-WIN: enemigo único detectado, activando victoria automática...");

    // Marcar enemigo como derrotado
    (this.enemigos || []).forEach(d => d.vida = 0);

    // Actualizar sprites y barras
    if (this.sprites?.length > 0) {
      this.sprites.forEach(sp => {
        const data = sp.getData("dragon");
        if (data && this.enemigos.includes(data)) {
          data.vida = 0;
          if (this.actualizarBarras) this.actualizarBarras(sp);
        }
      });
    }

    // Forzar fin de combate
    if (this.turns && typeof this.turns._finDeCombate === "function") {
      this.turns._finDeCombate();
    }

   this.time.delayedCall(500, () => {
  if (typeof window.tacticsEvents !== "undefined") {
    const resultado = (this.enemigos.filter(e => e.vida > 0).length === 0);
    console.log(`📊 Fin combate táctico → ${resultado ? "Victoria" : "Derrota"}`);
    window.tacticsEvents.finalizarCombate(this, { win: resultado });
    // 🧭 STORYMODE: registrar victoria de monolito verde
if (resultado && this.volverData?.monolitoVerde) {
  console.log("📗 Trigger StoryMode: winMonolitoVerde");
  if (window.storyMode) window.storyMode.trigger("winMonolitoVerde");

  // 🎁 Recompensa personalizada Monolito Verde
  const recompensas = [];

  // 💰 1000–2000 oro
  const oro = Phaser.Math.Between(1000, 2000);
  recompensas.push({ key: "Monedas", nombre: "Monedas", cantidad: oro });

  // 🎲 Probabilidades simultáneas
  if (Math.random() < 0.25) recompensas.push({ key: "runaepica", nombre: "Runa épica", cantidad: 1 });
  if (Math.random() < 0.50) recompensas.push({ key: "cebo", nombre: "Cebo para dragones", cantidad: 3 });
  if (Math.random() < 0.25) recompensas.push({ key: "ceboepico", nombre: "Cebo para dragones épicos", cantidad: 2 });
  if (Math.random() < 0.10) recompensas.push({ key: "cebolegend", nombre: "Cebo para dragones legendarios", cantidad: 1 });
  if (Math.random() < 0.33) recompensas.push({ key: "randomegg", nombre: "Huevo aleatorio", cantidad: 1 });

  // 💾 Aplicar al inventario usando storyMode.giveRewards (que normaliza nombres y oro)
  if (window.storyMode?.giveRewards) {
    window.storyMode.giveRewards(recompensas);
  } else {
    // fallback por si storyMode aún no está cargado
    if (!window.inventarioJugador) window.inventarioJugador = [];
    recompensas.forEach(r => {
      const item = window.inventarioJugador.find(i => i.key === r.key);
      if (item) item.cantidad += r.cantidad;
      else window.inventarioJugador.push(r);
    });
  }

  // 🌟 Crear popup visual inline (sin depender del HUD de StoryMode)
  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;

  const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7).setDepth(9999).setInteractive();
  const box = this.add.rectangle(W / 2, H / 2, 600, 400, 0x222222, 0.9)
    .setStrokeStyle(3, 0xffffff)
    .setDepth(10000);

  const title = this.add.text(W / 2, H / 2 - 150, "🎉 Recompensa Monolito Verde", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "28px",
    color: "#00ff88"
  }).setOrigin(0.5).setDepth(10001);

  // Listado de recompensas
  let startY = H / 2 - 80;
  recompensas.forEach((r, i) => {
    const txt = this.add.text(W / 2, startY + i * 40, `• ${r.nombre} x${r.cantidad}`, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "22px",
      color: "#fff"
    }).setOrigin(0.5).setDepth(10001);
  });

  // Botón continuar
  const btn = this.add.text(W / 2, H / 2 + 140, "Continuar", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "24px",
    backgroundColor: "#444",
    padding: { left: 20, right: 20, top: 8, bottom: 8 },
    color: "#ffd700"
  })
    .setOrigin(0.5)
    .setInteractive()
    .setDepth(10001)
    .on("pointerdown", () => {
      


      // Botón continuar
const btn = this.add.text(W / 2, H / 2 + 140, "Continuar", {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "24px",
  backgroundColor: "#444",
  padding: { left: 20, right: 20, top: 8, bottom: 8 },
  color: "#ffd700"
})
  .setOrigin(0.5)
  .setInteractive()
  .setDepth(10001)
  .on("pointerdown", () => {
    // ✅ Trigger StoryMode al aceptar la recompensa
    if (window.storyMode && typeof window.storyMode.trigger === "function") {
      if (this.volverData?.monolitoVerde) window.storyMode.trigger("winMonolitoVerde");
      if (this.volverData?.monolitoRojo)  window.storyMode.trigger("winMonolitoRojo");
      if (this.volverData?.monolitoAzul)  window.storyMode.trigger("winMonolitoAzul");
      if (this.volverData?.monolitoDorado) window.storyMode.trigger("winMonolitoDorado");
    }

    overlay.destroy();
    box.destroy();
    title.destroy();
    btn.destroy();
    this.scene.start("SceneWorld");
  });

      overlay.destroy();
      box.destroy();
      title.destroy();
      btn.destroy();
      
      this.scene.start("SceneWorld");
    });

  return; // detener flujo normal
}
if (resultado && this.volverData?.monolitoAzul && window.storyMode) {
  console.log("📘 Trigger StoryMode: winMonolitoAzul");
  window.storyMode.trigger("winMonolitoAzul");
}

if (resultado && this.volverData?.monolitoRojo && window.storyMode) {
  console.log("📕 Trigger StoryMode: winMonolitoRojo");
  window.storyMode.trigger("winMonolitoRojo");
}

if (resultado && this.volverData?.monolitoDorado && window.storyMode) {
  console.log("📙 Trigger StoryMode: winMonolitoDorado");
  window.storyMode.trigger("winMonolitoDorado");
}
  } else {
    console.warn("⚠️ tacticsEvents no encontrado, no se puede lanzar recompensa.");
  }
});

  }
});
/******************************
 * ⌨️ SHORTCUTS DE COMBATE
 * =============================
 * E → Fin de turno
 * A → Ataque (modo mordisco)
 * Q → Aliento
 ******************************/
this.input.keyboard.on("keydown-E", () => {
  if (!this.turnoEnProgreso && this.btnPasarTurno?.input?.enabled) {
    console.log("⏩ Shortcut [E]: fin de turno");
    this.finalizarTurno();
  }
});

this.input.keyboard.on("keydown-A", () => {
  if (!this.turnoEnProgreso && this.btnMordiscoTactico?.input?.enabled) {
    console.log("⚔️ Shortcut [A]: ataque básico");
    if (this.attackMode) this.exitAttackMode();
    else this.enterAttackMode();
  }
});

this.input.keyboard.on("keydown-Q", () => {
  if (!this.turnoEnProgreso && this.btnAliento?.input?.enabled) {
    console.log("🔥 Shortcut [Q]: aliento");
    if (this.alientoMode) this.exitAlientoMode();
    else this.enterAlientoMode();
  }
});
// 💀 TRUCO MANUAL con tecla U
this.input.keyboard.on("keydown-U", () => {
  console.log("💀 TRUCO ACTIVADO MANUALMENTE: eliminando todos los enemigos...");
  (this.enemigos || []).forEach(d => { d.vida = 0; });

  if (this.sprites && this.sprites.length > 0) {
    this.sprites.forEach(sp => {
      const data = sp.getData("dragon");
      if (data && this.enemigos.includes(data)) {
        data.vida = 0;
        if (this.actualizarBarras) this.actualizarBarras(sp);
      }
    });
  }

  if (this.turns && typeof this.turns._finDeCombate === "function") {
    this.turns._finDeCombate();
  }

 this.time.delayedCall(500, () => {
  if (typeof window.tacticsEvents !== "undefined") {
    const resultado = (this.enemigos.filter(e => e.vida > 0).length === 0);
    console.log(`📊 Fin combate táctico → ${resultado ? "Victoria" : "Derrota"}`);
    window.tacticsEvents.finalizarCombate(this, { win: resultado });
    // 🧭 STORYMODE: registrar victoria de monolito verde
if (resultado && this.volverData?.monolitoVerde && window.storyMode) {
  console.log("📗 Trigger StoryMode: winMonolitoVerde");
  window.storyMode.trigger("winMonolitoVerde");
}
  } else {
    console.warn("⚠️ tacticsEvents no encontrado, no se puede lanzar recompensa.");
  }
});

});
// === 🔍 ESCALA GLOBAL DEL COMBATE (20% más grande) ===
const cam = this.cameras.main;
cam.setZoom(1.2); // 1.0 = normal → 1.2 = +20%
cam.centerOn(this.W / 2, this.H / 2);
console.log("🔍 Zoom global táctico aplicado (120%)");
}
// Fichas Dragon
// === 📜 POPUP DE DETALLE DE DRAGÓN ===
mostrarPopupDragon(dragon) {
  if (!dragon) return;
  if (this.popupDragon) this.popupDragon.destroy();

  // Fondo semitransparente
  const fondo = this.add.rectangle(this.W / 2, this.H / 2, this.W, this.H, 0x000000, 0.6)
    .setInteractive()
    .on("pointerdown", () => {
      this.popupDragon.destroy();
      this.popupDragon = null;
    });

  // Contenedor principal
  const ancho = 400, alto = 480;
  const cont = this.add.container(this.W / 2, this.H / 2);
  const fondoBox = this.add.rectangle(0, 0, ancho, alto, 0x1a1a1a, 0.95)
    .setStrokeStyle(3, 0xffffff)
    .setOrigin(0.5);
  cont.add(fondoBox);

 // Imagen del dragón (usa el key "_img" igual que en SceneSelector)
const imgKey = dragon.name + "_img";
const img = this.add.image(0, -alto / 2 + 120, imgKey)
  .setScale(0.5)
  .setOrigin(0.5)
  .setDepth(1);
cont.add(img);

  // Nombre + nivel (color rareza)
  const colorRareza = (() => {
    switch (dragon.rareza) {
      case "Legendario": return "#ffd700";
      case "Épico": return "#b060ff";
      case "Raro": return "#33ccff";
      default: return "#ffffff";
    }
  })();
  const txtNombre = this.add.text(0, -alto / 2 + 210,
    `${dragon.name}  Lv.${dragon.nivel || 1}`,
    { fontFamily: "'Cinzel Decorative', serif",fontSize: "22px", fill: colorRareza, fontStyle: "bold", fontFamily: "monospace" }
  ).setOrigin(0.5);
  cont.add(txtNombre);

  // Tipo y clase
  const txtTipoClase = this.add.text(0, -alto / 2 + 250,
    `${(dragon.tipo || "?").toUpperCase()} · ${dragon.clase || "?"}`,
    { fontFamily: "'Cinzel Decorative', serif",fontSize: "16px", fill: "#ccc", fontFamily: "monospace" }
  ).setOrigin(0.5);
  cont.add(txtTipoClase);

  // Línea separadora
cont.add(this.add.line(0, -alto / 2 + 285, -150, 0, 150, 0, 0xffffff, 0.3));

// 📊 Stats con iconos ASCII (alineados y más compactos)
const stats = [
  ["❤️ Vida", dragon.vida],
  ["⚔️ Mordisco", dragon.mordisco],
  ["🔥 Aliento", dragon.aliento],
  ["🛡️ Armadura", dragon.armadura],
  ["💨 Velocidad", dragon.velocidad],
  ["🔵 Nº Alientos", dragon.numAlientos]
];

// 🔹 Ajuste: bajamos un poco el bloque y reducimos spacing
let y = -alto / 2 + 315;
stats.forEach(([nombre, valor]) => {
  const t = this.add.text(-140, y, `${nombre}:`, {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "17px",
    fill: "#fff",
    fontFamily: "monospace"
  }).setOrigin(0, 0.5);

  const v = this.add.text(140, y, `${valor}`, {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "17px",
    fill: "#ffd700",
    fontFamily: "monospace"
  }).setOrigin(1, 0.5);

  cont.add(t);
  cont.add(v);
  y += 30; // spacing reducido
});

// Botón cerrar
const btnCerrar = this.add.text(ancho / 2 - 28, -alto / 2 + 22, "✖", {
  fontFamily: "'Cinzel Decorative', serif",fontSize: "18px",
  fill: "#ff6666",
  backgroundColor: "#000",
  padding: { left: 6, right: 6, top: 2, bottom: 2 }
}).setInteractive().on("pointerdown", () => {
  this.popupDragon.destroy();
  this.popupDragon = null;
});
cont.add(btnCerrar);

this.popupDragon = this.add.container(0, 0, [fondo, cont]).setDepth(9999);}


// push potis
actualizarPocionesHUD() {
  const roja = window.inventarioJugador?.find(i => i.nombre === "Poción Roja");
  const azul = window.inventarioJugador?.find(i => i.nombre === "Poción Azul");
  const nRoja = roja?.cantidad ?? 0;
  const nAzul = azul?.cantidad ?? 0;

  const todas = [...(this.hudAliados?.list || []), ...(this.hudEnemigos?.list || [])];
  todas.forEach(f => {
    if (f.txtRoja) f.txtRoja.setText("x" + nRoja);
    if (f.txtAzul) f.txtAzul.setText("x" + nAzul);
  });
}
  // === utilidades ===
  
    
  
  hexPointsFlat(x, y, r) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = Phaser.Math.DegToRad(60 * i);
      pts.push({ x: x + r * Math.cos(a), y: y + r * Math.sin(a) });
    }
    return pts;
  }

  getCell(c, r) { return this.casillas.find(x => x.col === c && x.row === r); }

  adyacentes(c, r) {
    const par = c % 2 === 0;
    const offs = par
      ? [[+1, 0], [+1, -1], [0, -1], [-1, -1], [-1, 0], [0, +1]]
      : [[+1, +1], [+1, 0], [0, -1], [-1, 0], [-1, +1], [0, +1]];
    return offs.map(([dc, dr]) => this.getCell(c + dc, r + dr)).filter(h => h);
  }
/** 🎯 Resalta las casillas en rango de ALIENTO (2–3 celdas de distancia) */
resaltarRangoAliento(col, row) {
  this.limpiarResaltados();

  const rango = [];
  for (let dx = -3; dx <= 3; dx++) {
    for (let dy = -3; dy <= 3; dy++) {
      const dist = IAtactic.distHex(col, row, col + dx, row + dy);
      if (dist >= 2 && dist <= 3) rango.push({ col: col + dx, row: row + dy });
    }
  }

  rango.forEach(pos => {
    const cell = this.getCell(pos.col, pos.row);
    if (cell) {
      const overlay = this.add.rectangle(cell.x, cell.y, this.cellW, this.cellH, 0xff0000, 0.35)
        .setDepth(10)
        .setData("tipo", "aliento")
        .setInteractive()
        .on("pointerdown", () => this.atacarConAliento(cell));
      this.resaltados.push(overlay);
    }
  });
}
 crearDragonSprite(x, y, d) {
  const cont = this.add.container(x, y);

  // 🔹 Determinar si es enemigo
  const esEnemigo = this.enemigos.includes(d);
  // 🌈 Hexágono base según rareza
  const colorPorRareza = {
    "Común": 0xaaaaaa,
    "Raro": 0x1e90ff,
    "Épico": 0x9932cc,
    "Legendario": 0xffd700
  };
  const colorHex = colorPorRareza[d.rareza] || 0xffffff;

  // Crear forma hexagonal
  const radioHex = this.hexSize * 0.85;
  const ptsHex = this.hexPointsFlat(0, 0, radioHex);
  const hexHalo = this.add.graphics();
  hexHalo.fillStyle(colorHex, 0.25);
  hexHalo.lineStyle(2, colorHex, 0.8);
  hexHalo.beginPath();
  hexHalo.moveTo(ptsHex[0].x, ptsHex[0].y);
  for (let i = 1; i < ptsHex.length; i++) hexHalo.lineTo(ptsHex[i].x, ptsHex[i].y);
  hexHalo.closePath();
  hexHalo.fillPath();
  hexHalo.strokePath();
  hexHalo.setDepth(-1); // debajo del dragón

  cont.add(hexHalo);
  cont.setData("haloRareza", hexHalo);

    this.tweens.add({
    targets: hexHalo,
    alpha: { from: 0.4, to: 0.8 },
    duration: 1600,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });
  // 🐉 Imagen principal del dragón
  const s = this.add.image(0, 0, d.name + "_mini").setScale(0.5);
  if (esEnemigo) s.setScale(-0.5, 0.5); // enemigos mirando hacia la izquierda
  cont.add(s);

  // 🧠 Datos base
  cont.setData("dragon", d);
  cont.setSize(60, 60).setInteractive();

  // === ❤️ BARRA DE VIDA ===
  const bgVida = this.add.rectangle(0, 35, 60, 6, 0x222222).setOrigin(0.5);
  const barraVida = this.add.rectangle(0, 35, 60, 6, 0x00ff00).setOrigin(0.5);
  const txtVida = this.add.text(-40, 29, `${d.vida}/${d.vidaMax || d.vida}`, {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "12px",
    fill: "#00ff00",
    fontFamily: "monospace"
  }).setOrigin(0, 0);

  // === 🔵 BARRA DE PA ===
  const bgPA = this.add.rectangle(0, 45, 60, 4, 0x222222).setOrigin(0.5);
  const barraPA = this.add.rectangle(0, 45, 60, 4, 0x3399ff).setOrigin(0.5);
  const txtPA = this.add.text(-40, 41, `${d.puntosAccion}`, {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "12px",
    fill: "#66ccff",
    fontFamily: "monospace"
  }).setOrigin(0, 0);

 // === 🌬️ BOLITAS DE ALIENTO ===
  const bolitas = this.add.container(0, 58).setDepth(15);
  const total = d.numAlientosInicial || d.numAlientos || 1;
  for (let i = 0; i < total; i++) {
    const activa = i < (d.numAlientos || 0);
    const color = esEnemigo
      ? (activa ? 0xff6666 : 0x553333)
      : (activa ? 0x66ccff : 0x444444);
    const bola = this.add.circle(-((total - 1) * 6) / 2 + i * 6, 0, 3, color, 1);
    bolitas.add(bola);
  }

  // === Añadir todo al contenedor ===
  cont.add(bgVida);
  cont.add(barraVida);
  cont.add(bgPA);
  cont.add(barraPA);
  cont.add(txtVida);
  cont.add(txtPA);
  cont.add(bolitas);
  // === 🛡️ ESCUDOS ===
const escudosCont = this.add.container(0, 68).setDepth(15);
const totalEscudos = d.bloqueosMax || 0;
for (let i = 0; i < totalEscudos; i++) {
  const usado = i < (d.bloqueosUsados || 0);
  const color = usado ? "#444444" : "#66ccff";
  // ✅ se crea dentro del contenedor, no en la escena
  const escudo = this.add.text(
    -((totalEscudos - 1) * 10) / 2 + i * 10,
    0,
    "🛡️",
    { fontSize: "14px", color }
  ).setOrigin(0.5);
  escudosCont.add(escudo);
}
// ✅ añadir el contenedor entero al dragón
cont.add(escudosCont);
cont.setData("escudosCont", escudosCont);

// Guardar referencia
cont.setData("escudosCont", escudosCont);

  // === Guardar referencias ===
  cont.setData("barraVida", barraVida);
  cont.setData("barraPA", barraPA);
  cont.setData("txtVida", txtVida);
  cont.setData("txtPA", txtPA);
  cont.setData("bolitas", bolitas);

  // === Inicializar ===
  this.actualizarBarras(cont);
  this.actualizarBolitas(cont);
  this.actualizarEscudos(cont);

  return cont;
}
/** 🎯 Actualiza las bolitas de aliento según tipo de dragón y estado */
actualizarBolitas(sprite) {
  if (!sprite) return;

  const d = sprite.getData("dragon");
  if (!d) return;

  const bolitas = sprite.getData("bolitas");
  if (!bolitas) return;

  // 🧹 Limpia las bolitas anteriores
  bolitas.removeAll(true);

  const total = d.numAlientosInicial || d.numAlientos || 1;
  const esEnemigo = this.enemigos.includes(d);

  // 🎨 Color activo según tipo elemental
  const colores = {
    fuego: 0xff3333,     // 🔥 rojo
    agua: 0x3399ff,      // 💧 azul
    trueno: 0xffee33,    // ⚡ amarillo
    striker: 0xffffff,   // 🎯 blanco
    roca: 0x996633,      // ⛰️ marrón
    misterio: 0xaa33ff   // 🕸️ morado
  };

  const tipo = (d.tipo || "").toLowerCase();
  const colorActivo = colores[tipo] || (esEnemigo ? 0xff6666 : 0x66ccff);
  const colorInactivo = 0x444444;

  // 📦 Crea y posiciona las bolitas
  for (let i = 0; i < total; i++) {
    const activa = i < (d.numAlientos || 0);
    const color = activa ? colorActivo : colorInactivo;
    const bola = this.add.circle(
      -((total - 1) * 6) / 2 + i * 6, // desplazamiento horizontal
      0,                              // vertical
      2.5,                            // radio
      color, 1
    );
    bolitas.add(bola);
  }
}
/** 🛡️ Actualiza visualmente los escudos del dragón (hexágonos pequeños y centrados sobre la mini) */
actualizarEscudos(sprite) {
  if (!sprite || !sprite.getData) return;
  const scene = sprite.scene;
  const d = sprite.getData("dragon");
  if (!d) return;

  // 🔹 Eliminar escudos anteriores
  const old = sprite.getData("escudosCont");
  if (old) old.destroy(true);

  // 📍 Nueva posición: entre la barra de vida y la miniatura
  const escudosCont = scene.add.container(0, 30).setDepth(20);
  sprite.add(escudosCont);
  sprite.setData("escudosCont", escudosCont);

  const total = d.bloqueosMax || 0;
  const usados = d.bloqueosUsados || 0;

  // 🔸 Hexágonos más pequeños y juntos
  const radio = 4;
  const sep = 10;
  const offset = -((total - 1) * sep) / 2;

  for (let i = 0; i < total; i++) {
    const usado = i < usados;
    const color = usado ? 0x444444 : 0x66ccff; // gris si gastado, azul si activo

    // 🟦 Forma hexagonal regular
    const points = [];
    for (let j = 0; j < 6; j++) {
      const ang = Phaser.Math.DegToRad(60 * j - 30);
      points.push({
        x: Math.cos(ang) * radio,
        y: Math.sin(ang) * radio
      });
    }

    const hex = scene.add.polygon(offset + i * sep, 0, points, color, 1)
      .setStrokeStyle(1, 0xffffff, 0.7)
      .setDepth(21);

    escudosCont.add(hex);
  }

  console.log(`🧩 Escudos de ${d.name} redibujados: ${usados}/${total}`);
}



/** 🌑 Comprueba si el dragón está embrujado (Eco de Sombras)
 * Si lo está, falla automáticamente su acción y pierde el turno
 * Retorna true si se cancela la acción.
 */
verificarDebuffMisterio(atacante) {
  if (!atacante) return false;
  if (atacante.debuffMisterio) {
    this.addLog(`🌑 ${atacante.name} está embrujado y falla su acción`);
    atacante.debuffMisterio = false;

    // Pequeño efecto visual
    const fx = this.add.circle(this.dragonActivo.x, this.dragonActivo.y - 40, 25, 0x9933ff, 0.4).setDepth(50);
    this.tweens.add({
      targets: fx,
      alpha: 0,
      scale: 2,
      duration: 700,
      ease: "Cubic.easeOut",
      onComplete: () => fx.destroy()
    });

    // Termina turno inmediatamente
    this.time.delayedCall(400, () => this.finalizarTurno());
    return true;
  }
  return false;
}



actualizarBarras(sprite) {
  if (!sprite) return;
  const d = sprite.getData("dragon");
  const barraVida = sprite.getData("barraVida");
  const barraPA = sprite.getData("barraPA");
  const txtVida = sprite.getData("txtVida");
  const txtPA = sprite.getData("txtPA");
  if (!barraVida || !barraPA) return;

  // === VIDA ===
  const vidaMax = d.vidaMax || d.vida || 1;
  const vidaPct = Math.max(0, d.vida / vidaMax);
  barraVida.width = 60 * vidaPct;
  const colorVida = Phaser.Display.Color.Interpolate.ColorWithColor(
    new Phaser.Display.Color(255, 0, 0),    // rojo
    new Phaser.Display.Color(0, 255, 0),    // verde
    100,
    vidaPct * 100
  );
  barraVida.fillColor = Phaser.Display.Color.GetColor(colorVida.r, colorVida.g, colorVida.b);

  if (txtVida) {
    txtVida.setText(`${Math.max(0, Math.round(d.vida))}/${vidaMax}`);
    txtVida.setColor(vidaPct < 0.3 ? "#ff4444" : "#00ff00");
  }

  // === PUNTOS DE ACCIÓN ===
  const paMax = Math.max(10, Math.floor((d.velocidad * 10) / 4));
  const paPct = Math.min(1, Math.max(0, d.puntosAccion / paMax));
  barraPA.width = 60 * paPct;
  barraPA.fillColor = paPct > 0.5 ? 0x3399ff : 0x0066cc;

  if (txtPA) {
    txtPA.setText(`${Math.max(0, Math.round(d.puntosAccion))}`);
    txtPA.setColor(paPct < 0.3 ? "#ff6666" : "#66ccff");
  }
}

 /** 🌟 Resalta el dragón activo con un pulso suave que se mueve con él */
activarResaltadoTurno(sprite) {
  this.desactivarResaltadoTurno();
  if (!sprite) return;

  const d = sprite.getData("dragon");
  const esJugador = this.aliados.includes(d);
  const color = esJugador ? 0x00bfff : 0xff5555;

  // === Crear halo hexagonal que siga al dragón ===
  const g = this.add.graphics();
  const drawHalo = () => {
    g.clear();
    const pts = this.hexPointsFlat(sprite.x, sprite.y, this.hexSize * 0.95);
    g.lineStyle(4, color, 0.9);
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.closePath();
    g.strokePath();
  };
  drawHalo();
  g.setDepth(11);
  sprite.setData("resaltadoTurno", g);

  // === Efecto de pulso lento ===
  this.tweenResaltado = this.tweens.add({
    targets: g,
    alpha: { from: 0.4, to: 0.9 },
    duration: 1800,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut"
  });

  // === Actualizar posición en cada frame ===
  const actualizarPos = () => {
    if (!g.active || !sprite.active) return;
    drawHalo();
    this.time.delayedCall(16, actualizarPos); // ~60 FPS
  };
  actualizarPos();
}

/** 💨 Elimina el resaltado actual del turno */
desactivarResaltadoTurno() {
  if (this.tweenResaltado) {
    this.tweenResaltado.stop();
    this.tweenResaltado = null;
  }

  // Destruye cualquier halo anterior
  (this.sprites || []).forEach(s => {
    const g = s.getData("resaltadoTurno");
    if (g) {
      g.destroy();
      s.setData("resaltadoTurno", null);
    }
  });
}


  // === movimiento ===
 
 
  intentarMover(p) {
  // ✅ Evitar error si aún no hay dragón activo
  if (!this.dragonActivo || !this.dragonActivo.getData) return;

  const dragon = this.dragonActivo.getData("dragon");
  if (!dragon || !this.aliados.includes(dragon)) return;
  if (dragon.puntosAccion < 10) {
    this.txtTurno.setText("❌ No tienes PA suficientes para moverte");
    this.addLog(`${dragon.name} no tiene PA para moverse`);
    return;
  }

  const c = this.dragonActivo.getData("col");
  const r = this.dragonActivo.getData("row");
  const ady = this.adyacentes(c, r).filter(h => !h.ocupante);
  let dest = null, dist = 999;
  ady.forEach(h => {
    const d = Phaser.Math.Distance.Between(p.x, p.y, h.x, h.y);
    if (d < dist && d < 60) { dist = d; dest = h; }
  });
  if (!dest) return;

  const old = this.getCell(c, r);
  if (old) old.ocupante = null;
  dest.ocupante = this.dragonActivo;
  this.dragonActivo.setData("col", dest.col);
  this.dragonActivo.setData("row", dest.row);

  this.tweens.add({
    targets: this.dragonActivo,
    x: dest.x,
    y: dest.y,
    duration: 300,
    ease: "Sine.easeInOut",
    onComplete: () => {
      dragon.puntosAccion = Math.max(0, dragon.puntosAccion - 10);
      this.actualizarBarras(this.dragonActivo);
      this.addLog(`${dragon.name} se mueve (${dragon.puntosAccion} PA restantes)`);

      if (dragon.puntosAccion < 10) {
        this.time.delayedCall(400, () => this.finalizarTurno());
      }
    }
  });
}

// attack mode
enterAttackMode() {
  if (!this.dragonActivo) return;
  this.attackMode = true;

  const c = this.dragonActivo.getData("col");
  const r = this.dragonActivo.getData("row");
  const ady = this.adyacentes(c, r);

  ady.forEach(cell => {
    const pts = this.hexPointsFlat(cell.x, cell.y, this.hexSize * 0.95);
    const poly = new Phaser.Geom.Polygon(pts.flatMap(p => [p.x, p.y]));

    const g = this.add.graphics();
    g.fillStyle(0xff0000, 0.45);
    g.fillPoints(pts, true);
    g.setDepth(9);
    g.setInteractive(poly, Phaser.Geom.Polygon.Contains);

    g.cellRef = cell;

    g.on("pointerdown", () => {
      const occ = cell.ocupante;
      if (occ && this.enemigos.includes(occ.getData("dragon"))) {
        this.resolveAttack(this.dragonActivo, occ, cell);
      } else {
        this.exitAttackMode(); // clic vacío = cancelar
      }
    });

    this.attackHighlights.push(g);
  });

  this.txtTurno.setText("Selecciona enemigo para atacar (⚔️)");
}
exitAttackMode() {
  this.attackMode = false;
  this.attackHighlights.forEach(g => g.destroy());
  this.attackHighlights = [];
  this.txtTurno.setText("Turno del jugador");

 }

// SECUENCIA ALIENTO
// === ALIENTO: modo de ataque con rango 2-3 (versión corregida para hexágonos flat-top) ===

/** 📏 Calcula distancia hexagonal correcta para rejilla flat-top */
distHexFlat(col1, row1, col2, row2) {
  // Conversión a coordenadas cúbicas para layout flat-top
  const x1 = col1;
  const z1 = row1 - (col1 - (col1 & 1)) / 2;
  const y1 = -x1 - z1;

  const x2 = col2;
  const z2 = row2 - (col2 - (col2 & 1)) / 2;
  const y2 = -x2 - z2;

  return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2), Math.abs(z1 - z2));
}

/** 🔥 Entra en modo de ataque de ALIENTO (rango 2–3 celdas de distancia) */
enterAlientoMode() {
  if (!this.dragonActivo) return;
  this.alientoMode = true;
  this.attackHighlights = [];

  const c = this.dragonActivo.getData("col");
  const r = this.dragonActivo.getData("row");

  // 🔹 Recorre todas las casillas y marca las que están a 2-3 hex de distancia (flat-top)
  this.casillas.forEach(cell => {
    const dist = this.distHexFlat(c, r, cell.col, cell.row);
    if (dist >= 2 && dist <= 3) {
      const pts = this.hexPointsFlat(cell.x, cell.y, this.hexSize * 0.95);
      const poly = new Phaser.Geom.Polygon(pts.flatMap(p => [p.x, p.y]));

      const g = this.add.graphics();
      g.fillStyle(0xff0000, 0.45);
      g.fillPoints(pts, true);
      g.setDepth(9);
      g.setInteractive(poly, Phaser.Geom.Polygon.Contains);
      g.cellRef = cell;

      g.on("pointerdown", () => {
        const occ = cell.ocupante;
        if (occ && this.enemigos.includes(occ.getData("dragon"))) {
          this.resolveAliento(this.dragonActivo, occ, cell);
        } else {
          this.exitAlientoMode(); // clic vacío = cancelar
        }
      });

      this.attackHighlights.push(g);
    }
  });

  // 🔵 Marcar la posición del dragón activo (origen del aliento)
  const origenCell = this.getCell(c, r);
  if (origenCell) {
    const pts = this.hexPointsFlat(origenCell.x, origenCell.y, this.hexSize * 0.95);
    const g = this.add.graphics();
    g.fillStyle(0x0077ff, 0.25);
    g.fillPoints(pts, true);
    g.setDepth(8);
    this.attackHighlights.push(g);
  }

  this.txtTurno.setText("Selecciona enemigo para atacar con Aliento (🔥)");
}




/** 🚪 Sale del modo de aliento y limpia los resaltados */
exitAlientoMode() {
  this.alientoMode = false;
  this.attackHighlights.forEach(g => g.destroy());
  this.attackHighlights = [];
  this.txtTurno.setText("Turno del jugador");
}


/******************************
 * ⚔️ ATAQUE FÍSICO (MORDISCO)
 ******************************/
resolveAttack(atacanteSprite, defensorSprite, cellDestino) {
  const atacante = atacanteSprite?.getData("dragon");
  const defensor = defensorSprite?.getData("dragon");

  if (this.verificarDebuffMisterio(atacante)) return;

  if (!atacante || !defensor) {
    console.warn("❌ resolveAttack: atacante o defensor no definidos");
    this.finalizarTurno();
    return;
  }

  // 🛑 Si alguno está muerto o sin PA suficientes (mordisco = 20 PA)
  if (atacante.vida <= 0 || defensor.vida <= 0) {
    this.finalizarTurno();
    return;
  }
  if (atacante.puntosAccion < 20) {
    this.addLog(`${atacante.name} no tiene PA suficientes para morder`);
    return; // 🔹 no ataca, pero sigue su turno
  }

  // 💥 Calcular daño base (con ligera variación)
  const randomMod = Phaser.Math.Between(-2, 2);
  const base = (atacante.mordisco || 5) * 1.5; // +50% mordisco base

  // 🛡️ Escalar reducción de daño con fórmula porcentual
  const armadura = defensor.armadura || 0;
  const reduccionPct = armadura / (armadura + 100);

 // 💨 Probabilidad de esquiva (base + bonos de Invisibilidad 💢 u otros)
const baseEsquiva = Math.min(0.5, (defensor.velocidad || 0) * 0.03); // hasta 50 % por velocidad
const bonusInvis = defensor.esquivaExtra || 0; // otorgado por la skill 💢 Invisibilidad
const probEsquiva = Math.min(0.95, baseEsquiva + bonusInvis); // límite máximo 95 %
const esquiva = Math.random() < probEsquiva;
  // 🔸 Animación de avance
  this.tweens.add({
    targets: atacanteSprite,
    x: atacanteSprite.x + (atacanteSprite.x < defensorSprite.x ? 20 : -20),
    duration: 150,
    yoyo: true,
    ease: "Sine.easeInOut",
    onComplete: () => {
      if (esquiva) {
  // 💨 Texto de esquiva
  const esquivaTxt = this.add.text(defensorSprite.x, defensorSprite.y - 35, "💨 ESQUIVA", {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "18px",
    fill: "#00ffff",
    stroke: "#000",
    strokeThickness: 3
  }).setOrigin(0.5).setDepth(2000);

  this.tweens.add({
    targets: esquivaTxt,
    y: defensorSprite.y - 80,
    alpha: 0,
    duration: 800,
    onComplete: () => esquivaTxt.destroy()
  });

  this.addLog(`${defensor.name} esquiva el mordisco de ${atacante.name}`);

  // ⚡ Gasto de PA aunque falle
  atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
  this.actualizarBarras(atacanteSprite);

  // 🧠 Continuación IA o fin de turno
  const esIA = this.enemigos.includes(atacante);
  const puedeActuar = atacante.puntosAccion >= 10 && atacante.vida > 0;
  if (esIA) {
    if (puedeActuar && window.IAtactic?.playTurn) {
      this.time.delayedCall(600, () => window.IAtactic.playTurn(this, atacanteSprite));
    } else {
      this.time.delayedCall(600, () => this.finalizarTurno());
    }
  } else {
    if (atacante.puntosAccion < 10) {
      this.time.delayedCall(600, () => this.finalizarTurno());
    } else {
      this.addLog(`${atacante.name} aún puede actuar (${atacante.puntosAccion} PA)`);
      this.setBotonesActivos(true);
    }
  }

  return; // ✅ salir tras manejar turno y PA
}
 else {
        // 💥 Daño tras reducción y variación aleatoria
        const dmgBase = base * (1 - reduccionPct);
        const dmg = Math.max(1, Math.floor(dmgBase + randomMod));

        // ⚔️ Intentar bloqueo o contraataque
if (intentarBloqueoYContraataque(this, defensorSprite, atacanteSprite)) {
  // Si bloquea, gastar PA igualmente
  atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
  this.actualizarBarras(atacanteSprite);
  this.addLog(`${defensor.name} bloquea el ataque de ${atacante.name}`);

  // 🧠 Continuar lógica IA si el atacante es enemigo
  const esIA = this.enemigos.includes(atacante);
  const puedeActuar = atacante.puntosAccion >= 10 && atacante.vida > 0;

        if (esIA) {
          if (puedeActuar && window.IAtactic?.playTurn) {
            this.time.delayedCall(600, () => window.IAtactic.playTurn(this, atacanteSprite));
          } else {
            this.time.delayedCall(600, () => this.finalizarTurno());
          }
        } else {
          // Jugador: permitir seguir actuando
          if (atacante.puntosAccion < 10) {
            this.time.delayedCall(600, () => this.finalizarTurno());
          } else {
            this.addLog(`${atacante.name} aún puede actuar (${atacante.puntosAccion} PA)`);
            this.setBotonesActivos(true);
          }
        }

        return; // ⬅️ salimos después de reprogramar IA o turno
      }


        // 🩸 Aplicar daño
        defensor.vida = Math.max(0, defensor.vida - dmg);
        this.actualizarBarras(defensorSprite);

        // 💥 Texto flotante del daño
        const dmgText = this.add.text(defensorSprite.x, defensorSprite.y - 40, `-${Math.round(dmg)}`, {
          fontFamily: "'Cinzel Decorative', serif",fontSize: "22px",
          fill: "#ff3333",
          stroke: "#000",
          strokeThickness: 3,
          fontFamily: "monospace"
        }).setOrigin(0.5).setDepth(2000);

        this.tweens.add({
          targets: dmgText,
          y: defensorSprite.y - 80,
          alpha: 0,
          duration: 900,
          ease: "Cubic.easeOut",
          onComplete: () => dmgText.destroy()
        });

        this.addLog(`${atacante.name} muerde a ${defensor.name} (-${Math.round(dmg)} HP)`);

        // ☠️ Si el defensor muere
        if (defensor.vida <= 0) {
          this.time.delayedCall(250, () => {
            this.addLog(`☠️ ${defensor.name} ha caído`, "#ff6666");
            defensorSprite.destroy();
            const c = this.getCell(defensorSprite.getData("col"), defensorSprite.getData("row"));
            if (c) c.ocupante = null;
            if (this.limpiarCasillasMuertos) this.limpiarCasillasMuertos();
          });
        }
      }

      // ⚡ Gastar PA y actualizar barra
      atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
      this.actualizarBarras(atacanteSprite);

      // 🧠 IA o jugador: decidir si continuar
      const esIA = this.enemigos.includes(atacante);
      const puedeActuar = atacante.puntosAccion >= 10 && atacante.vida > 0;

      if (esIA) {
        if (puedeActuar && window.IAtactic?.playTurn) {
          this.time.delayedCall(500, () => window.IAtactic.playTurn(this, atacanteSprite));
        } else {
          this.time.delayedCall(500, () => this.finalizarTurno());
        }
      } else {
        if (atacante.puntosAccion < 10) {
          this.time.delayedCall(500, () => this.finalizarTurno());
        } else {
          this.addLog(`${atacante.name} aún puede actuar (${atacante.puntosAccion} PA)`);
          this.setBotonesActivos(true);
        }
      }
    }
  });
}



// 🔥 Ejecuta ataque de Aliento 
resolveAliento(atacanteSprite, objetivoSprite, objetivoCell) {
  if (!atacanteSprite || !objetivoSprite) { 
    this.exitAlientoMode(); 
    return; 
  }

  const atacante = atacanteSprite.getData("dragon");
  const defensor = objetivoSprite.getData("dragon");

  if (this.verificarDebuffMisterio(atacante)) return;

  // 💨 Verificar que queden alientos
  if (atacante.numAlientos <= 0) {
    const t = this.add.text(500, 40, "❌ Sin alientos", { fontFamily: "'Cinzel Decorative', serif",fontSize: "18px", fill: "#ff6666" }).setOrigin(0.5);
    this.time.delayedCall(900, () => t.destroy());
    this.exitAlientoMode();
    return;
  }

  // 💨 Verificar PA suficientes (aliento = 20 PA)
  if (atacante.puntosAccion < 20) {
    this.addLog(`${atacante.name} no tiene PA suficientes para lanzar aliento`);
    this.exitAlientoMode();
    return; // ❌ No gasta aliento ni PA, pero sigue turno
  }

  atacante.numAlientos--; // ✅ Solo se resta si tiene PA suficientes

  // 🛑 Si alguno está muerto
  if (atacante.vida <= 0 || defensor.vida <= 0) {
    this.finalizarTurno();
    return;
  }

// ⚡ Probabilidad de esquiva (escala más lenta con velocidad + bonus por 💢 Invisibilidad)
const baseEsquiva = Math.min(0.50, defensor.velocidad * 0.017);
const bonusInvis = defensor.esquivaExtra || 0; // 💢 otorgado por la skill Invisibilidad
const probEsquiva = Math.min(0.95, baseEsquiva + bonusInvis); // límite 95 %
const roll = Math.random();
 if (roll < probEsquiva) {
  const esquivaTxt = this.add.text(objetivoSprite.x, objetivoSprite.y - 40, "⚡ ESQUIVA", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "22px",
    fill: "#00ffff",
    fontStyle: "bold"
  }).setOrigin(0.5).setDepth(12);

  this.tweens.add({
    targets: esquivaTxt,
    y: objetivoSprite.y - 80,
    alpha: 0,
    duration: 900,
    ease: "Cubic.easeOut",
    onComplete: () => esquivaTxt.destroy()
  });

  this.tweens.add({
    targets: objetivoSprite,
    x: objetivoSprite.x + Phaser.Math.Between(-25, 25),
    duration: 120,
    yoyo: true,
    ease: "Sine.easeInOut"
  });

  this.addLog(`${defensor.name} esquiva el aliento`);
  this.exitAlientoMode();

  // ⚡ Gasto de PA aunque falle
  atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
  this.actualizarBarras?.(atacanteSprite);
  this.actualizarBolitas?.(atacanteSprite);

  // 🧠 **FIN DE TURNO O CONTINUACIÓN IA TRAS ESQUIVA**
  const esIA = this.enemigos.includes(atacante);
  const puedeActuar = atacante.puntosAccion >= 10 && atacante.vida > 0;

  if (esIA) {
    if (puedeActuar && window.IAtactic?.playTurn) {
      this.time.delayedCall(600, () => window.IAtactic.playTurn(this, atacanteSprite));
    } else {
      this.time.delayedCall(600, () => this.finalizarTurno());
    }
  } else {
    if (atacante.puntosAccion < 10) {
      this.time.delayedCall(600, () => this.finalizarTurno());
    } else {
      this.addLog(`${atacante.name} aún puede actuar (${atacante.puntosAccion} PA)`);
      this.setBotonesActivos(true);
    }
  }

  return; // ✅ salir sin continuar
}

// 🔥 Daño base de aliento (más poderoso, ignora armadura)
const randomMod = Phaser.Math.Between(-5, 5);
let dmg = Math.floor(atacante.aliento * 2.5) + randomMod; // 💪 aliento ×2.5, sin restar armadura

// Evita valores negativos por azar
if (dmg < 0) dmg = 0;

  // 💥 Crítico leve
  if (Math.random() < 0.15) {
    dmg = Math.floor(dmg * 1.5);
    const critTxt = this.add.text(objetivoSprite.x, objetivoSprite.y - 60, "💥 CRÍTICO!", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "26px",
      fill: "#ffd700",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(12);
    this.tweens.add({
      targets: critTxt,
      y: objetivoSprite.y - 100,
      alpha: 0,
      duration: 1000,
      ease: "Cubic.easeOut",
      onComplete: () => critTxt.destroy()
    });
    this.addLog(`¡Crítico de ${atacante.name}!`, "#ffd700");
  }
// 💨 Efecto visual de proyectil
this.dispararAlientoTactico(atacanteSprite, objetivoSprite, atacante.tipo);
  // 🔥 Animación visual del aliento
  const color = coloresTipo[atacante.tipo] || 0xffffff;
  const fx = this.add.circle(objetivoSprite.x, objetivoSprite.y, 40, color, 0.4).setDepth(50);
  this.tweens.add({
    targets: fx,
    alpha: 0,
    scale: 3,
    duration: 600,
    onComplete: () => fx.destroy()
  });

  // ⚔️ Daño o defensa
  if (dmg <= 0) {
    const defTxt = this.add.text(objetivoSprite.x, objetivoSprite.y - 40, "⚡ RESISTE", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "22px",
      fill: "#cccccc",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(12);
    this.tweens.add({
      targets: defTxt,
      y: objetivoSprite.y - 80,
      alpha: 0,
      duration: 900,
      onComplete: () => defTxt.destroy()
    });
    this.addLog(`${defensor.name} resiste el aliento`);
  } else {
    const dmgText = this.add.text(objetivoSprite.x, objetivoSprite.y - 30, "-" + dmg, {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "28px",
      fill: "#ff4444",
      fontStyle: "bold"
    }).setOrigin(0.5).setDepth(12);
    this.tweens.add({
      targets: dmgText,
      y: objetivoSprite.y - 90,
      alpha: 0,
      duration: 900,
      onComplete: () => dmgText.destroy()
    });
    this.addLog(`${atacante.name} inflige ${dmg} con su aliento`);
  }

  // 🩸 Aplicar daño
  defensor.vida = Math.max(0, defensor.vida - dmg);
  this.actualizarBarras(objetivoSprite);

  // ☠️ Si el enemigo muere
  if (defensor.vida <= 0) {
    const kill = this.add.text(objetivoSprite.x, objetivoSprite.y, "☠️", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "36px"
    }).setOrigin(0.5).setDepth(12);
    this.time.delayedCall(500, () => kill.destroy());
    if (objetivoCell) objetivoCell.ocupante = null;
    objetivoSprite.destroy();
    this.sprites = this.sprites.filter(s => s !== objetivoSprite);
    this.enemigos = this.enemigos.filter(d => d !== defensor);
    this.addLog(`${defensor.name} ha caído ☠️`);
  }

  // 🔄 Gasto de PA por lanzar aliento
  atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
  this.actualizarBarras(atacanteSprite);
  this.actualizarBolitas(atacanteSprite);

  this.exitAlientoMode();

  const esIA = this.enemigos.includes(atacante);
  if (esIA || atacante.puntosAccion < 10) {
    this.time.delayedCall(600, () => this.finalizarTurno());
  }
}

/** ⚡ Aplica el efecto de las nubes eléctricas activas */
aplicarNubesActivas() {
  const nuevas = [];

  this.nubesActivas.forEach(nube => {
    // Reducir duración
    nube.duracionRestante--;

    // Daño base según el creador
    const dmg = Math.floor((nube.creador.aliento || 5) / 2);

    nube.area.forEach(cell => {
      const objetivo = cell.ocupante;
      if (!objetivo) return;
      const d = objetivo.getData("dragon");
      if (!d || d.vida <= 0) return;

      // Aplicar daño
      d.vida = Math.max(0, d.vida - dmg);
      this.actualizarBarras(objetivo);

      // Texto de daño
      const dmgTxt = this.add.text(cell.x, cell.y - 30, `-${dmg}`, {
        fontFamily: "'Cinzel Decorative', serif",fontSize: "18px",
        fill: "#ffff66",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(50);

      this.tweens.add({
        targets: dmgTxt,
        y: cell.y - 70,
        alpha: 0,
        duration: 900,
        ease: "Cubic.easeOut",
        onComplete: () => dmgTxt.destroy()
      });

      this.addLog(`⚡ ${d.name} recibe ${dmg} de la nube eléctrica`);
    });

    // Mantener las nubes activas vivas
    if (nube.duracionRestante > 0) nuevas.push(nube);
    else {
      // Eliminar efectos visuales
      nube.fx.forEach(f => f.destroy());
      this.addLog("☁️ La nube eléctrica se disipa");
    }
  });

  this.nubesActivas = nuevas;
}
// 💨 Animación de aliento (versión táctica)
// 💨 Animación de aliento (versión táctica)
dispararAlientoTactico(spriteAtacante, spriteDefensor, tipo) {
  if (!spriteAtacante || !spriteDefensor) return;

  // --- textura según tipo ---
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

  // --- crear sprite del proyectil ---
  const proyectil = this.add.image(spriteAtacante.x, spriteAtacante.y - 10, tex)
    .setScale(0.45)
    .setDepth(50)
    .setAlpha(1);

  // --- orientación ---
  const haciaDerecha = spriteAtacante.x < spriteDefensor.x;
  proyectil.flipX = !haciaDerecha;

  // --- tween de vuelo ---
  this.tweens.add({
    targets: proyectil,
    x: spriteDefensor.x,
    y: spriteDefensor.y - 10,
    duration: 450,
    ease: "Cubic.easeOut",
    onComplete: () => {
      if (!this.scene.isActive()) return;
      // 💥 flash de impacto
      const flash = this.add.image(spriteDefensor.x, spriteDefensor.y - 10, tex)
        .setScale(proyectil.flipX ? -0.8 : 0.8, 0.8)
        .setDepth(5)
        .setAlpha(0.7);

      this.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 1.6,
        duration: 350,
        ease: "Sine.easeOut",
        onComplete: () => flash.destroy()
      });

      proyectil.destroy();
    }
  });
}


  // === 🌟 Animación visual de "Fin de turno" ===
mostrarAnimacionFinTurno() {
  const texto = this.add.text(500, 320, "Fin de turno", {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "36px",
    fill: "#ffd700",
    fontStyle: "bold",
    stroke: "#000",
    strokeThickness: 6
  })
    .setOrigin(0.5)
    .setDepth(999);

  this.tweens.add({
    targets: texto,
    y: 240,         // se mueve hacia arriba
    alpha: 0,       // se desvanece
    duration: 1000, // 1 segundo
    ease: "Cubic.easeOut",
    onComplete: () => texto.destroy()
  });
}



/** 🎮 Activa o desactiva los botones de acción del jugador */
setBotonesActivos(activo) {
  if (this.btnPasarTurno) this.btnPasarTurno.setInteractive(activo);
  if (this.btnMordiscoTactico) this.btnMordiscoTactico.setInteractive(activo);
  if (this.btnAliento) this.btnAliento.setInteractive(activo);

  const color = activo ? "#fff" : "#777";
  const bg = activo ? "#333" : "#111";

  if (this.btnPasarTurno) this.btnPasarTurno.setStyle({ fill: color, backgroundColor: bg });
  if (this.btnMordiscoTactico) this.btnMordiscoTactico.setStyle({ fill: color, backgroundColor: bg });
  if (this.btnAliento) this.btnAliento.setStyle({ fill: color, backgroundColor: bg });
}
/** 🕒 Finaliza el turno actual y pasa al siguiente */
finalizarTurno() {
  if (this.turnoEnProgreso) return; // evitar dobles llamadas
  this.turnoEnProgreso = true;

  this.setBotonesActivos(false);
  this.exitAttackMode?.();
  this.exitAlientoMode?.();
  this.mostrarAnimacionFinTurno();
// 🌬️ Comprobar regeneración de alientos del dragón que termina turno
try {
  const drag = this.dragonActivo?.getData?.("dragon");
  if (drag && drag.vida > 0) {
    drag.turnosDesdeUltimaRegen = (drag.turnosDesdeUltimaRegen || 0) + 1;

    if (drag.turnosDesdeUltimaRegen >= 5) {
      drag.turnosDesdeUltimaRegen = 0;
      const maxAlientos = drag.numAlientosInicial || drag.numAlientos || 1;
      if (drag.numAlientos < maxAlientos) {
        drag.numAlientos++;
        const sp = this.sprites.find(s => s.getData("dragon") === drag);
        if (sp) {
          this.actualizarBolitas?.(sp);
          this.addLog(`💨 ${drag.name} recupera 1 aliento`);

          // 🌟 Efecto visual elegante
          const fx = this.add.circle(sp.x, sp.y - 40, 25, 0x00bfff, 0.4).setDepth(60);
          this.tweens.add({
            targets: fx,
            scale: 2,
            alpha: 0,
            duration: 800,
            ease: "Cubic.easeOut",
            onComplete: () => fx.destroy()
          });

          const txt = this.add.text(sp.x, sp.y - 70, "+1 🌬️", {
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "22px",
            fill: "#66ccff",
            stroke: "#000",
            strokeThickness: 3
          }).setOrigin(0.5).setDepth(61);

          this.tweens.add({
            targets: txt,
            y: sp.y - 110,
            alpha: 0,
            duration: 900,
            ease: "Cubic.easeOut",
            onComplete: () => txt.destroy()
          });
        }
      }
    }
  }
} catch (err) {
  console.warn("⚠️ Error en regeneración de alientos, continuando turno:", err);
}
  // 🔁 Llamar al TurnManager tras breve delay
  this.time.delayedCall(600, () => {
    this.turnoEnProgreso = false;

    if (this.limpiarCasillasMuertos) this.limpiarCasillasMuertos(); // 🧹 limpieza antes de siguiente turno

    if (this.turns && typeof this.turns.next === "function") {
      this.turns.next();
    } else {
      console.warn("⚠️ TurnManager no disponible para pasar turno");
    }
  });
}

/** 🧹 Limpia casillas ocupadas por dragones muertos */
limpiarCasillasMuertos() {
  if (!this.casillas || !Array.isArray(this.casillas)) return;
  this.casillas.forEach(cell => {
    const occ = cell.ocupante;
    if (occ && (!occ.active || !occ.getData)) {
      cell.ocupante = null;
      return;
    }
    const drag = occ?.getData("dragon");
    if (occ && (!drag || drag.vida <= 0)) {
      // 💀 Dragón muerto o sin data: liberar casilla
      cell.ocupante = null;
      if (occ.destroy) occ.destroy();
    }
  });

  // 🧩 También limpiar array de sprites
  this.sprites = (this.sprites || []).filter(sp => {
    const d = sp.getData("dragon");
    return sp.active && d && d.vida > 0;
  });

  // 🧩 Reasignar ocupantes si algo se perdió
  this.casillas.forEach(cell => {
    if (cell.ocupante && !this.sprites.includes(cell.ocupante)) {
      cell.ocupante = null;
    }
  });
}

}
function intentarBloqueoYContraataque(scene, defensorSprite, atacanteSprite) {
  const def = defensorSprite.getData("dragon");
  const atk = atacanteSprite.getData("dragon");
  if (!def || !atk) return false;

  console.log("🧠 BLOQUEO → Iniciando chequeo:", def.name, {
    vida: def.vida,
    bloqueosUsados: def.bloqueosUsados,
    bloqueosMax: def.bloqueosMax
  });

  // 🧮 Probabilidad de BLOQUEO
  let probBloqueo;
  if (def.armadura <= 25) {
    probBloqueo = 5 + def.armadura * 1.2;
  } else {
    probBloqueo = 35 + (def.armadura - 25) * 1.0;
  }
  probBloqueo = Phaser.Math.Clamp(probBloqueo, 5, 45);

  const bloquea = Phaser.Math.Between(1, 100) <= probBloqueo;
  console.log(`🎲 Probabilidad ${probBloqueo.toFixed(1)}%, Resultado: ${bloquea}`);
  if (!bloquea) return false;

  // ✅ Bloqueo exitoso
  scene.addLog(`🛡️ ${def.name} bloquea el mordisco de ${atk.name} y contraataca!`);

  // 💠 Gastar escudo si existen variables
  if (typeof def.bloqueosUsados === "number" && typeof def.bloqueosMax === "number") {
    console.log(`🧩 Antes del gasto → usados: ${def.bloqueosUsados}/${def.bloqueosMax}`);
    if (def.bloqueosUsados < def.bloqueosMax) {
      def.bloqueosUsados++;
      console.log(`✅ Escudo gastado! Ahora → ${def.bloqueosUsados}/${def.bloqueosMax}`);
      scene.addLog(`🛡️ ${def.name} usa un escudo (${def.bloqueosMax - def.bloqueosUsados} restantes)`);
    } else {
      console.warn(`⚠️ ${def.name} NO tenía escudos disponibles`);
    }

    // 🔁 Forzar actualización visual con delay leve
    scene.time.delayedCall(50, () => {
      console.log(`🔄 Refrescando HUD escudos de ${def.name}`);
      scene.actualizarEscudos(defensorSprite);
    });
  } else {
    console.warn(`⚠️ ${def.name} no tiene propiedades de bloqueo válidas`);
  }

  // ✨ Efecto visual de bloqueo
  const fx = scene.add.circle(defensorSprite.x, defensorSprite.y, 35, 0x66ccff, 0.6).setDepth(40);
  scene.tweens.add({ targets: fx, alpha: 0, scale: 2.2, duration: 400, onComplete: () => fx.destroy() });

  // 💥 Daño del contraataque
  const dmgContra = Math.max(1, Math.floor((def.mordisco || 0) * 0.75));
  atk.vida = Math.max(0, atk.vida - dmgContra);
  scene.actualizarBarras(atacanteSprite);

  // Texto de daño flotante
  const dmgTxt = scene.add.text(atacanteSprite.x, atacanteSprite.y - 40, `-${dmgContra}`, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "22px",
    fill: "#ff3333",
    stroke: "#000",
    strokeThickness: 3
  }).setOrigin(0.5).setDepth(2000);
  scene.tweens.add({ targets: dmgTxt, y: atacanteSprite.y - 80, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => dmgTxt.destroy() });

  const fx2 = scene.add.circle(atacanteSprite.x, atacanteSprite.y, 35, 0xcc0000, 0.5).setDepth(40);
  scene.tweens.add({ targets: fx2, alpha: 0, scale: 2, duration: 400, onComplete: () => fx2.destroy() });

  scene.addLog(`🦴 ${def.name} contraataca a ${atk.name} (-${dmgContra} HP)`);

  if (atk.vida <= 0) {
    scene.addLog(`☠️ ${atk.name} muere por el contraataque`);
    atacanteSprite.destroy();
    const c = scene.getCell(atacanteSprite.getData("col"), atacanteSprite.getData("row"));
    if (c) c.ocupante = null;
  }

  console.log("🏁 BLOQUEO FINAL:", def.name, {
    bloqueosUsados: def.bloqueosUsados,
    bloqueosMax: def.bloqueosMax
  });

  return true;
}



