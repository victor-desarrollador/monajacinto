import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { STORE_KEY, saveStore } from './services/store'
import { createSale, addItem, sendToCashier } from './services/salesService'
import { addPayment } from './services/paymentService'
import { seedStore } from './domain/seed'
import type { StoreSnapshot } from './domain/types'

function readStore(): StoreSnapshot {
  return JSON.parse(window.localStorage.getItem(STORE_KEY) as string) as StoreSnapshot
}

function physicalOf(variantId: string): number {
  return readStore().inventory.find((r) => r.variantId === variantId)!.physical
}

function persistedPaidSnapshot(): StoreSnapshot {
  let snap = seedStore()
  const created = createSale(snap, {
    id: 'SALE-RELOAD',
    posId: 'POS-CENTRO-1',
    sellerId: 'VENDEDOR-1',
    branchId: 'LOC-BRANCH-CENTRO',
    createdAt: '2026-09-04T10:00:00.000Z',
  })
  snap = created.snapshot
  snap = addItem(snap, 'SALE-RELOAD', 'VAR-REM-BAS-NEG-M', 1, 0)
  snap = sendToCashier(snap, 'SALE-RELOAD')
  return addPayment(snap, 'SALE-RELOAD', {
    id: 'PAY-RELOAD',
    method: 'TARJETA',
    financialAccountId: 'ACC-POSNET-1',
    amount: 45000,
  })
}

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders the RoleSelector with Vendedor and Cajero', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Vendedor/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Cajero/ })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Mona Jacinto/i })
    ).toBeInTheDocument()
  })

  it('completes the full Seller -> Cashier -> PAID -> COMPLETED -> ticket flow', async () => {
    const user = userEvent.setup()
    render(<App />)

    // 1. Seller starts a DRAFT sale.
    await user.click(screen.getByRole('button', { name: /Nueva venta/i }))

    // 2. Find the seeded product and select the seeded variant.
    const product = await screen.findByRole('button', { name: /Remera Básica/ })
    await user.click(product)
    const variant = await screen.findByRole('button', { name: /REM-BAS-NEG-M/ })
    await user.click(variant)

    // 3. The UI exposes no price/discount-as-price input (unitPrice is never
    //    supplied from the UI), and quantity starts at an integer.
    expect(screen.queryByLabelText(/precio unitario/i)).toBeNull()

    // 4. Add one item.
    await user.click(screen.getByRole('button', { name: /Agregar/i }))

    // 5. Cart displays the SaleItem frozen unitPrice and the Sale total.
    const priceCell = await screen.findByLabelText(/Precio unitario/)
    expect(priceCell).toHaveTextContent('$ 450,00')

    const cart = screen.getByRole('region', { name: 'Venta actual' })
    // Frozen unit price, subtotal and sale total all render the service-derived
    // value $ 450,00 (the UI never computes or overrides them).
    expect(within(cart).getAllByText('$ 450,00')).toHaveLength(3)
    expect(within(cart).getByText('Enviar a caja')).toBeInTheDocument()

    // 6. Send to cashier -> PENDING_PAYMENT persists in the same snapshot.
    await user.click(screen.getByRole('button', { name: /Enviar a caja/i }))

    // 7. Switch role to Cajero; the same snapshot is preserved.
    await user.click(screen.getByRole('button', { name: /Cajero/ }))

    // 8. CashierQueue shows the pending sale V-0001.
    const saleButton = await screen.findByRole('button', { name: /V-0001/ })
    await user.click(saleButton)

    // 9. First partial payment (TRANSFERENCIA $200,00 cents 20000) keeps
    //    PENDING_PAYMENT.
    await user.click(screen.getByRole('button', { name: /Transferencia/i }))
    await user.type(screen.getByLabelText('Importe'), '200')
    await user.click(screen.getByRole('button', { name: /Registrar pago/i }))

    expect(await screen.findByText('$ 250,00')).toBeInTheDocument()
    // Still PENDING_PAYMENT: no finalize action is available yet.
    expect(
      screen.queryByRole('button', { name: /Finalizar venta/i })
    ).toBeNull()

    // 10. Second combined payment (EFECTIVO exact remainder) reaches the total.
    await user.click(screen.getByRole('button', { name: /Efectivo/i }))
    await user.type(screen.getByLabelText('Importe'), '250')
    await user.type(screen.getByLabelText('Monto recibido'), '300')
    await user.click(screen.getByRole('button', { name: /Registrar pago/i }))

    // 11. EFECTIVO change is displayed from the persisted Payment data.
    expect(await screen.findByText('Cambio $ 50,00')).toBeInTheDocument()
    // Sale is now PAID: finalize action is available.
    expect(
      screen.getByRole('button', { name: /Finalizar venta/i })
    ).toBeInTheDocument()

    // 12. Stock has NOT changed before finalization.
    expect(physicalOf('VAR-REM-BAS-NEG-M')).toBe(10)

    // 13. Finalize the PAID sale (finalizeService persists exactly once).
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    await user.click(screen.getByRole('button', { name: /Finalizar venta/i }))

    // 14. DemoTicket renders with both mandatory legends.
    expect(
      screen.getByText('COMPROBANTE DEMOSTRATIVO — SIN VALIDEZ FISCAL')
    ).toBeInTheDocument()
    expect(screen.getByText('CAE: DEMO-SIMULADO')).toBeInTheDocument()

    // 15. Finalization caused only the internal saveStore (exactly one write).
    expect(setItem).toHaveBeenCalledTimes(1)

    // 16. Stock changed only after finalization (10 -> 9).
    expect(physicalOf('VAR-REM-BAS-NEG-M')).toBe(9)
    expect(readStore().stockMovements).toHaveLength(1)
    expect(readStore().financialMovements).toHaveLength(2)
  })

  it('surfaces a domain error and preserves the previous snapshot state', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Nueva venta/i }))

    // Attempt to send an empty sale: the domain rejects it and the UI shows
    // the error without mutating state.
    await user.click(screen.getByRole('button', { name: /Enviar a caja/i }))

    expect(
      await screen.findByText(/cannot send empty sale/i)
    ).toBeInTheDocument()

    const stored = readStore()
    expect(stored.sales).toHaveLength(1)
    expect(stored.sales[0].status).toBe('DRAFT')
  })

  it('rejects a quantity that exceeds available stock', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Nueva venta/i }))
    const product = await screen.findByRole('button', { name: /Remera Básica/ })
    await user.click(product)
    const variant = await screen.findByRole('button', { name: /REM-BAS-NEG-M/ })
    await user.click(variant)

    const qty = screen.getByLabelText('Cantidad')
    await user.clear(qty)
    await user.type(qty, '999')
    await user.click(screen.getByRole('button', { name: /Agregar/i }))

    expect(await screen.findByText(/exceeds available/i)).toBeInTheDocument()
    expect(readStore().sales[0].items).toHaveLength(0)
  })

  it('recovers a PAID sale for finalization after switching roles', async () => {
    const user = userEvent.setup()
    render(<App />)

    const roles = () => screen.getByRole('navigation', { name: 'Seleccionar rol' })

    // Build through the real UI: Seller -> PENDING_PAYMENT.
    await user.click(screen.getByRole('button', { name: /Nueva venta/i }))
    const product = await screen.findByRole('button', { name: /Remera Básica/ })
    await user.click(product)
    await user.click(await screen.findByRole('button', { name: /REM-BAS-NEG-M/ }))
    await user.click(screen.getByRole('button', { name: /Agregar/i }))
    await user.click(screen.getByRole('button', { name: /Enviar a caja/i }))

    await user.click(within(roles()).getByRole('button', { name: /Cajero/ }))
    await user.click(await screen.findByRole('button', { name: /V-0001/ }))

    // Pay the exact total so the sale becomes PAID.
    await user.click(screen.getByRole('button', { name: /Transferencia/i }))
    await user.type(screen.getByLabelText('Importe'), '450')
    await user.click(screen.getByRole('button', { name: /Registrar pago/i }))

    expect(
      await screen.findByRole('button', { name: /Finalizar venta/i })
    ).toBeInTheDocument()

    // Switch to Seller, then back to Cashier BEFORE finalizing.
    await user.click(within(roles()).getByRole('button', { name: /Vendedor/ }))
    await user.click(within(roles()).getByRole('button', { name: /Cajero/ }))

    // The PAID sale must remain reachable and finalizable.
    expect(
      screen.getByRole('button', { name: /Finalizar venta/i })
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Finalizar venta/i }))

    expect(screen.getByText('CAE: DEMO-SIMULADO')).toBeInTheDocument()
  })

  it('recovers a persisted PAID sale for finalization after remount', async () => {
    const user = userEvent.setup()
    saveStore(persistedPaidSnapshot())
    render(<App />)

    await user.click(screen.getByRole('button', { name: /Cajero/ }))

    // The PAID sale is reachable as "ready to finalize".
    const paidSale = await screen.findByRole('button', { name: /V-0001/ })
    await user.click(paidSale)

    await user.click(screen.getByRole('button', { name: /Finalizar venta/i }))
    expect(screen.getByText('CAE: DEMO-SIMULADO')).toBeInTheDocument()
    expect(readStore().sales.find((s) => s.id === 'SALE-RELOAD')?.status).toBe(
      'COMPLETED'
    )
  })
})