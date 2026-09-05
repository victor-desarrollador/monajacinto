/**
 * inventoryService — the ONLY domain path that computes stock mutation.
 *
 * Pure and snapshot-based:
 * - accepts a StoreSnapshot plus the StockMovement batch to apply;
 * - validates the ENTIRE batch before producing anything (all-or-nothing);
 * - never mutates the input snapshot or the input movements;
 * - never persists (no loadStore/saveStore/resetStore here — the caller owns
 *   persistence via store.ts).
 */
import type { StockMovement, StoreSnapshot } from '../domain/types'

const rowKey = (variantId: string, locationId: string): string =>
  JSON.stringify([variantId, locationId])

/**
 * Derived availability: available = physical - reserved.
 * Rejects with an explicit error when the inventory row does not exist.
 */
export function availableAt(
  storeSnapshot: StoreSnapshot,
  variantId: string,
  locationId: string,
): number {
  const row = storeSnapshot.inventory.find(
    (r) => r.variantId === variantId && r.locationId === locationId,
  )
  if (!row) {
    throw new Error(
      `availableAt: no inventory row for variant ${variantId} at location ${locationId}`,
    )
  }
  return row.physical - row.reserved
}

/**
 * Apply a batch of StockMovements and return the resulting StoreSnapshot.
 *
 * Aggregation rule: quantities are summed per (variantId, locationId) ONLY to
 * compute the resulting Inventory.physical. Audit records are NEVER collapsed:
 * every original StockMovement is appended individually to
 * result.stockMovements (one movement per SaleItem).
 *
 * Validation (performed for the whole batch before any result is built):
 * - every movement must reference an existing inventory row;
 * - resulting physical must not be negative;
 * - resulting physical must satisfy physical >= reserved.
 *
 * On any violation: throws; no partial result is constructed or returned.
 */
export function applySaleToInventory(
  storeSnapshot: StoreSnapshot,
  stockMovements: StockMovement[],
): StoreSnapshot {
  // 1. Aggregate the inventory delta per (variantId, locationId).
  const deltas = new Map<
    string,
    { variantId: string; locationId: string; delta: number }
  >()
  for (const movement of stockMovements) {
    const key = rowKey(movement.variantId, movement.locationId)
    const entry = deltas.get(key)
    if (entry) {
      entry.delta += movement.quantity
    } else {
      deltas.set(key, {
        variantId: movement.variantId,
        locationId: movement.locationId,
        delta: movement.quantity,
      })
    }
  }

  // 2. Validate every affected row BEFORE building the result.
  for (const entry of deltas.values()) {
    const row = storeSnapshot.inventory.find(
      (r) => r.variantId === entry.variantId && r.locationId === entry.locationId,
    )
    if (!row) {
      throw new Error(
        `applySaleToInventory: no inventory row for variant ${entry.variantId} at location ${entry.locationId}`,
      )
    }
    const resultingPhysical = row.physical + entry.delta
    if (resultingPhysical < 0) {
      throw new Error(
        `applySaleToInventory: resulting physical for variant ${entry.variantId} at location ${entry.locationId} would be negative (${row.physical} + ${entry.delta})`,
      )
    }
    if (resultingPhysical < row.reserved) {
      throw new Error(
        `applySaleToInventory: resulting physical for variant ${entry.variantId} at location ${entry.locationId} would be ${resultingPhysical} < reserved ${row.reserved}`,
      )
    }
  }

  // 3. All validations passed: build the complete next snapshot.
  const nextInventory = storeSnapshot.inventory.map((row) => {
    const entry = deltas.get(rowKey(row.variantId, row.locationId))
    return entry ? { ...row, physical: row.physical + entry.delta } : row
  })

  return {
    ...storeSnapshot,
    inventory: nextInventory,
    stockMovements: [...storeSnapshot.stockMovements, ...stockMovements],
  }
}
