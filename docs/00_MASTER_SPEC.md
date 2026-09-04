# SISTEMA DE GESTIÓN MULTISUCURSAL

## MASTER SPECIFICATION

**Documento:** 00_MASTER_SPEC.md
**Versión:** 1.0
**Estado:** Draft inicial
**Tipo:** Single Source of Truth
**Proyecto:** Sistema integral de gestión para comercio de indumentaria multisucursal

---

# 1. PROPÓSITO DEL DOCUMENTO

Este documento define la visión general, alcance, arquitectura funcional, conceptos fundamentales, procesos principales y reglas de alto nivel del sistema.

Debe considerarse la **fuente única de verdad funcional** del proyecto.

Toda implementación realizada por desarrolladores o agentes de IA debe respetar este documento y la documentación específica de cada módulo.

Ninguna funcionalidad debe implementarse únicamente porque parezca conveniente técnicamente.

Si una necesidad nueva contradice una regla existente, debe:

1. Detectarse el conflicto.
2. Informarse.
3. Proponerse una modificación.
4. Esperar aprobación.
5. Actualizar la documentación.
6. Recién después implementar el cambio.

---

# 2. OBJETIVO DEL SISTEMA

Construir un sistema integral para administrar una empresa de indumentaria con múltiples sucursales, depósito central, puntos de venta, cajas, inventario, compras, transferencias, ventas, reservas, cambios, préstamos de productos para publicidad, tesorería, empleados, reportes y facturación electrónica.

El sistema debe permitir conocer en todo momento:

* Qué productos existen.
* Qué variantes existen.
* Cuánto stock existe.
* Dónde está cada unidad.
* Qué productos están reservados.
* Qué productos están prestados para publicidad.
* Qué productos están en tránsito.
* Qué productos fueron vendidos.
* Qué productos fueron cambiados o devueltos.
* Qué dinero ingresó.
* Qué dinero salió.
* Dónde se encuentra el dinero.
* Qué caja corresponde a cada operación.
* Qué cuenta financiera recibió o envió dinero.
* Qué usuario realizó cada operación.
* Qué documentos están relacionados entre sí.

El objetivo central es garantizar **control, trazabilidad y visibilidad operativa y financiera**.

---

# 3. CONTEXTO DEL NEGOCIO

El negocio posee aproximadamente cinco sucursales.

Cada sucursal puede disponer de:

* Una caja principal.
* Dos o tres terminales POS.
* Vendedores.
* Un responsable/cajero.
* Stock propio.
* Operaciones de venta.
* Reservas.
* Cambios.
* Movimientos de stock.
* Movimientos financieros.

Existe además un depósito/almacén encargado de recibir mercadería, controlar compras, etiquetar productos y distribuir mercadería hacia las sucursales.

La administración central necesita una visión global de todas las operaciones.

---

# 4. PRINCIPIOS FUNDAMENTALES

## 4.1 Trazabilidad

Toda operación relevante debe poder responder:

* Quién la realizó.
* Cuándo.
* Desde dónde.
* Qué entidad afectó.
* Qué entidad originó la operación.
* Qué entidad recibió el resultado.
* Qué documento originó la operación.
* Qué documentos posteriores derivaron de ella.

---

## 4.2 No duplicación

Una operación de negocio debe existir una sola vez.

Ejemplo:

El vendedor crea una venta.

La venta pasa a:

`PENDIENTE_DE_COBRO`

El cajero NO crea otra venta.

El cajero toma la venta existente y registra el cobro.

---

## 4.3 POS y Caja son conceptos diferentes

### POS

El POS representa el terminal desde el cual el vendedor registra operaciones.

### Caja

La caja representa la entidad financiera/física responsable de recibir y controlar el dinero.

Un vendedor puede operar desde un POS sin ser responsable del cierre de caja.

---

## 4.4 El stock debe ser por ubicación

Nunca debe existir únicamente un stock global.

El sistema debe conocer como mínimo:

```text
Producto
→ Variante
→ Ubicación
→ Stock físico
→ Stock reservado
→ Stock disponible
```

---

## 4.5 El dinero debe ser trazable

No alcanza con registrar:

`Método de pago = Transferencia`

Debe poder conocerse:

```text
Método:
TRANSFERENCIA

Cuenta financiera:
Banco Galicia

Origen:
Caja Sucursal Centro

Destino:
Banco Galicia

Importe:
$XXX

Usuario:
Juan

Fecha:
XX/XX/XXXX

Referencia:
VENTA-000123
```

---

# 5. MÓDULOS PRINCIPALES

El sistema estará compuesto por los siguientes dominios:

1. Usuarios y permisos.
2. Sucursales.
3. POS.
4. Cajas.
5. Productos.
6. Variantes.
7. Inventario.
8. Depósito.
9. Proveedores.
10. Compras.
11. Recepción de mercadería.
12. Etiquetado.
13. Transferencias.
14. Remitos.
15. Ventas.
16. Pagos.
17. Tesorería.
18. Cuentas financieras.
19. Reservas y señas.
20. Préstamos para publicidad.
21. Cambios y devoluciones.
22. Empleados.
23. Sueldos.
24. Ventas a empleados.
25. Facturación electrónica ARCA.
26. Reportes.
27. Exportaciones.
28. Auditoría.

---

# 6. ACTORES PRINCIPALES

## Super Admin

Acceso global al sistema.

Puede consultar y administrar:

* Todas las sucursales.
* Todos los usuarios.
* Todos los productos.
* Todo el stock.
* Todas las cajas.
* Toda la tesorería.
* Todas las cuentas financieras.
* Compras.
* Ventas.
* Transferencias.
* Reportes.
* Auditoría.
* Configuración general.

---

## Administrador

Administra la operación general del negocio según los permisos asignados.

---

## Encargado de sucursal

Administra las operaciones de una sucursal específica.

Puede consultar:

* Stock.
* Ventas.
* Caja.
* Reservas.
* Cambios.
* Personal.
* Movimientos de la sucursal.

---

## Vendedor

Puede:

* Crear ventas.
* Consultar productos.
* Consultar stock permitido.
* Crear reservas.
* Registrar operaciones permitidas.

No debe cerrar la caja salvo que explícitamente tenga el permiso correspondiente.

---

## Cajero

Responsable de:

* Apertura de caja.
* Cobro de ventas.
* Registro de pagos.
* Cobros combinados.
* Movimientos de caja.
* Retiros.
* Arqueo.
* Cierre de caja.

---

## Depósito

Responsable de:

* Recepción de mercadería.
* Control de compras.
* Etiquetado.
* Preparación de transferencias.
* Despacho.
* Recepción de devoluciones o movimientos correspondientes.

---

# 7. ESTRUCTURA ORGANIZACIONAL

La estructura lógica será:

```text
EMPRESA
│
├── SUCURSAL 1
│   ├── POS 1
│   ├── POS 2
│   ├── POS 3
│   └── CAJA
│
├── SUCURSAL 2
│   ├── POS
│   └── CAJA
│
├── SUCURSAL 3
│   ├── POS
│   └── CAJA
│
├── SUCURSAL 4
│   ├── POS
│   └── CAJA
│
├── SUCURSAL 5
│   ├── POS
│   └── CAJA
│
└── DEPÓSITO CENTRAL
```

---

# 8. CONCEPTO DE PRODUCTO

Un producto comercial no debe considerarse únicamente como una descripción.

Debe poder manejar variantes.

Ejemplo:

```text
Producto:
Remera básica

Variantes:

REM-BAS-NEG-S
REM-BAS-NEG-M
REM-BAS-NEG-L

REM-BAS-BLA-S
REM-BAS-BLA-M
REM-BAS-BLA-L
```

Cada variante debe poder tener:

* SKU.
* Código de barras.
* Color.
* Talle.
* Precio.
* Precio de lista.
* Precio mayorista/revendedor.
* Stock.
* Estado.

---

# 9. INVENTARIO

El inventario debe permitir distinguir:

```text
STOCK FÍSICO
STOCK RESERVADO
STOCK DISPONIBLE
```

Regla conceptual:

```text
Stock disponible =
Stock físico - Stock reservado
```

El sistema debe registrar movimientos de stock.

Ejemplos:

* Recepción de compra.
* Transferencia enviada.
* Transferencia recibida.
* Venta.
* Devolución.
* Cambio.
* Reserva.
* Liberación de reserva.
* Préstamo para publicidad.
* Devolución de préstamo.
* Ajuste.
* Merma.
* Producto dañado.

No se debe modificar silenciosamente el stock sin generar un movimiento trazable.

---

# 10. DEPÓSITO Y COMPRAS

Flujo principal:

```text
PROVEEDOR
    ↓
ORDEN DE COMPRA
    ↓
RECEPCIÓN
    ↓
CONTROL
    ↓
STOCK DEPÓSITO
    ↓
ETIQUETADO
    ↓
PREPARACIÓN
    ↓
TRANSFERENCIA
    ↓
REMITO
    ↓
DESPACHO
    ↓
EN TRÁNSITO
    ↓
RECEPCIÓN SUCURSAL
    ↓
STOCK SUCURSAL
```

Debe contemplarse recepción parcial de mercadería.

---

# 11. TRANSFERENCIAS

Una transferencia representa el movimiento de mercadería entre ubicaciones.

Ejemplo:

```text
Depósito Central
       ↓
Transferencia #TR-000123
       ↓
Sucursal Centro
```

Estados conceptuales:

```text
BORRADOR
PREPARANDO
DESPACHADA
EN_TRANSITO
RECIBIDA
CONFIRMADA
CANCELADA
```

La transferencia debe estar vinculada al remito correspondiente.

---

# 12. VENTAS

Flujo principal:

```text
VENDEDOR
   ↓
POS
   ↓
CREAR VENTA
   ↓
PENDIENTE DE COBRO
   ↓
CAJERO
   ↓
REGISTRAR PAGOS
   ↓
VERIFICAR TOTAL
   ↓
SELECCIONAR DOCUMENTO
   ↓
FINALIZAR
```

Una venta no debe considerarse cobrada hasta que los pagos hayan sido registrados correctamente.

---

# 13. PAGOS

Una venta puede utilizar uno o varios métodos de pago.

Ejemplo:

```text
Total:
$100.000

Efectivo:
$30.000

Transferencia:
$40.000

Tarjeta:
$30.000
```

Regla obligatoria:

```text
SUMA DE PAGOS = TOTAL DE VENTA
```

No se debe permitir finalizar una venta con diferencia de importe.

Cada pago puede estar asociado a una cuenta financiera.

Ejemplo:

```text
TRANSFERENCIA
→ Banco Macro

TRANSFERENCIA
→ Banco Galicia

QR
→ Mercado Pago

EFECTIVO
→ Caja Sucursal Centro
```

---

# 14. CAJAS

Cada sucursal posee una caja.

La caja debe permitir:

```text
APERTURA
    ↓
OPERACIONES
    ↓
INGRESOS
    ↓
EGRESOS
    ↓
RETIROS
    ↓
ARQUEO
    ↓
CIERRE
```

Al realizar un arqueo se debe calcular:

```text
Saldo esperado
vs
Saldo contado
=
Diferencia
```

La diferencia debe quedar registrada.

---

# 15. TESORERÍA

La administración central debe disponer de una vista global del dinero.

Debe poder responder:

> ¿Dónde está el dinero de la empresa?

Ejemplo:

```text
Caja Mayor
Banco Macro
Banco Galicia
Mercado Pago
Caja Sucursal 1
Caja Sucursal 2
Caja Sucursal 3
Caja Sucursal 4
Caja Sucursal 5
```

También deben registrarse:

* Retiros.
* Gastos.
* Transferencias.
* Depósitos.
* Pagos a proveedores.
* Sueldos.
* Compras de empleados.
* Devoluciones.
* Ajustes.
* Cheques.
* Movimientos entre cuentas.

---

# 16. CUENTAS FINANCIERAS

El sistema debe diferenciar:

### Método de pago

Ejemplo:

```text
EFECTIVO
TRANSFERENCIA
QR
TARJETA
CHEQUE
```

### Cuenta financiera

Ejemplo:

```text
Caja Mayor
Banco Macro
Banco Galicia
Mercado Pago
Caja Sucursal Centro
```

Una transferencia debe poder representar:

```text
ORIGEN
↓
DESTINO
```

Ejemplo:

```text
Caja Sucursal Centro
        ↓
Banco Macro
```

---

# 17. RESERVAS Y SEÑAS

Una reserva representa una prenda apartada temporalmente para un cliente.

Debe contemplar:

* Producto.
* Variante.
* Cantidad.
* Cliente.
* Fecha.
* Fecha de vencimiento.
* Importe total.
* Seña.
* Saldo pendiente.
* Usuario responsable.
* Sucursal.
* Estado.

Estados conceptuales:

```text
RESERVADA
RETIRADA
CANCELADA
VENCIDA
NO_RETIRADA
```

Una unidad reservada no debe considerarse disponible para una venta normal.

El tratamiento fiscal de las señas debe definirse con el contador del negocio antes de implementar la facturación ARCA definitiva.

---

# 18. PRÉSTAMOS PARA PUBLICIDAD

El negocio puede retirar productos temporalmente de su ubicación para:

* Fotografía.
* Redes sociales.
* Publicidad.
* Producción de contenido.
* Campañas.

Este movimiento no debe confundirse automáticamente con una venta.

Debe existir un registro de préstamo/outflow.

Estados posibles:

```text
PRESTADA
DEVUELTA
DAÑADA
NO_DEVUELTA
VENDIDA
CANCELADA
```

Debe registrarse:

* Producto.
* Variante.
* Cantidad.
* Sucursal.
* Usuario.
* Fecha de salida.
* Motivo.
* Fecha prevista de devolución.
* Fecha real de devolución.
* Estado.
* Observaciones.

---

# 19. CAMBIOS Y DEVOLUCIONES

Un cambio debe estar relacionado con la venta original.

Ejemplo:

```text
Venta #000123
       ↓
Cambio #000045
       ↓
Producto devuelto
       ↓
Producto entregado
       ↓
Diferencia
       ↓
Pago / devolución / crédito
```

El sistema debe registrar los movimientos de stock correspondientes.

Debe soportar:

* Cambio por mismo precio.
* Cambio por precio superior.
* Cambio por precio inferior.
* Diferencia a pagar.
* Diferencia a devolver.
* Ajuste de stock.
* Relación con venta original.

---

# 20. EMPLEADOS

El sistema podrá registrar información operativa de empleados.

Debe contemplar posteriormente:

* Datos del empleado.
* Sucursal.
* Rol.
* Estado.
* Salario.
* Adelantos.
* Pagos.
* Historial.

---

# 21. VENTAS A EMPLEADOS

Las compras realizadas por empleados deben poder identificarse de forma independiente.

Debe permitir registrar:

* Empleado.
* Venta.
* Descuento autorizado.
* Importe.
* Medio de pago.
* Fecha.
* Usuario autorizado.

Los descuentos deben estar sujetos a permisos/reglas configurables.

---

# 22. FACTURACIÓN ARCA

El sistema debe contemplar la futura integración con ARCA.

Durante la etapa DEMO:

```text
ARCA = SIMULADO
```

Nunca debe presentarse una factura simulada como comprobante fiscal real.

Debe mostrarse claramente:

```text
COMPROBANTE DEMOSTRATIVO
SIN VALIDEZ FISCAL
```

Y:

```text
CAE: DEMO-SIMULADO
```

En producción la integración real deberá implementarse según las especificaciones vigentes de ARCA.

La facturación fiscal debe ser un dominio separado del ticket interno.

---

# 23. DOCUMENTOS DE VENTA

El sistema debe distinguir:

```text
FISCAL_INVOICE
SALE_TICKET
```

### Factura fiscal

Debe contemplar información fiscal y autorización correspondiente.

### Ticket interno

Representa una operación comercial interna/no fiscal.

En la DEMO:

```text
TIPO:
TICKET DE VENTA

ESTADO:
DEMO

CAE:
DEMO-SIMULADO

LEYENDA:
COMPROBANTE DEMOSTRATIVO — SIN VALIDEZ FISCAL
```

---

# 24. REPORTES

El sistema debe proporcionar reportes operativos, comerciales, financieros y de inventario.

Como mínimo:

### Ventas

* Ventas por sucursal.
* Ventas por vendedor.
* Ventas por fecha.
* Ventas por producto.
* Ventas por variante.
* Ventas por método de pago.
* Ventas por POS.

### Productos

* Más vendidos.
* Mayor rotación.
* Menor rotación.
* Productos sin movimiento.
* Productos próximos a agotarse.
* Productos para reposición.

### Inventario

* Stock por sucursal.
* Stock por depósito.
* Stock reservado.
* Stock disponible.
* Productos en tránsito.
* Ajustes.
* Mermas.
* Préstamos.

### Caja

* Aperturas.
* Cierres.
* Arqueos.
* Diferencias.
* Ingresos.
* Egresos.
* Retiros.

### Finanzas

* Ingresos.
* Egresos.
* Transferencias.
* Gastos.
* Pagos a proveedores.
* Sueldos.
* Compras de empleados.
* Cheques.
* Saldos por cuenta financiera.

---

# 25. EXPORTACIONES

Los movimientos financieros deben poder exportarse a Excel.

El reporte debe permitir filtros por:

* Fecha.
* Sucursal.
* Caja.
* Cuenta financiera.
* Tipo de movimiento.
* Método de pago.
* Usuario.
* Proveedor.
* Empleado.
* Estado.

También deberán poder exportarse reportes de:

* Ventas.
* Stock.
* Compras.
* Transferencias.
* Cajas.
* Tesorería.
* Proveedores.
* Empleados.

---

# 26. AUDITORÍA

Toda operación crítica debe generar un registro de auditoría.

Como mínimo:

```text
ID
USUARIO
ACCIÓN
ENTIDAD
ID ENTIDAD
SUCURSAL
FECHA
VALOR ANTERIOR
VALOR NUEVO
```

Ejemplos:

```text
CREÓ VENTA
MODIFICÓ VENTA
CANCELÓ VENTA
REGISTRÓ PAGO
ABRIÓ CAJA
CERRÓ CAJA
REALIZÓ ARQUEO
CREÓ TRANSFERENCIA
DESPACHÓ MERCADERÍA
CONFIRMÓ RECEPCIÓN
CREÓ RESERVA
CANCELÓ RESERVA
REGISTRÓ CAMBIO
REALIZÓ AJUSTE DE STOCK
REGISTRÓ GASTO
REALIZÓ TRANSFERENCIA FINANCIERA
```

---

# 27. LEDGER FINANCIERO

Todas las operaciones financieras relevantes deben poder consolidarse en un registro financiero común.

Conceptualmente:

```text
FinancialMovement
```

Campos mínimos:

```text
id
type
direction
amount
paymentMethod
source
destination
branchId
cashRegisterId
financialAccountId
supplierId
employeeId
referenceType
referenceId
createdBy
approvedBy
createdAt
notes
status
```

Tipos iniciales:

```text
SALE
CASH_WITHDRAWAL
SUPPLIER_PAYMENT
EMPLOYEE_SALARY
EMPLOYEE_PURCHASE
EXPENSE
CASH_DEPOSIT
TRANSFER
REFUND
ADJUSTMENT
```

Este ledger debe permitir reconstruir el flujo financiero de la empresa.

---

# 28. MODELO DE TRAZABILIDAD

Las entidades principales deben poder relacionarse.

Ejemplo:

```text
Proveedor
   ↓
Orden de compra
   ↓
Recepción
   ↓
Stock
   ↓
Transferencia
   ↓
Remito
   ↓
Sucursal
   ↓
Venta
   ↓
Pago
   ↓
Caja / Cuenta financiera
   ↓
Factura
```

Otro ejemplo:

```text
Venta
 ↓
Cambio
 ↓
Producto devuelto
 ↓
Producto nuevo
 ↓
Diferencia
 ↓
Movimiento financiero
```

---

# 29. DEMO

La DEMO tiene como objetivo validar:

1. Procesos.
2. UX.
3. Navegación.
4. Reglas de negocio.
5. Flujos operativos.
6. Necesidades reales del cliente.

La DEMO no debe intentar ser todavía el sistema productivo definitivo.

### DEMO

Puede utilizar:

* React.
* TypeScript.
* Vite.
* Datos simulados.
* LocalStorage o mock data.
* Simulación de ARCA.
* Exportación funcional.

### PRODUCCIÓN

La arquitectura prevista deberá permitir evolucionar hacia:

```text
Frontend
React + TypeScript

Backend
Node.js + Express + TypeScript

Database
PostgreSQL

ORM
Prisma

Autenticación
RBAC

Facturación
ARCA

Auditoría
Persistente

Infraestructura
Cloud / servidor según decisión final
```

Redis, WebSockets y otros componentes podrán incorporarse cuando exista una necesidad real.

---

# 30. PRINCIPIO DEMO → PRODUCCIÓN

La DEMO debe construirse de manera que los conceptos funcionales puedan migrarse posteriormente a una arquitectura productiva.

No se debe construir la DEMO como un conjunto de pantallas aisladas.

Cada pantalla debe representar un dominio o proceso real.

Ejemplo incorrecto:

```text
Pantalla de ventas
→ datos inventados
→ lógica aislada
```

Ejemplo correcto:

```text
Venta
→ productos
→ stock
→ cliente
→ estado
→ pagos
→ caja
→ documento
→ auditoría
```

---

# 31. REGLAS CONTRA DUPLICACIÓN

No crear:

* Dos sistemas de ventas.
* Dos carritos.
* Dos módulos de caja.
* Dos sistemas de inventario.
* Dos modelos diferentes para pagos.
* Dos entidades para representar la misma operación.

Cada concepto debe tener una única representación canónica.

---

# 32. CAMBIOS FUTUROS

El sistema debe diseñarse para poder incorporar posteriormente:

* Más sucursales.
* Más depósitos.
* Más POS.
* Más cuentas financieras.
* Nuevos métodos de pago.
* Nuevos reportes.
* Integraciones externas.
* Automatizaciones.
* API.
* Aplicaciones móviles.
* Integración con proveedores.
* Integraciones contables.

---

# 33. REGLA PRINCIPAL PARA AGENTES DE IA

Antes de modificar o crear código:

1. Leer `AGENTS.md`.
2. Leer `00_MASTER_SPEC.md`.
3. Leer la documentación específica del módulo.
4. Inspeccionar el código existente.
5. Identificar entidades y procesos relacionados.
6. Verificar si ya existe una implementación equivalente.
7. No duplicar funcionalidades.
8. No inventar reglas de negocio.
9. Si existe una contradicción, detenerse y reportarla.
10. Implementar solamente después de comprender el contexto.
11. Actualizar documentación cuando se apruebe una nueva decisión funcional.

---

# 34. DEFINICIÓN DE ÉXITO

El sistema será considerado funcionalmente exitoso cuando la empresa pueda responder con precisión:

### Inventario

> ¿Dónde está cada producto?

### Ventas

> ¿Qué se vendió, dónde, quién lo vendió y cómo se cobró?

### Caja

> ¿Cuánto dinero debería haber en cada caja y cuánto hay realmente?

### Tesorería

> ¿Dónde está actualmente el dinero de la empresa?

### Compras

> ¿Qué mercadería compramos, a quién y cuánto recibimos?

### Transferencias

> ¿Qué mercadería salió del depósito y fue recibida por qué sucursal?

### Reservas

> ¿Qué productos están reservados, para quién y hasta cuándo?

### Publicidad

> ¿Qué productos están prestados y dónde deberían estar?

### Cambios

> ¿Qué producto fue devuelto y por qué producto fue reemplazado?

### Finanzas

> ¿Qué dinero ingresó, qué dinero salió y hacia dónde fue?

### Auditoría

> ¿Quién realizó cada operación?

---

# 35. ESTADO DEL DOCUMENTO

Este documento representa la base funcional inicial del proyecto.

Las reglas específicas deberán desarrollarse en los documentos correspondientes.

Las decisiones pendientes deberán registrarse explícitamente y no asumirse.

**Estado:** DRAFT
**Versión:** 1.0
**Última actualización:** 2026-09-01
