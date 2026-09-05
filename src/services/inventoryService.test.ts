import { describe, it, expect } from 'vitest'
import { applySaleToInventory, availableAt } from './inventoryService'
import { seedStore } from '../domain/seed'
import type { StockMovement, StoreSnapshot } from '../domain/types'

const VARIANT = 'VAR-REM-BAS-NEG-M' // seed: physical 10, reserved 2
const LOCATION = 'LOC-BRANCH-CENTRO'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function mkMovement(overrides: Partial<StockMovement> = {}): StockMovement {
  return {
    id: 'MOV-1',
    variantId: VARIANT,
    locationId: LOCATION,
    quantity: -1,
    type: 'SALE',
    referenceType: 'SALE',
    referenceId: 'SALE-0001',
    saleItemId: 'ITEM-1',
    createdAt: '2026-09-04T10:00:00.000Z',
    userId: 'USER-SELLER-1',
    ...overrides,
  }
}

function inventoryRow(
  snapshot: StoreSnapshot,
  variantId: string,
  locationId: string,
) {
  return snapshot.inventory.find(
    (r) => r.variantId === variantId && r.locationId === locationId,
  )
}

describe('availableAt', () => {
  it('calculates physical - reserved for the seeded row (10 - 2 = 8)', () => {
    const snapshot = seedStore()
    expect(availableAt(snapshot, VARIANT, LOCATION)).toBe(8)
  })

  it('rejects an unknown variantId with an explicit error', () => {
    const snapshot = seedStore()
    expect(() => availableAt(snapshot, 'VAR-NO-EXISTE', LOCATION)).toThrow(
      /no inventory row/,
    )
  })

  it('rejects an unknown locationId with an explicit error', () => {
    const snapshot = seedStore()
    expect(() => availableAt(snapshot, VARIANT, 'LOC-NO-EXISTE')).toThrow(
      /no inventory row/,
    )
  })
})

describe('applySaleToInventory', () => {
  it('applies one sale movement to physical (10 -> 8), reserved stays 2, available 6', () => {
    const snapshot = seedStore()
    const result = applySaleToInventory(snapshot, [
      mkMovement({ quantity: -2 }),
    ])

    const row = inventoryRow(result, VARIANT, LOCATION)
    expect(row?.physical).toBe(8)
    expect(row?.reserved).toBe(2)
    expect(availableAt(result, VARIANT, LOCATION)).toBe(6)
  })

  it('aggregates multiple movements of the same variant/location for the resulting physical (10 -> 7)', () => {
    const snapshot = seedStore()
    const result = applySaleToInventory(snapshot, [
      mkMovement({ id: 'MOV-1', saleItemId: 'ITEM-1', quantity: -2 }),
      mkMovement({ id: 'MOV-2', saleItemId: 'ITEM-2', quantity: -1 }),
    ])

    expect(inventoryRow(result, VARIANT, LOCATION)?.physical).toBe(7)
  })

  it('keeps both original StockMovement records separately (never collapses audit rows)', () => {
    const snapshot = seedStore()
    const movements = [
      mkMovement({ id: 'MOV-1', saleItemId: 'ITEM-1', quantity: -2 }),
      mkMovement({ id: 'MOV-2', saleItemId: 'ITEM-2', quantity: -1 }),
    ]
    const result = applySaleToInventory(snapshot, movements)

    expect(result.stockMovements).toHaveLength(2)
    const m1 = result.stockMovements.find((m) => m.id === 'MOV-1')
    const m2 = result.stockMovements.find((m) => m.id === 'MOV-2')
    expect(m1?.saleItemId).toBe('ITEM-1')
    expect(m1?.quantity).toBe(-2)
    expect(m2?.saleItemId).toBe('ITEM-2')
    expect(m2?.quantity).toBe(-1)
    expect(result.stockMovements).toEqual(movements)
  })

  it('calculates different variant/location groups independently', () => {
    const snapshot = seedStore()
    const withSecondLocation: StoreSnapshot = {
      ...snapshot,
      locations: [
        ...snapshot.locations,
        { id: 'LOC-BRANCH-NORTE', name: 'Sucursal Norte', type: 'BRANCH' },
      ],
      inventory: [
        ...snapshot.inventory,
        {
          variantId: VARIANT,
          locationId: 'LOC-BRANCH-NORTE',
          physical: 5,
          reserved: 0,
        },
      ],
    }

    const result = applySaleToInventory(withSecondLocation, [
      mkMovement({ id: 'MOV-1', saleItemId: 'ITEM-1', quantity: -2 }),
      mkMovement({
        id: 'MOV-2',
        saleItemId: 'ITEM-2',
        locationId: 'LOC-BRANCH-NORTE',
        quantity: -3,
      }),
    ])

    expect(inventoryRow(result, VARIANT, LOCATION)?.physical).toBe(8)
    expect(
      inventoryRow(result, VARIANT, 'LOC-BRANCH-NORTE')?.physical,
    ).toBe(2)
    expect(inventoryRow(result, 'VAR-REM-BAS-NEG-S', LOCATION)?.physical).toBe(
      8,
    )
  })

  it('updates (AB, C) and (A, BC) rows independently — no composite-key collision', () => {
    const base = seedStore()
    const snapshot: StoreSnapshot = {
      ...base,
      inventory: [
        ...base.inventory,
        { variantId: 'AB', locationId: 'C', physical: 5, reserved: 0 },
        { variantId: 'A', locationId: 'BC', physical: 4, reserved: 0 },
      ],
    }

    const result = applySaleToInventory(snapshot, [
      mkMovement({
        id: 'MOV-AB-C',
        saleItemId: 'ITEM-AB-C',
        variantId: 'AB',
        locationId: 'C',
        quantity: -2,
      }),
      mkMovement({
        id: 'MOV-A-BC',
        saleItemId: 'ITEM-A-BC',
        variantId: 'A',
        locationId: 'BC',
        quantity: -3,
      }),
    ])

    expect(inventoryRow(result, 'AB', 'C')?.physical).toBe(3)
    expect(inventoryRow(result, 'A', 'BC')?.physical).toBe(1)
    expect(result.stockMovements).toHaveLength(2)
  })

  it('rejects when resulting physical < reserved (10 - 9 = 1 < 2)', () => {
    const snapshot = seedStore()
    expect(() =>
      applySaleToInventory(snapshot, [mkMovement({ quantity: -9 })]),
    ).toThrow(/reserved/)
  })

  it('rejects when resulting physical would be negative', () => {
    const snapshot = seedStore()
    // VAR-REM-BAS-NEG-S: physical 8, reserved 0; 8 - 9 = -1
    const movement = mkMovement({
      variantId: 'VAR-REM-BAS-NEG-S',
      quantity: -9,
    })
    expect(() => applySaleToInventory(snapshot, [movement])).toThrow(
      /negative/,
    )
  })

  it('rejects a movement targeting a nonexistent inventory row', () => {
    const snapshot = seedStore()
    expect(() =>
      applySaleToInventory(snapshot, [
        mkMovement({ variantId: 'VAR-NO-EXISTE' }),
      ]),
    ).toThrow(/no inventory row/)
    expect(() =>
      applySaleToInventory(snapshot, [
        mkMovement({ locationId: 'LOC-NO-EXISTE' }),
      ]),
    ).toThrow(/no inventory row/)
  })

  it('leaves the original StoreSnapshot unchanged after a successful application', () => {
    const snapshot = seedStore()
    const before = clone(snapshot)
    applySaleToInventory(snapshot, [
      mkMovement({ quantity: -2 }),
      mkMovement({ id: 'MOV-2', saleItemId: 'ITEM-2', quantity: -1 }),
    ])
    expect(snapshot).toEqual(before)
  })

  it('leaves the original StockMovement[] input unchanged', () => {
    const snapshot = seedStore()
    const movements = [
      mkMovement({ quantity: -2 }),
      mkMovement({ id: 'MOV-2', saleItemId: 'ITEM-2', quantity: -1 }),
    ]
    const before = clone(movements)
    applySaleToInventory(snapshot, movements)
    expect(movements).toEqual(before)
  })

  it('rejects the whole batch when any movement fails validation (no partial application)', () => {
    const snapshot = seedStore()
    const before = clone(snapshot)
    expect(() =>
      applySaleToInventory(snapshot, [
        mkMovement({ id: 'MOV-1', saleItemId: 'ITEM-1', quantity: -2 }),
        mkMovement({
          id: 'MOV-2',
          saleItemId: 'ITEM-2',
          variantId: 'VAR-NO-EXISTE',
          quantity: -1,
        }),
      ]),
    ).toThrow(/no inventory row/)
    // No partial result exists (the function threw) and inputs are untouched.
    expect(snapshot).toEqual(before)
  })

  it('preserves unrelated snapshot collections unchanged in value', () => {
    const snapshot = seedStore()
    const result = applySaleToInventory(snapshot, [
      mkMovement({ quantity: -2 }),
    ])
    expect(result.locations).toEqual(snapshot.locations)
    expect(result.products).toEqual(snapshot.products)
    expect(result.variants).toEqual(snapshot.variants)
    expect(result.sales).toEqual(snapshot.sales)
    expect(result.payments).toEqual(snapshot.payments)
    expect(result.financialMovements).toEqual(snapshot.financialMovements)
    expect(result.counters).toEqual(snapshot.counters)
  })
})
