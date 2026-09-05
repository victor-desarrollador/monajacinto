import { describe, it, expect } from 'vitest'
import { seedStore } from './seed'

describe('seedStore', () => {
  it('returns a complete StoreSnapshot shape', () => {
    const seed = seedStore()
    expect(Object.keys(seed).sort()).toEqual([
      'counters',
      'financialMovements',
      'inventory',
      'locations',
      'payments',
      'products',
      'sales',
      'stockMovements',
      'variants',
    ])
    expect(Array.isArray(seed.locations)).toBe(true)
    expect(Array.isArray(seed.products)).toBe(true)
    expect(Array.isArray(seed.variants)).toBe(true)
    expect(Array.isArray(seed.inventory)).toBe(true)
    expect(Array.isArray(seed.stockMovements)).toBe(true)
    expect(Array.isArray(seed.sales)).toBe(true)
    expect(Array.isArray(seed.payments)).toBe(true)
    expect(Array.isArray(seed.financialMovements)).toBe(true)
    expect(seed.counters).toEqual({ sale: 1 })
  })

  it('is deterministic and returns a fresh snapshot per call', () => {
    const a = seedStore()
    const b = seedStore()
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
    expect(a.inventory).not.toBe(b.inventory)
  })

  it('contains the demo branch LOC-BRANCH-CENTRO', () => {
    const seed = seedStore()
    const branch = seed.locations.find((l) => l.id === 'LOC-BRANCH-CENTRO')
    expect(branch).toBeDefined()
    expect(branch?.type).toBe('BRANCH')
  })

  it('contains variant VAR-REM-BAS-NEG-M with salePrice 45000', () => {
    const seed = seedStore()
    const variant = seed.variants.find((v) => v.id === 'VAR-REM-BAS-NEG-M')
    expect(variant).toBeDefined()
    expect(variant?.salePrice).toBe(45000)
  })

  it('every inventory row satisfies physical >= reserved and no negatives', () => {
    const seed = seedStore()
    expect(seed.inventory.length).toBeGreaterThan(0)
    for (const row of seed.inventory) {
      expect(row.physical).toBeGreaterThanOrEqual(row.reserved)
      expect(row.physical).toBeGreaterThanOrEqual(0)
      expect(row.reserved).toBeGreaterThanOrEqual(0)
    }
  })

  it('has at least one inventory row with reserved > 0', () => {
    const seed = seedStore()
    expect(seed.inventory.some((row) => row.reserved > 0)).toBe(true)
  })

  it('has one inventory row per variant at the demo branch', () => {
    const seed = seedStore()
    const locationIds = new Set(seed.locations.map((l) => l.id))
    for (const row of seed.inventory) {
      expect(locationIds.has(row.locationId)).toBe(true)
      expect(seed.variants.some((v) => v.id === row.variantId)).toBe(true)
    }
  })

  it('every variant belongs to an existing product', () => {
    const seed = seedStore()
    for (const variant of seed.variants) {
      expect(seed.products.some((p) => p.id === variant.productId)).toBe(true)
    }
  })

  it('starts with empty dynamic collections', () => {
    const seed = seedStore()
    expect(seed.stockMovements).toEqual([])
    expect(seed.sales).toEqual([])
    expect(seed.payments).toEqual([])
    expect(seed.financialMovements).toEqual([])
  })

  it('starts the sale counter at 1', () => {
    expect(seedStore().counters.sale).toBe(1)
  })
})
