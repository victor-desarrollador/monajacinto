# 12 — CUENTAS FINANCIERAS

**Archivo:** `12_CUENTAS_FINANCIERAS.md`
**Sistema:** Sistema de Gestión Multisucursal
**Módulo:** Cuentas Financieras
**Estado:** Especificación funcional
**Versión:** 1.0

---

# 1. PROPÓSITO

El módulo de **Cuentas Financieras** define y administra los lugares financieros donde la empresa mantiene, recibe, entrega o controla dinero y valores.

Una cuenta financiera representa una ubicación o instrumento financiero.

Ejemplos:

```text
Caja Mayor
Caja Sucursal Centro
Caja Sucursal Norte
Banco Galicia
Banco Macro
Mercado Pago
Cheques en cartera
```

El módulo debe permitir conocer:

> **Dónde está el dinero de la empresa.**

Y debe permitir relacionar cada cuenta con:

* Ventas.
* Pagos.
* Cajas.
* Tesorería.
* Transferencias.
* Gastos.
* Proveedores.
* Empleados.
* Devoluciones.
* Conciliaciones.

---

# 2. PRINCIPIO FUNDAMENTAL

Una cuenta financiera **no es simplemente un campo de saldo**.

Representa una entidad sobre la cual ocurren movimientos.

Principio:

> **El saldo de una cuenta es consecuencia de movimientos financieros registrados y auditables.**

No se debe permitir modificar directamente:

```text
Banco Galicia
Saldo = $5.000.000
```

El saldo debe surgir del ledger financiero.

---

# 3. TIPOS DE CUENTA

El sistema debe soportar como mínimo:

```text
CASH
BANK
DIGITAL_WALLET
VALUES
VIRTUAL
OTHER
```

## CASH

Dinero físico.

Ejemplos:

```text
Caja Mayor
Caja Sucursal Centro
Caja Sucursal Norte
```

---

## BANK

Cuenta bancaria.

Ejemplos:

```text
Banco Galicia
Banco Macro
Banco Nación
```

---

## DIGITAL_WALLET

Billeteras virtuales.

Ejemplos:

```text
Mercado Pago
Otra billetera
```

---

## VALUES

Valores recibidos pero que no representan efectivo disponible inmediato.

Ejemplo:

```text
Cheques en cartera
```

---

## VIRTUAL

Cuenta lógica utilizada para controlar determinados movimientos financieros internos.

Debe utilizarse solamente cuando exista una necesidad real de negocio.

No debe utilizarse para ocultar movimientos o crear saldos artificiales.

---

## OTHER

Otros tipos de cuentas financieras que puedan incorporarse posteriormente.

---

# 4. ENTIDAD FINANCIAL ACCOUNT

Entidad conceptual:

```text
FinancialAccount
```

Campos principales:

```text
id

name
code

type

institution
accountNumber
alias
currency

initialBalance

branchId

isCentral
isActive

createdAt
updatedAt
```

Campos sensibles como números completos de cuentas bancarias deben manejarse con controles de acceso apropiados.

---

# 5. NOMBRE

Cada cuenta debe tener un nombre identificable.

Ejemplos:

```text
Caja Mayor
Banco Galicia - Cuenta Corriente
Banco Macro - Cuenta Corriente
Mercado Pago Empresa
Cheques en Cartera
```

El nombre debe ser único dentro del contexto correspondiente.

---

# 6. CÓDIGO INTERNO

Cada cuenta debe poder tener un código interno.

Ejemplo:

```text
CAJA-MAYOR
CAJA-CENTRO
CAJA-NORTE
BANCO-GALICIA
BANCO-MACRO
MP-EMPRESA
CHEQUES-CARTERA
```

El código facilita:

* Integraciones.
* Reportes.
* Importaciones.
* Exportaciones.
* Automatizaciones.

---

# 7. INSTITUCIÓN

Para cuentas bancarias o billeteras se debe poder indicar la institución.

Ejemplo:

```text
institution:
Banco Galicia
```

O:

```text
institution:
Mercado Pago
```

No se debe asumir que el nombre de la cuenta es suficiente para identificar la institución.

---

# 8. DATOS BANCARIOS

Una cuenta bancaria puede contener:

```text
Banco
Tipo de cuenta
CBU
Alias
Número de cuenta
Moneda
Titular
```

Los datos sensibles deben estar protegidos.

La interfaz no debe mostrar información bancaria sensible a usuarios que no tengan permiso.

Puede mostrarse una versión parcial:

```text
CBU:
**** **** **** 4821
```

---

# 9. MONEDA

La primera versión puede trabajar principalmente con:

```text
ARS
```

La arquitectura debe permitir futuras monedas:

```text
USD
EUR
OTRAS
```

No se debe asumir que todas las cuentas futuras utilizarán pesos argentinos.

---

# 10. SALDO INICIAL

Una cuenta puede comenzar con un saldo inicial.

Ejemplo:

```text
Banco Galicia

Saldo inicial:
$2.000.000
```

El saldo inicial debe registrarse como una operación inicial auditable.

No debe simplemente escribirse sobre `currentBalance` sin explicación.

Conceptualmente:

```text
OPENING_BALANCE
```

---

# 11. SALDO ACTUAL

Una cuenta debe permitir obtener:

```text
currentBalance
```

Pero el valor debe ser consecuencia de movimientos.

Ejemplo:

```text
Saldo inicial       $1.000.000
Venta               +$300.000
Pago proveedor      -$200.000
Transferencia       -$100.000
--------------------------------
Saldo actual        $1.000.000
```

---

# 12. SALDO DISPONIBLE

El sistema debe diferenciar:

```text
Saldo contable
Saldo disponible
Saldo en tránsito
Saldo retenido
Valores
```

Ejemplo:

```text
Mercado Pago

Saldo contable:
$500.000

Retenido:
$50.000

Disponible:
$450.000
```

La implementación concreta de fondos retenidos dependerá de las integraciones futuras.

---

# 13. CUENTAS DE SUCURSAL

Una cuenta financiera puede estar asociada a una sucursal.

Ejemplo:

```text
Sucursal Centro
└── Caja Centro
```

Mientras que:

```text
Caja Mayor
```

puede ser una cuenta central sin una sucursal específica.

---

# 14. CUENTAS CENTRALES

Debe existir un concepto:

```text
isCentral
```

Ejemplo:

```text
Caja Mayor
isCentral = true
```

Esto permite diferenciar:

```text
Cuentas de sucursal
```

de:

```text
Cuentas centrales
```

---

# 15. RELACIÓN CON CAJAS

Una Caja de sucursal debe estar relacionada con una cuenta financiera de tipo:

```text
CASH
```

Ejemplo:

```text
CashRegister
      ↓
FinancialAccount

Caja Sucursal Centro
```

Esto permite conectar:

```text
Arqueo
Caja
Movimiento de efectivo
Cuenta financiera
Tesorería
```

---

# 16. NO DUPLICAR DINERO

Debe existir especial cuidado para no contabilizar dos veces el mismo dinero.

Ejemplo:

Una venta en efectivo:

```text
Venta
$100.000
```

Genera:

```text
Caja Sucursal
+$100.000
```

No debe además generar:

```text
Caja Mayor
+$100.000
```

salvo que posteriormente exista una transferencia/rendición real:

```text
Caja Sucursal
-$100.000

Caja Mayor
+$100.000
```

---

# 17. TRANSFERENCIAS ENTRE CUENTAS

Una transferencia entre cuentas propias debe tener:

```text
sourceAccountId
destinationAccountId
amount
date
reason
createdBy
approvedBy
status
reference
```

Ejemplo:

```text
Banco Galicia
-$500.000

Caja Mayor
+$500.000
```

La transferencia representa un movimiento entre dos cuentas.

No representa un ingreso económico nuevo.

---

# 18. TRANSFERENCIA ENTRE SUCURSAL Y TESORERÍA

Ejemplo:

```text
Caja Centro
    ↓
Caja Mayor
```

La operación debe registrar:

```text
Origen:
Caja Centro

Destino:
Caja Mayor

Importe:
$300.000

Motivo:
Rendición

Usuario:
Cajero

Aprobador:
Tesorería
```

---

# 19. TRANSFERENCIA ENTRE BANCOS

Ejemplo:

```text
Banco Galicia
      ↓
Banco Macro
```

Resultado:

```text
Galicia:
-$1.000.000

Macro:
+$1.000.000
```

Debe mantenerse una referencia común:

```text
transferId
```

---

# 20. MERCADO PAGO

Mercado Pago debe modelarse como una cuenta financiera.

Ejemplo:

```text
FinancialAccount

name:
Mercado Pago Empresa

type:
DIGITAL_WALLET

institution:
Mercado Pago
```

Las ventas mediante QR/transferencia pueden terminar en esta cuenta según la configuración comercial.

---

# 21. MÉTODO DE PAGO VS CUENTA

Debe mantenerse la separación:

```text
PaymentMethod
```

y:

```text
FinancialAccount
```

Ejemplo:

```text
Método:
QR

Cuenta:
Mercado Pago
```

Otro:

```text
Método:
TRANSFERENCIA

Cuenta:
Banco Galicia
```

Otro:

```text
Método:
EFECTIVO

Cuenta:
Caja Sucursal Centro
```

---

# 22. CUENTAS POR MÉTODO DE PAGO

El sistema puede permitir configurar una cuenta predeterminada.

Ejemplo:

```text
EFECTIVO
→ Caja de la sucursal

TRANSFERENCIA
→ Banco Galicia

QR
→ Mercado Pago

DÉBITO
→ Cuenta bancaria configurada
```

Pero el usuario autorizado debe poder seleccionar otra cuenta cuando corresponda.

---

# 23. CUENTAS PARA TARJETAS

Las tarjetas requieren especial cuidado.

El método:

```text
DÉBITO
CRÉDITO
```

no necesariamente implica acreditación inmediata.

Puede existir:

```text
Venta
↓
Pago con tarjeta
↓
Pendiente de acreditación
↓
Acreditación
↓
Cuenta bancaria
```

La arquitectura debe permitir posteriormente modelar:

* Operador.
* Terminal.
* Lote.
* Fecha de venta.
* Fecha estimada de acreditación.
* Comisión.
* Retenciones.
* Importe neto.

Esto puede ampliarse en módulos financieros posteriores.

---

# 24. CHEQUES EN CARTERA

Los cheques no deben mezclarse con efectivo.

Debe existir una cuenta:

```text
Cheques en Cartera
```

Tipo:

```text
VALUES
```

Ejemplo:

```text
Cliente entrega cheque:
$200.000

Caja:
NO +$200.000 efectivo

Cheques en cartera:
+$200.000
```

Cuando el cheque se deposita:

```text
Cheques en cartera
-$200.000

Banco Galicia
+$200.000
```

---

# 25. CHEQUE RECHAZADO

Si un cheque es rechazado:

```text
Banco
no confirma ingreso
```

Debe registrarse la incidencia correspondiente.

El sistema no debe simplemente eliminar el cheque.

Debe conservar:

```text
Cheque original
Movimiento
Estado
Motivo
Fecha
Usuario
```

---

# 26. CUENTAS INACTIVAS

Una cuenta que ya no se utiliza no debe eliminarse si tiene historial.

Debe poder marcarse:

```text
isActive = false
```

Ejemplo:

```text
Banco Antiguo
INACTIVA
```

No debe aparecer como opción para nuevas operaciones normales.

Pero debe seguir disponible para:

* Consultas.
* Reportes.
* Auditoría.
* Historial.

---

# 27. ELIMINACIÓN

Las cuentas con movimientos históricos no deben eliminarse físicamente.

Debe utilizarse:

```text
INACTIVE
```

o:

```text
ARCHIVED
```

según la arquitectura definitiva.

Esto preserva la integridad histórica.

---

# 28. CONFIGURACIÓN

El Super Admin debe poder configurar:

```text
Crear cuenta
Editar datos no históricos
Activar
Desactivar
Configurar moneda
Configurar institución
Asociar sucursal
Definir cuenta central
```

Los cambios sensibles deben quedar auditados.

---

# 29. PERMISOS

## CAJERO

Puede:

* Consultar su cuenta de caja.
* Registrar operaciones permitidas.
* Ver movimientos de su sesión.

No puede:

* Crear cuentas bancarias.
* Eliminar cuentas.
* Modificar saldos.
* Configurar cuentas centrales.

---

## ADMINISTRADOR

Puede:

* Consultar cuentas de su sucursal.
* Solicitar movimientos.
* Consultar historial.

---

## TESORERO

Puede:

* Crear cuentas financieras.
* Configurar cuentas.
* Realizar transferencias.
* Conciliar.
* Administrar Caja Mayor.
* Gestionar cuentas centrales.

---

## SUPER ADMIN

Puede:

* Administrar todas las cuentas.
* Configurar reglas.
* Modificar configuración global.
* Acceder a auditoría completa.

---

# 30. AUDITORÍA

Toda modificación importante debe generar un evento.

Ejemplo:

```text
CREATE_ACCOUNT
UPDATE_ACCOUNT
ACTIVATE_ACCOUNT
DEACTIVATE_ACCOUNT
TRANSFER
RECONCILIATION
OPENING_BALANCE
```

Debe registrarse:

```text
Usuario
Fecha
Cuenta
Campo modificado
Valor anterior
Valor nuevo
Motivo
```

---

# 31. CONCILIACIÓN

Cada cuenta financiera debe poder tener estado de conciliación.

Ejemplo:

```text
Banco Galicia

Sistema:
$2.500.000

Banco:
$2.480.000

Diferencia:
-$20.000
```

Debe poder registrarse:

```text
Fecha de conciliación
Saldo externo
Saldo sistema
Diferencia
Usuario
Observación
Estado
```

Estados:

```text
PENDING
IN_PROGRESS
RECONCILED
WITH_DIFFERENCE
```

---

# 32. HISTORIAL

Cada cuenta debe tener una vista de movimientos:

```text
Fecha
Tipo
Descripción
Entrada
Salida
Saldo
Referencia
Usuario
Estado
```

Ejemplo:

```text
03/09  Venta             +$100.000
03/09  Pago proveedor    -$50.000
03/09  Transferencia     -$20.000
03/09  Saldo             $130.000
```

---

# 33. FILTROS

Debe poder filtrarse por:

```text
Fecha
Tipo
Importe
Sucursal
Usuario
Método de pago
Referencia
Estado
```

---

# 34. REPORTES

Reportes mínimos:

### Saldo por cuenta

```text
Cuenta
Tipo
Saldo
Disponible
Estado
```

### Movimientos

Historial completo.

### Transferencias

Origen y destino.

### Conciliaciones

Estado y diferencias.

### Cuentas activas/inactivas

Control administrativo.

### Dinero por ubicación

```text
Caja
Banco
Billetera
Valores
```

---

# 35. VISTA GLOBAL

Debe existir una vista:

```text
CUENTAS FINANCIERAS

Caja Mayor             $X
Caja Centro            $X
Caja Norte             $X
Banco Galicia          $X
Banco Macro            $X
Mercado Pago           $X
Cheques en cartera     $X
--------------------------------
TOTAL                  $X
```

Pero el sistema debe distinguir:

```text
Efectivo
Fondos bancarios
Billeteras
Valores
Dinero en tránsito
```

No debe presentar todos los valores como si fueran equivalentes.

---

# 36. ESTADOS DE CUENTA

Una cuenta puede tener:

```text
ACTIVE
INACTIVE
BLOCKED
```

### ACTIVE

Puede utilizarse normalmente.

### INACTIVE

No permite nuevas operaciones normales.

### BLOCKED

No permite operaciones hasta autorización.

---

# 37. CUENTAS BLOQUEADAS

Una cuenta puede bloquearse por:

* Conciliación pendiente.
* Sospecha de error.
* Cierre administrativo.
* Problemas con la cuenta.
* Decisión del administrador.

Bloquear una cuenta no debe borrar su historial.

---

# 38. INTEGRIDAD

No se debe permitir:

```text
Transferencia
sin cuenta origen
```

Ni:

```text
Transferencia
sin cuenta destino
```

Ni:

```text
Transferencia
origen = destino
```

Tampoco:

```text
Importe <= 0
```

---

# 39. SALDO NEGATIVO

Por defecto:

```text
saldo negativo = NO PERMITIDO
```

excepto cuando una cuenta tenga explícitamente configurada capacidad de sobregiro o comportamiento equivalente.

Si se habilita:

```text
allowNegativeBalance
```

debe existir:

```text
permission
audit
limit
```

---

# 40. PRECISIÓN MONETARIA

Los importes monetarios no deben almacenarse utilizando tipos de datos de punto flotante.

Debe utilizarse una representación decimal apropiada para dinero.

Ejemplo conceptual:

```text
Decimal(18,2)
```

La implementación exacta queda definida en:

```text
24_MODELO_DE_DATOS.md
```

---

# 41. CONCURRENCIA

Dos operaciones simultáneas sobre una misma cuenta deben controlarse.

Ejemplo:

```text
Usuario A:
retira $100.000

Usuario B:
retira $100.000
```

Si el saldo disponible es solamente:

```text
$150.000
```

el sistema no debe permitir que ambas operaciones pasen incorrectamente.

La operación debe utilizar transacciones y mecanismos de concurrencia apropiados.

---

# 42. IDEMPOTENCIA

Las operaciones que crean movimientos financieros deben ser idempotentes.

Ejemplo:

```text
idempotencyKey:
SALE-123-PAYMENT-1
```

Si la misma operación se procesa dos veces:

```text
Primer intento → movimiento creado

Segundo intento → movimiento existente
```

No:

```text
+$100.000
+$100.000
```

---

# 43. INTEGRACIÓN CON TESORERÍA

Tesorería utiliza estas cuentas para construir:

```text
Dinero total
Dinero disponible
Dinero por ubicación
Ingresos
Egresos
Transferencias
```

Relación:

```text
FinancialAccount
      ↓
FinancialMovement
      ↓
Treasury
```

---

# 44. INTEGRACIÓN CON CAJA

```text
CashRegister
      ↓
CashRegisterSession
      ↓
CashMovement
      ↓
FinancialAccount
      ↓
FinancialMovement
```

Esto permite relacionar el efectivo físico con la cuenta financiera correspondiente.

---

# 45. INTEGRACIÓN CON VENTAS

Ejemplo:

```text
Sale
 ↓
Payment
 ↓
FinancialAccount
 ↓
FinancialMovement
```

Venta de:

```text
$150.000
```

Pago:

```text
Efectivo:
$50.000

Transferencia:
$100.000
```

Resultado:

```text
Caja:
+$50.000

Banco:
+$100.000
```

---

# 46. INTEGRACIÓN CON PAGOS A PROVEEDORES

```text
SupplierPayment
      ↓
FinancialMovement
      ↓
FinancialAccount
```

Ejemplo:

```text
Proveedor:
$500.000

Pago:
Banco Galicia

Banco Galicia:
-$500.000
```

---

# 47. INTEGRACIÓN CON GASTOS

```text
Expense
   ↓
FinancialMovement
   ↓
FinancialAccount
```

Ejemplo:

```text
Gasto:
$50.000

Origen:
Caja Mayor

Caja Mayor:
-$50.000
```

---

# 48. INTEGRACIÓN CON DEVOLUCIONES

Ejemplo:

```text
Refund
   ↓
Payment
   ↓
FinancialMovement
   ↓
FinancialAccount
```

Si se devuelve efectivo:

```text
Caja:
-$30.000
```

Si se devuelve desde una cuenta bancaria:

```text
Banco:
-$30.000
```

---

# 49. REGLAS DE NEGOCIO

### Regla 1

Una cuenta financiera representa una ubicación/instrumento financiero.

### Regla 2

El saldo no debe editarse directamente.

### Regla 3

Las cuentas con historial no se eliminan físicamente.

### Regla 4

Toda transferencia tiene origen y destino.

### Regla 5

Una transferencia interna no representa ingreso económico.

### Regla 6

Los cheques no son efectivo.

### Regla 7

Método de pago y cuenta financiera son conceptos diferentes.

### Regla 8

Las operaciones financieras deben ser auditables.

### Regla 9

Los importes deben utilizar precisión decimal.

### Regla 10

Las operaciones críticas deben ejecutarse mediante transacciones.

### Regla 11

Las operaciones críticas deben ser idempotentes.

### Regla 12

Las cuentas de sucursal deben poder distinguirse de las cuentas centrales.

---

# 50. MODELO CONCEPTUAL

```text
                    FINANCIAL ACCOUNT
                           │
            ┌──────────────┼──────────────┐
            │              │              │
           CASH           BANK       DIGITAL_WALLET
            │              │              │
       Caja Centro     Galicia       Mercado Pago
       Caja Norte      Macro
       Caja Mayor
            │              │              │
            └──────────────┼──────────────┘
                           │
                  FINANCIAL MOVEMENT
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
        VENTA            PAGO            TRANSFERENCIA
          │                │                 │
        Payment         Supplier          Account
```

---

# 51. EJEMPLO COMPLETO

La empresa tiene:

```text
Caja Mayor:
$1.000.000

Banco Galicia:
$5.000.000

Mercado Pago:
$800.000

Caja Centro:
$300.000

Cheques:
$500.000
```

Total financiero registrado:

```text
$7.600.000
```

Pero el dashboard debe poder distinguir:

```text
Efectivo:
$1.300.000

Bancos:
$5.000.000

Billeteras:
$800.000

Valores:
$500.000
```

Si existen fondos en tránsito:

```text
En tránsito:
$200.000
```

no deben mezclarse automáticamente con el dinero disponible.

---

# 52. DEMO

La demo debe incluir:

## Caso 1 — Crear Banco

```text
Banco Galicia
BANK
ARS
ACTIVO
```

## Caso 2 — Crear Caja Mayor

```text
Caja Mayor
CASH
ARS
CENTRAL
```

## Caso 3 — Crear Mercado Pago

```text
Mercado Pago
DIGITAL_WALLET
ARS
CENTRAL
```

## Caso 4 — Crear Cheques

```text
Cheques en Cartera
VALUES
ARS
```

## Caso 5 — Transferencia

```text
Galicia
-$500.000

Caja Mayor
+$500.000
```

## Caso 6 — Desactivar cuenta

```text
Banco antiguo
INACTIVE
```

El historial debe continuar disponible.

---

# 53. CRITERIOS DE ACEPTACIÓN

El módulo será considerado funcional cuando:

* [ ] Se puedan crear cuentas financieras.
* [ ] Se puedan clasificar por tipo.
* [ ] Se puedan asociar a sucursales.
* [ ] Se puedan identificar cuentas centrales.
* [ ] Se pueda configurar moneda.
* [ ] Se pueda registrar saldo inicial.
* [ ] Se puedan consultar movimientos.
* [ ] Se puedan realizar transferencias.
* [ ] Se puedan activar/desactivar cuentas.
* [ ] Se puedan bloquear cuentas.
* [ ] Exista auditoría.
* [ ] No se puedan eliminar cuentas con historial.
* [ ] Exista conciliación.
* [ ] Se puedan consultar saldos.
* [ ] Se diferencie saldo disponible.
* [ ] Se diferencien valores.
* [ ] Se diferencie dinero en tránsito.
* [ ] Se diferencie método de pago y cuenta financiera.
* [ ] Se controle saldo negativo.
* [ ] Exista control de concurrencia.
* [ ] Exista idempotencia.
* [ ] Existan permisos por rol.
* [ ] Existan reportes.
* [ ] Exista exportación.

---

# 54. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

```text
Mock data
localStorage
datos simulados
saldos iniciales
transferencias simuladas
```

No requiere:

```text
Integración bancaria real
API Mercado Pago
Conciliación automática real
Procesamiento de tarjetas real
```

---

## PRODUCCIÓN

Debe utilizar:

```text
PostgreSQL
Prisma
Decimal
Transacciones
RBAC
AuditLog
FinancialMovement
FinancialAccount
Idempotency
Control de concurrencia
Backups
Logs
```

---

# 55. RELACIÓN CON EL RESTO DEL SISTEMA

```text
09_VENTAS_Y_POS.md
        │
        ▼
10_CAJAS_Y_ARQUEOS.md
        │
        ▼
11_TESORERIA_Y_CAJA_MAYOR.md
        │
        ▼
12_CUENTAS_FINANCIERAS.md
        │
        ▼
13_PAGOS_Y_MOVIMIENTOS_DINERO.md
```

También se relaciona con:

```text
07_COMPRAS_Y_PROVEEDORES.md
08_TRANSFERENCIAS_Y_REMITOS.md
14_RESERVAS_Y_SEÑAS.md
16_CAMBIOS_Y_DEVOLUCIONES.md
17_EMPLEADOS_Y_SUELDOS.md
19_FACTURACION_ARCA.md
20_REPORTES_Y_EXPORTACIONES.md
21_AUDITORIA_Y_TRAZABILIDAD.md
24_MODELO_DE_DATOS.md
25_ARQUITECTURA_TECNICA.md
```

---

# 56. PRINCIPIO FINAL

El sistema debe poder responder:

> **¿Qué cuentas financieras existen?**

> **¿Qué tipo de cuenta es cada una?**

> **¿Dónde está cada peso?**

> **¿Qué movimientos afectaron cada cuenta?**

> **¿Cuánto dinero está realmente disponible?**

> **¿Qué dinero está en tránsito?**

> **¿Qué valores están en cartera?**

> **¿Quién realizó cada movimiento?**

La arquitectura debe seguir:

```text
FinancialAccount
       ↓
FinancialMovement
       ↓
Saldo
       ↓
Tesorería
```

Nunca:

```text
Saldo editable
```

La cuenta financiera es la **estructura que ubica el dinero**; el movimiento financiero es lo que **explica cómo cambió ese dinero**.
