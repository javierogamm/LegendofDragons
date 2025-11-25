// Inicializar inventario del jugador
if (!window.inventarioJugador) {
  window.inventarioJugador = [
    { nombre: "Materiales de curación", cantidad: 5, key:"Curacion" },
    { nombre: "Poción Roja", cantidad: 2, key:"pocionroja" },
    { nombre: "Poción Azul", cantidad: 2, key:"pocionazul" },
    { nombre: "Monedas", cantidad: 450, key:"Monedas" },
    { nombre: "Runa rara", cantidad: 1, key:"runarara" },
    { nombre: "Runa épica", cantidad: 1, key:"runaepica" },
    { nombre: "Cebo para dragones", cantidad: 3, key:"cebo" },
    { nombre: "Pergamino a Luminaria", cantidad: 1, key:"teleportluminaria" },
    { nombre: "Cebo para dragones legendarios", cantidad: 1, key:"cebolegend" },
    { nombre: "Cebo para dragones épicos", cantidad: 1, key:"ceboepico" },
    { nombre: "Repelente de dragones", cantidad: 1, key:"repelente" },
    // 🧿 Nueva runa de atracción (épica)
    { nombre: "Runa de Atracción Épica", cantidad: 1, key:"runaatraccionepica" },
      { nombre: "Huevo de dragón de trueno", cantidad: 1, key:"huevotrueno" },
     //  { nombre: "Huevo de dragón de fuego", cantidad: 1, key:"huevofuego" },
     // { nombre: "Huevo de dragón striker", cantidad: 1, key:"huevostriker" },
    //  { nombre: "Huevo de dragón misterio", cantidad: 1, key:"huevomisterio" },

    { nombre: "Tomo de técnicas de entrenamiento de dragones", cantidad: 10, key:"Tomo" },

// PECES
    { nombre: "Pez púrpura", cantidad: 1, key:"pezmisterio" },
    { nombre: "Pez irisado", cantidad: 1, key:"pezstriker" },
    { nombre: "Pez dorado", cantidad: 1, key:"peztrueno" },
    { nombre: "Pez pétreo", cantidad: 1, key:"pezroca" },
    { nombre: "Pez gélido", cantidad: 1, key:"pezagua" },
    { nombre: "Pez ardiente", cantidad: 1, key:"pezfuego" }




  ];
}

// Inicializar arrays globales por si no existen
if (!window.dragonesJugador) window.dragonesJugador = [];
if (!window.dragonesDerrotados) window.dragonesDerrotados = [];

// Contador de combates
if (!window.contadorCombates) window.contadorCombates = 0;
