/***** =========================
 * ESCENA CHOOSE DRAGON (solo activos)
 * ========================== */

class SceneChooseDragon extends Phaser.Scene {
  constructor(){ super("SceneChooseDragon"); }

  preload(){
    // Cargar imágenes grandes de todos los dragones capturados
    if(window.dragonesJugador){
      window.dragonesJugador.forEach(d=>{
        if(d.img){
          this.load.image(d.name+"_img", d.img);
        }
      });
    }
  }

  create(){
    const { width: W, height: H } = this.sys.game.config;

    // 🪟 Fondo centrado
    this.add.rectangle(W / 2, H / 2, W * 0.9, H * 0.85, 0x000000, 0.7);

    // 🏷️ Título centrado arriba
    this.add.text(W / 2, H * 0.12, "Elige tu dragón para combatir", {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "32px",
      fill: "#ffd700",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Fallback si no hay dragones
    if(!window.dragonesJugador || window.dragonesJugador.length === 0){
      window.dragonesJugador = [dragon1];
    }

    // Solo dragones activos
    let activos = window.dragonesJugador.filter(d => d.activo);
    if(activos.length === 0){
      this.add.text(W/2,H/2,"No tienes dragones activos",{
        fontFamily: "'Cinzel Decorative', serif",
        fontSize:"20px",fill:"#fff"
      }).setOrigin(0.5);
      return;
    }

    // 🎨 Colores por rareza
    const coloresRareza = {
      "Común": "#cccccc",
      "Raro": "#00bfff",
      "Épico": "#9400d3",
      "Legendario": "#ffd700"
    };

    // 📊 Mostrar dragones activos
    let x = W * 0.25, y = H * 0.4, count = 0;
    activos.forEach(d=>{
      let imgKey = d.name+"_img";
      let colorRareza = coloresRareza[d.rareza] || "#ffffff";

      // === Marco con color de rareza ===
      let marco = this.add.rectangle(x, y, 300, 300, 0x000000, 0.5)
        .setStrokeStyle(6, Phaser.Display.Color.HexStringToColor(colorRareza).color);

      // === Imagen grande del dragón ===
      let img = this.add.image(x, y, imgKey)
        .setScale(0.5)
        .setInteractive({ useHandCursor: true });
      img.on("pointerdown",()=>this.seleccionarDragon(d));

      // === Nombre / Nivel / Clase ===
      const mostrado = d.apodo ? `${d.apodo} (${d.name})` : d.name;
      this.add.text(x, y + 180, `${mostrado}`, {
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "20px",
        fill: colorRareza,
        align: "center"
      }).setOrigin(0.5);

      this.add.text(x, y + 205, `Nv. ${d.nivel}  |  ${d.clase || d.tipo || "Clase desconocida"}`, {
        fontFamily: "'Cinzel Decorative', serif",
        fontSize: "16px",
        fill: "#ffffff",
        align: "center"
      }).setOrigin(0.5);

      // === Stats con emojis ===
      const stats = [
        { icon: "❤️", val: d.vida },
        { icon: "🗡️", val: d.mordisco },
        { icon: "🔥", val: d.aliento },
        { icon: "🛡️", val: d.armadura },
        { icon: "⚡", val: d.velocidad },
        { icon: "💨", val: d.numAlientos }
      ];

      let sx = x - 135;
      stats.forEach(s=>{
        this.add.text(sx, y + 245, `${s.icon} ${s.val ?? "?"}`, {
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: "18px",
          fill: "#fff"
        }).setOrigin(0,0.5);
        sx += 45;
      });

      x += 320;
      count++;
      if(count % 3 === 0){ // máximo 3 por fila centrados
        x = W * 0.25;
        y += 350;
      }
    });
  }

  seleccionarDragon(d){
    // ⚠️ No tocar la lógica
    dragon1 = JSON.parse(JSON.stringify(d));
    dragon1.img  = d.img;
    dragon1.mini = d.mini;
    dragon1.apodo = d.apodo || null;
    dragon1.vida = d.vida;
    dragon1.vidaMax = d.vidaMax;

    const base = (typeof dragones!=="undefined" && Array.isArray(dragones))
      ? dragones.find(x => x.name === d.name) || {}
      : {};

    dragon1.numAlientosInicial = Number(
      (d.numAlientosInicial ?? d.numAlientos ?? base.numAlientos ?? 0)
    );

    dragon1.numAlientos = d.numAlientos ?? dragon1.numAlientosInicial;
    dragon1.especialUsado = false;
    dragon1.bloqueosUsados = 0;
    dragon1.bloqueosMax = calcularBloqueosMax(dragon1);

    this.scene.start("SceneCombate");
  }
}
