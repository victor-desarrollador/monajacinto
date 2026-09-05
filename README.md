# Mona Jacinto — POS Demo

## What this is

A browser-only vertical demo of the sales/POS flow for the Mona Jacinta
multi-store clothing management system. It validates the core business flow
and the fundamental separation between the seller terminal (POS) and the
cashier (Caja):

```
Vendedor → DRAFT → add ProductVariant → send to cashier → PENDING_PAYMENT
→ Cajero → combined payments → PAID → finalize → COMPLETED → demo ticket
```

Everything runs in the browser against plain TypeScript domain services.
There is no backend.

## Stack

- React 18
- TypeScript
- Vite
- Vitest
- React Testing Library
- Persistence: a single `StoreSnapshot` in `localStorage`

## Run locally

```
npm install
npm run dev
```

Vite serves the app at `http://localhost:5173`. Use "Reiniciar demo" to
restore the deterministic seed state at any time.

## Tests / build

```
npm test
npm run build
```

`npm run build` runs `tsc --noEmit` (typecheck) followed by `vite build`.

## Demo flow

1. **Vendedor** — create a sale (`Nueva venta`), search products, pick a
   variant, add it to the cart, then `Enviar a caja`.
2. **Cajero** — open the pending sale from the queue, register one or more
   payments (combined methods: `EFECTIVO`, `TRANSFERENCIA`, `QR`, `TARJETA`),
   then `Finalizar venta` once the sale is fully paid (`PAID`).
3. **Demo ticket** — the completed sale renders a non-fiscal receipt with the
   legend `COMPROBANTE DEMOSTRATIVO — SIN VALIDEZ FISCAL` and
   `CAE: DEMO-SIMULADO`.

A paid (`PAID`) sale stays reachable even after switching roles or reloading
the page: it appears under "Listas para finalizar" so it can always be
finalized.

## Domain guarantees demonstrated

- Money is integer cents; floats are never used for money.
- `SaleItem.unitPrice` is frozen from the catalog price at add time — the UI
  never supplies a price.
- Combined payments are supported; reported payment methods and financial
  accounts are separate concepts.
- Cash change is derived by the service (`cashReceived - amount`) and is never
  counted as revenue.
- Overpayment is rejected.
- Stock changes only at finalization: one `StockMovement` per `SaleItem`, and
  one demo `FinancialMovement` per `Payment`.
- Finalization is idempotent (re-running cannot duplicate movements).

## Demo persistence

A single serialized `StoreSnapshot` is stored under one `localStorage` key and
holds products, variants, inventory, sales, payments, stock movements, and
financial movements. "Reiniciar demo" clears it and restores the seed.

## Explicit demo limitations

This is **NOT production**. Not implemented:

- backend / API
- PostgreSQL / Prisma
- authentication / real users
- real multi-branch production operations
- real treasury
- ARCA / electronic invoicing / real CAE
- taxes
- customer / CRM module
- reservations / señas
- transfers
- purchasing
- payroll
- marketing / content loans
- production-grade concurrency / transactions

`localStorage` is not transactional/ACID. Finalization only **simulates**
all-or-nothing persistence in the browser; production requires a real
database transaction.