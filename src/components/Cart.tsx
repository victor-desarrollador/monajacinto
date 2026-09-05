import type { Sale, StoreSnapshot } from '../domain/types'
import { formatMoney } from '../domain/money'

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING_PAYMENT: 'En caja',
  PAID: 'Pagado',
  COMPLETED: 'Completado',
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'pos-badge pos-badge--draft',
  PENDING_PAYMENT: 'pos-badge pos-badge--pending',
  PAID: 'pos-badge pos-badge--paid',
  COMPLETED: 'pos-badge pos-badge--completed',
}

interface CartProps {
  snapshot: StoreSnapshot
  sale: Sale | undefined
  onSendToCashier: (saleId: string) => void
}

function itemName(snapshot: StoreSnapshot, variantId: string): string {
  const variant = snapshot.variants.find((v) => v.id === variantId)
  if (!variant) return variantId
  const product = snapshot.products.find((p) => p.id === variant.productId)
  return product ? product.name : variant.sku
}

function itemDetail(snapshot: StoreSnapshot, variantId: string): string {
  const variant = snapshot.variants.find((v) => v.id === variantId)
  if (!variant) return ''
  return `${variant.color} · Talle ${variant.size} · ${variant.sku}`
}

export function Cart({ snapshot, sale, onSendToCashier }: CartProps) {
  return (
    <section className="pos-cart" aria-label="Venta actual">
      <div className="pos-cart__head">
        <div>
          <h3 className="pos-section-title">Carrito</h3>
          <p className="pos-section-sub">
            {sale ? `Venta ${sale.number}` : 'Sin venta activa'}
          </p>
        </div>
        {sale && <span className={STATUS_BADGE[sale.status]}>{STATUS_LABEL[sale.status]}</span>}
      </div>

      {!sale ? (
        <p className="pos-empty">Empezá una venta para agregar productos</p>
      ) : (
        <>
          {sale.items.length === 0 ? (
            <p className="pos-empty">El carrito está vacío</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="num">Cant.</th>
                  <th className="num">Precio</th>
                  <th className="num">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="pos-cart__item-name">
                        {itemName(snapshot, item.variantId)}
                      </div>
                      <div className="pos-cart__item-detail">
                        {itemDetail(snapshot, item.variantId)}
                      </div>
                    </td>
                    <td className="num">{item.quantity}</td>
                    <td className="num" aria-label={`Precio unitario ${formatMoney(item.unitPrice)}`}>
                      {formatMoney(item.unitPrice)}
                      {item.discount > 0 && (
                        <div className="pos-cart__item-detail">
                          −{formatMoney(item.discount)}
                        </div>
                      )}
                    </td>
                    <td className="num">{formatMoney(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pos-cart__total">
            <span>Total</span>
            <strong>{formatMoney(sale.total)}</strong>
          </div>
          <p className="pos-cart__note">
            Los precios quedan congelados al agregar cada línea.
          </p>

          <button
            type="button"
            className="pos-btn pos-btn--primary pos-cart__send"
            onClick={() => onSendToCashier(sale.id)}
          >
            Enviar a caja
          </button>
        </>
      )}
    </section>
  )
}