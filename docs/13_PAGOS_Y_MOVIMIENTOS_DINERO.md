# 13 — PAGOS Y MOVIMIENTOS DE DINERO

**Archivo:** `13_PAGOS_Y_MOVIMIENTOS_DINERO.md`
**Sistema:** Sistema de Gestión Multisucursal
**Módulo:** Pagos y Movimientos de Dinero
**Estado:** Especificación funcional
**Versión:** 1.0

---

# 1. PROPÓSITO

El módulo de **Pagos y Movimientos de Dinero** administra las operaciones mediante las cuales el dinero entra, sale o se mueve dentro de la empresa.

Este módulo conecta:

```text
VENTAS
   ↓
COBROS
   ↓
PAGOS
   ↓
CUENTAS FINANCIERAS
   ↓
TESORERÍA
```

También conecta:

```text
COMPRAS
   ↓
CUENTAS POR PAGAR
   ↓
PAGO A PROVEEDOR
   ↓
CUENTA FINANCIERA
```

Y:

```text
CAJA
   ↓
RETIRO
   ↓
CAJA MAYOR
```

---

# 2. PRINCIPIO FUNDAMENTAL

El sistema debe distinguir claramente entre:

```text
OPERACIÓN COMERCIAL
PAGO
MOVIMIENTO FINANCIERO
CUENTA FINANCIERA
```

No son lo mismo.

Ejemplo:

```text
Venta
$100.000
```

es una operación comercial.

```text
Pago
$100.000
```

es la cancelación financiera de esa venta.

```text
FinancialMovement
+$100.000
```

representa el movimiento monetario.

```text
Banco Galicia
```

representa dónde terminó el dinero.

---

# 3. TIPOS DE OPERACIÓN MONETARIA

El sistema debe soportar como mínimo:

```text
COBRO_VENTA
PAGO_PROVEEDOR
PAGO_SUELDO
PAGO_EMPLEADO
GASTO
DEVOLUCION
RETIRO
DEPOSITO
TRANSFERENCIA
AJUSTE
SEÑA
DEVOLUCION_SEÑA
```

Los nombres internos definitivos deberán centralizarse posteriormente en el modelo de datos.

---

# 4. MÉTODOS DE PAGO

Método de pago indica cómo se realiza una operación.

Valores iniciales:

```text
EFECTIVO
TRANSFERENCIA
QR
DEBITO
CREDITO
CHEQUE
OTRO
```

La lista debe ser configurable.

---

# 5. CUENTA FINANCIERA

El método de pago no determina necesariamente dónde termina el dinero.

Ejemplo:

```text
Método:
TRANSFERENCIA

Cuenta:
Banco Galicia
```

Otro:

```text
Método:
QR

Cuenta:
Mercado Pago
```

Otro:

```text
Método:
EFECTIVO

Cuenta:
Caja Sucursal Centro
```

La relación debe quedar registrada.

---

# 6. PAGOS SIMPLES

Un pago simple tiene:

```text
importe
método
cuenta financiera
fecha
usuario
referencia
```

Ejemplo:

```text
Venta:
$100.000

Pago:
$100.000

Método:
TRANSFERENCIA

Cuenta:
Banco Galicia
```

Resultado:

```text
Banco Galicia
+$100.000
```

---

# 7. PAGOS COMBINADOS

Una venta puede utilizar varios medios de pago.

Ejemplo:

```text
Venta:
$200.000

Efectivo:
$80.000

Transferencia:
$120.000
```

El sistema debe registrar dos componentes:

```text
Payment #1
EFECTIVO
$80.000
Caja Centro

Payment #2
TRANSFERENCIA
$120.000
Banco Galicia
```

Total:

```text
$200.000
```

---

# 8. REGLA DE TOTAL

Para una operación completamente pagada:

```text
SUM(pagos) = total operación
```

No se debe permitir:

```text
Venta:
$100.000

Pagos:
$80.000

Estado:
PAGADA
```

salvo que el sistema soporte explícitamente crédito/saldo pendiente.

---

# 9. PAGO INSUFICIENTE

Si:

```text
Venta:
$100.000

Pagado:
$80.000
```

debe quedar:

```text
Pendiente:
$20.000
```

El estado puede ser:

```text
PARTIALLY_PAID
```

si el negocio decide permitir ventas con saldo pendiente.

Esta regla debe ser configurable y no debe asumirse automáticamente.

---

# 10. EXCESO DE PAGO

Si:

```text
Venta:
$100.000

Pago:
$110.000
```

el sistema debe determinar si corresponde:

```text
Vuelto:
$10.000
```

o rechazar el pago.

No debe registrarse simplemente:

```text
Venta = $100.000
Pago = $110.000
```

sin explicar la diferencia.

---

# 11. VUELTO

En efectivo:

```text
Cliente entrega:
$100.000

Venta:
$75.000

Vuelto:
$25.000
```

Movimiento neto de caja:

```text
+$75.000
```

No:

```text
+$100.000
```

si los $25.000 fueron entregados como vuelto.

El sistema debe conservar el importe recibido y el vuelto para auditoría.

---

# 12. PAGO EN EFECTIVO

Ejemplo:

```text
Venta:
$50.000

Método:
EFECTIVO

Cuenta:
Caja Sucursal Centro
```

Resultado:

```text
Caja Centro
+$50.000
```

El movimiento debe estar relacionado con:

```text
Sale
Payment
CashRegisterSession
CashMovement
FinancialMovement
```

---

# 13. PAGO POR TRANSFERENCIA

Debe registrar:

```text
importe
entidad
cuenta destino
referencia
fecha
usuario
```

Ejemplo:

```text
Método:
TRANSFERENCIA

Banco:
Galicia

Importe:
$150.000

Referencia:
TRX-123456
```

La referencia bancaria puede ser opcional según el flujo, pero debe almacenarse cuando esté disponible.

---

# 14. PAGO MEDIANTE QR

Ejemplo:

```text
Método:
QR

Proveedor:
Mercado Pago

Cuenta:
Mercado Pago Empresa

Importe:
$100.000
```

El sistema debe poder registrar posteriormente:

```text
comisión
retención
fecha de acreditación
importe neto
```

cuando la integración financiera lo permita.

---

# 15. TARJETAS

Debe distinguirse:

```text
DÉBITO
CRÉDITO
```

Y eventualmente:

```text
operador
terminal
lote
cuotas
autorización
fecha de venta
fecha estimada de acreditación
comisión
retenciones
importe neto
```

No se debe asumir que una venta con tarjeta significa que el dinero está inmediatamente disponible en la cuenta bancaria.

---

# 16. CHEQUES

Un cheque es un instrumento financiero y no debe tratarse automáticamente como efectivo.

Ejemplo:

```text
Venta:
$200.000

Pago:
CHEQUE

Valor:
$200.000

Cuenta:
Cheques en Cartera
```

Posteriormente:

```text
Cheques en Cartera
-$200.000

Banco Galicia
+$200.000
```

---

# 17. PAGO A PROVEEDOR

Flujo:

```text
Proveedor
   ↓
Factura
   ↓
Cuenta por pagar
   ↓
Pago
   ↓
Cuenta financiera
```

Ejemplo:

```text
Deuda:
$500.000

Pago:
$300.000

Pendiente:
$200.000
```

El pago debe quedar relacionado con la deuda.

---

# 18. PAGOS PARCIALES

Debe permitirse:

```text
Deuda:
$1.000.000

Pago #1:
$400.000

Pago #2:
$300.000

Pendiente:
$300.000
```

Cada pago es independiente y auditable.

No se debe modificar la factura original para ocultar los pagos parciales.

---

# 19. PAGOS DESDE DISTINTAS CUENTAS

Una deuda puede pagarse desde diferentes cuentas si el negocio lo permite.

Ejemplo:

```text
Factura:
$1.000.000

Banco Galicia:
$600.000

Caja Mayor:
$400.000
```

Resultado:

```text
Deuda:
$0
```

Cada movimiento debe quedar individualmente registrado.

---

# 20. GASTOS

Un gasto representa una salida de dinero asociada a una categoría.

Ejemplo:

```text
Gasto:
Internet

Importe:
$50.000

Cuenta:
Banco Galicia
```

Resultado:

```text
Banco Galicia
-$50.000
```

Debe registrarse:

```text
categoría
descripción
cuenta
importe
fecha
usuario
comprobante
```

---

# 21. RETIROS

Un retiro representa salida de efectivo de una caja.

Ejemplo:

```text
Caja Centro
-$300.000

Destino:
Caja Mayor
```

Debe generar la entrada correspondiente:

```text
Caja Mayor
+$300.000
```

La operación debe tener una relación común.

---

# 22. DEPÓSITOS

Ejemplo:

```text
Caja Mayor
-$500.000

Banco Galicia
+$500.000
```

El depósito debe estar relacionado con:

```text
FinancialMovement
Transfer
FinancialAccount
```

No debe contabilizarse como ingreso comercial.

---

# 23. TRANSFERENCIAS INTERNAS

Una transferencia entre cuentas propias:

```text
Cuenta A
-$100.000

Cuenta B
+$100.000
```

No constituye:

```text
INGRESO
```

ni:

```text
EGRESO ECONÓMICO
```

Es un movimiento interno de fondos.

---

# 24. DEVOLUCIONES

Una devolución genera una salida de dinero cuando corresponde.

Ejemplo:

```text
Venta original:
$100.000

Devolución:
$40.000

Cuenta:
Caja Centro
```

Resultado:

```text
Caja Centro
-$40.000
```

La devolución debe estar relacionada con la operación original.

---

# 25. SEÑAS

Una seña debe distinguirse de una venta completada.

Ejemplo:

```text
Reserva:
$150.000

Seña:
$50.000

Pendiente:
$100.000
```

El ingreso de la seña debe registrarse:

```text
Payment
+
FinancialMovement
+
FinancialAccount
```

Pero no debe confundirse automáticamente con el ingreso total de una venta finalizada.

---

# 26. DEVOLUCIÓN DE SEÑA

Si una reserva se cancela y corresponde devolver la seña:

```text
Caja/Banco
-$50.000
```

Debe quedar relacionada con:

```text
Reservation
Deposit
Refund
FinancialMovement
```

---

# 27. MOVIMIENTO FINANCIERO

Entidad conceptual:

```text
FinancialMovement
```

Campos mínimos:

```text
id

type
direction

amount
currency

paymentMethod

sourceAccountId
destinationAccountId

branchId
cashRegisterId

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

# 28. DIRECCIÓN

Valores:

```text
IN
OUT
TRANSFER
```

Ejemplo:

```text
Venta:
IN
```

```text
Pago proveedor:
OUT
```

```text
Galicia → Macro:
TRANSFER
```

---

# 29. REFERENCIAS

Todo movimiento debe poder relacionarse con su origen.

Ejemplos:

```text
Sale
Payment
SupplierPayment
Expense
Refund
Transfer
Reservation
CashWithdrawal
SalaryPayment
EmployeePurchase
```

Campos:

```text
referenceType
referenceId
```

La implementación definitiva puede utilizar relaciones tipadas en la base de datos cuando sea necesario.

---

# 30. ESTADOS

Estados mínimos:

```text
PENDING
APPROVED
COMPLETED
REJECTED
CANCELLED
```

Una operación no debe afectar definitivamente los saldos hasta alcanzar el estado correspondiente según la regla de negocio.

---

# 31. APROBACIONES

Las operaciones de alto impacto pueden requerir autorización.

Ejemplo:

```text
Pago:
$2.000.000

Estado:
PENDING
```

Luego:

```text
Aprobador:
Administrador

Estado:
APPROVED
```

Finalmente:

```text
Estado:
COMPLETED
```

Los límites deben ser configurables.

---

# 32. CANCELACIÓN

Una operación completada no debe eliminarse.

Si corresponde revertirla:

```text
Movimiento original
        ↓
Movimiento compensatorio
```

Ejemplo:

```text
Banco
+$100.000
```

Reversión:

```text
Banco
-$100.000
```

Ambos deben permanecer en el historial.

---

# 33. IDEMPOTENCIA

Los pagos deben ser idempotentes.

Ejemplo:

```text
idempotencyKey:
PAYMENT-SALE-123-01
```

Primer intento:

```text
Pago creado
```

Segundo intento:

```text
Pago ya existente
```

No:

```text
Pago #1 +$100.000
Pago #2 +$100.000
```

---

# 34. CONCURRENCIA

Debe evitarse que dos usuarios puedan utilizar simultáneamente el mismo saldo disponible de manera incorrecta.

Ejemplo:

```text
Saldo:
$100.000
```

Usuario A intenta retirar:

```text
$80.000
```

Usuario B intenta retirar:

```text
$80.000
```

El sistema debe garantizar consistencia mediante transacciones y control de concurrencia.

---

# 35. INTEGRIDAD MONETARIA

Nunca debe ocurrir:

```text
Pago registrado
```

sin que exista correctamente su movimiento financiero correspondiente cuando la operación lo requiera.

Tampoco:

```text
FinancialMovement
```

sin una operación o referencia válida cuando corresponda.

---

# 36. PAGOS Y STOCK

Un pago no debe modificar directamente el stock.

El stock pertenece al proceso de venta/inventario.

Ejemplo:

```text
Venta
 ↓
StockMovement SALE

Pago
 ↓
FinancialMovement
```

Son efectos diferentes de una misma operación comercial.

---

# 37. PAGOS Y FACTURACIÓN

El pago tampoco debe confundirse con la factura.

Una operación puede tener:

```text
Sale
Payment
Invoice
```

Cada entidad representa algo diferente.

Ejemplo:

```text
Venta
$100.000

Pago
$100.000

Factura
Factura electrónica
```

Las relaciones deben mantenerse.

---

# 38. PAGO CONTRA ENTREGA

En operaciones donde se permita:

```text
Venta
 ↓
Pendiente de pago
 ↓
Entrega
```

debe existir una regla clara del negocio.

Por defecto, para la demo:

```text
Venta
→ PENDING_PAYMENT
→ Payment
→ PAID
→ COMPLETED
```

La entrega definitiva debe respetar el estado de la operación.

---

# 39. PAGOS DE CAJA

Los movimientos en efectivo deben relacionarse con la sesión de caja.

Ejemplo:

```text
CashRegisterSession
        ↓
CashMovement
        ↓
FinancialMovement
        ↓
FinancialAccount
```

Esto permite que:

```text
Arqueo
```

y:

```text
Tesorería
```

vean la misma realidad financiera desde diferentes niveles.

---

# 40. TRAZABILIDAD

Debe poder navegarse:

```text
Venta
 ↓
Payment
 ↓
FinancialMovement
 ↓
FinancialAccount
```

Y:

```text
Compra
 ↓
Factura proveedor
 ↓
Cuenta por pagar
 ↓
SupplierPayment
 ↓
FinancialMovement
 ↓
FinancialAccount
```

Y:

```text
Caja
 ↓
Retiro
 ↓
Transferencia
 ↓
Caja Mayor
```

---

# 41. AUDITORÍA

Todo movimiento debe registrar:

```text
Usuario
Fecha
Hora
Cuenta
Importe
Tipo
Método
Referencia
Estado
Aprobador
Motivo
```

Eventos mínimos:

```text
CREATE_PAYMENT
APPROVE_PAYMENT
REJECT_PAYMENT
COMPLETE_PAYMENT
CANCEL_PAYMENT
REFUND_PAYMENT
TRANSFER_MONEY
WITHDRAW_MONEY
DEPOSIT_MONEY
ADJUST_MONEY
```

---

# 42. ROLES

## VENDEDOR

Puede:

* Crear operación de venta.
* Registrar intención de pago según permisos.
* Consultar estado.

No puede:

* Administrar Tesorería.
* Aprobar pagos críticos.
* Modificar movimientos históricos.

---

## CAJERO

Puede:

* Cobrar.
* Registrar pagos.
* Operar efectivo.
* Realizar arqueo.
* Ejecutar movimientos autorizados.

---

## ADMINISTRADOR

Puede:

* Revisar pagos.
* Autorizar operaciones según permisos.
* Consultar movimientos de sucursal.

---

## TESORERO

Puede:

* Registrar pagos financieros.
* Administrar cuentas.
* Ejecutar transferencias.
* Gestionar pagos a proveedores.
* Gestionar gastos.
* Conciliar.

---

## SUPER ADMIN

Puede:

* Acceder globalmente.
* Configurar reglas.
* Aprobar operaciones críticas.
* Consultar auditoría completa.

---

# 43. REPORTES

Debe existir:

### Pagos por período

```text
Fecha
Tipo
Importe
Método
Cuenta
Usuario
Estado
```

### Cobros

Ventas cobradas.

### Pagos a proveedores

Pagos realizados y pendientes.

### Gastos

Por categoría.

### Transferencias

Origen y destino.

### Devoluciones

Importes devueltos.

### Señas

Señas recibidas y devueltas.

### Movimientos financieros

Ledger completo.

---

# 44. FILTROS

Debe poder filtrarse por:

```text
Fecha
Sucursal
Cuenta
Método
Tipo
Estado
Usuario
Proveedor
Empleado
Referencia
Importe
```

---

# 45. EXPORTACIÓN

Debe soportar:

```text
XLSX
CSV
```

Columnas mínimas:

```text
Fecha
Hora
Tipo
Dirección
Importe
Moneda
Método
Cuenta origen
Cuenta destino
Sucursal
Referencia
Usuario
Estado
Observación
```

---

# 46. SEGURIDAD

Los movimientos monetarios deben ejecutarse dentro de transacciones.

Ejemplo:

```text
BEGIN

Crear Payment
Crear FinancialMovement
Actualizar saldo/ledger
Registrar auditoría

COMMIT
```

Si una operación falla:

```text
ROLLBACK
```

No debe quedar un pago creado sin su efecto financiero correspondiente.

---

# 47. DINERO REAL VS DATOS DE DEMO

Durante la demo:

```text
$100.000
```

puede ser un dato simulado.

Debe estar claramente indicado:

```text
MODO DEMO
MOVIMIENTOS SIMULADOS
```

En producción:

```text
FinancialMovement
```

representará información financiera real y requiere controles de seguridad, permisos, auditoría y backups.

---

# 48. REGLAS DE NEGOCIO

### Regla 1

Pago y movimiento financiero son conceptos diferentes.

### Regla 2

Todo pago debe identificar método.

### Regla 3

Cuando corresponda, todo pago debe identificar cuenta financiera.

### Regla 4

Los pagos combinados deben dividirse en componentes.

### Regla 5

La suma de pagos debe respetar el total de la operación.

### Regla 6

El exceso de pago debe resolverse explícitamente como vuelto o rechazo.

### Regla 7

Los cheques no son efectivo.

### Regla 8

Las transferencias internas no representan ingresos económicos.

### Regla 9

Las operaciones completadas no se eliminan.

### Regla 10

Las correcciones utilizan movimientos compensatorios.

### Regla 11

Los movimientos financieros deben ser auditables.

### Regla 12

Los pagos críticos deben utilizar idempotencia.

### Regla 13

Las operaciones concurrentes deben protegerse.

### Regla 14

Los pagos no modifican directamente el stock.

### Regla 15

El pago no equivale automáticamente a facturación.

---

# 49. DEMO COMPLETA

## Caso 1 — Efectivo

```text
Venta:
$100.000

Pago:
$100.000

Método:
Efectivo

Cuenta:
Caja Centro
```

Resultado:

```text
Caja Centro
+$100.000
```

---

## Caso 2 — Transferencia

```text
Venta:
$150.000

Método:
Transferencia

Cuenta:
Banco Galicia
```

Resultado:

```text
Banco Galicia
+$150.000
```

---

## Caso 3 — Pago combinado

```text
Venta:
$300.000

Efectivo:
$100.000

Mercado Pago:
$200.000
```

Resultado:

```text
Caja:
+$100.000

Mercado Pago:
+$200.000
```

---

## Caso 4 — Pago a proveedor

```text
Deuda:
$500.000

Pago:
$300.000

Banco Galicia:
-$300.000

Pendiente:
$200.000
```

---

## Caso 5 — Transferencia interna

```text
Galicia:
-$500.000

Macro:
+$500.000
```

---

## Caso 6 — Gasto

```text
Gasto:
$50.000

Caja Mayor:
-$50.000

Categoría:
Mantenimiento
```

---

## Caso 7 — Devolución

```text
Venta original:
$100.000

Devolución:
$30.000

Caja:
-$30.000
```

---

## Caso 8 — Seña

```text
Reserva:
$200.000

Seña:
$50.000

Mercado Pago:
+$50.000

Saldo:
$150.000
```

---

# 50. CRITERIOS DE ACEPTACIÓN

El módulo será considerado funcional cuando:

* [ ] Se puedan registrar pagos.
* [ ] Se puedan registrar cobros.
* [ ] Se puedan utilizar diferentes métodos.
* [ ] Se puedan utilizar pagos combinados.
* [ ] Se puedan asociar pagos a cuentas financieras.
* [ ] Se puedan registrar pagos parciales.
* [ ] Se controle el total pagado.
* [ ] Se controle el vuelto.
* [ ] Se puedan registrar transferencias.
* [ ] Se puedan registrar gastos.
* [ ] Se puedan registrar pagos a proveedores.
* [ ] Se puedan registrar pagos a empleados.
* [ ] Se puedan registrar devoluciones.
* [ ] Se puedan registrar señas.
* [ ] Se puedan registrar devoluciones de señas.
* [ ] Se puedan registrar cheques.
* [ ] Exista FinancialMovement.
* [ ] Exista trazabilidad.
* [ ] Exista auditoría.
* [ ] Exista idempotencia.
* [ ] Exista control de concurrencia.
* [ ] Existan permisos por rol.
* [ ] Existan reportes.
* [ ] Exista exportación.
* [ ] No se puedan eliminar movimientos completados.

---

# 51. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
Mock payments
localStorage
cuentas simuladas
movimientos simulados
```

No requiere:

```text
Procesamiento bancario real
Integraciones reales
Conciliación automática
Procesadores de tarjetas reales
```

---

## PRODUCCIÓN

Debe utilizar:

```text
PostgreSQL
Prisma
Decimal
Transactions
RBAC
AuditLog
FinancialAccount
FinancialMovement
Idempotency
Concurrency Control
Backups
Logs
```

Las integraciones externas deben diseñarse para que un error de comunicación nunca genere un pago duplicado.

---

# 52. RELACIÓN CON OTROS MÓDULOS

```text
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

También depende de:

```text
07_COMPRAS_Y_PROVEEDORES.md
14_RESERVAS_Y_SEÑAS.md
16_CAMBIOS_Y_DEVOLUCIONES.md
17_EMPLEADOS_Y_SUELDOS.md
19_FACTURACION_ARCA.md
20_REPORTES_Y_EXPORTACIONES.md
21_AUDITORIA_Y_TRAZABILIDAD.md
23_ESTADOS_Y_TRANSICIONES.md
24_MODELO_DE_DATOS.md
25_ARQUITECTURA_TECNICA.md
```

---

# 53. ARQUITECTURA CONCEPTUAL

```text
                     OPERACIÓN
                         │
             ┌───────────┼───────────┐
             │           │           │
           VENTA       COMPRA      GASTO
             │           │           │
             ▼           ▼           ▼
           PAYMENT     PAYMENT     PAYMENT
             │           │           │
             └───────────┼───────────┘
                         ▼
                FINANCIAL MOVEMENT
                         │
                         ▼
                FINANCIAL ACCOUNT
                         │
                         ▼
                    TESORERÍA
```

---

# 54. PRINCIPIO FINAL

El sistema debe poder responder:

> **¿Qué operación generó este pago?**

> **¿Quién realizó el pago?**

> **¿Cómo se pagó?**

> **¿Desde qué cuenta?**

> **¿A qué cuenta llegó?**

> **¿Cuánto dinero se movió?**

> **¿Cuándo ocurrió?**

> **¿Quién lo autorizó?**

> **¿Qué saldo afectó?**

> **¿Puede rastrearse hasta la operación original?**

La arquitectura financiera debe seguir:

```text
OPERACIÓN
    ↓
PAYMENT
    ↓
FINANCIAL MOVEMENT
    ↓
FINANCIAL ACCOUNT
    ↓
TREASURY
    ↓
AUDIT
```

Y nunca:

```text
"Pago" = modificar un número de saldo
```

El **Payment** representa el pago/cobro de una operación; el **FinancialMovement** representa el movimiento monetario; y **FinancialAccount** representa dónde está el dinero. Esta separación es fundamental para que el sistema pueda crecer hacia conciliaciones, tarjetas, Mercado Pago, bancos, reportes y eventualmente integraciones financieras reales.
