# SISTEMA DE GESTIÓN MULTISUCURSAL

## 05 — INVENTARIO Y STOCK

**Documento:** `05_INVENTARIO_Y_STOCK.md`
**Versión:** 1.0
**Estado:** Draft
**Depende de:**

* `00_MASTER_SPEC.md`
* `01_VISION_Y_ALCANCE.md`
* `02_ROLES_Y_PERMISOS.md`
* `03_SUCURSALES_Y_POS.md`
* `04_PRODUCTOS_Y_VARIANTES.md`

---

# 1. PROPÓSITO

Este documento define las reglas para controlar el inventario de mercadería de la empresa.

El sistema debe permitir conocer en todo momento:

* Cuántas unidades existen.
* De qué variante son.
* Dónde están.
* Cuántas están disponibles.
* Cuántas están reservadas.
* Cuántas están en tránsito.
* Cuántas están comprometidas por otras operaciones.
* De dónde ingresaron.
* Hacia dónde fueron.
* Quién realizó cada movimiento.
* Cuándo ocurrió.
* Qué operación originó el movimiento.

El inventario debe ser completamente trazable.

---

# 2. PRINCIPIO FUNDAMENTAL

El sistema no debe permitir modificar arbitrariamente:

```text
stock = 25
```

sin registrar por qué cambió.

La regla será:

```text
OPERACIÓN
↓
MOVIMIENTO DE STOCK
↓
ACTUALIZACIÓN DEL INVENTARIO
↓
AUDITORÍA
```

Ejemplo:

```text
Venta #1050
↓
Salida de 1 unidad
↓
Stock actualizado
↓
Movimiento registrado
```

---

# 3. UNIDAD DE INVENTARIO

La unidad básica de inventario será:

```text
VARIANTE + UBICACIÓN
```

Ejemplo:

```text
REM-BAS-NEG-M
+
Sucursal Centro
```

Esto representa el stock de una variante concreta en una ubicación concreta.

---

# 4. UBICACIONES

El sistema debe soportar como mínimo:

```text
WAREHOUSE
BRANCH
```

Ejemplo:

```text
Depósito Central

Sucursal Centro
Sucursal Norte
Sucursal Sur
Sucursal Este
Sucursal Oeste
```

Cada ubicación debe tener un identificador único.

---

# 5. INVENTARIO POR UBICACIÓN

Conceptualmente:

```text
Inventory
```

debe representar:

```text
variantId
locationId
physicalQuantity
reservedQuantity
```

y los estados derivados necesarios.

---

# 6. STOCK FÍSICO

El stock físico representa las unidades que el sistema considera físicamente presentes en una ubicación.

Ejemplo:

```text
Stock físico: 20
```

No significa necesariamente que las 20 unidades estén disponibles para vender.

---

# 7. STOCK RESERVADO

Representa unidades comprometidas mediante reservas activas.

Ejemplo:

```text
Físico:     20
Reservado:   4
```

Entonces:

```text
Disponible: 16
```

---

# 8. STOCK DISPONIBLE

Regla base:

```text
Disponible =
Físico - Reservado
```

La disponibilidad puede incorporar posteriormente otros compromisos según las necesidades del negocio.

La implementación definitiva debe mantener claramente separados los conceptos.

---

# 9. STOCK EN TRÁNSITO

Una unidad enviada desde una ubicación hacia otra no debe considerarse disponible en destino hasta que la recepción haya sido confirmada.

Ejemplo:

```text
Depósito
Stock: 20

Transferencia:
5 unidades

Despachado
↓
EN_TRÁNSITO

Destino:
Todavía no disponibles
```

Cuando la sucursal confirma:

```text
RECIBIDA
↓
Stock destino +5
```

---

# 10. TRANSFERENCIA Y STOCK

Una transferencia debe utilizar movimientos de stock.

Ejemplo:

```text
Sucursal A
Stock: 20

Transferencia de 5

↓
Sucursal A:
15 disponibles físicamente

↓
En tránsito:
5

↓
Sucursal B confirma recepción

↓
Sucursal B:
+5
```

La transferencia completa se especificará en:

`08_TRANSFERENCIAS_Y_REMITOS.md`.

---

# 11. NO DUPLICAR STOCK

No debe existir una segunda fuente independiente que diga:

```text
Producto.stock
```

mientras otra tabla mantiene:

```text
Inventory.quantity
```

y ambas puedan divergir.

Debe existir una única fuente de verdad para el inventario.

La arquitectura definitiva se definirá en:

`24_MODELO_DE_DATOS.md`.

---

# 12. MOVIMIENTO DE STOCK

Entidad conceptual:

```text
StockMovement
```

Representa un cambio de inventario.

Cada movimiento debe registrar como mínimo:

```text
id
variantId
locationId
quantity
movementType
referenceType
referenceId
createdBy
createdAt
notes
```

Puede incorporar:

```text
sourceLocationId
destinationLocationId
unitCost
batchId
```

cuando corresponda.

---

# 13. TIPOS DE MOVIMIENTO

El sistema debe soportar como mínimo:

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
ADJUSTMENT_IN
ADJUSTMENT_OUT
EXCHANGE_OUT
EXCHANGE_IN
```

La lista definitiva puede ampliarse.

---

# 14. MOVIMIENTOS DE ENTRADA

Ejemplos:

```text
PURCHASE_RECEIPT
TRANSFER_IN
SALE_RETURN
EXCHANGE_IN
ADJUSTMENT_IN
MARKETING_RETURN
```

Cada uno debe tener una razón y referencia.

---

# 15. MOVIMIENTOS DE SALIDA

Ejemplos:

```text
SALE
TRANSFER_OUT
MARKETING_LOAN
EXCHANGE_OUT
ADJUSTMENT_OUT
MARKETING_DAMAGE
```

---

# 16. MOVIMIENTOS INMUTABLES

Una vez registrado un movimiento de stock, no debe editarse directamente.

Incorrecto:

```text
Movimiento #500
Cantidad: 5

Editar:
Cantidad: 3
```

Correcto:

```text
Movimiento original: 5

Corrección:
-2

Nuevo movimiento:
ADJUSTMENT_OUT
```

De esta manera se conserva el historial.

---

# 17. AJUSTES DE INVENTARIO

Los ajustes existen para corregir diferencias reales.

Ejemplo:

```text
Sistema:
10 unidades

Conteo físico:
9 unidades
```

Se registra:

```text
ADJUSTMENT_OUT
Cantidad: 1
Motivo:
Diferencia de inventario
```

---

# 18. MOTIVO OBLIGATORIO DE AJUSTE

Todo ajuste debe requerir un motivo.

Ejemplos:

```text
ROTURA
PÉRDIDA
ERROR DE CONTEO
ERROR DE CARGA
DIFERENCIA FÍSICA
MERCADERÍA DAÑADA
OTRO
```

Si se utiliza `OTRO`, debe requerirse una descripción.

---

# 19. AUTORIZACIÓN DE AJUSTES

Los ajustes pueden requerir autorización dependiendo del rol y configuración.

Ejemplo:

```text
Vendedor
→ No puede ajustar

Cajero
→ No puede ajustar

Encargado
→ Puede solicitar

Administrador
→ Puede autorizar

Super Admin
→ Puede autorizar
```

Las reglas definitivas dependen de `02_ROLES_Y_PERMISOS.md`.

---

# 20. RECEPCIÓN DE COMPRA

Cuando se recibe mercadería:

```text
Proveedor
↓
Orden de compra
↓
Recepción
↓
Cantidad recibida
↓
Stock depósito
```

Debe generarse:

```text
PURCHASE_RECEIPT
```

---

# 21. RECEPCIÓN PARCIAL

El sistema debe soportar recepción parcial.

Ejemplo:

```text
Compra:
100 unidades

Recepción 1:
60 unidades

Pendiente:
40 unidades
```

No se deben ingresar automáticamente las 100 unidades.

El stock aumenta únicamente por las cantidades realmente recibidas y confirmadas.

---

# 22. DEVOLUCIÓN A PROVEEDOR

Si posteriormente se implementa devolución a proveedor:

```text
Stock depósito
↓
Devolución proveedor
↓
TRANSFER / RETURN
↓
Stock disminuye
```

Debe existir un movimiento específico y una referencia a la operación correspondiente.

---

# 23. VENTA

Cuando una venta se finaliza correctamente:

```text
Venta
↓
Confirmación
↓
Salida de inventario
```

Se genera:

```text
SALE
```

La cantidad debe corresponder exactamente a los productos vendidos.

---

# 24. VENTA PENDIENTE NO DEBE DESCONTAR STOCK DISPONIBLE COMO VENTA FINAL

Una venta:

```text
PENDING_PAYMENT
```

no debe tratarse automáticamente como una venta finalizada.

La regla exacta de reserva de stock para ventas pendientes debe definirse antes de producción.

Para la DEMO:

```text
PENDING_PAYMENT
→ no genera salida definitiva

FINALIZED
→ genera salida definitiva
```

---

# 25. VENTA CANCELADA

Si una venta se cancela antes de finalizar:

```text
PENDING_PAYMENT
↓
CANCELLED
```

No debe generar una salida definitiva de stock.

---

# 26. DEVOLUCIÓN DE UNA VENTA

Cuando un cliente devuelve una prenda:

```text
Venta original
↓
Devolución
↓
Ingreso de stock
```

Debe generarse:

```text
SALE_RETURN
```

si la prenda vuelve a estar disponible.

Si la prenda está dañada:

```text
SALE_RETURN
↓
INSPECCIÓN
↓
DAÑADA
```

y deberá utilizarse el flujo de ajuste/estado correspondiente.

---

# 27. CAMBIOS

Un cambio de prenda puede generar simultáneamente:

```text
EXCHANGE_OUT
+
EXCHANGE_IN
```

Ejemplo:

```text
Devuelve:
Remera Negro / M

Recibe:
Remera Negro / L
```

Movimientos:

```text
Negro / M
-1

Negro / L
+1
```

La operación debe quedar vinculada a la venta original.

---

# 28. RESERVAS

Una reserva debe afectar la disponibilidad, no necesariamente el stock físico.

Ejemplo:

```text
Físico: 10
Reservado: 2
Disponible: 8
```

La creación de una reserva genera conceptualmente:

```text
RESERVATION
```

La liberación:

```text
RESERVATION_RELEASE
```

---

# 29. VENCIMIENTO DE RESERVA

Si una reserva vence:

```text
Reserva
↓
VENCIDA
↓
Liberación de reserva
↓
Disponible +1
```

No debe crearse una salida física de stock.

---

# 30. PRÉSTAMO PARA PUBLICIDAD

Cuando una prenda sale para publicidad:

```text
Sucursal / Depósito
↓
Préstamo publicidad
```

Se registra:

```text
MARKETING_LOAN
```

El sistema debe mantener trazabilidad sobre:

* Producto.
* Variante.
* Cantidad.
* Usuario.
* Destino.
* Motivo.
* Fecha de salida.
* Fecha prevista de devolución.

El flujo completo estará en:

`15_PRESTAMOS_PUBLICIDAD.md`.

---

# 31. DEVOLUCIÓN DE PUBLICIDAD

Si vuelve correctamente:

```text
MARKETING_LOAN
↓
MARKETING_RETURN
```

La unidad vuelve a estar disponible según su ubicación y estado físico.

---

# 32. PRODUCTO DAÑADO

Si una prenda vuelve dañada:

```text
MARKETING_RETURN
↓
INSPECCIÓN
↓
DAÑADA
```

No debe incorporarse automáticamente al stock vendible.

Debe quedar separada o marcada según el modelo de inventario definitivo.

---

# 33. PRODUCTO NO DEVUELTO

Si el producto prestado no regresa:

```text
MARKETING_LOAN
↓
NO_DEVUELTA
```

Debe existir un movimiento de ajuste correspondiente cuando la empresa determine que debe darse de baja del stock físico.

---

# 34. INVENTARIO Y ESTADOS FÍSICOS

El sistema debe poder diferenciar, como mínimo:

```text
DISPONIBLE
RESERVADO
EN_TRANSITO
DAÑADO
NO_DISPONIBLE
```

No todas estas condiciones necesariamente representan una cantidad separada.

La implementación definitiva debe evitar duplicar cantidades.

---

# 35. STOCK POR SUCURSAL

Ejemplo:

```text
Producto:
Jean Slim

Variante:
Azul / 42
```

Inventario:

```text
Depósito:
12

Centro:
4

Norte:
7

Sur:
2

Este:
0

Oeste:
3
```

---

# 36. VISIÓN GLOBAL

El sistema debe permitir visualizar:

```text
Jean Slim / Azul / 42

Total físico:
28

Reservado:
3

En tránsito:
5

Disponible:
20
```

La pantalla debe poder desglosar:

```text
Depósito
Sucursal Centro
Sucursal Norte
Sucursal Sur
Sucursal Este
Sucursal Oeste
```

---

# 37. DISPONIBILIDAD GLOBAL

Debe distinguirse:

```text
STOCK FÍSICO GLOBAL
```

de:

```text
STOCK DISPONIBLE GLOBAL
```

y:

```text
STOCK EN TRÁNSITO GLOBAL
```

No debe sumarse indiscriminadamente todo como si estuviera disponible para venta inmediata.

---

# 38. INVENTARIO POR VARIANTE

Ejemplo:

```text
Remera Básica
```

Debe poder visualizar:

```text
NEGRO
S → 5
M → 8
L → 3
XL → 1

BLANCO
S → 2
M → 6
L → 4
XL → 0
```

Esto debe ser especialmente útil en el módulo de inventario y POS.

---

# 39. CONTEO DE INVENTARIO

El sistema debería soportar posteriormente inventarios físicos.

Flujo:

```text
Crear conteo
↓
Seleccionar ubicación
↓
Contar productos
↓
Ingresar cantidades
↓
Comparar sistema vs físico
↓
Detectar diferencias
↓
Solicitar aprobación
↓
Generar ajustes
```

No es necesario implementar un módulo avanzado de inventario físico en la primera DEMO, pero la arquitectura debe permitirlo.

---

# 40. HISTORIAL DE STOCK

Al seleccionar una variante debe poder consultarse:

```text
Fecha
Movimiento
Cantidad
Origen
Destino
Usuario
Referencia
Stock resultante
```

Ejemplo:

```text
02/09
Compra
+20
Depósito
OC-105
Stock: 20

03/09
Transferencia
-5
Depósito → Centro
TR-022
Stock: 15

04/09
Venta
-1
Centro
VENTA-1001
Stock: 4
```

---

# 41. REFERENCIA OBLIGATORIA

Siempre que sea posible, un movimiento debe indicar qué operación lo originó.

Ejemplos:

```text
SALE → Venta #1001
PURCHASE_RECEIPT → Recepción #500
TRANSFER_OUT → Transferencia #200
SALE_RETURN → Devolución #300
MARKETING_LOAN → Préstamo #50
ADJUSTMENT_OUT → Ajuste #10
```

Esto evita movimientos huérfanos.

---

# 42. MOVIMIENTO MANUAL

Los movimientos manuales deben ser excepcionales.

No se debe ofrecer una función genérica:

```text
"Modificar stock"
```

sin contexto.

Debe existir una operación explícita:

```text
Ajuste de inventario
```

con:

* Motivo.
* Usuario.
* Fecha.
* Ubicación.
* Variante.
* Cantidad.
* Tipo.
* Autorización si corresponde.

---

# 43. STOCK NEGATIVO

Por defecto:

```text
STOCK NEGATIVO = NO PERMITIDO
```

Si una operación intenta vender:

```text
Disponible: 0
Cantidad solicitada: 1
```

el sistema debe impedir la operación.

La habilitación de stock negativo, si alguna vez fuera necesaria, debe ser una configuración explícita y auditada.

---

# 44. CONCURRENCIA

En producción, dos operaciones pueden intentar modificar el mismo stock simultáneamente.

Ejemplo:

```text
POS-01
vende última unidad

POS-02
vende última unidad
```

El sistema debe impedir que ambas operaciones consuman la misma unidad.

Esto requiere transacciones y control de concurrencia en backend.

La DEMO puede simular el comportamiento, pero la arquitectura de producción debe contemplarlo.

---

# 45. REGLA DE ATOMICIDAD

Una operación que modifica stock debe ejecutarse de forma atómica.

Ejemplo:

```text
Finalizar venta
↓
Registrar venta
↓
Registrar movimiento
↓
Actualizar inventario
```

No debe quedar:

```text
Venta registrada
pero
stock sin actualizar
```

ni:

```text
Stock actualizado
pero
venta inexistente
```

En producción estas operaciones deberán formar parte de una transacción de base de datos.

---

# 46. AUDITORÍA

Todo movimiento debe registrar:

```text
Usuario
Fecha
Hora
Ubicación
Variante
Cantidad
Tipo
Referencia
Motivo
```

Los ajustes deben tener información adicional:

```text
Aprobador
Motivo
Observación
```

---

# 47. TRAZABILIDAD COMPLETA

El sistema debe poder responder:

> ¿De dónde salió esta unidad?

> ¿Cuándo ingresó?

> ¿Quién la recibió?

> ¿A qué sucursal fue enviada?

> ¿Cuándo fue recibida?

> ¿Fue reservada?

> ¿Fue vendida?

> ¿Fue devuelta?

> ¿Fue prestada para publicidad?

> ¿Se dañó?

Toda esta trazabilidad debe derivarse de las operaciones y movimientos registrados.

---

# 48. INVENTARIO Y REPORTES

El inventario deberá alimentar:

* Stock actual.
* Stock disponible.
* Stock reservado.
* Stock en tránsito.
* Productos sin stock.
* Productos con stock bajo.
* Productos de alta rotación.
* Productos de baja rotación.
* Productos inmovilizados.
* Necesidades de reposición.

Los reportes completos estarán definidos en:

`20_REPORTES_Y_EXPORTACIONES.md`.

---

# 49. REPOSICIÓN

El sistema debe permitir identificar variantes cuyo stock esté por debajo del mínimo.

Ejemplo:

```text
SKU:
REM-BAS-NEG-M

Sucursal Centro

Stock:
2

Mínimo:
5

Estado:
REPOSICIÓN NECESARIA
```

Esto podrá utilizarse posteriormente para generar:

* Solicitudes de reposición.
* Transferencias.
* Sugerencias de compra.

---

# 50. STOCK RESERVADO VS STOCK FÍSICO

Regla crítica:

Una reserva no debe reducir físicamente el stock.

Ejemplo:

```text
Antes:
Físico 10
Reservado 0
Disponible 10

Reserva de 2:

Físico 10
Reservado 2
Disponible 8
```

No:

```text
Físico 8
Reservado 2
```

porque eso provocaría pérdida de trazabilidad.

---

# 51. STOCK EN TRÁNSITO VS STOCK DESTINO

Regla crítica:

Una transferencia despachada no debe aumentar inmediatamente el stock disponible de destino.

Ejemplo:

```text
Origen:
-5

En tránsito:
+5

Destino:
0
```

Cuando se confirma:

```text
En tránsito:
-5

Destino:
+5
```

---

# 52. STOCK DE PRODUCTO DAÑADO

El producto dañado no debe aparecer como disponible para venta.

Ejemplo:

```text
Físico:
10

Dañado:
1

Vendible:
9
```

La implementación definitiva deberá decidir si el estado `DAÑADO` se representa:

* Como ubicación separada.
* Como estado de inventario.
* Como inventario no disponible.

No duplicar cantidades.

---

# 53. ELIMINACIÓN DE MOVIMIENTOS

Nunca eliminar físicamente movimientos históricos de stock.

Incorrecto:

```text
DELETE StockMovement
```

Correcto:

```text
Movimiento original
↓
Movimiento compensatorio/correctivo
```

---

# 54. DEMO

La DEMO debe incluir:

### Ubicaciones

```text
Depósito Central
Sucursal Centro
Sucursal Norte
Sucursal Sur
Sucursal Este
Sucursal Oeste
```

### Productos

Múltiples variantes de ropa.

### Estados

Debe demostrarse:

```text
Stock disponible
Stock reservado
Stock bajo
Stock en tránsito
```

---

# 55. ESCENARIO DEMO 1 — COMPRA

```text
Proveedor
↓
Recepción
↓
10 Remeras Negro/M
↓
Depósito
```

Resultado:

```text
Depósito:
+10
```

Movimiento:

```text
PURCHASE_RECEIPT
+10
```

---

# 56. ESCENARIO DEMO 2 — TRANSFERENCIA

```text
Depósito
↓
Transferencia
↓
5 unidades
↓
Sucursal Centro
```

Estados:

```text
Despachado
↓
En tránsito
↓
Recibido
```

Resultado final:

```text
Depósito -5
Sucursal Centro +5
```

---

# 57. ESCENARIO DEMO 3 — RESERVA

Stock inicial:

```text
10
```

Reserva:

```text
2
```

Resultado:

```text
Físico: 10
Reservado: 2
Disponible: 8
```

---

# 58. ESCENARIO DEMO 4 — VENTA

Stock:

```text
10
```

Venta finalizada:

```text
1 unidad
```

Resultado:

```text
Stock físico:
9
```

Movimiento:

```text
SALE
-1
```

---

# 59. ESCENARIO DEMO 5 — CAMBIO

Original:

```text
Negro / M
```

Cambio:

```text
Negro / L
```

Movimientos:

```text
Negro / M
+1

Negro / L
-1
```

La operación queda vinculada a la venta original.

---

# 60. ESCENARIO DEMO 6 — PUBLICIDAD

```text
Sucursal
↓
Préstamo publicidad
↓
1 unidad
```

La unidad deja de estar disponible para venta según las reglas del estado/ubicación.

Luego:

```text
Publicidad
↓
Devolución
↓
Disponible
```

o:

```text
Publicidad
↓
Daño
↓
No disponible
```

---

# 61. MODELO CONCEPTUAL

```text
Product
   │
   └── ProductVariant
           │
           └── Inventory
                  │
                  ├── Location
                  │
                  └── StockMovement
                         │
                         ├── Purchase
                         ├── Sale
                         ├── Transfer
                         ├── Reservation
                         ├── Exchange
                         ├── MarketingLoan
                         └── Adjustment
```

---

# 62. FUENTE DE VERDAD

La fuente de verdad operativa será:

```text
INVENTORY
+
STOCK MOVEMENTS
```

Las pantallas, dashboards y reportes deben consultar esta información.

No deben mantener cantidades paralelas independientes.

---

# 63. REGLAS DE NEGOCIO

### Regla 1

El stock pertenece a una variante y ubicación.

### Regla 2

Toda modificación de stock debe tener una causa.

### Regla 3

Toda causa debe generar un movimiento trazable.

### Regla 4

Los movimientos históricos son inmutables.

### Regla 5

No se permiten movimientos sin usuario.

### Regla 6

No se permiten movimientos sin ubicación.

### Regla 7

Los ajustes requieren motivo.

### Regla 8

Las reservas afectan disponibilidad, no stock físico.

### Regla 9

Las transferencias utilizan estado `EN_TRÁNSITO`.

### Regla 10

Una transferencia no aumenta stock destino hasta su recepción.

### Regla 11

Una venta pendiente no genera una salida definitiva.

### Regla 12

Una venta finalizada genera salida de inventario.

### Regla 13

Un cambio genera movimientos vinculados.

### Regla 14

Un préstamo publicitario genera trazabilidad.

### Regla 15

El stock negativo está prohibido por defecto.

### Regla 16

Los productos históricos no se eliminan.

### Regla 17

No debe existir más de una fuente de verdad para cantidades de stock.

---

# 64. PREPARACIÓN PARA PRODUCCIÓN

El sistema productivo deberá utilizar:

```text
PostgreSQL
+
Transacciones
+
Control de concurrencia
+
StockMovement
+
Inventory
+
AuditLog
```

Las operaciones críticas deben ejecutarse dentro de transacciones.

Ejemplo:

```text
BEGIN

Validar stock
↓
Crear operación
↓
Crear movimiento
↓
Actualizar inventario
↓
Registrar auditoría

COMMIT
```

Si algo falla:

```text
ROLLBACK
```

---

# 65. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
localStorage
mock data
servicios simulados
```

Pero debe mantener los mismos conceptos:

```text
Inventory
StockMovement
Location
Variant
Reference
```

## PRODUCCIÓN

Se reemplazará la persistencia por:

```text
React
↓
API
↓
Express
↓
Prisma
↓
PostgreSQL
```

sin modificar las reglas fundamentales del dominio.

---

# 66. CRITERIOS DE ACEPTACIÓN

El módulo se considera correcto cuando puede demostrar:

### Stock

Visualizar stock por variante y ubicación.

### Disponible

Separar físico, reservado y disponible.

### Movimientos

Visualizar historial completo.

### Compras

Una recepción aumenta stock.

### Transferencias

Una transferencia genera tránsito y posteriormente recepción.

### Ventas

Una venta finalizada descuenta stock.

### Reservas

Una reserva reduce disponibilidad sin reducir stock físico.

### Cambios

Un cambio genera entrada/salida vinculadas.

### Publicidad

Un préstamo puede salir y regresar con estado.

### Ajustes

Un ajuste requiere motivo y queda auditado.

### Seguridad

Un usuario sin permiso no puede modificar inventario.

### Consistencia

No existen cantidades duplicadas en diferentes fuentes de verdad.

---

# 67. PRINCIPIO FINAL

El inventario debe funcionar como un libro mayor de mercadería:

```text
ENTRADAS
   +
SALIDAS
   +
TRANSFERENCIAS
   +
RESERVAS
   +
DEVOLUCIONES
   +
CAMBIOS
   +
PRÉSTAMOS
   +
AJUSTES
   ↓
ESTADO ACTUAL DEL STOCK
```

Nunca se debe pensar:

> "Cambiar el número de stock."

Debe pensarse:

> **"Registrar la operación que provocó el cambio de stock."**

Esa decisión será fundamental para que el sistema pueda responder posteriormente:

**qué pasó, cuándo pasó, quién lo hizo, dónde ocurrió y por qué cambió el inventario.**

---

**Estado:** DRAFT
**Versión:** 1.0
**Última actualización:** 2026-09-02
