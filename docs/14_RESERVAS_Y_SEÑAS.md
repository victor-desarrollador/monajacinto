# 14 — RESERVAS Y SEÑAS

**Archivo:** `14_RESERVAS_Y_SEÑAS.md`
**Sistema:** Sistema de Gestión Multisucursal
**Módulo:** Reservas y Señas
**Estado:** Especificación funcional
**Versión:** 1.0

---

# 1. PROPÓSITO

El módulo de **Reservas y Señas** permite apartar productos para un cliente durante un período determinado, registrar una seña o anticipo y controlar posteriormente:

* disponibilidad del producto;
* stock reservado;
* vencimiento de la reserva;
* retiro;
* saldo pendiente;
* cancelación;
* devolución de seña;
* pérdida de seña cuando corresponda según la política comercial;
* trazabilidad completa.

La reserva **no debe confundirse con una venta finalizada**.

---

# 2. PRINCIPIO FUNDAMENTAL

Una reserva representa:

> Un compromiso temporal de disponibilidad de uno o más productos para un cliente.

Una seña representa:

> Un importe monetario entregado por el cliente asociado a una reserva.

Por lo tanto:

```text
RESERVA ≠ VENTA
SEÑA ≠ VENTA COMPLETA
```

Una reserva puede existir:

```text
sin seña
```

si la política del negocio lo permite.

También:

```text
RESERVA + SEÑA
```

puede posteriormente convertirse en una venta.

---

# 3. FLUJO GENERAL

```text
CLIENTE
   ↓
RESERVA
   ↓
PRODUCTO RESERVADO
   ↓
STOCK RESERVADO
   ↓
SEÑA
   ↓
ESPERA
   ↓
┌───────────────┬───────────────┐
│               │               │
RETIRO       CANCELACIÓN     VENCIMIENTO
│               │               │
▼               ▼               ▼
VENTA        DEVOLUCIÓN       LIBERAR
FINAL        / POLÍTICA       STOCK
```

---

# 4. RESERVA

Entidad conceptual:

```text
Reservation
```

Debe representar la operación completa.

Campos conceptuales:

```text
id
reservationNumber

customerId
branchId

status

reservedAt
expiresAt

subtotal
discount
total

depositAmount
balanceAmount

createdBy
cancelledBy
completedBy

createdAt
updatedAt
cancelledAt
completedAt

notes
```

---

# 5. RESERVATION ITEM

Cada reserva puede contener uno o más productos.

Entidad:

```text
ReservationItem
```

Campos:

```text
id
reservationId

productVariantId

quantity

unitPrice
discount
subtotal

stockLocationId
```

Debe utilizar siempre la **variante vendible**.

Ejemplo:

```text
Producto:
Campera Roma

Color:
Negro

Talle:
M

SKU:
CAM-ROM-NEG-M
```

La reserva debe apuntar a esa variante concreta.

---

# 6. IDENTIFICACIÓN DEL CLIENTE

Una reserva debería asociarse a un cliente.

Datos mínimos:

```text
nombre
apellido
teléfono
email
```

El teléfono es especialmente útil para:

* confirmar reserva;
* avisar disponibilidad;
* recordar vencimiento;
* coordinar retiro.

Si el negocio permite reservas sin cliente registrado, deberá utilizarse al menos información de contacto suficiente para identificar la operación.

---

# 7. SUCURSAL DE LA RESERVA

Toda reserva debe pertenecer a una sucursal.

Ejemplo:

```text
Reserva:
RES-000152

Sucursal:
Centro
```

El sistema debe saber:

```text
dónde se realizó
dónde está reservado el stock
dónde debe retirarse
```

---

# 8. STOCK RESERVADO

La reserva afecta la disponibilidad.

Conceptualmente:

```text
Stock físico = 10

Reservado = 3

Disponible = 7
```

Por lo tanto:

```text
AVAILABLE = PHYSICAL - RESERVED
```

La reserva no necesariamente elimina físicamente las unidades del inventario.

Las unidades continúan físicamente en la sucursal, pero quedan comprometidas.

---

# 9. MOVIMIENTO DE STOCK

La reserva debe generar movimientos trazables.

Ejemplo:

```text
RESERVATION
```

Cuando se crea:

```text
Stock físico:
10

Reservado:
+3

Disponible:
7
```

Cuando se libera:

```text
RESERVATION_RELEASE
```

Resultado:

```text
Reservado:
-3

Disponible:
10
```

---

# 10. STOCK RESERVADO VS STOCK VENDIDO

Una reserva no genera:

```text
SALE
```

ni:

```text
SALE_STOCK_MOVEMENT
```

hasta que realmente se concreta la venta.

Flujo:

```text
RESERVA
 ↓
RESERVATION
 ↓
RESERVATION_STOCK
```

Posteriormente:

```text
RETIRO
 ↓
SALE
 ↓
SALE_STOCK_MOVEMENT
 ↓
RESERVATION_RELEASE
```

---

# 11. ESTADOS DE RESERVA

Estados mínimos:

```text
RESERVADA
RETIRADA
CANCELADA
VENCIDA
NO_RETIRADA
```

Puede agregarse:

```text
PENDIENTE_DE_PAGO
```

o estados internos adicionales si resultan necesarios.

---

# 12. TRANSICIONES

Flujo normal:

```text
RESERVADA
    ↓
RETIRADA
```

Cancelación:

```text
RESERVADA
    ↓
CANCELADA
```

Vencimiento:

```text
RESERVADA
    ↓
VENCIDA
```

Si el negocio necesita distinguir explícitamente una reserva vencida que nunca fue retirada:

```text
RESERVADA
    ↓
VENCIDA
    ↓
NO_RETIRADA
```

La transición definitiva debe quedar centralizada en `23_ESTADOS_Y_TRANSICIONES.md`.

---

# 13. FECHA DE VENCIMIENTO

Toda reserva debe tener:

```text
reservedAt
expiresAt
```

Ejemplo:

```text
Reserva:
03/09/2026

Vencimiento:
05/09/2026
```

La interfaz debe mostrar claramente:

```text
Vence en:
1 día
```

o:

```text
VENCIDA
```

---

# 14. REGLA DE VENCIMIENTO

Una reserva vencida no debe continuar bloqueando indefinidamente el stock.

Al vencerse:

```text
Reservation
→ VENCIDA

Stock
→ RESERVATION_RELEASE
```

Debe quedar registrado:

```text
fecha
hora
usuario o proceso
motivo
```

---

# 15. VENCIMIENTO AUTOMÁTICO

En producción se puede ejecutar un proceso programado:

```text
Scheduler
   ↓
buscar reservas vencidas
   ↓
cambiar estado
   ↓
liberar stock
   ↓
registrar auditoría
```

La liberación debe ser idempotente.

Nunca:

```text
RESERVATION_RELEASE
RESERVATION_RELEASE
```

dos veces para las mismas unidades.

---

# 16. SEÑA

Entidad conceptual:

```text
Deposit
```

Campos:

```text
id
reservationId

amount

paymentMethod
financialAccountId

paymentReference

status

createdBy
createdAt

notes
```

La seña debe estar vinculada directamente a la reserva.

---

# 17. IMPORTE DE SEÑA

Ejemplo:

```text
Reserva:
$200.000

Seña:
$50.000

Saldo:
$150.000
```

La fórmula:

```text
BALANCE = TOTAL - DEPOSIT_TOTAL
```

Debe considerar múltiples señas si el negocio las permite.

---

# 18. MÚLTIPLES SEÑAS

Puede permitirse:

```text
Seña #1:
$30.000

Seña #2:
$20.000

Total señas:
$50.000
```

El sistema debe conservar cada pago individual.

No debe sobrescribirse la primera seña.

---

# 19. MÉTODOS DE PAGO DE LA SEÑA

Debe soportar:

```text
EFECTIVO
TRANSFERENCIA
QR
DEBITO
CREDITO
OTRO
```

La cuenta financiera debe quedar asociada cuando corresponda.

Ejemplo:

```text
Método:
TRANSFERENCIA

Cuenta:
Mercado Pago

Seña:
$50.000
```

Resultado:

```text
Mercado Pago
+$50.000
```

---

# 20. SEÑA Y MOVIMIENTO FINANCIERO

La creación de una seña debe generar el correspondiente movimiento financiero.

Conceptualmente:

```text
Deposit
   ↓
Payment
   ↓
FinancialMovement
   ↓
FinancialAccount
```

Ejemplo:

```text
Seña:
$50.000

Mercado Pago:
+$50.000
```

Debe quedar vinculada a:

```text
Reservation
Deposit
Payment
FinancialMovement
FinancialAccount
```

---

# 21. SEÑA NO ES INGRESO DE UNA VENTA

Una seña recibida sobre una reserva no debe registrarse automáticamente como:

```text
Sale = $50.000
```

La venta todavía no está finalizada.

Debe mantenerse como:

```text
Reservation
+
Deposit
```

hasta que el cliente retire y se complete la operación comercial.

---

# 22. RETIRO DE RESERVA

Cuando el cliente retira:

```text
RESERVADA
     ↓
RETIRO
     ↓
VENTA
     ↓
COBRO DEL SALDO
     ↓
RETIRADA
```

Ejemplo:

```text
Precio:
$200.000

Seña:
$50.000

Saldo:
$150.000
```

El cliente paga:

```text
$150.000
```

Y se genera la venta completa:

```text
Venta:
$200.000
```

---

# 23. CONVERSIÓN A VENTA

La conversión debe conservar la relación:

```text
Reservation
      ↓
Sale
```

La venta debe conocer:

```text
reservationId
```

cuando provenga de una reserva.

La reserva debe conocer:

```text
saleId
```

si se decide mantener relación directa.

---

# 24. EVITAR DUPLICAR LA SEÑA

Al convertir una reserva en venta:

```text
Total venta:
$200.000

Seña previa:
$50.000

Saldo:
$150.000
```

La seña no debe volver a cobrarse.

Debe registrarse como:

```text
Payment aplicado:
$50.000
```

o como crédito/anticipo aplicado según el diseño financiero definitivo.

Resultado:

```text
Pagado acumulado:
$50.000

Nuevo pago:
$150.000

Total:
$200.000
```

---

# 25. STOCK AL RETIRAR

Antes del retiro:

```text
Físico:
10

Reservado:
1

Disponible:
9
```

Al completar la venta:

```text
Físico:
9

Reservado:
0

Disponible:
9
```

La transición debe generar los movimientos correspondientes sin duplicar la salida.

---

# 26. CANCELACIÓN

Una reserva puede cancelarse.

Ejemplo:

```text
RESERVADA
   ↓
CANCELADA
```

Al cancelar:

```text
Stock reservado
→ liberar
```

La política de la seña se determina según la configuración comercial.

---

# 27. CANCELACIÓN SIN SEÑA

Ejemplo:

```text
Reserva:
$200.000

Seña:
$0
```

Cancelación:

```text
Reserva:
CANCELADA

Stock:
LIBERADO
```

No existe devolución monetaria.

---

# 28. CANCELACIÓN CON DEVOLUCIÓN

Ejemplo:

```text
Seña:
$50.000
```

Si corresponde devolverla:

```text
Mercado Pago
-$50.000
```

Y:

```text
Deposit
→ REFUNDED
```

Debe generarse un movimiento financiero inverso relacionado con la operación original.

---

# 29. CANCELACIÓN CON PÉRDIDA DE SEÑA

Si la política comercial determina que la seña no es reembolsable:

```text
Reserva:
CANCELADA

Seña:
NO DEVUELTA
```

La decisión debe quedar registrada.

No debe eliminarse ni ocultarse el pago original.

---

# 30. POLÍTICA DE SEÑAS

La política debe ser configurable.

Ejemplos:

```text
SEÑA_REEMBOLSABLE
SEÑA_NO_REEMBOLSABLE
REEMBOLSO_PARCIAL
REEMBOLSO_SEGÚN_AUTORIZACIÓN
```

El sistema no debe asumir automáticamente una política legal/comercial sin configuración del negocio.

---

# 31. DEVOLUCIÓN PARCIAL DE SEÑA

Ejemplo:

```text
Seña:
$100.000

Reembolso:
$70.000

Retenido:
$30.000
```

Debe quedar:

```text
Deposit:
$100.000

Refund:
$70.000
```

No modificar el importe histórico de la seña.

---

# 32. CANCELACIÓN POR PARTE DEL NEGOCIO

Puede ocurrir que el negocio cancele una reserva.

Debe registrar:

```text
motivo
usuario
fecha
hora
```

Ejemplo:

```text
Motivo:
Producto no disponible
```

Si corresponde:

```text
Reembolso:
$50.000
```

---

# 33. PRODUCTO NO DISPONIBLE

Si una reserva está activa pero el producto no puede entregarse:

```text
RESERVADA
   ↓
INCIDENCIA
   ↓
CANCELADA
```

Debe existir una razón.

Ejemplos:

```text
ROTURA
ERROR_DE_STOCK
PRODUCTO_EXTRAVIADO
ERROR_OPERATIVO
OTRO
```

---

# 34. CAMBIO DE FECHA

El sistema puede permitir extender una reserva.

Ejemplo:

```text
Vencimiento original:
05/09

Nuevo vencimiento:
07/09
```

Debe registrar:

```text
fecha anterior
fecha nueva
usuario
motivo
```

No debe modificarse silenciosamente el historial.

---

# 35. EXTENSIÓN

Las extensiones pueden requerir autorización.

Ejemplo:

```text
Cajero:
solicita extensión

Administrador:
aprueba

Nuevo vencimiento:
07/09
```

Debe quedar auditado.

---

# 36. CAMBIO DE SUCURSAL

Por defecto, una reserva pertenece a una sucursal.

Si el negocio permite moverla:

```text
Sucursal Centro
      ↓
Transferencia
      ↓
Sucursal Yerba Buena
```

No debe simplemente cambiarse:

```text
branchId
```

sin movimiento de stock.

Debe utilizarse el mecanismo de transferencia correspondiente.

---

# 37. RESERVA DE VARIAS UNIDADES

Ejemplo:

```text
Remeras:
3 unidades

Reserva:
2
```

Resultado:

```text
Stock físico:
3

Reservado:
2

Disponible:
1
```

La reserva debe controlar cantidades por variante.

---

# 38. RESERVA DE VARIANTES

Ejemplo:

```text
Campera
Negro / M
Negro / L
Azul / M
```

Una reserva:

```text
Negro / M:
1
Azul / M:
1
```

Cada variante debe afectar su propio stock.

Nunca reservar:

```text
producto genérico
```

sin determinar la variante concreta.

---

# 39. PREVENCIÓN DE SOBRE-RESERVA

Si:

```text
Disponible:
2
```

no debe permitirse:

```text
Reserva:
3
```

salvo que el negocio permita explícitamente backorders.

Por defecto:

```text
quantity <= availableStock
```

---

# 40. RESERVA Y VENTA CONCURRENTE

Debe protegerse la operación contra dos usuarios intentando reservar la última unidad simultáneamente.

Ejemplo:

```text
Stock disponible:
1
```

Usuario A:

```text
Reserva 1
```

Usuario B:

```text
Reserva 1
```

Solo una operación debe tener éxito.

En producción se utilizarán:

```text
DB transaction
row locking / concurrency control
```

según la implementación.

---

# 41. RESERVA Y OTROS PROCESOS

Una unidad reservada no debería poder:

```text
venderse a otro cliente
transferirse
prestarse para publicidad
```

sin liberar o modificar correctamente la reserva.

Si se necesita una excepción, debe existir un flujo explícito y auditado.

---

# 42. RESERVAS Y PRÉSTAMOS DE PUBLICIDAD

Una reserva activa tiene prioridad sobre stock disponible.

Por lo tanto:

```text
Stock físico:
10

Reservado:
3

Disponible:
7
```

No deberían prestarse:

```text
8
```

unidades.

El sistema debe utilizar:

```text
AVAILABLE STOCK
```

como base para determinar disponibilidad.

---

# 43. RESERVAS Y TRANSFERENCIAS

El stock reservado no debe formar parte del stock libre para transferencia.

Ejemplo:

```text
Físico:
10

Reservado:
4

Disponible:
6
```

Máximo transferible por defecto:

```text
6
```

no:

```text
10
```

---

# 44. RECORDATORIOS

En producción puede existir:

```text
Reserva vence mañana
```

y:

```text
Reserva vencida
```

El sistema podría generar:

```text
Notificación
Telegram
WhatsApp
Email
```

según futuras integraciones.

Esto no es obligatorio para la demo inicial.

---

# 45. DASHBOARD DE RESERVAS

Debe mostrar:

```text
Reservas activas
Reservas que vencen hoy
Reservas que vencen mañana
Reservas vencidas
Señas recibidas
Señas pendientes de devolución
Reservas retiradas
Reservas canceladas
```

---

# 46. LISTADO

Columnas sugeridas:

```text
N°
Cliente
Sucursal
Fecha
Vencimiento
Productos
Total
Seña
Saldo
Estado
Responsable
```

---

# 47. FILTROS

Filtros mínimos:

```text
Estado
Sucursal
Fecha
Vencimiento
Cliente
Usuario
Método de pago
Con seña
Sin seña
```

---

# 48. DETALLE DE RESERVA

La pantalla de detalle debe mostrar:

```text
RES-000152

Cliente
Teléfono
Sucursal

Productos
Variantes
Cantidades

Total
Señas
Saldo

Fecha de reserva
Vencimiento

Estado

Historial
```

Y:

```text
Acciones disponibles
```

según estado y permisos.

---

# 49. ACCIONES

Para una reserva activa:

```text
Registrar seña
Extender vencimiento
Cancelar
Convertir en venta
Consultar
```

Para una reserva vencida:

```text
Registrar retiro
Reactivar
Consultar
```

La reactivación debe requerir reglas/permisos explícitos.

---

# 50. HISTORIAL

Debe existir una línea de tiempo:

```text
03/09 10:20
Reserva creada

03/09 10:25
Seña $50.000

04/09 15:30
Vencimiento extendido

05/09 18:20
Cliente retira

05/09 18:21
Venta creada

05/09 18:21
Saldo $150.000 cobrado

05/09 18:21
Reserva retirada
```

Esto facilita auditoría.

---

# 51. AUDITORÍA

Eventos mínimos:

```text
RESERVATION_CREATED
RESERVATION_UPDATED
DEPOSIT_CREATED
DEPOSIT_REFUNDED
RESERVATION_EXTENDED
RESERVATION_CANCELLED
RESERVATION_EXPIRED
RESERVATION_REACTIVATED
RESERVATION_COMPLETED
RESERVATION_CONVERTED_TO_SALE
```

Cada evento debe registrar:

```text
usuario
fecha
hora
acción
datos relevantes
motivo
```

---

# 52. PERMISOS

## VENDEDOR

Puede:

* crear reserva;
* consultar reservas;
* registrar datos del cliente;
* solicitar extensión según reglas.

No puede:

* devolver señas libremente;
* modificar movimientos financieros;
* alterar stock directamente.

---

## CAJERO

Puede:

* registrar señas;
* registrar pagos;
* procesar retiro;
* ejecutar acciones permitidas sobre caja.

---

## ADMINISTRADOR

Puede:

* cancelar;
* extender;
* autorizar devoluciones;
* revisar reservas de la sucursal.

---

## TESORERO

Puede:

* revisar movimientos financieros;
* gestionar devoluciones;
* conciliar señas.

---

## SUPER ADMIN

Acceso global y configuración de políticas.

---

# 53. INTEGRACIÓN CON CAJA

Si la seña se paga en efectivo:

```text
Deposit
   ↓
Payment
   ↓
CashMovement
   ↓
FinancialMovement
   ↓
Caja
```

El importe debe aparecer en el arqueo correspondiente.

---

# 54. INTEGRACIÓN CON TESORERÍA

Si la seña es por transferencia:

```text
Deposit
   ↓
Payment
   ↓
FinancialMovement
   ↓
Banco / Wallet
```

Tesorería debe poder localizar el movimiento.

---

# 55. INTEGRACIÓN CON VENTAS

```text
Reservation
     ↓
Sale
```

La venta conserva:

```text
reservationId
```

cuando corresponda.

---

# 56. INTEGRACIÓN CON STOCK

```text
Reservation
     ↓
RESERVATION
```

Al cancelar/vencer:

```text
Reservation
     ↓
RESERVATION_RELEASE
```

Al vender:

```text
Sale
     ↓
SALE
```

La salida física debe ocurrir una sola vez.

---

# 57. INTEGRACIÓN CON CAMBIOS Y DEVOLUCIONES

Si una reserva se convierte en venta y posteriormente existe una devolución:

```text
Reservation
   ↓
Sale
   ↓
Refund / Exchange
```

La devolución debe manejarse mediante:

```text
16_CAMBIOS_Y_DEVOLUCIONES.md
```

No crear un mecanismo paralelo dentro de Reservas.

---

# 58. INTEGRACIÓN CON FACTURACIÓN

La reserva por sí sola no requiere necesariamente factura.

Cuando se genera la venta:

```text
Reservation
   ↓
Sale
   ↓
Invoice
```

La facturación queda a cargo de:

```text
19_FACTURACION_ARCA.md
```

La seña debe considerarse correctamente en el flujo fiscal que finalmente se defina.

---

# 59. INTEGRIDAD FINANCIERA

No modificar:

```text
depositAmount
```

histórico directamente para realizar devoluciones.

Ejemplo incorrecto:

```text
Seña original:
$100.000

Editar:
$70.000
```

Correcto:

```text
Seña:
$100.000

Refund:
$30.000
```

El historial permanece intacto.

---

# 60. INTEGRIDAD DEL STOCK

No modificar manualmente:

```text
reservedQuantity
```

sin movimiento.

Correcto:

```text
RESERVATION
```

y:

```text
RESERVATION_RELEASE
```

El stock reservado debe ser consecuencia de movimientos trazables.

---

# 61. REGLAS DE NEGOCIO

### Regla 1

Una reserva no es una venta.

### Regla 2

Una seña no es automáticamente una venta.

### Regla 3

Toda reserva debe identificar sucursal.

### Regla 4

Toda reserva debe identificar variante y cantidad.

### Regla 5

El stock reservado reduce el stock disponible.

### Regla 6

No se puede reservar más stock disponible que el permitido.

### Regla 7

Una reserva vencida debe liberar el stock.

### Regla 8

Una cancelación debe liberar el stock.

### Regla 9

La política de devolución de seña debe ser configurable.

### Regla 10

Las devoluciones de señas generan movimientos financieros.

### Regla 11

Los movimientos históricos no se editan para ocultar cambios.

### Regla 12

Las extensiones deben quedar auditadas.

### Regla 13

La conversión a venta no debe duplicar la seña.

### Regla 14

La venta final debe generar el movimiento de stock correspondiente.

### Regla 15

Una unidad reservada no está disponible para operaciones incompatibles.

### Regla 16

Las operaciones concurrentes deben protegerse.

### Regla 17

Todas las acciones críticas deben ser auditables.

---

# 62. DEMO — RESERVA SIN SEÑA

```text
Cliente:
María López

Producto:
Campera Roma
Negro / M

Precio:
$120.000

Reserva:
2 días

Seña:
$0
```

Resultado:

```text
Stock físico:
10

Reservado:
1

Disponible:
9
```

---

# 63. DEMO — RESERVA CON SEÑA

```text
Producto:
Vestido Luna

Precio:
$180.000

Seña:
$50.000

Saldo:
$130.000
```

Movimiento:

```text
Mercado Pago
+$50.000
```

Estado:

```text
RESERVADA
```

---

# 64. DEMO — RETIRO

```text
Precio:
$180.000

Seña:
$50.000

Saldo:
$130.000
```

Cliente paga:

```text
$130.000
```

Resultado:

```text
Venta:
$180.000

Pagado:
$180.000

Reserva:
RETIRADA
```

---

# 65. DEMO — CANCELACIÓN

```text
Reserva:
$200.000

Seña:
$50.000
```

Cliente cancela.

Resultado:

```text
Reserva:
CANCELADA

Stock:
LIBERADO
```

Si corresponde devolución:

```text
Reembolso:
$50.000
```

---

# 66. DEMO — VENCIMIENTO

```text
Reserva:
03/09

Vencimiento:
05/09
```

No se retira.

Resultado:

```text
Reserva:
VENCIDA

Stock:
LIBERADO
```

---

# 67. DEMO — RESERVA MULTIUNIDAD

```text
Remera Blanca / M:
2

Remera Negra / M:
1
```

Reserva:

```text
3 unidades
```

Cada variante afecta su propio stock.

---

# 68. CRITERIOS DE ACEPTACIÓN

El módulo será considerado funcional cuando:

* [ ] Se pueda crear una reserva.
* [ ] Se pueda asociar cliente.
* [ ] Se pueda seleccionar sucursal.
* [ ] Se puedan seleccionar variantes.
* [ ] Se puedan reservar cantidades.
* [ ] Se controle stock disponible.
* [ ] Se genere movimiento de reserva.
* [ ] Se pueda registrar una seña.
* [ ] Se puedan utilizar diferentes métodos de pago.
* [ ] Se pueda asociar la seña a una cuenta financiera.
* [ ] Se pueda registrar más de una seña si está habilitado.
* [ ] Se calcule correctamente el saldo.
* [ ] Se pueda extender el vencimiento.
* [ ] Se pueda cancelar.
* [ ] Se pueda vencer.
* [ ] Se libere correctamente el stock.
* [ ] Se pueda convertir en venta.
* [ ] La seña no se duplique al convertir.
* [ ] Se pueda devolver la seña según política.
* [ ] Las devoluciones generen movimientos financieros.
* [ ] Exista auditoría.
* [ ] Existan permisos.
* [ ] Exista historial.
* [ ] Se puedan consultar reservas activas.
* [ ] Se puedan consultar vencidas.
* [ ] Existan reportes básicos.

---

# 69. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
localStorage
mock financial movements
mock stock movements
datos simulados
```

Debe mostrar:

```text
MODO DEMO
SEÑAS SIMULADAS
MOVIMIENTOS SIMULADOS
```

---

## PRODUCCIÓN

Debe utilizar:

```text
PostgreSQL
Prisma
Transactions
Decimal
StockMovement
Payment
FinancialMovement
AuditLog
RBAC
Idempotency
Concurrency Control
Scheduler
```

---

# 70. MODELO CONCEPTUAL

```text
CUSTOMER
   │
   ▼
RESERVATION
   │
   ├───────────────┐
   ▼               ▼
RESERVATION ITEM  DEPOSIT
   │               │
   ▼               ▼
PRODUCT VARIANT   PAYMENT
   │               │
   ▼               ▼
STOCK           FINANCIAL MOVEMENT
                   │
                   ▼
             FINANCIAL ACCOUNT
```

---

# 71. CICLO COMPLETO

```text
                 CREAR RESERVA
                       │
                       ▼
               RESERVAR STOCK
                       │
                       ▼
                 REGISTRAR SEÑA
                       │
                       ▼
                     ESPERA
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
        RETIRO      CANCELACIÓN   VENCIMIENTO
          │            │            │
          ▼            ▼            ▼
        VENTA       POLÍTICA      LIBERAR
          │         DE SEÑA       STOCK
          ▼            │
      COBRAR SALDO     ▼
          │         REEMBOLSO
          ▼
      COMPLETAR
          │
          ▼
     RESERVA RETIRADA
```

---

# 72. PRINCIPIO FINAL

El sistema debe poder responder en cualquier momento:

> **¿Qué producto está reservado?**

> **¿Para quién?**

> **¿En qué sucursal?**

> **¿Desde cuándo?**

> **¿Hasta cuándo?**

> **¿Cuánto dejó de seña?**

> **¿Cómo pagó?**

> **¿Dónde está ese dinero?**

> **¿Cuánto falta pagar?**

> **¿Qué stock quedó comprometido?**

> **¿Qué ocurrió finalmente con la reserva?**

La arquitectura debe mantener separadas las tres dimensiones:

```text
RESERVA
   ↓
COMPROMISO SOBRE STOCK

SEÑA
   ↓
COMPROMISO / ANTICIPO MONETARIO

VENTA
   ↓
OPERACIÓN COMERCIAL FINAL
```

Y sus efectos:

```text
RESERVA
→ StockMovement RESERVATION

SEÑA
→ Payment
→ FinancialMovement

VENTA
→ Sale
→ StockMovement SALE
→ Payment
→ FinancialMovement
→ Invoice cuando corresponda
```

Esta separación evita duplicaciones y permite mantener una trazabilidad completa de **producto + dinero + cliente + operación**.
