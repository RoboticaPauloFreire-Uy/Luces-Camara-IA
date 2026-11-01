/* =====================================================================
   LUCES, CÁMARA, IA — BIBLIOTECA DE PROMPTS PARA FLOW (5° y 6°)
   ---------------------------------------------------------------------
   Cómo editar desde la web (Modo Profe):
     1. Haz 5 clics seguidos en la claqueta 🎬 arriba a la izquierda
        (o abre la página con ?profe al final del link).
     2. Escribe la clave (campo "pin", por defecto "1234").
     3. Crea o edita plantillas, pega tus links de YouTube y pulsa
        "💾 Exportar biblioteca.js".
     4. Sube este archivo a tu repositorio de GitHub.

   Sintaxis de variables dentro de un prompt:
     - {personaje} / {camara} / {estilo} / {escenario} / {audio}
       → Abre un selector visual con las tarjetas de esa categoría.
     - {clima|soleado brillante|lluvioso con charcos|nevando suave}
       → Muestra botones de opción rápida con esas alternativas.
     - {accion:descubre un cofre brillante}
       → Caja de texto con una sugerencia/ejemplo listo para usar o cambiar.
   ===================================================================== */
window.BIBLIOTECA = {
  "titulo": "Luces, Cámara, IA",
  "subtitulo": "¡Sé el director de tu propia película con Inteligencia Artificial!",
  "pin": "1234",
  "categorias": [
    { "id": "video",     "nombre": "Escenas de Video",   "emoji": "🎬", "color": "#ff595e", "rol": "plantilla" },
    { "id": "camara",    "nombre": "Comandos de Cámara", "emoji": "🎥", "color": "#1982c4", "rol": "ambos"     },
    { "id": "imagen",    "nombre": "Prompts de Imagen",  "emoji": "🖼️", "color": "#ff924c", "rol": "plantilla" },
    { "id": "estilo",    "nombre": "Estilos y Luz",      "emoji": "🎨", "color": "#8ac926", "rol": "pieza"     },
    { "id": "personaje", "nombre": "Personajes",         "emoji": "🧑‍🚀", "color": "#6a4c93", "rol": "pieza"     },
    { "id": "escenario", "nombre": "Escenarios",         "emoji": "🏞️", "color": "#00b4d8", "rol": "pieza"     },
    { "id": "audio",     "nombre": "Sonido y Voces",     "emoji": "🔊", "color": "#f72585", "rol": "pieza"     }
  ],
  "items": [
    /* ===================================================================
       🎬 ESCENAS DE VIDEO — Prompts prefabricados completos con variables
       =================================================================== */
    {
      "id": "vid-descubrimiento",
      "categoria": "video",
      "icono": "🗺️",
      "titulo": "El gran descubrimiento",
      "descripcion": "Tu personaje explora un lugar increíble y encuentra algo sorprendente. ¡Ideal para empezar una historia!",
      "prompt": "Video en estilo {estilo}. En {escenario}, vemos a {personaje}. Mientras avanza con curiosidad, {accion:encuentra un objeto antiguo que brilla con luz dorada y lo levanta con cuidado}. La expresión de su rostro pasa de la curiosidad al asombro total. Movimiento de cámara: {camara}. Iluminación cinematográfica con partículas flotando en el aire y colores muy vivos. Audio: {audio}.",
      "etiquetas": ["aventura", "básico", "historia"],
      "videos": []
    },
    {
      "id": "vid-dialogo",
      "categoria": "video",
      "icono": "🗣️",
      "titulo": "Personaje hablando a cámara",
      "descripcion": "Tu personaje mira a la cámara, hace un gesto y dice una frase corta. Recuerda: ¡los videos duran 8 segundos!",
      "prompt": "Video en estilo {estilo}. En {escenario}, aparece {personaje} mirando directamente a la lente. Con gesto {actitud|muy alegre y entusiasta|misterioso susurrando|sorprendido abriendo mucho los ojos|orgulloso como un héroe}, saluda y dice claramente en español: \"{frase:¡Hola amigos! ¿Están listos para esta aventura?}\". Movimiento de cámara: {camara}. Labios sincronizados con la voz, ojos muy expresivos. Audio: voz clara del personaje y {audio}.",
      "etiquetas": ["diálogo", "básico", "presentación"],
      "videos": []
    },
    {
      "id": "vid-accion",
      "categoria": "video",
      "icono": "⚡",
      "titulo": "Persecución o carrera épica",
      "descripcion": "Una escena llena de energía y movimiento donde el personaje corre, vuela o esquiva obstáculos.",
      "prompt": "Escena de acción dinámica en estilo {estilo}. {personaje} {accion:corre a toda velocidad saltando sobre rocas brillantes} a través de {escenario}. El viento mueve su ropa y levanta chispas y hojas a su paso. Velocidad de la escena: {velocidad|velocidad normal llena de energía|cámara lenta épica en el momento del salto|cámara rápida divertida}. Movimiento de cámara: {camara}. Audio: {audio}.",
      "etiquetas": ["acción", "aventura", "movimiento"],
      "videos": []
    },
    {
      "id": "vid-ciencia",
      "categoria": "video",
      "icono": "🔬",
      "titulo": "Mini documental de ciencias",
      "descripcion": "Explica un fenómeno de la naturaleza o del espacio como en un documental de televisión.",
      "prompt": "Toma de documental educativo en estilo {estilo}. Ubicación: {escenario}. Se observa en detalle cómo {fenomeno:la lava brillante sube por el cráter y lanza pequeñas chispas al cielo nocturno}. La atmósfera tiene un clima {clima|despejado y nítido|con niebla suave|con lluvia ligera|al atardecer dorado}. Movimiento de cámara: {camara}. Un narrador con voz cálida de documental explica en español: \"{explicacion:Así es como la naturaleza transforma nuestro planeta cada día}\". Audio de fondo: {audio}.",
      "etiquetas": ["ciencias", "colegio", "diálogo"],
      "videos": []
    },
    {
      "id": "vid-magia",
      "categoria": "video",
      "icono": "✨",
      "titulo": "Transformación mágica",
      "descripcion": "Algo común se transforma en algo extraordinario rodeado de chispas y efectos de luz.",
      "prompt": "Escena mágica en estilo {estilo}, ambientada en {escenario}. {personaje} toca con cuidado {objeto_inicial:una pequeña semilla de cristal} y, rodeada de una espiral de luces de color {color_magia|azul eléctrico y dorado|verde esmeralda brillante|rosa y violeta estelar}, se transforma suavemente en {objeto_final:un árbol luminoso con frutas flotantes}. El personaje reacciona con una gran sonrisa. Movimiento de cámara: {camara}. Audio: {audio} con campanas mágicas.",
      "etiquetas": ["fantasía", "creatividad", "efectos"],
      "videos": []
    },
    {
      "id": "vid-comercial",
      "categoria": "video",
      "icono": "📺",
      "titulo": "Comercial de un invento loco",
      "descripcion": "Inventa un objeto escolar o futurista y hazle su anuncio de televisión.",
      "prompt": "Comercial de televisión colorido y divertido en estilo {estilo}. En {escenario}, {personaje} presenta con orgullo su nuevo invento: \"{invento:la Mochila Cohete 3000}\", que sirve para {utilidad:hacer la tarea mientras vuela al colegio}. Al presionar un botón rojo, el invento funciona de maravilla con luces y efectos sorprendentes. Movimiento de cámara: {camara}. Un locutor entusiasta dice en español: \"{eslogan:¡Con la Mochila Cohete 3000, llegar tarde es cosa del pasado!}\". Audio: {audio}.",
      "etiquetas": ["creatividad", "humor", "diálogo"],
      "videos": []
    },
    {
      "id": "vid-clima",
      "categoria": "video",
      "icono": "🌦️",
      "titulo": "Laboratorio del clima y el tiempo",
      "descripcion": "Observa cómo cambia un mismo escenario según la hora del día y el clima.",
      "prompt": "Paisaje cinematográfico en estilo {estilo} mostrando {escenario}. Es {hora|el amanecer con rayos rosados|el mediodía con sol radiante|el atardecer dorado y naranja|la medianoche bajo un cielo lleno de estrellas y la luna brillante} y el clima está {clima|totalmente despejado|lloviendo con gotas que salpican en el suelo|nevando suavemente con copos grandes|con una tormenta eléctrica lejana}. En la escena, {detalle:un pequeño animal cruza tranquilamente el lugar}. Movimiento de cámara: {camara}. Audio: {audio}.",
      "etiquetas": ["naturaleza", "ciencias", "básico"],
      "videos": []
    },
    {
      "id": "vid-emociones",
      "categoria": "video",
      "icono": "🎭",
      "titulo": "Teatro de emociones",
      "descripcion": "Trabaja la expresión facial y corporal de tu personaje mostrando cómo cambia lo que siente.",
      "prompt": "Escena expresiva en estilo {estilo} dentro de {escenario}. Vemos a {personaje}, que al principio se siente {emocion_inicial|un poco triste y pensativo|nervioso mirando a todos lados|muy concentrado} pero de pronto {motivo:recibe una carta brillante con una gran noticia} y su cara se ilumina sintiéndose {emocion_final|súper feliz dando un salto de alegría|aliviado con una gran sonrisa|emocionado hasta las lágrimas}. Movimiento de cámara: {camara}. Audio: {audio}.",
      "etiquetas": ["emociones", "lenguaje", "básico"],
      "videos": []
    },

    /* ===================================================================
       🎥 COMANDOS DE CÁMARA — Cada uno es pieza Y TAMBIÉN plantilla
       con su propio prompt prefabricado para probar ese movimiento
       =================================================================== */
    {
      "id": "cam-dolly-in",
      "categoria": "camara",
      "icono": "🎯",
      "anim": "dolly-in",
      "comando": "Dolly In (Acercamiento)",
      "titulo": "Acercarse despacio (Dolly In)",
      "descripcion": "La cámara avanza físicamente hacia el personaje. Úsalo cuando quieras mostrar emoción, un secreto o algo muy importante.",
      "fragmento": "la cámara avanza lentamente hacia el personaje (dolly in), pasando de plano medio a primer plano",
      "prompt": "Video en estilo {estilo}. En {escenario}, está {personaje} mientras {accion:abre una pequeña caja luminosa y mira su interior con asombro}. Comando de cámara: la cámara avanza lentamente en línea recta hacia el rostro del personaje (dolly in cinematográfico), empezando en un plano medio y terminando en un primer plano lleno de emoción, con el fondo suavemente desenfocado. Audio: {audio}.",
      "etiquetas": ["movimiento", "básico", "emoción"],
      "videos": []
    },
    {
      "id": "cam-dolly-out",
      "categoria": "camara",
      "icono": "🔭",
      "anim": "dolly-out",
      "comando": "Dolly Out (Alejamiento)",
      "titulo": "Alejarse revelando el lugar (Dolly Out)",
      "descripcion": "La cámara empieza cerca del personaje y retrocede para mostrar lo grande que es el mundo a su alrededor. ¡Genial para finales de película!",
      "fragmento": "la cámara retrocede lentamente alejándose del personaje para revelar todo el escenario (dolly out)",
      "prompt": "Video en estilo {estilo}. Empezamos muy cerca de {personaje}, que {accion:mira el horizonte con una sonrisa valiente}. Comando de cámara: la cámara retrocede suavemente hacia atrás (dolly out continuo) revelando poco a poco toda la inmensidad de {escenario} alrededor del personaje. Luz espectacular y atmósfera épica. Audio: {audio}.",
      "etiquetas": ["movimiento", "básico", "épico"],
      "videos": []
    },
    {
      "id": "cam-orbita",
      "categoria": "camara",
      "icono": "🪐",
      "anim": "orbita",
      "comando": "Orbit 360° (Giro alrededor)",
      "titulo": "Girar alrededor como un héroe (Órbita 360°)",
      "descripcion": "La cámara da una vuelta en círculo alrededor del personaje sin dejar de mirarlo. Hace que cualquier escena se vea épica.",
      "fragmento": "la cámara gira en un círculo suave alrededor del personaje (órbita de 360 grados)",
      "prompt": "Video épico en estilo {estilo}. En el centro de {escenario} se encuentra {personaje} mientras {accion:activa un artefacto brillante que flota entre sus manos}. Comando de cámara: la cámara gira en un movimiento circular continuo de 360 grados alrededor del personaje (orbit shot), manteniendo al personaje siempre en el centro del encuadre mientras el fondo gira detrás. Audio: {audio}.",
      "etiquetas": ["movimiento", "épico"],
      "videos": []
    },
    {
      "id": "cam-tracking",
      "categoria": "camara",
      "icono": "🏃",
      "anim": "tracking",
      "comando": "Tracking Shot (Seguimiento)",
      "titulo": "Seguir al personaje en movimiento (Tracking)",
      "descripcion": "La cámara camina o corre junto al personaje (por detrás o delante) sin perderle el paso.",
      "fragmento": "la cámara sigue al personaje en movimiento manteniendo la misma distancia (tracking shot)",
      "prompt": "Video en estilo {estilo}. {personaje} {accion:avanza con paso decidido explorando el camino} a través de {escenario}. Comando de cámara: cámara de seguimiento (tracking shot) que se mueve {direccion|detrás del personaje acompañando sus pasos|delante del personaje retrocediendo al mismo ritmo que camina}, manteniendo el encuadre estable y fluido. Audio: {audio}.",
      "etiquetas": ["movimiento", "aventura", "básico"],
      "videos": []
    },
    {
      "id": "cam-travelling",
      "categoria": "camara",
      "icono": "🛤️",
      "anim": "truck",
      "comando": "Truck / Travelling Lateral",
      "titulo": "Deslizarse de lado (Travelling lateral)",
      "descripcion": "La cámara va sobre rieles invisibles de costado, acompañando al personaje de perfil como en un videojuego 2D.",
      "fragmento": "travelling lateral suave deslizándose en paralelo junto al personaje de perfil",
      "prompt": "Video en estilo {estilo}. Vemos de perfil a {personaje} mientras {accion:camina observando las maravillas del lugar} por {escenario}. Comando de cámara: travelling lateral (truck shot) donde la cámara se desliza horizontalmente de izquierda a derecha exactamente a la misma velocidad que el personaje, con objetos en primer plano pasando desenfocados para dar sensación de profundidad. Audio: {audio}.",
      "etiquetas": ["movimiento", "videojuegos"],
      "videos": []
    },
    {
      "id": "cam-paneo",
      "categoria": "camara",
      "icono": "👀",
      "anim": "pan",
      "comando": "Pan (Paneo horizontal)",
      "titulo": "Girar la cabeza a un lado (Paneo / Pan)",
      "descripcion": "La cámara está quieta en su trípode pero gira de izquierda a derecha para descubrir qué hay al lado.",
      "fragmento": "paneo horizontal suave de izquierda a derecha mostrando el escenario (camera pan)",
      "prompt": "Video en estilo {estilo}. La escena comienza mostrando {escenario} en calma y, mediante un comando de cámara de paneo horizontal lento de izquierda a derecha (camera pan sobre trípode fijo), descubre al otro lado a {personaje} que {accion:saluda sorprendido al ser descubierto}. Audio: {audio}.",
      "etiquetas": ["movimiento", "básico"],
      "videos": []
    },
    {
      "id": "cam-tilt",
      "categoria": "camara",
      "icono": "🦒",
      "anim": "tilt",
      "comando": "Tilt Up (Inclinación vertical)",
      "titulo": "Mirar de abajo hacia arriba (Tilt Up)",
      "descripcion": "La cámara empieza mirando el suelo y sube la mirada hasta la cima. Perfecto para cosas gigantes: torres, árboles o robots.",
      "fragmento": "la cámara se inclina lentamente de abajo hacia arriba revelando la altura (tilt up)",
      "prompt": "Video en estilo {estilo} en {escenario}. Empezamos viendo los pies de {personaje} junto a {estructura:una torre de cristal gigantesca que llega hasta las nubes}. Comando de cámara: la cámara se inclina suavemente de abajo hacia arriba (tilt up vertical) recorriendo toda la altura hasta revelar la cima brillante en el cielo. Audio: {audio}.",
      "etiquetas": ["movimiento", "ángulos"],
      "videos": []
    },
    {
      "id": "cam-dron",
      "categoria": "camara",
      "icono": "🚁",
      "anim": "dron",
      "comando": "Drone Aerial Shot (Vista de Dron)",
      "titulo": "Vuelo de dron por el cielo (Aerial Shot)",
      "descripcion": "La cámara vuela alto por el aire como un dron, ideal para mostrar paisajes enormes desde arriba.",
      "fragmento": "toma aérea de dron volando suavemente desde las alturas sobre el escenario",
      "prompt": "Espectacular toma aérea en estilo {estilo}. Comando de cámara: vista de dron (aerial drone shot) volando suavemente por encima de {escenario}, descendiendo poco a poco hasta mostrar a {personaje} que {accion:corre por un sendero saludando hacia el cielo}. Luz hermosa y gran sensación de altura. Audio: {audio}.",
      "etiquetas": ["movimiento", "ángulos", "paisaje"],
      "videos": []
    },
    {
      "id": "cam-grua",
      "categoria": "camara",
      "icono": "🏗️",
      "anim": "grua",
      "comando": "Crane Shot (Cámara Grúa)",
      "titulo": "Subir como una grúa de cine (Crane Shot)",
      "descripcion": "La cámara empieza a ras del suelo junto al personaje y se eleva alto en el aire mostrando todo el lugar.",
      "fragmento": "movimiento de grúa que se eleva desde el nivel del suelo hasta una vista alta (crane up)",
      "prompt": "Video cinematográfico en estilo {estilo}. A nivel del suelo en {escenario}, vemos a {personaje} que {accion:termina su misión y mira hacia el horizonte}. Comando de cámara: toma de grúa (crane shot) que empieza a la altura del personaje y se eleva suavemente hacia el cielo mostrando todo el paisaje iluminado. Audio: {audio}.",
      "etiquetas": ["movimiento", "épico"],
      "videos": []
    },
    {
      "id": "cam-fpv",
      "categoria": "camara",
      "icono": "🦅",
      "anim": "fpv",
      "comando": "FPV Drone (Vuelo acrobático)",
      "titulo": "Dron veloz entre obstáculos (FPV)",
      "descripcion": "Un vuelo rápido y emocionante que pasa entre árboles, arcos o edificios como si fueras un pájaro veloz.",
      "fragmento": "vuelo ágil de dron FPV atravesando el escenario con giros suaves y dinámicos",
      "prompt": "Video trepidante en estilo {estilo}. Comando de cámara: vuelo de dron FPV en primera persona que avanza velozmente esquivando elementos de {escenario} hasta llegar junto a {personaje}, quien {accion:vuela sobre una patineta flotante siguiendo el ritmo}. Sensación de velocidad e inmersión total. Audio: {audio}.",
      "etiquetas": ["movimiento", "acción"],
      "videos": []
    },
    {
      "id": "cam-contrapicado",
      "categoria": "camara",
      "icono": "🦸",
      "anim": "low-angle",
      "comando": "Low Angle (Contrapicado heroico)",
      "titulo": "Desde abajo como un superhéroe (Contrapicado)",
      "descripcion": "Ponemos la cámara cerca del suelo mirando hacia arriba. ¡Hace que el personaje se vea gigante, valiente y poderoso!",
      "fragmento": "ángulo contrapicado desde abajo mirando hacia arriba (low angle hero shot) haciendo ver poderoso al personaje",
      "prompt": "Video en estilo {estilo} ambientado en {escenario}. Comando de cámara: toma en ángulo contrapicado muy bajo (low angle hero shot) mirando hacia arriba a {personaje}, que {accion:se pone su capa ondeante al viento con pose de superhéroe} recortado contra el cielo brillante. Audio: {audio}.",
      "etiquetas": ["ángulos", "básico"],
      "videos": []
    },
    {
      "id": "cam-picado",
      "categoria": "camara",
      "icono": "🔍",
      "anim": "high-angle",
      "comando": "High Angle (Picado desde arriba)",
      "titulo": "Desde arriba mirando hacia abajo (Picado)",
      "descripcion": "La cámara mira desde arriba hacia el suelo. Hace que el personaje se vea pequeñito dentro de un gran lugar.",
      "fragmento": "ángulo picado desde arriba mirando hacia abajo al personaje (high angle shot)",
      "prompt": "Video en estilo {estilo}. Comando de cámara: ángulo picado alto (high angle) mirando desde arriba hacia el centro de {escenario}, donde un pequeño {personaje} {accion:levanta la vista hacia arriba sorprendido mientras caen hojas brillantes a su alrededor}. Audio: {audio}.",
      "etiquetas": ["ángulos"],
      "videos": []
    },
    {
      "id": "cam-pov",
      "categoria": "camara",
      "icono": "🥽",
      "anim": "pov",
      "comando": "POV (Primera persona)",
      "titulo": "Ver con los ojos del personaje (POV)",
      "descripcion": "La cámara son los ojos del protagonista: vemos sus manos adelante y el camino frente a nosotros como en un videojuego.",
      "fragmento": "vista subjetiva en primera persona (POV) viendo las manos del personaje interactuando con el entorno",
      "prompt": "Video inmersivo en estilo {estilo}. Comando de cámara: vista en primera persona (POV shot) desde los ojos del protagonista mientras avanza por {escenario}; vemos sus manos enguantadas al frente cuando {accion:aparta unas ramas luminosas y descubre a un simpático compañero saludándolo}. Audio: {audio}.",
      "etiquetas": ["ángulos", "videojuegos"],
      "videos": []
    },
    {
      "id": "cam-primer-plano",
      "categoria": "camara",
      "icono": "😊",
      "anim": "close-up",
      "comando": "Close-Up (Primer plano)",
      "titulo": "Primer plano de la cara (Close-Up)",
      "descripcion": "Encuadra el rostro bien de cerca y desenfoca el fondo. Es el mejor plano para ver las emociones y los ojos.",
      "fragmento": "primer plano cercano del rostro (close-up) con el fondo suavemente desenfocado",
      "prompt": "Video emotivo en estilo {estilo} dentro de {escenario}. Comando de cámara: primer plano cercano (close-up con poca profundidad de campo y fondo bokeh desenfocado) enfocado en el rostro de {personaje}, cuyos ojos brillan mientras {accion:sonríe al ver una mariposa de luz posarse en su nariz}. Audio: {audio}.",
      "etiquetas": ["planos", "básico", "emoción"],
      "videos": []
    },
    {
      "id": "cam-plano-general",
      "categoria": "camara",
      "icono": "🏔️",
      "anim": "wide",
      "comando": "Wide Shot (Plano general)",
      "titulo": "Plano general de todo el paisaje (Wide Shot)",
      "descripcion": "Muestra todo el escenario completo de punta a punta y al personaje dentro de él.",
      "fragmento": "gran plano general panorámico (wide establishing shot) que muestra todo el escenario en detalle",
      "prompt": "Video panorámico en estilo {estilo}. Comando de cámara: gran plano general abierto (wide establishing shot con lente gran angular) que muestra en toda su amplitud {escenario}, donde a lo lejos se distingue a {personaje} que {accion:cruza un puente colgante hacia una gran aventura}. Audio: {audio}.",
      "etiquetas": ["planos", "básico", "paisaje"],
      "videos": []
    },
    {
      "id": "cam-macro",
      "categoria": "camara",
      "icono": "🐞",
      "anim": "macro",
      "comando": "Macro Extreme Close-Up (Plano detalle)",
      "titulo": "Súper lupa de cosas diminutas (Plano Detalle / Macro)",
      "descripcion": "Acercamiento extremo para ver cosas minúsculas como si fueran gigantes: una gota de agua, un insecto o un engranaje.",
      "fragmento": "plano detalle macro extremo (extreme close-up) con enfoque ultra nítido en el objeto pequeño y fondo borroso",
      "prompt": "Video fascinante en estilo {estilo} en {escenario}. Comando de cámara: lente macro de plano detalle extremo (extreme close-up) mostrando muy de cerca {detalle_pequeno:una gota de rocío sobre una hoja brillante donde se refleja todo el bosque}, mientras {accion:una pequeña mariquita camina despacio junto a la gota}. Fondo totalmente desenfocado. Audio: {audio}.",
      "etiquetas": ["planos", "ciencias"],
      "videos": []
    },
    {
      "id": "cam-fijo",
      "categoria": "camara",
      "icono": "📷",
      "anim": "static",
      "comando": "Static Tripod Shot (Cámara fija)",
      "titulo": "Cámara quieta en trípode (Cámara fija)",
      "descripcion": "La cámara no se mueve nada; todo el movimiento ocurre adentro del cuadro. Muy clara y fácil de entender.",
      "fragmento": "cámara totalmente fija sobre un trípode estable, encuadre inmóvil",
      "prompt": "Video en estilo {estilo}. Comando de cámara: cámara totalmente fija sobre trípode (static shot) encuadrando {escenario}. Dentro del cuadro inmóvil, {personaje} entra por un lado, {accion:hace un truco divertido en el centro haciendo malabares con esferas de luz} y saluda antes de salir. Audio: {audio}.",
      "etiquetas": ["movimiento", "básico"],
      "videos": []
    },
    {
      "id": "cam-mano",
      "categoria": "camara",
      "icono": "📱",
      "anim": "handheld",
      "comando": "Handheld Camera (Cámara en mano)",
      "titulo": "Cámara en mano con movimiento real (Handheld)",
      "descripcion": "Se mueve un poquito como cuando grabas sin trípode. Da sensación de estar ahí mismo en medio de la acción.",
      "fragmento": "cámara en mano con movimiento natural y orgánico siguiendo la acción de cerca",
      "prompt": "Video dinámico en estilo {estilo} en {escenario}. Comando de cámara: grabación cámara en mano (handheld camera) con un pulso natural que acompaña de cerca a {personaje} mientras {accion:esquiva géiseres de vapor y celebra haber llegado a la meta}. Audio: {audio}.",
      "etiquetas": ["movimiento", "efectos", "acción"],
      "videos": []
    },
    {
      "id": "cam-lenta",
      "categoria": "camara",
      "icono": "🐢",
      "anim": "slowmo",
      "comando": "Slow Motion (Cámara lenta)",
      "titulo": "Cámara súper lenta épica (Slow Motion)",
      "descripcion": "El tiempo va despacito para apreciar cada gota, chispa o salto en el aire.",
      "fragmento": "grabación en cámara súper lenta (120 fps slow motion) capturando cada partícula en el aire",
      "prompt": "Video espectacular en estilo {estilo} dentro de {escenario}. Comando de cámara: cámara súper lenta cinematográfica (ultra slow motion) mostrando el instante exacto en que {personaje} {accion:da un gran salto en el aire atravesando una cortina de agua y chispas de colores}, viendo flotar cada gota con total nitidez. Audio: {audio}.",
      "etiquetas": ["efectos", "épico"],
      "videos": []
    },
    {
      "id": "cam-timelapse",
      "categoria": "camara",
      "icono": "⏩",
      "anim": "timelapse",
      "comando": "Time-Lapse (Cámara rápida)",
      "titulo": "El tiempo pasa volando (Time-Lapse)",
      "descripcion": "Horas enteras convertidas en pocos segundos: nubes corriendo, flores abriéndose o el día haciéndose noche.",
      "fragmento": "time-lapse acelerado con cámara fija donde las nubes y la luz avanzan rápidamente",
      "prompt": "Video en estilo {estilo} mostrando {escenario}. Comando de cámara: time-lapse con cámara fija donde el tiempo avanza rápidamente pasando del día soleado al atardecer naranja y la noche estrellada en pocos segundos, mientras {proceso:las flores gigantes del lugar se abren y empiezan a brillar en la oscuridad}. Audio: {audio}.",
      "etiquetas": ["efectos", "ciencias", "naturaleza"],
      "videos": []
    },

    /* ===================================================================
       🖼️ PROMPTS DE IMAGEN — Listos para generar ilustraciones o pósters
       =================================================================== */
    {
      "id": "img-portada",
      "categoria": "imagen",
      "icono": "📕",
      "titulo": "Portada de cuento o libro",
      "descripcion": "Crea la ilustración de portada para un cuento escrito en clases de Lenguaje.",
      "prompt": "Ilustración de portada de libro infantil en estilo {estilo}. En el centro aparece {personaje} mientras {accion:sostiene un mapa brillante mirando hacia el horizonte}, rodeado por {escenario}. Composición vertical equilibrada, colores vibrantes, iluminación mágica y espacio limpio en la parte superior para el título.",
      "etiquetas": ["lenguaje", "arte", "básico"],
      "videos": []
    },
    {
      "id": "img-poster",
      "categoria": "imagen",
      "icono": "🎟️",
      "titulo": "Póster de película de cine",
      "descripcion": "Diseña el afiche oficial de tu película antes de animarla en Flow.",
      "prompt": "Póster oficial de película de {genero|aventuras épicas|ciencia ficción espacial|comedia divertida|misterio y detectives|fantasía mágica} en estilo {estilo}. Protagonista: {personaje} en una pose heroica en el centro. Escenario de fondo: {escenario}. Iluminación dramática con contraste de luces cálidas y frías, calidad de cine.",
      "etiquetas": ["creatividad", "cine"],
      "videos": []
    },
    {
      "id": "img-personaje-ficha",
      "categoria": "imagen",
      "icono": "🪪",
      "titulo": "Diseño de personaje (cuerpo completo)",
      "descripcion": "Crea tu propio personaje de pies a cabeza para luego usarlo en tus videos de Flow.",
      "prompt": "Diseño de personaje de cuerpo completo en estilo {estilo}. El personaje es {descripcion_personaje:un zorro inventor con antiparras de cobre, mochila llena de herramientas y bufanda azul}, con expresión {expresion|alegre y confiada|curiosa y divertida|valiente y decidida}. Fondo limpio y suave para apreciar todos los detalles del personaje.",
      "etiquetas": ["personajes", "creatividad"],
      "videos": []
    },
    {
      "id": "img-colorear",
      "categoria": "imagen",
      "icono": "🖍️",
      "titulo": "Lámina para imprimir y colorear",
      "descripcion": "Genera un dibujo en blanco y negro de líneas limpias listo para pintar en clases.",
      "prompt": "Página de libro para colorear para niños, únicamente líneas negras limpias y bien definidas sobre fondo totalmente blanco puro, sin sombras grises ni rellenos de color. Escena: {tema:un astronauta simpático jugando al fútbol en la Luna con un pequeño extraterrestre}. Trazo claro e infantil.",
      "etiquetas": ["arte", "colegio"],
      "videos": []
    },

    /* ===================================================================
       🎨 ESTILOS Y LUZ — Piezas para el constructor (y explorables)
       =================================================================== */
    {
      "id": "est-3d",
      "categoria": "estilo",
      "icono": "🧸",
      "titulo": "Animación 3D tipo Pixar",
      "descripcion": "Como las películas animadas modernas del cine: colores vivos, texturas suaves y caras muy expresivas.",
      "fragmento": "animación 3D estilo película familiar moderna, colores vibrantes, iluminación suave y personajes muy expresivos",
      "prompt": "animación 3D estilo película familiar moderna, colores vibrantes, iluminación suave y personajes muy expresivos",
      "etiquetas": ["animación", "básico"],
      "videos": []
    },
    {
      "id": "est-plastilina",
      "categoria": "estilo",
      "icono": "🏺",
      "titulo": "Plastilina (Stop-Motion)",
      "descripcion": "Todo parece modelado a mano con plastilina de colores, como Wallace y Gromit.",
      "fragmento": "animación stop-motion hecha en plastilina artesanal con texturas de huellas hechas a mano y luz cálida de maqueta",
      "prompt": "animación stop-motion hecha en plastilina artesanal con texturas de huellas hechas a mano y luz cálida de maqueta",
      "etiquetas": ["animación", "arte"],
      "videos": []
    },
    {
      "id": "est-anime",
      "categoria": "estilo",
      "icono": "🌸",
      "titulo": "Anime / Estudio Ghibli",
      "descripcion": "Dibujo animado japonés con cielos preciosos, naturaleza detallada y colores pintados a mano.",
      "fragmento": "animación japonesa tradicional estilo Studio Ghibli con fondos pintados a mano y colores cálidos",
      "prompt": "animación japonesa tradicional estilo Studio Ghibli con fondos pintados a mano y colores cálidos",
      "etiquetas": ["animación", "arte"],
      "videos": []
    },
    {
      "id": "est-2d",
      "categoria": "estilo",
      "icono": "✏️",
      "titulo": "Caricatura 2D colorida",
      "descripcion": "Como las series de dibujos animados de la televisión, con líneas marcadas y colores alegres.",
      "fragmento": "dibujo animado 2D moderno de líneas limpias, colores planos vibrantes y animación expresiva",
      "prompt": "dibujo animado 2D moderno de líneas limpias, colores planos vibrantes y animación expresiva",
      "etiquetas": ["animación", "básico"],
      "videos": []
    },
    {
      "id": "est-papel",
      "categoria": "estilo",
      "icono": "✂️",
      "titulo": "Mundo de papel recortado",
      "descripcion": "Escenarios y personajes hechos con capas de cartulina y papel doblado.",
      "fragmento": "arte en capas de papel y cartulina recortada (papercraft diorama) con sombras suaves entre cada capa",
      "prompt": "arte en capas de papel y cartulina recortada (papercraft diorama) con sombras suaves entre cada capa",
      "etiquetas": ["arte", "manualidades"],
      "videos": []
    },
    {
      "id": "est-lego",
      "categoria": "estilo",
      "icono": "🧱",
      "titulo": "Bloques de construcción",
      "descripcion": "Todo el mundo y los personajes están construidos con bloques de plástico brillantes.",
      "fragmento": "animación hecha completamente con bloques y minifiguras de construcción de plástico brillante",
      "prompt": "animación hecha completamente con bloques y minifiguras de construcción de plástico brillante",
      "etiquetas": ["animación", "juguetes"],
      "videos": []
    },
    {
      "id": "est-pixel",
      "categoria": "estilo",
      "icono": "👾",
      "titulo": "Videojuego Retro / Voxel 3D",
      "descripcion": "Estética de videojuego clásico hecho con cubos y píxeles coloridos.",
      "fragmento": "estética de videojuego voxel 3D colorido con iluminación moderna y texturas pixeladas",
      "prompt": "estética de videojuego voxel 3D colorido con iluminación moderna y texturas pixeladas",
      "etiquetas": ["videojuegos"],
      "videos": []
    },
    {
      "id": "est-realista",
      "categoria": "estilo",
      "icono": "🎞️",
      "titulo": "Cine realista (Live Action)",
      "descripcion": "Se ve como una película real grabada con cámaras de cine de alta definición.",
      "fragmento": "imagen cinematográfica hiperrealista en 4K, iluminación natural de película y texturas reales",
      "prompt": "imagen cinematográfica hiperrealista en 4K, iluminación natural de película y texturas reales",
      "etiquetas": ["realista", "cine"],
      "videos": []
    },
    {
      "id": "est-acuarela",
      "categoria": "estilo",
      "icono": "🖌️",
      "titulo": "Cuento en acuarela",
      "descripcion": "Pintura suave en acuarela sobre papel con textura artística.",
      "fragmento": "ilustración animada en acuarela sobre papel texturizado, trazos suaves y colores pastel luminosos",
      "prompt": "ilustración animada en acuarela sobre papel texturizado, trazos suaves y colores pastel luminosos",
      "etiquetas": ["arte"],
      "videos": []
    },

    /* ===================================================================
       🧑‍🚀 PERSONAJES — Listos para insertar en cualquier escena
       =================================================================== */
    {
      "id": "per-robot",
      "categoria": "personaje",
      "icono": "🤖",
      "titulo": "Robot curioso B-Bip",
      "descripcion": "Un pequeño robot redondo plateado con ojos LED azules muy expresivos.",
      "fragmento": "un pequeño robot redondo de metal blanco y naranja, con grandes ojos digitales azules muy expresivos y dos antenitas",
      "prompt": "un pequeño robot redondo de metal blanco y naranja, con grandes ojos digitales azules muy expresivos y dos antenitas",
      "etiquetas": ["ciencia ficción", "básico"],
      "videos": []
    },
    {
      "id": "per-exploradora",
      "categoria": "personaje",
      "icono": "🧭",
      "titulo": "Valentina la exploradora",
      "descripcion": "Una niña aventurera de 11 años con mochila, linterna y lupa.",
      "fragmento": "una niña exploradora de 11 años con sombrero de aventura, mochila verde, brújula colgante y una gran sonrisa curiosa",
      "prompt": "una niña exploradora de 11 años con sombrero de aventura, mochila verde, brújula colgante y una gran sonrisa curiosa",
      "etiquetas": ["aventura", "básico"],
      "videos": []
    },
    {
      "id": "per-dragon",
      "categoria": "personaje",
      "icono": "🐉",
      "titulo": "Chispita el dragón bebé",
      "descripcion": "Un dragoncito verde esmeralda del tamaño de un perro, súper juguetón.",
      "fragmento": "un pequeño dragón amistoso de escamas color verde esmeralda, alas cortas, panza amarilla y enormes ojos brillantes",
      "prompt": "un pequeño dragón amistoso de escamas color verde esmeralda, alas cortas, panza amarilla y enormes ojos brillantes",
      "etiquetas": ["fantasía", "animales"],
      "videos": []
    },
    {
      "id": "per-gato-astro",
      "categoria": "personaje",
      "icono": "🐱",
      "titulo": "Michi Astronauta",
      "descripcion": "Un gato atigrado naranja con traje espacial blanco y casco burbuja.",
      "fragmento": "un simpático gato naranja con traje de astronauta blanco, casco transparente redondo y una insignia de estrella en el pecho",
      "prompt": "un simpático gato naranja con traje de astronauta blanco, casco transparente redondo y una insignia de estrella en el pecho",
      "etiquetas": ["espacio", "animales"],
      "videos": []
    },
    {
      "id": "per-detective",
      "categoria": "personaje",
      "icono": "🐶",
      "titulo": "Sherlock el perro detective",
      "descripcion": "Un perro beagle con gorra a cuadros, capa corta y lupa de investigador.",
      "fragmento": "un perro beagle detective con gorra de cuadros, bufanda roja y una lupa dorada en la pata",
      "prompt": "un perro beagle detective con gorra de cuadros, bufanda roja y una lupa dorada en la pata",
      "etiquetas": ["misterio", "animales"],
      "videos": []
    },
    {
      "id": "per-inventora",
      "categoria": "personaje",
      "icono": "🥽",
      "titulo": "Mateo el joven inventor",
      "descripcion": "Un niño científico con bata de laboratorio, antiparras en la frente y guantes.",
      "fragmento": "un niño inventor de 11 años con pelo rizado, antiparras de científico en la frente, bata blanca con parches de colores y guantes azules",
      "prompt": "un niño inventor de 11 años con pelo rizado, antiparras de científico en la frente, bata blanca con parches de colores y guantes azules",
      "etiquetas": ["ciencias", "colegio"],
      "videos": []
    },
    {
      "id": "per-capibara",
      "categoria": "personaje",
      "icono": "🦫",
      "titulo": "Capitán Capibara",
      "descripcion": "Un capibara súper tranquilo con chaleco de explorador y una mandarina en la cabeza.",
      "fragmento": "un capibara adorable y tranquilo con un pequeño chaleco de explorador color caqui y un pañuelo amarillo al cuello",
      "prompt": "un capibara adorable y tranquilo con un pequeño chaleco de explorador color caqui y un pañuelo amarillo al cuello",
      "etiquetas": ["animales", "humor"],
      "videos": []
    },

    /* ===================================================================
       🏞️ ESCENARIOS — Mundos y lugares
       =================================================================== */
    {
      "id": "esc-bosque",
      "categoria": "escenario",
      "icono": "🍄",
      "titulo": "Bosque bioluminiscente",
      "descripcion": "Árboles antiguos gigantes, hongos que brillan en tonos azules y luciérnagas doradas.",
      "fragmento": "un bosque mágico con árboles gigantes, hongos bioluminiscentes que brillan en azul y turquesa, rayos de sol entre las ramas y luciérnagas flotando",
      "prompt": "un bosque mágico con árboles gigantes, hongos bioluminiscentes que brillan en azul y turquesa, rayos de sol entre las ramas y luciérnagas flotando",
      "etiquetas": ["fantasía", "naturaleza"],
      "videos": []
    },
    {
      "id": "esc-ciudad-futuro",
      "categoria": "escenario",
      "icono": "🌆",
      "titulo": "Ecociudad del futuro",
      "descripcion": "Rascacielos blancos con jardines colgantes, trenes elevados y vehículos voladores.",
      "fragmento": "una ciudad del futuro luminosa y ecológica con torres curvas llenas de jardines verticales, puentes de cristal y pequeños vehículos voladores",
      "prompt": "una ciudad del futuro luminosa y ecológica con torres curvas llenas de jardines verticales, puentes de cristal y pequeños vehículos voladores",
      "etiquetas": ["ciencia ficción"],
      "videos": []
    },
    {
      "id": "esc-espacio",
      "categoria": "escenario",
      "icono": "🌕",
      "titulo": "Base en la Luna",
      "descripcion": "Cráteres plateados, domos espaciales y el planeta Tierra brillando en el cielo.",
      "fragmento": "la superficie plateada de la Luna junto a una estación espacial con domos iluminados, con el planeta Tierra azul brillando enorme en el cielo estrellado",
      "prompt": "la superficie plateada de la Luna junto a una estación espacial con domos iluminados, con el planeta Tierra azul brillando enorme en el cielo estrellado",
      "etiquetas": ["espacio", "ciencias"],
      "videos": []
    },
    {
      "id": "esc-oceano",
      "categoria": "escenario",
      "icono": "🐠",
      "titulo": "Arrecife submarino de coral",
      "descripcion": "Aguas cristalinas llenas de corales de colores, burbujas y peces tropicales.",
      "fragmento": "el fondo de un océano cristalino lleno de arrecifes de coral de colores vivos, bancos de peces tropicales, burbujas y rayos de sol atravesando el agua",
      "prompt": "el fondo de un océano cristalino lleno de arrecifes de coral de colores vivos, bancos de peces tropicales, burbujas y rayos de sol atravesando el agua",
      "etiquetas": ["naturaleza", "ciencias"],
      "videos": []
    },
    {
      "id": "esc-laboratorio",
      "categoria": "escenario",
      "icono": "🧪",
      "titulo": "Taller de inventos",
      "descripcion": "Un laboratorio colorido con tubos burbujeantes, planos, pizarras y hologramas.",
      "fragmento": "un taller de inventos lleno de engranajes, frascos con líquidos de colores brillantes, pizarras con dibujos y pantallas holográficas flotantes",
      "prompt": "un taller de inventos lleno de engranajes, frascos con líquidos de colores brillantes, pizarras con dibujos y pantallas holográficas flotantes",
      "etiquetas": ["ciencias", "colegio"],
      "videos": []
    },
    {
      "id": "esc-templo",
      "categoria": "escenario",
      "icono": "🏛️",
      "titulo": "Ruinas antiguas en la selva",
      "descripcion": "Un templo de piedra cubierto de lianas, cascadas y símbolos misteriosos.",
      "fragmento": "un antiguo templo de piedra escondido en la selva tropical, rodeado de cascadas, lianas verdes y antorchas encendidas",
      "prompt": "un antiguo templo de piedra escondido en la selva tropical, rodeado de cascadas, lianas verdes y antorchas encendidas",
      "etiquetas": ["aventura", "historia"],
      "videos": []
    },
    {
      "id": "esc-volcan",
      "categoria": "escenario",
      "icono": "🌋",
      "titulo": "Isla del volcán humeante",
      "descripcion": "Una isla tropical con palmeras, playa turquesa y un gran volcán al fondo.",
      "fragmento": "una isla tropical rodeada de mar turquesa, palmeras mecidas por el viento y un gran volcán con ríos de lava brillante al fondo",
      "prompt": "una isla tropical rodeada de mar turquesa, palmeras mecidas por el viento y un gran volcán con ríos de lava brillante al fondo",
      "etiquetas": ["naturaleza", "ciencias"],
      "videos": []
    },

    /* ===================================================================
       🔊 SONIDO Y VOCES — Ambiente, música y efectos para Flow
       =================================================================== */
    {
      "id": "aud-epico",
      "categoria": "audio",
      "icono": "🎺",
      "titulo": "Música orquestal de aventura",
      "descripcion": "Banda sonora emocionante de película con violines, tambores y trompetas.",
      "fragmento": "música orquestal épica de película de aventuras junto a sonidos reales del ambiente",
      "prompt": "música orquestal épica de película de aventuras junto a sonidos reales del ambiente",
      "etiquetas": ["música", "básico"],
      "videos": []
    },
    {
      "id": "aud-alegre",
      "categoria": "audio",
      "icono": "🎸",
      "titulo": "Música alegre y divertida",
      "descripcion": "Ritmo simpático con ukelele, palmas y silbidos para escenas graciosas.",
      "fragmento": "música acústica alegre y juguetona con ukelele, xilófono y efectos de sonido divertidos",
      "prompt": "música acústica alegre y juguetona con ukelele, xilófono y efectos de sonido divertidos",
      "etiquetas": ["música", "humor"],
      "videos": []
    },
    {
      "id": "aud-misterio",
      "categoria": "audio",
      "icono": "🕵️",
      "titulo": "Música de misterio y magia",
      "descripcion": "Melodía suave con campanitas y suspenso para descubrimientos.",
      "fragmento": "música suave de misterio con notas de piano, campanitas mágicas y atmósfera de intriga",
      "prompt": "música suave de misterio con notas de piano, campanitas mágicas y atmósfera de intriga",
      "etiquetas": ["música", "misterio"],
      "videos": []
    },
    {
      "id": "aud-naturaleza",
      "categoria": "audio",
      "icono": "🌿",
      "titulo": "Solo sonidos de la naturaleza",
      "descripcion": "Sin música: viento, pájaros, agua corriendo y pasos reales.",
      "fragmento": "sin música de fondo, únicamente sonidos ambientales realistas de la naturaleza: brisa suave, aves y pasos",
      "prompt": "sin música de fondo, únicamente sonidos ambientales realistas de la naturaleza: brisa suave, aves y pasos",
      "etiquetas": ["ambiente", "ciencias"],
      "videos": []
    },
    {
      "id": "aud-futurista",
      "categoria": "audio",
      "icono": "🛸",
      "titulo": "Sonidos espaciales y sintetizador",
      "descripcion": "Efectos electrónicos, zumbidos de energía y música espacial.",
      "fragmento": "música electrónica espacial suave con efectos de sonido futuristas de energía y tecnología",
      "prompt": "música electrónica espacial suave con efectos de sonido futuristas de energía y tecnología",
      "etiquetas": ["ciencia ficción"],
      "videos": []
    }
  ]
};
