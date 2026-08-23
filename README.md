# Avita Ice Cream & Waffles - E-Commerce Landing Page

Bienvenido al repositorio de la Landing Page premium para **Avita Ice Cream & Waffles**. Este proyecto fue diseñado meticulosamente con un enfoque en estética de alta gama, interacciones fluidas y conversiones directas a WhatsApp.

## 🌟 Concepto de Diseño: "Melt System"
El núcleo visual de esta página es el **Melt System**. Utilizando filtros SVG avanzados (`feTurbulence` y `feDisplacementMap`) combinados con **GSAP** y **Framer Motion**, hemos creado una experiencia fluida donde los elementos reaccionan como si estuvieran derritiéndose. 

### Características de Diseño Clave:
- **Galería Flotante (Apple-style):** Los productos (Waffles, Frappés, Helados) se presentan en formato PNG sin fondo. Un motor GSAP calcula una sombra (`drop-shadow`) que se adapta exactamente a la silueta del producto, logrando un efecto 3D sin estar encerrados en cajas cuadradas.
- **Drip Dividers:** Transiciones entre secciones con un borde ondulado (gotas de helado/crema) que se superponen matemáticamente usando cascadas de `z-index` (40, 30, 20, 10) para eliminar cualquier brecha microscópica (subpixel gaps) entre los bloques de color.
- **Navegación Centrada Absoluta:** Un menú superior fijo con desenfoque de cristal (backdrop-blur), anclajes con `scroll-margin-top` calculados para no tapar los títulos al hacer clic, e iconos dinámicos (Lucide React).
- **Textura Táctil Global:** Un sutil filtro de ruido estático global de 3.5% de opacidad le da un acabado "mate" o de papel fotográfico a toda la pantalla.

## 🛠 Stack Tecnológico
- **Framework:** Next.js 16 (App Router)
- **Estilos:** Tailwind CSS (con variables CSS modernas en `globals.css`)
- **Tipografía:** 
  - `Fraunces` (Serif): Para los títulos. Aporta elegancia, lujo e historia.
  - `Inter` (Sans-serif): Para el cuerpo de texto, logrando una legibilidad perfecta.
- **Animaciones:** 
  - **Framer Motion:** Maneja las entradas al hacer scroll (`whileInView`), desvanecimientos (`fadeUp`) y la carga inicial secuencial (`staggerContainer`).
  - **GSAP (GreenSock):** Usado para las animaciones continuas súper fluidas (el efecto de derretimiento constante en las tarjetas y los blobs animados del fondo).
- **Iconos:** Lucide React
- **Despliegue:** Vercel

## 🎨 Paleta de Colores
- `--background`: `#FDF6EC` (Crema suave para descansar la vista)
- `--surface`: `#FFFFFF` (Blanco puro para aislar y resaltar los productos en la galería)
- `--foreground`: `#7A1620` (Marrón Vino tinto, da un contraste sofisticado sin ser negro)
- `--accent`: `#E4536B` (Fresa brillante, utilizado para los "Call to Action" y botones)
- `--secondary`: `#A97A4E` (Dorado cálido)

## 📱 Flujo de Usuario y Conversión
Toda la página está optimizada para la fricción cero. Los botones de "Pedir Ahora" y "Comprar" en cada producto no llevan a un complejo carrito de compras. En su lugar, abren una pestaña directa a **WhatsApp**, pre-escribiendo el nombre del producto exacto que el cliente eligió, acortando el embudo de ventas enormemente.

## ⚙️ Historial de Decisiones Técnicas (Notas para la IA)
1. **Subpixel Gaps:** Al principio, los `DripDivider` dejaban una línea de 1px visible debido a los cálculos decimales de pantalla de los navegadores. Se resolvió haciendo que el SVG exceda su contenedor por `1px` (`bottom-[1px]`) y ordenando los `z-index` en orden descendente (40 a 10 de arriba a abajo).
2. **Sombras de GSAP Bounding Box:** Inicialmente, el filtro `drop-shadow` de GSAP se aplicaba a todo el contenedor `div` de la tarjeta, lo que en algunos navegadores creaba una ilusión de "cuadro blanco" debido a la creación de un nuevo contexto de renderizado (`transform-gpu`). Se solucionó aislando el `drop-shadow` exclusivamente a la etiqueta `<img>` usando un `ref` secundario, manteniendo el fondo de la galería 100% puro.
3. **Scroll Margins:** Para evitar que la barra de navegación fija tapara los títulos al navegar mediante las anclas (`#menu`, `#nosotros`), se integró `scroll-mt-28` y `scroll-mt-24` para calcular un frenado anticipado del scroll.
4. **Dependencias:** Se limpiaron componentes sin uso (como el cursor personalizado `CustomCursor`) para asegurar compilaciones exitosas y rápidas en Vercel.
5. **Centrado del Menú de Categorías:** Se utilizó un layout inteligente (`inline-flex` en contenedor `text-center`) para mantener centrados los botones de categorías (Waffles, Crepes, etc.) en pantallas grandes, garantizando su perfecta alineación.
6. **Loader Animado (Splash Screen):** Se implementó una pantalla de carga a pantalla completa con `framer-motion` (`AnimatePresence`) para garantizar una hidratación visual perfecta de fuentes y assets pesados durante al menos 2 segundos en el primer renderizado.
7. **Marquee Infinito:** Se añadió una cinta dinámica infinita ("EL SABOR QUE TE HARÁ VOLVER") como separador elegante entre el menú y los testimonios. Se ajustó su grosor (padding) y tamaño tipográfico para mantener un perfil estético sutil y premium.
8. **Collage Flotante:** Se optimizó la disposición de las imágenes flotantes secundarias detrás del producto principal (Hero). Se eliminó el desenfoque artificial (blur) para máxima nitidez y se expandieron radialmente para evitar traslapes.
9. **UX Móvil Responsivo:** Se agregó una regla en la carga de la página (`useEffect`) que detecta dispositivos móviles (`window.innerWidth < 768`) para forzar la "Vista de Lista" (catálogo) por defecto, ofreciendo una navegación de compra mucho más ágil y amigable para pulgares.

---
*Este documento ha sido actualizado tras la última iteración de diseño y performance, sirviendo como registro maestro de las decisiones estéticas de Avita.*
