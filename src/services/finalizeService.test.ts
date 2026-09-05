import { describe, it, expect, beforeEach, vi } from 'vitest'
import { finalizeSale, type FinalizeSaleInput } from './finalizeService'
import { createSale, addItem, sendToCashier } from './salesService'
import { addPayment } from './paymentService'
import { applySaleToInventory } from './inventoryService'
import { seedStore } from '../domain/seed'
import { saveStore } from './store'
import type {
  FinancialMovement,
  Inventory,
  Payment,
  Sale,
  StockMovement,
  StoreSnapshot,
} from '../domain/types'

vi.mock('./store', () => ({
  saveStore: vi.fn(),
}))

const saveStoreMock = vi.mocked(saveStore)

const BRANCH = 'LOC-BRANCH-CENTRO'
const SALE_ID = 'SALE-0001'
const DEMO_VARIANT = 'VAR-DEMO-100K'
const REM_VARIANT = 'VAR-REM-BAS-NEG-M'
const FINALIZED_AT = '2026-09-04T12:00:00.000Z'
const USER_ID = 'USER-CAJERO-1'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function withDemoVariant(base: StoreSnapshot): StoreSnapshot {
  return {
    ...base,
    variants: [
      ...base.variants,
      {
        id: DEMO_VARIANT,
        productId: 'PROD-REM-BAS',
        sku: 'DEMO-100K',
        color: 'Gris',
        size: 'U',
        salePrice: 100000,
        resellerPrice: 80000,
      },
    ],
    inventory: [
      ...base.inventory,
      { variantId: DEMO_VARIANT, locationId: BRANCH, physical: 10, reserved: 2 },
    ],
  }
}

function finalizeInput(
  overrides: Partial<FinalizeSaleInput> = {},
): FinalizeSaleInput {
  return {
    saleId: SALE_ID,
    finalizedAt: FINALIZED_AT,
    userId: USER_ID,
    ...overrides,
  }
}

/** Normal PAID sale built through the real domain services.
 *  Items: DEMO x2 (200000) + REM x1 (45000) => total 245000.
 *  Payments: TRANSFERENCIA 100000 + EFECTIVO 145000 (cash 200000, change 55000).
 */
function domainPaidSnapshot(): StoreSnapshot {
  const base = withDemoVariant(seedStore())
  const created = createSale(base, {
    id: SALE_ID,
    posId: 'POS-1',
    sellerId: 'USER-SELLER-1',
    branchId: BRANCH,
    createdAt: '2026-09-04T10:00:00.000Z',
  }).snapshot
  const item1 = addItem(created, SALE_ID, DEMO_VARIANT, 2, 0)
  const item2 = addItem(item1, SALE_ID, REM_VARIANT, 1, 0)
  const pending = sendToCashier(item2, SALE_ID)
  const pay1 = addPayment(pending, SALE_ID, {
    id: 'PAY-0001',
    method: 'TRANSFERENCIA',
    financialAccountId: 'ACC-BANCO-GALICIA',
    amount: 100000,
  })
  return addPayment(pay1, SALE_ID, {
    id: 'PAY-0002',
    method: 'EFECTIVO',
    financialAccountId: 'ACC-CAJA-CENTRO',
    amount: 145000,
    cashReceived: 200000,
  })
}

/** Hand-built PAID snapshot for malformed/corruption fixtures. */
function manualSaleSnapshot(
  saleOverrides: Partial<Sale> = {},
  options: {
    payments?: Payment[]
    stockMovements?: StockMovement[]
    financialMovements?: FinancialMovement[]
    inventory?: Inventory[]
  } = {},
): StoreSnapshot {
  const base = seedStore()
  return {
    ...base,
    inventory: options.inventory ?? base.inventory,
    stockMovements: options.stockMovements ?? [],
    financialMovements: options.financialMovements ?? [],
    payments: options.payments ?? [],
    sales: [
      {
        id: SALE_ID,
        number: 'V-0001',
        posId: 'POS-1',
        sellerId: 'USER-SELLER-1',
        branchId: BRANCH,
        status: 'PAID',
        items: [],
        total: 0,
        createdAt: '2026-09-04T10:00:00.000Z',
        ...saleOverrides,
      },
    ],
  }
}

function payment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'PAY-0001',
    saleId: SALE_ID,
    method: 'EFECTIVO',
    financialAccountId: 'ACC-CAJA-CENTRO',
    amount: 60000,
    ...overrides,
  }
}

function saleOf(snapshot: StoreSnapshot): Sale {
  return snapshot.sales.find((s) => s.id === SALE_ID) as Sale
}

beforeEach(() => {
  saveStoreMock.mockClear()
})

describe('successful finalization', () => {
  it('finalizes a PAID sale with exact payments and saves exactly once', () => {
    const snapshot = domainPaidSnapshot()
    const result = finalizeSale(snapshot, finalizeInput())

    expect(result.sales.find((s) => s.id === SALE_ID)?.status).toBe(
      'COMPLETED',
    )
    expect(saveStoreMock).toHaveBeenCalledTimes(1)
    expect(saveStoreMock).toHaveBeenCalledWith(result)
  })

  it('transitions PAID -> COMPLETED', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    expect(saleOf(result).status).toBe('COMPLETED')
  })

  it('sets finalizedAt to the supplied deterministic timestamp', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    expect(saleOf(result).finalizedAt).toBe(FINALIZED_AT)
  })

  it('leaves Sale.items unchanged', () => {
    const snapshot = domainPaidSnapshot()
    const itemsBefore = clone(saleOf(snapshot).items)
    const result = finalizeSale(snapshot, finalizeInput())
    expect(saleOf(result).items).toEqual(itemsBefore)
  })

  it('leaves Sale.total unchanged', () => {
    const snapshot = domainPaidSnapshot()
    expect(saleOf(snapshot).total).toBe(245000)
    const result = finalizeSale(snapshot, finalizeInput())
    expect(saleOf(result).total).toBe(245000)
  })

  it('leaves Payment rows unchanged', () => {
    const snapshot = domainPaidSnapshot()
    const paymentsBefore = clone(snapshot.payments)
    const result = finalizeSale(snapshot, finalizeInput())
    expect(result.payments).toEqual(paymentsBefore)
  })

  it('generates exactly one StockMovement per SaleItem', () => {
    const snapshot = domainPaidSnapshot()
    const result = finalizeSale(snapshot, finalizeInput())
    const movements = result.stockMovements
    expect(movements).toHaveLength(2)
    const itemIds = saleOf(snapshot).items.map((i) => i.id).sort()
    expect(movements.map((m) => m.saleItemId).sort()).toEqual(itemIds)
  })

  it('sets StockMovement.quantity === -SaleItem.quantity', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    const byVariant = new Map(
      result.stockMovements.map((m) => [m.variantId, m]),
    )
    expect(byVariant.get(DEMO_VARIANT)?.quantity).toBe(-2)
    expect(byVariant.get(REM_VARIANT)?.quantity).toBe(-1)
  })

  it('sets StockMovement traceability fields from the sale and item', () => {
    const snapshot = domainPaidSnapshot()
    const item = saleOf(snapshot).items.find((i) => i.variantId === REM_VARIANT)!
    const result = finalizeSale(snapshot, finalizeInput())
    const movement = result.stockMovements.find(
      (m) => m.variantId === REM_VARIANT,
    )!
    expect(movement.locationId).toBe(BRANCH)
    expect(movement.type).toBe('SALE')
    expect(movement.referenceType).toBe('SALE')
    expect(movement.referenceId).toBe(SALE_ID)
    expect(movement.saleItemId).toBe(item.id)
    expect(movement.createdAt).toBe(FINALIZED_AT)
    expect(movement.userId).toBe(USER_ID)
  })

  it('keeps multiple StockMovements for the same inventory group separate', () => {
    // Two SaleItems with the SAME variant (not reachable via salesService,
    // built deliberately to prove audit rows are never collapsed).
    const items = [
      {
        id: 'ITEM-REM-1',
        saleId: SALE_ID,
        variantId: REM_VARIANT,
        quantity: 1,
        unitPrice: 45000,
        discount: 0,
        subtotal: 45000,
      },
      {
        id: 'ITEM-REM-2',
        saleId: SALE_ID,
        variantId: REM_VARIANT,
        quantity: 1,
        unitPrice: 45000,
        discount: 0,
        subtotal: 45000,
      },
    ]
    const snapshot = manualSaleSnapshot(
      { items, total: 90000 },
      { payments: [payment({ amount: 90000, cashReceived: 90000 })] },
    )
    const result = finalizeSale(snapshot, finalizeInput())
    const remMovements = result.stockMovements.filter(
      (m) => m.variantId === REM_VARIANT,
    )
    expect(remMovements).toHaveLength(2)
    expect(remMovements.map((m) => m.saleItemId).sort()).toEqual([
      'ITEM-REM-1',
      'ITEM-REM-2',
    ])
    expect(remMovements.map((m) => m.quantity)).toEqual([-1, -1])
    // Aggregated delta applied to inventory: 10 - 2 = 8.
    expect(
      result.inventory.find((r) => r.variantId === REM_VARIANT)?.physical,
    ).toBe(8)
  })

  it('decreases inventory physical correctly after finalization', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    expect(
      result.inventory.find((r) => r.variantId === DEMO_VARIANT)?.physical,
    ).toBe(8) // 10 - 2
    expect(
      result.inventory.find((r) => r.variantId === REM_VARIANT)?.physical,
    ).toBe(9) // 10 - 1
  })

  it('leaves reserved unchanged', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    expect(
      result.inventory.find((r) => r.variantId === DEMO_VARIANT)?.reserved,
    ).toBe(2)
    expect(
      result.inventory.find((r) => r.variantId === REM_VARIANT)?.reserved,
    ).toBe(2)
  })

  it('never produces physical < reserved in the result', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    for (const row of result.inventory) {
      expect(row.physical).toBeGreaterThanOrEqual(row.reserved)
    }
  })

  it('uses applySaleToInventory as the stock mutation path', () => {
    const snapshot = domainPaidSnapshot()
    const result = finalizeSale(snapshot, finalizeInput())
    const expected = applySaleToInventory(
      snapshot,
      result.stockMovements,
    ).inventory
    expect(result.inventory).toEqual(expected)
  })

  it('generates exactly one FinancialMovement per Payment', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    expect(result.financialMovements).toHaveLength(2)
  })

  it('sets FinancialMovement.amount === Payment.amount', () => {
    const snapshot = domainPaidSnapshot()
    const result = finalizeSale(snapshot, finalizeInput())
    const amounts = result.financialMovements
      .map((fm) => fm.amount)
      .sort((a, b) => a - b)
    expect(amounts).toEqual([100000, 145000])
  })

  it('preserves Payment method and financialAccountId in each FinancialMovement', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    const byAccount = new Map(
      result.financialMovements.map((fm) => [fm.financialAccountId, fm]),
    )
    expect(byAccount.get('ACC-BANCO-GALICIA')?.method).toBe('TRANSFERENCIA')
    expect(byAccount.get('ACC-BANCO-GALICIA')?.amount).toBe(100000)
    expect(byAccount.get('ACC-CAJA-CENTRO')?.method).toBe('EFECTIVO')
    expect(byAccount.get('ACC-CAJA-CENTRO')?.amount).toBe(145000)
  })

  it('does not create extra FinancialMovement from EFECTIVO cashReceived/change', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    // cash 200000 / change 55000 never appear as amounts.
    expect(result.financialMovements).toHaveLength(2)
    expect(
      result.financialMovements.some((fm) => fm.amount === 200000),
    ).toBe(false)
    expect(
      result.financialMovements.some((fm) => fm.amount === 55000),
    ).toBe(false)
  })

  it('keeps combined payments as separate financial audit rows', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    expect(result.financialMovements).toHaveLength(2)
    expect(result.financialMovements.map((fm) => fm.referenceId)).toEqual([
      SALE_ID,
      SALE_ID,
    ])
    expect(
      result.financialMovements.map((fm) => fm.amount).sort((a, b) => a - b),
    ).toEqual([100000, 145000])
  })

  it('preserves products/variants/locations/counters unchanged in value', () => {
    const snapshot = domainPaidSnapshot()
    const result = finalizeSale(snapshot, finalizeInput())
    expect(result.products).toEqual(snapshot.products)
    expect(result.variants).toEqual(snapshot.variants)
    expect(result.locations).toEqual(snapshot.locations)
    expect(result.counters).toEqual(snapshot.counters)
  })

  it('leaves the original input snapshot unchanged', () => {
    const snapshot = domainPaidSnapshot()
    const before = clone(snapshot)
    finalizeSale(snapshot, finalizeInput())
    expect(snapshot).toEqual(before)
  })
})

describe('payment revalidation', () => {
  it('rejects a malformed PAID sale whose payment sum != total', () => {
    const snapshot = domainPaidSnapshot()
    const malformed: StoreSnapshot = {
      ...snapshot,
      payments: snapshot.payments.map((p) =>
        p.id === 'PAY-0002' ? { ...p, amount: 140000 } : p,
      ),
    }
    expect(() => finalizeSale(malformed, finalizeInput())).toThrow(
      /does not equal sale total/,
    )
    expect(saveStoreMock).not.toHaveBeenCalled()
  })

  it('cashReceived/change do NOT affect the exact payment sum', () => {
    // Total 60000, single EFECTIVO amount 60000 with cashReceived 70000
    // (change 10000). Only 60000 counts -> succeeds. If cashReceived counted,
    // 70000 !== 60000 would reject.
    const snapshot = manualSaleSnapshot(
      {
        items: [
          {
            id: 'ITEM-REM',
            saleId: SALE_ID,
            variantId: REM_VARIANT,
            quantity: 1,
            unitPrice: 45000,
            discount: 0,
            subtotal: 45000,
          },
        ],
        total: 60000,
      },
      {
        payments: [
          payment({ amount: 60000, cashReceived: 70000 }),
        ],
      },
    )
    const result = finalizeSale(snapshot, finalizeInput())
    expect(saleOf(result).status).toBe('COMPLETED')
    expect(saveStoreMock).toHaveBeenCalledTimes(1)
  })
})

describe('stock revalidation', () => {
  it('revalidates current inventory before finalizing', () => {
    const snapshot = domainPaidSnapshot()
    // Drop DEMO availability below the required 2.
    const depleted: StoreSnapshot = {
      ...snapshot,
      inventory: snapshot.inventory.map((row) =>
        row.variantId === DEMO_VARIANT
          ? { ...row, physical: 1, reserved: 0 }
          : row,
      ),
    }
    expect(() => finalizeSale(depleted, finalizeInput())).toThrow(
      /insufficient stock/,
    )
  })

  it('rejects when current stock is insufficient', () => {
    const snapshot = domainPaidSnapshot()
    const depleted: StoreSnapshot = {
      ...snapshot,
      inventory: snapshot.inventory.map((row) =>
        row.variantId === DEMO_VARIANT
          ? { ...row, physical: 1, reserved: 0 }
          : row,
      ),
    }
    expect(() => finalizeSale(depleted, finalizeInput())).toThrow(
      /insufficient stock/,
    )
  })

  it('insufficient stock causes ZERO effects and ZERO saves', () => {
    const snapshot = domainPaidSnapshot()
    const depleted: StoreSnapshot = {
      ...snapshot,
      inventory: snapshot.inventory.map((row) =>
        row.variantId === DEMO_VARIANT
          ? { ...row, physical: 1, reserved: 0 }
          : row,
      ),
    }
    const before = clone(depleted)
    expect(() => finalizeSale(depleted, finalizeInput())).toThrow(
      /insufficient stock/,
    )
    expect(saveStoreMock).not.toHaveBeenCalled()
    // No partial effects anywhere.
    expect(depleted.stockMovements).toEqual([])
    expect(depleted.financialMovements).toEqual([])
    expect(depleted.sales[0].status).toBe('PAID')
    // The input passed to finalizeSale is untouched.
    expect(depleted).toEqual(before)
  })
})

describe('state guards', () => {
  it('rejects a DRAFT sale', () => {
    const snapshot = createSale(seedStore(), {
      id: SALE_ID,
      posId: 'POS-1',
      sellerId: 'USER-SELLER-1',
      branchId: BRANCH,
      createdAt: '2026-09-04T10:00:00.000Z',
    }).snapshot
    expect(() => finalizeSale(snapshot, finalizeInput())).toThrow(
      /Invalid sale status transition/,
    )
    expect(saveStoreMock).not.toHaveBeenCalled()
  })

  it('rejects a PENDING_PAYMENT sale', () => {
    const created = createSale(seedStore(), {
      id: SALE_ID,
      posId: 'POS-1',
      sellerId: 'USER-SELLER-1',
      branchId: BRANCH,
      createdAt: '2026-09-04T10:00:00.000Z',
    }).snapshot
    const withItem = addItem(created, SALE_ID, REM_VARIANT, 1, 0)
    const pending = sendToCashier(withItem, SALE_ID)
    expect(() => finalizeSale(pending, finalizeInput())).toThrow(
      /Invalid sale status transition/,
    )
    expect(saveStoreMock).not.toHaveBeenCalled()
  })

  it('rejects an unknown sale', () => {
    const snapshot = domainPaidSnapshot()
    expect(() =>
      finalizeSale(snapshot, finalizeInput({ saleId: 'SALE-NOPE' })),
    ).toThrow(/sale not found/)
    expect(saveStoreMock).not.toHaveBeenCalled()
  })
})

describe('idempotency and existing-effect guards', () => {
  it('rejects repeated finalization and never duplicates StockMovements', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    expect(saveStoreMock).toHaveBeenCalledTimes(1)
    expect(result.stockMovements).toHaveLength(2)

    expect(() => finalizeSale(result, finalizeInput())).toThrow(
      /Invalid sale status transition/,
    )
    // Still exactly one save; no new movements were appended.
    expect(saveStoreMock).toHaveBeenCalledTimes(1)
    expect(result.stockMovements).toHaveLength(2)
  })

  it('rejects repeated finalization and never duplicates FinancialMovements', () => {
    const result = finalizeSale(domainPaidSnapshot(), finalizeInput())
    expect(result.financialMovements).toHaveLength(2)
    expect(() => finalizeSale(result, finalizeInput())).toThrow(
      /Invalid sale status transition/,
    )
    expect(result.financialMovements).toHaveLength(2)
  })

  it('detects an existing StockMovement reference before applying effects', () => {
    const snapshot = manualSaleSnapshot(
      { status: 'PAID' },
      {
        stockMovements: [
          {
            id: 'SM-EXISTING',
            variantId: REM_VARIANT,
            locationId: BRANCH,
            quantity: -1,
            type: 'SALE',
            referenceType: 'SALE',
            referenceId: SALE_ID,
            saleItemId: 'ITEM-X',
            createdAt: '2026-09-04T11:00:00.000Z',
            userId: USER_ID,
          },
        ],
      },
    )
    expect(() => finalizeSale(snapshot, finalizeInput())).toThrow(
      /already has StockMovement effects/,
    )
    expect(saveStoreMock).not.toHaveBeenCalled()
  })

  it('detects an existing FinancialMovement reference before applying effects', () => {
    const snapshot = manualSaleSnapshot(
      { status: 'PAID' },
      {
        financialMovements: [
          {
            id: 'FM-EXISTING',
            type: 'SALE_DEMO',
            direction: 'IN',
            amount: 1000,
            method: 'EFECTIVO',
            financialAccountId: 'ACC-CAJA-CENTRO',
            referenceId: SALE_ID,
            createdAt: '2026-09-04T11:00:00.000Z',
          },
        ],
      },
    )
    expect(() => finalizeSale(snapshot, finalizeInput())).toThrow(
      /already has FinancialMovement effects/,
    )
    expect(saveStoreMock).not.toHaveBeenCalled()
  })
})

describe('save-once contract', () => {
  it('successful finalization calls saveStore exactly once', () => {
    finalizeSale(domainPaidSnapshot(), finalizeInput())
    expect(saveStoreMock).toHaveBeenCalledTimes(1)
  })

  it('every validation failure calls saveStore zero times', () => {
    // Payment mismatch.
    const malformed = {
      ...domainPaidSnapshot(),
      payments: [{ ...payment({}), saleId: SALE_ID, amount: 1 }],
    }
    expect(() => finalizeSale(malformed, finalizeInput())).toThrow()
    expect(saveStoreMock).not.toHaveBeenCalled()

    // DRAFT.
    const draft = createSale(seedStore(), {
      id: SALE_ID,
      posId: 'POS-1',
      sellerId: 'USER-SELLER-1',
      branchId: BRANCH,
      createdAt: '2026-09-04T10:00:00.000Z',
    }).snapshot
    expect(() => finalizeSale(draft, finalizeInput())).toThrow()
    expect(saveStoreMock).not.toHaveBeenCalled()

    // Existing stock effect.
    const withEffect = manualSaleSnapshot({ status: 'PAID' }, {
      stockMovements: [
        {
          id: 'SM-EXISTING',
          variantId: REM_VARIANT,
          locationId: BRANCH,
          quantity: -1,
          type: 'SALE',
          referenceType: 'SALE',
          referenceId: SALE_ID,
          saleItemId: 'ITEM-X',
          createdAt: '2026-09-04T11:00:00.000Z',
          userId: USER_ID,
        },
      ],
    })
    expect(() => finalizeSale(withEffect, finalizeInput())).toThrow()
    expect(saveStoreMock).not.toHaveBeenCalled()
  })
})