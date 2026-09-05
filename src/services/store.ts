/**
 * Browser-only demo persistence: a single localStorage key holds the complete
 * StoreSnapshot. All services read via loadStore(), compute a new snapshot in
 * memory, and persist it with saveStore(). No stock/money mutation logic lives
 * here — this module only loads and persists snapshots.
 *
 * Import direction (runtime): store.ts -> seed.ts -> types.ts
 */
import { seedStore } from '../domain/seed'
import type { StoreSnapshot } from '../domain/types'

/** The one and only localStorage key used by the demo. */
export const STORE_KEY = 'monajacinto:demo-store:v1'

/**
 * Load the persisted snapshot. If none exists yet, build the deterministic
 * seed, persist it once, and return it.
 */
export function loadStore(): StoreSnapshot {
  const raw = window.localStorage.getItem(STORE_KEY)
  if (raw === null) {
    const seed = seedStore()
    saveStore(seed)
    return seed
  }
  return JSON.parse(raw) as StoreSnapshot
}

/** Persist the complete snapshot under the single demo key. */
export function saveStore(snapshot: StoreSnapshot): void {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(snapshot))
}

/** Discard any persisted demo state and restore a fresh seed snapshot. */
export function resetStore(): StoreSnapshot {
  window.localStorage.removeItem(STORE_KEY)
  const seed = seedStore()
  saveStore(seed)
  return seed
}
