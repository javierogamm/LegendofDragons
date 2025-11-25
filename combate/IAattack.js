function IAattack(scene, dragonEnemigo, dragonJugador){
  let choice;

  // ⚖️ Probabilidades base por clase
  let pesos = { mordisco: 0.3, aliento: 0.3, especial: 0.2, defensa: 0.2 };

  switch(true){
    case /Tanque/.test(dragonEnemigo.clase):
      pesos = { mordisco: 0.2, aliento: 0.2, especial: 0.1, defensa: 0.5 };
      break;
    case /Luchador/.test(dragonEnemigo.clase):
      pesos = { mordisco: 0.4, aliento: 0.2, especial: 0.3, defensa: 0.1 };
      break;
    case /Rogue/.test(dragonEnemigo.clase):
      pesos = { mordisco: 0.25, aliento: 0.25, especial: 0.35, defensa: 0.15 };
      break;
    case /Breather/.test(dragonEnemigo.clase):
      pesos = { mordisco: 0.2, aliento: 0.45, especial: 0.25, defensa: 0.1 };
      break;
    case /Equilibrado/.test(dragonEnemigo.clase):
      pesos = { mordisco: 0.3, aliento: 0.3, especial: 0.25, defensa: 0.15 };
      break;
  }

  // ⚠️ Ajuste dinámico según situación
  let vidaPct = dragonEnemigo.vida / dragonEnemigo.vidaMax;
  let amenaza = dragonJugador.mordisco > dragonEnemigo.armadura + 4;

  if(vidaPct < 0.4 || amenaza){
    pesos.defensa += 0.15;
    pesos.mordisco -= 0.05;
    pesos.aliento  -= 0.05;
    pesos.especial -= 0.05;
  }

  // 🚫 Si no tiene alientos → quitar peso aliento
  if(dragonEnemigo.numAlientos <= 0){
    pesos.mordisco += pesos.aliento;
    pesos.aliento = 0;
  }

  // 🚫 Si ya usó especial o está en cooldown → quitar peso especial
  if(dragonEnemigo.especialUsado || (scene.cooldownEspecial2 && scene.cooldownEspecial2 > 0)){
    pesos.mordisco += pesos.especial;
    pesos.especial = 0;
  }

  // 🚫 Si no tiene escudos → eliminar opción de defensa
  if (!dragonEnemigo.bloqueosMax || dragonEnemigo.bloqueosUsados >= dragonEnemigo.bloqueosMax) {
    pesos.mordisco += pesos.defensa;
    pesos.defensa = 0;
  }

  // 🔧 Clamp para evitar negativos
  for(let k in pesos){ if(pesos[k] < 0) pesos[k] = 0; }

  // 🔧 Normalizar a 1
  let total = Object.values(pesos).reduce((a,b)=>a+b,0);
  if(total > 0){
    for(let k in pesos){ pesos[k] /= total; }
  } else {
    pesos = { mordisco:1, aliento:0, especial:0, defensa:0 };
  }

  // 🎲 Elección ponderada
  let r = Math.random();
  let acumulado = 0;
  for(let accion in pesos){
    acumulado += pesos[accion];
    if(r <= acumulado){
      choice = accion;
      break;
    }
  }
  if(!choice) choice = "mordisco"; // fallback extra

  // ▶️ Ejecutar acción
  if(choice === "defensa"){
    // ya no hay defensa activa, la ignoramos
    scene.time.delayedCall(400, ()=>scene.atacar("mordisco"));
  } 
  else if(choice === "especial"){
    scene.usarEspecial();
  } 
  else {
    scene.atacar(choice); // mordisco o aliento
  }
}

