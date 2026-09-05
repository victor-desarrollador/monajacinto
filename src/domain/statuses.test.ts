import { describe, it, expect } from 'vitest'
import { SaleStatuses, canTransition, assertTransition } from './statuses'

describe('SaleStatuses', () => {
  it('defines the four required statuses', () => {
    expect(SaleStatuses.DRAFT).toBe('DRAFT')
    expect(SaleStatuses.PENDING_PAYMENT).toBe('PENDING_PAYMENT')
    expect(SaleStatuses.PAID).toBe('PAID')
    expect(SaleStatuses.COMPLETED).toBe('COMPLETED')
  })
})

describe('canTransition', () => {
  it('allows DRAFT -> PENDING_PAYMENT', () => {
    expect(canTransition('DRAFT', 'PENDING_PAYMENT')).toBe(true)
  })
  it('allows PENDING_PAYMENT -> PAID', () => {
    expect(canTransition('PENDING_PAYMENT', 'PAID')).toBe(true)
  })
  it('allows PAID -> COMPLETED', () => {
    expect(canTransition('PAID', 'COMPLETED')).toBe(true)
  })

  it('rejects DRAFT -> PAID', () => {
    expect(canTransition('DRAFT', 'PAID')).toBe(false)
  })
  it('rejects DRAFT -> COMPLETED', () => {
    expect(canTransition('DRAFT', 'COMPLETED')).toBe(false)
  })
  it('rejects PENDING_PAYMENT -> COMPLETED', () => {
    expect(canTransition('PENDING_PAYMENT', 'COMPLETED')).toBe(false)
  })
  it('rejects any transition from COMPLETED', () => {
    expect(canTransition('COMPLETED', 'DRAFT')).toBe(false)
    expect(canTransition('COMPLETED', 'PENDING_PAYMENT')).toBe(false)
    expect(canTransition('COMPLETED', 'PAID')).toBe(false)
  })
  it('rejects backwards transitions', () => {
    expect(canTransition('PAID', 'PENDING_PAYMENT')).toBe(false)
    expect(canTransition('PENDING_PAYMENT', 'DRAFT')).toBe(false)
  })
})

describe('assertTransition', () => {
  it('does not throw on allowed transitions', () => {
    expect(() => assertTransition('DRAFT', 'PENDING_PAYMENT')).not.toThrow()
  })
  it('throws on disallowed transitions', () => {
    expect(() => assertTransition('DRAFT', 'PAID')).toThrow(
      /Invalid sale status transition/,
    )
  })
})
