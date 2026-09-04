# 30 — ESTRUCTURA DEL PROYECTO, MONOREPO Y CONVENCIONES DE CÓDIGO

## VM Digital Studio — Sistema de Gestión Multisucursal

**Versión:** 1.0
**Estado:** Arquitectura de desarrollo
**Clasificación:** Software Architecture / Repository / Code Standards
**Prioridad:** Crítica

---

# 1. OBJETIVO

Este documento define cómo debe organizarse físicamente el código del sistema.

La arquitectura debe permitir:

* desarrollar rápidamente la Demo;
* evolucionar hacia producción;
* mantener frontend y backend separados;
* compartir tipos y validaciones;
* evitar duplicación;
* aislar reglas de negocio;
* facilitar testing;
* facilitar el trabajo con OpenCode;
* incorporar nuevos desarrolladores posteriormente.

Principio:

> El proyecto debe ser fácil de entender antes de ser fácil de modificar.

---

# 2. STACK OBJETIVO

## Frontend

```text
React
TypeScript
Vite
React Router
TanStack Query
Zod
Tailwind CSS
```

## Backend

```text
Node.js
TypeScript
Express
Zod
Prisma
```

## Base de datos

```text
PostgreSQL
```

## Testing

```text
Vitest
Testing Library
Supertest
Playwright
```

Las versiones concretas deben fijarse mediante el `package.json` y lockfile del proyecto.

---

# 3. ARQUITECTURA GENERAL

```text
VMDS System
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── config/
│   └── utils/
│
├── prisma/
│
├── tests/
│
├── docs/
│
├── scripts/
│
└── infra/
```

---

# 4. MONOREPO

Se recomienda un monorepo.

Objetivo:

```text
Frontend
Backend
Shared packages
Database
Tests
Documentation
Infrastructure
```

en un mismo repositorio.

Ventajas:

* cambios coordinados;
* tipos compartidos;
* validaciones compartidas;
* CI centralizado;
* documentación junto al código;
* menor duplicación.

---

# 5. ESTRUCTURA COMPLETA

```text
vmds-management-system/
│
├── apps/
│   │
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── layouts/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── styles/
│   │   │   └── main.tsx
│   │   │
│   │   ├── public/
│   │   ├── tests/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── config/
│       │   ├── middleware/
│       │   ├── modules/
│       │   ├── routes/
│       │   ├── lib/
│       │   ├── integrations/
│       │   ├── jobs/
│       │   ├── app.ts
│       │   └── server.ts
│       │
│       ├── tests/
│       └── package.json
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
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── fixtures/
│
├── docs/
│
├── scripts/
│
├── infra/
│
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── README.md
└── AGENTS.md
```

---

# 6. PACKAGE MANAGER

Se recomienda utilizar:

```text
pnpm
```

con workspace.

Ejemplo:

```text
pnpm-workspace.yaml
```

```text
packages:
  - "apps/*"
  - "packages/*"
```

No mezclar:

```text
npm
yarn
pnpm
```

en el mismo proyecto.

---

# 7. ROOT PACKAGE.JSON

El root debe contener únicamente comandos globales.

Ejemplo conceptual:

```text
dev
build
test
lint
typecheck
format
db:migrate
db:seed
```

Los scripts específicos de cada aplicación permanecen dentro de su aplicación.

---

# 8. FRONTEND

```text
apps/web/src/
```

debe organizarse principalmente por features.

Ejemplo:

```text
features/
├── sales/
├── cash/
├── inventory/
├── warehouse/
├── purchases/
├── transfers/
├── reservations/
├── marketing-loans/
├── exchanges/
├── treasury/
├── employees/
├── invoicing/
├── reports/
└── administration/
```

---

# 9. ESTRUCTURA DE FEATURE FRONTEND

Ejemplo:

```text
features/sales/
│
├── components/
├── pages/
├── hooks/
├── api/
├── schemas/
├── types/
├── utils/
└── index.ts
```

Esto evita crear carpetas globales gigantescas.

---

# 10. EJEMPLO SALES

```text
features/sales/
│
├── components/
│   ├── SaleCart.tsx
│   ├── SaleItem.tsx
│   ├── SaleSummary.tsx
│   ├── SaleStatusBadge.tsx
│   └── ProductSearch.tsx
│
├── pages/
│   ├── SalesPage.tsx
│   ├── NewSalePage.tsx
│   └── SaleDetailPage.tsx
│
├── api/
│   ├── getSales.ts
│   ├── getSale.ts
│   ├── createSale.ts
│   └── finalizeSale.ts
│
├── hooks/
│   ├── useSales.ts
│   └── useSale.ts
│
└── schemas/
    └── saleFilters.ts
```

---

# 11. BACKEND

El backend también debe organizarse por módulos de negocio.

```text
apps/api/src/modules/
```

Ejemplo:

```text
modules/
├── auth/
├── users/
├── branches/
├── pos/
├── cash/
├── products/
├── inventory/
├── warehouse/
├── suppliers/
├── purchases/
├── transfers/
├── sales/
├── payments/
├── reservations/
├── marketing-loans/
├── exchanges/
├── employees/
├── treasury/
├── financial-accounts/
├── invoicing/
├── reports/
└── audit/
```

---

# 12. ESTRUCTURA DE MÓDULO BACKEND

Ejemplo:

```text
modules/sales/
│
├── sales.controller.ts
├── sales.service.ts
├── sales.repository.ts
├── sales.routes.ts
├── sales.schemas.ts
├── sales.types.ts
├── sales.mapper.ts
└── index.ts
```

Cuando un módulo crezca:

```text
modules/sales/
├── application/
├── domain/
├── infrastructure/
└── presentation/
```

pero no introducir complejidad arquitectónica innecesaria desde el día uno.

---

# 13. CONTROLLER

Responsabilidad:

```text
HTTP
 ↓
parse request
 ↓
validation
 ↓
service
 ↓
response
```

El controller NO debe contener reglas de negocio complejas.

Malo:

```text
if stock < quantity
   ...
```

si esa decisión pertenece al dominio.

---

# 14. SERVICE

El service coordina el caso de uso.

Ejemplo:

```text
finalizeSale()
```

puede ejecutar:

```text
validate sale
validate permissions
validate state
validate payments
validate stock
create stock movements
create financial movements
create invoice
write audit
complete transaction
```

Todo dentro de una transacción cuando corresponda.

---

# 15. REPOSITORY

El repository encapsula acceso a datos.

Ejemplo:

```text
SaleRepository
ProductRepository
InventoryRepository
```

No colocar reglas de negocio arbitrarias dentro del repository.

---

# 16. DOMAIN SERVICES

Para reglas complejas:

```text
StockService
PaymentService
CashService
ReservationService
TransferService
InvoiceService
```

Ejemplo:

```text
StockService.reserve()
StockService.release()
StockService.consume()
StockService.receive()
```

---

# 17. REGLA DE DEPENDENCIAS

Preferencia:

```text
Controller
   ↓
Application Service
   ↓
Domain Service
   ↓
Repository
   ↓
Prisma
```

No:

```text
Component
   ↓
Prisma
```

ni:

```text
Controller
   ↓
SQL directo
```

---

# 18. PRISMA

Prisma será la capa ORM.

El schema debe representar:

```text
Company
Branch
POS
CashRegister
User
Employee
Product
ProductVariant
Inventory
StockMovement
Sale
SaleItem
Payment
FinancialAccount
FinancialMovement
Reservation
Transfer
Purchase
Invoice
AuditLog
```

según el modelo definido previamente.

---

# 19. PRINCIPIO PRISMA

No utilizar Prisma como sustituto de las reglas de negocio.

Ejemplo:

```text
prisma.sale.update()
```

no significa automáticamente:

```text
venta correctamente finalizada
```

La operación debe pasar por el caso de uso correspondiente.

---

# 20. TRANSACCIONES

Operaciones críticas deben utilizar transacciones.

Ejemplo:

```text
Finalizar venta
│
├── actualizar sale
├── registrar payment
├── descontar stock
├── registrar FinancialMovement
├── registrar CashMovement
├── crear invoice
└── AuditLog
```

Si corresponde que todo sea atómico:

```text
BEGIN
...
COMMIT
```

Si falla:

```text
ROLLBACK
```

---

# 21. STOCK

Nunca:

```text
inventory.quantity -= 1
```

como regla aislada.

Preferir:

```text
StockMovement
```

que explique:

```text
qué
cuánto
dónde
por qué
quién
referencia
```

El estado de inventario debe derivarse/controlarse mediante movimientos coherentes.

---

# 22. DINERO

Misma filosofía.

No:

```text
account.balance += 100000
```

sin registrar origen.

Debe existir:

```text
FinancialMovement
```

y, cuando corresponda:

```text
CashMovement
Payment
```

---

# 23. TIPOS COMPARTIDOS

`packages/types` puede contener contratos simples compartidos.

Ejemplo:

```text
SaleStatus
PaymentMethod
Branch
ProductVariant
```

Pero evitar convertirlo en una copia completa del backend.

---

# 24. VALIDACIÓN COMPARTIDA

`packages/validation`

puede contener schemas Zod compartidos.

Ejemplo:

```text
sale schema
payment schema
product schema
reservation schema
```

Esto permite:

```text
Frontend validation
+
Backend validation
```

manteniendo una definición común cuando sea apropiado.

---

# 25. CONFIG

```text
packages/config/
```

contendrá configuración compartida segura.

Nunca colocar secretos aquí.

Ejemplo:

```text
environment names
feature flags
shared constants
application defaults
```

---

# 26. UTILIDADES

`packages/utils`

debe contener funciones verdaderamente genéricas.

Ejemplos:

```text
date utilities
string utilities
number formatting
ID helpers
```

No colocar:

```text
finalizeSale()
calculateCashExpected()
reserveStock()
```

porque son reglas de negocio.

---

# 27. DINERO EN CÓDIGO

No utilizar `float` para dinero.

Evitar:

```text
number
```

para operaciones monetarias críticas.

Utilizar una estrategia decimal consistente con PostgreSQL/Prisma y las reglas financieras definidas.

Ejemplo conceptual:

```text
Decimal
```

---

# 28. CANTIDADES

Las cantidades de productos también deben tener precisión definida.

Para prendas normalmente:

```text
integer
```

pero la arquitectura debe permitir cantidades decimales si el negocio lo necesitara en el futuro.

---

# 29. ENUMS

Los estados importantes deben estar centralizados.

Ejemplo:

```text
SaleStatus
PaymentStatus
ReservationStatus
TransferStatus
InvoiceStatus
```

No escribir strings arbitrarios:

```text
"completed"
"COMPLETED"
"done"
"finished"
```

para representar el mismo estado.

---

# 30. NAMING

Archivos:

```text
kebab-case
```

Ejemplo:

```text
sale-detail.tsx
cash-register.service.ts
stock-movement.repository.ts
```

Componentes React:

```text
PascalCase
```

Ejemplo:

```text
SaleDetail
CashSummary
ProductSelector
```

Funciones:

```text
camelCase
```

Ejemplo:

```text
finalizeSale()
getAvailableStock()
```

---

# 31. VARIABLES

Utilizar nombres explícitos.

Preferir:

```text
availableStock
paymentAmount
cashRegisterId
reservationExpiresAt
```

Evitar:

```text
x
data
tmp
foo
value
```

cuando el contexto no sea obvio.

---

# 32. IDs

Los IDs internos deben ser consistentes.

Los números visibles al usuario deben ser documentos separados.

Ejemplo:

```text
id:
uuid interno

saleNumber:
V-000123
```

No utilizar el número visible como clave primaria.

---

# 33. DOCUMENTOS

Cada documento importante debe tener numeración propia.

Ejemplos:

```text
V-000123
R-000045
TR-000031
REM-000031
OC-000044
```

La generación debe estar controlada por backend.

---

# 34. API ROUTES

Utilizar API versionada.

Ejemplo:

```text
/api/v1/sales
/api/v1/products
/api/v1/inventory
```

Para acciones importantes:

```text
POST /api/v1/sales/:id/finalize
POST /api/v1/sales/:id/cancel
POST /api/v1/transfers/:id/dispatch
POST /api/v1/transfers/:id/receive
POST /api/v1/reservations/:id/cancel
```

Preferir acciones explícitas antes que modificar estados arbitrariamente mediante:

```text
PATCH /sale/:id
{
  "status": "COMPLETED"
}
```

---

# 35. RESPUESTAS API

Mantener formato consistente.

Ejemplo:

```text
{
  "data": {...},
  "meta": {...}
}
```

Errores:

```text
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Stock insuficiente",
    "details": {...},
    "requestId": "..."
  }
}
```

---

# 36. CÓDIGOS DE ERROR DE NEGOCIO

Ejemplos:

```text
INSUFFICIENT_STOCK
SALE_NOT_PENDING_PAYMENT
CASH_REGISTER_CLOSED
RESERVATION_EXPIRED
TRANSFER_ALREADY_RECEIVED
PAYMENT_TOTAL_MISMATCH
FORBIDDEN_OPERATION
INVALID_STATE_TRANSITION
```

Esto facilita frontend, soporte y testing.

---

# 37. REQUEST ID

Cada request importante debe poder identificarse.

Ejemplo:

```text
X-Request-ID
```

o equivalente.

Permite correlacionar:

```text
Frontend
 ↓
API
 ↓
Service
 ↓
Database
 ↓
Audit
```

---

# 38. OPERATION ID

Las operaciones críticas pueden tener:

```text
operationId
```

para idempotencia y trazabilidad.

Ejemplo:

```text
finalize-sale:
operationId = OP-123ABC
```

Si el frontend reintenta la solicitud:

```text
mismo operationId
```

no debe duplicarse la operación.

---

# 39. AUTORIZACIÓN

Cada endpoint debe evaluar:

```text
identity
+
permission
+
company
+
branch
+
resource
+
state
+
business rules
```

No basta:

```text
isAdmin
```

para toda la aplicación.

---

# 40. MULTISUCURSAL

Toda entidad operacional debe tener el scope correspondiente.

Ejemplo:

```text
companyId
branchId
```

cuando aplique.

El backend debe impedir:

```text
Sucursal A
   ↓
acceder arbitrariamente
   ↓
datos de Sucursal B
```

sin permiso.

---

# 41. FRONTEND ROUTING

Ejemplo:

```text
/dashboard

/sales
/sales/new
/sales/:id

/cash
/cash/session

/inventory
/inventory/products

/warehouse
/warehouse/receipts

/purchases
/purchases/orders

/transfers
/transfers/:id

/reservations
/marketing-loans
/exchanges

/treasury
/reports

/admin
```

---

# 42. ROUTE GUARDS

El frontend puede proteger rutas según permisos:

```text
<ProtectedRoute permission="sales.read">
```

pero nuevamente:

> El backend continúa siendo la autoridad.

---

# 43. API CLIENT

Centralizar llamadas HTTP.

Ejemplo conceptual:

```text
apiClient.get()
apiClient.post()
apiClient.patch()
```

No repetir configuración de:

```text
headers
baseURL
auth
error handling
request ID
```

en cada componente.

---

# 44. DATA FETCHING

Utilizar una capa consistente para:

```text
queries
mutations
cache
loading
error
invalidations
```

Los componentes no deberían gestionar manualmente toda la lógica HTTP.

---

# 45. ESTADO FRONTEND

Separar:

```text
Server State
UI State
Form State
Session State
```

Ejemplo:

```text
TanStack Query
→ server state

React state
→ UI state

React Hook Form
→ form state

Auth provider/context
→ session
```

La herramienta concreta puede cambiar si el proyecto demuestra otra necesidad.

---

# 46. FORMS

Formularios complejos deben tener:

```text
schema
validation
default values
submit state
server errors
reset behavior
```

Nunca confiar solamente en HTML validation.

---

# 47. COMPONENTES

Regla:

> Un componente debe tener una responsabilidad comprensible.

Evitar componentes gigantes:

```text
SalesPage.tsx
```

de 2.000 líneas.

Separar:

```text
ProductSearch
SaleCart
SaleSummary
PaymentPanel
CustomerSelector
```

---

# 48. HOOKS

Los hooks deben encapsular comportamiento reutilizable.

Ejemplo:

```text
useSale()
useProducts()
useCashSession()
useReservation()
```

No crear hooks únicamente para esconder código desordenado.

---

# 49. SERVICIOS FRONTEND

Servicios:

```text
salesApi
productsApi
cashApi
inventoryApi
```

deben encargarse de comunicación con backend.

No deben decidir reglas de negocio críticas.

---

# 50. BACKEND MODULE OWNERSHIP

Cada módulo debe tener límites claros.

Ejemplo:

```text
sales
```

puede iniciar una operación de venta.

Pero:

```text
stock
```

es responsable de la modificación de inventario.

Y:

```text
treasury
```

es responsable del movimiento financiero.

Esto evita duplicación.

---

# 51. REGLA DE SINGLE SOURCE OF TRUTH

Ejemplo:

El precio de venta efectivo debe provenir de una política centralizada.

No:

```text
POS calcula precio
Reporte calcula otro precio
API calcula otro
```

Debe existir una fuente de verdad.

---

# 52. REGLAS DE NEGOCIO

Las reglas importantes deben ser testeables independientemente de HTTP.

Ejemplo:

```text
canFinalizeSale()
calculatePaymentBalance()
calculateAvailableStock()
calculateExpectedCash()
canExchangeItem()
canCancelReservation()
```

---

# 53. AUDITORÍA

No registrar AuditLog desde cada componente frontend.

La auditoría importante debe generarse en backend.

Ejemplo:

```text
finalizeSale()
   ↓
business operation
   ↓
AuditLog
```

---

# 54. LOGGING

Separar:

```text
Application logs
Audit logs
Security logs
```

No mezclar todo.

Application log:

```text
error
warning
debug
performance
```

Audit:

```text
who
what
when
where
before
after
```

---

# 55. SECRETOS

Nunca:

```text
API_KEY=...
```

en Git.

Utilizar:

```text
.env
```

y secretos del entorno de deployment.

Repositorio:

```text
.env.example
```

sin credenciales reales.

---

# 56. CONFIGURACIÓN DE ENTORNOS

Debe existir separación:

```text
development
demo
staging
production
```

Cada entorno tiene:

```text
database
credentials
ARCA mode
URLs
logging
features
```

independientes.

---

# 57. ARCA

La integración fiscal debe permanecer aislada.

Arquitectura:

```text
InvoiceService
      ↓
FiscalProvider
      ↓
ARCAAdapter
      ↓
WSFEv1
```

No colocar llamadas ARCA dentro de:

```text
SaleController
```

directamente.

---

# 58. MOCK PROVIDERS

Para Demo:

```text
MockFiscalProvider
```

puede simular:

```text
CAE
número de comprobante
estado
errores
```

Esto permite desarrollar sin depender del entorno fiscal real.

---

# 59. TEST STRUCTURE

```text
tests/
├── unit/
├── integration/
├── e2e/
├── fixtures/
└── helpers/
```

Además:

```text
apps/api/tests
apps/web/tests
```

cuando corresponda.

---

# 60. FIXTURES

Crear datos reutilizables:

```text
company
branches
users
roles
products
variants
inventory
customers
suppliers
```

Esto permite reproducir escenarios.

---

# 61. SEED

El seed debe crear una Demo reproducible.

Ejemplo:

```text
Empresa Demo

Sucursal Centro
Sucursal Norte
Sucursal Sur

Caja Centro
POS 01
POS 02
POS 03

Usuarios
Admin
Gerente
Cajero
Vendedor
Depósito
```

y productos suficientes para ejecutar los flujos principales.

---

# 62. MIGRACIONES

Nunca modificar manualmente una base de producción sin una estrategia de migración.

Flujo:

```text
schema
 ↓
migration
 ↓
review
 ↓
test
 ↓
deploy
```

---

# 63. README

El README raíz debe explicar:

```text
Qué es
Stack
Requisitos
Instalación
Variables
Cómo ejecutar
Cómo testear
Cómo migrar DB
Cómo seedear
Arquitectura
Documentación
```

---

# 64. AGENTS.MD

`AGENTS.md` será especialmente importante para OpenCode.

Debe contener:

```text
Project overview
Architecture
Rules
Commands
Code conventions
Business invariants
Testing requirements
Security rules
Forbidden patterns
```

OpenCode debe leerlo antes de modificar el proyecto.

---

# 65. REGLAS PARA AGENTS.MD

Debe especificar explícitamente:

```text
NO modificar stock directamente.
NO modificar dinero directamente.
NO saltar services.
NO acceder a Prisma desde frontend.
NO colocar secretos.
NO cambiar estados arbitrariamente.
NO eliminar operaciones históricas.
NO saltar autorización.
NO duplicar entidades existentes.
```

---

# 66. DOCUMENTACIÓN

La carpeta:

```text
docs/
```

debe conservar los módulos funcionales.

Ejemplo:

```text
docs/
├── 01-vision.md
├── 02-roles.md
├── ...
├── 24-modelo-de-datos.md
├── 25-arquitectura-tecnica.md
├── ...
├── 29-ux-ui.md
└── 30-estructura-proyecto.md
```

La documentación es parte del producto.

---

# 67. CHANGELOG

Mantener registro de cambios importantes.

Ejemplo:

```text
Added
Changed
Fixed
Security
Breaking
```

No necesariamente registrar cada pequeño commit.

---

# 68. GIT

Ramas recomendadas:

```text
main
develop
feature/*
fix/*
hotfix/*
```

Para un equipo pequeño puede simplificarse.

La regla importante es:

> `main` siempre debe representar código razonablemente estable.

---

# 69. COMMITS

Utilizar mensajes claros.

Ejemplo:

```text
feat(sales): add pending payment workflow
feat(cash): implement cash closing
fix(stock): prevent negative inventory
feat(transfers): add branch receipt
test(sales): add combined payment coverage
```

---

# 70. CODE REVIEW

Aunque actualmente el equipo sea de una persona, desarrollar como si existiera review.

Antes de merge:

```text
Tests
Lint
Typecheck
Security
Business rules
```

---

# 71. LINTER Y FORMATTER

Centralizar:

```text
ESLint
Prettier
```

o una alternativa equivalente.

El proyecto debe tener formato automático.

---

# 72. TYPESCRIPT

Modo estricto recomendado:

```text
strict: true
```

Evitar:

```text
any
```

salvo casos justificados.

Si aparece:

```text
as any
```

repetidamente:

> probablemente existe un problema de modelado de tipos.

---

# 73. NULLABILITY

No esconder valores inexistentes.

Diferenciar correctamente:

```text
undefined
null
empty string
0
false
```

Especialmente importante en:

```text
money
dates
foreign keys
optional references
```

---

# 74. ERRORES

No utilizar:

```text
throw new Error("algo salió mal")
```

para todo.

Crear errores de aplicación consistentes.

Ejemplo conceptual:

```text
BusinessError
ValidationError
AuthorizationError
NotFoundError
ConflictError
InfrastructureError
```

---

# 75. OBSERVABILIDAD

Backend debe registrar:

```text
requestId
operationId
route
duration
status
userId
companyId
branchId
```

cuando sea apropiado y respetando privacidad.

---

# 76. PERFORMANCE

No optimizar prematuramente.

Primero:

```text
correctness
```

Después:

```text
performance
```

Pero diseñar correctamente desde el principio para:

```text
pagination
indexes
transactions
query efficiency
```

---

# 77. DATABASE INDEXES

Agregar índices para consultas operativas frecuentes.

Ejemplos:

```text
SKU
barcode
branchId
status
createdAt
saleNumber
reservation expiration
transfer status
```

Los índices definitivos deben derivarse de consultas reales y análisis de rendimiento.

---

# 78. PAGINACIÓN

No devolver:

```text
10.000 productos
```

en una sola respuesta.

Utilizar:

```text
page
limit
cursor
```

según necesidad.

---

# 79. EXPORTACIONES

Reportes grandes no deben bloquear la API.

Para producción puede utilizarse:

```text
job
worker
file generation
download
```

La Demo puede simplificar este flujo.

---

# 80. ARCHIVOS

Si se agregan:

```text
comprobantes
facturas
remitos
imágenes
documentos
```

utilizar una abstracción de storage.

No acoplar toda la aplicación a:

```text
filesystem local
```

---

# 81. SEGURIDAD DE ARCHIVOS

Validar:

```text
type
size
extension
content
permissions
```

y evitar que archivos subidos se ejecuten como código.

---

# 82. DEPENDENCY MANAGEMENT

Antes de agregar una dependencia:

```text
¿Es necesaria?
¿Está mantenida?
¿Tiene vulnerabilidades conocidas?
¿Aporta valor real?
```

No instalar librerías por moda.

---

# 83. REGLA PARA IA / OPENCODE

OpenCode puede:

```text
crear
refactorizar
testear
documentar
investigar dentro del repo
```

pero debe respetar:

```text
AGENTS.md
docs/
business rules
architecture
tests
```

La IA no debe improvisar reglas de negocio.

---

# 84. FLUJO IDEAL CON OPENCODE

```text
Issue / Task
     ↓
Leer AGENTS.md
     ↓
Leer documentación relevante
     ↓
Inspeccionar código existente
     ↓
Plan
     ↓
Implementación
     ↓
Tests
     ↓
Typecheck
     ↓
Lint
     ↓
Review
     ↓
Commit
```

---

# 85. REGLA ANTI-DUPLICACIÓN

Antes de crear:

```text
ProductService
PaymentService
StockService
```

OpenCode debe buscar si ya existe.

Nunca crear:

```text
StockService
StockManager
InventoryManager
InventoryService
```

para la misma responsabilidad sin justificación arquitectónica.

---

# 86. REGLA ANTI-OVERENGINEERING

No introducir:

```text
microservices
event sourcing
Kafka
Redis
CQRS
Kubernetes
```

solo porque son tecnologías conocidas.

La arquitectura inicial debe ser:

```text
Modular Monolith
```

con límites claros.

---

# 87. EVOLUCIÓN

Cuando el sistema crezca:

```text
Modular Monolith
        ↓
Optimización
        ↓
Workers
        ↓
Redis
        ↓
Integraciones
        ↓
Servicios separados
```

solo cuando exista una necesidad real.

---

# 88. DEMO VS PRODUCCIÓN

## Demo

Puede utilizar:

```text
React
TypeScript
Mock API / local data
Simulación fiscal
Seed
```

## Producción

Debe utilizar:

```text
React
Node
Express
PostgreSQL
Prisma
Auth
RBAC
Audit
Backups
ARCA
Monitoring
CI/CD
```

La Demo debe mantener la estructura conceptual de producción.

---

# 89. DEFINITION OF DONE

Una feature no está terminada simplemente porque:

```text
"la pantalla funciona"
```

Debe cumplir:

```text
UI
API
Validation
Authorization
Business rules
Persistence
Audit
Error handling
Tests
Documentation
```

cuando corresponda al alcance de la feature.

---

# 90. CHECKLIST ANTES DE MERGE

```text
[ ] TypeScript OK
[ ] Lint OK
[ ] Tests OK
[ ] Business rules OK
[ ] Authorization OK
[ ] Scope company/branch OK
[ ] Audit OK
[ ] No direct stock mutation
[ ] No direct money mutation
[ ] No duplicated logic
[ ] No secrets
[ ] Documentation updated
```

---

# 91. REGLAS NO NEGOCIABLES

### 1.

> Frontend nunca accede directamente a PostgreSQL.

### 2.

> Los controllers no contienen reglas de negocio complejas.

### 3.

> El dinero se modifica mediante movimientos trazables.

### 4.

> El stock se modifica mediante movimientos trazables.

### 5.

> El backend es la autoridad.

### 6.

> Las operaciones críticas son transaccionales.

### 7.

> Las operaciones críticas deben ser idempotentes cuando exista posibilidad de reintento.

### 8.

> Los estados no se modifican arbitrariamente.

### 9.

> Los históricos no se sobrescriben para ocultar cambios.

### 10.

> OpenCode debe respetar `AGENTS.md` y la documentación funcional.

---

# 92. ARQUITECTURA FINAL

```text
                    USER
                      │
                      ▼
              ┌──────────────┐
              │ React / Vite │
              │   Frontend   │
              └──────┬───────┘
                     │ HTTPS
                     ▼
              ┌──────────────┐
              │ Express API  │
              └──────┬───────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Auth/RBAC   Services   Integrations
                     │          │
              ┌──────┴──────┐   │
              ▼             ▼   ▼
          PostgreSQL      Prisma ARCA
              │
              ▼
       Audit / Movements
```

---

# 93. PRINCIPIO FINAL

La estructura del proyecto debe hacer evidente dónde vive cada responsabilidad.

Si alguien pregunta:

```text
¿Dónde se finaliza una venta?
```

la respuesta debe ser evidente.

Si pregunta:

```text
¿Dónde se modifica stock?
```

también.

Si pregunta:

```text
¿Dónde se registra el dinero?
```

también.

Si para responder hay que recorrer veinte archivos:

> la arquitectura está fallando.

---

# 94. ESTADO DEL BLUEPRINT

Con este módulo queda definido:

```text
19 — Facturación ARCA
20 — Reportes y Exportaciones
21 — Auditoría y Trazabilidad
22 — Reglas de Negocio
23 — Estados y Transiciones
24 — Modelo de Datos
25 — Arquitectura Técnica
26 — Seguridad
27 — Infraestructura y Deployment
28 — Testing y QA
29 — UX/UI
30 — Estructura del Proyecto y Convenciones
```

## SIGUIENTE

```text
31 — API, ENDPOINTS Y CONTRATOS DE INTEGRACIÓN
```

Este será el siguiente salto importante: definir **exactamente cómo se comunica el frontend con el backend**, qué endpoints existen para ventas, caja, stock, depósito, transferencias, reservas, tesorería, empleados, ARCA, reportes, qué recibe cada endpoint, qué devuelve, errores, permisos, idempotencia y transacciones.
