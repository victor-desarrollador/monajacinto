import { describe, it, expect } from 'vitest'
import {
  searchProducts,
  getVariantsByProduct,
  getVariantById,
} from './catalogService'
import { seedStore } from '../domain/seed'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

describe('catalogService', () => {
  it('finds an existing seeded product (Remera Básica)', () => {
    const snapshot = seedStore()
    const results = searchProducts(snapshot, 'Remera Básica')
    const found = results.find((p) => p.id === 'PROD-REM-BAS')
    expect(found).toBeDefined()
    expect(found?.name).toBe('Remera Básica')
    expect(found?.category).toBe('Remeras')
    expect(found?.brand).toBe('Mona Jacinto')
  })

  it('searches case-insensitively and by partial name', () => {
    const snapshot = seedStore()
    const results = searchProducts(snapshot, 'remera')
    expect(results.map((p) => p.id)).toContain('PROD-REM-BAS')
  })

  it('lists all products for an empty query', () => {
    const snapshot = seedStore()
    expect(searchProducts(snapshot, '')).toHaveLength(snapshot.products.length)
    expect(searchProducts(snapshot, '   ')).toHaveLength(
      snapshot.products.length,
    )
  })

  it('retrieves variants belonging to a product', () => {
    const snapshot = seedStore()
    const variants = getVariantsByProduct(snapshot, 'PROD-REM-BAS')
    expect(variants).toHaveLength(6)
    for (const variant of variants) {
      expect(variant.productId).toBe('PROD-REM-BAS')
    }
  })

  it('resolves variant VAR-REM-BAS-NEG-M', () => {
    const snapshot = seedStore()
    const variant = getVariantById(snapshot, 'VAR-REM-BAS-NEG-M')
    expect(variant).toBeDefined()
  })

  it('exposes the authoritative salePrice 45000 for VAR-REM-BAS-NEG-M', () => {
    const snapshot = seedStore()
    expect(getVariantById(snapshot, 'VAR-REM-BAS-NEG-M').salePrice).toBe(45000)
  })

  it('returns the variant retaining all authoritative catalog fields', () => {
    const snapshot = seedStore()
    expect(getVariantById(snapshot, 'VAR-REM-BAS-NEG-M')).toEqual({
      id: 'VAR-REM-BAS-NEG-M',
      productId: 'PROD-REM-BAS',
      sku: 'REM-BAS-NEG-M',
      color: 'Negro',
      size: 'M',
      salePrice: 45000,
      resellerPrice: 33750,
      barcode: '7790001000017',
    })
  })

  it('throws an explicit error for a nonexistent variant id', () => {
    const snapshot = seedStore()
    expect(() => getVariantById(snapshot, 'VAR-NO-EXISTE')).toThrow(
      /variant not found: VAR-NO-EXISTE/,
    )
  })

  it('returns an empty result when the search matches no product', () => {
    const snapshot = seedStore()
    expect(searchProducts(snapshot, 'zzz-inexistente')).toEqual([])
    expect(getVariantsByProduct(snapshot, 'PROD-NO-EXISTE')).toEqual([])
  })

  it('leaves the original StoreSnapshot unchanged after catalog reads', () => {
    const snapshot = seedStore()
    const before = clone(snapshot)
    searchProducts(snapshot, 'remera')
    getVariantsByProduct(snapshot, 'PROD-REM-BAS')
    getVariantById(snapshot, 'VAR-REM-BAS-NEG-M')
    expect(snapshot).toEqual(before)
  })
})