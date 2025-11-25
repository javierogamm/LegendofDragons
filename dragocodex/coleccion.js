/***** =========================
 * ESCENA COLECCIÓN DE DRAGONES
 * ========================== */

class SceneColeccion extends Phaser.Scene {
  constructor(){ super("SceneColeccion"); }

  preload(){
    if(window.dragonesJugador){
      window.dragonesJugador.forEach(d=>{
        if(d.mini){ this.load.image(d.name+"_mini", d.mini); }
      });
    }
  }

  create(){
    this.origen = window.origenColeccion || "SceneMapa";

   const { width: W, height: H } = this.sys.game.config;

// Fondo centrado
this.add.rectangle(W / 2, H / 2, W * 0.9, H * 0.85, 0x000000, 0.8)
  .setOrigin(0.5);

// Título centrado arriba
this.add.text(W / 2, H * 0.1, "🏰 Colección de Dragones", {
  fontSize: "32px",
  fill: "#ffd700",
  fontStyle: "bold"
}).setOrigin(0.5);

    if(!window.dragonesJugador || window.dragonesJugador.length===0){
      this.add.text(500,300,"No tienes dragones aún.",{
        fontSize:"22px",fill:"#fff"
      }).setOrigin(0.5);
      return;
    }

    let x = 180, y = 120, count=0;
    window.dragonesJugador.forEach(d=>{
      let miniKey = d.name+"_mini";
      let mini = this.add.image(x,y,miniKey).setScale(0.6);

      // Nombre + Nivel + Tier
      let color="#fff";
      if(d.tier==="A") color="#00bfff";
      if(d.tier==="S") color="#ffd700";
      this.add.text(x,y+50,`${d.name}\nNv.${d.nivel} (Tier ${d.tier})`,{
        fontSize:"14px",fill:color,align:"center"
      }).setOrigin(0.5);

      // Barra de vida
      let barraW=80, barraH=8;
      let pct = d.vida / d.vidaMax;
      let verde = Math.floor(barraW*pct);
      this.add.rectangle(x-barraW/2,y+80,barraW,barraH,0x8b0000).setOrigin(0,0.5); // fondo rojo
      this.add.rectangle(x-barraW/2,y+80,verde,barraH,0x00ff00).setOrigin(0,0.5); // verde restante

      this.add.text(x,y+95,`${d.vida}/${d.vidaMax}`,{
        fontSize:"12px",fill:"#fff"
      }).setOrigin(0.5);

      // Stats
      this.add.text(x,y+120,
        `🦷 ${d.mordisco}  🔥 ${d.aliento}\n🛡️ ${d.armadura}  ⚡ ${d.velocidad}`,
        {fontSize:"12px",fill:"#ccc",align:"center"}
      ).setOrigin(0.5);

      // Posiciones en cuadrícula
      x+=200; count++;
      if(count%4===0){ x=180; y+=180; }
    });

    // Botón volver
let btn = this.add.text(W / 2, H * 0.9, "⬅ Volver", {
      fontSize:"22px",fill:"#fff",backgroundColor:"#333",
      padding:{left:12,right:12,top:6,bottom:6}
    }).setOrigin(0.5).setInteractive();

    btn.on("pointerdown",()=>{ 
      if(this.origen === "SceneWorld"){
        // 👈 Guardar posición ANTES de salir de World ya está hecho allí,
        // aquí simplemente volvemos y SceneWorld la restaurará
        this.scene.start("SceneWorld");
      } else if(this.origen === "SceneMapa"){
        this.scene.start("SceneMapa");
      } else {
        this.scene.start("ScenePoblado"); // fallback
      }
    });

    btn.on("pointerover",()=>btn.setStyle({backgroundColor:"#555",color:"#ffd700"}));
    btn.on("pointerout",()=>btn.setStyle({backgroundColor:"#333",color:"#fff"}));
  }
}
