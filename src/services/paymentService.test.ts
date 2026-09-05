import { describe, it, expect } from 'vitest'
import { addPayment, type AddPaymentInput } from './paymentService'
import { createSale, addItem, sendToCashier } from './salesService'
import { seedStore } from '../domain/seed'
import type { Payment, StoreSnapshot } from '../domain/types'

const BRANCH = 'LOC-BRANCH-CENTRO'
const SALE_ID = 'SALE-0001'
const TOTAL = 100000

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

function pendingSaleSnapshot(): StoreSnapshot {
  const base = seedStore()
  // Test-local fixture: one custom variant priced exactly TOTAL so the sale
  // total is precisely controllable. seed.ts itself is untouched.
  const snapshot: StoreSnapshot = {
    ...base,
    variants: [
      ...base.variants,
      {
        id: 'VAR-DEMO-100K',
        productId: 'PROD-REM-BAS',
        sku: 'DEMO-100K',
        color: 'Gris',
        size: 'U',
        salePrice: TOTAL,
        resellerPrice: 80000,
      },
    ],
    inventory: [
      ...base.inventory,
      {
        variantId: 'VAR-DEMO-100K',
        locationId: BRANCH,
        physical: 10,
        reserved: 0,
      },
    ],
  }
  const created = createSale(snapshot, {
    id: SALE_ID,
    posId: 'POS-1',
    sellerId: 'USER-SELLER-1',
    branchId: BRANCH,
    createdAt: '2026-09-04T10:00:00.000Z',
  })
  const withItem = addItem(created.snapshot, SALE_ID, 'VAR-DEMO-100K', 1, 0)
  return sendToCashier(withItem, SALE_ID)
}

function draftSaleSnapshot(): StoreSnapshot {
  const created = createSale(seedStore(), {
    id: SALE_ID,
    posId: 'POS-1',
    sellerId: 'USER-SELLER-1',
    branchId: BRANCH,
    createdAt: '2026-09-04T10:00:00.000Z',
  })
  return created.snapshot
}

function completedSaleSnapshot(): StoreSnapshot {
  const pending = pendingSaleSnapshot()
  return {
    ...pending,
    sales: pending.sales.map((s) =>
      s.id === SALE_ID ? { ...s, status: 'COMPLETED' } : s,
    ),
  }
}

function paymentInput(
  overrides: Partial<AddPaymentInput> = {},
): AddPaymentInput {
  return {
    id: 'PAY-0001',
    method: 'TRANSFERENCIA',
    financialAccountId: 'ACC-BANCO-GALICIA',
    amount: 40000,
    ...overrides,
  }
}

function paymentsOf(snapshot: StoreSnapshot): Payment[] {
  return snapshot.payments.filter((p) => p.saleId === SALE_ID)
}

function saleOf(snapshot: StoreSnapshot) {
  return snapshot.sales.find((s) => s.id === SALE_ID) as StoreSnapshot['sales'][number]
}

describe('addPayment', () => {
  it('rejects a payment for a DRAFT sale', () => {
    const snapshot = draftSaleSnapshot()
    expect(() => addPayment(snapshot, SALE_ID, paymentInput())).toThrow(
      /PENDING_PAYMENT/,
    )
  })

  it('accepts a payment only when the sale is PENDING_PAYMENT', () => {
    const snapshot = pendingSaleSnapshot()
    const result = addPayment(snapshot, SALE_ID, paymentInput({ amount: 10000 }))
    expect(saleOf(result).status).toBe('PENDING_PAYMENT')
    expect(paymentsOf(result)).toHaveLength(1)
  })

  it('rejects amount <= 0', () => {
    const snapshot = pendingSaleSnapshot()
    expect(() => addPayment(snapshot, SALE_ID, paymentInput({ amount: 0 }))).toThrow(
      /amount/,
    )
    expect(() => addPayment(snapshot, SALE_ID, paymentInput({ amount: -5 }))).toThrow(
      /amount/,
    )
  })

  it('keeps the sale PENDING_PAYMENT on a partial payment (40000 < 100000)', () => {
    const snapshot = pendingSaleSnapshot()
    const result = addPayment(snapshot, SALE_ID, paymentInput())
    expect(saleOf(result).status).toBe('PENDING_PAYMENT')
    expect(paymentsOf(result)[0].amount).toBe(40000)
  })

  it('transitions to PAID on an exact cumulative payment (40000 + 60000 = 100000)', () => {
    const step1 = addPayment(
      pendingSaleSnapshot(),
      SALE_ID,
      paymentInput({ method: 'TRANSFERENCIA', amount: 40000 }),
    )
    const step2 = addPayment(
      step1,
      SALE_ID,
      paymentInput({
        id: 'PAY-0002',
        method: 'EFECTIVO',
        financialAccountId: 'ACC-CAJA-CENTRO',
        amount: 60000,
        cashReceived: 60000,
      }),
    )
    expect(saleOf(step2).status).toBe('PAID')
    expect(paymentsOf(step2).reduce((a, p) => a + p.amount, 0)).toBe(TOTAL)
  })

  it('rejects an overpayment (40000 + 60001 > 100000) and does not append it', () => {
    const step1 = addPayment(pendingSaleSnapshot(), SALE_ID, paymentInput())
    expect(() =>
      addPayment(step1, SALE_ID, paymentInput({ id: 'PAY-0002', amount: 60001 })),
    ).toThrow(/overpay/)
    expect(paymentsOf(step1)).toHaveLength(1)
    expect(saleOf(step1).status).toBe('PENDING_PAYMENT')
  })

  it('rejects further payments after the sale becomes PAID', () => {
    const step1 = addPayment(pendingSaleSnapshot(), SALE_ID, paymentInput())
    const step2 = addPayment(
      step1,
      SALE_ID,
      paymentInput({
        id: 'PAY-0002',
        method: 'EFECTIVO',
        financialAccountId: 'ACC-CAJA-CENTRO',
        amount: 60000,
        cashReceived: 60000,
      }),
    )
    expect(saleOf(step2).status).toBe('PAID')
    expect(() =>
      addPayment(step2, SALE_ID, paymentInput({ id: 'PAY-0003', amount: 1000 })),
    ).toThrow(/PENDING_PAYMENT/)
  })

  it('keeps combined payment methods as separate Payment rows', () => {
    const step1 = addPayment(
      pendingSaleSnapshot(),
      SALE_ID,
      paymentInput({ method: 'TRANSFERENCIA', amount: 40000 }),
    )
    const step2 = addPayment(
      step1,
      SALE_ID,
      paymentInput({
        id: 'PAY-0002',
        method: 'EFECTIVO',
        financialAccountId: 'ACC-CAJA-CENTRO',
        amount: 60000,
        cashReceived: 60000,
      }),
    )
    const payments = paymentsOf(step2)
    expect(payments).toHaveLength(2)
    expect(payments[0]).toMatchObject({ id: 'PAY-0001', method: 'TRANSFERENCIA', amount: 40000 })
    expect(payments[1]).toMatchObject({ id: 'PAY-0002', method: 'EFECTIVO', amount: 60000 })
  })

  it('preserves financialAccountId exactly', () => {
    const result = addPayment(
      pendingSaleSnapshot(),
      SALE_ID,
      paymentInput({ financialAccountId: 'ACC-BANCO-MACRO', amount: 10000 }),
    )
    expect(paymentsOf(result)[0].financialAccountId).toBe('ACC-BANCO-MACRO')
  })

  it('EFECTIVO: amount 60000, cashReceived 70000 -> change 10000, amount stays 60000', () => {
    const result = addPayment(
      pendingSaleSnapshot(),
      SALE_ID,
      paymentInput({
        method: 'EFECTIVO',
        financialAccountId: 'ACC-CAJA-CENTRO',
        amount: 60000,
        cashReceived: 70000,
      }),
    )
    const payment = paymentsOf(result)[0]
    expect(payment.amount).toBe(60000)
    expect(payment.cashReceived).toBe(70000)
    expect(payment.change).toBe(10000)
  })

  it('rejects EFECTIVO without cashReceived', () => {
    const snapshot = pendingSaleSnapshot()
    expect(() =>
      addPayment(
        snapshot,
        SALE_ID,
        paymentInput({ method: 'EFECTIVO', financialAccountId: 'ACC-CAJA-CENTRO', amount: 60000 }),
      ),
    ).toThrow(/cashReceived/)
  })

  it('rejects EFECTIVO when cashReceived < amount', () => {
    const snapshot = pendingSaleSnapshot()
    expect(() =>
      addPayment(
        snapshot,
        SALE_ID,
        paymentInput({
          method: 'EFECTIVO',
          financialAccountId: 'ACC-CAJA-CENTRO',
          amount: 60000,
          cashReceived: 50000,
        }),
      ),
    ).toThrow(/cashReceived/)
  })

  it('EFECTIVO: cashReceived === amount -> change === 0', () => {
    const result = addPayment(
      pendingSaleSnapshot(),
      SALE_ID,
      paymentInput({
        method: 'EFECTIVO',
        financialAccountId: 'ACC-CAJA-CENTRO',
        amount: 60000,
        cashReceived: 60000,
      }),
    )
    expect(paymentsOf(result)[0].change).toBe(0)
  })

  it('rejects TRANSFERENCIA carrying cashReceived', () => {
    const snapshot = pendingSaleSnapshot()
    expect(() =>
      addPayment(snapshot, SALE_ID, paymentInput({ cashReceived: 50000 })),
    ).toThrow(/must not carry cashReceived/)
  })

  it('rejects QR carrying cashReceived/change metadata', () => {
    const snapshot = pendingSaleSnapshot()
    expect(() =>
      addPayment(
        snapshot,
        SALE_ID,
        paymentInput({ method: 'QR', cashReceived: 50000 }),
      ),
    ).toThrow(/must not carry cashReceived/)
  })

  it('rejects TARJETA carrying cash metadata', () => {
    const snapshot = pendingSaleSnapshot()
    expect(() =>
      addPayment(
        snapshot,
        SALE_ID,
        paymentInput({ method: 'TARJETA', cashReceived: 50000 }),
      ),
    ).toThrow(/must not carry cashReceived/)
  })

  it('rejects a runtime-supplied change property (change is always derived)', () => {
    const snapshot = pendingSaleSnapshot()
    const before = clone(snapshot)
    // AddPaymentInput does not expose change, but a runtime caller can still
    // inject it. The service must reject it, never trust or silently ignore it.
    const input = {
      id: 'PAY-CHANGE-INJECTED',
      method: 'QR',
      financialAccountId: 'ACC-QR',
      amount: 10000,
      change: 5000,
    } as AddPaymentInput & { change: number }

    expect(() => addPayment(snapshot, SALE_ID, input)).toThrow(
      /change.*derived|must not be supplied/i,
    )
    expect(snapshot).toEqual(before)
  })

  it('non-cash Payment rows have no cashReceived/change fields persisted', () => {
    const result = addPayment(
      pendingSaleSnapshot(),
      SALE_ID,
      paymentInput({ amount: 10000 }),
    )
    const payment = paymentsOf(result)[0]
    expect('cashReceived' in payment).toBe(false)
    expect('change' in payment).toBe(false)
  })

  it('change does NOT count toward the cumulative paid amount', () => {
    // EFECTIVO 30000 with cashReceived 50000 (change 20000): only 30000 counts.
    const step1 = addPayment(
      pendingSaleSnapshot(),
      SALE_ID,
      paymentInput({
        method: 'EFECTIVO',
        financialAccountId: 'ACC-CAJA-CENTRO',
        amount: 30000,
        cashReceived: 50000,
      }),
    )
    // 30000 + 70000 = 100000 exactly -> must PAID (if change counted, this
    // would overpay: 50000 + 70000 = 120000 > 100000).
    const step2 = addPayment(
      step1,
      SALE_ID,
      paymentInput({ id: 'PAY-0002', amount: 70000 }),
    )
    expect(saleOf(step2).status).toBe('PAID')
  })

  it('rejects a duplicate payment id', () => {
    const step1 = addPayment(pendingSaleSnapshot(), SALE_ID, paymentInput())
    expect(() =>
      addPayment(step1, SALE_ID, paymentInput({ amount: 10000 })),
    ).toThrow(/already exists/)
  })

  it('rejects an unknown sale', () => {
    const snapshot = pendingSaleSnapshot()
    expect(() => addPayment(snapshot, 'SALE-NOPE', paymentInput())).toThrow(
      /sale not found/,
    )
  })

  it('rejects a payment for a COMPLETED sale', () => {
    const snapshot = completedSaleSnapshot()
    expect(() => addPayment(snapshot, SALE_ID, paymentInput())).toThrow(
      /PENDING_PAYMENT/,
    )
  })

  it('leaves the original StoreSnapshot unchanged', () => {
    const snapshot = pendingSaleSnapshot()
    const before = clone(snapshot)
    addPayment(snapshot, SALE_ID, paymentInput())
    expect(snapshot).toEqual(before)
  })

  it('does NOT change inventory, stockMovements or financialMovements', () => {
    const snapshot = pendingSaleSnapshot()
    const beforeInventory = clone(snapshot.inventory)
    const beforeMovements = clone(snapshot.stockMovements)
    const result = addPayment(snapshot, SALE_ID, paymentInput())
    expect(result.inventory).toEqual(beforeInventory)
    expect(result.stockMovements).toEqual(beforeMovements)
    expect(result.financialMovements).toEqual(snapshot.financialMovements)
    expect(result.financialMovements).toEqual([])
  })

  it('never collapses individual Payment rows (same method twice + EFECTIVO)', () => {
    const step1 = addPayment(
      pendingSaleSnapshot(),
      SALE_ID,
      paymentInput({ method: 'TRANSFERENCIA', amount: 30000 }),
    )
    const step2 = addPayment(
      step1,
      SALE_ID,
      paymentInput({ id: 'PAY-0002', method: 'TRANSFERENCIA', amount: 30000 }),
    )
    const step3 = addPayment(
      step2,
      SALE_ID,
      paymentInput({
        id: 'PAY-0003',
        method: 'EFECTIVO',
        financialAccountId: 'ACC-CAJA-CENTRO',
        amount: 40000,
        cashReceived: 40000,
      }),
    )
    const payments = paymentsOf(step3)
    expect(payments).toHaveLength(3)
    expect(payments.map((p) => p.amount)).toEqual([30000, 30000, 40000])
    expect(saleOf(step3).status).toBe('PAID')
  })
})