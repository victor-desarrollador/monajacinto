import { describe, it, expect } from 'vitest'
import {
  addMoney,
  subtractMoney,
  multiplyByQuantity,
  unitToCents,
  centsToUnit,
  formatMoney,
} from './money'

describe('money', () => {
  describe('unitToCents', () => {
    it('converts 0.1 units to 10 cents', () => {
      expect(unitToCents(0.1)).toBe(10)
    })
    it('converts 100000.1 units to 10000010 cents', () => {
      expect(unitToCents(100000.1)).toBe(10000010)
    })
    it('converts zero', () => {
      expect(unitToCents(0)).toBe(0)
    })
    it('rounds at the presentation boundary', () => {
      expect(unitToCents(1234.56)).toBe(123456)
    })
    it('rejects non-finite numbers', () => {
      expect(() => unitToCents(Infinity)).toThrow()
      expect(() => unitToCents(NaN)).toThrow()
    })
  })

  describe('centsToUnit', () => {
    it('converts 4500 cents to 45', () => {
      expect(centsToUnit(4500)).toBe(45)
    })
    it('converts 10000010 cents to 100000.1', () => {
      expect(centsToUnit(10000010)).toBe(100000.1)
    })
    it('rejects non-integer cents', () => {
      expect(() => centsToUnit(1.5)).toThrow()
    })
  })

  describe('integer arithmetic (no precision loss)', () => {
    it('adds integer cents', () => {
      expect(addMoney(10, 20)).toBe(30)
      expect(addMoney(1, 2)).toBe(3)
    })
    it('subtracts integer cents', () => {
      expect(subtractMoney(30, 20)).toBe(10)
      expect(subtractMoney(105, 5)).toBe(100)
    })
    it('multiplies by quantity', () => {
      expect(multiplyByQuantity(333, 3)).toBe(999)
    })
    it('round-trips', () => {
      const cents = unitToCents(1234.56)
      expect(cents).toBe(123456)
      expect(centsToUnit(cents)).toBe(1234.56)
    })
  })

  describe('formatMoney (deterministic ARS)', () => {
    it('formats 85000 as "$ 850,00"', () => {
      expect(formatMoney(85000)).toBe('$ 850,00')
    })
    it('formats 10000010 as "$ 100.000,10"', () => {
      expect(formatMoney(10000010)).toBe('$ 100.000,10')
    })
    it('formats 0 as "$ 0,00"', () => {
      expect(formatMoney(0)).toBe('$ 0,00')
    })
    it('formats -500 as "-$ 5,00"', () => {
      expect(formatMoney(-500)).toBe('-$ 5,00')
    })
    it('formats a small amount', () => {
      expect(formatMoney(5)).toBe('$ 0,05')
    })
    it('formats thousands with dot separators', () => {
      expect(formatMoney(123456789)).toBe('$ 1.234.567,89')
    })
    it('formats negative thousands with sign and separators', () => {
      expect(formatMoney(-123456789)).toBe('-$ 1.234.567,89')
    })
    it('rejects non-integer input', () => {
      expect(() => formatMoney(1.5)).toThrow()
    })
  })
})
