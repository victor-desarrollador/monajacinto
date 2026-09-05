import { useState } from 'react'
import type { PaymentMethod, Sale, StoreSnapshot } from '../domain/types'
import { formatMoney, unitToCents } from '../domain/money'

export interface PaymentDraft {
  method: PaymentMethod
  financialAccountId: string
  amount: number
  cashReceived?: number
}

interface PaymentPanelProps {
  snapshot: StoreSnapshot
  sale: Sale
  onAddPayment: (saleId: string, draft: PaymentDraft) => void
  onFinalize: (saleId: string) => void
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'QR', label: 'QR' },
  { value: 'TARJETA', label: 'Tarjeta' },
]

const METHOD_LABEL: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  QR: 'QR',
  TARJETA: 'Tarjeta',
}

const ACCOUNTS: { id: string; label: string; method: PaymentMethod }[] = [
  { id: 'ACC-CAJA-CENTRO', label: 'Caja Centro', method: 'EFECTIVO' },
  { id: 'ACC-BANCO-GALICIA', label: 'Banco Galicia', method: 'TRANSFERENCIA' },
  { id: 'ACC-BANCO-MACRO', label: 'Banco Macro', method: 'TRANSFERENCIA' },
  { id: 'ACC-MERCADOPAGO', label: 'Mercado Pago', method: 'QR' },
  { id: 'ACC-POSNET-1', label: 'Posnet / Tarjeta', method: 'TARJETA' },
]

function message(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

function parseCents(raw: string, label: string): number {
  if (raw.trim() === '') {
    throw new Error(`Ingresá ${label}`)
  }
  const value = Number(raw)
  if (!Number.isFinite(value)) {
    throw new Error(`${label} inválido`)
  }
  return unitToCents(value)
}

function itemName(snapshot: StoreSnapshot, variantId: string): string {
  const variant = snapshot.variants.find((v) => v.id === variantId)
  if (!variant) return variantId
  const product = snapshot.products.find((p) => p.id === variant.productId)
  return product ? product.name : variant.sku
}

export function PaymentPanel({
  snapshot,
  sale,
  onAddPayment,
  onFinalize,
}: PaymentPanelProps) {
  const [method, setMethod] = useState<PaymentMethod>('EFECTIVO')
  const [accountId, setAccountId] = useState<string>('ACC-CAJA-CENTRO')
  const [amount, setAmount] = useState('')
  const [cashReceived, setCashReceived] = useState('')
  const [error, setError] = useState<string | null>(null)

  const payments = snapshot.payments.filter((p) => p.saleId === sale.id)
  const paid = payments.reduce((acc, p) => acc + p.amount, 0)
  const remaining = sale.total - paid
  const isPaid = sale.status === 'PAID'
  const accounts = ACCOUNTS.filter((a) => a.method === method)

  function selectMethod(next: PaymentMethod) {
    setMethod(next)
    const account = ACCOUNTS.find((a) => a.method === next)
    if (account) setAccountId(account.id)
  }

  function submit() {
    setError(null)
    try {
      const amountCents = parseCents(amount, 'un importe')
      if (amountCents <= 0) {
        throw new Error('El importe debe ser mayor a 0')
      }
      let cashReceivedCents: number | undefined
      if (method === 'EFECTIVO') {
        cashReceivedCents = parseCents(cashReceived, 'el monto recibido')
      }
      onAddPayment(sale.id, {
        method,
        financialAccountId: accountId,
        amount: amountCents,
        ...(cashReceivedCents !== undefined ? { cashReceived: cashReceivedCents } : {}),
      })
      setAmount('')
      setCashReceived('')
    } catch (e) {
      setError(message(e))
    }
  }

  function finalize() {
    setError(null)
    try {
      onFinalize(sale.id)
    } catch (e) {
      setError(message(e))
    }
  }

  return (
    <section className="pos-pay" aria-label="Cobro">
      <div className="pos-pay__head">
        <div>
          <h2 className="pos-section-title">Cobro</h2>
          <p className="pos-section-sub">Venta {sale.number}</p>
        </div>
        <span
          className={isPaid ? 'pos-badge pos-badge--paid' : 'pos-badge pos-badge--pending'}
        >
          {isPaid ? 'Pagado' : 'Pendiente de pago'}
        </span>
      </div>

      <ul className="pos-pay__items">
        {sale.items.map((item) => (
          <li key={item.id} className="pos-pay__item">
            <span className="pos-pay__item-name">
              {itemName(snapshot, item.variantId)}
            </span>
            <span className="pos-pay__item-qty">{item.quantity} × {formatMoney(item.unitPrice)}</span>
            <span className="pos-pay__item-sub">{formatMoney(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="pos-pay__totals">
        <div className="pos-pay__stat">
          <div className="pos-pay__stat-label">Total</div>
          <div className="pos-pay__stat-value">{formatMoney(sale.total)}</div>
        </div>
        <div className="pos-pay__stat">
          <div className="pos-pay__stat-label">Pagado</div>
          <div className="pos-pay__stat-value">{formatMoney(paid)}</div>
        </div>
        <div className="pos-pay__stat pos-pay__stat--remain">
          <div className="pos-pay__stat-label">Restante</div>
          <div className="pos-pay__stat-value">{formatMoney(remaining)}</div>
        </div>
      </div>

      {payments.length > 0 && (
        <ul className="pos-pay__rows" aria-label="Pagos registrados">
          {payments.map((p) => (
            <li key={p.id} className="pos-pay__row">
              <span>
                {METHOD_LABEL[p.method]} · {p.financialAccountId}
              </span>
              <span>{formatMoney(p.amount)}</span>
              {p.change !== undefined && (
                <span className="pos-pay__change">Cambio {formatMoney(p.change)}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {!isPaid && (
        <div className="pos-pay__form">
          <div className="pos-pay__methods" role="group" aria-label="Método de pago">
            {METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                className={
                  method === m.value
                    ? 'pos-pay__method pos-pay__method--active'
                    : 'pos-pay__method'
                }
                aria-pressed={method === m.value}
                onClick={() => selectMethod(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="pos-pay__fields">
            <div>
              <label className="pos-label" htmlFor="pay-account">
                Cuenta
              </label>
              <select
                id="pay-account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="pos-label" htmlFor="pay-amount">
                Importe
              </label>
              <input
                id="pay-amount"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {method === 'EFECTIVO' && (
              <div className="pos-pay__field--full">
                <label className="pos-label" htmlFor="pay-cash">
                  Monto recibido
                </label>
                <input
                  id="pay-cash"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="pos-pay__actions">
            <button type="button" className="pos-btn pos-btn--primary" onClick={submit}>
              Registrar pago
            </button>
          </div>
        </div>
      )}

      {isPaid && (
        <div className="pos-pay__finalize">
          <button type="button" className="pos-btn pos-btn--primary" onClick={finalize}>
            Finalizar venta
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="pos-error">
          {error}
        </p>
      )}
    </section>
  )
}