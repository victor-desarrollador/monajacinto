# 11 — TESORERÍA Y CAJA MAYOR

**Archivo:** `11_TESORERIA_Y_CAJA_MAYOR.md`
**Sistema:** Sistema de Gestión Multisucursal
**Módulo:** Tesorería y Caja Mayor
**Estado:** Especificación funcional
**Versión:** 1.0

---

## 1. PROPÓSITO

El módulo de **Tesorería y Caja Mayor** centraliza y controla el dinero de toda la empresa.

Mientras que:

* **POS** registra la operación comercial.
* **Caja de sucursal** administra el dinero físico de una sucursal.
* **Cuentas financieras** representan dónde está depositado o almacenado el dinero.
* **Tesorería** consolida, controla, concilia y administra el flujo financiero global.

Tesorería debe permitir responder en todo momento:

> **¿Cuánto dinero tiene la empresa, dónde está, de dónde vino, hacia dónde fue y quién realizó cada movimiento?**

El sistema debe evitar que Tesorería sea simplemente una pantalla de totales.

Debe existir una **trazabilidad financiera completa**.

---

# 2. PRINCIPIO FUNDAMENTAL

El dinero no debe existir solamente como un número acumulado.

Cada saldo debe poder explicarse mediante movimientos.

Principio:

> **El saldo es consecuencia de movimientos financieros registrados y auditables.**

No se debe permitir editar directamente:

```text
Saldo Banco Galicia = $1.500.000
```

El saldo debe surgir de:

```text
Saldo inicial
+ ingresos
+ transferencias recibidas
+ cobranzas
- pagos
- retiros
- transferencias enviadas
- ajustes
= saldo actual
```

Las correcciones deben realizarse mediante nuevos movimientos compensatorios.

---

# 3. ALCANCE

Tesorería administra:

* Caja Mayor.
* Cajas de sucursales.
* Bancos.
* Mercado Pago.
* Otras billeteras virtuales.
* Cuentas financieras.
* Transferencias internas.
* Retiros de efectivo.
* Depósitos.
* Gastos.
* Pagos a proveedores.
* Pagos de sueldos.
* Pagos a empleados.
* Cobros.
* Devoluciones.
* Cheques.
* Diferencias de caja.
* Conciliaciones.
* Rendiciones de sucursales.
* Movimientos entre cuentas.
* Flujo financiero global.
* Reportes financieros.
* Exportaciones.

---

# 4. TESORERÍA VS CAJA DE SUCURSAL

Son conceptos diferentes.

## 4.1 Caja de sucursal

Representa el dinero operativo de una sucursal.

Ejemplo:

```text
Sucursal Centro
└── Caja #1
    ├── Fondo inicial
    ├── Ventas en efectivo
    ├── Ingresos
    ├── Egresos
    ├── Retiros
    └── Arqueo
```

El cajero es responsable de esa caja durante su sesión.

---

## 4.2 Tesorería

Representa el control financiero global.

Ejemplo:

```text
TESORERÍA

Caja Mayor
├── Banco Galicia
├── Banco Macro
├── Mercado Pago
├── Caja Mayor
├── Caja Sucursal Centro
├── Caja Sucursal Norte
└── Caja Sucursal Sur
```

Tesorería debe poder visualizar el conjunto.

---

# 5. CAJA MAYOR

La Caja Mayor representa el fondo central de efectivo de la empresa.

Puede utilizarse para:

* Recibir dinero de sucursales.
* Entregar dinero a sucursales.
* Pagar proveedores.
* Pagar gastos.
* Entregar anticipos.
* Administrar efectivo central.
* Registrar depósitos bancarios.
* Registrar retiros bancarios.
* Registrar movimientos internos.

La Caja Mayor debe tener trazabilidad independiente de las cajas de sucursales.

---

# 6. CUENTAS FINANCIERAS

Tesorería trabaja sobre entidades financieras configurables.

Ejemplos:

```text
CAJA MAYOR
BANCO GALICIA
BANCO MACRO
MERCADO PAGO
BANCO NACIÓN
OTRA CUENTA
```

Una cuenta financiera debe tener como mínimo:

```text
FinancialAccount

id
name
type
institution
currency
initialBalance
currentBalance
branchId
active
createdAt
updatedAt
```

Tipos:

```text
CASH
BANK
DIGITAL_WALLET
OTHER
```

---

# 7. CUENTA FINANCIERA VS MÉTODO DE PAGO

No deben confundirse.

## Método de pago

Indica **cómo paga el cliente**.

Ejemplos:

```text
EFECTIVO
TRANSFERENCIA
QR
DÉBITO
CRÉDITO
CHEQUE
OTRO
```

## Cuenta financiera

Indica **dónde termina el dinero**.

Ejemplo:

```text
Método:
TRANSFERENCIA

Cuenta:
BANCO GALICIA
```

Otro ejemplo:

```text
Método:
QR

Cuenta:
MERCADO PAGO
```

Esto permite conocer no solamente cuánto se vendió, sino dónde está el dinero.

---

# 8. MOVIMIENTO FINANCIERO UNIFICADO

El sistema debe utilizar una entidad central para representar movimientos monetarios.

Entidad conceptual:

```text
FinancialMovement
```

Campos principales:

```text
id

type
direction

amount

paymentMethod

sourceAccountId
destinationAccountId

branchId
cashRegisterId

supplierId
employeeId

referenceType
referenceId

status

createdBy
approvedBy

createdAt
approvedAt

notes
```

---

# 9. TIPOS DE MOVIMIENTO

El sistema debe soportar como mínimo:

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

Podrán agregarse nuevos tipos posteriormente.

---

# 10. DIRECCIÓN DEL MOVIMIENTO

Todo movimiento financiero debe tener dirección.

```text
IN
OUT
TRANSFER
```

Ejemplo:

### Venta

```text
IN
+$50.000
```

### Pago a proveedor

```text
OUT
-$300.000
```

### Transferencia interna

```text
Banco Galicia
      ↓
Caja Mayor
```

No debe contabilizarse como ingreso global.

Es simplemente un cambio de ubicación del dinero.

---

# 11. TRANSFERENCIAS INTERNAS

Una transferencia interna mueve dinero entre cuentas propias.

Ejemplo:

```text
Banco Galicia
    ↓
Caja Mayor
```

O:

```text
Caja Mayor
    ↓
Sucursal Centro
```

La transferencia debe registrar:

```text
Cuenta origen
Cuenta destino
Importe
Fecha
Usuario
Motivo
Referencia
Estado
```

Estados:

```text
PENDING
APPROVED
COMPLETED
CANCELLED
```

Una transferencia completada no debe eliminarse.

Si existe un error, se genera una transferencia inversa o movimiento compensatorio.

---

# 12. RENDICIÓN DE SUCURSALES

Una sucursal puede enviar dinero a Caja Mayor.

Ejemplo:

```text
Sucursal Centro

Efectivo disponible:
$800.000

Retiro:
$500.000

Destino:
Caja Mayor
```

La operación debe generar:

```text
Salida:
Caja Sucursal Centro
-$500.000

Entrada:
Caja Mayor
+$500.000
```

Debe existir una relación entre ambos movimientos.

---

# 13. RENDICIÓN NO ES ARQUEO

Son operaciones diferentes.

### Arqueo

Determina:

> ¿Cuánto dinero debería haber y cuánto dinero existe físicamente?

### Rendición

Determina:

> ¿Cuánto dinero se entrega a Tesorería/Caja Mayor?

Ejemplo:

```text
Arqueo:

Esperado: $800.000
Contado:  $790.000
Diferencia: -$10.000
```

Luego:

```text
Rendición:
$700.000
```

Los $90.000 restantes permanecen en la sucursal.

---

# 14. RETIROS DE EFECTIVO

Un retiro debe registrar:

```text
Origen
Destino
Importe
Motivo
Usuario
Fecha
Aprobador
Referencia
```

Motivos posibles:

```text
RENDICION
DEPOSITO_BANCARIO
GASTO
PAGO_PROVEEDOR
RETIRO_ADMINISTRATIVO
OTRO
```

No se debe permitir:

```text
Retiro
$500.000
```

sin indicar destino y motivo.

---

# 15. DEPÓSITOS BANCARIOS

Cuando efectivo de Caja Mayor se deposita en un banco:

```text
Caja Mayor
-$300.000

Banco Galicia
+$300.000
```

Debe registrarse:

```text
Fecha
Importe
Banco
Cuenta
Usuario
Comprobante
Referencia
Notas
```

El depósito no constituye una venta ni un nuevo ingreso económico.

Es una transferencia de ubicación del dinero.

---

# 16. GASTOS

Tesorería debe registrar gastos empresariales.

Ejemplos:

```text
ALQUILER
SERVICIOS
INTERNET
TRANSPORTE
PUBLICIDAD
INSUMOS
MANTENIMIENTO
OTROS
```

Cada gasto debe registrar:

```text
Categoría
Importe
Cuenta origen
Proveedor
Fecha
Usuario
Comprobante
Descripción
```

Opcionalmente:

```text
Sucursal
Centro de costo
Proyecto
```

---

# 17. PAGOS A PROVEEDORES

El pago a proveedor debe estar relacionado con la deuda correspondiente.

No debe confundirse:

```text
Compra
Recepción
Factura
Pago
```

Son operaciones distintas.

Ejemplo:

```text
Compra:
$1.000.000

Recepción:
$1.000.000

Factura:
$1.000.000

Pago:
$600.000
```

Resultado:

```text
Pendiente:
$400.000
```

El sistema debe permitir pagos:

* Totales.
* Parciales.
* Múltiples pagos.
* Desde diferentes cuentas financieras.

---

# 18. SUELDOS

Tesorería debe registrar pagos de empleados.

Ejemplo:

```text
Empleado:
Juan Pérez

Concepto:
Sueldo agosto

Importe:
$700.000

Cuenta:
Banco Galicia
```

El movimiento debe quedar relacionado con:

```text
Employee
FinancialAccount
FinancialMovement
```

El detalle laboral completo pertenece al módulo de empleados y sueldos.

Tesorería registra el movimiento monetario.

---

# 19. COMPRAS DE EMPLEADOS

Si el sistema permite ventas a empleados o compras internas de empleados, el movimiento financiero debe quedar relacionado con el empleado.

Ejemplo:

```text
Empleado:
Juan Pérez

Compra:
$50.000

Forma:
Descuento / efectivo / transferencia
```

Debe existir trazabilidad.

---

# 20. CHEQUES

Los cheques deben tratarse como instrumentos financieros independientes del efectivo.

Información mínima:

```text
id
number
bank
issuer
amount
issueDate
dueDate
status
receivedFrom
saleId
supplierPaymentId
financialAccountId
notes
```

Estados:

```text
RECIBIDO
EN_CARTERA
DEPOSITADO
COBRADO
RECHAZADO
ENTREGADO
ANULADO
```

Un cheque recibido no debe contabilizarse automáticamente como efectivo disponible.

Debe existir una cuenta o categoría específica para valores en cartera.

---

# 21. DEVOLUCIONES

Una devolución puede producir:

```text
EFECTIVO
TRANSFERENCIA
CRÉDITO
CAMBIO
```

Si se devuelve efectivo:

```text
Caja
-$50.000
```

Si se devuelve mediante transferencia:

```text
Cuenta financiera
-$50.000
```

La devolución debe estar vinculada a la operación comercial original.

No se debe crear una venta negativa independiente sin relación con la venta original.

---

# 22. DIFERENCIAS DE CAJA

Las diferencias detectadas durante el arqueo deben conservarse.

Ejemplo:

```text
Esperado:
$500.000

Contado:
$490.000

Diferencia:
-$10.000
```

El sistema debe registrar:

```text
SHORTAGE
```

Si:

```text
Contado:
$510.000
```

Entonces:

```text
SURPLUS
+$10.000
```

La diferencia debe incluir:

```text
importe
tipo
sesión
cajero
fecha
motivo
observación
aprobador
```

Nunca debe modificarse silenciosamente el saldo para ocultar la diferencia.

---

# 23. CONCILIACIÓN

Tesorería debe permitir comparar:

```text
Saldo sistema
vs
Saldo real
```

Para cuentas bancarias:

```text
Saldo sistema:
$2.500.000

Saldo banco:
$2.480.000

Diferencia:
-$20.000
```

La diferencia debe poder investigarse.

Posibles causas:

```text
Movimiento pendiente
Comisión bancaria
Error de carga
Transferencia pendiente
Movimiento bancario no registrado
Movimiento duplicado
Otro
```

---

# 24. CONCILIACIÓN DE MERCADO PAGO Y OTRAS BILLETERAS

El sistema debe permitir comparar:

```text
Saldo registrado internamente
vs
Saldo real de la plataforma
```

También pueden existir diferencias por:

* Comisiones.
* Retenciones.
* Contracargos.
* Devoluciones.
* Movimientos pendientes.

Estos conceptos deberán registrarse como movimientos financieros específicos cuando corresponda.

---

# 25. DASHBOARD DE TESORERÍA

El dashboard principal debe responder rápidamente:

### Dinero disponible

```text
TOTAL EMPRESA
$ XX.XXX.XXX
```

### Distribución

```text
Caja Mayor       $X
Banco Galicia    $X
Banco Macro      $X
Mercado Pago     $X
Sucursal Centro  $X
Sucursal Norte   $X
Sucursal Sur     $X
```

### Movimientos del día

```text
Ingresos
Egresos
Transferencias
Retiros
Pagos
```

### Alertas

```text
⚠ Diferencia de caja
⚠ Pago pendiente
⚠ Cuenta sin conciliar
⚠ Cheque próximo a vencer
⚠ Transferencia pendiente
```

---

# 26. VISIÓN "¿DÓNDE ESTÁ EL DINERO?"

Debe existir una vista específica:

```text
¿DÓNDE ESTÁ EL DINERO?

Efectivo
├── Caja Mayor
├── Sucursal Centro
├── Sucursal Norte
└── Sucursal Sur

Bancos
├── Galicia
├── Macro
└── Otros

Billeteras
└── Mercado Pago

Valores
└── Cheques en cartera
```

El administrador debe poder conocer:

```text
Disponible inmediato
+
Efectivo
+
Bancos
+
Billeteras
```

Y distinguirlo de:

```text
Cheques pendientes
Cuentas por cobrar
Dinero en tránsito
```

No todo activo financiero debe tratarse como efectivo disponible.

---

# 27. SALDO DISPONIBLE

El sistema debe diferenciar conceptos.

### Saldo contable

Dinero registrado por el sistema.

### Saldo conciliado

Dinero confirmado contra la fuente externa.

### Saldo disponible

Dinero utilizable según las reglas del sistema.

### Dinero en tránsito

Dinero enviado pero todavía no confirmado.

### Valores

Cheques u otros instrumentos que todavía no constituyen efectivo disponible.

Esto evita presentar un único número engañoso.

---

# 28. FLUJO DE DINERO

Tesorería debe permitir visualizar el flujo:

```text
CLIENTE
   ↓
VENTA
   ↓
MEDIO DE PAGO
   ↓
CUENTA FINANCIERA
   ↓
TESORERÍA
   ↓
PAGO / TRANSFERENCIA / GASTO
```

Ejemplo:

```text
Cliente paga $100.000
        ↓
Transferencia
        ↓
Banco Galicia
        ↓
Tesorería
        ↓
Pago proveedor $60.000
        ↓
Banco Galicia
```

La operación debe poder rastrearse de principio a fin.

---

# 29. PERMISOS

## CAJERO

Puede:

* Operar su caja.
* Registrar movimientos autorizados.
* Realizar arqueo.
* Consultar su sesión.

No puede:

* Administrar Tesorería global.
* Modificar cuentas financieras.
* Eliminar movimientos.
* Aprobar movimientos de alto impacto.

---

## ADMINISTRADOR DE SUCURSAL

Puede:

* Consultar caja.
* Solicitar retiros.
* Solicitar transferencias.
* Consultar movimientos de su sucursal.
* Revisar diferencias.

---

## TESORERO

Puede:

* Ver todas las cuentas.
* Registrar movimientos financieros.
* Aprobar operaciones.
* Registrar pagos.
* Gestionar Caja Mayor.
* Gestionar transferencias.
* Conciliar cuentas.
* Gestionar valores.

---

## SUPER ADMIN

Puede:

* Ver toda la empresa.
* Configurar cuentas.
* Configurar categorías.
* Autorizar operaciones críticas.
* Consultar auditoría completa.
* Acceder a todos los reportes.

Los permisos deben implementarse mediante RBAC.

---

# 30. APROBACIONES

Determinadas operaciones pueden requerir aprobación.

Ejemplo:

```text
Retiro < $100.000
→ automático

Retiro >= $100.000
→ aprobación administrador

Retiro >= $1.000.000
→ aprobación superior
```

Los valores anteriores son solamente configurables.

No deben convertirse en reglas rígidas del sistema sin decisión del negocio.

Debe existir:

```text
ApprovalPolicy
```

para configurar:

* operación.
* monto mínimo.
* rol requerido.
* sucursal.
* cuenta.
* estado.

---

# 31. AUDITORÍA

Toda operación financiera debe registrar:

```text
Quién
Qué
Cuándo
Desde dónde
Por qué
Importe
Cuenta origen
Cuenta destino
Referencia
Aprobador
```

Eventos auditables:

```text
CREATE_MOVEMENT
APPROVE_MOVEMENT
REJECT_MOVEMENT
CANCEL_MOVEMENT
TRANSFER
WITHDRAWAL
DEPOSIT
SUPPLIER_PAYMENT
EXPENSE
REFUND
RECONCILIATION
ADJUSTMENT
```

No se deben eliminar movimientos financieros históricos.

---

# 32. ESTADOS DE MOVIMIENTO

Como mínimo:

```text
PENDING
APPROVED
COMPLETED
REJECTED
CANCELLED
```

Una operación monetaria solamente debe afectar el saldo definitivo cuando corresponda según su estado.

Las reglas exactas de contabilización deberán quedar centralizadas en:

```text
23_ESTADOS_Y_TRANSICIONES.md
```

---

# 33. IDEMPOTENCIA Y DUPLICADOS

Una operación financiera no debe ejecutarse dos veces por:

* doble click.
* refresh.
* timeout.
* reintento de API.
* webhook duplicado.
* error de conexión.

Las operaciones críticas deben utilizar mecanismos de idempotencia.

Ejemplo:

```text
idempotencyKey
```

Una misma clave no puede generar dos movimientos monetarios.

---

# 34. INTEGRACIÓN CON VENTAS

Cuando una venta es finalizada:

```text
Venta
   ↓
Payment
   ↓
FinancialMovement
```

Ejemplo:

```text
Venta:
$100.000

Efectivo:
$40.000

Transferencia:
$60.000
```

Resultado:

```text
Caja:
+$40.000

Banco/Mercado Pago:
+$60.000
```

No debe registrarse:

```text
Caja +$100.000
```

porque sería incorrecto.

---

# 35. INTEGRACIÓN CON CAJAS

Las cajas de sucursal generan movimientos financieros.

Ejemplo:

```text
Venta efectivo
      ↓
Caja sucursal
      ↓
Rendición
      ↓
Caja Mayor
```

La operación debe conservar las relaciones entre:

```text
Sale
Payment
CashRegisterSession
CashMovement
FinancialMovement
```

---

# 36. INTEGRACIÓN CON COMPRAS

Flujo:

```text
Proveedor
   ↓
PurchaseOrder
   ↓
PurchaseReceipt
   ↓
SupplierInvoice
   ↓
AccountsPayable
   ↓
SupplierPayment
   ↓
FinancialMovement
```

La recepción de mercadería no debe generar automáticamente un pago.

El pago ocurre cuando Tesorería ejecuta la operación.

---

# 37. INTEGRACIÓN CON EMPLEADOS

Ejemplo:

```text
Empleado
   ↓
Liquidación
   ↓
Pago
   ↓
FinancialMovement
```

El módulo de empleados administra el detalle correspondiente.

Tesorería registra el movimiento monetario.

---

# 38. REPORTES

Tesorería debe permitir reportes por:

* Fecha.
* Sucursal.
* Cuenta financiera.
* Tipo de movimiento.
* Método de pago.
* Usuario.
* Proveedor.
* Empleado.
* Estado.
* Categoría.
* Rango de importe.

Reportes mínimos:

### Movimientos financieros

Listado completo.

### Ingresos

Todo dinero recibido.

### Egresos

Todo dinero pagado.

### Transferencias

Movimientos entre cuentas.

### Retiros

Retiros de efectivo.

### Pagos a proveedores

Historial y pendientes.

### Gastos

Por categoría y período.

### Sueldos

Pagos realizados.

### Cheques

Cartera y estados.

### Diferencias de caja

Por sucursal/cajero/período.

### Conciliaciones

Estado de cuentas financieras.

---

# 39. EXPORTACIÓN

La exportación debe ser una funcionalidad de primera clase.

Formatos:

```text
XLSX
CSV
```

Filtros:

```text
Desde
Hasta
Sucursal
Caja
Cuenta financiera
Tipo
Método de pago
Usuario
Proveedor
Empleado
Estado
```

El archivo debe conservar:

```text
Fecha
Hora
Movimiento
Importe
Cuenta origen
Cuenta destino
Método
Sucursal
Usuario
Referencia
Estado
Observación
```

---

# 40. SEGURIDAD FINANCIERA

Las operaciones críticas deben utilizar transacciones de base de datos.

Ejemplo:

```text
Transferencia:

BEGIN

Crear salida
Crear entrada
Actualizar relación
Registrar auditoría

COMMIT
```

Nunca debe ocurrir:

```text
Cuenta origen -$100.000
Cuenta destino no recibió $100.000
```

Si una parte falla, la operación completa debe revertirse.

---

# 41. INTEGRIDAD DEL SALDO

No debe existir edición manual directa de:

```text
currentBalance
```

El saldo debe calcularse o actualizarse de forma controlada a partir del ledger financiero.

Si se requiere una corrección:

```text
ADJUSTMENT
```

con:

```text
motivo
usuario
aprobador
referencia
importe
```

---

# 42. OPERACIONES PROHIBIDAS

El sistema no debe permitir:

* Eliminar movimientos financieros históricos.
* Modificar silenciosamente importes.
* Crear transferencias sin origen.
* Crear transferencias sin destino.
* Registrar gastos sin motivo.
* Pagar más de lo adeudado sin regla explícita.
* Duplicar pagos.
* Contabilizar una transferencia interna como ingreso global.
* Ocultar diferencias de caja.
* Modificar saldos manualmente sin auditoría.
* Registrar movimientos sin usuario.
* Registrar movimientos sin fecha.
* Crear movimientos sin referencia cuando corresponda.

---

# 43. TRAZABILIDAD FINANCIERA

Cada movimiento debe poder rastrearse hasta su origen.

Ejemplo:

```text
FinancialMovement
      ↓
Payment
      ↓
Sale
      ↓
SaleItem
      ↓
ProductVariant
```

O:

```text
FinancialMovement
      ↓
SupplierPayment
      ↓
AccountsPayable
      ↓
SupplierInvoice
      ↓
PurchaseReceipt
      ↓
PurchaseOrder
```

O:

```text
FinancialMovement
      ↓
Transfer
      ↓
CashRegister
      ↓
Branch
```

---

# 44. DASHBOARD EJECUTIVO

El Super Admin debe disponer de una vista consolidada:

```text
TESORERÍA GLOBAL

Dinero total
$ XX.XXX.XXX

Disponible
$ XX.XXX.XXX

En tránsito
$ X.XXX.XXX

Cheques
$ X.XXX.XXX

Por cobrar
$ X.XXX.XXX

Por pagar
$ X.XXX.XXX
```

Además:

```text
Ingresos del período
Egresos del período
Flujo neto
Ventas
Pagos
Gastos
Retiros
Transferencias
```

---

# 45. ALERTAS

Tesorería debe poder generar alertas para:

```text
Saldo bajo
Diferencia de caja
Pago próximo a vencer
Cuenta sin conciliar
Cheque próximo a vencer
Transferencia pendiente
Movimiento rechazado
Movimiento duplicado
Cuenta con saldo negativo
```

Las reglas deben ser configurables.

---

# 46. DEMO

La demo debe mostrar al menos:

## Escenario 1 — Venta en efectivo

```text
Venta:
$100.000

Caja sucursal:
+$100.000
```

---

## Escenario 2 — Venta por transferencia

```text
Venta:
$100.000

Banco Galicia:
+$100.000
```

---

## Escenario 3 — Venta combinada

```text
Venta:
$200.000

Efectivo:
$80.000

Mercado Pago:
$120.000
```

---

## Escenario 4 — Rendición

```text
Sucursal:
-$500.000

Caja Mayor:
+$500.000
```

---

## Escenario 5 — Pago a proveedor

```text
Banco Galicia:
-$300.000

Proveedor:
Pago registrado
```

---

## Escenario 6 — Gasto

```text
Caja Mayor:
-$50.000

Categoría:
Mantenimiento
```

---

## Escenario 7 — Transferencia bancaria

```text
Banco Galicia:
-$1.000.000

Banco Macro:
+$1.000.000
```

---

## Escenario 8 — Diferencia de caja

```text
Esperado:
$500.000

Contado:
$490.000

Diferencia:
-$10.000
```

---

# 47. CRITERIOS DE ACEPTACIÓN

El módulo será considerado funcional cuando:

* [ ] Existan cuentas financieras configurables.
* [ ] Exista Caja Mayor.
* [ ] Se puedan registrar ingresos.
* [ ] Se puedan registrar egresos.
* [ ] Se puedan registrar transferencias.
* [ ] Se puedan registrar retiros.
* [ ] Se puedan registrar depósitos.
* [ ] Se puedan registrar gastos.
* [ ] Se puedan registrar pagos a proveedores.
* [ ] Se puedan registrar pagos a empleados.
* [ ] Se puedan registrar devoluciones.
* [ ] Se puedan registrar diferencias.
* [ ] Se puedan consultar movimientos.
* [ ] Se pueda visualizar el saldo por cuenta.
* [ ] Se pueda visualizar el dinero global.
* [ ] Se pueda identificar dónde está el dinero.
* [ ] Exista auditoría.
* [ ] No se puedan eliminar movimientos históricos.
* [ ] Se puedan exportar reportes.
* [ ] Existan permisos por rol.
* [ ] Las transferencias sean atómicas.
* [ ] Las operaciones críticas sean idempotentes.

---

# 48. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
Mock data
localStorage
datos simulados
operaciones locales
```

No necesita:

```text
Integración bancaria real
Conciliación bancaria real
Procesamiento real de pagos
Infraestructura distribuida
```

---

## PRODUCCIÓN

Debe utilizar:

```text
PostgreSQL
Prisma
Node.js
Express
RBAC
Auditoría
Transacciones
Idempotencia
Ledger financiero
Backups
Logs
Control de acceso
```

Las operaciones monetarias deben ejecutarse dentro de transacciones de base de datos.

---

# 49. RELACIÓN CON OTROS MÓDULOS

```text
03_SUCURSALES_Y_POS.md
        ↓
09_VENTAS_Y_POS.md
        ↓
10_CAJAS_Y_ARQUEOS.md
        ↓
11_TESORERIA_Y_CAJA_MAYOR.md
        ↓
12_CUENTAS_FINANCIERAS.md
        ↓
13_PAGOS_Y_MOVIMIENTOS_DINERO.md
```

Tesorería depende especialmente de:

```text
Ventas
Cajas
Cuentas financieras
Pagos
Compras
Proveedores
Empleados
Auditoría
```

---

# 50. PRINCIPIO FINAL

El sistema debe permitir responder con precisión:

> **¿Cuánto dinero tiene la empresa?**

> **¿Dónde está?**

> **¿Cómo llegó allí?**

> **¿Quién lo recibió?**

> **¿Quién lo movió?**

> **¿Quién lo autorizó?**

> **¿De qué operación proviene?**

> **¿A qué operación está destinado?**

La arquitectura financiera debe seguir este principio:

```text
VENTA
   ↓
COBRO
   ↓
CUENTA FINANCIERA
   ↓
TESORERÍA
   ↓
TRANSFERENCIA / GASTO / PAGO / RETIRO
   ↓
AUDITORÍA
```

Y nunca:

```text
SALDO = número editable
```

La regla fundamental es:

> **El dinero se controla mediante movimientos financieros trazables, no mediante saldos editables.**
