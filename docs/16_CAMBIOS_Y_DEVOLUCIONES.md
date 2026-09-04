# 16 — CAMBIOS Y DEVOLUCIONES

**Archivo:** `16_CAMBIOS_Y_DEVOLUCIONES.md`
**Sistema:** Sistema de Gestión Multisucursal
**Módulo:** Cambios y Devoluciones
**Estado:** Especificación funcional
**Versión:** 1.0

---

# 1. PROPÓSITO

El módulo administra las operaciones posteriores a una venta cuando el cliente solicita:

* cambio de talle;
* cambio de color;
* cambio por otro producto;
* devolución;
* devolución parcial;
* devolución por defecto;
* devolución con reintegro;
* cambio con diferencia a favor de la empresa;
* cambio con diferencia a favor del cliente.

Toda operación debe quedar vinculada a la venta original.

---

# 2. PRINCIPIO FUNDAMENTAL

Un cambio o devolución:

```text
NO MODIFICA LA VENTA ORIGINAL.
```

La venta original permanece histórica.

Ejemplo:

```text
VENTA #000154
$100.000
```

No debe transformarse posteriormente en:

```text
VENTA #000154
$80.000
```

Debe existir una nueva operación:

```text
SALE
   ↓
EXCHANGE / RETURN
   ↓
STOCK MOVEMENTS
   ↓
PAYMENT / REFUND / DIFFERENCE
   ↓
AUDIT
```

---

# 3. OBJETIVOS

El sistema debe permitir:

* localizar la venta original;
* validar que el producto fue vendido;
* identificar la variante;
* verificar cantidades;
* registrar motivo;
* controlar condición;
* ingresar el producto devuelto;
* retirar el producto entregado;
* calcular diferencias;
* registrar dinero recibido o devuelto;
* mantener trazabilidad;
* impedir devoluciones duplicadas;
* conservar el historial.

---

# 4. TIPOS DE OPERACIÓN

Tipos principales:

```text
EXCHANGE
RETURN
```

Y motivos:

```text
CAMBIO_TALLE
CAMBIO_COLOR
CAMBIO_PRODUCTO
DEFECTO
ERROR_DE_VENTA
DISCONFORMIDAD
OTRO
```

---

# 5. CAMBIO

Un cambio ocurre cuando el cliente devuelve uno o más productos y recibe otro producto.

Ejemplo:

```text
Devuelve:
Remera A
$40.000

Lleva:
Remera B
$40.000
```

No necesariamente existe devolución monetaria.

---

# 6. CAMBIO CON DIFERENCIA A PAGAR

Ejemplo:

```text
Producto devuelto:
$40.000

Producto nuevo:
$50.000

Diferencia:
$10.000
```

Resultado:

```text
Cliente paga:
$10.000
```

Debe generarse:

```text
Payment
FinancialMovement
```

vinculados al cambio.

---

# 7. CAMBIO CON DIFERENCIA A FAVOR DEL CLIENTE

Ejemplo:

```text
Producto devuelto:
$50.000

Producto nuevo:
$40.000

Diferencia:
$10.000
```

La empresa debe decidir cómo manejar la diferencia según política comercial:

```text
REFUND
CREDIT
VOUCHER
BALANCE
```

La opción disponible debe estar determinada por permisos y reglas de negocio.

---

# 8. DEVOLUCIÓN

Una devolución implica que el cliente entrega el producto y no necesariamente recibe otro producto.

Ejemplo:

```text
Venta:
$100.000

Producto devuelto:
$100.000
```

Puede producir:

```text
REFUND
```

o:

```text
STORE_CREDIT
```

según las reglas comerciales.

---

# 9. DEVOLUCIÓN PARCIAL

Una venta puede contener:

```text
3 productos
```

y el cliente devolver:

```text
1 producto
```

Debe poder realizarse una devolución parcial.

Ejemplo:

```text
Venta:
$150.000

Devuelve:
Producto A
$50.000

Conserva:
Productos B + C
$100.000
```

---

# 10. ENTIDAD PRINCIPAL

Entidad conceptual:

```text
ReturnExchange
```

Campos:

```text
id
operationNumber

type
status

originalSaleId
branchId
cashRegisterId

customerId

reason
notes

subtotal
discount
total

refundAmount
additionalPaymentAmount

createdBy
approvedBy

createdAt
updatedAt
completedAt
cancelledAt
```

---

# 11. ITEMS

Entidad:

```text
ReturnExchangeItem
```

Campos:

```text
id
operationId

originalSaleItemId
productVariantId

quantity

unitPrice
discount
subtotal

condition
reason

stockDisposition
```

---

# 12. PRODUCTO ORIGINAL

El producto devuelto debe vincularse al:

```text
originalSaleItemId
```

Esto permite comprobar:

```text
qué se vendió
cuándo
a qué precio
cantidad
sucursal
venta
cliente
```

---

# 13. VALIDACIÓN DE VENTA

Antes de aceptar el cambio/devolución:

```text
Sale.status
```

debe ser compatible con una operación posventa.

No debe permitirse devolver una venta:

```text
CANCELLED
```

si la operación ya fue anulada por otro mecanismo.

---

# 14. VALIDACIÓN DE CANTIDAD

Si se vendieron:

```text
5 unidades
```

no se pueden devolver:

```text
6
```

El sistema debe calcular:

```text
cantidad vendida
-
cantidad ya devuelta/cambiada
=
cantidad disponible para devolución
```

---

# 15. PREVENCIÓN DE DUPLICADOS

Una misma unidad no puede ser devuelta dos veces.

Debe controlarse:

```text
returnedQuantity
exchangedQuantity
remainingQuantity
```

Ejemplo:

```text
Vendido:
3

Ya devuelto:
2

Disponible para devolución:
1
```

---

# 16. CONDICIÓN DEL PRODUCTO

Al recibir el producto se debe registrar:

```text
NUEVO
EXCELENTE
BUENO
USADO
CON_DETALLE
DAÑADO
DEFECTUOSO
```

La condición determina su destino de inventario.

---

# 17. DESTINO DE STOCK

El producto devuelto puede quedar:

```text
AVAILABLE
REVIEW
DAMAGED
DEFECTIVE
RETURN_TO_SUPPLIER
OTHER
```

Nunca debe ingresar automáticamente al stock vendible sin validación cuando exista un motivo que requiera revisión.

---

# 18. CAMBIO DE TALLE

Ejemplo:

```text
Venta:
Camisa
Blanco
Talle M

Cambio:
Camisa
Blanco
Talle L
```

Se debe registrar:

```text
EXCHANGE_OUT
EXCHANGE_IN
```

según el movimiento físico correspondiente.

---

# 19. CAMBIO DE COLOR

Ejemplo:

```text
Devuelve:
Camisa / Negro / M

Recibe:
Camisa / Azul / M
```

Cada variante debe tratarse como un SKU independiente.

---

# 20. CAMBIO POR OTRO PRODUCTO

Puede cambiarse:

```text
Producto A
```

por:

```text
Producto B
```

El sistema debe permitir seleccionar cualquier producto permitido por las reglas comerciales.

Debe conservar:

```text
originalSaleItemId
newProductVariantId
```

---

# 21. STOCK DEL PRODUCTO DEVUELTO

Cuando se recibe físicamente:

```text
Producto devuelto
```

se genera:

```text
EXCHANGE_IN
```

o:

```text
RETURN_IN
```

según el tipo de operación.

La cantidad debe reflejar la realidad física.

---

# 22. STOCK DEL PRODUCTO ENTREGADO

Cuando se entrega el nuevo producto:

```text
EXCHANGE_OUT
```

Debe existir validación de stock disponible.

No se puede entregar:

```text
cantidad > stock disponible
```

salvo que exista una regla explícita de excepción.

---

# 23. EJEMPLO DE CAMBIO

```text
Venta #00100

Producto:
Pantalón
Talle M

Precio:
$60.000
```

Cliente devuelve:

```text
Talle M
```

y recibe:

```text
Talle L
```

Mismo precio.

Movimientos:

```text
EXCHANGE_IN
Pantalón M
+1

EXCHANGE_OUT
Pantalón L
-1
```

Diferencia:

```text
$0
```

---

# 24. CAMBIO CON DIFERENCIA

Venta original:

```text
$60.000
```

Nuevo producto:

```text
$75.000
```

Diferencia:

```text
$15.000
```

El cliente paga:

```text
$15.000
```

El sistema genera:

```text
Payment
FinancialMovement
```

referenciando:

```text
ReturnExchange
```

---

# 25. DEVOLUCIÓN CON REINTEGRO

Venta:

```text
$75.000
```

Cliente devuelve producto.

Reintegro:

```text
$75.000
```

Debe registrarse:

```text
Refund
Payment
FinancialMovement
```

El movimiento financiero debe referenciar:

```text
originalSaleId
returnExchangeId
```

---

# 26. REINTEGRO EN EFECTIVO

Si corresponde devolver efectivo:

```text
FinancialMovement
```

tipo:

```text
REFUND
```

y:

```text
CashMovement
```

tipo:

```text
REFUND_CASH
```

La caja debe disminuir.

---

# 27. REINTEGRO POR TRANSFERENCIA

Debe registrarse:

```text
paymentMethod = TRANSFERENCIA
financialAccount = cuenta correspondiente
```

Además:

```text
reference
destination
```

cuando corresponda.

---

# 28. REINTEGRO POR TARJETA

El sistema debe contemplar que un reintegro por tarjeta puede tener un proceso diferente al efectivo.

Debe conservar:

```text
paymentMethod
financialAccount
operator
reference
originalPaymentId
```

La acreditación/reintegro real puede depender del proveedor.

---

# 29. REINTEGRO POR QR

Debe conservar:

```text
originalPayment
provider
reference
amount
date
```

La operación financiera debe quedar vinculada al reembolso.

---

# 30. PAGOS COMBINADOS

Si la venta original fue:

```text
Efectivo:
$30.000

Transferencia:
$20.000

Total:
$50.000
```

el sistema debe conservar la composición original.

Un cambio/devolución no debe borrar los pagos originales.

---

# 31. POLÍTICA DE REINTEGRO

La política comercial debe definir:

```text
mismo medio de pago
efectivo
transferencia
crédito interno
voucher
otro
```

El sistema debe permitir configurar estas reglas sin modificar el histórico.

---

# 32. SEÑAS Y RESERVAS

Si una venta proviene de una reserva:

```text
Reservation
   ↓
Sale
```

el cambio/devolución debe poder identificar:

```text
reservationId
saleId
payments
```

El sistema debe evitar devolver dos veces una misma seña.

---

# 33. CAMBIO DE PRODUCTO RESERVADO

No se debe permitir entregar una variante reservada para otro cliente sin una regla explícita.

Debe validarse:

```text
available stock
reserved stock
```

antes de completar el cambio.

---

# 34. PRODUCTOS PRESTADOS

Un producto devuelto por cliente y posteriormente destinado a publicidad debe pasar por un proceso independiente.

No mezclar:

```text
RETURN
```

con:

```text
MARKETING_LOAN
```

Cada módulo genera sus propios movimientos.

---

# 35. PRODUCTO DEFECTUOSO

Si el cliente devuelve por defecto:

```text
reason = DEFECT
```

debe poder registrarse:

```text
descripción
fotos
observaciones
proveedor
lote
```

si corresponde.

---

# 36. DEVOLUCIÓN A PROVEEDOR

Si un producto defectuoso debe regresar al proveedor:

```text
Customer Return
       ↓
DEFECTIVE
       ↓
Supplier Return
```

No debe considerarse disponible para venta.

---

# 37. CAMBIO Y PRECIO HISTÓRICO

El sistema debe conservar:

```text
precio original de venta
```

y:

```text
precio utilizado para el cambio
```

No debe sobrescribirse el precio histórico de `SaleItem`.

---

# 38. DESCUENTOS

Si la venta original tenía descuento:

```text
Precio:
$100.000

Descuento:
$10.000

Pagado:
$90.000
```

el cálculo de devolución debe respetar el valor efectivamente cobrado y las reglas comerciales.

No utilizar simplemente:

```text
precio de lista actual
```

para calcular automáticamente el reintegro.

---

# 39. CAMBIO POR PRODUCTO MÁS CARO

Debe calcularse:

```text
valor nuevo
-
valor reconocido
=
diferencia
```

La diferencia genera:

```text
Payment
FinancialMovement
```

---

# 40. CAMBIO POR PRODUCTO MÁS BARATO

Debe calcularse:

```text
valor reconocido
-
valor nuevo
=
diferencia a favor
```

La aplicación debe seguir la política configurada:

```text
REFUND
CREDIT
VOUCHER
NO_REFUND
```

---

# 41. AUTORIZACIÓN

Los cambios simples pueden ser realizados por:

```text
VENDEDOR
```

según configuración.

Operaciones sensibles pueden requerir:

```text
CAJERO
ADMINISTRADOR
```

Ejemplos:

```text
devolución de alto monto
reintegro
producto usado
producto dañado
cambio fuera de plazo
```

---

# 42. CAMBIOS FUERA DE PLAZO

El sistema puede calcular:

```text
fecha de venta
+
política de días
=
fecha límite
```

Ejemplo:

```text
Venta:
01/09

Política:
30 días

Límite:
01/10
```

Si se intenta después:

```text
REQUIERE_AUTORIZACION
```

No necesariamente debe bloquearse absolutamente.

---

# 43. CAMBIO EN OTRA SUCURSAL

Debe poder configurarse si un cliente puede cambiar una compra realizada en otra sucursal.

Si está permitido:

```text
Sucursal A
Venta

Sucursal B
Cambio
```

El sistema debe registrar:

```text
originalBranchId
processingBranchId
```

Esto es fundamental para reportes.

---

# 44. MOVIMIENTOS ENTRE SUCURSALES

Si la variante necesaria para completar el cambio no está en la sucursal:

```text
Sucursal B
   ↓
solicitud
   ↓
Transferencia
   ↓
Sucursal A
```

Debe utilizarse:

```text
08_TRANSFERENCIAS_Y_REMITOS.md
```

No crear un mecanismo paralelo.

---

# 45. DEVOLUCIÓN EN SUCURSAL DIFERENTE

Debe conservarse:

```text
Venta original:
Sucursal Centro

Devolución:
Sucursal Norte
```

La operación financiera debe registrar correctamente dónde ocurrió el reintegro.

---

# 46. CAJA

Si el reintegro se realiza en efectivo:

```text
CashRegister
```

debe registrar:

```text
REFUND_CASH
```

La operación debe impactar el arqueo.

---

# 47. TESORERÍA

El reintegro también debe generar:

```text
FinancialMovement
```

Esto permite que:

```text
Caja
```

y:

```text
Tesorería
```

mantengan consistencia.

---

# 48. NO DUPLICAR MOVIMIENTOS

Una devolución en efectivo no debe generar accidentalmente dos salidas financieras.

Debe existir una relación clara:

```text
ReturnExchange
      ↓
Payment
      ↓
FinancialMovement
      ↓
CashMovement
```

La implementación final debe definir qué registros son derivados y cuáles son fuentes de verdad para evitar doble contabilización.

---

# 49. CANCELACIÓN

Una operación de cambio/devolución no debe eliminarse.

Si fue creada por error:

```text
CANCELLED
```

Debe conservar:

```text
motivo
usuario
fecha
```

Si ya produjo movimientos:

```text
StockMovement
FinancialMovement
```

deben compensarse mediante operaciones inversas.

---

# 50. IDEMPOTENCIA

Una misma devolución no puede procesarse dos veces.

Ejemplo:

```text
POST /returns/123/complete
```

si se ejecuta dos veces, el sistema no debe:

```text
devolver stock x2
reintegrar dinero x2
```

Debe utilizarse:

```text
idempotency key
```

o mecanismo equivalente.

---

# 51. CONCURRENCIA

Debe evitarse:

```text
dos cajeros
+
misma venta
+
misma unidad
+
dos devoluciones
```

El backend debe validar cantidades dentro de una transacción.

---

# 52. AUDITORÍA

Eventos mínimos:

```text
RETURN_CREATED
RETURN_APPROVED
RETURN_COMPLETED
RETURN_CANCELLED

EXCHANGE_CREATED
EXCHANGE_APPROVED
EXCHANGE_COMPLETED
EXCHANGE_CANCELLED

REFUND_CREATED
REFUND_COMPLETED
```

Debe registrarse:

```text
usuario
fecha
hora
sucursal
venta original
operación
motivo
importe
```

---

# 53. HISTORIAL

Desde la venta original debe poder verse:

```text
Venta
 ├── Pagos
 ├── Factura
 ├── Cambios
 ├── Devoluciones
 ├── Reintegros
 └── Auditoría
```

Desde el cambio:

```text
Cambio
 ├── Venta original
 ├── Productos devueltos
 ├── Productos entregados
 ├── Diferencia
 ├── Pagos
 ├── Stock movements
 └── Auditoría
```

---

# 54. DASHBOARD

Debe mostrar:

```text
Cambios del día
Devoluciones del día
Monto devuelto
Diferencias cobradas
Diferencias devueltas
Productos devueltos
Productos dañados
Cambios por sucursal
Motivos principales
```

---

# 55. REPORTES

## Por sucursal

```text
cambios
devoluciones
reintegros
```

## Por producto

```text
producto
cantidad vendida
cantidad cambiada
cantidad devuelta
tasa de devolución
```

## Por motivo

```text
talle
color
defecto
disconformidad
error
otro
```

---

# 56. INDICADORES

Puede calcularse:

```text
Tasa de devolución =
unidades devueltas / unidades vendidas
```

y:

```text
Tasa de cambio =
unidades cambiadas / unidades vendidas
```

También:

```text
% por defecto
% por talle
% por color
```

Esto puede revelar problemas de:

```text
calce
calidad
descripción
stock
proceso de venta
```

---

# 57. EXPORTACIÓN

Debe poder exportarse:

```text
CSV
XLSX
```

con:

```text
Número
Fecha
Sucursal venta
Sucursal operación
Venta original
Cliente
Producto
SKU
Cantidad
Motivo
Tipo
Importe
Reintegro
Diferencia
Usuario
Estado
```

---

# 58. DEMO — CAMBIO SIMPLE

```text
Venta #1001

Remera
Negro / M
$40.000
```

Cliente solicita:

```text
Negro / L
$40.000
```

Resultado:

```text
EXCHANGE
```

Stock:

```text
Remera M
+1

Remera L
-1
```

Dinero:

```text
$0
```

---

# 59. DEMO — CAMBIO CON DIFERENCIA

```text
Devuelve:
$40.000

Lleva:
$55.000
```

Diferencia:

```text
$15.000
```

Resultado:

```text
Payment
$15.000

FinancialMovement
+ $15.000
```

---

# 60. DEMO — DEVOLUCIÓN

```text
Venta:
$80.000

Devuelve:
producto completo
```

Resultado:

```text
RETURN
```

Stock:

```text
RETURN_IN
+1
```

Dinero:

```text
REFUND
- $80.000
```

---

# 61. DEMO — PRODUCTO DAÑADO

```text
Cliente devuelve:
Vestido

Motivo:
DEFECTO
```

Condición:

```text
DEFECTUOSO
```

Resultado:

```text
Stock vendible:
NO
```

Se registra:

```text
RETURN_IN
+
DEFECTIVE
```

---

# 62. DEMO — CAMBIO EN OTRA SUCURSAL

```text
Venta:
Sucursal Centro

Cambio:
Sucursal Norte
```

Resultado:

```text
originalBranchId = Centro
processingBranchId = Norte
```

El sistema mantiene ambos datos.

---

# 63. CRITERIOS DE ACEPTACIÓN

El módulo será aceptado cuando:

* [ ] Se pueda localizar una venta.
* [ ] Se pueda consultar el detalle original.
* [ ] Se pueda crear cambio.
* [ ] Se pueda crear devolución.
* [ ] Se pueda realizar devolución parcial.
* [ ] Se pueda cambiar talle.
* [ ] Se pueda cambiar color.
* [ ] Se pueda cambiar producto.
* [ ] Se puedan calcular diferencias.
* [ ] Se pueda cobrar diferencia.
* [ ] Se pueda devolver diferencia.
* [ ] Se pueda registrar reintegro.
* [ ] Se puedan manejar pagos combinados.
* [ ] Se controle cantidad disponible para devolución.
* [ ] Se impidan devoluciones duplicadas.
* [ ] Se controle condición del producto.
* [ ] Se controle stock.
* [ ] Se registre auditoría.
* [ ] Se pueda autorizar operación según permisos.
* [ ] Se puedan procesar operaciones entre sucursales.
* [ ] Se mantenga la venta original intacta.
* [ ] Se puedan consultar movimientos financieros.
* [ ] Se puedan generar reportes.

---

# 64. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
localStorage
mock payments
mock stock movements
mock refunds
```

Debe demostrar:

```text
Venta
→ Cambio
→ Stock

Venta
→ Devolución
→ Stock
→ Reintegro

Venta
→ Cambio
→ Diferencia
→ Pago
```

---

## PRODUCCIÓN

Debe utilizar:

```text
PostgreSQL
Prisma
Transactions
RBAC
AuditLog
StockMovement
Payment
FinancialMovement
Idempotency
Concurrency Control
```

---

# 65. RELACIÓN CON OTROS MÓDULOS

```text
09_VENTAS_Y_POS.md
        ↓
13_PAGOS_Y_MOVIMIENTOS_DINERO.md
        ↓
16_CAMBIOS_Y_DEVOLUCIONES.md
        ↓
05_INVENTARIO_Y_STOCK.md
```

También:

```text
10_CAJAS_Y_ARQUEOS.md
11_TESORERIA_Y_CAJA_MAYOR.md
12_CUENTAS_FINANCIERAS.md
14_RESERVAS_Y_SEÑAS.md
15_PRESTAMOS_PUBLICIDAD.md
19_FACTURACION_ARCA.md
20_REPORTES_Y_EXPORTACIONES.md
21_AUDITORIA_Y_TRAZABILIDAD.md
22_REGLAS_DE_NEGOCIO.md
23_ESTADOS_Y_TRANSICIONES.md
24_MODELO_DE_DATOS.md
```

---

# 66. MODELO CONCEPTUAL

```text
SALE
 │
 ├───────────────┐
 │               │
 ▼               ▼
RETURN         EXCHANGE
 │               │
 ▼               ├───────────────┐
STOCK IN         ▼               ▼
 │          PRODUCT IN       PRODUCT OUT
 │               │               │
 └───────┬───────┴───────────────┘
         ▼
      DIFFERENCE
         │
    ┌────┴────┐
    ▼         ▼
 PAYMENT    REFUND
    │         │
    └────┬────┘
         ▼
FINANCIAL MOVEMENT
         │
         ▼
      AUDIT LOG
```

---

# 67. REGLAS FUNDAMENTALES

```text
1. La venta original nunca se sobrescribe.

2. Todo cambio/devolución referencia una venta.

3. Una unidad no puede devolverse dos veces.

4. Todo ingreso/salida físico genera movimiento de stock.

5. Todo movimiento financiero debe tener referencia.

6. Un reintegro no elimina el pago original.

7. Los cambios con diferencia generan un nuevo movimiento financiero.

8. Las operaciones canceladas permanecen en el historial.

9. Las cantidades se validan transaccionalmente.

10. Stock y dinero deben quedar sincronizados.

11. Los permisos controlan las operaciones sensibles.

12. Todo queda auditado.
```

---

# 68. PRINCIPIO FINAL

El módulo debe permitir reconstruir exactamente qué ocurrió después de una venta.

Ejemplo:

```text
VENTA #000154
      │
      ├── Pago $100.000
      │
      ├── Producto A vendido
      │
      ▼
CAMBIO #000023
      │
      ├── Producto A → INGRESÓ
      ├── Producto B → SALIÓ
      │
      ├── Diferencia $15.000
      │
      ├── Payment $15.000
      ├── FinancialMovement +$15.000
      │
      └── AuditLog
```

La regla esencial:

```text
NO SE BORRA EL PASADO.

SE REGISTRA LA NUEVA OPERACIÓN.
```

El sistema debe ser capaz de reconstruir:

```text
qué se vendió
qué se devolvió
qué se cambió
qué producto ingresó
qué producto salió
cuánto dinero se devolvió
cuánto dinero se cobró
quién lo hizo
cuándo ocurrió
en qué sucursal
y por qué.
```
