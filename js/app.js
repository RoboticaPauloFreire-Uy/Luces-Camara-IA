/* =====================================================================
   Luces, Cámara, IA — Lógica principal del Constructor Interactivo
   Pensado para alumnos de 5° y 6° básico. Sin dependencias externas.
   ===================================================================== */
(() => {
  'use strict';

  const LS_FAVS = 'flowbib:favoritos';
  const LS_BORRADOR = 'flowbib:borrador_v2';
  const SS_PROFE = 'flowbib:profe';
  const VAR_RE = /\{([^{}\n]+)\}/g;

  // Sinónimos de nombres de variable que conectan con una categoría
  const ALIAS_CAT = {
    camara: 'camara', camera: 'camara', movimiento: 'camara', plano: 'camara', angulo: 'camara',
    estilo: 'estilo', luz: 'estilo', iluminacion: 'estilo', lente: 'estilo',
    personaje: 'personaje', protagonista: 'personaje', heroe: 'personaje',
    escenario: 'escenario', lugar: 'escenario', mundo: 'escenario', fondo: 'escenario',
    audio: 'audio', sonido: 'audio', musica: 'audio', ambiente: 'audio'
  };

  // Preguntas amigables para cada variable en el formulario
  const PREGUNTAS_AMIGABLES = {
    estilo: '🎨 ¿Con qué estilo visual quieres que se vea?',
    personaje: '🧑‍🚀 ¿Quién es el protagonista de la escena?',
    escenario: '🏞️ ¿En qué lugar o mundo ocurre todo?',
    camara: '🎥 ¿Cómo se mueve o apunta la cámara?',
    audio: '🔊 ¿Qué música o sonidos se escuchan?',
    accion: '⚡ ¿Qué hace el personaje en estos 8 segundos?',
    frase: '💬 ¿Qué frase corta dice en voz alta?',
    actitud: '😊 ¿Con qué actitud o gesto habla?',
    velocidad: '🏃 ¿A qué velocidad ocurre la escena?',
    fenomeno: '🔬 ¿Qué fenómeno se observa en detalle?',
    clima: '🌦️ ¿Cómo está el clima?',
    hora: '☀️ ¿Qué hora del día es?',
    explicacion: '🎙️ ¿Qué dice el narrador del documental?',
    objeto_inicial: '✨ ¿Qué objeto toca al principio?',
    color_magia: '🌈 ¿De qué color es la luz mágica?',
    objeto_final: '🌟 ¿En qué se transforma?',
    invento: '🛠️ ¿Cómo se llama tu invento?',
    utilidad: '💡 ¿Para qué sirve ese invento?',
    eslogan: '📢 ¿Cuál es la frase final del anuncio?',
    detalle: '🐾 ¿Qué pequeño detalle se mueve en el paisaje?',
    emocion_inicial: '😐 ¿Cómo se siente al empezar?',
    motivo: '💌 ¿Qué pasa de repente que lo cambia todo?',
    emocion_final: '🤩 ¿Cómo se siente al final?',
    direccion: '🧭 ¿Por dónde sigue la cámara al personaje?',
    estructura: '🗼 ¿Qué cosa gigante hay frente al personaje?',
    detalle_pequeno: '🔎 ¿Qué objeto diminuto vemos con súper lupa?',
    proceso: '🌱 ¿Qué cambia rápido con el paso del tiempo?',
    genero: '🍿 ¿De qué género es tu película?',
    descripcion_personaje: '🦸 ¿Cómo es el personaje que quieres diseñar?',
    expresion: '😄 ¿Qué expresión tiene en la cara?',
    tema: '🖍️ ¿Qué quieres que aparezca en el dibujo para colorear?'
  };

  // ---------- Utilidades ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const clonar = (o) => JSON.parse(JSON.stringify(o));
  const nuevoId = () => 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const azar = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const leerJSON = (store, k, def) => {
    try { const v = JSON.parse(store.getItem(k)); return v ?? def; } catch { return def; }
  };

  // ---------- Estado ----------
  const original = window.BIBLIOTECA || { categorias: [], items: [] };
  let borrador = leerJSON(localStorage, LS_BORRADOR, null);
  if (borrador && JSON.stringify(borrador) === JSON.stringify(original)) {
    localStorage.removeItem(LS_BORRADOR);
    borrador = null;
  }

  const state = {
    data: borrador || clonar(original),
    hayBorrador: !!borrador,
    favs: new Set(leerJSON(localStorage, LS_FAVS, [])),
    modo: window.PFUsuarios?.getActiveStudent?.() ? 'produccion' : 'video', // 'produccion' solo si hay alumno logueado
    subCatPieza: 'estilo',  // subcategoría activa en el catálogo de piezas
    q: '',
    tag: null,
    soloFavs: false,
    activaId: null,         // plantilla seleccionada en el Constructor
    vals: {},               // valores actuales del formulario { [key]: { itemId?, text?, otro? } }
    profe: sessionStorage.getItem(SS_PROFE) === '1'
  };

  normalizarDatos(state.data);

  function normalizarDatos(d) {
    d.categorias = Array.isArray(d.categorias) ? d.categorias : [];
    d.items = Array.isArray(d.items) ? d.items : [];
    d.items.forEach((it) => {
      it.id = it.id || nuevoId();
      it.icono = it.icono || (catById(it.categoria, d)?.emoji || '🎬');
      it.etiquetas = Array.isArray(it.etiquetas) ? it.etiquetas : [];
      it.videos = (Array.isArray(it.videos) ? it.videos : [])
        .map((v) => (typeof v === 'string' ? { url: v, titulo: '' } : v))
        .filter((v) => v && v.url);
    });
  }

  function catById(id, d = state.data) {
    return d.categorias.find((c) => c.id === id);
  }
  function itemById(id) {
    return state.data.items.find((i) => i.id === id);
  }
  function itemsDeCat(catId) {
    return state.data.items.filter((i) => i.categoria === catId);
  }
  function textoPieza(it) {
    return (it.fragmento && it.fragmento.trim()) || it.prompt;
  }

  // ---------- Diagramas animados SVG para comandos de cámara ----------
  function primerYtIdDe(item) {
    if (!item || !Array.isArray(item.videos)) return null;
    for (const v of item.videos) {
      const id = ytId(v.url || v);
      if (id) return id;
    }
    return null;
  }

  function svgCamara(anim, item = null) {
    if (!anim) return '';
    if (!item) {
      item = state.data.items.find((i) => i.categoria === 'camara' && i.anim === anim) || null;
    }
    const vidId = primerYtIdDe(item);
    const base = {
      'dolly-in': {
        badge: 'DOLLY IN · LA CÁMARA SE ACERCA',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <line x1="35" y1="45" x2="150" y2="45" stroke="#94a3b8" stroke-width="3" stroke-dasharray="6 5"/>
          <polygon points="145,38 160,45 145,52" fill="#38bdf8"/>
          <g class="anim-dolly-in"><rect x="20" y="31" width="32" height="28" rx="6" fill="#38bdf8"/><polygon points="52,37 64,31 64,59 52,53" fill="#0284c7"/></g>
          <circle cx="182" cy="45" r="18" fill="#fbbf24"/><text x="182" y="51" text-anchor="middle" font-size="20">🧑</text>
        </svg>`
      },
      'dolly-out': {
        badge: 'DOLLY OUT · LA CÁMARA SE ALEJA',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <line x1="40" y1="45" x2="150" y2="45" stroke="#94a3b8" stroke-width="3" stroke-dasharray="6 5"/>
          <polygon points="45,38 30,45 45,52" fill="#38bdf8"/>
          <g class="anim-dolly-out"><rect x="95" y="31" width="32" height="28" rx="6" fill="#38bdf8"/><polygon points="127,37 139,31 139,59 127,53" fill="#0284c7"/></g>
          <circle cx="182" cy="45" r="18" fill="#fbbf24"/><text x="182" y="51" text-anchor="middle" font-size="20">🧑</text>
        </svg>`
      },
      'orbita': {
        badge: 'ÓRBITA 360° · GIRA ALREDEDOR',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <ellipse cx="110" cy="45" rx="68" ry="32" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6 5"/>
          <circle cx="110" cy="45" r="17" fill="#fbbf24"/><text x="110" y="51" text-anchor="middle" font-size="19">🦸</text>
          <g class="anim-orbita"><circle cx="42" cy="45" r="12" fill="#38bdf8"/><text x="42" y="50" text-anchor="middle" font-size="13">🎥</text></g>
        </svg>`
      },
      'tracking': {
        badge: 'TRACKING · SIGUE AL PERSONAJE',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <line x1="20" y1="68" x2="200" y2="68" stroke="#475569" stroke-width="3" stroke-dasharray="8 6"/>
          <g class="anim-tracking">
            <rect x="26" y="30" width="30" height="24" rx="5" fill="#38bdf8"/>
            <polygon points="56,35 66,30 66,54 56,49" fill="#0284c7"/>
            <line x1="72" y1="42" x2="102" y2="42" stroke="#fbbf24" stroke-width="3" stroke-dasharray="4 4"/>
            <circle cx="122" cy="42" r="16" fill="#fbbf24"/><text x="122" y="48" text-anchor="middle" font-size="18">🏃</text>
          </g>
        </svg>`
      },
      'truck': {
        badge: 'TRAVELLING · SE DESLIZA DE LADO',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <line x1="25" y1="74" x2="195" y2="74" stroke="#38bdf8" stroke-width="4"/>
          <circle cx="110" cy="24" r="14" fill="#fbbf24"/><text x="110" y="29" text-anchor="middle" font-size="16">🧑</text>
          <g class="anim-truck">
            <rect x="55" y="48" width="32" height="22" rx="5" fill="#38bdf8"/>
            <polygon points="65,48 71,38 77,48" fill="#0284c7"/>
          </g>
        </svg>`
      },
      'pan': {
        badge: 'PANEO · GIRA SIN MOVERSE',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <g class="anim-pan" style="transform-origin:45px 45px">
            <polygon points="45,45 175,14 175,76" fill="rgba(56,189,248,0.22)" stroke="#38bdf8" stroke-width="2"/>
          </g>
          <circle cx="45" cy="45" r="14" fill="#38bdf8"/><text x="45" y="50" text-anchor="middle" font-size="14">🎥</text>
          <text x="185" y="32" font-size="18">🌲</text><text x="185" y="68" font-size="18">🏰</text>
        </svg>`
      },
      'tilt': {
        badge: 'TILT UP · MIRA DE ABAJO ARRIBA',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <rect x="155" y="10" width="28" height="72" rx="4" fill="#fbbf24"/>
          <text x="169" y="32" text-anchor="middle" font-size="16">🗼</text>
          <g class="anim-tilt" style="transform-origin:55px 65px">
            <polygon points="55,65 150,25 150,65" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" stroke-width="2"/>
          </g>
          <circle cx="55" cy="65" r="13" fill="#38bdf8"/><text x="55" y="70" text-anchor="middle" font-size="13">🎥</text>
        </svg>`
      },
      'dron': {
        badge: 'DRON AÉREO · VISTA DESDE EL CIELO',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <path d="M15,78 Q65,52 115,74 T205,66 L205,86 L15,86 Z" fill="#22c55e" opacity="0.5"/>
          <g class="anim-dron">
            <polygon points="85,26 60,75 130,75" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" stroke-dasharray="4 3"/>
            <rect x="70" y="12" width="30" height="16" rx="8" fill="#38bdf8"/>
            <text x="85" y="24" text-anchor="middle" font-size="13">🚁</text>
          </g>
        </svg>`
      },
      'grua': {
        badge: 'GRÚA · SUBE DESDE EL SUELO AL CIELO',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <line x1="55" y1="74" x2="55" y2="16" stroke="#38bdf8" stroke-width="3" stroke-dasharray="5 4"/>
          <polygon points="48,22 55,10 62,22" fill="#38bdf8"/>
          <g class="anim-grua"><rect x="40" y="54" width="30" height="20" rx="5" fill="#38bdf8"/></g>
          <circle cx="165" cy="62" r="16" fill="#fbbf24"/><text x="165" y="68" text-anchor="middle" font-size="18">🧑</text>
        </svg>`
      },
      'fpv': {
        badge: 'DRON FPV · VUELO VELOZ CON GIROS',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <path d="M20,65 C70,10 140,80 198,25" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6 4"/>
          <text x="85" y="68" font-size="20">🌲</text><text x="140" y="34" font-size="20">🌲</text>
          <g class="anim-truck"><circle cx="60" cy="45" r="13" fill="#f43f5e"/><text x="60" y="50" text-anchor="middle" font-size="14">🦅</text></g>
        </svg>`
      },
      'low-angle': {
        badge: 'CONTRAPICADO · DESDE ABAJO (HEROICO)',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <polygon points="60,74 145,12 175,58" fill="rgba(56,189,248,0.22)" stroke="#38bdf8" stroke-width="2"/>
          <circle cx="55" cy="74" r="12" fill="#38bdf8"/><text x="55" y="79" text-anchor="middle" font-size="13">🎥</text>
          <circle cx="158" cy="30" r="20" fill="#fbbf24"/><text x="158" y="37" text-anchor="middle" font-size="22">🦸</text>
        </svg>`
      },
      'high-angle': {
        badge: 'PICADO · DESDE ARRIBA HACIA ABAJO',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <polygon points="60,18 170,52 140,78" fill="rgba(56,189,248,0.22)" stroke="#38bdf8" stroke-width="2"/>
          <circle cx="55" cy="18" r="12" fill="#38bdf8"/><text x="55" y="23" text-anchor="middle" font-size="13">🎥</text>
          <circle cx="158" cy="66" r="14" fill="#fbbf24"/><text x="158" y="71" text-anchor="middle" font-size="15">🧑</text>
        </svg>`
      },
      'pov': {
        badge: 'POV · VEMOS CON LOS OJOS DEL PERSONAJE',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <rect x="35" y="12" width="150" height="66" rx="12" fill="none" stroke="#38bdf8" stroke-width="3"/>
          <text x="68" y="72" font-size="24">🤚</text><text x="135" y="72" font-size="24">✋</text>
          <text x="110" y="44" text-anchor="middle" font-size="20">🗺️</text>
        </svg>`
      },
      'close-up': {
        badge: 'PRIMER PLANO · ROSTRO DE CERCA',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <rect x="55" y="10" width="110" height="70" rx="10" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6 4"/>
          <circle cx="110" cy="46" r="26" fill="#fbbf24"/><text x="110" y="56" text-anchor="middle" font-size="30">😊</text>
        </svg>`
      },
      'wide': {
        badge: 'PLANO GENERAL · TODO EL PAISAJE',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <rect x="20" y="10" width="180" height="70" rx="8" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2.5"/>
          <text x="52" y="45" font-size="22">🏔️</text><text x="155" y="42" font-size="20">🌲</text>
          <text x="108" y="68" font-size="14">🧑</text>
        </svg>`
      },
      'macro': {
        badge: 'PLANO DETALLE MACRO · SÚPER LUPA',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <circle cx="110" cy="45" r="32" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" stroke-width="4"/>
          <text x="110" y="55" text-anchor="middle" font-size="30">🐞</text>
        </svg>`
      },
      'static': {
        badge: 'CÁMARA FIJA · SOBRE TRÍPODE INMÓVIL',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <rect x="45" y="25" width="32" height="22" rx="5" fill="#38bdf8"/>
          <line x1="61" y1="47" x2="48" y2="76" stroke="#94a3b8" stroke-width="3"/>
          <line x1="61" y1="47" x2="61" y2="76" stroke="#94a3b8" stroke-width="3"/>
          <line x1="61" y1="47" x2="74" y2="76" stroke="#94a3b8" stroke-width="3"/>
          <g class="anim-tracking"><circle cx="145" cy="45" r="17" fill="#fbbf24"/><text x="145" y="51" text-anchor="middle" font-size="19">🤸</text></g>
        </svg>`
      },
      'handheld': {
        badge: 'CÁMARA EN MANO · PULSO REALISTA',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <g class="anim-handheld">
            <rect x="55" y="16" width="110" height="58" rx="10" fill="rgba(56,189,248,0.18)" stroke="#38bdf8" stroke-width="3"/>
            <text x="110" y="53" text-anchor="middle" font-size="24">🏃💨</text>
          </g>
        </svg>`
      },
      'slowmo': {
        badge: 'SLOW MOTION · CÁMARA SÚPER LENTA',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <text x="65" y="54" font-size="24">💧</text>
          <text x="110" y="56" text-anchor="middle" font-size="28">🐢</text>
          <text x="150" y="54" font-size="24">✨</text>
        </svg>`
      },
      'timelapse': {
        badge: 'TIME-LAPSE · EL TIEMPO PASA RÁPIDO',
        svg: `<svg viewBox="0 0 220 90" class="cam-svg">
          <path d="M35,70 A75,55 0 0,1 185,70" fill="none" stroke="#fbbf24" stroke-width="3" stroke-dasharray="5 4"/>
          <g class="anim-truck"><text x="70" y="34" font-size="22">☀️</text><text x="135" y="34" font-size="22">🌙</text></g>
        </svg>`
      }
    }[anim];

    if (!base) return '';
    return `<div class="diagrama-camara ${vidId ? 'diagrama-camara--con-video' : ''}" ${vidId ? `data-hover-yt="${esc(vidId)}"` : ''}>
      <div class="diagrama-camara__top">
        <div class="diagrama-camara__badge">🎥 ${esc(base.badge)}</div>
        ${vidId ? `<span class="diagrama-camara__hint">🖱️ Pasa el mouse para ver el video de ejemplo</span>` : ''}
      </div>
      <div class="diagrama-camara__visor">
        ${base.svg}
        ${vidId ? `<div class="diagrama-camara__yt-slot"></div>` : ''}
      </div>
    </div>`;
  }

  // ---------- Parseo de variables del prompt ----------
  /**
   * Formatos soportados:
   *  - {camara} → selector de categoría "camara"
   *  - {clima|soleado|lluvioso|nevado} → botones de opción rápida
   *  - {accion:encuentra un cofre brillante} → texto con valor sugerido por defecto
   */
  function parseVars(texto) {
    const out = [];
    const vistos = new Set();
    for (const m of String(texto).matchAll(VAR_RE)) {
      const raw = m[1].trim();
      let nombre = raw;
      let opts = [];
      let sugerencia = '';

      if (raw.includes('|')) {
        const partes = raw.split('|').map((s) => s.trim()).filter(Boolean);
        nombre = partes[0];
        opts = partes.slice(1);
      } else if (raw.includes(':')) {
        const idx = raw.indexOf(':');
        nombre = raw.slice(0, idx).trim();
        sugerencia = raw.slice(idx + 1).trim();
      }

      const key = norm(nombre);
      if (!key || vistos.has(key)) continue;
      vistos.add(key);

      const catKey = !opts.length && !sugerencia ? ALIAS_CAT[key.replace(/[\s_-]*\d+$/, '')] : null;
      const cat = catKey && itemsDeCat(catKey).length ? catKey : null;

      out.push({ key, label: nombre, opts, sugerencia, cat });
    }
    return out;
  }

  function inicializarValoresPorDefecto(item) {
    const vals = {};
    for (const v of parseVars(item.prompt)) {
      if (v.cat) {
        const primero = itemsDeCat(v.cat)[0];
        if (primero) vals[v.key] = { itemId: primero.id };
      } else if (v.opts.length) {
        vals[v.key] = { text: v.opts[0] };
      } else if (v.sugerencia) {
        vals[v.key] = { text: v.sugerencia };
      } else {
        vals[v.key] = { text: '' };
      }
    }
    return vals;
  }

  function rellenarValoresAlAzar(item) {
    const vals = {};
    for (const v of parseVars(item.prompt)) {
      if (v.cat) {
        const elegida = azar(itemsDeCat(v.cat));
        if (elegida) vals[v.key] = { itemId: elegida.id };
      } else if (v.opts.length) {
        vals[v.key] = { text: azar(v.opts) };
      } else {
        vals[v.key] = { text: v.sugerencia || (state.vals[v.key]?.text ?? '') };
      }
    }
    return vals;
  }

  function construirPromptFinal(texto, vals) {
    let html = '';
    let plano = '';
    let ultimo = 0;
    const faltan = [];

    for (const m of String(texto).matchAll(VAR_RE)) {
      const antes = texto.slice(ultimo, m.index);
      html += esc(antes);
      plano += antes;
      ultimo = m.index + m[0].length;

      const raw = m[1].trim();
      const nombre = raw.split(/[|:]/)[0].trim();
      const key = norm(nombre);
      const val = vals[key] || {};

      let valorTexto = '';
      let colorChip = '#4c6ef5';

      if (val.itemId) {
        const it = itemById(val.itemId);
        if (it) {
          valorTexto = textoPieza(it);
          colorChip = catById(it.categoria)?.color || '#4c6ef5';
        }
      } else if (val.text && val.text.trim()) {
        valorTexto = val.text.trim();
      }

      if (valorTexto) {
        html += `<mark class="var-llena" style="--vc:${esc(colorChip)}">${esc(valorTexto)}</mark>`;
        plano += valorTexto;
      } else {
        html += `<mark class="var-vacia">[${esc(etiquetaBonita(nombre))}]</mark>`;
        plano += `{${nombre}}`;
        faltan.push(etiquetaBonita(nombre));
      }
    }

    const resto = texto.slice(ultimo);
    html += esc(resto);
    plano += resto;
    return { html, plano, faltan };
  }

  function etiquetaBonita(s) {
    const t = String(s).replace(/[_-]+/g, ' ').trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function preguntaParaCampo(v) {
    return PREGUNTAS_AMIGABLES[v.key] || `✏️ ${etiquetaBonita(v.label)}`;
  }

  // ---------- YouTube ----------
  function ytId(url) {
    const m = String(url).match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  function renderVideos(item) {
    const cont = $('#contenedor-videos');
    let listaVideos = item.videos && item.videos.length ? [...item.videos] : [];
    // Si la plantilla no tiene video propio pero el alumno eligió una cámara con video, mostrar también ese ejemplo
    if (!listaVideos.length && state.vals.camara?.itemId) {
      const camItem = itemById(state.vals.camara.itemId);
      if (camItem && camItem.videos && camItem.videos.length) {
        listaVideos = camItem.videos;
      }
    }
    if (!listaVideos.length) {
      cont.innerHTML = `
        <div class="tv-vacio">
          <div class="tv-vacio__icono">📼</div>
          <p><b>Aún no hay video de ejemplo en YouTube para esta plantilla.</b></p>
          <p class="tv-vacio__sub">Cuando el profe suba un resultado hecho en Flow a YouTube, ¡aparecerá aquí mismo para que puedas reproducirlo!</p>
        </div>`;
      return;
    }

    cont.innerHTML = listaVideos.map((v) => {
      const id = ytId(v.url);
      const tit = v.titulo ? `<div class="yt-card__titulo">🎬 ${esc(v.titulo)}</div>` : '';
      if (!id) {
        return `<div class="yt-card">${tit}<a class="btn3d btn3d--sm btn3d--blanco" href="${esc(v.url)}" target="_blank" rel="noopener">Abrir video ↗</a></div>`;
      }
      return `
        <div class="yt-card">
          <div class="yt-thumb" data-hover-yt="${esc(id)}" data-yt="${esc(id)}" role="button" tabindex="0" aria-label="Reproducir ejemplo de YouTube">
            <img src="https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg" alt="" loading="lazy">
            <span class="yt-play">🖱️ Pasa el mouse o haz clic para ver ▶</span>
            <div class="diagrama-camara__yt-slot"></div>
          </div>
          ${tit}
          <a class="yt-ext" href="https://www.youtube.com/watch?v=${esc(id)}" target="_blank" rel="noopener">Ver en YouTube ↗</a>
        </div>`;
    }).join('');
  }

  // ---------- Render del Estudio ----------
  function plantillasDelModoActual() {
    const cat = state.modo === 'camara' ? 'camara' : state.modo === 'imagen' ? 'imagen' : 'video';
    const q = norm(state.q);
    return state.data.items.filter((it) => {
      if (it.categoria !== cat) return false;
      if (state.soloFavs && !state.favs.has(it.id)) return false;
      if (state.tag && !it.etiquetas.some((t) => norm(t) === state.tag)) return false;
      if (q) {
        const txt = norm([it.titulo, it.comando, it.descripcion, it.prompt, it.etiquetas.join(' ')].join(' '));
        return q.split(/\s+/).every((p) => txt.includes(p));
      }
      return true;
    });
  }

  function asegurarPlantillaActiva() {
    const lista = plantillasDelModoActual();
    if (!lista.length) return;
    if (!state.activaId || !lista.some((i) => i.id === state.activaId)) {
      seleccionarPlantilla(lista[0].id, false);
    }
  }

  function seleccionarPlantilla(id, hacerScroll = false) {
    const it = itemById(id);
    if (!it) return;
    state.activaId = id;
    state.vals = inicializarValoresPorDefecto(it);
    renderListaPlantillas();
    renderConstructor();
    if (hacerScroll && window.innerWidth < 980) {
      $('.panel--formulario').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderTabsModo() {
    const alumnoActivo = !!window.PFUsuarios?.getActiveStudent?.();
    const tabPeli = $('#tab-mi-pelicula');
    if (tabPeli) tabPeli.hidden = !alumnoActivo;
    if (!alumnoActivo && state.modo === 'produccion') {
      state.modo = 'video';
    }

    $$('#tabs-modo .tab-modo').forEach((b) => {
      b.classList.toggle('activa', b.dataset.modo === state.modo);
    });
    const esProd = state.modo === 'produccion';
    const esPiezas = state.modo === 'piezas';
    $('#vista-produccion').hidden = !esProd;
    $('#vista-estudio').hidden = esProd || esPiezas;
    $('#vista-piezas').hidden = !esPiezas;

    const titulosPaso1 = {
      video: 'Elige una historia de video',
      camara: 'Elige un comando de cámara',
      imagen: 'Elige qué imagen crear'
    };
    $('#titulo-paso1').textContent = titulosPaso1[state.modo] || 'Elige tu plantilla';
  }

  function renderEtiquetasPlantillas() {
    const cat = state.modo === 'camara' ? 'camara' : state.modo === 'imagen' ? 'imagen' : 'video';
    const base = itemsDeCat(cat);
    const cuenta = new Map();
    base.forEach((i) => i.etiquetas.forEach((t) => {
      const k = norm(t);
      if (k) cuenta.set(k, (cuenta.get(k) || { label: t, n: 0 }));
    }));
    if (state.tag && !cuenta.has(state.tag)) state.tag = null;
    const chips = [...cuenta.entries()];
    $('#etiquetas-plantillas').innerHTML = chips.map(([k, v]) =>
      `<button class="chip-filtro ${state.tag === k ? 'activa' : ''}" data-tag="${esc(k)}">#${esc(v.label)}</button>`
    ).join('');
  }

  function renderListaPlantillas() {
    const lista = plantillasDelModoActual();
    const cont = $('#lista-plantillas');
    if (!lista.length) {
      cont.innerHTML = `<div class="vacio-lista">
        <p>${state.soloFavs ? '⭐ Aún no marcaste favoritos en esta sección.' : '🔍 No hay plantillas con ese filtro.'}</p>
      </div>`;
      return;
    }

    cont.innerHTML = lista.map((it) => {
      const activa = it.id === state.activaId;
      const fav = state.favs.has(it.id);
      const cat = catById(it.categoria);
      return `
        <div class="item-plantilla ${activa ? 'activa' : ''}" data-id="${esc(it.id)}" role="option" aria-selected="${activa}" tabindex="0" style="--c:${esc(cat?.color || '#ff595e')}">
          <span class="item-plantilla__icono">${esc(it.icono || '🎬')}</span>
          <div class="item-plantilla__info">
            ${it.comando ? `<span class="item-plantilla__cmd">${esc(it.comando)}</span>` : ''}
            <strong>${esc(it.titulo)}</strong>
            <small>${esc(it.descripcion)}</small>
            <div class="item-plantilla__meta">
              ${it.videos.length ? `<span class="badge-mini badge-mini--yt">▶️ ${it.videos.length} video${it.videos.length > 1 ? 's' : ''}</span>` : ''}
              ${it.etiquetas.slice(0, 2).map((t) => `<span class="badge-mini">#${esc(t)}</span>`).join('')}
            </div>
          </div>
          <button type="button" class="btn-estrella ${fav ? 'on' : ''}" data-fav="${esc(it.id)}" title="Guardar en favoritos" aria-label="Favorito">${fav ? '★' : '☆'}</button>
        </div>`;
    }).join('');
  }

  function renderConstructor() {
    const item = itemById(state.activaId);
    if (!item) return;

    const cat = catById(item.categoria);
    const fav = state.favs.has(item.id);

    // 1. Cabecera / ficha de la plantilla activa + diagrama animado si es cámara
    $('#ficha-plantilla').style.setProperty('--c', cat?.color || '#ff595e');
    $('#ficha-plantilla').innerHTML = `
      <div class="ficha-plantilla__top">
        <div class="ficha-plantilla__titular">
          <span class="ficha-plantilla__icono">${esc(item.icono || '🎬')}</span>
          <div>
            <span class="ficha-plantilla__badge">${esc(cat?.emoji || '')} ${esc(item.comando || cat?.nombre || '')}</span>
            <h2>${esc(item.titulo)}</h2>
          </div>
        </div>
        <div class="ficha-plantilla__acciones">
          <button type="button" class="btn-estrella btn-estrella--lg ${fav ? 'on' : ''}" data-fav="${esc(item.id)}" title="Favorito">${fav ? '★' : '☆'}</button>
          <button type="button" class="btn3d btn3d--sm btn3d--blanco solo-profe" data-editar="${esc(item.id)}">✏️ Editar</button>
          <button type="button" class="btn3d btn3d--sm btn3d--blanco solo-profe" data-duplicar="${esc(item.id)}">📄 Duplicar</button>
          <button type="button" class="btn3d btn3d--sm btn3d--rojo solo-profe" data-eliminar="${esc(item.id)}">🗑️</button>
        </div>
      </div>
      <p class="ficha-plantilla__desc">${esc(item.descripcion)}</p>
      ${svgCamara(item.anim)}
    `;

    // 2. Formulario interactivo de variables
    renderFormularioVariables(item);

    // 3. Vista previa y videos
    actualizarVistaPrevia();
    renderVideos(item);
  }

  function renderFormularioVariables(item) {
    const vars = parseVars(item.prompt);
    const cont = $('#contenedor-formulario');

    if (!vars.length) {
      cont.innerHTML = `<div class="sin-variables-box">✅ Esta plantilla ya está completa y lista para copiar tal cual.</div>`;
      return;
    }

    cont.innerHTML = vars.map((v, idx) => {
      const val = state.vals[v.key] || {};
      const pregunta = preguntaParaCampo(v);

      // CASO A: Variable conectada a una categoría de la biblioteca ({camara}, {personaje}, etc.)
      if (v.cat) {
        const cat = catById(v.cat);
        const opciones = itemsDeCat(v.cat);
        const selItem = val.itemId ? itemById(val.itemId) : null;

        return `
          <div class="bloque-var" style="--vc:${esc(cat?.color || '#4c6ef5')}">
            <div class="bloque-var__cab">
              <span class="bloque-var__num">${idx + 1}</span>
              <label class="bloque-var__pregunta">${esc(pregunta)}</label>
              <button type="button" class="btn-galeria" data-abrir-selector="${esc(v.key)}" data-cat="${esc(v.cat)}">
                🖼️ Ver tarjetas (${opciones.length})
              </button>
            </div>

            <div class="selector-bar">
              <select class="select-grande" data-key="${esc(v.key)}" data-tipo="biblio" aria-label="${esc(pregunta)}">
                ${opciones.map((op) => `<option value="${esc(op.id)}" ${val.itemId === op.id ? 'selected' : ''}>${esc(op.icono || cat.emoji)} ${esc(op.titulo)}</option>`).join('')}
                <option value="__otro__" ${val.otro ? 'selected' : ''}>✏️ Escribir mi propia idea…</option>
              </select>
            </div>

            ${val.otro ? `
              <input type="text" class="input-grande" data-key="${esc(v.key)}" data-tipo="texto" value="${esc(val.text || '')}" placeholder="Escribe aquí tu propia versión…">
            ` : selItem ? `
              <div class="pista-seleccion">
                <span class="pista-seleccion__icono">${esc(selItem.icono || cat.emoji)}</span>
                <div>
                  <strong>${esc(selItem.titulo)}</strong>
                  <p>${esc(selItem.descripcion)}</p>
                </div>
              </div>
              ${selItem.anim ? svgCamara(selItem.anim) : ''}
            ` : ''}
          </div>`;
      }

      // CASO B: Opciones rápidas definidas con | ({clima|soleado|lluvioso})
      if (v.opts.length) {
        return `
          <div class="bloque-var" style="--vc:#f59f00">
            <div class="bloque-var__cab">
              <span class="bloque-var__num">${idx + 1}</span>
              <label class="bloque-var__pregunta">${esc(pregunta)}</label>
            </div>
            <div class="opciones-pills" role="radiogroup" aria-label="${esc(pregunta)}">
              ${v.opts.map((op) => `
                <button type="button" class="pill-opcion ${val.text === op ? 'activa' : ''}" data-key="${esc(v.key)}" data-valor="${esc(op)}">
                  ${esc(etiquetaBonita(op))}
                </button>
              `).join('')}
            </div>
            <input type="text" class="input-grande input-grande--compacto" data-key="${esc(v.key)}" data-tipo="texto" value="${esc(val.text || '')}" placeholder="O escribe otra opción aquí…">
          </div>`;
      }

      // CASO C: Campo de texto libre con sugerencia
      return `
        <div class="bloque-var" style="--vc:#ff595e">
          <div class="bloque-var__cab">
            <span class="bloque-var__num">${idx + 1}</span>
            <label class="bloque-var__pregunta">${esc(pregunta)}</label>
            ${v.sugerencia ? `<button type="button" class="btn-ejemplo" data-key="${esc(v.key)}" data-ejemplo="${esc(v.sugerencia)}">💡 Usar ejemplo</button>` : ''}
          </div>
          <input type="text" class="input-grande" data-key="${esc(v.key)}" data-tipo="texto" value="${esc(val.text || '')}" placeholder="${esc(v.sugerencia ? 'Ej: ' + v.sugerencia : 'Escribe tu idea aquí…')}">
        </div>`;
    }).join('');
  }

  function actualizarVistaPrevia() {
    const item = itemById(state.activaId);
    if (!item) return;
    const res = construirPromptFinal(item.prompt, state.vals);
    state.promptListo = res.plano;
    $('#vista-previa').innerHTML = res.html;
    renderVideos(item);

    const est = $('#estado-prompt');
    if (res.faltan.length) {
      est.textContent = `⚠️ Falta: ${res.faltan.join(', ')}`;
      est.className = 'estado-prompt estado-prompt--falta';
    } else {
      est.textContent = '✅ ¡Listo para copiar!';
      est.className = 'estado-prompt estado-prompt--ok';
    }
  }

  // ---------- Modal selector visual de tarjetas (Cámara, Personaje, etc.) ----------
  let selectorContexto = null; // { key, cat }

  function abrirSelectorVisual(key, catId) {
    const cat = catById(catId);
    const items = itemsDeCat(catId);
    selectorContexto = { key, catId };

    $('#selector-titulo').textContent = `${cat?.emoji || '🧩'} Elige ${cat?.nombre || 'una opción'}`;
    $('#selector-sub').textContent = 'Haz clic en la tarjeta que más te guste para usarla en tu escena:';

    const actualId = state.vals[key]?.itemId;
    $('#selector-grilla').innerHTML = items.map((it) => `
      <button type="button" class="card-pieza-sel ${it.id === actualId ? 'activa' : ''}" data-elegir-pieza="${esc(it.id)}" style="--c:${esc(cat?.color || '#4c6ef5')}">
        <div class="card-pieza-sel__top">
          <span class="card-pieza-sel__icono">${esc(it.icono || cat?.emoji || '✨')}</span>
          <div>
            ${it.comando ? `<span class="card-pieza-sel__cmd">${esc(it.comando)}</span>` : ''}
            <strong>${esc(it.titulo)}</strong>
          </div>
        </div>
        <p>${esc(it.descripcion)}</p>
        ${it.anim ? svgCamara(it.anim) : ''}
      </button>
    `).join('');

    $('#dlg-selector').showModal();
  }

  // ---------- Vista 2: Catálogo de Piezas ----------
  function renderCatalogoPiezas() {
    const catsPiezas = state.data.categorias.filter((c) => ['estilo', 'personaje', 'escenario', 'audio', 'camara'].includes(c.id));
    $('#subtabs-piezas').innerHTML = catsPiezas.map((c) => `
      <button type="button" class="btn3d btn3d--sm ${state.subCatPieza === c.id ? 'btn3d--activo' : 'btn3d--blanco'}" data-subcat="${esc(c.id)}" style="--c:${esc(c.color)}">
        ${esc(c.emoji)} ${esc(c.nombre)} (${itemsDeCat(c.id).length})
      </button>
    `).join('');

    const cat = catById(state.subCatPieza) || catsPiezas[0];
    const items = itemsDeCat(cat.id);
    $('#grilla-piezas').innerHTML = items.map((it) => `
      <article class="card-catalogo" style="--c:${esc(cat.color)}">
        <div class="card-catalogo__top">
          <span class="card-catalogo__icono">${esc(it.icono || cat.emoji)}</span>
          <div>
            <span class="badge-mini">${esc(cat.emoji)} ${esc(cat.nombre)}</span>
            <h3>${esc(it.titulo)}</h3>
          </div>
        </div>
        <p class="card-catalogo__desc">${esc(it.descripcion)}</p>
        ${it.anim ? svgCamara(it.anim) : ''}
        <div class="card-catalogo__fragmento">
          <small>Texto que agrega al prompt:</small>
          <code>${esc(textoPieza(it))}</code>
        </div>
        <div class="card-catalogo__pie">
          <button type="button" class="btn3d btn3d--sm btn3d--verde" data-copiar-texto="${esc(textoPieza(it))}">📋 Copiar texto</button>
          <button type="button" class="btn3d btn3d--sm btn3d--blanco solo-profe" data-editar="${esc(it.id)}">✏️ Editar</button>
          <button type="button" class="btn3d btn3d--sm btn3d--rojo solo-profe" data-eliminar="${esc(it.id)}">🗑️</button>
        </div>
      </article>
    `).join('');
  }

  let moduloProduccion = null;

  function renderTodo() {
    document.title = `${state.data.titulo || 'Luces, Cámara, IA'} 🎬 — Crea tus películas con Google Flow`;
    $('#titulo-app').textContent = state.data.titulo || 'Luces, Cámara, IA';
    $('#subtitulo-app').textContent = state.data.subtitulo || '';
    $('#aviso-borrador').hidden = !state.hayBorrador;
    $('#barra-profe').hidden = !state.profe;
    document.body.classList.toggle('es-profe', state.profe);
    $('#btn-solo-favs').setAttribute('aria-pressed', String(state.soloFavs));

    renderTabsModo();
    if (state.modo === 'produccion') {
      if (moduloProduccion) moduloProduccion.render();
    } else if (state.modo === 'piezas') {
      renderCatalogoPiezas();
    } else {
      asegurarPlantillaActiva();
      renderEtiquetasPlantillas();
      renderListaPlantillas();
      renderConstructor();
    }
  }

  // ---------- Favoritos y Portapapeles ----------
  function alternarFav(id) {
    if (state.favs.has(id)) state.favs.delete(id); else state.favs.add(id);
    localStorage.setItem(LS_FAVS, JSON.stringify([...state.favs]));
    renderListaPlantillas();
    renderConstructor();
    toast(state.favs.has(id) ? '⭐ Guardado en tus favoritos' : 'Quitado de favoritos');
  }

  async function copiarAlPortapapeles(texto) {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = texto;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('visible'), 2500);
  }

  // ---------- Modo Profe y Editor ----------
  function entrarProfe() {
    if (state.profe) return;
    const pin = String(state.data.pin || original.pin || '1234');
    const r = prompt('👩‍🏫 Ingresa la clave del Modo Profe:');
    if (r === null) return;
    if (r.trim() !== pin) { toast('❌ Clave incorrecta'); return; }
    state.profe = true;
    sessionStorage.setItem(SS_PROFE, '1');
    renderTodo();
    toast('👩‍🏫 ¡Modo Profe activado!');
  }

  function salirProfe() {
    state.profe = false;
    sessionStorage.removeItem(SS_PROFE);
    renderTodo();
  }

  function guardarBorrador() {
    localStorage.setItem(LS_BORRADOR, JSON.stringify(state.data));
    state.hayBorrador = true;
    renderTodo();
  }

  let editandoId = null;
  function abrirEditor(id = null, base = null) {
    editandoId = id;
    const catDefault = state.modo === 'piezas' ? state.subCatPieza : state.modo;
    const it = id ? itemById(id) : (base || {
      categoria: catDefault,
      icono: '🎬',
      titulo: '',
      comando: '',
      descripcion: '',
      prompt: 'Video en estilo {estilo}. En {escenario}, vemos a {personaje} mientras {accion:saluda a la cámara}. Movimiento de cámara: {camara}. Audio: {audio}.',
      fragmento: '',
      anim: '',
      etiquetas: [],
      videos: []
    });

    const f = $('#form-editor');
    $('#editor-titulo').textContent = id ? '✏️ Editar elemento' : '➕ Nueva plantilla o pieza';
    f.categoria.innerHTML = state.data.categorias.map((c) =>
      `<option value="${esc(c.id)}">${esc(c.emoji)} ${esc(c.nombre)}</option>`
    ).join('');
    f.categoria.value = it.categoria || 'video';
    f.icono.value = it.icono || '🎬';
    f.titulo.value = it.titulo || '';
    f.comando.value = it.comando || '';
    f.descripcion.value = it.descripcion || '';
    f.prompt.value = it.prompt || '';
    f.fragmento.value = it.fragmento || '';
    f.anim.value = it.anim || '';
    f.etiquetas.value = (it.etiquetas || []).join(', ');
    f.videos.value = (it.videos || []).map((v) => (v.titulo ? `${v.url} | ${v.titulo}` : v.url)).join('\n');

    pintarVarsDetectadasEditor();
    $('#dlg-editor').showModal();
  }

  function pintarVarsDetectadasEditor() {
    const vars = parseVars($('#form-editor').prompt.value);
    $('#editor-vars-detectadas').innerHTML = vars.length
      ? 'Variables que rellenará el alumno: ' + vars.map((v) =>
          `<span class="badge-mini badge-mini--var">{${esc(v.label)}} → ${v.cat ? 'lista de ' + v.cat : v.opts.length ? 'opciones rápidas' : 'texto libre'}</span>`
        ).join(' ')
      : '<small>Sin variables (texto fijo).</small>';
  }

  function guardarEditor(e) {
    e.preventDefault();
    const f = e.target;
    const datos = {
      categoria: f.categoria.value,
      icono: f.icono.value.trim() || '🎬',
      titulo: f.titulo.value.trim(),
      comando: f.comando.value.trim(),
      descripcion: f.descripcion.value.trim(),
      prompt: f.prompt.value.trim(),
      fragmento: f.fragmento.value.trim(),
      anim: f.anim.value,
      etiquetas: f.etiquetas.value.split(',').map((s) => s.trim()).filter(Boolean),
      videos: f.videos.value.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const [url, ...t] = l.split('|');
        return { url: url.trim(), titulo: t.join('|').trim() };
      })
    };
    if (!datos.titulo || !datos.prompt) return;

    let id = editandoId;
    if (id) {
      Object.assign(itemById(id), datos);
    } else {
      id = nuevoId();
      state.data.items.unshift({ id, ...datos });
    }
    $('#dlg-editor').close();
    state.activaId = id;
    state.vals = inicializarValoresPorDefecto(itemById(id));
    guardarBorrador();
    toast('💾 ¡Guardado! Recuerda exportar biblioteca.js al terminar');
  }

  function eliminarItem(id) {
    const it = itemById(id);
    if (!it || !confirm(`¿Seguro que quieres eliminar "${it.titulo}"?`)) return;
    state.data.items = state.data.items.filter((i) => i.id !== id);
    if (state.activaId === id) state.activaId = null;
    guardarBorrador();
    toast('🗑️ Eliminado');
  }

  function exportarBiblioteca() {
    const fecha = new Date().toLocaleString('es');
    const contenido =
`/* =====================================================================
   LUCES, CÁMARA, IA — BIBLIOTECA DE PROMPTS PARA FLOW
   Exportado desde el Modo Profe el ${fecha}.
   Sube este archivo a tu repositorio de GitHub para actualizar la web.
   ===================================================================== */
window.BIBLIOTECA = ${JSON.stringify(state.data, null, 2)};
`;
    const blob = new Blob([contenido], { type: 'text/javascript;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'biblioteca.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('💾 Descargado biblioteca.js — Súbelo a tu GitHub');
  }

  function importarBiblioteca(archivo) {
    const r = new FileReader();
    r.onload = () => {
      try {
        let txt = String(r.result);
        const pos = txt.indexOf('window.BIBLIOTECA');
        if (pos >= 0) txt = txt.slice(pos);
        const datos = JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
        if (!Array.isArray(datos.items)) throw new Error('invalido');
        normalizarDatos(datos);
        state.data = datos;
        state.activaId = null;
        guardarBorrador();
        toast('📂 Biblioteca importada con éxito');
      } catch {
        alert('No se pudo leer el archivo. Asegúrate de elegir un biblioteca.js válido.');
      }
    };
    r.readAsText(archivo);
  }

  // ---------- Eventos ----------
  $('#tabs-modo').addEventListener('click', (e) => {
    const b = e.target.closest('[data-modo]');
    if (!b) return;
    state.modo = b.dataset.modo;
    state.tag = null;
    state.q = '';
    $('#buscar-plantilla').value = '';
    renderTodo();
  });

  $('#buscar-plantilla').addEventListener('input', (e) => {
    state.q = e.target.value;
    renderListaPlantillas();
  });

  $('#btn-solo-favs').addEventListener('click', () => {
    state.soloFavs = !state.soloFavs;
    renderTodo();
  });

  $('#etiquetas-plantillas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tag]');
    if (!b) return;
    state.tag = state.tag === b.dataset.tag ? null : b.dataset.tag;
    renderEtiquetasPlantillas();
    renderListaPlantillas();
  });

  $('#lista-plantillas').addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav]');
    if (fav) { e.stopPropagation(); alternarFav(fav.dataset.fav); return; }
    const item = e.target.closest('.item-plantilla');
    if (item) seleccionarPlantilla(item.dataset.id, true);
  });

  // Formulario interactivo
  $('#contenedor-formulario').addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.tipo === 'biblio') {
      const k = el.dataset.key;
      if (el.value === '__otro__') {
        state.vals[k] = { otro: true, text: '' };
      } else {
        state.vals[k] = { itemId: el.value };
      }
      renderFormularioVariables(itemById(state.activaId));
      actualizarVistaPrevia();
    }
  });

  $('#contenedor-formulario').addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.tipo === 'texto') {
      const k = el.dataset.key;
      state.vals[k] = { ...(state.vals[k] || {}), itemId: undefined, text: el.value };
      // Si tiene pills arriba, actualizar estado visual
      $$(`.pill-opcion[data-key="${CSS.escape(k)}"]`).forEach((p) => {
        p.classList.toggle('activa', p.dataset.valor === el.value);
      });
      actualizarVistaPrevia();
    }
  });

  $('#contenedor-formulario').addEventListener('click', (e) => {
    const pill = e.target.closest('.pill-opcion');
    if (pill) {
      const k = pill.dataset.key;
      state.vals[k] = { text: pill.dataset.valor };
      renderFormularioVariables(itemById(state.activaId));
      actualizarVistaPrevia();
      return;
    }
    const ej = e.target.closest('[data-ejemplo]');
    if (ej) {
      const k = ej.dataset.key;
      state.vals[k] = { text: ej.dataset.ejemplo };
      renderFormularioVariables(itemById(state.activaId));
      actualizarVistaPrevia();
      return;
    }
    const gal = e.target.closest('[data-abrir-selector]');
    if (gal) {
      abrirSelectorVisual(gal.dataset.abrirSelector, gal.dataset.cat);
    }
  });

  // Modal selector visual de piezas
  $('#selector-grilla').addEventListener('click', (e) => {
    const card = e.target.closest('[data-elegir-pieza]');
    if (!card || !selectorContexto) return;
    state.vals[selectorContexto.key] = { itemId: card.dataset.elegirPieza };
    $('#dlg-selector').close();
    renderFormularioVariables(itemById(state.activaId));
    actualizarVistaPrevia();
  });

  // Botones de azar, reinicio y copiar
  $('#btn-azar-campos').addEventListener('click', () => {
    const it = itemById(state.activaId);
    if (!it) return;
    state.vals = rellenarValoresAlAzar(it);
    renderFormularioVariables(it);
    actualizarVistaPrevia();
    toast('🎲 ¡Opciones mezcladas al azar!');
  });

  $('#btn-azar-global').addEventListener('click', () => {
    if (state.modo === 'piezas' || state.modo === 'produccion') state.modo = 'video';
    const lista = plantillasDelModoActual();
    if (!lista.length) return;
    const elegida = azar(lista);
    state.activaId = elegida.id;
    state.vals = rellenarValoresAlAzar(elegida);
    renderTodo();
    toast(`🎲 ¡Plantilla "${elegida.titulo}" lista!`);
  });

  $('#btn-reiniciar').addEventListener('click', () => {
    const it = itemById(state.activaId);
    if (!it) return;
    state.vals = inicializarValoresPorDefecto(it);
    renderFormularioVariables(it);
    actualizarVistaPrevia();
    toast('🔄 Formulario reiniciado');
  });

  $('#btn-copiar').addEventListener('click', async () => {
    await copiarAlPortapapeles(state.promptListo || '');
    const btn = $('#btn-copiar');
    const txtOriginal = btn.innerHTML;
    btn.innerHTML = '✅ ¡COPIADO! PÉGALO EN FLOW';
    setTimeout(() => { btn.innerHTML = txtOriginal; }, 2000);
    toast('📋 ¡Prompt copiado al portapapeles!');
  });

  // Reproducción automática de YouTube al acercar el mouse (hover) sobre diagramas y miniaturas
  document.addEventListener('pointerover', (e) => {
    const box = e.target.closest('[data-hover-yt]');
    if (!box || box.contains(e.relatedTarget)) return;
    const slot = box.querySelector('.diagrama-camara__yt-slot');
    if (!slot || slot.querySelector('iframe')) return;
    const id = box.dataset.hoverYt;
    box.classList.add('reproduciendo-yt');
    slot.innerHTML = `<iframe class="yt-hover-iframe" src="https://www.youtube-nocookie.com/embed/${esc(id)}?autoplay=1&mute=1&loop=1&playlist=${esc(id)}&controls=1&rel=0&modestbranding=1&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="Ejemplo de cámara en YouTube"></iframe>`;
  });

  document.addEventListener('pointerout', (e) => {
    const box = e.target.closest('[data-hover-yt]');
    if (!box || box.contains(e.relatedTarget) || box.dataset.fijado === '1') return;
    const slot = box.querySelector('.diagrama-camara__yt-slot');
    box.classList.remove('reproduciendo-yt');
    if (slot) slot.innerHTML = '';
  });

  // Ficha plantilla y catálogo (favoritos, editar, duplicar, eliminar, copiar pieza)
  document.addEventListener('click', async (e) => {
    const yt = e.target.closest('[data-yt]');
    if (yt) {
      const id = yt.dataset.yt;
      yt.dataset.fijado = '1';
      yt.classList.add('reproduciendo-yt');
      const slot = yt.querySelector('.diagrama-camara__yt-slot');
      if (slot) {
        slot.innerHTML = `<iframe class="yt-hover-iframe" src="https://www.youtube-nocookie.com/embed/${esc(id)}?autoplay=1&rel=0&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="Video de YouTube"></iframe>`;
      }
      return;
    }

    const ed = e.target.closest('[data-editar]');
    if (ed) { abrirEditor(ed.dataset.editar); return; }

    const dup = e.target.closest('[data-duplicar]');
    if (dup) {
      const copia = clonar(itemById(dup.dataset.duplicar));
      copia.titulo += ' (copia)';
      abrirEditor(null, copia);
      return;
    }

    const elim = e.target.closest('[data-eliminar]');
    if (elim) { eliminarItem(elim.dataset.eliminar); return; }

    const cp = e.target.closest('[data-copiar-texto]');
    if (cp) {
      await copiarAlPortapapeles(cp.dataset.copiarTexto);
      toast('📋 Texto de la pieza copiado');
      return;
    }

    const sub = e.target.closest('[data-subcat]');
    if (sub) {
      state.subCatPieza = sub.dataset.subcat;
      renderCatalogoPiezas();
    }
  });

  $('#ficha-plantilla').addEventListener('click', (e) => {
    const fav = e.target.closest('[data-fav]');
    if (fav) alternarFav(fav.dataset.fav);
  });

  $('#btn-agregar-video-rapido').addEventListener('click', () => {
    if (state.activaId) abrirEditor(state.activaId);
  });

  // Insertar variable rápida en el editor del profe
  $('#form-editor').addEventListener('click', (e) => {
    const ins = e.target.closest('[data-ins]');
    if (!ins) return;
    const ta = $('#form-editor').prompt;
    const ini = ta.selectionStart ?? ta.value.length;
    const fin = ta.selectionEnd ?? ta.value.length;
    ta.value = ta.value.slice(0, ini) + ins.dataset.ins + ta.value.slice(fin);
    ta.focus();
    pintarVarsDetectadasEditor();
  });

  $('#form-editor').prompt.addEventListener('input', pintarVarsDetectadasEditor);
  $('#form-editor').addEventListener('submit', guardarEditor);

  // Barra profe
  $('#barra-profe').addEventListener('click', (e) => {
    const b = e.target.closest('[data-profe]');
    if (!b) return;
    const acc = b.dataset.profe;
    if (acc === 'nuevo') abrirEditor();
    if (acc === 'exportar') exportarBiblioteca();
    if (acc === 'importar') $('#input-importar').click();
    if (acc === 'descartar') {
      if (!confirm('¿Descartar los cambios no exportados y volver al archivo biblioteca.js original?')) return;
      localStorage.removeItem(LS_BORRADOR);
      state.data = clonar(original);
      normalizarDatos(state.data);
      state.hayBorrador = false;
      state.activaId = null;
      renderTodo();
      toast('↩️ Borrador descartado');
    }
    if (acc === 'salir') salirProfe();
  });

  $('#input-importar').addEventListener('change', (e) => {
    if (e.target.files[0]) importarBiblioteca(e.target.files[0]);
    e.target.value = '';
  });

  // Ayuda y cierre de modales
  $('#btn-ayuda').addEventListener('click', () => $('#dlg-ayuda').showModal());
  $$('dialog').forEach((d) => {
    d.addEventListener('click', (e) => {
      if (e.target === d || e.target.closest('[data-cerrar]')) d.close();
    });
  });

  // 5 clics en la claqueta para activar Modo Profe
  let clics = 0, timerClics;
  $('#logo').addEventListener('click', () => {
    clics++;
    clearTimeout(timerClics);
    timerClics = setTimeout(() => { clics = 0; }, 1600);
    if (clics >= 5) { clics = 0; entrarProfe(); }
  });

  // Inicio
  if (typeof window.crearProduccion === 'function') {
    moduloProduccion = window.crearProduccion({
      $,
      esc,
      itemsDeCat,
      itemById,
      textoPieza,
      svgCamara,
      copiar: copiarAlPortapapeles,
      toast
    });
  }
  window.addEventListener('pf_student_changed', (ev) => {
    state.modo = ev.detail ? 'produccion' : 'video';
    renderTodo();
  });
  window.addEventListener('pf_load_movie', () => {
    if (window.PFUsuarios?.getActiveStudent?.()) {
      state.modo = 'produccion';
      renderTodo();
    }
  });
  renderTodo();
  const params = new URLSearchParams(location.search);
  if ((params.has('profe') || location.hash === '#profe') && !state.profe) {
    setTimeout(entrarProfe, 300);
  }
})();
