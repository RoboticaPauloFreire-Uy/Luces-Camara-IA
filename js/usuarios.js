/* =====================================================================
   Luces, Cámara, IA — Conexión con Usuarios y Nube (Colegio Paulo Freire)
   ---------------------------------------------------------------------
   Se conecta a la misma base de datos Firebase ("paulofreiredb") que
   https://roboticapaulofreire-uy.github.io/bienvenido/
   - Comparte el mismo localStorage ('pf_active_student_id' / 'pf_active_student_data')
     para que si el alumno ya inició sesión en Bienvenido, entre directo.
   - Valida el mismo Usuario (ej: agumor o nombre) y PIN de 4 dígitos.
   - Permite a cada alumno guardar, cargar y administrar varias películas
     en la nube (colección 'flow_movies' en Firestore) y en su navegador.
   ===================================================================== */
(() => {
  'use strict';

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDBHslk40Wo36UHqXLzNEPRcIPAtw19Pco",
    authDomain: "paulofreiredb.firebaseapp.com",
    projectId: "paulofreiredb",
    storageBucket: "paulofreiredb.firebasestorage.app",
    messagingSenderId: "11038166833",
    appId: "1:11038166833:web:efa61fcd614b7f05a8ea10",
    measurementId: "G-DH4JVWY64M"
  };

  const STORAGE_KEY = 'pf_active_student_id';
  const STORAGE_DATA_KEY = 'pf_active_student_data';
  const STORAGE_LAST_ACTIVITY = 'pf_student_last_activity';
  const STORAGE_LOGIN_TIME = 'pf_student_login_time';
  const SESSION_TIMEOUT_MS = 20 * 60 * 1000;
  const ALUMNOS_FALLBACK_URL = 'https://roboticapaulofreire-uy.github.io/bienvenido/alumnos_clean.json';
  const COLLECTION_MOVIES = 'flow_movies';

  let db = null;
  try {
    if (typeof firebase !== 'undefined') {
      const app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore(app);
    }
  } catch (e) {
    console.warn('No se pudo inicializar Firebase:', e);
  }

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  // ---------- Sesión del alumno ----------
  function isSessionExpired() {
    const raw = localStorage.getItem(STORAGE_LAST_ACTIVITY);
    if (!raw) return false;
    const last = parseInt(raw, 10);
    return !isNaN(last) && last > 0 && (Date.now() - last) >= SESSION_TIMEOUT_MS;
  }

  function touchActivity() {
    if (localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_LAST_ACTIVITY, String(Date.now()));
    }
  }

  function getActiveStudent() {
    try {
      if (isSessionExpired()) {
        clearSession();
        return null;
      }
      const raw = localStorage.getItem(STORAGE_DATA_KEY);
      if (!raw) return null;
      const st = JSON.parse(raw);
      return st && st.id ? st : null;
    } catch {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_DATA_KEY);
    localStorage.removeItem(STORAGE_LAST_ACTIVITY);
    localStorage.removeItem(STORAGE_LOGIN_TIME);
  }

  function setActiveStudent(st) {
    if (st && st.id) {
      const now = String(Date.now());
      localStorage.setItem(STORAGE_KEY, st.id);
      localStorage.setItem(STORAGE_DATA_KEY, JSON.stringify(st));
      localStorage.setItem(STORAGE_LAST_ACTIVITY, now);
      localStorage.setItem(STORAGE_LOGIN_TIME, now);
    } else {
      clearSession();
    }
    pintarBotonUsuario();
    window.dispatchEvent(new CustomEvent('pf_student_changed', { detail: getActiveStudent() }));
  }

  // ---------- Autenticación (idéntica a Bienvenido) ----------
  let cacheAlumnosJson = null;

  async function autenticarAlumno(userOrName, pass) {
    const cleanUser = norm(userOrName);
    const cleanPass = String(pass ?? '').trim();
    if (!cleanUser || !cleanPass) return [];

    // 1. Consultar Firestore colección 'students'
    if (db) {
      try {
        const ref = db.collection('students');

        // Por username exacto + password
        const snapUser = await ref
          .where('username', '==', userOrName.trim().toLowerCase())
          .where('password', '==', cleanPass)
          .limit(5)
          .get();
        if (!snapUser.empty) {
          return snapUser.docs.map((d) => ({ id: d.id, ...d.data() }));
        }

        // Por ID de documento directo
        const docId = await ref.doc(userOrName.trim().toLowerCase()).get();
        if (docId.exists && String(docId.data().password) === cleanPass) {
          return [{ id: docId.id, ...docId.data() }];
        }

        // Por PIN (password) y coincidencia de nombre, primer nombre o usuario
        const snapPass = await ref.where('password', '==', cleanPass).limit(80).get();
        const encontrados = [];
        snapPass.forEach((doc) => {
          const d = doc.data();
          const fullName = norm(d.name);
          const firstName = fullName.split(/\s+/)[0];
          const u = norm(d.username);
          const id = norm(doc.id);
          if (fullName === cleanUser || firstName === cleanUser || u === cleanUser || id === cleanUser) {
            encontrados.push({ id: doc.id, ...d });
          }
        });
        if (encontrados.length) return encontrados;
      } catch (e) {
        console.warn('Error consultando Firestore students:', e);
      }
    }

    // 2. Respaldo contra alumnos creados desde admin.html en el navegador ('pf_alumnos_nuevos_2026')
    try {
      const rawNuevos = localStorage.getItem('pf_alumnos_nuevos_2026');
      if (rawNuevos) {
        const nuevos = JSON.parse(rawNuevos);
        if (Array.isArray(nuevos)) {
          const encontradosLocales = nuevos.filter((s) => {
            if (String(s.password) !== cleanPass) return false;
            const fullName = norm(s.name);
            const firstName = fullName.split(/\s+/)[0];
            return norm(s.username) === cleanUser || norm(s.id) === cleanUser || fullName === cleanUser || firstName === cleanUser;
          });
          if (encontradosLocales.length) {
            // Sincronizar automáticamente a Firestore para que pueda entrar desde cualquier equipo
            if (db) {
              encontradosLocales.forEach((st) => {
                const docKey = st.id || st.username;
                if (docKey) db.collection('students').doc(docKey).set(st, { merge: true }).catch(() => {});
              });
            }
            return encontradosLocales;
          }
        }
      }
    } catch (e) {}

    // 3. Respaldo con alumnos_clean.json de Bienvenido
    try {
      if (!cacheAlumnosJson) {
        const r = await fetch(ALUMNOS_FALLBACK_URL);
        if (r.ok) cacheAlumnosJson = await r.json();
      }
      if (Array.isArray(cacheAlumnosJson)) {
        const matches = cacheAlumnosJson.filter((s) => {
          if (String(s.password) !== cleanPass) return false;
          const fullName = norm(s.name);
          const firstName = fullName.split(/\s+/)[0];
          return norm(s.username) === cleanUser || norm(s.id) === cleanUser || fullName === cleanUser || firstName === cleanUser;
        });
        if (matches.length) return matches;
      }
    } catch (e) {
      console.warn('No se pudo cargar respaldo alumnos_clean.json:', e);
    }

    return [];
  }

  // ---------- Películas por alumno (Firestore + Respaldo Local) ----------
  function lsKeyPeliculas(studentId) {
    return `lci:peliculas:${studentId || 'invitado'}`;
  }

  function listarPeliculasLocales(studentId) {
    try {
      const arr = JSON.parse(localStorage.getItem(lsKeyPeliculas(studentId)));
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function guardarPeliculasLocales(studentId, lista) {
    localStorage.setItem(lsKeyPeliculas(studentId), JSON.stringify(lista));
  }

  async function listarPeliculasAlumno(student) {
    const sid = student?.id || 'invitado';
    const locales = listarPeliculasLocales(sid);

    if (!student || !db) return locales;

    try {
      const snap = await db.collection(COLLECTION_MOVIES)
        .where('studentId', '==', student.id)
        .get();
      const remotas = [];
      snap.forEach((doc) => {
        const d = doc.data();
        remotas.push({
          id: doc.id,
          ...d
        });
      });
      // Combinar remotas y locales por id (priorizando la más reciente)
      const mapa = new Map();
      locales.forEach((p) => mapa.set(p.id, p));
      remotas.forEach((p) => {
        const prev = mapa.get(p.id);
        if (!prev || (p.updatedAt || 0) >= (prev.updatedAt || 0)) {
          mapa.set(p.id, p);
        }
      });
      const unificadas = [...mapa.values()].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      guardarPeliculasLocales(sid, unificadas);
      return unificadas;
    } catch (e) {
      console.warn('Error listando películas en Firestore:', e);
      return locales;
    }
  }

  async function guardarPeliculaAlumno(student, peliculaData) {
    const sid = student?.id || 'invitado';
    const now = Date.now();
    const movieId = peliculaData.movieId || ('mov-' + sid + '-' + now.toString(36));
    const registro = {
      id: movieId,
      movieId,
      studentId: sid,
      studentName: student?.name || 'Invitado',
      studentUsername: student?.username || '',
      gradeName: student?.gradeName || '',
      titulo: (peliculaData.titulo || '').trim() || 'Mi película sin título',
      youtubeUrl: (peliculaData.youtubeUrl || '').trim(),
      produccion: JSON.parse(JSON.stringify(peliculaData)),
      updatedAt: now,
      updatedAtISO: new Date(now).toISOString()
    };

    // 1. Guardar en localStorage inmediato
    const lista = listarPeliculasLocales(sid).filter((x) => x.id !== movieId);
    lista.unshift(registro);
    guardarPeliculasLocales(sid, lista);

    // 2. Guardar en Firestore si hay alumno logueado
    let enNube = false;
    if (student && db) {
      try {
        await db.collection(COLLECTION_MOVIES).doc(movieId).set(registro, { merge: true });
        enNube = true;
      } catch (e) {
        console.warn('No se pudo guardar en Firestore, quedó en este navegador:', e);
      }
    }

    return { registro, enNube };
  }

  async function eliminarPeliculaAlumno(student, movieId) {
    const sid = student?.id || 'invitado';
    const lista = listarPeliculasLocales(sid).filter((x) => x.id !== movieId);
    guardarPeliculasLocales(sid, lista);
    if (student && db) {
      try {
        await db.collection(COLLECTION_MOVIES).doc(movieId).delete();
      } catch (e) {
        console.warn('Error al borrar película en Firestore:', e);
      }
    }
  }

  // ---------- UI: Botón en cabecera + Modal de Login con Caja Fuerte PIN ----------
  function pintarBotonUsuario() {
    const btn = document.getElementById('btn-usuario');
    if (!btn) return;
    const st = getActiveStudent();
    if (st) {
      btn.className = 'btn3d btn3d--usuario-activo';
      btn.innerHTML = `
        <span class="usr-avatar">${esc(st.avatar || '🧑‍🚀')}</span>
        <span class="usr-info">
          <strong>${esc(st.name)}</strong>
          <small>${esc(st.gradeName || st.username || 'Alumno')}</small>
        </span>
      `;
    } else {
      btn.className = 'btn3d btn3d--blanco';
      btn.innerHTML = '🔐 Ingreso Alumnos';
    }
  }

  function abrirModalUsuario() {
    const dlg = document.getElementById('dlg-usuario');
    if (!dlg) return;
    const st = getActiveStudent();
    if (st) {
      renderPerfilAlumno(st);
    } else {
      renderFormularioLogin();
    }
    if (!dlg.open) dlg.showModal();
  }

  function renderPerfilAlumno(st) {
    const caja = document.getElementById('usuario-modal-cuerpo');
    caja.innerHTML = `
      <div class="usr-perfil">
        <div class="usr-perfil__ficha">
          <span class="usr-perfil__avatar">${esc(st.avatar || '🧑‍🚀')}</span>
          <div>
            <span class="badge-mini">COLEGIO PAULO FREIRE · ${esc(st.gradeName || '')}</span>
            <h3>${esc(st.name)}</h3>
            <p>Usuario: <code>${esc(st.username || st.id)}</code></p>
          </div>
          <button type="button" class="btn3d btn3d--sm btn3d--rojo" id="btn-cerrar-sesion">🚪 Cerrar sesión</button>
        </div>

        <div class="usr-peliculas-cab">
          <h3>🎞️ Mis Películas Guardadas</h3>
          <button type="button" class="btn3d btn3d--sm btn3d--verde" id="btn-guardar-actual-modal">💾 Guardar película actual</button>
        </div>
        <div id="lista-mis-peliculas" class="usr-peliculas-lista">
          <p class="nota">⏳ Cargando tus películas de la nube…</p>
        </div>
      </div>
    `;

    document.getElementById('btn-cerrar-sesion').onclick = () => {
      setActiveStudent(null);
      document.getElementById('dlg-usuario').close();
    };

    document.getElementById('btn-guardar-actual-modal').onclick = () => {
      window.dispatchEvent(new CustomEvent('pf_request_save_current_movie'));
    };

    cargarYPintarListaPeliculas(st);
  }

  async function cargarYPintarListaPeliculas(st) {
    const cont = document.getElementById('lista-mis-peliculas');
    if (!cont) return;
    const pelis = await listarPeliculasAlumno(st);
    if (!pelis.length) {
      cont.innerHTML = `<div class="usr-vacio">
        <p>🎬 Todavía no tienes películas guardadas en tu cuenta.</p>
        <p class="nota">Ve a la pestaña <b>🎞️ Mi Película</b>, escribe el título y pulsa <b>💾 Guardar en mi cuenta</b>.</p>
      </div>`;
      return;
    }

    cont.innerHTML = pelis.map((p) => {
      const fecha = p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('es-UY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
      const nPers = p.produccion?.personajes?.length || 1;
      const nEsc = p.produccion?.escenas?.length || 1;
      return `
        <div class="card-mi-peli" data-movie-id="${esc(p.id)}">
          <div class="card-mi-peli__info">
            <strong>🎞️ ${esc(p.titulo)}</strong>
            <small>🧑‍🚀 ${nPers} personaje${nPers > 1 ? 's' : ''} · 🎬 ${nEsc} escena${nEsc > 1 ? 's' : ''} · 🕒 ${esc(fecha)}</small>
            ${p.youtubeUrl ? `<a href="${esc(p.youtubeUrl)}" target="_blank" rel="noopener" class="yt-ext">▶️ Ver mi video subido ↗</a>` : ''}
          </div>
          <div class="card-mi-peli__acciones">
            <button type="button" class="btn3d btn3d--sm btn3d--amarillo" data-cargar-peli="${esc(p.id)}">📂 Abrir</button>
            <button type="button" class="btn3d btn3d--sm btn3d--rojo" data-borrar-peli="${esc(p.id)}" title="Borrar película">🗑️</button>
          </div>
        </div>
      `;
    }).join('');

    cont.onclick = async (e) => {
      const bCargar = e.target.closest('[data-cargar-peli]');
      if (bCargar) {
        const peli = pelis.find((x) => x.id === bCargar.dataset.cargarPeli);
        if (peli && peli.produccion) {
          window.dispatchEvent(new CustomEvent('pf_load_movie', { detail: peli.produccion }));
          document.getElementById('dlg-usuario').close();
        }
        return;
      }
      const bBorrar = e.target.closest('[data-borrar-peli]');
      if (bBorrar) {
        const peli = pelis.find((x) => x.id === bBorrar.dataset.borrarPeli);
        if (!peli || !confirm(`¿Eliminar la película "${peli.titulo}"?`)) return;
        await eliminarPeliculaAlumno(st, peli.id);
        cargarYPintarListaPeliculas(st);
      }
    };
  }

  function renderFormularioLogin() {
    const caja = document.getElementById('usuario-modal-cuerpo');
    let pin = '';

    caja.innerHTML = `
      <form id="form-login-pf" class="login-pf">
        <div class="login-pf__col">
          <p class="login-pf__intro">Usá el <b>mismo usuario y clave de 4 números</b> que en la página del Taller de Robótica:</p>
          <label class="login-pf__label">
            🧑‍🚀 Tu Usuario o Nombre
            <input type="text" id="login-pf-user" class="input-grande" placeholder="Ej: agumor o tu nombre" required autocomplete="username">
          </label>
          <div class="login-pf__pista">
            <div>💡 <b>Usuario:</b> 3 primeras letras de tu nombre + 3 de tu apellido (ej: <code>agumor</code>)</div>
            <div>🔑 <b>Clave:</b> tu PIN de 4 números en el teclado</div>
          </div>
          <p id="login-pf-error" class="login-pf__error" hidden>❌ Usuario o PIN incorrecto. Probá de nuevo.</p>
          <button type="submit" id="login-pf-submit" class="btn3d btn3d--gigante btn3d--verde">
            🔓 Abrir e Iniciar Sesión
          </button>
        </div>

        <div class="login-pf__vault">
          <div class="vault-cab">🔒 CAJA FUERTE · PIN 4 DÍGITOS</div>
          <div class="vault-pantalla" id="vault-slots">
            <span class="vault-slot">_</span>
            <span class="vault-slot">_</span>
            <span class="vault-slot">_</span>
            <span class="vault-slot">_</span>
          </div>
          <div class="vault-teclado">
            ${[1,2,3,4,5,6,7,8,9].map((n) => `<button type="button" class="vault-tecla" data-digito="${n}">${n}</button>`).join('')}
            <button type="button" class="vault-tecla vault-tecla--limpiar" data-vault="clear">C</button>
            <button type="button" class="vault-tecla" data-digito="0">0</button>
            <button type="button" class="vault-tecla vault-tecla--borrar" data-vault="back">⌫</button>
          </div>
        </div>
      </form>
      <div id="login-pf-picker" hidden></div>
    `;

    const actualizarPantallaPin = () => {
      const slots = caja.querySelectorAll('.vault-slot');
      slots.forEach((s, i) => {
        s.textContent = pin[i] ? '●' : '_';
        s.classList.toggle('lleno', !!pin[i]);
      });
    };

    const agregarDigito = (d) => {
      if (pin.length < 4) {
        pin += d;
        actualizarPantallaPin();
      }
    };

    caja.querySelector('.vault-teclado').addEventListener('click', (e) => {
      const t = e.target.closest('button');
      if (!t) return;
      if (t.dataset.digito) agregarDigito(t.dataset.digito);
      if (t.dataset.vault === 'clear') { pin = ''; actualizarPantallaPin(); }
      if (t.dataset.vault === 'back') { pin = pin.slice(0, -1); actualizarPantallaPin(); }
    });

    // Permitir escribir los números con el teclado físico cuando no está enfocado el campo usuario
    const form = document.getElementById('form-login-pf');
    form.addEventListener('keydown', (e) => {
      if (e.target.id === 'login-pf-user') return;
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); agregarDigito(e.key); }
      if (e.key === 'Backspace') { e.preventDefault(); pin = pin.slice(0, -1); actualizarPantallaPin(); }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = document.getElementById('login-pf-user').value.trim();
      const errEl = document.getElementById('login-pf-error');
      const btn = document.getElementById('login-pf-submit');
      errEl.hidden = true;

      if (!user || pin.length < 4) {
        errEl.textContent = '⚠️ Escribe tu usuario y los 4 números de tu PIN.';
        errEl.hidden = false;
        return;
      }

      btn.disabled = true;
      btn.textContent = '⏳ Buscando director/a…';
      try {
        const matches = await autenticarAlumno(user, pin);
        if (matches.length === 1) {
          setActiveStudent(matches[0]);
          renderPerfilAlumno(matches[0]);
        } else if (matches.length > 1) {
          mostrarSelectorAlumnos(matches);
        } else {
          errEl.textContent = '❌ Usuario o PIN incorrecto. Probá de nuevo.';
          errEl.hidden = false;
          pin = '';
          actualizarPantallaPin();
        }
      } finally {
        btn.disabled = false;
        btn.textContent = '🔓 Abrir e Iniciar Sesión';
      }
    });

    function mostrarSelectorAlumnos(lista) {
      form.hidden = true;
      const picker = document.getElementById('login-pf-picker');
      picker.hidden = false;
      picker.innerHTML = `
        <p class="login-pf__intro">Encontramos varios alumnos con ese nombre. <b>Hacé clic en el tuyo:</b></p>
        <div class="usr-peliculas-lista">
          ${lista.map((st) => `
            <button type="button" class="card-mi-peli" data-elegir-st="${esc(st.id)}">
              <span class="usr-perfil__avatar">${esc(st.avatar || '🧑‍🚀')}</span>
              <div class="card-mi-peli__info">
                <strong>${esc(st.name)}</strong>
                <small>${esc(st.gradeName || '')} · Usuario: ${esc(st.username || st.id)}</small>
              </div>
            </button>
          `).join('')}
        </div>
      `;
      picker.onclick = (ev) => {
        const card = ev.target.closest('[data-elegir-st]');
        if (!card) return;
        const elegido = lista.find((x) => x.id === card.dataset.elegirSt);
        if (elegido) {
          setActiveStudent(elegido);
          renderPerfilAlumno(elegido);
        }
      };
    }
  }

  // ---------- Inicialización ----------
  function init() {
    ['click', 'keydown', 'mousemove', 'touchstart'].forEach((ev) => {
      window.addEventListener(ev, touchActivity, { passive: true });
    });

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY || e.key === STORAGE_DATA_KEY) {
        pintarBotonUsuario();
        window.dispatchEvent(new CustomEvent('pf_student_changed', { detail: getActiveStudent() }));
      }
    });

    const btn = document.getElementById('btn-usuario');
    if (btn) btn.addEventListener('click', abrirModalUsuario);

    pintarBotonUsuario();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PFUsuarios = {
    getActiveStudent,
    abrirModalUsuario,
    listarPeliculasAlumno,
    guardarPeliculaAlumno,
    eliminarPeliculaAlumno
  };
})();
