/***** =========================
 * ESCENA MISIONES PASIVAS
 * Enviar dragones INACTIVOS de la colección a misiones de 5 días.
 * Cada 5 días aparece una misión nueva "Pesca rápida en (tipo de isla)".
 * Al completar: añade 1-3 peces del bioma al inventario.
 * ========================== */
class SceneMisionesPasivas extends Phaser.Scene {
  constructor(){ super("SceneMisionesPasivas"); }

  /* ============
   *  ESTADO GLOBAL (persistente entre escenas)
   * ============ */
  static ensureGlobals() {
    if (!window.misionesPasivas) window.misionesPasivas = []; // [{id,titulo,bioma,diasRestantes,estado,dragonId}]
    if (typeof window._mp_spawnCountdown !== "number") window._mp_spawnCountdown = 0; // cuenta atrás hasta generar
    if (!window._mp_listenerOn) window._mp_listenerOn = false; // para no duplicar listener
  }

  preload(){
    // Iconos (reutilizo los que ya tienes en inventario)
    this.load.image("pezfuego", "assets/inventario/pezfuegoMED.png");
    this.load.image("pezagua", "assets/inventario/pezaguaMED.png");
    this.load.image("pezroca", "assets/inventario/pezrocaMED.png");
    this.load.image("peztrueno", "assets/inventario/peztruenoMED.png");
    this.load.image("pezmisterio", "assets/inventario/pezmisterioMED.png");
    this.load.image("pezstriker", "assets/inventario/pezstrikerMED.png");
  }

  create(){
    // 🧹 LIMPIEZA DE CAPTURA RESIDUAL
if (window.dragonCapturaActual) {
  console.warn("🧹 Limpieza: dragonCapturaActual residual eliminado.");
  delete window.dragonCapturaActual;
}
if (window.eventoCapturaPendiente) {
  console.warn("🧹 Limpieza: eventoCapturaPendiente eliminado.");
  delete window.eventoCapturaPendiente;
}
if (window.eventoActivo && window.eventoActivo.tipo === "captura") {
  console.warn("🧹 Limpieza: eventoActivo de tipo captura eliminado.");
  delete window.eventoActivo;
}
// ==========================================================
// 🔁 SISTEMA DE AVANCE DE DÍAS PARA MISIONES PASIVAS
// ==========================================================
if (typeof window._mp_spawnCountdown !== "number") window._mp_spawnCountdown = 5;
if (!window._mp_listenerOn) {
  console.log("🔁 Enganchando regenerador de Misiones Pasivas al calendario...");
  window._mp_listenerOn = true;

  const escena = this; // 🔒 Referencia a la escena real

  if (window.Calendario && typeof Calendario.onAvanzarDia === "function") {
    Calendario.onAvanzarDia(() => {
      console.log("📆 Avanza 1 día → procesando misiones pasivas...");

      // 1️⃣ Reducir días restantes de misiones en curso
      (window.misionesPasivas || []).forEach(m => {
        if (m.estado === "En curso" && m.diasRestantes > 0) {
          m.diasRestantes--;
          console.log(`⏳ ${m.titulo}: ${m.diasRestantes} días restantes`);
          if (m.diasRestantes <= 0) {
            m.estado = "PendienteBotin";
            m.diasRestantes = 0;
            escena._toast(`🏁 ${m.titulo} ha finalizado y está lista para recoger el botín`);
          }
        }
      });

      // 2️⃣ Bajar contador global para spawn de nuevas misiones
      if (window._mp_spawnCountdown > 0) window._mp_spawnCountdown--;

      // 3️⃣ Generar nuevas misiones si corresponde
      if (window._mp_spawnCountdown === 0) {
        try {
          SceneMisionesPasivas.prototype._spawnLoteMisiones.call(escena, 5);
          window._mp_spawnCountdown = 5;
          console.log("🌅 Nuevas misiones pasivas generadas automáticamente.");
        } catch (e) {
          console.warn("⚠️ Error regenerando misiones pasivas:", e);
        }
      }

      // 4️⃣ Refrescar interfaz si estamos dentro de la escena
      if (game.scene.isActive("SceneMisionesPasivas")) {
        escena._renderLista();
      }
    });
  } else {
    console.warn("⚠️ Calendario no disponible, regeneración diferida.");
  }
}

    SceneMisionesPasivas.ensureGlobals();

    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;
    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.75);

    this.add.text(W/2, 60, "📜 Misiones pasivas", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "36px",
      fill: "#ffd700",
      fontStyle: "bold",
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5);

    // Listener de calendario: cada día ↓ cuenta días y genera misiones cada 5 días
    this._armarCalendario();

   // Si no hay misiones o toca regenerar, genera 5 nuevas
if (window.misionesPasivas.length === 0 && window._mp_spawnCountdown === 0) {
  this._spawnLoteMisiones(5); // 🔹 genera 5 misiones
  window._mp_spawnCountdown = 5; // se regenerarán cada 5 días
}

    // UI lista misiones
this._renderLista();

   
  }

  /* =========================
   *   Calendario / temporizador
   * ========================= */
  _armarCalendario(){
    // Evita listeners duplicados
    if (window._mp_listenerOn) return;

    if (typeof Calendario?.onAvanzarDia === "function") {
      const off = Calendario.onAvanzarDia(()=>{
        // 1) Progreso de misiones en curso
        for (const m of (window.misionesPasivas || [])) {
          if (m.estado === "En curso") {
            m.diasRestantes = Math.max(0, (m.diasRestantes||0) - 1);
            if (m.diasRestantes === 0) {
              this._completarMision(m);
            }
          }
        }
      // 2) Regeneración completa cada 5 días
if (window._mp_spawnCountdown > 0) window._mp_spawnCountdown--;
if (window._mp_spawnCountdown === 0) {
  this._spawnLoteMisiones(5); // 🔹 genera nuevo set de 5
  window._mp_spawnCountdown = 5;
}
      });
      // guardo para poder limpiar si hiciera falta (similar a tu repelente)
      window._mp_listenerOn = true;
      window._mp_off = off;
    } else {
      console.warn("⚠️ Calendario no disponible; las misiones no avanzarán automáticamente.");
    }
  }

/* =========================
 *   Generación de misiones (sin borrar las existentes)
 * ========================= */
_spawnLoteMisiones(cantidad = 5) {
  // Asegura estructura global
  if (!window.misionesPasivas) window.misionesPasivas = [];

  // 🧹 Limpia misiones fallidas
  window.misionesPasivas = window.misionesPasivas.filter(m => m.estado !== "Fallida");

  // 🔒 Conserva las no archivadas
  const misionesActivas = window.misionesPasivas.filter(m => m.estado !== "Archivada");

  // 🔹 Calcula cuántas faltan hasta 5
  const faltan = Math.max(0, 5 - misionesActivas.length);
  if (faltan === 0) {
    console.log("⏳ No se generan misiones nuevas: ya hay 5 activas/en curso.");
    return;
  }

  // ✅ Si no existe _spawnMision (llamado fuera de escena), crea contexto correcto
  if (typeof this._spawnMision !== "function") {
    console.warn("⚠️ _spawnLoteMisiones llamado fuera de escena, recreando contexto...");
    const ctx = {
      _toast: console.log,
      _spawnMision: SceneMisionesPasivas.prototype._spawnMision
    };
    return SceneMisionesPasivas.prototype._spawnLoteMisiones.call(ctx, cantidad);
  }

  // 🔹 Genera solo las que faltan
  for (let i = 0; i < faltan; i++) {
    try {
      this._spawnMision(false); // genera sin mostrar toast individual
    } catch (e) {
      console.warn("⚠️ Error generando misión pasiva:", e);
    }
  }

  if (typeof this._toast === "function") {
    this._toast(`🧭 Se han añadido ${faltan} nuevas misiones pasivas.`);
  } else {
    console.log(`🧭 Se han añadido ${faltan} nuevas misiones pasivas (sin UI).`);
  }

  if (this.scene && this.scene.isActive && this.scene.isActive()) {
    this._renderLista();
  }
}

_spawnMision() {
  if (!window.misionesPasivas) window.misionesPasivas = [];

  const misionesActivas = window.misionesPasivas.filter(m => m.estado !== "Archivada");
  if (misionesActivas.length >= 5) {
    console.log("⏳ No se generan nuevas misiones: ya hay 5 o más activas.");
    return;
  }

  const biomas = [
    "volcan", "jungle", "helado", "cuevadragon", "desert",
    "pantano", "pradera", "volante2", "desert4", "forest"
  ];
  const bioma = Phaser.Utils.Array.GetRandom(biomas);

  // 🎲 Probabilidad de tipo
  const tipoRand = Math.random();

  let tipo = "pesca";
  let titulo = "";
  let dias = 10;
  let recompensa = null;
  let numDragonesNecesarios = 1;
  let dificultad = "Media";

  // ============================
  // 🥚 RESCATE DE HUEVOS (10%)
  // ============================
  if (tipoRand < 0.1) {
    tipo = "rescate_huevos";
    titulo = `🪶 Rescate de huevos en ${this._nombreBioma ? this._nombreBioma(bioma) : bioma}`;
    dias = 20;
    dificultad = "Épica";
    numDragonesNecesarios = 4;

    const huevos = [
      { tipo: "huevoroca", nombre: "Huevo de Roca" },
      { tipo: "huevoagua", nombre: "Huevo de Agua" },
      { tipo: "huevofuego", nombre: "Huevo de Fuego" },
      { tipo: "huevotrueno", nombre: "Huevo de Trueno" },
      { tipo: "huevomisterio", nombre: "Huevo de Misterio" },
      { tipo: "huevostriker", nombre: "Huevo Striker" }
    ];
    const huevoElegido = Phaser.Utils.Array.GetRandom(huevos);
    const cantidad = Phaser.Math.Between(1, 2);
    recompensa = { tipo: huevoElegido.tipo, nombre: huevoElegido.nombre, cantidad };

  // ============================
  // 🔧 BÚSQUEDA DE MATERIALES (20%)
  // ============================
  } else if (tipoRand < 0.3) {
    tipo = "busqueda_materiales";
    titulo = `🔧 Búsqueda de materiales en ${this._nombreBioma ? this._nombreBioma(bioma) : bioma}`;

    const diffRand = Math.random();
    if (diffRand < 0.4) dificultad = "Fácil";
    else if (diffRand < 0.7) dificultad = "Media";
    else if (diffRand < 0.9) dificultad = "Difícil";
    else dificultad = "Imposible";

    dias = Phaser.Math.Between(6, 14);
    numDragonesNecesarios = Phaser.Math.Between(1, 3);

    const materiales = [
      { tipo: "cebo", nombre: "Cebo de Dragones" },
      { tipo: "pocionroja", nombre: "Poción Roja" },
      { tipo: "pocionazul", nombre: "Poción Azul" },
      { tipo: "Curacion", nombre: "Materiales de curación" },
      { tipo: "Tomo", nombre: "Tomo de Técnicas de Dragones" }
    ];
    const matElegido = Phaser.Utils.Array.GetRandom(materiales);
    const cantidad = Phaser.Math.Between(1, 3);
    recompensa = { tipo: matElegido.tipo, nombre: matElegido.nombre, cantidad };

  // ============================
  // 🐟 PESCA (50%)
  // ============================
  } else if (tipoRand < 0.8) {
    const pescaRand = Math.random();
    if (pescaRand < 0.5) {
      tipo = "pesca_basica";
      titulo = `Pesca rápida en ${this._nombreBioma ? this._nombreBioma(bioma) : bioma}`;
      dias = 5;
      numDragonesNecesarios = 1;
      dificultad = "Fácil";
      recompensa = { tipo: "pez", cantidad: [1, 3] };
    } else if (pescaRand < 0.75) {
      tipo = "pesca_avanzada";
      titulo = `Gran pesca en ${this._nombreBioma ? this._nombreBioma(bioma) : bioma}`;
      dias = 8;
      numDragonesNecesarios = 2;
      dificultad = "Media";
      recompensa = { tipo: "pez", cantidad: [2, 5] };
    } else if (pescaRand < 0.9) {
      tipo = "pesca_experta";
      titulo = `Expedición de pesca en ${this._nombreBioma ? this._nombreBioma(bioma) : bioma}`;
      dias = 12;
      numDragonesNecesarios = 3;
      dificultad = "Difícil";
      recompensa = { tipo: "pez", cantidad: [3, 7] };
    } else {
      tipo = "pesca_maestra";
      titulo = `Gran expedición de pesca en ${this._nombreBioma ? this._nombreBioma(bioma) : bioma}`;
      dias = 18;
      numDragonesNecesarios = 4;
      dificultad = "Imposible";
      recompensa = { tipo: "pez", cantidad: [5, 10] };
    }

  // ============================
  // 💰 TESORO (20%)
  // ============================
  } else {
    const subRand = Math.random();
    if (subRand < 0.5) {
      tipo = "tesoro_escondido";
      titulo = "Búsqueda del tesoro escondido";
      dias = 15;
      dificultad = "Media";
      numDragonesNecesarios = 1;
      recompensa = { tipo: "oro", cantidad: [400, 750] };
    } else if (subRand < 0.8) {
      tipo = "tesoro_misterioso";
      titulo = "Búsqueda del tesoro misterioso";
      dias = 21;
      dificultad = "Difícil";
      numDragonesNecesarios = 2;
      recompensa = { tipo: "oro", cantidad: [500, 1250] };
    } else {
      tipo = "tesoro_legendario";
      titulo = "Búsqueda del tesoro legendario";
      dias = 45;
      dificultad = "Imposible";
      numDragonesNecesarios = 3;
      recompensa = { tipo: "oro", cantidad: [1250, 2750] };
    }
  }

  // Crear misión
  const id = "MIS" + Date.now() + "_" + Math.floor(Math.random() * 9999);
  const nuevaMision = {
    id,
    tipo,
    titulo,
    bioma,
    diasTotales: dias,
    diasRestantes: dias,
    estado: "Disponible",
    dragonesAsignados: [],
    numDragonesNecesarios,
    recompensa,
    dificultad
  };

  window.misionesPasivas.push(nuevaMision);
  console.log(`🧭 Nueva misión generada: ${titulo} (${tipo}, ${dificultad})`);

  if (typeof this._toast === "function") {
    this._toast(`🧭 Nueva misión (${dificultad}): ${titulo}`);
  } else {
    console.log(`🧭 Nueva misión (${dificultad}): ${titulo}`);
  }

  if (this.scene && this.scene.isActive && this.scene.isActive()) {
    this._renderLista();
  }
}


  _nombreBioma(key){
    const map = {
      volcan:"Volcán",
      jungle:"Selva",
      helado:"Glacial",
      cuevadragon:"Cueva del Dragón",
      desert:"Desierto",
      pantano:"Pantano",
      pradera:"Pradera",
      volante2:"Isla Voladora",
      desert4:"Cañón Desértico",
      forest:"Bosque"
    };
    return map[key] || key;
  }

  /* =========================
   *   UI lista y selección
   * ========================= */
_renderLista() {
  const MAX_HISTORICO = 20; // máximo de misiones completadas/fallidas que se conservan
  
  // 🧹 Limpiar anteriores
  if (this._ui) this._ui.destroy(true);
  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;

  const group = this.add.container(0, 0);
  this._ui = group;

  // 🪶 Marco principal
  const caja = this.add.rectangle(W / 2, H / 2 + 60, 1100, 620, 0x222222, 1)
    .setStrokeStyle(2, 0xffffff);
  group.add(caja);

  const header = this.add.text(W / 2, 110,
    "Misiones (cada 5 días aparece una nueva)",
    { fontFamily: "'Cinzel Decorative', serif", fontSize: "20px", fill: "#fff" }
  ).setOrigin(0.5);
  group.add(header);

  // 🧾 Contenedor de lista con máscara de scroll
  const list = this.add.container(0, 0);
  group.add(list);
  const startY = 240;

  const maskShape = this.add.rectangle(W / 2, H / 2 + 60, 1040, 530, 0x000000, 0);
  const mask = maskShape.createGeometryMask();
  list.setMask(mask);

  // =========================
  // 1️⃣ Misiones activas
  // =========================
  const activas = (window.misionesPasivas || []).filter(m =>
  !["Archivada", "Fallida","Completada"].includes(m.estado)
);

  activas.forEach((m, i) => {
    const y = startY + i * 95;

    const marco = this.add.rectangle(W / 2, y, 1000, 80, 0x000000, 0.45)
      .setStrokeStyle(1, 0xffffff);
    list.add(marco);

    // 🔸 Icono según tipo
    let icono = "🐟";
    if (m.tipo?.includes("tesoro")) icono = "💰";

    const titulo = this.add.text(W / 2 - 470, y - 18, `${icono} ${m.titulo}`, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "18px", fill: "#ffd700"
    }).setOrigin(0, 0.5);
    list.add(titulo);

    // 🎚️ Dificultad y colores
    const diff = m.dificultad || "Media";
    const colorDiff =
      diff === "Fácil" ? "#66ff66" :
      diff === "Media" ? "#ffff66" :
      diff === "Difícil" ? "#ff9933" : "#ff5555";

    const textoEstado =
      `Estado: ${m.estado} · Dificultad: ${diff} · Duración: ${m.diasTotales || 5} días · ` +
      `Días restantes: ${m.estado === "En curso" ? m.diasRestantes : "-"}`;

    const estado = this.add.text(W / 2 - 470, y + 14, textoEstado, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "16px", fill: colorDiff
    }).setOrigin(0, 0.5);
    list.add(estado);

    // =========================
    // BOTONES SEGÚN ESTADO
    // =========================
    if (m.estado === "Disponible") {
      const dragonesNecesarios = m.numDragonesNecesarios || 1;
      const asignados = (m.dragonesAsignados?.length || 0);
      const btn = this._btn(W / 2 + 360, y, `Asignar (${asignados}/${dragonesNecesarios})`, "#006600");
      list.add(btn);

      btn.on("pointerdown", () => {
        this._elegirDragonInactivo(d => {
          if (!m.dragonesAsignados) m.dragonesAsignados = [];
          m.dragonesAsignados.push(d);
          d.enMisionPasiva = true;
          d.activo = false;

          const asignados = m.dragonesAsignados.length;
          if (asignados < dragonesNecesarios) {
            this._toast(`🐉 ${d.apodo || d.name} se ha unido (${asignados}/${dragonesNecesarios})`);
          } else {
            m.estado = "En curso";
            m.diasRestantes = m.diasTotales;
            this._toast(`✅ Misión iniciada: ${m.titulo}`);
          }
          this._renderLista();
        }, m);
      });

      const btnDescartar = this._btn(W / 2 + 480, y, "✖", "#440000");
      list.add(btnDescartar);
      btnDescartar.on("pointerdown", () => {
        m.estado = "Archivada";
        this._toast(`🗑️ Has descartado la misión: ${m.titulo}`);
        this._renderLista();
      });

    } else if (m.estado === "En curso") {
      const lbl = this.add.text(W / 2 + 330, y, "⏳ En progreso...", {
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "16px", fill: "#ccc", backgroundColor: "#333",
        padding: { left: 8, right: 8, top: 4, bottom: 4 }
      }).setOrigin(0.5);
      list.add(lbl);

      const btnDescartar = this._btn(W / 2 + 480, y, "✖", "#440000");
      list.add(btnDescartar);
      btnDescartar.on("pointerdown", () => {
        m.estado = "Archivada";
        this._toast(`🗑️ Has cancelado la misión: ${m.titulo}`);
        this._renderLista();
      });
    }

    else if (m.estado === "PendienteBotin") {
    
  const btn = this._btn(W / 2 + 365, y, "Recoger botín", "#774400");
  list.add(btn);

 btn.on("pointerdown", () => {
  // 🧩 Notificar al modo historia solo al pulsar Recoger botín
  if (window.storyMode) window.storyMode.checkLevelUnlocks();
  if (window.storyMode && m.dificultad === "Épica") {
    window.storyMode.trigger("epicPassiveQuestCompleted");
  }

  // === Guardar datos previos ===
  m.fechaCompletada = new Date().toISOString();
  m.probExitoFinal = m.probExitoFinal || m.ultimoProbExito || 0;
  m.rollFinal = m.rollFinal || m.ultimoRoll || 0;

  // === Función final tras entregar botín ===
  const finalizar = () => {
    // 🧠 Activar triggers del modo historia
    if (window.storyMode) {
      if (m.dificultad === "Fácil") window.storyMode.trigger("easyPassiveQuestCompleted");
      if (m.dificultad === "Épica") window.storyMode.trigger("epicPassiveQuestCompleted");
      window.storyMode.checkLevelUnlocks();
    }

    // 🧹 Limpiar misión y enviarla al histórico
    m.estado = "Completada";
    m.fechaCompletada = new Date().toISOString();

    // Liberar dragones asignados
    (m.dragonesAsignados || []).forEach(dr => {
      if (dr) {
        dr.enMisionPasiva = false;
        dr.activo = false;
      }
    });
    m.dragonesAsignados = [];

    // Refrescar UI (desaparece de activas → va al histórico)
    this._toast(`🏆 Misión completada: ${m.titulo}`);
    this._renderLista();
  };

  // === Asignar experiencia según dificultad ===
  const diff = m.dificultad || "Media";
  const xpPorDiff = { "Fácil": 50, "Media": 75, "Difícil": 125, "Imposible": 200 };
  const xpGanada = xpPorDiff[diff] || 75;

  const otorgarXP = () => {
    const dragonesAsignados = m.dragonesAsignados || [];
    if (dragonesAsignados.length === 0) return;

    dragonesAsignados.forEach(dr => {
      if (!dr) return;
      roleplay.addXP(dr, xpGanada, this, () => {
        if (roleplay.colaSubidas.length > 0 && !roleplay.subidaEnCurso)
          roleplay.procesarColaSubidas(this);
      });
    });

    roleplay.mostrarResumenXP(
      this,
      dragonesAsignados.map(d => ({ dragon: d, xp: xpGanada }))
    );
  };

  // === Recompensas ===
  const recompensa = m.recompensa || {};
  let key = recompensa.tipo;
  let nombre = recompensa.nombre || recompensa.tipo || "Recompensa";
  let cantidad = 1;

  // 💰 Oro
  if (recompensa.tipo === "oro") {
    otorgarXP();
    const base = Phaser.Math.Between(recompensa.cantidad[0], recompensa.cantidad[1]);
    cantidad = m.resultadoCritico ? base * 2 : base;
    if (!window.jugadorOro) window.jugadorOro = 0;
    window.jugadorOro += cantidad;
    this._popupBotin(`${cantidad} monedas de oro${m.resultadoCritico ? " ✨ (Crítico)" : ""}`, 1, "oro", finalizar);
  }

  // 🐟 Peces
  else if (recompensa.tipo === "pez") {
    otorgarXP();
    const base = Phaser.Math.Between(recompensa.cantidad[0] || 1, recompensa.cantidad[1] || 3);
    cantidad = m.resultadoCritico ? base * 2 : base;
    const { keyPez, nombrePez } = this._elegirPezPorBioma(m.bioma);
    key = keyPez; nombre = nombrePez;
    this._pushItem(nombrePez, cantidad, keyPez);
    this._popupBotin(`${nombrePez}${m.resultadoCritico ? " ✨ (Crítico)" : ""}`, cantidad, keyPez, finalizar);
  }

  // 🥚 Huevos
  else if (recompensa.tipo?.startsWith("huevo")) {
    otorgarXP();
    cantidad = recompensa.cantidad || 1;
    key = recompensa.tipo;
    this._pushItem(recompensa.nombre, cantidad, key);
    this._popupBotin(`${recompensa.nombre}${m.resultadoCritico ? " ✨ (Crítico)" : ""}`, cantidad, key, finalizar);
  }

  // 🎣 Otros objetos (tomo, poción, cebo, etc.)
  else {
    otorgarXP();
    cantidad = recompensa.cantidad || 1;
    key = recompensa.tipo;
    this._pushItem(nombre, cantidad, key);
    this._popupBotin(`${nombre}${m.resultadoCritico ? " ✨ (Crítico)" : ""}`, cantidad, key, finalizar);
  }

  // 💾 Guardar loot final
  m.lootFinal = { tipo: key, nombre, cantidad, key };
});
}

  });

 // =========================
// 2️⃣ SUBLISTADO HISTÓRICO
// =========================
const historico = (window.misionesPasivas || [])
  .filter(m => ["Completada", "Fallida"].includes(m.estado))
  .sort((a, b) => new Date(b.fechaCompletada || 0) - new Date(a.fechaCompletada || 0))
  .slice(0, MAX_HISTORICO);

if (historico.length > 0) {
  const offsetY = startY + activas.length * 95 + 40;
  const lblHist = this.add.text(W / 2, offsetY, "📜 Historial de misiones", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "22px",
    fill: "#bbb",
    fontStyle: "italic"
  }).setOrigin(0.5);
  list.add(lblHist);

  historico.forEach((m, i) => {
    const y = offsetY + 60 + i * 100;
    const marco = this.add.rectangle(W / 2, y, 1000, 80, 0x111111, 0.4)
      .setStrokeStyle(1, 0x666666);
    list.add(marco);

    const emoji = m.estado === "Completada"
      ? (m.resultadoCritico ? "💥" : "🎯")
      : "❌";

    const titulo = this.add.text(W / 2 - 430, y - 24, `${emoji} ${m.titulo}`, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "17px",
      fill: m.estado === "Completada" ? "#ffd700" : "#999"
    }).setOrigin(0, 0.5);
    list.add(titulo);

    // 🐉 Mostrar solo la mini del primer dragón
    const primerDragon = (m.dragonesAsignados && m.dragonesAsignados[0]) || null;
    if (primerDragon && primerDragon.name) {
      const miniKey = primerDragon.name + "_mini";
      if (this.textures.exists(miniKey)) {
        list.add(this.add.image(W / 2 - 480, y, miniKey).setScale(0.45));
      }
    }

    // 📊 Info técnica
    const dragones = (m.dragonesAsignados || [])
      .map(d => d.apodo || d.name)
      .join(", ") || "—";
    const prob = ((m.probExitoFinal || 0) * 100).toFixed(1);
    const tirada = ((m.rollFinal || 0) * 100).toFixed(1);
    const resumen = `Dragones: ${dragones} · Éxito: ${prob}% · Tirada: ${tirada}%`;
    list.add(this.add.text(W / 2 - 430, y + 4, resumen, {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "15px",
      fill: "#ccc"
    }).setOrigin(0, 0.5));

    // 💰 Mostrar icono y cantidad del botín
    if (m.recompensa) {
      let keyIcon = "oro";
      let cantidad = 0;
      let textoExtra = "";

      if (m.recompensa.tipo === "oro") {
        keyIcon = "oro";
        const base = Phaser.Math.Between(m.recompensa.cantidad[0], m.recompensa.cantidad[1]);
        cantidad = m.resultadoCritico ? base * 2 : base;
        textoExtra = `${cantidad}`;
      } else if (m.recompensa.tipo === "pez") {
        const base = Phaser.Math.Between(1, 3);
        cantidad = m.resultadoCritico ? base * 2 : base;
        const { keyPez } = this._elegirPezPorBioma(m.bioma);
        keyIcon = keyPez;
        textoExtra = `x${cantidad}`;
      } else {
        keyIcon = m.recompensa.tipo;
        cantidad = m.recompensa.cantidad || 1;
        textoExtra = `x${cantidad}`;
      }

      if (this.textures.exists(keyIcon)) {
        list.add(this.add.image(W / 2 + 420, y, keyIcon).setScale(0.55));
      }

      list.add(this.add.text(W / 2 + 385, y + 26, textoExtra, {
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "16px",
        fill: "#fff",
        backgroundColor: "#00000055",
        padding: { left: 6, right: 6, top: 2, bottom: 2 }
      }).setOrigin(0.5));
    }
  });
}


  // =========================
  // SCROLL CON RUEDA
  // =========================
  const totalItems = activas.length + (historico.length || 0);
  const maxScroll = Math.max(0, (totalItems * 95 + 200) - 520);
  list.y = 0;
  this.input.on("wheel", (p, objs, dx, dy) => {
    list.y -= dy * 0.5;
    if (list.y > 0) list.y = 0;
    if (list.y < -maxScroll) list.y = -maxScroll;
  });

  // =========================
  // BOTÓN VOLVER
  // =========================
  const btnVolver = this.add.text(W / 2, H - 40, "⬅ Volver a la Ciudad", {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "22px",
    fill: "#fff",
    backgroundColor: "#333",
    padding: { left: 18, right: 18, top: 8, bottom: 8 }
  }).setOrigin(0.5).setInteractive();

  btnVolver.on("pointerover", () =>
    btnVolver.setStyle({ backgroundColor: "#555", fill: "#ffd700" })
  );
  btnVolver.on("pointerout", () =>
    btnVolver.setStyle({ backgroundColor: "#333", fill: "#fff" })
  );
  btnVolver.on("pointerdown", () => this.scene.start("SceneCiudad"));
  group.add(btnVolver);
}
  _btn(x,y,texto,bg="#333"){
    const b = this.add.text(x,y,texto,{
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"16px", fill:"#fff", backgroundColor:bg,
      padding:{left:10,right:10,top:6,bottom:6}
    }).setOrigin(0.5).setInteractive();
    b.on("pointerover",()=>b.setStyle({backgroundColor:"#555",fill:"#ffd700"}));
    b.on("pointerout",()=>b.setStyle({backgroundColor:bg,fill:"#fff"}));
    return b;
  }

 /* =========================
 *   Selector avanzado de dragones (multi-selección con límite y % de éxito)
 * ========================= */
_elegirDragonInactivo(callback, misionActual = null) {
  const W = this.sys.game.config.width;
  const H = this.sys.game.config.height;

  const overlay = this.add.rectangle(W / 2, H / 2, W * 0.85, H * 0.8, 0x000000, 0.85)
    .setDepth(900)
    .setInteractive();

  const titulo = this.add.text(W / 2, H * 0.22, "Elige dragones INACTIVOS", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "28px",
    fill: "#ffd700",
    fontStyle: "bold"
  }).setOrigin(0.5).setDepth(901);

  const dragones = (window.dragonesJugador || []).filter(
    d => !d.activo && !d.enMisionPasiva
  );

  if (dragones.length === 0) {
    const aviso = this.add.text(W / 2, H / 2, "No hay dragones inactivos disponibles.", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px", fill: "#fff"
    }).setOrigin(0.5).setDepth(902);
    const cerrar = this._btn(W / 2, H * 0.8, "Cerrar");
    cerrar.setDepth(902);
    cerrar.on("pointerdown", () => { overlay.destroy(); titulo.destroy(); aviso.destroy(); cerrar.destroy(); });
    return;
  }

  const list = this.add.container(0, 0).setDepth(902);
  const baseY = H * 0.34;
  const colX = W * 0.5;
  const seleccionados = [];

  // 🔹 Límite de dragones
  const maxDragones = misionActual?.numDragonesNecesarios || 1;

  // === Mostrar stat dominante según bioma ===
  const statPorBioma = {
    volcan: "mordisco",
    jungle: "velocidad",
    helado: "mordisco",
    cuevadragon: "aliento",
    desert: "armadura",
    pantano: "aliento",
    pradera: "velocidad",
    volante2: "velocidad",
    desert4: "armadura",
    forest: "aliento"
  };
  const bioma = misionActual?.bioma || "volcan";
  const statKey = statPorBioma[bioma] || "mordisco";
  const statEmoji = { vida:"❤️", mordisco:"🗡️", aliento:"🔥", armadura:"🛡️", velocidad:"💨" }[statKey] || "⭐";
  const nombreBioma = this._nombreBioma(bioma);

  const txtStat = this.add.text(W / 2, H * 0.28, `${statEmoji} Stat clave: ${statKey.toUpperCase()} (${nombreBioma})`, {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
    fill: "#00ffcc",
    fontStyle: "bold"
  }).setOrigin(0.5).setDepth(901);

  // 🧮 Probabilidad de éxito (posición lateral)
  const txtProb = this.add.text(W * 0.75, H * 0.86, "Prob. de éxito: 0%", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
    fill: "#00ff99",
    fontStyle: "bold",
    align: "right"
  }).setOrigin(0.5).setDepth(903);

  const actualizarProb = () => {
    const diff = misionActual?.dificultad || "Media";

    console.log("🧭 DEBUG MISIÓN ACTUAL");
    console.log("➡️ Dificultad:", diff);
    console.log("➡️ Bioma:", bioma, "→ Stat usada:", statKey);

    if (seleccionados.length === 0) {
      txtProb.setText("Prob. de éxito: 0%");
      txtProb.setFill("#888");
      console.log("⚠️ Sin dragones seleccionados");
      return;
    }

    const valores = seleccionados.map(d => {
      const val = d?.[statKey] ?? 0;
      console.log(`   🐉 ${d?.name || "??"}: ${statKey}=${val}`);
      return val;
    });

    const statMedia = valores.reduce((a, b) => a + b, 0) / valores.length;
    console.log("📊 Media de stat:", statMedia);

   const params = {
        "Fácil":      { base: 0.75, inc: 0.015, max: 0.95 },
        "Media":      { base: 0.50, inc: 0.012, max: 0.90 },
        "Difícil":    { base: 0.35, inc: 0.010, max: 0.85 },
        "Imposible":  { base: 0.10, inc: 0.008, max: 0.80 }
      }[diff] || { base: 0.50, inc: 0.012, max: 0.90 };
    let probExito = params.base + (statMedia * params.inc);
    probExito = Phaser.Math.Clamp(probExito, 0.05, params.max);

    const color =
      probExito > 0.75 ? "#00ff66" :
      probExito > 0.5 ? "#ffff66" :
      probExito > 0.3 ? "#ffaa33" : "#ff4444";

    txtProb.setText(`Prob. de éxito: ${(probExito * 100).toFixed(1)}%`);
    txtProb.setFill(color);

    console.log(`⚙️ Base=${params.base}, Incremento=${params.inc}, Max=${params.max}`);
    console.log(`✅ ProbExito Final=${(probExito*100).toFixed(1)}%`);
  };

  // 🐉 Listado de dragones
  dragones.forEach((d, i) => {
    const y = baseY + i * 90;
    const marco = this.add.rectangle(colX, y, 780, 74, 0x000000, 0.35).setStrokeStyle(1, 0xffffff);
    list.add(marco);

    const miniKey = d.name + "_mini";
    if (this.textures.exists(miniKey)) {
      list.add(this.add.image(colX - 340, y, miniKey).setScale(0.5));
    }

    // Color por rareza
    const coloresRareza = {
      "Común": "#ccc",
      "Raro": "#00bfff",
      "Épico": "#bf00ff",
      "Legendario": "#ffd700"
    };
    const colorRareza = coloresRareza[d.rareza] || "#ccc";

    list.add(this.add.text(colX - 300, y - 18, `${d.apodo || d.name} [${d.rareza || "?"}]`, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "18px", fill: colorRareza
    }).setOrigin(0, 0.5));

    list.add(this.add.text(colX - 300, y + 6, `Tier ${d.tier || "?"} · Nv ${d.nivel || 1}`, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "14px", fill: "#aaa"
    }).setOrigin(0, 0.5));

    // 🔹 Stats visibles debajo
    const statsTxt = `❤️ ${d.vida}  🗡️ ${d.mordisco}  🔥 ${d.aliento}  🛡️ ${d.armadura}  💨 ${d.velocidad}`;
    list.add(this.add.text(colX - 300, y + 26, statsTxt, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize: "14px", fill: "#fff"
    }).setOrigin(0, 0.5));

    // Botón de selección / deselección
    const btn = this._btn(colX + 300, y, "➕", "#004400");
    list.add(btn);

    btn.on("pointerdown", () => {
      const idx = seleccionados.indexOf(d);

      if (idx >= 0) {
        seleccionados.splice(idx, 1);
        btn.setText("➕").setStyle({ backgroundColor: "#004400" });
        this._toast(`${d.name} eliminado`);
      } else {
        if (seleccionados.length >= maxDragones) {
          this._toast(`⚠️ Máximo ${maxDragones} dragón${maxDragones > 1 ? "es" : ""}`);
          return;
        }
        seleccionados.push(d);
        btn.setText("✔").setStyle({ backgroundColor: "#0066aa" });
        this._toast(`${d.name} añadido`);
      }

      actualizarProb();
    });
  });

  // 🖱️ Scroll
  const maskShape = this.add.rectangle(W / 2, H * 0.55, 820, 420, 0x000000, 0);
  const mask = maskShape.createGeometryMask();
  list.setMask(mask);
  const maxScroll = Math.max(0, dragones.length * 80 + 80 - 420);
  list.y = 0;
  this.input.on("wheel", (p, o, dx, dy) => {
    if (!overlay.active) return;
    list.y -= dy * 0.5;
    if (list.y > 0) list.y = 0;
    if (list.y < -maxScroll) list.y = -maxScroll;
  });

  // 🔘 Confirmar
  const btnConfirmar = this._btn(W / 2 - 80, H * 0.88, "Confirmar misión", "#004477");
  btnConfirmar.setDepth(904);
  btnConfirmar.on("pointerdown", () => {
    if (seleccionados.length < maxDragones) {
      this._toast(`⚠️ Necesitas ${maxDragones} dragón${maxDragones > 1 ? "es" : ""}`);
      return;
    }

    seleccionados.forEach(d => {
      d.enMisionPasiva = true;
      d.activo = false;
      if (!misionActual.dragonesAsignados) misionActual.dragonesAsignados = [];
      if (!misionActual.dragonesAsignados.includes(d)) {
        misionActual.dragonesAsignados.push(d);
      }
    });

    misionActual.estado = "En curso";
    misionActual.diasRestantes = misionActual.diasTotales;
    this._toast(`✅ Misión iniciada: ${misionActual.titulo}`);
    overlay.destroy(); titulo.destroy(); txtStat.destroy(); list.destroy(); txtProb.destroy(); btnConfirmar.destroy();
    this._renderLista();
  });

  // 🔘 Cancelar
  const btnCancelar = this._btn(W / 2 + 180, H * 0.88, "Cancelar", "#440000");
  btnCancelar.setDepth(904);
  btnCancelar.on("pointerdown", () => {
    overlay.destroy(); titulo.destroy(); txtStat.destroy(); list.destroy(); txtProb.destroy(); btnConfirmar.destroy(); btnCancelar.destroy();
  });
}


  /* =========================
   *   Completar misión → botín
   * ========================= */
  _completarMision(m) {
  // 🐉 Liberar dragones asignados
  const dragones = m.dragonesAsignados?.length
    ? m.dragonesAsignados
    : (m.dragonId ? [(window.dragonesJugador || []).find(x => (x.__uid || "") === m.dragonId)] : []);

  dragones.forEach(dr => {
    if (!dr) return;
    dr.enMisionPasiva = false;
    dr.activo = false;
  });

  // 🧮 Nivel promedio
  const nivelPromedio = dragones.length > 0
    ? dragones.reduce((a, d) => a + (d.nivel || 1), 0) / dragones.length
    : 1;

// ⚖️ Dificultad y éxito basado en la stat dominante del bioma
const diff = m.dificultad || "Media";
const dragonesAsignados = m.dragonesAsignados || [];

// 🔹 Stat dominante según bioma
const statPorBioma = {
  volcan: "mordisco",
  jungle: "velocidad",
  helado: "mordisco",
  cuevadragon: "aliento",
  desert: "armadura",
  pantano: "aliento",
  pradera: "velocidad",
  volante2: "velocidad",
  desert4: "armadura",
  forest: "mordisco"
};
const statKey = statPorBioma[m.bioma] || "mordisco";

// === LOG 1: info general ===
console.log("🧭 MISIÓN DEBUG");
console.log("➡️ Bioma:", m.bioma);
console.log("➡️ Dificultad:", diff);
console.log("➡️ Stat dominante (statKey):", statKey);

// 🔹 Obtener valores reales de los dragones
const valores = dragonesAsignados.map(d => {
  const val = d?.[statKey] ?? 0;
  console.log(`   🐉 ${d?.name || "??"} → ${statKey}: ${val}`);
  return val;
});
const statMedia = valores.length > 0
  ? valores.reduce((a, b) => a + b, 0) / valores.length
  : 0;
console.log("📊 Media de stat usada:", statMedia);

// 🎯 Parámetros por dificultad (actualizados)
const params = {
  "Fácil":      { base: 0.75, inc: 0.015, max: 0.95 },
  "Media":      { base: 0.50, inc: 0.015, max: 0.90 },
  "Difícil":    { base: 0.35, inc: 0.015, max: 0.85 },
  "Imposible":  { base: 0.10, inc: 0.015, max: 0.85 }
}[diff] || { base: 0.50, inc: 0.012, max: 0.90 };
console.log("⚙️ Parámetros dificultad:", params);

// 🧮 Calcular probabilidad total
let probExito = params.base + (statMedia * params.inc);
probExito = Phaser.Math.Clamp(probExito, 0.05, params.max);

// ✨ Crítico según statMedia
const probCritico = Phaser.Math.Clamp(0.005 * statMedia, 0, 0.25);

// === LOG 2: resultados calculados ===
console.log(`📈 Cálculo: base=${params.base}, inc=${params.inc}, statMedia=${statMedia}`);
console.log(`✅ ProbExito (raw)=${(params.base + (statMedia * params.inc)).toFixed(3)}, clamp=${(probExito*100).toFixed(1)}%`);
console.log(`💥 ProbCrítico=${(probCritico*100).toFixed(1)}%`);

// 🎲 Tirada
const roll = Math.random();
const exito = roll < probExito;
const critico = exito && Math.random() < probCritico;

// === LOG 3: tiradas ===
console.log(`🎲 Roll=${roll.toFixed(3)} | Éxito=${exito} | Crítico=${critico}`);



  // 🕓 Actualizar estado
m.estado = exito ? "PendienteBotin" : "Fallida";
  m.resultadoCritico = critico;
  m.fechaCompletada = new Date().toISOString();

  // 🗨️ Mensaje
  const emoji = exito ? (critico ? "💥" : "🎯") : "❌";
  const msg = exito
    ? `${emoji} ${m.titulo} completada (${diff})${critico ? " — ÉXITO CRÍTICO!" : ""}`
    : `${emoji} ${m.titulo} ha fallado (${diff}).`;
  this._toast(msg);
// ======================================================
// 🧮 Guardar datos para el histórico
// ======================================================
m.probExitoFinal = probExito || 0; // guarda el % real de probabilidad
m.rollFinal = roll || 0;           // guarda la tirada real (0–1)
m.fechaCompletada = new Date().toISOString();


  // Refrescar lista
  if (this.scene.isActive()) this._renderLista();

}
  _pushItem(nombre, cantidad, key){
    if (!window.inventarioJugador) window.inventarioJugador = [];
    let it = window.inventarioJugador.find(i => i.nombre === nombre || i.key === key);
    if (it) {
      it.cantidad += cantidad;
      if (!it.nombre) it.nombre = nombre;
      if (!it.key) it.key = key;
    } else {
      window.inventarioJugador.push({ nombre, cantidad, key });
    }
  }

  /* =========================
   *   Tabla de peces por bioma (alineada con Banco de Peces)
   * ========================= */
  _elegirPezPorBioma(bioma){
    // Distribuciones coherentes con eventos.bancopeces
    const dist = {
      volcan:      { principal:"pezfuego",  comunes:["pezroca","peztrueno"], raros:["pezstriker","pezmisterio","pezagua"] },
      jungle:      { principal:"pezstriker",comunes:["pezmisterio","pezagua"], raros:["pezfuego","pezroca","peztrueno"] },
      helado:      { principal:"pezagua",   comunes:["pezmisterio","pezstriker"], raros:["pezfuego","pezroca","peztrueno"] },
      cuevadragon: { principal:"pezmisterio",comunes:["pezagua","pezroca"],    raros:["pezfuego","peztrueno","pezstriker"] },
      desert:      { principal:"pezroca",   comunes:["peztrueno","pezfuego"],  raros:["pezstriker","pezmisterio","pezagua"] },
      pantano:     { principal:"pezmisterio",comunes:["pezstriker","pezagua"], raros:["pezfuego","pezroca","peztrueno"] },
      pradera:     { principal:"peztrueno", comunes:["pezstriker","pezagua"],  raros:["pezfuego","pezroca","pezmisterio"] },
      volante2:    { principal:"pezstriker",comunes:["peztrueno","pezmisterio"], raros:["pezagua","pezfuego","pezroca"] },
      desert4:     { principal:"pezroca",   comunes:["pezfuego","peztrueno"],  raros:["pezagua","pezmisterio","pezstriker"] },
      forest:      { principal:"pezagua",   comunes:["pezmisterio","pezstriker"], raros:["pezfuego","pezroca","peztrueno"] }
    };
    const nombres = {
      pezagua: "Pez gélido",
      pezmisterio: "Pez púrpura",
      pezroca: "Pez pétreo",
      peztrueno: "Pez dorado",
      pezfuego: "Pez ardiente",
      pezstriker: "Pez irisado"
    };

    const d = dist[bioma] || dist.jungle;
    const r = Math.random();
    let key;
    if (r < 0.45) key = d.principal;
    else if (r < 0.80) key = Phaser.Utils.Array.GetRandom(d.comunes);
    else key = Phaser.Utils.Array.GetRandom(d.raros);

    return { keyPez: key, nombrePez: nombres[key] || key };
  }

  /* =========================
   *   UI: popups / toasts
   * ========================= */
  _popupBotin(nombre, cantidad, key, onClose){
    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;

    const pop = this.add.container(W/2, H/2).setDepth(999);
    const fondo = this.add.rectangle(0,0, 560,240, 0x000000, 0.88).setStrokeStyle(2,0xffffff);
    pop.add(fondo);

    if (this.textures.exists(key)) {
      pop.add(this.add.image(-180, 0, key).setScale(1.0));
    }

    pop.add(this.add.text(40, -20, "¡Misión completada!", {
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"26px", fill:"#ffd700", stroke:"#000", strokeThickness:3
    }).setOrigin(0.5));

    pop.add(this.add.text(40, 26, `Botín: ${nombre} x${cantidad}`, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"20px", fill:"#fff"
    }).setOrigin(0.5));

    const btn = this._btn(0, 90, "Aceptar", "#444");
    pop.add(btn);
    btn.on("pointerdown", ()=>{ pop.destroy(); if (onClose) onClose(); });
  }

  _toast(msg){
    const W = this.sys.game.config.width;
    const t = this.add.text(W/2, 100, msg, {
      fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px", fill:"#fff", backgroundColor:"#000000aa",
      padding:{left:10,right:10,top:6,bottom:6}
    }).setOrigin(0.5).setDepth(1000).setAlpha(0);

    this.tweens.add({ targets:t, alpha:1, duration:250, y:"+=10", yoyo:false, hold:1600,
      onComplete:()=> this.tweens.add({targets:t, alpha:0, duration:400, onComplete:()=>t.destroy()})
    });

    
  }

    // ==========================================================
  // 📜 HISTORIAL DE MISIONES PASIVAS (nuevo)
  // ==========================================================
  mostrarHistorialMisiones() {
    if (!Array.isArray(window.historialMisionesPasivas)) window.historialMisionesPasivas = [];

    const { width: W, height: H } = this.sys.game.config;
    const baseY = H - 220;

    // 🔹 Fondo del historial
    const bg = this.add.rectangle(W / 2, baseY, W * 0.9, 200, 0x111111, 0.8)
      .setStrokeStyle(2, 0xffffff)
      .setDepth(100);
    this.add.text(W / 2, baseY - 90, "📜 HISTORIAL DE MISIONES", {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "20px",
      fill: "#ffd700"
    }).setOrigin(0.5).setDepth(101);

    // 🔹 Mostrar últimas 5 misiones
    const maxToShow = 5;
    const recientes = window.historialMisionesPasivas.slice(-maxToShow).reverse();

    let y = baseY - 50;
    recientes.forEach((m, i) => {
      const yOffset = y + i * 34;

      // Icono del dragón
      if (m.dragonMini && this.textures.exists(m.dragonMini)) {
        this.add.image(W * 0.08, yOffset, m.dragonMini)
          .setDisplaySize(48, 48)
          .setDepth(102);
      }

      const texto = `${m.nombre} — ${m.resultado === "Éxito" ? "✅" : "❌"} (${m.porcentaje}% → ${m.tirada})`;
      this.add.text(W * 0.15, yOffset, texto, {
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "18px",
        fill: m.resultado === "Éxito" ? "#00ff99" : "#ff6666"
      }).setOrigin(0, 0.5).setDepth(102);

      const detalle = `🎯 ${m.dificultad} · ⏳ ${m.dias}d · 🎁 ${m.recompensa || "—"}`;
      this.add.text(W * 0.60, yOffset, detalle, {
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "16px",
        fill: "#cccccc"
      }).setOrigin(0, 0.5).setDepth(102);
    });
  }

  // ==========================================================
  // 🧾 Registrar misión en historial (llamar al completarla o fallarla)
  // ==========================================================
  registrarEnHistorial(mision, resultado, porcentaje, tirada, recompensa, dragon) {
    if (!Array.isArray(window.historialMisionesPasivas)) window.historialMisionesPasivas = [];

    window.historialMisionesPasivas.push({
      nombre: mision.titulo || mision.nombre || "Misión desconocida",
      dificultad: mision.dificultad || "?",
      dias: mision.duracion || mision.diasTotales || "?",
      resultado: resultado,
      porcentaje: Math.round(porcentaje),
      tirada: Math.round(tirada),
      recompensa: recompensa ? `${recompensa.objeto || ""} x${recompensa.cantidad || 1}` : "—",
      dragonMini: dragon?.mini || null
    });

    console.log("📜 Historial actualizado:", window.historialMisionesPasivas);
  }

}
