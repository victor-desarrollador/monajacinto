import { formatMoney } from '../domain/money'
import type { StoreSnapshot } from '../domain/types'

interface CashierQueueProps {
  snapshot: StoreSnapshot
  selectedSaleId: string | null
  onSelect: (saleId: string) => void
}

export function CashierQueue({
  snapshot,
  selectedSaleId,
  onSelect,
}: CashierQueueProps) {
  const pending = snapshot.sales.filter((s) => s.status === 'PENDING_PAYMENT')
  const readyToFinalize = snapshot.sales.filter((s) => s.status === 'PAID')

  return (
    <section className="pos-queue" aria-label="Cola de caja">
      <div className="pos-queue__group">
        <h2 className="pos-section-title">Cola de caja</h2>
        <p className="pos-section-sub">Ventas pendientes de cobro</p>

        {pending.length === 0 ? (
          <p className="pos-empty">No hay ventas esperando cobro</p>
        ) : (
          <ul className="pos-queue__list">
            {pending.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={
                    selectedSaleId === s.id ? 'pos-sale pos-sale--active' : 'pos-sale'
                  }
                  aria-pressed={selectedSaleId === s.id}
                  onClick={() => onSelect(s.id)}
                >
                  <span className="pos-sale__number">{s.number}</span>
                  <span className="pos-sale__meta">
                    Vendedor · {s.sellerId} · Pendiente de pago
                  </span>
                  <span className="pos-sale__total">{formatMoney(s.total)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {readyToFinalize.length > 0 && (
        <div className="pos-queue__group pos-queue__group--finalize">
          <h2 className="pos-section-title">Listas para finalizar</h2>
          <p className="pos-section-sub">Pagadas, pendientes de cierre</p>

          <ul className="pos-queue__list">
            {readyToFinalize.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={
                    selectedSaleId === s.id ? 'pos-sale pos-sale--active' : 'pos-sale'
                  }
                  aria-pressed={selectedSaleId === s.id}
                  onClick={() => onSelect(s.id)}
                >
                  <span className="pos-sale__number">{s.number}</span>
                  <span className="pos-sale__meta">
                    Vendedor · {s.sellerId} · Pagado
                  </span>
                  <span className="pos-sale__total">{formatMoney(s.total)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}