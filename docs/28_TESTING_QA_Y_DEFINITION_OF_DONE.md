# 28 — TESTING, QA Y DEFINITION OF DONE

**VM Digital Studio — Sistema de Gestión Multisucursal para Empresa de Indumentaria**

**Documento:** `28_TESTING_QA_Y_DEFINITION_OF_DONE.md`
**Versión:** 1.0
**Estado:** Especificación funcional y técnica
**Último módulo del sistema:** Sí

---

# 1. OBJETIVO

Este módulo define cómo se verifica que el sistema:

* funciona correctamente;
* respeta las reglas de negocio;
* protege stock y dinero;
* respeta roles y permisos;
* mantiene consistencia entre módulos;
* registra correctamente las operaciones;
* evita duplicaciones;
* soporta errores y reintentos;
* mantiene trazabilidad;
* genera información confiable;
* está preparado para pasar de demo a producción.

Testing no debe entenderse únicamente como verificar que una pantalla funciona.

El objetivo es demostrar que:

> **Una operación realizada en el sistema produce exactamente los efectos esperados en todas las áreas relacionadas.**

Ejemplo:

Una venta no solamente debe aparecer en “Ventas”.

Una venta debe:

1. crear la operación comercial;
2. contener los productos/variantes correctos;
3. descontar stock;
4. registrar el pago;
5. afectar la cuenta financiera correspondiente;
6. afectar la caja si corresponde;
7. generar factura si corresponde;
8. registrar auditoría;
9. actualizar reportes;
10. mantener referencias hacia todas las operaciones relacionadas.

---

# 2. PRINCIPIO FUNDAMENTAL

## “No se prueba solamente una pantalla. Se prueba el flujo completo.”

El sistema debe validarse desde cuatro perspectivas:

```text
FUNCIONAL
    ↓
¿La operación hace lo que debe hacer?

NEGOCIO
    ↓
¿Respeta las reglas de la empresa?

TÉCNICA
    ↓
¿Mantiene integridad, seguridad y consistencia?

OPERATIVA
    ↓
¿Puede utilizarse correctamente por los usuarios?
```

Una funcionalidad no se considera terminada simplemente porque:

* el frontend funciona;
* el endpoint responde `200`;
* el registro aparece en PostgreSQL;
* o el usuario puede hacer clic.

Debe cumplir todas las condiciones necesarias.

---

# 3. RELACIÓN CON LOS MÓDULOS ANTERIORES

Este módulo debe validar todo lo definido anteriormente.

| Módulo | Área a validar                       |
| ------ | ------------------------------------ |
| 01     | Visión y alcance                     |
| 02     | Roles y permisos                     |
| 03     | Empresa, sucursales y POS            |
| 04     | Productos, variantes y precios       |
| 05     | Inventario y stock                   |
| 06     | Depósito                             |
| 07     | Compras y proveedores                |
| 08     | Transferencias y remitos             |
| 09     | Ventas y POS                         |
| 10     | Cajas y arqueos                      |
| 11     | Tesorería y Caja Mayor               |
| 12     | Cuentas financieras                  |
| 13     | Pagos y movimientos de dinero        |
| 14     | Reservas y señas                     |
| 15     | Préstamos para publicidad            |
| 16     | Cambios y devoluciones               |
| 17     | Empleados y sueldos                  |
| 18     | Ventas de empleados                  |
| 19     | Facturación ARCA                     |
| 20     | Reportes y exportaciones             |
| 21     | Auditoría y trazabilidad             |
| 22     | Reglas de negocio                    |
| 23     | Estados y transiciones               |
| 24     | Modelo de datos                      |
| 25     | Arquitectura técnica                 |
| 26     | Seguridad                            |
| 27     | Infraestructura y deployment         |
| **28** | **Testing, QA y Definition of Done** |

Este módulo constituye el **mecanismo de validación transversal del sistema completo**.

---

# 4. DEFINICIÓN DE QA

QA significa:

> **Quality Assurance — aseguramiento de calidad.**

QA no consiste únicamente en encontrar errores.

Debe garantizar que el sistema:

* cumple requisitos;
* mantiene consistencia;
* respeta reglas;
* es seguro;
* es usable;
* es trazable;
* es mantenible;
* puede evolucionar sin romper funcionalidades existentes.

---

# 5. CAPAS DE TESTING

El sistema utilizará diferentes niveles de pruebas.

```text
                    ┌─────────────────────┐
                    │   ACCEPTANCE / UAT   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │        E2E           │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    INTEGRATION       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │        UNIT          │
                    └─────────────────────┘

        + SECURITY
        + CONCURRENCY
        + PERFORMANCE
        + DATA INTEGRITY
        + INFRASTRUCTURE
```

No todas las funcionalidades requieren la misma profundidad.

Las operaciones críticas requieren pruebas adicionales.

---

# 6. UNIT TESTING

Los unit tests validan unidades pequeñas de lógica.

Principalmente:

* funciones;
* servicios;
* reglas;
* validadores;
* cálculos;
* transiciones;
* políticas.

---

# 7. UNIT TESTS CRÍTICOS

## 7.1 Cálculos monetarios

Debe probarse:

* subtotal;
* descuentos;
* impuestos;
* total;
* pagos;
* saldo;
* vuelto;
* diferencias.

Ejemplo:

```text
Subtotal = $100.000
Descuento = $10.000

Total = $90.000
```

Debe evitarse cualquier error de precisión monetaria.

No utilizar lógica financiera basada en `float`.

---

# 8. CÁLCULO DE PAGOS

Ejemplo:

```text
Venta = $100.000

Efectivo = $40.000
Transferencia = $30.000
Débito = $30.000

Total pagos = $100.000

Resultado:
VALID
```

Caso inválido:

```text
Venta = $100.000

Efectivo = $40.000
Transferencia = $30.000

Total = $70.000

Resultado:
INVALID
```

Debe rechazarse si la operación requiere pago completo.

---

# 9. VUELTO

Debe probarse:

```text
Venta = $80.000
Efectivo recibido = $100.000

Vuelto = $20.000
```

El sistema debe:

* registrar monto recibido;
* calcular vuelto;
* registrar ingreso real;
* registrar devolución del vuelto;
* evitar que el sistema contabilice $100.000 como ingreso neto.

---

# 10. STOCK

Los tests de stock son críticos.

Debe validarse:

```text
Stock físico
Stock reservado
Stock disponible
Stock en tránsito
```

Regla:

```text
Disponible = Físico - Reservado
```

según las reglas definidas en módulos anteriores.

---

# 11. STOCK MOVEMENTS

Cada modificación debe producir un movimiento válido.

Ejemplo:

```text
Compra recibida
        ↓
PURCHASE_RECEIPT
        ↓
+10 unidades
```

Venta:

```text
SALE
↓
-1 unidad
```

Reserva:

```text
RESERVATION
↓
incrementa reservado
```

Cancelación:

```text
RESERVATION_RELEASE
↓
libera reservado
```

El test debe verificar tanto el estado final como el movimiento generado.

---

# 12. TEST DE INVARIANTES DE STOCK

Debe existir una batería específica para verificar invariantes.

### Regla:

Nunca debe existir:

```text
stock disponible < 0
```

salvo que una futura configuración explícita permita excepciones.

También debe verificarse:

```text
stock físico
=
resultado de movimientos válidos
```

Cuando corresponda.

---

# 13. VENTA Y STOCK

Test obligatorio:

```text
Stock inicial = 10

Venta = 2

Stock final = 8
```

Además:

```text
Debe existir:
SALE movement

Debe existir:
SaleItem

Debe existir:
AuditLog
```

Si corresponde:

```text
Payment
FinancialMovement
Invoice
```

---

# 14. RESERVA

Caso:

```text
Stock físico = 10

Reserva = 2
```

Resultado:

```text
Físico = 10
Reservado = 2
Disponible = 8
```

Al cancelar:

```text
Reservado = 0
Disponible = 10
```

Debe verificarse que no se produzca una salida física de stock por una simple reserva.

---

# 15. RESERVA → VENTA

Caso:

```text
Stock = 10

Reserva = 1
```

Cliente retira.

Resultado:

```text
Reserva:
RETIRADA

Stock físico:
9

Reservado:
0

Venta:
1 unidad
```

El sistema debe evitar:

```text
-1 por reserva
-1 por venta
```

porque produciría una doble disminución.

---

# 16. TRANSFERENCIAS

Debe probarse el flujo completo:

```text
Solicitud
↓
Aprobación
↓
Preparación
↓
Picking
↓
Remito
↓
Despacho
↓
TRANSFER_OUT
↓
IN_TRANSIT
↓
Recepción
↓
TRANSFER_IN
```

---

# 17. TEST DE TRANSFERENCIA

Ejemplo:

```text
Depósito:
20 unidades

Transferencia:
5 unidades → Sucursal A
```

Después del despacho:

```text
Origen = 15
En tránsito = 5
Destino = 0
```

Después de recepción:

```text
Origen = 15
En tránsito = 0
Destino = 5
```

Nunca debe aparecer:

```text
Origen = 15
Destino = 5
En tránsito = 5
```

porque eso duplicaría stock.

---

# 18. RECEPCIÓN PARCIAL

Caso:

```text
Transferencia = 10

Recibido = 8
```

Debe permanecer:

```text
8 recibidas
2 pendientes
```

El sistema debe permitir:

* incidencia;
* recepción posterior;
* cancelación de remanente según reglas;
* trazabilidad.

---

# 19. COMPRAS

Debe probarse:

```text
PurchaseOrder
↓
PurchaseReceipt
↓
Inventory
↓
StockMovement
```

Debe diferenciarse:

```text
Compra registrada
≠
Mercadería recibida
≠
Factura proveedor
≠
Pago proveedor
```

---

# 20. RECEPCIÓN PARCIAL DE COMPRA

Ejemplo:

```text
Orden:
100 unidades

Primera recepción:
60

Segunda recepción:
40
```

Resultado:

```text
Recibido = 100
Pendiente = 0
```

No debe generarse stock por las 100 unidades antes de recibirlas físicamente.

---

# 21. POS Y CAJA

Test crítico:

```text
VENDEDOR
↓
crea venta
↓
PENDING_PAYMENT
↓
CAJERO
↓
cobra
↓
PAID
```

El vendedor no debe poder cerrar la caja.

El cajero no debe necesitar recrear la venta.

---

# 22. PRUEBA DE SEPARACIÓN POS / CAJA

Debe existir un test de autorización:

```text
Seller:
crear venta → permitido

Seller:
finalizar caja → rechazado

Cashier:
finalizar venta → permitido

Cashier:
arqueo → permitido
```

La UI no es suficiente.

Debe validarse en backend.

---

# 23. CAJA

Debe probarse:

```text
OPENING_BALANCE
+
SALE_CASH
+
CASH_IN
-
CASH_OUT
-
REFUND_CASH
=
EXPECTED_CASH
```

El resultado debe compararse con:

```text
PHYSICAL_CASH
```

y generar:

```text
difference
```

---

# 24. ARQUEO

Ejemplo:

```text
Esperado = $500.000
Contado = $498.000

Diferencia = -$2.000
```

La diferencia:

* no debe desaparecer;
* no debe corregirse automáticamente;
* debe quedar registrada;
* debe identificar responsable;
* debe formar parte de auditoría.

---

# 25. TESORERÍA

Debe probarse que cada movimiento financiero tenga:

```text
origen
destino
monto
fecha
tipo
referencia
usuario
estado
```

Cuando corresponda.

---

# 26. CUENTAS FINANCIERAS

Ejemplo:

```text
Caja Sucursal A
Banco Macro
Mercado Pago
```

Una transferencia interna:

```text
Caja → Banco
```

no debe aumentar el patrimonio financiero total.

Solo cambia dónde está el dinero.

---

# 27. PRUEBA DE NO DOBLE CONTABILIZACIÓN

Caso:

```text
Venta:
$100.000

Pago:
Mercado Pago
```

Debe existir:

```text
Sale = $100.000
Payment = $100.000
FinancialMovement = +$100.000
```

Pero los reportes financieros no deben contabilizar:

```text
$300.000
```

Debe contabilizarse:

```text
$100.000
```

---

# 28. PAGOS COMBINADOS

Test:

```text
Venta = $150.000

Efectivo = $50.000
Mercado Pago = $50.000
Tarjeta = $50.000
```

Resultado:

```text
Total = $150.000
Estado = PAID
```

Debe verificarse cada Payment individual.

---

# 29. PAGOS INCOMPLETOS

Si la venta exige pago completo:

```text
Venta = $150.000
Pagado = $100.000
```

No debe pasar automáticamente a:

```text
PAID
```

Debe permanecer en el estado correspondiente de pago parcial o impedir finalización según configuración.

---

# 30. DEVOLUCIONES

Una devolución nunca debe modificar destructivamente la venta original.

Debe:

```text
Venta original
       ↓
ReturnExchange
       ↓
Stock movement
       ↓
Financial movement
```

Debe verificarse que no pueda devolverse más cantidad de la originalmente vendida.

---

# 31. CAMBIOS

Caso:

```text
Cliente devuelve:
Remera talle M

Recibe:
Remera talle L
```

Debe generarse:

```text
EXCHANGE_OUT → M
EXCHANGE_IN → L
```

y actualizar stock correctamente.

---

# 32. DIFERENCIA DE PRECIO

Caso:

```text
Producto original = $50.000
Producto nuevo = $70.000

Diferencia = $20.000
```

Debe generarse:

```text
Payment = $20.000
FinancialMovement = +$20.000
```

Si ocurre lo contrario:

```text
Producto nuevo = $40.000
```

debe generarse un proceso de devolución/reintegro conforme a las reglas configuradas.

---

# 33. PRÉSTAMOS DE PUBLICIDAD

Caso:

```text
Stock = 10

Préstamo = 1
```

Debe producir:

```text
Stock físico disponible para venta = 9
MarketingLoan = DELIVERED
```

No debe convertirse en una venta.

---

# 34. DEVOLUCIÓN DE PRÉSTAMO

Caso:

```text
Prestado = 1
Devuelto = 1
```

Debe:

```text
MARKETING_RETURN
```

y devolver la unidad al stock disponible cuando corresponda.

---

# 35. PRODUCTO NO DEVUELTO

Caso:

```text
Préstamo = 1
Producto no vuelve
```

Debe pasar a:

```text
MISSING
```

y generar el movimiento correspondiente.

No debe simplemente eliminarse del inventario sin explicación.

---

# 36. PRODUCTO DAÑADO

Caso:

```text
Prestado = 1
Devuelto dañado = 1
```

Debe registrarse:

```text
MARKETING_RETURN
+
MARKETING_DAMAGE
```

o la secuencia definida por la implementación.

Debe existir evidencia del estado del producto.

---

# 37. PRODUCTO VENDIDO DURANTE PRÉSTAMO

Si el producto finalmente se vende:

```text
MarketingLoan
↓
SOLD
↓
Sale
```

Debe evitarse doble descuento de stock.

---

# 38. EMPLEADOS

Debe probarse la separación:

```text
User
≠
Employee
≠
FinancialMovement
```

Un empleado puede existir sin tener acceso al sistema.

Un usuario puede acceder al sistema sin necesariamente representar una operación salarial.

---

# 39. SUELDOS

Test:

```text
Salary period
↓
Calculation
↓
Approval
↓
Payment
↓
FinancialMovement
```

Debe comprobarse que:

* el sueldo aprobado no se modifique silenciosamente;
* el pago quede registrado;
* el movimiento financiero tenga referencia al empleado;
* un segundo intento no genere doble pago.

---

# 40. VENTA A EMPLEADO

Debe utilizar la misma estructura base de venta:

```text
Sale
saleType = EMPLOYEE
employeeId = ...
```

Debe probarse:

```text
Stock ↓
```

pero:

```text
FinancialMovement
```

solo cuando exista efectivamente un movimiento monetario o una aplicación de deuda.

---

# 41. FACTURACIÓN ARCA

La integración fiscal debe probarse separadamente.

Durante demo:

```text
ARCA = MOCK / SIMULADO
```

Nunca debe conectarse accidentalmente el entorno demo con producción fiscal.

---

# 42. TEST DE FACTURACIÓN

Debe probarse:

```text
Sale
↓
FiscalProvider
↓
ARCAAdapter
↓
respuesta
↓
Invoice
```

Casos:

* autorización exitosa;
* rechazo;
* timeout;
* credenciales inválidas;
* respuesta inesperada;
* operación duplicada;
* reintento.

---

# 43. IDEMPOTENCIA FISCAL

Si el sistema envía dos veces la misma operación por un retry:

```text
request #1
request #2
```

no debe terminar generando dos facturas para una misma operación.

Debe existir:

```text
idempotency key
operationId
external reference
```

según arquitectura.

---

# 44. SEGURIDAD

Los tests de seguridad deben verificar:

### Autenticación

* login;
* logout;
* sesión inválida;
* token expirado;
* contraseña incorrecta;
* bloqueo/rate limit.

### Autorización

* permisos;
* roles;
* alcance por empresa;
* alcance por sucursal.

---

# 45. IDOR

Debe probarse que un usuario no pueda acceder a recursos de otra sucursal simplemente cambiando:

```text
/sales/123
```

por:

```text
/sales/124
```

El backend debe validar:

```text
identity
+
permission
+
company scope
+
branch scope
+
resource authorization
```

---

# 46. PRIVILEGE ESCALATION

Debe probarse que:

```text
SELLER
```

no pueda transformarse en:

```text
ADMIN
```

modificando una petición HTTP.

El backend debe ignorar cualquier intento de escalamiento no autorizado.

---

# 47. TESTS DE ESTADOS

Cada máquina de estados del módulo 23 debe tener pruebas.

Ejemplo:

```text
SALE

DRAFT
 ↓
PENDING_PAYMENT
 ↓
PAYMENT_IN_PROGRESS
 ↓
PAID
 ↓
COMPLETED
```

Debe probarse tanto:

```text
transición válida
```

como:

```text
transición inválida
```

---

# 48. TRANSICIONES INVÁLIDAS

Ejemplo:

```text
COMPLETED
↓
DRAFT
```

Debe rechazarse.

Para modificar una operación histórica debe utilizarse:

```text
cancelación
devolución
ajuste
compensating operation
```

según corresponda.

---

# 49. INTEGRATION TESTING

Los integration tests validan interacción entre componentes.

Ejemplos:

```text
API
+
Prisma
+
PostgreSQL
```

o:

```text
SaleService
+
InventoryService
+
PaymentService
+
AuditService
```

---

# 50. TEST DE VENTA COMPLETA

Debe ejecutarse una venta real sobre entorno de testing:

```text
Login
↓
POS
↓
crear venta
↓
seleccionar variante
↓
aplicar descuento permitido
↓
PENDING_PAYMENT
↓
Cashier
↓
Payment
↓
finalización
↓
Stock
↓
Caja/Tesorería
↓
Invoice mock
↓
AuditLog
```

El test debe comprobar todo el resultado.

---

# 51. TEST DE COMPRA COMPLETA

```text
Supplier
↓
PurchaseOrder
↓
PurchaseReceipt
↓
Inventory
↓
StockMovement
↓
Supplier invoice
↓
Payment
↓
FinancialMovement
↓
AuditLog
```

---

# 52. TEST DE TRANSFERENCIA COMPLETA

```text
Warehouse
↓
TransferRequest
↓
Approval
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
BranchReceipt
↓
TRANSFER_IN
↓
AuditLog
```

---

# 53. TEST DE RESERVA COMPLETA

```text
Product
↓
Reservation
↓
Deposit
↓
Reserved stock
↓
Customer pickup
↓
Sale
↓
Payment
↓
Stock exit
↓
Reservation = RETIRADA
```

Debe verificarse que el depósito no sea cobrado nuevamente.

---

# 54. TEST DE CAMBIO COMPLETO

```text
Original Sale
↓
ReturnExchange
↓
Original item OUT
↓
New item IN
↓
Price difference
↓
Payment / Refund
↓
FinancialMovement
↓
Audit
```

---

# 55. END-TO-END TESTING

Los E2E simulan el comportamiento real del usuario.

Debe probarse el sistema desde la interfaz hasta la persistencia.

Ejemplo:

```text
Usuario entra
↓
selecciona sucursal
↓
abre POS
↓
busca producto
↓
agrega variante
↓
crea venta
↓
envía a caja
↓
cajero cobra
↓
venta finalizada
```

Después:

```text
consultar stock
consultar caja
consultar reporte
consultar auditoría
```

---

# 56. E2E POR ROL

Debe existir al menos un escenario E2E para:

```text
ADMIN
MANAGER
CASHIER
SELLER
WAREHOUSE
TREASURY
ACCOUNTING
```

según los roles implementados.

Cada rol debe visualizar y ejecutar únicamente aquello que le corresponde.

---

# 57. REGRESSION TESTING

Cada cambio importante debe ejecutar una suite de regresión.

Especialmente después de modificar:

* ventas;
* stock;
* pagos;
* caja;
* transferencias;
* permisos;
* estados;
* facturación;
* modelo de datos.

Una modificación en stock puede romper ventas.

Una modificación en pagos puede romper caja.

Una modificación en usuarios puede romper autorización.

Por eso los módulos críticos no deben probarse de forma aislada.

---

# 58. TESTS DE CONCURRENCIA

Son críticos para operaciones de stock y dinero.

Caso:

```text
Stock = 1
```

Dos vendedores intentan vender simultáneamente.

```text
POS A → vender 1
POS B → vender 1
```

Resultado correcto:

```text
Una operación:
SUCCESS

Otra:
REJECTED
```

No:

```text
Stock = -1
```

---

# 59. CONCURRENCIA DE CAJA

Dos terminales pueden enviar ventas simultáneamente al mismo cajero/caja.

Debe verificarse que:

* no se pierdan pagos;
* no se dupliquen movimientos;
* el cierre incluya todas las operaciones válidas;
* no haya race conditions.

---

# 60. CONCURRENCIA DE RESERVAS

Si existen:

```text
Stock disponible = 1
```

y dos usuarios intentan reservar:

```text
Cliente A → reserva
Cliente B → reserva
```

solo una debe obtener la unidad.

---

# 61. IDEMPOTENCY TESTING

Toda operación crítica susceptible de retry debe probarse con solicitudes repetidas.

Ejemplo:

```text
POST /sales/:id/finalize
```

enviado dos veces.

Resultado esperado:

```text
Primera:
SUCCESS

Segunda:
NO DUPLICA OPERACIÓN
```

---

# 62. DOUBLE SUBMIT

Debe probarse doble clic:

```text
[ FINALIZAR VENTA ]

click
click
```

No debe producir:

```text
2 Payments
2 FinancialMovements
2 StockMovements
2 Invoices
```

Debe existir protección tanto frontend como backend.

---

# 63. TEST DE AUDITORÍA

Toda operación crítica debe generar evidencia.

Debe verificarse:

```text
actor
action
entity
entityId
timestamp
branch
operationId
reference
```

cuando corresponda.

---

# 64. RECONSTRUCCIÓN DE OPERACIONES

QA debe poder tomar una operación y reconstruir:

```text
¿Quién?
¿Qué?
¿Cuándo?
¿Dónde?
¿Por qué?
¿Qué cambió?
¿Qué dinero movió?
¿Qué stock movió?
¿Qué documento generó?
```

Si no puede reconstruirse, la trazabilidad es insuficiente.

---

# 65. TEST DE REPORTES

Los reportes deben validarse contra datos conocidos.

Ejemplo:

```text
Ventas:
$500.000
```

Reporte diario debe mostrar:

```text
$500.000
```

No:

```text
$1.000.000
```

por contabilización duplicada.

---

# 66. TEST DE CONSISTENCIA ENTRE REPORTES

El sistema debe mantener consistencia entre:

```text
Ventas
Caja
Tesorería
Cuentas financieras
Stock
Facturación
```

Ejemplo:

Una venta en efectivo debe reflejarse en:

```text
Venta
+
Payment
+
CashMovement
+
FinancialMovement
+
StockMovement
```

y aparecer correctamente en reportes.

---

# 67. EXPORTACIONES

Debe probarse:

```text
CSV
XLSX
```

cuando estén implementados.

Validar:

* columnas;
* filtros;
* fechas;
* totales;
* encoding;
* permisos;
* datos sensibles;
* cantidad de registros.

---

# 68. SEGURIDAD DE EXPORTACIONES

Un vendedor no debe poder exportar:

```text
sueldos
tesorería global
información bancaria sensible
```

si no tiene autorización.

La seguridad debe aplicarse también al export.

---

# 69. TEST DE DATOS

Debe existir un dataset controlado para QA.

Ejemplo:

```text
1 empresa
3 sucursales
1 depósito
3 cajas/POS según configuración
10 usuarios
20 productos
múltiples variantes
3 proveedores
clientes
empleados
cuentas financieras
ventas
compras
transferencias
reservas
préstamos
cambios
```

---

# 70. FIXTURES

Los tests deben utilizar datos reproducibles.

Ejemplo:

```text
TEST COMPANY
TEST BRANCH A
TEST WAREHOUSE
TEST PRODUCT
TEST CUSTOMER
TEST EMPLOYEE
```

No deben depender de datos manuales impredecibles.

---

# 71. TEST DATA RESET

Cada suite debe poder:

```text
crear dataset
ejecutar pruebas
validar
limpiar/resetear
```

Esto permite repetir pruebas sin contaminar resultados.

---

# 72. TEST DE BASE DE DATOS

Debe verificarse:

* foreign keys;
* unique constraints;
* not-null;
* índices;
* relaciones;
* cascadas;
* soft delete;
* integridad referencial;
* precisión monetaria.

---

# 73. TEST DE MIGRACIONES

Cada migration debe probarse en:

```text
database vacía
database existente
database con datos de prueba
```

No debe asumirse que una migración funciona solamente sobre una DB nueva.

---

# 74. TEST DE BACKUP Y RESTORE

Según el módulo 27, producción debe contar con backups.

QA debe validar:

```text
Backup
↓
Restore
↓
Aplicación
↓
Datos accesibles
```

Un backup que nunca fue restaurado no debe considerarse completamente validado.

---

# 75. TEST DE HEALTH CHECK

Debe existir al menos:

```text
/health
```

y, cuando corresponda:

```text
/readiness
```

Debe comprobarse:

```text
API disponible
DB disponible
dependencias críticas disponibles
```

---

# 76. TEST DE CONFIGURACIÓN

Debe verificarse separación:

```text
development
demo
staging
production
```

Especialmente:

```text
ARCA credentials
DATABASE
JWT/session secrets
API keys
WEBHOOK secrets
```

Nunca deben mezclarse ambientes.

---

# 77. TEST DE ARCA DEMO

En demo:

```text
ARCA_REAL = false
```

Debe utilizarse:

```text
MockFiscalProvider
```

y generar:

```text
CAE DEMO / SIMULADO
```

con:

```text
COMPROBANTE DEMOSTRATIVO
SIN VALIDEZ FISCAL
```

---

# 78. TEST DE UI / UX

QA también debe validar:

* navegación;
* formularios;
* mensajes de error;
* loading;
* estados vacíos;
* confirmaciones;
* botones según permisos;
* responsive;
* legibilidad;
* feedback después de operaciones.

---

# 79. ERROR HANDLING

Debe probarse:

```text
400
401
403
404
409
422
429
500
```

cuando correspondan.

Los errores deben ser:

* consistentes;
* comprensibles;
* seguros;
* sin filtrar información sensible.

---

# 80. TEST DE VALIDACIÓN

Debe probarse entrada inválida:

```text
amount = -100
quantity = -1
price = texto
branchId inválido
productId inexistente
payment total incorrecto
```

El backend debe rechazarla.

---

# 81. PERFORMANCE TESTING

No se busca optimización prematura durante la demo.

En producción deben medirse:

* tiempo de respuesta;
* consultas;
* endpoints críticos;
* generación de reportes;
* exportaciones;
* concurrencia;
* consumo de memoria;
* CPU;
* PostgreSQL.

---

# 82. ENDPOINTS CRÍTICOS PARA PERFORMANCE

Especial atención:

```text
POST /sales
POST /sales/:id/finalize
GET /inventory
GET /reports/sales
GET /reports/stock
GET /treasury
GET /cash-register
```

y cualquier endpoint de búsqueda/listado utilizado frecuentemente.

---

# 83. LOAD TESTING

Debe simularse progresivamente:

```text
1 usuario
10 usuarios
25 usuarios
50 usuarios
100 usuarios
```

según la escala real esperada.

No se debe asumir que la aplicación escala simplemente porque funciona con un usuario.

---

# 84. TEST DE LOGGING

Debe verificarse:

* errores registrados;
* requestId/correlationId;
* operación identificable;
* usuario identificable cuando corresponda;
* timestamps;
* nivel de log correcto.

No deben aparecer:

```text
passwords
tokens
secret keys
credenciales ARCA
datos bancarios completos
```

en logs.

---

# 85. TEST DE OBSERVABILIDAD

Debe poder responderse:

```text
¿La API está funcionando?
¿La DB está funcionando?
¿Hay errores?
¿Dónde están ocurriendo?
¿Qué operación produjo el error?
```

---

# 86. TEST DE RECUPERACIÓN

Debe simularse:

```text
API caída
DB temporalmente inaccesible
timeout
request repetida
servicio reiniciado
```

El sistema debe recuperarse sin duplicar operaciones.

---

# 87. TEST DE BACKEND AUTHORITY

Debe comprobarse que:

```text
Frontend dice:
"permitido"

```

no significa automáticamente que:

```text
Backend:
"permitido"
```

El backend siempre debe ser la autoridad final.

---

# 88. TEST DE REGLAS DE NEGOCIO

Todas las reglas críticas del módulo 22 deben transformarse progresivamente en tests.

Ejemplo:

```text
RULE:
Seller cannot close cash.

TEST:
seller attempts close cash.

EXPECTED:
403 Forbidden.
```

Esto convierte las reglas de negocio en comportamiento verificable.

---

# 89. MATRIZ DE TESTING

| Área            | Unit | Integration | E2E | Security | Concurrency |
| --------------- | ---: | ----------: | --: | -------: | ----------: |
| Auth            |    ✓ |           ✓ |   ✓ |        ✓ |             |
| RBAC            |    ✓ |           ✓ |   ✓ |        ✓ |             |
| Productos       |    ✓ |           ✓ |   ✓ |        ✓ |             |
| Stock           |    ✓ |           ✓ |   ✓ |        ✓ |           ✓ |
| Compras         |    ✓ |           ✓ |   ✓ |        ✓ |             |
| Transferencias  |    ✓ |           ✓ |   ✓ |        ✓ |           ✓ |
| Ventas          |    ✓ |           ✓ |   ✓ |        ✓ |           ✓ |
| POS             |    ✓ |           ✓ |   ✓ |        ✓ |           ✓ |
| Caja            |    ✓ |           ✓ |   ✓ |        ✓ |           ✓ |
| Tesorería       |    ✓ |           ✓ |   ✓ |        ✓ |           ✓ |
| Pagos           |    ✓ |           ✓ |   ✓ |        ✓ |           ✓ |
| Reservas        |    ✓ |           ✓ |   ✓ |        ✓ |           ✓ |
| Préstamos       |    ✓ |           ✓ |   ✓ |        ✓ |             |
| Cambios         |    ✓ |           ✓ |   ✓ |        ✓ |             |
| Empleados       |    ✓ |           ✓ |   ✓ |        ✓ |             |
| ARCA            |    ✓ |           ✓ |   ✓ |        ✓ |           ✓ |
| Reportes        |    ✓ |           ✓ |   ✓ |        ✓ |             |
| Auditoría       |    ✓ |           ✓ |   ✓ |        ✓ |             |
| Infraestructura |      |           ✓ |   ✓ |        ✓ |             |

---

# 90. CRITICAL PATH TESTS

Antes de cualquier release deben pasar obligatoriamente:

```text
LOGIN
↓
AUTHORIZATION
↓
PRODUCT
↓
STOCK
↓
SALE
↓
PAYMENT
↓
CASH/TREASURY
↓
INVOICE
↓
AUDIT
↓
REPORT
```

Y:

```text
PURCHASE
↓
RECEIPT
↓
STOCK
```

```text
TRANSFER
↓
DISPATCH
↓
RECEIPT
↓
STOCK
```

```text
RESERVATION
↓
DEPOSIT
↓
PICKUP
↓
SALE
```

---

# 91. TEST DE NO REGRESIÓN CRÍTICA

Nunca debe aprobarse una release si una modificación rompe:

* venta;
* stock;
* caja;
* pagos;
* autorización;
* auditoría.

Estas áreas constituyen el núcleo operacional.

---

# 92. BUG SEVERITY

Los errores deben clasificarse.

## P0 — Critical

Ejemplos:

* duplicación de dinero;
* pérdida de dinero;
* stock corrupto;
* acceso no autorizado grave;
* facturación fiscal incorrecta;
* corrupción de datos.

Bloquea release inmediatamente.

---

## P1 — High

Ejemplos:

* venta imposible;
* cierre de caja incorrecto;
* transferencia incorrecta;
* reserva inconsistente;
* permisos críticos incorrectos.

Bloquea release normalmente.

---

## P2 — Medium

Ejemplos:

* reporte incorrecto no crítico;
* UX defectuosa;
* filtros incorrectos;
* mensajes incompletos.

Puede bloquear dependiendo del contexto.

---

## P3 — Low

Ejemplos:

* detalles visuales;
* textos;
* pequeños problemas cosméticos.

No necesariamente bloquea release.

---

# 93. BUG REPORT

Cada bug debe registrar:

```text
ID
Título
Severidad
Prioridad
Ambiente
Usuario
Sucursal
Fecha
Pasos para reproducir
Resultado esperado
Resultado actual
Evidencia
Logs
requestId
operationId
Estado
Responsable
```

---

# 94. BUG LIFECYCLE

```text
OPEN
↓
TRIAGED
↓
IN_PROGRESS
↓
FIXED
↓
READY_FOR_TEST
↓
VERIFIED
↓
CLOSED
```

Si vuelve a aparecer:

```text
REOPENED
```

---

# 95. ACCEPTANCE TESTING

Antes de considerar una funcionalidad terminada debe verificarse desde perspectiva del negocio.

Ejemplo:

### Venta

El cliente debe poder comprobar que:

* vendedor crea venta;
* caja recibe venta;
* cajero cobra;
* pago queda registrado;
* stock disminuye;
* comprobante se genera;
* reporte se actualiza.

---

# 96. USER ACCEPTANCE TEST — UAT

La UAT debe realizarse con escenarios reales o representativos.

Ejemplos:

```text
1. Vender una prenda
2. Cobrar con efectivo
3. Cobrar combinado
4. Reservar una prenda
5. Retirar reserva
6. Hacer un cambio
7. Recibir mercadería
8. Transferir mercadería
9. Hacer arqueo
10. Consultar reportes
```

---

# 97. DEMO ACCEPTANCE

La demo debe utilizar escenarios preparados.

Objetivo:

> Mostrar que el sistema representa correctamente los procesos reales de la empresa.

La demo no debe intentar demostrar infraestructura productiva inexistente.

---

# 98. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
Mock API
localStorage
Mock ARCA
datos controlados
ambiente simplificado
```

## PRODUCCIÓN

Debe utilizar:

```text
PostgreSQL
Prisma
API real
autenticación real
RBAC
auditoría
backups
HTTPS
ARCA real
observabilidad
CI/CD
```

---

# 99. DEFINITION OF DONE

Una funcionalidad se considera **DONE** solamente cuando:

### Funcional

* [ ] cumple el requisito;
* [ ] funciona en happy path;
* [ ] funciona en casos alternativos;
* [ ] maneja errores.

### Negocio

* [ ] respeta reglas;
* [ ] respeta estados;
* [ ] respeta permisos;
* [ ] no rompe stock;
* [ ] no rompe dinero.

### Técnica

* [ ] código integrado;
* [ ] validación backend;
* [ ] persistencia correcta;
* [ ] transacción cuando corresponde;
* [ ] idempotencia cuando corresponde;
* [ ] concurrency control cuando corresponde.

### Seguridad

* [ ] autorización;
* [ ] scope;
* [ ] validación;
* [ ] no exposición sensible;
* [ ] logs seguros.

### Auditoría

* [ ] AuditLog;
* [ ] usuario;
* [ ] fecha;
* [ ] referencia;
* [ ] operación reconstruible.

### Testing

* [ ] unit tests;
* [ ] integration tests;
* [ ] E2E cuando corresponda;
* [ ] regresión;
* [ ] QA manual.

### Documentación

* [ ] reglas documentadas;
* [ ] estados documentados;
* [ ] comportamiento conocido;
* [ ] cambios registrados.

---

# 100. DEFINITION OF DONE — OPERACIÓN CRÍTICA

Para:

```text
Venta
Pago
Devolución
Cambio
Transferencia
Reserva
Compra
Movimiento financiero
Arqueo
Factura
```

la Definition of Done es más estricta.

Debe existir:

```text
Operación
+
Validación
+
Persistencia
+
Movimiento
+
Auditoría
+
Prueba
```

---

# 101. RELEASE GATES

No se puede liberar una versión si falla:

### Gate 1 — Build

```text
npm run build
```

debe pasar.

### Gate 2 — Type checking

Sin errores TypeScript.

### Gate 3 — Lint

Sin errores críticos.

### Gate 4 — Unit

Suite verde.

### Gate 5 — Integration

Suite verde.

### Gate 6 — E2E

Critical path verde.

### Gate 7 — Security

Sin vulnerabilidades críticas conocidas.

### Gate 8 — Database

Migrations verificadas.

### Gate 9 — Backup

Backup/restore probado cuando corresponda.

### Gate 10 — Business

UAT aprobado.

---

# 102. RELEASE BLOCKERS

Bloquean automáticamente una release:

```text
stock negativo inesperado
duplicación de venta
duplicación de pago
duplicación de factura
pérdida financiera
acceso no autorizado
corrupción de datos
fallo de migración
pérdida de auditoría
doble descuento de stock
doble contabilización
```

---

# 103. CHECKLIST PRE-DEMO

```text
[ ] Build funciona
[ ] Demo environment configurado
[ ] Datos demo cargados
[ ] Usuarios demo creados
[ ] Sucursales creadas
[ ] Productos creados
[ ] Variantes creadas
[ ] Stock inicial
[ ] POS disponible
[ ] Caja disponible
[ ] Ventas funcionando
[ ] Pagos funcionando
[ ] Reservas funcionando
[ ] Cambios funcionando
[ ] Transferencias funcionando
[ ] Reportes funcionando
[ ] Auditoría visible
[ ] ARCA claramente SIMULADO
```

---

# 104. CHECKLIST PRE-PRODUCCIÓN

```text
[ ] PostgreSQL production
[ ] migrations
[ ] backups
[ ] restore test
[ ] HTTPS
[ ] secrets
[ ] CORS
[ ] rate limiting
[ ] authentication
[ ] RBAC
[ ] audit
[ ] logging
[ ] monitoring
[ ] health checks
[ ] ARCA credentials
[ ] fiscal environment verified
[ ] database indexes
[ ] concurrency controls
[ ] idempotency
[ ] production smoke test
[ ] UAT
[ ] rollback plan
```

---

# 105. SMOKE TEST

Después de cada deployment debe ejecutarse un conjunto pequeño:

```text
Login
↓
Dashboard
↓
Producto
↓
Stock
↓
Venta
↓
Pago
↓
Caja
↓
Reporte
↓
Logout
```

Si falla un punto crítico:

```text
DEPLOYMENT = FAILED
```

---

# 106. POST-DEPLOYMENT VALIDATION

Después del deploy:

1. verificar health;
2. verificar DB;
3. ejecutar smoke tests;
4. revisar logs;
5. verificar errores;
6. comprobar operaciones críticas;
7. comprobar métricas;
8. validar integraciones;
9. confirmar estado.

---

# 107. ROLLBACK

Si una release produce errores críticos:

```text
Detect
↓
Stop
↓
Assess
↓
Rollback
↓
Validate
↓
Investigate
↓
Fix
↓
Retest
↓
Redeploy
```

No debe intentar corregirse manualmente una base de datos productiva sin procedimiento controlado.

---

# 108. TESTING EN CI/CD

El pipeline debe poder ejecutar:

```text
install
↓
lint
↓
typecheck
↓
unit
↓
integration
↓
build
↓
E2E
↓
security checks
↓
deploy
```

según el ambiente.

---

# 109. BRANCH STRATEGY Y QA

Una propuesta simple:

```text
main
│
├── feature/*
├── fix/*
└── hotfix/*
```

Cada cambio debe:

```text
develop
↓
test
↓
review
↓
merge
```

No desplegar directamente código experimental a producción.

---

# 110. TESTING CON OPENCODE

OpenCode debe utilizar este módulo como guía de implementación.

Antes de declarar una funcionalidad terminada debe verificar:

```text
[ ] ¿Existe regla de negocio?
[ ] ¿Existe estado?
[ ] ¿Existe autorización?
[ ] ¿Existe validación backend?
[ ] ¿Qué entidad cambia?
[ ] ¿Qué stock cambia?
[ ] ¿Qué dinero cambia?
[ ] ¿Qué movimiento se genera?
[ ] ¿Qué auditoría se genera?
[ ] ¿Qué pasa si falla?
[ ] ¿Qué pasa si se repite?
[ ] ¿Qué pasa si dos usuarios lo hacen simultáneamente?
[ ] ¿Qué tests lo cubren?
```

---

# 111. CHECKLIST DE IMPLEMENTACIÓN OPENCODE

Para cada feature:

```text
1. Leer módulo funcional relacionado.
2. Leer reglas de negocio.
3. Leer estados.
4. Leer modelo de datos.
5. Leer arquitectura.
6. Leer seguridad.
7. Implementar backend.
8. Implementar frontend.
9. Implementar validación.
10. Implementar transacción.
11. Implementar auditoría.
12. Implementar idempotencia.
13. Crear unit tests.
14. Crear integration tests.
15. Crear E2E.
16. Ejecutar regresión.
17. Revisar Definition of Done.
```

No declarar:

```text
DONE
```

hasta completar el proceso correspondiente.

---

# 112. TEST FIRST PARA REGLAS CRÍTICAS

Para reglas particularmente importantes puede utilizarse:

```text
Rule
↓
Test
↓
Implementation
```

Ejemplo:

```text
RULE:
Seller cannot close cash.

TEST:
seller → close cash

EXPECTED:
403
```

Luego implementar.

Esto reduce regresiones.

---

# 113. PROPERTY / INVARIANT TESTING

Para operaciones críticas deben validarse invariantes.

Ejemplos:

```text
totalPayments = totalSale
```

cuando el pago completo es requerido.

```text
availableStock >= 0
```

cuando no se permite stock negativo.

```text
sourceAccount != destinationAccount
```

para transferencias internas.

```text
returnedQuantity <= soldQuantity
```

para devoluciones.

---

# 114. DATA CONSISTENCY TEST

Debe existir una verificación periódica que encuentre inconsistencias.

Ejemplos:

```text
Stock actual ≠ movimientos
```

```text
Caja ≠ movimientos de caja
```

```text
Cuenta financiera ≠ movimientos financieros
```

```text
Reserva activa sin stock reservado
```

```text
Venta completada sin payment
```

cuando el pago sea obligatorio.

```text
Factura asociada a venta inexistente
```

---

# 115. RECONCILIATION TESTS

Debe poder compararse:

```text
Ventas
vs
Pagos
```

```text
Caja
vs
Cash movements
```

```text
Tesorería
vs
Financial movements
```

```text
Stock
vs
Stock movements
```

Las diferencias deben detectarse, no ocultarse.

---

# 116. DAILY QA

En producción puede ejecutarse una verificación diaria:

```text
[ ] operaciones fallidas
[ ] pagos inconsistentes
[ ] stock negativo
[ ] reservas inconsistentes
[ ] transferencias pendientes
[ ] facturación fallida
[ ] diferencias de caja
[ ] movimientos financieros inconsistentes
[ ] errores de integración
```

---

# 117. TESTING DE AUDITORÍA DE NEGOCIO

QA debe poder responder:

### Caso

Una prenda aparece como faltante.

Debe poder encontrarse:

```text
producto
↓
stock movement
↓
operación
↓
usuario
↓
documento
↓
auditoría
```

Si no existe esa cadena:

```text
FAIL
```

---

# 118. CRITERIO DE CALIDAD GLOBAL

El sistema se considera de calidad cuando:

```text
FUNCIONA
+
ES SEGURO
+
ES CONSISTENTE
+
ES TRAZABLE
+
ES REPRODUCIBLE
+
ES RECUPERABLE
+
ES MANTENIBLE
```

---

# 119. DEFINITION OF DONE DEL SISTEMA COMPLETO

El sistema completo puede considerarse listo para producción cuando:

### Funcionalidad

* [ ] módulos implementados;
* [ ] flujos críticos completos;
* [ ] reglas de negocio implementadas;
* [ ] estados implementados.

### Datos

* [ ] modelo consistente;
* [ ] migraciones;
* [ ] constraints;
* [ ] integridad referencial.

### Seguridad

* [ ] autenticación;
* [ ] RBAC;
* [ ] scope;
* [ ] protección IDOR;
* [ ] rate limiting;
* [ ] secrets;
* [ ] HTTPS.

### Stock

* [ ] movimientos;
* [ ] transferencias;
* [ ] reservas;
* [ ] cambios;
* [ ] préstamos;
* [ ] recepción.

### Dinero

* [ ] pagos;
* [ ] caja;
* [ ] arqueos;
* [ ] cuentas;
* [ ] tesorería;
* [ ] conciliación.

### Fiscal

* [ ] integración ARCA;
* [ ] manejo de errores;
* [ ] idempotencia;
* [ ] comprobantes;
* [ ] contingencia según alcance.

### Auditoría

* [ ] operaciones trazables;
* [ ] usuarios;
* [ ] timestamps;
* [ ] referencias;
* [ ] reconstrucción.

### Infraestructura

* [ ] Docker;
* [ ] PostgreSQL;
* [ ] HTTPS;
* [ ] backups;
* [ ] restore;
* [ ] monitoring;
* [ ] deployment;
* [ ] rollback.

### QA

* [ ] unit tests;
* [ ] integration tests;
* [ ] E2E;
* [ ] security tests;
* [ ] concurrency tests;
* [ ] idempotency tests;
* [ ] regression;
* [ ] UAT.

---

# 120. CRITERIO FINAL DE APROBACIÓN

El sistema NO debe considerarse listo porque:

```text
"se ve bien"
```

o:

```text
"la demo funciona"
```

Debe considerarse listo cuando:

```text
REQUISITO
    ↓
IMPLEMENTACIÓN
    ↓
REGLA DE NEGOCIO
    ↓
VALIDACIÓN
    ↓
PERSISTENCIA
    ↓
MOVIMIENTO
    ↓
AUDITORÍA
    ↓
TEST
    ↓
ACEPTACIÓN
```

---

# 121. REGLA MAESTRA DE QA

> **Toda operación crítica debe poder demostrarse, probarse, reconstruirse y auditarse.**

Esto aplica especialmente a:

```text
STOCK
DINERO
VENTAS
CAJA
TRANSFERENCIAS
RESERVAS
CAMBIOS
PRÉSTAMOS
COMPRAS
EMPLEADOS
FACTURACIÓN
```

---

# 122. DEFINICIÓN FINAL

El sistema debe pasar de:

```text
"Funciona"
```

a:

```text
"Está probado."
```

y finalmente:

```text
"Está validado para operar."
```

La diferencia es fundamental.

Una aplicación puede funcionar técnicamente y aun así ser incorrecta desde el punto de vista del negocio.

Por eso VMDS debe utilizar:

```text
TESTING
+
QA
+
BUSINESS ACCEPTANCE
+
SECURITY
+
AUDIT
+
OBSERVABILITY
```

como una única estrategia de calidad.

---

# 123. ARQUITECTURA FINAL DE CALIDAD

```text
                    ┌──────────────────────┐
                    │ BUSINESS ACCEPTANCE  │
                    │        / UAT         │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │      E2E TESTS       │
                    └──────────┬───────────┘
                               │
              ┌────────────────▼────────────────┐
              │       INTEGRATION TESTS         │
              └────────────────┬────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │      UNIT TESTS      │
                    └──────────┬───────────┘
                               │
             ┌─────────────────▼─────────────────┐
             │       APPLICATION SYSTEM          │
             │                                   │
             │ React → API → Prisma → PostgreSQL │
             └─────────────────┬─────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
    SECURITY               AUDIT               OBSERVABILITY
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                       PRODUCTION
```

---

# 124. PRINCIPIOS NO NEGOCIABLES

```text
1. No hay release sin pruebas.
2. No hay operación crítica sin trazabilidad.
3. No hay dinero sin movimiento financiero.
4. No hay stock sin movimiento trazable.
5. No hay permiso crítico confiado únicamente al frontend.
6. No hay operación crítica sin control de concurrencia cuando corresponda.
7. No hay retry crítico sin idempotencia.
8. No hay modificación destructiva de operaciones históricas.
9. No hay producción sin backup y restore probado.
10. No hay integración fiscal real desde demo.
11. No hay "DONE" sin Definition of Done.
12. No se considera calidad solamente porque la interfaz funciona.
```

---

# 125. CONEXIÓN FINAL DE LOS 28 MÓDULOS

La arquitectura documental completa queda:

```text
01 VISION
        ↓
02 ROLES
        ↓
03 EMPRESA / SUCURSALES / POS
        ↓
04 PRODUCTOS / VARIANTES / PRECIOS
        ↓
05 INVENTARIO / STOCK
        ↓
06 DEPÓSITO
        ↓
07 COMPRAS
        ↓
08 TRANSFERENCIAS / REMITOS
        ↓
09 VENTAS / POS
        ↓
10 CAJAS
        ↓
11 TESORERÍA
        ↓
12 CUENTAS FINANCIERAS
        ↓
13 PAGOS
        ↓
14 RESERVAS
        ↓
15 PRÉSTAMOS
        ↓
16 CAMBIOS / DEVOLUCIONES
        ↓
17 EMPLEADOS / SUELDOS
        ↓
18 VENTAS DE EMPLEADOS
        ↓
19 ARCA
        ↓
20 REPORTES
        ↓
21 AUDITORÍA
        ↓
22 REGLAS
        ↓
23 ESTADOS
        ↓
24 MODELO DE DATOS
        ↓
25 ARQUITECTURA
        ↓
26 SEGURIDAD
        ↓
27 INFRAESTRUCTURA
        ↓
28 TESTING / QA / DEFINITION OF DONE
```

---

# 126. CIERRE DEL SISTEMA

Con este módulo se completa la especificación funcional, técnica, de seguridad, infraestructura y calidad del sistema.

El resultado no es solamente una lista de funcionalidades.

Es una especificación de un:

> **Sistema de gestión empresarial multisucursal orientado a operaciones reales de indumentaria, con control de stock, dinero, usuarios, documentos, fiscalidad y trazabilidad.**

La regla arquitectónica que atraviesa todo el sistema es:

```text
FRONTEND
muestra y solicita

BACKEND
decide y ejecuta

DATABASE
persiste

STOCK MOVEMENTS
explican stock

FINANCIAL MOVEMENTS
explican dinero

AUDIT LOG
explica quién hizo qué

TESTS
demuestran que funciona

QA
demuestra que cumple

UAT
demuestra que sirve para el negocio
```

---

# 127. DEFINITION OF DONE — SISTEMA

**El proyecto completo está DONE únicamente cuando todas las capas anteriores han sido implementadas, probadas y aceptadas según el alcance correspondiente.**

```text
VM DIGITAL STUDIO
MULTI-BRANCH CLOTHING MANAGEMENT SYSTEM

STATUS:

SPECIFICATION
████████████████████ 100%

FUNCTIONAL MODEL
████████████████████ 100%

BUSINESS RULES
████████████████████ 100%

DATA MODEL
████████████████████ 100%

TECHNICAL ARCHITECTURE
████████████████████ 100%

SECURITY
████████████████████ 100%

INFRASTRUCTURE
████████████████████ 100%

TESTING / QA
████████████████████ 100%

DOCUMENTATION
████████████████████ 100%
```

**Fin de la especificación principal.**
