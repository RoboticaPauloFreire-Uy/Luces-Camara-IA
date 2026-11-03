/* =====================================================================
   Luces, Cámara, IA — Modo "Mi Película" (producción paso a paso)
   ---------------------------------------------------------------------
   Refleja cómo se trabaja en Google Flow:
     Etapa 1 · Personajes  → se crean como IMAGEN (serán "ingredientes")
     Etapa 2 · Escenario   → se crea como IMAGEN (otro "ingrediente")
     Etapa 3 · Escenas     → se anima con "Ingredientes a video"
                             o "Fotogramas a video" (imagen inicial)
     Etapa 4 · Mi película → guion completo con todas las escenas
   La producción de cada alumno se guarda en su propio navegador.
   ===================================================================== */
window.crearProduccion = function crearProduccion(api) {
  'use strict';

  const { $, esc, itemsDeCat, itemById, textoPieza, svgCamara, miniaturaImagenHTML, copiar, toast } = api;
  const LS_PROD = 'lci:produccion';
  const MAX_PERSONAJES = 2; // Flow admite hasta 3 ingredientes: 2 personajes + 1 escenario
  const MAX_ESCENAS = 8;

  const ETAPAS = [
    { emoji: '🧑‍🚀', titulo: 'Personajes', sub: 'Crea a tus actores', color: '#6a4c93' },
    { emoji: '🏞️', titulo: 'Escenario', sub: 'Construye el set', color: '#00b4d8' },
    { emoji: '🎬', titulo: 'Escenas', sub: '¡Luces, cámara, acción!', color: '#ff595e' },
    { emoji: '🎞️', titulo: 'Mi película', sub: 'Guion completo', color: '#22c55e' }
  ];

  const NOMBRES_DEFECTO = ['Bip', 'Vale'];
  const EXPRESIONES = ['alegre y confiada', 'curiosa', 'valiente', 'tímida', 'traviesa', 'pensativa'];
  const HORAS = ['al amanecer con luz rosada', 'de día con sol brillante', 'al atardecer dorado', 'de noche con estrellas y luna'];
  const CLIMAS = ['despejado', 'con lluvia suave', 'nevando', 'con niebla misteriosa', 'con viento fuerte'];
  const IDEAS_ACCION = [
    'saluda a la cámara y sonríe',
    'descubre algo brillante en el suelo y lo levanta',
    'corre y da un gran salto',
    'baila muy feliz',
    'se asusta con un ruido y luego se ríe',
    'mira el horizonte y señala algo lejano'
  ];

  // ---------- Estado ----------
  const primero = (cat) => (itemsDeCat(cat)[0] || {});

  function nuevoPersonaje(i) {
    const base = itemsDeCat('personaje')[i] || primero('personaje');
    return {
      nombre: NOMBRES_DEFECTO[i] || '',
      baseId: base.id || '',
      descripcion: base.id ? textoPieza(base) : '',
      ropa: '',
      rasgo: '',
      expresion: EXPRESIONES[0]
    };
  }

  function nuevoEscenario() {
    const base = primero('escenario');
    return {
      baseId: base.id || '',
      descripcion: base.id ? textoPieza(base) : '',
      hora: HORAS[1],
      clima: CLIMAS[0],
      detalles: ''
    };
  }

  function nuevaEscena() {
    return {
      modo: 'ingredientes',
      quien: '0',
      accion: '',
      camaraId: primero('camara').id || '',
      audioId: primero('audio').id || '',
      dialogo: ''
    };
  }

  function nuevaProduccion() {
    return {
      movieId: '',
      titulo: '',
      youtubeUrl: '',
      estiloId: primero('estilo').id || '',
      personajes: [nuevoPersonaje(0)],
      escenario: nuevoEscenario(),
      escenas: [nuevaEscena()],
      etapa: 0,
      personajeActivo: 0,
      escenaActiva: 0,
      hecho: {}
    };
  }

  const keyBorradorAlumno = () => {
    const st = window.PFUsuarios?.getActiveStudent?.();
    return st && st.id ? `${LS_PROD}:${st.id}` : LS_PROD;
  };

  function cargarBorradorActual() {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(keyBorradorAlumno())); } catch { p = null; }
    if (!p || !Array.isArray(p.personajes) || !Array.isArray(p.escenas)) p = nuevaProduccion();
    return p;
  }

  let prod = cargarBorradorActual();

  const guardar = () => localStorage.setItem(keyBorradorAlumno(), JSON.stringify(prod));

  function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  }
  function setPath(obj, path, val) {
    const ks = path.split('.');
    const last = ks.pop();
    const dest = ks.reduce((o, k) => o[k], obj);
    dest[last] = val;
  }

  // ---------- Textos de apoyo ----------
  const estiloTxt = () => {
    const it = itemById(prod.estiloId);
    return it ? textoPieza(it) : 'animación 3D colorida';
  };
  const nombreDe = (i) => (prod.personajes[i]?.nombre || '').trim() || `personaje ${i + 1}`;
  const piezaTxt = (id, def) => {
    const it = itemById(id);
    return it ? textoPieza(it) : def;
  };

  function actoresDe(s) {
    if (s.quien === 'todos' && prod.personajes.length > 1) return prod.personajes.map((_, i) => i);
    const i = Math.min(Number(s.quien) || 0, prod.personajes.length - 1);
    return [i];
  }

  const unirNombres = (idx) => {
    const n = idx.map(nombreDe);
    return n.length > 1 ? n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1] : n[0];
  };

  // ---------- Generadores de prompts ----------
  function promptPersonaje(i) {
    const p = prod.personajes[i];
    const desc = p.descripcion.trim() || '[describe cómo es tu personaje]';
    const nombre = p.nombre.trim();
    return `Diseño de personaje para una película, en estilo ${estiloTxt()}. ` +
      `${nombre ? `Se llama ${nombre}: ` : 'Personaje: '}${desc}.` +
      `${p.ropa.trim() ? ` Ropa y accesorios: ${p.ropa.trim()}.` : ''}` +
      `${p.rasgo.trim() ? ` Detalle especial: ${p.rasgo.trim()}.` : ''}` +
      ` Expresión ${p.expresion}. Cuerpo completo, de pie y mirando de frente, sobre un fondo blanco liso, ` +
      `iluminación suave y pareja, sin texto ni otros personajes.`;
  }

  function promptEscenario() {
    const e = prod.escenario;
    const desc = e.descripcion.trim() || '[describe el lugar]';
    return `Escenario de fondo para una película, en estilo ${estiloTxt()}: ${desc}, ${e.hora}, clima ${e.clima}.` +
      `${e.detalles.trim() ? ` Detalles: ${e.detalles.trim()}.` : ''}` +
      ` Vista amplia del lugar, sin personas ni personajes, sin texto.`;
  }

  function partesEscena(s) {
    const idx = actoresDe(s);
    const accion = s.accion.trim() || '[¿qué hace?]';
    const dialogo = s.dialogo.trim()
      ? ` ${nombreDe(idx[0])} dice en español con voz clara: "${s.dialogo.trim()}".`
      : '';
    return {
      idx,
      actores: unirNombres(idx),
      accion,
      camara: piezaTxt(s.camaraId, 'cámara fija'),
      audio: piezaTxt(s.audioId, 'sonidos del ambiente'),
      dialogo,
      plural: idx.length > 1
    };
  }

  function promptEscenaIngredientes(s) {
    const p = partesEscena(s);
    const refs = p.idx.map((i) => `${nombreDe(i)} (personaje)`).concat('el escenario (fondo)').join(', ');
    return `Usa las imágenes de referencia: ${refs}. Video en estilo ${estiloTxt()}. ` +
      `En el lugar de la imagen de referencia, ${p.actores} ${p.accion}. ` +
      `Cámara: ${p.camara}.${p.dialogo} Audio: ${p.audio}. ` +
      `Mantén exactamente el mismo aspecto de ${p.plural ? 'los personajes' : 'el personaje'} y del lugar de las imágenes de referencia.`;
  }

  function promptImagenInicial(s) {
    const p = partesEscena(s);
    const quienes = p.idx.map((i) => {
      const per = prod.personajes[i];
      return `${nombreDe(i)}, ${per.descripcion.trim() || 'el personaje'}`;
    }).join('; y ');
    return `Imagen de una escena de película en estilo ${estiloTxt()}: ${quienes}, ` +
      `en ${prod.escenario.descripcion.trim() || 'el escenario'}, ${prod.escenario.hora}. ` +
      `Plano general donde se ve bien ${p.plural ? 'a los personajes' : 'al personaje'} y el lugar, sin texto.`;
  }

  function promptEscenaFotogramas(s) {
    const p = partesEscena(s);
    return `A partir de la imagen inicial: ${p.actores} ${p.accion}. Video en estilo ${estiloTxt()}. ` +
      `Cámara: ${p.camara}.${p.dialogo} Audio: ${p.audio}. ` +
      `Mantén el mismo aspecto de ${p.plural ? 'los personajes' : 'el personaje'} y del lugar de la imagen.`;
  }

  // ---------- Progreso ----------
  function tareas() {
    const t = prod.personajes.map((_, i) => `p${i}`);
    t.push('esc');
    prod.escenas.forEach((_, i) => t.push(`s${i}`));
    return t;
  }
  const hechas = () => tareas().filter((k) => prod.hecho[k]).length;

  function estadoEtapa(n) {
    if (n === 0) return prod.personajes.every((_, i) => prod.hecho[`p${i}`]);
    if (n === 1) return !!prod.hecho.esc;
    if (n === 2) return prod.escenas.every((_, i) => prod.hecho[`s${i}`]);
    return hechas() === tareas().length;
  }

  // ---------- Piezas de UI reutilizables ----------
  const salida = {}; // textos listos para copiar, por clave

  function selectPiezas(cat, campo, valorId, conPropio, etiquetaPropio = '✏️ Inventar desde cero') {
    return `<select class="select-grande" data-sel="${esc(campo)}" data-cat="${esc(cat)}">
      ${itemsDeCat(cat).map((it) => `<option value="${esc(it.id)}" ${it.id === valorId ? 'selected' : ''}>${esc(it.icono || '')} ${esc(it.titulo)}</option>`).join('')}
      ${conPropio ? `<option value="" ${!valorId ? 'selected' : ''}>${etiquetaPropio}</option>` : ''}
    </select>`;
  }

  function pills(campo, opciones, actual) {
    return `<div class="opciones-pills">
      ${opciones.map((o) => `<button type="button" class="pill-opcion ${o === actual ? 'activa' : ''}" data-pill="${esc(campo)}" data-valor="${esc(o)}">${esc(o.charAt(0).toUpperCase() + o.slice(1))}</button>`).join('')}
    </div>`;
  }

  function bloque(num, color, pregunta, contenido, extra = '') {
    return `<div class="bloque-var" style="--vc:${color}">
      <div class="bloque-var__cab">
        <span class="bloque-var__num">${num}</span>
        <label class="bloque-var__pregunta">${pregunta}</label>
        ${extra}
      </div>
      ${contenido}
    </div>`;
  }

  function claqueta(clave, titulo, texto, colorBoton = 'verde') {
    salida[clave] = texto;
    const html = esc(texto).replace(/\[([^\]]+)\]/g, '<mark class="var-vacia">[$1]</mark>');
    return `<div class="claqueta-card">
      <div class="claqueta-card__franjas"></div>
      <div class="claqueta-card__cuerpo">
        <div class="claqueta-card__top"><h2>${titulo}</h2></div>
        <div class="vista-previa" data-salida="${esc(clave)}">${html}</div>
        <button type="button" class="btn3d btn3d--gigante btn3d--${colorBoton}" data-copiar="${esc(clave)}">📋 ¡COPIAR PROMPT!</button>
      </div>
    </div>`;
  }

  function pasosFlow(lista, claveHecho, textoHecho) {
    return `<div class="pasos-flow">
      <div class="pasos-flow__cab">🧭 Qué hacer en Flow</div>
      <ol>${lista.map((p) => `<li>${p}</li>`).join('')}</ol>
      <label class="check-hecho ${prod.hecho[claveHecho] ? 'on' : ''}">
        <input type="checkbox" data-hecho="${esc(claveHecho)}" ${prod.hecho[claveHecho] ? 'checked' : ''}>
        <span>${textoHecho}</span>
      </label>
      <a class="btn3d btn3d--morado btn3d--bloque" href="https://labs.google/fx/tools/flow" target="_blank" rel="noopener">🚀 Abrir Google Flow ↗</a>
    </div>`;
  }

  function ingredientes(idx) {
    const slots = idx.map((i) => ({ emoji: '🧑‍🚀', nombre: nombreDe(i), tipo: 'Personaje', ok: !!prod.hecho[`p${i}`] }))
      .concat({ emoji: '🏞️', nombre: 'Escenario', tipo: 'Fondo', ok: !!prod.hecho.esc });
    return `<div class="ingredientes">
      <div class="ingredientes__cab">🧩 Tus ingredientes para esta escena</div>
      <div class="ingredientes__slots">
        ${slots.map((s) => `<div class="slot ${s.ok ? 'ok' : ''}">
          <span class="slot__emoji">${s.emoji}</span>
          <strong>${esc(s.nombre)}</strong>
          <small>${s.tipo} · ${s.ok ? '✅ Lista' : '⏳ Falta crearla'}</small>
        </div>`).join('')}
      </div>
    </div>`;
  }

  // ---------- Etapa 1: Personajes ----------
  function formPersonajes() {
    const i = Math.min(prod.personajeActivo, prod.personajes.length - 1);
    const p = prod.personajes[i];
    const base = `personajes.${i}`;
    const estItem = itemById(prod.estiloId);
    return `
      ${bloque('🎨', '#8ac926', '🎨 Estilo de TODA tu película <small class="nota">(se usa en todas las etapas para que todo combine)</small>',
        `${selectPiezas('estilo', 'estiloId', prod.estiloId, false)}
         ${estItem ? `<p class="pista-texto">💡 ${esc(estItem.descripcion)}</p>${miniaturaImagenHTML ? miniaturaImagenHTML(estItem) : ''}` : ''}`)}

      <div class="subtabs-prod">
        ${prod.personajes.map((_, k) => `<button type="button" class="btn3d btn3d--sm ${k === i ? 'btn3d--activo' : 'btn3d--blanco'}" style="--c:#6a4c93" data-personaje-activo="${k}">🧑‍🚀 ${esc(nombreDe(k))} ${prod.hecho[`p${k}`] ? '✅' : ''}</button>`).join('')}
        ${prod.personajes.length < MAX_PERSONAJES ? '<button type="button" class="btn3d btn3d--sm btn3d--amarillo" data-add-personaje>➕ Agregar otro personaje</button>' : ''}
        ${prod.personajes.length > 1 ? `<button type="button" class="btn3d btn3d--sm btn3d--rojo" data-del-personaje="${i}" title="Quitar este personaje">🗑️</button>` : ''}
      </div>

      ${bloque(1, '#6a4c93', '🏷️ ¿Cómo se llama tu personaje?',
        `<input class="input-grande" data-campo="${base}.nombre" value="${esc(p.nombre)}" maxlength="30" placeholder="Ej: Bip, Luna, Capitán Coco">`)}
      ${bloque(2, '#6a4c93', '🧑‍🚀 ¿Quién o qué es? <small class="nota">Elige uno para empezar y cámbialo a tu gusto</small>',
        `${selectPiezas('personaje', `${base}.baseId`, p.baseId, true)}
         <textarea class="input-grande" rows="3" data-campo="${base}.descripcion" placeholder="Ej: un zorro inventor de pelaje naranja con antiparras de cobre">${esc(p.descripcion)}</textarea>`)}
      ${bloque(3, '#6a4c93', '👕 ¿Qué ropa o accesorios lleva? <small class="nota">(opcional)</small>',
        `<input class="input-grande" data-campo="${base}.ropa" value="${esc(p.ropa)}" placeholder="Ej: una capa roja y zapatillas con luces">`)}
      ${bloque(4, '#6a4c93', '⭐ ¿Tiene algún detalle especial? <small class="nota">(opcional)</small>',
        `<input class="input-grande" data-campo="${base}.rasgo" value="${esc(p.rasgo)}" placeholder="Ej: una cicatriz con forma de estrella, una cola que brilla">`)}
      ${bloque(5, '#6a4c93', '😊 ¿Qué expresión tiene?', pills(`${base}.expresion`, EXPRESIONES, p.expresion))}
    `;
  }

  function salidaPersonajes() {
    const i = Math.min(prod.personajeActivo, prod.personajes.length - 1);
    return claqueta(`p${i}`, `🖼️ Imagen de ${esc(nombreDe(i))}`, promptPersonaje(i)) +
      pasosFlow([
        'Copia el prompt de arriba.',
        'En Flow, elige <b>crear una imagen</b> y pega el prompt.',
        'Si no te gusta, cambia <b>una sola cosa</b> en el formulario y prueba otra vez.',
        `Guarda la imagen que más te guste: será el <b>ingrediente "${esc(nombreDe(i))}"</b> para tus videos.`
      ], `p${i}`, `¡Ya creé la imagen de ${esc(nombreDe(i))} en Flow!`);
  }

  // ---------- Etapa 2: Escenario ----------
  function formEscenario() {
    const e = prod.escenario;
    return `
      ${chipEstilo()}
      ${bloque(1, '#00b4d8', '🏞️ ¿En qué lugar ocurre tu película? <small class="nota">Elige uno y cámbialo a tu gusto</small>',
        `${selectPiezas('escenario', 'escenario.baseId', e.baseId, true)}
         <textarea class="input-grande" rows="3" data-campo="escenario.descripcion" placeholder="Ej: una biblioteca gigante con libros que vuelan">${esc(e.descripcion)}</textarea>`)}
      ${bloque(2, '#00b4d8', '☀️ ¿A qué hora del día?', pills('escenario.hora', HORAS, e.hora))}
      ${bloque(3, '#00b4d8', '🌦️ ¿Cómo está el clima?', pills('escenario.clima', CLIMAS, e.clima))}
      ${bloque(4, '#00b4d8', '✨ ¿Algún detalle extra? <small class="nota">(opcional)</small>',
        `<input class="input-grande" data-campo="escenario.detalles" value="${esc(e.detalles)}" placeholder="Ej: un puente de madera y un cartel misterioso">`)}
    `;
  }

  function salidaEscenario() {
    return claqueta('esc', '🖼️ Imagen del escenario', promptEscenario()) +
      pasosFlow([
        'Copia el prompt de arriba.',
        'En Flow, <b>crea una imagen</b> y pega el prompt.',
        'Fíjate que <b>no aparezcan personajes</b>: solo el lugar.',
        'Guarda la mejor imagen: será el <b>ingrediente "Escenario"</b>.'
      ], 'esc', '¡Ya creé la imagen del escenario en Flow!');
  }

  // ---------- Etapa 3: Escenas ----------
  function formEscenas() {
    const k = Math.min(prod.escenaActiva, prod.escenas.length - 1);
    const s = prod.escenas[k];
    const base = `escenas.${k}`;
    const cam = itemById(s.camaraId);
    const opcionesQuien = prod.personajes.map((_, i) => ({ v: String(i), t: `🧑‍🚀 ${nombreDe(i)}` }));
    if (prod.personajes.length > 1) opcionesQuien.push({ v: 'todos', t: '👥 Todos juntos' });

    return `
      ${chipEstilo()}
      <div class="subtabs-prod">
        ${prod.escenas.map((_, j) => `<button type="button" class="btn3d btn3d--sm ${j === k ? 'btn3d--activo' : 'btn3d--blanco'}" style="--c:#ff595e" data-escena-activa="${j}">🎬 Escena ${j + 1} ${prod.hecho[`s${j}`] ? '✅' : ''}</button>`).join('')}
        ${prod.escenas.length < MAX_ESCENAS ? '<button type="button" class="btn3d btn3d--sm btn3d--amarillo" data-add-escena>➕ Nueva escena</button>' : ''}
        ${prod.escenas.length > 1 ? `<button type="button" class="btn3d btn3d--sm btn3d--rojo" data-del-escena="${k}" title="Quitar esta escena">🗑️</button>` : ''}
      </div>

      ${bloque(1, '#1982c4', '🧪 ¿Cómo la vas a crear en Flow?', `
        <div class="modos-flow">
          <button type="button" class="modo-flow ${s.modo === 'ingredientes' ? 'activa' : ''}" data-pill="${base}.modo" data-valor="ingredientes">
            <span class="modo-flow__emoji">🧩</span>
            <strong>Ingredientes a video</strong>
            <small>Subes las imágenes de tus personajes y del escenario, y Flow las anima juntas.</small>
          </button>
          <button type="button" class="modo-flow ${s.modo === 'fotogramas' ? 'activa' : ''}" data-pill="${base}.modo" data-valor="fotogramas">
            <span class="modo-flow__emoji">🖼️</span>
            <strong>Fotogramas a video</strong>
            <small>Partes desde una imagen inicial (por ejemplo, el final de tu escena anterior).</small>
          </button>
        </div>`)}

      ${bloque(2, '#6a4c93', '🎭 ¿Quién actúa en esta escena?', `
        <div class="opciones-pills">
          ${opcionesQuien.map((o) => `<button type="button" class="pill-opcion ${s.quien === o.v ? 'activa' : ''}" data-pill="${base}.quien" data-valor="${esc(o.v)}">${esc(o.t)}</button>`).join('')}
        </div>`)}

      ${bloque(3, '#ff595e', '⚡ ¿Qué pasa en estos 8 segundos? <small class="nota">Una sola acción clara</small>', `
        <input class="input-grande" data-campo="${base}.accion" value="${esc(s.accion)}" placeholder="Ej: descubre una puerta secreta detrás de una cascada">
        <div class="ideas">💡 Ideas: ${IDEAS_ACCION.map((a) => `<button type="button" class="chip-filtro" data-idea="${esc(a)}">${esc(a)}</button>`).join('')}</div>`)}

      ${bloque(4, '#1982c4', '🎥 ¿Cómo se mueve la cámara?', `
        ${selectPiezas('camara', `${base}.camaraId`, s.camaraId, false)}
        ${cam ? `<p class="pista-texto">💡 ${esc(cam.descripcion)}</p>${svgCamara(cam.anim, cam)}` : ''}`)}

      ${bloque(5, '#f72585', '💬 ¿Alguien dice algo? <small class="nota">(opcional, frase corta)</small>',
        `<input class="input-grande" data-campo="${base}.dialogo" value="${esc(s.dialogo)}" maxlength="120" placeholder="Ej: ¡Por fin encontré el tesoro!">`)}

      ${bloque(6, '#f72585', '🔊 ¿Qué música o sonidos se escuchan?', selectPiezas('audio', `${base}.audioId`, s.audioId, false))}
    `;
  }

  function salidaEscenas() {
    const k = Math.min(prod.escenaActiva, prod.escenas.length - 1);
    const s = prod.escenas[k];
    const idx = actoresDe(s);
    if (s.modo === 'fotogramas') {
      return claqueta(`s${k}-img`, `🅰️ Imagen inicial · Escena ${k + 1}`, promptImagenInicial(s), 'amarillo') +
        claqueta(`s${k}`, `🅱️ Video · Escena ${k + 1}`, promptEscenaFotogramas(s)) +
        pasosFlow([
          '<b>Imagen inicial:</b> crea una imagen en Flow con el prompt 🅰️ (o usa el último cuadro de tu escena anterior para que la historia continúe).',
          'Elige el modo <b>Fotogramas a video</b> y sube esa imagen como <b>fotograma inicial</b>.',
          'Copia el prompt 🅱️ y pégalo.',
          'Genera el video y quédate con la mejor versión.'
        ], `s${k}`, `¡Ya hice la Escena ${k + 1} en Flow!`);
    }
    return ingredientes(idx) +
      claqueta(`s${k}`, `🎬 Video · Escena ${k + 1}`, promptEscenaIngredientes(s)) +
      pasosFlow([
        'En Flow, elige el modo <b>Ingredientes a video</b>.',
        `Agrega las imágenes de tus ingredientes: <b>${esc(unirNombres(idx))}</b> y el <b>escenario</b> (máximo 3 imágenes).`,
        'Copia el prompt de arriba y pégalo.',
        'Genera el video. Si algo sale raro, cambia una sola cosa y vuelve a intentar.'
      ], `s${k}`, `¡Ya hice la Escena ${k + 1} en Flow!`);
  }

  // ---------- Etapa 4: Mi película ----------
  function promptsDeEscena(s) {
    return s.modo === 'fotogramas'
      ? [['Imagen inicial', promptImagenInicial(s)], ['Video (Fotogramas a video)', promptEscenaFotogramas(s)]]
      : [['Video (Ingredientes a video)', promptEscenaIngredientes(s)]];
  }

  function guionCompleto() {
    const L = [];
    L.push(`🎬 ${prod.titulo.trim() || 'Mi película'} — hecha con Luces, Cámara, IA`);
    L.push(`Estilo: ${estiloTxt()}`, '');
    prod.personajes.forEach((_, i) => { L.push(`🧑‍🚀 PERSONAJE: ${nombreDe(i)} (imagen)`, promptPersonaje(i), ''); });
    L.push('🏞️ ESCENARIO (imagen)', promptEscenario(), '');
    prod.escenas.forEach((s, j) => {
      promptsDeEscena(s).forEach(([t, p]) => L.push(`🎬 ESCENA ${j + 1} — ${t}`, p, ''));
    });
    return L.join('\n');
  }

  function vistaPelicula() {
    salida.guion = guionCompleto();
    const tarjeta = (clave, emoji, titulo, sub, texto, ok) => {
      salida[clave] = texto;
      return `<div class="fotograma ${ok ? 'ok' : ''}">
        <div class="fotograma__cab"><span>${emoji}</span><strong>${titulo}</strong>${ok ? '<span class="fotograma__ok">✅</span>' : ''}</div>
        <small>${sub}</small>
        <p>${esc(texto)}</p>
        <button type="button" class="btn3d btn3d--sm btn3d--verde" data-copiar="${esc(clave)}">📋 Copiar</button>
      </div>`;
    };
    return `
      <div class="pelicula">
        <div class="pelicula__cab">
          <div>
            <h2>🎞️ ${esc(prod.titulo.trim() || 'Mi película')}</h2>
            <p>Aquí está todo tu guion: personajes, escenario y escenas en orden. ¡Puedes copiar cada prompt o el guion completo!</p>
          </div>
          <div class="pelicula__acciones">
            <button type="button" class="btn3d btn3d--amarillo" data-guardar-cuenta>💾 Guardar en mi cuenta</button>
            <button type="button" class="btn3d btn3d--verde" data-copiar="guion">📋 Copiar guion completo</button>
            <button type="button" class="btn3d btn3d--rojo" data-reiniciar>➕ Nueva película</button>
          </div>
        </div>
        <div class="bloque-var" style="--vc:#22c55e">
          <div class="bloque-var__cab">
            <span class="bloque-var__num">📺</span>
            <label class="bloque-var__pregunta">Link de tu video terminado (YouTube o Google Drive) <small class="nota">(opcional)</small></label>
          </div>
          <input class="input-grande" data-campo="youtubeUrl" value="${esc(prod.youtubeUrl || '')}" placeholder="Pega aquí el link de tu video cuando lo termines…">
        </div>
        <div class="cinta">
          ${prod.personajes.map((_, i) => tarjeta(`f-p${i}`, '🧑‍🚀', esc(nombreDe(i)), 'Personaje · Imagen', promptPersonaje(i), prod.hecho[`p${i}`])).join('')}
          ${tarjeta('f-esc', '🏞️', 'Escenario', 'Fondo · Imagen', promptEscenario(), prod.hecho.esc)}
          ${prod.escenas.map((s, j) => promptsDeEscena(s).map(([t, p], n) =>
            tarjeta(`f-s${j}-${n}`, '🎬', `Escena ${j + 1}`, esc(t), p, prod.hecho[`s${j}`])).join('')).join('')}
        </div>
        <div class="pasos-flow pasos-flow--final">
          <div class="pasos-flow__cab">🏁 Para terminar tu película en Flow</div>
          <ol>
            <li>Junta tus escenas en orden (en Flow puedes armarlas una tras otra como en una línea de tiempo).</li>
            <li>Mira tu película completa y revisa si la historia se entiende.</li>
            <li>¡Muéstrasela a tu curso! 🍿</li>
          </ol>
        </div>
      </div>`;
  }

  function chipEstilo() {
    const it = itemById(prod.estiloId);
    return `<div class="chip-estilo">
      <span>🎨 Estilo de tu película: <b>${esc(it ? it.titulo : 'sin elegir')}</b></span>
      <div class="chip-estilo__acciones">
        ${it && it.imagen ? `<button type="button" class="chip-filtro" data-ver-img="${esc(it.id)}">🖼️ Ver imagen</button>` : ''}
        <button type="button" class="chip-filtro" data-etapa="0">Cambiar</button>
      </div>
    </div>`;
  }

  // ---------- Render ----------
  function render() {
    const root = $('#vista-produccion');
    const st = window.PFUsuarios?.getActiveStudent?.();
    if (!st) {
      root.innerHTML = '';
      return;
    }
    const total = tareas().length;
    const listo = hechas();
    const pct = Math.round((listo / total) * 100);
    const e = prod.etapa;

    root.innerHTML = `
      <div class="prod-cab">
        <div class="prod-cab__titulo">
          <span class="prod-cab__emoji">🎞️</span>
          <label>
            <small>Película de <b>${esc(st.name)}</b> (${esc(st.gradeName || '')})</small>
            <input class="input-titulo" data-campo="titulo" value="${esc(prod.titulo)}" maxlength="60" placeholder="Escribe aquí el título de tu película…">
          </label>
        </div>
        <div class="prod-cab__acciones-cuenta">
          <button type="button" class="btn3d btn3d--sm btn3d--verde" data-guardar-cuenta>
            💾 Guardar mi película
          </button>
          <button type="button" class="btn3d btn3d--sm btn3d--amarillo" data-mis-peliculas>
            🎞️ Mis películas
          </button>
          <button type="button" class="btn3d btn3d--sm btn3d--blanco" data-reiniciar title="Crear una película nueva en blanco">
            ➕ Nueva
          </button>
        </div>
        <div class="progreso">
          <div class="progreso__texto">⭐ Progreso: <b>${listo} de ${total}</b> pasos hechos en Flow</div>
          <div class="progreso__barra"><span style="width:${pct}%"></span></div>
        </div>
      </div>

      <nav class="tira-etapas" aria-label="Etapas de tu película">
        ${ETAPAS.map((et, n) => `
          <button type="button" class="etapa ${n === e ? 'activa' : ''} ${estadoEtapa(n) ? 'ok' : ''}" data-etapa="${n}" style="--c:${et.color}">
            <span class="etapa__num">${estadoEtapa(n) ? '✅' : n + 1}</span>
            <span class="etapa__emoji">${et.emoji}</span>
            <strong>${et.titulo}</strong>
            <small>${et.sub}</small>
          </button>`).join('<span class="tira-etapas__flecha">➜</span>')}
      </nav>

      ${e === 3 ? vistaPelicula() : `
        <div class="prod-cuerpo">
          <section class="panel prod-form" style="--c:${ETAPAS[e].color}">
            <div class="prod-form__cab">
              <span class="paso-pill" style="background:${ETAPAS[e].color}">ETAPA ${e + 1}</span>
              <h2>${ETAPAS[e].emoji} ${[
                'Crea a los personajes de tu película',
                'Construye el escenario',
                'Graba tus escenas'
              ][e]}</h2>
              <p class="panel__sub">${[
                'Primero creamos a cada personaje como <b>imagen</b>. Esa imagen será un <b>ingrediente</b> que Flow usará para que tu personaje se vea igual en todas las escenas.',
                'Ahora creamos el lugar como <b>imagen</b>, sin personajes. Será el <b>ingrediente</b> del fondo.',
                'Juntamos los ingredientes y les damos vida. Cada escena dura unos <b>8 segundos</b>.'
              ][e]}</p>
            </div>
            <div class="formulario-vars">
              ${[formPersonajes, formEscenario, formEscenas][e]()}
            </div>
            <div class="prod-nav">
              ${e > 0 ? `<button type="button" class="btn3d btn3d--blanco" data-etapa="${e - 1}">⬅️ Etapa anterior</button>` : '<span></span>'}
              <button type="button" class="btn3d btn3d--verde" data-etapa="${e + 1}">Siguiente etapa ➡️</button>
            </div>
          </section>
          <aside class="prod-salida" id="prod-salida">
            ${[salidaPersonajes, salidaEscenario, salidaEscenas][e]()}
          </aside>
        </div>`}
    `;
  }

  /** Solo vuelve a pintar la columna de salida (para no perder el foco al escribir). */
  function renderSalida() {
    const cont = $('#prod-salida');
    if (!cont) return;
    cont.innerHTML = [salidaPersonajes, salidaEscenario, salidaEscenas][prod.etapa]();
  }

  // ---------- Eventos ----------
  function conectar() {
    const root = $('#vista-produccion');

    root.addEventListener('input', (ev) => {
      const el = ev.target;
      if (!el.dataset.campo) return;
      setPath(prod, el.dataset.campo, el.value);
      guardar();
      if (prod.etapa < 3) renderSalida();
    });

    root.addEventListener('change', (ev) => {
      const el = ev.target;
      if (el.dataset.hecho) {
        prod.hecho[el.dataset.hecho] = el.checked;
        guardar();
        render();
        if (el.checked) toast('⭐ ¡Bien hecho, director/a!');
        return;
      }
      if (el.dataset.sel) {
        const campo = el.dataset.sel;
        setPath(prod, campo, el.value);
        // Al elegir un personaje/escenario base, se copia su descripción para poder editarla
        if (/\.baseId$/.test(campo)) {
          const it = itemById(el.value);
          setPath(prod, campo.replace(/baseId$/, 'descripcion'), it ? textoPieza(it) : '');
        }
        guardar();
        render();
      }
    });

    root.addEventListener('click', async (ev) => {
      const t = (sel) => ev.target.closest(sel);
      let b;

      if ((b = t('[data-copiar]'))) {
        await copiar(salida[b.dataset.copiar] || '');
        const txt = b.innerHTML;
        b.innerHTML = '✅ ¡COPIADO!';
        setTimeout(() => { b.innerHTML = txt; }, 1600);
        toast('📋 ¡Copiado! Ahora pégalo en Flow');
        return;
      }
      if ((b = t('[data-etapa]'))) {
        prod.etapa = Math.max(0, Math.min(3, Number(b.dataset.etapa)));
        guardar(); render();
        $('#vista-produccion').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if ((b = t('[data-pill]'))) {
        setPath(prod, b.dataset.pill, b.dataset.valor);
        guardar(); render();
        return;
      }
      if ((b = t('[data-idea]'))) {
        const k = Math.min(prod.escenaActiva, prod.escenas.length - 1);
        prod.escenas[k].accion = b.dataset.idea;
        guardar(); render();
        return;
      }
      if ((b = t('[data-personaje-activo]'))) {
        prod.personajeActivo = Number(b.dataset.personajeActivo);
        guardar(); render();
        return;
      }
      if (t('[data-add-personaje]')) {
        prod.personajes.push(nuevoPersonaje(prod.personajes.length));
        prod.personajeActivo = prod.personajes.length - 1;
        guardar(); render();
        return;
      }
      if ((b = t('[data-del-personaje]'))) {
        const i = Number(b.dataset.delPersonaje);
        if (!confirm(`¿Quitar a ${nombreDe(i)} de tu película?`)) return;
        prod.personajes.splice(i, 1);
        // Reordenar marcas de "hecho" de personajes
        const marcas = prod.personajes.map((_, k) => prod.hecho[`p${k >= i ? k + 1 : k}`]);
        Object.keys(prod.hecho).filter((x) => /^p\d+$/.test(x)).forEach((x) => delete prod.hecho[x]);
        marcas.forEach((v, k) => { if (v) prod.hecho[`p${k}`] = true; });
        prod.escenas.forEach((s) => { if (s.quien !== 'todos' && Number(s.quien) >= prod.personajes.length) s.quien = '0'; });
        prod.personajeActivo = 0;
        guardar(); render();
        return;
      }
      if ((b = t('[data-escena-activa]'))) {
        prod.escenaActiva = Number(b.dataset.escenaActiva);
        guardar(); render();
        return;
      }
      if (t('[data-add-escena]')) {
        const anterior = prod.escenas[prod.escenas.length - 1];
        const nueva = nuevaEscena();
        // La nueva escena hereda personajes y estilo de sonido, y propone continuar desde la anterior
        if (anterior) { nueva.quien = anterior.quien; nueva.audioId = anterior.audioId; nueva.modo = 'fotogramas'; }
        prod.escenas.push(nueva);
        prod.escenaActiva = prod.escenas.length - 1;
        guardar(); render();
        toast('🎬 Nueva escena: puedes continuar desde el final de la anterior');
        return;
      }
      if ((b = t('[data-del-escena]'))) {
        const k = Number(b.dataset.delEscena);
        if (!confirm(`¿Borrar la Escena ${k + 1}?`)) return;
        prod.escenas.splice(k, 1);
        const marcas = prod.escenas.map((_, j) => prod.hecho[`s${j >= k ? j + 1 : j}`]);
        Object.keys(prod.hecho).filter((x) => /^s\d+$/.test(x)).forEach((x) => delete prod.hecho[x]);
        marcas.forEach((v, j) => { if (v) prod.hecho[`s${j}`] = true; });
        prod.escenaActiva = Math.max(0, k - 1);
        guardar(); render();
        return;
      }
      if (t('[data-guardar-cuenta]')) {
        await guardarEnCuenta();
        return;
      }
      if (t('[data-mis-peliculas]')) {
        window.PFUsuarios?.abrirModalUsuario?.();
        return;
      }
      if (t('[data-reiniciar]')) {
        if (!confirm('¿Empezar una película nueva en blanco? (Recuerda guardar la actual en tu cuenta si quieres conservarla).')) return;
        prod = nuevaProduccion();
        guardar(); render();
        toast('🎬 ¡Nueva película! Empieza creando tus personajes');
      }
    });

    async function guardarEnCuenta() {
      const st = window.PFUsuarios?.getActiveStudent?.();
      if (!st) {
        toast('🔐 Primero inicia sesión con tu usuario y PIN');
        window.PFUsuarios?.abrirModalUsuario?.();
        return;
      }
      if (!prod.titulo || !prod.titulo.trim()) {
        const nombrePeli = prompt('🎬 Ponle un título a tu película antes de guardarla:', 'Mi gran película');
        if (nombrePeli === null) return;
        prod.titulo = nombrePeli.trim() || 'Mi gran película';
      }
      const res = await window.PFUsuarios.guardarPeliculaAlumno(st, prod);
      prod.movieId = res.registro.movieId;
      guardar();
      render();
      toast(res.enNube ? `☁️ ¡Película "${prod.titulo}" guardada en la cuenta de ${st.name}!` : `💾 Película "${prod.titulo}" guardada en este equipo`);
    }

    window.addEventListener('pf_student_changed', () => {
      prod = cargarBorradorActual();
      render();
    });

    window.addEventListener('pf_load_movie', (ev) => {
      if (!ev.detail) return;
      prod = { ...nuevaProduccion(), ...ev.detail };
      guardar();
      render();
      toast(`📂 Película "${prod.titulo}" cargada`);
    });

    window.addEventListener('pf_request_save_current_movie', async () => {
      await guardarEnCuenta();
      const st = window.PFUsuarios?.getActiveStudent?.();
      if (st) window.PFUsuarios?.abrirModalUsuario?.();
    });
  }

  conectar();
  return { render };
};
