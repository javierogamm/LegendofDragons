/***** =========================
 * SCENE CARGAR PARTIDA (resumen y “Continuar”)
 * ========================== */
class SceneCargarPartida extends Phaser.Scene {
  constructor() { super("SceneCargarPartida"); }

  create() {
    const { width: W, height: H } = this.sys.game.config;
    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.8);

    this.add.text(W/2, 80, "📂 Partida cargada", {
      fontFamily: "'Cinzel Decorative'",
      fontSize: "42px",
      fill: "#ffd700",
      stroke: "#000",
      strokeThickness: 4
    }).setOrigin(0.5);

    // Normalizar datos críticos
    this.inicializarPartida();

    // Resumen
    const activos = (window.dragonesJugador || []).filter(d => d.activo);
    const resumen = [
      `🐉 Activos: ${activos.map(d => d.name).join(", ") || "ninguno"}`,
      `💰 Monedas: ${window.monedas || 0}`,
      `📅 Día ${window.__CALENDAR_STATE?.dia || 1} / Mes ${window.__CALENDAR_STATE?.mes || 1}`,
      `🌍 Posición: ${window.worldPos ? `(${window.worldPos.x}, ${window.worldPos.y})` : "Centro del mapa"}`
    ].join("\n");

    this.add.text(W/2, H/2 - 20, resumen, {
      fontFamily: "'MedievalSharp'",
      fontSize: "22px",
      fill: "#fff",
      align: "center"
    }).setOrigin(0.5);

    // Botón continuar
    const btn = this.add.text(W/2, H - 120, "▶ Continuar", {
      fontFamily: "'MedievalSharp'",
      fontSize: "28px",
      backgroundColor: "#333",
      color: "#ffd700",
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5).setInteractive();

    btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#555" }));
    btn.on("pointerout",  () => btn.setStyle({ backgroundColor: "#333" }));
    btn.on("pointerdown", () => {
  console.log("🎮 Iniciando partida desde resumen…");

  // 🧩 Asegurar que MISIONES está cargado
  if (typeof window.MISIONES === "undefined") {
    console.warn("⚠️ [SceneCargarPartida] MISIONES no encontrado. Cargando events/misiones.js...");
    const script = document.createElement("script");
    script.src = "events/misiones.js?v=" + Date.now();
    script.onload = () => {
      console.log("✅ [SceneCargarPartida] Misiones.js cargado correctamente.");
      this.scene.start("SceneWorld", { fromLoad: true });
    };
    script.onerror = () => {
      console.error("💥 [SceneCargarPartida] Error al cargar events/misiones.js dinámicamente.");
      this.scene.start("SceneWorld", { fromLoad: true });
    };
    document.head.appendChild(script);
    return; // ⛔ Evita avanzar hasta que cargue
  }

  // Si ya está cargado, continuar normalmente
  this.scene.start("SceneWorld", { fromLoad: true });
});
  }

  inicializarPartida() {
  console.log("🧩 Inicializando partida desde resumen...");

  // 🔹 Asegurar dragones activos válidos
  let activos = Array.isArray(window.dragonesJugador)
    ? window.dragonesJugador.filter(d => d.activo)
    : [];

  if (!activos.length && window.dragonesJugador?.length > 0) {
    // Si ningún dragón está marcado activo, activar el primero
    window.dragonesJugador[0].activo = true;
    activos = [window.dragonesJugador[0]];
    console.warn("⚠️ No había dragones activos. Activando el primero:", activos[0].name);
  }

  if (activos.length > 0) {
    window.dragon1 = activos[0];
    window.dragon2 = activos[1] || null;
    console.log("🐉 Dragones activos restaurados:", activos.map(d => d.name));
  } else {
    // 🔸 Crear un dragón temporal si no hay ninguno
    window.dragon1 = {
      name: "Dragón perdido",
      nivel: 1, exp: 0, vida: 50, vidaMax: 50,
      mordisco: 5, aliento: 5, armadura: 5, velocidad: 5,
      rareza: "Común", activo: true
    };
    window.dragonesJugador = [window.dragon1];
    console.error("🚨 No se encontraron dragones; se ha creado uno temporal.");
  }

  // 🔹 Asegurar posición mundial
  if (!window.worldPos || typeof window.worldPos.x !== "number") {
    window.worldPos = { x: 800, y: 400, zoom: 1.8 };
    console.log("📍 Posición por defecto aplicada (800,400)");
  }

  // 🔹 Asegurar calendario y monedas
  if (!window.__CALENDAR_STATE) {
    window.__CALENDAR_STATE = { dia: 1, mes: 1, anio: 1 };
  }
  if (typeof window.monedas !== "number") {
    window.monedas = 0;
  }

  // 🔹 Bandera de carga
  window.__FROM_SAVEGAME__ = true;
}

}
window.SceneCargarPartida = SceneCargarPartida;
