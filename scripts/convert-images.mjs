/**
 * Convierte las imágenes pesadas de /public/img/ a WebP.
 * Uso: node scripts/convert-images.mjs
 *
 * - Guarda los .webp junto al original (no elimina el original)
 * - Omite archivos que ya tienen versión .webp actualizada
 * - Imprime comparativa de tamaño antes/después
 */

import sharp from 'sharp'
import { readdirSync, statSync, existsSync } from 'fs'
import { join, extname, basename } from 'path'

const INPUT_DIR = new URL('../public/img', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const QUALITY   = 82   // 80-85 es el punto dulce calidad/tamaño
const MAX_WIDTH = 1400 // nunca agrandamos, solo achicamos

const EXTS_SOPORTADAS = new Set(['.jpg', '.jpeg', '.png', '.gif'])

let totalAntes  = 0
let totalDespues = 0
let convertidas  = 0
let omitidas     = 0

const archivos = readdirSync(INPUT_DIR).filter(f =>
  EXTS_SOPORTADAS.has(extname(f).toLowerCase()),
)

console.log(`\n🖼  Convirtiendo ${archivos.length} imágenes en ${INPUT_DIR}\n`)
console.log('─'.repeat(72))

for (const file of archivos) {
  const inputPath  = join(INPUT_DIR, file)
  const outputName = `${basename(file, extname(file))}.webp`
  const outputPath = join(INPUT_DIR, outputName)

  const sizeBefore = statSync(inputPath).size

  // Si ya existe un .webp más reciente que el original, saltar
  if (existsSync(outputPath)) {
    const mtIn  = statSync(inputPath).mtimeMs
    const mtOut = statSync(outputPath).mtimeMs
    if (mtOut >= mtIn) {
      const sizeWebp = statSync(outputPath).size
      console.log(`  ⏭  ${file.padEnd(30)} ya convertido (${(sizeWebp/1024).toFixed(0)} KB)`)
      totalAntes   += sizeBefore
      totalDespues += sizeWebp
      omitidas++
      continue
    }
  }

  try {
    await sharp(inputPath)
      .rotate()
      .resize(MAX_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(outputPath)

    const sizeAfter = statSync(outputPath).size
    const saving    = Math.round((1 - sizeAfter / sizeBefore) * 100)

    totalAntes   += sizeBefore
    totalDespues += sizeAfter
    convertidas++

    const bar = '█'.repeat(Math.max(1, Math.round(saving / 5)))
    console.log(
      `  ✅ ${file.padEnd(30)} ${(sizeBefore/1024).toFixed(0).padStart(6)} KB → ${(sizeAfter/1024).toFixed(0).padStart(5)} KB  -${String(saving).padStart(2)}%  ${bar}`,
    )
  } catch (err) {
    console.error(`  ❌ ${file}: ${err.message}`)
  }
}

console.log('─'.repeat(72))
console.log(`\n  Convertidas : ${convertidas}   Omitidas: ${omitidas}`)
console.log(`  Antes total : ${(totalAntes   / 1024 / 1024).toFixed(2)} MB`)
console.log(`  Después total: ${(totalDespues / 1024 / 1024).toFixed(2)} MB`)
console.log(`  Ahorro total: ${((1 - totalDespues / totalAntes) * 100).toFixed(1)}%  (${((totalAntes - totalDespues) / 1024 / 1024).toFixed(2)} MB liberados)`)
console.log(`\n  ℹ  Los originales NO fueron eliminados — actualiza las referencias en el código si todo se ve bien.\n`)
