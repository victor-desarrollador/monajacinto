# Plan: Ventas - Punto de Venta (POS) Módulo Demo

Fecha: 2026-09-04
Proyecto: monajacinto

## Stack obligatoria

- React 18 + TypeScript + Vite
- Vitest + React Testing Library
- Demo solo en navegador (browser-only)
- Persistencia: un único snapshot `localStorage` (`StoreSnapshot`)
- Sin backend, sin PostgreSQL, sin Prisma, sin ARCA real, sin tesorería real

## Flujo de negocio

```
Selector de rol
  -> Vendedor (Seller) POS
  -> Producto / Variante (ProductVariant)
  -> Carrito
  -> Enviar a caja (Send to cashier)
  -> PENDING_PAYMENT
  -> Cola de cajero (Cashier queue)
  -> Pagos combinados (combined payments)
  -> PAID
  -> Finalizar (finalize)
  -> Movimientos de stock (StockMovement)
  -> Movimientos financieros demo (FinancialMovement demo)
  -> COMPLETED
  -> Ticket demo (DemoTicket)
```

## Máquina de estados estricta

```
DRAFT -> PENDING_PAYMENT -> PAID -> COMPLETED
```

Sin estados intermedios no contemplados. Las transiciones solo se permiten en el orden definido.

## Roles

- **Vendedor (Seller)**: arma el carrito, selecciona productos/variantes, envía la venta a caja.
- **Cajero (Cashier)**: recibe la cola de ventas `PENDING_PAYMENT`, captura los pagos combinados y calcula el cambio.
- POS y Caja son roles separados. El vendedor NO cobra.

## Modelo de dominio

### ProductVariant
- Tiene `salePrice` (precio de venta del producto en una variante específica).
- `SaleItem.unitPrice` proviene SIEMPRE de `ProductVariant.salePrice`, nunca de React ni de entrada de UI.

### SaleItem
- Referencia a variante y cantidad.
- `unitPrice` proviene de `ProductVariant.salePrice`.
- `quantity > 0`.
- `discount >= 0` y `discount <= unitPrice`.
- Una variante ya existente en el carrito con un descuento distinto debe ser rechazada (no se permite duplicar con descuento diferente).

### Inventory
- `physical` (stock físico real).
- `reserved` (stock reservado por ventas en curso).
- `available = physical - reserved`.
- Se rechaza `physical < reserved`.

### StockMovement
- Un `StockMovement` por cada `SaleItem`.
- Los movimientos se agregan agrupando coincidencias (`applySaleToInventory` agrega movimientos que coinciden).
- Los cambios de stock ocurren SOLO al finalizar (finalize), no al enviar a caja.

### Payment
- `Payment.amount` es el monto aplicado.
- EFECTIVO soporta metadatos persistidos `cashReceived` (monto recibido) y `change` (cambio).
- El cambio NUNCA es ingreso ni `FinancialMovement`.
- Rechazado el sobrepago en medios que no sean efectivo (non-cash overpayment rejected).
- `addPayment` SOLO acepta ventas en estado `PENDING_PAYMENT`.
- Pagos combinados soportados: puede haber varios `Payment` por venta.

### FinancialMovement
- Demo-only.
- Un `FinancialMovement` por cada `Payment`.
- Representa un libro contable demo, no tesorería real.

## Servicios

- `inventoryService`: ÚNICA vía de mutación de stock. Exponer `applySaleToInventory` que agrega movimientos coincidentes. Protege la invariante `physical >= reserved`.
- `catalogService`: lectura de productos y variantes.
- `salesService`: ciclo de vida de la venta (DRAFT -> PENDING_PAYMENT), validaciones del carrito.
- `paymentService`: gestión de pagos combinados, cálculo de cambio, validación de `PENDING_PAYMENT`.
- `finalizeService`: finalización de la venta. Revalida stock, es idempotente, genera StockMovement y FinancialMovement demo, transiciona a COMPLETED.

## Reglas monetarias

- Dinero en **centavos enteros** (integer cents). Nunca flotantes para dinero.
- Formato ARS determinista: `$ 100.000,10`.

## Reglas de finalización

- La finalización **revalida stock** (recalcula `available`).
- La finalización es **idempotente**: repetir la operación no duplica movimientos ni efectos.
- Los cambios de stock ocurren SOLO en finalización.

## Demo ticket

`DemoTicket` debe mostrar obligatoriamente:

```
COMPROBANTE DEMOSTRATIVO — SIN VALIDEZ FISCAL
CAE: DEMO-SIMULADO
```

## Alcance excluido (demo)

- Sin módulo de clientes (clients).
- Sin módulo de impuestos (tax).
- Sin historial de ventas (sales-history).
- Sin tesorería real, sin ARCA real, sin facturación electrónica.

---

# Tareas de implementación

## Task 1 — Project scaffold + test harness

**Objetivo:** Crear el proyecto React + TypeScript + Vite con Vitest y React Testing Library.

**Archivos:**
- `package.json` (scripts: `dev`, `build`, `test`, `test:watch`)
- `vite.config.ts`
- `vitest.config.ts` (o configuración integrada en Vite)
- `tsconfig.json`
- `index.html`
- `src/main.tsx`, `src/App.tsx`
- `src/test/setup.ts` (setup de React Testing Library + jest-dom)
- `.gitignore`

**Scripts (`package.json`):**
```
"dev": "vite"
"test": "vitest run"
"test:watch": "vitest"
"build": "tsc --noEmit && vite build"
```

**Pasos:**
1. Inicializar proyecto Vite con plantilla `react-ts`.
2. Instalar `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
3. Configurar Vitest con entorno `jsdom` y setup.
4. Crear un componente mínimo renderizable y un test de humo para que `npm test` pase de inmediato.
5. Usar UN único `tsconfig.json`. Si el scaffold Vite `react-ts` genera `tsconfig.node.json`, `tsconfig.app.json` o configuraciones TypeScript por project-reference, eliminarlas y reemplazarlas por el único `tsconfig.json` aprobado. No retener configuraciones TypeScript generadas sin usar.

**Tests:**
- Test de humo: `App` renderiza sin errores (hace que `npm test` pase).

**Verificación:**
```
npm test
npm run build
```

## Task 2 — Domain types + money + statuses

**Objetivo:** Definir tipos de dominio, utilidades monetarias y estados.

**Archivos:**
- `src/domain/types.ts` (Sale, SaleItem, Payment, PaymentMethod, ProductVariant, Product, Inventory, StockMovement, FinancialMovement, SaleStatus)
- `src/domain/status.ts` (máquina de estados, transiciones permitidas)
- `src/domain/money.ts` (enteros centavos, suma/resta, `formatARS`)

**Pasos:**
1. Definir `SaleStatus` como union: `'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'COMPLETED'`.
2. Definir tipos para Product, ProductVariant, SaleItem, Payment, FinancialMovement, StockMovement.
3. Implementar `money` en centavos enteros y `formatARS` determinista (`$ 100.000,10`).
4. Implementar la tabla de transiciones válidas de `SaleStatus`.

**Tests:**
- `formatARS(10000010)` -> `$ 100.000,10`.
- Aritmética en centavos: suma/resta sin pérdida de precisión.
- Transiciones válidas/inválidas de estado (p.ej. DRAFT -> PAID es inválida).

**Verificación:**
```
npm run test
npm run typecheck
```

## Task 3 — Store + seed

**Objetivo:** Implementar el store único y el snapshot en `localStorage` con datos semilla.

**Archivos:**
- `src/domain/types.ts` (define `StoreSnapshot`: tipo del snapshot serializable)
- `src/services/store.ts` (lectura/escritura del snapshot en `localStorage`)
- `src/domain/seed.ts` (datos demo: productos, variantes, inventario inicial)

**Dirección de imports en runtime:**
- `store.ts -> seed.ts -> types.ts`
- `seed.ts` importa `StoreSnapshot` SOLO como tipo desde `domain/types.ts`.
- Sin dependencia circular en runtime.
- Un único snapshot/key en `localStorage`.

**Pasos:**
1. Definir `StoreSnapshot` en `domain/types.ts` (shop, productos, variantes, inventario, ventas, movimientos demo).
2. Implementar `loadStore(): StoreSnapshot`, `saveStore(snapshot: StoreSnapshot): void` y `resetStore(): StoreSnapshot` en `services/store.ts` contra una única key en `localStorage`.
3. Implementar semillas deterministas en `domain/seed.ts` (productos, variantes con `salePrice`, inventario con `physical`/`reserved`).
4. Cargar semilla cuando no exista snapshot previo.

**Tests:**
- El store inicializa con la semilla cuando no hay snapshot.
- `saveStore`/`loadStore` roundtrip preserva los datos.
- `resetStore(): StoreSnapshot` restablece la semilla.
- La semilla respeta `physical >= reserved`.
- No hay ciclos de import en runtime (`store -> seed -> types`).

**Verificación:**
```
npm run test
npm run typecheck
```

## Task 4 — inventoryService

**Objetivo:** Única vía de mutación de stock con agregación de movimientos.

**Archivos:**
- `src/services/inventoryService.ts`

**Pasos:**
1. Implementar `applySaleToInventory(storeSnapshot, stockMovements)`.
2. Acepta `StoreSnapshot` + `StockMovement[]`; no persiste, no muta el snapshot original.
3. Agrega CANTIDADES de movimientos por `variantId` + `locationId` SOLO para calcular las filas de `Inventory` resultantes.
4. Preserva y anexa los registros `StockMovement` originales (nunca colapsa múltiples `SaleItem` en un único movimiento de auditoría).
5. Mantiene un `StockMovement` por `SaleItem`.
6. Rechaza si el `physical` resultante es `< reserved`.
7. `available = physical - reserved`.
8. Garantizar que no exista otra ruta que persista mutaciones de stock (la persistencia la hace el caller vía `store`).

**Tests:**
- Multiples movimientos de la misma variante/ubicación suman correctamente el delta de inventario.
- Los movimientos individuales originales permanecen presentes.
- `physical < reserved` rechazado.
- El snapshot original no se modifica.
- `available` calculado correctamente.
- Un `StockMovement` por `SaleItem`.

**Verificación:**
```
npm run test
npm run typecheck
```

## Task 5 — catalogService

**Objetivo:** Lectura de productos y variantes.

**Archivos:**
- `src/services/catalogService.ts`

**Pasos:**
1. Implementar búsqueda de productos y variantes.
2. Exponer `salePrice` de cada variante para alimentar `SaleItem.unitPrice`.
3. Resolver variante por id desde el catálogo.

**Tests:**
- Busca productos existentes.
- Devuelve `salePrice` correcto para una variante.
- Variante inexistente produce error.

**Verificación:**
```
npm run test
npm run typecheck
```

## Task 6 — salesService

**Objetivo:** Ciclo de vida de la venta DRAFT -> PENDING_PAYMENT y validaciones del carrito.

**Archivos:**
- `src/services/salesService.ts`

**Pasos:**
1. Crear venta en `DRAFT`.
2. `addItem(saleId, variantId, quantity, discount)`: React NUNCA provee `unitPrice`.
3. El servicio lee `ProductVariant.salePrice` y lo congela como `unitPrice` del `SaleItem`.
4. Validar `quantity > 0`, `discount >= 0` y `discount <= unitPrice`.
5. Si la variante ya existe con el MISMO descuento, incrementar la cantidad.
6. Si la variante ya existe con descuento distinto, rechazar.
7. Validar la cantidad total resultante contra `availableAt(store, variantId, sale.branchId)`.
8. `sendToCashier` transiciona SOLO `DRAFT -> PENDING_PAYMENT` (nunca cambia stock).
9. Calcular subtotal/total con descuentos.

**Tests:**
- `unitPrice` proviene de `salePrice` (congelado), no de la UI.
- `quantity <= 0` rechazado.
- `discount` fuera de rango rechazado.
- Variante duplicada con distinto descuento rechazada.
- Variante duplicada con mismo descuento incrementa cantidad.
- Cantidad total validada contra `availableAt`.
- `sendToCashier` solo `DRAFT -> PENDING_PAYMENT` y no modifica stock.
- Totales correctos con descuentos.

**Verificación:**
```
npm run test
npm run typecheck
```

## Task 7 — paymentService

**Objetivo:** Pagos combinados y cálculo de cambio.

**Archivos:**
- `src/services/paymentService.ts`

**Pasos:**
1. `addPayment` SOLO acepta ventas en estado `PENDING_PAYMENT`.
2. `amount > 0`.
3. Calcular el total de pagos actual desde el MISMO snapshot cargado.
4. `Payment.amount` es el monto aplicado.
5. El nuevo total de pagos NUNCA puede superar `sale.total`.
6. La venta se vuelve `PAID` SOLO cuando `SUM(payments) === sale.total`.
7. Mientras `SUM(payments) < sale.total` la venta permanece `PENDING_PAYMENT`.
8. EFECTIVO requiere `cashReceived >= amount`; `change = cashReceived - amount`.
9. Persistir `cashReceived`/`change`.
10. Medios no-efectivo deben rechazar metadatos `cashReceived`.
11. Después de `PAID`, llamadas adicionales a `addPayment` se rechazan.
12. El cambio no es ingreso ni `FinancialMovement`.

**Tests:**
- `addPayment` rechaza estados distintos a `PENDING_PAYMENT`.
- `amount <= 0` rechazado.
- Pagos combinados suman correctamente (total recalculado desde el snapshot).
- `cashReceived`/`change` persistidos para efectivo.
- `cashReceived < amount` rechazado.
- Sobrepago no-efectivo (incluyendo metadatos `cashReceived`) rechazado.
- `PAID` SOLO cuando `SUM(payments) === sale.total`.
- Después de `PAID`, `addPayment` rechaza.
- Cambio no genera `FinancialMovement`.

**Verificación:**
```
npm run test
npm run typecheck
```

## Task 8 — finalizeService

**Objetivo:** Finalización idempotente con revalidación de stock y movimientos demo.

**Archivos:**
- `src/services/finalizeService.ts`

**Pasos:**
1. `finalizeSale` acepta SOLO ventas en estado `PAID`; rechazar cualquier otro estado.
2. Rechazar si ya existen referencias de `StockMovement` o `FinancialMovement` para la venta.
3. El total de pagos debe ser exactamente igual a `sale.total`.
4. Revalidar el stock disponible (`available`) para cada `SaleItem`.
5. Crear exactamente un `StockMovement` por `SaleItem`.
6. Crear exactamente un `FinancialMovement` por `Payment`.
7. `FinancialMovement.amount = Payment.amount` únicamente.
8. Usar `inventoryService.applySaleToInventory` para el cálculo de stock.
9. `inventoryService` NO guarda; ensamblar el snapshot completo resultante en memoria.
10. Llamar `saveStore(nextStore)` exactamente una vez, después de que toda la validación/cálculo haya resultado exitoso.
11. Transicionar `PAID -> COMPLETED`.
12. Repetir la finalización no debe duplicar efectos (idempotente).

**Tests:**
- `finalizeSale` rechaza estados distintos a `PAID`.
- Rechaza si ya existen `StockMovement`/`FinancialMovement` para la venta.
- Rechaza si el total de pagos no es exactamente `sale.total`.
- Revalida stock y rechaza stock insuficiente.
- Un `StockMovement` por `SaleItem`.
- Un `FinancialMovement` por `Payment`, con `amount === Payment.amount`.
- `saveStore` se llama una sola vez.
- Idempotente: segunda llamada no duplica efectos.
- Transiciona a `COMPLETED`.

**Verificación:**
```
npm run test
npm run typecheck
```

## Task 9 — UI wiring

**Objetivo:** Conectar los servicios a la interfaz React siguiendo el flujo completo.

**Archivos:**
- `src/components/RoleSelector.tsx`
- `src/components/SellerPOS.tsx`
- `src/components/ProductVariantPicker.tsx`
- `src/components/Cart.tsx`
- `src/components/CashierQueue.tsx`
- `src/components/PaymentPanel.tsx`
- `src/components/DemoTicket.tsx`

**Pasos:**
1. `RoleSelector` permite elegir Vendedor o Cajero.
2. `SellerPOS` + `ProductVariantPicker` + `Cart` arman la venta y la envían a caja.
3. `CashierQueue` lista ventas `PENDING_PAYMENT`.
4. `PaymentPanel` captura pagos combinados y muestra cambio en efectivo.
5. `DemoTicket` muestra `COMPROBANTE DEMOSTRATIVO — SIN VALIDEZ FISCAL` y `CAE: DEMO-SIMULADO`.
6. Toda mutación pasa por los servicios; la UI no calcula precios.

**Tests:**
- Flujo completo Seller → Cashier → PAID → COMPLETED → ticket renderiza.
- `DemoTicket` muestra los textos obligatorios.
- La UI no introduce `unitPrice` propio.

**Verificación:**
```
npm run test
npm run typecheck
npm run dev
```

## Task 10 — verification/docs

**Objetivo:** Verificación integral y documentación.

**Archivos:**
- `docs/superpowers/plans/2026-09-04-ventas-pos-demo.md` (este plan)
- `README.md` (instrucciones de ejecución y demo) si aplica

**Pasos:**
1. Ejecutar suite completa de tests.
2. Ejecutar typecheck y build.
3. Verificación manual del flujo demo de principio a fin.
4. Documentar comandos de ejecución y alcance demo.

**Verificación:**
```
npm run test
npm run typecheck
npm run build
```

## Criterios de aceptación

- El flujo completo Seller → PENDING_PAYMENT → pagos combinados → PAID → COMPLETED → ticket funciona sin errores.
- Los totales se calculan correctamente con dinero en centavos enteros.
- El ticket demo muestra los textos fiscales obligatorios.
- El stock solo cambia al finalizar y la finalización es idempotente.
- Las invariantes de inventario (`physical >= reserved`, `available = physical - reserved`) se mantienen.
- La persistencia en un único snapshot de `localStorage` funciona de ida y vuelta.