/***** =========================
 * SISTEMA DE EVENTOS (efectos + texturas + eventos extendidos con popup selección scrollable + iconos en los popups)
 * ========================== */

const eventos = {
  /* -------------------- Helpers de carga -------------------- */
  _ensureInventarioTextures(scene){
    const need = [];
    if(!scene.textures.exists("curacion_inventario")){
      scene.load.image("curacion_inventario","assets/inventario/curaMED.png");
      need.push("curacion_inventario");
    }
    if(!scene.textures.exists("tomo_inventario")){
      scene.load.image("tomo_inventario","assets/inventario/TomoMED.png");
      need.push("tomo_inventario");
    }
    if(!scene.textures.exists("pocionroja")){
      scene.load.image("pocionroja","assets/potis/pocionrojaMED.png");
      need.push("pocionroja");
    }
    if(!scene.textures.exists("pocionazul")){
      scene.load.image("pocionazul","assets/potis/pocionazulMED.png");
      need.push("pocionazul");
    }
    if(!scene.textures.exists("Monedas")){
      scene.load.image("Monedas","assets/inventario/monedasMED.png");
      need.push("Monedas");
    }
    if(!scene.textures.exists("cebo_inventario")){
      scene.load.image("cebo_inventario","assets/inventario/cebodragonesMED.png");
      need.push("cebo_inventario");
    }
    if(!scene.textures.exists("ceboepico_inventario")){
  scene.load.image("ceboepico_inventario","assets/inventario/ceboepicoMED.png");
  need.push("ceboepico_inventario");
}

    if(need.length){
      scene.load.once(Phaser.Loader.Events.COMPLETE, ()=>{
        console.log("✅ Texturas inventario cargadas:", need);
      });
      scene.load.start();
    }
  },

  /* -------------------- Reglas de pesos -------------------- */
  /* -------------------- Reglas de pesos simplificadas -------------------- */
/* -------------------- Reglas de pesos simplificadas (ajustadas) -------------------- */
_pesosPorTipo(tipo){
  const baseTodos = { 
    curacion:0, tomo:0, pocion:0, tesoro:0, entrenamiento:0, 
    runa:0, mercader:0, santuario:0, nido:0, tumba:0, 
    reliquia:0,ceboepico:0, reliquiaepica:0, prueba:0, loot:0, cebo:0 , huevoenterrado:0, bolsarepelente:0, runaatraccion:0
  };

  const map = {
  menhir:        { ...baseTodos, santuario:4, runa:3, reliquia:3, tesoro:5, tumba:2 },
  bosque:        { ...baseTodos, nido:7,ceboepico:5, cebo:12, curacion:6, tesoro:5, bolsarepelente:2 },
  torre:         { ...baseTodos, tomo:10, runa:3, entrenamiento:2, tesoro:5,runaatraccion:1, bolsarepelente:2 },
  torremago:     { ...baseTodos, runa:4, reliquia:3, reliquiaepica:1,runaatraccion:1, tesoro:5 },
  hut:           { ...baseTodos, pocion:5,ceboepico:5, mercader:9, curacion:6, tesoro:5, bolsarepelente:2 },
  cueva:         { ...baseTodos, tesoro:10, tumba:6, reliquia:3, huevoenterrado:2 },
  ruina:         { ...baseTodos, reliquia:4,ceboepico:1,runaatraccion:1, reliquiaepica:1, tesoro:7, huevoenterrado:2, tumba:2 },
  ruinanieve:    { ...baseTodos, curacion:7,ceboepico:1, runa:3, reliquia:3, huevoenterrado:2, tesoro:5 },
  abadia:        { ...baseTodos, santuario:3,ceboepico:5,runaatraccion:1, entrenamiento:2, tomo:7, bolsarepelente:2, tesoro:4 },
  abadianieve:   { ...baseTodos, santuario:3,ceboepico:5,runaatraccion:1, reliquia:3, runa:3, bolsarepelente:2, tesoro:4 },
  alquimista:    { ...baseTodos, pocion:6,ceboepico:5, runa:3, reliquia:3, cebo:10, bolsarepelente:2, tesoro:4 },
  alquimistanieve:{ ...baseTodos, pocion:6,ceboepico:5, reliquia:3, curacion:5, cebo:10, bolsarepelente:2, tesoro:4 },
  arbolantiguo:  { ...baseTodos, nido:7, cebo:12, santuario:3, tesoro:5, tumba:2 },
  carromato:     { ...baseTodos, mercader:9, pocion:3, tomo:5, cebo:10, curacion:5, bolsarepelente:2, tesoro:4 },
  cementerio:    { ...baseTodos, tumba:8,runaatraccion:1, reliquia:3, reliquiaepica:1, tesoro:5 },
  piramide:      { ...baseTodos, tesoro:10,ceboepico:2,runaatraccion:1, reliquia:3, reliquiaepica:1, tumba:3 },
  volante2:      { ...baseTodos, runa:3, santuario:3, reliquia:3, tesoro:5 },
  forest:        { ...baseTodos, nido:6, cebo:10, reliquia:3, tesoro:5 },
  desert4:       { ...baseTodos, tesoro:8, reliquia:3, santuario:3, tumba:3 },

// === MONOLITOS
    monolitorojo:       {monolitorojo:10 , unico: true},
    monolitoverde: { monolitoverde: 10, unico: true },
    monolitoazul: { monolitoazul: 10, unico: true },
    monolitodorado: { monolitodorado: 10, unico: true },
// === NUEVO EVENTO: Banco de Peces ===
    bancopeces: { bancopeces: 10, unico: false },


    // === ISLAS ESPECIALES (sin cambios) ===
    frozencrown:   { ...baseTodos, santuario:5, tumba:8, runa:5, entrenamiento:1, reliquia:2 },
    jadeisland:    { ...baseTodos, bosque:12, arbolantiguo:10, nido:8, santuario:5, runa:4, reliquia:2 },
    stormcloud:    { ...baseTodos, torremago:10, torre:10, runa:6, entrenamiento:4, reliquia:2 },
    hellfire:      { ...baseTodos, torremago:8, piramide:8, cueva:10, reliquia:3, santuario:2 },
    scorchia:      { ...baseTodos, torremago:8, piramide:8, cueva:10, reliquia:3, santuario:2 }
  
  
  };

// al final de _pesosPorTipo(tipo), antes del return:
for (const key of ["runa", "reliquia", "entrenamiento"]) {
  if (map[tipo]?.[key]) map[tipo][key] = Math.max(1, Math.floor(map[tipo][key] * 0.6));
}
return map[tipo] || baseTodos;
},



  _pickClase(tipo){
  // 🔒 Casos especiales: monolitos deben devolver su propia clase
  const tipoLower = (tipo || "").toLowerCase();
  if (["monolitorojo", "monolitoverde", "monolitoazul", "monolitodorado"].includes(tipoLower)) {
    return tipoLower; // No se sortean otros eventos
  }

  // ⚖️ Para el resto, usar pesos
  const pesos = this._pesosPorTipo(tipoLower);
  const entries = Object.entries(pesos).filter(([_, w]) => w > 0);
  const total = entries.reduce((a, [_, w]) => a + w, 0);

  if (total <= 0) return "loot";

  let r = Math.random() * total;
  for (const [clase, w] of entries) {
    if (r < w) return clase;
    r -= w;
  }
  return "loot";
},


  /* -------------------- Popup de elección scrollable -------------------- */
  _elegirDragon(scene, callback) {
  const { width: W, height: H } = scene.sys.game.config;

  // Fondo del popup
  const overlay = scene.add.rectangle(W / 2, H / 2, W * 0.85, H * 0.8, 0x000000, 0.85)
    .setDepth(800).setInteractive();

  const titulo = scene.add.text(W / 2, H * 0.15, "🐉 Elige un dragón objetivo", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "28px", fill: "#ffd700", fontStyle: "bold"
  }).setOrigin(0.5).setDepth(801);

  // 🔹 Separar activos e inactivos
  const dragones = window.dragonesJugador || [];
  const activos = dragones.filter(d => d.activo);
  const inactivos = dragones.filter(d => !d.activo);

  const prioridadRareza = { "Común":1, "Raro":2, "Épico":3, "Legendario":4 };
  const prioridadTier = { "B":1, "A":2, "S":3 };

  function ordenarLista(lista) {
    lista.sort((a,b)=>{
      if(b.nivel !== a.nivel) return b.nivel - a.nivel;
      const rA = prioridadRareza[a.rareza] || 0;
      const rB = prioridadRareza[b.rareza] || 0;
      if(rB !== rA) return rB - rA;
      const tA = prioridadTier[a.tier] || 0;
      const tB = prioridadTier[b.tier] || 0;
      return tB - tA;
    });
  }
  ordenarLista(activos);
  ordenarLista(inactivos);

  // 🔹 Coordenadas base (idénticas a la Colección)
  const baseY = H * 0.25;
  const colLeftX = W * 0.3;
  const colRightX = W * 0.7;
  const separacionY = 90;

  // Títulos
  scene.add.text(colLeftX, baseY - 50, "🐲 Activos", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px", fill: "#0f0", fontStyle: "bold"
  }).setOrigin(0.5).setDepth(801);
  scene.add.text(colRightX, baseY - 50, "💤 Inactivos", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "20px", fill: "#ccc", fontStyle: "bold"
  }).setOrigin(0.5).setDepth(801);

  // 🔹 Renderizado común
  const renderColumna = (lista, xBase) => {
    let y = baseY;
    lista.forEach(d => {
      const miniKey = d.name + "_mini";

      let colorRareza = "#aaa";
      if(d.rareza==="Raro") colorRareza="#00bfff";
      if(d.rareza==="Épico") colorRareza="#bf00ff";
      if(d.rareza==="Legendario") colorRareza="#ffd700";

      const marco = scene.add.rectangle(xBase - 40, y, 70, 70, 0x000000, 0.4)
        .setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(colorRareza).color)
        .setDepth(802);

      const mini = scene.add.image(xBase - 40, y, miniKey)
        .setScale(0.5)
        .setInteractive()
        .setDepth(803);

      const nameTxt = scene.add.text(xBase + 5, y - 10, `${d.apodo || d.name} [${d.rareza}]`, {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "16px", fill: colorRareza
      }).setOrigin(0, 0.5).setDepth(803);

      const lvlTxt = scene.add.text(xBase + 5, y + 12, `⭐ Nivel ${d.nivel}  ❤️ ${d.vida}/${d.vidaMax}`, {
        fontFamily: "'Cinzel Decorative', serif",
fontSize: "14px", fill: "#fff"
      }).setOrigin(0, 0.5).setDepth(803);

      // 👉 Al hacer clic: aplicar callback
      mini.on("pointerdown", () => {
        overlay.destroy();
        titulo.destroy();
        scene.children.list.filter(o => o.depth >= 802).forEach(o => o.destroy());
        callback(d);
      });

      y += separacionY;
    });
  };

  renderColumna(activos, colLeftX);
  renderColumna(inactivos, colRightX);

  // 🔙 Botón cancelar
  const btnCancelar = scene.add.text(W / 2, H * 0.88, "❌ Cancelar", {
    fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px", fill: "#fff", backgroundColor: "#333",
    padding: { left: 15, right: 15, top: 8, bottom: 8 }
  }).setOrigin(0.5).setInteractive().setDepth(804);

  btnCancelar.on("pointerdown", () => {
    overlay.destroy();
    titulo.destroy();
    scene.children.list.filter(o => o.depth >= 802).forEach(o => o.destroy());
  });
},

  /* -------------------- Disparo del evento -------------------- */
  disparar(scene, evento){
    scene.bloqueado = true;
    if(!evento.clase){ evento.clase = this._pickClase(evento.tipo); }
// 🔥 MULTIPLICADOR DE RECOMPENSAS — Doble loot en Scorchia
const islaActual = (window.islaSeleccionada?.tipo || "").toLowerCase();
const MULT = islaActual === "scorchia" ? 2 : 1;
if (MULT > 1) console.log("🔥 Multiplicador de recompensas activo x2 (Scorchia)");
    // === Popup centrado dinámicamente según tamaño del canvas ===
const { width: W, height: H } = scene.sys.game.config;

// Fondo centrado
const overlay = scene.add.rectangle(W / 2, H / 2, W * 0.9, H * 0.8, 0x222222, 0.95)
  .setDepth(510)
  .setInteractive();

// Título centrado
const titulo = scene.add.text(W / 2, H / 2 - 150, `✨ Evento: ${evento.tipo.toUpperCase()} · ${evento.clase.toUpperCase()}`, {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "32px",
  fill: "#ffd700",
  fontStyle: "bold",
  fontFamily: "MedievalSharp"
}).setOrigin(0.5).setDepth(511);

    this._ensureInventarioTextures(scene);

    let resultado = "";
    let iconoEvento;
    let necesitaEleccion = false;
    let callbackEleccion = null;

    if(!window.inventarioJugador){ window.inventarioJugador = []; }
    const pushItem = (nombre, cantidad, key)=>{
      let item = window.inventarioJugador.find(i=>i.nombre===nombre);
      if(item){ item.cantidad += cantidad; }
      else { window.inventarioJugador.push({nombre, cantidad}); }

     if(key && !key.startsWith("pez")){
  iconoEvento = scene.add.image(500,260,key).setDepth(511).setScale(0.8);
}
    };

        switch(evento.clase){
      case "curacion": {
        pushItem("Materiales de curación", 3* MULT, "curacion_inventario");
        resultado = "Has obtenido Materiales de curación x3";
        break;
      }
      case "tomo": {
        let cantidad = Phaser.Math.Between(2,4)* MULT;
        pushItem("Tomo de técnicas de entrenamiento de dragones", cantidad, "tomo_inventario");
        resultado = `Has obtenido Tomos x${cantidad}`;
        break;
      }
      case "tesoro": {
        let cantidad = Phaser.Math.Between(3,9)*50* MULT;
        pushItem("Monedas", cantidad, "Monedas");
        resultado = `💰 ¡Tesoro! +${cantidad} Monedas.`;
        break;
      }
      case "pocion": {
        let tipo = Math.random() < 0.5 ? "Poción Roja" : "Poción Azul";
        let key  = (tipo === "Poción Roja") ? "pocionroja" : "pocionazul";
        let cantidad = Phaser.Math.Between(1,2)* MULT;
        pushItem(tipo, cantidad, key);
        resultado = `Has obtenido ${tipo} x${cantidad}`;
        break;
      }
      case "cebo": {
        pushItem("Cebo para dragones", 3* MULT, "cebo_inventario");
        resultado = "Encuentras un Cebo para dragones x3.";
        break;
      }
      case "entrenamiento": {
        resultado = "Tu dragón puede entrenar contra una roca ancestral (+Mordisco o +Armadura).";
        necesitaEleccion = true;
        callbackEleccion = (d)=>{
          if(Math.random()<0.5){
            d.mordisco++;
            return `⚔️ ${d.name} gana +1 Mordisco`;
          } else {
            d.armadura++;
            return `🛡️ ${d.name} gana +1 Armadura`;
          }
        };
        break;
      }
      case "runa": {
        resultado = "Encuentras una runa mágica (+Aliento o +Velocidad).";
        necesitaEleccion = true;
        callbackEleccion = (d)=>{
          if(Math.random()<0.5){
            d.aliento++;
            return `🔥 ${d.name} gana +1 Aliento`;
          } else {
            d.velocidad++;
            return `⚡ ${d.name} gana +1 Velocidad`;
          }
        };
        break;
      }
     case "mercader": {
      let r = Math.random();
      
      if (r < 0.25) {
        pushItem("Poción Roja", 2* MULT, "pocionroja");
        resultado = "Mercader: obtienes Poción Roja x1";
      } 
      else if (r < 0.50) {
        pushItem("Tomo de técnicas de entrenamiento de dragones", 2* MULT, "tomo_inventario");
        resultado = "Mercader: obtienes Tomo x1";
      } 
      else if (r < 0.75) {
        pushItem("Monedas", 300* MULT, "Monedas");
        resultado = "Mercader: obtienes 300 Monedas";
      } 
      else {
        // 🌀 Nueva opción: Runa (25 % de probabilidad total)
        let rr = Math.random();
        let tipoRuna, keyRuna;

        if (rr < 0.80) { 
          tipoRuna = "Runa Rara"; 
          keyRuna = "runarara"; 
        }
        else if (rr < 0.95) { 
          tipoRuna = "Runa Épica"; 
          keyRuna = "runaepica"; 
        }
        else { 
          tipoRuna = "Runa Legendaria"; 
          keyRuna = "runalegendaria"; 
        }

        pushItem(tipoRuna, 1* MULT, keyRuna);
        resultado = `Mercader: obtienes ${tipoRuna} x1`;
      }

  break;
}
case "huevoenterrado": {
  // 🥚 Puede salir cualquiera de los 6 tipos de huevo cargados en inventario
  const tiposHuevos = [
    { nombre: "Huevo de Roca",   key: "huevoroca" },
    { nombre: "Huevo de Agua",   key: "huevoagua" },
    { nombre: "Huevo de Fuego",  key: "huevofuego" },
    { nombre: "Huevo de Trueno", key: "huevotrueno" },
    { nombre: "Huevo de Misterio", key: "huevomisterio" },
    { nombre: "Huevo Striker",  key: "huevostriker" }
  ];

  // Seleccionar aleatoriamente uno
  const elegido = tiposHuevos[Math.floor(Math.random() * tiposHuevos.length)];

  pushItem(elegido.nombre, 1* MULT, elegido.key);
  resultado = `🌱 Has desenterrado un ${elegido.nombre}!`;

  break;
}

case "bancopeces": {
  // 🎣 Nueva versión: siempre entre 2 y 5 peces
  const cantidadTotal = Phaser.Math.Between(2, 5);

  // 🏝️ Tipo real de isla
  const islaTipo = (window.islaSeleccionada?.tipo || "").toLowerCase();

  // 🎣 Distribución temática por bioma (igual que antes)
  const distribuciones = {
    volcan:      { principal: "pezfuego", comunes: ["pezroca", "peztrueno"], raros: ["pezstriker", "pezmisterio", "pezagua"] },
    jungle:      { principal: "pezstriker", comunes: ["pezmisterio", "pezagua"], raros: ["pezfuego", "pezroca", "peztrueno"] },
    helado:      { principal: "pezagua", comunes: ["pezmisterio", "pezstriker"], raros: ["pezfuego", "pezroca", "peztrueno"] },
    cuevadragon: { principal: "pezmisterio", comunes: ["pezagua", "pezroca"], raros: ["pezfuego", "peztrueno", "pezstriker"] },
    desert:      { principal: "pezroca", comunes: ["peztrueno", "pezfuego"], raros: ["pezstriker", "pezmisterio", "pezagua"] },
    pantano:     { principal: "pezmisterio", comunes: ["pezstriker", "pezagua"], raros: ["pezfuego", "pezroca", "peztrueno"] },
    pradera:     { principal: "peztrueno", comunes: ["pezstriker", "pezagua"], raros: ["pezfuego", "pezroca", "pezmisterio"] },
    volante2:    { principal: "pezstriker", comunes: ["peztrueno", "pezmisterio"], raros: ["pezagua", "pezfuego", "pezroca"] },
    desert4:     { principal: "pezroca", comunes: ["pezfuego", "peztrueno"], raros: ["pezagua", "pezmisterio", "pezstriker"] },
    forest:      { principal: "pezagua", comunes: ["pezmisterio", "pezstriker"], raros: ["pezfuego", "pezroca", "peztrueno"] }
  };

  const dist = distribuciones[islaTipo] || distribuciones.jungle;

  // 🐟 Nombres coherentes con inventario
  const nombres = {
    pezagua: "Pez gélido",
    pezmisterio: "Pez púrpura",
    pezroca: "Pez pétreo",
    peztrueno: "Pez dorado",
    pezfuego: "Pez ardiente",
    pezstriker: "Pez irisado"
  };

  // 🎯 Al menos 2 peces del tipo principal
  let resultados = [{ tipo: dist.principal, cantidad: 2 }];

  // 🧮 Los restantes hasta 3 se eligen de otros tipos (sin incluir el principal)
  const otrosTipos = [...new Set([...dist.comunes, ...dist.raros].filter(t => t !== dist.principal))];

  const restantes = cantidadTotal - 2;
  for (let i = 0; i < restantes; i++) {
    const tipoRandom = Phaser.Utils.Array.GetRandom(otrosTipos);
    const existente = resultados.find(r => r.tipo === tipoRandom);
    if (existente) existente.cantidad++;
    else resultados.push({ tipo: tipoRandom, cantidad: 1 });
  }

  // 📦 Añadir los peces al inventario
  resultados.forEach(r => {
    pushItem(nombres[r.tipo], r.cantidad, r.tipo);
  });

  // 💬 Mensaje resumen bonito
  const resumen = resultados
    .map(r => `${r.cantidad} ${nombres[r.tipo]}${r.cantidad > 1 ? "s" : ""}`)
    .join(", ");

  resultado = `🎣 Has pescado ${resumen}!`;
  break;
}

case "santuario": {
        resultado = "Un santuario elemental brilla. Puedes mejorar la rareza de un dragón Común → Raro.";
        necesitaEleccion = true;
        callbackEleccion = (d)=>{
          if(d.rareza==="Común"){
            d.rareza="Raro";
            d.vidaMax = Math.floor(d.vidaMax*1.1);
            d.vida = d.vidaMax;
            d.mordisco++; 
            d.aliento++; 
            d.armadura++; 
            d.velocidad++;
            return `✨ ${d.name} ascendió a Rareza Raro (+stats generales)`;
          } else {
            return `⚠️ ${d.name} ya no es Común, no obtiene mejora`;
          }
        };
        break;
      }
      case "nido": {
  const rnd = Math.random();

  if (rnd < 0.15) {
    // 🎁 15% → huevo aleatorio
    const tiposHuevos = [
      { key: "huevofuego", nombre: "Huevo de dragón de Fuego" },
      { key: "huevoagua", nombre: "Huevo de dragón de Agua" },
      { key: "huevotrueno", nombre: "Huevo de dragón de Trueno" },
      { key: "huevoroca", nombre: "Huevo de dragón de Roca" },
      { key: "huevomisterio", nombre: "Huevo de dragón Misterioso" },
      { key: "huevostriker", nombre: "Huevo de dragón Striker" }
    ];

    const huevo = Phaser.Utils.Array.GetRandom(tiposHuevos);
    pushItem(huevo.nombre, 1, huevo.key);

   // 🧭 Popup visual con imagen del huevo
const W = scene.sys.game.config.width;
const H = scene.sys.game.config.height;
const popup = scene.add.container(W / 2, H / 2).setDepth(9999);

const fondo = scene.add.rectangle(0, 0, 500, 250, 0x000000, 0.85)
  .setStrokeStyle(2, 0xffd700);
popup.add(fondo);

// Imagen del huevo
const img = scene.add.image(-120, 0, huevo.key).setScale(0.9);
popup.add(img);

// Texto de mensaje
const txt = scene.add.text(40, 0,
  `🥚 ¡Has encontrado un\n${huevo.nombre}!`, {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "24px",
  fill: "#fff",
  align: "left",
  wordWrap: { width: 300 }
}).setOrigin(0.5);
popup.add(txt);

// Botón cerrar
const btn = scene.add.text(0, 90, "Aceptar", {
  fontFamily: "'Cinzel Decorative', serif",
  fontSize: "20px",
  fill: "#fff",
  backgroundColor: "#333",
  padding: { left: 20, right: 20, top: 8, bottom: 8 }
}).setOrigin(0.5).setInteractive();

btn.on("pointerdown", () => popup.destroy());
btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#555", fill: "#ffd700" }));
btn.on("pointerout", () => btn.setStyle({ backgroundColor: "#333", fill: "#fff" }));

popup.add(btn);


    resultado = ""; // ya mostramos popup

  } else if (rnd < 0.50) {
    // 🍷 45% → poción roja
    pushItem("Poción Roja", 3, "pocionroja");
    resultado = "Encuentras una Poción Roja en un nido abandonado.";

  } else {
    // 🪹 50% → vacío
    resultado = "El nido está vacío...";
  }
  break;
}

      case "tumba": {
        if(Math.random()<0.5){ pushItem("Tomo de técnicas de entrenamiento de dragones",3* MULT,"tomo_inventario"); resultado="Honras a un dragón antiguo: recibes 3 Tomo."; }
        else { pushItem("Monedas",600* MULT,"Monedas"); resultado="Honras a un dragón antiguo: recibes 600 Monedas."; }
        break;
      }

        case "runaatraccion": {
        // 🌀 Nueva runa de atracción: 80% épica, 20% legendaria
        const r = Math.random();
        let tipoRuna, keyRuna;

        if (r < 0.8) {
          tipoRuna = "Runa de Atracción Épica";
          keyRuna = "runaatraccionepica";
        } else {
          tipoRuna = "Runa de Atracción Legendaria";
          keyRuna = "runaatraccionlegend";
        }

        pushItem(tipoRuna, 1* MULT, keyRuna);
        resultado = `✨ Has obtenido una ${tipoRuna}!`;
        break;
      }
      case "monolitorojo": {
        resultado = "🪨🔥 Un monolito ardiente resuena... los dragones de fuego y roca despiertan.";
        evento.protegido = true;
        evento.esCombateEspecial = true;

        // ⏳ Espera un instante y lanza el combate táctico Monolito Rojo
        scene.time.delayedCall(1000, () => {
          if (window.lanzarTacticoDesdeMundo) {
            console.log("🔥 Lanzando combate Monolito Rojo...");
            lanzarTacticoDesdeMundo(scene, { monolitoRojo: true });
          } else {
            console.warn("⚠️ No se encontró lanzarTacticoDesdeMundo. ¿Está cargado tactics_integration.js?");
          }
        });
        break;
      }
      case "monolitoverde": {
        resultado = "🍃💎 Un monolito cubierto de enredaderas resplandece...";
        scene.time.delayedCall(1000, () => {
          lanzarTacticoDesdeMundo(scene, { monolitoVerde: true });
        });
        break;
      }

      case "monolitoazul": {
           resultado = "💠❄️ Un monolito helado emite un brillo azul intenso...";
           evento.protegido = true;
           evento.esCombateEspecial = true;

           scene.time.delayedCall(1000, () => {
            lanzarTacticoDesdeMundo(scene, { monolitoAzul: true });
          });
          break;
        }

      case "dungeonnieve": {
        resultado = "❄️ Entras en la mazmorra helada... ¡un poderoso enemigo te espera!\nElige al dragón legendario que deberás enfrentar.";

        necesitaEleccion = true;

        callbackEleccion = (d, scene) => {
          if(d.tier !== "S"){
            scene.add.text(500,500,"⚠️ Debes elegir un dragón de Tier S",{fontFamily: "'Cinzel Decorative', serif",
fontSize:"18px",fill:"#ff5555"}).setOrigin(0.5).setDepth(999);
            return;
          }

          const nivelMaxJugador = Math.max(...window.dragonesJugador.map(dr => dr.nivel || 1));
          const nivelBoss = nivelMaxJugador + 8;

          dragon2 = {...d};
          dragon2.rareza = "Legendario";
          dragon2.vida = dragon2.vidaMax;

          roleplay.asignarNivel(dragon2, nivelBoss);

          if(typeof asignarRareza === "function"){
            asignarRareza(dragon2, "Legendario");
          }

          window.ultimoCombate = { col: scene.posCol, row: scene.posRow, dragon: d };

          scene.time.delayedCall(800, ()=>{ scene.scene.start("SceneChooseDragon"); });

          return `❄️ Preparando combate contra un boss legendario en Frozencrown`;
        };

        evento.esFinalBoss = true;
        evento.protegido = true;
        break;
      }
      case "dungeonfuego": {
        resultado = "🔥 Entras en la mazmorra ígnea... ¡un enemigo legendario te espera!\nPrepárate para enfrentar al dragón de fuego supremo.";
        necesitaEleccion = false;
        evento.esFinalBoss = true;
        evento.protegido = true;
        break;
      }
      case "bolsarepelente": {
        // 🎒 Bolsa con entre 1 y 3 repelentes
        const cantidad = Phaser.Math.Between(1, 3);

        pushItem("Repelente de dragones", cantidad, "repelente");

        resultado = `💼 Has encontrado una bolsa con ${cantidad} Repelente${cantidad > 1 ? "s" : ""} de dragones.`;

        break;
      }

            case "ceboepico": {
        // Cebo epico lo meto a mano
        const cantidad = Phaser.Math.Between(1, 1);

        pushItem("Cebo para dragones épicos", cantidad, "ceboepico");

        resultado = `🎣 Has encontrado una bolsa con ${cantidad} Cebo${cantidad > 1 ? "s" : ""} de dragones.`;

        break;
      }



      case "prueba": {
        resultado = "Tu dragón enfrenta su sombra y gana un nivel completo.";
        necesitaEleccion = true;
        callbackEleccion = (d, scene)=>{
          let nivelActual = d.nivel || 1;
          const xpNecesaria = roleplay.expNecesaria(nivelActual);
          roleplay.addXP(d, xpNecesaria, scene, ()=>{
            console.log(`[DEBUG prueba] ${d.name} sube a nivel ${d.nivel}`);
          });
          return `💠 ${d.name} gana un nivel completo (Nv.${nivelActual+1})`;
        };
        break;
      }
      case "loot":
      default: {
        pushItem("Materiales de curación",4,"curacion_inventario");
        resultado="Encuentras un objeto curioso (de momento toma curas).";
        break;
      }
      
           case "reliquia": {
        resultado = "Encuentras una reliquia antigua que otorga poder.";
        necesitaEleccion = true;
        callbackEleccion = (d, scene)=>{
          d.vidaMax += 5;
          d.vida = d.vidaMax;
          return `⚜️ ${d.name} obtiene +5 Vida Máx.`;
        };
        break;
      }

      case "reliquiaepica": {
        resultado = "⚜️ Encuentras una reliquia legendaria... puede ascender a un dragón Raro → Épico.";
        necesitaEleccion = true;
        callbackEleccion = (d, scene)=>{
          if(d.rareza === "Raro"){
            d.rareza = "Épico";
            d.vidaMax = Math.floor(d.vidaMax * 1.2); // +20% vida
            d.vida = d.vidaMax;
            d.mordisco += 2;
            d.aliento += 2;
            d.armadura += 1;
            d.velocidad += 1;
            return `✨ ${d.name} ascendió a Rareza Épico (+stats generales)`;
          } else {
            return `⚠️ ${d.name} no es Raro, no obtiene mejora.`;
          }
        };
        break;
      }




    }


    // Texto centrado
const txt = scene.add.text(W / 2, H / 2 + 10, resultado, {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "22px",
  fill: "#ffffff",
  align: "center",
  wordWrap: { width: W * 0.7 }
}).setOrigin(0.5).setDepth(511);

// Botón centrado
const btnCerrar = scene.add.text(W / 2, H / 2 + 150, "✅ OK", {
  fontFamily: "'Cinzel Decorative', serif",
fontSize: "26px",
  fill: "#ffffff",
  backgroundColor: "#333333",
  padding: { left: 15, right: 15, top: 8, bottom: 8 }
}).setOrigin(0.5).setInteractive().setDepth(511);

   btnCerrar.on("pointerdown",()=>{
  overlay.destroy(); titulo.destroy(); txt.destroy(); btnCerrar.destroy();
  if(iconoEvento) iconoEvento.destroy();

  if(necesitaEleccion && callbackEleccion){
    this._elegirDragon(scene, callbackEleccion);
  }

  // ⚔️ Si es evento final elegimos Frozencrown /Scorchia
if(evento.esFinalBoss){
  scene.time.delayedCall(500, ()=>{
    if(scene.islaActual && scene.islaActual.bioma === "frozencrown"){
      encuentros.lanzarFrostend(scene);
    }
    else if(scene.islaActual && scene.islaActual.bioma === "scorchia"){
      encuentros.lanzarScorchia(scene);
    }
     else if(scene.islaActual && scene.islaActual.bioma === "jadeisland"){
      encuentros.lanzarJadeisland(scene);
    }
    else if(scene.islaActual && scene.islaActual.bioma === "stormcloud"){
      encuentros.lanzarStormcloud(scene);
    }
    else if(scene.islaActual && scene.islaActual.bioma === "hellfire"){
      encuentros.lanzarHellfire(scene);
    }
  });
}
  if(scene.onCerrarEvento) scene.onCerrarEvento(evento);
    // ✅ STORYMODE: marcar victoria tras aceptar recompensa de monolito
  if (window.storyMode && typeof window.storyMode.trigger === "function") {
    const clase = (evento.clase || "").toLowerCase();
    if (clase === "monolitoverde")  storyMode.trigger("winMonolitoVerde");
    if (clase === "monolitorojo")   storyMode.trigger("winMonolitoRojo");
    if (clase === "monolitoazul")   storyMode.trigger("winMonolitoAzul");
    if (clase === "monolitodorado") storyMode.trigger("winMonolitoDorado");
  }
  scene.bloqueado = false;
});

  }

  
};
