/***** =========================
 * ESCENA SELECCIÓN DE ISLA
 * ========================== */
class SceneSeleccionIsla extends Phaser.Scene {
  constructor(){ super("SceneSeleccionIsla"); }

  preload(){
    // Thumbnails / fondos de las islas para la selección
    this.load.image("volcan","assets/mapas/volcan.png");
    this.load.image("jungle","assets/mapas/jungle.png");
    this.load.image("helado","assets/mapas/helado.png");
    this.load.image("cuevadragon","assets/mapas/cuevadragon.png");
    this.load.image("desert","assets/mapas/desert.png"); // Desierto
    this.load.image("world","assets/mapas/world.png");   // World (nuevo modo cámara cercana)
  }

  create(){
    this.add.text(500,40,"🌍 Selecciona una Isla",{
      fontSize:"28px",fill:"#ffd700"
    }).setOrigin(0.5);

    // Lista de islas disponibles (añadimos World)
    const islas = [
      { key:"volcan",      nombre:"Isla Volcán" },
      { key:"jungle",      nombre:"Isla Jungla" },
      { key:"helado",      nombre:"Isla Helada" },
      { key:"cuevadragon", nombre:"Cueva del Dragón" },
      { key:"desert",      nombre:"Isla Desierto" },
      { key:"world",       nombre:"Mapa World" } // nuevo
    ];

    let x = 200, y = 180;
    islas.forEach(isla=>{
      const cont = this.add.container(x,y);

      // Marco (dorado si es la isla seleccionada actualmente)
      const marcoColor = (window.islaSeleccionada === isla.key) ? 0xffd700 : 0xffffff;
      const marco = this.add.rectangle(0,0,180,120,0x000000,0.5)
        .setStrokeStyle(4,marcoColor);
      cont.add(marco);

      // Imagen de la isla
      const img = this.add.image(0,0,isla.key)
        .setDisplaySize(160,100)
        .setInteractive({ useHandCursor:true });
      cont.add(img);

      // Texto con el nombre
      const txt = this.add.text(0,70,isla.nombre,{
        fontSize:"18px",fill:"#fff"
      }).setOrigin(0.5);
      cont.add(txt);

      // Indicador de isla terminada (no aplica realmente a world, pero no molesta)
      if(this.islaTerminada(isla.key)){
        const txtFin = this.add.text(0,95,"ISLA TERMINADA",{
          fontSize:"14px",fill:"#0f0",fontStyle:"bold"
        }).setOrigin(0.5);
        cont.add(txtFin);
      }

      // Click para entrar en la isla
      img.on("pointerdown",()=>{
        window.islaSeleccionada = isla.key; // guardamos selección global
        if(isla.key === "world"){
          // Modo mapa grande con cámara y movimiento continuo
          this.scene.start("SceneWorld");
        } else {
          // Modo mapa clásico por cuadrícula
          this.scene.start("SceneMapa");
        }
      });

      // Distribución en rejilla (2 filas)
      x += 300;
      if(x > 800){
        x = 200; y += 220;
      }
    });

    // Botón volver al poblado
    const btnVolver = this.add.text(500,550,"⬅ Volver al Poblado",{
      fontSize:"20px",fill:"#fff",backgroundColor:"#444",
      padding:{left:12,right:12,top:6,bottom:6}
    }).setOrigin(0.5).setInteractive({ useHandCursor:true });

    btnVolver.on("pointerdown",()=>{
      this.scene.start("ScenePoblado");
    });
    btnVolver.on("pointerover",()=>btnVolver.setStyle({ backgroundColor:"#666", fill:"#ffd700" }));
    btnVolver.on("pointerout",()=>btnVolver.setStyle({ backgroundColor:"#444", fill:"#fff" }));
  }

  // Comprueba si una isla ya está completada
  islaTerminada(key){
    if(!window.eventosPorIsla) return false;
    const eventosIsla = window.eventosPorIsla[key] || [];
    if(eventosIsla.length === 0) return false;
    return eventosIsla.every(e => e.visitado || e.tipo==="mapacompletado");
  }
}
