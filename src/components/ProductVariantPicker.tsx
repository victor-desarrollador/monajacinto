import { useState } from 'react'
import type { Product, ProductVariant, StoreSnapshot } from '../domain/types'
import { formatMoney, unitToCents } from '../domain/money'
import { searchProducts, getVariantsByProduct } from '../services/catalogService'
import { availableAt } from '../services/inventoryService'

interface ProductVariantPickerProps {
  snapshot: StoreSnapshot
  branchId: string
  onAdd: (variantId: string, quantity: number, discount: number) => void
}

export function ProductVariantPicker({
  snapshot,
  branchId,
  onAdd,
}: ProductVariantPickerProps) {
  const [query, setQuery] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [discount, setDiscount] = useState('0')
  const [error, setError] = useState<string | null>(null)

  const products: Product[] = searchProducts(snapshot, query)
  const variants: ProductVariant[] = selectedProductId
    ? getVariantsByProduct(snapshot, selectedProductId)
    : []
  const selectedVariant = selectedVariantId
    ? snapshot.variants.find((v) => v.id === selectedVariantId)
    : undefined

  function stockOf(variantId: string): number | null {
    try {
      return availableAt(snapshot, variantId, branchId)
    } catch {
      return null
    }
  }

  function selectProduct(productId: string) {
    setSelectedProductId(productId)
    setSelectedVariantId(null)
    setError(null)
  }

  function selectVariant(variantId: string) {
    setSelectedVariantId(variantId)
    setError(null)
  }

  function add() {
    if (!selectedVariant) return
    try {
      const qty = Number(quantity)
      if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error('La cantidad debe ser un número entero mayor a 0')
      }
      const discountValue = Number(discount)
      if (!Number.isFinite(discountValue)) {
        throw new Error('Ingresá un descuento válido')
      }
      const discountCents = unitToCents(discountValue)
      if (discountCents < 0) {
        throw new Error('El descuento no puede ser negativo')
      }
      onAdd(selectedVariant.id, qty, discountCents)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <section className="pos-picker" aria-label="Productos y variantes">
      <div>
        <label className="pos-label" htmlFor="product-search">
          Buscar
        </label>
        <input
          id="product-search"
          type="search"
          placeholder="Buscar productos…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="pos-picker__lists">
        <ul className="pos-products" aria-label="Productos">
          {products.length === 0 && <li className="pos-empty">Sin resultados</li>}
          {products.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={
                  selectedProductId === p.id
                    ? 'pos-product pos-product--active'
                    : 'pos-product'
                }
                aria-pressed={selectedProductId === p.id}
                onClick={() => selectProduct(p.id)}
              >
                <span className="pos-product__name">{p.name}</span>
                <span className="pos-product__meta">
                  {p.category} · {p.brand}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="pos-variants" aria-label="Variantes">
          {!selectedProductId && (
            <p className="pos-empty">Seleccioná un producto para ver variantes</p>
          )}
          {selectedProductId && variants.length === 0 && (
            <p className="pos-empty">Este producto no tiene variantes</p>
          )}
          {variants.map((v) => {
            const stock = stockOf(v.id)
            return (
              <button
                key={v.id}
                type="button"
                className={
                  selectedVariantId === v.id
                    ? 'pos-variant pos-variant--active'
                    : 'pos-variant'
                }
                aria-pressed={selectedVariantId === v.id}
                onClick={() => selectVariant(v.id)}
              >
                <span className="pos-variant__color">{v.color}</span>
                <span className="pos-variant__size">Talle {v.size}</span>
                <code className="pos-variant__sku">{v.sku}</code>
                <span className="pos-variant__price">{formatMoney(v.salePrice)}</span>
                <span
                  className={
                    stock === 0
                      ? 'pos-variant__stock pos-variant__stock--empty'
                      : 'pos-variant__stock'
                  }
                >
                  Stock {stock ?? '—'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pos-add">
        <div className="pos-add__field">
          <label className="pos-label" htmlFor="qty">
            Cantidad
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            step={1}
            value={quantity}
            disabled={!selectedVariant}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="pos-add__field">
          <label className="pos-label" htmlFor="discount">
            Descuento
          </label>
          <input
            id="discount"
            type="text"
            inputMode="decimal"
            value={discount}
            disabled={!selectedVariant}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="pos-btn pos-btn--primary"
          disabled={!selectedVariant}
          onClick={add}
        >
          Agregar
        </button>
      </div>

      {error && (
        <p role="alert" className="pos-error">
          {error}
        </p>
      )}
    </section>
  )
}