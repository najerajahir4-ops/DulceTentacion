const fs = require('fs');
const path = require('path');

// Helper to load .env file without external dependencies
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        let val = trimmed.slice(eqIndex + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const API_KEY = process.env.REMOVE_BG_API_KEY || 'anBKmaLhBEU2ZvAUgxcyxsjd';
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

// Check account status and credits
async function checkAccount() {
  try {
    const res = await fetch('https://api.remove.bg/v1.0/account', {
      headers: { 'X-Api-Key': API_KEY }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const data = await res.json();
    console.log('\n--- Estado de Cuenta remove.bg ---');
    console.log(`Llamadas gratuitas API disponibles: ${data.data.attributes.api.free_calls}`);
    console.log(`Créditos Pay As You Go: ${data.data.attributes.credits.payg}`);
    console.log(`Créditos Totales: ${data.data.attributes.credits.total}`);
    console.log('----------------------------------\n');
    return data;
  } catch (err) {
    console.error('Error al consultar cuenta remove.bg:', err.message);
  }
}

// Remove background from a single image
async function removeBackground(inputPathOrName, customOutputPath) {
  let inputPath = inputPathOrName;
  if (!path.isAbsolute(inputPath)) {
    if (fs.existsSync(path.join(IMAGES_DIR, inputPath))) {
      inputPath = path.join(IMAGES_DIR, inputPath);
    } else if (fs.existsSync(path.resolve(process.cwd(), inputPath))) {
      inputPath = path.resolve(process.cwd(), inputPath);
    }
  }

  if (!fs.existsSync(inputPath)) {
    console.error(`[Error] No se encontró el archivo: ${inputPathOrName}`);
    return false;
  }

  const parsed = path.parse(inputPath);
  const outputPath = customOutputPath 
    ? path.resolve(process.cwd(), customOutputPath)
    : path.join(parsed.dir, `${parsed.name}-bgless.png`);

  console.log(`Procesando: ${parsed.base} -> ${path.basename(outputPath)}...`);

  const fileBuffer = fs.readFileSync(inputPath);
  const blob = new Blob([fileBuffer]);

  const formData = new FormData();
  formData.append('image_file', blob, parsed.base);
  formData.append('size', 'auto');

  try {
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errMsg = errorJson?.errors?.[0]?.title || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(errMsg);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(outputPath, buffer);

    const sizeKb = (buffer.length / 1024).toFixed(1);
    console.log(`✓ ¡Éxito! Fondo eliminado guardado en: ${outputPath} (${sizeKb} KB)`);
    return true;
  } catch (err) {
    console.error(`✗ Error al procesar ${parsed.base}:`, err.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--status') || args.includes('-s')) {
    await checkAccount();
    return;
  }

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso de la herramienta remove.bg:

1. Quitar fondo a una imagen específica:
   node scripts/remove_bg.js <ruta_o_nombre_imagen> [ruta_salida_opcional]
   Ejemplo: node scripts/remove_bg.js chocolate.jfif
   Ejemplo: node scripts/remove_bg.js public/images/helado.png

2. Ver estado de créditos de la API:
   node scripts/remove_bg.js --status

3. Quitar fondo a imágenes pendientes por defecto en public/images:
   node scripts/remove_bg.js --default
`);
    await checkAccount();
    return;
  }

  if (args.includes('--default')) {
    await checkAccount();
    const defaultFiles = [
      'new_crepe.png',
      'new_frappe.png',
      'new_waffle.png',
      'new_icecream.png'
    ];
    for (const file of defaultFiles) {
      await removeBackground(file);
    }
    return;
  }

  const inputFile = args[0];
  const outputFile = args[1];
  await removeBackground(inputFile, outputFile);
}

main();
