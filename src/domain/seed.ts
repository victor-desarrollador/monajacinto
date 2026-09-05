/**
 * Deterministic demo seed for the Ventas/POS demo vertical.
 *
 * - All money values are integer cents.
 * - No Date.now(), no randomness: the seed is byte-for-byte reproducible.
 * - Imports domain entities as types only (no runtime dependency on other
 *   modules); the only runtime consumer is services/store.ts.
 *
 * Import direction (runtime): store.ts -> seed.ts -> types.ts
 */
import type {
  Inventory,
  Location,
  Product,
  ProductVariant,
  StoreSnapshot,
} from './types'

const locations: Location[] = [
  { id: 'LOC-BRANCH-CENTRO', name: 'Sucursal Centro', type: 'BRANCH' },
]

const products: Product[] = [
  { id: 'PROD-REM-BAS', name: 'Remera Básica', category: 'Remeras', brand: 'Mona Jacinto' },
  { id: 'PROD-JEA-SLIM', name: 'Jean Slim Fit', category: 'Jeans', brand: 'Mona Jacinto' },
  { id: 'PROD-BUZ-HOOD', name: 'Buzo Hoodie', category: 'Buzos', brand: 'Mona Jacinto' },
  { id: 'PROD-CAM-JEA', name: 'Campera de Jean', category: 'Camperas', brand: 'Mona Jacinto' },
]

/**
 * SKU format: <PRODUCT>-<COLOR>-<SIZE>. Variant id = "VAR-" + sku.
 * VAR-REM-BAS-NEG-M (salePrice 45000) is referenced by later service tests.
 */
const variants: ProductVariant[] = [
  // Remera Básica — Negro
  { id: 'VAR-REM-BAS-NEG-S', productId: 'PROD-REM-BAS', sku: 'REM-BAS-NEG-S', color: 'Negro', size: 'S', salePrice: 45000, resellerPrice: 33750 },
  { id: 'VAR-REM-BAS-NEG-M', productId: 'PROD-REM-BAS', sku: 'REM-BAS-NEG-M', color: 'Negro', size: 'M', salePrice: 45000, resellerPrice: 33750, barcode: '7790001000017' },
  { id: 'VAR-REM-BAS-NEG-L', productId: 'PROD-REM-BAS', sku: 'REM-BAS-NEG-L', color: 'Negro', size: 'L', salePrice: 45000, resellerPrice: 33750 },
  // Remera Básica — Blanco
  { id: 'VAR-REM-BAS-BLA-S', productId: 'PROD-REM-BAS', sku: 'REM-BAS-BLA-S', color: 'Blanco', size: 'S', salePrice: 45000, resellerPrice: 33750 },
  { id: 'VAR-REM-BAS-BLA-M', productId: 'PROD-REM-BAS', sku: 'REM-BAS-BLA-M', color: 'Blanco', size: 'M', salePrice: 45000, resellerPrice: 33750, barcode: '7790001000055' },
  { id: 'VAR-REM-BAS-BLA-L', productId: 'PROD-REM-BAS', sku: 'REM-BAS-BLA-L', color: 'Blanco', size: 'L', salePrice: 45000, resellerPrice: 33750 },
  // Jean Slim Fit — Azul
  { id: 'VAR-JEA-SLIM-AZU-40', productId: 'PROD-JEA-SLIM', sku: 'JEA-SLIM-AZU-40', color: 'Azul', size: '40', salePrice: 120000, resellerPrice: 96000 },
  { id: 'VAR-JEA-SLIM-AZU-42', productId: 'PROD-JEA-SLIM', sku: 'JEA-SLIM-AZU-42', color: 'Azul', size: '42', salePrice: 120000, resellerPrice: 96000, barcode: '7790002000041' },
  // Jean Slim Fit — Negro
  { id: 'VAR-JEA-SLIM-NEG-40', productId: 'PROD-JEA-SLIM', sku: 'JEA-SLIM-NEG-40', color: 'Negro', size: '40', salePrice: 120000, resellerPrice: 96000 },
  { id: 'VAR-JEA-SLIM-NEG-42', productId: 'PROD-JEA-SLIM', sku: 'JEA-SLIM-NEG-42', color: 'Negro', size: '42', salePrice: 120000, resellerPrice: 96000 },
  // Buzo Hoodie — Gris
  { id: 'VAR-BUZ-HOOD-GRI-M', productId: 'PROD-BUZ-HOOD', sku: 'BUZ-HOOD-GRI-M', color: 'Gris', size: 'M', salePrice: 95000, resellerPrice: 76000 },
  { id: 'VAR-BUZ-HOOD-GRI-L', productId: 'PROD-BUZ-HOOD', sku: 'BUZ-HOOD-GRI-L', color: 'Gris', size: 'L', salePrice: 95000, resellerPrice: 76000 },
  { id: 'VAR-BUZ-HOOD-GRI-XL', productId: 'PROD-BUZ-HOOD', sku: 'BUZ-HOOD-GRI-XL', color: 'Gris', size: 'XL', salePrice: 95000, resellerPrice: 76000 },
  // Buzo Hoodie — Negro
  { id: 'VAR-BUZ-HOOD-NEG-M', productId: 'PROD-BUZ-HOOD', sku: 'BUZ-HOOD-NEG-M', color: 'Negro', size: 'M', salePrice: 95000, resellerPrice: 76000 },
  { id: 'VAR-BUZ-HOOD-NEG-L', productId: 'PROD-BUZ-HOOD', sku: 'BUZ-HOOD-NEG-L', color: 'Negro', size: 'L', salePrice: 95000, resellerPrice: 76000, barcode: '7790003000158' },
  { id: 'VAR-BUZ-HOOD-NEG-XL', productId: 'PROD-BUZ-HOOD', sku: 'BUZ-HOOD-NEG-XL', color: 'Negro', size: 'XL', salePrice: 95000, resellerPrice: 76000 },
  // Campera de Jean — Azul
  { id: 'VAR-CAM-JEA-AZU-M', productId: 'PROD-CAM-JEA', sku: 'CAM-JEA-AZU-M', color: 'Azul', size: 'M', salePrice: 185000, resellerPrice: 148000 },
  { id: 'VAR-CAM-JEA-AZU-L', productId: 'PROD-CAM-JEA', sku: 'CAM-JEA-AZU-L', color: 'Azul', size: 'L', salePrice: 185000, resellerPrice: 148000 },
]

/**
 * One row per (variant, location): the demo sells from LOC-BRANCH-CENTRO.
 * Invariant: physical >= reserved, no negatives.
 * VAR-REM-BAS-NEG-M has reserved: 2 so available = physical - reserved is
 * observable in later service tests.
 */
const inventory: Inventory[] = [
  { variantId: 'VAR-REM-BAS-NEG-S', locationId: 'LOC-BRANCH-CENTRO', physical: 8, reserved: 0 },
  { variantId: 'VAR-REM-BAS-NEG-M', locationId: 'LOC-BRANCH-CENTRO', physical: 10, reserved: 2 },
  { variantId: 'VAR-REM-BAS-NEG-L', locationId: 'LOC-BRANCH-CENTRO', physical: 6, reserved: 0 },
  { variantId: 'VAR-REM-BAS-BLA-S', locationId: 'LOC-BRANCH-CENTRO', physical: 7, reserved: 0 },
  { variantId: 'VAR-REM-BAS-BLA-M', locationId: 'LOC-BRANCH-CENTRO', physical: 9, reserved: 0 },
  { variantId: 'VAR-REM-BAS-BLA-L', locationId: 'LOC-BRANCH-CENTRO', physical: 5, reserved: 0 },
  { variantId: 'VAR-JEA-SLIM-AZU-40', locationId: 'LOC-BRANCH-CENTRO', physical: 6, reserved: 0 },
  { variantId: 'VAR-JEA-SLIM-AZU-42', locationId: 'LOC-BRANCH-CENTRO', physical: 8, reserved: 1 },
  { variantId: 'VAR-JEA-SLIM-NEG-40', locationId: 'LOC-BRANCH-CENTRO', physical: 5, reserved: 0 },
  { variantId: 'VAR-JEA-SLIM-NEG-42', locationId: 'LOC-BRANCH-CENTRO', physical: 4, reserved: 0 },
  { variantId: 'VAR-BUZ-HOOD-GRI-M', locationId: 'LOC-BRANCH-CENTRO', physical: 7, reserved: 0 },
  { variantId: 'VAR-BUZ-HOOD-GRI-L', locationId: 'LOC-BRANCH-CENTRO', physical: 6, reserved: 0 },
  { variantId: 'VAR-BUZ-HOOD-GRI-XL', locationId: 'LOC-BRANCH-CENTRO', physical: 3, reserved: 0 },
  { variantId: 'VAR-BUZ-HOOD-NEG-M', locationId: 'LOC-BRANCH-CENTRO', physical: 8, reserved: 0 },
  { variantId: 'VAR-BUZ-HOOD-NEG-L', locationId: 'LOC-BRANCH-CENTRO', physical: 6, reserved: 0 },
  { variantId: 'VAR-BUZ-HOOD-NEG-XL', locationId: 'LOC-BRANCH-CENTRO', physical: 4, reserved: 0 },
  { variantId: 'VAR-CAM-JEA-AZU-M', locationId: 'LOC-BRANCH-CENTRO', physical: 3, reserved: 0 },
  { variantId: 'VAR-CAM-JEA-AZU-L', locationId: 'LOC-BRANCH-CENTRO', physical: 2, reserved: 0 },
]

/**
 * Build a fresh, complete demo snapshot. Every call returns a new deep
 * structure, so callers can mutate the result without corrupting future seeds.
 */
export function seedStore(): StoreSnapshot {
  return {
    locations: locations.map((l) => ({ ...l })),
    products: products.map((p) => ({ ...p })),
    variants: variants.map((v) => ({ ...v })),
    inventory: inventory.map((i) => ({ ...i })),
    stockMovements: [],
    sales: [],
    payments: [],
    financialMovements: [],
    counters: { sale: 1 },
  }
}
