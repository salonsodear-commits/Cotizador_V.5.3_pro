#!/usr/bin/env node
/**
 * Convierte todos los archivos .xlsx de data/excel/ en JSON en src/data/.
 *
 * Reglas:
 *  - La primera fila de cada hoja es el header.
 *  - Si el Excel tiene una sola hoja, el JSON es un array de objetos.
 *  - Si tiene varias hojas, el JSON es un objeto { nombreHoja: [...] }.
 *  - Los nombres de columnas se normalizan a snake_case.
 *  - Los nombres de archivo se usan tal cual (convenios.xlsx -> convenios.json).
 *
 * También genera src/data/index.js que re-exporta todos los JSON.
 * Modo watch: --watch regenera al modificar archivos.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, watch } from 'node:fs';
import { dirname, join, resolve, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const EXCEL_DIR = join(PROJECT_ROOT, 'data', 'excel');
const JSON_DIR = join(PROJECT_ROOT, 'src', 'data');

const toSnake = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const cleanCell = (v) => {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'string') return v.trim();
  return v;
};

const sheetToRows = (sheet) => {
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: null });
  if (!raw.length) return [];
  const [header, ...rows] = raw;
  const keys = header.map(toSnake);
  return rows
    .filter((row) => row.some((c) => c !== null && c !== ''))
    .map((row) => {
      const obj = {};
      keys.forEach((k, i) => { if (k) obj[k] = cleanCell(row[i]); });
      return obj;
    });
};

const convertOne = (filePath) => {
  const wb = XLSX.readFile(filePath, { cellDates: true });
  const names = wb.SheetNames;
  if (names.length === 1) {
    return sheetToRows(wb.Sheets[names[0]]);
  }
  const out = {};
  for (const n of names) out[toSnake(n)] = sheetToRows(wb.Sheets[n]);
  return out;
};

const runOnce = () => {
  if (!existsSync(EXCEL_DIR)) {
    console.warn(`[excel-to-json] No existe ${EXCEL_DIR}. Nada para convertir.`);
    mkdirSync(EXCEL_DIR, { recursive: true });
    return [];
  }
  if (!existsSync(JSON_DIR)) mkdirSync(JSON_DIR, { recursive: true });

  const files = readdirSync(EXCEL_DIR).filter((f) =>
    /\.xlsx$/i.test(f) && !f.startsWith('~$'));

  if (!files.length) {
    console.warn(`[excel-to-json] Sin .xlsx en ${EXCEL_DIR}.`);
    return [];
  }

  const manifest = [];
  for (const f of files) {
    const name = basename(f, extname(f));
    const src = join(EXCEL_DIR, f);
    const dst = join(JSON_DIR, `${name}.json`);
    try {
      const data = convertOne(src);
      writeFileSync(dst, JSON.stringify(data, null, 2) + '\n', 'utf8');
      const count = Array.isArray(data)
        ? data.length
        : Object.values(data).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0);
      console.log(`[excel-to-json] ✔ ${f}  ->  src/data/${name}.json  (${count} filas)`);
      manifest.push(name);
    } catch (err) {
      console.error(`[excel-to-json] ✖ ${f}: ${err.message}`);
      process.exitCode = 1;
    }
  }

  // Genera índice re-exportador (permite: import { convenios } from '@/data')
  const lines = [
    '// Archivo generado automáticamente por scripts/excel-to-json.mjs',
    '// No editar a mano. Editá el Excel y corré `npm run data:build`.',
    '',
    ...manifest.map((n) => `import ${toCamel(n)} from './${n}.json' with { type: 'json' };`),
    '',
    `export { ${manifest.map(toCamel).join(', ')} };`,
    `export default { ${manifest.map(toCamel).join(', ')} };`,
    '',
  ].join('\n');
  writeFileSync(join(JSON_DIR, 'index.js'), lines, 'utf8');
  console.log(`[excel-to-json] ✔ src/data/index.js (${manifest.length} dataset${manifest.length===1?'':'s'})`);
  return manifest;
};

function toCamel(s) {
  return s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

const watchMode = process.argv.includes('--watch');

runOnce();

if (watchMode) {
  if (!existsSync(EXCEL_DIR)) mkdirSync(EXCEL_DIR, { recursive: true });
  console.log(`[excel-to-json] Observando cambios en ${EXCEL_DIR}...`);
  let timer = null;
  watch(EXCEL_DIR, { persistent: true }, (evt, fname) => {
    if (!fname || !/\.xlsx$/i.test(fname) || fname.startsWith('~$')) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`\n[excel-to-json] Cambio detectado (${fname}), regenerando...`);
      runOnce();
    }, 200);
  });
}
