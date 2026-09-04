# 18_VENTAS_DE_EMPLEADOS.md

# VM DIGITAL STUDIO — SISTEMA DE GESTIÓN MULTISUCURSAL

## Módulo 18 — Ventas de Empleados

**Versión:** 1.0
**Estado:** Especificación funcional
**Prioridad:** Alta
**Dependencias:** Productos, variantes, inventario, ventas/POS, empleados, pagos, tesorería, sueldos, auditoría

---

# 1. OBJETIVO

El módulo permite gestionar las compras que realizan los empleados de la empresa sobre productos comercializados por el negocio.

Debe contemplar:

* Venta de productos a empleados.
* Identificación del empleado comprador.
* Precio especial para empleados.
* Descuentos autorizados.
* Pago inmediato.
* Pago parcial cuando esté permitido.
* Compra a cuenta.
* Descuento posterior sobre sueldo.
* Control de límites.
* Relación con la venta original.
* Salida de stock.
* Registro financiero.
* Auditoría.

### Principio fundamental

> **Una venta a un empleado sigue siendo una venta.**

La diferencia es que el comprador pertenece a la empresa y puede acceder a condiciones comerciales especiales.

No debe crearse un sistema paralelo de ventas.

La venta debe utilizar la misma infraestructura de:

```text
Sale
SaleItem
Payment
Inventory
StockMovement
FinancialMovement
Employee
AuditLog
```

---

# 2. ALCANCE

El módulo contempla dos modalidades principales:

### Modalidad A — Pago inmediato

El empleado compra y paga en el momento.

```text
Employee
   ↓
Sale
   ↓
Payment
   ↓
FinancialMovement
```

### Modalidad B — Descuento por sueldo

El empleado retira/completa la compra y el importe queda pendiente para descontarse de una liquidación posterior.

```text
Employee
   ↓
Sale
   ↓
EmployeePurchase
   ↓
Payroll
   ↓
Discount
```

---

# 3. VENTA NORMAL VS VENTA DE EMPLEADO

La arquitectura debe evitar duplicar ventas.

Una venta normal:

```text
Sale
customer = Cliente
employeeBuyer = NULL
```

Una venta de empleado:

```text
Sale
customer = NULL / Customer
employeeBuyer = Employee
saleType = EMPLOYEE
```

De esta forma, el sistema mantiene una única entidad de venta.

---

# 4. IDENTIFICACIÓN

Toda venta de empleado debe identificar:

```text
employeeId
```

No se debe permitir que una venta de empleado quede asociada únicamente a un nombre escrito manualmente.

Debe utilizarse el registro oficial del empleado.

---

# 5. TIPOS DE VENTA

La venta puede tener:

```text
REGULAR
EMPLOYEE
```

El valor debe ser auditable.

Ejemplo:

```text
Sale
──────────────
Número: V-000154
Tipo: EMPLOYEE
Empleado: EMP-0021
Sucursal: Centro
```

---

# 6. PRECIO DE EMPLEADO

La empresa puede definir una política específica.

Ejemplos:

```text
Precio normal:
$100.000

Precio empleado:
$80.000
```

O:

```text
Descuento empleado:
20%
```

La política debe ser configurable.

---

# 7. NO SOBRESCRIBIR EL PRECIO NORMAL

La venta debe conservar:

```text
regularUnitPrice
employeeUnitPrice
appliedUnitPrice
discount
```

Ejemplo:

```text
Precio lista:
$100.000

Precio empleado:
$80.000

Precio aplicado:
$80.000
```

Esto permite conocer posteriormente cuál fue el beneficio otorgado.

---

# 8. POLÍTICA DE DESCUENTO

Puede existir una configuración global:

```text
EmployeeDiscountPolicy
```

Ejemplo:

```text
Tipo:
PERCENTAGE

Valor:
20%

Activo:
YES
```

También puede configurarse:

```text
Precio especial por producto
Precio especial por categoría
Porcentaje máximo
Límite mensual
Cantidad máxima de unidades
```

---

# 9. RESTRICCIONES

La empresa puede establecer:

* Máximo de descuento.
* Máximo de compras mensuales.
* Máximo de importe pendiente.
* Productos excluidos.
* Promociones no combinables.
* Antigüedad mínima.
* Estado activo obligatorio.

Estas reglas deben ser configurables y no codificadas directamente en el frontend.

---

# 10. EMPLEADO ACTIVO

Por defecto:

> Solo empleados `ACTIVE` pueden acceder al beneficio de empleado.

Si un empleado está:

```text
INACTIVE
SUSPENDED
TERMINATED
```

el sistema debe bloquear la compra con precio especial, salvo autorización explícita.

---

# 11. FLUJO DE VENTA

```text
Seleccionar venta de empleado
        ↓
Seleccionar empleado
        ↓
Validar empleado
        ↓
Agregar productos
        ↓
Calcular precio empleado
        ↓
Aplicar descuentos permitidos
        ↓
Confirmar total
        ↓
Elegir modalidad de pago
        ↓
Finalizar venta
        ↓
Registrar salida de stock
        ↓
Registrar pago/monto pendiente
        ↓
Auditoría
```

---

# 12. POS

La venta debe poder iniciarse desde el POS.

El vendedor selecciona:

```text
Nueva venta
```

y luego:

```text
Tipo:
Venta normal
Venta de empleado
```

Si selecciona:

```text
VENTA DE EMPLEADO
```

debe seleccionar un empleado registrado.

---

# 13. PERMISOS DEL VENDEDOR

El vendedor puede:

* Crear venta de empleado.
* Seleccionar empleado.
* Agregar productos.
* Ver precio permitido.
* Enviar la venta a caja.

Pero no necesariamente puede:

* Modificar manualmente el precio.
* Superar el descuento máximo.
* Autorizar compra a cuenta.
* Aprobar excepciones.

---

# 14. CAJA

Se mantiene la separación:

```text
POS ≠ CAJA
```

El vendedor crea:

```text
PENDING_PAYMENT
```

El cajero finaliza el pago.

Ejemplo:

```text
Vendedor
   ↓
Venta empleado
   ↓
PENDING_PAYMENT
   ↓
Cajero
   ↓
Pago
   ↓
PAID
```

---

# 15. PAGO INMEDIATO

Ejemplo:

```text
Producto:
Remera

Precio normal:
$50.000

Precio empleado:
$40.000
```

El empleado paga:

```text
$40.000
```

El sistema registra:

```text
Sale = $40.000

Payment = $40.000

FinancialMovement = IN $40.000

StockMovement = SALE
```

---

# 16. PAGO EN EFECTIVO

Si paga en efectivo:

```text
Payment
method = EFECTIVO
```

y:

```text
FinancialAccount
= CAJA-CENTRO
```

La caja recibe el dinero.

---

# 17. PAGO POR TRANSFERENCIA

Ejemplo:

```text
Método:
TRANSFERENCIA

Cuenta:
BANCO GALICIA

Referencia:
TRF-849392
```

Debe registrarse:

```text
FinancialMovement
direction = IN
type = SALE
account = BANCO GALICIA
```

---

# 18. COMPRA A CUENTA

La empresa puede permitir que determinadas compras se paguen posteriormente mediante descuento de sueldo.

Ejemplo:

```text
Compra:
$80.000

Pago inmediato:
$0

Saldo pendiente:
$80.000
```

La operación no debe registrarse como dinero recibido.

---

# 19. EMPLOYEE PURCHASE

Debe existir:

```text
EmployeePurchase
```

relacionada con:

```text
Sale
Employee
Payroll
```

Conceptualmente:

```text
Sale
 ↓
EmployeePurchase
 ↓
Payroll
```

---

# 20. ESTADOS DE EMPLOYEE PURCHASE

```text
PENDING
APPROVED
PARTIALLY_SETTLED
SETTLED
CANCELLED
```

### PENDING

Compra registrada pero todavía no autorizada para descuento.

### APPROVED

Compra autorizada.

### PARTIALLY_SETTLED

Parte del importe fue descontado/pagado.

### SETTLED

Importe completamente cancelado.

### CANCELLED

Cancelada mediante operación autorizada.

---

# 21. COMPRA A DESCONTAR DEL SUELDO

Ejemplo:

```text
Venta:
$100.000

Forma:
DESCUENTO_SUELDO
```

Se crea:

```text
EmployeePurchase
amount = 100000
outstanding = 100000
```

No se crea un ingreso financiero todavía.

---

# 22. DESCUENTO EN LIQUIDACIÓN

Cuando se genera la liquidación:

```text
Salario:
$700.000

Compra empleado:
-$100.000

Neto:
$600.000
```

El sistema relaciona:

```text
EmployeePurchase
      ↓
Payroll
      ↓
PayrollDiscount
```

---

# 23. MOMENTO DEL INGRESO FINANCIERO

Este punto es crítico.

Una compra a cuenta:

```text
NO genera ingreso financiero al momento de crear la deuda.
```

El dinero entra cuando:

* El empleado paga.
* Se descuenta del sueldo y se registra financieramente como parte de la liquidación/pago correspondiente.

Esto evita inflar artificialmente la tesorería.

---

# 24. STOCK

La venta de empleado genera salida de stock igual que una venta normal.

```text
Sale
 ↓
StockMovement
type = SALE
```

El stock no debe tener una lógica especial solamente porque el comprador sea empleado.

---

# 25. DISPONIBILIDAD

Antes de confirmar la venta:

```text
availableStock >= requestedQuantity
```

Debe cumplirse.

El descuento de empleado no permite vender stock inexistente.

---

# 26. PRECIOS

La venta debe conservar el precio utilizado en el momento de la operación.

Si mañana cambia el precio empleado:

```text
Venta anterior:
$80.000
```

debe continuar mostrando:

```text
$80.000
```

No debe recalcularse históricamente.

---

# 27. DESCUENTO MANUAL

Si el vendedor intenta modificar:

```text
$80.000
```

a:

```text
$60.000
```

el sistema debe validar permisos.

Posibles resultados:

```text
Permitido
```

o:

```text
Requiere autorización
```

o:

```text
Bloqueado
```

---

# 28. AUTORIZACIÓN DE EXCEPCIONES

Una excepción puede requerir:

```text
requestedBy
approvedBy
reason
previousPrice
newPrice
difference
timestamp
```

Ejemplo:

```text
Precio empleado:
$80.000

Precio solicitado:
$65.000

Motivo:
Producto con defecto estético menor

Autorizó:
BRANCH_MANAGER
```

---

# 29. LÍMITE DE DEUDA

Si la empresa permite compras a cuenta, debe existir un límite.

Ejemplo:

```text
Límite empleado:
$300.000

Deuda actual:
$250.000

Nueva compra:
$100.000
```

Resultado:

```text
$350.000 > $300.000
```

La operación debe bloquearse o requerir autorización.

---

# 30. SALDO DEL EMPLEADO

El sistema puede mostrar:

```text
Compras pendientes:
$250.000

Límite:
$300.000

Disponible:
$50.000
```

Este saldo debe derivarse de operaciones registradas.

No debe depender de un campo editable manualmente.

---

# 31. PAGOS PARCIALES

Ejemplo:

```text
Compra:
$100.000
```

Pago:

```text
$40.000
```

Saldo:

```text
$60.000
```

Estado:

```text
PARTIALLY_SETTLED
```

Posteriormente:

```text
$60.000
```

Estado:

```text
SETTLED
```

---

# 32. COMBINACIÓN DE PAGO

También puede ocurrir:

```text
Compra:
$100.000

Efectivo:
$30.000

Descuento sueldo:
$70.000
```

La suma debe coincidir:

```text
30.000 + 70.000 = 100.000
```

El sistema debe conservar ambos componentes.

---

# 33. CAMBIOS Y DEVOLUCIONES

Las ventas de empleados utilizan el mismo módulo:

```text
16_CAMBIOS_Y_DEVOLUCIONES.md
```

No debe existir una lógica independiente para devolver productos de empleados.

Debe conservarse:

```text
originalSaleId
employeeId
```

cuando corresponda.

---

# 34. DEVOLUCIÓN DE COMPRA A CUENTA

Ejemplo:

```text
Compra:
$100.000

Descontado:
$60.000

Pendiente:
$40.000
```

El empleado devuelve el producto.

El sistema debe:

1. Registrar devolución.
2. Reingresar stock según condición.
3. Ajustar saldo pendiente.
4. Ajustar descuentos futuros.
5. Mantener trazabilidad.

No debe eliminar la compra original.

---

# 35. VENTA DE EMPLEADO Y PROMOCIONES

La empresa debe definir si los descuentos son acumulables.

Ejemplo:

```text
Precio normal:
$100.000

Promoción:
20%

Precio promoción:
$80.000

Beneficio empleado:
20%
```

El sistema debe tener una política explícita:

```text
NO_COMBINABLE
```

o:

```text
COMBINABLE
```

Nunca debe asumir automáticamente acumulación.

---

# 36. CONTABILIDAD DE LA DIFERENCIA

Debe conservarse:

```text
regularPrice
employeeDiscount
finalPrice
```

Ejemplo:

```text
Precio normal:
$100.000

Beneficio:
$20.000

Precio empleado:
$80.000
```

Esto permite medir cuánto beneficio comercial recibió el personal.

---

# 37. REPORTES

### Ventas

* Ventas a empleados.
* Unidades vendidas.
* Importe total.
* Descuento otorgado.

### Empleados

* Compras por empleado.
* Deuda pendiente.
* Compras del período.
* Compras acumuladas.

### Sucursales

* Ventas de empleados por sucursal.
* Productos más comprados.

### Finanzas

* Pagos inmediatos.
* Compras a cuenta.
* Cobros posteriores.
* Descuentos aplicados a sueldo.

---

# 38. REPORTE DE BENEFICIO

Debe poder calcular:

```text
Precio normal acumulado:
$5.000.000

Precio empleado acumulado:
$4.000.000

Beneficio otorgado:
$1.000.000
```

Esto permite conocer cuánto representa el beneficio interno para la empresa.

---

# 39. DASHBOARD

Ejemplo:

```text
VENTAS EMPLEADOS — AGOSTO

Compras:
42

Importe:
$2.800.000

Pagado:
$1.900.000

Pendiente:
$900.000

Beneficio otorgado:
$700.000
```

---

# 40. RIESGOS DE FRAUDE

El sistema debe controlar:

* Compras excesivas.
* Descuentos superiores al permitido.
* Compras a cuenta repetidas.
* Uso de empleado inexistente.
* Uso de empleado inactivo.
* Autorizaciones fuera de política.
* Anulación de ventas.
* Devoluciones sospechosas.
* Operaciones realizadas por el propio empleado.

---

# 41. SEGREGACIÓN DE FUNCIONES

Un empleado no debería poder:

```text
Crear compra para sí mismo
+
Autorizar descuento
+
Cobrar
+
Anular
```

sin controles.

Las operaciones sensibles deben respetar RBAC.

---

# 42. COMPRA DEL PROPIO CAJERO

Caso especial:

```text
Empleado:
Cajero

Compra:
$80.000
```

El cajero no debería poder ser el único responsable de:

* Registrar.
* Cobrar.
* Autorizar.
* Anular.

La operación puede requerir intervención de otro usuario autorizado.

---

# 43. AUDITORÍA

Registrar:

```text
Quién realizó la operación
Empleado comprador
Sucursal
POS
Caja
Productos
Precio normal
Precio empleado
Descuento
Forma de pago
Autorizaciones
Fecha
Motivo de excepción
```

---

# 44. CANCELACIÓN

Una venta finalizada no debe eliminarse.

Debe utilizar:

```text
16_CAMBIOS_Y_DEVOLUCIONES.md
```

o un procedimiento de cancelación autorizado según el estado.

Los movimientos financieros y de stock deben corregirse mediante operaciones compensatorias.

---

# 45. CONCURRENCIA

En producción:

* Dos operaciones no deben superar simultáneamente el límite de deuda.
* El saldo pendiente debe actualizarse transaccionalmente.
* Una venta no debe procesarse dos veces.
* Un descuento salarial no debe aplicarse dos veces.
* Una devolución no debe duplicarse.

Debe utilizarse:

```text
DB transaction
Idempotency key
Unique constraints
Row-level locking
```

cuando corresponda.

---

# 46. MODELO CONCEPTUAL

```text
Employee
   │
   ├── EmployeePurchase
   │       │
   │       └── Sale
   │              ├── SaleItem
   │              ├── Payment
   │              └── StockMovement
   │
   └── Payroll
          │
          └── PayrollDiscount
```

Para pago inmediato:

```text
Sale
 ↓
Payment
 ↓
FinancialMovement
```

Para descuento salarial:

```text
Sale
 ↓
EmployeePurchase
 ↓
Payroll
 ↓
PayrollDiscount
 ↓
Settlement
```

---

# 47. FLUJO DEMO 1 — PAGO INMEDIATO

Empleado:

```text
María González
```

Producto:

```text
Campera
```

Precio normal:

```text
$150.000
```

Precio empleado:

```text
$120.000
```

Pago:

```text
Transferencia
```

Cuenta:

```text
Banco Galicia
```

Resultado:

```text
Sale:
$120.000

Stock:
-1

FinancialMovement:
IN $120.000

Employee:
EMP-0001
```

---

# 48. FLUJO DEMO 2 — DESCUENTO DE SUELDO

Empleado:

```text
Juan Pérez
```

Compra:

```text
$100.000
```

Forma:

```text
Descuento de sueldo
```

Resultado:

```text
Stock:
-1

EmployeePurchase:
$100.000 pendiente

FinancialMovement:
NO ingreso todavía
```

Liquidación:

```text
Sueldo:
$700.000

Descuento:
$100.000

Neto:
$600.000
```

---

# 49. FLUJO DEMO 3 — PAGO MIXTO

Compra:

```text
$200.000
```

Pago:

```text
Efectivo:
$50.000

Descuento sueldo:
$150.000
```

Resultado:

```text
FinancialMovement:
IN $50.000

EmployeePurchase pendiente:
$150.000
```

---

# 50. FLUJO DEMO 4 — EXCEPCIÓN

Precio empleado:

```text
$100.000
```

Usuario solicita:

```text
$80.000
```

Sistema:

```text
REQUIERE AUTORIZACIÓN
```

Encargado:

```text
Aprueba
```

Se registra:

```text
Precio original:
$100.000

Precio autorizado:
$80.000

Motivo:
Promoción interna extraordinaria
```

---

# 51. INTEGRACIONES

Este módulo debe integrarse con:

```text
03_SUCURSALES_Y_POS.md
04_PRODUCTOS_Y_VARIANTES.md
05_INVENTARIO_Y_STOCK.md
09_VENTAS_Y_POS.md
10_CAJAS_Y_ARQUEOS.md
11_TESORERIA_Y_CAJA_MAYOR.md
12_CUENTAS_FINANCIERAS.md
13_PAGOS_Y_MOVIMIENTOS_DINERO.md
16_CAMBIOS_Y_DEVOLUCIONES.md
17_EMPLEADOS_Y_SUELDOS.md
21_AUDITORIA_Y_TRAZABILIDAD.md
22_REGLAS_DE_NEGOCIO.md
23_ESTADOS_Y_TRANSICIONES.md
24_MODELO_DE_DATOS.md
```

---

# 52. DEMO VS PRODUCCIÓN

## DEMO

Debe incluir:

* Selección de empleado.
* Venta desde POS.
* Precio especial.
* Descuento.
* Pago inmediato.
* Compra a cuenta.
* Descuento simulado en sueldo.
* Saldo pendiente.
* Historial.
* Dashboard.
* Auditoría simulada.

## PRODUCCIÓN

Debe incluir además:

* PostgreSQL.
* Transacciones.
* RBAC.
* Límites configurables.
* Auditoría completa.
* Integración financiera real.
* Integración completa con Payroll.
* Controles antifraude.
* Idempotencia.
* Reconciliación.

---

# 53. CRITERIOS DE ACEPTACIÓN

* [ ] Se puede identificar una venta como venta de empleado.
* [ ] Se puede seleccionar un empleado existente.
* [ ] No se puede utilizar un empleado inexistente.
* [ ] Empleados inactivos son bloqueados por defecto.
* [ ] Se calcula correctamente el precio empleado.
* [ ] Se conserva el precio normal histórico.
* [ ] Se registra el descuento otorgado.
* [ ] Se puede pagar inmediatamente.
* [ ] Se puede registrar compra a cuenta.
* [ ] Se puede descontar posteriormente del sueldo.
* [ ] Se soportan pagos parciales.
* [ ] Se soportan pagos mixtos.
* [ ] Se respeta el límite de deuda.
* [ ] Las ventas generan movimientos de stock.
* [ ] Los pagos generan movimientos financieros.
* [ ] Las compras a cuenta no generan ingreso financiero prematuro.
* [ ] Las devoluciones ajustan correctamente el saldo.
* [ ] Las excepciones requieren autorización.
* [ ] Toda operación queda auditada.
* [ ] No se elimina historial.
* [ ] Se pueden consultar reportes.

---

# 54. PRINCIPIO FINAL

El sistema debe mantener esta separación:

```text
VENTA
   ↓
PRODUCTO + PRECIO
   ↓
STOCK
   ↓
PAGO
   ↓
DINERO
```

Cuando se trata de un empleado:

```text
VENTA
   ↓
EMPLOYEE
   ↓
BENEFICIO / PRECIO ESPECIAL
   ↓
      ┌───────────────┐
      │               │
 PAGO INMEDIATO   CUENTA EMPLEADO
      │               │
      ↓               ↓
 FINANZAS          PAYROLL
```

La compra de un empleado **no es un descuento de sueldo disfrazado**, y el descuento de sueldo **no es un pago ficticio**.

Cada etapa debe existir como operación independiente, relacionada y auditable.
