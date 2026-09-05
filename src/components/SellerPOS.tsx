import { useState } from 'react'
import type { Sale, StoreSnapshot } from '../domain/types'
import { ProductVariantPicker } from './ProductVariantPicker'
import { Cart } from './Cart'

interface SellerPOSProps {
  snapshot: StoreSnapshot
  branchId: string
  branchName: string
  onCreateSale: () => Sale
  onAddItem: (
    saleId: string,
    variantId: string,
    quantity: number,
    discount: number,
  ) => void
  onSendToCashier: (saleId: string) => void
}

function message(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

export function SellerPOS({
  snapshot,
  branchId,
  branchName,
  onCreateSale,
  onAddItem,
  onSendToCashier,
}: SellerPOSProps) {
  const [saleId, setSaleId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const sale = saleId
    ? snapshot.sales.find((s) => s.id === saleId) ?? undefined
    : undefined

  function start() {
    setNotice(null)
    try {
      const created = onCreateSale()
      setSaleId(created.id)
    } catch (e) {
      setNotice(message(e))
    }
  }

  function send() {
    if (!saleId) return
    setNotice(null)
    try {
      onSendToCashier(saleId)
      setSaleId(null)
    } catch (e) {
      setNotice(message(e))
    }
  }

  function add(variantId: string, quantity: number, discount: number) {
    if (!saleId) {
      throw new Error('Creá una venta antes de agregar productos')
    }
    onAddItem(saleId, variantId, quantity, discount)
  }

  return (
    <section className="pos-seller" aria-label="Punto de venta">
      <header className="pos-seller__head">
        <div>
          <h2 className="pos-section-title">Punto de venta</h2>
          <p className="pos-section-sub">{branchName}</p>
        </div>
        <button type="button" className="pos-btn pos-btn--primary" onClick={start}>
          Nueva venta
        </button>
      </header>

      {notice && (
        <p role="alert" className="pos-error">
          {notice}
        </p>
      )}

      <div className="pos-seller__body">
        <ProductVariantPicker snapshot={snapshot} branchId={branchId} onAdd={add} />
        <Cart snapshot={snapshot} sale={sale} onSendToCashier={send} />
      </div>
    </section>
  )
}