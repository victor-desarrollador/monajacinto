# SISTEMA DE GESTIÓN MULTISUCURSAL

## 03 — SUCURSALES Y POS

**Documento:** `03_SUCURSALES_Y_POS.md`
**Versión:** 1.0
**Estado:** Draft
**Depende de:** `00_MASTER_SPEC.md`, `01_VISION_Y_ALCANCE.md`, `02_ROLES_Y_PERMISOS.md`

---

# 1. PROPÓSITO

Este documento define la estructura organizativa y operativa de las sucursales, cajas registradoras y terminales POS.

El sistema debe representar correctamente una empresa con:

* 1 empresa.
* 5 sucursales.
* 1 depósito/almacén central.
* 1 caja por sucursal.
* 2–3 terminales POS por sucursal.
* Múltiples vendedores.
* Uno o más cajeros según operación.
* Administración y tesorería central.

La arquitectura debe permitir agregar nuevas sucursales y POS sin modificar el modelo fundamental del sistema.

---

# 2. ESTRUCTURA ORGANIZACIONAL

La estructura principal será:

```text
EMPRESA
│
├── DEPÓSITO CENTRAL
│
├── SUCURSAL 1
│   ├── CAJA 1
│   ├── POS 1
│   ├── POS 2
│   └── POS 3
│
├── SUCURSAL 2
│   ├── CAJA 2
│   ├── POS 1
│   ├── POS 2
│   └── POS 3
│
├── SUCURSAL 3
│   ├── CAJA 3
│   ├── POS 1
│   ├── POS 2
│   └── POS 3
│
├── SUCURSAL 4
│   ├── CAJA 4
│   ├── POS 1
│   ├── POS 2
│   └── POS 3
│
└── SUCURSAL 5
    ├── CAJA 5
    ├── POS 1
    ├── POS 2
    └── POS 3
```

La cantidad de POS debe ser configurable.

No se debe asumir que todas las sucursales tendrán exactamente la misma cantidad.

---

# 3. EMPRESA

Entidad:

```text
Company
```

Representa la organización propietaria del sistema.

Debe contener información general como:

* ID.
* Nombre comercial.
* Razón social.
* CUIT.
* Dirección fiscal.
* Datos de contacto.
* Configuración fiscal.
* Estado.
* Fecha de creación.

La estructura debe permitir, en el futuro, soportar múltiples empresas si fuese necesario.

---

# 4. SUCURSAL

Entidad:

```text
Branch
```

Cada sucursal representa un establecimiento físico.

Campos conceptuales:

```text
id
companyId
code
name
address
phone
email
status
createdAt
updatedAt
```

Estados:

```text
ACTIVE
INACTIVE
```

---

# 5. CÓDIGO DE SUCURSAL

Cada sucursal debe tener un código único.

Ejemplo:

```text
SUC-001
SUC-002
SUC-003
SUC-004
SUC-005
```

El código no debe cambiarse arbitrariamente una vez que existan operaciones asociadas.

---

# 6. CAJA

Entidad:

```text
CashRegister
```

La caja representa la unidad financiera física de una sucursal.

Regla inicial:

> Cada sucursal tiene una caja principal.

Ejemplo:

```text
Sucursal Centro
└── Caja Principal
```

La arquitectura no debe impedir que en el futuro una sucursal tenga más de una caja.

---

# 7. CAJA ≠ POS

Esta separación es obligatoria.

```text
POS
↓
PREPARA / REGISTRA LA VENTA

CAJA
↓
COBRA / FINALIZA LA VENTA
```

El POS no representa dinero físico.

La caja sí representa el punto financiero donde se registra el cobro.

---

# 8. POS

Entidad:

```text
POS
```

Cada terminal POS pertenece a una sucursal.

Ejemplo:

```text
Sucursal Centro

POS-01
POS-02
POS-03
```

Campos conceptuales:

```text
id
branchId
code
name
status
createdAt
updatedAt
```

Estados:

```text
ACTIVE
INACTIVE
MAINTENANCE
```

---

# 9. IDENTIDAD DEL POS

Cada POS debe tener un identificador único dentro de la empresa.

Ejemplo:

```text
SUC01-POS01
SUC01-POS02
SUC01-POS03
```

Esto permitirá identificar desde qué terminal se originó una operación.

---

# 10. RELACIÓN ENTRE POS Y USUARIO

Un vendedor puede iniciar sesión en un POS.

Ejemplo:

```text
Juan
↓
POS-01
↓
Sucursal Centro
```

Otro vendedor puede trabajar simultáneamente:

```text
Pedro
↓
POS-02
↓
Sucursal Centro
```

No significa que cada POS tenga una caja propia.

Ambos pueden enviar operaciones a la misma caja de la sucursal.

---

# 11. FLUJO OPERATIVO PRINCIPAL

El flujo estándar será:

```text
VENDEDOR
   ↓
POS
   ↓
CREA VENTA
   ↓
VENTA PENDIENTE DE COBRO
   ↓
CAJERO
   ↓
CAJA
   ↓
REGISTRA PAGOS
   ↓
FINALIZA VENTA
   ↓
MOVIMIENTO FINANCIERO
   ↓
DOCUMENTO / COMPROBANTE
```

Este flujo debe mantenerse en toda la aplicación.

---

# 12. VENTAS SIMULTÁNEAS

La arquitectura debe soportar múltiples ventas simultáneas.

Ejemplo:

```text
POS-01 → Venta #1001 ─┐
                      │
POS-02 → Venta #1002 ─┼→ CAJA
                      │
POS-03 → Venta #1003 ─┘
```

El cajero podrá visualizar:

```text
PENDIENTES DE COBRO

#1001  Juan     $45.000
#1002  Pedro    $72.000
#1003  María    $38.500
```

El cajero selecciona una operación y procesa su cobro.

---

# 13. IDENTIFICACIÓN DE LA VENTA

Toda venta debe mantener trazabilidad sobre:

```text
Venta
├── Empresa
├── Sucursal
├── POS
├── Vendedor
├── Cliente
├── Productos
├── Total
├── Estado
├── Pagos
├── Cajero
├── Caja
├── Documento
└── Auditoría
```

---

# 14. RELACIÓN POS → VENTA

Una venta debe registrar el POS donde fue creada.

Ejemplo:

```text
sale.posId
```

Esto permitirá reportar:

* Ventas por POS.
* Ventas por vendedor.
* Ventas por sucursal.
* Ventas por período.
* Productividad de terminales.

---

# 15. RELACIÓN CAJA → VENTA

Cuando una venta es cobrada, debe registrar la caja utilizada.

Ejemplo:

```text
sale.cashRegisterId
```

De esta forma se puede saber:

```text
¿Dónde se cobró esta venta?
```

Aunque haya sido creada desde otro POS.

---

# 16. ESTADO DE POS

Estados:

```text
ACTIVE
INACTIVE
MAINTENANCE
```

### ACTIVE

Puede utilizarse normalmente.

### INACTIVE

No puede iniciar nuevas operaciones.

### MAINTENANCE

No puede utilizarse para nuevas ventas.

Las operaciones históricas permanecen intactas.

---

# 17. ESTADO DE CAJA

Estados conceptuales:

```text
CLOSED
OPEN
CLOSING
```

La caja debe tener:

```text
openingDate
openedBy
openingAmount
closingDate
closedBy
expectedAmount
countedAmount
difference
```

---

# 18. APERTURA DE CAJA

Al iniciar la jornada:

```text
CAJA CERRADA
      ↓
APERTURA
      ↓
USUARIO
      ↓
MONTO INICIAL
      ↓
CAJA ABIERTA
```

Debe quedar registrado:

* Usuario.
* Fecha.
* Hora.
* Caja.
* Sucursal.
* Monto inicial.
* Observaciones.

---

# 19. OPERACIÓN DURANTE LA JORNADA

Mientras la caja está abierta puede recibir:

### Ingresos

* Ventas.
* Otros ingresos autorizados.
* Transferencias internas.

### Egresos

* Gastos.
* Retiros.
* Devoluciones.
* Otros movimientos autorizados.

Todos deben generar movimientos trazables.

---

# 20. CIERRE DE CAJA

El cierre debe calcular:

```text
MONTO ESPERADO
=
MONTO INICIAL
+
INGRESOS
-
EGRESOS
```

Después:

```text
MONTO CONTADO
-
MONTO ESPERADO
=
DIFERENCIA
```

Ejemplo:

```text
Esperado: $500.000
Contado:  $498.000

Diferencia: -$2.000
```

La diferencia debe quedar registrada.

---

# 21. ARQUEO

El arqueo debe permitir registrar el dinero contado.

Como mínimo:

```text
Efectivo
Transferencias
QR
Tarjetas
Otros
```

Sin embargo, los medios electrónicos no deben tratarse como efectivo físico.

El sistema debe diferenciar:

```text
DINERO FÍSICO
```

de:

```text
DINERO ELECTRÓNICO
```

---

# 22. CUENTA FINANCIERA

Cuando un pago sea electrónico, debe poder asociarse a la cuenta financiera correspondiente.

Ejemplo:

```text
TRANSFERENCIA
↓
Banco Macro
```

o:

```text
TRANSFERENCIA
↓
Banco Galicia
```

o:

```text
QR
↓
Mercado Pago
```

La selección exacta de cuentas debe ser configurable.

---

# 23. POS Y CAJA EN LA MISMA SUCURSAL

Ejemplo:

```text
Sucursal 1

Caja:
CAJA-01

POS:
POS-01
POS-02
POS-03
```

Las ventas pueden originarse desde:

```text
POS-01
POS-02
POS-03
```

Pero pueden ser cobradas por:

```text
CAJA-01
```

---

# 24. CAMBIO DE VENDEDOR

Un POS debe permitir cerrar sesión del vendedor actual e iniciar sesión otro usuario.

Ejemplo:

```text
POS-01

Juan
↓
Cerrar sesión
↓
Pedro
```

Las ventas anteriores continúan asociadas a Juan.

Las nuevas ventas pertenecen a Pedro.

Nunca se debe modificar el vendedor histórico de una venta únicamente porque cambió el usuario del POS.

---

# 25. USUARIO Y POS

Debe registrarse quién inició la operación.

Una venta debe conservar:

```text
createdBy
sellerId
posId
branchId
```

Si posteriormente el cajero la cobra:

```text
cashierId
cashRegisterId
```

Esto permite distinguir:

```text
Quién vendió
```

de:

```text
Quién cobró
```

---

# 26. CAJERO Y POS

El cajero no necesita trabajar permanentemente desde un POS de ventas.

Su interfaz principal puede ser:

```text
CAJA
│
├── Pendientes de cobro
├── Cobrar
├── Pagos
├── Movimientos
├── Arqueo
└── Cierre
```

---

# 27. VENTA PENDIENTE DE COBRO

Cuando el vendedor termina la venta:

```text
DRAFT
↓
PENDING_PAYMENT
```

Debe quedar visible para el cajero.

El vendedor no debe poder marcarla como:

```text
PAID
```

por sí mismo.

---

# 28. RESERVAS Y POS

Las reservas pueden iniciarse desde un POS.

Ejemplo:

```text
Cliente
↓
Vendedor
↓
POS
↓
Selecciona producto
↓
Registra reserva
↓
Registra seña
↓
Producto reservado
```

La reserva debe impactar en la disponibilidad del inventario según las reglas definidas en:

`14_RESERVAS_Y_SEÑAS.md`

---

# 29. CAMBIOS Y POS

Los cambios de prendas también deben mantener relación con la venta original.

Ejemplo:

```text
Venta #1001
↓
Cambio
↓
Producto devuelto
↓
Producto nuevo
↓
Diferencia
↓
Pago / devolución
```

La operación debe conservar el vínculo con:

```text
Sucursal
POS original
Venta original
Vendedor original
Cajero
Nueva operación
```

---

# 30. SUCURSAL COMO ÁMBITO OPERATIVO

La sucursal determina el contexto operativo.

Una operación normalmente debe pertenecer a una sucursal.

Ejemplo:

```text
Venta
→ Sucursal 03

Stock
→ Sucursal 03

Caja
→ Sucursal 03

POS
→ Sucursal 03
```

Esto permite generar reportes independientes.

---

# 31. RESTRICCIÓN DE ACCESO

Un usuario asociado a una sucursal no debe poder operar accidentalmente sobre otra.

Ejemplo:

```text
Usuario:
Vendedor Sucursal 2

Sucursal permitida:
Sucursal 2
```

No puede:

```text
Crear venta en Sucursal 4
Cobrar en Caja 4
Modificar stock de Sucursal 4
```

salvo que posea explícitamente ese alcance.

---

# 32. TRANSFERENCIAS ENTRE SUCURSALES

Las transferencias no deben alterar directamente el stock de origen y destino sin pasar por estados.

Flujo:

```text
Sucursal A
↓
SOLICITADA
↓
PREPARADA
↓
DESPACHADA
↓
EN TRÁNSITO
↓
RECIBIDA
↓
CONFIRMADA
↓
STOCK DESTINO
```

La especificación detallada estará en:

`08_TRANSFERENCIAS_Y_REMITOS.md`

---

# 33. DEPÓSITO CENTRAL

El depósito central no es una sucursal de ventas.

Debe existir como unidad independiente.

Puede:

* Recibir compras.
* Almacenar productos.
* Preparar pedidos.
* Crear transferencias.
* Preparar remitos.
* Despachar mercadería.
* Gestionar etiquetas.
* Controlar inventario.

No debe tener una caja de ventas salvo que el negocio posteriormente lo requiera.

---

# 34. REPORTES POR SUCURSAL

El sistema debe permitir consultar:

### Ventas

* Ventas totales.
* Unidades.
* Ticket promedio.
* Ventas por vendedor.
* Ventas por POS.

### Caja

* Apertura.
* Ingresos.
* Egresos.
* Cierres.
* Diferencias.

### Stock

* Stock físico.
* Stock reservado.
* Stock disponible.
* Movimientos.
* Transferencias.

### Reservas

* Activas.
* Retiradas.
* Vencidas.
* Canceladas.

---

# 35. IDENTIFICADORES Y TRAZABILIDAD

Toda operación debe conservar sus relaciones.

Ejemplo:

```text
VENTA #000125
│
├── Sucursal: SUC-02
├── POS: SUC02-POS02
├── Vendedor: USER-025
├── Cliente: CLIENT-102
├── Caja: CAJA-SUC02
├── Cajero: USER-004
├── Pagos
├── Documento
└── Auditoría
```

---

# 36. CONFIGURACIÓN

La cantidad de sucursales, cajas y POS no debe estar hardcodeada.

Debe ser configurable.

Ejemplo:

```text
Empresa
├── Sucursal A
│   ├── Caja 1
│   ├── POS 1
│   └── POS 2
│
├── Sucursal B
│   ├── Caja 1
│   ├── POS 1
│   ├── POS 2
│   └── POS 3
```

---

# 37. DEMO

La DEMO debe incluir las 5 sucursales.

Ejemplo:

```text
Sucursal Centro
Sucursal Norte
Sucursal Sur
Sucursal Este
Sucursal Oeste
```

Los nombres reales serán configurables posteriormente.

Cada sucursal debe tener:

```text
1 Caja
3 POS
```

para demostrar el escenario máximo esperado.

---

# 38. ESCENARIO DEMO PRINCIPAL

Debe poder demostrarse:

```text
VENDEDOR A
↓
POS-01
↓
Venta #1001
↓
PENDING_PAYMENT

VENDEDOR B
↓
POS-02
↓
Venta #1002
↓
PENDING_PAYMENT

VENDEDOR C
↓
POS-03
↓
Venta #1003
↓
PENDING_PAYMENT

             ↓

          CAJERO
             ↓
        PENDIENTES
             ↓
       Selecciona #1001
             ↓
       Registra pago
             ↓
      Finaliza venta
             ↓
           CAJA
```

Posteriormente:

```text
Cierre de caja
↓
Arqueo
↓
Diferencia
↓
Reporte
```

---

# 39. REGLAS CRÍTICAS

## Regla 1

Un POS pertenece a una sucursal.

## Regla 2

Una caja pertenece a una sucursal.

## Regla 3

Una venta debe identificar dónde fue creada.

## Regla 4

Una venta debe identificar quién la creó.

## Regla 5

Una venta pendiente de cobro no es dinero ingresado a caja.

## Regla 6

El vendedor no debe marcar una venta como cobrada.

## Regla 7

El cajero es responsable del cobro.

## Regla 8

Una venta puede tener múltiples pagos.

## Regla 9

El dinero electrónico debe identificar la cuenta financiera correspondiente cuando aplique.

## Regla 10

Los cambios de usuario en un POS no modifican operaciones históricas.

## Regla 11

Los movimientos históricos no deben eliminarse.

## Regla 12

Las sucursales deben tener aislamiento operativo.

## Regla 13

El depósito central es independiente de las cajas de las sucursales.

## Regla 14

La cantidad de POS debe ser configurable.

---

# 40. MODELO CONCEPTUAL

Relación principal:

```text
Company
   │
   ├── Branch
   │      │
   │      ├── CashRegister
   │      │
   │      └── POS
   │             │
   │             └── Sale
   │                    │
   │                    ├── Seller
   │                    ├── Cashier
   │                    ├── Payments
   │                    └── Document
   │
   └── Warehouse
```

---

# 41. PREPARACIÓN PARA PRODUCCIÓN

El modelo debe permitir posteriormente implementar:

* Autenticación real.
* RBAC.
* PostgreSQL.
* Transacciones.
* Auditoría.
* Concurrencia.
* Múltiples usuarios simultáneos.
* Múltiples POS.
* Impresión.
* Facturación fiscal.
* Integración ARCA.
* Sincronización de operaciones.

La DEMO no necesita implementar toda esta infraestructura.

---

# 42. CRITERIOS DE ACEPTACIÓN

El módulo se considera correcto cuando:

### Estructura

* Existen 5 sucursales.
* Cada sucursal tiene una caja.
* Cada sucursal puede tener 2–3 POS.
* Existe depósito central.

### POS

* El vendedor puede iniciar sesión.
* Puede crear ventas.
* La venta identifica POS y vendedor.
* Puede haber varias ventas simultáneas.

### Caja

* El cajero puede ver ventas pendientes.
* Puede seleccionar una venta.
* Puede registrar uno o varios pagos.
* Puede finalizarla.
* El cobro queda asociado a la caja.

### Trazabilidad

Se puede responder:

> ¿Quién vendió?

> ¿Desde qué POS?

> ¿En qué sucursal?

> ¿Quién cobró?

> ¿En qué caja?

> ¿Cómo se pagó?

> ¿A qué cuenta financiera llegó?

> ¿Cuándo ocurrió?

---

# 43. PRINCIPIO FINAL

El sistema debe mantener una separación estricta:

```text
VENDEDOR
   ↓
REGISTRA LA VENTA

POS
   ↓
ORIGEN OPERATIVO

CAJERO
   ↓
COBRA

CAJA
   ↓
UNIDAD FINANCIERA

CUENTA FINANCIERA
   ↓
DESTINO DEL DINERO
```

Esta separación es una de las bases arquitectónicas del sistema y no debe modificarse simplemente para simplificar la interfaz.

---

**Estado:** DRAFT
**Versión:** 1.0
**Última actualización:** 2026-09-02
