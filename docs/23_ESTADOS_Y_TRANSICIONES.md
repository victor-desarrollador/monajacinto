# 23 — ESTADOS Y TRANSICIONES

## 1. OBJETIVO

Este documento define los estados válidos de las principales entidades del sistema y las transiciones permitidas entre ellos.

Una entidad no puede cambiar libremente de estado.

Cada transición debe:

* tener una condición;
* ser ejecutada por un actor autorizado;
* cumplir las reglas de negocio;
* generar los movimientos correspondientes;
* generar auditoría cuando corresponda.

### Principio central

> **Un estado representa una situación válida del negocio. Una transición representa una acción válida que cambia esa situación.**

---

# 2. MODELO GENERAL

Toda máquina de estados debe seguir:

```text id="u5j3as"
ESTADO ACTUAL
      ↓
VALIDACIONES
      ↓
PERMISO
      ↓
ACCIÓN
      ↓
NUEVO ESTADO
      ↓
MOVIMIENTOS
      ↓
AUDITORÍA
```

Ejemplo:

```text id="3s8r1f"
PENDING_PAYMENT
      ↓
validar pago
      ↓
CASHIER
      ↓
FINALIZE
      ↓
PAID
      ↓
stock + dinero + factura
      ↓
AuditLog
```

---

# 3. REGLAS GENERALES DE TRANSICIÓN

### ST-001

No se puede saltar arbitrariamente de un estado a otro.

### ST-002

Toda transición debe estar definida.

### ST-003

El backend debe validar la transición.

### ST-004

El frontend no determina por sí solo si una transición es válida.

### ST-005

Una transición inválida debe rechazarse.

### ST-006

Una transición importante genera auditoría.

### ST-007

Una operación confirmada no vuelve a un estado anterior simplemente editando el campo `status`.

### ST-008

Cuando sea necesario revertir una operación, debe utilizarse una acción de compensación.

---

# 4. ESTADOS DE PRODUCTO

Un producto comercial puede utilizar:

```text id="s7c9bx"
DRAFT
ACTIVE
INACTIVE
DISCONTINUED
```

Flujo:

```text id="fdb8m4"
DRAFT
  ↓
ACTIVE
  ↓
INACTIVE
  ↓
ACTIVE
```

O:

```text id="slqk4f"
ACTIVE
  ↓
DISCONTINUED
```

### Reglas

`DISCONTINUED` no significa eliminar el historial.

Las variantes vendidas anteriormente permanecen disponibles para consulta histórica.

---

# 5. ESTADOS DE VARIANTE

```text id="2d4bqv"
ACTIVE
INACTIVE
DISCONTINUED
```

Una variante inactiva no puede utilizarse en nuevas ventas.

Puede continuar apareciendo en operaciones históricas.

---

# 6. ESTADOS DE COMPRA

```text id="3n3s0q"
DRAFT
PENDING_APPROVAL
APPROVED
PARTIALLY_RECEIVED
RECEIVED
COMPLETED
CANCELLED
```

Flujo principal:

```text id="x9zvxm"
DRAFT
  ↓
PENDING_APPROVAL
  ↓
APPROVED
  ↓
PARTIALLY_RECEIVED
  ↓
RECEIVED
  ↓
COMPLETED
```

También:

```text id="f9y2hh"
DRAFT → CANCELLED
PENDING_APPROVAL → REJECTED
APPROVED → CANCELLED
```

Una compra no debe pasar directamente a `COMPLETED` sin haber cumplido las condiciones correspondientes.

---

# 7. RECEPCIÓN DE COMPRA

Estados:

```text id="9unwz4"
EXPECTED
IN_PROGRESS
PARTIALLY_RECEIVED
RECEIVED
CANCELLED
```

Flujo:

```text id="v7z3ga"
EXPECTED
   ↓
IN_PROGRESS
   ↓
PARTIALLY_RECEIVED
   ↓
RECEIVED
```

Si todo llega correctamente:

```text id="l1bq9c"
EXPECTED
   ↓
IN_PROGRESS
   ↓
RECEIVED
```

La recepción confirmada genera los movimientos de stock correspondientes.

---

# 8. TRANSFERENCIA

Estados:

```text id="t4yq1d"
DRAFT
PENDING_APPROVAL
APPROVED
PREPARING
READY_TO_DISPATCH
IN_TRANSIT
PARTIALLY_RECEIVED
RECEIVED
CANCELLED
```

Flujo:

```text id="q8a1xv"
DRAFT
   ↓
PENDING_APPROVAL
   ↓
APPROVED
   ↓
PREPARING
   ↓
READY_TO_DISPATCH
   ↓
IN_TRANSIT
   ↓
RECEIVED
```

Recepción parcial:

```text id="a3qz2w"
IN_TRANSIT
   ↓
PARTIALLY_RECEIVED
   ↓
RECEIVED
```

---

# 9. TRANSICIONES DE TRANSFERENCIA

### DRAFT → PENDING_APPROVAL

Condiciones:

* origen definido;
* destino definido;
* productos definidos;
* cantidades válidas;
* usuario autorizado.

### PENDING_APPROVAL → APPROVED

Requiere usuario con permiso de aprobación.

### APPROVED → PREPARING

Depósito comienza preparación.

### PREPARING → READY_TO_DISPATCH

Picking finalizado.

### READY_TO_DISPATCH → IN_TRANSIT

Mercadería despachada y remito emitido.

### IN_TRANSIT → PARTIALLY_RECEIVED

Destino recibe una cantidad menor a la enviada.

### IN_TRANSIT → RECEIVED

Destino confirma recepción completa.

---

# 10. REMITO

Estados:

```text id="08cez9"
DRAFT
ISSUED
DISPATCHED
RECEIVED
CANCELLED
```

Flujo:

```text id="2b8i3p"
DRAFT
 ↓
ISSUED
 ↓
DISPATCHED
 ↓
RECEIVED
```

El remito documenta el traslado físico.

No debe utilizarse como sustituto del movimiento de stock.

---

# 11. VENTA

Estados:

```text id="q6o4x0"
DRAFT
PENDING_PAYMENT
PAYMENT_IN_PROGRESS
PAID
COMPLETED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
```

Flujo normal:

```text id="q3xkpr"
DRAFT
   ↓
PENDING_PAYMENT
   ↓
PAYMENT_IN_PROGRESS
   ↓
PAID
   ↓
COMPLETED
```

---

# 12. TRANSICIONES DE VENTA

### DRAFT → PENDING_PAYMENT

El vendedor termina de preparar la venta.

### PENDING_PAYMENT → PAYMENT_IN_PROGRESS

El cajero comienza el proceso de cobro.

### PAYMENT_IN_PROGRESS → PAID

Se cumplen las condiciones de pago.

### PAID → COMPLETED

Se completan las operaciones posteriores:

* stock;
* movimientos financieros;
* facturación cuando corresponda.

Dependiendo de la arquitectura, `PAID` y `COMPLETED` pueden ocurrir en una misma transacción lógica.

---

# 13. CANCELACIÓN DE VENTA

Una venta `DRAFT` puede cancelarse directamente.

Una venta ya pagada no debe simplemente cambiar:

```text id="q8r7sz"
PAID → CANCELLED
```

sin realizar las operaciones correspondientes.

Debe utilizarse un flujo de cancelación/devolución que genere los movimientos compensatorios necesarios.

---

# 14. DEVOLUCIÓN DE VENTA

Una venta completada puede terminar:

```text id="x1v8pg"
COMPLETED
    ↓
PARTIALLY_REFUNDED
```

o:

```text id="0u5xj8"
COMPLETED
    ↓
REFUNDED
```

La diferencia depende de cuánto de la venta haya sido devuelto.

---

# 15. PAGO

Estados conceptuales:

```text id="2b7n2a"
PENDING
PROCESSING
COMPLETED
FAILED
REJECTED
CANCELLED
REFUNDED
PARTIALLY_REFUNDED
```

Flujo normal:

```text id="3z8n5q"
PENDING
   ↓
PROCESSING
   ↓
COMPLETED
```

Error:

```text id="1r7c4m"
PROCESSING → FAILED
```

Rechazo:

```text id="c9w2et"
PROCESSING → REJECTED
```

---

# 16. PAGO CON TARJETA

Puede tener un estado adicional relacionado con acreditación:

```text id="g1t4pv"
PENDING_ACCREDITATION
ACCREDITED
REJECTED
CANCELLED
```

Importante:

```text id="k5b8qa"
Venta completada
      ≠
Dinero ya acreditado en banco
```

Son procesos relacionados pero diferentes.

---

# 17. PAGO POR TRANSFERENCIA

La operación puede requerir:

```text id="m7z5up"
PENDING_VERIFICATION
VERIFIED
REJECTED
```

Cuando la política del negocio requiera validación.

No asumir automáticamente que una referencia declarada por un usuario significa que el dinero fue efectivamente recibido.

---

# 18. CAJA

Estados de sesión:

```text id="0wq7ae"
CLOSED
OPEN
CLOSING
```

Flujo:

```text id="u9s2yx"
CLOSED
   ↓
OPEN
   ↓
CLOSING
   ↓
CLOSED
```

La apertura requiere fondo inicial.

El cierre requiere arqueo.

---

# 19. ARQUEO

Estados:

```text id="r5m3ki"
DRAFT
COUNTING
SUBMITTED
REVIEWED
CLOSED
```

Flujo:

```text id="2p7w8h"
DRAFT
 ↓
COUNTING
 ↓
SUBMITTED
 ↓
REVIEWED
 ↓
CLOSED
```

Si existe diferencia, esta queda registrada.

No se modifica el movimiento original para eliminar la diferencia.

---

# 20. CUENTA FINANCIERA

Estados:

```text id="x4s1p8"
ACTIVE
INACTIVE
BLOCKED
```

Flujo:

```text id="r2y5kq"
ACTIVE → INACTIVE
ACTIVE → BLOCKED
INACTIVE → ACTIVE
```

Una cuenta inactiva no debe aceptar nuevas operaciones según la política configurada.

El historial permanece.

---

# 21. MOVIMIENTO FINANCIERO

Estados:

```text id="8q5m0n"
PENDING
POSTED
CANCELLED
REVERSED
```

Flujo:

```text id="1n6q7v"
PENDING
   ↓
POSTED
```

Una corrección financiera puede generar:

```text id="f0y3az"
POSTED
   ↓
REVERSED
```

acompañada por un movimiento compensatorio.

---

# 22. RESERVA

Estados:

```text id="7z4m1x"
DRAFT
RESERVADA
EXTENDED
PENDING_PICKUP
RETIRED
CANCELLED
EXPIRED
NO_PICKUP
```

Flujo:

```text id="d3q9px"
DRAFT
  ↓
RESERVADA
  ↓
PENDING_PICKUP
  ↓
RETIRED
```

También:

```text id="0c8v3k"
RESERVADA → EXTENDED
RESERVADA → CANCELLED
RESERVADA → EXPIRED
RESERVADA → NO_PICKUP
```

---

# 23. RESERVA Y STOCK

Al pasar a:

```text id="s0p6k9"
RESERVADA
```

debe producirse la reserva lógica del stock.

Al pasar a:

```text id="t5j8w2"
CANCELLED
EXPIRED
NO_PICKUP
```

debe liberarse el stock reservado.

No debe producirse una salida física de stock simplemente por reservar.

---

# 24. SEÑA

La seña debe tener ciclo independiente:

```text id="8j4p0m"
PENDING
RECEIVED
APPLIED
REFUNDED
FORFEITED
CANCELLED
```

Ejemplo:

```text id="4m7z1q"
RESERVA
   ↓
SEÑA RECEIVED
   ↓
CLIENTE RETIRA
   ↓
SEÑA APPLIED
   ↓
VENTA
```

No debe cobrarse nuevamente el importe de la seña.

---

# 25. PRÉSTAMO DE PUBLICIDAD

Estados:

```text id="6y8v2n"
DRAFT
PENDING_APPROVAL
APPROVED
PREPARING
DELIVERED
RETURN_PENDING
PARTIALLY_RETURNED
RETURNED
DAMAGED
MISSING
SOLD
CANCELLED
```

Flujo:

```text id="k9q3la"
DRAFT
   ↓
PENDING_APPROVAL
   ↓
APPROVED
   ↓
PREPARING
   ↓
DELIVERED
   ↓
RETURN_PENDING
   ↓
RETURNED
```

---

# 26. RESULTADOS ESPECIALES DE PRÉSTAMOS

Desde `DELIVERED` puede terminar en:

```text id="j8f2xs"
RETURNED
DAMAGED
MISSING
SOLD
```

La transición depende de lo que ocurrió físicamente con el producto.

---

# 27. CAMBIO

Estados:

```text id="1a6c8f"
DRAFT
PENDING_APPROVAL
APPROVED
PROCESSING
COMPLETED
REJECTED
CANCELLED
```

Flujo:

```text id="g8x2kn"
DRAFT
   ↓
PROCESSING
   ↓
COMPLETED
```

Cuando requiere autorización:

```text id="7w3c4q"
DRAFT
   ↓
PENDING_APPROVAL
   ↓
APPROVED
   ↓
PROCESSING
   ↓
COMPLETED
```

---

# 28. DEVOLUCIÓN

Estados:

```text id="v5p9m3"
DRAFT
PENDING_APPROVAL
APPROVED
PROCESSING
COMPLETED
REJECTED
CANCELLED
```

Una devolución completada puede generar:

* entrada de stock;
* devolución de dinero;
* crédito;
* ajuste financiero;
* documento fiscal cuando corresponda.

---

# 29. FACTURA

Estados:

```text id="n6w2ta"
DRAFT
PENDING_AUTHORIZATION
AUTHORIZED
REJECTED
FAILED
CANCELLED
```

Flujo:

```text id="j2q8vx"
DRAFT
   ↓
PENDING_AUTHORIZATION
   ↓
AUTHORIZED
```

Error:

```text id="4m8k1r"
PENDING_AUTHORIZATION → FAILED
```

Rechazo fiscal:

```text id="b5n9pz"
PENDING_AUTHORIZATION → REJECTED
```

---

# 30. FACTURA AUTORIZADA

Una factura `AUTHORIZED` no debe volver a `DRAFT`.

Si necesita corrección:

```text id="7q1x6c"
Factura original
      ↓
Documento fiscal correctivo
```

Por ejemplo, una nota de crédito cuando corresponda.

---

# 31. EMPLEADO

Estados:

```text id="k7m4s2"
ACTIVE
INACTIVE
SUSPENDED
TERMINATED
```

Flujo normal:

```text id="q8x3np"
ACTIVE
   ↓
INACTIVE
```

o:

```text id="0z5v7b"
ACTIVE
   ↓
SUSPENDED
   ↓
ACTIVE
```

Finalización:

```text id="x4c9ma"
ACTIVE
   ↓
TERMINATED
```

Un empleado terminado conserva su historial.

---

# 32. LIQUIDACIÓN DE SUELDO

Estados:

```text id="p7k2w4"
DRAFT
CALCULATED
PENDING_APPROVAL
APPROVED
PARTIALLY_PAID
PAID
CANCELLED
```

Flujo:

```text id="f3m8x1"
DRAFT
 ↓
CALCULATED
 ↓
PENDING_APPROVAL
 ↓
APPROVED
 ↓
PAID
```

Pago parcial:

```text id="s9q1yc"
APPROVED
   ↓
PARTIALLY_PAID
   ↓
PAID
```

---

# 33. VENTA DE EMPLEADO

Utiliza la misma máquina de estados de `Sale`.

La diferencia está en:

```text id="m3y7ap"
saleType = EMPLOYEE
employeeId != null
```

No crear una máquina de ventas completamente diferente.

---

# 34. EXPORTACIÓN

Estados:

```text id="b1x6w9"
REQUESTED
PROCESSING
COMPLETED
FAILED
CANCELLED
```

Flujo:

```text id="q6m2va"
REQUESTED
   ↓
PROCESSING
   ↓
COMPLETED
```

La exportación debe respetar los permisos del usuario.

---

# 35. USUARIO

Estados:

```text id="r8w3k1"
INVITED
ACTIVE
LOCKED
INACTIVE
```

Flujo:

```text id="y7q2md"
INVITED
   ↓
ACTIVE
```

Seguridad:

```text id="v5n9xa"
ACTIVE
   ↓
LOCKED
```

Administración:

```text id="m1k8pz"
ACTIVE
   ↓
INACTIVE
```

---

# 36. TRANSICIONES PROHIBIDAS

Ejemplos de transiciones inválidas:

```text id="5z3p7a"
COMPLETED → DRAFT
PAID → DRAFT
AUTHORIZED → DRAFT
RECEIVED → PREPARING
CLOSED → PAYMENT_IN_PROGRESS
TERMINATED → ACTIVE
```

Estas acciones deben rechazarse.

Si el negocio necesita revertir el efecto, debe existir una operación explícita para ello.

---

# 37. TRANSICIONES Y MOVIMIENTOS

Una transición de estado puede generar efectos secundarios.

Ejemplo:

```text id="2p8x5v"
TRANSFER
READY_TO_DISPATCH
       ↓
   DISPATCH
       ↓
IN_TRANSIT
       ↓
STOCK OUT
       ↓
REMITO DISPATCHED
       ↓
AUDIT
```

Otro:

```text id="6k3m9q"
SALE
PAYMENT_IN_PROGRESS
       ↓
PAID
       ↓
STOCK OUT
       ↓
FINANCIAL MOVEMENT
       ↓
INVOICE
       ↓
COMPLETED
```

---

# 38. TRANSICIONES ATÓMICAS

Cuando una transición implica múltiples cambios críticos, deben ejecutarse de forma transaccional en producción.

Ejemplo:

```text id="n8q2vc"
Finalizar venta
    ├── actualizar venta
    ├── registrar pago
    ├── registrar stock
    ├── registrar caja
    ├── registrar financiero
    └── registrar auditoría
```

No debe quedar una venta como `COMPLETED` si los movimientos esenciales fallaron.

---

# 39. TRANSICIONES ASÍNCRONAS

Algunas operaciones pueden tener procesos posteriores.

Ejemplo de facturación:

```text id="a4x7kp"
Venta
 ↓
Pago
 ↓
Venta completada
 ↓
Solicitud fiscal
 ↓
ARCA
 ↓
AUTHORIZED
```

El sistema debe definir explícitamente qué procesos son:

* sincrónicos;
* asíncronos;
* obligatorios;
* opcionales;
* reintentables.

No inventar estas condiciones en implementación.

---

# 40. REINTENTOS

Un error técnico no necesariamente significa que la operación de negocio deba cambiar a `FAILED`.

Ejemplo:

```text id="c8m1fz"
REQUEST
 ↓
TIMEOUT
 ↓
UNKNOWN
 ↓
VERIFICAR
```

Esto es especialmente importante para integraciones externas.

No crear una segunda operación automáticamente sin verificar la primera.

---

# 41. IDEMPOTENCIA DE TRANSICIONES

Una transición crítica debe poder protegerse contra ejecución duplicada.

Ejemplo:

```text id="d6q9wk"
POST /sales/123/finalize
```

Si la misma solicitud llega dos veces:

```text id="1y5v3b"
Primera → ejecuta
Segunda → detecta operación ya aplicada
```

No debe generar:

```text id="f7m2za"
2 pagos
2 salidas de stock
2 movimientos de caja
```

---

# 42. AUDITORÍA DE TRANSICIONES

Toda transición crítica debe registrar:

```text id="w9x4k2"
entity
entityId
fromStatus
toStatus
action
actor
timestamp
reason
operationId
requestId
```

Ejemplo:

```text id="r3p7mq"
Sale #00154

FROM:
PENDING_PAYMENT

TO:
PAID

Actor:
Cajero

Reason:
Cobro efectivo

Operation:
OP-2026-00154
```

---

# 43. MATRIZ RESUMIDA

| Entidad       | Estado inicial | Estado final principal |
| ------------- | -------------- | ---------------------- |
| Producto      | DRAFT          | ACTIVE                 |
| Compra        | DRAFT          | COMPLETED              |
| Recepción     | EXPECTED       | RECEIVED               |
| Transferencia | DRAFT          | RECEIVED               |
| Remito        | DRAFT          | RECEIVED               |
| Venta         | DRAFT          | COMPLETED              |
| Pago          | PENDING        | COMPLETED              |
| Caja          | CLOSED         | CLOSED                 |
| Reserva       | DRAFT          | RETIRED                |
| Préstamo      | DRAFT          | RETURNED               |
| Cambio        | DRAFT          | COMPLETED              |
| Devolución    | DRAFT          | COMPLETED              |
| Factura       | DRAFT          | AUTHORIZED             |
| Empleado      | ACTIVE         | TERMINATED             |
| Liquidación   | DRAFT          | PAID                   |
| Exportación   | REQUESTED      | COMPLETED              |
| Usuario       | INVITED        | ACTIVE                 |

---

# 44. DIAGRAMA GLOBAL

```text id="q4x8nv"
                    ┌─────────────┐
                    │    DRAFT    │
                    └──────┬──────┘
                           │
                    VALIDACIONES
                           │
                           ▼
                    ┌─────────────┐
                    │   PENDING   │
                    └──────┬──────┘
                           │
                     APROBACIÓN
                           │
                           ▼
                    ┌─────────────┐
                    │  PROCESSING │
                    └──────┬──────┘
                           │
                     EJECUCIÓN
                           │
                           ▼
                    ┌─────────────┐
                    │  COMPLETED  │
                    └─────────────┘
```

Cada módulo puede especializar esta estructura, pero debe respetar el mismo concepto.

---

# 45. REGLA PARA OPEN CODE

Antes de implementar una acción que cambie un estado, OpenCode debe verificar:

```text id="8j3x5p"
1. Estado actual
2. Estado destino
3. Transición permitida
4. Actor autorizado
5. Preconditions
6. Reglas de negocio
7. Movimientos requeridos
8. Auditoría requerida
9. Idempotencia
10. Concurrencia
```

Si alguno no está definido:

> **NO INVENTAR LA TRANSICIÓN.**

Debe marcar la ambigüedad.

---

# 46. CRITERIOS DE ACEPTACIÓN

El módulo se considera correctamente definido cuando:

* [ ] cada entidad crítica posee estados explícitos;
* [ ] las transiciones válidas están documentadas;
* [ ] las transiciones inválidas están identificadas;
* [ ] cada transición crítica tiene actor autorizado;
* [ ] las condiciones previas están definidas;
* [ ] los movimientos derivados están definidos;
* [ ] la auditoría está contemplada;
* [ ] las operaciones compensatorias están diferenciadas de cambios de estado;
* [ ] se contemplan errores técnicos;
* [ ] se contempla idempotencia;
* [ ] se contempla concurrencia;
* [ ] las integraciones externas no generan duplicados;
* [ ] el backend valida las transiciones;
* [ ] la interfaz no puede saltarse reglas;
* [ ] OpenCode puede utilizar este documento como contrato funcional.

---

# 47. PRINCIPIO FINAL

El sistema no debe pensar:

```text id="k2v8yq"
"¿Qué estado quiero poner?"
```

Debe pensar:

```text id="x7m4pz"
"¿Qué acción de negocio estoy ejecutando?"
          ↓
"¿Está permitida?"
          ↓
"¿Qué condiciones debo validar?"
          ↓
"¿Qué estado corresponde?"
          ↓
"¿Qué movimientos genera?"
          ↓
"¿Qué debo auditar?"
```

Por lo tanto:

> **Los estados describen la realidad. Las transiciones representan acciones de negocio. Los movimientos y documentos representan sus efectos. La auditoría demuestra lo ocurrido.**
