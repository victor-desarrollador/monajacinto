/**
 * paymentService — cashier payment registration for a sale in PENDING_PAYMENT.
 *
 * Pure and snapshot-based (same contract as inventoryService/salesService):
 * - takes the current StoreSnapshot and returns the complete next snapshot;
 * - never persists, never mutates the input snapshot or existing rows;
 * - NEVER touches inventory, StockMovements or FinancialMovements.
 *
 * Only two things may change in the result:
 * - a new Payment row is appended;
 * - the sale may transition PENDING_PAYMENT -> PAID (only when the exact
 *   sale total has been paid, using the approved status transition rules).
 */
import type { Payment, PaymentMethod, StoreSnapshot } from '../domain/types'
import { addMoney, subtractMoney } from '../domain/money'
import { assertTransition } from '../domain/statuses'

export interface AddPaymentInput {
  /** Caller-provided deterministic id (no randomness, no Date.now). */
  id: string
  method: PaymentMethod
  financialAccountId: string
  /** Amount applied to the sale, integer cents. */
  amount: number
  /** EFECTIVO-only: cash physically handed over. Forbidden for other methods. */
  cashReceived?: number
}

/**
 * Register one payment for a PENDING_PAYMENT sale.
 *
 * - Rejects any other sale state (DRAFT, PAID, COMPLETED) and unknown sales.
 * - amount must be a positive integer (cents).
 * - The cumulative applied amount (existing payments for the sale + amount)
 *   must never exceed sale.total; overpayment rejects the whole operation.
 * - Exactly: cumulative < total keeps PENDING_PAYMENT,
 *            cumulative === total transitions to PAID.
 * - EFECTIVO requires cashReceived >= amount; change = cashReceived - amount
 *   is persisted but is NOT revenue and does NOT count toward the paid sum.
 * - Non-cash methods reject cashReceived/change metadata.
 * - Individual Payment rows are never collapsed or merged.
 */
export function addPayment(
  storeSnapshot: StoreSnapshot,
  saleId: string,
  input: AddPaymentInput,
): StoreSnapshot {
  // change is ALWAYS derived by paymentService. AddPaymentInput does not
  // expose it, but a runtime caller could still inject an own `change`
  // property — reject it explicitly, never trust or silently ignore it.
  const hasCallerSuppliedChange = Object.prototype.hasOwnProperty.call(
    input,
    'change',
  )
  if (hasCallerSuppliedChange) {
    throw new Error(
      'paymentService: change is derived and must not be supplied',
    )
  }

  const sale = storeSnapshot.sales.find((s) => s.id === saleId)
  if (!sale) {
    throw new Error(`paymentService: sale not found: ${saleId}`)
  }
  if (sale.status !== 'PENDING_PAYMENT') {
    throw new Error(
      `paymentService: cannot add payment to sale ${saleId} in state ${sale.status}; only PENDING_PAYMENT is payable`,
    )
  }
  if (storeSnapshot.payments.some((p) => p.id === input.id)) {
    throw new Error(`paymentService: a payment with id ${input.id} already exists`)
  }
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new Error('paymentService: amount must be a positive integer (cents)')
  }

  let cashFields: { cashReceived: number; change: number } | undefined
  if (input.method === 'EFECTIVO') {
    const cashReceived = input.cashReceived
    if (cashReceived === undefined) {
      throw new Error('paymentService: EFECTIVO payment requires cashReceived')
    }
    if (!Number.isInteger(cashReceived) || cashReceived < input.amount) {
      throw new Error('paymentService: cashReceived must be >= amount')
    }
    cashFields = { cashReceived, change: subtractMoney(cashReceived, input.amount) }
  } else if (input.cashReceived !== undefined) {
    throw new Error(
      `paymentService: method ${input.method} must not carry cashReceived`,
    )
  }

  // One consistent snapshot: paid sum comes from the SAME StoreSnapshot used
  // to find the sale and read sale.total.
  const paidSoFar = storeSnapshot.payments
    .filter((p) => p.saleId === saleId)
    .reduce((acc, p) => addMoney(acc, p.amount), 0)
  const cumulative = addMoney(paidSoFar, input.amount)

  if (cumulative > sale.total) {
    throw new Error(
      `paymentService: payment would overpay sale ${saleId}: cumulative ${cumulative} > total ${sale.total}`,
    )
  }

  const payment: Payment = {
    id: input.id,
    saleId,
    method: input.method,
    financialAccountId: input.financialAccountId,
    amount: input.amount,
    ...cashFields,
  }

  let nextSale = sale
  if (cumulative === sale.total) {
    assertTransition(sale.status, 'PAID')
    nextSale = { ...sale, status: 'PAID' }
  }

  return {
    ...storeSnapshot,
    payments: [...storeSnapshot.payments, payment],
    sales: storeSnapshot.sales.map((s) => (s.id === sale.id ? nextSale : s)),
  }
}