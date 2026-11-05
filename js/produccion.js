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

  const { $, esc, itemsDeCat, itemById, textoPieza, svgCamara, miniaturaImagenHTML, abrirSelectorVisual, copiar, toast } = api;
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

  function nuevaEscena(acto = 'inicio') {
    return {
      acto,
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
      anecdota: {
        inicio: '',
        nudo: '',
        desenlace: ''
      },
      customPrompts: {},
      estiloId: primero('estilo').id || '',
      personajes: [nuevoPersonaje(0)],
      escenario: nuevoEscenario(),
      escenas: [nuevaEscena('inicio')],
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

  function normalizarProduccion(p) {
    if (!p || !Array.isArray(p.personajes) || !Array.isArray(p.escenas)) return nuevaProduccion();
    p.anecdota = {
      inicio: '',
      nudo: '',
      desenlace: '',
      ...(p.anecdota || {})
    };
    p.customPrompts = (p.customPrompts && typeof p.customPrompts === 'object') ? p.customPrompts : {};
    p.escenas.forEach((s, idx) => {
      if (!['inicio', 'nudo', 'desenlace'].includes(s.acto)) {
        s.acto = idx === 0 ? 'inicio' : (idx === 1 ? 'nudo' : 'desenlace');
      }
      if (idx > 0 && s.modo === 'fotogramas' && !(s.accion || '').trim()) {
        s.modo = 'ingredientes';
      }
    });
    return p;
  }

  function cargarBorradorActual() {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(keyBorradorAlumno())); } catch { p = null; }
    return normalizarProduccion(p);
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
  const estiloEscenarioTxt = () => {
    return estiloTxt()
      .replace(/,?\s*y\s+personajes\s+muy\s+expresivos/gi, '')
      .replace(/,?\s*personajes\s+muy\s+expresivos/gi, '')
      .trim();
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
    return `Escenario de fondo para una película, en estilo ${estiloEscenarioTxt()}: ${desc}, ${e.hora}, clima ${e.clima}.` +
      `${e.detalles.trim() ? ` Detalles: ${e.detalles.trim()}.` : ''}` +
      ` Vista amplia del lugar, sin personas ni personajes, sin texto.`;
  }

  function partesEscena(s) {
    const idx = actoresDe(s);
    const accion = s.accion.trim() || '[¿qué hace?]';
    const textoDialogo = (s.dialogo || '').trim();
    const dialogo = textoDialogo
      ? ` El personaje dice en español: "${textoDialogo}".`
      : '';
    return {
      idx,
      actores: unirNombres(idx),
      accion,
      camara: piezaTxt(s.camaraId, 'cámara fija'),
      audio: piezaTxt(s.audioId, 'sonidos del ambiente'),
      dialogo,
      textoDialogo,
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
  const salida = {};      // textos finales listos para copiar, por clave
  const salidaAuto = {};  // textos automáticos sin edición manual, por clave
  const metaClaqueta = {}; // metadatos para abrir en el modal { clave, titulo, colorBoton }

  function textoFinalDe(clave, textoAutomatico) {
    salidaAuto[clave] = textoAutomatico;
    const manual = (prod.customPrompts?.[clave] || '').trim();
    const final = manual || textoAutomatico;
    salida[clave] = final;
    return final;
  }

  function tieneEdicionManual(clave) {
    return !!((prod.customPrompts?.[clave] || '').trim());
  }

  function botonVerTarjetas(cat, campo, conPropio = false) {
    const n = itemsDeCat(cat).length;
    return `<button type="button" class="btn-galeria" data-abrir-tarjetas-prod="${esc(campo)}" data-cat="${esc(cat)}" data-propio="${conPropio ? '1' : '0'}">
      🖼️ Ver tarjetas (${n})
    </button>`;
  }

  function tarjetaSeleccionadaHTML(cat, campo, valorId, conPropio = false, etiquetaPropio = '✏️ Inventar desde cero') {
    const selItem = valorId ? itemById(valorId) : null;
    if (!selItem) {
      return `
        <div class="pista-seleccion pista-seleccion--clic" data-abrir-tarjetas-prod="${esc(campo)}" data-cat="${esc(cat)}" data-propio="${conPropio ? '1' : '0'}" role="button" tabindex="0" title="Haz clic para ver las tarjetas">
          <span class="pista-seleccion__icono">✏️</span>
          <div class="pista-seleccion__info">
            <strong>${esc(etiquetaPropio)}</strong>
            <p>Escribe con tus propias palabras en el cuadro de abajo o pulsa "Ver tarjetas".</p>
          </div>
        </div>
      `;
    }
    return `
      <div class="pista-seleccion pista-seleccion--clic" data-abrir-tarjetas-prod="${esc(campo)}" data-cat="${esc(cat)}" data-propio="${conPropio ? '1' : '0'}" role="button" tabindex="0" title="Haz clic para cambiar de tarjeta">
        <span class="pista-seleccion__icono">${esc(selItem.icono || '✨')}</span>
        <div class="pista-seleccion__info">
          <strong>${esc(selItem.titulo)}</strong>
          <p>${esc(selItem.descripcion)}</p>
        </div>
      </div>
      ${selItem.imagen && miniaturaImagenHTML ? miniaturaImagenHTML(selItem) : ''}
      ${selItem.anim && svgCamara ? svgCamara(selItem.anim, selItem) : ''}
    `;
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

  function claqueta(clave, titulo, textoAutomatico, colorBoton = 'verde', opts = {}) {
    const final = textoFinalDe(clave, textoAutomatico);
    const editado = tieneEdicionManual(clave);
    const faltaAccion = final.includes('[¿qué hace?]');
    metaClaqueta[clave] = { clave, titulo, colorBoton };

    const checkHTML = opts.claveHecho ? `
      <label class="check-hecho ${prod.hecho[opts.claveHecho] ? 'on' : ''}">
        <input type="checkbox" data-hecho="${esc(opts.claveHecho)}" ${prod.hecho[opts.claveHecho] ? 'checked' : ''}>
        <span>${opts.textoHecho}</span>
      </label>` : '';

    return `<div class="claqueta-card claqueta-card--compacta ${opts.activa ? 'claqueta-card--activa' : ''}">
      <div class="claqueta-card__franjas"></div>
      <div class="claqueta-card__cuerpo">
        <div class="claqueta-card__top">
          <h2>${titulo}</h2>
          ${editado
            ? '<span class="estado-prompt estado-prompt--editado">✏️ Editado a mano</span>'
            : (faltaAccion
                ? '<span class="estado-prompt estado-prompt--falta">⚠️ Falta paso 3</span>'
                : '<span class="estado-prompt estado-prompt--ok">✅ Prompt listo</span>')}
        </div>
        ${opts.subtitulo ? `<div class="claqueta-card__sub">${opts.subtitulo}</div>` : ''}
        <p class="claqueta-card__resumen">Haz clic en <b>Ver Prompt</b> para abrir la claqueta completa, copiarlo o editarlo a mano si quieres agregar algo más.</p>
        <div class="claqueta-card__botones">
          <button type="button" class="btn3d btn3d--gigante btn3d--${colorBoton}" data-ver-prompt="${esc(clave)}">🎬 VER PROMPT</button>
          <button type="button" class="btn3d btn3d--blanco" data-copiar="${esc(clave)}" title="Copiar directamente">📋 Copiar</button>
        </div>
        ${checkHTML}
      </div>
    </div>`;
  }

  let modalPromptClaveActiva = null;
  let modalPromptEditando = false;

  function renderModalPrompt() {
    const dlg = $('#dlg-prompt-prod');
    const cuerpo = $('#modal-prompt-prod-cuerpo');
    if (!dlg || !cuerpo || !modalPromptClaveActiva) return;

    const meta = metaClaqueta[modalPromptClaveActiva] || {
      clave: modalPromptClaveActiva,
      titulo: '🎬 Tu Prompt Listo',
      colorBoton: 'verde'
    };
    const clave = meta.clave;
    const textoActual = salida[clave] || '';
    const editado = tieneEdicionManual(clave);
    const htmlVista = esc(textoActual).replace(/\[([^\]]+)\]/g, '<mark class="var-vacia">[$1]</mark>');

    cuerpo.innerHTML = `
      <div class="claqueta-card claqueta-card--modal">
        <div class="claqueta-card__franjas"></div>
        <div class="claqueta-card__cuerpo">
          <div class="claqueta-card__top">
            <div>
              <span class="paso-pill">CLAQUETA DE PROMPT</span>
              <h2>${meta.titulo}</h2>
            </div>
            <div class="claqueta-card__top-der">
              ${editado ? '<span class="estado-prompt estado-prompt--editado">✏️ Editado a mano</span>' : '<span class="estado-prompt estado-prompt--ok">✅ Listo para copiar</span>'}
              <button type="button" class="btn-cerrar" data-cerrar-modal-prompt aria-label="Cerrar">✕</button>
            </div>
          </div>

          ${modalPromptEditando ? `
            <div class="claqueta-editor">
              <label class="claqueta-editor__label">✏️ Edita o agrega lo que quieras al prompt:</label>
              <textarea id="textarea-prompt-manual" class="input-grande claqueta-editor__textarea" rows="6">${esc(textoActual)}</textarea>
              <div class="claqueta-editor__acciones">
                <button type="button" class="btn3d btn3d--sm btn3d--verde" data-guardar-prompt-manual="${esc(clave)}">💾 Guardar cambios</button>
                ${editado ? `<button type="button" class="btn3d btn3d--sm btn3d--rojo" data-restaurar-prompt-auto="${esc(clave)}">🔄 Volver al automático</button>` : ''}
                <button type="button" class="btn3d btn3d--sm btn3d--blanco" data-cancelar-edicion-prompt>Cancelar</button>
              </div>
            </div>
          ` : `
            <div class="vista-previa" data-salida-modal="${esc(clave)}">${htmlVista}</div>
          `}

          <div class="claqueta-modal__acciones">
            <button type="button" class="btn3d btn3d--gigante btn3d--${meta.colorBoton || 'verde'}" data-copiar="${esc(clave)}">📋 ¡COPIAR PROMPT!</button>
            <button type="button" class="btn3d btn3d--amarillo" data-toggle-editar-prompt="${esc(clave)}">
              ${modalPromptEditando ? '👁️ Ver vista previa' : '✏️ Editar a mano'}
            </button>
            ${editado && !modalPromptEditando ? `<button type="button" class="btn3d btn3d--blanco" data-restaurar-prompt-auto="${esc(clave)}" title="Volver al prompt generado automáticamente">🔄 Automático</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function abrirModalPrompt(clave, iniciarEditando = false) {
    modalPromptClaveActiva = clave;
    modalPromptEditando = iniciarEditando;
    renderModalPrompt();
    const dlg = $('#dlg-prompt-prod');
    if (dlg && !dlg.open) dlg.showModal();
    if (iniciarEditando) {
      setTimeout(() => $('#textarea-prompt-manual')?.focus(), 80);
    }
  }

  function pasosFlow(lista, claveHecho, textoHecho) {
    return `<div class="pasos-flow">
      <div class="pasos-flow__cab">🧭 Qué hacer en Flow</div>
      <ol>${lista.map((p) => `<li>${p}</li>`).join('')}</ol>
      ${claveHecho ? `<label class="check-hecho ${prod.hecho[claveHecho] ? 'on' : ''}">
        <input type="checkbox" data-hecho="${esc(claveHecho)}" ${prod.hecho[claveHecho] ? 'checked' : ''}>
        <span>${textoHecho}</span>
      </label>` : ''}
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
    return `
      ${bloque('🎨', '#8ac926', '🎨 ¿Con qué estilo visual quieres que se vea tu película?',
        tarjetaSeleccionadaHTML('estilo', 'estiloId', prod.estiloId, false),
        botonVerTarjetas('estilo', 'estiloId', false))}

      <div class="subtabs-prod">
        ${prod.personajes.map((_, k) => `<button type="button" class="btn3d btn3d--sm ${k === i ? 'btn3d--activo' : 'btn3d--blanco'}" style="--c:#6a4c93" data-personaje-activo="${k}">🧑‍🚀 ${esc(nombreDe(k))} ${prod.hecho[`p${k}`] ? '✅' : ''}</button>`).join('')}
        ${prod.personajes.length < MAX_PERSONAJES ? '<button type="button" class="btn3d btn3d--sm btn3d--amarillo" data-add-personaje>➕ Agregar otro personaje</button>' : ''}
        ${prod.personajes.length > 1 ? `<button type="button" class="btn3d btn3d--sm btn3d--rojo" data-del-personaje="${i}" title="Quitar este personaje">🗑️</button>` : ''}
      </div>

      ${bloque(1, '#6a4c93', '🏷️ ¿Cómo se llama tu personaje?',
        `<input class="input-grande" data-campo="${base}.nombre" value="${esc(p.nombre)}" maxlength="30" placeholder="Ej: Bip, Luna, Capitán Coco">`)}
      ${bloque(2, '#6a4c93', '🧑‍🚀 ¿Quién o qué es? <small class="nota">Elige una tarjeta o cámbialo a tu gusto</small>',
        `${tarjetaSeleccionadaHTML('personaje', `${base}.baseId`, p.baseId, true)}
         <textarea class="input-grande" rows="3" data-campo="${base}.descripcion" placeholder="Ej: un zorro inventor de pelaje naranja con antiparras de cobre">${esc(p.descripcion)}</textarea>`,
        botonVerTarjetas('personaje', `${base}.baseId`, true))}
      ${bloque(3, '#6a4c93', '👕 ¿Qué ropa o accesorios lleva? <small class="nota">(opcional)</small>',
        `<input class="input-grande" data-campo="${base}.ropa" value="${esc(p.ropa)}" placeholder="Ej: una capa roja y zapatillas con luces">`)}
      ${bloque(4, '#6a4c93', '⭐ ¿Tiene algún detalle especial? <small class="nota">(opcional)</small>',
        `<input class="input-grande" data-campo="${base}.rasgo" value="${esc(p.rasgo)}" placeholder="Ej: una cicatriz con forma de estrella, una cola que brilla">`)}
      ${bloque(5, '#6a4c93', '😊 ¿Qué expresión tiene?', pills(`${base}.expresion`, EXPRESIONES, p.expresion))}
    `;
  }

  function salidaPersonajes() {
    const i = Math.min(prod.personajeActivo, prod.personajes.length - 1);
    const tarjetas = prod.personajes.map((_, idx) => {
      const nom = esc(nombreDe(idx));
      return claqueta(`p${idx}`, `🖼️ Imagen de ${nom}`, promptPersonaje(idx), 'verde', {
        activa: idx === i && prod.personajes.length > 1,
        claveHecho: `p${idx}`,
        textoHecho: `¡Ya creé la imagen de ${nom} en Flow!`
      });
    }).join('');

    return tarjetas +
      pasosFlow([
        'Copia el prompt del personaje que quieras crear.',
        'En Flow, elige <b>crear una imagen</b> y pega el prompt.',
        'Si no te gusta, cambia <b>una sola cosa</b> en el formulario y prueba otra vez.',
        'Guarda la imagen que más te guste: será el <b>ingrediente</b> de ese personaje para tus videos.'
      ]);
  }

  // ---------- Etapa 2: Escenario ----------
  function formEscenario() {
    const e = prod.escenario;
    return `
      ${chipEstilo()}
      ${bloque(1, '#00b4d8', '🏞️ ¿En qué lugar ocurre tu película? <small class="nota">Elige una tarjeta y cámbialo a tu gusto</small>',
        `${tarjetaSeleccionadaHTML('escenario', 'escenario.baseId', e.baseId, true)}
         <textarea class="input-grande" rows="3" data-campo="escenario.descripcion" placeholder="Ej: una biblioteca gigante con libros que vuelan">${esc(e.descripcion)}</textarea>`,
        botonVerTarjetas('escenario', 'escenario.baseId', true))}
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

  // ---------- Guía de Anécdota en 3 actos ----------
  const ACTOS_META = {
    inicio: {
      id: 'inicio',
      corto: '1 · Inicio',
      etiqueta: 'Inicio (¿Cómo empieza?)',
      emoji: '🌱',
      color: '#0284c7'
    },
    nudo: {
      id: 'nudo',
      corto: '2 · Nudo / Problema',
      etiqueta: 'Nudo / Problema (¿Qué ocurre de inesperado?)',
      emoji: '⚡',
      color: '#d97706'
    },
    desenlace: {
      id: 'desenlace',
      corto: '3 · Desenlace',
      etiqueta: 'Desenlace (¿Cómo termina?)',
      emoji: '🏁',
      color: '#16a34a'
    }
  };

  function actoDeEscena(k) {
    const s = prod.escenas[k];
    if (k === 0 && !s?.acto) return 'inicio';
    return ACTOS_META[s?.acto] ? s.acto : (k === 0 ? 'inicio' : (k === 1 ? 'nudo' : 'desenlace'));
  }

  function infoActoDeEscena(k) {
    const a = prod.anecdota || { inicio: '', nudo: '', desenlace: '' };
    const claveActo = actoDeEscena(k);
    const meta = ACTOS_META[claveActo] || ACTOS_META.inicio;
    return {
      ...meta,
      texto: (a[meta.id] || '').trim()
    };
  }

  function bannerAnecdotaEscenaHTML(k) {
    const info = infoActoDeEscena(k);
    const actoActual = info.id;
    return `
      <div class="banner-anecdota-escena" id="banner-anecdota-escena" style="--ac:${info.color}">
        <div class="banner-anecdota-escena__cab">
          <div class="banner-anecdota-escena__selector">
            <span class="banner-anecdota-escena__preg">📖 ¿A qué parte de la anécdota pertenece la <b>Escena ${k + 1}</b>?</span>
            <div class="banner-anecdota-escena__pills">
              ${Object.values(ACTOS_META).map((m) => `
                <button type="button" class="pill-acto ${actoActual === m.id ? 'activa' : ''}" style="--ac:${m.color}" data-elegir-acto="${m.id}">
                  ${m.emoji} ${esc(m.corto)}
                </button>
              `).join('')}
            </div>
          </div>
          ${info.texto ? `<button type="button" class="chip-filtro" data-usar-anecdota="${esc(info.texto)}">✨ Pasar al paso 3</button>` : ''}
        </div>
        <p class="banner-anecdota-escena__txt">
          ${info.texto
            ? `${info.emoji} <b>${esc(info.etiqueta)}:</b> "${esc(info.texto)}"`
            : `💡 <i>Aún no escribiste el <b>${esc(info.etiqueta)}</b> arriba en "La Anécdota de tu Película". ¡Puedes escribirlo arriba para guiarte!</i>`}
        </p>
      </div>
    `;
  }

  function seccionAnecdotaHTML() {
    const a = prod.anecdota || { inicio: '', nudo: '', desenlace: '' };
    return `
      <section class="anecdota-card" aria-label="La Anécdota de tu Película">
        <div class="anecdota-card__cab">
          <span class="anecdota-card__icono">📖</span>
          <div>
            <h2>La Anécdota de tu Película <small class="nota">(tu historia en 3 pasos cortos)</small></h2>
            <p>Resume de qué trata tu historia antes de animar: te servirá de guía en cada escena.</p>
          </div>
          <a class="btn3d btn3d--sm btn3d--blanco" href="folleto-tarea.html" target="_blank" rel="noopener" style="margin-left:auto; text-decoration:none;" title="Ver e imprimir hoja de planificación en papel">
            📄 Imprimir Folleto
          </a>
        </div>
        <div class="anecdota-grid">
          <label class="anecdota-item" style="--ac:#0284c7">
            <span class="anecdota-item__top"><span class="anecdota-item__badge">1 · Inicio</span> <b>¿Cómo empieza?</b></span>
            <input class="input-grande" data-campo="anecdota.inicio" value="${esc(a.inicio || '')}" maxlength="140" placeholder="Ej: Bip explora el bosque mágico buscando una semilla…">
          </label>
          <label class="anecdota-item" style="--ac:#d97706">
            <span class="anecdota-item__top"><span class="anecdota-item__badge">2 · Nudo / Problema</span> <b>¿Qué ocurre de inesperado?</b></span>
            <input class="input-grande" data-campo="anecdota.nudo" value="${esc(a.nudo || '')}" maxlength="140" placeholder="Ej: Un viento fuerte se lleva su mapa hacia el volcán…">
          </label>
          <label class="anecdota-item" style="--ac:#16a34a">
            <span class="anecdota-item__top"><span class="anecdota-item__badge">3 · Desenlace</span> <b>¿Cómo termina?</b></span>
            <input class="input-grande" data-campo="anecdota.desenlace" value="${esc(a.desenlace || '')}" maxlength="140" placeholder="Ej: Recupera el mapa con ayuda de sus amigos y celebra…">
          </label>
        </div>
      </section>
    `;
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

      <div id="contenedor-paso-3-accion">
        ${bannerAnecdotaEscenaHTML(k)}
        ${bloque(3, '#ff595e', '⚡ ¿Qué pasa en estos 8 segundos? <small class="nota">Una sola acción clara</small>', `
          <input id="input-paso-3-accion" class="input-grande" data-campo="${base}.accion" value="${esc(s.accion)}" placeholder="Ej: descubre una puerta secreta detrás de una cascada">
          <div class="ideas">💡 Ideas: ${IDEAS_ACCION.map((a) => `<button type="button" class="chip-filtro" data-idea="${esc(a)}">${esc(a)}</button>`).join('')}</div>`)}
      </div>

      ${bloque(4, '#1982c4', '🎥 ¿Cómo se mueve la cámara?',
        tarjetaSeleccionadaHTML('camara', `${base}.camaraId`, s.camaraId, false),
        botonVerTarjetas('camara', `${base}.camaraId`, false))}

      ${bloque(5, '#f72585', '💬 ¿Alguien dice algo? <small class="nota">(opcional, frase corta)</small>',
        `<input class="input-grande" data-campo="${base}.dialogo" value="${esc(s.dialogo)}" maxlength="120" placeholder="Ej: ¡Por fin encontré el tesoro!">`)}

      ${bloque(6, '#f72585', '🔊 ¿Qué música o sonidos se escuchan?',
        tarjetaSeleccionadaHTML('audio', `${base}.audioId`, s.audioId, false),
        botonVerTarjetas('audio', `${base}.audioId`, false))}
    `;
  }

  function salidaEscenas() {
    const k = Math.min(prod.escenaActiva, prod.escenas.length - 1);
    const sActiva = prod.escenas[k];
    const idxActiva = actoresDe(sActiva);

    const tarjetasEscenas = prod.escenas.map((s, idx) => {
      const esActiva = idx === k && prod.escenas.length > 1;
      const acto = ACTOS_META[actoDeEscena(idx)] || ACTOS_META.inicio;
      const actores = esc(unirNombres(actoresDe(s)));
      const subBadge = `<span class="anecdota-item__badge" style="--ac:${acto.color}">${acto.emoji} ${acto.corto}</span>`;

      if (s.modo === 'fotogramas') {
        const subImg = `${subBadge} <span>🖼️ Fotograma inicial · 🧑‍🚀 ${actores}</span>`;
        const subVid = `${subBadge} <span>🎞️ Fotogramas a video · 🧑‍🚀 ${actores}</span>`;
        return claqueta(`s${idx}-img`, `🅰️ Imagen inicial · Escena ${idx + 1}`, promptImagenInicial(s), 'amarillo', {
          activa: esActiva,
          subtitulo: subImg
        }) +
        claqueta(`s${idx}`, `🅱️ Video · Escena ${idx + 1}`, promptEscenaFotogramas(s), 'verde', {
          activa: esActiva,
          subtitulo: subVid,
          claveHecho: `s${idx}`,
          textoHecho: `¡Ya hice la Escena ${idx + 1} en Flow!`
        });
      }

      const subIng = `${subBadge} <span>🧩 Ingredientes: 🧑‍🚀 ${actores} + 🏞️ Escenario</span>`;
      return claqueta(`s${idx}`, `🎬 Video · Escena ${idx + 1}`, promptEscenaIngredientes(s), 'verde', {
        activa: esActiva,
        subtitulo: subIng,
        claveHecho: `s${idx}`,
        textoHecho: `¡Ya hice la Escena ${idx + 1} en Flow!`
      });
    }).join('');

    const pasos = sActiva.modo === 'fotogramas'
      ? [
          '<b>Imagen inicial:</b> crea una imagen en Flow con el prompt 🅰️ (o usa el último cuadro de tu escena anterior para que la historia continúe).',
          'Elige el modo <b>Fotogramas a video</b> y sube esa imagen como <b>fotograma inicial</b>.',
          'Copia el prompt 🅱️ y pégalo.',
          'Genera el video y quédate con la mejor versión.'
        ]
      : [
          'En Flow, elige el modo <b>Ingredientes a video</b>.',
          `Agrega las imágenes de tus ingredientes: <b>${esc(unirNombres(idxActiva))}</b> y el <b>escenario</b> (máximo 3 imágenes).`,
          'Copia el prompt de la escena que quieras grabar y pégalo.',
          'Genera el video. Si algo sale raro, cambia una sola cosa y vuelve a intentar.'
        ];

    return (sActiva.modo === 'fotogramas' ? '' : ingredientes(idxActiva)) +
      tarjetasEscenas +
      pasosFlow(pasos);
  }

  // ---------- Etapa 4: Mi película ----------
  function promptsDeEscena(s, j) {
    return s.modo === 'fotogramas'
      ? [
          ['Imagen inicial', textoFinalDe(`s${j}-img`, promptImagenInicial(s)), `s${j}-img`],
          ['Video (Fotogramas a video)', textoFinalDe(`s${j}`, promptEscenaFotogramas(s)), `s${j}`]
        ]
      : [
          ['Video (Ingredientes a video)', textoFinalDe(`s${j}`, promptEscenaIngredientes(s)), `s${j}`]
        ];
  }

  function guionCompleto() {
    const L = [];
    L.push(`🎬 ${prod.titulo.trim() || 'Mi película'} — hecha con Luces, Cámara, IA`);
    L.push(`Estilo: ${estiloTxt()}`, '');
    const a = prod.anecdota || {};
    if ((a.inicio || '').trim() || (a.nudo || '').trim() || (a.desenlace || '').trim()) {
      L.push('📖 LA ANÉCDOTA DE LA PELÍCULA');
      if ((a.inicio || '').trim()) L.push(`  • Inicio: ${a.inicio.trim()}`);
      if ((a.nudo || '').trim()) L.push(`  • Nudo / Problema: ${a.nudo.trim()}`);
      if ((a.desenlace || '').trim()) L.push(`  • Desenlace: ${a.desenlace.trim()}`);
      L.push('');
    }
    prod.personajes.forEach((_, i) => {
      L.push(`🧑‍🚀 PERSONAJE: ${nombreDe(i)} (imagen)`, textoFinalDe(`p${i}`, promptPersonaje(i)), '');
    });
    L.push('🏞️ ESCENARIO (imagen)', textoFinalDe('esc', promptEscenario()), '');
    prod.escenas.forEach((s, j) => {
      const dlg = (s.dialogo || '').trim();
      const infoActo = infoActoDeEscena(j);
      promptsDeEscena(s, j).forEach(([t, p]) => {
        L.push(`🎬 ESCENA ${j + 1} (${infoActo.corto}) — ${t}`);
        if (dlg && t.startsWith('Video')) {
          L.push(`💬 Diálogo (${unirNombres(actoresDe(s))}): "${dlg}"`);
        }
        L.push(p, '');
      });
    });
    return L.join('\n');
  }

  function vistaPelicula() {
    salida.guion = guionCompleto();
    const tarjeta = (clavePrompt, emoji, titulo, sub, texto, ok, extraHTML = '') => {
      metaClaqueta[clavePrompt] = { clave: clavePrompt, titulo: `${emoji} ${titulo} · ${sub}`, colorBoton: 'verde' };
      salida[clavePrompt] = texto;
      const editado = tieneEdicionManual(clavePrompt);
      return `<div class="fotograma ${ok ? 'ok' : ''}">
        <div class="fotograma__cab">
          <span>${emoji}</span>
          <strong>${titulo}</strong>
          ${editado ? '<span class="badge-mini">✏️ Editado</span>' : ''}
          ${ok ? '<span class="fotograma__ok">✅</span>' : ''}
        </div>
        <small>${sub}</small>
        ${extraHTML}
        <p>${esc(texto)}</p>
        <div class="fotograma__acciones">
          <button type="button" class="btn3d btn3d--sm btn3d--verde" data-copiar="${esc(clavePrompt)}">📋 Copiar</button>
          <button type="button" class="btn3d btn3d--sm btn3d--amarillo" data-ver-prompt="${esc(clavePrompt)}">🎬 Ver / Editar</button>
        </div>
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
          ${prod.personajes.map((_, i) => tarjeta(`p${i}`, '🧑‍🚀', esc(nombreDe(i)), 'Personaje · Imagen', textoFinalDe(`p${i}`, promptPersonaje(i)), prod.hecho[`p${i}`])).join('')}
          ${tarjeta('esc', '🏞️', 'Escenario', 'Fondo · Imagen', textoFinalDe('esc', promptEscenario()), prod.hecho.esc)}
          ${prod.escenas.map((s, j) => {
            const dlg = (s.dialogo || '').trim();
            const quienHabla = unirNombres(actoresDe(s));
            const infoActo = infoActoDeEscena(j);
            return promptsDeEscena(s, j).map(([t, p, claveReal]) => {
              const mostrarDlg = dlg && t.startsWith('Video')
                ? `<div class="fotograma__dialogo">💬 <b>${esc(quienHabla)} dice:</b> «${esc(dlg)}»</div>`
                : '';
              return tarjeta(claveReal, '🎬', `Escena ${j + 1} (${infoActo.emoji} ${infoActo.corto})`, esc(t), p, prod.hecho[`s${j}`], mostrarDlg);
            }).join('');
          }).join('')}
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
        <button type="button" class="chip-filtro" data-abrir-tarjetas-prod="estiloId" data-cat="estilo" data-propio="0">🖼️ Ver tarjetas</button>
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

      ${seccionAnecdotaHTML()}

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
      if (el.dataset.campo.startsWith('anecdota.')) {
        if (prod.etapa === 2) {
          const k = Math.min(prod.escenaActiva, prod.escenas.length - 1);
          const ban = $('#banner-anecdota-escena');
          if (ban) ban.outerHTML = bannerAnecdotaEscenaHTML(k);
        } else if (prod.etapa === 3) {
          salida.guion = guionCompleto();
        }
        return;
      }
      if (/^personajes\.(\d+)\.nombre$/.test(el.dataset.campo)) {
        const idx = Number(RegExp.$1);
        const btnTab = root.querySelector(`[data-personaje-activo="${idx}"]`);
        if (btnTab) {
          btnTab.innerHTML = `🧑‍🚀 ${esc(nombreDe(idx))} ${prod.hecho[`p${idx}`] ? '✅' : ''}`;
        }
      }
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

    function validarPaso3Escena(clave) {
      if (prod.etapa !== 2) return true;
      const m = /^s(\d+)$/.exec(clave);
      if (!m) return true;
      const j = Number(m[1]);
      const textoACopiar = salida[clave] || '';
      const s = prod.escenas[j];
      if (!(s?.accion || '').trim() || textoACopiar.includes('[¿qué hace?]')) {
        if (prod.escenaActiva !== j) {
          prod.escenaActiva = j;
          guardar();
          render();
        }
        const contPaso3 = $('#contenedor-paso-3-accion');
        const inpPaso3 = $('#input-paso-3-accion');
        if (contPaso3) {
          contPaso3.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const bloqueEl = contPaso3.querySelector('.bloque-var') || contPaso3;
          bloqueEl.classList.remove('bloque-var--alerta');
          void bloqueEl.offsetWidth;
          bloqueEl.classList.add('bloque-var--alerta');
          setTimeout(() => bloqueEl.classList.remove('bloque-var--alerta'), 2200);
        }
        if (inpPaso3) setTimeout(() => inpPaso3.focus({ preventScroll: true }), 350);
        toast(`¡Primero escribe o elige qué hace tu personaje en el paso 3 de la Escena ${j + 1}!`);
        return false;
      }
      return true;
    }

    root.addEventListener('click', async (ev) => {
      const t = (sel) => ev.target.closest(sel);
      let b;

      if ((b = t('[data-abrir-tarjetas-prod]'))) {
        const campo = b.dataset.abrirTarjetasProd;
        const catId = b.dataset.cat;
        const conPropio = b.dataset.propio === '1';
        const actualId = getPath(prod, campo) || '';
        if (typeof abrirSelectorVisual === 'function') {
          abrirSelectorVisual(campo, catId, {
            actualId,
            conPropio,
            onSelect: (nuevoId) => {
              setPath(prod, campo, nuevoId);
              if (/\.baseId$/.test(campo)) {
                const it = nuevoId ? itemById(nuevoId) : null;
                setPath(prod, campo.replace(/baseId$/, 'descripcion'), it ? textoPieza(it) : '');
              }
              guardar();
              render();
            }
          });
        }
        return;
      }
      if ((b = t('[data-ver-prompt]'))) {
        const clave = b.dataset.verPrompt;
        if (!validarPaso3Escena(clave)) return;
        abrirModalPrompt(clave, false);
        return;
      }
      if ((b = t('[data-copiar]'))) {
        const clave = b.dataset.copiar;
        if (clave !== 'guion' && !validarPaso3Escena(clave)) return;
        const textoACopiar = salida[clave] || '';
        await copiar(textoACopiar);
        const txt = b.innerHTML;
        b.innerHTML = '✅ ¡COPIADO!';
        setTimeout(() => { b.innerHTML = txt; }, 1600);
        toast('📋 ¡Copiado! Ahora pégalo en Flow');
        return;
      }
      if ((b = t('[data-elegir-acto]'))) {
        const k = Math.min(prod.escenaActiva, prod.escenas.length - 1);
        prod.escenas[k].acto = b.dataset.elegirActo;
        guardar();
        const ban = $('#banner-anecdota-escena');
        if (ban) ban.outerHTML = bannerAnecdotaEscenaHTML(k);
        return;
      }
      if ((b = t('[data-usar-anecdota]'))) {
        const k = Math.min(prod.escenaActiva, prod.escenas.length - 1);
        prod.escenas[k].accion = b.dataset.usarAnecdota;
        guardar(); render();
        toast('✨ Idea de la anécdota copiada al paso 3');
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
        const actoSugerido = prod.escenas.length === 1 ? 'nudo' : (anterior?.acto || 'desenlace');
        const nueva = nuevaEscena(actoSugerido);
        if (anterior) { nueva.quien = anterior.quien; nueva.audioId = anterior.audioId; }
        prod.escenas.push(nueva);
        prod.escenaActiva = prod.escenas.length - 1;
        guardar(); render();
        toast('🎬 Nueva escena creada: elige a qué parte de la anécdota pertenece');
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

    const dlgPrompt = $('#dlg-prompt-prod');
    if (dlgPrompt) {
      dlgPrompt.addEventListener('click', async (ev) => {
        if (ev.target === dlgPrompt) {
          dlgPrompt.close();
          return;
        }
        const t = (sel) => ev.target.closest(sel);
        let b;

        if (t('[data-cerrar-modal-prompt]')) {
          dlgPrompt.close();
          return;
        }
        if ((b = t('[data-toggle-editar-prompt]'))) {
          modalPromptEditando = !modalPromptEditando;
          renderModalPrompt();
          if (modalPromptEditando) {
            setTimeout(() => $('#textarea-prompt-manual')?.focus(), 60);
          }
          return;
        }
        if (t('[data-cancelar-edicion-prompt]')) {
          modalPromptEditando = false;
          renderModalPrompt();
          return;
        }
        if ((b = t('[data-guardar-prompt-manual]'))) {
          const clave = b.dataset.guardarPromptManual;
          const nuevoTxt = ($('#textarea-prompt-manual')?.value || '').trim();
          prod.customPrompts = prod.customPrompts || {};
          if (nuevoTxt && nuevoTxt !== (salidaAuto[clave] || '').trim()) {
            prod.customPrompts[clave] = nuevoTxt;
            salida[clave] = nuevoTxt;
          } else {
            delete prod.customPrompts[clave];
            salida[clave] = salidaAuto[clave] || nuevoTxt;
          }
          modalPromptEditando = false;
          guardar();
          if (prod.etapa === 3) render(); else renderSalida();
          renderModalPrompt();
          toast('✏️ Prompt actualizado a mano');
          return;
        }
        if ((b = t('[data-restaurar-prompt-auto]'))) {
          const clave = b.dataset.restaurarPromptAuto;
          if (prod.customPrompts) delete prod.customPrompts[clave];
          salida[clave] = salidaAuto[clave] || '';
          modalPromptEditando = false;
          guardar();
          if (prod.etapa === 3) render(); else renderSalida();
          renderModalPrompt();
          toast('🔄 Prompt restaurado al automático');
          return;
        }
        if ((b = t('[data-copiar]'))) {
          const clave = b.dataset.copiar;
          // Si está editando a mano y toca Copiar directamente, guardamos primero lo que escribió
          if (modalPromptEditando) {
            const txtArea = $('#textarea-prompt-manual');
            if (txtArea && txtArea.value.trim()) {
              prod.customPrompts = prod.customPrompts || {};
              prod.customPrompts[clave] = txtArea.value.trim();
              salida[clave] = txtArea.value.trim();
              guardar();
              if (prod.etapa === 3) render(); else renderSalida();
            }
          }
          await copiar(salida[clave] || '');
          const txt = b.innerHTML;
          b.innerHTML = '✅ ¡COPIADO!';
          setTimeout(() => { b.innerHTML = txt; }, 1600);
          toast('📋 ¡Copiado! Ahora pégalo en Flow');
        }
      });
    }

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
      prod = normalizarProduccion({ ...nuevaProduccion(), ...ev.detail });
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
