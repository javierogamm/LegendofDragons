/***** =========================
 * MAPA BOTONES Y COLECCIÓN
 * ========================== */

const mapaBotones = {
 mostrarColeccion(scene){
  scene.bloqueado = true; // bloquear movimiento mientras está abierto

  const { width: W, height: H } = scene.sys.game.config;

  // 🔹 Panel lateral derecho
  const overlay = scene.add.rectangle(W * 0.75, H / 2, W * 0.5, H * 0.9, 0x222222, 0.95)
    .setDepth(400)
    .setInteractive();

  // 🔹 Título (alineado arriba del panel)
  const titulo = scene.add.text(W * 0.75, H * 0.1, "📜 Colección de Dragones", {
    fontSize: "26px",
    fill: "#ffd700",
    fontFamily: "MedievalSharp",
    fontStyle: "bold"
  }).setOrigin(0.5).setDepth(401);

  // 🔹 Contenedor scrollable dentro del panel
  const scrollContainer = scene.add.container(W * 0.55, H * 0.2).setDepth(401);
  scene.scrollY = 0;
  let y = 0;

    // === Activos ===
    let activos = window.dragonesJugador.filter(d=>d.activo);
    scrollContainer.add(scene.add.text(0,y,"⚔️ Activos:",{
      fontSize:"20px", fill:"#0f0"
    }));
    y += 40;

    if(activos.length === 0){
      scrollContainer.add(scene.add.text(20,y,"(No tienes dragones activos)",{
        fontSize:"14px", fill:"#aaa"
      }));
      y += 30;
    } else {
      activos.forEach(d=>{
        y = mapaBotones.renderDragonCard(scene, scrollContainer, d, y);
      });
    }

    y += 30;

    // === Reserva ===
    let inactivos = window.dragonesJugador.filter(d=>!d.activo);
    scrollContainer.add(scene.add.text(0,y,"📦 Reserva:",{
      fontSize:"20px", fill:"#ccc"
    }));
    y += 40;

    if(inactivos.length === 0){
      scrollContainer.add(scene.add.text(20,y,"(Vacía)",{
        fontSize:"14px", fill:"#aaa"
      }));
    } else {
      inactivos.forEach(d=>{
        y = mapaBotones.renderDragonCard(scene, scrollContainer, d, y);
      });
    }

    // --- Botón cerrar ---
let btnCerrar = scene.add.text(W * 0.75, H * 0.9, "❌ Cerrar", {
        fontSize:"20px", fill:"#f55", backgroundColor:"#222",
      padding:{left:10,right:10,top:5,bottom:5}
    }).setOrigin(0.5).setDepth(401).setInteractive();

    btnCerrar.on("pointerdown",()=>{
      overlay.destroy(); titulo.destroy(); scrollContainer.destroy(); btnCerrar.destroy();
      scene.input.off("wheel"); 
      scene.bloqueado = false; // ✅ desbloquear movimiento al cerrar
    });

    // --- Scroll con rueda ---
    scene.input.on("wheel",(pointer, gameObjects, deltaX, deltaY)=>{
      scene.scrollY -= deltaY * 0.5;
      let minY = -(y - 400); // límite inferior dinámico
      scene.scrollY = Phaser.Math.Clamp(scene.scrollY, minY, 0);
      scrollContainer.y = 100 + scene.scrollY;
    });
  },

  renderDragonCard(scene, contenedor, d, y){
    let miniKey = d.name+"_mini";
    if(scene.textures.exists(miniKey)){
      contenedor.add(scene.add.image(20,y,miniKey).setScale(0.5).setOrigin(0,0.5));
    }

    let mostrado = d.apodo ? `${d.apodo} (${d.name})` : d.name;

    contenedor.add(scene.add.text(80,y-10,`${mostrado} Nv.${d.nivel}`,{
      fontSize:"14px", fill:"#fff"
    }).setOrigin(0,0.5));

    contenedor.add(scene.add.text(80,y+10,
      `❤️ ${d.vida}/${d.vidaMax}   🗡️ ${d.mordisco}  🔥 ${d.aliento}  🛡️ ${d.armadura}  ⚡ ${d.velocidad}`,{
      fontSize:"12px", fill:"#ccc"
    }).setOrigin(0,0.5));

    return y + 60;
  }
};
