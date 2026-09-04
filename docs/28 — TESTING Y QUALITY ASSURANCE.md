# 28 — TESTING Y QUALITY ASSURANCE

## VM Digital Studio — Sistema de Gestión Multisucursal

**Versión:** 1.0
**Estado:** Diseño técnico
**Clasificación:** QA / Testing / Calidad de Software
**Prioridad:** Crítica

---

# 1. OBJETIVO

Este documento define la estrategia de testing y Quality Assurance del sistema.

El objetivo no es solamente detectar errores técnicos.

El objetivo principal es garantizar que:

* una venta genere el stock correcto;
* un pago genere el movimiento financiero correcto;
* una caja refleje correctamente el efectivo;
* una transferencia no duplique stock;
* una reserva no permita vender stock comprometido;
* un préstamo de publicidad no se confunda con una venta;
* un cambio no altere artificialmente la venta original;
* una devolución genere los movimientos correspondientes;
* una compra incremente correctamente el stock;
* una recepción parcial no contabilice mercadería inexistente;
* una factura esté correctamente vinculada a la venta;
* las reglas de permisos se respeten;
* cada operación crítica pueda reconstruirse mediante auditoría.

Principio:

> **No se prueba solamente si una pantalla funciona. Se prueba si una operación produce exactamente las consecuencias de negocio esperadas.**

---

# 2. PRINCIPIO DE CALIDAD

La calidad del sistema debe evaluarse en cuatro niveles:

```text
Código
   ↓
Módulo
   ↓
Proceso
   ↓
Negocio completo
```

Ejemplo:

```text
Función calcularTotal()
        ↓
Servicio de ventas
        ↓
Finalización de venta
        ↓
Venta + pago + stock + caja + factura + auditoría
```

Una prueba aislada no reemplaza una prueba de proceso completo.

---

# 3. PIRÁMIDE DE TESTING

La estrategia seguirá una pirámide:

```text
              E2E
             /   \
          Integración
         /           \
       API / Servicios
      /               \
     Unit Tests
```

La mayor cantidad de pruebas debe estar en niveles rápidos.

Las pruebas E2E deben reservarse principalmente para procesos críticos.

---

# 4. TIPOS DE PRUEBAS

Se contemplan:

```text
Unit Tests
Integration Tests
API Tests
Database Tests
Component Tests
E2E Tests
Regression Tests
Security Tests
Permission Tests
Concurrency Tests
Performance Tests
Smoke Tests
Acceptance Tests
```

No todos deben implementarse con la misma profundidad durante la Demo.

---

# 5. UNIT TESTS

Las pruebas unitarias validan unidades pequeñas de lógica.

Ejemplos:

```text
calculateSaleTotal()
calculateDiscount()
calculateAvailableStock()
calculateCashExpected()
calculateReservationBalance()
calculateEmployeePrice()
validatePaymentTotal()
```

Ejemplo conceptual:

```text
subtotal = $100.000
discount = $10.000

total esperado = $90.000
```

Debe probarse tanto el caso correcto como los casos límite.

---

# 6. REGLAS DE DINERO

Las operaciones monetarias deben tener pruebas específicas.

Probar:

```text
0
positivo
decimal
descuento
vuelto
pago exacto
pago parcial
sobrepago
múltiples pagos
```

Ejemplo:

```text
Venta = $100.000

Pago efectivo = $60.000
Transferencia = $40.000

Total = $100.000
```

Resultado válido.

---

# 7. REGLA DE IGUALDAD DE PAGOS

Debe existir una prueba específica:

```text
sum(payments) === sale.total
```

cuando la venta exige pago completo.

Casos:

```text
90.000 + 10.000 = 100.000 → OK

90.000 + 9.000 = 99.000 → ERROR

100.000 + 1.000 = 101.000 → ERROR
```

El backend debe validar esta regla.

---

# 8. PRECISIÓN MONETARIA

No utilizar operaciones financieras basadas ingenuamente en `float`.

Ejemplo conceptual de problema:

```text
0.1 + 0.2
```

puede producir una representación binaria inesperada.

El sistema debe utilizar una estrategia apropiada de precisión monetaria.

En PostgreSQL:

```text
DECIMAL / NUMERIC
```

debe utilizarse para valores monetarios.

---

# 9. STOCK

El stock requiere una suite de pruebas específica.

Debe comprobar:

```text
physical
reserved
available
in-transit
```

Ejemplo:

```text
Stock físico = 10
Reservado = 3

Disponible = 7
```

La prueba debe garantizar que el sistema no permita vender 8 unidades.

---

# 10. REGLA DE STOCK

El sistema debe cumplir:

```text
available >= requestedQuantity
```

antes de una salida que consuma stock disponible.

Excepción:

Solo si existe una regla explícita que permita stock negativo.

Por defecto:

> Stock negativo NO permitido.

---

# 11. STOCK COMO LEDGER

Una prueba importante debe verificar:

```text
Inventory
```

contra:

```text
StockMovement
```

El estado actual debe ser explicable mediante los movimientos registrados.

Ejemplo:

```text
Compra +10
Venta -2
Transferencia -3

Stock = 5
```

Debe existir trazabilidad.

---

# 12. TEST DE VENTA COMPLETA

Una de las pruebas más importantes:

```text
Crear venta
   ↓
Agregar producto
   ↓
Confirmar stock
   ↓
Registrar pago
   ↓
Finalizar venta
```

Resultado esperado:

```text
Sale = PAID / COMPLETED

StockMovement = SALE

Payment = REGISTERED

FinancialMovement = CREATED

CashMovement = CREATED
```

si corresponde.

Y:

```text
AuditLog = CREATED
```

---

# 13. TEST DE VENTA CON TRANSFERENCIA

Ejemplo:

```text
Venta = $150.000

Transferencia
Entidad = Banco Macro
Cuenta = Cuenta Corriente
Referencia = TRX-123
Monto = $150.000
```

Debe verificar:

```text
Sale → PAID
Payment → TRANSFER
FinancialMovement → IN
FinancialAccount → Banco Macro
StockMovement → SALE
AuditLog → CREATED
```

No debe generar movimiento de efectivo.

---

# 14. TEST DE VENTA COMBINADA

Ejemplo:

```text
Venta = $200.000

Efectivo = $80.000
Transferencia = $120.000
```

Resultado:

```text
Cash = +80.000
Bank = +120.000
Sale = 200.000
```

Nunca:

```text
Cash = +200.000
Bank = +200.000
```

Esto sería doble contabilización.

---

# 15. TEST POS → CAJA

Debe probarse explícitamente la separación:

```text
Vendedor
   ↓
POS
   ↓
PENDING_PAYMENT
   ↓
Cajero
   ↓
Pago
   ↓
Finalización
```

El vendedor no debe poder cerrar caja si no posee el permiso correspondiente.

---

# 16. TEST DE CAJA

Caso:

```text
Apertura = $50.000

Ventas efectivo = $100.000

Retiro = $20.000
```

Efectivo esperado:

```text
50.000 + 100.000 - 20.000
= 130.000
```

Si el cajero cuenta:

```text
$130.000
```

resultado:

```text
Diferencia = $0
```

---

# 17. TEST DE ARQUEO CON DIFERENCIA

Sistema:

```text
Esperado = $130.000
```

Cajero cuenta:

```text
$128.000
```

Resultado:

```text
Diferencia = -$2.000
```

El sistema:

* no debe modificar silenciosamente la venta;
* no debe alterar el opening balance;
* debe registrar la diferencia;
* debe identificar usuario;
* debe registrar fecha/hora;
* debe permitir posterior investigación.

---

# 18. TEST DE TRANSFERENCIA ENTRE SUCURSALES

Caso:

```text
Sucursal A
Stock = 10

Transferir 4

Sucursal A = 6
En tránsito = 4
Sucursal B = sin incremento todavía
```

Después de recepción:

```text
Sucursal A = 6
Sucursal B = 4
En tránsito = 0
```

La prueba debe impedir:

```text
Sucursal B = 8
```

por doble recepción.

---

# 19. TEST DE RECEPCIÓN DE TRANSFERENCIA

Debe probar:

```text
Dispatch
   ↓
IN_TRANSIT
   ↓
Receive
   ↓
TRANSFER_IN
```

La recepción debe ser idempotente.

Si el mismo request se envía dos veces:

```text
TRANSFER_IN
```

debe registrarse una sola vez.

---

# 20. TEST DE COMPRA

Caso:

```text
PurchaseOrder
   ↓
PurchaseReceipt
   ↓
StockMovement PURCHASE_RECEIPT
```

Debe comprobarse que solamente la cantidad efectivamente recibida ingrese al stock.

---

# 21. TEST DE RECEPCIÓN PARCIAL

Pedido:

```text
100 unidades
```

Primera recepción:

```text
60
```

Resultado:

```text
Received = 60
Pending = 40
```

Segunda recepción:

```text
40
```

Resultado:

```text
Received = 100
Pending = 0
```

No debe permitir:

```text
Received = 110
```

sin una operación explícita y autorizada.

---

# 22. TEST DE RESERVA

Stock:

```text
10
```

Reserva:

```text
3
```

Resultado:

```text
Physical = 10
Reserved = 3
Available = 7
```

Una venta de:

```text
8
```

debe ser rechazada si intenta consumir stock disponible.

---

# 23. TEST DE CANCELACIÓN DE RESERVA

Inicial:

```text
Physical = 10
Reserved = 3
Available = 7
```

Cancelar reserva.

Resultado:

```text
Physical = 10
Reserved = 0
Available = 10
```

Debe generarse:

```text
RESERVATION_RELEASE
```

---

# 24. TEST DE RETIRO DE RESERVA

Cuando el cliente retira:

```text
Reservation
     ↓
Sale
     ↓
Payment
     ↓
Stock SALE
```

Debe existir una sola salida física.

No debe ocurrir:

```text
Reservation → -3 stock
Sale → -3 stock
```

porque produciría doble descuento.

---

# 25. TEST DE SEÑA

Ejemplo:

```text
Total = $100.000
Seña = $30.000
Saldo = $70.000
```

Al retirar:

```text
Seña aplicada = $30.000
Saldo = $70.000
```

La seña no debe registrarse nuevamente como ingreso.

---

# 26. TEST DE PRÉSTAMO PUBLICITARIO

Caso:

```text
Stock = 10

Prestar = 1
```

Resultado:

```text
Stock disponible para venta = 9
MarketingLoan = DELIVERED
```

Debe existir:

```text
MARKETING_LOAN
```

No:

```text
SALE
```

---

# 27. TEST DE DEVOLUCIÓN DE PRÉSTAMO

Inicial:

```text
Disponible = 9
Prestado = 1
```

Devolución:

```text
Disponible = 10
Prestado = 0
```

Movimiento:

```text
MARKETING_RETURN
```

---

# 28. TEST DE PRODUCTO NO DEVUELTO

Si el producto no vuelve:

```text
MarketingLoan = MISSING
```

Debe producir el movimiento correspondiente y mantener trazabilidad.

No se debe simplemente editar:

```text
stock = stock - 1
```

sin explicación.

---

# 29. TEST DE PRODUCTO DAÑADO

Caso:

```text
Producto prestado
   ↓
Devuelto
   ↓
Dañado
```

Resultado:

```text
Stock disponible para venta
NO incrementa como producto vendible
```

Debe registrarse:

```text
MARKETING_DAMAGE
```

y la condición correspondiente.

---

# 30. TEST DE CAMBIO

Venta original:

```text
Remera
$50.000
```

Cliente cambia por:

```text
Camisa
$50.000
```

Resultado:

```text
Producto original → vuelve a stock
Producto nuevo → sale de stock
Diferencia = $0
```

La venta original permanece intacta.

---

# 31. TEST DE CAMBIO CON DIFERENCIA

Original:

```text
$50.000
```

Nuevo:

```text
$65.000
```

Diferencia:

```text
$15.000
```

Debe generarse:

```text
EXCHANGE
Payment = $15.000
FinancialMovement = IN
```

---

# 32. TEST DE DEVOLUCIÓN

Debe comprobar:

```text
Original Sale
   ↓
ReturnExchange
   ↓
Stock return
   ↓
Refund
   ↓
FinancialMovement OUT
```

La devolución no debe borrar la venta original.

---

# 33. TEST DE DEVOLUCIÓN PARCIAL

Venta:

```text
3 productos
```

Devolución:

```text
1 producto
```

Debe quedar:

```text
2 vendidos
1 devuelto
```

El mismo producto no puede ser devuelto nuevamente si ya se agotó la cantidad retornable.

---

# 34. TEST DE EMPLEADOS

Una venta a empleado debe comportarse como una venta normal en stock.

Ejemplo:

```text
Employee Sale
     ↓
Sale
     ↓
StockMovement SALE
```

Si es a crédito:

```text
Sale
     ↓
Employee balance
```

pero no debe registrarse dinero recibido hasta que realmente exista.

---

# 35. TEST DE SUELDOS

El cálculo salarial debe separarse del pago.

```text
Payroll
   ↓
CALCULATED
   ↓
APPROVED
   ↓
PAID
```

El movimiento financiero se genera cuando corresponde al pago real.

---

# 36. TEST DE FACTURACIÓN

Una venta puede existir sin factura todavía si el flujo lo permite.

Pero una factura emitida debe quedar vinculada a la venta.

```text
Sale
   │
   └── Invoice
```

Debe probarse:

* tipo de comprobante;
* punto de venta;
* numeración;
* importe;
* cliente;
* estado;
* autorización;
* CAE;
* fecha de vencimiento;
* errores.

---

# 37. TEST DE ARCA SIMULADA

Durante Demo:

```text
Sale
 ↓
FiscalProvider
 ↓
MockFiscalProvider
 ↓
CAE SIMULADO
```

Debe poder demostrarse el flujo sin utilizar credenciales productivas.

---

# 38. TEST DE ERROR ARCA

Simular:

```text
Timeout
Rechazo
Credenciales inválidas
Servicio no disponible
Respuesta inesperada
```

El sistema debe evitar estados inconsistentes.

Ejemplo:

```text
Invoice = AUTHORIZED
```

no debe establecerse si la autorización realmente falló.

---

# 39. TEST DE AUTORIZACIONES

Debe existir una matriz:

| Acción                 | Admin | Gerente |        Cajero |      Vendedor |      Depósito |
| ---------------------- | ----: | ------: | ------------: | ------------: | ------------: |
| Crear venta            |     ✓ |       ✓ |             ✓ |             ✓ |             ✗ |
| Finalizar venta        |     ✓ |       ✓ |             ✓ |             ✗ |             ✗ |
| Cerrar caja            |     ✓ |       ✓ |             ✓ |             ✗ |             ✗ |
| Ajustar stock          |     ✓ |       ✓ | Según permiso |             ✗ | Según permiso |
| Recepcionar mercadería |     ✓ |       ✓ |             ✗ |             ✗ |             ✓ |
| Transferir stock       |     ✓ |       ✓ |             ✗ |             ✗ |             ✓ |
| Ver tesorería          |     ✓ |       ✓ | Según permiso |             ✗ |             ✗ |
| Emitir factura         |     ✓ |       ✓ |             ✓ | Según permiso |             ✗ |

La matriz definitiva debe coincidir con las reglas de negocio y permisos implementados.

---

# 40. TEST DE IDOR

Debe comprobarse que un usuario no pueda acceder a:

```text
branchId
saleId
cashRegisterId
employeeId
```

pertenecientes a otra sucursal simplemente modificando el ID de la request.

Ejemplo:

```text
GET /api/sales/SALE-999
```

si SALE-999 pertenece a otra organización/sucursal no autorizada:

```text
403 / 404 según política
```

Nunca devolver información privada.

---

# 41. TEST DE SCOPE

Todas las operaciones deben respetar:

```text
Company
Branch
Role
Permissions
```

Ejemplo:

```text
Usuario Sucursal A
```

no debe poder:

```text
modificar stock Sucursal B
cerrar caja Sucursal B
ver empleados Sucursal B
```

sin permiso explícito.

---

# 42. TEST DE CONCURRENCIA

Este sistema tiene operaciones susceptibles a carreras.

Ejemplo:

```text
Stock disponible = 1
```

Dos vendedores intentan vender simultáneamente:

```text
Vendedor A → 1
Vendedor B → 1
```

El sistema debe permitir solamente una operación.

Resultado:

```text
Venta A = SUCCESS
Venta B = REJECTED
```

No:

```text
Stock = -1
```

---

# 43. CONCURRENCIA EN CAJA

Dos terminales pueden enviar operaciones simultáneamente.

Debe garantizarse que:

```text
CashMovement
```

no se duplique.

Debe utilizarse una estrategia apropiada de:

```text
database transactions
locking
unique constraints
idempotency
```

según el caso.

---

# 44. IDEMPOTENCIA

Toda operación crítica susceptible de reintento debe contemplar idempotencia.

Ejemplo:

```text
POST /sales/123/finalize
Idempotency-Key: ABC123
```

Si la misma request llega dos veces:

```text
Primera → ejecuta
Segunda → devuelve resultado existente
```

No debe crear:

```text
2 pagos
2 movimientos de stock
2 facturas
```

---

# 45. TEST DE DUPLICACIÓN

Debe existir una suite específica para detectar:

```text
duplicate payment
duplicate stock movement
duplicate invoice
duplicate transfer receipt
duplicate cash movement
duplicate audit operation
```

Este tipo de error es especialmente peligroso porque puede generar inconsistencias financieras.

---

# 46. TEST DE CANCELACIONES

Una operación histórica no debe simplemente desaparecer.

Ejemplo:

```text
Sale COMPLETED
```

No:

```text
DELETE sale
```

Debe utilizarse:

```text
Cancellation
+
Compensating movements
+
Audit
```

La prueba debe verificar que la operación original permanezca reconstruible.

---

# 47. TEST DE MÁQUINAS DE ESTADO

Cada transición válida debe probarse.

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

Debe rechazarse:

```text
COMPLETED
 ↓
DRAFT
```

si la transición no está definida.

---

# 48. TEST DE TRANSICIONES INVÁLIDAS

Ejemplos:

```text
CANCELLED → PAID
COMPLETED → DRAFT
RETURNED → DELIVERED
PAID → PENDING_PAYMENT
```

Deben producir error de negocio.

---

# 49. TEST DE BASE DE DATOS

Debe verificarse:

* foreign keys;
* unique constraints;
* nullability;
* índices;
* relaciones;
* cascadas;
* restricciones monetarias;
* cantidades positivas;
* integridad referencial.

La aplicación no debe ser la única línea de defensa.

---

# 50. TEST DE API

Cada endpoint importante debe tener pruebas.

Ejemplo:

```text
POST /sales
POST /sales/:id/finalize
POST /sales/:id/cancel
POST /payments
POST /transfers
POST /transfers/:id/receive
POST /reservations
POST /reservations/:id/cancel
POST /returns
POST /exchanges
```

Cada endpoint debe probar:

```text
Success
Validation error
Authentication error
Authorization error
Business rule error
Not found
Conflict
Internal error
```

según corresponda.

---

# 51. CÓDIGOS HTTP

La API debe mantener consistencia.

Conceptualmente:

```text
200 → Success
201 → Created
400 → Invalid request
401 → Unauthenticated
403 → Forbidden
404 → Not found
409 → Conflict
422 → Business validation
429 → Rate limited
500 → Internal error
```

No utilizar códigos arbitrariamente.

---

# 52. TEST DE FRONTEND

El frontend debe probar:

* formularios;
* validaciones;
* navegación;
* tablas;
* filtros;
* estados;
* errores;
* loading;
* permisos visuales;
* responsive;
* POS;
* caja;
* dashboards.

Pero:

> Ocultar un botón no constituye una prueba de autorización.

La autorización real se prueba contra la API.

---

# 53. TEST E2E

Los E2E representan al usuario ejecutando el sistema.

Deben priorizar procesos críticos.

Suite mínima:

```text
Login
Crear venta
Finalizar venta
Abrir caja
Cerrar caja
Registrar transferencia
Recepcionar transferencia
Crear reserva
Retirar reserva
Registrar cambio
Registrar devolución
Registrar compra
Recepcionar compra
Crear préstamo
Devolver préstamo
Emitir factura simulada
```

---

# 54. E2E — FLUJO COMPLETO DE VENTA

```text
Login vendedor
     ↓
Seleccionar producto
     ↓
Agregar variante
     ↓
Crear venta
     ↓
Enviar a caja
     ↓
Login/acción cajero
     ↓
Seleccionar método de pago
     ↓
Finalizar
     ↓
Ver comprobante
```

Validar simultáneamente:

```text
Sale
Payment
Stock
Cash/FinancialMovement
Invoice
AuditLog
```

---

# 55. E2E — FLUJO COMPLETO DE DEPÓSITO

```text
Crear compra
     ↓
Recibir mercadería
     ↓
Controlar cantidades
     ↓
Confirmar recepción
     ↓
Stock + movimientos
     ↓
Preparar transferencia
     ↓
Crear remito
     ↓
Despachar
     ↓
Sucursal recibe
     ↓
Confirmar recepción
```

---

# 56. E2E — FLUJO DE RESERVA

```text
Cliente
 ↓
Reserva
 ↓
Seña
 ↓
Stock reservado
 ↓
Cliente vuelve
 ↓
Retiro
 ↓
Venta
 ↓
Aplicación de seña
 ↓
Pago saldo
 ↓
Stock final
```

---

# 57. E2E — FLUJO DE CAMBIO

```text
Venta original
 ↓
Cliente solicita cambio
 ↓
Validar producto
 ↓
Recibir producto original
 ↓
Entregar producto nuevo
 ↓
Calcular diferencia
 ↓
Cobrar / devolver diferencia
 ↓
Movimientos de stock
 ↓
Auditoría
```

---

# 58. REGRESSION TESTING

Cada bug importante debe convertirse en una prueba.

Ejemplo:

```text
Bug:
Una transferencia se podía recibir dos veces.
```

Solución:

```text
Fix
+
Regression test
```

Así se evita que el problema reaparezca.

Principio:

> **Un bug crítico corregido debe dejar una prueba permanente.**

---

# 59. SMOKE TEST

Después de cada deployment:

```text
Open application
Login
Load dashboard
Open POS
Create test operation
Read database/API health
```

Debe comprobarse que el sistema básico esté funcionando.

---

# 60. TEST DE SEGURIDAD

Debe verificarse:

```text
Authentication
Authorization
IDOR
Input validation
XSS
CSRF strategy
CORS
Rate limiting
Secrets
File uploads
Webhook verification
Session handling
Password handling
```

Las pruebas deben alinearse con el módulo:

```text
26_SEGURIDAD.md
```

---

# 61. TEST DE AUDITORÍA

Toda operación crítica debe generar la auditoría correspondiente.

Ejemplo:

```text
Sale finalized
```

debe permitir encontrar:

```text
actor
action
entity
entityId
timestamp
branch
operationId
requestId
```

La prueba debe fallar si una operación crítica ocurre sin audit event.

---

# 62. TEST DE REPORTES

Los reportes deben compararse contra datos conocidos.

Ejemplo:

```text
Ventas:
$100.000
$200.000
$300.000
```

Reporte:

```text
Total = $600.000
```

Debe comprobarse que filtros por:

```text
fecha
sucursal
usuario
método de pago
producto
```

no alteren incorrectamente el resultado.

---

# 63. TEST DE CONSISTENCIA FINANCIERA

Debe existir una validación periódica conceptual:

```text
Financial movements
        ↓
Account balances
        ↓
Cash balances
        ↓
Treasury
```

Los totales deben ser explicables.

Debe detectarse:

```text
duplicación
movimiento faltante
movimiento huérfano
saldo imposible
```

---

# 64. TEST DE CONSISTENCIA DE STOCK

Debe existir una herramienta de reconciliación.

Conceptualmente:

```text
Inventory.current
        VS
SUM(StockMovements)
```

Si existe una diferencia:

```text
ALERT
```

No corregir silenciosamente.

---

# 65. TEST DE PERFILES

Debe probarse cada rol.

Mínimo:

```text
ADMIN
MANAGER
CASHIER
SELLER
WAREHOUSE
ACCOUNTING/TREASURY
```

Cada uno debe ejecutar:

```text
acciones permitidas → SUCCESS
acciones prohibidas → DENIED
```

---

# 66. TEST DE DATOS VACÍOS

Probar:

```text
0 productos
0 ventas
0 reservas
0 compras
0 transferencias
```

El sistema no debe romper dashboards ni reportes.

---

# 67. TEST DE DATOS GRANDES

Posteriormente probar:

```text
10.000 productos
100.000 movimientos
1.000.000 movimientos
```

según escala prevista.

Debe comprobarse:

* paginación;
* filtros;
* índices;
* tiempos de respuesta;
* exportaciones.

No es requisito para la Demo inicial.

---

# 68. PERFORMANCE TESTING

Las operaciones críticas deben tener objetivos de rendimiento definidos posteriormente.

Ejemplos:

```text
Login
Search product
Add POS item
Finalize sale
Open cash
Load dashboard
```

No establecer valores arbitrarios como requisito contractual hasta medir el entorno real.

---

# 69. TEST DE CARGA

Posteriormente puede simularse:

```text
10 POS
20 usuarios
50 usuarios
100 usuarios
```

realizando operaciones simultáneas.

Especial atención:

```text
stock
cash
payments
sales
database locks
```

---

# 70. TEST DE RECUPERACIÓN

Debe simularse:

```text
API restart
Database restart
Network failure
ARCA timeout
Worker failure
Storage unavailable
```

y verificar que el sistema:

* no duplique operaciones;
* no pierda operaciones confirmadas;
* no cree estados inválidos;
* permita reintentar cuando corresponde.

---

# 71. TEST DE BACKUP Y RESTORE

Debe ejecutarse periódicamente un procedimiento de:

```text
Backup
 ↓
Restore
 ↓
Integrity check
 ↓
Application startup
 ↓
Validation
```

La prueba debe comprobar que los datos restaurados sean utilizables.

---

# 72. TEST DE MIGRACIONES

Antes de producción:

```text
Current DB
 ↓
Backup
 ↓
Migration
 ↓
Tests
 ↓
Validation
```

Debe probarse también el escenario:

```text
Existing production-like data
+
New migration
```

No solamente una base vacía.

---

# 73. TEST DATA

La Demo y Staging deben disponer de datos reproducibles.

Ejemplo:

```text
5 sucursales
3 POS por sucursal
1 caja por sucursal

50 productos
múltiples variantes

5 proveedores
100 clientes

ventas
reservas
transferencias
compras
préstamos
cambios
```

Los datos deben poder regenerarse.

---

# 74. DATOS DE PRUEBA NO DEBEN SER DATOS REALES

Nunca utilizar información real de:

* clientes;
* empleados;
* cuentas;
* credenciales;
* tarjetas;
* ARCA;
* proveedores;

en ambientes de desarrollo o staging salvo que exista una política específica y controles adecuados.

---

# 75. ACCEPTANCE TESTING

Antes de considerar terminado un módulo:

```text
Requirement
 ↓
Acceptance Criteria
 ↓
Test
 ↓
Evidence
 ↓
Approved
```

Ejemplo:

### Requisito

> El cajero puede finalizar una venta.

### Criterios

```text
✓ Venta pendiente visible
✓ Pago registrado
✓ Total correcto
✓ Stock descontado
✓ Caja actualizada
✓ Auditoría creada
✓ Comprobante generado
```

---

# 76. DEFINITION OF DONE

Una feature no se considera terminada solamente porque:

```text
"funciona en mi máquina"
```

Debe cumplir:

```text
Code
Tests
Validation
Security
Audit
Error handling
Documentation
```

cuando corresponda.

---

# 77. MATRIZ DE COBERTURA

Cada requisito crítico debe estar relacionado con al menos una prueba.

Ejemplo:

| Requisito      | Unit | Integration | E2E |
| -------------- | ---: | ----------: | --: |
| Venta          |    ✓ |           ✓ |   ✓ |
| Pago combinado |    ✓ |           ✓ |   ✓ |
| Caja           |    ✓ |           ✓ |   ✓ |
| Transferencia  |    ✓ |           ✓ |   ✓ |
| Reserva        |    ✓ |           ✓ |   ✓ |
| Préstamo       |    ✓ |           ✓ |   ✓ |
| Cambio         |    ✓ |           ✓ |   ✓ |
| Compra         |    ✓ |           ✓ |   ✓ |
| ARCA           |    ✓ |           ✓ |   ✓ |
| Auditoría      |    ✓ |           ✓ |   ✓ |

---

# 78. TESTS OBLIGATORIOS PARA EL CORE

Antes de considerar estable el sistema deben funcionar correctamente:

```text
1. Login
2. RBAC
3. Product variants
4. Inventory
5. Sale creation
6. Sale finalization
7. Payment
8. Cash
9. Financial movement
10. Purchase receipt
11. Transfer
12. Reservation
13. Marketing loan
14. Exchange
15. Return
16. Invoice
17. Audit
```

---

# 79. ORDEN DE IMPLEMENTACIÓN DE TESTING

## Fase 1 — Demo

Implementar:

```text
Smoke tests
Core business tests
Critical E2E
Manual acceptance
```

---

## Fase 2 — MVP

Agregar:

```text
Unit tests
Integration tests
API tests
RBAC tests
Regression tests
```

---

## Fase 3 — Production

Agregar:

```text
Concurrency tests
Security tests
Performance tests
Backup/restore tests
Migration tests
Observability tests
Failure recovery
```

---

# 80. TESTING EN CI/CD

Pipeline:

```text
Git Push
   ↓
Install
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
Security Checks
   ↓
E2E
   ↓
Deploy Staging
```

Producción:

```text
Staging
   ↓
Acceptance
   ↓
Approval
   ↓
Production
```

---

# 81. REGLA DE FALLA DEL PIPELINE

Si una prueba crítica falla:

```text
CI = FAILED
```

No debe desplegarse automáticamente a producción.

Especialmente si falla:

```text
Stock
Payment
Cash
FinancialMovement
Invoice
Authorization
Audit
```

---

# 82. TEST REPORTING

Cada ejecución de CI debería dejar evidencia:

```text
Tests passed
Tests failed
Duration
Commit
Environment
Build
Version
```

Para pruebas E2E críticas, guardar screenshots/videos/logs cuando la herramienta utilizada lo permita.

---

# 83. BUG MANAGEMENT

Cada bug debe clasificarse.

### CRITICAL

Puede causar:

* pérdida de dinero;
* doble cobro;
* stock incorrecto;
* facturación incorrecta;
* acceso no autorizado;
* corrupción de datos.

Bloquea release.

### HIGH

Impacta una función importante pero existe workaround.

### MEDIUM

Problema funcional limitado.

### LOW

Problema visual o menor.

---

# 84. REGLA PARA BUGS CRÍTICOS

Un bug crítico corregido requiere:

```text
Fix
+
Root cause
+
Regression test
+
Validation
```

No simplemente:

```text
Fix
```

---

# 85. QA MANUAL

No todo debe automatizarse inmediatamente.

Durante Demo se recomienda una checklist manual:

```text
Login
POS
Caja
Venta
Pago
Stock
Reserva
Transferencia
Compra
Préstamo
Cambio
Factura Demo
Reportes
Auditoría
```

El objetivo es descubrir problemas de UX y reglas que los tests automatizados todavía no cubren.

---

# 86. CHECKLIST DE DEMO

Antes de mostrar al cliente:

### Autenticación

* [ ] Login funciona
* [ ] Roles funcionan
* [ ] Logout funciona

### Productos

* [ ] Productos cargados
* [ ] Variantes funcionando
* [ ] SKU funcionando
* [ ] Precios funcionando

### Ventas

* [ ] POS funciona
* [ ] Venta pendiente
* [ ] Cajero recibe venta
* [ ] Pago exacto
* [ ] Pago combinado
* [ ] Venta finalizada

### Caja

* [ ] Apertura
* [ ] Movimientos
* [ ] Arqueo
* [ ] Diferencia

### Stock

* [ ] Compra
* [ ] Recepción
* [ ] Transferencia
* [ ] Reserva
* [ ] Préstamo
* [ ] Cambio

### Fiscal

* [ ] Factura simulada
* [ ] CAE DEMO
* [ ] Comprobante sin validez fiscal

### Auditoría

* [ ] Usuario
* [ ] Fecha
* [ ] Operación
* [ ] Movimiento

---

# 87. ESCENARIO DE DEMO RECOMENDADO

La Demo debe contar una historia completa.

```text
DEPÓSITO
   ↓
Recibe mercadería
   ↓
Carga stock
   ↓
Imprime etiquetas
   ↓
Envía 10 prendas a Sucursal Centro
   ↓
Sucursal recibe
   ↓
Vendedor crea venta
   ↓
Cajero finaliza
   ↓
Pago combinado
   ↓
Factura simulada
   ↓
Stock actualizado
   ↓
Caja actualizada
   ↓
Reporte actualizado
   ↓
Auditoría registrada
```

Este flujo demuestra que no se construyó simplemente un conjunto de pantallas aisladas.

---

# 88. CRITERIO DE CALIDAD DEL SISTEMA

El sistema debe poder responder:

### ¿Qué pasó?

```text
AuditLog
```

### ¿Quién lo hizo?

```text
User
```

### ¿Cuándo?

```text
timestamp
```

### ¿Dónde?

```text
Branch / Warehouse / CashRegister
```

### ¿Qué cambió?

```text
StockMovement
FinancialMovement
Operation
```

### ¿Por qué?

```text
Reason / Reference
```

### ¿Qué documento lo respalda?

```text
Sale
Purchase
Transfer
Reservation
Invoice
ReturnExchange
```

---

# 89. REGLAS NO NEGOCIABLES

### Regla 1

> Las operaciones de dinero deben tener pruebas.

### Regla 2

> Las operaciones de stock deben tener pruebas.

### Regla 3

> Los permisos deben probarse contra backend.

### Regla 4

> Las operaciones críticas deben ser idempotentes cuando corresponda.

### Regla 5

> Las condiciones de carrera deben probarse antes de producción.

### Regla 6

> Todo bug crítico corregido debe tener regression test.

### Regla 7

> Una prueba E2E no reemplaza pruebas unitarias.

### Regla 8

> Una prueba unitaria no demuestra que el proceso completo funcione.

### Regla 9

> Los datos de prueba deben ser reproducibles.

### Regla 10

> No se considera terminado un módulo crítico sin evidencia de testing.

---

# 90. DEFINITION OF DONE — QA

El módulo se considera implementado cuando:

* [ ] existe estrategia de testing;
* [ ] existen unit tests para lógica crítica;
* [ ] existen integration tests para operaciones críticas;
* [ ] existen API tests;
* [ ] existen E2E para procesos principales;
* [ ] existe matriz de permisos;
* [ ] existen pruebas de concurrencia;
* [ ] existe idempotencia donde corresponde;
* [ ] existen regression tests;
* [ ] existen smoke tests;
* [ ] existe testing de seguridad;
* [ ] existe testing de stock;
* [ ] existe testing financiero;
* [ ] existe testing de caja;
* [ ] existe testing fiscal;
* [ ] existe testing de auditoría;
* [ ] CI ejecuta pruebas automáticamente;
* [ ] fallos críticos bloquean release;
* [ ] existe checklist de aceptación;
* [ ] existe evidencia de ejecución.

---

# 91. PRINCIPIO FINAL

La calidad del sistema no se mide por:

```text
cantidad de pantallas
cantidad de endpoints
cantidad de componentes
cantidad de código
```

Se mide por la capacidad de garantizar que:

```text
OPERACIÓN
   ↓
REGLA
   ↓
CAMBIO
   ↓
MOVIMIENTO
   ↓
AUDITORÍA
   ↓
RESULTADO
```

sea correcto y reproducible.

El sistema debe poder demostrar:

> **“Esta operación ocurrió, fue ejecutada por esta persona, en este lugar y momento, bajo estas reglas, produjo estos movimientos y terminó en este estado.”**

Ese es el estándar de calidad para VMDS.

---

# 92. ESTADO DEL BLUEPRINT

Módulos principales definidos:

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
28 — Testing y Quality Assurance
```

## SIGUIENTE MÓDULO

```text
29 — EXPERIENCIA DE USUARIO, UI/UX Y DISEÑO DEL SISTEMA
```

Este módulo definirá la arquitectura de interfaz para:

* Dashboard;
* POS;
* Caja;
* Depósito;
* Inventario;
* Compras;
* Transferencias;
* Reservas;
* Préstamos;
* Cambios;
* Tesorería;
* Reportes;
* Administración;

incluyendo navegación por roles, responsive, estados de carga/error/vacío, componentes reutilizables, accesibilidad y principios de UX para operaciones de alta velocidad como el POS.
