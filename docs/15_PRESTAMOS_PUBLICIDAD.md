# 15 — PRÉSTAMOS PARA PUBLICIDAD Y CONTENIDO

**Archivo:** `15_PRESTAMOS_PUBLICIDAD.md`
**Sistema:** Sistema de Gestión Multisucursal
**Módulo:** Préstamos para Publicidad y Contenido
**Estado:** Especificación funcional
**Versión:** 1.0

---

# 1. PROPÓSITO

El módulo administra productos que salen temporalmente de una sucursal o depósito para:

* sesiones fotográficas;
* producción de contenido;
* publicidad;
* campañas;
* influencers;
* modelos;
* producciones audiovisuales;
* eventos;
* muestras;
* colaboraciones;
* marketing.

El objetivo principal es mantener control sobre:

```text
PRODUCTO
UBICACIÓN
RESPONSABLE
MOTIVO
FECHA DE SALIDA
FECHA PREVISTA DE DEVOLUCIÓN
ESTADO
CONDICIÓN
FECHA DE DEVOLUCIÓN
DESTINO FINAL
```

---

# 2. PRINCIPIO FUNDAMENTAL

Un producto prestado:

```text
NO ESTÁ VENDIDO
NO DEJA DE SER PROPIEDAD DE LA EMPRESA
NO DEBE CONTARSE COMO STOCK DISPONIBLE PARA VENTA
```

Por lo tanto:

```text
STOCK FÍSICO
    ↓
PRÉSTAMO
    ↓
STOCK COMPROMETIDO / FUERA DE UBICACIÓN
```

El sistema debe mantener trazabilidad de dónde está el producto.

---

# 3. PROBLEMA QUE RESUELVE

Sin este módulo puede ocurrir:

```text
Sistema:
5 unidades disponibles

Realidad:
2 unidades están con una influencer
1 unidad está en una producción
```

El sistema podría permitir vender:

```text
5 unidades
```

cuando realmente solo existen:

```text
2 unidades disponibles
```

El módulo evita esta inconsistencia.

---

# 4. FLUJO GENERAL

```text
SOLICITUD
   ↓
APROBACIÓN
   ↓
PREPARACIÓN
   ↓
SALIDA
   ↓
PRESTADO
   ↓
PRODUCCIÓN
   ↓
┌──────────────┬──────────────┬──────────────┬─────────────┐
│              │              │              │
DEVUELTO     DAÑADO       NO DEVUELTO      VENDIDO
│              │              │              │
▼              ▼              ▼              ▼
STOCK       INCIDENTE      RECLAMO       VENTA
```

---

# 5. ENTIDAD PRINCIPAL

Entidad conceptual:

```text
MarketingLoan
```

Campos mínimos:

```text
id
loanNumber

status

originLocationId
destinationLocationId

responsiblePersonId
requestedBy
approvedBy

reason
campaign
description

loanDate
expectedReturnDate
actualReturnDate

createdAt
updatedAt

notes
```

---

# 6. PRESTAMO ITEM

Cada préstamo puede contener múltiples productos.

Entidad:

```text
MarketingLoanItem
```

Campos:

```text
id
loanId

productVariantId
quantity

unitCost
referenceValue

conditionOut
conditionIn

returnedQuantity
damagedQuantity
missingQuantity
soldQuantity

notes
```

---

# 7. IDENTIFICACIÓN DEL PRODUCTO

Siempre debe utilizarse:

```text
ProductVariant
```

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

Código:
779XXXXXXX
```

No debe prestarse solamente:

```text
Producto:
Campera Roma
```

sin identificar variante.

---

# 8. RESPONSABLE DEL PRÉSTAMO

Todo préstamo debe tener una persona responsable.

Puede ser:

```text
Empleado
Influencer
Modelo
Fotógrafo
Agencia
Productora
Proveedor
Cliente
Otro tercero
```

Datos mínimos:

```text
nombre
teléfono
email
identificación interna
```

Cuando se trate de un tercero, se recomienda mantener una entidad de contacto reutilizable.

---

# 9. MOTIVO

El préstamo debe indicar por qué sale el producto.

Ejemplos:

```text
SESION_FOTOS
PUBLICIDAD
REDES_SOCIALES
INFLUENCER
VIDEO
EVENTO
CAMPAÑA
CATALOGO
PRODUCCION
OTRO
```

Debe existir una descripción libre adicional.

---

# 10. CAMPAÑA

Puede asociarse a una campaña.

Ejemplo:

```text
Campaña:
Primavera 2026

Préstamo:
ML-000034
```

Esto permite posteriormente conocer:

```text
productos utilizados
costos
daños
devoluciones
campañas
```

---

# 11. UBICACIÓN DE ORIGEN

Debe registrarse desde dónde sale el producto.

Ejemplo:

```text
Depósito Central
```

o:

```text
Sucursal Centro
```

La ubicación debe ser una entidad válida de inventario.

---

# 12. DESTINO

Debe registrarse el destino.

Puede ser:

```text
TERCERO
PRODUCCIÓN
EVENTO
AGENCIA
MODELO
FOTÓGRAFO
OTRO
```

Si el producto se mueve entre ubicaciones internas, debe utilizarse el flujo de transferencia correspondiente.

---

# 13. ESTADOS

Estados mínimos:

```text
DRAFT
PENDING_APPROVAL
APPROVED
PREPARING
DELIVERED
RETURN_PENDING
PARTIALLY_RETURNED
RETURNED
DAMAGED
MISSING
SOLD
CANCELLED
```

Los estados definitivos deben centralizarse también en:

```text
23_ESTADOS_Y_TRANSICIONES.md
```

---

# 14. TRANSICIÓN NORMAL

```text
DRAFT
 ↓
PENDING_APPROVAL
 ↓
APPROVED
 ↓
PREPARING
 ↓
DELIVERED
 ↓
RETURN_PENDING
 ↓
RETURNED
```

---

# 15. PRÉSTAMO CANCELADO

Antes de la salida:

```text
DRAFT
→ CANCELLED
```

o:

```text
APPROVED
→ CANCELLED
```

según permisos.

Si el producto ya salió:

```text
DELIVERED
```

no debe simplemente cancelarse.

Debe realizarse la devolución o cierre correspondiente.

---

# 16. SALIDA DEL PRODUCTO

Al entregar el producto:

```text
MarketingLoan
→ DELIVERED
```

Debe generarse un movimiento de stock:

```text
MARKETING_LOAN
```

Ejemplo:

```text
Sucursal Centro
Campera Roma / Negro / M

Stock:
10

Préstamo:
1
```

Resultado:

```text
Stock disponible:
9
```

---

# 17. MOVIMIENTO DE STOCK

El movimiento debe ser trazable:

```text
StockMovement
```

Tipo:

```text
MARKETING_LOAN
```

Referencia:

```text
MarketingLoan
ML-000034
```

Debe registrar:

```text
producto
variante
cantidad
ubicación
usuario
fecha
hora
referencia
motivo
```

---

# 18. NO MODIFICAR STOCK MANUALMENTE

No debe permitirse:

```text
stock = stock - 1
```

sin generar un movimiento.

Correcto:

```text
MarketingLoan
       ↓
StockMovement
MARKETING_LOAN
       ↓
Inventory
```

---

# 19. STOCK EN PRÉSTAMO

El sistema debe distinguir:

```text
Físico
Disponible
Reservado
En tránsito
En préstamo
```

Conceptualmente:

```text
AVAILABLE =
PHYSICAL
- RESERVED
- OTHER_COMMITTED_STOCK
```

El diseño exacto del cálculo deberá centralizarse en:

```text
05_INVENTARIO_Y_STOCK.md
```

---

# 20. PRODUCTO FUERA DE LA SUCURSAL

Ejemplo:

```text
Sucursal Centro

Físico:
10

Reservado:
2

Prestado:
1

Disponible:
7
```

La información debe permitir responder:

```text
¿Dónde están las 3 unidades que no están disponibles?
```

---

# 21. CONDICIÓN AL SALIR

Debe registrarse el estado físico.

Valores sugeridos:

```text
NUEVO
EXCELENTE
BUENO
USADO
CON_DETALLE
DAÑADO
```

También puede utilizarse una escala configurable.

---

# 22. CONTROL FOTOGRÁFICO

En producción puede permitirse adjuntar:

```text
foto antes de salida
foto después de devolución
```

Esto es especialmente útil para productos de alto valor.

No es obligatorio para la demo inicial.

---

# 23. FECHA DE SALIDA

Debe registrarse:

```text
loanDate
```

con:

```text
fecha
hora
usuario
```

No debe permitirse una salida sin registrar quién realizó la operación.

---

# 24. FECHA PREVISTA DE DEVOLUCIÓN

Debe existir:

```text
expectedReturnDate
```

Ejemplo:

```text
Salida:
03/09/2026

Devolución esperada:
05/09/2026
```

La interfaz debe advertir:

```text
Vence mañana
```

o:

```text
DEVOLUCIÓN VENCIDA
```

---

# 25. DEVOLUCIÓN

Cuando vuelve:

```text
DELIVERED
   ↓
RETURN_PENDING
   ↓
RETURNED
```

Debe registrarse:

```text
actualReturnDate
receivedBy
conditionIn
```

---

# 26. DEVOLUCIÓN NORMAL

Ejemplo:

```text
Prestado:
1 Campera

Condición salida:
Excelente

Condición entrada:
Excelente
```

Resultado:

```text
MARKETING_RETURN
```

Stock vuelve a estar disponible.

---

# 27. MOVIMIENTO DE DEVOLUCIÓN

Debe generarse:

```text
MARKETING_RETURN
```

Ejemplo:

```text
Stock disponible:
7

Devolución:
+1

Stock disponible:
8
```

El movimiento debe referenciar:

```text
MarketingLoan
```

---

# 28. DEVOLUCIÓN PARCIAL

Ejemplo:

```text
Préstamo:
5 unidades

Devueltas:
3

Pendientes:
2
```

Estado:

```text
PARTIALLY_RETURNED
```

El sistema debe mantener:

```text
returnedQuantity = 3
missingQuantity = 2
```

hasta que el préstamo quede resuelto.

---

# 29. DEVOLUCIÓN DAÑADA

Ejemplo:

```text
Préstamo:
1 vestido

Condición salida:
Excelente

Condición entrada:
Dañado
```

Resultado:

```text
MARKETING_DAMAGE
```

El producto no debe volver automáticamente al stock disponible.

Debe pasar a una condición/ubicación adecuada:

```text
DAÑADO
```

o:

```text
REVISIÓN
```

---

# 30. MOVIMIENTO POR DAÑO

Debe generarse:

```text
MARKETING_DAMAGE
```

El sistema debe registrar:

```text
producto
cantidad
motivo
responsable
usuario
fecha
evidencia
```

---

# 31. DAÑO PARCIAL

Ejemplo:

```text
Préstamo:
5 unidades

Devueltas:
5

Dañadas:
2

Buenas:
3
```

Resultado:

```text
MARKETING_RETURN:
+3

MARKETING_DAMAGE:
2
```

No:

```text
MARKETING_RETURN:
+5
```

si dos unidades ya no son vendibles.

---

# 32. PRODUCTO NO DEVUELTO

Si llega la fecha límite:

```text
expectedReturnDate < today
```

y no existe devolución:

```text
RETURN_PENDING
```

debe aparecer como:

```text
DEVOLUCIÓN VENCIDA
```

El sistema no debe automáticamente asumir que el producto fue perdido.

---

# 33. ESTADO NO DEVUELTO

Si después de la gestión correspondiente el producto se determina como no devuelto:

```text
MISSING
```

Debe registrarse:

```text
motivo
fecha
responsable
usuario
aprobador
```

---

# 34. MOVIMIENTO DE PRODUCTO NO DEVUELTO

Debe generarse:

```text
MARKETING_MISSING
```

El producto deja de estar disponible como stock físico utilizable, pero la pérdida queda registrada.

---

# 35. NO DEVUELTO ≠ DAÑADO

Son situaciones diferentes.

```text
MISSING
```

significa:

```text
no recuperado
```

Mientras:

```text
DAMAGED
```

significa:

```text
recuperado pero con daño
```

No deben mezclarse.

---

# 36. PRODUCTO VENDIDO DURANTE EL PRÉSTAMO

Puede existir un caso donde el producto termine vendiéndose.

Ejemplo:

```text
Producto:
Vestido Luna

Estado:
PRESTADO

Cliente / tercero decide comprarlo
```

El sistema debe cerrar correctamente el préstamo y generar una venta.

Flujo:

```text
MARKETING LOAN
       ↓
SALE
       ↓
SOLD
```

---

# 37. VENTA DE PRODUCTO PRESTADO

La venta debe conservar:

```text
marketingLoanId
```

cuando corresponda.

Debe registrarse:

```text
cantidad vendida
precio
cliente
venta
pago
factura
```

El préstamo no debe generar una venta automáticamente.

La venta ocurre solamente cuando existe una operación comercial real.

---

# 38. STOCK CUANDO SE VENDE

Si una unidad está fuera de la sucursal:

```text
Prestada:
1
```

y se vende:

```text
MARKETING_LOAN
→ cierre de préstamo
SALE
```

Debe evitarse doble decremento.

El modelo debe determinar exactamente qué movimiento representa la salida definitiva de la unidad.

---

# 39. PRODUCTO PRESTADO Y RESERVADO

No debería reservarse una unidad que está fuera de disponibilidad.

Ejemplo:

```text
Físico:
10

Reservado:
3

Prestado:
2

Disponible:
5
```

No puede reservarse:

```text
6
```

por defecto.

---

# 40. PRODUCTO PRESTADO Y TRANSFERENCIA

Un producto prestado no debe aparecer como libre para transferencia.

Si:

```text
Disponible:
5
```

y:

```text
Prestado:
2
```

solo puede transferirse la cantidad realmente disponible según las reglas de inventario.

---

# 41. PRODUCTO PRESTADO Y RESERVA

La prioridad conceptual es:

```text
STOCK FÍSICO
   ↓
COMPROMISOS
   ├── RESERVAS
   ├── PRÉSTAMOS
   └── OTROS
```

El sistema debe impedir comprometer la misma unidad dos veces.

---

# 42. RENOVACIÓN DEL PRÉSTAMO

Puede permitirse extender:

```text
expectedReturnDate
```

Ejemplo:

```text
Original:
05/09

Nuevo:
10/09
```

Debe registrar:

```text
fecha anterior
fecha nueva
usuario
motivo
aprobador
```

---

# 43. PRÉSTAMOS EXTENDIDOS

El dashboard debe identificar:

```text
Préstamos próximos a vencer
Préstamos vencidos
Préstamos extendidos
Préstamos sin devolución
```

---

# 44. APROBACIÓN

Puede configurarse que todo préstamo requiera aprobación.

Ejemplo:

```text
Vendedor:
solicita préstamo

Administrador:
aprueba

Depósito:
prepara

Responsable:
retira
```

---

# 45. ROLES

## VENDEDOR

Puede:

* solicitar préstamo;
* consultar estado.

No puede:

* aprobar su propio préstamo;
* modificar stock directamente.

---

## RESPONSABLE DE MARKETING

Puede:

* crear solicitudes;
* gestionar campañas;
* controlar devoluciones.

---

## DEPÓSITO

Puede:

* preparar productos;
* entregar productos;
* recibir devoluciones;
* controlar condición.

---

## ADMINISTRADOR

Puede:

* aprobar;
* cancelar;
* extender;
* resolver incidencias.

---

## SUPER ADMIN

Acceso global.

---

# 46. ENTREGA A TERCEROS

Cuando el producto sale de la empresa, debe registrarse:

```text
quién recibe
qué recibe
cantidad
fecha
condición
fecha esperada
motivo
```

Opcionalmente:

```text
firma
foto
documento interno
```

No almacenar documentos sensibles innecesarios.

---

# 47. COMPROBANTE DE ENTREGA

El sistema puede generar un comprobante:

```text
PRÉSTAMO DE PRODUCTOS
N° ML-000034

Responsable:
Juan Pérez

Productos:
Campera Roma — Negro/M — 1

Salida:
03/09/2026

Devolución prevista:
05/09/2026

Condición:
Excelente
```

Debe incluir:

```text
COMPROBANTE INTERNO
```

y no debe confundirse con una factura.

---

# 48. COMPROBANTE DE DEVOLUCIÓN

Al recibir:

```text
DEVOLUCIÓN DE PRÉSTAMO
N° ML-000034
```

Debe mostrar:

```text
Productos
Cantidad devuelta
Condición
Observaciones
Recibido por
Fecha
```

---

# 49. INCIDENTES

Debe existir un mecanismo para registrar:

```text
INCIDENT
```

Tipos:

```text
DAÑO
PÉRDIDA
ROBO
FALTANTE
RETRASO
ERROR_DE_INVENTARIO
OTRO
```

Cada incidente debe estar vinculado al préstamo.

---

# 50. RESOLUCIÓN DE INCIDENTES

Ejemplo:

```text
Préstamo:
1 unidad

Incidente:
Daño

Resultado:
Producto inutilizable
```

Puede generar:

```text
MARKETING_DAMAGE
```

y eventualmente una gestión administrativa separada.

La gestión económica de una eventual indemnización no debe mezclarse con el movimiento de stock.

---

# 51. RESPONSABILIDAD ECONÓMICA

Si corresponde cobrar al responsable por:

```text
daño
pérdida
```

debe crearse una operación financiera separada.

Ejemplo:

```text
Incidente
   ↓
Cargo / cuenta por cobrar
   ↓
Payment
   ↓
FinancialMovement
```

No modificar el costo histórico del producto para representar el cobro.

---

# 52. COSTO DEL PRODUCTO

Debe conservarse:

```text
unitCost
```

como referencia histórica.

Ejemplo:

```text
Costo:
$40.000

Precio:
$100.000
```

Si el producto se pierde:

```text
Pérdida de inventario:
$40.000
```

La valoración contable definitiva debe definirse posteriormente según las necesidades contables del negocio.

---

# 53. AUDITORÍA

Eventos mínimos:

```text
MARKETING_LOAN_CREATED
MARKETING_LOAN_APPROVED
MARKETING_LOAN_CANCELLED
MARKETING_LOAN_DELIVERED
MARKETING_LOAN_EXTENDED
MARKETING_LOAN_RETURNED
MARKETING_LOAN_PARTIALLY_RETURNED
MARKETING_LOAN_DAMAGED
MARKETING_LOAN_MISSING
MARKETING_LOAN_SOLD
INCIDENT_CREATED
INCIDENT_RESOLVED
```

Cada evento:

```text
usuario
fecha
hora
acción
referencia
datos relevantes
motivo
```

---

# 54. DASHBOARD

Debe mostrar:

```text
Préstamos activos
Préstamos por vencer
Préstamos vencidos
Productos actualmente prestados
Devoluciones pendientes
Devoluciones parciales
Productos dañados
Productos no devueltos
Productos vendidos
Incidentes abiertos
```

---

# 55. ALERTAS

Debe existir una alerta visual para:

```text
Vence hoy
Vence mañana
Vencido
Daño pendiente de revisión
Producto no devuelto
```

Las notificaciones externas pueden agregarse posteriormente.

---

# 56. FILTROS

Por:

```text
Estado
Sucursal
Depósito
Responsable
Campaña
Motivo
Fecha
Vencimiento
Producto
SKU
```

---

# 57. REPORTES

Debe poder obtenerse:

### Productos prestados

```text
Producto
Cantidad
Responsable
Fecha
Estado
```

### Historial por responsable

```text
Responsable
Préstamos
Devoluciones
Daños
Pérdidas
```

### Historial por producto

```text
Producto
Préstamos
Fechas
Responsables
Estado final
```

### Campañas

```text
Campaña
Productos utilizados
Préstamos
Daños
Pérdidas
```

---

# 58. VALOR DE PRODUCTOS PRESTADOS

El sistema puede calcular:

```text
Valor de costo prestado
Valor de venta potencial
```

Ejemplo:

```text
3 productos

Costo total:
$120.000

Precio venta:
$300.000
```

Esto permite medir exposición de inventario.

---

# 59. INVENTARIO DE PRODUCTOS FUERA DE LA EMPRESA

Debe existir una vista:

```text
PRODUCTOS FUERA DE UBICACIÓN
```

Con:

```text
Producto
SKU
Cantidad
Responsable
Motivo
Fecha salida
Devolución prevista
Estado
```

Esto es especialmente importante para el control operativo.

---

# 60. DEMO — PRÉSTAMO NORMAL

```text
Responsable:
Fotógrafo externo

Motivo:
Sesión de fotos

Producto:
Campera Roma
Negro / M

Cantidad:
1

Salida:
03/09

Devolución:
05/09
```

Resultado:

```text
Estado:
DELIVERED

Stock disponible:
-1
```

Al devolver:

```text
MARKETING_RETURN
+1
```

Estado:

```text
RETURNED
```

---

# 61. DEMO — DEVOLUCIÓN DAÑADA

```text
Producto:
Vestido Luna

Salida:
Excelente

Entrada:
Daño en cierre
```

Resultado:

```text
MARKETING_RETURN
→ producto recuperado

MARKETING_DAMAGE
→ producto no disponible para venta
```

Estado:

```text
DAMAGED
```

---

# 62. DEMO — NO DEVUELTO

```text
Producto:
Campera Roma

Fecha devolución:
05/09

Fecha actual:
08/09

Estado:
RETURN_PENDING
```

Después de la gestión:

```text
MISSING
```

El producto permanece registrado como no recuperado.

---

# 63. DEMO — DEVOLUCIÓN PARCIAL

```text
Préstamo:
4 productos

Devueltos:
3

Faltante:
1
```

Estado:

```text
PARTIALLY_RETURNED
```

El sistema mantiene el préstamo abierto hasta resolver la unidad faltante.

---

# 64. DEMO — PRODUCTO VENDIDO

```text
Producto:
Vestido Luna

Estado:
PRESTADO
```

El tercero decide comprarlo.

Resultado:

```text
Sale
+
Payment
+
FinancialMovement
+
Invoice cuando corresponda
```

El préstamo se cierra como:

```text
SOLD
```

---

# 65. CRITERIOS DE ACEPTACIÓN

El módulo será considerado funcional cuando:

* [ ] Se pueda crear un préstamo.
* [ ] Se pueda asociar responsable.
* [ ] Se pueda seleccionar motivo.
* [ ] Se pueda asociar campaña.
* [ ] Se pueda seleccionar producto/variante.
* [ ] Se controle cantidad.
* [ ] Se registre ubicación de origen.
* [ ] Se registre destino.
* [ ] Se registre fecha de salida.
* [ ] Se registre fecha prevista de devolución.
* [ ] Se registre condición de salida.
* [ ] Se genere movimiento de stock.
* [ ] El producto deje de estar disponible para venta.
* [ ] Se pueda registrar devolución.
* [ ] Se pueda registrar devolución parcial.
* [ ] Se pueda registrar daño.
* [ ] Se pueda registrar producto no devuelto.
* [ ] Se pueda registrar producto vendido.
* [ ] Se pueda extender la fecha.
* [ ] Exista aprobación según permisos.
* [ ] Existan incidentes.
* [ ] Exista auditoría.
* [ ] Existan comprobantes internos.
* [ ] Existan reportes.
* [ ] Existan alertas de vencimiento.

---

# 66. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
localStorage
mock stock movements
datos simulados
responsables simulados
```

Debe permitir demostrar:

```text
Préstamo
Salida
Stock
Devolución
Daño
No devolución
Venta
```

---

## PRODUCCIÓN

Debe utilizar:

```text
PostgreSQL
Prisma
Transactions
StockMovement
MarketingLoan
MarketingLoanItem
AuditLog
RBAC
Idempotency
Concurrency Control
Scheduler
```

Puede incorporar posteriormente:

```text
fotografías
firma digital
notificaciones
Telegram
WhatsApp
email
comprobantes PDF
```

---

# 67. RELACIÓN CON OTROS MÓDULOS

```text
04_PRODUCTOS_Y_VARIANTES.md
        ↓
05_INVENTARIO_Y_STOCK.md
        ↓
06_DEPOSITO.md
        ↓
08_TRANSFERENCIAS_Y_REMITOS.md
        ↓
15_PRESTAMOS_PUBLICIDAD.md
```

También se relaciona con:

```text
09_VENTAS_Y_POS.md
13_PAGOS_Y_MOVIMIENTOS_DINERO.md
16_CAMBIOS_Y_DEVOLUCIONES.md
20_REPORTES_Y_EXPORTACIONES.md
21_AUDITORIA_Y_TRAZABILIDAD.md
22_REGLAS_DE_NEGOCIO.md
23_ESTADOS_Y_TRANSICIONES.md
24_MODELO_DE_DATOS.md
```

---

# 68. MODELO CONCEPTUAL

```text
RESPONSABLE
      │
      ▼
MARKETING LOAN
      │
      ├───────────────┐
      ▼               ▼
LOAN ITEMS         CAMPAIGN
      │
      ▼
PRODUCT VARIANT
      │
      ▼
STOCK MOVEMENT
      │
      ├──────────────┬──────────────┬─────────────┐
      ▼              ▼              ▼             ▼
  RETURNED        DAMAGED        MISSING        SOLD
      │              │              │             │
      ▼              ▼              ▼             ▼
  STOCK          INCIDENT       INCIDENT         SALE
```

---

# 69. PRINCIPIO FINAL

El sistema debe poder responder:

> **¿Qué productos están actualmente fuera de la empresa?**

> **¿Quién los tiene?**

> **Para qué fueron entregados?**

> **Cuándo salieron?**

> **Cuándo deberían volver?**

> **En qué condición salieron?**

> **En qué condición volvieron?**

> **Qué productos no volvieron?**

> **Qué productos se dañaron?**

> **Qué productos terminaron vendidos?**

La regla fundamental es:

```text
UN PRODUCTO PRESTADO
NO DESAPARECE DEL SISTEMA.

CAMBIA SU ESTADO Y SU DISPONIBILIDAD.
```

El flujo debe ser:

```text
PRODUCT
   ↓
MARKETING LOAN
   ↓
STOCK MOVEMENT
   ↓
OUTSIDE INVENTORY
   ↓
RETURN / DAMAGE / MISSING / SALE
   ↓
AUDIT
```

Y nunca:

```text
"restar stock y olvidarse"
```

Cada salida debe tener **motivo + responsable + fecha + estado + movimiento de inventario + resolución final**.
