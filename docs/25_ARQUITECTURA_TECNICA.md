# 25 — ARQUITECTURA TÉCNICA

**Proyecto:** Sistema de Gestión Multisucursal para Empresa de Indumentaria
**Documento:** `25_ARQUITECTURA_TECNICA.md`
**Versión:** 1.0
**Estado:** DEFINITIVO PARA DEMO / BASE PARA PRODUCCIÓN
**Módulos totales:** 28
**Relacionado con:** 24 — Modelo de Datos, 26 — Seguridad, 27 — Infraestructura y Deployment, 28 — Testing, QA y Definition of Done

---

# 1. PROPÓSITO

Este documento define la arquitectura técnica del sistema y establece cómo debe transformarse la especificación funcional de los módulos anteriores en una aplicación real.

La arquitectura debe permitir:

* desarrollar rápidamente la demo;
* validar los procesos con el cliente;
* evitar rehacer el sistema posteriormente;
* evolucionar hacia producción sin cambiar el modelo fundamental;
* mantener separación entre frontend, backend, persistencia e integraciones;
* proteger stock, dinero, usuarios y operaciones;
* soportar múltiples sucursales;
* soportar múltiples terminales POS;
* mantener trazabilidad completa;
* integrar facturación ARCA posteriormente;
* permitir crecimiento futuro sin convertir el proyecto en un monolito desorganizado.

---

# 2. PRINCIPIO ARQUITECTÓNICO CENTRAL

La aplicación se diseña bajo el siguiente principio:

> **El frontend muestra y solicita. El backend decide y ejecuta. La base de datos persiste. Los movimientos explican los cambios. La auditoría demuestra lo ocurrido.**

Ninguna regla crítica del negocio debe depender exclusivamente del frontend.

El frontend puede:

* mostrar información;
* validar UX;
* impedir acciones evidentemente inválidas;
* solicitar operaciones;
* mostrar estados;
* manejar formularios;
* gestionar navegación.

Pero el frontend **NO es autoridad de negocio**.

El backend debe validar:

* permisos;
* sucursal;
* POS;
* caja;
* stock;
* precios;
* descuentos;
* estados;
* pagos;
* saldos;
* transiciones;
* relaciones;
* concurrencia;
* idempotencia;
* integridad.

---

# 3. ARQUITECTURA OBJETIVO

La arquitectura objetivo será:

```text
                         INTERNET
                            │
                            ▼
                     HTTPS / DOMAIN
                            │
                            ▼
                  ┌──────────────────┐
                  │     FRONTEND     │
                  │ React + TS + Vite│
                  └────────┬─────────┘
                           │
                        REST API
                           │
                           ▼
                  ┌──────────────────┐
                  │     BACKEND      │
                  │ Node + Express   │
                  │ TypeScript       │
                  └────────┬─────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
        ┌─────────┐   ┌──────────┐  ┌─────────────┐
        │ Prisma  │   │ Services │  │ Integrations│
        └────┬────┘   └──────────┘  └──────┬──────┘
             │                              │
             ▼                              ▼
      ┌──────────────┐                ┌─────────────┐
      │ PostgreSQL   │                │ ARCA        │
      │              │                │ Provider    │
      └──────────────┘                └─────────────┘
```

Componentes principales:

1. Frontend.
2. API Backend.
3. Capa de dominio/servicios.
4. Persistencia.
5. PostgreSQL.
6. Integraciones externas.
7. Sistema de auditoría.
8. Sistema de logs.
9. Sistema de trabajos asíncronos cuando sea necesario.

---

# 4. ARQUITECTURA PARA LA DEMO

La demo tiene un objetivo diferente al sistema productivo.

La demo debe permitir validar:

* navegación;
* UX;
* procesos;
* roles;
* stock;
* ventas;
* caja;
* pagos;
* transferencias;
* compras;
* reservas;
* préstamos;
* cambios;
* empleados;
* reportes;
* facturación simulada;
* trazabilidad.

Durante la primera semana **NO es obligatorio implementar**:

* ARCA real;
* PostgreSQL productivo;
* Redis;
* WebSockets;
* infraestructura HA;
* backups productivos;
* observabilidad avanzada;
* colas distribuidas;
* certificados fiscales reales.

La demo puede utilizar:

```text
React + TypeScript + Vite
          │
          ▼
Mock Services / Local State
          │
          ▼
localStorage / fixtures
```

Sin embargo, la estructura del frontend debe respetar la futura separación por servicios.

---

# 5. DEMO VS PRODUCCIÓN

| Componente    | Demo                  | Producción                       |
| ------------- | --------------------- | -------------------------------- |
| Frontend      | React + TS + Vite     | React + TS + Vite                |
| Backend       | Opcional/simplificado | Node + Express + TS              |
| Base de datos | Mock/localStorage     | PostgreSQL                       |
| ORM           | No obligatorio        | Prisma                           |
| Autenticación | Simulada              | Real                             |
| RBAC          | Simulado              | Backend + DB                     |
| ARCA          | Simulado              | Adapter ARCA real                |
| Pagos         | Simulados             | Integraciones/configuración real |
| Auditoría     | Simulada              | Persistente e inmutable          |
| Stock         | Mock                  | Ledger persistente               |
| Redis         | No                    | Opcional                         |
| WebSockets    | No                    | Opcional                         |
| Jobs          | No                    | Opcional                         |
| HTTPS         | Según deployment      | Obligatorio                      |
| Backups       | No                    | Obligatorios                     |
| Monitoring    | Básico                | Completo                         |
| CI/CD         | Opcional              | Recomendado/obligatorio          |
| Tests         | Base                  | Suite completa                   |

La demo debe parecerse conceptualmente a producción aunque no tenga toda la infraestructura.

---

# 6. MODULAR MONOLITH COMO ARQUITECTURA INICIAL

El backend será inicialmente un:

> **Modular Monolith**

No se recomienda comenzar con microservicios.

La aplicación tendrá un único backend desplegable, pero internamente estará dividido por dominios.

Ejemplo:

```text
apps/api
├── auth
├── users
├── branches
├── products
├── inventory
├── warehouse
├── purchases
├── transfers
├── sales
├── cash
├── treasury
├── financial-accounts
├── reservations
├── marketing-loans
├── exchanges
├── employees
├── payroll
├── invoices
├── reports
└── audit
```

Esto permite:

* desarrollo más rápido;
* deployment simple;
* transacciones SQL consistentes;
* menor complejidad;
* menor coste;
* evolución posterior.

Si el sistema crece significativamente, determinados módulos podrán separarse posteriormente.

---

# 7. ESTRUCTURA DEL MONOREPO

La estructura recomendada es:

```text
project-root/
│
├── apps/
│   │
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── layouts/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── lib/
│   │   │   └── types/
│   │   └── ...
│   │
│   └── api/
│       ├── src/
│       │   ├── config/
│       │   ├── middleware/
│       │   ├── modules/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── integrations/
│       │   ├── infrastructure/
│       │   ├── errors/
│       │   ├── utils/
│       │   └── server.ts
│       └── ...
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── config/
│   └── utils/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│   ├── 01_VISION_Y_ALCANCE.md
│   ├── ...
│   ├── 25_ARQUITECTURA_TECNICA.md
│   ├── 26_SEGURIDAD.md
│   ├── 27_INFRAESTRUCTURA_Y_DEPLOYMENT.md
│   └── 28_TESTING_QA_Y_DEFINITION_OF_DONE.md
│
├── scripts/
│
├── tests/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── AGENTS.md
└── README.md
```

---

# 8. FRONTEND

## 8.1 Tecnología

Frontend objetivo:

```text
React
TypeScript
Vite
```

El frontend será una SPA administrativa/POS.

---

# 9. ORGANIZACIÓN DEL FRONTEND

Se recomienda organizar por funcionalidades.

```text
src/features/

├── dashboard/
├── products/
├── inventory/
├── warehouse/
├── purchases/
├── transfers/
├── sales/
├── pos/
├── cash/
├── treasury/
├── reservations/
├── marketing-loans/
├── exchanges/
├── employees/
├── payroll/
├── invoices/
├── reports/
└── audit/
```

Cada feature puede contener:

```text
feature/
├── components/
├── pages/
├── hooks/
├── services/
├── schemas/
├── types/
└── utils/
```

Esto evita tener:

```text
components/
├── Component1
├── Component2
├── Component3
├── Component4
├── Component5
└── ...
```

sin relación clara con el dominio.

---

# 10. FRONTEND Y REGLAS DE NEGOCIO

El frontend puede validar:

```text
amount > 0
email válido
campo requerido
formato de código
```

Pero nunca debe ser la única validación de:

```text
¿puede vender?
¿puede aplicar descuento?
¿puede cerrar caja?
¿hay stock?
¿puede transferir?
¿puede aprobar?
¿puede cancelar?
¿puede modificar precio?
```

Estas reglas pertenecen al backend.

---

# 11. BACKEND

Tecnología objetivo:

```text
Node.js
Express
TypeScript
Prisma
PostgreSQL
```

El backend será responsable de:

* autenticación;
* autorización;
* validación;
* reglas de negocio;
* transacciones;
* persistencia;
* stock;
* dinero;
* estados;
* auditoría;
* integraciones;
* generación de documentos;
* reportes;
* exports.

---

# 12. ESTRUCTURA INTERNA DEL BACKEND

Ejemplo:

```text
apps/api/src/

├── config/
│
├── middleware/
│   ├── auth.ts
│   ├── authorization.ts
│   ├── validation.ts
│   ├── error-handler.ts
│   └── request-context.ts
│
├── modules/
│   ├── sales/
│   ├── inventory/
│   ├── cash/
│   ├── treasury/
│   ├── purchases/
│   ├── transfers/
│   ├── reservations/
│   ├── employees/
│   └── ...
│
├── integrations/
│   ├── arca/
│   ├── payments/
│   └── messaging/
│
├── infrastructure/
│   ├── database/
│   ├── logging/
│   ├── storage/
│   └── queue/
│
├── errors/
│
├── utils/
│
└── server.ts
```

---

# 13. CAPAS INTERNAS

Cada dominio deberá separar responsabilidades.

Modelo recomendado:

```text
HTTP Controller
      │
      ▼
Application Service
      │
      ▼
Domain Rules
      │
      ▼
Repository / Prisma
      │
      ▼
PostgreSQL
```

Ejemplo:

```text
POST /sales/:id/finalize
        │
        ▼
SalesController
        │
        ▼
FinalizeSaleService
        │
        ├── Validate permissions
        ├── Validate state
        ├── Validate stock
        ├── Validate payments
        ├── Create financial movements
        ├── Create stock movements
        ├── Create invoice
        └── Create audit log
                │
                ▼
            Transaction
                │
                ▼
            PostgreSQL
```

---

# 14. CONTROLLERS

Los controllers manejan HTTP.

Deben:

* recibir request;
* extraer parámetros;
* validar estructura;
* llamar al servicio;
* devolver response.

No deben contener lógica compleja de negocio.

Incorrecto:

```text
Controller
 ├── calcula stock
 ├── modifica caja
 ├── verifica permisos
 ├── genera factura
 └── inserta 20 registros
```

Correcto:

```text
Controller
      │
      ▼
Service
      │
      ├── Business rules
      ├── Transaction
      └── Persistence
```

---

# 15. SERVICES

Los services contienen casos de uso.

Ejemplos:

```text
CreateSaleService
FinalizeSaleService
CancelSaleService
CreateTransferService
DispatchTransferService
ReceiveTransferService
CreateReservationService
PickupReservationService
CloseCashRegisterService
ReceivePurchaseService
CreateExchangeService
CreateEmployeePurchaseService
GenerateInvoiceService
```

Los nombres deben representar acciones reales del dominio.

---

# 16. REPOSITORIES

Los repositories encapsulan acceso a datos cuando resulte útil para mantener separación.

Ejemplo:

```text
SaleRepository
InventoryRepository
CashRepository
TransferRepository
ReservationRepository
EmployeeRepository
```

No se debe crear una abstracción artificial únicamente por patrón.

La regla es:

> usar repositories cuando aporten aislamiento, testabilidad o claridad.

Prisma sigue siendo el ORM principal.

---

# 17. PRISMA

Prisma será la capa ORM principal.

```text
Application Service
       │
       ▼
Prisma Client
       │
       ▼
PostgreSQL
```

Prisma se utilizará para:

* queries;
* inserts;
* updates;
* relaciones;
* transacciones;
* migraciones;
* constraints soportadas;
* tipado.

---

# 18. POSTGRESQL

PostgreSQL será la base de datos objetivo de producción.

Características requeridas:

* integridad referencial;
* foreign keys;
* unique constraints;
* índices;
* transacciones;
* precisión decimal;
* aislamiento adecuado;
* constraints;
* migraciones;
* backups.

Los datos financieros y de stock deben persistirse de forma transaccional.

---

# 19. DINERO

Nunca utilizar:

```text
float
```

para representar dinero.

Se debe utilizar:

```text
Decimal
```

en PostgreSQL/Prisma.

Ejemplo conceptual:

```text
Decimal(12,2)
```

La precisión definitiva debe adecuarse a las necesidades reales del negocio.

Los cálculos monetarios deben evitar errores binarios de floating point.

---

# 20. CANTIDADES DE STOCK

Las cantidades de inventario deben utilizar una representación apropiada para la naturaleza del producto.

Para prendas enteras:

```text
INTEGER
```

o equivalente.

Debe evitarse representar cantidades enteras de prendas mediante floats.

---

# 21. API REST

La API seguirá principios REST.

Base:

```text
/api/v1
```

Ejemplos:

```text
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id

GET    /api/v1/sales
POST   /api/v1/sales
GET    /api/v1/sales/:id
POST   /api/v1/sales/:id/finalize
POST   /api/v1/sales/:id/cancel

GET    /api/v1/inventory
GET    /api/v1/inventory/movements

POST   /api/v1/transfers
POST   /api/v1/transfers/:id/approve
POST   /api/v1/transfers/:id/dispatch
POST   /api/v1/transfers/:id/receive
```

---

# 22. ACCIONES DE NEGOCIO

No todo debe convertirse en:

```text
PATCH /resource/:id
{
  "status": "COMPLETED"
}
```

Las operaciones críticas deben tener endpoints explícitos.

Ejemplo:

```text
POST /sales/:id/finalize
POST /sales/:id/cancel

POST /transfers/:id/approve
POST /transfers/:id/dispatch
POST /transfers/:id/receive

POST /reservations/:id/pickup
POST /reservations/:id/cancel

POST /cash-registers/:id/open
POST /cash-registers/:id/close
```

Esto hace explícita la intención de negocio.

---

# 23. ENDPOINTS POR DOMINIO

## 23.1 Auth

```text
POST /auth/login
POST /auth/logout
GET  /auth/me
POST /auth/refresh
```

---

## 23.2 Empresas y sucursales

```text
GET  /companies
GET  /branches
POST /branches
GET  /branches/:id
PATCH /branches/:id
```

---

## 23.3 Usuarios

```text
GET  /users
POST /users
GET  /users/:id
PATCH /users/:id
POST /users/:id/activate
POST /users/:id/deactivate
```

---

## 23.4 Productos

```text
GET  /products
POST /products
GET  /products/:id
PATCH /products/:id

GET  /products/:id/variants
POST /products/:id/variants
PATCH /variants/:id

GET  /products/:id/prices
```

---

## 23.5 Inventario

```text
GET /inventory
GET /inventory/:variantId
GET /inventory/movements
GET /inventory/availability
```

Las modificaciones de stock deben producirse mediante operaciones de negocio.

No:

```text
PATCH /inventory/:id
{
  "quantity": 50
}
```

para operaciones normales.

---

# 24. TRANSFERENCIAS

```text
GET  /transfers
POST /transfers

GET  /transfers/:id

POST /transfers/:id/approve
POST /transfers/:id/prepare
POST /transfers/:id/dispatch
POST /transfers/:id/receive
POST /transfers/:id/cancel
```

---

# 25. COMPRAS

```text
GET  /purchase-orders
POST /purchase-orders
GET  /purchase-orders/:id
POST /purchase-orders/:id/approve

GET  /purchase-receipts
POST /purchase-receipts
GET  /purchase-receipts/:id
POST /purchase-receipts/:id/confirm
```

---

# 26. VENTAS

```text
GET  /sales
POST /sales
GET  /sales/:id

POST /sales/:id/add-item
POST /sales/:id/remove-item
POST /sales/:id/apply-discount

POST /sales/:id/send-to-payment
POST /sales/:id/finalize
POST /sales/:id/cancel

GET /sales/:id/payments
```

El endpoint de finalización debe ejecutar la operación completa dentro de una transacción cuando corresponda.

---

# 27. CAJA

```text
GET  /cash-registers
GET  /cash-registers/:id

POST /cash-registers/:id/open
POST /cash-registers/:id/cash-in
POST /cash-registers/:id/cash-out
POST /cash-registers/:id/close

GET  /cash-registers/:id/session
GET  /cash-registers/:id/movements
GET  /cash-registers/:id/reconciliation
```

---

# 28. TESORERÍA

```text
GET /treasury
GET /treasury/movements

POST /treasury/transfers
POST /treasury/deposits
POST /treasury/withdrawals
POST /treasury/expenses
POST /treasury/refunds
```

---

# 29. CUENTAS FINANCIERAS

```text
GET  /financial-accounts
POST /financial-accounts
GET  /financial-accounts/:id
PATCH /financial-accounts/:id

GET /financial-accounts/:id/movements
```

---

# 30. RESERVAS

```text
GET  /reservations
POST /reservations
GET  /reservations/:id

POST /reservations/:id/confirm
POST /reservations/:id/extend
POST /reservations/:id/pickup
POST /reservations/:id/cancel
```

---

# 31. PRÉSTAMOS DE PUBLICIDAD

```text
GET  /marketing-loans
POST /marketing-loans
GET  /marketing-loans/:id

POST /marketing-loans/:id/approve
POST /marketing-loans/:id/deliver
POST /marketing-loans/:id/return
POST /marketing-loans/:id/mark-damaged
POST /marketing-loans/:id/mark-missing
POST /marketing-loans/:id/mark-sold
```

---

# 32. CAMBIOS Y DEVOLUCIONES

```text
GET  /returns-exchanges
POST /returns-exchanges
GET  /returns-exchanges/:id

POST /returns-exchanges/:id/approve
POST /returns-exchanges/:id/complete
POST /returns-exchanges/:id/cancel
```

---

# 33. EMPLEADOS

```text
GET /employees
POST /employees
GET /employees/:id
PATCH /employees/:id

GET /employees/:id/salary-history
GET /employees/:id/purchases
```

---

# 34. SUELDOS

```text
GET  /payroll
POST /payroll
GET  /payroll/:id

POST /payroll/:id/calculate
POST /payroll/:id/approve
POST /payroll/:id/pay
```

---

# 35. FACTURACIÓN

La facturación debe estar desacoplada del resto de la aplicación.

```text
POST /invoices
GET  /invoices
GET  /invoices/:id
POST /invoices/:id/authorize
```

El backend no debe depender directamente de llamadas específicas a ARCA en cada módulo.

Debe utilizar:

```text
FiscalProvider
      │
      ▼
ARCAAdapter
      │
      ▼
WSFEv1 / servicio correspondiente
```

---

# 36. REPORTES

Los reportes pueden utilizar endpoints especializados:

```text
GET /reports/sales
GET /reports/products
GET /reports/inventory
GET /reports/stock-rotation
GET /reports/purchases
GET /reports/transfers
GET /reports/cash
GET /reports/treasury
GET /reports/reservations
GET /reports/marketing-loans
GET /reports/exchanges
GET /reports/employees
GET /reports/invoices
```

Los reportes no deben alterar datos.

---

# 37. EXPORTACIONES

Las exportaciones grandes no deberían bloquear el request HTTP.

Para datos pequeños:

```text
GET /reports/sales/export?format=csv
```

Para exportaciones grandes:

```text
POST /exports
```

Resultado:

```text
{
  "id": "...",
  "status": "PROCESSING"
}
```

Posteriormente:

```text
GET /exports/:id
```

Estados:

```text
PENDING
PROCESSING
COMPLETED
FAILED
CANCELLED
```

---

# 38. FORMATO DE RESPUESTA

Las respuestas deben mantener una estructura consistente.

Ejemplo:

```json
{
  "data": {
    "id": "sale_123",
    "status": "PENDING_PAYMENT"
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Para listas:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "total": 125
  }
}
```

---

# 39. ERRORES DE API

Los errores deben tener estructura consistente.

Ejemplo:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "No hay stock disponible para completar la operación.",
    "details": {
      "variantId": "variant_123",
      "available": 1,
      "requested": 3
    },
    "requestId": "req_123"
  }
}
```

Los códigos deben ser estables.

Ejemplos:

```text
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
INVALID_STATE
INSUFFICIENT_STOCK
INSUFFICIENT_FUNDS
PAYMENT_TOTAL_MISMATCH
DUPLICATE_OPERATION
CONCURRENCY_CONFLICT
INVALID_BRANCH_SCOPE
INVALID_POS
CASH_REGISTER_CLOSED
INVOICE_AUTHORIZATION_FAILED
```

El frontend puede traducir los códigos a mensajes amigables.

---

# 40. AUTENTICACIÓN

El sistema debe utilizar autenticación real en producción.

El mecanismo exacto podrá definirse durante implementación, pero debe existir:

```text
Identity
    │
    ▼
Authentication
    │
    ▼
Authorization
    │
    ▼
Company Scope
    │
    ▼
Branch Scope
    │
    ▼
Operation
```

---

# 41. AUTORIZACIÓN

RBAC como base:

```text
ADMIN
OWNER
MANAGER
CASHIER
SELLER
WAREHOUSE
TREASURY
ACCOUNTING
HR
AUDITOR
```

Puede complementarse posteriormente con permisos granulares.

Ejemplo:

```text
sales.create
sales.finalize
sales.cancel

cash.open
cash.close
cash.cash_in
cash.cash_out

inventory.view
inventory.adjust

transfers.create
transfers.approve
transfers.dispatch
transfers.receive

employees.view
employees.manage
payroll.approve
```

---

# 42. SCOPE MULTISUCURSAL

Cada request debe tener un contexto de organización.

Conceptualmente:

```text
Company
   │
   ├── Branch A
   │     ├── POS 1
   │     ├── POS 2
   │     └── Cash Register
   │
   ├── Branch B
   │     ├── POS 1
   │     ├── POS 2
   │     └── Cash Register
   │
   └── Warehouse
```

El backend debe impedir que un usuario de una sucursal acceda arbitrariamente a otra.

Nunca confiar únicamente en:

```text
branchId enviado por frontend
```

El backend debe comprobar que el usuario tiene autorización sobre ese branch.

---

# 43. POS Y CAJA

La arquitectura debe conservar esta separación:

```text
POS
 │
 └── registra operación de venta

CAJA
 │
 └── recibe/finaliza pago
```

Una sucursal puede tener:

```text
1 CashRegister
+
2–3 POS
```

No debe existir una caja independiente por POS salvo que el negocio posteriormente lo requiera.

---

# 44. TRANSACCIONES

Las operaciones críticas deben utilizar transacciones de base de datos.

Ejemplo:

```text
Finalizar venta
      │
      ▼
BEGIN TRANSACTION
      │
      ├── validate sale
      ├── validate stock
      ├── validate payments
      ├── create payments
      ├── create stock movements
      ├── update inventory
      ├── create financial movements
      ├── create invoice record
      ├── create audit log
      │
      ▼
COMMIT
```

Si cualquier operación crítica falla:

```text
ROLLBACK
```

No debe quedar:

```text
venta pagada
pero stock sin descontar
```

o:

```text
stock descontado
pero pago inexistente
```

---

# 45. CONCURRENCIA

El sistema debe asumir múltiples usuarios simultáneos.

Ejemplo:

```text
Seller A ─┐
          ├──> mismo producto
Seller B ─┘
```

No se debe confiar únicamente en:

```text
leer stock
verificar stock
actualizar stock
```

sin protección.

Debe utilizarse una estrategia transaccional adecuada para evitar overselling.

---

# 46. IDEMPOTENCIA

Las operaciones críticas deben poder protegerse contra doble ejecución.

Ejemplo:

```text
POST /sales/sale_123/finalize
```

Si el navegador reintenta la petición, no debe crear:

```text
2 pagos
2 movimientos financieros
2 movimientos de stock
2 facturas
```

Debe utilizarse un mecanismo de idempotency key u operación equivalente.

Ejemplo:

```text
Idempotency-Key: 8e5...
```

El backend debe registrar la operación.

---

# 47. OPERATION ID

Toda operación crítica debe poder correlacionarse.

Ejemplo:

```text
operationId
requestId
auditId
referenceType
referenceId
```

Esto permite reconstruir:

```text
Venta
  ↓
Pago
  ↓
Movimiento financiero
  ↓
Movimiento stock
  ↓
Factura
  ↓
Auditoría
```

---

# 48. STOCK

El principio arquitectónico del inventario es:

> **El stock no se edita; el stock cambia como consecuencia de movimientos trazables.**

La arquitectura debe diferenciar:

```text
Inventory
```

de:

```text
StockMovement
```

Inventory representa estado actual.

StockMovement representa historia.

Ejemplo:

```text
Inventory
quantity = 15
```

y:

```text
StockMovement
PURCHASE_RECEIPT +20
SALE -2
TRANSFER_OUT -3
```

---

# 49. DINERO

Misma filosofía:

> **El dinero no se corrige modificando un saldo arbitrariamente; se registra mediante movimientos financieros trazables.**

Las cuentas pueden calcular:

```text
balance
available
inTransit
retained
```

pero la fuente histórica es:

```text
FinancialMovement
```

---

# 50. AUDITORÍA

Toda operación crítica debe generar evidencia.

Ejemplo:

```text
User
Action
Entity
EntityId
Branch
Timestamp
OperationId
Before
After
Reason
Reference
```

La auditoría debe generarse desde backend.

Nunca depender de que el frontend envíe:

```text
"createdBy": "user123"
```

como única fuente de identidad.

---

# 51. INTEGRACIONES EXTERNAS

Las integraciones deben estar aisladas.

Estructura:

```text
integrations/

├── arca/
│   ├── FiscalProvider
│   ├── ARCAAdapter
│   └── ...
│
├── payments/
│
└── messaging/
```

El dominio no debería conocer detalles técnicos de proveedores externos.

---

# 52. ARCA

La aplicación debe trabajar contra una interfaz abstracta.

Ejemplo conceptual:

```ts
interface FiscalProvider {
  authorizeInvoice(input: InvoiceAuthorizationInput):
    Promise<InvoiceAuthorizationResult>;
}
```

Implementación:

```text
FiscalProvider
      │
      ▼
ARCAAdapter
      │
      ▼
ARCA / WSFEv1
```

Esto permite:

```text
Demo
  → MockFiscalProvider

Producción
  → ARCAFiscalProvider
```

sin cambiar el módulo de ventas.

---

# 53. FACTURACIÓN SIMULADA EN DEMO

Durante demo:

```text
MockFiscalProvider
```

puede devolver:

```text
CAE: DEMO-123456
```

Pero la interfaz debe mostrar claramente:

```text
CAE DEMO / SIMULADO
```

y:

```text
COMPROBANTE DEMOSTRATIVO
SIN VALIDEZ FISCAL
```

Nunca presentar un comprobante simulado como fiscal real.

---

# 54. PAGOS

El dominio debe separar:

```text
PaymentMethod
```

de:

```text
FinancialAccount
```

Ejemplo:

```text
PaymentMethod:
TRANSFERENCIA

FinancialAccount:
Banco Macro - Cuenta Corriente
```

Otro:

```text
PaymentMethod:
QR

FinancialAccount:
Mercado Pago
```

Esto permite registrar correctamente dónde terminó el dinero.

---

# 55. REPORTES

Los reportes deben consultar información persistida.

No deben depender exclusivamente del estado visual del frontend.

Ejemplo:

```text
Ventas
  ↓
Sale
  ↓
SaleItems
  ↓
Payments
  ↓
FinancialMovements
  ↓
Reports
```

Y:

```text
Inventory
  ↓
StockMovements
  ↓
Rotation
  ↓
Replenishment
```

---

# 56. CACHÉ

Redis no será requisito inicial.

Debe incorporarse únicamente cuando exista una necesidad real.

Posibles usos futuros:

* sesiones;
* cache;
* rate limiting distribuido;
* jobs;
* locks;
* eventos;
* realtime.

La base de datos sigue siendo la fuente de verdad.

---

# 57. TRABAJOS ASÍNCRONOS

Los jobs podrán utilizarse posteriormente para:

* exports;
* reportes pesados;
* notificaciones;
* sincronizaciones;
* tareas de facturación;
* procesamiento de archivos;
* operaciones externas lentas.

Arquitectura:

```text
API
 │
 ▼
Queue
 │
 ▼
Worker
 │
 ▼
External Service / DB
```

No incorporar un sistema de colas complejo si la demo no lo necesita.

---

# 58. LOGGING

Los logs técnicos deben diferenciarse de la auditoría.

### Application Log

Sirve para:

* errores;
* debugging;
* performance;
* requests;
* infraestructura.

### Audit Log

Sirve para:

* quién hizo qué;
* cuándo;
* sobre qué entidad;
* desde qué contexto;
* qué cambió;
* por qué.

No son lo mismo.

---

# 59. REQUEST ID

Cada request debe tener un identificador.

Ejemplo:

```text
X-Request-Id
```

o equivalente.

Esto permite buscar:

```text
Request
  ↓
Service
  ↓
Database
  ↓
Integration
  ↓
Audit
```

---

# 60. CONFIGURACIÓN

Nunca hardcodear:

```text
passwords
API keys
tokens
certificados
credenciales ARCA
URLs sensibles
```

Usar variables de entorno.

Ejemplo:

```text
NODE_ENV=
DATABASE_URL=

AUTH_SECRET=

ARCA_ENVIRONMENT=
ARCA_CUIT=
ARCA_CERT_PATH=
ARCA_KEY_PATH=

CORS_ORIGIN=
```

---

# 61. `.env.example`

El repositorio debe incluir:

```text
.env.example
```

sin secretos reales.

Ejemplo:

```text
DATABASE_URL=
NODE_ENV=development

AUTH_SECRET=

ARCA_ENVIRONMENT=demo

CORS_ORIGIN=http://localhost:5173
```

---

# 62. CONFIGURACIÓN POR ENTORNO

Debe existir separación conceptual:

```text
Development
Demo
Staging
Production
```

Nunca reutilizar automáticamente:

```text
credenciales productivas
```

en:

```text
demo
```

---

# 63. MIGRACIONES

Prisma migrations será el mecanismo para evolución del esquema.

Flujo:

```text
Modificar schema
      ↓
Crear migration
      ↓
Revisar migration
      ↓
Aplicar
      ↓
Tests
```

No modificar manualmente la base de producción sin procedimiento controlado.

---

# 64. SEED

Debe existir un seed para entorno de desarrollo/demo.

Debe poder crear:

```text
Company
Branches
Warehouse
Users
Roles
Permissions
Products
Variants
Prices
Inventory
Suppliers
Financial Accounts
Cash Registers
POS
Customers
Demo sales
Demo reservations
Demo transfers
```

Los datos de demo deben ser claramente ficticios.

---

# 65. DATOS DEMO

Ejemplo:

```text
Empresa Demo
Sucursal Centro
Sucursal Shopping
Depósito Central
```

Productos:

```text
Remera Básica
Campera Urbana
Jean Classic
Vestido Casual
```

Variantes:

```text
Negro / S
Negro / M
Negro / L
Azul / M
```

---

# 66. API VERSIONING

La API debe utilizar versionado.

Inicialmente:

```text
/api/v1
```

Esto permitirá evolucionar contratos sin romper inmediatamente clientes anteriores.

---

# 67. VALIDACIÓN DE INPUTS

Toda entrada externa debe validarse.

Fuentes:

```text
body
params
query
headers
files
webhooks
```

La validación debe ejecutarse en backend.

Puede centralizarse en:

```text
packages/validation
```

utilizando una librería de validación runtime apropiada.

---

# 68. TYPES VS VALIDATION

Los tipos TypeScript no sustituyen validación runtime.

Esto:

```ts
type CreateSaleInput = {
  customerId?: string;
}
```

no protege contra un request HTTP malicioso.

Se necesita:

```text
TypeScript
+
Runtime Validation
```

---

# 69. SHARED TYPES

`packages/types` puede contener:

* tipos compartidos;
* DTOs;
* enums;
* contratos.

Pero no debe convertirse en un lugar donde se coloque toda la lógica del negocio.

---

# 70. SHARED VALIDATION

`packages/validation` puede contener schemas reutilizables.

Ejemplo:

```text
CreateSaleSchema
PaymentSchema
CreateTransferSchema
CreateReservationSchema
ProductVariantSchema
```

El backend debe utilizar estos schemas.

El frontend puede reutilizarlos para mejorar UX.

La validación definitiva sigue siendo responsabilidad del backend.

---

# 71. SHARED CONFIG

`packages/config` puede centralizar:

* constantes;
* configuraciones comunes;
* nombres de eventos;
* límites;
* feature flags.

No debe contener secretos.

---

# 72. CONVENCIONES DE CÓDIGO

Se debe utilizar:

```text
TypeScript strict
ESLint
Prettier
```

Convenciones:

```text
camelCase
PascalCase
UPPER_SNAKE_CASE
```

según el tipo de elemento.

Ejemplo:

```text
FinalizeSaleService
saleId
PAYMENT_IN_PROGRESS
```

---

# 73. NOMENCLATURA DE DOMINIO

La terminología del código debe mantener la terminología definida en los documentos funcionales.

Ejemplos:

```text
Sale
Payment
CashRegister
CashRegisterSession
FinancialAccount
FinancialMovement
Reservation
MarketingLoan
ReturnExchange
Transfer
Remit
PurchaseReceipt
Invoice
AuditLog
```

No crear sinónimos innecesarios.

Por ejemplo, no utilizar:

```text
Order
Transaction
Ticket
Movement
```

si en el dominio ya existe una definición específica para:

```text
Sale
FinancialMovement
Transfer
```

---

# 74. ESTADOS

Los estados deben centralizarse.

No utilizar strings arbitrarios repartidos por el código.

Ejemplo:

```ts
SaleStatus.PENDING_PAYMENT
SaleStatus.PAID
SaleStatus.CANCELLED
```

La transición debe pasar por lógica de dominio.

No:

```ts
sale.status = "PAID";
```

desde cualquier parte.

---

# 75. REGLAS DE TRANSICIÓN

Las transiciones deben estar alineadas con:

`23_ESTADOS_Y_TRANSICIONES.md`

Ejemplo:

```text
PENDING_PAYMENT
      │
      ▼
PAYMENT_IN_PROGRESS
      │
      ▼
PAID
      │
      ▼
COMPLETED
```

Una transición inválida debe producir:

```text
INVALID_STATE
```

---

# 76. SEPARACIÓN ENTRE CRUD Y CASOS DE USO

CRUD es adecuado para:

```text
Products
Branches
Customers
Suppliers
```

Pero las operaciones críticas deben utilizar casos de uso.

Ejemplo:

```text
CreateSale
FinalizeSale
ReceiveTransfer
CloseCashRegister
PickupReservation
CompleteExchange
PaySalary
AuthorizeInvoice
```

---

# 77. REGLA DE ORO PARA OPERACIONES CRÍTICAS

Toda operación crítica debe poder responder:

1. ¿Quién la ejecutó?
2. ¿Dónde?
3. ¿Cuándo?
4. ¿Sobre qué entidad?
5. ¿Qué estado tenía antes?
6. ¿Qué estado quedó?
7. ¿Qué dinero cambió?
8. ¿Qué stock cambió?
9. ¿Qué documento la respalda?
10. ¿Qué auditoría la registra?

Si no puede responder estas preguntas, la implementación está incompleta.

---

# 78. ARQUITECTURA DE UNA VENTA COMPLETA

Ejemplo:

```text
SELLER
  │
  ▼
Create Sale
  │
  ▼
PENDING_PAYMENT
  │
  ▼
CASHIER
  │
  ▼
Register Payments
  │
  ▼
Validate Total
  │
  ▼
Finalize Sale
  │
  ├──────────────┐
  │              │
  ▼              ▼
Stock         Financial
Movement      Movement
  │              │
  └──────┬───────┘
         ▼
       Invoice
         │
         ▼
       Audit
         │
         ▼
     COMPLETED
```

Todo debe ejecutarse de manera consistente.

---

# 79. ARQUITECTURA DE TRANSFERENCIA

```text
Request
   ↓
Approval
   ↓
Preparation
   ↓
Picking
   ↓
Remit
   ↓
Dispatch
   ↓
TRANSFER_OUT
   ↓
IN_TRANSIT
   ↓
Branch Receipt
   ↓
TRANSFER_IN
   ↓
Audit
```

El stock de origen y destino debe reflejar correctamente cada etapa.

---

# 80. ARQUITECTURA DE COMPRA

```text
Supplier
   ↓
Purchase Order
   ↓
Approval
   ↓
Purchase Receipt
   ↓
Control
   ↓
Received Quantity
   ↓
Stock Movement
   ↓
Inventory
   ↓
Supplier Invoice
   ↓
Financial Obligation
   ↓
Payment
```

Compra, recepción y pago no deben confundirse.

---

# 81. ARQUITECTURA DE RESERVA

```text
Customer
   ↓
Reservation
   ↓
Reserve Stock
   ↓
Deposit Payment
   ↓
RESERVED
   │
   ├── Pickup → Sale
   │
   ├── Cancel → Release Stock
   │
   └── Expire → Release Stock
```

La seña no debe producir doble movimiento de stock.

---

# 82. ARQUITECTURA DE PRÉSTAMO

```text
Product
   ↓
Marketing Loan
   ↓
MARKETING_LOAN
   ↓
Unavailable for Sale
   │
   ├── Return
   ├── Damage
   ├── Missing
   └── Sold
```

Si se vende:

```text
Loan
   ↓
Sale
```

sin descontar dos veces el stock.

---

# 83. ARQUITECTURA DE CAMBIO

```text
Original Sale
      ↓
ReturnExchange
      │
      ├── Product OUT
      ├── Product IN
      └── Difference
             │
             ├── Additional Payment
             └── Refund
```

La venta original no se modifica destructivamente.

---

# 84. FRONTEND → BACKEND

El frontend no debe intentar implementar operaciones críticas localmente.

Incorrecto:

```text
Frontend:
stock--
cash++
sale.status = PAID
```

Correcto:

```text
Frontend:
POST /sales/:id/finalize

Backend:
validate
transaction
persist
audit

Frontend:
refresh state
```

---

# 85. ESTADO CLIENTE

El frontend puede utilizar:

* React state;
* Context cuando sea apropiado;
* store global cuando exista necesidad;
* query/cache library para server state.

Debe distinguir:

```text
UI state
```

de:

```text
Server state
```

El estado persistente del negocio pertenece al backend.

---

# 86. CACHE Y SERVER STATE

Datos como:

```text
products
inventory
sales
reports
```

deben considerarse server state.

El frontend puede cachearlos, pero el cache no es la fuente de verdad.

Después de una operación crítica:

```text
mutation
   ↓
server confirms
   ↓
invalidate/refetch
```

---

# 87. OFFLINE

El sistema no debe asumir soporte offline completo en la primera versión.

POS offline es una problemática considerable porque implica:

* sincronización;
* conflictos;
* idempotencia;
* numeración;
* stock;
* pagos;
* facturación.

Por lo tanto:

> Offline POS queda fuera del alcance inicial salvo decisión explícita del negocio.

---

# 88. ARCHIVOS Y DOCUMENTOS

Los documentos adjuntos deberán utilizar una abstracción de storage.

Ejemplo:

```text
StorageProvider
      │
      ├── LocalStorageProvider
      └── CloudStorageProvider
```

Posibles documentos:

* facturas;
* remitos;
* comprobantes;
* archivos de proveedores;
* documentación interna.

No acoplar el dominio a una ruta local específica.

---

# 89. WEBHOOKS

Los webhooks externos deben:

1. validar autenticidad;
2. validar estructura;
3. registrar request;
4. comprobar idempotencia;
5. procesar operación;
6. registrar resultado.

No aceptar directamente:

```text
POST /webhook
```

y modificar dinero o stock sin verificación.

---

# 90. SEGURIDAD TÉCNICA

La arquitectura debe cumplir con:

* HTTPS;
* autenticación;
* autorización;
* validación;
* rate limiting;
* CORS controlado;
* headers de seguridad;
* manejo seguro de secretos;
* protección contra IDOR;
* logs;
* auditoría;
* backups;
* control de dependencias.

El detalle completo pertenece a:

`26_SEGURIDAD.md`

---

# 91. OBSERVABILIDAD

Producción debe poder responder:

```text
¿La API está funcionando?
¿La DB responde?
¿Hay errores?
¿Cuánto tarda una operación?
¿ARCA está respondiendo?
¿Hay operaciones fallidas?
```

Se recomienda implementar:

```text
health check
readiness check
structured logging
requestId
error tracking
basic metrics
```

---

# 92. HEALTH CHECK

Ejemplo:

```text
GET /health
```

Respuesta conceptual:

```json
{
  "status": "ok"
}
```

Readiness:

```text
GET /ready
```

puede verificar:

```text
API
DB
dependencias críticas
```

---

# 93. TESTING COMO PARTE DE ARQUITECTURA

La arquitectura debe ser testeable.

Servicios como:

```text
FinalizeSaleService
CloseCashRegisterService
ReceiveTransferService
PickupReservationService
CompleteExchangeService
```

deben poder probarse sin levantar todo el sistema.

El detalle de testing está definido en:

`28_TESTING_QA_Y_DEFINITION_OF_DONE.md`

---

# 94. SEGREGACIÓN DE RESPONSABILIDADES

No debe existir un único:

```text
GodService
```

que maneje:

```text
ventas
stock
caja
empleados
ARCA
reportes
```

Cada dominio debe mantener límites claros.

---

# 95. DEPENDENCIAS ENTRE MÓDULOS

Las dependencias deben ser explícitas.

Ejemplo:

```text
Sales
 ├── Products
 ├── Inventory
 ├── Payments
 ├── Cash
 ├── Treasury
 └── Invoicing
```

Pero:

```text
Reports
```

principalmente consume datos y no debe modificar los dominios operativos.

---

# 96. PRINCIPIO DE FUENTE DE VERDAD

Cada información debe tener una fuente de verdad.

Ejemplo:

| Información       | Fuente                             |
| ----------------- | ---------------------------------- |
| Stock actual      | Inventory                          |
| Historia de stock | StockMovement                      |
| Venta             | Sale                               |
| Pago              | Payment                            |
| Dinero            | FinancialMovement                  |
| Cuenta            | FinancialAccount                   |
| Caja              | CashRegisterSession + CashMovement |
| Reserva           | Reservation                        |
| Préstamo          | MarketingLoan                      |
| Factura           | Invoice                            |
| Auditoría         | AuditLog                           |

No duplicar información crítica innecesariamente.

---

# 97. NO DUPLICAR LÓGICA

No implementar:

```text
calculateSaleTotal()
```

en:

```text
frontend
backend
report
invoice
```

de forma independiente.

Debe existir una definición común de la lógica.

La misma regla debe producir el mismo resultado.

---

# 98. PRECISIÓN DE TOTALES

Una venta debe mantener:

```text
subtotal
discount
total
paid
balance
change
```

con reglas claras.

El backend debe calcular el resultado definitivo.

No confiar en:

```text
total enviado por frontend
```

como autoridad.

El backend debe reconstruir/calcular cuando corresponda.

---

# 99. SEGURIDAD CONTRA MANIPULACIÓN

El backend debe ignorar campos sensibles enviados por usuarios sin autorización.

Ejemplo:

```json
{
  "price": 1000,
  "discount": 90,
  "approvedBy": "admin"
}
```

No significa que el usuario tenga permiso para:

```text
price
discount
approvedBy
```

El backend determina qué campos puede establecer cada rol.

---

# 100. CONTROL DE EMPRESA Y SUCURSAL

Toda query sensible debe respetar scope.

Conceptualmente:

```text
WHERE companyId = currentUser.companyId
```

y cuando corresponda:

```text
AND branchId IN allowedBranches
```

Nunca aceptar un:

```text
companyId
```

arbitrario desde frontend como fuente de autoridad.

---

# 101. BORRADO DE DATOS

Las operaciones históricas importantes no deben eliminarse físicamente.

Preferir:

```text
isActive
deletedAt
status
```

según el caso.

Nunca eliminar una venta finalizada simplemente porque el usuario presionó:

```text
Eliminar
```

Las correcciones deben realizarse mediante operaciones compensatorias.

---

# 102. INTEGRIDAD REFERENCIAL

Las relaciones críticas deben tener foreign keys.

Ejemplo:

```text
SaleItem → Sale
SaleItem → ProductVariant
Payment → Sale
StockMovement → ProductVariant
StockMovement → Location
FinancialMovement → FinancialAccount
AuditLog → Entity/reference
```

No permitir referencias huérfanas.

---

# 103. ÍNDICES

Se deben crear índices sobre campos consultados frecuentemente.

Ejemplos:

```text
companyId
branchId
status
createdAt
sku
barcode
productVariantId
saleId
reservationId
supplierId
financialAccountId
operationId
requestId
```

Los índices definitivos se validarán según queries reales.

---

# 104. PAGINACIÓN

Las listas potencialmente grandes deben estar paginadas.

Ejemplo:

```text
GET /sales?page=1&pageSize=25
```

No devolver:

```text
100.000 ventas
```

en un request normal.

---

# 105. FILTROS

Los endpoints de consulta deben soportar filtros relevantes.

Ejemplo:

```text
GET /sales?
branchId=
status=
from=
to=
sellerId=
cashierId=
paymentMethod=
```

La lógica de filtros debe permanecer en backend.

---

# 106. PERFORMANCE

La optimización prematura está prohibida.

Primero:

```text
correctness
```

después:

```text
performance
```

La arquitectura debe permitir optimizar mediante:

* índices;
* queries;
* cache;
* pagination;
* async jobs;
* Redis;
* workers.

sin cambiar el dominio.

---

# 107. ESCALABILIDAD

La primera arquitectura debe poder crecer desde:

```text
1 empresa
5 sucursales
```

hasta:

```text
múltiples sucursales
múltiples usuarios
múltiples POS
```

sin rediseño fundamental.

El backend debe ser preferentemente stateless.

---

# 108. DEPLOYMENT

La arquitectura de producción será:

```text
Internet
   ↓
HTTPS
   ↓
Frontend
   ↓
API
   ↓
PostgreSQL
```

Opcional:

```text
Redis
Worker
Object Storage
Monitoring
```

El detalle pertenece a:

`27_INFRAESTRUCTURA_Y_DEPLOYMENT.md`

---

# 109. DOCKER

Producción podrá utilizar Docker para:

```text
API
PostgreSQL
Worker
Redis
```

según necesidad.

La demo puede utilizar una configuración más simple.

---

# 110. CI/CD

Se recomienda pipeline:

```text
Push
 ↓
Lint
 ↓
Typecheck
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Build
 ↓
Deploy Staging
 ↓
Smoke Tests
 ↓
Production Approval
 ↓
Production
```

Los cambios críticos no deben llegar directamente a producción sin validación.

---

# 111. MIGRACIONES EN PRODUCCIÓN

Las migraciones deben:

1. versionarse;
2. probarse;
3. revisarse;
4. ejecutarse controladamente;
5. permitir rollback operativo cuando sea posible.

Importante:

> rollback de código no siempre equivale a rollback de datos.

Los cambios destructivos deben tratarse con especial cuidado.

---

# 112. BACKUPS

La arquitectura productiva debe contemplar:

```text
database backup
backup verification
restore procedure
retention policy
```

No considerar:

```text
"tenemos backup"
```

suficiente.

Debe comprobarse que el backup pueda restaurarse.

---

# 113. RECUPERACIÓN

El sistema debe poder recuperarse de:

* caída de API;
* reinicio de servidor;
* fallo de base de datos;
* error de integración;
* timeout externo;
* despliegue fallido.

Las operaciones deben diseñarse para soportar retries sin duplicaciones.

---

# 114. MANEJO DE TIMEOUTS EXTERNOS

Las integraciones externas pueden fallar.

Ejemplo:

```text
API
 ↓
ARCA
 ↓
timeout
```

No asumir automáticamente:

```text
factura rechazada
```

Debe existir una estrategia para distinguir:

```text
REJECTED
UNKNOWN
RETRYABLE
AUTHORIZED
```

según la respuesta real de la integración.

---

# 115. RETRIES

Los retries solo deben aplicarse a operaciones seguras.

Nunca repetir ciegamente:

```text
payment
invoice
financial movement
```

sin idempotencia.

---

# 116. TRANSACCIONES + INTEGRACIONES EXTERNAS

No asumir que una transacción PostgreSQL puede incluir una llamada externa de forma atómica.

Ejemplo:

```text
DB transaction
   +
ARCA
```

son sistemas diferentes.

La arquitectura debe contemplar estados intermedios.

Ejemplo:

```text
INVOICE_PENDING_AUTHORIZATION
```

antes de:

```text
AUTHORIZED
```

o:

```text
AUTHORIZATION_FAILED
```

---

# 117. ESTADOS DE INTEGRACIÓN

Toda integración importante debe registrar:

```text
request
attempt
provider
status
externalId
response
error
timestamp
```

Esto permite diagnosticar fallos.

---

# 118. CONFIGURACIÓN DE DEMO

La demo puede activar:

```text
DEMO_MODE=true
```

y utilizar:

```text
MockFiscalProvider
MockPaymentProvider
DemoDataSeeder
```

Pero el código debe evitar mezclas como:

```ts
if (demo) {
   // 400 líneas
} else {
   // 400 líneas
}
```

Preferir interfaces y adapters.

---

# 119. FEATURE FLAGS

Las funcionalidades incompletas pueden ocultarse mediante feature flags.

Ejemplo:

```text
arca.real.enabled=false
employee.payroll.enabled=true
offline.pos.enabled=false
```

Los flags deben estar centralizados.

---

# 120. ESTRATEGIA DE IMPLEMENTACIÓN

El orden recomendado es:

## Fase 1 — Foundation

```text
Monorepo
TypeScript
Vite
Express
Prisma
PostgreSQL
Config
Validation
Error handling
Logging
```

## Fase 2 — Identity

```text
Users
Roles
Permissions
Company
Branches
POS
Cash Registers
```

## Fase 3 — Products

```text
Products
Variants
Prices
Inventory
Stock movements
```

## Fase 4 — Warehouse

```text
Suppliers
Purchases
Receipts
Transfers
Remitos
```

## Fase 5 — Sales

```text
Sales
POS
Payments
Cash
Treasury
```

## Fase 6 — Advanced Operations

```text
Reservations
Marketing Loans
Exchanges
Employees
Payroll
Employee Sales
```

## Fase 7 — Fiscal

```text
Invoice
FiscalProvider
ARCAAdapter
```

## Fase 8 — Reporting

```text
Dashboard
Reports
Exports
Audit
```

## Fase 9 — Hardening

```text
Security
Testing
Performance
Backups
Deployment
Monitoring
```

---

# 121. ORDEN DE IMPLEMENTACIÓN DE LA DEMO

Para la semana de demo:

### Día 1

```text
Shell
Layout
Navigation
Dashboard
Login simulation
Branches
Users
```

### Día 2

```text
Products
Variants
Prices
Inventory
Warehouse
```

### Día 3

```text
Purchases
Transfers
Remitos
Branch reception
```

### Día 4

```text
POS
Sales
Cashier
Payments
Cash
```

### Día 5

```text
Reservations
Marketing loans
Exchanges
Employees
```

### Día 6

```text
Reports
Audit
Simulated ARCA
Demo polish
```

### Día 7

```text
End-to-end testing
UX fixes
Demo data
Bug fixing
Client presentation
```

---

# 122. DEMO END-TO-END

La demo principal debe contar una historia completa:

```text
1. Depósito recibe mercadería
        ↓
2. Controla cantidades
        ↓
3. Crea etiquetas
        ↓
4. Prepara transferencia
        ↓
5. Genera remito
        ↓
6. Despacha
        ↓
7. Sucursal recibe
        ↓
8. Stock aumenta
        ↓
9. Vendedor crea venta
        ↓
10. Venta pasa a PENDING_PAYMENT
        ↓
11. Cajero recibe venta
        ↓
12. Registra pago combinado
        ↓
13. Finaliza venta
        ↓
14. Stock disminuye
        ↓
15. Caja/tesorería se actualiza
        ↓
16. Factura demo
        ↓
17. Auditoría registra todo
        ↓
18. Reporte muestra resultado
```

Este flujo debe ser el principal criterio para evaluar si la arquitectura funciona.

---

# 123. DEFINITION OF DONE DEL BACKEND

Una funcionalidad crítica no está terminada si únicamente:

```text
aparece en pantalla.
```

Debe cumplir:

* endpoint;
* validación;
* autorización;
* regla de negocio;
* persistencia;
* transacción cuando corresponda;
* manejo de errores;
* estados;
* auditoría;
* idempotencia cuando corresponda;
* tests;
* respuesta consistente.

---

# 124. DEFINITION OF DONE DEL FRONTEND

Una pantalla no está terminada si únicamente:

```text
se ve bonita.
```

Debe tener:

* loading;
* empty state;
* error state;
* success state;
* validación;
* permisos;
* feedback;
* navegación;
* responsive básico;
* integración API;
* confirmaciones para acciones destructivas;
* prevención de acciones inválidas.

---

# 125. DEFINITION OF DONE DE UNA OPERACIÓN FINANCIERA

Debe poder responder:

```text
¿Quién?
¿Dónde?
¿Cuándo?
¿Cuánto?
¿Método?
¿Cuenta?
¿Origen?
¿Destino?
¿Referencia?
¿Aprobación?
¿Auditoría?
```

---

# 126. DEFINITION OF DONE DE STOCK

Debe poder responder:

```text
¿Cuánto stock hay?
¿Dónde?
¿De qué variante?
¿Por qué cambió?
¿Quién lo cambió?
¿Cuándo?
¿Qué documento originó el movimiento?
```

---

# 127. DEFINITION OF DONE DE UNA VENTA

Debe existir:

```text
Sale
SaleItems
Payment(s)
StockMovement(s)
FinancialMovement(s)
Invoice si corresponde
AuditLog
```

y todo debe quedar consistente.

---

# 128. REGLAS NO NEGOCIABLES

## Regla 1

> Frontend no es autoridad de negocio.

## Regla 2

> Stock no se edita arbitrariamente.

## Regla 3

> Dinero no se edita arbitrariamente.

## Regla 4

> Venta y pago son conceptos distintos.

## Regla 5

> POS y Caja son conceptos distintos.

## Regla 6

> Compra, recepción y pago a proveedor son operaciones distintas.

## Regla 7

> Reserva y venta son operaciones distintas.

## Regla 8

> Préstamo de publicidad no es venta.

## Regla 9

> Cambio/devolución no modifica destructivamente la venta original.

## Regla 10

> Factura no es lo mismo que venta.

## Regla 11

> Toda operación crítica debe ser auditable.

## Regla 12

> Toda operación crítica debe respetar permisos.

## Regla 13

> Toda operación crítica debe respetar sucursal/empresa.

## Regla 14

> Toda operación crítica debe respetar estados.

## Regla 15

> Las operaciones críticas deben ser resistentes a reintentos.

---

# 129. QUÉ NO HACER

No construir:

```text
Microservices
```

desde el inicio sin necesidad.

No introducir:

```text
Redis
Kafka
RabbitMQ
Kubernetes
WebSockets
```

solo porque son tecnologías conocidas.

No implementar:

```text
ARCA real
```

en la primera demo.

No crear:

```text
29_UX_UI.md
30_MONOREPO.md
31_API.md
```

porque estos aspectos ya están absorbidos por:

```text
25_ARQUITECTURA_TECNICA.md
28_TESTING_QA_Y_DEFINITION_OF_DONE.md
```

No duplicar reglas de negocio en frontend.

No modificar directamente balances.

No modificar directamente stock.

No crear endpoints que permitan saltarse las reglas de negocio.

---

# 130. RELACIÓN CON LOS OTROS MÓDULOS

Este módulo depende conceptualmente de:

```text
01 → visión
02 → roles
03 → empresa/sucursales/POS
04 → productos
05 → inventario
06 → depósito
07 → compras
08 → transferencias
09 → ventas
10 → cajas
11 → tesorería
12 → cuentas financieras
13 → pagos
14 → reservas
15 → préstamos
16 → cambios
17 → empleados
18 → ventas empleados
19 → ARCA
20 → reportes
21 → auditoría
22 → reglas de negocio
23 → estados
24 → modelo de datos
```

Y alimenta directamente:

```text
26 → seguridad
27 → infraestructura/deployment
28 → testing/QA
```

---

# 131. RELACIÓN CON `AGENTS.md`

`AGENTS.md` será el documento operativo para agentes de desarrollo, incluyendo OpenCode.

Debe indicar:

* arquitectura;
* reglas críticas;
* estructura del repositorio;
* comandos;
* convenciones;
* prohibiciones;
* flujo de trabajo;
* testing;
* Definition of Done.

`AGENTS.md` no es un módulo numerado.

Es una instrucción operativa del repositorio.

---

# 132. GUÍA PARA OPENCODE

OpenCode debe implementar el sistema respetando el siguiente flujo:

```text
1. Leer AGENTS.md
2. Leer documentación relevante
3. Identificar dominio afectado
4. Identificar entidades
5. Identificar estado actual
6. Identificar transición
7. Identificar permisos
8. Identificar impacto en stock
9. Identificar impacto financiero
10. Identificar auditoría
11. Implementar backend
12. Implementar frontend
13. Crear tests
14. Ejecutar tests
15. Revisar impacto cruzado
```

No debe comenzar modificando componentes visuales sin entender el dominio.

---

# 133. CHECKLIST ANTES DE IMPLEMENTAR UNA FEATURE

Antes de crear código, responder:

```text
[ ] ¿Qué módulo funcional la define?
[ ] ¿Qué entidad afecta?
[ ] ¿Qué usuario la ejecuta?
[ ] ¿Qué permiso necesita?
[ ] ¿En qué sucursal?
[ ] ¿Qué estado inicial tiene?
[ ] ¿Qué estado final produce?
[ ] ¿Modifica stock?
[ ] ¿Modifica dinero?
[ ] ¿Genera documento?
[ ] ¿Genera auditoría?
[ ] ¿Necesita transacción?
[ ] ¿Necesita idempotencia?
[ ] ¿Qué endpoint requiere?
[ ] ¿Qué errores puede producir?
[ ] ¿Qué tests necesita?
```

Si estas respuestas no están claras, no comenzar la implementación.

---

# 134. CHECKLIST DE REVISIÓN DE CÓDIGO

Antes de aceptar un Pull Request:

```text
[ ] TypeScript pasa
[ ] Lint pasa
[ ] Tests pasan
[ ] Validación backend existe
[ ] Authorization existe
[ ] Scope de sucursal validado
[ ] Estados respetados
[ ] Transacción utilizada cuando corresponde
[ ] Idempotencia considerada
[ ] Auditoría implementada
[ ] Stock consistente
[ ] Dinero consistente
[ ] Errores estructurados
[ ] No existen secretos
[ ] No hay lógica crítica duplicada
[ ] No se rompe otro módulo
```

---

# 135. CRITERIOS DE ACEPTACIÓN DEL MÓDULO

Este módulo se considera completo cuando:

### Arquitectura

* existe arquitectura frontend/backend;
* existe modular monolith;
* existe PostgreSQL/Prisma como objetivo;
* existe separación de dominios;
* existe estrategia de integración.

### API

* existe `/api/v1`;
* existen convenciones de endpoints;
* existen contratos de respuesta;
* existen contratos de error;
* existen acciones explícitas.

### Backend

* existe separación controller/service/persistence;
* existe validación;
* existe autorización;
* existe scope;
* existe manejo transaccional.

### Datos

* existe Prisma;
* existe PostgreSQL;
* existe estrategia de migrations;
* existe seed.

### Integraciones

* ARCA está desacoplado mediante provider/adapter;
* demo puede usar mock;
* producción puede utilizar implementación real.

### Calidad

* arquitectura testeable;
* logging;
* requestId;
* auditoría;
* idempotencia;
* manejo de concurrencia.

### Evolución

* demo puede convertirse en producción sin rediseñar el dominio;
* Redis/jobs/realtime pueden incorporarse posteriormente;
* deployment productivo queda definido en módulo 27.

---

# 136. PRINCIPIO FINAL

La arquitectura completa puede resumirse así:

```text
                    USUARIO
                       │
                       ▼
                  FRONTEND
                       │
                       ▼
                    REST API
                       │
                       ▼
                  AUTH + RBAC
                       │
                       ▼
              APPLICATION SERVICES
                       │
              ┌────────┼─────────┐
              ▼        ▼         ▼
            STOCK    DINERO    DOCUMENTOS
              │        │         │
              └────────┼─────────┘
                       ▼
                 TRANSACTION
                       │
                       ▼
                    PRISMA
                       │
                       ▼
                  POSTGRESQL
                       │
                       ▼
                    AUDIT
```

Y las integraciones externas:

```text
Application
     │
     ▼
Provider Interface
     │
     ├── Demo Mock
     │
     └── Production Adapter
              │
              └── External Service
```

La regla fundamental de toda la arquitectura es:

> **La interfaz puede cambiar. La infraestructura puede evolucionar. Los proveedores pueden cambiar. Pero las reglas de negocio, la trazabilidad, la integridad del stock y el control del dinero deben permanecer protegidos.**

---

# 137. ESTADO FINAL

Con este módulo queda definida la arquitectura técnica base para pasar de la documentación funcional a implementación.

La solución queda estructurada como:

```text
28 MÓDULOS FUNCIONALES Y TÉCNICOS
        +
CHANGELOG.md
        +
AGENTS.md
```

Sin módulos adicionales.

La arquitectura inicial será:

```text
React
+
TypeScript
+
Vite
+
Node.js
+
Express
+
Prisma
+
PostgreSQL
```

con:

```text
Modular Monolith
REST API
RBAC
Transactions
Idempotency
Audit
Stock Ledger
Financial Ledger
Provider/Adapter integrations
Testing
Docker
CI/CD
```

y con capacidad de incorporar posteriormente:

```text
Redis
Workers
Queues
Realtime
Cloud Storage
External Payment Providers
ARCA Production Integration
Advanced Observability
```

sin alterar la estructura fundamental del sistema.

**FIN DEL MÓDULO 25**
