# SISTEMA DE GESTIÓN MULTISUCURSAL

## 06 — DEPÓSITO Y OPERACIONES LOGÍSTICAS

**Documento:** `06_DEPOSITO.md`
**Versión:** 1.0
**Estado:** Draft
**Depende de:**

* `00_MASTER_SPEC.md`
* `01_VISION_Y_ALCANCE.md`
* `02_ROLES_Y_PERMISOS.md`
* `03_SUCURSALES_Y_POS.md`
* `04_PRODUCTOS_Y_VARIANTES.md`
* `05_INVENTARIO_Y_STOCK.md`

---

# 1. PROPÓSITO

Este documento define la operación del depósito central y su relación logística con las sucursales.

El depósito será responsable de:

* Recibir mercadería de proveedores.
* Controlar cantidades recibidas.
* Detectar diferencias.
* Registrar mercadería.
* Generar etiquetas.
* Preparar mercadería para sucursales.
* Crear transferencias.
* Generar remitos.
* Preparar despachos.
* Registrar salida.
* Mantener mercadería en tránsito.
* Recibir confirmación de las sucursales.
* Gestionar diferencias de recepción.
* Mantener trazabilidad completa.

El depósito no debe ser considerado simplemente como otra pantalla de inventario.

Debe representar una **operación logística completa**.

---

# 2. PRINCIPIO FUNDAMENTAL

La operación física debe seguir el siguiente modelo:

```text
PROVEEDOR
    ↓
RECEPCIÓN
    ↓
CONTROL
    ↓
REGISTRO
    ↓
ETIQUETADO
    ↓
ALMACENAMIENTO
    ↓
PREPARACIÓN
    ↓
REMITO
    ↓
DESPACHO
    ↓
EN TRÁNSITO
    ↓
RECEPCIÓN EN SUCURSAL
    ↓
CONFIRMACIÓN
```

Cada etapa debe tener un estado.

---

# 3. DEPÓSITO CENTRAL

La empresa tendrá inicialmente:

```text
1 Depósito Central
+
5 Sucursales
```

El depósito central funcionará como principal punto de:

* Recepción.
* Almacenamiento.
* Distribución.
* Reposición.

En una futura versión podrán existir múltiples depósitos.

---

# 4. DEPÓSITO ≠ SUCURSAL

Aunque ambos tienen inventario, cumplen funciones diferentes.

## Depósito

Orientado a:

```text
Recepción
Almacenamiento
Preparación
Despacho
Distribución
```

## Sucursal

Orientada a:

```text
Exhibición
Venta
Reservas
Cambios
Préstamos publicitarios
Gestión de caja
```

---

# 5. RESPONSABLE DEL DEPÓSITO

El rol `WAREHOUSE` podrá:

* Ver inventario del depósito.
* Registrar recepciones.
* Controlar mercadería.
* Generar etiquetas.
* Preparar transferencias.
* Crear remitos.
* Registrar despachos.
* Consultar movimientos.
* Confirmar operaciones logísticas propias.

No podrá:

* Finalizar ventas.
* Cobrar ventas.
* Cerrar cajas.
* Modificar movimientos financieros.
* Alterar arbitrariamente stock.

---

# 6. RECEPCIÓN DE MERCADERÍA

La recepción comienza cuando llega mercadería de un proveedor.

Flujo:

```text
Orden de compra
↓
Mercadería llega
↓
Recepción
↓
Control físico
↓
Confirmación
↓
Ingreso a depósito
```

---

# 7. RECEPCIÓN VINCULADA A COMPRA

Siempre que exista una orden de compra:

```text
PurchaseOrder
↓
PurchaseReceipt
```

La recepción debe mantener referencia a la compra original.

Esto permite responder:

> ¿Qué mercadería se recibió de esta orden de compra?

---

# 8. RECEPCIÓN SIN ORDEN DE COMPRA

El sistema podrá permitir recepciones excepcionales sin orden previa si el negocio lo requiere.

Debe quedar explícitamente registrado:

```text
Recepción sin OC
```

y requerir:

* Proveedor.
* Usuario.
* Fecha.
* Motivo.
* Detalle de mercadería.
* Observaciones.

La utilización de esta función debe poder restringirse por permisos.

---

# 9. ESTADOS DE RECEPCIÓN

Como mínimo:

```text
DRAFT
EXPECTED
IN_PROGRESS
RECEIVED
PARTIALLY_RECEIVED
COMPLETED
CANCELLED
```

Ejemplo:

```text
Orden:
100 unidades

Recepción:
60

Estado:
PARTIALLY_RECEIVED
```

---

# 10. CONTROL DE MERCADERÍA

La recepción debe permitir comparar:

```text
Cantidad esperada
vs
Cantidad recibida
```

Ejemplo:

```text
Esperadas: 100
Recibidas: 98
Diferencia: -2
```

La diferencia debe quedar registrada.

---

# 11. DIFERENCIAS DE RECEPCIÓN

Tipos posibles:

```text
FALTANTE
SOBRANTE
PRODUCTO_EQUIVOCADO
VARIANTE_EQUIVOCADA
PRODUCTO_DAÑADO
ERROR_DE_ETIQUETA
OTRO
```

Debe existir un campo de observaciones.

---

# 12. NO INGRESAR MERCADERÍA NO CONTROLADA

La mercadería no debe pasar automáticamente a stock disponible simplemente porque fue creada una orden de compra.

Regla:

```text
PurchaseOrder
≠
Stock
```

El stock aumenta cuando la mercadería es realmente recibida y confirmada.

---

# 13. INGRESO AL STOCK

Cuando se confirma una recepción:

```text
Recepción confirmada
↓
StockMovement
PURCHASE_RECEIPT
↓
Inventory actualizado
```

El movimiento debe estar vinculado a:

```text
PurchaseReceipt
```

---

# 14. RECEPCIÓN PARCIAL

Ejemplo:

```text
OC-100
100 unidades

Recepción 1:
40

Recepción 2:
30

Recepción 3:
30
```

Resultado:

```text
Recibidas: 100
Pendientes: 0
```

Cada recepción debe conservar su propio historial.

---

# 15. CONTROL DE VARIANTES

En ropa es crítico controlar:

```text
Producto
Color
Talle
SKU
Código de barras
Cantidad
```

No debe ser suficiente validar únicamente el nombre del producto.

Ejemplo:

```text
Remera Básica
Negro / M
```

es diferente de:

```text
Remera Básica
Negro / L
```

---

# 16. EVITAR DUPLICACIÓN DE PRODUCTOS

Durante una recepción, si el SKU o código de barras ya existe:

```text
SKU:
REM-001-NEG-M
```

el sistema debe utilizar la variante existente.

No debe crear automáticamente:

```text
REM-001-NEG-M-2
```

ni duplicar el producto.

Si existe una inconsistencia, debe advertir al usuario.

---

# 17. PRODUCTO NUEVO

Si la mercadería contiene un producto que todavía no existe:

```text
Producto nuevo
↓
Crear producto
↓
Crear variante
↓
Asignar SKU
↓
Asignar código de barras
↓
Definir precio
↓
Registrar recepción
```

Dependiendo de permisos, la creación puede requerir autorización.

---

# 18. ETIQUETADO

El depósito debe poder generar etiquetas para mercadería recibida.

La etiqueta podrá incluir:

```text
Marca
Producto
Variante
Color
Talle
SKU
Código de barras
Precio
```

El formato exacto deberá definirse según las necesidades del cliente.

---

# 19. IMPRESIÓN DE ETIQUETAS

Debe poder seleccionarse:

```text
Cantidad recibida
```

y generar automáticamente las etiquetas correspondientes.

Ejemplo:

```text
Remera Negra M
Cantidad:
20

Etiquetas:
20
```

---

# 20. REIMPRESIÓN

El sistema podrá permitir reimprimir etiquetas.

La reimpresión debe quedar auditada cuando se requiera trazabilidad.

No debe crear una nueva mercadería ni modificar stock.

---

# 21. UBICACIÓN FÍSICA

La arquitectura debería permitir posteriormente manejar ubicaciones internas:

```text
Depósito Central
├── Sector A
│   ├── Estantería 01
│   └── Estantería 02
├── Sector B
└── Sector C
```

Para la DEMO puede utilizarse únicamente:

```text
Depósito Central
```

sin implementar gestión avanzada de estanterías.

---

# 22. ALMACENAMIENTO

Una vez recibida y controlada, la mercadería pasa a almacenamiento.

El sistema debe conocer:

```text
Variante
Cantidad
Ubicación
Estado
```

La operación física real de colocar una prenda en una estantería puede incorporarse posteriormente.

---

# 23. SOLICITUD DE REPOSICIÓN

Una sucursal puede necesitar mercadería.

La solicitud puede originarse por:

```text
Stock bajo
Solicitud manual
Necesidad comercial
Nueva apertura
Promoción
Temporada
```

Flujo:

```text
Sucursal
↓
Solicitud de reposición
↓
Depósito
↓
Revisión
↓
Preparación
```

---

# 24. SOLICITUD DE REPOSICIÓN

Entidad conceptual:

```text
StockRequest
```

Debe incluir:

```text
id
branchId
requestedBy
requestedAt
status
items
notes
```

Estados sugeridos:

```text
DRAFT
REQUESTED
APPROVED
PREPARING
PARTIALLY_PREPARED
PREPARED
DISPATCHED
COMPLETED
CANCELLED
```

---

# 25. PREPARACIÓN DE MERCADERÍA

Una vez aprobada una solicitud:

```text
Solicitud
↓
Preparación
↓
Picking
↓
Control
↓
Embalaje
↓
Remito
↓
Despacho
```

---

# 26. PICKING

El picking representa la selección física de las prendas que deben enviarse.

Ejemplo:

```text
Sucursal Centro

Remera Negra M → 5
Remera Blanca L → 3
Jean Azul 42 → 2
```

El operador debe poder marcar:

```text
PREPARADO
```

por cada ítem.

---

# 27. DIFERENCIA DURANTE PICKING

Puede ocurrir:

```text
Solicitado: 10
Encontrado: 8
```

El sistema no debe permitir fingir que fueron preparadas 10.

Debe registrar:

```text
Solicitado: 10
Preparado: 8
Faltante: 2
```

---

# 28. PREPARACIÓN PARCIAL

Una transferencia puede prepararse parcialmente.

Ejemplo:

```text
Solicitado:
20

Preparado:
15

Pendiente:
5
```

La operación debe conservar esa diferencia.

---

# 29. TRANSFERENCIA

La transferencia logística representa el movimiento de mercadería entre ubicaciones.

Ejemplo:

```text
Depósito Central
↓
Sucursal Norte
```

La transferencia completa se especificará en:

`08_TRANSFERENCIAS_Y_REMITOS.md`.

Este documento define principalmente la parte física del proceso.

---

# 30. REMITO

Cada despacho debe poder estar asociado a un remito.

El remito debe identificar:

```text
Origen
Destino
Fecha
Productos
Cantidades
Responsable
Referencia
```

El número/formato definitivo dependerá de los requerimientos legales y operativos.

---

# 31. DESPACHO

Cuando la mercadería sale físicamente:

```text
Preparación
↓
Control
↓
Despacho
↓
EN_TRÁNSITO
```

Debe registrarse:

```text
Usuario
Fecha
Hora
Origen
Destino
Cantidad
Remito
```

---

# 32. STOCK AL DESPACHAR

Al despachar:

```text
Origen:
- cantidad
```

y conceptualmente:

```text
En tránsito:
+ cantidad
```

El destino todavía no debe considerar esas unidades como disponibles.

Esto sigue las reglas de:

`05_INVENTARIO_Y_STOCK.md`.

---

# 33. MERCADERÍA EN TRÁNSITO

Debe existir una vista de:

```text
TRANSFERENCIAS EN TRÁNSITO
```

con:

```text
Transferencia
Origen
Destino
Fecha despacho
Cantidad
Remito
Estado
Días en tránsito
```

---

# 34. RECEPCIÓN EN SUCURSAL

Cuando la sucursal recibe:

```text
Mercadería
↓
Control físico
↓
Comparación contra remito
↓
Confirmación
```

Debe poder indicar:

```text
Recibido completo
```

o:

```text
Recibido con diferencias
```

---

# 35. RECEPCIÓN COMPLETA

Ejemplo:

```text
Remito:
10 unidades

Recibidas:
10

Resultado:
COMPLETED
```

El stock destino se actualiza.

---

# 36. RECEPCIÓN CON DIFERENCIAS

Ejemplo:

```text
Remito:
10

Recibidas:
9
```

El sistema debe registrar:

```text
Faltante:
1
```

La unidad faltante no debe ingresar al stock de la sucursal.

---

# 37. SOBRANTE EN RECEPCIÓN

Ejemplo:

```text
Remito:
10

Recibidas:
11
```

El sistema debe detectar:

```text
Sobrante:
1
```

No debe aumentar automáticamente el stock sin registrar la diferencia.

La acción posterior deberá depender de la política del negocio.

---

# 38. PRODUCTO DAÑADO EN RECEPCIÓN

Ejemplo:

```text
Remito:
10

Recibidas:
10

Dañadas:
1
```

La recepción debe registrar el estado de esa unidad.

No debe quedar disponible para venta automáticamente.

---

# 39. CONFIRMACIÓN DE RECEPCIÓN

Solo la sucursal destino debe poder confirmar la recepción como recibida, salvo intervención administrativa autorizada.

Esto evita que el depósito pueda marcar unilateralmente:

```text
"Recibido"
```

sin confirmación del destino.

---

# 40. ESTADOS DE TRANSFERENCIA

Como mínimo:

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

Las transiciones exactas se definirán también en:

`23_ESTADOS_Y_TRANSICIONES.md`.

---

# 41. CANCELACIÓN

Una transferencia puede cancelarse únicamente mientras el estado lo permita.

Ejemplo:

```text
DRAFT
→ CANCELLED
```

Una transferencia ya despachada no debe simplemente eliminarse.

Debe existir un proceso correctivo.

---

# 42. MODIFICACIÓN DE TRANSFERENCIA

Una transferencia ya despachada no debe poder editarse libremente.

Incorrecto:

```text
Despachado:
10

Editar:
8
```

Correcto:

```text
Despacho original:
10

Diferencia:
2

Registrar incidencia
```

La historia física debe permanecer intacta.

---

# 43. INCIDENCIAS LOGÍSTICAS

Debe existir una forma de registrar incidencias.

Ejemplos:

```text
FALTANTE
SOBRANTE
DAÑO
ERROR_DE_VARIANTE
ERROR_DE_DESTINO
PRODUCTO_NO_RECIBIDO
ERROR_DE_REMITO
OTRO
```

Cada incidencia debe tener:

```text
Descripción
Usuario
Fecha
Referencia
Estado
```

---

# 44. CONTROL DE MERCADERÍA NO RECIBIDA

Si una transferencia queda:

```text
EN_TRANSITO
```

durante un período excesivo, debe aparecer como alerta.

Ejemplo:

```text
Transferencia #TR-100
Origen: Depósito
Destino: Norte
Despachada: hace 5 días
Estado: EN_TRÁNSITO
```

La configuración de días de alerta debe ser configurable.

---

# 45. HISTORIAL LOGÍSTICO

Cada operación debe conservar:

```text
Creada
Aprobada
Preparada
Despachada
Recibida
Cerrada
```

con:

```text
Usuario
Fecha
Hora
Estado anterior
Estado nuevo
Observación
```

---

# 46. AUDITORÍA

Toda operación sensible debe generar `AuditLog`.

Especialmente:

* Recepciones.
* Diferencias.
* Ajustes.
* Transferencias.
* Despachos.
* Confirmaciones.
* Cancelaciones.
* Reimpresiones.
* Cambios de cantidades.

---

# 47. RELACIÓN CON INVENTARIO

El depósito no debe modificar directamente el stock.

Debe producir operaciones que generan movimientos.

Ejemplo:

```text
Recepción
↓
StockMovement
↓
Inventory
```

```text
Despacho
↓
StockMovement
↓
Inventory
```

```text
Recepción en sucursal
↓
StockMovement
↓
Inventory
```

---

# 48. RELACIÓN CON COMPRAS

El flujo será:

```text
Supplier
↓
PurchaseOrder
↓
PurchaseReceipt
↓
StockMovement
↓
Inventory
```

El módulo de compras será definido en:

`07_COMPRAS_Y_PROVEEDORES.md`.

---

# 49. RELACIÓN CON TRANSFERENCIAS

El flujo será:

```text
StockRequest
↓
Transfer
↓
Picking
↓
Remito
↓
Dispatch
↓
InTransit
↓
BranchReceipt
↓
Stock destination
```

---

# 50. RELACIÓN CON ETIQUETAS

El flujo será:

```text
Recepción
↓
Productos recibidos
↓
LabelBatch
↓
Impresión
```

La impresión de etiquetas no debe modificar stock.

---

# 51. TRAZABILIDAD

El sistema debe poder responder:

> ¿Cuándo llegó este producto?

> ¿De qué proveedor vino?

> ¿En qué recepción ingresó?

> ¿Cuándo fue enviado a una sucursal?

> ¿En qué remito?

> ¿Quién lo despachó?

> ¿Cuándo fue recibido?

> ¿Quién confirmó la recepción?

Esta información debe poder reconstruirse mediante las referencias entre entidades.

---

# 52. DEMO — OPERACIÓN COMPLETA

La DEMO debe mostrar al menos un flujo completo:

```text
Proveedor
↓
Orden de compra
↓
Recepción
↓
Control
↓
Ingreso al depósito
↓
Etiquetas
↓
Solicitud de reposición
↓
Preparación
↓
Remito
↓
Despacho
↓
En tránsito
↓
Sucursal recibe
↓
Confirmación
↓
Stock actualizado
```

---

# 53. DEMO — RECEPCIÓN CON DIFERENCIA

Debe existir un escenario donde:

```text
Esperado:
20

Recibido:
19
```

El sistema debe mostrar:

```text
Diferencia:
-1
```

y conservar la incidencia.

---

# 54. DEMO — TRANSFERENCIA

Ejemplo:

```text
Depósito:
10 unidades

Transferencia:
4

Despacho:
4

En tránsito:
4

Recepción:
4

Depósito:
6

Sucursal:
+4
```

---

# 55. DEMO — RECEPCIÓN CON SOBRANTE

Ejemplo:

```text
Remito:
5

Recibido:
6
```

Debe aparecer:

```text
Sobrante:
1
```

y requerir tratamiento explícito.

---

# 56. DEMO — RECEPCIÓN DE PRODUCTO DAÑADO

Ejemplo:

```text
Enviadas:
5

Recibidas:
5

Dañadas:
1
```

Resultado:

```text
Disponible:
4

No disponible:
1
```

según el modelo definido en `05_INVENTARIO_Y_STOCK.md`.

---

# 57. DASHBOARD DE DEPÓSITO

El depósito debe disponer de indicadores como:

```text
Recepciones pendientes
Compras pendientes de recibir
Transferencias pendientes
Preparaciones pendientes
Despachos del día
Mercadería en tránsito
Transferencias con diferencias
Incidencias abiertas
Stock bajo
```

---

# 58. FILTROS

Las operaciones deben poder filtrarse por:

```text
Fecha
Sucursal
Proveedor
Estado
SKU
Producto
Usuario
Remito
Transferencia
Orden de compra
```

---

# 59. BÚSQUEDA

La búsqueda debe aceptar:

```text
SKU
Código de barras
Nombre
Color
Talle
Número de orden
Número de remito
Número de transferencia
```

---

# 60. EXPORTACIÓN

Las operaciones logísticas deberían poder exportarse posteriormente a Excel.

Como mínimo:

```text
Recepciones
Transferencias
Despachos
Mercadería en tránsito
Incidencias
Diferencias
```

La definición general estará en:

`20_REPORTES_Y_EXPORTACIONES.md`.

---

# 61. SEGURIDAD

Las operaciones deben respetar:

* Rol.
* Permisos.
* Sucursal.
* Ubicación.
* Estado de la operación.

Un usuario de una sucursal no debe poder modificar arbitrariamente operaciones de otra sucursal.

---

# 62. PRINCIPIO DE NO ELIMINACIÓN

No se deben eliminar físicamente:

* Recepciones confirmadas.
* Transferencias despachadas.
* Remitos históricos.
* Despachos.
* Incidencias cerradas.
* Movimientos de stock.

Las correcciones deben realizarse mediante nuevas operaciones.

---

# 63. MODELO CONCEPTUAL

```text
Supplier
   │
   ▼
PurchaseOrder
   │
   ▼
PurchaseReceipt
   │
   ├── ReceivedItems
   │
   └── LabelBatch
           │
           ▼
       Inventory
           │
           ▼
      StockRequest
           │
           ▼
        Transfer
           │
           ▼
        Picking
           │
           ▼
        Remito
           │
           ▼
       Dispatch
           │
           ▼
       InTransit
           │
           ▼
    BranchReceipt
           │
           ▼
       Inventory
```

---

# 64. REGLAS DE NEGOCIO

### Regla 1

Una orden de compra no aumenta stock.

### Regla 2

Solo una recepción confirmada genera ingreso de stock.

### Regla 3

La recepción puede ser parcial.

### Regla 4

Toda diferencia debe registrarse.

### Regla 5

La mercadería no controlada no debe considerarse disponible.

### Regla 6

El SKU identifica la variante correspondiente.

### Regla 7

No se deben crear duplicados automáticamente.

### Regla 8

Las etiquetas no modifican stock.

### Regla 9

Una preparación parcial debe conservarse.

### Regla 10

Un despacho genera mercadería en tránsito.

### Regla 11

El destino no recibe stock disponible hasta confirmar recepción.

### Regla 12

Las diferencias de recepción deben quedar auditadas.

### Regla 13

Una operación despachada no se elimina.

### Regla 14

Las correcciones se realizan mediante operaciones nuevas.

### Regla 15

Todo movimiento debe poder relacionarse con su operación logística.

---

# 65. CRITERIOS DE ACEPTACIÓN

El módulo será considerado correcto cuando permita:

### Recepción

Registrar mercadería recibida.

### Control

Comparar esperado vs recibido.

### Parcial

Registrar recepciones parciales.

### Diferencias

Detectar faltantes y sobrantes.

### Etiquetas

Generar etiquetas según cantidad recibida.

### Reposición

Crear solicitudes desde sucursales.

### Picking

Preparar mercadería para despacho.

### Remito

Generar documentación asociada al envío.

### Despacho

Registrar salida física.

### Tránsito

Visualizar mercadería enviada pero no recibida.

### Recepción destino

Confirmar recepción.

### Incidencias

Registrar diferencias y daños.

### Trazabilidad

Reconstruir todo el recorrido logístico.

### Auditoría

Saber quién realizó cada operación.

---

# 66. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
Mock data
localStorage
Estados simulados
Impresión simulada
Remitos DEMO
```

pero debe representar correctamente el proceso.

## PRODUCCIÓN

Deberá utilizar:

```text
API
PostgreSQL
Transacciones
RBAC
AuditLog
StockMovement
Document numbering
Backups
```

y los documentos legales/contables que correspondan.

---

# 67. PRINCIPIO FINAL

El depósito no es simplemente:

> "Un lugar donde hay stock."

Es el **centro logístico de la empresa**.

Su responsabilidad es controlar el recorrido:

```text
MERCADERÍA
↓
INGRESA
↓
SE CONTROLA
↓
SE IDENTIFICA
↓
SE ALMACENA
↓
SE PREPARA
↓
SE DESPACHA
↓
SE TRANSPORTA
↓
SE RECIBE
↓
SE CONFIRMA
```

Cada paso debe ser visible, trazable y auditable.

La regla fundamental es:

> **La mercadería nunca debe desaparecer entre dos operaciones. El sistema siempre debe poder explicar dónde está y qué operación la llevó hasta allí.**

---

**Estado:** DRAFT
**Versión:** 1.0
**Última actualización:** 2026-09-02
