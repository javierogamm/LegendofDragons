/***** =========================
 * TurnManager – iniciativa fija por velocidad + fin de turno seguro
 * ========================== */
class TurnManager {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.opts = opts;
    this.order = [];   // sprites en orden de iniciativa
    this.idx = -1;     // índice actual
    this.current = null;
    this.turnOrder = [];
    this.index = -1;
  }

  velOf(sprite) {
    const d = sprite?.getData?.("dragon") || {};
    return Number(d.velocidad ?? d.speed ?? d.vel ?? 0) | 0;
  }

  build() {
    const sprites = (this.scene.sprites || []).slice();
    sprites.sort((a, b) => {
      const dv = this.velOf(b) - this.velOf(a);
      if (dv) return dv;
      const an = (a.getData("dragon")?.name || "");
      const bn = (b.getData("dragon")?.name || "");
      return an.localeCompare(bn);
    });
    this.order = sprites;
  }

  /** 🚀 Inicia el sistema de turnos en base a la velocidad */
  start() {
    const s = this.scene;
    const todos = [...(s.aliados || []), ...(s.enemigos || [])]
      .filter(d => d.vida > 0)
      .sort((a, b) => b.velocidad - a.velocidad);

    if (!todos.length) {
      console.warn("⚠️ No hay dragones para iniciar el TurnManager");
      return;
    }

    this.turnOrder = todos;
    this.index = -1;
    console.log("🔁 Orden de turnos:", this.turnOrder.map(d => d.name));
    this.next(); // arrancar
  }

  /** 🧹 Purga sprites destruidos o muertos */
  _purgeOrder() {
    const ok = sp => sp && sp.active && sp.getData
      && sp.getData("dragon")
      && (sp.getData("dragon").vida ?? 0) > 0;

    this.order = this.order.filter(ok);
    if (Array.isArray(this.scene.sprites)) {
      this.scene.sprites = this.scene.sprites.filter(sp => sp && sp.active);
    }
  }

/** ☠️ Comprueba fin de combate y muestra resultado final */
/** ☠️ Comprueba fin de combate y muestra resultado final */
_finDeCombate() {
  const s = this.scene;
  const vivosAliados = (s.aliados || []).filter(d => (d.vida ?? 0) > 0).length;
  const vivosEnemigos = (s.enemigos || []).filter(d => (d.vida ?? 0) > 0).length;

  if (vivosAliados === 0 || vivosEnemigos === 0) {
    const win = vivosAliados > 0;

    // 🚫 Desactivar interacción
    s.setBotonesActivos?.(false);

    // 🏆 Mensaje principal
    const msg = win ? "🏆 Victoria" : "☠️ Derrota";
    s.txtTurno?.setText(msg);
    s.addLog?.(win ? "🏆 ¡Victoria en combate!" : "☠️ Todos tus dragones han sido derrotados...");

    // ✅ Detectar color e ID del monolito
    const color =
      s.volverData?.monolitoRojo ? "rojo" :
      s.volverData?.monolitoVerde ? "verde" :
      s.volverData?.monolitoAzul ? "azul" :
      "desconocido";

    const monId = s.volverData?.monolitoId || null;

    // === 🧱 FIN DE COMBATE (SIEMPRE MONOLITO) ===
    if (win) {
      console.log("🏆 Victoria en monolito:", color, monId);

      // DESPUÉS (normalizado)
window.recompensaPendiente = {
  tipo: `monolito${color}`, // monolitorojo | monolitoverde | monolitoazul
  monolitoId: monId,
  bioma: s.volverData?.biomaActual || window.islaSeleccionada?.tipo || "???",
  volverA: s.volverA || "SceneMapa",
  volverData: s.volverData || {}
};

      s.setBotonesActivos?.(false);
      s.cameras?.main?.fadeOut?.(400, 0, 0, 0);
      s.time.delayedCall(600, () => {
        try {
          s.scene.start(window.recompensaPendiente.volverA, window.recompensaPendiente.volverData);
        } catch (err) {
          console.error("❌ Error al volver tras victoria de monolito:", err);
          s.scene.start("SceneWorld");
        }
      });

      return true;
    }

    // ❌ Derrota en monolito → popup + reset + volver
    console.log("❌ Derrota en monolito — no hay recompensa, se resetea monolito", monId);

    window.recompensaPendiente = null;
    if (window.__RUNTIME_STATE?.recompensaPendiente) {
      delete window.__RUNTIME_STATE.recompensaPendiente;
    }

    const W = s.W || s.scale.width;
    const H = s.H || s.scale.height;

    const fondo  = s.add.rectangle(W/2, H/2, W, H, 0x000000, 0.7).setDepth(9998).setInteractive();
    const box    = s.add.rectangle(W/2, H/2, 560, 240, 0x1a1a1a, 0.95).setStrokeStyle(3, 0xff4444).setDepth(9999);
    const titulo = s.add.text(W/2, H/2 - 62, "¡Has sido derrotado!", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "28px", fill: "#ff6666", fontStyle: "bold"
    }).setOrigin(0.5).setDepth(10000);
    const msgDer = s.add.text(W/2, H/2 - 14, "No hay recompensa", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "20px", fill: "#ffffff"
    }).setOrigin(0.5).setDepth(10000);
    const btnOk  = s.add.text(W/2, H/2 + 60, "OK", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "22px", backgroundColor: "#444",
      padding: { left: 18, right: 18, top: 8, bottom: 8 }, fill: "#fff"
    }).setOrigin(0.5).setDepth(10001).setInteractive();

    btnOk.on("pointerdown", () => {
      fondo.destroy(); box.destroy(); titulo.destroy(); msgDer.destroy(); btnOk.destroy();

      try {
        if (monId && typeof IslaWorld !== "undefined") {
          if (typeof IslaWorld.getMonolito === "function") {
            const m = IslaWorld.getMonolito(monId);
            if (m) m.completado = false;
          }
          const clave = `monolito${color}`;
          window.__RUNTIME_STATE = window.__RUNTIME_STATE || {};
          if (window.__RUNTIME_STATE.eventosCompletados?.[clave]) {
            delete window.__RUNTIME_STATE.eventosCompletados[clave];
          }
          if (window.__RUNTIME_STATE.meta?.[clave]) {
            delete window.__RUNTIME_STATE.meta[clave];
          }
        }
      } catch (e) {
        console.warn("⚠️ No se pudo resetear el monolito tras derrota:", e);
      }

      s.scene.start(s.volverA || "SceneWorld", s.volverData || {});
    });

    return true;
  } // ← cierre del if principal (cuando hay fin de combate)
} // ← ✅ cierre del método _finDeCombate completo


/** ⏭️ Avanza al siguiente turno */
next() {
  const s = this.scene;
  // 🧊 Reducir cooldowns del dragón anterior
  const anterior = this.turnOrder?.[this.index];
  if (anterior) {
    tacticsSkills.reducirCooldowns(anterior);
  }
  // 🧹 Limpiar y comprobar fin de combate
  this._purgeOrder();
  if (this._finDeCombate()) return;

  if (!Array.isArray(this.turnOrder) || !this.turnOrder.length) {
    console.warn("⚠️ turnOrder vacío o no inicializado");
    return;
  }

  this.index = (this.index + 1) % this.turnOrder.length;
  const dragon = this.turnOrder[this.index];

  if (!dragon || dragon.vida <= 0) {
    console.warn("⏩ Dragón muerto o inválido, saltando turno...");
    this.next();
    return;
  }

  // 🧩 Sincronizar dragón activo
  s.dragonActivo = s.sprites.find(sp => sp.getData("dragon") === dragon);
  if (!s.dragonActivo) {
    console.warn("⚠️ No se encontró sprite para:", dragon.name);
    this.next();
    return;
  }

 // ⚡ Stun: si está aturdido, pierde su turno y decrementa contador
if ((dragon.turnosAturdido || 0) > 0) {
  dragon.turnosAturdido--;
  s.addLog?.(`💫 ${dragon.name} está aturdido y pierde su turno (${dragon.turnosAturdido} restantes)`);

  // 🌀 Mostrar/actualizar icono visual de stun
  if (s.dragonActivo) {
    if (!s.dragonActivo.stunIcon) {
      const icon = s.add.text(s.dragonActivo.x, s.dragonActivo.y - 55, "💫", {
        fontFamily: "'Cinzel Decorative', serif",fontSize: "26px",
        stroke: "#000",
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(1000);

      s.dragonActivo.stunIcon = icon;

      // Animación de "temblor" constante
      s.tweens.add({
        targets: icon,
        y: icon.y - 3,
        duration: 400,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    // Pequeño efecto de destello al saltar turno
    const fx = s.add.circle(s.dragonActivo.x, s.dragonActivo.y - 40, 22, 0xffff99, 0.5).setDepth(999);
    s.tweens.add({ targets: fx, alpha: 0, scale: 2, duration: 500, onComplete: () => fx.destroy() });
  }

  // 🧹 Si el stun se acaba, eliminar icono visual
  if (dragon.turnosAturdido <= 0 && s.dragonActivo?.stunIcon) {
    s.dragonActivo.stunIcon.destroy();
    s.dragonActivo.stunIcon = null;
  }

  // Avanza de inmediato al siguiente
  s.time.delayedCall(500, () => this.next());
  return;
}

// 🔥 Auras activas (Anillo de Fuego)
if (s.aurasActivas && s.aurasActivas.length > 0) {
  const auras = s.aurasActivas.filter(a => a && a.caster.vida > 0);
  auras.forEach(a => {
    if (a.caster === dragon) {
      // 💥 Tick de daño del anillo (inicio del turno del caster)
      const col = a.sprite.getData("col");
      const row = a.sprite.getData("row");
      const baseAliento = a.caster.aliento || 10;
      const dmg = Phaser.Math.Clamp(Math.floor(baseAliento * 0.8), 5, 20);

      const adyacentes = s.adyacentes(col, row);
      adyacentes.forEach(cell => {
        const objetivo = cell.ocupante;
        if (!objetivo) return;
        const def = objetivo.getData("dragon");
        if (!def || s.aliados.includes(def)) return;

        def.vida = Math.max(0, def.vida - dmg);
        s.actualizarBarras(objetivo);

        // Efecto visual de daño
        const fx = s.add.circle(objetivo.x, objetivo.y, 40, 0xff3300, 0.35).setDepth(30);
        s.tweens.add({
          targets: fx,
          scale: 2,
          alpha: 0,
          duration: 500,
          ease: "Cubic.easeOut",
          onComplete: () => fx.destroy()
        });

        // Texto flotante
        const dmgText = s.add.text(objetivo.x, objetivo.y - 40, `-${dmg}`, {
          fontFamily: "'Cinzel Decorative', serif",fontSize: "20px",
          fill: "#ff6666",
          stroke: "#000",
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(35);

        s.tweens.add({
          targets: dmgText,
          y: objetivo.y - 80,
          alpha: 0,
          duration: 900,
          ease: "Cubic.easeOut",
          onComplete: () => dmgText.destroy()
        });

        if (def.vida <= 0) {
          s.addLog(`☠️ ${def.name} perece en el fuego del anillo`);
          s.time.delayedCall(300, () => {
            objetivo.destroy();
            const c = s.getCell(objetivo.getData("col"), objetivo.getData("row"));
            if (c) c.ocupante = null;
          });
        }
      });

      a.duracionRestante--;
      if (a.duracionRestante <= 0) {
        s.addLog(`🔥 El Anillo de Fuego de ${a.caster.name} se extingue`);
        if (a.fx) a.fx.destroy();
      }
    }
  });

  // Limpiar auras expiradas
  s.aurasActivas = auras.filter(a => a.duracionRestante > 0);
}
// 🛡️ AURAS DEFENSIVAS (💎 Piel de Diamante, 💢 Invisibilidad, 💨 Aceleración)
if (s.aurasDefensivas && s.aurasDefensivas.length > 0) {
  s.aurasDefensivas = s.aurasDefensivas.filter(a => a && a.caster.vida > 0);

  s.aurasDefensivas.forEach(a => {
    if (a.caster === dragon) {
      a.duracionRestante--;

      if (a.duracionRestante <= 0) {
        // 🧹 Limpieza visual
        a.fx?.destroy();
        a.icono?.destroy();

        // 💎 Piel de Diamante → restaurar armadura original
        if (a.tipo === "roca" && a.caster._armaduraOriginal != null) {
          a.caster.armadura = a.caster._armaduraOriginal;
          delete a.caster._armaduraOriginal;
          s.addLog?.(`💎 ${a.caster.name} pierde la dureza del diamante`);
        }

        // 💢 Invisibilidad → quitar bonus de esquiva
        if (a.tipo === "misterio" && a.caster.esquivaExtra) {
          a.caster.esquivaExtra = 0;
          s.addLog?.(`💢 ${a.caster.name} vuelve a ser visible`);
        }

        // 💨 Aceleración → restaurar velocidad original
        if (a.tipo === "striker" && a.caster.velocidadOriginal) {
          a.caster.velocidad = a.caster.velocidadOriginal;
          delete a.caster.velocidadOriginal;
          a.caster.turnosAceleracion = 0;
          s.addLog?.(`💨 ${a.caster.name} vuelve a su velocidad normal`);
        }

        // 🔧 Limpieza final personalizada si la skill tenía callback
        if (a.fin) a.fin();
      }
    }
  });

  // 🧹 Purga auras expiradas
  s.aurasDefensivas = s.aurasDefensivas.filter(a => a.duracionRestante > 0);
}
  // ⚡ Aplicar efectos persistentes nube de rayos
  if (s.nubesActivas && s.nubesActivas.length > 0) {
    s.aplicarNubesActivas();
  }

  s.exitAttackMode?.();
  s.exitAlientoMode?.();
  s.setBotonesActivos(false);

  s.txtTurno?.setText(`Turno de ${dragon.name}`);
  s.addLog?.(`🎯 Turno de ${dragon.name}`);

  if (s.actualizarHUDSkills) s.actualizarHUDSkills();

  if (s.desactivarResaltadoTurno) s.desactivarResaltadoTurno();
  if (s.activarResaltadoTurno && s.dragonActivo) {
    s.activarResaltadoTurno(s.dragonActivo);
  }

  const paMax = Math.max(20, Math.floor((dragon.velocidad * 10) / 4));
  dragon.puntosAccion = paMax;
  s.actualizarBarras?.(s.dragonActivo);

  if (s.aliados.includes(dragon) && s.actualizarBolitas && s.dragonActivo) {
    s.actualizarBolitas(s.dragonActivo);
  }

 if (s.enemigos.includes(dragon)) {
  // 🔄 Flags por turno (IA)
  dragon._iaSkillTried = false;       // este turno aún no intentó usar skill
  dragon._iaSkillFailLogged = false;  // aún no registramos fallo de skill

  console.log(`🤖 Turno IA: ${dragon.name}`);
  IAtactic.playTurn(s, s.dragonActivo);
} else {
    console.log(`🧙 Turno jugador: ${dragon.name}`);
    s.setBotonesActivos(true);
  }
}
} // ← ✅ cierre de la clase TurnManager


window.TurnManager = TurnManager;
