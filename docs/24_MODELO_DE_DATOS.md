# 24 — MODELO DE DATOS

## 1. OBJETIVO

Este documento define el modelo conceptual y lógico de datos del sistema de gestión multirubro/multisucursal para la empresa de indumentaria.

El modelo debe representar:

* empresa;
* sucursales;
* usuarios;
* empleados;
* depósitos;
* POS;
* cajas;
* productos;
* variantes;
* inventario;
* movimientos de stock;
* proveedores;
* compras;
* recepciones;
* transferencias;
* remitos;
* clientes;
* ventas;
* pagos;
* cuentas financieras;
* tesorería;
* reservas;
* señas;
* préstamos de publicidad;
* cambios;
* devoluciones;
* empleados y sueldos;
* facturación;
* auditoría;
* reportes y exportaciones.

---

# 2. PRINCIPIOS DEL MODELO

## MD-001 — No duplicar conceptos

Una entidad debe representar una única responsabilidad.

Ejemplo:

```text
Sale
Payment
FinancialMovement
Invoice
```

son entidades diferentes.

No crear:

```text
VentaConPago
VentaFinanciera
VentaFiscal
```

como entidades paralelas.

---

# 3. MD-002 — HISTORIAL INMUTABLE

Las operaciones históricas no deben sobrescribirse para alterar lo ocurrido.

Ejemplo:

```text
Sale #100
   ↓
Payment
   ↓
StockMovement
   ↓
FinancialMovement
```

Una corrección genera una nueva operación relacionada.

---

# 4. MD-003 — STOCK COMO LEDGER

`Inventory` representa el estado actual.

`StockMovement` representa cómo se llegó a ese estado.

```text
Inventory
    │
    └── StockMovement[]
```

El stock no debe depender exclusivamente de un campo editable manualmente.

---

# 5. MD-004 — DINERO COMO MOVIMIENTOS

No utilizar solamente:

```text
currentBalance
```

como fuente de verdad.

La fuente histórica debe ser:

```text
FinancialMovement[]
```

y el saldo puede calcularse o materializarse como dato derivado/controlado.

---

# 6. JERARQUÍA PRINCIPAL

```text
Company
│
├── Branch
│   ├── POS
│   └── CashRegister
│
├── Warehouse
│
├── User
├── Employee
│
├── Product
│   └── ProductVariant
│
├── Supplier
├── Customer
│
├── FinancialAccount
│
└── Operations
```

---

# 7. COMPANY

Representa la empresa propietaria del sistema.

Campos conceptuales:

```text
Company
- id
- legalName
- tradeName
- taxId
- fiscalAddress
- email
- phone
- timezone
- currency
- status
- createdAt
- updatedAt
```

Relaciones:

```text
Company
 ├── branches
 ├── warehouses
 ├── users
 ├── employees
 ├── products
 ├── suppliers
 ├── customers
 └── financialAccounts
```

---

# 8. BRANCH

Representa una sucursal física.

```text
Branch
- id
- companyId
- code
- name
- address
- phone
- status
- createdAt
- updatedAt
```

Relaciones:

```text
Branch
 ├── POS[]
 ├── CashRegister
 ├── employees
 ├── inventory
 ├── sales
 ├── reservations
 ├── transfers
 └── marketingLoans
```

---

# 9. POS

Un POS representa un terminal desde el cual trabaja un vendedor.

```text
POS
- id
- branchId
- code
- name
- status
```

Relación:

```text
Branch 1 ─── N POS
```

Importante:

> POS no es caja.

---

# 10. CASH REGISTER

Cada sucursal tiene una caja principal.

```text
CashRegister
- id
- branchId
- code
- name
- status
```

Relación:

```text
Branch 1 ─── 1 CashRegister
```

---

# 11. CASH REGISTER SESSION

Representa una apertura/cierre de caja.

```text
CashRegisterSession
- id
- cashRegisterId
- openedBy
- closedBy
- openedAt
- closedAt
- openingAmount
- expectedAmount
- countedAmount
- difference
- status
```

Una caja puede tener múltiples sesiones históricas.

```text
CashRegister 1 ─── N CashRegisterSession
```

---

# 12. USER

Usuario autenticado del sistema.

```text
User
- id
- companyId
- employeeId?
- username
- email
- passwordHash
- role
- status
- lastLoginAt
- createdAt
- updatedAt
```

Un usuario no necesariamente representa a una persona laboralmente.

Por eso:

```text
User ≠ Employee
```

---

# 13. EMPLOYEE

Representa al empleado.

```text
Employee
- id
- companyId
- employeeNumber
- firstName
- lastName
- documentNumber
- phone
- email
- branchId?
- position
- status
- hiredAt
- terminatedAt?
```

Relación opcional:

```text
Employee 1 ─── 0..1 User
```

---

# 14. WAREHOUSE

Representa un depósito.

```text
Warehouse
- id
- companyId
- code
- name
- address
- status
```

Puede existir más de un depósito en el futuro.

```text
Company 1 ─── N Warehouse
```

---

# 15. PRODUCT

Representa el modelo comercial.

Ejemplo:

```text
Remera básica
```

```text
Product
- id
- companyId
- categoryId
- brandId?
- name
- description
- status
- createdAt
- updatedAt
```

No contiene necesariamente el stock físico.

---

# 16. PRODUCT VARIANT

Representa la unidad comercial vendible.

Ejemplo:

```text
Remera básica
Talle M
Color Negro
SKU REM-NEG-M
```

Campos:

```text
ProductVariant
- id
- productId
- sku
- barcode
- size
- color
- costPrice
- salePrice
- resellerPrice
- status
```

Relación:

```text
Product 1 ─── N ProductVariant
```

---

# 17. PRICE LIST

El sistema debe permitir evolucionar desde precios simples hacia listas configurables.

```text
PriceList
- id
- companyId
- name
- type
- status
```

Y:

```text
PriceListItem
- id
- priceListId
- variantId
- price
```

Ejemplos:

```text
Minorista
Mayorista
Revendedor
Promoción
```

---

# 18. INVENTORY

Representa el estado actual de una variante en una ubicación.

```text
Inventory
- id
- variantId
- branchId?
- warehouseId?
- physicalQuantity
- reservedQuantity
- inTransitQuantity
- updatedAt
```

No debe existir simultáneamente:

```text
branchId = null
warehouseId = null
```

para una ubicación válida.

Tampoco debe existir:

```text
branchId != null
warehouseId != null
```

si el diseño establece ubicaciones mutuamente excluyentes.

---

# 19. STOCK AVAILABLE

El stock disponible se deriva conceptualmente:

```text
available =
physicalQuantity - reservedQuantity
```

No debe considerarse el stock reservado como disponible para venta.

---

# 20. STOCK MOVEMENT

Entidad fundamental.

```text
StockMovement
- id
- companyId
- variantId
- locationId
- type
- quantity
- direction
- referenceType
- referenceId
- operationId
- userId
- reason
- createdAt
```

Tipos principales:

```text
PURCHASE_RECEIPT
SALE
SALE_RETURN
TRANSFER_OUT
TRANSFER_IN
RESERVATION
RESERVATION_RELEASE
MARKETING_LOAN
MARKETING_RETURN
MARKETING_DAMAGE
MARKETING_MISSING
EXCHANGE_OUT
EXCHANGE_IN
ADJUSTMENT_IN
ADJUSTMENT_OUT
```

---

# 21. STOCK MOVEMENT REGLA FUNDAMENTAL

Nunca hacer:

```text
inventory.quantity = 50
```

sin explicar por qué.

Debe existir:

```text
StockMovement
```

que justifique el cambio.

---

# 22. SUPPLIER

```text
Supplier
- id
- companyId
- name
- taxId?
- address?
- phone?
- email?
- status
- notes
```

Relaciones:

```text
Supplier
 ├── PurchaseOrder[]
 ├── PurchaseReceipt[]
 └── SupplierPayment[]
```

---

# 23. PURCHASE ORDER

```text
PurchaseOrder
- id
- companyId
- supplierId
- number
- status
- orderDate
- expectedDate?
- subtotal
- tax
- total
- createdBy
- approvedBy?
```

---

# 24. PURCHASE ORDER ITEM

```text
PurchaseOrderItem
- id
- purchaseOrderId
- variantId
- quantityOrdered
- unitCost
- subtotal
```

---

# 25. PURCHASE RECEIPT

Representa la recepción física.

```text
PurchaseReceipt
- id
- purchaseOrderId
- supplierId
- number
- status
- receivedAt
- receivedBy
- notes
```

---

# 26. PURCHASE RECEIPT ITEM

```text
PurchaseReceiptItem
- id
- purchaseReceiptId
- purchaseOrderItemId?
- variantId
- quantityExpected
- quantityReceived
- unitCost
- differenceReason?
```

Esto permite recepción parcial.

---

# 27. TRANSFER

```text
Transfer
- id
- companyId
- originType
- originId
- destinationType
- destinationId
- number
- status
- requestedBy
- approvedBy?
- dispatchedAt?
- receivedAt?
```

Origen y destino pueden ser:

```text
WAREHOUSE
BRANCH
```

---

# 28. TRANSFER ITEM

```text
TransferItem
- id
- transferId
- variantId
- quantityRequested
- quantityPrepared
- quantityDispatched
- quantityReceived
```

Esto permite:

```text
Solicitado ≠ preparado ≠ enviado ≠ recibido
```

---

# 29. REMIT

```text
Remit
- id
- transferId
- number
- status
- issuedAt
- dispatchedAt?
- receivedAt?
- issuedBy
- receivedBy?
```

El remito documenta el traslado.

---

# 30. CUSTOMER

```text
Customer
- id
- companyId
- firstName
- lastName
- documentType?
- documentNumber?
- taxCondition?
- email?
- phone?
- address?
- status
```

Debe poder conservarse un snapshot fiscal dentro de la factura cuando sea necesario.

---

# 31. SALE

Entidad central de venta.

```text
Sale
- id
- companyId
- branchId
- posId
- cashRegisterId
- customerId?
- employeeId?
- saleType
- number
- status
- subtotal
- discount
- tax
- total
- createdBy
- completedBy?
- createdAt
- completedAt?
```

`employeeId` solamente se utiliza cuando:

```text
saleType = EMPLOYEE
```

---

# 32. SALE ITEM

```text
SaleItem
- id
- saleId
- variantId
- quantity
- unitPrice
- discount
- subtotal
- priceListId?
```

Debe conservar el precio aplicado históricamente.

No depender exclusivamente del precio actual del producto.

---

# 33. PAYMENT

Representa el pago aplicado a una operación.

```text
Payment
- id
- saleId?
- reservationId?
- supplierPaymentId?
- amount
- method
- financialAccountId?
- status
- reference?
- transactionId?
- createdBy
- createdAt
```

Debe permitir múltiples pagos:

```text
Sale
 ├── Payment 1
 ├── Payment 2
 └── Payment 3
```

---

# 34. FINANCIAL ACCOUNT

Representa dónde está el dinero o valor.

```text
FinancialAccount
- id
- companyId
- branchId?
- name
- code
- type
- institution?
- accountNumber?
- alias?
- currency
- isCentral
- isActive
```

Tipos:

```text
CASH
BANK
DIGITAL_WALLET
VALUES
VIRTUAL
OTHER
```

---

# 35. FINANCIAL MOVEMENT

```text
FinancialMovement
- id
- companyId
- type
- direction
- amount
- paymentMethod
- sourceAccountId?
- destinationAccountId?
- branchId?
- cashRegisterId?
- supplierId?
- employeeId?
- referenceType
- referenceId
- operationId
- status
- createdBy
- approvedBy?
- createdAt
- notes?
```

Tipos:

```text
SALE
CASH_WITHDRAWAL
SUPPLIER_PAYMENT
EMPLOYEE_SALARY
EMPLOYEE_PURCHASE
EXPENSE
CASH_DEPOSIT
TRANSFER
REFUND
ADJUSTMENT
```

---

# 36. INTERNAL TRANSFER

Una transferencia financiera:

```text
Banco Galicia
      ↓
Mercado Pago
```

no representa nuevo ingreso.

Debe registrarse:

```text
sourceAccount
destinationAccount
amount
```

con un único evento lógico de transferencia.

---

# 37. TREASURY

La tesorería no necesariamente requiere una entidad independiente.

Puede ser un módulo que consolida:

```text
FinancialAccount
FinancialMovement
CashRegister
CashRegisterSession
Payment
```

La fuente histórica continúa siendo `FinancialMovement`.

---

# 38. RESERVATION

```text
Reservation
- id
- companyId
- branchId
- customerId
- number
- status
- expiresAt
- subtotal
- discount
- total
- depositAmount
- balanceAmount
- createdBy
- createdAt
- updatedAt
```

---

# 39. RESERVATION ITEM

```text
ReservationItem
- id
- reservationId
- variantId
- quantity
- unitPrice
- subtotal
```

---

# 40. MARKETING LOAN

```text
MarketingLoan
- id
- companyId
- originType
- originId
- destinationType
- destinationId?
- responsibleName
- reason
- campaign?
- loanDate
- expectedReturnDate?
- actualReturnDate?
- status
- approvedBy?
- deliveredBy?
- receivedBy?
```

---

# 41. MARKETING LOAN ITEM

```text
MarketingLoanItem
- id
- marketingLoanId
- variantId
- quantity
- conditionOut
- conditionIn?
- status
```

Un préstamo no debe convertirse automáticamente en una venta.

---

# 42. EXCHANGE / RETURN

Entidad conceptual:

```text
ReturnExchange
- id
- companyId
- originalSaleId
- branchId
- cashRegisterId?
- customerId?
- type
- status
- reason
- subtotal
- refundAmount
- additionalAmount
- createdBy
- approvedBy?
- createdAt
```

Tipos:

```text
EXCHANGE
RETURN
```

---

# 43. RETURN EXCHANGE ITEM

```text
ReturnExchangeItem
- id
- returnExchangeId
- originalSaleItemId
- variantId
- quantity
- condition
- disposition
```

`originalSaleItemId` permite comprobar qué fue realmente vendido.

---

# 44. EMPLOYEE SALARY

```text
EmployeeSalary
- id
- employeeId
- period
- baseAmount
- bonusAmount
- deductionAmount
- totalAmount
- status
```

El pago se registra mediante `FinancialMovement`.

---

# 45. EMPLOYEE PURCHASE

No crear una entidad de venta independiente.

Utilizar:

```text
Sale
```

con:

```text
saleType = EMPLOYEE
employeeId = ...
```

Esto evita duplicación.

---

# 46. INVOICE

```text
Invoice
- id
- companyId
- saleId
- pointOfSale
- invoiceType
- number
- status
- customerSnapshot
- subtotal
- tax
- total
- cae?
- caeExpirationDate?
- authorizedAt?
- fiscalError?
```

La factura no reemplaza a `Sale`.

Relación:

```text
Sale 1 ─── N Invoice
```

según las necesidades fiscales del sistema.

---

# 47. AUDIT LOG

Entidad transversal.

```text
AuditLog
- id
- companyId
- userId?
- action
- entityType
- entityId
- fromStatus?
- toStatus?
- beforeData?
- afterData?
- reason?
- operationId?
- requestId?
- ip?
- userAgent?
- createdAt
```

Debe permitir reconstruir qué ocurrió.

---

# 48. OPERATION

Se recomienda introducir un identificador lógico de operación.

No necesariamente tiene que ser una entidad independiente.

Puede utilizarse:

```text
operationId
```

para agrupar:

```text
Sale
Payment
StockMovement
FinancialMovement
Invoice
AuditLog
```

Ejemplo:

```text
OP-2026-000154
```

---

# 49. ATTACHMENT / DOCUMENT

Para producción puede existir una entidad genérica para documentos asociados:

```text
Document
- id
- companyId
- entityType
- entityId
- documentType
- fileUrl
- fileName
- uploadedBy
- createdAt
```

Puede utilizarse para:

* facturas de proveedores;
* remitos;
* comprobantes;
* documentación de transferencias;
* comprobantes bancarios;
* archivos de auditoría.

---

# 50. RELACIONES PRINCIPALES

```text
Company
 │
 ├── Branch
 │    ├── POS
 │    ├── CashRegister
 │    │      └── CashRegisterSession
 │    ├── Sale
 │    ├── Reservation
 │    └── MarketingLoan
 │
 ├── Warehouse
 │
 ├── Product
 │      └── ProductVariant
 │
 ├── Supplier
 │      └── PurchaseOrder
 │             └── PurchaseOrderItem
 │
 ├── Customer
 │
 ├── FinancialAccount
 │
 ├── Employee
 │      └── EmployeeSalary
 │
 └── User
```

---

# 51. FLUJO DE STOCK

```text
Product
   ↓
ProductVariant
   ↓
Inventory
   ↓
StockMovement
   ↑
   ├── PurchaseReceipt
   ├── Sale
   ├── Transfer
   ├── Reservation
   ├── MarketingLoan
   ├── Exchange
   └── Adjustment
```

---

# 52. FLUJO DE VENTA

```text
Customer
   │
   ▼
Sale
   │
   ├── SaleItem
   │       ↓
   │   ProductVariant
   │
   ├── Payment
   │       ↓
   │   FinancialAccount
   │
   ├── StockMovement
   │
   ├── FinancialMovement
   │
   └── Invoice
```

---

# 53. FLUJO DE COMPRA

```text
Supplier
   ↓
PurchaseOrder
   ↓
PurchaseOrderItem
   ↓
PurchaseReceipt
   ↓
Inventory
   ↓
StockMovement
```

El pago al proveedor:

```text
Supplier
   ↓
SupplierPayment
   ↓
FinancialMovement
   ↓
FinancialAccount
```

---

# 54. FLUJO DE TRANSFERENCIA

```text
Transfer
   ↓
TransferItem
   ↓
Picking
   ↓
Remit
   ↓
Dispatch
   ↓
StockMovement OUT
   ↓
IN_TRANSIT
   ↓
Branch Receipt
   ↓
StockMovement IN
```

---

# 55. FLUJO DE RESERVA

```text
Reservation
   ↓
ReservationItem
   ↓
Stock reserved
   ↓
Payment / Deposit
   ↓
Customer pickup
   ↓
Sale
   ↓
StockMovement SALE
```

La reserva no debe generar una segunda salida de stock al convertirse en venta.

---

# 56. FLUJO DE PRÉSTAMO

```text
MarketingLoan
   ↓
MarketingLoanItem
   ↓
StockMovement MARKETING_LOAN
   ↓
Producto fuera de disponibilidad
   ↓
RETURN / DAMAGE / MISSING / SOLD
```

---

# 57. FLUJO DE CAMBIO

```text
Original Sale
      ↓
ReturnExchange
      ├── producto devuelto
      │       ↓
      │   Stock disposition
      │
      └── producto nuevo
              ↓
          StockMovement
```

Diferencia monetaria:

```text
ReturnExchange
      ↓
Payment
      ↓
FinancialMovement
```

---

# 58. IDENTIFICADORES

Cada entidad debe tener un identificador interno único.

Recomendación conceptual:

```text
id = UUID
```

Los documentos comerciales pueden tener además números humanos:

```text
Sale.number
PurchaseOrder.number
Transfer.number
Remit.number
Reservation.number
```

No utilizar el número comercial como clave primaria.

---

# 59. NUMERACIÓN

La numeración comercial debe ser independiente del `id`.

Ejemplo:

```text
id:
550e8400-e29b-41d4-a716-446655440000

number:
00000154
```

La numeración debe soportar concurrencia.

No confiar en:

```text
MAX(number) + 1
```

en producción.

---

# 60. DINERO

Todos los valores monetarios deben utilizar representación decimal exacta.

No utilizar `float` para dinero.

Ejemplo conceptual:

```text
Decimal(precision, scale)
```

La precisión definitiva deberá definirse durante la implementación técnica.

---

# 61. CANTIDADES

Las cantidades de prendas normalmente son enteros:

```text
1
2
5
20
```

El modelo debe permitir definir si una variante admite cantidades fraccionarias en el futuro, aunque indumentaria normalmente utilizará unidades enteras.

---

# 62. FECHAS

Las entidades operativas deben conservar:

```text
createdAt
updatedAt
```

Cuando corresponda:

```text
approvedAt
completedAt
cancelledAt
receivedAt
dispatchedAt
```

No reemplazar una fecha histórica por otra.

---

# 63. SOFT DELETE

Las entidades históricas no deben eliminarse físicamente si su eliminación rompe trazabilidad.

Preferir:

```text
status = INACTIVE
```

o:

```text
deletedAt
```

solamente cuando corresponda.

Operaciones financieras, stock, ventas y facturas deben conservar historial.

---

# 64. RESTRICCIONES IMPORTANTES

### Productos

```text
ProductVariant.sku UNIQUE
ProductVariant.barcode UNIQUE
```

dentro del alcance definido por la empresa.

### Inventario

Debe existir una única fila lógica por:

```text
location + variant
```

### POS

El código debe ser único dentro de la sucursal.

### Caja

Debe existir una caja principal por sucursal según la regla actual.

### Cuentas

El código interno debe ser único dentro de la empresa.

---

# 65. INTEGRIDAD REFERENCIAL

No permitir:

```text
SaleItem → Variant inexistente
Payment → Sale inexistente
StockMovement → Variant inexistente
TransferItem → Transfer inexistente
Invoice → Sale inexistente
ReservationItem → Reservation inexistente
```

Las relaciones críticas deben estar protegidas mediante foreign keys.

---

# 66. CONCURRENCIA

El modelo debe prepararse para situaciones como:

```text
POS 1 vende SKU X
POS 2 vende SKU X
```

simultáneamente.

Producción deberá utilizar:

* transacciones;
* constraints;
* locking cuando corresponda;
* validación de stock;
* idempotency keys.

---

# 67. MULTISUCURSAL

Toda entidad que dependa de una empresa debe estar correctamente vinculada a:

```text
companyId
```

Cuando dependa de una sucursal:

```text
branchId
```

No confiar únicamente en la interfaz para limitar el acceso.

El backend debe aplicar el aislamiento correspondiente.

---

# 68. MULTI-UBICACIÓN

El sistema debe distinguir:

```text
Warehouse
Branch
```

y no tratar ambos simplemente como texto.

Esto permite posteriormente:

```text
Location
```

como abstracción común si el diseño técnico lo justifica.

---

# 69. AUDITORÍA

Las operaciones críticas deben poder relacionarse con:

```text
User
Operation
AuditLog
```

Ejemplo:

```text
Sale #154
   │
   ├── operationId
   ├── createdBy
   ├── completedBy
   ├── Payment
   ├── StockMovement
   ├── FinancialMovement
   └── AuditLog[]
```

---

# 70. MODELO CONCEPTUAL GLOBAL

```text
                         COMPANY
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
       BRANCH            WAREHOUSE         USERS
          │                 │                 │
     ┌────┴────┐            │              EMPLOYEES
     │         │            │
    POS      CASH           │
     │         │            │
     └────┬────┘            │
          │                 │
         SALES ─────────────┤
          │                 │
    ┌─────┼─────┐           │
    │     │     │           │
 ITEMS  PAYMENTS INVOICES    │
    │     │     │            │
    │     │     │            │
 PRODUCT │ FINANCIAL         │
   │     │  ACCOUNT          │
 VARIANT│                      │
   │     │                      │
 INVENTORY ←── STOCK ──────────┘
              MOVEMENTS
                   │
        ┌──────────┼───────────┐
        │          │           │
     PURCHASE   TRANSFER    RESERVATION
        │          │           │
     SUPPLIER    REMIT     DEPOSIT
                              │
                         MARKETING LOAN
                              │
                       EXCHANGE / RETURN
```

---

# 71. REGLA DE DISEÑO PARA PRISMA

Antes de crear modelos Prisma, OpenCode debe comprobar:

1. si la entidad ya existe;
2. si el concepto puede representarse mediante una entidad existente;
3. si la relación ya está modelada;
4. si el campo duplica información;
5. si la relación necesita foreign key;
6. si necesita índice;
7. si necesita unique constraint;
8. si necesita enum;
9. si necesita auditoría;
10. si necesita `companyId`;
11. si necesita `branchId`;
12. si la eliminación está permitida.

---

# 72. NO CREAR ENTIDADES DUPLICADAS

Ejemplos explícitos:

```text
NO:
CustomerClient

SÍ:
Customer
```

```text
NO:
EmployeeSale

SÍ:
Sale
saleType = EMPLOYEE
```

```text
NO:
BankTransferSale

SÍ:
Payment
method = TRANSFERENCIA
financialAccountId = BANCO_GALICIA
```

```text
NO:
StockHistory

SÍ:
StockMovement
```

```text
NO:
CashHistory

SÍ:
CashMovement
```

---

# 73. DEMO VS PRODUCCIÓN

## Demo

Puede utilizar:

```text
localStorage
mock data
seed data
UUID
```

El modelo conceptual debe mantenerse alineado con producción.

## Producción

La implementación prevista:

```text
PostgreSQL
+
Prisma
+
transactions
+
foreign keys
+
indexes
+
constraints
```

---

# 74. CRITERIOS DE ACEPTACIÓN

El modelo se considera aprobado cuando:

* [ ] no existen entidades duplicadas;
* [ ] cada operación importante tiene una entidad clara;
* [ ] las relaciones principales están definidas;
* [ ] productos y variantes están separados;
* [ ] inventario y movimientos están separados;
* [ ] ventas y pagos están separados;
* [ ] pagos y movimientos financieros están separados;
* [ ] caja y tesorería están separadas conceptualmente;
* [ ] reservas y ventas están separadas;
* [ ] préstamos y ventas están separados;
* [ ] cambios y devoluciones mantienen referencia a la venta original;
* [ ] compras y pagos a proveedores están separados;
* [ ] factura y venta están separadas;
* [ ] auditoría es transversal;
* [ ] existe soporte multisucursal;
* [ ] existe soporte para depósito;
* [ ] existe soporte para múltiples POS;
* [ ] existe una caja por sucursal;
* [ ] se contemplan relaciones históricas;
* [ ] se contemplan constraints;
* [ ] se contemplan foreign keys;
* [ ] se contemplan índices;
* [ ] se contempla concurrencia;
* [ ] se contempla idempotencia;
* [ ] el modelo puede transformarse posteriormente en Prisma.

---

# 75. PRINCIPIO FINAL

El modelo de datos debe responder cuatro preguntas:

```text
¿QUÉ OCURRIÓ?
     ↓
Entidad / operación

¿QUÉ CAMBIÓ?
     ↓
Stock / dinero / estado

¿POR QUÉ CAMBIÓ?
     ↓
Referencia / movimiento

¿QUIÉN LO HIZO?
     ↓
User / AuditLog
```

Por lo tanto:

> **El modelo de datos no debe diseñarse alrededor de las pantallas. Debe diseñarse alrededor de las operaciones y reglas del negocio.**

La interfaz puede cambiar.

Las pantallas pueden cambiar.

Los reportes pueden cambiar.

Pero la trazabilidad de:

```text
operación → movimiento → documento → auditoría
```

debe permanecer intacta.
