import { describe, it, expect } from 'vitest'
import type {
  PaymentMethod,
  Payment,
  StoreSnapshot,
  Location,
  Product,
  ProductVariant,
  Inventory,
  StockMovement,
  SaleItem,
  Sale,
  FinancialMovement,
} from './types'

describe('domain types', () => {
  it('PaymentMethod includes all four values incl. QR', () => {
    const methods: PaymentMethod[] = ['EFECTIVO', 'TRANSFERENCIA', 'QR', 'TARJETA']
    expect(methods).toHaveLength(4)
    expect(methods).toContain('QR')
    expect(methods).toContain('EFECTIVO')
    expect(methods).toContain('TRANSFERENCIA')
    expect(methods).toContain('TARJETA')
  })

  it('StoreSnapshot includes payments and counters', () => {
    const snapshot: StoreSnapshot = {
      locations: [],
      products: [],
      variants: [],
      inventory: [],
      stockMovements: [],
      sales: [],
      payments: [],
      financialMovements: [],
      counters: { sale: 0 },
    }
    expect(snapshot.payments).toEqual([])
    expect(snapshot.counters).toEqual({ sale: 0 })
  })

  it('Payment supports optional cashReceived/change metadata', () => {
    const cashPayment: Payment = {
      id: 'p1',
      saleId: 's1',
      method: 'EFECTIVO',
      financialAccountId: 'fa1',
      amount: 1000,
      cashReceived: 1500,
      change: 500,
    }
    expect(cashPayment.cashReceived).toBe(1500)
    expect(cashPayment.change).toBe(500)

    const qrPayment: Payment = {
      id: 'p2',
      saleId: 's1',
      method: 'QR',
      financialAccountId: 'fa1',
      amount: 1000,
    }
    expect(qrPayment.cashReceived).toBeUndefined()
    expect(qrPayment.change).toBeUndefined()
  })

  it('Location has type BRANCH or WAREHOUSE', () => {
    const branch: Location = { id: 'l1', name: 'Sucursal', type: 'BRANCH' }
    const warehouse: Location = { id: 'l2', name: 'Depósito', type: 'WAREHOUSE' }
    expect(branch.type).toBe('BRANCH')
    expect(warehouse.type).toBe('WAREHOUSE')
  })

  it('Product / ProductVariant carry catalog fields', () => {
    const product: Product = { id: 'pr1', name: 'Remera', category: 'Ropa', brand: 'Marca' }
    const variant: ProductVariant = {
      id: 'v1',
      productId: product.id,
      sku: 'REM-ROJO-M',
      color: 'Rojo',
      size: 'M',
      salePrice: 10000010,
      resellerPrice: 9000000,
      barcode: '7790000000001',
    }
    expect(variant.salePrice).toBe(10000010)
    expect(variant.resellerPrice).toBe(9000000)
  })

  it('StockMovement is a SALE referencing sale + saleItem', () => {
    const movement: StockMovement = {
      id: 'sm1',
      variantId: 'v1',
      locationId: 'l1',
      quantity: 2,
      type: 'SALE',
      referenceType: 'SALE',
      referenceId: 's1',
      saleItemId: 'si1',
      createdAt: '2026-09-04T00:00:00.000Z',
      userId: 'u1',
    }
    expect(movement.type).toBe('SALE')
    expect(movement.referenceType).toBe('SALE')
    expect(movement.saleItemId).toBe('si1')
  })

  it('Inventory models physical and reserved', () => {
    const inv: Inventory = { variantId: 'v1', locationId: 'l1', physical: 10, reserved: 3 }
    expect(inv.physical - inv.reserved).toBe(7)
  })

  it('SaleItem carries frozen unitPrice, discount and subtotal', () => {
    const item: SaleItem = {
      id: 'si1',
      saleId: 's1',
      variantId: 'v1',
      quantity: 2,
      unitPrice: 10000,
      discount: 1000,
      subtotal: 18000,
    }
    expect(item.subtotal).toBe((item.unitPrice - item.discount) * item.quantity)
  })

  it('Sale has number/posId/sellerId/branchId and optional finalizedAt', () => {
    const sale: Sale = {
      id: 's1',
      number: 'V-0001',
      posId: 'pos1',
      sellerId: 'u1',
      branchId: 'l1',
      status: 'DRAFT',
      items: [],
      total: 0,
      createdAt: '2026-09-04T00:00:00.000Z',
    }
    expect(sale.number).toBe('V-0001')
    expect(sale.finalizedAt).toBeUndefined()
  })

  it('FinancialMovement is a SALE_DEMO IN movement', () => {
    const fm: FinancialMovement = {
      id: 'fm1',
      type: 'SALE_DEMO',
      direction: 'IN',
      amount: 1000,
      method: 'QR',
      financialAccountId: 'fa1',
      referenceId: 's1',
      createdAt: '2026-09-04T00:00:00.000Z',
    }
    expect(fm.type).toBe('SALE_DEMO')
    expect(fm.direction).toBe('IN')
    expect(fm.amount).toBe(1000)
  })
})
