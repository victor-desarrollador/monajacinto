/**
 * finalizeService — finalize one fully-paid sale (PAID -> COMPLETED).
 *
 * This is the ONLY moment stock changes. Unlike the pure helper services,
 * finalizeService owns the final browser-store commit:
 *
 *   1. validate EVERYTHING in memory (status, existing effects, exact
 *      payments, current stock, inventoryService aggregation);
 *   2. compute the COMPLETE next StoreSnapshot in memory;
 *   3. call saveStore(nextSnapshot) EXACTLY ONCE;
 *   4. return the completed snapshot.
 *
 * localStorage is not ACID — this only SIMULATES all-or-nothing for the demo.
 * No intermediate saves are ever performed. If saveStore throws, no
 * compensating writes are attempted.
 *
 * Idempotency: a repeated call for an already-finalized (COMPLETED) sale
 * rejects (via assertTransition and the existing-effects guards), so effects
 * can never be duplicated.
 */
import type {
  FinancialMovement,
  StockMovement,
  StoreSnapshot,
} from '../domain/types'
import { addMoney } from '../domain/money'
import { assertTransition } from '../domain/statuses'
import { applySaleToInventory, availableAt } from './inventoryService'
import { saveStore } from './store'

export interface FinalizeSaleInput {
  saleId: string
  /** Deterministic caller-provided finalization timestamp. */
  finalizedAt: string
  /** Deterministic cashier/finalizer user id. */
  userId: string
}

/**
 * Finalize a fully-paid sale.
 *
 * Validation order (nothing is persisted unless every step succeeds):
 * 1. sale exists;
 * 2. status is PAID (assertTransition rejects DRAFT / PENDING_PAYMENT /
 *    COMPLETED — the COMPLETED case is idempotency guard #1);
 * 3. no StockMovement / FinancialMovement already references the sale
 *    (idempotency/corruption guard #2);
 * 4. sum(Payment.amount) === sale.total exactly (cashReceived/change never
 *    count);
 * 5. current-stock revalidation: availableAt >= item.quantity per SaleItem;
 * 6. StockMovement batch built (one per SaleItem) and applied through
 *    inventoryService.applySaleToInventory (the only stock-mutation path);
 * 7. FinancialMovement batch built (one per Payment, demo ledger only);
 * 8. complete next snapshot assembled in memory;
 * 9. saveStore(nextSnapshot) exactly once.
 */
export function finalizeSale(
  currentSnapshot: StoreSnapshot,
  input: FinalizeSaleInput,
): StoreSnapshot {
  const sale = currentSnapshot.sales.find((s) => s.id === input.saleId)
  if (!sale) {
    throw new Error(`finalizeService: sale not found: ${input.saleId}`)
  }

  // 2. Status guard + idempotency guard #1: only PAID finalizes.
  assertTransition(sale.status, 'COMPLETED')

  // 3. Existing-effects guard (idempotency/corruption guard #2).
  const hasStockEffects = currentSnapshot.stockMovements.some(
    (m) => m.referenceType === 'SALE' && m.referenceId === input.saleId,
  )
  if (hasStockEffects) {
    throw new Error(
      `finalizeService: sale ${input.saleId} already has StockMovement effects`,
    )
  }
  const hasFinancialEffects = currentSnapshot.financialMovements.some(
    (fm) => fm.referenceId === input.saleId,
  )
  if (hasFinancialEffects) {
    throw new Error(
      `finalizeService: sale ${input.saleId} already has FinancialMovement effects`,
    )
  }

  // 4. Exact-payment revalidation — Payment.amount is the only applied amount.
  const payments = currentSnapshot.payments.filter(
    (p) => p.saleId === input.saleId,
  )
  const paid = payments.reduce((acc, p) => addMoney(acc, p.amount), 0)
  if (paid !== sale.total) {
    throw new Error(
      `finalizeService: payment sum ${paid} does not equal sale total ${sale.total}`,
    )
  }

  // 5. Final current-stock revalidation, per SaleItem.
  for (const item of sale.items) {
    const available = availableAt(
      currentSnapshot,
      item.variantId,
      sale.branchId,
    )
    if (available < item.quantity) {
      throw new Error(
        `finalizeService: insufficient stock for variant ${item.variantId} at ${sale.branchId}: available ${available} < required ${item.quantity}`,
      )
    }
  }

  // 6. StockMovement batch: exactly one per SaleItem (audit rows are NEVER
  //    collapsed, even across the same variant/location grouping).
  const stockMovements: StockMovement[] = sale.items.map((item) => ({
    id: `SM-${item.id}`,
    variantId: item.variantId,
    locationId: sale.branchId,
    quantity: -item.quantity,
    type: 'SALE',
    referenceType: 'SALE',
    referenceId: input.saleId,
    saleItemId: item.id,
    createdAt: input.finalizedAt,
    userId: input.userId,
  }))

  // 7. Demo FinancialMovement batch: exactly one per Payment.
  const financialMovements: FinancialMovement[] = payments.map((payment) => ({
    id: `FM-${payment.id}`,
    type: 'SALE_DEMO',
    direction: 'IN',
    amount: payment.amount,
    method: payment.method,
    financialAccountId: payment.financialAccountId,
    referenceId: input.saleId,
    createdAt: input.finalizedAt,
  }))

  // 8. Apply stock through inventoryService (pure calculation, no persistence).
  //    applySaleToInventory re-validates physical >= reserved for the
  //    aggregated deltas and appends every movement individually.
  const withStock = applySaleToInventory(currentSnapshot, stockMovements)

  // 9. Assemble the COMPLETE next snapshot in memory.
  const nextSnapshot: StoreSnapshot = {
    ...withStock,
    financialMovements: [
      ...withStock.financialMovements,
      ...financialMovements,
    ],
    sales: withStock.sales.map((s) =>
      s.id === input.saleId
        ? {
            ...s,
            status: 'COMPLETED',
            finalizedAt: input.finalizedAt,
          }
        : s,
    ),
  }

  // 10. Persist exactly once — only after every validation succeeded.
  saveStore(nextSnapshot)
  return nextSnapshot
}