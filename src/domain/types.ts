import type { SaleStatus } from './statuses'

export type Id = string

export type LocationType = 'BRANCH' | 'WAREHOUSE'

/**
 * A stock location (physical store branch or warehouse).
 */
export interface Location {
  id: Id
  name: string
  type: LocationType
}

export interface Product {
  id: Id
  name: string
  category: string
  brand: string
}

export interface ProductVariant {
  id: Id
  productId: Id
  sku: string
  color: string
  size: string
  /** Integer cents. SaleItem.unitPrice is frozen from this value. */
  salePrice: number
  /** Integer cents. */
  resellerPrice: number
  barcode?: string
}

/**
 * Inventory for a (variant, location) pair.
 *
 * Invariant: physical >= reserved.
 * available = physical - reserved (derived, never stored).
 */
export interface Inventory {
  variantId: Id
  locationId: Id
  physical: number
  reserved: number
}

/**
 * Traceable stock movement. Exactly one per SaleItem at finalization.
 *
 * `referenceId` = the originating sale id.
 * `saleItemId` = the specific SaleItem that caused this movement.
 * Both are preserved so any movement can be traced to its exact source.
 * Movements are never collapsed/aggregated out of existence.
 */
export interface StockMovement {
  id: Id
  variantId: Id
  locationId: Id
  quantity: number
  type: 'SALE'
  referenceType: 'SALE'
  referenceId: Id
  saleItemId: Id
  createdAt: string
  userId: Id
}

export interface SaleItem {
  id: Id
  saleId: Id
  variantId: Id
  quantity: number
  /** Frozen from ProductVariant.salePrice at add time. Never from UI. */
  unitPrice: number
  /** Per-unit discount in cents. 0 <= discount <= unitPrice. */
  discount: number
  /** (unitPrice - discount) * quantity, in integer cents. */
  subtotal: number
}

export interface Sale {
  id: Id
  /** Human-readable number, e.g. "V-0001". */
  number: string
  posId: Id
  sellerId: Id
  branchId: Id
  status: SaleStatus
  items: SaleItem[]
  total: number
  createdAt: string
  finalizedAt?: string
}

export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'QR' | 'TARJETA'

export interface Payment {
  id: Id
  saleId: Id
  method: PaymentMethod
  financialAccountId: Id
  /** Amount applied to the sale total (integer cents). */
  amount: number
  /**
   * EFECTIVO-only demo metadata.
   * cashReceived = cash physically handed over (>= amount).
   * change = cashReceived - amount.
   * change is NOT revenue and never produces a FinancialMovement.
   * Never present for non-EFECTIVO methods.
   */
  cashReceived?: number
  change?: number
}

/**
 * DEMO-ledger only — no treasury semantics.
 * Exactly one per Payment. amount is exactly Payment.amount.
 */
export interface FinancialMovement {
  id: Id
  type: 'SALE_DEMO'
  direction: 'IN'
  /** Equals the originating Payment.amount (integer cents). */
  amount: number
  method: PaymentMethod
  financialAccountId: Id
  referenceId: Id
  createdAt: string
}

/**
 * Single source of truth for the demo's browser localStorage persistence.
 */
export interface StoreSnapshot {
  locations: Location[]
  products: Product[]
  variants: ProductVariant[]
  inventory: Inventory[]
  stockMovements: StockMovement[]
  sales: Sale[]
  payments: Payment[]
  financialMovements: FinancialMovement[]
  counters: { sale: number }
}
