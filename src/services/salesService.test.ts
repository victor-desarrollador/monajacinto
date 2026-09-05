import { describe, it, expect } from 'vitest'
import { createSale, addItem, sendToCashier } from './salesService'
import { seedStore } from '../domain/seed'
import type { Sale, StoreSnapshot } from '../domain/types'

const VARIANT = 'VAR-REM-BAS-NEG-M' // salePrice 45000
const JEAN = 'VAR-JEA-SLIM-AZU-42' // salePrice 120000
const BRANCH = 'LOC-BRANCH-CENTRO' // available for VARIANT = 10 - 2 = 8

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function createDraft(
  snapshot: StoreSnapshot = seedStore(),
  saleId = 'SALE-0001',
): { snapshot: StoreSnapshot; sale: Sale } {
  return createSale(snapshot, {
    id: saleId,
    posId: 'POS-1',
    sellerId: 'USER-SELLER-1',
    branchId: BRANCH,
    createdAt: '2026-09-04T10:00:00.000Z',
  })
}

function findSale(snapshot: StoreSnapshot, saleId: string): Sale {
  return snapshot.sales.find((s) => s.id === saleId) as Sale
}

describe('createSale', () => {
  it('creates a DRAFT sale with the correct fields and increments the counter exactly once', () => {
    const seed = seedStore()
    const { snapshot, sale } = createDraft(seed)

    expect(sale.status).toBe('DRAFT')
    expect(sale.branchId).toBe(BRANCH)
    expect(sale.sellerId).toBe('USER-SELLER-1')
    expect(sale.posId).toBe('POS-1')
    expect(sale.items).toEqual([])
    expect(sale.total).toBe(0)
    expect(sale.number).toBe('V-0001')
    expect(sale.finalizedAt).toBeUndefined()
    expect(snapshot.counters.sale).toBe(2)
  })

  it('increments the counter exactly once per created sale (V-0002 on the next)', () => {
    const first = createDraft()
    const second = createSale(first.snapshot, {
      id: 'SALE-0002',
      posId: 'POS-1',
      sellerId: 'USER-SELLER-1',
      branchId: BRANCH,
      createdAt: '2026-09-04T10:01:00.000Z',
    })
    expect(second.sale.number).toBe('V-0002')
    expect(second.snapshot.counters.sale).toBe(3)
  })

  it('rejects a duplicate sale id', () => {
    const { snapshot } = createDraft()
    expect(() =>
      createSale(snapshot, {
        id: 'SALE-0001',
        posId: 'POS-1',
        sellerId: 'USER-SELLER-1',
        branchId: BRANCH,
        createdAt: '2026-09-04T10:02:00.000Z',
      }),
    ).toThrow(/already exists/)
  })
})

describe('addItem', () => {
  it('freezes unitPrice from the catalog (VAR-REM-BAS-NEG-M -> 45000)', () => {
    const { snapshot, sale } = createDraft()
    const next = addItem(snapshot, sale.id, VARIANT, 1, 0)
    const item = findSale(next, sale.id).items[0]
    expect(item.unitPrice).toBe(45000)
    expect(item.subtotal).toBe(45000)
    expect(findSale(next, sale.id).total).toBe(45000)
  })

  it('has no price parameter, so the UI cannot supply a unitPrice', () => {
    const { snapshot, sale } = createDraft()
    // @ts-expect-error addItem must not accept a unitPrice argument
    addItem(snapshot, sale.id, VARIANT, 1, 0, 45000)
  })

  it('rejects quantity === 0', () => {
    const { snapshot, sale } = createDraft()
    expect(() => addItem(snapshot, sale.id, VARIANT, 0, 0)).toThrow(
      /quantity/,
    )
  })

  it('rejects quantity < 0', () => {
    const { snapshot, sale } = createDraft()
    expect(() => addItem(snapshot, sale.id, VARIANT, -1, 0)).toThrow(
      /quantity/,
    )
  })

  it('rejects discount < 0', () => {
    const { snapshot, sale } = createDraft()
    expect(() => addItem(snapshot, sale.id, VARIANT, 1, -1)).toThrow(
      /discount/,
    )
  })

  it('rejects discount > unitPrice', () => {
    const { snapshot, sale } = createDraft()
    expect(() => addItem(snapshot, sale.id, VARIANT, 1, 45001)).toThrow(
      /exceeds unitPrice/,
    )
  })

  it('allows discount === unitPrice', () => {
    const { snapshot, sale } = createDraft()
    const next = addItem(snapshot, sale.id, VARIANT, 1, 45000)
    const item = findSale(next, sale.id).items[0]
    expect(item.discount).toBe(45000)
    expect(item.subtotal).toBe(0)
    expect(findSale(next, sale.id).total).toBe(0)
  })

  it('increments quantity and recomputes when the same variant has the same discount', () => {
    const { snapshot, sale } = createDraft()
    const step1 = addItem(snapshot, sale.id, VARIANT, 2, 0)
    const step2 = addItem(step1, sale.id, VARIANT, 3, 0)

    const items = findSale(step2, sale.id).items
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(5)
    expect(items[0].unitPrice).toBe(45000)
    expect(items[0].subtotal).toBe(225000)
    expect(findSale(step2, sale.id).total).toBe(225000)
  })

  it('keeps the frozen unitPrice when the catalog price changes after the first add', () => {
    const { snapshot, sale } = createDraft()
    const step1 = addItem(snapshot, sale.id, VARIANT, 1, 0)
    expect(findSale(step1, sale.id).items[0].unitPrice).toBe(45000)

    // New snapshot where ONLY the catalog salePrice changes to 50000.
    const mutated: StoreSnapshot = {
      ...step1,
      variants: step1.variants.map((v) =>
        v.id === VARIANT ? { ...v, salePrice: 50000 } : v,
      ),
    }

    const step2 = addItem(mutated, sale.id, VARIANT, 1, 0)
    const items = findSale(step2, sale.id).items
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
    expect(items[0].unitPrice).toBe(45000) // frozen, NOT the new catalog 50000
    expect(items[0].subtotal).toBe(90000) // 2 x (45000 - 0)
    expect(findSale(step2, sale.id).total).toBe(90000)
  })

  it('does not validate an existing frozen line against a decreased catalog price', () => {
    const { snapshot, sale } = createDraft()
    const step1 = addItem(snapshot, sale.id, VARIANT, 1, 40000)
    const item1 = findSale(step1, sale.id).items[0]
    expect(item1.unitPrice).toBe(45000)
    expect(item1.discount).toBe(40000)
    expect(item1.subtotal).toBe(5000) // 1 x (45000 - 40000)

    // New snapshot where ONLY the catalog salePrice drops to 30000.
    const mutated: StoreSnapshot = {
      ...step1,
      variants: step1.variants.map((v) =>
        v.id === VARIANT ? { ...v, salePrice: 30000 } : v,
      ),
    }

    // The existing frozen line stays authoritative: discount 40000 must NOT be
    // rejected against the current catalog 30000.
    const step2 = addItem(mutated, sale.id, VARIANT, 1, 40000)
    const items = findSale(step2, sale.id).items
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
    expect(items[0].unitPrice).toBe(45000) // frozen
    expect(items[0].discount).toBe(40000)
    expect(items[0].subtotal).toBe(10000) // 2 x (45000 - 40000)
    expect(findSale(step2, sale.id).total).toBe(10000)
  })

  it('rejects the same variant with a different discount', () => {
    const { snapshot, sale } = createDraft()
    const step1 = addItem(snapshot, sale.id, VARIANT, 1, 0)
    expect(() => addItem(step1, sale.id, VARIANT, 1, 500)).toThrow(
      /different discount/,
    )
  })

  it('validates the total resulting quantity against availableAt (8 ok, 9 rejects)', () => {
    // 8 succeeds.
    const { snapshot, sale } = createDraft()
    expect(() => addItem(snapshot, sale.id, VARIANT, 8, 0)).not.toThrow()

    // 9 rejects outright.
    const s2 = createDraft(seedStore(), 'SALE-0002').snapshot
    expect(() => addItem(s2, 'SALE-0002', VARIANT, 9, 0)).toThrow(
      /exceeds available/,
    )

    // 2 existing + 7 requested = 9 rejects (total resulting quantity).
    const step1 = addItem(snapshot, sale.id, VARIANT, 2, 0)
    expect(() => addItem(step1, sale.id, VARIANT, 7, 0)).toThrow(
      /exceeds available/,
    )
  })

  it('does NOT change inventory or stockMovements', () => {
    const { snapshot, sale } = createDraft()
    const beforeInventory = clone(snapshot.inventory)
    const beforeMovements = clone(snapshot.stockMovements)
    const next = addItem(snapshot, sale.id, VARIANT, 2, 0)
    expect(next.inventory).toEqual(beforeInventory)
    expect(next.stockMovements).toEqual(beforeMovements)
  })

  it('rejects adding items to a sale that is no longer DRAFT', () => {
    const { snapshot, sale } = createDraft()
    const withItem = addItem(snapshot, sale.id, VARIANT, 1, 0)
    const sent = sendToCashier(withItem, sale.id)
    expect(() => addItem(sent, sale.id, VARIANT, 1, 0)).toThrow(
      /in state PENDING_PAYMENT/,
    )
  })

  it('rejects adding items to an unknown sale', () => {
    const snapshot = seedStore()
    expect(() => addItem(snapshot, 'SALE-NOPE', VARIANT, 1, 0)).toThrow(
      /sale not found/,
    )
  })
})

describe('sendToCashier', () => {
  it('transitions DRAFT -> PENDING_PAYMENT', () => {
    const { snapshot, sale } = createDraft()
    const withItem = addItem(snapshot, sale.id, VARIANT, 1, 0)
    const sent = sendToCashier(withItem, sale.id)
    const resulting = findSale(sent, sale.id)
    expect(resulting.status).toBe('PENDING_PAYMENT')
    expect(resulting.items).toHaveLength(1)
    expect(resulting.total).toBe(45000)
  })

  it('rejects an empty sale', () => {
    const { snapshot, sale } = createDraft()
    expect(() => sendToCashier(snapshot, sale.id)).toThrow(/empty/)
  })

  it('rejects a sale that is not in DRAFT state', () => {
    const { snapshot, sale } = createDraft()
    const withItem = addItem(snapshot, sale.id, VARIANT, 1, 0)
    const sent = sendToCashier(withItem, sale.id)
    expect(() => sendToCashier(sent, sale.id)).toThrow(
      /Invalid sale status transition/,
    )
  })

  it('does NOT change inventory or stockMovements', () => {
    const { snapshot, sale } = createDraft()
    const withItem = addItem(snapshot, sale.id, VARIANT, 1, 0)
    const beforeInventory = clone(withItem.inventory)
    const beforeMovements = clone(withItem.stockMovements)
    const sent = sendToCashier(withItem, sale.id)
    expect(sent.inventory).toEqual(beforeInventory)
    expect(sent.stockMovements).toEqual(beforeMovements)
  })
})

describe('totals and invariants', () => {
  it('recomputes Sale.total from item subtotals using integer cents', () => {
    const { snapshot, sale } = createDraft()
    // 2 x (45000 - 500) = 89000, 1 x 120000 = 120000 -> total 209000
    const step1 = addItem(snapshot, sale.id, VARIANT, 2, 500)
    const step2 = addItem(step1, sale.id, JEAN, 1, 0)
    const resulting = findSale(step2, sale.id)
    const subtotalSum = resulting.items.reduce((acc, i) => acc + i.subtotal, 0)
    expect(resulting.total).toBe(209000)
    expect(resulting.total).toBe(subtotalSum)
  })

  it('leaves the original snapshot unchanged after successful and failed operations', () => {
    const { snapshot, sale } = createDraft()
    const before = clone(snapshot)
    const withItem = addItem(snapshot, sale.id, VARIANT, 2, 0)
    expect(snapshot).toEqual(before)
    expect(() => addItem(withItem, sale.id, VARIANT, 9, 0)).toThrow()
    expect(withItem).toEqual(clone(withItem))
    expect(snapshot).toEqual(before)
  })
})