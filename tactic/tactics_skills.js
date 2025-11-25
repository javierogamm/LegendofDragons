/***** =========================
 * tactics_skills.js
 * Sistema modular de habilidades (skills) para el combate táctico
 * ========================== */

const tacticsSkills = {

  /** 📜 Define las skills disponibles según tipo elemental del dragón */
  obtenerSkillsPorTipo(tipo) {
  tipo = (tipo || "").trim().toLowerCase();
  switch (tipo) {
  case "fuego":
    return [this.anilloDeFuego, this.llamarada];

  case "agua":
  return [this.olaDeCuracion, this.esquirlaDeHielo];

  case "trueno":
  return [this.rayoAturdidor, this.nubeDeRayos];

  case "roca":
    return [this.esquirlaDeRoca, this.pielDeDiamante];
  
  case "misterio":
  
  return [this.ecoDeSombras, this.invisibilidad];

  case "striker":
  return [this.lanzamientoSonico, this.aceleracion];


  default:
    return [];
}

},

// 💥SKILLS STRIKER HERE
// 💥LANZAMIENTO SONICO
lanzamientoSonico: {
  nombre: "Lanzamiento Sónico",
  costePA: 20,
  costeAliento: 2,
  descripcion: "Ataca una casilla a distancia (rango 4). Daño = stat más alto ×2. 50% crítico. Requiere 1 aliento.",
  icono: "🎯",

  ejecutar(scene, atacanteSprite, esIA = false) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) return;

    // ⚡ Verificar recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para Lanzamiento Sónico");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan alientos suficientes para esta habilidad");
      return;
    }

    // 🧠 --- MODO IA ---
    if (esIA) {
      const enemigosVivos = scene.sprites.filter(s => {
        const d2 = s.getData("dragon");
        return d2 && scene.aliados.includes(d2) && d2.vida > 0;
      });

      const col = atacanteSprite.getData("col");
      const row = atacanteSprite.getData("row");

      // Elegir enemigo más cercano dentro de rango 4
      let objetivo = null;
      let menorDist = 999;
      enemigosVivos.forEach(s => {
        const c2 = s.getData("col"), r2 = s.getData("row");
        const dist = IAtactic.distHex(col, row, c2, r2);
        if (dist <= 4 && dist < menorDist) {
          menorDist = dist;
          objetivo = s;
        }
      });

      if (!objetivo) {
        scene.addLog(`🤖 ${atacante.name} intenta usar Lanzamiento Sónico, pero no hay objetivos en rango`);
        return;
      }

      const defensor = objetivo.getData("dragon");
      const base = Math.max(atacante.mordisco ?? 0, atacante.aliento ?? 0);
      let dmg = base * 2 - (defensor.armadura || 0);

      // 💥 Crítico 50%
      const critico = Math.random() < 0.5;
      if (critico) dmg = Math.floor(dmg * 1.5);

      dmg = Math.max(1, Math.floor(dmg));
      defensor.vida = Math.max(0, defensor.vida - dmg);
      scene.actualizarBarras(objetivo);

      // Efecto visual
      const fx = scene.add.circle(objetivo.x, objetivo.y, 35, 0x00ffff, 0.4).setDepth(40);
      scene.tweens.add({
        targets: fx,
        scale: 2.5,
        alpha: 0,
        duration: 600,
        ease: "Cubic.easeOut",
        onComplete: () => fx.destroy()
      });

      if (critico) {
        const critTxt = scene.add.text(objetivo.x, objetivo.y - 60, "💥 CRÍTICO!", {
          fontFamily: "'Cinzel Decorative', serif",fontSize: "22px",
          fill: "#00ffff",
          stroke: "#000",
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(50);
        scene.tweens.add({
          targets: critTxt,
          y: objetivo.y - 100,
          alpha: 0,
          duration: 800,
          ease: "Cubic.easeOut",
          onComplete: () => critTxt.destroy()
        });
      }

      scene.addLog(`🤖 ${atacante.name} lanza Sónico sobre ${defensor.name} (-${dmg} HP)`);

      // 💨 Gastar recursos
      atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
      atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);
      scene.actualizarBarras(atacanteSprite);
      scene.actualizarBolitas(atacanteSprite);

      // ☠️ Si muere el defensor
      if (defensor.vida <= 0) {
        scene.addLog(`☠️ ${defensor.name} cae por el impacto sónico`);
        scene.time.delayedCall(300, () => {
          objetivo.destroy();
          const c = scene.getCell(objetivo.getData("col"), objetivo.getData("row"));
          if (c) c.ocupante = null;
        });
      }

      // 🔚 Finalizar turno
      scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
    }

    // 🧍 --- MODO JUGADOR ---
    scene.addLog("🎯 Elige una casilla dentro de 4 celdas para atacar");
    scene.attackMode = true;
    scene.attackHighlights = [];

    const col = atacanteSprite.getData("col");
    const row = atacanteSprite.getData("row");

    // Mostrar rango de alcance (hasta 4 hex)
    scene.casillas.forEach(cell => {
      const dist = IAtactic.distHex(col, row, cell.col, cell.row);
      if (dist > 0 && dist <= 4) {
        const pts = scene.hexPointsFlat(cell.x, cell.y, scene.hexSize * 0.95);
        const poly = new Phaser.Geom.Polygon(pts.flatMap(p => [p.x, p.y]));
        const g = scene.add.graphics();
        g.fillStyle(0x00ffff, 0.25);
        g.fillPoints(pts, true);
        g.setDepth(9);
        g.setInteractive(poly, Phaser.Geom.Polygon.Contains);
        g.cellRef = cell;

        g.on("pointerdown", () => {
          // 🧹 limpiar selección
          scene.attackMode = false;
          scene.attackHighlights.forEach(h => h.destroy());
          scene.attackHighlights = [];

          const objetivo = cell.ocupante;
          if (!objetivo) {
            scene.addLog("❌ No hay enemigo en esa casilla");
            return;
          }

          const defensor = objetivo.getData("dragon");
          if (!defensor || scene.aliados.includes(defensor)) {
            scene.addLog("❌ Solo puedes atacar enemigos");
            return;
          }

          // 🌬️ Determinar stat más alto
          const statMordisco = atacante.mordisco ?? 0;
          const statAliento = atacante.aliento ?? 0;
          const base = Math.max(statMordisco, statAliento);
          let dmg = base * 2 - (defensor.armadura || 0);

          // 💥 Crítico 50%
          if (Math.random() < 0.5) {
            dmg = Math.floor(dmg * 1.5);
            const critTxt = scene.add.text(objetivo.x, objetivo.y - 60, "💥 CRÍTICO!", {
              fontFamily: "'Cinzel Decorative', serif",fontSize: "22px",
              fill: "#00ffff",
              stroke: "#000",
              strokeThickness: 3
            }).setOrigin(0.5).setDepth(50);
            scene.tweens.add({
              targets: critTxt,
              y: objetivo.y - 100,
              alpha: 0,
              duration: 800,
              ease: "Cubic.easeOut",
              onComplete: () => critTxt.destroy()
            });
            scene.addLog(`💥 ¡Crítico sónico de ${atacante.name}!`);
          }

          dmg = Math.max(1, Math.floor(dmg));

          // 💢 Animación atacante
          scene.tweens.add({
            targets: atacanteSprite,
            x: objetivo.x,
            y: objetivo.y,
            duration: 200,
            yoyo: true,
            ease: "Sine.easeInOut"
          });

          // ⚡ Efecto visual
          const fx = scene.add.circle(objetivo.x, objetivo.y, 35, 0x00ffff, 0.4).setDepth(40);
          scene.tweens.add({
            targets: fx,
            scale: 2.5,
            alpha: 0,
            duration: 600,
            ease: "Cubic.easeOut",
            onComplete: () => fx.destroy()
          });

          // 💥 Aplicar daño
          defensor.vida = Math.max(0, defensor.vida - dmg);
          scene.actualizarBarras(objetivo);

          // Texto de daño
          const dmgTxt = scene.add.text(objetivo.x, objetivo.y - 40, `-${Math.round(dmg)}`, {
            fontFamily: "'Cinzel Decorative', serif",fontSize: "22px",
            fill: "#00ccff",
            stroke: "#000",
            strokeThickness: 3
          }).setOrigin(0.5).setDepth(45);
          scene.tweens.add({
            targets: dmgTxt,
            y: objetivo.y - 80,
            alpha: 0,
            duration: 900,
            ease: "Cubic.easeOut",
            onComplete: () => dmgTxt.destroy()
          });

          scene.addLog(`🎯 ${atacante.name} lanza un ataque sónico sobre ${defensor.name} (-${dmg} HP)`);

          // ☠️ Si muere
          if (defensor.vida <= 0) {
            scene.addLog(`☠️ ${defensor.name} cae por el impacto sónico`);
            scene.time.delayedCall(300, () => {
              objetivo.destroy();
              const c = scene.getCell(objetivo.getData("col"), objetivo.getData("row"));
              if (c) c.ocupante = null;
            });
          }

          // 💨 Gastar recursos
          atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
          atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - 2);
          scene.actualizarBarras(atacanteSprite);
          scene.actualizarBolitas(atacanteSprite);

          // 🔚 Finalizar turno
          scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
        });

        scene.attackHighlights.push(g);
      }
    });
  }
},
// 💨 Skill: Aceleración (tipo striker)
aceleracion: {
  nombre: "Aceleración",
  costePA: 10,
  costeAliento: 2,
  descripcion: "Duplica la velocidad del dragón durante 5 turnos, aumentando PA y esquiva.",
  icono: "💨",

  ejecutar(scene, atacanteSprite) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) return;

    // ⛔ Verificar si ya usó esta skill
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Verificar recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Aceleración");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan alientos para esta habilidad");
      return;
    }

    // 🔹 Gastar recursos
    atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
    atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);
    scene.actualizarBarras?.(atacanteSprite);
    scene.actualizarBolitas?.(atacanteSprite);

    // 🧠 Aplicar efecto (duplica velocidad base)
    if (!atacante.velocidadOriginal) atacante.velocidadOriginal = atacante.velocidad;
    atacante.velocidad *= 2;
    atacante.turnosAceleracion = 5;

    // 💨 Icono visual sobre el dragón
    const icono = scene.add.text(atacanteSprite.x, atacanteSprite.y - 50, "💨", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "28px",
      stroke: "#000",
      strokeThickness: 3
    }).setDepth(999).setAlpha(0.9);

    scene.tweens.add({
      targets: icono,
      y: atacanteSprite.y - 55,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // 🔵 Aura azul de energía
    const fx = scene.add.circle(atacanteSprite.x, atacanteSprite.y, 45, 0x33ccff, 0.25).setDepth(20);
    scene.tweens.add({
      targets: fx,
      alpha: { from: 0.3, to: 0.6 },
      scale: { from: 1, to: 1.15 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // 🌀 Aura activa
    const aura = {
      caster: atacante,
      sprite: atacanteSprite,
      duracionRestante: 3,
      tipo: "striker",
      fx,
      icono,
      fin() {
        atacante.velocidad = atacante.velocidadOriginal || atacante.velocidad;
        atacante.turnosAceleracion = 0;
        fx?.destroy();
        icono?.destroy();
        scene.addLog(`💨 ${atacante.name} vuelve a su velocidad normal`);
      }
    };

    if (!scene.aurasDefensivas) scene.aurasDefensivas = [];
    scene.aurasDefensivas.push(aura);

    // 🔁 Mantener aura pegada al dragón
    scene.events.on("update", () => {
      if (aura.fx && aura.sprite && aura.sprite.active) {
        aura.fx.x = aura.sprite.x;
        aura.fx.y = aura.sprite.y;
      }
      if (aura.icono && aura.sprite && aura.sprite.active) {
        aura.icono.x = aura.sprite.x;
        aura.icono.y = aura.sprite.y - 50;
      }
    });

    // ✅ Marcar skill como usada
    tacticsSkills.marcarSkillUsada(atacante, this);

    // 🪶 Log
    scene.addLog(`💨 ${atacante.name} entra en un estado de aceleración: velocidad duplicada!`);

    // 🔚 Finalizar turno tras breve delay
    scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
  }
},

// 🔥 Skill: Llamarada (AOE 3 hexágonos, distancia máxima 4)
llamarada: {
  nombre: "Llamarada",
  costePA: 20,
  costeAliento: 2,
  descripcion: "Lanza una llamarada a distancia (hasta 4 hexágonos) que incinera una zona de 3 hexágonos en torno al punto de impacto. Ignora armadura.",
  icono: "🔥",

  ejecutar(scene, atacanteSprite, esIA = false) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) return;

    // ⛔ Verificar si ya usó esta skill
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Comprobaciones de recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Llamarada");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan suficientes alientos para esta habilidad");
      return;
    }

    // 🧠 --- MODO IA ---
    if (esIA) {
      const enemigosVivos = scene.sprites.filter(s => {
        const d2 = s.getData("dragon");
        return d2 && scene.aliados.includes(d2) && d2.vida > 0;
      });

      if (!enemigosVivos.length) {
        scene.addLog(`🤖 ${atacante.name} intenta usar Llamarada pero no hay enemigos vivos`);
        scene.time.delayedCall(400, () => scene.finalizarTurno());
        return;
      }

      // 🧭 Busca el grupo de enemigos más concentrado en rango ≤4
      const col = atacanteSprite.getData("col");
      const row = atacanteSprite.getData("row");
      let mejorCelda = null;
      let mejorScore = 0;

      scene.casillas.forEach(cell => {
        const dist = IAtactic.distHex(col, row, cell.col, cell.row);
        if (dist <= 4) {
          const area = [cell, ...scene.adyacentes(cell.col, cell.row)];
          const score = area.filter(c => {
            const d2 = c.ocupante?.getData("dragon");
            return d2 && scene.aliados.includes(d2) && d2.vida > 0;
          }).length;
          if (score > mejorScore) {
            mejorScore = score;
            mejorCelda = cell;
          }
        }
      });

      if (!mejorCelda) {
        scene.addLog(`🤖 ${atacante.name} no encuentra objetivos válidos para Llamarada`);
        scene.time.delayedCall(400, () => scene.finalizarTurno());
        return;
      }

      // 🔥 Efecto visual del impacto
      const area = [mejorCelda, ...scene.adyacentes(mejorCelda.col, mejorCelda.row)].filter(Boolean);
      area.forEach(c => {
        const fx = scene.add.circle(c.x, c.y, 40, 0xff6600, 0.4).setDepth(40);
        scene.tweens.add({
          targets: fx,
          scale: 2,
          alpha: 0,
          duration: 600,
          ease: "Cubic.easeOut",
          onComplete: () => fx.destroy()
        });
      });

      // 💥 Daño
      const dmgBase = Math.max(1, Math.floor(atacante.aliento * 2));
      area.forEach(c => {
        const objetivo = c.ocupante;
        if (!objetivo) return;
        const def = objetivo.getData("dragon");
        if (!def || scene.aliados.includes(def)) return;

        def.vida = Math.max(0, def.vida - dmgBase);
        scene.actualizarBarras(objetivo);
        tacticsSkills.mostrarDaño(scene, objetivo, dmgBase, "#ff6600");
        scene.addLog(`🔥 ${atacante.name} incinera a ${def.name} (-${dmgBase} HP)`);

        if (def.vida <= 0) {
          scene.addLog(`☠️ ${def.name} arde hasta morir`);
          scene.time.delayedCall(250, () => {
            objetivo.destroy();
            const cObj = scene.getCell(c.col, c.row);
            if (cObj) cObj.ocupante = null;
          });
        }
      });

      // 🔻 Gastar PA y aliento
      atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
      atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);
      scene.actualizarBarras(atacanteSprite);
      scene.actualizarBolitas(atacanteSprite);

      // ✅ Marcar como usada
      tacticsSkills.marcarSkillUsada(atacante, this);

      scene.addLog(`🤖 ${atacante.name} lanza una llamarada infernal`);
      scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
    }

    // 🧍 --- MODO JUGADOR ---
    scene.addLog("🔥 Elige una casilla hasta 4 hexágonos para lanzar Llamarada");
    scene.attackMode = true;
    scene.attackHighlights = [];

    const col = atacanteSprite.getData("col");
    const row = atacanteSprite.getData("row");

    const hoverArea = scene.add.graphics().setDepth(8);
    let ultimaCelda = null;

    (scene.casillas || []).forEach(cell => {
      const dist = IAtactic.distHex(col, row, cell.col, cell.row);
      if (dist > 0 && dist <= 4) {
        const pts = scene.hexPointsFlat(cell.x, cell.y, scene.hexSize * 0.95);
        const poly = new Phaser.Geom.Polygon(pts.flatMap(p => [p.x, p.y]));
        const g = scene.add.graphics();
        g.fillStyle(0xff6600, 0.25);
        g.fillPoints(pts, true);
        g.setDepth(9);
        g.setInteractive(poly, Phaser.Geom.Polygon.Contains);
        g.cellRef = cell;

        g.on("pointerover", () => {
          if (!scene.attackMode) return;
          if (ultimaCelda === cell) return;
          ultimaCelda = cell;
          hoverArea.clear();
          const area = [cell, ...scene.adyacentes(cell.col, cell.row)].filter(Boolean);
          area.forEach(c => {
            const pts2 = scene.hexPointsFlat(c.x, c.y, scene.hexSize * 0.95);
            hoverArea.fillStyle(0xff0000, 0.35);
            hoverArea.fillPoints(pts2, true);
          });
        });

        g.on("pointerout", () => {
          if (!scene.attackMode) return;
          hoverArea.clear();
        });

        g.on("pointerdown", () => {
          if (!scene.attackMode) return;
          scene.attackMode = false;
          scene.attackHighlights.forEach(x => x.destroy());
          scene.attackHighlights = [];
          hoverArea.clear();
          hoverArea.destroy();

          const area = [cell, ...scene.adyacentes(cell.col, cell.row)].filter(Boolean);
          const dmgBase = Math.max(1, Math.floor(atacante.aliento * 2));

          area.forEach(c => {
            const objetivo = c.ocupante;
            if (!objetivo) return;
            const def = objetivo.getData("dragon");
            if (!def || scene.aliados.includes(def)) return;

            def.vida = Math.max(0, def.vida - dmgBase);
            scene.actualizarBarras(objetivo);
            tacticsSkills.mostrarDaño(scene, objetivo, dmgBase, "#ff6600");
            scene.addLog(`🔥 ${atacante.name} incinera a ${def.name} (-${dmgBase} HP)`);

            if (def.vida <= 0) {
              scene.addLog(`☠️ ${def.name} arde hasta morir`);
              scene.time.delayedCall(250, () => {
                objetivo.destroy();
                const cObj = scene.getCell(c.col, c.row);
                if (cObj) cObj.ocupante = null;
              });
            }
          });

          atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
          atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - 2);
          scene.actualizarBarras(atacanteSprite);
          scene.actualizarBolitas(atacanteSprite);
          tacticsSkills.marcarSkillUsada(atacante, this);
          scene.addLog(`🔥 ${atacante.name} lanza una llamarada devastadora`);
        });

        scene.attackHighlights.push(g);
      }
    });
  }
},// 🔥 Skill: Llamarada (AOE 3 hexágonos, distancia máxima 4)
llamarada: {
  nombre: "Llamarada",
  costePA: 20,
  costeAliento: 2,
  descripcion: "Lanza una llamarada a distancia (hasta 4 hexágonos) que incinera una zona de 3 hexágonos en torno al punto de impacto. Ignora armadura.",
  icono: "🔥",

  ejecutar(scene, atacanteSprite, esIA = false) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) return;

    // ⛔ Verificar si ya usó esta skill
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Comprobaciones de recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Llamarada");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan suficientes alientos para esta habilidad");
      return;
    }

    // 🧠 --- MODO IA ---
    if (esIA) {
      const enemigosVivos = scene.sprites.filter(s => {
        const d2 = s.getData("dragon");
        return d2 && scene.aliados.includes(d2) && d2.vida > 0;
      });

      if (!enemigosVivos.length) {
        scene.addLog(`🤖 ${atacante.name} intenta usar Llamarada pero no hay enemigos vivos`);
        scene.time.delayedCall(400, () => scene.finalizarTurno());
        return;
      }

      // 🧭 Busca el grupo de enemigos más concentrado en rango ≤4
      const col = atacanteSprite.getData("col");
      const row = atacanteSprite.getData("row");
      let mejorCelda = null;
      let mejorScore = 0;

      scene.casillas.forEach(cell => {
        const dist = IAtactic.distHex(col, row, cell.col, cell.row);
        if (dist <= 4) {
          const area = [cell, ...scene.adyacentes(cell.col, cell.row)];
          const score = area.filter(c => {
            const d2 = c.ocupante?.getData("dragon");
            return d2 && scene.aliados.includes(d2) && d2.vida > 0;
          }).length;
          if (score > mejorScore) {
            mejorScore = score;
            mejorCelda = cell;
          }
        }
      });

      if (!mejorCelda) {
        scene.addLog(`🤖 ${atacante.name} no encuentra objetivos válidos para Llamarada`);
        scene.time.delayedCall(400, () => scene.finalizarTurno());
        return;
      }

      // 🔥 Efecto visual del impacto
      const area = [mejorCelda, ...scene.adyacentes(mejorCelda.col, mejorCelda.row)].filter(Boolean);
      area.forEach(c => {
        const fx = scene.add.circle(c.x, c.y, 40, 0xff6600, 0.4).setDepth(40);
        scene.tweens.add({
          targets: fx,
          scale: 2,
          alpha: 0,
          duration: 600,
          ease: "Cubic.easeOut",
          onComplete: () => fx.destroy()
        });
      });

      // 💥 Daño
      const dmgBase = Math.max(1, Math.floor(atacante.aliento * 2));
      area.forEach(c => {
        const objetivo = c.ocupante;
        if (!objetivo) return;
        const def = objetivo.getData("dragon");
        if (!def || scene.aliados.includes(def)) return;

        def.vida = Math.max(0, def.vida - dmgBase);
        scene.actualizarBarras(objetivo);
        tacticsSkills.mostrarDaño(scene, objetivo, dmgBase, "#ff6600");
        scene.addLog(`🔥 ${atacante.name} incinera a ${def.name} (-${dmgBase} HP)`);

        if (def.vida <= 0) {
          scene.addLog(`☠️ ${def.name} arde hasta morir`);
          scene.time.delayedCall(250, () => {
            objetivo.destroy();
            const cObj = scene.getCell(c.col, c.row);
            if (cObj) cObj.ocupante = null;
          });
        }
      });

      // 🔻 Gastar PA y aliento
      atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
      atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);
      scene.actualizarBarras(atacanteSprite);
      scene.actualizarBolitas(atacanteSprite);

      // ✅ Marcar como usada
      tacticsSkills.marcarSkillUsada(atacante, this);

      scene.addLog(`🤖 ${atacante.name} lanza una llamarada infernal`);
      scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
    }

    // 🧍 --- MODO JUGADOR ---
    scene.addLog("🔥 Elige una casilla hasta 4 hexágonos para lanzar Llamarada");
    scene.attackMode = true;
    scene.attackHighlights = [];

    const col = atacanteSprite.getData("col");
    const row = atacanteSprite.getData("row");

    const hoverArea = scene.add.graphics().setDepth(8);
    let ultimaCelda = null;

    (scene.casillas || []).forEach(cell => {
      const dist = IAtactic.distHex(col, row, cell.col, cell.row);
      if (dist > 0 && dist <= 4) {
        const pts = scene.hexPointsFlat(cell.x, cell.y, scene.hexSize * 0.95);
        const poly = new Phaser.Geom.Polygon(pts.flatMap(p => [p.x, p.y]));
        const g = scene.add.graphics();
        g.fillStyle(0xff6600, 0.25);
        g.fillPoints(pts, true);
        g.setDepth(9);
        g.setInteractive(poly, Phaser.Geom.Polygon.Contains);
        g.cellRef = cell;

        g.on("pointerover", () => {
          if (!scene.attackMode) return;
          if (ultimaCelda === cell) return;
          ultimaCelda = cell;
          hoverArea.clear();
          const area = [cell, ...scene.adyacentes(cell.col, cell.row)].filter(Boolean);
          area.forEach(c => {
            const pts2 = scene.hexPointsFlat(c.x, c.y, scene.hexSize * 0.95);
            hoverArea.fillStyle(0xff0000, 0.35);
            hoverArea.fillPoints(pts2, true);
          });
        });

        g.on("pointerout", () => {
          if (!scene.attackMode) return;
          hoverArea.clear();
        });

        g.on("pointerdown", () => {
          if (!scene.attackMode) return;
          scene.attackMode = false;
          scene.attackHighlights.forEach(x => x.destroy());
          scene.attackHighlights = [];
          hoverArea.clear();
          hoverArea.destroy();

          const area = [cell, ...scene.adyacentes(cell.col, cell.row)].filter(Boolean);
          const dmgBase = Math.max(1, Math.floor(atacante.aliento * 2));

          area.forEach(c => {
            const objetivo = c.ocupante;
            if (!objetivo) return;
            const def = objetivo.getData("dragon");
            if (!def || scene.aliados.includes(def)) return;

            def.vida = Math.max(0, def.vida - dmgBase);
            scene.actualizarBarras(objetivo);
            tacticsSkills.mostrarDaño(scene, objetivo, dmgBase, "#ff6600");
            scene.addLog(`🔥 ${atacante.name} incinera a ${def.name} (-${dmgBase} HP)`);

            if (def.vida <= 0) {
              scene.addLog(`☠️ ${def.name} arde hasta morir`);
              scene.time.delayedCall(250, () => {
                objetivo.destroy();
                const cObj = scene.getCell(c.col, c.row);
                if (cObj) cObj.ocupante = null;
              });
            }
          });

          atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
          atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - 2);
          scene.actualizarBarras(atacanteSprite);
          scene.actualizarBolitas(atacanteSprite);
          tacticsSkills.marcarSkillUsada(atacante, this);
          scene.addLog(`🔥 ${atacante.name} lanza una llamarada devastadora`);
        });

        scene.attackHighlights.push(g);
      }
    });
  }
},



// 🔥 Skill: Anillo de fuego 
 anilloDeFuego: {
  nombre: "Anillo de Fuego",
  costePA: 15,
  costeAliento: 2,
  descripcion: "Durante 3 turnos, el dragón emite calor abrasador que daña a todos los enemigos adyacentes al inicio de su turno. Daño escalado con aliento.",
  icono: "🔥",

  ejecutar(scene, atacanteSprite) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) return;

    // ⛔ Verificar si ya usó esta skill
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Verificar PA y aliento
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Anillo de Fuego");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan alientos para esta habilidad");
      return;
    }

    const col = atacanteSprite.getData("col");
    const row = atacanteSprite.getData("row");
    if (col == null || row == null) return;

    // 🔥 FX visual persistente
    const fxAura = scene.add.circle(atacanteSprite.x, atacanteSprite.y, 55, 0xff4400, 0.25).setDepth(15);
    scene.tweens.add({
      targets: fxAura,
      alpha: { from: 0.25, to: 0.45 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // 💫 Registrar el aura ligada al caster
    const aura = {
      caster: atacante,
      sprite: atacanteSprite,
      fx: fxAura,
      duracionRestante: 3,
      tipo: "fuego"
    };

    // 🧩 Guardar en lista global
    if (!scene.aurasActivas) scene.aurasActivas = [];
    scene.aurasActivas.push(aura);

    // 🌀 Hacer que el aura siga al dragón
    scene.events.on("update", () => {
    if (aura.fx && aura.sprite && aura.sprite.active) {
    aura.fx.x = aura.sprite.x;
    aura.fx.y = aura.sprite.y;
      }
    });

    // ⚡ Gastar PA y aliento
    atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
    atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);

    if (scene.actualizarBarras) scene.actualizarBarras(atacanteSprite);
    if (scene.actualizarBolitas) scene.actualizarBolitas(atacanteSprite);

    // ✅ Marcar como usada
    tacticsSkills.marcarSkillUsada(atacante, this);

    // 🔥 Log
    scene.addLog(`🔥 ${atacante.name} activa un Anillo de Fuego durante 3 turnos`);
    scene.addLog(`🔥 ${atacante.name} gasta 1 aliento (${atacante.numAlientos} restantes)`);

    // 🔚 Finalizar turno
    scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
  }
},
// 💧 SKILLS AGUA HERE
// ❄️ Skill: Esquirla de Hielo
esquirlaDeHielo: {
  nombre: "Esquirla de Hielo",
  costePA: 20,
  costeAliento: 2,
  descripcion: "Lanza una afilada esquirla de hielo que golpea a cualquier enemigo del campo. 30% de crítico (+50% daño). Solo puede usarse una vez por combate.",
  icono: "❄️",

  ejecutar(scene, atacanteSprite, esIA = false) {
    const atacante = atacanteSprite?.getData("dragon");
    if (!atacante) return;

    // ⛔ Verificar si ya usó esta skill
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Verificar recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Esquirla de Hielo");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan alientos para lanzar Esquirla de Hielo");
      return;
    }

    // 🧠 --- MODO IA ---
    if (esIA) {
      const enemigosVivos = scene.sprites.filter(s => {
        const d2 = s.getData("dragon");
        return d2 && scene.aliados.includes(d2) && d2.vida > 0;
      });

      if (!enemigosVivos.length) {
        scene.addLog(`🤖 ${atacante.name} intenta usar Esquirla de Hielo pero no hay enemigos vivos`);
        scene.time.delayedCall(400, () => scene.finalizarTurno());
        return;
      }

      // Elegir enemigo aleatorio o más débil
      const objetivo = Phaser.Utils.Array.GetRandom(enemigosVivos);
      const defensor = objetivo.getData("dragon");

      // 💥 Daño base
const base = Math.max(atacante.aliento * 1.4, atacante.mordisco);
let dmg = Math.floor(base); // sin reducción por armadura

      // 🎯 Crítico 30%
      const critico = Math.random() < 0.3;
      if (critico) dmg = Math.floor(dmg * 1.5);
      dmg = Math.max(1, dmg);

      // Aplicar daño
      defensor.vida = Math.max(0, defensor.vida - dmg);
      scene.actualizarBarras(objetivo);
// 🔥 Mostrar texto de daño flotante
tacticsSkills.mostrarDaño(scene, enemigo.sprite, dmg, "#ff6600");
      // ❄️ Efectos visuales
      const fx = scene.add.circle(objetivo.x, objetivo.y, 40, 0x66ccff, 0.4).setDepth(30);
      scene.tweens.add({
        targets: fx,
        scale: 2,
        alpha: 0,
        duration: 600,
        ease: "Cubic.easeOut",
        onComplete: () => fx.destroy()
      });

      if (critico) {
        const critTxt = scene.add.text(objetivo.x, objetivo.y - 50, "💥 CRÍTICO!", {
          fontFamily: "'Cinzel Decorative', serif",fontSize: "20px",
          fill: "#99ffff",
          stroke: "#000",
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(50);
        scene.tweens.add({
          targets: critTxt,
          y: objetivo.y - 90,
          alpha: 0,
          duration: 800,
          ease: "Cubic.easeOut",
          onComplete: () => critTxt.destroy()
        });
      }

      // 💨 Recursos y log
      atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
      atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);
      scene.actualizarBarras(atacanteSprite);
      scene.actualizarBolitas(atacanteSprite);

      scene.addLog(`🤖 ${atacante.name} lanza Esquirla de Hielo sobre ${defensor.name} (-${dmg} HP)`);

      if (defensor.vida <= 0) {
        scene.addLog(`☠️ ${defensor.name} queda congelado y cae hecho pedazos`);
        scene.time.delayedCall(300, () => {
          objetivo.destroy();
          const c = scene.getCell(objetivo.getData("col"), objetivo.getData("row"));
          if (c) c.ocupante = null;
        });
      }

      // 🔚 Finalizar turno
      scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
      return;
    }

    // 🧍 --- MODO JUGADOR ---
    scene.txtTurno.setText("Selecciona un enemigo para lanzar la Esquirla de Hielo ❄️");
    const overlays = [];

    (scene.casillas || []).forEach(cell => {
      if (!cell) return;
      const hex = scene.add.rectangle(
        cell.x, cell.y,
        scene.hexW * 0.7, scene.hexH * 0.7,
        0x66ccff, 0.25
      )
        .setDepth(8)
        .setInteractive()
        .on("pointerover", () => hex.setAlpha(0.45))
        .on("pointerout", () => hex.setAlpha(0.25))
        .on("pointerdown", () => {
          overlays.forEach(o => o.destroy());
          const objetivo = cell.ocupante;
          if (!objetivo) {
            scene.addLog("❌ No hay enemigo en esa casilla");
            return;
          }

          const defensor = objetivo.getData("dragon");
          if (!defensor || scene.aliados.includes(defensor)) {
            scene.addLog("❌ Solo puedes atacar enemigos");
            return;
          }

          // 💥 Daño base
          const base = Math.max(atacante.aliento * 1.4, atacante.mordisco);
          let dmg = Math.floor(base - ((defensor.armadura || 0) / 3));
          const critico = Math.random() < 0.3;
          if (critico) dmg = Math.floor(dmg * 1.5);
          dmg = Math.max(1, dmg);

          // ❄️ Animación visual
          const fx = scene.add.circle(objetivo.x, objetivo.y, 40, 0x66ccff, 0.35).setDepth(30);
          scene.tweens.add({
            targets: fx,
            scale: 2,
            alpha: 0,
            duration: 600,
            ease: "Cubic.easeOut",
            onComplete: () => fx.destroy()
          });

          defensor.vida = Math.max(0, defensor.vida - dmg);
          scene.actualizarBarras(objetivo);
// 🔥 Mostrar texto de daño flotante
tacticsSkills.mostrarDaño(scene, enemigo.sprite, dmg, "#ff6600");
          const dmgText = scene.add.text(objetivo.x, objetivo.y - 40, `-${Math.round(dmg)}`, {
            fontFamily: "'Cinzel Decorative', serif",fontSize: "20px",
            fill: "#99ffff",
            stroke: "#000",
            strokeThickness: 3
          }).setOrigin(0.5).setDepth(35);
          scene.tweens.add({
            targets: dmgText,
            y: objetivo.y - 80,
            alpha: 0,
            duration: 900,
            ease: "Cubic.easeOut",
            onComplete: () => dmgText.destroy()
          });

          if (critico) {
            scene.addLog(`💥 ¡Crítico gélido de ${atacante.name}!`);
          }
          scene.addLog(`❄️ ${atacante.name} lanza una Esquirla de Hielo sobre ${defensor.name} (-${dmg} HP)`);

          if (defensor.vida <= 0) {
            scene.addLog(`☠️ ${defensor.name} queda congelado y se rompe en pedazos`);
            scene.time.delayedCall(300, () => {
              objetivo.destroy();
              const c = scene.getCell(objetivo.getData("col"), objetivo.getData("row"));
              if (c) c.ocupante = null;
            });
          }

          // 💨 Gastar recursos
          atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
          atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - 2);
          scene.actualizarBarras(atacanteSprite);
          scene.actualizarBolitas(atacanteSprite);

          // ✅ Marcar como usada
          tacticsSkills.marcarSkillUsada(atacante, this);

          // 🔚 Finalizar turno
          scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
        });

      overlays.push(hex);
    });
  }
},
/** 💧 Skill: Ola de Curación
*  - Coste: 20 PA
*  - Coste adicional: 1 aliento
*  - Cura 50% HP a todos los aliados en un radio de 2 hexágonos
*/
  olaDeCuracion: {
  nombre: "Ola de Curación",
  costePA: 20,
  costeAliento: 2,
  descripcion: "Cura un 50% de la vida máxima a los aliados cercanos (radio 2). Gasta 1 aliento. Solo puede usarse una vez por combate.",
  icono: "💧",

  ejecutar(scene, atacanteSprite) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) return;

    // ⛔ Verificar si ya usó esta skill
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Verificar PA y aliento
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Ola de Curación");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan usos de aliento para esta habilidad");
      return;
    }

    const col = atacanteSprite.getData("col");
    const row = atacanteSprite.getData("row");
    if (col == null || row == null) {
      console.warn("⚠️ El lanzador no tiene datos de posición (col, row)");
      return;
    }

    // 💧 Efecto visual principal (ola expansiva)
    const fx = scene.add.circle(atacanteSprite.x, atacanteSprite.y, 40, 0x33ccff, 0.3).setDepth(20);
    scene.tweens.add({
      targets: fx,
      scale: 3,
      alpha: 0,
      duration: 800,
      ease: "Cubic.easeOut",
      onComplete: () => fx.destroy()
    });

    // 🧭 Buscar casillas en radio 2
    const celdas = scene.casillas.filter(cell => {
      const dist = IAtactic.distHex(col, row, cell.col, cell.row);
      return dist <= 2;
    });

    let totalCurados = 0;

    // ❤️ Aplicar curación a aliados dentro del área
    celdas.forEach(cell => {
      const objetivo = cell.ocupante;
      if (!objetivo) return;
      const d = objetivo.getData("dragon");
     if (!d) return;
const esAliadoIA = scene.enemigos.includes(atacante);
const esAliadoJugador = scene.aliados.includes(atacante);
if (
  (esAliadoJugador && !scene.aliados.includes(d)) ||
  (esAliadoIA && !scene.enemigos.includes(d))
) return;

      const vidaAntes = d.vida;
      const cantidadCurada = Math.round((d.vidaMax || 1) * 0.5);
      d.vida = Math.min(d.vidaMax, d.vida + cantidadCurada);
      totalCurados++;

      // Actualizar barras y texto flotante
      scene.actualizarBarras(objetivo);
      const txt = scene.add.text(objetivo.x, objetivo.y - 40, `+${d.vida - vidaAntes}`, {
        fontFamily: "'Cinzel Decorative', serif",fontSize: "20px",
        fill: "#33ccff",
        stroke: "#000",
        strokeThickness: 3
      }).setOrigin(0.5).setDepth(35);

      scene.tweens.add({
        targets: txt,
        y: objetivo.y - 80,
        alpha: 0,
        duration: 900,
        ease: "Cubic.easeOut",
        onComplete: () => txt.destroy()
      });
    });

    // ⚡ Gastar PA y aliento
    atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
    atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);

    // 🔄 Actualizar HUD y bolitas
    if (scene.actualizarBarras) scene.actualizarBarras(atacanteSprite);
    if (scene.actualizarBolitas) scene.actualizarBolitas(atacanteSprite);

    // ✅ Marcar skill como usada
    tacticsSkills.marcarSkillUsada(atacante, this);

    // 🩵 Log general
    if (totalCurados > 0) {
      scene.addLog(`💧 ${atacante.name} lanza Ola de Curación (cura a ${totalCurados} aliados)`);
    } else {
      scene.addLog(`💧 ${atacante.name} lanza Ola de Curación, pero no hay aliados cercanos`);
    }

    scene.addLog(`💧 ${atacante.name} usa 1 aliento (${atacante.numAlientos} restantes)`);

    // 🔚 Finalizar turno tras pequeña pausa
    scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
  }
},
// ⛰️ SKILLS ROCA HERE
// 💎 Skill: Piel de Diamante
pielDeDiamante: {
  nombre: "Piel de Diamante",
  costePA: 10,
  costeAliento: 2,
  descripcion: "Endurece su piel durante 5 turnos, duplicando su armadura. Muestra un icono 💎 sobre el dragón mientras dure el efecto.",
  icono: "💎",

  ejecutar(scene, atacanteSprite) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) return;

    // ✅ Verificar si ya usó esta skill
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Verificar recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Piel de Diamante");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan alientos para esta habilidad");
      return;
    }

    // 🎯 Gastar recursos
    atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
    atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);
    if (scene.actualizarBarras) scene.actualizarBarras(atacanteSprite);
    if (scene.actualizarBolitas) scene.actualizarBolitas(atacanteSprite);

    // 🧱 Aplicar efecto (armadura x2)
    const armaduraOriginal = atacante.armadura || 0;
    atacante._armaduraOriginal = armaduraOriginal;
    atacante.armadura = Math.floor(armaduraOriginal * 2);
    atacante.turnosPielDiamante = 5;

    // 💎 Icono visual sobre el dragón
    const icono = scene.add.text(atacanteSprite.x, atacanteSprite.y - 50, "💎", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "28px",
      stroke: "#000",
      strokeThickness: 3
    })
      .setDepth(999)
      .setAlpha(0.85);
    scene.tweens.add({
      targets: icono,
      y: atacanteSprite.y - 55,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
    atacanteSprite.iconoDiamante = icono;

    // 🌪️ FX circular translúcido debajo del dragón
    const fx = scene.add.circle(atacanteSprite.x, atacanteSprite.y, 45, 0x00ffff, 0.25).setDepth(20);
    scene.tweens.add({
      targets: fx,
      alpha: { from: 0.3, to: 0.6 },
      scale: { from: 1, to: 1.15 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
    atacanteSprite.fxPielDiamante = fx;

    // 💠 Guardar aura activa
    const aura = {
      caster: atacante,
      sprite: atacanteSprite,
      duracionRestante: 3,
      tipo: "diamante",
      fx,
      icono,
      fin() {
        // Restaurar armadura y limpiar FX
        atacante.armadura = atacante._armaduraOriginal || atacante.armadura;
        atacante.turnosPielDiamante = 0;
        if (fx) fx.destroy();
        if (icono) icono.destroy();
        scene.addLog(`💎 La Piel de Diamante de ${atacante.name} se desvanece`);
      }
    };

    if (!scene.aurasDefensivas) scene.aurasDefensivas = [];
    scene.aurasDefensivas.push(aura);
    // 💎 Mantener FX e icono sobre el dragón al moverse
    scene.events.on("update", () => {
    if (aura.fx && aura.sprite && aura.sprite.active) {
    aura.fx.x = aura.sprite.x;
    aura.fx.y = aura.sprite.y;
      }
      if (aura.icono && aura.sprite && aura.sprite.active) {
        aura.icono.x = aura.sprite.x;
        aura.icono.y = aura.sprite.y - 50;
      }
    });

    // ✅ Marcar como usada
    tacticsSkills.marcarSkillUsada(atacante, this);

    // 🪶 Log
    scene.addLog(`💎 ${atacante.name} endurece su piel hasta la dureza del diamante (armadura x2, 3 turnos)`);

    // 🔚 Finalizar turno
    scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
  }
},
  // ⛰️ Skill: Esquirla de Roca
esquirlaDeRoca: {
  nombre: "Esquirla de Roca",
  costePA: 20,
  costeAliento: 2,
  descripcion: "Lanza una roca afilada que golpea a cualquier enemigo en el campo. 30% de crítico (+50% daño). Solo puede usarse una vez por combate.",
  icono: "⛰️",

  ejecutar(scene, atacanteSprite, esIA = false) {
    const atacante = atacanteSprite?.getData("dragon");
    if (!atacante) return;

    // ⛔ Verificar si ya usó esta skill
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Verificar recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Esquirla de Roca");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan alientos para lanzar Esquirla de Roca");
      return;
    }

    // 🧠 --- MODO IA ---
    if (esIA) {
      const enemigosVivos = scene.sprites.filter(s => {
        const d2 = s.getData("dragon");
        return d2 && scene.aliados.includes(d2) && d2.vida > 0;
      });

      if (!enemigosVivos.length) {
        scene.addLog(`🤖 ${atacante.name} intenta usar Esquirla de Roca pero no hay enemigos vivos`);
        scene.time.delayedCall(400, () => scene.finalizarTurno());
        return;
      }

      // Elegir enemigo aleatorio o más débil
      const objetivo = Phaser.Utils.Array.GetRandom(enemigosVivos);
      const defensor = objetivo.getData("dragon");

     // 💥 Daño base (sin reducción por armadura)
const base = Math.max(atacante.aliento * 1.4, atacante.mordisco);
let dmg = Math.floor(base);


      // 🎯 Crítico 30%
      const critico = Math.random() < 0.3;
      if (critico) dmg = Math.floor(dmg * 1.5);
      dmg = Math.max(1, dmg);

      // Aplicar daño
      defensor.vida = Math.max(0, defensor.vida - dmg);
      scene.actualizarBarras(objetivo);

      // Efectos visuales
      const fx = scene.add.circle(objetivo.x, objetivo.y, 40, 0x996633, 0.4).setDepth(30);
      scene.tweens.add({
        targets: fx,
        scale: 2,
        alpha: 0,
        duration: 600,
        ease: "Cubic.easeOut",
        onComplete: () => fx.destroy()
      });

      if (critico) {
        const critTxt = scene.add.text(objetivo.x, objetivo.y - 50, "💥 CRÍTICO!", {
          fontFamily: "'Cinzel Decorative', serif",fontSize: "20px",
          fill: "#ffcc00",
          stroke: "#000",
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(50);
        scene.tweens.add({
          targets: critTxt,
          y: objetivo.y - 90,
          alpha: 0,
          duration: 800,
          ease: "Cubic.easeOut",
          onComplete: () => critTxt.destroy()
        });
      }

      // 💨 Recursos y log
      atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
      atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);
      scene.actualizarBarras(atacanteSprite);
      scene.actualizarBolitas(atacanteSprite);

      scene.addLog(`🤖 ${atacante.name} lanza Esquirla de Roca sobre ${defensor.name} (-${dmg} HP)`);

      if (defensor.vida <= 0) {
        scene.addLog(`☠️ ${defensor.name} es aplastado por la roca`);
        scene.time.delayedCall(300, () => {
          objetivo.destroy();
          const c = scene.getCell(objetivo.getData("col"), objetivo.getData("row"));
          if (c) c.ocupante = null;
        });
      }

      // 🔚 Finalizar turno
      scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
      
    }

    // 🧍 --- MODO JUGADOR ---
    scene.txtTurno.setText("Selecciona un enemigo para lanzar la Esquirla 🪨");
    const overlays = [];

    (scene.casillas || []).forEach(cell => {
      if (!cell) return;
      const hex = scene.add.rectangle(
        cell.x, cell.y,
        scene.hexW * 0.7, scene.hexH * 0.7,
        0x996633, 0.25
      )
        .setDepth(8)
        .setInteractive()
        .on("pointerover", () => hex.setAlpha(0.45))
        .on("pointerout", () => hex.setAlpha(0.25))
        .on("pointerdown", () => {
          overlays.forEach(o => o.destroy());
          const objetivo = cell.ocupante;
          if (!objetivo) {
            scene.addLog("❌ No hay enemigo en esa casilla");
            return;
          }

          const defensor = objetivo.getData("dragon");
          if (!defensor || scene.aliados.includes(defensor)) {
            scene.addLog("❌ Solo puedes atacar enemigos");
            return;
          }

          // 💥 Daño base
          const base = Math.max(atacante.aliento * 1.4, atacante.mordisco);
          let dmg = Math.floor(base - (defensor.armadura || 0));
          const critico = Math.random() < 0.3;
          if (critico) dmg = Math.floor(dmg * 1.5);
          dmg = Math.max(1, dmg);

          // Animación visual
          const fx = scene.add.circle(objetivo.x, objetivo.y, 40, 0x996633, 0.35).setDepth(30);
          scene.tweens.add({
            targets: fx,
            scale: 2,
            alpha: 0,
            duration: 600,
            ease: "Cubic.easeOut",
            onComplete: () => fx.destroy()
          });

          defensor.vida = Math.max(0, defensor.vida - dmg);
          scene.actualizarBarras(objetivo);

          const dmgText = scene.add.text(objetivo.x, objetivo.y - 40, `-${Math.round(dmg)}`, {
            fontFamily: "'Cinzel Decorative', serif",fontSize: "20px",
            fill: "#ffcc00",
            stroke: "#000",
            strokeThickness: 3
          }).setOrigin(0.5).setDepth(35);
          scene.tweens.add({
            targets: dmgText,
            y: objetivo.y - 80,
            alpha: 0,
            duration: 900,
            ease: "Cubic.easeOut",
            onComplete: () => dmgText.destroy()
          });

          if (critico) {
            scene.addLog(`💥 ¡Crítico pétreo de ${atacante.name}!`);
          }
          scene.addLog(`🪨 ${atacante.name} lanza una Esquirla sobre ${defensor.name} (-${dmg} HP)`);

          if (defensor.vida <= 0) {
            scene.addLog(`☠️ ${defensor.name} es aplastado por la roca`);
            scene.time.delayedCall(300, () => {
              objetivo.destroy();
              const c = scene.getCell(objetivo.getData("col"), objetivo.getData("row"));
              if (c) c.ocupante = null;
            });
          }

          // 💨 Gastar recursos
          atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
          atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - 2);
          scene.actualizarBarras(atacanteSprite);
          scene.actualizarBolitas(atacanteSprite);

          // ✅ Marcar como usada
          tacticsSkills.marcarSkillUsada(atacante, this);

          // 🔚 Finalizar turno
          scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
        });

      overlays.push(hex);
    });
  }
},
// SKILLS MISTERIO HERE
/** 🌑 Skill: Eco de Sombras (tipo Misterio)
 *  - Coste: 20 PA + 1 aliento
 *  - Daño: aliento × 1.2
 *  - Prob. crítico: 20 %
 *  - Área: enemigos adyacentes
 *  - Efecto: el objetivo fallará su siguiente mordisco, skill o aliento
 */
/** 🌑 Skill: Eco de Sombras (rango 5)
 *  - Coste: 20 PA + 2 alientos
 *  - Rango: hasta 5 hexágonos
 *  - Daño: aliento × 1.8, 20% crítico
 *  - Efecto: embruja al objetivo (fallará su próximo ataque)
 */
ecoDeSombras: {
  nombre: "Eco de Sombras",
  costePA: 20,
  costeAliento: 2,
  descripcion: "Golpea con energía oscura a un enemigo a distancia (hasta 5 hexágonos). Daño = aliento×1.8, 20% crítico, y lo embruja (falla su próximo ataque).",
  icono: "🌑",

  ejecutar(scene, atacanteSprite) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) return;

    // ✅ Control de uso único por combate
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Comprobación de recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Eco de Sombras");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan alientos para esta habilidad");
      return;
    }

    // 📡 Selección de objetivo — rango 1–5
    scene.addLog("🌑 Elige un enemigo hasta 5 hexágonos para lanzar Eco de Sombras");
    scene.attackMode = true;
    scene.attackHighlights = [];

    const col = atacanteSprite.getData("col");
    const row = atacanteSprite.getData("row");

    // 💜 Capa de hover dinámica
    const hoverArea = scene.add.graphics().setDepth(8);
    let ultimaCelda = null;

    (scene.casillas || []).forEach(cell => {
      const dist = IAtactic.distHex(col, row, cell.col, cell.row);
      if (dist >= 1 && dist <= 5) {
        const pts = scene.hexPointsFlat(cell.x, cell.y, scene.hexSize * 0.95);
        const poly = new Phaser.Geom.Polygon(pts.flatMap(p => [p.x, p.y]));
        const g = scene.add.graphics();
        g.fillStyle(0x9933ff, 0.25);
        g.fillPoints(pts, true);
        g.setDepth(9);
        g.setInteractive(poly, Phaser.Geom.Polygon.Contains);
        g.cellRef = cell;

        // ✴️ Hover: resalta el objetivo en morado intenso
        g.on("pointerover", () => {
          if (!scene.attackMode) return;
          if (ultimaCelda === cell) return;
          ultimaCelda = cell;
          hoverArea.clear();

          const pts2 = scene.hexPointsFlat(cell.x, cell.y, scene.hexSize * 0.95);
          hoverArea.fillStyle(0xaa00ff, 0.35);
          hoverArea.fillPoints(pts2, true);
        });

        g.on("pointerout", () => {
          if (!scene.attackMode) return;
          hoverArea.clear();
        });

        // 🖱️ Click para lanzar
        g.on("pointerdown", () => {
          if (!scene.attackMode) return;
          scene.attackMode = false;
          scene.attackHighlights.forEach(h => h.destroy());
          scene.attackHighlights = [];
          hoverArea.clear();
          hoverArea.destroy();

          const objetivo = cell.ocupante;
          if (!objetivo) {
            scene.addLog("❌ No hay enemigo en esa casilla");
            return;
          }

          const defensor = objetivo.getData("dragon");
          if (!defensor || scene.aliados.includes(defensor)) {
            scene.addLog("❌ Solo puedes embrujar enemigos");
            return;
          }

          // 🔮 FX lanzamiento
          const fx = scene.add.circle(atacanteSprite.x, atacanteSprite.y, 35, 0x9933ff, 0.3).setDepth(20);
          scene.tweens.add({
            targets: fx,
            scale: 2,
            alpha: 0,
            duration: 600,
            ease: "Cubic.easeOut",
            onComplete: () => fx.destroy()
          });

          // 🎯 Daño base
          let dmg = (atacante.aliento || 0) * 1.8;
          let critico = false;
          if (Math.random() < 0.2) {
            dmg *= 1.5;
            critico = true;
            const critTxt = scene.add.text(objetivo.x, objetivo.y - 60, "💥 CRÍTICO!", {
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: "22px",
              fill: "#ff99ff",
              stroke: "#000",
              strokeThickness: 3
            }).setOrigin(0.5).setDepth(40);
            scene.tweens.add({
              targets: critTxt,
              y: objetivo.y - 100,
              alpha: 0,
              duration: 900,
              ease: "Cubic.easeOut",
              onComplete: () => critTxt.destroy()
            });
          }

          dmg = Math.floor(dmg);
          defensor.vida = Math.max(0, defensor.vida - dmg);
          scene.actualizarBarras(objetivo);

          // 🌫️ Efecto en enemigo
          const fxHit = scene.add.circle(objetivo.x, objetivo.y, 30, 0x660099, 0.4).setDepth(30);
          scene.tweens.add({
            targets: fxHit,
            scale: 2,
            alpha: 0,
            duration: 800,
            ease: "Cubic.easeOut",
            onComplete: () => fxHit.destroy()
          });

          // Texto de daño
          const dmgTxt = scene.add.text(objetivo.x, objetivo.y - 40, `-${dmg}`, {
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: "20px",
            fill: "#cc99ff",
            stroke: "#000",
            strokeThickness: 3
          }).setOrigin(0.5).setDepth(35);
          scene.tweens.add({
            targets: dmgTxt,
            y: objetivo.y - 80,
            alpha: 0,
            duration: 900,
            ease: "Cubic.easeOut",
            onComplete: () => dmgTxt.destroy()
          });

          // ☠️ Si muere
          if (defensor.vida <= 0) {
            scene.addLog(`☠️ ${defensor.name} es consumido por las sombras`);
            scene.time.delayedCall(300, () => {
              objetivo.destroy();
              const c = scene.getCell(objetivo.getData("col"), objetivo.getData("row"));
              if (c) c.ocupante = null;
            });
          } else {
            // 🌑 Aplica debuff
            defensor.debuffMisterio = true;
            scene.addLog(`🌑 ${defensor.name} queda embrujado: fallará su próximo ataque`);
          }

          // 💨 Costes
          atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
          atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - 2);
          scene.actualizarBarras(atacanteSprite);
          scene.actualizarBolitas(atacanteSprite);

          // ✅ Marca como usada
          tacticsSkills.marcarSkillUsada(atacante, this);

          // 🔚 Finaliza turno
        });

        scene.attackHighlights.push(g);
      }
    });
  }
},

// 💢 Skill: Invisibilidad (tipo misterio)
invisibilidad: {
  nombre: "Invisibilidad",
  costePA: 10,
  costeAliento: 2,
  descripcion: "Durante 3 turnos, el dragón se vuelve casi invisible, aumentando su esquiva un 50 %.",
  icono: "💢",

  ejecutar(scene, atacanteSprite) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) return;

    // ⛔ Verificar si ya usó esta skill
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Verificar recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Invisibilidad");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan alientos para esta habilidad");
      return;
    }

    // 🔹 Gastar recursos
    atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
    atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);
    scene.actualizarBarras?.(atacanteSprite);
    scene.actualizarBolitas?.(atacanteSprite);

    // 🌫️ Aplicar efecto
    atacante.turnosInvisibilidad = 5;
    atacante._bonusEsquivaOriginal = atacante._bonusEsquivaOriginal || 0;
    atacante.esquivaExtra = 0.5; // +50 %

    // 💢 Icono visual sobre el dragón
    const icono = scene.add.text(atacanteSprite.x, atacanteSprite.y - 50, "💢", {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "28px",
      stroke: "#000",
      strokeThickness: 3
    }).setDepth(999).setAlpha(0.9);

    scene.tweens.add({
      targets: icono,
      y: atacanteSprite.y - 55,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // 🌌 FX circular morado translúcido bajo el dragón
    const fx = scene.add.circle(atacanteSprite.x, atacanteSprite.y, 45, 0x663399, 0.25).setDepth(20);
    scene.tweens.add({
      targets: fx,
      alpha: { from: 0.3, to: 0.6 },
      scale: { from: 1, to: 1.15 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    // 💠 Guardar aura activa
    const aura = {
      caster: atacante,
      sprite: atacanteSprite,
      duracionRestante: 3,
      tipo: "misterio",
      fx,
      icono,
      fin() {
        atacante.esquivaExtra = 0;
        atacante.turnosInvisibilidad = 0;
        fx?.destroy();
        icono?.destroy();
        scene.addLog(`💢 ${atacante.name} vuelve a ser visible`);
      }
    };

    if (!scene.aurasDefensivas) scene.aurasDefensivas = [];
    scene.aurasDefensivas.push(aura);

    // 💢 Mantener FX e icono sobre el dragón al moverse
    scene.events.on("update", () => {
      if (aura.fx && aura.sprite && aura.sprite.active) {
        aura.fx.x = aura.sprite.x;
        aura.fx.y = aura.sprite.y;
      }
      if (aura.icono && aura.sprite && aura.sprite.active) {
        aura.icono.x = aura.sprite.x;
        aura.icono.y = aura.sprite.y - 50;
      }
    });

    // ✅ Marcar como usada
    tacticsSkills.marcarSkillUsada(atacante, this);

    // 🪶 Log
    scene.addLog(`💢 ${atacante.name} se desvanece entre destellos (esquiva +50 %)`);

    // 🔚 Finalizar turno
    scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
  }
},

// SKILLS TRUENO HERE
// ⚡ Skill: Rayo Aturdidor
rayoAturdidor: {
  nombre: "Rayo Aturdidor",
  costePA: 20,
  costeAliento: 2,
  descripcion: "Dispara un rayo a 2–3 hex como el aliento. Daño = aliento × 0.8. Puede esquivarse. Aturde al objetivo por sus próximos 2 turnos.",
  icono: "⚡",

  ejecutar(scene, atacanteSprite, esIA = false) {
    const atacante = atacanteSprite?.getData("dragon");
    if (!atacante) return;

    // ⛔ Control de uso único (como el resto de skills)
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para Rayo Aturdidor");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan alientos para Rayo Aturdidor");
      return;
    }

    const distHex = (c1, r1, c2, r2) =>
      (typeof scene.distHexFlat === "function")
        ? scene.distHexFlat(c1, r1, c2, r2)
        : IAtactic.distHex(c1, r1, c2, r2);

    // ========== MODO IA ==========
    if (esIA) {
      const enemigosVivos = scene.sprites.filter(s => {
        const d2 = s.getData("dragon");
        return d2 && scene.aliados.includes(d2) && d2.vida > 0;
      });

      const c = atacanteSprite.getData("col");
      const r = atacanteSprite.getData("row");

      // Prioriza objetivo en rango 2–3 que NO esté ya aturdido
      let candidato = null;
      let mejor = 999;
      enemigosVivos.forEach(s => {
        const c2 = s.getData("col"), r2 = s.getData("row");
        const d = distHex(c, r, c2, r2);
        if (d >= 2 && d <= 3) {
          const yaStun = (s.getData("dragon")?.turnosAturdido || 0) > 0;
          const score = d + (yaStun ? 1 : 0); // penaliza si ya está stun
          if (score < mejor) { mejor = score; candidato = s; }
        }
      });

      if (!candidato) {
        scene.addLog(`⚡ ${atacante.name} intenta Rayo Aturdidor, pero no hay objetivos en 2–3`);
        // Mantén el patrón del resto de skills IA: termina el turno si falla
        scene.time.delayedCall(400, () => scene.finalizarTurno());
        return;
      }

      const objetivoSprite = candidato;
      const defensor = objetivoSprite.getData("dragon");

      // 🎲 Esquiva igual que aliento (escala lenta: vel 10 -> 17%, vel 30 -> 50% cap)
      const probEsquiva = Math.min(0.50, (defensor.velocidad || 0) * 0.017);
      if (Math.random() < probEsquiva) {
        const t = scene.add.text(objetivoSprite.x, objetivoSprite.y - 40, "⚡ ESQUIVA", {
          fontFamily: "'Cinzel Decorative', serif",fontSize: "22px", fill: "#00ffff", fontStyle: "bold"
        }).setOrigin(0.5).setDepth(40);
        scene.tweens.add({ targets: t, y: objetivoSprite.y - 80, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
        scene.addLog(`${defensor.name} esquiva el Rayo Aturdidor`);

        // Gastos igual que aliento: consumimos aliento incluso si esquiva
        atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
        atacante.numAlientos  = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);
        scene.actualizarBarras(atacanteSprite);
        scene.actualizarBolitas(atacanteSprite);

        tacticsSkills.marcarSkillUsada(atacante, this);
        return;
      }

      // 🔥 Daño (aliento × 1.5) + pequeña variación
      let dmg = Math.max(1, Math.floor((atacante.aliento || 0) * 1.5 + Phaser.Math.Between(-3, 3)));
      defensor.vida = Math.max(0, defensor.vida - dmg);
      scene.actualizarBarras(objetivoSprite);

      // FX
      const fx = scene.add.circle(objetivoSprite.x, objetivoSprite.y, 36, 0xffff66, 0.4).setDepth(40);
      scene.tweens.add({ targets: fx, scale: 2.4, alpha: 0, duration: 600, ease: "Cubic.easeOut", onComplete: () => fx.destroy() });

      // ⚡ Aplica aturdimiento: pierde sus próximos 2 turnos
      defensor.turnosAturdido = 2;
      scene.addLog(`⚡ ${atacante.name} aturde a ${defensor.name} (-${dmg} HP, pierde 2 turnos)`);

      // Muere?
      if (defensor.vida <= 0) {
        scene.addLog(`☠️ ${defensor.name} cae electrocutado`);
        scene.time.delayedCall(250, () => {
          objetivoSprite.destroy();
          const cObj = scene.getCell(objetivoSprite.getData("col"), objetivoSprite.getData("row"));
          if (cObj) cObj.ocupante = null;
        });
      }

      // Gastos
      atacante.puntosAccion = Math.max(0, atacante.puntosAccion - this.costePA);
      atacante.numAlientos  = Math.max(0, (atacante.numAlientos || 0) - this.costeAliento);
      scene.actualizarBarras(atacanteSprite);
      scene.actualizarBolitas(atacanteSprite);

      tacticsSkills.marcarSkillUsada(atacante, this);
      return;
    }

    // ========== MODO JUGADOR ==========
    scene.addLog("⚡ Elige un objetivo a 2–3 hex para Rayo Aturdidor");
    scene.attackMode = true;
    scene.attackHighlights = [];

    const col = atacanteSprite.getData("col");
    const row = atacanteSprite.getData("row");

    (scene.casillas || []).forEach(cell => {
      const d = distHex(col, row, cell.col, cell.row);
      if (d >= 2 && d <= 3) {
        const pts = scene.hexPointsFlat(cell.x, cell.y, scene.hexSize * 0.95);
        const poly = new Phaser.Geom.Polygon(pts.flatMap(p => [p.x, p.y]));
        const g = scene.add.graphics();
        g.fillStyle(0xffff66, 0.28);
        g.fillPoints(pts, true);
        g.setDepth(9);
        g.setInteractive(poly, Phaser.Geom.Polygon.Contains);
        g.cellRef = cell;

        g.on("pointerdown", () => {
          // limpiar UI
          scene.attackMode = false;
          scene.attackHighlights.forEach(h => h.destroy());
          scene.attackHighlights = [];

          const objetivo = cell.ocupante;
          if (!objetivo) { scene.addLog("❌ No hay enemigo en esa casilla"); return; }
          const defensor = objetivo.getData("dragon");
          if (!defensor || scene.aliados.includes(defensor)) { scene.addLog("❌ Solo puedes golpear enemigos"); return; }

          // 🎲 Esquiva
          const probEsq = Math.min(0.50, (defensor.velocidad || 0) * 0.017);
          if (Math.random() < probEsq) {
            const t = scene.add.text(objetivo.x, objetivo.y - 40, "⚡ ESQUIVA", {
              fontFamily: "'Cinzel Decorative', serif",fontSize: "22px", fill: "#00ffff", fontStyle: "bold"
            }).setOrigin(0.5).setDepth(40);
            scene.tweens.add({ targets: t, y: objetivo.y - 80, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
            scene.addLog(`${defensor.name} esquiva el Rayo Aturdidor`);

            // Gastos (se consume igual)
            atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
            atacante.numAlientos  = Math.max(0, (atacante.numAlientos || 0) - 2);
            scene.actualizarBarras(atacanteSprite);
            scene.actualizarBolitas(atacanteSprite);

            tacticsSkills.marcarSkillUsada(atacante, this);
            return;
          }

          // Daño
          let dmg = Math.max(1, Math.floor((atacante.aliento || 0) * 1.5 + Phaser.Math.Between(-3, 3)));
          defensor.vida = Math.max(0, defensor.vida - dmg);
          scene.actualizarBarras(objetivo);

          // FX
          const fx = scene.add.circle(objetivo.x, objetivo.y, 36, 0xffff66, 0.4).setDepth(40);
          scene.tweens.add({ targets: fx, scale: 2.4, alpha: 0, duration: 600, ease: "Cubic.easeOut", onComplete: () => fx.destroy() });
          
          // Stun 2 turnos
          defensor.turnosAturdido = 2;
          scene.addLog(`⚡ ${atacante.name} aturde a ${defensor.name} (-${dmg} HP, pierde 2 turnos)`);

          if (defensor.vida <= 0) {
            scene.addLog(`☠️ ${defensor.name} cae electrocutado`);
            scene.time.delayedCall(250, () => {
              objetivo.destroy();
              const cObj = scene.getCell(objetivo.getData("col"), objetivo.getData("row"));
              if (cObj) cObj.ocupante = null;
            });
          }

          // Gastos
          atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
          atacante.numAlientos  = Math.max(0, (atacante.numAlientos || 0) - 2);
          scene.actualizarBarras(atacanteSprite);
          scene.actualizarBolitas(atacanteSprite);

          tacticsSkills.marcarSkillUsada(atacante, this);
        });

        scene.attackHighlights.push(g);
      }
    });
  }
},
/** ⚡ Skill: Nube de Rayos
*  - Coste: 20 PA
*  - Coste adicional: 2 alientos
*  - Crea una nube que dura 3 turnos y daña a los dragones en su área
*  - Ahora muestra el área en rojo al mover el cursor antes de lanzar
*/
nubeDeRayos: {
  nombre: "Nube de Rayos",
  costePA: 20,
  costeAliento: 2,
  descripcion: "Crea una nube eléctrica que dura 3 turnos y daña a los dragones en su área. Al mover el cursor se ilumina en rojo el área de efecto.",
  icono: "⚡",

  ejecutar(scene, atacanteSprite) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) return;

    // ⛔ Verificar si ya usó esta skill
    if (!tacticsSkills.puedeUsarSkill(atacante, this, scene)) return;

    // ⚡ Comprobaciones de recursos
    if (atacante.puntosAccion < this.costePA) {
      scene.addLog("❌ No tienes PA suficientes para usar Nube de Rayos");
      return;
    }
    if ((atacante.numAlientos ?? 0) < this.costeAliento) {
      scene.addLog("❌ No te quedan suficientes alientos para esta habilidad");
      return;
    }

    // 🟨 Activar modo de selección de casilla
    scene.addLog("⚡ Elige una casilla (se iluminará el área de efecto al pasar el cursor)");
    scene.attackMode = true;
    scene.attackHighlights = [];

    // 🔴 Capa dinámica para mostrar área bajo el cursor
    const hoverArea = scene.add.graphics().setDepth(8);
    let ultimaCelda = null;

    // 📍 Mostrar todas las casillas posibles (amarillo base)
    (scene.casillas || []).forEach(cell => {
      const pts = scene.hexPointsFlat(cell.x, cell.y, scene.hexSize * 0.95);
      const poly = new Phaser.Geom.Polygon(pts.flatMap(p => [p.x, p.y]));
      const g = scene.add.graphics();
      g.fillStyle(0xffff00, 0.25);
      g.fillPoints(pts, true);
      g.setDepth(9);
      g.setInteractive(poly, Phaser.Geom.Polygon.Contains);
      g.cellRef = cell;

      // 🖱️ Cuando paso el ratón: iluminar área
      g.on("pointerover", () => {
        if (!scene.attackMode) return;
        const c = cell;
        if (c === ultimaCelda) return;
        ultimaCelda = c;
        hoverArea.clear();

        const area = [c, ...scene.adyacentes(c.col, c.row)].filter(Boolean);
        area.forEach(a => {
          const ptsA = scene.hexPointsFlat(a.x, a.y, scene.hexSize * 0.95);
          hoverArea.fillStyle(0xff0000, 0.35); // 🔴 rojo translúcido
          hoverArea.fillPoints(ptsA, true);
        });
      });

      // 🖱️ Cuando saco el ratón: limpiar
      g.on("pointerout", () => {
        if (!scene.attackMode) return;
        hoverArea.clear();
      });

      // 🖱️ Click para confirmar el lanzamiento
      g.on("pointerdown", () => {
        if (!scene.attackMode) return;

        scene.attackMode = false;
        scene.attackHighlights.forEach(x => x.destroy());
        scene.attackHighlights = [];
        hoverArea.clear();
        hoverArea.destroy();

        const col = cell.col;
        const row = cell.row;

        // Crear nube en el área (celda + adyacentes)
        const area = [cell, ...scene.adyacentes(col, row)].filter(Boolean);
        const nube = {
          area,
          duracionRestante: 3,
          creador: atacante,
          tipo: "trueno"
        };

        // 💨 Efecto visual: nube azul eléctrico
        nube.fx = area.map(c => {
          const s = scene.add.circle(c.x, c.y, 38, 0x99ccff, 0.25).setDepth(5);
          scene.tweens.add({
            targets: s,
            alpha: { from: 0.25, to: 0.5 },
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut"
          });
          return s;
        });

        if (!scene.nubesActivas) scene.nubesActivas = [];
        scene.nubesActivas.push(nube);

        // ⚡ Gastar PA y aliento
        atacante.puntosAccion = Math.max(0, atacante.puntosAccion - 20);
        atacante.numAlientos = Math.max(0, (atacante.numAlientos || 0) - 2);

        scene.actualizarBarras?.(atacanteSprite);
        scene.actualizarBolitas?.(atacanteSprite);

        // ✅ Marcar skill como usada
        tacticsSkills.marcarSkillUsada(atacante, this);

        // 🪶 Logs
        scene.addLog(`⚡ ${atacante.name} invoca una nube de rayos (${nube.area.length} celdas)`);
        scene.addLog(`⚡ ${atacante.name} gasta 2 alientos (${atacante.numAlientos} restantes)`);
      });

      scene.attackHighlights.push(g);
    });
  }
},

/** 🩸 Función genérica para mostrar texto de daño sobre un objetivo */
mostrarDaño(scene, objetivoSprite, dmg, color = "#ff4444") {
  if (!scene || !objetivoSprite) return;
  const dmgText = scene.add.text(objetivoSprite.x, objetivoSprite.y - 40, `-${Math.round(dmg)}`, {
    fontFamily: "'Cinzel Decorative', serif",
    fontSize: "22px",
    fill: color,
    stroke: "#000",
    strokeThickness: 3
  }).setOrigin(0.5).setDepth(45);

  scene.tweens.add({
    targets: dmgText,
    y: objetivoSprite.y - 80,
    alpha: 0,
    duration: 900,
    ease: "Cubic.easeOut",
    onComplete: () => dmgText.destroy()
  });
},

/** 🧩 Comprueba si una skill está disponible (cooldown de 3 turnos) */
puedeUsarSkill(dragon, skill, scene) {
  if (!dragon || !skill) return false;

  dragon.cooldowns = dragon.cooldowns || {};

  const cd = dragon.cooldowns[skill.nombre] || 0;
  if (cd > 0) {
    scene?.addLog?.(`❌ ${dragon.name} aún no puede usar ${skill.nombre} (en recarga: ${cd} turnos restantes)`);
    return false;
  }

  return true;
},

/** 🧩 Activa cooldown de 3 turnos tras usar una skill */
marcarSkillUsada(dragon, skill) {
  if (!dragon || !skill) return;
  dragon.cooldowns = dragon.cooldowns || {};
  dragon.cooldowns[skill.nombre] = 3; // 🔥 3 turnos de recarga
},


/** 🧩 Marca una skill específica como usada */
marcarSkillUsada(dragon, skill) {
  if (!dragon || !skill) return;
  dragon.skillsUsadas = dragon.skillsUsadas || {};
  dragon.skillsUsadas[skill.nombre] = true;
},

 /** 🧩 Utilidad común para actualizar las bolitas de aliento existentes */
actualizarBolitasAliento(scene, sprite) {
  const dragon = sprite.getData("dragon");
  if (!dragon || !sprite.alientoIcons) return;

  // Si hay más bolitas dibujadas de las que deberían, eliminamos las sobrantes
  const exceso = sprite.alientoIcons.length - (dragon.numAlientos || 0);
  if (exceso > 0) {
    for (let i = 0; i < exceso; i++) {
      const bolita = sprite.alientoIcons.pop();
      if (bolita && bolita.destroy) bolita.destroy();
    }
  }

  // Si hay menos bolitas (por algún bug), redibujar faltantes
  if (sprite.alientoIcons.length < (dragon.numAlientos || 0)) {
    const baseY = sprite.y + (sprite.displayHeight / 2) + 12;
    for (let i = sprite.alientoIcons.length; i < (dragon.numAlientos || 0); i++) {
      const icon = scene.add.circle(
        sprite.x - 10 + (i * 10),
        baseY,
        4,
        0xff3300
      ).setDepth(25);
      sprite.alientoIcons.push(icon);
    }
  }
}


};
/** 🔁 Reduce los cooldowns activos al terminar el turno del dragón */
tacticsSkills.reducirCooldowns = function(dragon) {
  if (!dragon || !dragon.cooldowns) return;

  for (const skill in dragon.cooldowns) {
    if (dragon.cooldowns[skill] > 0) {
      dragon.cooldowns[skill]--;
      if (dragon.cooldowns[skill] <= 0) delete dragon.cooldowns[skill];
    }
  }
};
window.tacticsSkills = tacticsSkills;
