# SISTEMA DE GESTIÓN MULTISUCURSAL

## 08 — TRANSFERENCIAS Y REMITOS

**Documento:** `08_TRANSFERENCIAS_Y_REMITOS.md`
**Versión:** 1.0
**Estado:** Draft
**Última actualización:** 2026-09-02

**Depende de:**

* `00_MASTER_SPEC.md`
* `02_ROLES_Y_PERMISOS.md`
* `04_PRODUCTOS_Y_VARIANTES.md`
* `05_INVENTARIO_Y_STOCK.md`
* `06_DEPOSITO.md`
* `07_COMPRAS_Y_PROVEEDORES.md`

---

# 1. PROPÓSITO

Este módulo define el movimiento de mercadería entre ubicaciones de la empresa.

Principalmente:

```text
DEPÓSITO CENTRAL
       ↓
   SUCURSAL
```

Pero la arquitectura debe permitir posteriormente:

```text
DEPÓSITO → DEPÓSITO
SUCURSAL → SUCURSAL
SUCURSAL → DEPÓSITO
```

El objetivo es garantizar que cada unidad transferida tenga trazabilidad desde el origen hasta la recepción definitiva.

---

# 2. PRINCIPIO FUNDAMENTAL

Una transferencia no significa que el stock aparezca inmediatamente en destino.

El flujo físico es:

```text
ORIGEN
  ↓
PREPARACIÓN
  ↓
DESPACHO
  ↓
EN TRÁNSITO
  ↓
RECEPCIÓN
  ↓
DESTINO
```

Por lo tanto debe existir una diferencia entre:

```text
Stock físico en origen
Stock en tránsito
Stock recibido en destino
```

---

# 3. REGLA FUNDAMENTAL DE STOCK

El sistema nunca debe realizar:

```text
-10 origen
+10 destino
```

en el mismo instante en que se crea una solicitud.

La solicitud no mueve stock.

---

# 4. MOMENTO EN QUE SE DESCUBRE EL STOCK

El flujo recomendado es:

```text
Solicitud
↓
Aprobación
↓
Preparación
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

Así el sistema sabe exactamente dónde está la mercadería.

---

# 5. CONCEPTO DE TRANSFERENCIA

Entidad conceptual:

```text
Transfer
```

Debe representar el movimiento logístico entre dos ubicaciones.

Campos conceptuales:

```text
id
originLocationId
destinationLocationId
status
requestedBy
approvedBy
preparedBy
dispatchedBy
receivedBy
requestedAt
approvedAt
preparedAt
dispatchedAt
receivedAt
notes
```

---

# 6. ORIGEN

Debe identificarse claramente:

```text
originLocationId
```

Ejemplo:

```text
Depósito Central
```

---

# 7. DESTINO

Debe identificarse:

```text
destinationLocationId
```

Ejemplo:

```text
Sucursal Centro
```

---

# 8. UBICACIONES

El sistema debe tratar las ubicaciones como entidades.

Ejemplo:

```text
Central Warehouse
Sucursal Centro
Sucursal Yerba Buena
Sucursal Barrio Norte
Sucursal Sur
Sucursal Este
```

No se debe depender únicamente del nombre de la sucursal.

---

# 9. SOLICITUD DE MERCADERÍA

Una sucursal puede solicitar productos al depósito.

Ejemplo:

```text
Sucursal Centro

Solicita:

Remera Negra M → 5
Remera Negra L → 3
Jean Azul 40 → 2
```

La solicitud no modifica stock.

---

# 10. SOLICITUD DE TRANSFERENCIA

Entidad conceptual:

```text
StockRequest
```

Puede contener:

```text
id
requestingLocationId
sourceLocationId
requestedBy
status
items
requestedAt
notes
```

---

# 11. ESTADOS DE SOLICITUD

```text
DRAFT
REQUESTED
APPROVED
REJECTED
PREPARING
PARTIALLY_PREPARED
PREPARED
DISPATCHED
COMPLETED
CANCELLED
```

No todos los estados tienen que aparecer necesariamente en UI; son estados conceptuales del proceso.

---

# 12. APROBACIÓN

Dependiendo de la política de la empresa:

```text
REQUESTED
↓
APPROVED
```

o:

```text
REQUESTED
↓
REJECTED
```

Debe quedar registrado:

```text
approvedBy
approvedAt
```

---

# 13. RECHAZO

Si no existe stock suficiente o la solicitud no corresponde:

```text
REQUESTED
↓
REJECTED
```

Debe registrarse el motivo.

Ejemplo:

```text
Stock insuficiente
Solicitud incorrecta
Producto discontinuado
Otro
```

---

# 14. PREPARACIÓN / PICKING

Una vez aprobada:

```text
APPROVED
↓
PREPARING
```

El personal de depósito prepara físicamente la mercadería.

Debe poder visualizar:

```text
Producto
Variante
SKU
Color
Talle
Cantidad solicitada
Cantidad preparada
Ubicación
```

---

# 15. PICKING

El sistema debe permitir confirmar cada línea.

Ejemplo:

```text
Solicitado: 10

Preparado:
8
```

El sistema debe mostrar:

```text
Faltante:
2
```

---

# 16. PREPARACIÓN PARCIAL

Debe permitirse.

Ejemplo:

```text
Solicitado:
100

Preparado:
80
```

Estado:

```text
PARTIALLY_PREPARED
```

No se debe fingir que fueron preparadas las 100 unidades.

---

# 17. DIFERENCIAS DURANTE PICKING

Pueden aparecer:

```text
FALTANTE
SOBRANTE
VARIANTE_EQUIVOCADA
PRODUCTO_DAÑADO
ERROR_DE_CONTEO
OTRO
```

Cada diferencia debe quedar registrada.

---

# 18. PRODUCTO EQUIVOCADO

Si se solicitó:

```text
Remera Roja M
```

y se prepara:

```text
Remera Roja L
```

el sistema debe advertirlo antes del despacho.

No debe modificarse silenciosamente la solicitud.

---

# 19. CONFIRMACIÓN DE PREPARACIÓN

Cuando la mercadería está lista:

```text
PREPARING
↓
PREPARED
```

Debe quedar registrado:

```text
preparedBy
preparedAt
```

---

# 20. REMITO

La transferencia debe generar un documento de remisión.

Entidad conceptual:

```text
Remito
```

El remito documenta qué mercadería salió físicamente del origen y hacia dónde se dirige.

---

# 21. DATOS DEL REMITO

Como mínimo:

```text
id
transferId
number
originLocationId
destinationLocationId
items
createdAt
createdBy
status
notes
```

---

# 22. NUMERACIÓN

La numeración del remito debe ser controlada.

Ejemplo conceptual:

```text
REM-000001
REM-000002
REM-000003
```

En producción se deberá definir la numeración legal/fiscal que corresponda al tipo de documento utilizado.

La DEMO puede utilizar numeración simulada.

---

# 23. CONTENIDO DEL REMITO

Debe incluir:

```text
Origen
Destino
Fecha
Número
Producto
SKU
Color
Talle
Cantidad
Usuario responsable
Observaciones
```

---

# 24. REMITO NO ES FACTURA

El sistema debe mantener separados:

```text
Remito
Factura
```

El remito documenta el movimiento de mercadería.

No debe interpretarse automáticamente como una venta.

---

# 25. DESPACHO

Una vez preparado:

```text
PREPARED
↓
DISPATCHED
```

En ese momento se considera que la mercadería abandonó físicamente el origen.

---

# 26. MOVIMIENTO DE STOCK DE SALIDA

Al confirmar despacho debe generarse:

```text
TRANSFER_OUT
```

Ejemplo:

```text
Depósito Central
Remera Negra M
-10
```

El movimiento debe estar vinculado a:

```text
transferId
remitoId
originLocationId
destinationLocationId
```

---

# 27. STOCK EN TRÁNSITO

Después del despacho:

```text
Origen:
-10

En tránsito:
+10

Destino:
0
```

La mercadería todavía no pertenece al stock disponible del destino.

---

# 28. ESTADO IN_TRANSIT

La transferencia pasa a:

```text
IN_TRANSIT
```

Debe poder consultarse:

```text
Origen
Destino
Fecha de despacho
Cantidad
Remito
Responsable
Tiempo en tránsito
```

---

# 29. CONTROL DE TRÁNSITO

El sistema debe poder detectar transferencias que llevan demasiado tiempo sin recepción.

Ejemplo:

```text
Transferencia:
Depósito → Sucursal Centro

Despachada:
01/09

Hoy:
05/09

Estado:
IN_TRANSIT

⚠️ Demorada
```

El umbral debe ser configurable.

---

# 30. RECEPCIÓN EN SUCURSAL

La sucursal recibe físicamente la mercadería.

Debe comparar:

```text
REMItO
vs
MERCADERÍA REAL
```

---

# 31. RECEPCIÓN COMPLETA

Ejemplo:

```text
Remito:
50

Recibido:
50
```

Resultado:

```text
RECEIVED
```

Debe generarse:

```text
TRANSFER_IN
```

y el destino recibe las unidades.

---

# 32. RECEPCIÓN CON DIFERENCIAS

Ejemplo:

```text
Remito:
50

Recibido:
47

Faltante:
3
```

El sistema debe permitir:

```text
RECEIVED_WITH_DIFFERENCES
```

o:

```text
WITH_DIFFERENCES
```

según la nomenclatura definitiva de estados.

---

# 33. SOBRANTE EN DESTINO

Ejemplo:

```text
Remito:
50

Recibido:
52
```

Debe registrarse:

```text
SOBRANTE:
+2
```

No debe agregarse silenciosamente.

La empresa debe definir si:

* Se acepta.
* Se rechaza.
* Se genera incidencia.
* Requiere autorización.

---

# 34. FALTANTE EN DESTINO

Ejemplo:

```text
Remito:
50

Recibido:
47
```

Debe registrarse:

```text
FALTANTE:
3
```

Las 47 recibidas ingresan al stock.

Las 3 faltantes quedan como incidencia.

---

# 35. VARIANTE INCORRECTA

Ejemplo:

```text
Enviado:
Pantalón Azul 40

Recibido:
Pantalón Azul 42
```

Debe registrarse:

```text
VARIANTE_EQUIVOCADA
```

No se debe convertir automáticamente una variante en otra.

---

# 36. MERCADERÍA DAÑADA DURANTE TRANSPORTE

Ejemplo:

```text
Enviado:
20

Recibido:
20

Dañadas:
2
```

El sistema debe registrar:

```text
TRANSFER_IN
18 disponibles

2 dañadas
```

y generar una incidencia.

---

# 37. ESTADOS DE TRANSFERENCIA

Estados recomendados:

```text
DRAFT
REQUESTED
APPROVED
PREPARING
PREPARED
DISPATCHED
IN_TRANSIT
PARTIALLY_RECEIVED
RECEIVED
WITH_DIFFERENCES
CANCELLED
```

---

# 38. TRANSICIONES

Flujo normal:

```text
DRAFT
 ↓
REQUESTED
 ↓
APPROVED
 ↓
PREPARING
 ↓
PREPARED
 ↓
DISPATCHED
 ↓
IN_TRANSIT
 ↓
RECEIVED
```

Con diferencia:

```text
IN_TRANSIT
 ↓
WITH_DIFFERENCES
```

---

# 39. CANCELACIÓN

Una transferencia puede cancelarse antes del despacho si todavía no generó movimientos irreversibles.

Ejemplo:

```text
REQUESTED
↓
CANCELLED
```

Después del despacho no debe eliminarse.

Si existe un error deberá resolverse mediante una operación correctiva trazable.

---

# 40. TRANSFERENCIA DESPACHADA NO SE ELIMINA

Una vez generado:

```text
TRANSFER_OUT
```

la transferencia forma parte del historial.

No debe:

```text
DELETE
```

---

# 41. CORRECCIONES

Si hubo un error:

```text
Movimiento original
+
Movimiento compensatorio
```

Ejemplo:

```text
TRANSFER_OUT:
-10

Corrección:
+2

Resultado neto:
-8
```

Siempre debe quedar la explicación.

---

# 42. RECEPCIÓN DUPLICADA

El sistema debe impedir:

```text
TRANSFER_IN
```

dos veces para la misma cantidad.

Debe existir una validación de idempotencia.

Ejemplo:

```text
Transfer:
TR-000123

Recepción:
ya confirmada

Resultado:
Operación rechazada.
```

---

# 43. STOCK NEGATIVO

No debe permitirse despachar más unidades de las disponibles.

Ejemplo:

```text
Stock disponible:
5

Solicitud:
10
```

El sistema debe impedir el despacho de las 10 salvo que exista una política explícita de backorder/reserva futura.

---

# 44. RESERVAS Y TRANSFERENCIAS

El stock reservado no debe considerarse automáticamente disponible para transferencia.

Ejemplo:

```text
Stock físico:
20

Reservado:
8

Disponible:
12
```

No se deben preparar 15 unidades.

---

# 45. TRAZABILIDAD COMPLETA

Cada transferencia debe permitir reconstruir:

```text
Quién solicitó
Quién aprobó
Quién preparó
Quién despachó
Quién recibió
Qué productos
Qué variantes
Qué cantidades
Qué remito
Cuándo salió
Cuándo llegó
Qué diferencias hubo
```

---

# 46. AUDITORÍA

Registrar:

```text
CREATED
REQUESTED
APPROVED
REJECTED
PREPARING
PREPARED
DISPATCHED
RECEIVED
RECEIVED_WITH_DIFFERENCES
CANCELLED
```

Cada evento debe tener:

```text
userId
timestamp
action
entity
entityId
metadata
```

---

# 47. INCIDENCIAS

Las diferencias deben generar una incidencia cuando corresponda.

Entidad conceptual:

```text
TransferIncident
```

Tipos:

```text
MISSING
EXCESS
WRONG_VARIANT
DAMAGED
LOST
OTHER
```

---

# 48. RESOLUCIÓN DE INCIDENCIAS

Una incidencia puede tener:

```text
OPEN
UNDER_REVIEW
RESOLVED
CANCELLED
```

Debe poder registrarse:

```text
resolución
responsable
fecha
observaciones
```

---

# 49. EJEMPLO COMPLETO

## Solicitud

```text
Sucursal Centro

Remera Negra M:
10

Jean Azul 40:
5
```

Estado:

```text
REQUESTED
```

---

## Aprobación

```text
APPROVED
```

---

## Picking

Depósito prepara:

```text
Remera Negra M:
10

Jean Azul 40:
5
```

Estado:

```text
PREPARED
```

---

## Despacho

Se genera:

```text
Remito:
REM-000152
```

Movimientos:

```text
Depósito
Remera Negra M:
-10

Depósito
Jean Azul 40:
-5
```

Estado:

```text
IN_TRANSIT
```

---

## Recepción

Sucursal recibe:

```text
Remera Negra M:
10

Jean Azul 40:
4
```

Resultado:

```text
Remera Negra M:
+10

Jean Azul 40:
+4
```

Incidencia:

```text
FALTANTE:
1 Jean Azul 40
```

---

# 50. IMPACTO EN INVENTARIO

La transferencia debe interactuar con el modelo definido en:

`05_INVENTARIO_Y_STOCK.md`

Conceptualmente:

```text
ORIGEN
Inventory
↓
TRANSFER_OUT
↓
IN_TRANSIT
↓
TRANSFER_IN
↓
DESTINO
Inventory
```

---

# 51. NO EDITAR STOCK MANUALMENTE

La transferencia nunca debe permitir que el usuario escriba:

```text
Stock nuevo = 100
```

Debe trabajar mediante cantidades y movimientos.

Correcto:

```text
Transferir:
10
```

Incorrecto:

```text
Cambiar stock a:
100
```

---

# 52. REMITO Y STOCK

El remito por sí solo no debería modificar stock.

El evento que genera el movimiento es:

```text
Confirmación de despacho
```

y posteriormente:

```text
Confirmación de recepción
```

---

# 53. ROLES

## SUCURSAL

Puede:

* Crear solicitudes.
* Consultar solicitudes propias.
* Consultar transferencias destinadas a la sucursal.
* Recibir mercadería.
* Registrar diferencias.
* Consultar remitos.

## DEPÓSITO

Puede:

* Consultar solicitudes.
* Aprobar según permisos.
* Preparar.
* Hacer picking.
* Crear remitos.
* Despachar.
* Registrar incidencias.

## ADMIN

Puede:

* Gestionar transferencias.
* Autorizar operaciones.
* Consultar historial.
* Resolver incidencias.

## SUPER_ADMIN

Puede:

* Acceso global.
* Consultar todas las transferencias.
* Autorizar operaciones excepcionales.
* Resolver conflictos.
* Consultar auditoría completa.

---

# 54. DASHBOARD DE LOGÍSTICA

Debe mostrar:

```text
Solicitudes pendientes
Por aprobar
En preparación
Preparadas
Despachadas
En tránsito
Demoradas
Pendientes de recepción
Con diferencias
Incidencias abiertas
```

---

# 55. FILTROS

Permitir filtrar por:

```text
Origen
Destino
Fecha
Estado
Remito
Producto
SKU
Usuario
Incidencia
```

---

# 56. BÚSQUEDA

Buscar por:

```text
Número de transferencia
Número de remito
SKU
Código de barras
Producto
Sucursal
```

---

# 57. REPORTES

El sistema deberá poder generar posteriormente:

```text
Transferencias por período
Transferencias por sucursal
Mercadería enviada
Mercadería recibida
Diferencias
Faltantes
Sobrantes
Incidencias
Tiempo promedio de tránsito
Transferencias demoradas
```

---

# 58. INDICADORES LOGÍSTICOS

Indicadores futuros:

```text
Tiempo promedio de preparación
Tiempo promedio de tránsito
Tiempo promedio de recepción
% transferencias completas
% transferencias con diferencias
% faltantes
% sobrantes
```

---

# 59. DEMO — ESCENARIO 1

### Transferencia completa

```text
Depósito:
100 unidades

Solicitud:
20

Preparación:
20

Despacho:
20

En tránsito:
20

Recepción:
20

Destino:
+20
```

Resultado:

```text
Transferencia COMPLETADA
Sin diferencias
```

---

# 60. DEMO — ESCENARIO 2

### Transferencia parcial

```text
Solicitud:
20

Preparado:
15

Despachado:
15

Recibido:
15
```

Resultado:

```text
5 pendientes
```

---

# 61. DEMO — ESCENARIO 3

### Faltante

```text
Despachado:
20

Recibido:
18
```

Resultado:

```text
Destino:
+18

Incidencia:
2 faltantes
```

---

# 62. DEMO — ESCENARIO 4

### Sobrante

```text
Despachado:
20

Recibido:
21
```

Resultado:

```text
1 sobrante
```

Debe requerir tratamiento según la política definida.

---

# 63. DEMO — ESCENARIO 5

### Variante incorrecta

```text
Enviado:
Remera M

Recibido:
Remera L
```

Resultado:

```text
Incidencia:
WRONG_VARIANT
```

---

# 64. DEMO — ESCENARIO 6

### Mercadería dañada

```text
Despachado:
20

Recibido:
20

Dañadas:
2
```

Resultado:

```text
Disponibles:
18

Dañadas:
2
```

---

# 65. DEMO — ESCENARIO 7

### Transferencia demorada

```text
Estado:
IN_TRANSIT

Fecha despacho:
X

Fecha actual:
X + umbral
```

Mostrar:

```text
⚠️ TRANSFERENCIA DEMORADA
```

---

# 66. REGLAS DE NEGOCIO

### Regla 1

Crear una solicitud no modifica stock.

### Regla 2

Aprobar una solicitud no modifica stock.

### Regla 3

Preparar mercadería no debe modificar stock disponible del destino.

### Regla 4

El despacho genera `TRANSFER_OUT`.

### Regla 5

La mercadería despachada queda en tránsito.

### Regla 6

La recepción genera `TRANSFER_IN`.

### Regla 7

El destino no recibe stock disponible hasta confirmar la recepción.

### Regla 8

Las diferencias deben registrarse.

### Regla 9

Los faltantes no pueden inventarse como recibidos.

### Regla 10

Los sobrantes requieren tratamiento explícito.

### Regla 11

Una transferencia despachada no puede eliminarse.

### Regla 12

No se permite stock negativo salvo política explícita.

### Regla 13

No se pueden recibir dos veces las mismas unidades.

### Regla 14

Las variantes deben coincidir.

### Regla 15

Todo movimiento debe tener referencia a la transferencia.

### Regla 16

El remito debe estar vinculado a la transferencia.

### Regla 17

Toda diferencia relevante debe poder generar una incidencia.

### Regla 18

Toda operación debe quedar auditada.

---

# 67. CRITERIOS DE ACEPTACIÓN

El módulo será aceptado cuando permita:

### Solicitud

Crear una solicitud desde una sucursal.

### Aprobación

Aprobar o rechazar solicitudes.

### Picking

Preparar mercadería.

### Parcial

Preparar cantidades parciales.

### Remito

Generar remito asociado.

### Despacho

Confirmar salida física.

### Stock

Generar `TRANSFER_OUT`.

### Tránsito

Mostrar mercadería en tránsito.

### Recepción

Confirmar llegada.

### Stock destino

Generar `TRANSFER_IN`.

### Diferencias

Registrar faltantes y sobrantes.

### Incidencias

Registrar problemas de transporte/recepción.

### Auditoría

Saber quién realizó cada acción.

---

# 68. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
Mock data
localStorage
Estados simulados
Remitos DEMO
Movimientos de stock simulados
```

Debe demostrar correctamente la lógica.

## PRODUCCIÓN

Deberá utilizar:

```text
PostgreSQL
Prisma
Transacciones
StockMovement
Transfer
Remito
TransferIncident
AuditLog
RBAC
```

Las operaciones críticas deben ejecutarse dentro de transacciones de base de datos.

---

# 69. PRINCIPIO FINAL

La transferencia no es simplemente:

```text
Sucursal A → Sucursal B
```

Es un proceso logístico trazable:

```text
SOLICITUD
   ↓
APROBACIÓN
   ↓
PICKING
   ↓
PREPARACIÓN
   ↓
REMITO
   ↓
DESPACHO
   ↓
TRANSFER_OUT
   ↓
EN TRÁNSITO
   ↓
RECEPCIÓN
   ↓
TRANSFER_IN
   ↓
STOCK DESTINO
```

El sistema debe poder responder en cualquier momento:

> **¿Qué mercadería salió?**

> **¿De dónde salió?**

> **¿A dónde iba?**

> **¿Quién la preparó?**

> **¿Quién la despachó?**

> **¿Qué remito la acompaña?**

> **¿Está en tránsito?**

> **¿Quién la recibió?**

> **¿Llegó completa?**

> **¿Hubo faltantes, sobrantes o daños?**

> **¿Dónde está actualmente esa mercadería?**

---

**Estado:** DRAFT
**Versión:** 1.0
**Última actualización:** 2026-09-02
