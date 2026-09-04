# 25 — ARQUITECTURA TÉCNICA

## 1. OBJETIVO

Definir la arquitectura técnica del sistema de gestión multSucursal para permitir:

* desarrollo de demo rápida;
* evolución posterior a producción;
* separación clara frontend/backend;
* persistencia PostgreSQL;
* ORM Prisma;
* API REST;
* autenticación y autorización;
* trazabilidad;
* transacciones;
* concurrencia;
* integraciones externas;
* escalabilidad progresiva.

La arquitectura debe evitar sobreingeniería durante la demo, pero no debe generar decisiones estructurales que dificulten la evolución a producción.

---

# 2. ARQUITECTURA OBJETIVO

La arquitectura de producción prevista es:

```text
┌──────────────────────────────┐
│          USUARIO             │
│ Vendedor / Cajero / Admin    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       FRONTEND WEB           │
│ React + TypeScript + Vite    │
└──────────────┬───────────────┘
               │ HTTPS / REST
               ▼
┌──────────────────────────────┐
│          API                 │
│ Node.js + Express + TS       │
├──────────────────────────────┤
│ Auth                         │
│ Authorization                │
│ Validation                   │
│ Business Services            │
│ Transactions                 │
│ Audit                        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           ORM                │
│           Prisma             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        PostgreSQL            │
└──────────────────────────────┘
```

Integraciones externas:

```text
                 ┌───────────────┐
                 │     ARCA      │
                 └───────┬───────┘
                         │
                         ▼
Frontend → API → Fiscal Provider
                    │
                    └── ARCA Adapter
```

---

# 3. STACK PRINCIPAL

## Frontend

```text
React
TypeScript
Vite
```

Opcionalmente:

```text
React Router
TanStack Query
React Hook Form
Zod
```

Las dependencias definitivas se decidirán durante implementación.

---

# 4. BACKEND

```text
Node.js
TypeScript
Express
```

Responsabilidades:

* autenticación;
* autorización;
* validación;
* reglas de negocio;
* transacciones;
* persistencia;
* auditoría;
* generación de documentos;
* integración fiscal;
* integración financiera;
* API.

---

# 5. DATABASE

Producción:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

La base de datos es la fuente persistente del sistema.

---

# 6. DEMO

Durante la semana de demo se permite:

```text
React
TypeScript
Vite
Mock data
localStorage
```

o una API simplificada si el tiempo lo permite.

No es obligatorio implementar:

```text
PostgreSQL
Redis
ARCA real
WebSockets
colas distribuidas
infraestructura productiva
```

durante la primera demo.

---

# 7. PRINCIPIO DEMO → PRODUCCIÓN

La demo debe validar:

```text
UX
Flujos
Procesos
Reglas
Permisos
Operaciones
```

La producción agregará:

```text
Persistencia
Seguridad
Concurrencia
Integraciones
Auditoría completa
Infraestructura
```

No debe interpretarse:

```text
DEMO = PRODUCTO TERMINADO
```

---

# 8. ESTRUCTURA DEL PROYECTO

Se recomienda un monorepo:

```text
project/
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── types/
│   ├── validation/
│   └── config/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│
├── docs/
│
├── scripts/
│
├── tests/
│
├── .env.example
├── package.json
└── AGENTS.md
```

---

# 9. FRONTEND

Estructura conceptual:

```text
apps/web/
├── src/
│   ├── app/
│   ├── routes/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   ├── types/
│   └── styles/
```

---

# 10. FRONTEND POR FEATURES

No organizar todo únicamente por tipo técnico.

Preferir:

```text
features/
├── auth/
├── dashboard/
├── sales/
├── cash/
├── inventory/
├── products/
├── purchases/
├── transfers/
├── warehouse/
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

Cada feature puede contener:

```text
components/
hooks/
services/
types/
schemas/
```

cuando sea necesario.

---

# 11. BACKEND

Estructura:

```text
apps/api/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── integrations/
│   ├── utils/
│   ├── errors/
│   └── server.ts
```

---

# 12. MÓDULOS BACKEND

```text
modules/
├── auth/
├── users/
├── employees/
├── branches/
├── pos/
├── cash/
├── products/
├── inventory/
├── suppliers/
├── purchases/
├── warehouse/
├── transfers/
├── sales/
├── payments/
├── treasury/
├── financial-accounts/
├── reservations/
├── marketing-loans/
├── exchanges/
├── payroll/
├── invoicing/
├── reports/
└── audit/
```

---

# 13. RESPONSABILIDAD DE LOS MÓDULOS

Cada módulo debe encapsular su lógica de dominio.

Ejemplo:

```text
sales/
├── sales.controller.ts
├── sales.service.ts
├── sales.repository.ts
├── sales.schema.ts
├── sales.routes.ts
└── sales.types.ts
```

No colocar lógica compleja de ventas directamente dentro del controller.

---

# 14. CONTROLLER

Responsabilidad:

```text
HTTP
 ↓
parse
 ↓
validate
 ↓
call service
 ↓
response
```

No debe contener toda la lógica del negocio.

Incorrecto:

```text
controller
 ├── calcula stock
 ├── registra pago
 ├── modifica caja
 ├── crea factura
 └── escribe auditoría
```

Preferido:

```text
controller
    ↓
service
    ↓
domain operations
```

---

# 15. SERVICE

El service ejecuta la operación de negocio.

Ejemplo:

```text
finalizeSale()
```

puede coordinar:

```text
validateSale
validateStock
validatePayment
createPayment
createStockMovement
createFinancialMovement
createAuditLog
updateSaleStatus
```

dentro de una transacción cuando corresponda.

---

# 16. REPOSITORY

Responsabilidad:

```text
persistencia
consultas
```

Ejemplo:

```text
SaleRepository
PaymentRepository
InventoryRepository
```

No debe contener reglas de negocio complejas.

---

# 17. DOMAIN SERVICE

Cuando una operación cruza múltiples módulos:

```text
Sale
Payment
Inventory
Cash
Treasury
Invoice
```

puede utilizarse un service de aplicación/orquestación.

Ejemplo:

```text
SaleFinalizationService
```

Esto evita que:

```text
PaymentService
```

tenga que conocer todo el sistema de ventas.

---

# 18. API REST

La API debe utilizar recursos claros.

Ejemplos:

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
```

Ventas:

```text
POST   /api/sales
GET    /api/sales/:id
POST   /api/sales/:id/finalize
POST   /api/sales/:id/cancel
```

Reservas:

```text
POST   /api/reservations
POST   /api/reservations/:id/extend
POST   /api/reservations/:id/cancel
POST   /api/reservations/:id/pickup
```

---

# 19. ACCIONES DE NEGOCIO

Las operaciones críticas deben representarse explícitamente.

Preferir:

```text
POST /sales/:id/finalize
```

en lugar de:

```text
PATCH /sales/:id
{
  "status": "COMPLETED"
}
```

El segundo enfoque permite saltarse reglas.

---

# 20. VALIDACIÓN

Todas las entradas externas deben validarse.

Ejemplo:

```text
POST /sales
```

debe validar:

* branchId;
* posId;
* items;
* cantidades;
* precios;
* descuentos;
* customer;
* etc.

El frontend puede validar para mejorar UX.

El backend debe validar obligatoriamente.

---

# 21. AUTORIZACIÓN

La autorización debe verificarse en backend.

Ejemplo:

```text
Seller
```

puede:

```text
crear venta
```

pero no:

```text
cerrar caja
aprobar descuento especial
anular operación finalizada
```

según permisos definidos en `02_ROLES_Y_PERMISOS.md`.

---

# 22. AUTENTICACIÓN

Producción debe utilizar:

```text
password hashing
sessions/tokens
secure cookies o mecanismo equivalente
expiration
revocation
```

No almacenar contraseñas en texto plano.

---

# 23. MULTI-TENANCY

El sistema actualmente está pensado para una empresa.

Sin embargo, el modelo conserva:

```text
companyId
```

para mantener aislamiento lógico.

Toda consulta sensible debe aplicar el contexto de empresa.

Ejemplo conceptual:

```text
WHERE companyId = currentCompany.id
```

Nunca confiar únicamente en:

```text
id
```

recibido desde frontend.

---

# 24. BRANCH SCOPING

Los usuarios con alcance de sucursal solamente deben acceder a los datos autorizados.

Ejemplo:

```text
Seller Branch A
```

no debería poder consultar libremente:

```text
Sales Branch B
Cash Branch B
Inventory Branch B
```

salvo que sus permisos lo permitan.

---

# 25. TRANSACCIONES

Operaciones críticas deben utilizar transacciones de base de datos.

Ejemplo:

```text
finalizar venta
```

puede implicar:

```text
Sale
Payment
Inventory
StockMovement
CashMovement
FinancialMovement
Invoice
AuditLog
```

La transacción debe evitar estados inconsistentes.

---

# 26. EJEMPLO DE TRANSACCIÓN

Conceptualmente:

```text
BEGIN

validate sale
validate stock
validate payment

update Sale

create Payment

create StockMovement

create CashMovement

create FinancialMovement

create AuditLog

COMMIT
```

Si una parte crítica falla:

```text
ROLLBACK
```

---

# 27. CONCURRENCIA

Ejemplo:

```text
Stock SKU-001 = 1
```

POS A intenta vender:

```text
1 unidad
```

POS B intenta vender simultáneamente:

```text
1 unidad
```

El backend debe impedir vender 2 unidades si solamente existe 1 disponible.

Esto requiere mecanismos de concurrencia apropiados en producción.

---

# 28. IDEMPOTENCIA

Operaciones críticas deben aceptar una clave de idempotencia cuando corresponda.

Ejemplo:

```text
Idempotency-Key:
OP-2026-000154
```

Si la misma solicitud llega dos veces:

```text
primera → ejecuta
segunda → devuelve resultado existente
```

No duplicar movimientos.

---

# 29. MANEJO DE ERRORES

La API debe utilizar errores estructurados.

Ejemplo:

```text
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Stock insuficiente",
    "details": {}
  }
}
```

No devolver errores internos sensibles al usuario.

---

# 30. CÓDIGOS DE ERROR

Ejemplos:

```text
AUTH_REQUIRED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
INVALID_STATE_TRANSITION
INSUFFICIENT_STOCK
PAYMENT_MISMATCH
CASH_REGISTER_CLOSED
ACCOUNT_INACTIVE
DUPLICATE_OPERATION
CONCURRENCY_CONFLICT
FISCAL_AUTHORIZATION_FAILED
INTERNAL_ERROR
```

La lista definitiva puede ampliarse.

---

# 31. LOGGING

Producción debe registrar eventos técnicos relevantes:

```text
requestId
timestamp
method
path
status
duration
userId
companyId
branchId
operationId
errorCode
```

No registrar secretos.

---

# 32. CORRELATION ID

Una operación debe poder rastrearse entre servicios.

Ejemplo:

```text
requestId
operationId
```

Relación:

```text
HTTP Request
      ↓
Service
      ↓
Database
      ↓
External API
      ↓
AuditLog
```

---

# 33. INTEGRACIONES

Las integraciones externas deben aislarse.

Ejemplo:

```text
integrations/
├── arca/
├── payment-providers/
└── messaging/
```

El dominio no debe depender directamente de una API externa específica.

---

# 34. FISCAL PROVIDER

Utilizar abstracción:

```text
FiscalProvider
```

Ejemplo:

```text
FiscalProvider
      │
      └── ARCAAdapter
             │
             └── WSFEv1
```

Esto permite sustituir o ampliar proveedores sin modificar todo `SaleService`.

---

# 35. ARCA

La facturación fiscal debe estar desacoplada del núcleo comercial.

```text
Sale
 ↓
InvoiceService
 ↓
FiscalProvider
 ↓
ARCAAdapter
```

No colocar código de conexión ARCA dentro de:

```text
SaleController
```

---

# 36. PAGOS

El dominio debe diferenciar:

```text
PaymentMethod
FinancialAccount
PaymentProvider
```

Ejemplo:

```text
TRANSFERENCIA
      ↓
BANCO GALICIA
```

o:

```text
QR
      ↓
MERCADO PAGO
```

---

# 37. EVENTOS

No implementar un sistema distribuido de eventos durante la demo salvo necesidad.

En producción puede utilizarse una arquitectura de eventos para procesos como:

```text
SaleCompleted
InvoiceAuthorized
TransferReceived
ReservationExpired
```

Los eventos no deben reemplazar la consistencia transaccional de operaciones críticas.

---

# 38. PROCESOS ASÍNCRONOS

Procesos que pueden ejecutarse posteriormente:

```text
generación de reportes grandes
exportaciones
notificaciones
sincronizaciones
procesamiento fiscal cuando corresponda
```

pueden utilizar workers/colas posteriormente.

---

# 39. REDIS

Redis no es obligatorio inicialmente.

Puede incorporarse para:

```text
cache
sessions
rate limiting
queues
locks
realtime
```

Solamente cuando exista una necesidad concreta.

No agregar Redis por defecto.

---

# 40. WEBSOCKETS / REALTIME

No son requisito de la primera demo.

Podrían utilizarse posteriormente para:

```text
stock actualizado
ventas en tiempo real
estado de transferencias
dashboard
notificaciones
```

La aplicación debe funcionar correctamente sin realtime.

---

# 41. CACHE

La información transaccional crítica no debe depender exclusivamente de cache.

Fuente de verdad:

```text
PostgreSQL
```

Cache:

```text
optimización
```

Nunca:

```text
cache = única fuente
```

---

# 42. REPORTES

Los reportes deben consultar datos consistentes.

Para grandes volúmenes pueden utilizarse:

```text
queries optimizadas
indexes
materialized views
cache
jobs
```

según necesidad.

No optimizar prematuramente.

---

# 43. EXPORTACIONES

Las exportaciones pequeñas pueden generarse directamente.

Las grandes:

```text
request
 ↓
job
 ↓
processing
 ↓
file
 ↓
download
```

deben evitar bloquear una request HTTP durante demasiado tiempo.

---

# 44. SEGURIDAD

La arquitectura debe contemplar:

```text
HTTPS
password hashing
RBAC
input validation
SQL injection protection
CSRF según estrategia de autenticación
XSS protection
rate limiting
secure headers
secret management
audit
backup
```

Los detalles completos se definirán en:

```text
26_SEGURIDAD.md
```

---

# 45. VARIABLES DE ENTORNO

Nunca hardcodear:

```text
database password
JWT secret
ARCA credentials
API keys
external tokens
```

Utilizar:

```text
.env
.env.example
```

Ejemplo:

```text
DATABASE_URL=
AUTH_SECRET=
ARCA_CERT_PATH=
ARCA_KEY_PATH=
```

El `.env.example` no contiene secretos reales.

---

# 46. CONFIGURACIÓN POR ENTORNO

Separar:

```text
development
test
demo
staging
production
```

Ejemplo:

```text
ARCA_ENV=HOMOLOGACION
```

o el mecanismo equivalente definido durante implementación.

Nunca utilizar credenciales productivas en demo.

---

# 47. MIGRACIONES

En producción, cambios estructurales de PostgreSQL deben utilizar migraciones.

No modificar manualmente la base de datos sin registrar el cambio.

Flujo:

```text
schema change
      ↓
migration
      ↓
review
      ↓
apply
```

---

# 48. SEEDS

El proyecto debe poder crear datos iniciales.

Ejemplo:

```text
Company
Branch
Warehouse
Users
Roles
Products
Variants
FinancialAccounts
```

La seed de demo debe ser reproducible.

---

# 49. TESTING

La estrategia debe incluir:

```text
Unit tests
Integration tests
API tests
Business-rule tests
E2E tests
```

Prioridad:

```text
reglas críticas
```

especialmente:

* stock;
* pagos;
* caja;
* transferencias;
* reservas;
* cambios;
* facturación;
* permisos.

---

# 50. TEST DE VENTA

Debe existir un caso como:

```text
Given:
stock = 5

When:
sale = 2

Then:
stock = 3
payment = registered
financial movement = registered
sale = completed
```

---

# 51. TEST DE CONCURRENCIA

Caso:

```text
stock = 1
```

Dos ventas simultáneas de:

```text
quantity = 1
```

Resultado esperado:

```text
una venta exitosa
una venta rechazada
```

No:

```text
stock = -1
```

---

# 52. TEST DE PAGO COMBINADO

Ejemplo:

```text
Venta = $100.000

Efectivo = $40.000
Transferencia = $60.000
```

Resultado:

```text
totalPayment = $100.000
sale = PAID
```

Si:

```text
$40.000 + $50.000
```

la venta no debe finalizar como pagada si no existe una regla explícita que permita saldo pendiente.

---

# 53. TEST DE CAJA

Ejemplo:

```text
Opening = $100.000

Cash sales = $50.000

Cash out = $10.000

Expected = $140.000
```

El arqueo compara:

```text
Expected
vs
Counted
```

La diferencia queda registrada.

---

# 54. TEST DE RESERVA

```text
Stock físico = 5
Reserva = 2
```

Resultado:

```text
Physical = 5
Reserved = 2
Available = 3
```

La venta no debe utilizar automáticamente las 2 unidades reservadas.

---

# 55. TEST DE TRANSFERENCIA

```text
Origen = 10
Transfer requested = 4
Dispatched = 4
Received = 4
```

Resultado:

```text
Origen = 6
Destino = +4
```

Si solamente se reciben 3:

```text
Origen = 6
Destino = +3
Incidente = 1
```

---

# 56. OBSERVABILIDAD

Producción debe poder responder:

```text
¿Qué ocurrió?
¿Dónde ocurrió?
¿Quién lo ejecutó?
¿Cuándo?
¿Qué operación?
¿Qué request?
¿Falló una integración?
```

Mediante:

```text
AuditLog
Application Logs
Operation ID
Request ID
```

---

# 57. BACKUP

PostgreSQL debe tener estrategia de backup en producción.

Debe contemplar:

```text
frecuencia
retención
restauración
pruebas de restore
```

No asumir que:

```text
backup configurado = backup probado
```

---

# 58. DEPLOYMENT

Arquitectura inicial:

```text
                INTERNET
                   │
                   ▼
               FRONTEND
                   │
                 HTTPS
                   │
                   ▼
                API
                   │
                   ▼
             PostgreSQL
```

Frontend puede alojarse en:

```text
Vercel
```

Backend y PostgreSQL pueden alojarse en:

```text
cloud provider
```

La elección definitiva se realizará durante la etapa de infraestructura.

---

# 59. DOMINIO

La aplicación debe permitir separar:

```text
frontend.example.com
api.example.com
```

o:

```text
example.com
api.example.com
```

según la infraestructura elegida.

---

# 60. CORS

El backend debe aceptar únicamente los orígenes autorizados.

No utilizar:

```text
Access-Control-Allow-Origin: *
```

en producción si la estrategia de autenticación no lo permite.

---

# 61. RATE LIMITING

Debe existir protección contra abuso de API.

Especialmente:

```text
login
password reset
fiscal endpoints
public endpoints
```

Los límites concretos se definirán durante seguridad/infraestructura.

---

# 62. PAGINACIÓN

Los listados grandes deben utilizar paginación.

Ejemplo:

```text
GET /sales?page=1&limit=50
```

o cursor pagination cuando corresponda.

No devolver miles de registros innecesariamente.

---

# 63. FILTROS

Los módulos deben soportar filtros consistentes.

Ejemplo:

```text
branch
dateFrom
dateTo
status
user
product
customer
paymentMethod
```

según el recurso.

---

# 64. ORDENAMIENTO

Los endpoints de consulta deben permitir ordenar mediante campos explícitamente permitidos.

Nunca construir SQL dinámico sin validación.

---

# 65. API VERSIONING

La API puede comenzar como:

```text
/api/v1
```

Esto permite evolucionar posteriormente.

No cambiar contratos existentes arbitrariamente.

---

# 66. DOCUMENTACIÓN API

La API de producción debe documentarse.

Puede utilizar:

```text
OpenAPI / Swagger
```

La documentación debe describir:

* endpoint;
* método;
* parámetros;
* body;
* respuesta;
* errores;
* autenticación;
* permisos.

---

# 67. CONTRATOS FRONTEND/BACKEND

Los tipos compartidos pueden centralizarse:

```text
packages/types
```

pero no utilizar tipos compartidos como sustituto de validación backend.

Ejemplo:

```text
TypeScript type
≠
runtime validation
```

---

# 68. ZOD / VALIDADORES

Si se utiliza Zod:

```text
Frontend
   ↓
schema
```

y:

```text
Backend
   ↓
schema
```

Los schemas compartidos pueden reutilizarse cuando resulte apropiado.

---

# 69. REGLA CONTRA LA LÓGICA DUPLICADA

No implementar una regla de negocio dos veces de manera independiente.

Ejemplo incorrecto:

```text
Frontend:
available = physical - reserved

Backend:
otra fórmula diferente
```

El backend es la autoridad.

Frontend puede replicar cálculos únicamente para UX.

---

# 70. REGLA DE AUTORIDAD

Para datos críticos:

```text
PostgreSQL + Backend
```

son la fuente de verdad.

El frontend:

```text
visualiza
solicita
valida UX
```

pero no decide:

```text
si una venta es legal
si existe stock
si un usuario puede aprobar
si una factura está autorizada
```

---

# 71. DOCUMENTACIÓN COMO CONTRATO

OpenCode debe leer:

```text
AGENTS.md
00_MASTER_SPEC.md
01...
23...
24...
25...
```

antes de implementar.

Cuando exista conflicto:

```text
NO INVENTAR
```

Debe reportarlo.

---

# 72. ORDEN DE IMPLEMENTACIÓN

La implementación productiva debe avanzar aproximadamente:

```text
1. Foundation
2. Auth / Users / Roles
3. Company / Branch / POS
4. Products / Variants
5. Inventory
6. Suppliers / Purchases
7. Warehouse
8. Transfers
9. Sales / POS
10. Payments
11. Cash
12. Treasury
13. Reservations
14. Marketing Loans
15. Exchanges
16. Employees / Payroll
17. Invoicing
18. Reports
19. Audit
20. Hardening
```

El orden puede cambiar por dependencia técnica.

---

# 73. FOUNDATION

Antes de los módulos de negocio:

```text
project setup
TypeScript
lint
format
environment
logging
error handling
database
Prisma
migrations
testing
```

---

# 74. REGLA DE IMPLEMENTACIÓN

Cada feature debe pasar por:

```text
SPEC
 ↓
DATA MODEL
 ↓
API
 ↓
SERVICE
 ↓
UI
 ↓
TEST
 ↓
AUDIT
```

No comenzar directamente por la pantalla.

---

# 75. DEFINITION OF DONE

Una funcionalidad no se considera terminada simplemente porque:

```text
"la pantalla funciona"
```

Debe cumplir:

* [ ] UI;
* [ ] validación;
* [ ] backend;
* [ ] persistencia;
* [ ] reglas;
* [ ] permisos;
* [ ] errores;
* [ ] auditoría;
* [ ] pruebas;
* [ ] documentación cuando corresponda.

---

# 76. ARQUITECTURA FINAL

```text
                         USERS
                           │
                           ▼
                    ┌─────────────┐
                    │   FRONTEND  │
                    │ React + TS  │
                    └──────┬──────┘
                           │
                         HTTPS
                           │
                           ▼
                    ┌─────────────┐
                    │     API     │
                    │ Express + TS│
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          Services     Integrations   Audit
              │            │
              ▼            ├── ARCA
         Repositories      └── Providers
              │
              ▼
           Prisma
              │
              ▼
        PostgreSQL
```

---

# 77. PRINCIPIO FINAL

La arquitectura debe mantener una separación estricta entre:

```text
PRESENTACIÓN
     ↓
API
     ↓
APLICACIÓN
     ↓
DOMINIO
     ↓
PERSISTENCIA
     ↓
INFRAESTRUCTURA
```

Y nunca permitir que una pantalla termine controlando directamente:

```text
stock
dinero
caja
facturación
permisos
```

La arquitectura existe para proteger las reglas del negocio.

> **El frontend muestra y solicita. El backend decide y ejecuta. PostgreSQL persiste. Los movimientos explican los cambios. La auditoría demuestra lo ocurrido.**
