/**
 * salesService — seller-side sale lifecycle: DRAFT -> PENDING_PAYMENT.
 *
 * Pure and snapshot-based (same contract as inventoryService):
 * - takes the current StoreSnapshot and returns the complete next snapshot;
 * - never persists, never mutates the input snapshot;
 * - NEVER changes stock: no inventory writes, no StockMovement creation.
 *   Stock changes happen only at finalization (Task 8).
 *
 * Price authority: SaleItem.unitPrice is ALWAYS frozen from
 * ProductVariant.salePrice (via catalogService). React/UI can never supply a
 * price — addItem has no price parameter.
 */
import type { Sale, SaleItem, StoreSnapshot } from '../domain/types'
import { addMoney, multiplyByQuantity, subtractMoney } from '../domain/money'
import { assertTransition } from '../domain/statuses'
import { getVariantById } from './catalogService'
import { availableAt } from './inventoryService'

export interface CreateSaleInput {
  id: string
  posId: string
  sellerId: string
  branchId: string
  createdAt: string
}

/**
 * Create a DRAFT sale.
 *
 * - number follows the V-.... convention from StoreSnapshot.counters.sale;
 * - counters.sale is incremented exactly once per created sale;
 * - id/createdAt are caller-provided so the service stays deterministic
 *   (no randomness, no Date.now);
 * - a duplicate sale id is rejected.
 */
export function createSale(
  storeSnapshot: StoreSnapshot,
  input: CreateSaleInput,
): { snapshot: StoreSnapshot; sale: Sale } {
  if (storeSnapshot.sales.some((s) => s.id === input.id)) {
    throw new Error(`salesService: a sale with id ${input.id} already exists`)
  }
  const sale: Sale = {
    id: input.id,
    number: `V-${String(storeSnapshot.counters.sale).padStart(4, '0')}`,
    posId: input.posId,
    sellerId: input.sellerId,
    branchId: input.branchId,
    status: 'DRAFT',
    items: [],
    total: 0,
    createdAt: input.createdAt,
  }
  const snapshot: StoreSnapshot = {
    ...storeSnapshot,
    sales: [...storeSnapshot.sales, sale],
    counters: {
      ...storeSnapshot.counters,
      sale: storeSnapshot.counters.sale + 1,
    },
  }
  return { snapshot, sale }
}

/**
 * Add a variant to a DRAFT sale.
 *
 * - unitPrice is frozen from ProductVariant.salePrice at first add;
 * - subtotal = quantity * (unitPrice - discount), integer cents;
 * - validates quantity > 0, discount >= 0;
 * - NEW line: discount <= catalog salePrice is validated, then unitPrice is
 *   frozen from that price;
 * - EXISTING line: existing.unitPrice and existing.discount are the price
 *   authority (never the current catalog salePrice);
 * - same variant + same discount increments the existing line;
 * - same variant + different discount is rejected;
 * - the TOTAL resulting quantity is validated against
 *   availableAt(storeSnapshot, variantId, sale.branchId).
 */
export function addItem(
  storeSnapshot: StoreSnapshot,
  saleId: string,
  variantId: string,
  quantity: number,
  discount: number,
): StoreSnapshot {
  const sale = findSale(storeSnapshot, saleId)
  if (sale.status !== 'DRAFT') {
    throw new Error(
      `salesService: cannot add items to sale ${saleId} in state ${sale.status}`,
    )
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('salesService: quantity must be a positive integer')
  }
  if (!Number.isInteger(discount) || discount < 0) {
    throw new Error('salesService: discount must be an integer >= 0')
  }

  const existing = sale.items.find((item) => item.variantId === variantId)
  if (existing && existing.discount !== discount) {
    throw new Error(
      `salesService: variant ${variantId} is already in sale ${saleId} with a different discount`,
    )
  }

  const totalQuantity = (existing ? existing.quantity : 0) + quantity
  assertAvailability(storeSnapshot, sale, variantId, totalQuantity)

  let items: SaleItem[]
  if (existing) {
    // EXISTING frozen line: existing.unitPrice and existing.discount are the
    // price authority. The current catalog salePrice is NEVER used for
    // validation or recomputation here.
    const subtotal = multiplyByQuantity(
      subtractMoney(existing.unitPrice, existing.discount),
      totalQuantity,
    )
    items = sale.items.map((item) =>
      item.variantId === variantId
        ? { ...item, quantity: totalQuantity, subtotal }
        : item,
    )
  } else {
    // NEW line: resolve catalog salePrice, validate discount against it, and
    // freeze it into unitPrice.
    const unitPrice = getVariantById(storeSnapshot, variantId).salePrice
    if (discount > unitPrice) {
      throw new Error(
        `salesService: discount ${discount} exceeds unitPrice ${unitPrice} for variant ${variantId}`,
      )
    }
    const subtotal = multiplyByQuantity(
      subtractMoney(unitPrice, discount),
      totalQuantity,
    )
    items = [
      ...sale.items,
      {
        id: `${saleId}:${variantId}`,
        saleId,
        variantId,
        quantity: totalQuantity,
        unitPrice,
        discount,
        subtotal,
      },
    ]
  }

  return withSale(storeSnapshot, sale, { ...sale, items })
}

/**
 * Send a DRAFT sale to the cashier: DRAFT -> PENDING_PAYMENT.
 *
 * - requires at least one item AND a positive total (Sale.total > 0), so the
 *   sale is always payable (Payment.amount > 0);
 * - only accepts DRAFT (assertTransition rejects anything else);
 * - never changes stock, never creates a payment, never finalizes.
 */
export function sendToCashier(
  storeSnapshot: StoreSnapshot,
  saleId: string,
): StoreSnapshot {
  const sale = findSale(storeSnapshot, saleId)
  if (sale.items.length === 0) {
    throw new Error(
      `salesService: cannot send empty sale ${saleId} to the cashier`,
    )
  }
  if (sale.total <= 0) {
    throw new Error(
      `salesService: cannot send sale ${saleId} with total ${sale.total} to the cashier; total must be greater than zero`,
    )
  }
  assertTransition(sale.status, 'PENDING_PAYMENT')
  return withSale(storeSnapshot, sale, { ...sale, status: 'PENDING_PAYMENT' })
}

function findSale(storeSnapshot: StoreSnapshot, saleId: string): Sale {
  const sale = storeSnapshot.sales.find((s) => s.id === saleId)
  if (!sale) {
    throw new Error(`salesService: sale not found: ${saleId}`)
  }
  return sale
}

function assertAvailability(
  storeSnapshot: StoreSnapshot,
  sale: Sale,
  variantId: string,
  totalQuantity: number,
): void {
  const available = availableAt(storeSnapshot, variantId, sale.branchId)
  if (totalQuantity > available) {
    throw new Error(
      `salesService: requested total quantity ${totalQuantity} for variant ${variantId} exceeds available ${available} at location ${sale.branchId}`,
    )
  }
}

function withSale(
  storeSnapshot: StoreSnapshot,
  sale: Sale,
  nextSale: Sale,
): StoreSnapshot {
  // Sale.total is ALWAYS recomputed from item subtotals (integer cents).
  const total = nextSale.items.reduce(
    (acc, item) => addMoney(acc, item.subtotal),
    0,
  )
  const finalSale = { ...nextSale, total }
  return {
    ...storeSnapshot,
    sales: storeSnapshot.sales.map((s) => (s.id === sale.id ? finalSale : s)),
  }
}