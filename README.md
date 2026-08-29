# 🧇 Dulce Tentación — Repostería & Gelato Artesanal

Aplicación Web Ecommerce e interactiva desarrollada con **Next.js 16 (Turbopack)**, **Tailwind CSS**, **Framer Motion** y **Cloudinary**.

---

## 📌 Estado Actual del Proyecto (Punto donde nos quedamos)

- **Entorno:** Trabajo **100% en Servidor Local** (`http://localhost:3000`). No se han realizado `git push` a remoto.
- **Estado de Compilación:** Build de producción verificado con `npm run build` — **Compilación exitosa en 2.4s (Código 0)**, 0 errores de TypeScript y 0 advertencias de Turbopack.
- **Rama Actual de Git:** `main` (con un respaldo completo en la rama local `respaldo-diseno-actual`).

---

## 🛠️ Resumen de Todo lo Logrado

### 1. Optimizaciones de Rendimiento Vercel (Vercel Best Practices)
- **Compresión Inteligente de Imágenes (`lib/image-utils.ts`):**
  - Creada la función `optimizeCloudinaryUrl(url, width)` que inyecta parámetros automáticos de Cloudinary (`f_auto,q_auto,c_limit,w_N`). Reduce imágenes pesadas de 3 MB a archivos WebP de ~30 KB (hasta **90% de ahorro de peso** y latencia).
- **Resource Hints (`app/layout.tsx`):**
  - Añadidas etiquetas `<link rel="preconnect">` y `<link rel="dns-prefetch">` apuntando a `res.cloudinary.com` para acelerar el handshaking TLS.
- **Optimizaciones en la Página Principal (`app/page.tsx`):**
  - Carga paralela de datos con `Promise.all`.
  - Carga diferida (`next/dynamic`) del editor visual en vivo (`LiveEditorDrawer`).
  - Imagen Hero optimizada con `fetchPriority="high"` y `decoding="async"`.
  - Event listeners pasivos de scroll para no bloquear el hilo principal.

---

### 2. Rediseño del Splash Screen / Pantalla de Carga (`GourmetPreloader.tsx`)
Rediseñado bajo los principios de **diseño minimalista de alto nivel / quiet luxury** (estilo Aesop / Linear / Apple):
- **Logo Transparente Recoloreado:** Se removió el recuadro cuadrado oscuro de `public/images/logo.webp` y se convirtieron sus trazos al tono oficial **Chocolate Amargo (`#2C1A14`)**, logrando un contraste nítido sobre el fondo neutro.
- **Esencialismo Absoluto:** Reducido únicamente a 3 elementos:
  1. Silueta transparente del logo del waffle.
  2. Título único: *"Preparando tus Tentaciones..."*.
  3. Indicador de progreso lineal ultra delgado de **2px** (`h-[2px] w-44 bg-[#E5D5C0]`) con llenado suave en **Dorado Terracota (`#D49B4B`)**.
- **Fondo & Retícula:** Fondo Crema Vainilla (`#FAF4EC` a `#F5E6D3`) con retícula centrada en múltiplos de 8px y animación de salida fluida (`ease: [0.16, 1, 0.3, 1]`).

---

### 3. Rediseño Estético Minimalista del Sitio Web (`app/page.tsx`)
Se aplicó un restyling completo manteniendo el **100% de la lógica funcional, props, hooks e interactividad**, así como la **tarjeta "Combo Sin Culpa" de Ofertas Especiales**:

- **Paleta Reducida a 3 Colores:**
  - Base neutra: Crema Vainilla (`#FAF4EC` / `#F4EBDC`).
  - Texto e Iconos: Chocolate Amargo (`#2C1A14`).
  - Acento: Dorado Terracota (`#D49B4B`).
- **Eliminación de Texturas & Olas SVG:**
  - Se removió la textura de rombos (`waffle-bg-pattern`).
  - Se reemplazaron todas las olas y derretidos (`MeltingCreamDivider` y SVGs) por **líneas divisorias rectas y sutiles (`border-t border-[#E5D5C0]`)**.
- **Sistema Unificado de Botones:**
  - Botones principales en estilo píldora de Chocolate Amargo (`bg-[#2C1A14] text-[#FAF4EC] hover:bg-[#3D2817]`).
  - Botones secundarios en crema con borde fino (`bg-[#F4EBDC] border border-[#E5D5C0]`).
- **Filtros de Categoría:** Estado activo en Chocolate Amargo (`#2C1A14`) e inactivos en Crema con borde suave (`#F4EBDC`).
- **Retirada de Badges Decorativos:** Se eliminó el sello circular dorado ("100% ARTESANAL") sobre la foto del Hero.
- **Coherencia en Sucursal:** El Mapa interactivo y el Video *"Cómo Llegar"* comparten dimensiones cuadradas/rectangulares idénticas, esquinas redondeadas (`rounded-2xl`) y borde gris fino (`border border-[#E5D5C0]`).
- **Transición Limpia al Footer:** Línea divisoria recta que da paso al footer en Chocolate Amargo (`#2C1A14`).
- **Tarjeta "Combo Sin Culpa" Intacta:** La sección de Promociones y la tarjeta de oferta en color burdeos se mantuvieron sin ninguna alteración.

---

### 4. Corrección Integral de Persistencia en Vivo (Live Editor Drawer)
Se resolvieron de raíz los fallos que provocaban que el texto editado en vivo no se guardara o se revirtiera:
- **Bug de Dependencias en React (`components/admin/LiveEditorDrawer.tsx`):**
  - Se corrigió el `useEffect` del drawer cuya dependencia `[item?.id || item?.heroImageUrl]` evaluaba permanentemente a `"hero"`, evitando que `formData` se refrescara al abrirlo o editarlo. Ahora depende limpiamente de `[isOpen, item]`.
  - El formulario ahora pasa los datos confirmados por el backend directamente al callback `onSaveSuccess(json.data)`.
- **Eliminación Total de Caché HTTP (`app/page.tsx`):**
  - La función `handleLiveSaveSuccess` ahora aplica los datos guardados en el estado de React en tiempo real (0 ms de latencia) sin depender de peticiones HTTP en cascada.
  - Para peticiones de refresco secundarias, se implementó `?_t=${Date.now()}` junto con `{ cache: 'no-store' }`, evitando que el navegador entregue respuestas cacheadas obsoletas.
- **Rutas API Forzadas a Dinámicas:**
  - En `app/api/settings/route.ts`, `app/api/banners/route.ts` y `app/api/menu/route.ts` se configuró `export const dynamic = "force-dynamic"`, `export const revalidate = 0` y cabeceras estrictas `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.
- **Sincronización de Archivos & Comparación Temporal (`lib/*-store.ts`):**
  - En `settings-store.ts`, `menu-store.ts` y `banner-store.ts`, las funciones de guardado ahora escriben simultáneamente tanto en el archivo persistente local (`data/*.json`) como en el archivo temporal (`/tmp/*.json`).
  - Al leer, se evalúa la fecha de modificación (`mtimeMs` de `fs.statSync`) para garantizar que siempre prevalezcan los datos más recientes.

---

### 5. Estabilidad del Entorno Local & Control de Procesos Node (Windows)
- **Límites de CPU y Concurrencia (`next.config.ts`):**
  - Configurado `cpus: 2`, `workerThreads: true` y `turbopackPluginRuntimeStrategy: "workerThreads"` junto a `optimizePackageImports` para evitar que Next.js dispare múltiples subprocesos de Node concurrentes en Windows.
- **Modo Servidor Optimizado:**
  - Se verificó que `npm run start` (producción local tras `npm run build`) arranca en solo **264ms**, responde en **<50ms**, mantiene únicamente **2 procesos de Node en total** y preserva el 100% de la interactividad y guardado dinámico.

---

### 6. Estrategia de Prospección Comercial (Waffles & Crepes DT)
- **Análisis de WhatsApp Business (`+593 96 351 9916`):**
  - Se identificó la autorrespuesta del bot comercial y se analizó su menú actual alojado en un PDF de Google Drive vía `linktr.ee/wafflesycrepes`.
  - Se identificó la sucursal física en Av. La Lorena (esquina Lázaro Cárdenas) y Los Rosales (Santo Domingo).
- **Contacto con Cliente:**
  - Se envió el mensaje de seguimiento estructurado bajo la técnica de *"Cero Presión"*, recibiendo confirmación y acuse de recibo con reacción positiva (👍) por parte del dueño/administrador.

---

### 7. Sistema de Autenticación de Administrador Oculto y Seguro (`/login` & `/admin`)
Implementación de un sistema de acceso administrativo privado, invisible para visitantes públicos y motores de búsqueda:
- **Acceso Invisible en Navbar Pública (`components/Navbar.tsx`):**
  - El botón de administrador no se renderiza en el HTML ni es visible para visitantes.
  - Únicamente tras iniciar sesión y mediante validación condicional en cliente (`/api/auth/me`), el botón aparece discretamente en la barra de navegación para el administrador activo.
- **Protección por Servidor y Middleware (`middleware.ts`):**
  - La ruta `/admin` está resguardada por el middleware de Next.js. Si no existe una cookie segura HTTP-Only `dt_admin_session` con firma HMAC/JWT válida, el usuario es redirigido automáticamente a `/login`.
- **Rutas de Autenticación (`app/api/auth/*`):**
  - `/api/auth/login`: Validación de credenciales y emisión de cookie segura HTTP-Only (`dt_admin_session`, `SameSite: Lax`, `Max-Age: 7 días`).
  - `/api/auth/logout`: Revocación inmediata de la sesión y expiración de cookies.
  - `/api/auth/me`: Verificación de sesión activa para el renderizado condicional en cliente.
  - `/api/auth/password`: Actualización de contraseña administrativa con encriptación segura.
- **Página de Inicio de Sesión de Marca (`app/login/page.tsx`):**
  - **Fondo:** Crema Vainilla (`#FAF4EC`) con la textura artesanal de waffle (`.waffle-bg-pattern`).
  - **Tarjeta Central:** Silueta con la esquina recortada de *"La Mordida"* (`.bitten-corner-mask`), fondo Panna Cotta y borde fino dorado `#D49B4B`.
  - **Logo Oficial:** Vinculado dinámicamente desde `/api/settings` con fallback a `/images/logo.webp`.
  - **Iconografía & Controles:** Iconos de usuario y contraseña en **Chocolate Amargo (`#2C1A14`)** sobre cápsulas suaves; botón principal en **Rojo Cereza (`#C81D31`)**.
  - **Diseño Limpio y Centrado:** Sin imágenes compitiendo con el formulario para una máxima usabilidad y enfoque visual.

---

### 8. Rediseño del Panel de Administración — Estilo "Dashboard Profesional" (`app/admin/page.tsx`)
Transformación de la interfaz administrativa priorizando la **ergonomía visual, legibilidad de datos para el trabajo diario y acentos sutiles de la marca**:
- **Sidebar Blanco y Monocromático (Modo Claro):**
  - Fondo blanco limpio (`bg-white`) con borde derecho fino (`border-r border-slate-200`) y sombra ligera, armonizado con las tarjetas de datos.
  - Logo oficial de la marca en la cabecera superior.
  - **Ítem Activo:** Borde izquierdo de 3px en **Rojo Cereza (`#C81D31`)**, fondo gris suave `bg-slate-100` y tipografía destacada.
  - **Iconos y Badges Monocromáticos:** Se estandarizaron todos los iconos de las pestañas (*Analítica*, *Productos*, *Banners*, *Sucursales*, *Logo*) en escala de grises neutra (`text-slate-500` / `text-slate-900`), eliminando acentos amarillos o rosados para una coherencia visual absoluta.
  - **Modo Noche / Día:** Selector integrado en el pie del sidebar que adapta la interfaz de forma sincronizada (`#111622` para el menú y `#0B0F17` para las tarjetas).
- **Fondos y Tarjetas Limpias:**
  - Fondo general en gris claro `#F4F6F8` con tarjetas blancas nítidas (`bg-white border-slate-200 shadow-xs`) que previenen la fatiga visual.
- **Tipografía Jerárquica de Alto Contraste:**
  - Títulos principales `<h1>` en tipografía Serif elegante (`font-serif font-bold text-2xl sm:text-3xl`) con contraste dinámico controlado por `${titleClass}` (inmune a interferencias de temas oscuros del sistema operativo).
  - Subtítulos, tablas, formularios y métricas en Sans-Serif legible.
- **Acciones Principales Exclusivas en Rojo Cereza (`#C81D31` / hover `#A31627`):**
  - Reservado para botones primarios: *"Nuevo Producto"*, *"Nuevo Banner Promocional"*, confirmación de guardado en modales, *"Cambiar y Recortar Logo"* y *"Actualizar Contraseña"*. Botones secundarios en grises neutros ergonómicos.
- **Gráfico de Visitas Resaltado:**
  - Barras habituales en tonos neutros; la barra del día actual o con el pico más alto de visitas se resalta automáticamente en `#C81D31`.
- **Previsualización de Logo Oficial Limpia:**
  - Eliminado el círculo rojo de selección y los destellos superpuestos; el logo se visualiza en un contenedor cuadrado redondeado neutral (`w-32 h-32 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs`).
- **Integridad de Base de Datos y Persistencia:**
  - Plena sincronización en tiempo real con las APIs `/api/settings`, `/api/menu`, `/api/banners`, `/api/analytics` y almacenamiento dual en `data/*.json` y `/tmp/*.json`.

---

## ⚡ Comandos para Iniciar en Local

```bash
# Instalar dependencias (si aplica)
npm install

# Compilar proyecto optimizado (rápido y sin advertencias)
npm run build

# Iniciar servidor local optimizado y ultra rápido (Recomendado)
npm run start

# Iniciar servidor de desarrollo en caliente
npm run dev
```

---

## 🎯 Próximos Pasos Sugeridos para la Siguiente Sesión

1. **Optimización de la Sección Sucursal (`app/page.tsx`):**
   - Remover el pop-up blanco invasivo de Google Maps ("Antoniette") para dejar el mapa 100% limpio o apuntando a la dirección exacta de Waffles & Crepes DT en Av. La Lorena.
2. **Seguimiento a Waffles & Crepes DT:**
   - Evaluar respuesta tras el pulgar arriba (👍) para coordinar la personalización de sus 3 combos más vendidos.
3. **Flujo de Carrito y Checkout:**
   - Probar el armado de pedidos y la generación del mensaje estructurado a WhatsApp (`CartSidebar.tsx`).

