// 1 crédito = 1 USD. Vidas espeja el valor numérico de créditos.
// Tasas aproximadas (se pueden sobrescribir desde ConfiguracionPlataforma).

export const TASAS = {
  USD: 1,
  COP: 4200,
  MXN: 17.5,
  ARS: 1050,
  BRL: 5.1,
  CLP: 970,
  PEN: 3.75,
  VES: 36,
  GTQ: 7.8,
  HNL: 24.8,
  CRC: 530,
  DOP: 59,
  BOB: 6.9,
  PYG: 7600,
  UYU: 39,
  EUR: 0.92,
};

// Símbolos locales
export const SIMBOLOS = {
  USD: '$', COP: '$', MXN: '$', ARS: '$', BRL: 'R$',
  CLP: '$', PEN: 'S/', VES: 'Bs.', GTQ: 'Q', HNL: 'L',
  CRC: '₡', DOP: 'RD$', BOB: 'Bs.', PYG: '₲', UYU: '$U', EUR: '€',
};

// Nombres legibles de países → código moneda
export const PAIS_MONEDA = {
  CO: 'COP', MX: 'MXN', AR: 'ARS', BR: 'BRL', CL: 'CLP',
  PE: 'PEN', VE: 'VES', GT: 'GTQ', HN: 'HNL', CR: 'CRC',
  DO: 'DOP', BO: 'BOB', PY: 'PYG', UY: 'UYU', US: 'USD',
  ES: 'EUR', PA: 'USD', EC: 'USD', SV: 'USD', NI: 'USD',
};

/**
 * Convierte créditos (USD) a moneda local.
 * @param {number} creditos  — Valor en créditos (= USD)
 * @param {string} moneda    — Código ISO 4217 (ej. 'COP')
 * @returns {string}         — Formateado con símbolo local
 */
export function creditosAMonedaLocal(creditos, moneda = 'USD') {
  const tasa = TASAS[moneda] ?? 1;
  const simbolo = SIMBOLOS[moneda] ?? '$';
  const valor = Number(creditos) * tasa;

  // Números grandes sin decimales, pequeños con 2
  const formateado = valor >= 1000
    ? Math.round(valor).toLocaleString('es-CO')
    : valor.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return `${simbolo}${formateado} ${moneda}`;
}

/**
 * Convierte monto en moneda local a créditos (USD).
 * @param {number} monto     — Monto en moneda local
 * @param {string} moneda    — Código ISO 4217
 * @returns {number}         — Créditos equivalentes
 */
export function monedaLocalACreditos(monto, moneda = 'USD') {
  const tasa = TASAS[moneda] ?? 1;
  return Number(monto) / tasa;
}

/**
 * Las vidas siempre son igual al valor numérico de créditos.
 * @param {number} creditos
 * @returns {number}
 */
export function creditosAVidas(creditos) {
  return Math.floor(Number(creditos));
}

/**
 * Formatea créditos mostrando USD + equivalente local.
 */
export function formatCreditos(creditos, moneda) {
  const usd = `${Number(creditos).toLocaleString('es-CO')} cr`;
  if (!moneda || moneda === 'USD') return usd;
  return `${usd} ≈ ${creditosAMonedaLocal(creditos, moneda)}`;
}
