# SISTEMA DE GESTIÓN MULTISUCURSAL

## 07 — COMPRAS Y PROVEEDORES

**Documento:** `07_COMPRAS_Y_PROVEEDORES.md`
**Versión:** 1.0
**Estado:** Draft
**Depende de:**

* `00_MASTER_SPEC.md`
* `04_PRODUCTOS_Y_VARIANTES.md`
* `05_INVENTARIO_Y_STOCK.md`
* `06_DEPOSITO.md`

---

# 1. PROPÓSITO

Este documento define el proceso completo de compras de mercadería y administración de proveedores.

El sistema debe permitir gestionar:

* Proveedores.
* Datos comerciales.
* Condiciones de compra.
* Órdenes de compra.
* Detalle de productos.
* Costos.
* Cantidades solicitadas.
* Recepciones.
* Recepciones parciales.
* Diferencias.
* Mercadería pendiente.
* Devoluciones a proveedores.
* Comprobantes asociados.
* Cuentas por pagar.
* Pagos a proveedores.
* Historial de compras.
* Trazabilidad entre compra, recepción, stock y pago.

---

# 2. PRINCIPIO FUNDAMENTAL

Una compra no es lo mismo que una recepción.

Y una recepción no es lo mismo que un pago.

El sistema debe mantener separadas estas tres operaciones:

```text
COMPRA
↓
¿Qué decidió comprar la empresa?

RECEPCIÓN
↓
¿Qué mercadería llegó realmente?

PAGO
↓
¿Cuánto dinero se pagó al proveedor?
```

Ejemplo:

```text
Orden de compra:
100 prendas

Recepción:
95 prendas

Factura:
100 prendas

Pago:
50% realizado
```

Cada situación debe poder existir sin destruir la trazabilidad de las demás.

---

# 3. FLUJO GENERAL

```text
PROVEEDOR
    ↓
ORDEN DE COMPRA
    ↓
APROBACIÓN
    ↓
RECEPCIÓN
    ↓
CONTROL
    ↓
INGRESO A DEPÓSITO
    ↓
CUENTA POR PAGAR
    ↓
PAGO
    ↓
CONCILIACIÓN
```

---

# 4. PROVEEDOR

Entidad conceptual:

```text
Supplier
```

Debe representar a una empresa/persona que suministra mercadería o servicios relacionados.

---

# 5. DATOS DEL PROVEEDOR

Como mínimo:

```text
id
name
businessName
taxId
taxCondition
address
phone
email
contactName
active
notes
```

Según el tipo de proveedor pueden existir datos adicionales.

---

# 6. IDENTIFICACIÓN FISCAL

Para Argentina, el proveedor debe poder almacenar la información fiscal necesaria para la operación administrativa.

Por ejemplo:

```text
CUIT
Razón social
Condición frente al IVA
Domicilio
```

La integración fiscal definitiva deberá validarse contra los requerimientos vigentes y la información del proveedor.

---

# 7. ESTADO DEL PROVEEDOR

Como mínimo:

```text
ACTIVE
INACTIVE
BLOCKED
```

Un proveedor bloqueado no debería poder utilizarse para nuevas compras sin autorización.

---

# 8. NO ELIMINAR PROVEEDORES CON HISTORIAL

Si un proveedor tiene:

* Compras.
* Recepciones.
* Facturas.
* Pagos.
* Deudas.

no debe eliminarse físicamente.

Debe pasar a:

```text
INACTIVE
```

---

# 9. CONDICIONES COMERCIALES

El proveedor puede tener información como:

```text
paymentTerms
defaultCurrency
minimumOrder
deliveryDays
notes
```

Ejemplo:

```text
Proveedor:
Marca XYZ

Condición:
30 días

Entrega estimada:
7 días
```

Estas condiciones pueden servir como valores predeterminados, pero no deben impedir modificarlas en una operación concreta si el usuario tiene permisos.

---

# 10. CATÁLOGO DEL PROVEEDOR

Opcionalmente, el sistema podrá asociar productos del sistema con códigos utilizados por el proveedor.

Ejemplo:

```text
Producto interno:
REM-001-NEG-M

Código proveedor:
XYZ-8841
```

Esto facilita futuras compras e importaciones.

---

# 11. ORDEN DE COMPRA

Entidad conceptual:

```text
PurchaseOrder
```

Representa la intención formal de comprar mercadería.

Debe contener:

```text
id
supplierId
branch/location destination
status
createdBy
createdAt
expectedDate
notes
items
totals
```

---

# 12. DESTINO DE LA COMPRA

La orden de compra debe indicar dónde se espera recibir la mercadería.

Inicialmente:

```text
Depósito Central
```

Pero la arquitectura debe permitir posteriormente:

```text
Depósito
Sucursal
Otro depósito
```

La regla habitual será que las compras ingresen primero al depósito central, salvo una decisión explícita del negocio.

---

# 13. DETALLE DE LA ORDEN DE COMPRA

Cada línea debe identificar:

```text
variantId
quantity
unitCost
discount
tax
subtotal
```

La variante debe corresponder a un producto real del catálogo.

---

# 14. COSTO DE COMPRA

El costo de adquisición debe quedar registrado en la orden y/o recepción según la política contable definida.

Ejemplo:

```text
Cantidad:
20

Costo unitario:
$10.000

Subtotal:
$200.000
```

No se debe utilizar el precio de venta como costo.

---

# 15. COSTO Y STOCK

La compra puede afectar el costo de inventario.

Sin embargo:

```text
PurchaseOrder
≠
Stock
```

El stock aumenta por la recepción confirmada.

El tratamiento definitivo del costo promedio, costo último, costos adicionales y valoración de inventario deberá especificarse antes de producción.

---

# 16. ESTADOS DE ORDEN DE COMPRA

Como mínimo:

```text
DRAFT
PENDING_APPROVAL
APPROVED
PARTIALLY_RECEIVED
FULLY_RECEIVED
CLOSED
CANCELLED
```

---

# 17. CREACIÓN DE ORDEN

Flujo:

```text
Crear orden
↓
Seleccionar proveedor
↓
Seleccionar productos
↓
Indicar cantidades
↓
Indicar costos
↓
Revisar totales
↓
Guardar
```

Inicialmente:

```text
DRAFT
```

---

# 18. APROBACIÓN

Si la empresa requiere autorización:

```text
DRAFT
↓
PENDING_APPROVAL
↓
APPROVED
```

Debe quedar registrado:

```text
approvedBy
approvedAt
```

---

# 19. CANCELACIÓN

Una orden puede cancelarse mientras todavía no haya generado operaciones incompatibles.

Ejemplo:

```text
DRAFT
→ CANCELLED
```

Una orden parcialmente recibida no debe simplemente eliminarse.

Debe conservar su historial.

---

# 20. RECEPCIÓN DE LA COMPRA

La orden aprobada puede generar una o varias recepciones.

```text
PurchaseOrder
      ↓
PurchaseReceipt
```

Ejemplo:

```text
OC:
100 unidades

Recepción 1:
60

Recepción 2:
40
```

---

# 21. RECEPCIÓN PARCIAL

Debe soportarse obligatoriamente.

Ejemplo:

```text
Solicitado: 100
Recibido: 70
Pendiente: 30
```

Estado:

```text
PARTIALLY_RECEIVED
```

El sistema debe mantener las 30 unidades pendientes.

---

# 22. RECEPCIÓN COMPLETA

Cuando:

```text
Solicitado = Recibido
```

la orden puede pasar a:

```text
FULLY_RECEIVED
```

Posteriormente podrá pasar a:

```text
CLOSED
```

según el proceso administrativo.

---

# 23. RECEPCIÓN MAYOR A LO SOLICITADO

Ejemplo:

```text
Solicitado:
100

Recibido:
105
```

El sistema debe advertir:

```text
SOBRANTE
+5
```

No debe aceptar silenciosamente la diferencia.

La política sobre si se acepta, rechaza o requiere autorización debe ser configurable.

---

# 24. RECEPCIÓN MENOR A LO SOLICITADO

Ejemplo:

```text
Solicitado:
100

Recibido:
95

Pendiente:
5
```

Debe quedar registrado.

---

# 25. PRODUCTO EQUIVOCADO

Si llega:

```text
Solicitado:
Remera Negra M
```

pero se recibe:

```text
Remera Negra L
```

el sistema debe registrar:

```text
VARIANTE_INCORRECTA
```

No debe cambiar automáticamente la orden original.

---

# 26. MERCADERÍA DAÑADA

Si llega una prenda dañada:

```text
Cantidad recibida:
10

Dañadas:
1

Vendibles:
9
```

La recepción debe registrar el estado.

El producto dañado no debe quedar disponible automáticamente para venta.

---

# 27. DOCUMENTACIÓN DEL PROVEEDOR

La recepción o compra puede estar asociada a:

```text
Factura
Remito proveedor
Orden de compra
Nota de crédito
Nota de débito
Otro comprobante
```

La fiscalización definitiva de comprobantes dependerá del alcance acordado con el cliente.

---

# 28. FACTURA DEL PROVEEDOR

Una factura recibida debe poder asociarse con:

```text
Supplier
PurchaseOrder
PurchaseReceipt
```

Esto permite comparar:

```text
Comprado
vs
Recibido
vs
Facturado
vs
Pagado
```

---

# 29. NO CONFUNDIR FACTURA CON RECEPCIÓN

Ejemplo:

```text
Factura:
100 unidades

Recepción:
95 unidades
```

El sistema no debe modificar automáticamente la recepción para hacerla coincidir con la factura.

Debe mostrar la diferencia.

---

# 30. CUENTA POR PAGAR

Cuando corresponde, la factura del proveedor genera una obligación financiera.

Conceptualmente:

```text
SupplierInvoice
↓
AccountsPayable
```

Ejemplo:

```text
Factura:
$1.000.000

Pagado:
$400.000

Pendiente:
$600.000
```

---

# 31. PAGOS A PROVEEDORES

El pago pertenece al módulo financiero, pero debe quedar vinculado a la compra/proveedor.

Ejemplo:

```text
Proveedor XYZ
Factura #0001
$1.000.000

Pago:
$400.000

Cuenta:
Banco Galicia
```

Esto debe generar un movimiento financiero.

---

# 32. PAGO PARCIAL

Debe permitirse:

```text
Factura:
$1.000.000

Pago 1:
$300.000

Pago 2:
$300.000

Saldo:
$400.000
```

---

# 33. PAGO TOTAL

Cuando:

```text
Pagado = Total adeudado
```

el documento puede pasar a:

```text
PAID
```

---

# 34. MÉTODOS DE PAGO

Los pagos a proveedores pueden utilizar:

```text
EFECTIVO
TRANSFERENCIA
CHEQUE
OTRO
```

El método no debe confundirse con la cuenta financiera.

Ejemplo:

```text
Método:
TRANSFERENCIA

Cuenta:
Banco Galicia
```

o:

```text
Método:
TRANSFERENCIA

Cuenta:
Banco Macro
```

---

# 35. CUENTAS FINANCIERAS

El pago debe identificar la entidad financiera utilizada cuando corresponda.

Ejemplos:

```text
Caja Mayor
Banco Macro
Banco Galicia
Mercado Pago
Caja Sucursal Centro
```

La definición completa estará en:

`12_CUENTAS_FINANCIERAS.md`.

---

# 36. CHEQUES

Si se utiliza cheque:

```text
Número
Banco
Fecha de emisión
Fecha de vencimiento
Beneficiario
Importe
Estado
```

Estados posibles:

```text
EMITIDO
ENTREGADO
DEPOSITADO
COBRADO
RECHAZADO
ANULADO
```

La gestión completa estará vinculada al módulo financiero.

---

# 37. DEVOLUCIÓN AL PROVEEDOR

Cuando se devuelve mercadería:

```text
Stock
↓
Devolución proveedor
↓
Proveedor
```

Debe generarse una operación específica.

No debe eliminarse la recepción original.

---

# 38. MOTIVOS DE DEVOLUCIÓN

Ejemplos:

```text
PRODUCTO_DAÑADO
PRODUCTO_EQUIVOCADO
EXCESO_DE_MERCADERÍA
DEFECTO
DIFERENCIA_DE_CALIDAD
OTRO
```

---

# 39. IMPACTO DE DEVOLUCIÓN

Si se devuelve mercadería disponible:

```text
Stock:
10

Devolución:
2

Stock:
8
```

Debe existir:

```text
RETURN_TO_SUPPLIER
-2
```

vinculado a la devolución.

---

# 40. DEVOLUCIÓN DE MERCADERÍA DAÑADA

Si la mercadería ya estaba marcada como dañada, el sistema debe evitar descontarla dos veces.

Ejemplo:

```text
Stock vendible:
8
Dañado:
2
```

Devolución de las 2 dañadas:

```text
Dañado:
0
```

No:

```text
Stock vendible:
6
```

La lógica debe respetar el estado real de la mercadería.

---

# 41. HISTORIAL DEL PROVEEDOR

La ficha del proveedor debe permitir consultar:

```text
Compras
Recepciones
Facturas
Devoluciones
Pagos
Saldo pendiente
Última compra
Total comprado
```

---

# 42. INDICADORES DE PROVEEDOR

Podrán mostrarse:

```text
Total comprado
Total pagado
Saldo pendiente
Cantidad de órdenes
Cantidad de recepciones
Diferencias
Devoluciones
Tiempo promedio de entrega
```

Estos indicadores serán especialmente útiles para evaluar proveedores.

---

# 43. COMPARACIÓN DE PROVEEDORES

En una futura versión, el sistema podrá comparar:

```text
Proveedor
Costo
Tiempo de entrega
Cumplimiento
Diferencias
Devoluciones
```

Esto puede ayudar a decidir dónde realizar futuras compras.

No es necesario implementar un sistema avanzado de scoring en la primera DEMO.

---

# 44. HISTORIAL DE COSTOS

Cada compra debe conservar el costo utilizado en ese momento.

Ejemplo:

```text
Compra 1:
$8.000

Compra 2:
$9.500

Compra 3:
$10.200
```

No se debe sobrescribir históricamente el costo anterior.

---

# 45. PRECIO DE VENTA VS COSTO

El sistema debe distinguir claramente:

```text
Costo
Precio de venta
Precio mayorista/revendedor
```

Una modificación del precio de venta no debe modificar el historial del costo de compra.

---

# 46. GASTOS ADICIONALES

La arquitectura debería permitir posteriormente costos adicionales:

```text
Flete
Seguro
Importación
Embalaje
Otros costos
```

No es obligatorio implementarlos en la DEMO.

---

# 47. MONEDA

La orden debe poder registrar la moneda de la operación.

Inicialmente el sistema puede operar en:

```text
ARS
```

pero la arquitectura debe evitar asumir que únicamente existirá una moneda.

---

# 48. IMPUESTOS

La compra puede tener información impositiva:

```text
Subtotal
Descuentos
Impuestos
Total
```

La lógica fiscal definitiva debe ser validada con el contador/asesor fiscal del cliente.

No inventar reglas tributarias.

---

# 49. TRAZABILIDAD

Debe poder responderse:

> ¿Qué compramos?

> ¿A quién?

> ¿Cuándo?

> ¿Cuánto?

> ¿A qué costo?

> ¿Cuánto recibimos realmente?

> ¿Cuánto quedó pendiente?

> ¿Qué mercadería se devolvió?

> ¿Cuánto debemos?

> ¿Cuánto pagamos?

> ¿Desde qué cuenta financiera se pagó?

---

# 50. RELACIÓN CON DEPÓSITO

El flujo será:

```text
PurchaseOrder
↓
PurchaseReceipt
↓
Warehouse
↓
StockMovement
↓
Inventory
```

El módulo de compras no debe modificar manualmente el stock.

---

# 51. RELACIÓN CON TESORERÍA

El flujo será:

```text
SupplierInvoice
↓
AccountsPayable
↓
Payment
↓
FinancialMovement
↓
FinancialAccount
```

Ejemplo:

```text
Factura proveedor:
$500.000

Pago:
$500.000

Método:
TRANSFERENCIA

Cuenta:
Banco Galicia
```

---

# 52. RELACIÓN CON AUDITORÍA

Las siguientes acciones deben quedar auditadas:

* Crear proveedor.
* Modificar proveedor.
* Bloquear proveedor.
* Crear orden.
* Modificar orden.
* Aprobar orden.
* Cancelar orden.
* Registrar recepción.
* Registrar diferencias.
* Registrar devolución.
* Registrar factura.
* Registrar pago.
* Anular operación.

---

# 53. NO ELIMINACIÓN

No deben eliminarse físicamente:

```text
PurchaseOrder
PurchaseReceipt
SupplierInvoice
SupplierPayment
SupplierReturn
```

si tienen impacto histórico.

Se utilizan estados de cancelación/anulación y operaciones compensatorias.

---

# 54. PERMISOS

## WAREHOUSE

Puede:

* Consultar órdenes.
* Registrar recepciones.
* Controlar mercadería.
* Registrar diferencias.
* Preparar devoluciones físicas.

## ADMIN

Puede:

* Crear órdenes.
* Aprobar compras.
* Gestionar proveedores.
* Consultar costos.
* Gestionar obligaciones.

## SUPER_ADMIN

Puede:

* Acceso global.
* Autorizar operaciones sensibles.
* Consultar historial financiero.
* Consultar todos los proveedores.

Las reglas detalladas dependen de:

`02_ROLES_Y_PERMISOS.md`.

---

# 55. DASHBOARD DE COMPRAS

Debe mostrar:

```text
Órdenes pendientes
Órdenes por aprobar
Recepciones pendientes
Compras parciales
Mercadería pendiente
Facturas pendientes
Pagos pendientes
Deuda con proveedores
Devoluciones
```

---

# 56. FILTROS

Las compras deben poder filtrarse por:

```text
Proveedor
Fecha
Estado
SKU
Producto
Sucursal/depósito
Orden
Factura
Usuario
```

---

# 57. BÚSQUEDA

Debe permitir buscar por:

```text
Nombre proveedor
CUIT
Número de orden
Número de factura
SKU
Código de barras
Producto
```

---

# 58. REPORTES

El módulo debe alimentar reportes de:

```text
Compras por período
Compras por proveedor
Compras por producto
Costo por producto
Compras por sucursal/destino
Recepciones
Diferencias
Devoluciones
Cuentas por pagar
Pagos
```

---

# 59. EXPORTACIÓN

Las compras deberán poder exportarse a Excel posteriormente.

Como mínimo:

```text
Órdenes de compra
Detalle de compras
Recepciones
Diferencias
Devoluciones
Facturas
Pagos
Saldos de proveedores
```

---

# 60. DEMO — FLUJO COMPLETO

La DEMO debe representar:

```text
Proveedor
↓
Orden de compra
↓
Aprobación
↓
Recepción
↓
Control
↓
Ingreso a depósito
↓
Stock actualizado
↓
Factura proveedor
↓
Cuenta por pagar
↓
Pago
↓
Movimiento financiero
```

---

# 61. DEMO — RECEPCIÓN PARCIAL

Escenario:

```text
Orden:
100 prendas

Recepción:
70

Pendiente:
30
```

La orden debe mostrar:

```text
PARTIALLY_RECEIVED
```

---

# 62. DEMO — DIFERENCIA

Escenario:

```text
Orden:
50

Recibido:
47

Faltante:
3
```

Debe registrarse la diferencia.

---

# 63. DEMO — DEVOLUCIÓN

Escenario:

```text
Recibido:
20

Dañadas:
2

Devolución:
2
```

La devolución debe estar vinculada a la recepción.

---

# 64. DEMO — PAGO PARCIAL

Escenario:

```text
Factura:
$1.000.000

Pago:
$400.000

Saldo:
$600.000
```

Debe mostrarse claramente la deuda restante.

---

# 65. DEMO — PAGO CON TRANSFERENCIA

Escenario:

```text
Proveedor:
XYZ

Factura:
$500.000

Método:
TRANSFERENCIA

Cuenta:
Banco Galicia

Estado:
PAGADO
```

Debe quedar conectado al movimiento financiero.

---

# 66. MODELO CONCEPTUAL

```text
Supplier
   │
   ├───────────────┐
   │               │
   ▼               ▼
PurchaseOrder   SupplierInvoice
   │               │
   ▼               ▼
PurchaseReceipt  AccountsPayable
   │               │
   ▼               ▼
Inventory        Payment
                   │
                   ▼
            FinancialMovement
                   │
                   ▼
            FinancialAccount
```

---

# 67. REGLAS DE NEGOCIO

### Regla 1

Una orden de compra no aumenta stock.

### Regla 2

Una recepción confirmada sí puede aumentar stock.

### Regla 3

Una orden puede tener múltiples recepciones.

### Regla 4

Una recepción puede ser parcial.

### Regla 5

Las diferencias deben registrarse.

### Regla 6

Una factura no modifica retroactivamente una recepción.

### Regla 7

Un pago no modifica la cantidad física de stock.

### Regla 8

Una devolución reduce stock mediante un movimiento específico.

### Regla 9

Los pagos pueden ser parciales.

### Regla 10

El método de pago y la cuenta financiera son conceptos diferentes.

### Regla 11

No se deben eliminar operaciones históricas.

### Regla 12

El costo histórico de una compra debe conservarse.

### Regla 13

No se debe modificar retroactivamente el costo histórico.

### Regla 14

Todo pago debe quedar vinculado al proveedor y a la obligación correspondiente.

### Regla 15

Toda operación sensible debe quedar auditada.

---

# 68. CRITERIOS DE ACEPTACIÓN

El módulo será considerado correcto cuando permita:

### Proveedores

Crear, consultar, modificar, bloquear y desactivar proveedores.

### Compras

Crear órdenes de compra.

### Aprobación

Gestionar aprobación cuando corresponda.

### Recepción

Registrar mercadería recibida.

### Parcial

Registrar múltiples recepciones.

### Diferencias

Detectar faltantes y sobrantes.

### Costos

Conservar costos históricos.

### Devoluciones

Registrar devoluciones a proveedores.

### Facturas

Asociar comprobantes a las compras.

### Deuda

Calcular cuentas por pagar.

### Pagos

Registrar pagos parciales y totales.

### Finanzas

Identificar método y cuenta financiera.

### Auditoría

Mantener trazabilidad de las operaciones.

---

# 69. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
Mock suppliers
Mock purchase orders
Mock invoices
localStorage
Financial movements simulados
```

Pero debe conservar las relaciones conceptuales.

## PRODUCCIÓN

Debe utilizar:

```text
API
PostgreSQL
Prisma
Transacciones
RBAC
AuditLog
FinancialMovement
AccountsPayable
```

---

# 70. PRINCIPIO FINAL

El sistema debe poder seguir una compra desde el momento en que la empresa decide adquirir mercadería hasta el momento en que esa mercadería entra al inventario y posteriormente se paga al proveedor.

```text
DECISIÓN DE COMPRA
        ↓
ORDEN
        ↓
MERCADERÍA RECIBIDA
        ↓
CONTROL
        ↓
STOCK
        ↓
FACTURA
        ↓
DEUDA
        ↓
PAGO
        ↓
CUENTA FINANCIERA
```

La regla fundamental es:

> **Comprar, recibir y pagar son tres operaciones diferentes que deben estar relacionadas, pero nunca mezcladas.**

De esta forma el sistema puede responder con precisión:

> **Qué compramos, cuánto llegó, cuánto costó, cuánto debemos y desde dónde se pagó.**

---

**Estado:** DRAFT
**Versión:** 1.0
**Última actualización:** 2026-09-02
