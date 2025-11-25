/***** =========================
 * ESCENA DE TÍTULO (pantalla inicial)
 * ========================== */
class SceneTitle extends Phaser.Scene {
  constructor() { super("SceneTitle"); }

  preload() {
    this.load.image("titleBG", "assets/mapas/world.png");
  }

  create() {
    const { width, height } = this.sys.game.config;

    this.add.image(width / 2, height / 2, "titleBG")
      .setDisplaySize(width, height)
      .setAlpha(0.4);

    this.add.text(width / 2, height / 2 - 150, "LEGENDS OF DRAGONS", {
      fontFamily: "'Cinzel Decorative', serif",
      fontSize: "72px",
      color: "#ffd700",
      stroke: "#000",
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 80, "Una aventura de fuego y leyenda", {
      fontFamily: "'MedievalSharp', cursive",
      fontSize: "26px",
      color: "#fff"
    }).setOrigin(0.5);

    this.crearBoton(width / 2, height / 2 + 40, "🐉 INICIO", () => {
      this.scene.start("SceneSelector");
    });

    this.crearBoton(width / 2, height / 2 + 120, "💾 CARGAR PARTIDA", () => {
      this.abrirSelectorArchivo();
    });

    this.add.text(width - 10, height - 10, "v1.0.0", {
      fontSize: "14px",
      color: "#999"
    }).setOrigin(1, 1);
  }

  crearBoton(x, y, texto, callback) {
    const btn = this.add.text(x, y, texto, {
      fontFamily: "'MedievalSharp', cursive",
      fontSize: "32px",
      backgroundColor: "#333",
      color: "#fff",
      padding: { left: 25, right: 25, top: 10, bottom: 10 }
    }).setOrigin(0.5).setInteractive().setDepth(1000);

    btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#555", color: "#ffd700" }));
    btn.on("pointerout",  () => btn.setStyle({ backgroundColor: "#333", color: "#fff" }));
    btn.on("pointerdown", () => callback());
    return btn;
  }

  abrirSelectorArchivo() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";
    document.body.appendChild(input);

    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = ev => {
        try {
          console.log("📂 Cargando partida desde archivo...");
          const state = JSON.parse(ev.target.result);

          // Marcas de flujo
          window.__FROM_TITLE__ = true;
          window.__FROM_SAVEGAME__ = true;

          // Aplicar estado (SIN iniciar escena aquí dentro)
          SaveGame.apply(state);

          // Lanza resumen (ya registrada)
         setTimeout(() => {
  console.log("🎯 Mostrando SceneCargarPartida…");
  this.scene.start("SceneCargarPartida");   // 👈 usa la escena actual
}, 300);

        } catch (err) {
          alert("⚠️ Error al cargar la partida");
          console.error("❌ Error al procesar el archivo de guardado:", err);
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }
}
window.SceneTitle = SceneTitle;
