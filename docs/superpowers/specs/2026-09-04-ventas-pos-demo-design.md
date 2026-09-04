# Monajacinto — Ventas y POS (Demo Vertical) — Design Spec

**Document:** `docs/superpowers/specs/2026-09-04-ventas-pos-demo-design.md`
**Status:** Approved design (implementation not started)
**Date:** 2026-09-04
**Scope:** First demo vertical of the Monajacinto "Sistema de Gestión Multisucursal"

---

## 1. Purpose

Build a browser-only demo of the sales vertical. The goal is to validate the
core business flow and the fundamental `POS != Caja` separation:

```
Product → Variant → Stock → Seller POS → Send to cashier → Payment → Demo ticket
```

The demo is a throwaway-able but conceptually faithful vertical. Every screen
maps to a real domain process, so it can later migrate to a real backend.

### In scope

- Product / Variant catalog (SKU, color, talle, prices).
- Inventory: physical / reserved / available per variant + location.
- Seller POS: search, cart, send to cashier.
- Cashier: pending-sales queue, combined payment, finalize.
- Demo ticket with "SIN VALIDEZ FISCAL" legend.

### Out of scope (explicitly NOT implemented)

- Real backend, PostgreSQL, Prisma.
- ARCA integration (simulated only).
- Treasury, reconciliation, settlements, cash-management logic.
- Payroll, reservations, marketing loans, transfers.
- Cash register open/close/arqueo lifecycle.
- Production infrastructure, Docker, CI/CD.

---

## 2. Technology (demo)

- React + TypeScript + Vite.
- No backend. State lives in a **service layer** (plain TS modules).
- Persistence: `localStorage` adapter behind service interfaces, with seed data
  preloaded on first load.
- Money represented as **integer cents**; never `float`.

---

## 3. Domain model (types)

```text
Location          { id, name, type: BRANCH | WAREHOUSE }

Product           { id, name, category, brand }

ProductVariant    { id, productId, sku, color, size,
                    salePrice, resellerPrice, barcode }

Inventory         { variantId, locationId, physical, reserved }
                  // available = physical - reserved (derived, not stored)

StockMovement     { id, variantId, locationId, quantity,
                    type: SALE, referenceType: "SALE",
                    referenceId: saleId, saleItemId,
                    createdAt, userId }

Sale              { id, number (V-...), posId, sellerId, branchId,
                    status: SaleStatus, items: SaleItem[],
                    total, createdAt, finalizedAt }

SaleItem          { id, saleId, variantId, quantity,
                    unitPrice, discount, subtotal }

Payment           { id, saleId, method, financialAccountId, amount }

FinancialMovement { id, type: SALE_DEMO, direction: IN, amount,
                    method, financialAccountId, referenceId,
                    createdAt }
                    // DEMO ledger only — no treasury semantics
```

`StockMovement` references both `referenceId = saleId` and `saleItemId`, so any
movement can be traced to the exact `SaleItem` that caused it.

---

## 4. Service layer (the future backend boundary)

React components **never** mutate stock, money, or sale state directly. All
changes go through command functions on these services:

| Service | Responsibilities |
|---|---|
| `catalogService` | list/search products & variants by SKU/barcode/name; read prices. |
| `inventoryService` | read availability per variant+location; **apply `SALE` decrement** (only entry point for stock writes). |
| `salesService` | create draft; add/remove items; compute subtotal/total; `DRAFT → PENDING_PAYMENT`. |
| `paymentService` | add combined payments; validate `SUM(payments) == sale.total`. |
| `finalizeService` | idempotent `finalizeSale(saleId)` → apply stock + financial movements + ticket exactly once. |

---

## 5. Sale state machine (strict, deterministic)

```text
DRAFT
  → PENDING_PAYMENT     (seller "Enviar a caja")
  → PAID                (cashier: SUM(payments) == sale.total)
  → COMPLETED           (finalizeSale, atomic-ish side effects)
```

- `PENDING_PAYMENT` becomes `PAID` **only** when `SUM(payments) == sale.total`.
- `finalizeSale()` accepts **only** `PAID` sales. It does NOT accept
  `PENDING_PAYMENT` directly.

---

## 6. finalizeSale — idempotency & all-or-nothing (demo)

`finalizeSale(saleId)` performs, in order:

1. **Guard status** — reject if sale is already `COMPLETED` (or not `PAID`).
2. **Guard existing finalization** — reject if any `StockMovement` (or
   `FinancialMovement`) already references this sale (prevents duplicate work
   even if status were somehow malformed).
3. **Validate full payment** — `SUM(payments) == sale.total`.
4. **Validate available stock** — for every `SaleItem`, confirm
   `available >= quantity` at its variant + location.
5. **Compute all resulting state changes** in memory:
   - one `SALE` `StockMovement` per `SaleItem` (quantity = sold), decrement
     `physical` accordingly;
   - one `FinancialMovement` per `Payment`;
   - `status = COMPLETED`, `finalizedAt = now`.
6. **Persist the resulting state once.**

Idempotency does **not** rely only on generated mutation IDs. It is enforced by
(a) sale status and (b) the existence of prior movements/references for the
sale. Retrying the same sale cannot duplicate stock or financial movements.

### Atomicity caveat (demo only)

`localStorage` provides no real ACID. The steps above **simulate** an
all-or-nothing finalize by computing all state then persisting once. Production
will replace this with a real database transaction (BEGIN/COMMIT/ROLLBACK).

### Excess payment

Excess payment is never silently accepted. For cash, the demo models
"received vs change" explicitly (`change = received - total`), and the sale
records the `total`, not the received amount. Other methods reject over-payment.

---

## 7. Discounts

Discounts are configurable/mock for the demo. **No business percentage is
invented.** If a limit is enforced in the demo, it is treated as mock/placeholder
and clearly labeled as such, pending `02_ROLES_Y_PERMISOS.md`.

---

## 8. Combined payment

A sale may have one or more payments. Method and financial account are separate
concepts (e.g. `TRANSFERENCIA` + `Banco Galicia`, `QR` + `Mercado Pago`,
`EFECTIVO` + `Caja Sucursal`).

---

## 9. Demo ticket & fiscal disclaimer

The completed sale produces a `SALE_TICKET` (internal, non-fiscal). It must
clearly display:

```text
COMPROBANTE DEMOSTRATIVO — SIN VALIDEZ FISCAL
CAE: DEMO-SIMULADO
```

It is never presented as a real fiscal invoice. Fiscal invoice logic (ARCA) is
out of scope for this vertical.

---

## 10. Key invariants

- Stock written only via `inventoryService`.
- One `SALE` movement per `SaleItem`/variant, quantity = sold, referencing
  both `saleId` and `saleItemId` (traceability, no double-decrement).
- No double-decrement / no double-payment on repeated finalize (idempotency).
- `available = physical - reserved`; no negative stock.
- Price frozen at `SaleItem.unitPrice` snapshot (historical price).
- `FinancialMovement` is explicitly DEMO-ledger-only (no treasury).

---

## 11. UI navigation

1. **Role selector** — `Vendedor` / `Cajero` (simulates separate terminals).
2. **Seller POS** — search, cart, discount, "Enviar a caja".
3. **Cashier** — pending queue, selected-sale detail, payment composition,
   "Finalizar".
4. **Demo ticket** — result with DEMO / "SIN VALIDEZ FISCAL" legend.

---

## 12. Out of scope for production path (noted, not built)

The demo preserves concepts (`Inventory`, `StockMovement`, `Sales`, `Payments`)
so they can migrate to the production architecture
(`React → API → Express → Prisma → PostgreSQL`) without changing domain rules.

---

**Status:** Approved design. Awaiting spec review before writing the
implementation plan.