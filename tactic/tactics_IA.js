/***** =========================
 * IAtactic.js – IA con reserva de alientos y uso de skills equilibrado
 * ========================== */

const IAtactic = {
  /** 🔁 Turno completo de la IA enemiga (versión agresiva y prioriza skill) */
playTurn(scene, dragonSprite = null) {
  if (!scene || !scene.enemigos || !scene.aliados) return;

  const enemigos = scene.enemigos.filter(d => d.vida > 0);
  const aliados  = scene.aliados.filter(d => d.vida > 0);
  if (!enemigos.length || !aliados.length) {
    scene.time.delayedCall(400, () => scene.finalizarTurno());
    return;
  }

  // 🧩 Seleccionar sprite activo si no viene desde TurnManager
  if (!dragonSprite) {
    const enemigosVivos = scene.sprites.filter(s =>
      scene.enemigos.includes(s.getData("dragon")) &&
      s.getData("dragon").vida > 0
    );
    if (!enemigosVivos.length) {
      scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
    }
    dragonSprite = enemigosVivos[0];
  }

  const dragon = dragonSprite.getData("dragon");
  if (!dragon || dragon.vida <= 0) {
    scene.time.delayedCall(400, () => scene.finalizarTurno());
    return;
  }

  // 🧮 Garantiza al menos 20 PA la primera vez que actúa
  if (!dragon._paMinInitOk) {
    if (dragon.puntosAccion < 20) {
      dragon.puntosAccion = 20;
      scene.actualizarBarras?.(dragonSprite);
    }
    dragon._paMinInitOk = true;
  }

  // === Buscar objetivos (aliados del jugador) ===
  const posibles = scene.sprites.filter(s =>
    scene.aliados.includes(s.getData("dragon")) &&
    s.getData("dragon").vida > 0
  );
  if (!posibles.length) {
    scene.time.delayedCall(400, () => scene.finalizarTurno());
    return;
  }

  // === Elegir objetivo ===
  const objetivo = IAtactic.elegirObjetivo(scene, dragonSprite, posibles);
  if (!objetivo) {
    scene.time.delayedCall(400, () => scene.finalizarTurno());
    return;
  }

  // 🔁 Si cambia de objetivo, resetea memoria de retroceso
  const tgtId =
    objetivo.getData("dragon")?.name ||
    objetivo.getData("dragon")?.id ||
    `${objetivo.getData("col")},${objetivo.getData("row")}`;
  const lastTgt = dragonSprite.getData("aiLastTargetId");
  if (lastTgt !== tgtId) {
    dragonSprite.setData("aiLastTargetId", tgtId);
    dragonSprite.setData("prevCell", null);
  }

  const c = dragonSprite.getData("col");
  const r = dragonSprite.getData("row");
  const dist = IAtactic.distHex(c, r, objetivo.getData("col"), objetivo.getData("row"));

  // === 1️⃣ Intentar skill primero (solo una vez por turno)
  if (!dragon._iaSkillTried && window.tacticsSkills?.obtenerSkillsPorTipo) {
    const plan = IAtactic.decidirSkill(scene, dragonSprite, objetivo);
    dragon._iaSkillTried = true;

    if (plan) {
      const skill = plan.skill;
      try {
        if (plan.tipo === "nubeRayos" && plan.celda) {
          IAtactic._lanzarNubeIA(scene, skill, dragonSprite, plan.celda);
          return;
        }
        if (skill?.nombre === "Eco de Sombras") {
          IAtactic._ecoSombrasIA(scene, dragonSprite, objetivo);
          return;
        }

       // ✅ Ejecutar skill normal y continuar turno si quedan recursos
skill.ejecutar(scene, dragonSprite, true);

// 🔁 Tras pequeña pausa, continuar el turno si tiene PA o alientos
scene.time.delayedCall(800, () => {
  const drag = dragonSprite.getData("dragon");
  if (!drag) return scene.finalizarTurno();

  const puedeSeguir = drag.puntosAccion >= 10 && drag.vida > 0;
  if (puedeSeguir) {
    IAtactic.playTurn(scene, dragonSprite); // reintenta atacar o moverse
  } else {
    scene.finalizarTurno();
  }
});
return;
      } catch (e) {
        console.warn("⚠️ Error ejecutando skill IA:", skill?.nombre, e);
      }
    }
  }

  // === 2️⃣ Si tiene aliento y objetivo a rango 2–3 → usarlo
  const _reserva = IAtactic.reservaAlientoNecesaria(
    scene, dragon, (dragon.tipo||"").toLowerCase(), (dragon.clase||"").toLowerCase()
  );
  if (
    dist >= 2 && dist <= 3 &&
    (dragon.numAlientos || 0) > _reserva &&
    dragon.puntosAccion >= 20
  ) {
    scene.addLog(`🔥 ${dragon.name} lanza su aliento sobre ${objetivo.getData("dragon").name}`);
    scene.resolveAliento(
      dragonSprite,
      objetivo,
      scene.getCell(objetivo.getData("col"), objetivo.getData("row"))
    );
    return;
  }

  // === 3️⃣ Si está adyacente → morder
  if (dist === 1 && dragon.puntosAccion >= 20) {
    scene.addLog(`💢 ${dragon.name} muerde a ${objetivo.getData("dragon").name}`);
    scene.resolveAttack(
      dragonSprite,
      objetivo,
      scene.getCell(objetivo.getData("col"), objetivo.getData("row"))
    );
    return;
  }

  // === 4️⃣ Si está lejos → moverse
  if (dist > 1 && dragon.puntosAccion >= 10) {
    const antes = { col: dragonSprite.getData("col"), row: dragonSprite.getData("row") };
    IAtactic.moverHacia(scene, dragonSprite, objetivo);

    scene.time.delayedCall(700, () => {
      const c1 = dragonSprite.getData("col");
      const r1 = dragonSprite.getData("row");
      const nuevaDist = IAtactic.distHex(c1, r1, objetivo.getData("col"), objetivo.getData("row"));

      // 💨 Si tras moverse queda en rango 2–3 → lanzar aliento
      if (
        nuevaDist >= 2 && nuevaDist <= 3 &&
        (dragon.numAlientos || 0) > _reserva &&
        dragon.puntosAccion >= 20
      ) {
        scene.addLog(`🔥 ${dragon.name} lanza su aliento a distancia sobre ${objetivo.getData("dragon").name}`);
        scene.resolveAliento(
          dragonSprite,
          objetivo,
          scene.getCell(objetivo.getData("col"), objetivo.getData("row"))
        );
        return;
      }

      // 💥 Si quedó adyacente → morder
      if (nuevaDist === 1 && dragon.puntosAccion >= 20) {
        scene.addLog(`💥 ${dragon.name} muerde a ${objetivo.getData("dragon").name}`);
        scene.resolveAttack(
          dragonSprite,
          objetivo,
          scene.getCell(objetivo.getData("col"), objetivo.getData("row"))
        );
        return;
      }

      // 😐 Si no pudo moverse ni atacar → fin de turno
      scene.time.delayedCall(300, () => scene.finalizarTurno());
    });
    return;
  }

  // === 5️⃣ Sin opciones → fin de turno
  scene.time.delayedCall(300, () => scene.finalizarTurno());
},


  /* ──────────────────────────────────────────────────────────────
   * DECISIÓN DE SKILLS con reserva de aliento
   * ────────────────────────────────────────────────────────────── */
  decidirSkill(scene, dragonSprite, objetivoSprite) {
    const dragon = dragonSprite.getData("dragon");
    const tipo   = (dragon.tipo || "").toLowerCase();
    const clase  = (dragon.clase || "").toLowerCase();
    const skills = window.tacticsSkills.obtenerSkillsPorTipo(tipo) || [];
    if (!skills.length) return null;

    const c = dragonSprite.getData("col");
    const r = dragonSprite.getData("row");
    const cObj = objetivoSprite.getData("col");
    const rObj = objetivoSprite.getData("row");
    const dist = IAtactic.distHex(c, r, cObj, rObj);

    const hayEnemigoAdy = !!scene.adyacentes(c, r).find(cell => {
      const d2 = cell.ocupante?.getData("dragon");
      return d2 && scene.aliados.includes(d2) && d2.vida > 0;
    });

    const enemigosVivos = scene.sprites.filter(s => {
      const d2 = s.getData("dragon");
      return d2 && scene.aliados.includes(d2) && d2.vida > 0;
    });
    const aliadosVivos = scene.sprites.filter(s => {
      const d2 = s.getData("dragon");
      return d2 && scene.enemigos.includes(d2) && d2.vida > 0;
    });

    const tiene = (nombre) => skills.find(s => s.nombre === nombre);
    const puede = (skill) =>
      !!skill &&
      (!window.tacticsSkills || window.tacticsSkills.puedeUsarSkill(dragon, skill, scene)) &&
      dragon.puntosAccion >= (skill.costePA || 0) &&
      (dragon.numAlientos ?? 0) >= (skill.costeAliento || 0);

    // ✅ Reserva de aliento (no gastar el reservado en ofensivas)
    const reserva = IAtactic.reservaAlientoNecesaria(scene, dragon, tipo, clase);
    const puedeConReserva = (skill) => {
      if (!puede(skill)) return false;
      if (IAtactic.esAura(skill) || IAtactic.esSoporte(skill)) return true; // ignoran reserva
      const alientosTrasUso = (dragon.numAlientos || 0) - (skill.costeAliento || 0);
      return alientosTrasUso >= reserva;
    };

    // 🛡️ Tanques: si ya están en engage, priorizan aura por encima de todo (y ahorran alientos para ello)
    if (clase === "tanque" && hayEnemigoAdy && (dragon.numAlientos || 0) > 0) {
      const auraTanque = IAtactic._pickAura(
        ["Piel de Diamante", "Anillo de Fuego", "Invisibilidad", "Aceleración"],
        skills,
        puede
      );
      if (auraTanque) return { tipo: "skillDirecta", skill: auraTanque };
    }

    // 🌟 AURAS “naturales” de cada tipo: activación inteligente
if ((dragon.numAlientos || 0) > 0) {
  const fuegoAura    = tiene("Anillo de Fuego");
  const rocaAura     = tiene("Piel de Diamante");
  const misterioAura = tiene("Invisibilidad");
  const strikerAura  = tiene("Aceleración");

  // 💢 Caso 1: si hay enemigo adyacente → siempre activa su aura
  if (hayEnemigoAdy) {
    if (tipo === "fuego"    && puede(fuegoAura))    return { tipo:"skillDirecta", skill:fuegoAura };
    if (tipo === "roca"     && puede(rocaAura))     return { tipo:"skillDirecta", skill:rocaAura };
    if (tipo === "misterio" && puede(misterioAura)) return { tipo:"skillDirecta", skill:misterioAura };
    if (tipo === "striker"  && puede(strikerAura))  return { tipo:"skillDirecta", skill:strikerAura };
  }

  // 💢 Caso 2: si NO hay enemigos adyacentes → valorar defensivas
  else {
    const enemigosCercanos = enemigosVivos.filter(s => IAtactic.distHex(c, r, s.getData("col"), s.getData("row")) <= 3);
    const amenaza = enemigosCercanos.length > 0;

    // solo si no tiene ya el aura activa
    const tieneAura = IAtactic.tieneAuraActiva(scene, dragon, tipo);

    // evaluar conveniencia por tipo
    if (!tieneAura && amenaza) {
      // defensivas → pueden activarse preventivamente
      if (tipo === "roca" && puede(rocaAura))        return { tipo:"skillDirecta", skill:rocaAura };
      if (tipo === "misterio" && puede(misterioAura)) return { tipo:"skillDirecta", skill:misterioAura };
      if (tipo === "striker" && puede(strikerAura))   return { tipo:"skillDirecta", skill:strikerAura };

      // fuego solo si hay varios enemigos en rango 2 (ataque reactivo)
      if (tipo === "fuego" && puede(fuegoAura)) {
        const varios = enemigosCercanos.length >= 2;
        if (varios) return { tipo:"skillDirecta", skill:fuegoAura };
      }
    }
  }
}


    // 💧 AGUA: curar si hay heridos (radio 2). Si no, Esquirla (reserva)
    if (tipo === "agua") {
      const ola = tiene("Ola de Curación");
      if (puede(ola)) {
        const heridoCerca = aliadosVivos.find(s => {
          const d2 = s.getData("dragon");
          if (!d2) return false;
          const d = IAtactic.distHex(c, r, s.getData("col"), s.getData("row"));
          return d <= 2 && d2.vida < d2.vidaMax * 0.7;
        });
        if (heridoCerca) return { tipo: "skillDirecta", skill: ola };
      }
      const esqHielo = tiene("Esquirla de Hielo");
      if (puedeConReserva(esqHielo)) return { tipo: "skillDirecta", skill: esqHielo };
    }

    // 🔥 FUEGO: Llamarada (reserva) si hay objetivos en ≤3
    if (tipo === "fuego") {
      const llama = tiene("Llamarada");
      if (puedeConReserva(llama)) {
        const algunoR3 = enemigosVivos.some(s => IAtactic.distHex(c, r, s.getData("col"), s.getData("row")) <= 3);
        if (algunoR3) return { tipo: "skillDirecta", skill: llama };
      }
    }

    // ⚡ TRUENO: Rayo (reserva), si no Nube (reserva) si golpea ≥2
    if (tipo === "trueno") {
      const rayo = tiene("Rayo Aturdidor");
      if (puedeConReserva(rayo)) {
        const tgt = enemigosVivos.find(s => {
          const d = IAtactic.distHex(c, r, s.getData("col"), s.getData("row"));
          const yaStun = (s.getData("dragon")?.turnosAturdido || 0) > 0;
          return d >= 2 && d <= 3 && !yaStun;
        });
        if (tgt) return { tipo: "skillDirecta", skill: rayo };
      }
      const nube = tiene("Nube de Rayos");
      if (puedeConReserva(nube)) {
        const mejor = this._mejorCeldaParaNube(scene, enemigosVivos);
        if (mejor && mejor.golpeados >= 2) return { tipo: "nubeRayos", skill: nube, celda: mejor.celda };
      }
    }

    // 🪨 ROCA: Esquirla de Roca (reserva)
    if (tipo === "roca") {
      const esqRoca = tiene("Esquirla de Roca");
      if (puedeConReserva(esqRoca)) return { tipo: "skillDirecta", skill: esqRoca };
    }

    // 🎯 STRIKER: Sónico a 2–4 (reserva)
    if (tipo === "striker") {
      const sonico = tiene("Lanzamiento Sónico");
      if (puedeConReserva(sonico) && dist >= 2 && dist <= 4) {
        return { tipo: "skillDirecta", skill: sonico };
      }
    }

    // 🌑 MISTERIO: Eco si adyacente (reserva) — (IA wrapper)
    if (tipo === "misterio") {
      const eco = tiene("Eco de Sombras");
      if (puedeConReserva(eco) && hayEnemigoAdy) return { tipo: "skillDirecta", skill: eco };
    }

    return null;
  },
  /* ──────────────────────────────────────────────────────────────
   * 🔥 Determinar si debe priorizar aliento (versión complementaria)
   * ────────────────────────────────────────────────────────────── */
  debePriorizarAliento(dragon) {
    if (!dragon) return false;
    const aliento = dragon.aliento || 0;
    const mordisco = dragon.mordisco || 0;
    const numAlientos = dragon.numAlientos || 0;

    // ✅ Solo prioriza aliento si:
    // - Tiene al menos 1 aliento disponible
    // - Y su stat de aliento es mayor que el de mordisco
    return numAlientos > 0 && aliento > mordisco;
  },
  /* ──────────────────────────────────────────────────────────────
   * Helpers de clasificación/prioridad
   * ────────────────────────────────────────────────────────────── */
  esAura(skill) {
    return ["Anillo de Fuego", "Piel de Diamante", "Invisibilidad", "Aceleración"].includes(skill?.nombre);
  },
  esSoporte(skill) {
    return skill?.nombre === "Ola de Curación";
  },

  tieneAuraActiva(scene, dragon, tipo) {
    const t = (tipo || "").toLowerCase();
    const def = scene.aurasDefensivas?.some(a => a?.caster === dragon && (
      (t === "roca"     && a.tipo === "diamante") ||
      (t === "misterio" && a.tipo === "misterio") ||
      (t === "striker"  && a.tipo === "striker")
    ));
    const fuego = (t === "fuego") && scene.aurasActivas?.some(a => a?.caster === dragon && a.tipo === "fuego");
    return !!(def || fuego);
  },

  auraPreferidaPorTipo(tipo) {
    switch ((tipo || "").toLowerCase()) {
      case "fuego":    return "Anillo de Fuego";
      case "roca":     return "Piel de Diamante";
      case "misterio": return "Invisibilidad";
      case "striker":  return "Aceleración";
      default:         return null;
    }
  },

  // Reservar 1 aliento si tiene aura propia y no está activa (tanques SIEMPRE la reservan hasta activarla)
  reservaAlientoNecesaria(scene, dragon, tipo, clase) {
    const nombreAura = this.auraPreferidaPorTipo(tipo);
    if (!nombreAura) return 0;
    const skills = window.tacticsSkills?.obtenerSkillsPorTipo?.(tipo) || [];
    const poseeAura = !!skills.find(s => s.nombre === nombreAura);
    if (!poseeAura) return 0;
    const auraActiva = this.tieneAuraActiva(scene, dragon, tipo);
    if (auraActiva) return 0;
    if ((clase || "").toLowerCase() === "tanque") return 1;
    return 1;
  },

  _pickAura(nombres, skills, predicate) {
    for (const n of nombres) {
      const s = skills.find(k => k.nombre === n);
      if (predicate(s)) return s;
    }
    return null;
  },

  /* ──────────────────────────────────────────────────────────────
   * Wrappers IA para skills “solo jugador”
   * ────────────────────────────────────────────────────────────── */

  // 🌩️ Nube de Rayos (IA): replica la creación sin interacción
  _lanzarNubeIA(scene, skill, atacanteSprite, celda) {
    const atacante = atacanteSprite.getData("dragon");
    if (!atacante) { scene.finalizarTurno(); return; }

    // área = celda + adyacentes
    const area = [celda, ...scene.adyacentes(celda.col, celda.row)].filter(Boolean);
    const nube = {
      area,
      duracionRestante: 3,
      creador: atacante,
      tipo: "trueno"
    };

    // FX
    nube.fx = area.map(c => {
      const s = scene.add.circle(c.x, c.y, 38, 0x99ccff, 0.25).setDepth(5);
      scene.tweens.add({
        targets: s,
        alpha: { from: 0.25, to: 0.5 },
        duration: 600,
        yoyo: true, repeat: -1, ease: "Sine.easeInOut"
      });
      return s;
    });

    if (!scene.nubesActivas) scene.nubesActivas = [];
    scene.nubesActivas.push(nube);

    // Costes
    atacante.puntosAccion = Math.max(0, (atacante.puntosAccion || 0) - (skill.costePA || 0));
    atacante.numAlientos  = Math.max(0, (atacante.numAlientos  || 0) - (skill.costeAliento || 0));
    scene.actualizarBarras?.(atacanteSprite);
    scene.actualizarBolitas?.(atacanteSprite);

    // Marca usada
    window.tacticsSkills?.marcarSkillUsada?.(atacante, skill);

    // Log y fin
    scene.addLog(`⚡ ${atacante.name} invoca una nube de rayos (${nube.area.length} celdas)`);
scene.time.delayedCall(800, () => {
  const drag = atacanteSprite.getData("dragon");
  if (drag && drag.puntosAccion >= 10 && drag.vida > 0) {
    IAtactic.playTurn(scene, atacanteSprite);
  } else {
    scene.finalizarTurno();
  }
});  },

  // 🌑 Eco de Sombras (IA): golpea a un adyacente sin interacción
  _ecoSombrasIA(scene, atacanteSprite, objetivoSprite) {
    const atk = atacanteSprite.getData("dragon");
    const def = objetivoSprite.getData("dragon");
    if (!atk || !def) { scene.finalizarTurno(); return; }

    // Daño = aliento ×1.2 con 20% crit
    let dmg = (atk.aliento || 0) * 1.2;
    let crit = false;
    if (Math.random() < 0.2) { dmg *= 1.5; crit = true; }
    dmg = Math.max(1, Math.floor(dmg));

    def.vida = Math.max(0, def.vida - dmg);
    scene.actualizarBarras?.(objetivoSprite);

    // FX
    const fx1 = scene.add.circle(atacanteSprite.x, atacanteSprite.y, 35, 0x9933ff, 0.3).setDepth(20);
    scene.tweens.add({ targets: fx1, scale: 2, alpha: 0, duration: 600, ease: "Cubic.easeOut", onComplete: () => fx1.destroy() });
    const fx2 = scene.add.circle(objetivoSprite.x, objetivoSprite.y, 30, 0x660099, 0.4).setDepth(30);
    scene.tweens.add({ targets: fx2, scale: 2, alpha: 0, duration: 800, ease: "Cubic.easeOut", onComplete: () => fx2.destroy() });

    // Texto daño
    const dmgTxt = scene.add.text(objetivoSprite.x, objetivoSprite.y - 40, `-${dmg}`, {
      fontFamily: "'Cinzel Decorative', serif",fontSize: "20px", fill: "#cc99ff", stroke: "#000", strokeThickness: 3
    }).setOrigin(0.5).setDepth(35);
    scene.tweens.add({ targets: dmgTxt, y: objetivoSprite.y - 80, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => dmgTxt.destroy() });

    if (crit) {
      const critTxt = scene.add.text(objetivoSprite.x, objetivoSprite.y - 60, "💥 CRÍTICO!", {
        fontFamily: "'Cinzel Decorative', serif",fontSize: "22px", fill: "#ff99ff", stroke: "#000", strokeThickness: 3
      }).setOrigin(0.5).setDepth(40);
      scene.tweens.add({ targets: critTxt, y: objetivoSprite.y - 100, alpha: 0, duration: 900, ease: "Cubic.easeOut", onComplete: () => critTxt.destroy() });
    }

    if (def.vida <= 0) {
      scene.addLog(`☠️ ${def.name} es consumido por las sombras`);
      scene.time.delayedCall(250, () => {
        objetivoSprite.destroy();
        const cObj = scene.getCell(objetivoSprite.getData("col"), objetivoSprite.getData("row"));
        if (cObj) cObj.ocupante = null;
      });
    } else {
      def.debuffMisterio = true;
      scene.addLog(`🌑 ${def.name} queda embrujado: fallará su próximo ataque`);
    }

    // Gastos
    atk.puntosAccion = Math.max(0, (atk.puntosAccion || 0) - 20);
    atk.numAlientos  = Math.max(0, (atk.numAlientos  || 0) - 1);
    scene.actualizarBarras?.(atacanteSprite);
    scene.actualizarBolitas?.(atacanteSprite);

    // Marca usada y fin
    const eco = window.tacticsSkills?.obtenerSkillsPorTipo?.((atk.tipo||"").toLowerCase())?.find(s => s.nombre === "Eco de Sombras");
    if (eco) window.tacticsSkills?.marcarSkillUsada?.(atk, eco);
scene.time.delayedCall(800, () => {
  const drag = atacanteSprite.getData("dragon");
  if (drag && drag.puntosAccion >= 10 && drag.vida > 0) {
    IAtactic.playTurn(scene, atacanteSprite);
  } else {
    scene.finalizarTurno();
  }
});  },

  /* ──────────────────────────────────────────────────────────────
   * Utilidades de evaluación de área
   * ────────────────────────────────────────────────────────────── */
  _mejorCeldaParaNube(scene, enemigosVivos) {
    let mejor = null;
    let maxGolpeados = -1;
    (scene.casillas || []).forEach(cell => {
      if (!cell) return;
      const area = [cell, ...scene.adyacentes(cell.col, cell.row)].filter(Boolean);
      const golpeados = area.reduce((acc, c) => {
        const d = c.ocupante?.getData("dragon");
        return acc + (d && enemigosVivos.some(s => s === c.ocupante) ? 1 : 0);
      }, 0);
      if (golpeados > maxGolpeados) {
        maxGolpeados = golpeados;
        mejor = { celda: cell, golpeados };
      }
    });
    return mejor;
  },

  /* ──────────────────────────────────────────────────────────────
   * Objetivo, movimiento y distancia
   * ────────────────────────────────────────────────────────────── */
  elegirObjetivo(scene, origenSprite, lista) {
    const origen = origenSprite.getData("dragon");
    const clase = (origen.clase || "").toLowerCase();
    let mejor = null;
    let mejorScore = Infinity;

    lista.forEach(s => {
      const d = s.getData("dragon");
      const dist = IAtactic.distHex(
        origenSprite.getData("col"),
        origenSprite.getData("row"),
        s.getData("col"),
        s.getData("row")
      );

      let score = dist;
      const claseObj = (d.clase || "").toLowerCase();

      switch (clase) {
        case "rogue":
        case "luchador":
          if (claseObj === "breather") score -= 1;
          break;
        case "breather":
          if (claseObj === "tanque") score -= 1;
          break;
        case "tanque":
          score += dist * 0.3;
          break;
        case "equilibrado":
          score += (d.vida / (d.vidaMax || d.vida || 1)) * 0.3;
          break;
      }

      score *= Phaser.Math.FloatBetween(0.9, 1.1);
      if (score < mejorScore) {
        mejorScore = score;
        mejor = s;
      }
    });

    return mejor;
  },

  moverHacia(scene, origenSprite, objetivoSprite) {
    const origen = origenSprite.getData("dragon");
    if (origen.puntosAccion < 10) return;

    const c0 = origenSprite.getData("col");
    const r0 = origenSprite.getData("row");
    const cT = objetivoSprite.getData("col");
    const rT = objetivoSprite.getData("row");

    const adyacentes = scene.adyacentes(c0, r0).filter(h => !h.ocupante);

    if (!adyacentes.length) {
      scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
    }

    const distActual = IAtactic.distHex(c0, r0, cT, rT);
    const prev = origenSprite.getData("prevCell");

    const cand = adyacentes.map(celda => ({
      celda,
      d: IAtactic.distHex(celda.col, celda.row, cT, rT)
    })).filter(o => o.d <= distActual + 1);

    if (!cand.length) {
      scene.time.delayedCall(400, () => scene.finalizarTurno());
      return;
    }

    const minD = Math.min(...cand.map(o => o.d));
    let ties = cand.filter(o => o.d <= minD + 1);

    if (prev) {
      const sinVolver = ties.filter(o => !(o.celda.col === prev.col && o.celda.row === prev.row));
      if (sinVolver.length) ties = sinVolver;
    }

    ties.sort((a, b) => (a.celda.col - b.celda.col) || (a.celda.row - b.celda.row));
    const destino = ties[0].celda;

    // Actualizar “previa” y mapa
    origenSprite.setData("prevCell", { col: c0, row: r0 });
    const old = scene.getCell(c0, r0); if (old) old.ocupante = null;
    destino.ocupante = origenSprite;
    origenSprite.setData("col", destino.col);
    origenSprite.setData("row", destino.row);

    // Coste y animación
    origen.puntosAccion = Math.max(0, origen.puntosAccion - 10);
    scene.actualizarBarras?.(origenSprite);

    scene.tweens.add({
      targets: origenSprite,
      x: destino.x,
      y: destino.y,
      duration: 300,
      ease: "Sine.easeInOut",
      onComplete: () => {
        scene.addLog(`${origen.name} se mueve hacia ${objetivoSprite.getData("dragon").name} (${origen.puntosAccion} PA)`);
      }
    });
  },

  distHex(c1, r1, c2, r2) {
    const q1 = c1, rA1 = r1 - (c1 >> 1);
    const q2 = c2, rA2 = r2 - (c2 >> 1);
    const dq = q2 - q1, dr = rA2 - rA1, ds = -(dq + dr);
    return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
  }
};

window.IAtactic = IAtactic;
