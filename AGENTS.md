# Guía de arquitectura de Legends of Dragons

Este proyecto es un juego 2D con Phaser 3 organizado en módulos de JavaScript globales cargados desde `index.html`. Todos los sistemas comparten estado en `window`, por lo que cualquier cambio debe cuidar la inicialización y la persistencia. El objetivo de este documento es describir las dependencias entre carpetas y ayudar a navegar el código.

## Flujo de arranque
- `index.html` es el punto de entrada: importa Phaser, luego los módulos de `config/`, los catálogos de `dragocodex/`, las escenas de mapas y ciudades, los sistemas de eventos y misiones, y finalmente los motores de combate clásico (`combate/`) y táctico (`tactic/`).
- La configuración de Phaser y la escena inicial se declaran al final de `index.html`. La carga secuencial es importante porque muchos scripts esperan que variables globales ya existan.

## Estado global compartido
- `config/init.js` inicializa inventario (`window.inventarioJugador`), listas de dragones (`window.dragonesJugador`, `window.dragonesDerrotados`) y contadores, de modo que otros módulos puedan usarlos sin verificar nulos.
- `config/savegame.js` serializa y restaura casi todo el estado global (dragones, inventario, misiones, runtime de islas, calendario, huevos en incubación, etc.). Si se añade un nuevo campo global, debe actualizarse aquí para que se guarde/cargue.
- `config/cargarpartida.js` y `config/title.js` controlan el flujo de carga inicial y la transición a la escena seleccionada.

## Catálogos y progresión de dragones (`dragocodex/`)
- `dragones.js` define el catálogo completo de dragones con stats base y utilidades como `getBonusesForDragon`.
- `rareza.js` y `roleplay.js` contienen tablas de rareza y fórmulas de progresión de atributos; `coleccion.js` y `coleccionpoblado.js` gestionan la colección del jugador y vistas derivadas.
- `chosedragon.js` y `captura.js` controlan la selección de dragones activos y la lógica de captura en encuentros.
- `criadero.js` administra huevos, incubación y dragones bebé; depende de las tablas de dragones y de las listas globales del jugador.

## Sistemas de combate clásico (`combate/`)
- `encuentros.js` crea combates contra enemigos basados en biomas/islas y se usa tanto desde mapas como desde eventos.
- `skills.js` define habilidades y efectos; `IAattack.js` usa esas habilidades para escoger acciones enemigas.
- `combate.js` orquesta el bucle de combate clásico en Phaser, usando las decisiones de IA y las habilidades; `combatUI.js` dibuja la interfaz.
- Estos módulos leen `window.dragon1/dragon2`, `window.dragonesEnemigos` y consumen stats de `dragocodex/`.

## Sistema táctico (`tactic/`)
- `tactics_encounter.js` genera grupos enemigos (incluye variantes de monolitos) y comparte reglas de generación con el mundo.
- `tactics_integration.js` actúa como puente desde `SceneWorld`: selecciona dragones activos, clona datos, crea parámetros de retorno y abre la escena `SceneCombateTactico`.
- `tactics_combate.js`, `tactics_turns.js`, `tactics_skills.js` y `tactics_IA.js` implementan el bucle de turnos, habilidades y decisiones en el modo táctico.
- `tactics_events.js` expone eventos usados por `mapas/world.js` y el runtime de islas para disparar combates tácticos contextuales.

## Mapas y navegación (`mapas/`)
- `mapaselector.js` y `mapa.js` manejan la selección de islas y la exploración con combates clásicos.
- `world.js` es la escena principal de mundo abierto: carga iconos de islas/ciudades, garantiza coherencia de dragones activos tras cargar partida y usa `lanzarTacticoDesdeMundo` para combates tácticos.
- `hud.js` y `mapabotones.js` dibujan la interfaz y los botones de navegación dentro de escenas de mapa.

## Ciudades, inventario y eventos
- `ciudad/` contiene `ciudades.js` (metadatos de ciudades) y `ciudad.js` (escena de ciudad con navegación, tiendas y misiones), además de `poblado.js` para el hub inicial.
- `inventario/inventario.js` muestra y modifica los ítems de `window.inventarioJugador`, incluyendo huevos, runas y monedas.
- `events/` define contenido dinámico: `eventos.js` y `eventoscompletados.js` registran eventos del mundo, `misiones.js` gestiona misiones activas/completadas y usa el catálogo de dragones para generar objetivos.
- `config/storymode.js` añade misiones narrativas; `config/calendar_runtime.js` mantiene el calendario global.

## Dependencias clave a considerar al modificar el código
- **Orden de carga**: si un módulo usa variables globales (ej. `dragones` o `tacticsEncounter`), asegúrate de que el script correspondiente se cargue antes en `index.html`.
- **Persistencia**: cualquier nuevo estado global debe sincronizarse en `config/savegame.js` para evitar pérdidas al guardar/cargar.
- **Datos de dragones**: nuevas criaturas requieren añadir su ficha en `dragocodex/dragones.js` y considerar sus efectos en habilidades (`combate/skills.js` y `tactic/tactics_skills.js`) y rarezas.
- **Interfaz y escenas**: al crear escenas nuevas, usa las convenciones de Phaser existentes y enlaza con el selector/mundo para no romper la navegación.

## Consejos de contribución
- Mantén las funciones puras donde sea posible; cuando modifiques estados globales, registra los efectos en los comentarios para facilitar el rastreo.
- Evita envolver imports en `try/catch` (no se usan bundlers aquí; los scripts se cargan directamente en el navegador).
- Antes de introducir nuevos atajos de teclado o botones, verifica si afectan a `SaveGame`, `inventario` o escenas existentes para mantener la coherencia.
