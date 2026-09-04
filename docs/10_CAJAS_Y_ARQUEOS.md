# SISTEMA DE GESTIÓN MULTISUCURSAL

## 10 — CAJAS Y ARQUEOS

**Documento:** `10_CAJAS_Y_ARQUEOS.md`
**Versión:** 1.0
**Estado:** Draft
**Última actualización:** 2026-09-02

**Depende de:**

* `00_MASTER_SPEC.md`
* `02_ROLES_Y_PERMISOS.md`
* `03_SUCURSALES_Y_POS.md`
* `05_INVENTARIO_Y_STOCK.md`
* `09_VENTAS_Y_POS.md`

**Relacionado con:**

* `11_TESORERIA_Y_CAJA_MAYOR.md`
* `12_CUENTAS_FINANCIERAS.md`
* `13_PAGOS_Y_MOVIMIENTOS_DINERO.md`
* `14_RESERVAS_Y_SEÑAS.md`
* `16_CAMBIOS_Y_DEVOLUCIONES.md`
* `17_EMPLEADOS_Y_SUELDOS.md`
* `18_VENTAS_DE_EMPLEADOS.md`
* `19_FACTURACION_ARCA.md`
* `20_REPORTES_Y_EXPORTACIONES.md`
* `21_AUDITORIA_Y_TRAZABILIDAD.md`

---

# 1. PROPÓSITO

Este módulo define el funcionamiento de las cajas registradoras de las sucursales.

Debe permitir controlar:

* Apertura de caja.
* Fondo inicial.
* Cobros de ventas.
* Ingresos manuales autorizados.
* Egresos/retiros autorizados.
* Devoluciones.
* Movimientos de efectivo.
* Conteo físico.
* Arqueos.
* Cierres.
* Diferencias.
* Rendición a tesorería.
* Trazabilidad de cada movimiento.

---

# 2. PRINCIPIO FUNDAMENTAL

La empresa tiene una separación clara entre:

```text
POS
↓
genera venta

CAJA
↓
recibe y registra dinero

TESORERÍA
↓
controla y consolida dinero
```

Por lo tanto:

> **El POS genera la operación comercial. La caja controla el cobro. Tesorería controla el dinero de la empresa a nivel global.**

---

# 3. CAJA POR SUCURSAL

Cada sucursal tendrá inicialmente:

```text
1 Caja
```

y puede tener:

```text
2–3 POS
```

Ejemplo:

```text
Sucursal Centro

Caja:
CAJA-CENTRO-01

POS:
POS-01
POS-02
POS-03
```

Los POS pueden generar ventas simultáneamente.

Todas esas ventas pueden terminar siendo cobradas por la misma caja.

---

# 4. RELACIÓN POS → CAJA

El modelo conceptual es:

```text
Sucursal
├── Caja
├── POS 01
├── POS 02
└── POS 03
```

No debe existir una caja independiente obligatoria para cada POS.

---

# 5. ENTIDAD CASH REGISTER

Entidad conceptual:

```text
CashRegister
```

Campos principales:

```text
id
branchId
name
code
status
currentSessionId
active
createdAt
updatedAt
```

---

# 6. SESIÓN DE CAJA

Una caja no debe considerarse simplemente como un saldo.

Debe trabajar mediante sesiones.

Entidad:

```text
CashRegisterSession
```

Conceptualmente:

```text
Apertura
↓
Operaciones
↓
Arqueo
↓
Cierre
```

---

# 7. ESTADOS DE CAJA

Estados principales:

```text
CLOSED
OPEN
COUNTING
CLOSED_WITH_DIFFERENCE
```

Puede implementarse también un modelo donde `CLOSED_WITH_DIFFERENCE` sea un estado del cierre y no de la caja permanente.

La decisión definitiva debe mantenerse consistente en `23_ESTADOS_Y_TRANSICIONES.md`.

---

# 8. APERTURA DE CAJA

El cajero debe abrir la caja antes de comenzar a operar.

Flujo:

```text
Caja cerrada
↓
Cajero
↓
Abrir caja
↓
Ingresar fondo inicial
↓
Confirmar
↓
Caja abierta
```

---

# 9. FONDO INICIAL

Ejemplo:

```text
Fondo inicial:
$100.000
```

Debe quedar registrado.

Datos:

```text
cashRegisterId
sessionId
amount
userId
timestamp
notes
```

---

# 10. CONTEO DEL FONDO INICIAL

La apertura debe permitir indicar el monto inicial.

Opcionalmente, en producción puede detallarse por denominación.

Ejemplo:

```text
Billetes $10.000 × 5 = $50.000
Billetes $5.000 × 6 = $30.000
Billetes $2.000 × 10 = $20.000

TOTAL:
$100.000
```

Esto mejora el control operativo.

---

# 11. RESPONSABLE DE LA CAJA

Toda sesión debe tener un responsable.

Ejemplo:

```text
Caja:
Centro

Cajero:
Pedro Gómez

Apertura:
08:54

Fondo inicial:
$100.000
```

Debe quedar auditado.

---

# 12. UN RESPONSABLE PRINCIPAL

La configuración inicial debe asumir:

```text
1 caja
1 sesión activa
1 responsable principal
```

Si posteriormente se requiere más de un cajero sobre la misma caja, debe modelarse explícitamente mediante permisos y usuarios asociados a la sesión.

No debe resolverse compartiendo credenciales.

---

# 13. VENTAS COBRADAS

Cuando una venta pasa a:

```text
COMPLETED
```

y contiene:

```text
EFECTIVO
```

la caja debe registrar el ingreso correspondiente.

Ejemplo:

```text
Venta:
$50.000

Pago:
Efectivo

Caja:
+ $50.000
```

---

# 14. PAGOS NO EFECTIVO

No todo cobro incrementa el efectivo físico.

Ejemplo:

```text
Venta:
$80.000

Transferencia:
$80.000
```

La caja debe registrar que la venta fue cobrada, pero el dinero debe asignarse a la cuenta financiera correspondiente.

Ejemplo:

```text
Caja efectivo:
$0

Banco Galicia:
+$80.000
```

---

# 15. PRINCIPIO DE MEDIOS DE PAGO

Debe diferenciarse:

```text
Método de pago
```

de:

```text
Cuenta financiera
```

Ejemplo:

```text
TRANSFERENCIA
+
Banco Galicia
```

o:

```text
QR
+
Mercado Pago
```

o:

```text
EFECTIVO
+
Caja Sucursal Centro
```

---

# 16. MOVIMIENTOS DE CAJA

Todo movimiento de efectivo debe quedar registrado.

Entidad conceptual:

```text
CashMovement
```

Campos:

```text
id
cashRegisterId
sessionId
type
direction
amount
referenceType
referenceId
userId
createdAt
notes
```

---

# 17. TIPOS DE MOVIMIENTO

Tipos principales:

```text
OPENING_BALANCE
SALE_CASH
CASH_IN
CASH_OUT
REFUND_CASH
WITHDRAWAL
CASH_ADJUSTMENT
CLOSING_TRANSFER
```

Los nombres definitivos deben mantenerse consistentes con `13_PAGOS_Y_MOVIMIENTOS_DINERO.md`.

---

# 18. INGRESO DE EFECTIVO

Puede existir un ingreso manual autorizado.

Ejemplo:

```text
CASH_IN

Importe:
$20.000

Motivo:
Cambio para caja

Usuario:
Pedro
```

Debe requerir motivo.

---

# 19. EGRESO DE EFECTIVO

Puede existir un egreso autorizado.

Ejemplo:

```text
CASH_OUT

Importe:
$10.000

Motivo:
Compra de insumos

Usuario:
Pedro
```

Debe quedar auditado.

---

# 20. RETIRO DE EFECTIVO

Un retiro de efectivo representa dinero que sale físicamente de la caja.

Ejemplo:

```text
Caja:
$500.000

Retiro:
$300.000

Saldo físico esperado:
$200.000
```

Debe registrarse como operación independiente.

---

# 21. RETIROS PARCIALES

Puede haber múltiples retiros durante el día.

Ejemplo:

```text
11:30
Retiro:
$200.000

15:45
Retiro:
$150.000

18:20
Retiro:
$250.000
```

Cada uno debe tener:

```text
Importe
Motivo
Usuario
Fecha/hora
Destino
Autorizador
```

cuando corresponda.

---

# 22. DESTINO DEL RETIRO

El sistema debe poder identificar el destino.

Ejemplo:

```text
Caja Mayor
Banco
Tesorería
Depósito
Otro
```

El modelo completo de destino financiero se define en:

`11_TESORERIA_Y_CAJA_MAYOR.md`

y

`12_CUENTAS_FINANCIERAS.md`.

---

# 23. RETIRO NO ES PÉRDIDA

Un retiro de:

```text
$300.000
```

no significa que desapareció dinero.

Significa:

```text
Caja Sucursal
-300.000

Destino:
Caja Mayor
+300.000
```

La operación debe poder rastrearse.

---

# 24. CAJA ESPERADA

Durante la sesión:

```text
Caja esperada =
Fondo inicial
+ ingresos efectivo
- egresos efectivo
- retiros
- devoluciones efectivo
```

Las ventas pagadas mediante transferencia, QR o tarjeta no deben sumarse al efectivo físico.

---

# 25. EJEMPLO DE CAJA ESPERADA

```text
Fondo inicial:
$100.000

Ventas efectivo:
+$500.000

Ingresos:
+$20.000

Egresos:
-$10.000

Retiros:
-$300.000

Devoluciones efectivo:
-$50.000
```

Resultado:

```text
Caja esperada:
$260.000
```

---

# 26. DIFERENCIA DE CAJA

Al realizar el arqueo:

```text
Efectivo contado
-
Efectivo esperado
=
Diferencia
```

Ejemplo:

```text
Esperado:
$260.000

Contado:
$255.000

Diferencia:
-$5.000
```

Esto constituye un faltante.

---

# 27. SOBRANTE

Ejemplo:

```text
Esperado:
$260.000

Contado:
$265.000

Diferencia:
+$5.000
```

Esto constituye un sobrante.

---

# 28. CAJA CUADRADA

Ejemplo:

```text
Esperado:
$260.000

Contado:
$260.000

Diferencia:
$0
```

Resultado:

```text
CAJA CUADRADA
```

---

# 29. TOLERANCIA

La empresa puede establecer una tolerancia.

Ejemplo:

```text
Tolerancia:
$1.000
```

Pero esto no debe ocultar la diferencia.

Ejemplo:

```text
Diferencia:
-$500

Resultado operativo:
Dentro de tolerancia

Auditoría:
Diferencia registrada
```

La tolerancia es una política, no una eliminación de la diferencia.

---

# 30. ARQUEO

El arqueo representa el proceso de contar físicamente el dinero.

Flujo:

```text
Caja abierta
↓
Solicitar arqueo
↓
Contar efectivo
↓
Registrar valores
↓
Comparar esperado vs contado
↓
Mostrar diferencia
↓
Confirmar
↓
Cierre
```

---

# 31. ARQUEO POR DENOMINACIÓN

En producción se recomienda permitir:

```text
$20.000 × cantidad
$10.000 × cantidad
$5.000 × cantidad
$2.000 × cantidad
$1.000 × cantidad
$500 × cantidad
$200 × cantidad
$100 × cantidad
$50 × cantidad
$20 × cantidad
$10 × cantidad
```

El sistema calcula automáticamente.

No debe depender de que el cajero escriba manualmente el total.

---

# 32. OTROS VALORES

La caja puede manejar medios no monetarios según las necesidades del negocio.

Ejemplo:

```text
Cheques
Vales
Otros valores
```

Estos no deben mezclarse automáticamente con efectivo.

Su tratamiento se definirá en:

`13_PAGOS_Y_MOVIMIENTOS_DINERO.md`.

---

# 33. ARQUEO DE MEDIOS DE PAGO

Además del efectivo, el sistema debe permitir comparar:

```text
Ventas registradas
vs
Pagos registrados
vs
Movimientos financieros
```

Por ejemplo:

```text
EFECTIVO
Esperado: $500.000
Contado: $500.000

TRANSFERENCIAS
Sistema: $350.000
Conciliado: $350.000

QR
Sistema: $120.000
Conciliado: $120.000
```

La conciliación bancaria real puede ser posterior.

---

# 34. TARJETAS

Para tarjetas debe poder registrarse el total procesado.

Ejemplo:

```text
Crédito:
$200.000

Débito:
$150.000
```

La caja registra el cobro, pero no debe tratar esos importes como efectivo físico.

---

# 35. ARQUEO COMPLETO

Un arqueo puede mostrar:

```text
EFECTIVO
Esperado
Contado
Diferencia

TRANSFERENCIA
Registrado

QR
Registrado

DÉBITO
Registrado

CRÉDITO
Registrado

TOTAL VENTAS
Registrado
```

---

# 36. CIERRE DE CAJA

Después del arqueo:

```text
OPEN
↓
COUNTING
↓
CLOSED
```

El cierre debe generar un resumen.

---

# 37. RESUMEN DE CIERRE

Ejemplo:

```text
CIERRE DE CAJA

Sucursal:
Centro

Caja:
01

Cajero:
Pedro Gómez

Apertura:
08:54

Cierre:
20:37

Fondo inicial:
$100.000

Ventas:
$1.250.000

Efectivo:
$600.000

Transferencias:
$300.000

QR:
$150.000

Tarjetas:
$200.000

Retiros:
$400.000

Efectivo esperado:
$300.000

Efectivo contado:
$298.000

Diferencia:
-$2.000
```

---

# 38. CIERRE CON DIFERENCIA

Nunca debe impedirse cerrar simplemente porque existe una diferencia.

Debe registrarse:

```text
Diferencia:
-$2.000

Motivo:
[obligatorio si supera tolerancia]

Observaciones:
[texto]
```

---

# 39. AUTORIZACIÓN DE DIFERENCIAS

Si la diferencia supera un límite:

```text
Tolerancia:
$1.000

Diferencia:
-$8.000
```

puede requerirse:

```text
Encargado
o
Administrador
```

para confirmar el cierre.

---

# 40. NO MODIFICAR EL PASADO

Una vez cerrado:

```text
CashRegisterSession
```

no debe poder editarse libremente.

Si existe un error:

```text
Corrección
↓
Nuevo movimiento
↓
Auditoría
```

Nunca:

```text
editar silenciosamente el movimiento original
```

---

# 41. CIERRE Y TESORERÍA

Después del cierre puede existir una rendición.

Ejemplo:

```text
Caja Sucursal
↓
Cierre
↓
Efectivo entregado
↓
Caja Mayor
```

Esto no debe confundirse con el cierre de caja.

Son dos operaciones diferentes:

```text
Cierre de caja
```

y:

```text
Rendición/transferencia a tesorería
```

---

# 42. CAJA MAYOR

La caja mayor será administrada por Tesorería.

El movimiento:

```text
Caja Sucursal
- $300.000

Caja Mayor
+ $300.000
```

debe quedar vinculado.

El detalle estará en:

`11_TESORERIA_Y_CAJA_MAYOR.md`.

---

# 43. RENDICIÓN PARCIAL

Puede existir una entrega de dinero antes del cierre.

Ejemplo:

```text
Caja:
$600.000

Rendición:
$400.000

Efectivo restante:
$200.000
```

La caja continúa abierta.

---

# 44. CONTROL DE EFECTIVO

El sistema debe poder mostrar:

```text
Fondo inicial
+ Cobros efectivo
+ Ingresos
- Retiros
- Egresos
- Devoluciones
= Esperado
```

---

# 45. DEVOLUCIONES

Si se devuelve dinero en efectivo:

```text
REFUND_CASH
```

debe reducir el efectivo esperado.

Debe quedar vinculado a:

```text
Venta original
Devolución
Usuario
Cliente
Importe
```

No debe registrarse como un simple `CASH_OUT` sin referencia.

---

# 46. CAMBIOS

En un cambio puede ocurrir:

```text
Cliente entrega producto
↓
Recibe otro producto
↓
Debe diferencia
```

o:

```text
Cliente entrega producto
↓
Nuevo producto cuesta menos
↓
Debe recibir diferencia
```

La diferencia monetaria debe afectar la caja o cuenta financiera correspondiente.

El detalle está en:

`16_CAMBIOS_Y_DEVOLUCIONES.md`.

---

# 47. SEÑAS Y RESERVAS

Cuando se recibe una seña:

```text
Cliente
↓
Seña
↓
Caja
```

la caja registra el ingreso.

Pero:

> **Una seña no debe considerarse automáticamente una venta completa.**

Debe existir vínculo con:

```text
Reservation
Deposit
FinancialMovement
```

---

# 48. CANCELACIÓN DE RESERVA

Si corresponde devolver la seña:

```text
Reserva
↓
Cancelación
↓
Reembolso
↓
Caja
```

Debe quedar auditado.

---

# 49. VENTAS EN EFECTIVO

Ejemplo:

```text
Venta:
$50.000

Pago:
Efectivo
```

Resultado:

```text
CashMovement:
SALE_CASH +50.000
```

---

# 50. VENTA POR TRANSFERENCIA

Ejemplo:

```text
Venta:
$50.000

Pago:
Transferencia

Cuenta:
Banco Galicia
```

Resultado:

```text
Caja:
sin aumento de efectivo

Banco Galicia:
+50.000
```

---

# 51. VENTA POR QR

Ejemplo:

```text
Venta:
$50.000

Pago:
QR

Cuenta:
Mercado Pago
```

Resultado:

```text
Caja:
sin aumento de efectivo

Mercado Pago:
+50.000
```

---

# 52. VENTA COMBINADA

Ejemplo:

```text
Venta:
$100.000

Efectivo:
$40.000

Transferencia:
$30.000

Tarjeta:
$30.000
```

Caja:

```text
+$40.000
```

Banco/cuenta:

```text
+$30.000
```

Tarjeta/cuenta correspondiente:

```text
+$30.000
```

La suma financiera total:

```text
$100.000
```

---

# 53. MOVIMIENTO DUPLICADO

El sistema debe impedir:

```text
Venta V-1000
↓
SALE_CASH +50.000

misma venta
↓
SALE_CASH +50.000
```

La venta debe generar un único movimiento por cada componente de pago.

---

# 54. IDEMPOTENCIA

Si el cajero pulsa dos veces:

```text
FINALIZAR
```

no deben generarse dos movimientos.

Debe existir una protección transaccional.

---

# 55. CAJA Y PERMISOS

## VENDEDOR

No puede:

```text
Abrir caja
Cerrar caja
Hacer arqueo
Modificar retiros
Modificar ingresos
```

salvo permisos excepcionales explícitos.

---

# 56. CAJERO

Puede:

```text
Abrir caja
Registrar cobros
Registrar operaciones autorizadas
Realizar arqueo
Cerrar caja
Consultar su sesión
```

---

# 57. ENCARGADO

Puede:

```text
Supervisar caja
Autorizar diferencias
Autorizar operaciones especiales
Consultar cierres
```

---

# 58. ADMIN

Puede:

```text
Consultar todas las cajas
Revisar cierres
Reabrir mediante proceso excepcional
Autorizar correcciones
Consultar diferencias
```

Una reapertura no debe modificar el cierre histórico.

Debe generar auditoría.

---

# 59. SUPER ADMIN / TESORERÍA

Puede:

```text
Ver todas las cajas
Ver todas las sucursales
Comparar cierres
Ver diferencias
Ver retiros
Ver rendiciones
Ver movimientos financieros
Conciliar información
```

---

# 60. AUDITORÍA

Registrar como mínimo:

```text
Caja abierta
Fondo inicial registrado
Venta cobrada
Pago registrado
Ingreso manual
Egreso manual
Retiro
Rendición
Arqueo iniciado
Arqueo confirmado
Diferencia detectada
Cierre realizado
Cierre autorizado
Corrección
Reapertura excepcional
```

---

# 61. DATOS DE AUDITORÍA

Cada evento crítico debe conservar:

```text
userId
branchId
cashRegisterId
sessionId
action
timestamp
amount
referenceType
referenceId
reason
metadata
```

---

# 62. SEGURIDAD

No debe permitirse:

```text
Cajero A
↓
cerrar
↓
Caja de Sucursal B
```

salvo que tenga autorización.

La sesión debe estar asociada a:

```text
Sucursal
Caja
Usuario
```

---

# 63. SESIONES SIMULTÁNEAS

Inicialmente:

```text
1 caja
1 sesión activa
```

No debe permitirse abrir dos sesiones simultáneas para la misma caja.

---

# 64. RECUPERACIÓN ANTE FALLAS

Si se corta la conexión durante un cobro:

```text
Cliente paga
↓
Sistema pierde conexión
```

la aplicación no debe asumir automáticamente que la operación terminó.

Debe poder consultarse el estado antes de reintentar.

Esto es especialmente importante para:

```text
Pagos
Facturación
Movimientos financieros
```

---

# 65. CONCURRENCIA

Dos operaciones simultáneas no deben corromper el saldo.

Ejemplo:

```text
Venta A:
+$50.000

Venta B:
+$30.000
```

El saldo final debe ser:

```text
+$80.000
```

No:

```text
+$50.000
```

por pérdida de actualización.

En producción esto debe resolverse mediante transacciones de base de datos.

---

# 66. SALDO DE CAJA

No debe almacenarse solamente un número mutable:

```text
cashRegister.balance
```

como única fuente de verdad.

Debe existir un historial de movimientos.

El saldo puede calcularse a partir de:

```text
OpeningBalance
+
CashMovements
```

con mecanismos de optimización apropiados.

---

# 67. PRINCIPIO DE LEDGER

La caja debe funcionar conceptualmente como un libro de movimientos:

```text
ENTRADA
SALIDA
REFERENCIA
USUARIO
FECHA
```

El saldo es el resultado.

No la fuente de verdad.

---

# 68. CORRECCIONES

Si se registró incorrectamente:

```text
CASH_IN
$50.000
```

no debe editarse silenciosamente.

Debe generarse:

```text
ADJUSTMENT_OUT
-$50.000
```

vinculado al movimiento original.

---

# 69. MOVIMIENTOS INMUTABLES

Una vez confirmado un movimiento financiero:

```text
NO DELETE
NO SILENT EDIT
```

Las correcciones se realizan mediante movimientos compensatorios.

---

# 70. DASHBOARD DE CAJA

La pantalla principal debe mostrar:

```text
CAJA CENTRO

Estado:
ABIERTA

Cajero:
Pedro

Apertura:
08:54

Fondo inicial:
$100.000

Efectivo esperado:
$300.000

Ventas:
$1.250.000

Efectivo:
$600.000

Transferencias:
$300.000

QR:
$150.000

Tarjetas:
$200.000

Retiros:
$400.000
```

---

# 71. ACCIONES PRINCIPALES

Desde caja:

```text
Nueva venta pendiente
Cobrar venta
Ingreso
Egreso
Retiro
Arqueo
Cerrar caja
```

Las acciones sensibles deben solicitar confirmación.

---

# 72. ALERTAS

El sistema puede alertar:

```text
⚠ Diferencia de caja
⚠ Retiro elevado
⚠ Cierre pendiente
⚠ Caja abierta fuera de horario
⚠ Transferencia sin referencia
⚠ Pago incompleto
⚠ Movimiento sin motivo
```

---

# 73. CIERRE OBLIGATORIO

La empresa puede definir horario de cierre.

Ejemplo:

```text
Horario:
20:00
```

Si la caja permanece abierta:

```text
⚠ CAJA ABIERTA
```

No debe cerrarse automáticamente sin un proceso controlado.

---

# 74. HISTORIAL DE CIERRES

Debe existir:

```text
Historial de sesiones
```

con:

```text
Fecha
Sucursal
Caja
Cajero
Apertura
Cierre
Ventas
Efectivo esperado
Efectivo contado
Diferencia
Estado
```

---

# 75. REPORTES

El módulo debe alimentar:

```text
Reporte de cajas
Reporte de cierres
Reporte de diferencias
Reporte de retiros
Reporte de ingresos
Reporte de egresos
Reporte de medios de pago
Reporte de rendiciones
```

---

# 76. EXPORTACIÓN

Los datos deben poder exportarse posteriormente a Excel.

Filtros:

```text
Fecha
Sucursal
Caja
Cajero
Tipo de movimiento
Método de pago
Cuenta financiera
Estado
```

---

# 77. DEMO — APERTURA

Escenario:

```text
Sucursal Centro

Cajero:
Pedro

Fondo inicial:
$100.000
```

Resultado:

```text
CAJA ABIERTA
```

---

# 78. DEMO — VENTA EN EFECTIVO

Venta:

```text
$50.000
```

Pago:

```text
Efectivo
```

Caja:

```text
$100.000
+
$50.000
=
$150.000
```

---

# 79. DEMO — TRANSFERENCIA

Venta:

```text
$80.000
```

Pago:

```text
Transferencia
Banco Galicia
```

Caja física:

```text
$150.000
```

Banco:

```text
+$80.000
```

---

# 80. DEMO — RETIRO

Retiro:

```text
$100.000
```

Caja:

```text
$150.000
-
$100.000
=
$50.000
```

Destino:

```text
Caja Mayor
```

---

# 81. DEMO — CIERRE CUADRADO

Esperado:

```text
$50.000
```

Contado:

```text
$50.000
```

Resultado:

```text
DIFERENCIA:
$0

CAJA CUADRADA
```

---

# 82. DEMO — FALTANTE

Esperado:

```text
$50.000
```

Contado:

```text
$48.000
```

Resultado:

```text
FALTANTE:
-$2.000
```

Solicitar:

```text
Motivo
Observación
```

---

# 83. DEMO — SOBRANTE

Esperado:

```text
$50.000
```

Contado:

```text
$53.000
```

Resultado:

```text
SOBRANTE:
+$3.000
```

Debe quedar registrado.

---

# 84. DEMO — PAGO COMBINADO

Venta:

```text
$100.000
```

Pago:

```text
Efectivo:
$40.000

Transferencia:
$60.000
```

Resultado:

```text
Caja:
+$40.000

Cuenta bancaria:
+$60.000
```

---

# 85. DEMO — DEVOLUCIÓN

Venta original:

```text
$50.000
```

Devolución:

```text
$50.000 efectivo
```

Caja:

```text
-$50.000
```

Debe quedar vinculada a la devolución original.

---

# 86. DEMO — RENDICIÓN

Caja:

```text
$300.000
```

Rendición:

```text
$200.000
```

Destino:

```text
Caja Mayor
```

Resultado:

```text
Caja:
$100.000

Caja Mayor:
+$200.000
```

---

# 87. FLUJO COMPLETO

```text
CAJA CERRADA
      ↓
APERTURA
      ↓
FONDO INICIAL
      ↓
CAJA ABIERTA
      ↓
┌──────────────────────────┐
│                          │
│  COBROS                  │
│  INGRESOS                │
│  EGRESOS                 │
│  RETIROS                 │
│  DEVOLUCIONES            │
│                          │
└──────────────────────────┘
      ↓
ARQUEO
      ↓
ESPERADO vs CONTADO
      ↓
DIFERENCIA
      ↓
CIERRE
      ↓
RENDICIÓN
      ↓
TESORERÍA
```

---

# 88. REGLAS DE NEGOCIO

### Regla 1

Cada sucursal tiene una caja principal.

### Regla 2

Una caja puede tener varios POS asociados.

### Regla 3

El POS no es la caja.

### Regla 4

El vendedor no cierra caja.

### Regla 5

Toda sesión de caja debe tener responsable.

### Regla 6

No pueden existir dos sesiones activas para la misma caja.

### Regla 7

Toda apertura registra fondo inicial.

### Regla 8

Todo movimiento de efectivo debe quedar registrado.

### Regla 9

Los pagos no efectivos no aumentan el efectivo físico.

### Regla 10

Cada pago debe identificar su método.

### Regla 11

Cuando corresponda, cada pago debe identificar su cuenta financiera.

### Regla 12

Todo retiro debe registrar destino.

### Regla 13

Toda devolución en efectivo debe estar vinculada a una devolución.

### Regla 14

El saldo esperado se calcula a partir de movimientos.

### Regla 15

El arqueo compara esperado contra contado.

### Regla 16

Las diferencias no se ocultan.

### Regla 17

Cerrar con diferencia requiere registro del motivo cuando corresponda.

### Regla 18

Los movimientos confirmados no se editan silenciosamente.

### Regla 19

Las correcciones se realizan mediante movimientos compensatorios.

### Regla 20

Una venta no puede generar dos movimientos de cobro.

### Regla 21

Un cierre no puede duplicarse.

### Regla 22

Una rendición no elimina el historial de caja.

### Regla 23

Caja y Tesorería son módulos relacionados pero diferentes.

### Regla 24

Todas las operaciones críticas deben quedar auditadas.

---

# 89. CRITERIOS DE ACEPTACIÓN

El módulo será considerado correcto cuando permita:

### Apertura

Crear una sesión con fondo inicial.

### Operación

Registrar cobros provenientes del POS.

### Efectivo

Actualizar correctamente el efectivo esperado.

### No efectivo

Separar transferencias, QR y tarjetas del efectivo físico.

### Ingresos

Registrar ingresos manuales autorizados.

### Egresos

Registrar egresos con motivo.

### Retiros

Registrar retiros y destino.

### Arqueo

Realizar conteo físico.

### Diferencia

Mostrar faltante o sobrante.

### Cierre

Cerrar la sesión.

### Auditoría

Conservar historial completo.

### Rendición

Transferir dinero a tesorería sin perder trazabilidad.

### Seguridad

Impedir operaciones no autorizadas.

### Concurrencia

Evitar duplicación de movimientos.

---

# 90. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
Mock users
Mock sales
Mock payments
Mock cash movements
localStorage
```

Debe permitir demostrar:

```text
Apertura
↓
Cobro
↓
Retiro
↓
Arqueo
↓
Diferencia
↓
Cierre
```

---

## PRODUCCIÓN

Debe utilizar:

```text
PostgreSQL
Prisma
Transacciones
RBAC
AuditLog
CashRegister
CashRegisterSession
CashMovement
FinancialMovement
```

Debe contemplar:

```text
Concurrencia
Idempotencia
Integridad referencial
Historial inmutable
Autorizaciones
Conciliación
```

---

# 91. MODELO CONCEPTUAL

```text
Branch
  │
  ├── CashRegister
  │      │
  │      └── CashRegisterSession
  │               │
  │               ├── OpeningBalance
  │               ├── CashMovement
  │               ├── Payments
  │               ├── Withdrawals
  │               ├── Arqueo
  │               └── Closing
  │
  ├── POS
  │      │
  │      └── Sale
  │
  └── Users
```

---

# 92. RELACIÓN CON EL SISTEMA FINANCIERO

La caja no debe convertirse en el sistema financiero completo.

Su responsabilidad es controlar:

```text
EFECTIVO DE LA SUCURSAL
```

y registrar los cobros de las ventas.

El sistema financiero global se encargará posteriormente de:

```text
Caja Mayor
Bancos
Mercado Pago
Proveedores
Sueldos
Gastos
Transferencias
Cheques
Cuentas por pagar
Cuentas por cobrar
```

---

# 93. PRINCIPIO DE RESPONSABILIDAD

```text
POS
→ Operación comercial

CAJA
→ Cobro y efectivo de sucursal

TESORERÍA
→ Consolidación y control financiero

CUENTAS FINANCIERAS
→ Ubicación contable/operativa del dinero
```

No mezclar estas responsabilidades.

---

# 94. PRINCIPIO FINAL

El sistema debe poder reconstruir exactamente qué ocurrió con el dinero.

Ante cualquier cierre debe poder responder:

> ¿Quién abrió la caja?

> ¿Con cuánto dinero?

> ¿Qué ventas cobró?

> ¿Cuánto fue efectivo?

> ¿Cuánto fue transferencia?

> ¿Cuánto fue QR?

> ¿Cuánto fue tarjeta?

> ¿Qué ingresos manuales hubo?

> ¿Qué egresos hubo?

> ¿Cuánto dinero se retiró?

> ¿A dónde fue?

> ¿Cuánto debería haber físicamente?

> ¿Cuánto contó el cajero?

> ¿Hubo diferencia?

> ¿Quién autorizó el cierre?

> ¿Cuánto se rindió a Tesorería?

---

# 95. ARQUITECTURA OPERATIVA RESUMIDA

```text
                    ┌──────────────┐
                    │     POS      │
                    └──────┬───────┘
                           │
                           │ Venta
                           ▼
                    ┌──────────────┐
                    │     CAJA     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
           EFECTIVO    TRANSFERENCIA    QR
              │            │            │
              ▼            ▼            ▼
          Caja física   Banco/MP     Cuenta QR
              │
              ▼
          ARQUEO
              │
              ▼
           CIERRE
              │
              ▼
          RENDICIÓN
              │
              ▼
         TESORERÍA
```

**Regla arquitectónica central:**

> **Una venta puede tener múltiples pagos, pero cada componente del pago debe terminar en el lugar financiero correcto. El efectivo pertenece al control físico de Caja; los medios electrónicos pertenecen a sus respectivas cuentas financieras. El cierre de Caja determina qué debería existir físicamente; Tesorería determina dónde está y cómo se consolida el dinero de toda la empresa.**

---

**Estado:** DRAFT
**Versión:** 1.0
**Última actualización:** 2026-09-02
