# 17_EMPLEADOS_Y_SUELDOS.md

# VM DIGITAL STUDIO — SISTEMA DE GESTIÓN MULTISUCURSAL

## Módulo 17 — Empleados y Sueldos

**Versión:** 1.0
**Estado:** Especificación funcional
**Prioridad:** Alta
**Dependencias:** Usuarios, sucursales, cajas, tesorería, cuentas financieras, auditoría

---

## 1. OBJETIVO

El módulo de **Empleados y Sueldos** administra la información laboral y los movimientos económicos relacionados con los empleados de la empresa.

El sistema debe permitir:

* Registrar empleados.
* Asociarlos a una sucursal.
* Asociarlos a un usuario del sistema.
* Definir cargo y rol operativo.
* Registrar fecha de ingreso y estado laboral.
* Administrar salarios.
* Registrar anticipos.
* Registrar descuentos.
* Registrar bonos/comisiones.
* Registrar pagos de sueldo.
* Registrar compras realizadas por empleados.
* Mantener historial de cambios salariales.
* Relacionar pagos con Tesorería.
* Identificar quién autorizó cada operación.
* Mantener trazabilidad completa.

### Principio fundamental

> **Empleado, usuario del sistema y movimiento de dinero son conceptos diferentes.**

Un empleado puede tener un usuario del sistema, pero no necesariamente debe tenerlo.

Un pago de sueldo no modifica directamente un saldo.

Debe generar un **FinancialMovement** trazable.

---

# 2. ALCANCE

El módulo contempla:

### Datos laborales

* Legajo.
* Nombre y apellido.
* Documento.
* Teléfono.
* Email.
* Fecha de ingreso.
* Fecha de egreso.
* Sucursal.
* Cargo.
* Estado.
* Usuario asociado.

### Remuneración

* Salario base.
* Tipo de remuneración.
* Vigencia.
* Bonificaciones.
* Comisiones.
* Descuentos.
* Anticipos.
* Ajustes.

### Liquidación

* Período.
* Salario bruto.
* Bonificaciones.
* Comisiones.
* Descuentos.
* Anticipos.
* Neto a pagar.
* Estado de liquidación.

### Pago

* Método de pago.
* Cuenta financiera utilizada.
* Fecha.
* Importe.
* Referencia.
* Usuario que ejecutó el pago.
* Usuario que autorizó.

### Auditoría

Toda modificación sensible debe quedar registrada.

---

# 3. EMPLEADO VS USUARIO

No debe utilizarse la tabla `User` como sustituto de `Employee`.

## Employee

Representa a la persona que trabaja para la empresa.

## User

Representa a una persona autorizada a utilizar el sistema.

Relación:

```text
Employee
   │
   └── User (opcional)
```

Ejemplo:

```text
Empleado:
María González
Cargo: Vendedora
Sucursal: Centro

Usuario:
maria.gonzalez
Rol: SELLER
```

También puede existir:

```text
Empleado:
Juan Pérez
Cargo: Personal de depósito

Usuario:
NULL
```

si no necesita acceder al sistema.

---

# 4. IDENTIFICACIÓN DEL EMPLEADO

Cada empleado debe tener:

```text
employeeId
employeeCode
firstName
lastName
documentNumber
phone
email
```

El `employeeCode` debe ser único.

Ejemplo:

```text
EMP-0001
EMP-0002
EMP-0003
```

El sistema no debe depender exclusivamente del DNI como identificador interno.

---

# 5. ESTADO DEL EMPLEADO

Estados mínimos:

```text
ACTIVE
INACTIVE
SUSPENDED
TERMINATED
```

### ACTIVE

Puede trabajar normalmente.

### INACTIVE

Empleado registrado pero actualmente inactivo.

### SUSPENDED

No debería operar mientras permanezca suspendido, según permisos configurados.

### TERMINATED

Relación laboral finalizada.

---

# 6. SUCURSAL

Cada empleado puede tener una sucursal principal.

```text
Employee
   ↓
Branch
```

Ejemplo:

```text
María González
Sucursal Centro
```

Sin embargo, el sistema debe permitir eventualmente que un empleado pueda trabajar temporalmente en otra sucursal.

Por eso no debe utilizarse exclusivamente `employee.branchId` para determinar dónde realizó una operación.

Las operaciones deben guardar su propia referencia a:

```text
branchId
```

cuando corresponda.

---

# 7. CARGOS

Debe existir una estructura configurable de cargos.

Ejemplos:

```text
VENDEDOR
CAJERO
ENCARGADO
DEPOSITO
ADMINISTRATIVO
TESORERIA
SUPERVISOR
GERENTE
```

El cargo laboral no necesariamente equivale al rol técnico del sistema.

Ejemplo:

```text
Cargo:
Encargado de sucursal

Rol:
BRANCH_MANAGER
```

---

# 8. REMUNERACIÓN

El sistema debe mantener el historial de remuneraciones.

No se debe sobrescribir simplemente:

```text
salary = 500000
```

sin conservar el valor anterior.

Debe existir una estructura histórica.

Ejemplo:

```text
SalaryHistory

Empleado: EMP-0001

01/01/2026 → $500.000
01/04/2026 → $600.000
01/08/2026 → $700.000
```

Cada modificación debe registrar:

```text
employeeId
previousAmount
newAmount
effectiveFrom
reason
createdBy
createdAt
```

---

# 9. TIPO DE REMUNERACIÓN

El sistema debe permitir diferentes modalidades.

Ejemplos:

```text
MONTHLY
WEEKLY
DAILY
HOURLY
COMMISSION
MIXED
OTHER
```

Para el demo se puede utilizar principalmente:

```text
MONTHLY
```

pero el modelo debe quedar preparado para futuras modalidades.

---

# 10. BONIFICACIONES

Una liquidación puede incluir conceptos adicionales.

Ejemplos:

```text
BONUS
COMMISSION
ATTENDANCE_BONUS
PERFORMANCE_BONUS
OTHER
```

Cada concepto debe registrar:

```text
description
amount
```

y estar vinculado a la liquidación correspondiente.

---

# 11. DESCUENTOS

Los descuentos deben estar separados del salario base.

Ejemplos:

```text
ADVANCE
ABSENCE
LOAN
OTHER
```

No se debe modificar artificialmente el salario base para representar un descuento.

---

# 12. ANTICIPOS

El empleado puede recibir un anticipo antes del pago final.

Ejemplo:

```text
Salario:
$700.000

Anticipo:
$200.000

Saldo:
$500.000
```

El anticipo debe generar:

1. Registro de anticipo.
2. Payment.
3. FinancialMovement.
4. Relación con Employee.
5. Auditoría.

No debe registrarse simplemente como un descuento manual.

---

# 13. LIQUIDACIÓN

Debe existir una entidad conceptual:

```text
Payroll
```

o:

```text
SalarySettlement
```

Cada liquidación corresponde a un período.

Ejemplo:

```text
Período:
Agosto 2026

Empleado:
EMP-0001

Salario base:
$700.000

Bonificaciones:
$50.000

Comisiones:
$30.000

Descuentos:
$20.000

Anticipos:
$200.000

Neto:
$560.000
```

---

# 14. ESTADOS DE LIQUIDACIÓN

Estados:

```text
DRAFT
CALCULATED
PENDING_APPROVAL
APPROVED
PARTIALLY_PAID
PAID
CANCELLED
```

### DRAFT

Liquidación en preparación.

### CALCULATED

Los importes fueron calculados.

### PENDING_APPROVAL

Espera autorización.

### APPROVED

Autorizada para pago.

### PARTIALLY_PAID

Se pagó parcialmente.

### PAID

Pago completo realizado.

### CANCELLED

Cancelada mediante proceso autorizado.

---

# 15. ESTRUCTURA DE UNA LIQUIDACIÓN

Conceptualmente:

```text
Payroll
 ├── Employee
 ├── Period
 ├── Base Salary
 ├── Bonuses
 ├── Commissions
 ├── Discounts
 ├── Advances
 ├── Gross Amount
 ├── Net Amount
 └── Payments
```

---

# 16. CÁLCULO

El cálculo conceptual será:

```text
Bruto
= Salario base
+ Bonificaciones
+ Comisiones
```

Luego:

```text
Neto antes de anticipos
= Bruto
- Descuentos
```

Finalmente:

```text
Saldo a pagar
= Neto antes de anticipos
- Anticipos aplicados
```

El sistema debe conservar cada componente.

No debe guardar únicamente el resultado final.

---

# 17. ACLARACIÓN SOBRE LEGISLACIÓN LABORAL

El sistema debe diferenciar entre:

### Gestión interna

* Registro de salarios.
* Anticipos.
* Bonificaciones.
* Descuentos.
* Pagos.
* Historial.

### Liquidación laboral/legal

Incluye potencialmente:

* Convenios colectivos.
* Aportes.
* Contribuciones.
* Retenciones.
* Impuestos.
* SAC.
* Vacaciones.
* Licencias.
* Otros conceptos legales.

Estos conceptos requieren reglas específicas y eventualmente integración con sistemas externos.

Por lo tanto:

> La primera versión del sistema no debe asumir automáticamente que una liquidación interna equivale a una liquidación laboral legal completa.

---

# 18. PAGO DE SUELDO

El pago debe estar vinculado a:

```text
Employee
Payroll
Payment
FinancialMovement
FinancialAccount
```

Ejemplo:

```text
Liquidación:
Agosto 2026

Empleado:
María González

Neto:
$700.000

Pago:
Transferencia

Cuenta:
Banco Galicia

Importe:
$700.000
```

---

# 19. MÉTODOS DE PAGO

Se reutilizan los métodos financieros existentes:

```text
EFECTIVO
TRANSFERENCIA
QR
DEBITO
CREDITO
CHEQUE
OTRO
```

Para sueldos normalmente se utilizarán:

```text
EFECTIVO
TRANSFERENCIA
```

---

# 20. CUENTA FINANCIERA

El pago debe indicar desde dónde salió el dinero.

Ejemplo:

```text
Payment Method:
TRANSFERENCIA

Financial Account:
BANCO GALICIA
```

No debe confundirse:

```text
Payment Method = TRANSFERENCIA
```

con:

```text
FinancialAccount = BANCO GALICIA
```

---

# 21. MOVIMIENTO FINANCIERO

El pago genera:

```text
FinancialMovement
```

Ejemplo:

```text
Type:
EMPLOYEE_SALARY

Direction:
OUT

Amount:
700000

Employee:
EMP-0001

Source Account:
BANCO GALICIA

Reference:
PAYROLL-2026-08-0001
```

Esto permite responder:

> ¿Cuánto dinero salió de Banco Galicia en concepto de sueldos?

---

# 22. ANTICIPO + SUELDO

Ejemplo:

```text
Salario:
$700.000

Anticipo:
$200.000

Saldo:
$500.000
```

El sistema debe registrar:

```text
Movimiento 1:
EMPLOYEE_ADVANCE
OUT
$200.000

Movimiento 2:
EMPLOYEE_SALARY
OUT
$500.000
```

La liquidación muestra:

```text
Total:
$700.000

Anticipos:
$200.000

Saldo:
$500.000
```

No deben contabilizarse nuevamente los $200.000 como gasto al momento de aplicarlos a la liquidación.

---

# 23. PAGOS PARCIALES

Debe permitirse, si la empresa lo habilita:

```text
Sueldo:
$700.000
```

Pago 1:

```text
$400.000
```

Pago 2:

```text
$300.000
```

Estado:

```text
PARTIALLY_PAID
```

Después del segundo pago:

```text
PAID
```

---

# 24. COMBINACIÓN DE MEDIOS

También puede existir:

```text
Sueldo:
$700.000

Efectivo:
$200.000

Transferencia:
$500.000
```

La suma debe coincidir exactamente:

```text
200000 + 500000 = 700000
```

---

# 25. COMPRAS REALIZADAS POR EMPLEADOS

Las compras de empleados son un proceso diferente al pago de sueldo.

Ejemplo:

```text
Empleado compra:
$50.000
```

La empresa puede permitir:

```text
Descontar del próximo sueldo
```

Pero la compra debe existir como operación independiente.

Relación:

```text
EmployeePurchase
      ↓
Employee
      ↓
Payroll
```

si posteriormente se aplica como descuento.

---

# 26. EMPLOYEE PURCHASE

Campos conceptuales:

```text
employeePurchaseId
employeeId
date
amount
description
status
paymentMethod
financialAccountId
payrollId
createdBy
approvedBy
createdAt
```

Estados posibles:

```text
PENDING
APPROVED
PAID
TO_BE_DEDUCTED
DEDUCTED
CANCELLED
```

---

# 27. DESCUENTO POR COMPRA

Ejemplo:

```text
Compra empleado:
$50.000

Liquidación:
$700.000
```

La liquidación puede mostrar:

```text
Salario:
$700.000

Descuento compra empleado:
-$50.000

Neto:
$650.000
```

La compra original permanece intacta.

---

# 28. VENTAS A EMPLEADOS

Las ventas de productos a empleados serán tratadas principalmente por el módulo:

```text
18_VENTAS_DE_EMPLEADOS.md
```

Este módulo debe encargarse de la relación laboral y salarial.

No duplicar la lógica de venta.

---

# 29. PERMISOS

### SELLER

No puede administrar salarios.

### CASHIER

Puede ejecutar pagos autorizados si la política lo permite.

### BRANCH_MANAGER

Puede consultar empleados de su sucursal y solicitar operaciones.

### TREASURER

Puede administrar pagos y movimientos financieros.

### ADMIN

Puede administrar empleados.

### SUPER_ADMIN

Acceso completo.

---

# 30. AUTORIZACIONES

Operaciones sensibles:

* Modificar salario.
* Aprobar liquidación.
* Registrar descuentos.
* Aprobar anticipos.
* Pagar sueldo.
* Cancelar pago.
* Modificar información laboral.

pueden requerir autorización.

Ejemplo:

```text
CREATED
   ↓
PENDING_APPROVAL
   ↓
APPROVED
   ↓
PAID
```

---

# 31. AUDITORÍA

Debe registrarse:

```text
Quién
Qué
Cuándo
Antes
Después
Motivo
```

Ejemplo:

```text
Empleado:
EMP-0001

Cambio:
Salario

Anterior:
$600.000

Nuevo:
$700.000

Motivo:
Actualización salarial

Usuario:
SUPER_ADMIN

Fecha:
2026-08-01
```

---

# 32. NO BORRAR HISTORIAL

No se debe eliminar:

* Liquidaciones pagadas.
* Pagos.
* Anticipos.
* Movimientos financieros.
* Cambios salariales.
* Compras de empleados.

Si una operación fue incorrecta:

> Se corrige mediante una nueva operación compensatoria.

---

# 33. INTEGRACIÓN CON TESORERÍA

El módulo debe integrarse con:

```text
11_TESORERIA_Y_CAJA_MAYOR.md
12_CUENTAS_FINANCIERAS.md
13_PAGOS_Y_MOVIMIENTOS_DINERO.md
```

Flujo:

```text
Payroll
   ↓
Approval
   ↓
Payment
   ↓
FinancialMovement
   ↓
FinancialAccount
```

---

# 34. INTEGRACIÓN CON CAJA

Si un sueldo se paga en efectivo:

```text
Payroll
   ↓
Payment
   ↓
FinancialMovement
   ↓
CashRegister / CashRegisterSession
```

Debe reflejarse en la caja correspondiente.

Ejemplo:

```text
CAJA CENTRO

SALIDA:
Pago sueldo EMP-0001
$700.000
```

---

# 35. INTEGRACIÓN CON CUENTAS BANCARIAS

Si se paga por transferencia:

```text
Payroll
   ↓
Payment
   ↓
FinancialMovement
   ↓
BANCO GALICIA
```

La cuenta financiera disminuye.

---

# 36. REPORTES

Debe permitir:

### Empleados

* Empleados activos.
* Empleados por sucursal.
* Empleados por cargo.
* Empleados inactivos.

### Sueldos

* Total mensual.
* Total por sucursal.
* Total por empleado.
* Total por período.
* Salarios pendientes.
* Salarios pagados.
* Pagos parciales.

### Anticipos

* Total de anticipos.
* Anticipos pendientes.
* Anticipos aplicados.

### Descuentos

* Descuentos por empleado.
* Compras descontadas.
* Otros descuentos.

### Tesorería

* Dinero destinado a sueldos.
* Pagos por cuenta financiera.
* Pagos en efectivo.
* Pagos por transferencia.

---

# 37. DASHBOARD

El dashboard puede mostrar:

```text
EMPLEADOS ACTIVOS
42

LIQUIDACIÓN DEL MES
$18.500.000

PAGADO
$15.200.000

PENDIENTE
$3.300.000

ANTICIPOS
$1.200.000
```

También:

```text
POR SUCURSAL

Centro      $7.200.000
Norte       $5.100.000
Sur         $6.200.000
```

---

# 38. FILTROS

Filtros mínimos:

```text
Sucursal
Empleado
Cargo
Estado
Período
Estado de liquidación
Método de pago
Cuenta financiera
```

---

# 39. EXPORTACIONES

Los reportes deben poder exportarse a:

```text
CSV
XLSX
```

Especialmente:

* Nómina.
* Liquidaciones.
* Pagos.
* Anticipos.
* Descuentos.
* Historial salarial.

---

# 40. SEGURIDAD

Los datos laborales son sensibles.

El sistema debe aplicar:

* Control de acceso por rol.
* Restricción por sucursal.
* Registro de auditoría.
* Protección de datos personales.
* No mostrar información salarial innecesariamente.
* No permitir que un vendedor vea salarios de otros empleados.
* No permitir modificar movimientos financieros históricos.

---

# 41. CONCURRENCIA

En producción:

* Una liquidación no debe poder pagarse dos veces simultáneamente.
* Un anticipo no debe aplicarse dos veces.
* Un pago debe ser idempotente.
* Las transacciones financieras deben utilizar transacciones de base de datos.
* El estado debe cambiar atómicamente.

Ejemplo:

```text
APPROVED
   ↓
PAYMENT_IN_PROGRESS
   ↓
PAID
```

No debe existir la posibilidad de generar dos pagos por una misma liquidación debido a doble clic o solicitudes simultáneas.

---

# 42. MODELO CONCEPTUAL

```text
Employee
   │
   ├── User
   ├── Branch
   ├── SalaryHistory
   ├── Advance
   ├── EmployeePurchase
   │
   └── Payroll
          │
          ├── PayrollItem
          ├── Bonus
          ├── Discount
          ├── AdvanceApplication
          │
          └── Payment
                 │
                 └── FinancialMovement
                        │
                        └── FinancialAccount
```

---

# 43. FLUJO COMPLETO

```text
Empleado activo
      ↓
Definición salarial
      ↓
Período mensual
      ↓
Cálculo
      ↓
Bonificaciones
      ↓
Descuentos
      ↓
Aplicación de anticipos
      ↓
Neto
      ↓
Aprobación
      ↓
Pago
      ↓
FinancialMovement
      ↓
Cuenta financiera
      ↓
Auditoría
```

---

# 44. ESCENARIO DEMO

### Crear empleado

```text
Nombre:
María González

Cargo:
Vendedora

Sucursal:
Centro

Salario:
$700.000
```

### Registrar anticipo

```text
Anticipo:
$200.000

Método:
Transferencia

Cuenta:
Banco Galicia
```

### Crear liquidación

```text
Período:
Agosto 2026

Base:
$700.000

Anticipo:
$200.000

Neto:
$500.000
```

### Aprobar

```text
PENDING_APPROVAL
        ↓
APPROVED
```

### Pagar

```text
Transferencia
Banco Galicia
$500.000
```

### Resultado

```text
Payroll:
PAID

FinancialMovement:
EMPLOYEE_SALARY / OUT / $500.000
```

---

# 45. REGLAS DE NEGOCIO

### Regla 1

Un empleado no es necesariamente un usuario.

### Regla 2

Un usuario no debe utilizarse como registro laboral.

### Regla 3

El salario debe mantener historial.

### Regla 4

Un anticipo debe ser una operación independiente.

### Regla 5

Una compra de empleado debe ser una operación independiente.

### Regla 6

Una liquidación no modifica directamente una cuenta financiera.

### Regla 7

El pago genera un FinancialMovement.

### Regla 8

El pago debe indicar método y cuenta financiera.

### Regla 9

Los pagos parciales deben estar soportados.

### Regla 10

No se deben borrar pagos históricos.

### Regla 11

Las correcciones se realizan mediante operaciones compensatorias.

### Regla 12

Toda operación financiera debe ser auditable.

### Regla 13

Los datos salariales deben estar restringidos por permisos.

### Regla 14

Una liquidación pagada no puede volver a pagarse.

### Regla 15

La suma de los pagos debe coincidir con el importe correspondiente.

---

# 46. DEMO VS PRODUCCIÓN

## DEMO

Se puede implementar:

* CRUD de empleados.
* Sucursales.
* Cargos.
* Salarios.
* Historial salarial.
* Anticipos.
* Liquidación simplificada.
* Bonificaciones.
* Descuentos.
* Pago simulado.
* FinancialMovement simulado.
* Dashboard.
* Auditoría simulada.

No es necesario implementar:

* Liquidación laboral legal completa.
* Integraciones bancarias.
* Transferencias bancarias reales.
* Cálculos legales complejos.
* Automatización fiscal laboral.

## PRODUCCIÓN

Debe incorporarse:

* PostgreSQL.
* Prisma.
* Control transaccional.
* RBAC.
* Auditoría completa.
* Integración real con Tesorería.
* Reglas laborales definidas por la empresa.
* Seguridad de información.
* Backup.
* Reconciliación financiera.
* Integraciones externas cuando correspondan.

---

# 47. CRITERIOS DE ACEPTACIÓN

El módulo será considerado funcional cuando:

* [ ] Se pueda crear un empleado.
* [ ] Se pueda asignar sucursal.
* [ ] Se pueda asignar cargo.
* [ ] Se pueda asociar usuario opcionalmente.
* [ ] Se pueda registrar salario.
* [ ] Se conserve historial salarial.
* [ ] Se pueda registrar anticipo.
* [ ] Se pueda crear una liquidación.
* [ ] Se puedan agregar bonos.
* [ ] Se puedan agregar descuentos.
* [ ] Se puedan aplicar anticipos.
* [ ] Se pueda aprobar una liquidación.
* [ ] Se pueda registrar pago.
* [ ] El pago genere movimiento financiero.
* [ ] El pago quede vinculado a una cuenta financiera.
* [ ] Se soporten pagos parciales.
* [ ] Se registre auditoría.
* [ ] No se puedan borrar operaciones históricas.
* [ ] Se puedan consultar reportes.
* [ ] Se puedan exportar datos.
* [ ] Los permisos funcionen correctamente.

---

# 48. PRINCIPIO FINAL

El módulo debe responder claramente:

> **¿Quién trabaja en la empresa, cuánto corresponde pagarle, qué anticipos/descuentos tiene, cuánto se pagó realmente y de dónde salió el dinero?**

La arquitectura debe mantener separadas:

```text
Empleado
   ↓
Liquidación
   ↓
Pago
   ↓
Movimiento financiero
   ↓
Cuenta financiera
```

Esta separación es fundamental para mantener consistencia contable, trazabilidad y escalabilidad.
