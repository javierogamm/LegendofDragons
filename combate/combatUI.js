/***** =========================
 * COMBAT UI: menús y popups auxiliares
 * ========================== */
const combatUI = {

  // Menú para elegir otro dragón vivo (solo de la lista recibida)
  mostrarMenuCambio(scene, lista){
 // Fondo centrado dinámicamente
 const { width: W, height: H } = scene.sys.game.config;
let overlay = scene.add.rectangle(W / 2, H / 2, W * 0.9, H * 0.85, 0x000000, 0.7)
  .setDepth(190).setInteractive();

// Título centrado arriba
let titulo = scene.add.text(W / 2, H * 0.18, "Elige otro dragón activo", {
  fontFamily: "'Cinzel Decorative', serif",fontSize: "28px",
  fill: "#ffd700",
  fontStyle: "bold"
}).setOrigin(0.5).setDepth(191);

let elementos = [overlay, titulo];

// Posición inicial centrada para las miniaturas
let x = W * 0.3;
let y = H * 0.4;
    lista.forEach(d=>{
      let miniKey = d.name + "_mini";
      let mini = scene.add.image(x,y,miniKey).setScale(0.5).setInteractive().setDepth(191);
      elementos.push(mini);

      let vidaMax = d.vidaMax || d.vida;
      let nombreMostrado = d.apodo ? `${d.apodo}\n(${d.name})` : d.name;

     let txt = scene.add.text(
  x,
  y + 50,
  `${nombreMostrado}\n${Math.round(d.vida)}/${Math.round(vidaMax)}`,
  {
    fontFamily: "'Cinzel Decorative', serif",fontSize: "14px",
    fill: "#fff",
    align: "center"
  }
).setOrigin(0.5).setDepth(191);
      elementos.push(txt);

      mini.on("pointerdown",()=>{
        // Establecer el nuevo dragón como activo
        dragon1 = d;
        dragon1.side = "player";
        dragon1.isEnemy = false;

        // 🔄 Reset de estados problemáticos
        dragon1.enDefensa = false;
        dragon1.aturdido = 0;
        dragon1.dotFuego = 0;
        dragon1.dotFuegoDmg = 0;
        dragon1.debuffPrecision = 0;
        dragon1.buffDefensa = 0;

        // 🔄 Recalcular alientos según nivel
        dragon1.numAlientos = calcularAlientosPorNivel(dragon1);
        dragon1.numAlientosInicial = dragon1.numAlientos;

        // 🔄 Resetear usos de bloqueo al sacar dragón nuevo
        d.bloqueosUsados = 0;
        d.bloqueosMax = calcularBloqueosMax(d);
        // Sincronizar vida
        scene.vida1 = d.vida;

        // 🚩 Resetear flag de combate
        scene.combateTerminado = false;

        // Cambiar sprite principal
        if(scene.p1){ scene.p1.destroy(); }
        scene.p1 = scene.add.image(300, 350, dragon1.name)
          .setScale(0.8)
          .setDepth(5);

        // Refrescar HUD
        if(scene.text1){
          let hudName = dragon1.apodo ? `${dragon1.apodo} (${dragon1.name})` : dragon1.name;
          scene.text1.setText(`${hudName} Nv.${dragon1.nivel}`);
        }
        if(scene.stats1){
          scene.stats1.setText(
            `🗡️ ${dragon1.mordisco}  🔥 ${dragon1.aliento}\n🛡️ ${dragon1.armadura}  ⚡ ${dragon1.velocidad}`
          );
        }
        if(scene.drawBolitas){ scene.drawBolitas(); }
        if(scene.dibujarEscudos) scene.dibujarEscudos();
        if(scene.addLog){
          let mostrado = dragon1.apodo ? dragon1.apodo : dragon1.name;
          scene.addLog(`⚔️ Sacas a ${mostrado} al combate`);
        }

        // Cerrar overlay
        elementos.forEach(el=>el.destroy());

        // Reanudar turno
if(scene.turno % 2 === 0){
  scene.time.delayedCall(1000, ()=>IAattack(scene, dragon2, dragon1));
} else {
  scene.time.delayedCall(500, ()=>scene.setBotonesActivos(true));
}
      });

      x += 200;
      if(x > 750){ x=250; y+=150; }
    });

    let btnCancelar = scene.add.text(500,500,"❌ Cancelar",{
      fontFamily: "'Cinzel Decorative', serif",fontSize:"20px",fill:"#f00",backgroundColor:"#222",
      padding:{left:10,right:10,top:5,bottom:5}
    }).setOrigin(0.5).setDepth(191).setInteractive();
    elementos.push(btnCancelar);

    btnCancelar.on("pointerdown",()=>{
      elementos.forEach(el=>el.destroy());
    });
  },

  // Opciones cuando tu dragón cae
  mostrarOpcionesDerrota(scene, lista){
    scene.addLog("Tu dragón ha caído...");
    scene.showMessage("💀 DERROTADO", 280, 2000, "#ff4444", "44px");

    let elementos = [];

    let btnCambiar = scene.crearBoton(400, 350, "🔄 Cambiar Dragón", ()=>{
      elementos.forEach(el=>el.destroy());   // 🔥 destruye botones de derrota
      combatUI.mostrarMenuCambio(scene, lista);
    });
    let btnHuir = scene.crearBoton(600, 350, "🏃 Huir", ()=>{
      elementos.forEach(el=>el.destroy());   // 🔥 destruye botones de derrota
      scene.scene.start("SceneMapa");
    });

    btnCambiar.setDepth(191);
    btnHuir.setDepth(191);

    elementos.push(btnCambiar, btnHuir);
  }
};
