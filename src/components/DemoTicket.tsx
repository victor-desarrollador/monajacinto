import { formatMoney } from '../domain/money'
import type { Sale, StoreSnapshot } from '../domain/types'

interface DemoTicketProps {
  snapshot: StoreSnapshot
  sale: Sale
}

const METHOD_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  QR: 'QR',
  TARJETA: 'Tarjeta',
}

export function DemoTicket({ snapshot, sale }: DemoTicketProps) {
  const payments = snapshot.payments.filter((p) => p.saleId === sale.id)

  return (
    <section className="pos-ticket" aria-label="Comprobante">
      <header className="pos-ticket__head">
        <p className="pos-ticket__brand">Mona Jacinto</p>
        <p className="pos-ticket__legend">
          COMPROBANTE DEMOSTRATIVO — SIN VALIDEZ FISCAL
        </p>
        <p className="pos-ticket__cae">CAE: DEMO-SIMULADO</p>
      </header>

      <div className="pos-ticket__meta">
        <span>Venta {sale.number}</span>
        <span>{sale.finalizedAt ?? sale.createdAt}</span>
      </div>

      <ul className="pos-ticket__items">
        {sale.items.map((item) => {
          const variant = snapshot.variants.find((v) => v.id === item.variantId)
          const product = variant
            ? snapshot.products.find((p) => p.id === variant.productId)
            : undefined
          return (
            <li key={item.id} className="pos-ticket__item">
              <div className="pos-ticket__item-main">
                <div className="pos-ticket__item-name">
                  {product?.name ?? item.variantId}
                </div>
                <div className="pos-ticket__item-detail">
                  {variant ? `${variant.color} · Talle ${variant.size}` : ''}
                </div>
              </div>
              <span className="pos-ticket__item-qty">
                {item.quantity} × {formatMoney(item.unitPrice)}
              </span>
              <span className="pos-ticket__item-sub">{formatMoney(item.subtotal)}</span>
            </li>
          )
        })}
      </ul>

      <div className="pos-ticket__total">
        <span>Total</span>
        <strong>{formatMoney(sale.total)}</strong>
      </div>

      {payments.length > 0 && (
        <div className="pos-ticket__payments">
          {payments.map((p) => (
            <div key={p.id} className="pos-ticket__payment">
              <span>{METHOD_LABEL[p.method] ?? p.method}</span>
              <span>{formatMoney(p.amount)}</span>
              {p.change !== undefined && (
                <span className="pos-ticket__change">Cambio {formatMoney(p.change)}</span>
              )}
            </div>
          ))}
        </div>
      )}

      <footer className="pos-ticket__foot">
        Comprobante de demostración — sin efectos fiscales ni contables reales.
      </footer>
    </section>
  )
}