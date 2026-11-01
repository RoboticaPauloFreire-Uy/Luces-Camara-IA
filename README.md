# 🎬 Luces, Cámara, IA

> **Estudio de cine escolar (5° y 6°)** para crear películas, escenas y prompts en español con [Google Flow](https://labs.google/fx/tools/flow).

Aplicación web 100 % estática (sin servidor ni instalaciones). Incluye:

- 🎞️ **Mi Película (Producción paso a paso)**: guía a los alumnos igual que el flujo real de Google Flow:
  1. **🧑‍🚀 Personajes** (genera el prompt de imagen en cuerpo completo sobre fondo blanco para usarlo como *ingrediente*).
  2. **🏞️ Escenario** (genera el prompt del lugar sin personajes como *ingrediente de fondo*).
  3. **🎬 Escenas** (permite elegir entre **Ingredientes a video** o **Fotogramas a video**, con selección de cámara, acción y diálogo).
  4. **🎞️ Guion completo** (resumen de toda la película lista para copiar escena por escena o completa).
- 🎬 **Escenas de Video**: plantillas prefabricadas completas con variables rellenables mediante formulario.
- 🎥 **Laboratorio de Cámara**: 20 movimientos, planos y ángulos de cine explicados para niños con **diagramas animados SVG** y prompts listos para probar.
- 🖼️ **Crear Imágenes**: portadas de cuento, pósters de cine, fichas de personaje y dibujos para colorear.
- 🧩 **Catálogo de Piezas**: estilos visuales, personajes, escenarios y efectos de sonido reutilizables.
- 📺 **Monitor de Resultados en YouTube**: muestra los videos de ejemplo incrustados dentro de cada plantilla.

---

## 📁 Estructura del proyecto

```
├── index.html         → Página principal
├── biblioteca.js      → Todos los prompts, categorías y clave del Modo Profe
├── css/estilos.css    → Diseño visual estilo Estudio de Cine / Videojuego
└── js/
    ├── app.js         → Constructor interactivo, buscador, favoritos y Modo Profe
    └── produccion.js  → Módulo "Mi Película" (producción paso a paso)
```

---

## 👩‍🏫 Modo Profe (agregar prompts y links de YouTube)

1. Haz **5 clics seguidos en la claqueta 🎬** arriba a la izquierda (o abre el link con `?profe` al final).
2. Ingresa la clave (por defecto **`1234`**, configurable en `"pin"` dentro de `biblioteca.js`).
3. Crea o edita plantillas, pega los links de YouTube de los resultados (`https://youtu.be/... | Título opcional`, uno por línea) y pulsa **💾 Exportar biblioteca.js**.
4. Sube el archivo `biblioteca.js` descargado a este repositorio de GitHub para que todos los alumnos vean los cambios.
