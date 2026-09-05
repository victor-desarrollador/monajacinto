import { describe, it, expect, beforeEach } from 'vitest'
import { loadStore, saveStore, resetStore, STORE_KEY } from './store'
import { seedStore } from '../domain/seed'

// Importing this module at all exercises the runtime import chain
// store.ts -> seed.ts -> types.ts (types.ts is type-only at runtime),
// proving there is no circular runtime dependency.

describe('store (single localStorage snapshot)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  describe('loadStore', () => {
    it('seeds localStorage when no snapshot exists', () => {
      expect(window.localStorage.getItem(STORE_KEY)).toBeNull()
      const snapshot = loadStore()
      expect(snapshot).toEqual(seedStore())
      expect(window.localStorage.getItem(STORE_KEY)).not.toBeNull()
    })

    it('persists the seed exactly once on first load', () => {
      const snapshot = loadStore()
      const persisted = JSON.parse(
        window.localStorage.getItem(STORE_KEY) as string,
      )
      expect(persisted).toEqual(snapshot)
      expect(snapshot.counters.sale).toBe(1)
    })

    it('returns the persisted snapshot on subsequent loads', () => {
      const first = loadStore()
      const second = loadStore()
      expect(second).toEqual(first)
    })
  })

  describe('saveStore / loadStore roundtrip', () => {
    it('preserves the complete snapshot', () => {
      const snapshot = loadStore()
      snapshot.counters.sale = 42
      snapshot.products[0].name = 'Remera Básica Editada'
      saveStore(snapshot)

      const restored = loadStore()
      expect(restored).toEqual(snapshot)
      expect(restored.counters.sale).toBe(42)
      expect(restored.products[0].name).toBe('Remera Básica Editada')
    })

    it('overwrites the previous snapshot under the same key', () => {
      const a = loadStore()
      const b = { ...seedStore(), counters: { sale: 7 } }
      saveStore(a)
      saveStore(b)
      expect(loadStore().counters.sale).toBe(7)
    })
  })

  describe('resetStore', () => {
    it('restores and returns a fresh seed snapshot', () => {
      const mutated = loadStore()
      mutated.counters.sale = 99
      saveStore(mutated)

      const restored = resetStore()
      expect(restored).toEqual(seedStore())
      expect(loadStore()).toEqual(seedStore())
    })
  })

  describe('single-key invariant', () => {
    it('uses exactly one localStorage key across load/save/reset', () => {
      loadStore()
      saveStore(loadStore())
      resetStore()
      loadStore()
      expect(window.localStorage.length).toBe(1)
      expect(window.localStorage.key(0)).toBe(STORE_KEY)
    })
  })
})
