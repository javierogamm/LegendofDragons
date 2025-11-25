/***** =========================
 * tactics_events.js – Post-combate y recompensas de monolitos
 * ========================== */
const tacticsEvents = {
  /**
   * 📦 Gestiona el final de un combate táctico.
   * Guarda recompensa pendiente si es monolito y vuelve al mapa.
   */
 // tactics_events.js
finalizarCombate(scene, data = {}) {
  const win = !!data.win;
  const vd = scene?.volverData || {};
  const tipoMonolito =
    vd.monolitoRojo  ? "monolitorojo"  :
    vd.monolitoVerde ? "monolitoverde" :
    vd.monolitoDorado? "monolitodorado":
    vd.monolitoAzul  ? "monolitoazul"  : null;

  if (!win) {
    // ❌ DERROTA → NO recompensa, NO completado; limpia cualquier residuo
    if (window.__RUNTIME_STATE?.recompensaPendiente) delete window.__RUNTIME_STATE.recompensaPendiente;
    window.recompensaPendiente = null;

    scene.time.delayedCall(1000, () => {
      scene.scene.start(scene.volverA, scene.volverData || {});
    });
    return;
  }

  // ✅ VICTORIA → recompensa + marca completado
  if (tipoMonolito) {
    window.recompensaPendiente = {
      tipo: tipoMonolito,
      win: true,                           // 👈 bandera de victoria
      volverA: scene.volverA || "SceneWorld",
      volverData: scene.volverData || {},
      eventoId: vd.eventoId || null,
      islaId:   vd.islaId   || window.islaSeleccionada?.id || null,
      monolitoId: vd.monolitoId || null
    };

    window.__RUNTIME_STATE = window.__RUNTIME_STATE || {};
    window.__RUNTIME_STATE.recompensaPendiente = window.recompensaPendiente;

    // Marca “completado” (solo victoria)
    window.__RUNTIME_STATE.eventosCompletados = window.__RUNTIME_STATE.eventosCompletados || {};
    window.__RUNTIME_STATE.eventosCompletados[tipoMonolito] = true;
  }

  scene.time.delayedCall(1000, () => {
    scene.scene.start(scene.volverA, scene.volverData || {});
  });
}
,

  /**
   * 💎 Muestra el popup de recompensas del monolito.
   * Se usa desde SceneMapa cuando window.recompensaPendiente existe.
   */
  mostrarRecompensaMonolito(scene, data = {}) {
    const tipo = data.tipo || "monolitorojo";
    const esRojo  = tipo === "monolitorojo";
    const esVerde = tipo === "monolitoverde";
    const esAzul  = tipo === "monolitoazul";
    const esDorado = tipo === "monolitodorado";

    scene.bloqueado = true;
    window.inventarioJugador = window.inventarioJugador || [];

    // === Recompensa base XP ===
    const nivelBase = window.dragonesJugador?.[0]?.nivel || 1;
    const xpBase = 60 + nivelBase * 40;
// 🔹 Ajuste de recompensa: x3 por tener siempre 3 dragones activos
const xpFinal = Math.floor(
  Phaser.Math.Between(xpBase * 0.8, xpBase * 1.2) * 3
);
   // === XP solo a dragones ACTIVOS ===
let resumen = "";
const activos = (window.dragonesJugador || []).filter(d => d.activo);

if (activos.length === 0) {
  resumen += "⚠️ No tienes dragones activos, nadie gana XP\n";
} else {
  activos.forEach(d => {
    roleplay.addXP(d, xpFinal, scene, () => {
      resumen += `✨ ${d.apodo || d.name} gana ${xpFinal} XP\n`;
    });
  });

  // Procesar posibles subidas de nivel pendientes
  roleplay.procesarColaSubidas(scene);
}

    // === Oro + posibles runas ===
    let oro = Phaser.Math.Between(2000, 5000);
    let runaTipo = null, runaKey = null, emoji = "";

    if (esRojo)  { runaTipo = "Runa de Fuego";  runaKey = "runaepica"; emoji = "🔥"; }
    if (esVerde) { runaTipo = "Runa de Bosque"; runaKey = "runarara";  emoji = "🌿"; }
    if (esAzul)  { runaTipo = "Runa de Hielo";  runaKey = "runarara";  emoji = "❄️"; }
    if (esDorado) { runaTipo = "Runa Dorada"; runaKey = "runalegendaria"; emoji = "💛"; oro = Phaser.Math.Between(600, 900); }


    resumen += `💰 Has ganado ${oro} monedas\n`;
    let oroItem = window.inventarioJugador.find(i => i.nombre === "Monedas");
    if (oroItem) oroItem.cantidad += oro;
    else window.inventarioJugador.push({ nombre: "Monedas", cantidad: oro, key: "Monedas" });

    if (Math.random() < 0.15 && runaTipo) {
      window.inventarioJugador.push({ nombre: runaTipo, cantidad: 1, key: runaKey });
      resumen += `💎 ¡Has obtenido una ${runaTipo}! ${emoji}\n`;
    }

    // === Crear popup ===
    const W = scene.W || scene.scale.width;
    const H = scene.H || scene.scale.height;

    const fondo = scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
      .setInteractive().setDepth(9998);
    const box = scene.add.rectangle(W / 2, H / 2, 520, 360, 0x1a1a1a, 0.95)
      .setStrokeStyle(3, 0xffffff).setDepth(9999);

    const titulo = scene.add.text(W / 2, H / 2 - 140,
      `${emoji} Recompensas del ${tipo.replace("monolito", "Monolito ")} ${emoji}`,
      { fontFamily: "'Cinzel Decorative', serif",fontSize: "26px", fill: "#ffd700", fontFamily: "serif", fontStyle: "bold" }
    ).setOrigin(0.5).setDepth(10000);

    const txt = scene.add.text(W / 2 - 200, H / 2 - 80, resumen, {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "18px", fontFamily: "monospace", fill: "#fff", wordWrap: { width: 400 }
    }).setDepth(10000);

    const btn = scene.add.text(W / 2, H / 2 + 130, "OK", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "22px", backgroundColor: "#444",
      padding: { left: 20, right: 20, top: 10, bottom: 10 }, fill: "#fff"
    })
      .setOrigin(0.5)
      .setInteractive()
      .setDepth(10001)
    .on("pointerdown", () => {
  fondo.destroy(); box.destroy(); titulo.destroy(); txt.destroy(); btn.destroy();

  try {
    // === 1️⃣ Marcar evento de isla ===
    if (typeof IslaWorld !== "undefined" && data.islaId && data.eventoId) {
      IslaWorld.markEventCompleted(data.islaId, data.eventoId);
      console.log(`✔ Evento ${data.eventoId} marcado como completado en isla ${data.islaId}`);
    }

    // === 2️⃣ Marcar monolito global ===
    const tipo = data.tipo || "monolitorojo";
    const clave = tipo;
    const monId = data.monolitoId || window.recompensaPendiente?.monolitoId || null;

    window.__RUNTIME_STATE = window.__RUNTIME_STATE || {};
    window.__RUNTIME_STATE.eventosCompletados = window.__RUNTIME_STATE.eventosCompletados || {};
    window.__RUNTIME_STATE.eventosCompletados[clave] = true;

    if (monId && typeof IslaWorld !== "undefined" && typeof IslaWorld.getMonolito === "function") {
      const m = IslaWorld.getMonolito(monId);
      if (m) {
        m.completado = true;
        console.log(`🏁 Monolito ${monId} marcado como completado`);
      }
    }
  } catch (e) {
    console.warn("⚠️ Error al marcar monolito como completado:", e);
  }

  // 🧹 Limpieza global
  window.recompensaPendiente = null;
  if (window.__RUNTIME_STATE?.recompensaPendiente) {
    delete window.__RUNTIME_STATE.recompensaPendiente;
  }
  scene.bloqueado = false;

  // === 3️⃣ REFRESCAR MAPA / ICONOS ===
  try {
    // Si está en mapa de isla
    if (typeof scene.refrescarEventosLocales === "function") {
      console.log("🔄 Refrescando eventos locales de la isla...");
      scene.refrescarEventosLocales();
    }

    // Si está en el mapa global (world)
    if (window.sceneWorld && typeof window.sceneWorld.refrescarEventosIsla === "function") {
      console.log("🌍 Refrescando iconos de monolitos en SceneWorld...");
      window.sceneWorld.refrescarEventosIsla();
    }

    // Si ninguna función de refresco existe, reiniciar la escena actual
    if (!scene.refrescarEventosLocales && !window.sceneWorld) {
      console.warn("⚠️ No se encontró método de refresco. Reiniciando escena...");
      const destino = data.volverA || "SceneWorld";
      const volverData = data.volverData || {};
      scene.scene.start(destino, volverData);
    }
  } catch (err) {
    console.error("❌ Error al refrescar monolitos tras recompensa:", err);
  }
});


  }
};

window.tacticsEvents = tacticsEvents;
