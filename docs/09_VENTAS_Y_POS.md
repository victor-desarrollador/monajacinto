# SISTEMA DE GESTIÓN MULTISUCURSAL

## 09 — VENTAS Y POS

**Documento:** `09_VENTAS_Y_POS.md`
**Versión:** 1.0
**Estado:** Draft
**Última actualización:** 2026-09-02

**Depende de:**

* `00_MASTER_SPEC.md`
* `02_ROLES_Y_PERMISOS.md`
* `03_SUCURSALES_Y_POS.md`
* `04_PRODUCTOS_Y_VARIANTES.md`
* `05_INVENTARIO_Y_STOCK.md`
* `08_TRANSFERENCIAS_Y_REMITOS.md`

**Relacionado con:**

* `10_CAJAS_Y_ARQUEOS.md`
* `12_CUENTAS_FINANCIERAS.md`
* `13_PAGOS_Y_MOVIMIENTOS_DINERO.md`
* `14_RESERVAS_Y_SEÑAS.md`
* `16_CAMBIOS_Y_DEVOLUCIONES.md`
* `19_FACTURACION_ARCA.md`
* `21_AUDITORIA_Y_TRAZABILIDAD.md`

---

# 1. PROPÓSITO

Este módulo define el proceso de ventas dentro de las sucursales y el funcionamiento de los terminales POS.

El sistema debe permitir:

* Crear ventas.
* Identificar vendedor.
* Identificar POS.
* Agregar productos y variantes.
* Aplicar descuentos según permisos.
* Asociar cliente.
* Calcular subtotal y total.
* Enviar venta a cobro.
* Permitir que caja finalice el cobro.
* Registrar uno o varios medios de pago.
* Emitir comprobante/factura cuando corresponda.
* Descontar stock.
* Registrar movimiento financiero.
* Mantener trazabilidad completa.

---

# 2. PRINCIPIO FUNDAMENTAL

## POS Y CAJA SON DOS FUNCIONES DIFERENTES

En este negocio:

```text
VENDEDOR
   ↓
POS
   ↓
CREA VENTA
   ↓
PENDIENTE DE COBRO
   ↓
CAJERO
   ↓
REGISTRA PAGO
   ↓
FINALIZA VENTA
```

El vendedor **no debe cerrar la caja**.

El vendedor tampoco debe tener acceso automáticamente a las operaciones financieras de la caja.

---

# 3. RESPONSABILIDADES

## VENDEDOR

Puede:

* Crear venta.
* Agregar productos.
* Quitar productos.
* Modificar cantidades.
* Consultar precios.
* Asociar cliente.
* Aplicar descuentos permitidos.
* Enviar venta a cobro.
* Consultar estado de sus ventas.

No puede:

* Cerrar caja.
* Realizar arqueo.
* Registrar retiro de efectivo salvo permiso explícito.
* Modificar movimientos financieros.
* Finalizar pagos si la política de la empresa reserva esa función al cajero.

---

# 4. CAJERO

Puede:

* Consultar ventas pendientes.
* Seleccionar venta.
* Ver total.
* Registrar medios de pago.
* Registrar pagos combinados.
* Confirmar recepción del dinero.
* Emitir/finalizar comprobante.
* Finalizar venta.
* Operar la caja.
* Realizar arqueo.

---

# 5. ADMIN

Puede:

* Consultar ventas.
* Autorizar descuentos especiales.
* Consultar operaciones.
* Anular según permisos.
* Consultar reportes.

---

# 6. SUPER ADMIN

Puede:

* Acceso global.
* Consultar todas las ventas.
* Gestionar excepciones.
* Autorizar operaciones sensibles.
* Consultar auditoría.
* Consultar información financiera relacionada.

---

# 7. CONCEPTO DE VENTA

Entidad conceptual:

```text
Sale
```

Debe representar una operación comercial completa.

Campos conceptuales:

```text
id
branchId
posId
sellerId
cashRegisterId
customerId
status
subtotal
discount
tax
total
createdAt
updatedAt
finalizedAt
```

---

# 8. IDENTIFICACIÓN DE LA VENTA

Cada venta debe tener un identificador único.

Ejemplo:

```text
V-00001258
```

Además debe conservar:

```text
Sucursal
POS
Vendedor
Fecha/hora
```

---

# 9. POS

Cada venta debe identificar desde qué terminal fue creada.

Ejemplo:

```text
Sucursal Centro
POS 02
Vendedor:
Juan
```

Esto permite posteriormente analizar:

```text
Ventas por POS
Ventas por vendedor
Ventas por sucursal
```

---

# 10. CARRITO

El vendedor comienza creando un carrito.

```text
CARRITO
↓
Productos
↓
Cantidades
↓
Precios
↓
Descuentos
↓
TOTAL
```

Mientras el carrito no sea confirmado no constituye una venta finalizada.

---

# 11. AGREGAR PRODUCTO

El producto debe poder agregarse mediante:

```text
Código de barras
SKU
Búsqueda
Selección manual
```

La búsqueda debe trabajar sobre variantes vendibles.

---

# 12. VARIANTES

Una venta debe registrar la variante exacta.

Ejemplo:

```text
Producto:
Remera básica

Color:
Negro

Talle:
M

SKU:
REM-NEG-M
```

No debe venderse solamente el producto padre sin identificar su variante cuando el producto tiene variantes.

---

# 13. DETALLE DE VENTA

Entidad conceptual:

```text
SaleItem
```

Debe conservar:

```text
id
saleId
variantId
quantity
unitPrice
discount
subtotal
```

El precio utilizado en la venta debe quedar congelado históricamente.

---

# 14. PRECIO HISTÓRICO

Si una prenda costaba:

```text
$25.000
```

y posteriormente aumenta a:

```text
$30.000
```

una venta anterior debe seguir mostrando:

```text
$25.000
```

No se debe recalcular históricamente utilizando el precio actual.

---

# 15. CANTIDAD

Debe validarse:

```text
quantity > 0
```

No deben existir líneas con cantidades negativas.

Las devoluciones y cambios se manejan mediante operaciones específicas.

---

# 16. STOCK DISPONIBLE

Antes de finalizar una venta debe verificarse el stock disponible.

Ejemplo:

```text
Stock físico:
10

Reservado:
3

Disponible:
7
```

No debe permitirse vender:

```text
8
```

si la política de negocio no permite stock negativo.

---

# 17. RESERVAS

El stock reservado no debe considerarse disponible para una venta normal.

Esto evita vender una prenda que ya fue comprometida para otro cliente.

La gestión completa está definida en:

`14_RESERVAS_Y_SEÑAS.md`.

---

# 18. DESCUENTOS

Los descuentos deben estar controlados por permisos.

Ejemplo:

```text
Vendedor:
hasta 5%

Encargado:
hasta 10%

Administrador:
sin límite según política
```

Los límites definitivos serán definidos en `02_ROLES_Y_PERMISOS.md`.

---

# 19. DESCUENTO POR PRODUCTO

Puede aplicarse a una línea:

```text
Remera:
$30.000

Descuento:
10%

Final:
$27.000
```

Debe conservarse:

```text
Precio original
Descuento
Precio final
Usuario que lo aplicó
```

---

# 20. DESCUENTO GENERAL

También puede existir descuento sobre el total.

Ejemplo:

```text
Subtotal:
$100.000

Descuento:
10%

Total:
$90.000
```

Debe quedar registrado el motivo cuando corresponda.

---

# 21. DESCUENTOS ESPECIALES

Si el vendedor intenta superar su límite:

```text
Descuento solicitado:
15%

Límite vendedor:
5%
```

Debe requerirse autorización.

Ejemplo:

```text
Vendedor
↓
Solicita excepción
↓
Encargado/Admin
↓
Autoriza
```

La venta debe conservar quién autorizó.

---

# 22. CLIENTE

La venta puede asociarse a un cliente.

Entidad conceptual:

```text
Customer
```

Datos mínimos:

```text
id
name
document
phone
email
```

El cliente puede ser opcional dependiendo del tipo de operación.

---

# 23. ESTADOS DE VENTA

Estados principales:

```text
DRAFT
PENDING_PAYMENT
PAYMENT_IN_PROGRESS
PAID
COMPLETED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
```

---

# 24. DRAFT

La venta está siendo construida.

```text
DRAFT
```

Puede modificarse libremente por el vendedor.

Todavía:

```text
No está cobrada
No está finalizada
No genera movimiento financiero
```

---

# 25. PENDIENTE DE COBRO

Cuando el vendedor termina:

```text
DRAFT
↓
PENDING_PAYMENT
```

La venta aparece en la pantalla del cajero.

Ejemplo:

```text
VENTA #1258

Sucursal:
Centro

POS:
02

Vendedor:
Juan

Total:
$85.000

Estado:
PENDIENTE DE COBRO
```

---

# 26. COLA DE COBRO

Caja debe tener una vista:

```text
VENTAS PENDIENTES
```

Mostrando:

```text
Número
Hora
Vendedor
POS
Cliente
Total
Estado
```

---

# 27. SELECCIÓN DE VENTA

El cajero selecciona:

```text
VENTA #1258
```

y visualiza:

```text
Productos
Cantidades
Precios
Descuentos
Subtotal
Total
```

Debe verificar el total antes de cobrar.

---

# 28. CAMBIOS DESDE CAJA

Una vez enviada a cobro, el vendedor no debería modificar silenciosamente la venta.

Si se requiere cambiar productos:

```text
PENDING_PAYMENT
↓
RETURN_TO_POS / EDIT_REQUEST
↓
DRAFT
```

o mediante un mecanismo equivalente.

La regla debe evitar que el cajero cobre un importe distinto al que el vendedor visualizó.

---

# 29. TOTAL DE LA VENTA

Conceptualmente:

```text
Subtotal
- Descuentos
+ Impuestos
= Total
```

El sistema debe calcular automáticamente.

No permitir que el usuario escriba manualmente el total final.

---

# 30. PAGO

Una venta puede tener uno o varios pagos.

Ejemplo:

```text
Total:
$100.000

Pago 1:
$50.000 efectivo

Pago 2:
$50.000 transferencia
```

---

# 31. MÉTODOS DE PAGO

El sistema debe contemplar:

```text
EFECTIVO
TRANSFERENCIA
QR
DEBITO
CREDITO
OTRO
```

Los métodos habilitados pueden variar según la configuración de la empresa.

---

# 32. CUENTA FINANCIERA

Cuando corresponda, además del método debe identificarse la cuenta.

Ejemplo:

```text
Método:
TRANSFERENCIA

Cuenta:
Banco Galicia
```

Otro ejemplo:

```text
Método:
QR

Cuenta:
Mercado Pago
```

El concepto completo se define en:

`12_CUENTAS_FINANCIERAS.md`.

---

# 33. PAGO COMBINADO

Debe soportarse.

Ejemplo:

```text
Total:
$120.000

Efectivo:
$40.000

Transferencia:
$50.000

Tarjeta:
$30.000

Total cobrado:
$120.000
```

La venta queda habilitada para finalizar.

---

# 34. REGLA DE TOTAL DE PAGOS

Debe cumplirse:

```text
SUM(payments.amount) = sale.total
```

No se debe finalizar una venta si:

```text
Pagado < Total
```

salvo que exista explícitamente una operación de saldo pendiente, crédito o cuenta corriente habilitada.

---

# 35. EXCESO DE PAGO

Si:

```text
Total:
$100.000

Pagado:
$110.000
```

el sistema debe manejar explícitamente el excedente.

No debe aceptarlo silenciosamente.

Para efectivo podría existir:

```text
Recibido:
$110.000

Vuelto:
$10.000
```

El vuelto no es una venta adicional.

---

# 36. VUELTO

En efectivo:

```text
Total:
$85.000

Cliente entrega:
$100.000

Vuelto:
$15.000
```

La venta registra:

```text
Venta:
$85.000
```

La caja registra correctamente el ingreso neto correspondiente.

---

# 37. TRANSFERENCIAS

Para una transferencia se recomienda registrar:

```text
Banco/Entidad
Cuenta destino
Referencia/identificador
Importe
Fecha/hora
Usuario
```

Ejemplo:

```text
Método:
TRANSFERENCIA

Entidad:
Banco Macro

Referencia:
TRX-982731

Importe:
$80.000
```

---

# 38. QR

Cuando el pago sea mediante QR:

```text
Método:
QR

Proveedor:
Mercado Pago

Referencia:
MP-123456
```

La información exacta dependerá de la integración implementada.

---

# 39. TARJETAS

Para tarjeta:

```text
Tipo:
Débito / Crédito

Marca:
Visa / Mastercard / etc.

Importe
Cuotas
Referencia/autorización
```

La implementación fiscal/financiera definitiva deberá ajustarse al proveedor de pagos utilizado.

---

# 40. CONFIRMACIÓN DEL PAGO

Una vez que el cajero verifica los pagos:

```text
PAYMENT_IN_PROGRESS
↓
PAID
```

---

# 41. FINALIZACIÓN

La operación pasa a:

```text
PAID
↓
COMPLETED
```

En este punto deben consolidarse las operaciones correspondientes.

---

# 42. STOCK AL FINALIZAR

Una venta completada debe generar:

```text
SALE
```

como movimiento de stock.

Ejemplo:

```text
Sucursal Centro

Remera Negra M:
-1
```

Debe estar vinculado a:

```text
saleId
saleItemId
branchId
variantId
```

---

# 43. MOMENTO DEL DESCUENTO DE STOCK

La arquitectura debe evitar descontar stock dos veces.

La política recomendada es:

```text
DRAFT
→ sin movimiento

PENDING_PAYMENT
→ sin venta final

PAID / COMPLETED
→ SALE
```

El stock se descuenta al confirmar definitivamente la venta.

---

# 44. RESERVA TEMPORAL DURANTE EL COBRO

Para producción con concurrencia puede existir una reserva temporal durante el proceso de pago.

Ejemplo:

```text
Cliente A
↓
POS
↓
Reserva temporal
↓
Caja
↓
Pago
↓
SALE
```

Si la operación se cancela:

```text
Reserva temporal
↓
Liberación
```

La implementación exacta se definirá en arquitectura técnica.

---

# 45. MOVIMIENTO FINANCIERO

Una venta finalizada también genera movimientos financieros.

Ejemplo:

```text
SALE
↓
PAYMENT
↓
FINANCIAL_MOVEMENT
```

Para:

```text
$50.000 efectivo
```

el sistema debe registrar ingreso a:

```text
Caja Sucursal
```

Para:

```text
$50.000 transferencia
```

puede registrar ingreso a:

```text
Banco / Mercado Pago
```

---

# 46. FACTURACIÓN

Cuando corresponda:

```text
Venta
↓
Factura
```

La integración con ARCA se define en:

`19_FACTURACION_ARCA.md`.

La venta y la factura deben permanecer relacionadas.

---

# 47. DEMO DE FACTURACIÓN

Durante la DEMO:

```text
CAE:
SIMULADO

Comprobante:
DEMO

SIN VALIDEZ FISCAL
```

No debe presentarse como una factura fiscal real.

---

# 48. COMPROBANTE

El sistema puede generar un comprobante interno con:

```text
Número de venta
Fecha
Sucursal
POS
Vendedor
Productos
Cantidades
Precios
Descuentos
Total
Medios de pago
```

---

# 49. FACTURA Y COMPROBANTE INTERNO

No deben confundirse:

```text
Comprobante interno de venta
```

con:

```text
Comprobante fiscal autorizado
```

La factura fiscal debe tener su propia numeración y datos de autorización.

---

# 50. CANCELACIÓN ANTES DEL PAGO

Si la venta está:

```text
DRAFT
```

puede cancelarse.

Si está:

```text
PENDING_PAYMENT
```

puede cancelarse según permisos.

No debe generar:

```text
SALE
FINANCIAL_MOVEMENT
```

si nunca fue finalizada.

---

# 51. CANCELACIÓN DESPUÉS DEL PAGO

Una venta ya pagada no debe simplemente borrarse.

Debe existir un proceso de:

```text
Anulación
Devolución
Cambio
Reembolso
```

según el caso.

---

# 52. DEVOLUCIONES

Una devolución no elimina la venta original.

Debe crear una operación relacionada.

Ejemplo:

```text
Venta:
V-1000

Devolución:
DEV-0001
```

El módulo completo se define en:

`16_CAMBIOS_Y_DEVOLUCIONES.md`.

---

# 53. CAMBIOS

Un cambio tampoco debe editar retroactivamente la venta original.

Debe existir:

```text
Venta original
↓
Operación de cambio
↓
Salida de producto
↓
Entrada de producto
↓
Diferencia de precio
```

---

# 54. VENTA DE EMPLEADO

Si un empleado compra mercadería, debe identificarse como tal.

Ejemplo:

```text
Venta:
V-00125

Cliente:
Empleado #25

Tipo:
EMPLOYEE_PURCHASE
```

La política de descuento y pago se define en:

`18_VENTAS_DE_EMPLEADOS.md`.

---

# 55. PRESTAMOS PARA PUBLICIDAD

Una prenda entregada para publicidad no debe registrarse como venta.

Debe utilizar:

```text
MarketingLoan
```

Definido en:

`15_PRESTAMOS_PUBLICIDAD.md`.

---

# 56. RESERVAS

Una reserva tampoco debe convertirse automáticamente en venta.

Flujo:

```text
Reserva
↓
Seña
↓
Producto reservado
↓
Retiro
↓
Venta
↓
Pago restante
```

Se define en:

`14_RESERVAS_Y_SEÑAS.md`.

---

# 57. AUDITORÍA DE VENTA

Registrar como mínimo:

```text
Venta creada
Producto agregado
Producto eliminado
Cantidad modificada
Descuento aplicado
Descuento autorizado
Venta enviada a caja
Pago iniciado
Pago registrado
Venta finalizada
Venta cancelada
Venta anulada
Devolución
Cambio
```

---

# 58. DATOS DE AUDITORÍA

Cada evento debe conservar:

```text
userId
timestamp
action
saleId
previousState
newState
metadata
```

---

# 59. NO ELIMINAR VENTAS

Una venta finalizada no debe eliminarse físicamente.

Debe conservarse:

```text
Historial
Pagos
Stock
Factura
Auditoría
```

---

# 60. CONCURRENCIA

En producción debe contemplarse el caso:

```text
POS 1
↓
intenta vender SKU X

POS 2
↓
intenta vender SKU X
```

al mismo tiempo.

La base de datos debe impedir que ambas operaciones vendan la misma última unidad.

Esto requiere transacciones y control de concurrencia.

---

# 61. IDEMPOTENCIA

Finalizar dos veces la misma venta no debe generar:

```text
2 SALE
2 PAYMENT
2 FINANCIAL_MOVEMENT
2 FACTURAS
```

Debe existir protección contra doble confirmación.

---

# 62. EJEMPLO COMPLETO

## Paso 1 — Vendedor

Selecciona:

```text
Remera Negra M
$30.000

Jean Azul 40
$55.000
```

Subtotal:

```text
$85.000
```

---

## Paso 2 — Cliente

Se asocia:

```text
Cliente:
María Pérez
```

---

## Paso 3 — Descuento

Sin descuento.

Total:

```text
$85.000
```

---

## Paso 4 — Enviar a caja

```text
DRAFT
↓
PENDING_PAYMENT
```

---

## Paso 5 — Cajero

Selecciona:

```text
Venta #1258
```

---

## Paso 6 — Pago

```text
Efectivo:
$35.000

Transferencia:
$50.000
```

Total:

```text
$85.000
```

---

## Paso 7 — Finalización

```text
PAID
↓
COMPLETED
```

---

## Paso 8 — Stock

```text
Remera Negra M:
-1

Jean Azul 40:
-1
```

---

## Paso 9 — Finanzas

```text
Caja Sucursal:
+35.000

Banco/MP:
+50.000
```

---

## Paso 10 — Facturación

Si corresponde:

```text
Factura:
emitida/autorizada
```

---

# 63. FLUJO COMPLETO

```text
VENDEDOR
   ↓
POS
   ↓
CARRITO
   ↓
VALIDACIÓN STOCK
   ↓
DESCUENTOS
   ↓
CONFIRMAR VENTA
   ↓
PENDING_PAYMENT
   ↓
COLA DE CAJA
   ↓
CAJERO
   ↓
SELECCIONA VENTA
   ↓
REGISTRA UNO O VARIOS PAGOS
   ↓
VALIDA TOTAL
   ↓
PAID
   ↓
SALE
   ↓
FINANCIAL_MOVEMENT
   ↓
FACTURA
   ↓
COMPLETED
```

---

# 64. DASHBOARD DEL VENDEDOR

Debe mostrar:

```text
Mis ventas de hoy
Pendientes de cobro
Completadas
Canceladas
Total vendido
Cantidad de operaciones
```

El vendedor no debe visualizar información financiera global de la empresa salvo permisos.

---

# 65. DASHBOARD DE CAJA

Debe mostrar:

```text
Ventas pendientes
Ventas cobradas
Pagos del día
Ventas por medio de pago
Últimas operaciones
```

El detalle completo de caja será definido en:

`10_CAJAS_Y_ARQUEOS.md`.

---

# 66. DASHBOARD ADMINISTRATIVO

Debe permitir:

```text
Ventas por sucursal
Ventas por vendedor
Ventas por POS
Ventas por producto
Ventas por variante
Ventas por período
Ventas por método de pago
Descuentos
Devoluciones
Cambios
```

---

# 67. FILTROS

Las ventas deben poder filtrarse por:

```text
Fecha
Sucursal
POS
Vendedor
Cajero
Cliente
Producto
SKU
Estado
Método de pago
```

---

# 68. REPORTES

El sistema deberá permitir posteriormente:

```text
Ventas diarias
Ventas semanales
Ventas mensuales
Ventas por sucursal
Ventas por vendedor
Ventas por POS
Ventas por producto
Ventas por variante
Ticket promedio
Unidades por venta
Descuentos
Ventas por método de pago
Ventas canceladas
Devoluciones
Cambios
```

---

# 69. MÉTRICAS

Indicadores recomendados:

```text
Facturación total
Cantidad de ventas
Ticket promedio
Unidades vendidas
Unidades por ticket
Ventas por vendedor
Ventas por sucursal
```

---

# 70. DEMO — ESCENARIO PRINCIPAL

La DEMO debe mostrar exactamente:

```text
Vendedor
↓
POS
↓
Crear venta
↓
Agregar prendas
↓
Aplicar descuento permitido
↓
Enviar a caja
↓
Cajero recibe venta
↓
Selecciona pago
↓
Pago combinado
↓
Confirma
↓
Venta finalizada
↓
Stock descontado
↓
Movimiento financiero
↓
Comprobante DEMO
```

---

# 71. DEMO — PAGO COMBINADO

Ejemplo:

```text
Venta:
$100.000

Efectivo:
$30.000

Transferencia:
$40.000

Tarjeta:
$30.000
```

Debe mostrar:

```text
TOTAL:
$100.000

PAGADO:
$100.000

SALDO:
$0
```

---

# 72. DEMO — DESCUENTO NO AUTORIZADO

Vendedor intenta:

```text
Descuento:
20%
```

Límite:

```text
5%
```

Resultado:

```text
⚠️ DESCUENTO REQUIERE AUTORIZACIÓN
```

---

# 73. DEMO — STOCK INSUFICIENTE

Stock disponible:

```text
2
```

Vendedor intenta vender:

```text
3
```

Resultado:

```text
❌ STOCK INSUFICIENTE
Disponible: 2
Solicitado: 3
```

---

# 74. DEMO — VENTA PENDIENTE

Mostrar claramente:

```text
VENTA #1258

PENDIENTE DE COBRO
```

En pantalla del cajero.

---

# 75. DEMO — TRAZABILIDAD

Después de completar una venta debe poder verse:

```text
Venta:
V-001258

Sucursal:
Centro

POS:
02

Vendedor:
Juan

Cajero:
Pedro

Fecha:
02/09/2026

Productos:
2

Total:
$85.000

Pagos:
Efectivo + Transferencia

Stock:
Actualizado

Comprobante:
DEMO
```

---

# 76. REGLAS DE NEGOCIO

### Regla 1

POS y Caja son funciones separadas.

### Regla 2

El vendedor crea la venta.

### Regla 3

El vendedor no cierra caja.

### Regla 4

Una venta enviada a caja pasa a `PENDING_PAYMENT`.

### Regla 5

El cajero finaliza el pago.

### Regla 6

Una venta no se finaliza si los pagos no coinciden con el total.

### Regla 7

Debe soportarse pago combinado.

### Regla 8

El método de pago y la cuenta financiera son conceptos diferentes.

### Regla 9

El stock se descuenta una sola vez.

### Regla 10

Una venta completada genera movimiento de stock.

### Regla 11

Una venta completada genera los movimientos financieros correspondientes.

### Regla 12

La factura, cuando corresponda, queda vinculada a la venta.

### Regla 13

No se eliminan ventas históricas.

### Regla 14

Los cambios y devoluciones no modifican retroactivamente la venta original.

### Regla 15

Los descuentos deben respetar permisos.

### Regla 16

El stock reservado no debe venderse como disponible.

### Regla 17

No se permite stock negativo salvo política explícita.

### Regla 18

No se puede finalizar dos veces la misma venta.

### Regla 19

Cada venta debe identificar sucursal, POS y vendedor.

### Regla 20

Las operaciones críticas deben quedar auditadas.

---

# 77. CRITERIOS DE ACEPTACIÓN

El módulo será considerado correcto cuando permita:

### POS

Crear y modificar carritos.

### Productos

Agregar variantes mediante búsqueda/SKU/código de barras.

### Stock

Validar disponibilidad.

### Cliente

Asociar cliente.

### Descuentos

Aplicar descuentos según permisos.

### Cobro

Enviar venta a caja.

### Caja

Visualizar ventas pendientes.

### Pagos

Registrar múltiples métodos.

### Validación

Comprobar que el total pagado coincide con el total.

### Finalización

Completar la venta.

### Inventario

Generar `SALE`.

### Finanzas

Generar movimientos financieros.

### Facturación

Relacionar venta con comprobante/factura.

### Auditoría

Registrar quién hizo cada operación.

### Seguridad

Impedir que vendedor cierre caja.

---

# 78. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
localStorage
Mock products
Mock stock
Mock users
Mock payments
ARCA simulado
```

Pero la lógica debe respetar:

```text
POS
→ PENDING_PAYMENT
→ CAJA
→ PAYMENT
→ COMPLETED
```

## PRODUCCIÓN

Deberá utilizar:

```text
React + TypeScript
Node + Express + TypeScript
PostgreSQL
Prisma
RBAC
Transacciones
Control de concurrencia
AuditLog
StockMovement
FinancialMovement
ARCA
```

---

# 79. PRINCIPIO FINAL

El sistema debe reflejar el proceso real de la empresa:

```text
VENDEDOR
vende

CAJERO
cobra

SISTEMA
registra

INVENTARIO
descuenta

TESORERÍA
registra dinero

ARCA
autoriza comprobante cuando corresponda
```

Nunca se debe convertir el POS en una caja disfrazada.

La separación fundamental es:

> **El vendedor genera la operación comercial. El cajero valida y recibe el dinero. El sistema conecta ambas operaciones y registra automáticamente stock, pagos, finanzas y facturación.**

El objetivo es que, para cualquier venta, el sistema pueda responder:

> **¿Qué se vendió?**

> **¿Quién lo vendió?**

> **¿Desde qué sucursal y POS?**

> **¿Quién cobró?**

> **¿Cómo se pagó?**

> **¿A qué cuenta ingresó el dinero?**

> **¿Qué stock salió?**

> **¿Qué comprobante se emitió?**

> **¿Cuándo ocurrió cada evento?**

---

**Estado:** DRAFT
**Versión:** 1.0
**Última actualización:** 2026-09-02
