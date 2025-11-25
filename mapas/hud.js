/***** =========================
 * HUD LATERAL DE DRAGONES
 * (solo activos, con color por rareza y selección dinámica)
 * ========================== */

// 🎨 Color por rareza
function colorRareza(r) {
  switch (r) {
    case "Común": return "#aaa";
    case "Raro": return "#1e90ff";
    case "Épico": return "#9932cc";
    case "Legendario": return "#ffd700";
    default: return "#fff";
  }
}

function crearHUD(scene) {
 const miniGroup = scene.add.group();
  const barGroup = [];
  // ==============================
  // 🧩 Bloque de textos base
  // ==============================
  const hudText = scene.add.text(20, 100, "", {
    fontSize: "14px",
    fontFamily: "'Cinzel Decorative', serif",
    fill: "#fff",
    align: "left",
    lineSpacing: 4,
    wordWrap: { width: 180 }
  }).setDepth(51);

  const apodo1 = scene.add.text(20, 20, "", {
    fontSize: "16px",
     fontFamily: "'Cinzel Decorative', serif",
    fontStyle: "italic",
    fill: "#fff",
    align: "left"
  }).setDepth(52);

  const nombre1 = scene.add.text(20, 40, "", {
    fontSize: "14px",
    fontFamily: "'Cinzel Decorative', serif",
    fontStyle: "bold",
    fill: "#fff",
    align: "left"
  }).setDepth(52);

  const tier1 = scene.add.text(20, 60, "", {
    fontSize: "14px",
    fontFamily: "'Cinzel Decorative', serif",
    align: "left"
  }).setDepth(52);

  // ==============================
  // 🐲 Minis de dragones activos
  // ==============================
 
  let x = 100, y = 260;

  if (!window.dragonesJugador || window.dragonesJugador.length === 0) {
    console.warn("⚠️ No hay dragonesJugador. HUD vacío.");
    return;
  }

  const activos = window.dragonesJugador.filter(d => d.activo);
  if (activos.length === 0) {
    console.warn("⚠️ No hay dragones activos, usando el primero.");
    activos.push(window.dragonesJugador[0]);
  }

  // Asignar el primero como seleccionado si no hay uno
  if (!window.dragon1) window.dragon1 = activos[0];

  activos.forEach((d, i) => {
    const miniKey = d.name + "_mini";
    if (!scene.textures.exists(miniKey)) return;

    // Recuadro color rareza
    const color = Phaser.Display.Color.HexStringToColor(colorRareza(d.rareza)).color;
    const border = scene.add.rectangle(x, y, 50, 50)
      .setStrokeStyle(2, color, 1)
      .setDepth(51);

    const mini = scene.add.image(x, y, miniKey)
      .setScale(0.4)
      .setInteractive()
      .setDepth(52);

    // 🟡 Al hacer clic: seleccionar dragón y actualizar HUD
    mini.on("pointerdown", () => {
      console.log(`🐉 Dragón seleccionado: ${d.name}`);
      window.dragon1 = d; // 👈 global coherente
      scene.updateHUD();

      if (scene.jugador) {
        scene.jugador.setTexture(miniKey);
      }

      // 🔸 Resalta visualmente la mini seleccionada
      miniGroup.getChildren().forEach(m => m.clearTint && m.clearTint());
      mini.setTint(0xffff66);
    });

    // Barra de vida
    const barra = scene.add.graphics().setDepth(52);
    barGroup.push({ dragon: d, barra, x: x - 18, y: y + 32, w: 36, h: 4 });

    miniGroup.add(mini);
    y += 60;
  });

  // ==============================
  // 🧠 Función para refrescar HUD
  // ==============================
  scene.updateHUD = () => {
    const dragon = window.dragon1;
    if (!dragon || typeof dragon.nivel !== "number") {
      console.warn("⚠️ updateHUD: dragon no inicializado");
      return;
    }

    const expNecesaria = roleplay.expNecesaria(dragon.nivel);
    const color1 = colorRareza(dragon.rareza);

    if (dragon.apodo) {
      apodo1.setText(`"${dragon.apodo}"`).setColor(color1);
    } else {
      apodo1.setText("").setColor(color1);
    }

    nombre1.setText(`🐉 ${dragon.name}`).setColor(color1);

    let tierColor1 = "#fff";
    if (dragon.tier === "A") tierColor1 = "#00bfff";
    if (dragon.tier === "S") tierColor1 = "#ffd700";
    tier1.setText(`Tier ${dragon.tier}`).setColor(tierColor1);

    // Texto de stats
    const texto =
      `Nv.${dragon.nivel}  PX: ${dragon.exp}/${expNecesaria}\n` +
      `❤️ Vida: ${dragon.vida}/${dragon.vidaMax}\n` +
      `⚔️ Mordisco: ${dragon.mordisco}\n` +
      `🔥 Aliento: ${dragon.aliento}\n` +
      `🛡️ Armadura: ${dragon.armadura}\n` +
      `⚡ Velocidad: ${dragon.velocidad}`;

    hudText.setText(texto);

    // 🔹 Redibujar barras de vida
    barGroup.forEach(b => {
      const d = b.dragon;
      if (!d || !d.vidaMax) return;
      const pct = Math.max(0, d.vida / d.vidaMax);
      b.barra.clear();
      b.barra.fillStyle(0x8b0000, 1).fillRect(b.x, b.y, b.w, b.h);
      b.barra.fillStyle(0x00cc00, 1).fillRect(b.x, b.y, b.w * pct, b.h);
    });
  };

  // Pequeño retraso para asegurar que dragon1 está listo
  scene.time.delayedCall(300, () => scene.updateHUD());

   // Pequeño retraso para asegurar que dragon1 está listo
  scene.time.delayedCall(300, () => scene.updateHUD());

  
  return { hudText, apodo1, nombre1, tier1, miniGroup, barGroup };


  
}
