/***** =========================
 * SISTEMA DE RAREZAS DE DRAGONES (solo boost porcentual)
 * ========================== */

const rarezas = {
  "Común": {
    color: "#aaaaaa",      // gris
    probabilidad: 0.50,    // 50%
    boost: 0               // sin boost
  },
  "Raro": {
    color: "#1e90ff",      // azul
    probabilidad: 0.35,    // 35%
    boost: 0.10            // +10%
  },
  "Épico": {
    color: "#800080",      // morado
    probabilidad: 0.1,    // 10%
    boost: 0.25            // +25%
  },
  "Legendario": {
    color: "#ffd700",      // dorado
    probabilidad: 0.02,    // 5%
    boost: 0.40            // +40%
  }
};

// 🎲 Elegir rareza por probabilidad acumulada
function generarRareza(){
  let r = Math.random();
  let acumulado = 0;

  for(let key in rarezas){
    acumulado += rarezas[key].probabilidad;
    if(r <= acumulado){
      return key;
    }
  }
  return "Común"; // fallback
}

// 🟢 Asignar rareza a un dragón y aplicar boost porcentual
function asignarRareza(dragon, esInicial=false){
  if(esInicial){
    dragon.rareza = "Raro";
  } else {
    dragon.rareza = generarRareza();
  }

  // aplicar boost (excepto numAlientos)
  let boost = rarezas[dragon.rareza].boost || 0;
  if(boost > 0){
    dragon.vidaMax   = Math.ceil(dragon.vidaMax   * (1 + boost));
    dragon.vida      = dragon.vidaMax; // arranca con vida llena
    dragon.mordisco  = Math.ceil(dragon.mordisco  * (1 + boost));
    dragon.aliento   = Math.ceil(dragon.aliento   * (1 + boost));
    dragon.armadura  = Math.ceil(dragon.armadura  * (1 + boost));
    dragon.velocidad = Math.ceil(dragon.velocidad * (1 + boost));
  } else {
    // si es común, simplemente asegurar vida coherente
    dragon.vida = Math.min(dragon.vida, dragon.vidaMax);
  }
}
