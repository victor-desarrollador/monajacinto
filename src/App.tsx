import { useState } from 'react'
import type { Sale, StoreSnapshot } from './domain/types'
import { loadStore, saveStore, resetStore } from './services/store'
import { createSale, addItem, sendToCashier } from './services/salesService'
import { addPayment, type AddPaymentInput } from './services/paymentService'
import { finalizeSale } from './services/finalizeService'
import { RoleSelector, type Role } from './components/RoleSelector'
import { SellerPOS } from './components/SellerPOS'
import { CashierQueue } from './components/CashierQueue'
import { PaymentPanel, type PaymentDraft } from './components/PaymentPanel'
import { DemoTicket } from './components/DemoTicket'

const POS_ID = 'POS-CENTRO-1'
const SELLER_ID = 'VENDEDOR-1'
const CASHIER_ID = 'CAJERO-1'

let idSeq = 0
function nextId(prefix: string): string {
  idSeq += 1
  return `${prefix}-${Date.now().toString(36)}-${idSeq}`
}

export default function App() {
  const [snapshot, setSnapshot] = useState<StoreSnapshot>(() => loadStore())
  const [role, setRole] = useState<Role>('SELLER')
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState(0)

  const branchId =
    snapshot.locations.find((l) => l.type === 'BRANCH')?.id ??
    snapshot.locations[0]?.id
  const branchName =
    snapshot.locations.find((l) => l.id === branchId)?.name ?? branchId

  function handleCreateSale(): Sale {
    const result = createSale(snapshot, {
      id: nextId('SALE'),
      posId: POS_ID,
      sellerId: SELLER_ID,
      branchId,
      createdAt: new Date().toISOString(),
    })
    saveStore(result.snapshot)
    setSnapshot(result.snapshot)
    return result.sale
  }

  function handleAddItem(
    saleId: string,
    variantId: string,
    quantity: number,
    discount: number,
  ) {
    const next = addItem(snapshot, saleId, variantId, quantity, discount)
    saveStore(next)
    setSnapshot(next)
  }

  function handleSendToCashier(saleId: string) {
    const next = sendToCashier(snapshot, saleId)
    saveStore(next)
    setSnapshot(next)
  }

  function handleAddPayment(saleId: string, draft: PaymentDraft) {
    const input: AddPaymentInput = {
      id: nextId('PAY'),
      method: draft.method,
      financialAccountId: draft.financialAccountId,
      amount: draft.amount,
      ...(draft.cashReceived !== undefined
        ? { cashReceived: draft.cashReceived }
        : {}),
    }
    const next = addPayment(snapshot, saleId, input)
    saveStore(next)
    setSnapshot(next)
  }

  function handleFinalize(saleId: string) {
    // finalizeService already persists the complete snapshot exactly once.
    const next = finalizeSale(snapshot, {
      saleId,
      finalizedAt: new Date().toISOString(),
      userId: CASHIER_ID,
    })
    setSnapshot(next)
  }

  function handleRole(nextRole: Role) {
    setRole(nextRole)
  }

  function handleReset() {
    setSnapshot(resetStore())
    setRole('SELLER')
    setSelectedSaleId(null)
    setResetKey((k) => k + 1)
  }

  const selectedSale = selectedSaleId
    ? snapshot.sales.find((s) => s.id === selectedSaleId) ?? null
    : null

  return (
    <div className="pos-app">
      <header className="pos-header">
        <div>
          <h1 className="pos-wordmark">Mona Jacinto</h1>
          <p className="pos-header__sub">Punto de venta · demo</p>
        </div>
        <div className="pos-header__actions">
          <RoleSelector role={role} onSelect={handleRole} />
          <button
            type="button"
            className="pos-btn pos-btn--ghost"
            onClick={handleReset}
          >
            Reiniciar demo
          </button>
        </div>
      </header>

      <main className="pos-main">
        {role === 'SELLER' ? (
          <div key={`seller-${resetKey}`}>
            <SellerPOS
              snapshot={snapshot}
              branchId={branchId}
              branchName={branchName}
              onCreateSale={handleCreateSale}
              onAddItem={handleAddItem}
              onSendToCashier={handleSendToCashier}
            />
          </div>
        ) : (
          <div key={`cashier-${resetKey}`} className="pos-cashier">
            <CashierQueue
              snapshot={snapshot}
              selectedSaleId={selectedSaleId}
              onSelect={setSelectedSaleId}
            />
            <div className="pos-cashier__detail">
              {selectedSale ? (
                selectedSale.status === 'COMPLETED' ? (
                  <DemoTicket snapshot={snapshot} sale={selectedSale} />
                ) : (
                  <PaymentPanel
                    snapshot={snapshot}
                    sale={selectedSale}
                    onAddPayment={handleAddPayment}
                    onFinalize={handleFinalize}
                  />
                )
              ) : (
                <p className="pos-empty">
                  Seleccioná una venta de la cola para cobrarla
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}