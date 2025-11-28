/***** =========================
 * DRAGONES (array completo con stats equilibrados)
 * ========================== */
const dragones = [
  // ==== TIER B ====
  { name: "Aturde Espinas", tipo: "Misterio", tier: "B", clase: "Tanque/Equilibrado", img: "assets/Dragones/Aturde Espinas.png", mini: "assets/Minis/Aturde Espinas_Mini.png", vida: 41, mordisco: 6, aliento: 4, armadura: 6, velocidad: 4, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 35 },
  { name: "Gronckle", tipo: "Roca", tier: "B", clase: "Tanque", img: "assets/Dragones/Gronckle.png", mini: "assets/Minis/Gronckle_Mini.png", vida: 50, mordisco: 6, aliento: 4, armadura: 8, velocidad: 3, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 39 },
  { name: "Terror terrible", tipo: "Fuego", tier: "B", clase: "Breather", img: "assets/Dragones/Terror terrible.png", mini: "assets/Minis/Terror terrible_Mini.png", vida: 26, mordisco: 4, aliento: 8, armadura: 4, velocidad: 9, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 38 },
  { name: "Diablillo Picaro", tipo: "Misterio", tier: "B", clase: "Rogue", img: "assets/Dragones/Diablillo Picaro.png", mini: "assets/Minis/Diablillo Picaro_Mini.png", vida: 24, mordisco: 8, aliento: 4, armadura: 5, velocidad: 8, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 37 },
  { name: "Gobsucker", tipo: "Roca", tier: "B", clase: "Tanque", img: "assets/Dragones/Gobsucker.png", mini: "assets/Minis/Gobsucker_Mini.png", vida: 44, mordisco: 6, aliento: 4, armadura: 8, velocidad: 4, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 39 },
  { name: "Clavagarras", tipo: "Misterio", tier: "B", clase: "Rogue/Luchador", img: "assets/Dragones/Clavagarras.png", mini: "assets/Minis/Clavagarras_Mini.png", vida: 27, mordisco: 8, aliento: 4, armadura: 4, velocidad: 10, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 37 },
  { name: "Cremallerus espantosus", tipo: "Roca", tier: "B", clase: "Equilibrado/Tanque", img: "assets/Dragones/Cremallerus espantosus.png", mini: "assets/Minis/Cremallerus espantosus_Mini.png", vida: 39, mordisco: 6, aliento: 4, armadura: 7, velocidad: 5, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 40 },
  { name: "Azote afilado", tipo: "Roca", tier: "B", clase: "Breather", img: "assets/Dragones/Azote afilado.png", mini: "assets/Minis/Azote afilado_Mini.png", vida: 34, mordisco: 6, aliento: 6, armadura: 7, velocidad: 3, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 40 },
  { name: "Flamewhipper", tipo: "Fuego", tier: "B", clase: "Rogue", img: "assets/Dragones/Flamewhipper.png", mini: "assets/Minis/Flamewhipper_Mini.png", vida: 28, mordisco: 7, aliento: 6, armadura: 4, velocidad: 7, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 38 },
  { name: "Extinguehumo", tipo: "Misterio", tier: "B", clase: "Breather", img: "assets/Dragones/Extinguehumo.png", mini: "assets/Minis/Extinguehumo_Mini.png", vida: 30, mordisco: 6, aliento: 6, armadura: 5, velocidad: 7, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 39 },
  { name: "Luminous Crafin", tipo: "Agua", tier: "B", clase: "Equilibrado", img: "assets/Dragones/Luminous Crafin.png", mini: "assets/Minis/Luminous Crafin_Mini.png", vida: 30, mordisco: 6, aliento: 6, armadura: 5, velocidad: 6, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 36 },
  { name: "Traga arena", tipo: "Roca", tier: "B", clase: "Tanque", img: "assets/Dragones/Traga arena.png", mini: "assets/Minis/Traga arena_Mini.png", vida: 48, mordisco: 7, aliento: 5, armadura: 8, velocidad: 3, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 40 },
  { name: "Olfateador", tipo: "Trueno", tier: "B", clase: "Breather", img: "assets/Dragones/Olfateador.png", mini: "assets/Minis/Olfateador_Mini.png", vida: 30, mordisco: 5, aliento: 7, armadura: 4, velocidad: 6, numAlientosPorNivel: { 1:2, 15:3, 25:4,30:5 }, puntuacion: 38 },
  { name: "Cortaleña", tipo: "Striker", tier: "B", clase: "Luchador", img: "assets/Dragones/Cortaleña.png", mini: "assets/Minis/Cortaleña_Mini.png", vida: 37, mordisco: 9, aliento: 4, armadura: 7, velocidad: 7, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 50 },
  // ==== NUEVOS TIER B ====
  { name: "Aguijon veloz", tipo: "Striker", tier: "B", clase: "Rogue", img: "assets/Dragones/Aguijon veloz.png", mini: "assets/Minis/Aguijon veloz_Mini.png", vida: 28, mordisco: 7, aliento: 4, armadura: 4, velocidad: 10, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 38 },
  { name: "Ocupa cuevas", tipo: "Roca", tier: "B", clase: "Luchador", img: "assets/Dragones/Ocupa cuevas.png", mini: "assets/Minis/Ocupa cuevas_Mini.png", vida: 42, mordisco: 7, aliento: 4, armadura: 8, velocidad: 5, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 39 },

  // ==== TIER A ====
  { name: "Terror nocturno", tipo: "Fuego", tier: "A", clase: "Breather", img: "assets/Dragones/Terror nocturno.png", mini: "assets/Minis/Terror nocturno_Mini.png", vida: 26, mordisco: 6, aliento: 10, armadura: 5, velocidad: 7, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 46 },
  { name: "Octofin", tipo: "Agua", tier: "A", clase: "Equilibrado", img: "assets/Dragones/Octofin.png", mini: "assets/Minis/Octofin_Mini.png", vida: 36, mordisco: 7, aliento: 7, armadura: 6, velocidad: 7, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 51 },
  { name: "Deadly Nadder", tipo: "Misterio", tier: "A", clase: "Luchador/Breather", img: "assets/Dragones/Deadly Nadder.png", mini: "assets/Minis/Deadly Nadder_Mini.png", vida: 33, mordisco: 8, aliento: 7, armadura: 6, velocidad: 7, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 48 },
  { name: "Sombra sigilosa", tipo: "Misterio", tier: "A", clase: "Rogue", img: "assets/Dragones/Sombra sigilosa.png", mini: "assets/Minis/Sombra sigilosa_Mini.png", vida: 28, mordisco: 7, aliento: 7, armadura: 5, velocidad: 9, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 48 },
  { name: "Ripwrecker", tipo: "Agua", tier: "A", clase: "Equilibrado", img: "assets/Dragones/Ripwrecker.png", mini: "assets/Minis/Ripwrecker_Mini.png", vida: 34, mordisco: 7, aliento: 7, armadura: 7, velocidad: 6, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 51 },
  { name: "Rompecraneos", tipo: "Roca", tier: "A", clase: "Luchador/Tanque", img: "assets/Dragones/Rompecraneos.png", mini: "assets/Minis/Rompecraneos_Mini.png", vida: 46, mordisco: 9, aliento: 4, armadura: 8, velocidad: 5, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 52 },
  { name: "Albaliñero", tipo: "Roca", tier: "A", clase: "Luchador", img: "assets/Dragones/Albaliñero.png", mini: "assets/Minis/Albaliñero_Mini.png", vida: 41, mordisco: 9, aliento: 5, armadura: 8, velocidad: 6, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 50 },
  { name: "Cortalluvia", tipo: "Agua", tier: "A", clase: "Luchador/Rogue", img: "assets/Dragones/Cortalluvia.png", mini: "assets/Minis/Cortalluvia_Mini.png", vida: 35, mordisco: 8, aliento: 6, armadura: 6, velocidad: 9, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 48 },
  { name: "Espectro de nieve", tipo: "Agua", tier: "A", clase: "Breather/Rogue", img: "assets/Dragones/Espectro de nieve.png", mini: "assets/Minis/Espectro de nieve_Mini.png", vida: 28, mordisco: 6, aliento: 9, armadura: 5, velocidad: 9, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 48 },
  { name: "Scauldron", tipo: "Agua", tier: "A", clase: "Tanque/Breather", img: "assets/Dragones/Scauldron.png", mini: "assets/Minis/Scauldron_Mini.png", vida: 43, mordisco: 7, aliento: 8, armadura: 8, velocidad: 4, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 53 },
  { name: "Dramillon", tipo: "Striker", tier: "A", clase: "Rogue", img: "assets/Dragones/Dramillon.png", mini: "assets/Minis/Dramillon_Mini.png", vida: 32, mordisco: 8, aliento: 7, armadura: 6, velocidad: 8, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 50 },
  { name: "Trueno tambor", tipo: "Trueno", tier: "A", clase: "Breather", img: "assets/Dragones/Trueno tambor.png", mini: "assets/Minis/Trueno tambor_Mini.png", vida: 34, mordisco: 7, aliento: 8, armadura: 6, velocidad: 7, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 48 },
  { name: "Mordida lúgubre", tipo: "Misterio", tier: "A", clase: "Luchador", img: "assets/Dragones/Mordida lúgubre.png", mini: "assets/Minis/Mordida lúgubre_Mini.png", vida: 39, mordisco: 9, aliento: 6, armadura: 7, velocidad: 6, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 51 },
  { name: "Pesadilla Monstruosa", tipo: "Fuego", tier: "A", clase: "Luchador/Breather", img: "assets/Dragones/Pesadilla Monstruosa.png", mini: "assets/Minis/Pesadilla Monstruosa_Mini.png", vida: 35, mordisco: 9, aliento: 7, armadura: 7, velocidad: 7, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 55 },
  { name: "Mascavientos", tipo: "Trueno", tier: "A", clase: "Breather/Luchador", img: "assets/Dragones/Mascavientos.png", mini: "assets/Minis/Mascavientos_Mini.png", vida: 37, mordisco: 8, aliento: 7, armadura: 6, velocidad: 8, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 50 },
   // ==== NUEVOS TIER A ====
  { name: "Cortahielos", tipo: "Agua", tier: "A", clase: "Breather", img: "assets/Dragones/Cortahielos.png", mini: "assets/Minis/Cortahielos_Mini.png", vida: 32, mordisco: 6, aliento: 9, armadura: 6, velocidad: 7, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 50 },
  { name: "Groncicle", tipo: "Agua", tier: "A", clase: "Breather/Tanque", img: "assets/Dragones/Groncicle.png", mini: "assets/Minis/Groncicle_Mini.png", vida: 40, mordisco: 7, aliento: 8, armadura: 8, velocidad: 6, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 53 },
  { name: "Gusano de fuego", tipo: "Fuego", tier: "A", clase: "Luchador", img: "assets/Dragones/Gusano de fuego.png", mini: "assets/Minis/Gusano de fuego_Mini.png", vida: 38, mordisco: 9, aliento: 7, armadura: 6, velocidad: 7, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 51 },
  { name: "Muerte susurrante", tipo: "Misterio", tier: "A", clase: "Luchador", img: "assets/Dragones/Muerte susurrante.png", mini: "assets/Minis/Muerte susurrante_Mini.png", vida: 36, mordisco: 9, aliento: 6, armadura: 7, velocidad: 8, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 50 },
  { name: "Pesadilla voladora", tipo: "Agua", tier: "A", clase: "Rogue", img: "assets/Dragones/Pesadilla voladora.png", mini: "assets/Minis/Pesadilla voladora_Mini.png", vida: 29, mordisco: 7, aliento: 8, armadura: 5, velocidad: 9, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 48 },
  { name: "Reptil alado", tipo: "Striker", tier: "A", clase: "Luchador", img: "assets/Dragones/Reptil alado.png", mini: "assets/Minis/Reptil alado_Mini.png", vida: 34, mordisco: 9, aliento: 6, armadura: 6, velocidad: 9, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 50 },
  { name: "Tramphocico", tipo: "Misterio", tier: "A", clase: "Equilibrado", img: "assets/Dragones/Tramphocico.png", mini: "assets/Minis/Tramphocico_Mini.png", vida: 34, mordisco: 8, aliento: 7, armadura: 7, velocidad: 8, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 50 },
  { name: "Colmillo afilado", tipo: "Striker", tier: "A", clase: "Tanque/Luchador", img: "assets/Dragones/Colmillo afilado.png", mini: "assets/Minis/Colmillo afilado_Mini.png", vida: 36, mordisco: 10, aliento: 6, armadura: 8, velocidad: 7, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 50 },

   // ==== TIER S ====
  { name: "Furia nocturna", tipo: "Striker", tier: "S", clase: "Breather/Rogue", img: "assets/Dragones/Furia nocturna.png", mini: "assets/Minis/Furia nocturna_Mini.png", vida: 28, mordisco: 8, aliento: 10, armadura: 4, velocidad: 12, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 59 },
  { name: "Thunderclaw", tipo: "Trueno", tier: "S", clase: "Tanque/Luchador", img: "assets/Dragones/Thunderclaw.png", mini: "assets/Minis/Thunderclaw_Mini.png", vida: 46, mordisco: 9, aliento: 7, armadura: 9, velocidad: 6, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 62 },
  { name: "Ala acorazada", tipo: "Roca", tier: "S", clase: "Tanque", img: "assets/Dragones/Ala acorazada.png", mini: "assets/Minis/Ala acorazada_Mini.png", vida: 54, mordisco: 6, aliento: 6, armadura: 10, velocidad: 5, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 60 },
  { name: "Garra Mortal", tipo: "Striker", tier: "S", clase: "Rogue/Tanque", img: "assets/Dragones/Garra Mortal.png", mini: "assets/Minis/Garra Mortal_Mini.png", vida: 29, mordisco: 9, aliento: 8, armadura: 5, velocidad: 11, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 58 },
  { name: "Alacambiante", tipo: "Agua", tier: "S", clase: "Equilibrado", img: "assets/Dragones/Alacambiante.png", mini: "assets/Minis/Alacambiante_Mini.png", vida: 34, mordisco: 8, aliento: 8, armadura: 8, velocidad: 7, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 56 },
  { name: "Cortatormentas", tipo: "Trueno", tier: "S", clase: "Luchador/Breather", img: "assets/Dragones/Cortatormentas.png", mini: "assets/Minis/Cortatormentas_Mini.png", vida: 39, mordisco: 10, aliento: 9, armadura: 7, velocidad: 8, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 61 },
  { name: "Furia luminosa", tipo: "Striker", tier: "S", clase: "Rogue/Equilibrado", img: "assets/Dragones/Furia luminosa.png", mini: "assets/Minis/Furia luminosa_Mini.png", vida: 26, mordisco: 10, aliento: 8, armadura: 4, velocidad: 12, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 58 },
  { name: "Canto mortal", tipo: "Misterio", tier: "S", clase: "Breather", img: "assets/Dragones/Canto mortal.png", mini: "assets/Minis/Canto mortal_Mini.png", vida: 30, mordisco: 7, aliento: 10, armadura: 6, velocidad: 11, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 58 },
  { name: "Dientescalofrio", tipo: "Misterio", tier: "S", clase: "Rogue", img: "assets/Dragones/Dientescalofrio.png", mini: "assets/Minis/Dientescalofrio_Mini.png", vida: 28, mordisco: 9, aliento: 9, armadura: 6, velocidad: 11, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 60 },
  { name: "Ladrón de espadas", tipo: "Roca", tier: "S", clase: "Luchador", img: "assets/Dragones/Ladrón de espadas.png", mini: "assets/Minis/Ladrón de espadas_Mini.png", vida: 41, mordisco: 10, aliento: 7, armadura: 8, velocidad: 7, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 59 },
  { name: "Licuador", tipo: "Agua", tier: "S", clase: "Breather", img: "assets/Dragones/Licuador.png", mini: "assets/Minis/Licuador_Mini.png", vida: 32, mordisco: 8, aliento: 10, armadura: 7, velocidad: 8, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 58 },
  { name: "Silver Phantom", tipo: "Misterio", tier: "S", clase: "Rogue", img: "assets/Dragones/Silver Phantom.png", mini: "assets/Minis/Silver Phantom_Mini.png", vida: 34, mordisco: 9, aliento: 9, armadura: 6, velocidad: 10, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 60 },
  { name: "Eructafuego", tipo: "Fuego", tier: "S", clase: "Breather/Tanque", img: "assets/Dragones/Eructafuego.png", mini: "assets/Minis/Eructafuego_Mini.png", vida: 47, mordisco: 7, aliento: 11, armadura: 8, velocidad: 5, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 64 },
  { name: "Pisarrocas", tipo: "Fuego", tier: "S", clase: "Luchador/Tanque", img: "assets/Dragones/Pisarrocas.png", mini: "assets/Minis/Pisarrocas_Mini.png", vida: 48, mordisco: 10, aliento: 8, armadura: 9, velocidad: 6, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 62 },
  { name: "Triple golpe", tipo: "Fuego", tier: "S", clase: "Rogue/Luchador", img: "assets/Dragones/Triple golpe.png", mini: "assets/Minis/Triple golpe_Mini.png", vida: 31, mordisco: 11, aliento: 9, armadura: 5, velocidad: 11, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 60 },
  { name: "Colaquemante", tipo: "Fuego", tier: "S", clase: "Breather/Rogue", img: "assets/Dragones/Colaquemante.png", mini: "assets/Minis/Colaquemante_Mini.png", vida: 32, mordisco: 8, aliento: 12, armadura: 6, velocidad: 9, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 61 },
  { name: "Hobblegrunt", tipo: "Trueno", tier: "S", clase: "Breather/Rogue", img: "assets/Dragones/Hobblegrunt.png", mini: "assets/Minis/Hobblegrunt_Mini.png", vida: 34, mordisco: 9, aliento: 10, armadura: 7, velocidad: 9, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 60 },
    // ==== NUEVOS TIER S ====
  { name: "Bufalo dragon", tipo: "Striker", tier: "S", clase: "Tanque", img: "assets/Dragones/Bufalo dragon.png", mini: "assets/Minis/Bufalo dragon_Mini.png", vida: 50, mordisco: 9, aliento: 6, armadura: 10, velocidad: 6, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 62 },
  { name: "Destripador carmesí", tipo: "Misterio", tier: "S", clase: "Tanque/Luchador", img: "assets/Dragones/Destripador carmesí.png", mini: "assets/Minis/Destripador carmesí_Mini.png", vida: 44, mordisco: 10, aliento: 8, armadura: 9, velocidad: 7, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 61 },
  { name: "Espectro de las arenas", tipo: "Striker", tier: "S", clase: "Striker", img: "assets/Dragones/Espectro de las arenas.png", mini: "assets/Minis/Espectro de las arenas_Mini.png", vida: 30, mordisco: 10, aliento: 8, armadura: 5, velocidad: 12, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 59 },
  { name: "Libelula", tipo: "Trueno", tier: "S", clase: "Equilibrado", img: "assets/Dragones/Libelula.png", mini: "assets/Minis/Libelula_Mini.png", vida: 33, mordisco: 8, aliento: 9, armadura: 7, velocidad: 9, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 59 },
  { name: "Robahuesos", tipo: "Striker", tier: "S", clase: "Equilibrado", img: "assets/Dragones/Robahuesos.png", mini: "assets/Minis/Robahuesos_Mini.png", vida: 36, mordisco: 9, aliento: 8, armadura: 7, velocidad: 8, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 58 },
  { name: "Skrill", tipo: "Misterio", tier: "S", clase: "Luchador/Breather", img: "assets/Dragones/Skrill.png", mini: "assets/Minis/Skrill_Mini.png", vida: 38, mordisco: 10, aliento: 9, armadura: 7, velocidad: 9, numAlientosPorNivel: { 1:2, 15:3, 25:4, 30:5 }, puntuacion: 62 },
  { name: "Temblor catastrófico", tipo: "Roca", tier: "S", clase: "Tanque/Luchador", img: "assets/Dragones/Temblor catastrófico.png", mini: "assets/Minis/Temblor catastrófico_Mini.png", vida: 52, mordisco: 10, aliento: 7, armadura: 10, velocidad: 6, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 64 },
  { name: "Tifoomerang", tipo: "Trueno", tier: "S", clase: "Breather", img: "assets/Dragones/Tifoomerang.png", mini: "assets/Minis/Tifoomerang_Mini.png", vida: 36, mordisco: 8, aliento: 10, armadura: 7, velocidad: 9, numAlientosPorNivel: { 1:2, 10:3, 20:4, 30:5 }, puntuacion: 60 }

];

// 📌 Bonificaciones pasivas por clase/rol
const BONUS_CLASE = {
  "Rogue":       { esquiva: 0.10 },
  "Tanque":      { bloqueo: 0.08 },
  "Equilibrado": { esquiva: 0.02, bloqueo: 0.02, crit: 0.02 },
  "Luchador":    { crit: 0.10 },
  "Breather":    { } // sin pasivos base
};

// 🔹 Devuelve los bonus aplicables a un dragón según su clase
function getBonusesForDragon(dragon){
  const base = { esquiva:0, bloqueo:0, crit:0 };
  if(!dragon || !dragon.clase) return base;

  // separar todas las clases (ej: "Rogue/Luchador")
  const partes = String(dragon.clase).split("/").map(s=>s.trim()).filter(Boolean);
  if(partes.length === 0) return base;

  // cada clase aporta un % igual del bonus
  const factor = 1 / partes.length;

  partes.forEach(rol=>{
    const b = BONUS_CLASE[rol] || {};
    base.esquiva += (b.esquiva || 0) * factor;
    base.bloqueo += (b.bloqueo || 0) * factor;
    base.crit    += (b.crit    || 0) * factor;
  });

  // Escalado por nivel alto (dobla los bonus si el dragón es ≥ 20)
  const multNivel = (dragon.nivel || 1) >= 20 ? 2 : 1;
  base.esquiva *= multNivel;
  base.bloqueo *= multNivel;
  base.crit    *= multNivel;

  return base;
}


/***** =========================
 * UTILIDADES
 * ========================== */
function d(n){ return Math.floor(Math.random()*n)+1; }
function rnd(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

/***** =========================
 * NORMALIZADOR DE DRAGONES
 * ========================== */
function normalizarDragon(d){
  if(!d) return;
  if (d.vidaMax == null && d.vida != null) d.vidaMax = d.vida;
  if(d.numAlientosInicial == null){
    let base = dragones.find(dd => dd.name === d.name);
    if(base){
      d.numAlientosInicial = base.numAlientos ?? 0;
    } else {
      d.numAlientosInicial = d.numAlientos ?? 0;
    }
  }
  d.numAlientos = d.numAlientosInicial;
}

// Variables globales
let dragon1=null, dragon2=null;
// === EXPOSICIÓN GLOBAL PARA MÓDULOS TÁCTICOS ===
if (typeof window !== "undefined") {
  window.dragones = dragones;
}