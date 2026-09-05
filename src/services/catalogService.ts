/**
 * catalogService — read-only catalog lookups against an existing StoreSnapshot.
 *
 * Pure and snapshot-based:
 * - never persists, never mutates the snapshot or its products/variants;
 * - never calls loadStore/saveStore/resetStore;
 * - returns existing catalog entities so downstream services can read the
 *   authoritative ProductVariant.salePrice (the future source for
 *   SaleItem.unitPrice in Task 6). React/UI must never invent a price.
 */
import type { Product, ProductVariant, StoreSnapshot } from '../domain/types'

/**
 * Search products by name (case-insensitive substring).
 * An empty/whitespace query lists all products. Never throws.
 */
export function searchProducts(
  storeSnapshot: StoreSnapshot,
  query: string,
): Product[] {
  const term = query.trim().toLowerCase()
  return storeSnapshot.products.filter((product) =>
    product.name.toLowerCase().includes(term),
  )
}

/**
 * All variants belonging to a product, in seed order.
 * Returns [] when the product has no variants (or does not exist). Never throws.
 */
export function getVariantsByProduct(
  storeSnapshot: StoreSnapshot,
  productId: string,
): ProductVariant[] {
  return storeSnapshot.variants.filter((variant) => variant.productId === productId)
}

/**
 * Resolve a single variant by id.
 * A nonexistent variant id throws an explicit domain error (never undefined),
 * so callers cannot accidentally treat an unknown variant as a real one.
 */
export function getVariantById(
  storeSnapshot: StoreSnapshot,
  variantId: string,
): ProductVariant {
  const variant = storeSnapshot.variants.find((v) => v.id === variantId)
  if (!variant) {
    throw new Error(`catalogService: variant not found: ${variantId}`)
  }
  return variant
}