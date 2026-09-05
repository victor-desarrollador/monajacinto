/**
 * Money is always stored as integer cents. Never store or compute business
 * amounts as floats.
 *
 * Number-based boundary helpers. unitToCents/centsToUnit convert at the
 * presentation boundary ONLY; internal arithmetic is always integer cents.
 */

export function addMoney(a: number, b: number): number {
  return a + b
}

export function subtractMoney(a: number, b: number): number {
  return a - b
}

export function multiplyByQuantity(unitCents: number, quantity: number): number {
  return unitCents * quantity
}

/**
 * Convert a money unit value (e.g. ARS) to integer cents.
 *
 * unitToCents(0.1) === 10
 * unitToCents(100000.1) === 10000010
 */
export function unitToCents(unit: number): number {
  if (typeof unit !== 'number' || !Number.isFinite(unit)) {
    throw new Error('unitToCents: unit must be a finite number')
  }
  const cents = Math.round(unit * 100)
  return Object.is(cents, -0) ? 0 : cents
}

/**
 * Convert integer cents back to units (number).
 *
 * centsToUnit(4500) === 45
 */
export function centsToUnit(cents: number): number {
  if (!Number.isInteger(cents)) {
    throw new Error('centsToUnit: cents must be an integer')
  }
  return cents / 100
}

/**
 * Deterministic ARS formatting from integer cents.
 * Manual implementation (not Intl.NumberFormat) for reproducibility.
 *
 * formatMoney(85000)    === "$ 850,00"
 * formatMoney(10000010) === "$ 100.000,10"
 * formatMoney(0)        === "$ 0,00"
 * formatMoney(-500)     === "-$ 5,00"
 */
export function formatMoney(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new Error('formatMoney: cents must be an integer')
  }
  const negative = cents < 0
  const abs = Math.abs(cents)
  const whole = Math.floor(abs / 100)
  const frac = abs % 100

  // Group thousands with "." (es-AR).
  const wholeStr = String(whole)
    .split('')
    .reverse()
    .reduce<string[]>((acc, ch, i) => {
      if (i > 0 && i % 3 === 0) acc.push('.')
      acc.push(ch)
      return acc
    }, [])
    .reverse()
    .join('')

  const fracStr = String(frac).padStart(2, '0')
  const sign = negative ? '-' : ''
  return `${sign}$ ${wholeStr},${fracStr}`
}
