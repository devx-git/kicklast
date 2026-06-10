/**
 * sanitize.js — Utilidades de seguridad para formularios del frontend
 *
 * Propósito:
 *  1. Sanitizar entradas de texto para prevenir XSS en renders no gestionados por React
 *  2. Validar formatos antes de enviar al backend (segunda línea de defensa)
 *  3. Helpers de validación reutilizables en cualquier componente
 *
 * NOTA: React ya escapa el HTML por defecto en JSX, así que la sanitización
 * en el render es solo necesaria si usas dangerouslySetInnerHTML.
 * Lo más importante aquí es la validación de formato antes del envío.
 */

// ── Sanitización básica ───────────────────────────────────────────────────────

/**
 * Elimina caracteres peligrosos de un string.
 * Útil antes de mostrar texto en contextos HTML (tooltips, title, etc.)
 */
export function sanitizeText(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/[<>'"]/g, '')      // elimina chars de HTML/atributos
    .replace(/javascript:/gi, '') // elimina pseudo-protocolo
    .replace(/on\w+=/gi, '')      // elimina event handlers inline
    .trim()
}

/**
 * Sanitiza un objeto completo de formulario.
 * Aplica sanitizeText() a todos los campos string.
 */
export function sanitizeForm(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' ? sanitizeText(value) : value
  }
  return result
}

// ── Validadores de formato ────────────────────────────────────────────────────

/** Valida email */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim())
}

/**
 * Valida contraseña segura:
 * - Mínimo 8 caracteres
 * - Al menos una mayúscula, una minúscula y un número
 */
export function isStrongPassword(pwd) {
  return (
    typeof pwd === 'string' &&
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd)
  )
}

/** Mensaje legible para requisitos de contraseña */
export const PASSWORD_HINT = 'Mínimo 8 caracteres, una mayúscula, una minúscula y un número'

/** Valida que un string solo contenga letras, números, espacios y acentos */
export function isValidName(name) {
  return typeof name === 'string' && /^[\p{L}\p{N}\s.'-]{2,80}$/u.test(name.trim())
}

/** Valida teléfono internacional (+57 3001234567) */
export function isValidPhone(phone) {
  return /^\+?[1-9]\d{6,14}$/.test(String(phone).replace(/\s/g, ''))
}

/** Valida que un monto sea un número positivo con máximo 2 decimales */
export function isValidMonto(monto) {
  const n = Number(monto)
  return !isNaN(n) && n > 0 && /^\d+(\.\d{1,2})?$/.test(String(monto))
}

// ── Validación completa de formularios ───────────────────────────────────────

/**
 * Valida el formulario de registro de usuario.
 * Retorna un objeto { valid: bool, errors: { campo: string } }
 */
export function validateRegisterForm({ nombre, email, password, pais }) {
  const errors = {}

  if (!isValidName(nombre))
    errors.nombre = 'Nombre inválido (2-80 caracteres, solo letras y espacios)'

  if (!isValidEmail(email))
    errors.email = 'Correo electrónico inválido'

  if (!isStrongPassword(password))
    errors.password = PASSWORD_HINT

  if (!pais || String(pais).trim().length < 2)
    errors.pais = 'Selecciona un país'

  return { valid: Object.keys(errors).length === 0, errors }
}

/**
 * Valida el formulario de login.
 */
export function validateLoginForm({ email, password }) {
  const errors = {}

  if (!isValidEmail(email))
    errors.email = 'Correo electrónico inválido'

  if (!password || password.length < 4)
    errors.password = 'Ingresa tu contraseña'

  return { valid: Object.keys(errors).length === 0, errors }
}

/**
 * Valida formulario de recarga / venta de créditos.
 */
export function validateRecargaForm({ creditos, telefono }) {
  const errors = {}

  if (!isValidMonto(creditos))
    errors.creditos = 'Ingresa un número de créditos válido (mayor a 0)'

  if (telefono && !isValidPhone(telefono))
    errors.telefono = 'Teléfono inválido. Ejemplo: +57 3001234567'

  return { valid: Object.keys(errors).length === 0, errors }
}
