/***** =========================
 * ESCENA POBLADO (con botones fijos: Cueva y Mapa)
 * ========================== */
class ScenePoblado extends Phaser.Scene {
  constructor(){ super("ScenePoblado"); }

  preload(){
    // Fondo del poblado
    this.load.image("fondopoblado","assets/poblado/fondopoblado.png");

    // Iconos
    this.load.image("mapaicono","assets/iconos/mapaicono.png");
    this.load.image("cuevaicono","assets/iconos/cuevadragones.png");
  }

  create(){
    // Fondo del poblado
    this.add.image(500,300,"fondopoblado").setDisplaySize(1000,600);

    // Posición base (15% por encima del centro → 40% de la altura)
    let baseY = this.scale.height * 0.40;
    let centerX = this.scale.width / 2;
    let gap = 260;

    // --- Botón Mapa ---
    let btnMapa = this.add.image(centerX - gap/2, baseY, "mapaicono")
      .setInteractive()
      .setScale(0.35)
      .setOrigin(0.5)
      .setDepth(100);

    btnMapa.on("pointerover",()=>{
      btnMapa.setTint(0xffff66);
    });
    btnMapa.on("pointerout",()=>{
      btnMapa.clearTint();
    });
    btnMapa.on("pointerdown",()=>{
      if(window.origenPoblado === "SceneWorld"){
        this.scene.start("SceneWorld");
      } else {
        this.scene.start("SceneMapa");
      }
    });

    // --- Botón Cueva ---
    let btnCueva = this.add.image(centerX + gap/2, baseY, "cuevaicono")
      .setInteractive()
      .setScale(0.35)
      .setOrigin(0.5)
      .setDepth(100);

    btnCueva.on("pointerover",()=>{
      btnCueva.setTint(0xffff66);
    });
    btnCueva.on("pointerout",()=>{
      btnCueva.clearTint();
    });
    btnCueva.on("pointerdown",()=>{ 
      window.ultimaEscena = "ScenePoblado"; 
      this.scene.start("SceneColeccionPoblado"); 
    });

    // Texto de título
    this.add.text(500,80,"POBLADO",{
      fontSize:"32px",
      fill:"#fff",
      fontStyle:"bold"
    }).setOrigin(0.5).setDepth(300);
  }
}
