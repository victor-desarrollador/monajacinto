export const SaleStatuses = {
  DRAFT: 'DRAFT',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  COMPLETED: 'COMPLETED',
} as const

export type SaleStatus = (typeof SaleStatuses)[keyof typeof SaleStatuses]

/**
 * Allowed state transitions.
 */
const allowed: Record<SaleStatus, ReadonlyArray<SaleStatus>> = {
  DRAFT: ['PENDING_PAYMENT'],
  PENDING_PAYMENT: ['PAID'],
  PAID: ['COMPLETED'],
  COMPLETED: [],
}

export function canTransition(from: SaleStatus, to: SaleStatus): boolean {
  return allowed[from].includes(to)
}

export function assertTransition(
  from: SaleStatus,
  to: SaleStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid sale status transition: ${from} -> ${to}`)
  }
}
