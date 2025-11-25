/***** =========================
 * SKILLS – Acciones especiales por tipo de dragón
 * ========================== */

// 💧 Agua → Ola regeneradora
function skillAgua(scene, atacante, defensor, spriteAtacante, spriteDefensor){
  if(atacante.numAlientos <= 0){
    scene.addLog(atacante.name+" no tiene alientos suficientes");
    scene.time.delayedCall(600, ()=>scene.pasarTurno());
    return;
  }
  atacante.numAlientos--;
  scene.drawBolitas();
  if (atacante === dragon1 && atacante.numAlientos <= 0 && scene.btnAliento) {
    scene.btnAliento.disableInteractive();
    scene.btnAliento.setStyle({ backgroundColor:"#222", fill:"#888" });
  }

  // 50% daño de aliento (IGNORA ARMADURA)
let dmg = (atacante.aliento * 0.5) * 1.33 + rnd(-2,2);
dmg = Math.round(dmg);

  if(defensor === dragon1){ 
    scene.vida1 = Math.max(0, scene.vida1 - dmg); 
  } else if(defensor === dragon2){ 
    scene.vida2 = Math.max(0, scene.vida2 - dmg); 
  }

  scene.updateVida();
  scene.showDamage(dmg, spriteDefensor);

  // 🌊 Cura progresiva aleatoria (5%–20% vida máx por 2 turnos)
atacante.regenAgua = 1; // turnos de curación
atacante.regenAguaPct = (rnd(5,20) / 100); // porcentaje aleatorio entre 0.05 y 0.20

  // 🔔 actualizar iconos
  scene.updateEstadoIcons();

  scene.showMessage("💧 Ola regeneradora ("+dmg+")", 350, 1500, "#00bfff", "32px");
  scene.addLog(atacante.name+" golpea y activa regeneración (15% x2 turnos)");

  scene.time.delayedCall(600, ()=>scene.pasarTurno());
}

// ⚡ Trueno → Descarga aturdidora
function skillTrueno(scene, atacante, defensor, spriteAtacante, spriteDefensor){
  if(atacante.numAlientos <= 0){
    scene.addLog(atacante.name+" no tiene alientos suficientes");
    scene.time.delayedCall(600, ()=>scene.pasarTurno());
    return;
  }
  atacante.numAlientos--;
  scene.drawBolitas();
  if (atacante === dragon1 && atacante.numAlientos <= 0 && scene.btnAliento) {
    scene.btnAliento.disableInteractive();
    scene.btnAliento.setStyle({ backgroundColor:"#222", fill:"#888" });
  }

  // Daño base (IGNORA ARMADURA)
let dmg = (atacante.aliento * 0.85) * 1.33 + rnd(-3,3);
dmg = Math.round(dmg);

  if(defensor === dragon1){ 
    scene.vida1 = Math.max(0, scene.vida1 - dmg); 
  } else if(defensor === dragon2){ 
    scene.vida2 = Math.max(0, scene.vida2 - dmg); 
  }

  scene.updateVida();
  scene.showDamage(dmg, spriteDefensor);

  // 50% probabilidad de aplicar aturdimiento
  if(Math.random() < 0.5){
    defensor.aturdido = 1; // 1 turnos
    scene.showMessage("⚡ ATURDIDO!", 350, 1500, "#ffff00", "36px");
    scene.addLog(atacante.name+" aturde a "+defensor.name+"!");
  } else {
    scene.showMessage("⚡ Descarga ("+dmg+")", 350, 1500, "#ffff00", "32px");
    scene.addLog(atacante.name+" usa Descarga ("+dmg+")");
  }

  // 🔔 actualizar iconos
  scene.updateEstadoIcons();

  scene.time.delayedCall(600, ()=>scene.pasarTurno());
}


// 🔥 Fuego → Llamarada persistente
function skillFuego(scene, atacante, defensor, spriteAtacante, spriteDefensor){
  if(atacante.numAlientos <= 0){
    scene.addLog(atacante.name+" no tiene alientos suficientes");
    scene.time.delayedCall(600, ()=>scene.pasarTurno());
    return;
  }
  atacante.numAlientos--;
  scene.drawBolitas();
  if (atacante === dragon1 && atacante.numAlientos <= 0 && scene.btnAliento) {
    scene.btnAliento.disableInteractive();
    scene.btnAliento.setStyle({ backgroundColor:"#222", fill:"#888" });
  }

  // Daño base (IGNORA ARMADURA)
let dmg = atacante.aliento * 1.2 + rnd(-2,2);
dmg = Math.round(dmg);

  if(defensor === dragon1){ 
    scene.vida1 = Math.max(0, scene.vida1 - dmg); 
  } else if(defensor === dragon2){ 
    scene.vida2 = Math.max(0, scene.vida2 - dmg); 
  }

  scene.updateVida();
  scene.showDamage(dmg, spriteDefensor);

  // Quemadura (DoT) → 20% del daño hecho por 4 turnos
  defensor.dotFuego = 4; 
defensor.dotFuegoDmg = Math.round((dmg * 0.2) * 1.33);

  // 🔔 actualizar iconos
  scene.updateEstadoIcons();

  scene.showMessage("🔥 ¡Quemadura!", 350, 1500, "#ff6600", "32px");
  scene.addLog(defensor.name+" sufre quemadura ("+defensor.dotFuegoDmg+" por turno)");

  scene.time.delayedCall(600, ()=>scene.pasarTurno());
}

// ⛰️ Roca → Golpe pétreo + Muro
function skillRoca(scene, atacante, defensor, spriteAtacante, spriteDefensor){
  if(atacante.numAlientos <= 0){
    scene.addLog(atacante.name+" no tiene alientos suficientes");
    scene.time.delayedCall(600, ()=>scene.pasarTurno());
    return;
  }
  atacante.numAlientos--;
  scene.drawBolitas();
  if (atacante === dragon1 && atacante.numAlientos <= 0 && scene.btnAliento) {
    scene.btnAliento.disableInteractive();
    scene.btnAliento.setStyle({ backgroundColor:"#222", fill:"#888" });
  }

  // Daño base (IGNORA ARMADURA)
let dmg = (atacante.aliento * 1.2) * 1.33 + rnd(0,2);
dmg = Math.round(dmg);

  if(defensor === dragon1){ 
    scene.vida1 = Math.max(0, scene.vida1 - dmg); 
  } else if(defensor === dragon2){ 
    scene.vida2 = Math.max(0, scene.vida2 - dmg); 
  }

  scene.updateVida();
  scene.showDamage(dmg, spriteDefensor);

  // Efecto muro (bloqueo parcial de ataques entrantes)
  atacante.bloqueoTurnos = 2;       // dura 2 turnos
  atacante.bloqueoProb = 0.66;       // 50% de probabilidad de bloquear
  atacante.bloqueoProbActivo = false;

  // 🔔 actualizar iconos
  scene.updateEstadoIcons();

  scene.showMessage("⛰️ Golpe pétreo + Muro ("+dmg+")", 350, 1500, "#aaaaaa", "32px");
  scene.addLog(atacante.name+" golpea y levanta un muro pétreo (+bloqueo)");

  scene.time.delayedCall(600, ()=>scene.pasarTurno());
}



// 🕸️ Misterio → Trampa ilusoria
function skillMisterio(scene, atacante, defensor, spriteAtacante, spriteDefensor){
  if(atacante.numAlientos <= 0){
    scene.addLog(atacante.name+" no tiene alientos suficientes");
    scene.time.delayedCall(600, ()=>scene.pasarTurno());
    return;
  }
  atacante.numAlientos--;
  scene.drawBolitas();
  if (atacante === dragon1 && atacante.numAlientos <= 0 && scene.btnAliento) {
    scene.btnAliento.disableInteractive();
    scene.btnAliento.setStyle({ backgroundColor:"#222", fill:"#888" });
  }

  // Daño base (IGNORA ARMADURA)
let dmg = (atacante.aliento * 1.2) * 1.33 + rnd(0,2);
dmg = Math.round(dmg);

  if(defensor === dragon1){ 
    scene.vida1 = Math.max(0, scene.vida1 - dmg); 
  } else if(defensor === dragon2){ 
    scene.vida2 = Math.max(0, scene.vida2 - dmg); 
  }

  scene.updateVida();
  scene.showDamage(dmg, spriteDefensor);

  // Aplicar efecto de ilusión
  defensor.debuffFalloTurnos = 2;       // dura 2 turnos
  defensor.debuffFalloProb = 0.75;      // 75% de fallar
  defensor.debuffFalloProbActivo = true; // ✅ empieza activo en el primer turno

  // 🔔 actualizar iconos
  scene.updateEstadoIcons();

  scene.showMessage("🕸️ Trampa ilusoria ("+dmg+")", 350, 1500, "#9932cc", "32px");
  scene.addLog(atacante.name+" coloca una trampa ilusoria: precisión reducida");

  scene.time.delayedCall(600, ()=>scene.pasarTurno());
}

// 🎯 Striker → Ataque preciso
function skillStriker(scene, atacante, defensor, spriteAtacante, spriteDefensor){
  if(atacante.numAlientos <= 0){
    scene.addLog(atacante.name+" no tiene alientos suficientes");
    scene.time.delayedCall(600, ()=>scene.pasarTurno());
    return;
  }
  atacante.numAlientos--;
  scene.drawBolitas();
  if (atacante === dragon1 && atacante.numAlientos <= 0 && scene.btnAliento) {
    scene.btnAliento.disableInteractive();
    scene.btnAliento.setStyle({ backgroundColor:"#222", fill:"#888" });
  }

  // 👉 Determinar stat base (mordisco o aliento)
  let baseStat = atacante.mordisco >= atacante.aliento ? atacante.mordisco : atacante.aliento;

  // ⚔️ Calcular daño base (IGNORA ARMADURA)
let dmg = baseStat * 1.2 + rnd(-3,3);
dmg = Math.round(dmg);

  // 🎯 Crítico (33%)
  if(Math.random() < 0.33 && dmg > 0){
dmg = Math.round(dmg * 1.8);
    scene.showMessage("💥 CRÍTICO!", 300, 1200, "#ff0000", "38px");
    scene.addLog("¡Golpe crítico de "+atacante.name+"!");
  }

  // Aplicar daño
  if(defensor === dragon1){ 
    scene.vida1 = Math.max(0, scene.vida1 - dmg); 
  } else if(defensor === dragon2){ 
    scene.vida2 = Math.max(0, scene.vida2 - dmg); 
  }

  scene.updateVida();
  scene.showDamage(dmg, spriteDefensor);

  // Mensaje general
  scene.showMessage("🎯 Ataque preciso ("+dmg+")", 350, 1500, "#ff0000", "32px");
  scene.addLog(atacante.name+" usa Ataque preciso ("+dmg+")");

  scene.time.delayedCall(600, ()=>scene.pasarTurno());
}

