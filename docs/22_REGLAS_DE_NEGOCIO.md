# 22 — REGLAS DE NEGOCIO

## 1. OBJETIVO

Este documento define las reglas funcionales y operativas que gobiernan el sistema de gestión de la empresa.

Las reglas aquí definidas tienen prioridad sobre decisiones arbitrarias de implementación.

El sistema debe comportarse según estas reglas independientemente de:

* interfaz;
* dispositivo;
* POS;
* sucursal;
* usuario;
* implementación frontend;
* implementación backend.

### Principio central

> **La interfaz puede cambiar. Las reglas de negocio no deben romperse.**

---

# 2. JERARQUÍA DE REGLAS

Las reglas se interpretan en este orden:

```text
1. Integridad de datos
2. Reglas de negocio
3. Permisos
4. Estados y transiciones
5. Procesos operativos
6. Interfaz de usuario
```

Una pantalla nunca debe permitir una operación que contradiga una regla del sistema.

---

# 3. REGLAS GENERALES

### RN-001 — Identidad

Toda operación importante debe identificar al usuario que la ejecutó.

### RN-002 — Trazabilidad

Toda operación crítica debe poder reconstruirse mediante auditoría.

### RN-003 — No eliminación histórica

Las operaciones confirmadas no deben eliminarse físicamente.

### RN-004 — Correcciones

Los errores se corrigen mediante nuevas operaciones o movimientos compensatorios.

### RN-005 — Motivo

Las operaciones excepcionales deben requerir un motivo.

### RN-006 — Permisos

Tener acceso a una pantalla no implica tener permiso para ejecutar todas sus acciones.

### RN-007 — Sucursal

Las operaciones deben respetar el alcance de sucursal asignado al usuario.

### RN-008 — Fecha

Las fechas relevantes deben ser generadas por el sistema y no depender exclusivamente del cliente.

---

# 4. SUCURSALES

### RN-009

Cada sucursal posee identidad propia.

### RN-010

Las operaciones de una sucursal deben quedar asociadas a ella.

### RN-011

Un usuario puede tener una o varias sucursales autorizadas según su rol.

### RN-012

Un usuario no puede operar sobre una sucursal no autorizada.

### RN-013

Las transferencias entre sucursales requieren origen y destino explícitos.

### RN-014

La sucursal destino no puede disponer de mercadería transferida hasta confirmar su recepción.

---

# 5. POS Y CAJA

### RN-015 — POS ≠ Caja

Un POS es un terminal de operación.

Una caja es la entidad financiera que controla la cobranza de la sucursal.

### RN-016

Una sucursal puede tener múltiples POS.

### RN-017

Una sucursal posee una caja principal según la configuración definida.

### RN-018

El vendedor puede crear una venta.

### RN-019

El vendedor no puede cerrar la caja salvo permiso explícito.

### RN-020

La venta enviada por el vendedor pasa a estado:

```text
PENDING_PAYMENT
```

### RN-021

El cajero es responsable de finalizar la cobranza.

### RN-022

La venta no debe duplicarse cuando pasa del POS a caja.

### RN-023

Una venta finalizada genera los movimientos correspondientes de stock y dinero.

---

# 6. PRODUCTOS

### RN-024

Un producto comercial puede tener múltiples variantes.

Ejemplo:

```text
Remera básica
├── Negro / S
├── Negro / M
├── Negro / L
├── Blanco / S
└── Blanco / M
```

### RN-025

La variante es la unidad vendible y controlable por stock.

### RN-026

Cada variante debe poder identificarse mediante SKU.

### RN-027

El código de barras debe ser único cuando esté configurado como identificador obligatorio.

### RN-028

No se debe controlar stock únicamente por nombre del producto.

### RN-029

Los cambios de precio no deben modificar ventas históricas.

---

# 7. PRECIOS

El sistema debe poder manejar como mínimo:

```text
Precio de venta
Precio revendedor
Costo
```

Opcionalmente:

```text
Listas de precios
Precio promocional
Precio por cliente
Precio empleado
```

### RN-030

El precio aplicado a una venta debe conservarse como snapshot histórico.

### RN-031

Cambiar el precio actual no modifica ventas anteriores.

### RN-032

Los descuentos pueden estar limitados por rol.

### RN-033

Los descuentos excepcionales deben registrar usuario y motivo.

---

# 8. STOCK

### RN-034 — Principio fundamental

> **El stock no se edita; cambia como consecuencia de movimientos trazables.**

### RN-035

Todo movimiento de stock debe tener:

```text
variante
cantidad
ubicación
tipo
usuario
fecha
referencia
```

### RN-036

No debe existir modificación silenciosa de stock.

### RN-037

El stock negativo está prohibido por defecto.

### RN-038

Una corrección de inventario debe generar un movimiento de ajuste.

### RN-039

Los movimientos históricos no se eliminan.

### RN-040

El stock físico representa las unidades físicamente disponibles en la ubicación.

### RN-041

El stock reservado no debe poder venderse nuevamente.

### RN-042

El stock disponible debe calcularse considerando las reservas.

Conceptualmente:

```text
Disponible = Físico - Reservado
```

### RN-043

La mercadería en tránsito no pertenece al stock disponible de la sucursal destino.

---

# 9. TIPOS DE STOCK

El sistema debe distinguir conceptualmente:

```text
Físico
Reservado
Disponible
En tránsito
```

Ejemplo:

```text
Físico:       20
Reservado:     5
Disponible:  15
En tránsito:  10
```

No debe interpretarse:

```text
Disponible = 30
```

---

# 10. COMPRAS

### RN-044

Una compra no equivale automáticamente a mercadería recibida.

### RN-045

La orden de compra representa intención/compromiso de compra.

### RN-046

La recepción confirma la mercadería realmente recibida.

### RN-047

Una recepción puede ser parcial.

### RN-048

La diferencia entre esperado y recibido debe conservarse.

### RN-049

La recepción confirmada genera movimiento de stock.

### RN-050

El pago al proveedor es una operación financiera independiente de la recepción.

---

# 11. PROVEEDORES

### RN-051

Los proveedores deben conservar historial.

### RN-052

No eliminar proveedores que tengan operaciones históricas.

### RN-053

Las facturas de proveedores deben poder relacionarse con la compra correspondiente.

### RN-054

El pago a proveedor debe poder ser parcial cuando el negocio lo permita.

### RN-055

El costo histórico de la mercadería debe conservarse.

---

# 12. DEPÓSITO

### RN-056

El depósito es una ubicación logística, no una caja.

### RN-057

El depósito puede recibir mercadería.

### RN-058

El depósito puede controlar cantidades.

### RN-059

El depósito puede preparar pedidos.

### RN-060

El depósito puede generar remitos.

### RN-061

El depósito puede despachar mercadería.

### RN-062

El depósito no debe finalizar ventas ni cobrar dinero salvo permisos específicos.

---

# 13. TRANSFERENCIAS

### RN-063

Una transferencia debe tener:

```text
origen
destino
productos
cantidades
usuario
fecha
estado
```

### RN-064

La transferencia puede requerir aprobación.

### RN-065

El despacho genera salida del stock origen.

### RN-066

La mercadería despachada pasa a estado de tránsito.

### RN-067

La recepción confirma la entrada en destino.

### RN-068

La recepción puede ser parcial.

### RN-069

Las diferencias de recepción deben quedar registradas.

### RN-070

Una transferencia no debe crear stock destino antes de la recepción.

---

# 14. REMITOS

### RN-071

El remito documenta el traslado físico.

### RN-072

El remito debe relacionarse con la transferencia.

### RN-073

Un remito confirmado no debe modificarse silenciosamente.

### RN-074

Las correcciones deben quedar registradas.

---

# 15. VENTAS

### RN-075

Una venta pertenece a una sucursal.

### RN-076

Una venta debe contener al menos un producto.

### RN-077

Una venta debe conservar:

```text
precio unitario
cantidad
descuento
subtotal
total
```

### RN-078

El total debe poder reconstruirse a partir de sus componentes.

### RN-079

Una venta pendiente de pago no debe descontar stock como venta finalizada.

### RN-080

La venta finalizada genera salida de stock.

### RN-081

Una venta cancelada después de confirmarse requiere movimientos compensatorios cuando corresponda.

---

# 16. PAGOS

### RN-082

Una venta puede tener uno o múltiples pagos.

### RN-083

Los métodos pueden incluir:

```text
EFECTIVO
TRANSFERENCIA
QR
DEBITO
CREDITO
CHEQUE
OTRO
```

### RN-084

El método de pago y la cuenta financiera son conceptos diferentes.

Ejemplo:

```text
Método:
TRANSFERENCIA

Cuenta:
BANCO GALICIA
```

### RN-085

El sistema debe permitir identificar la entidad financiera utilizada.

### RN-086

Una transferencia debe poder conservar referencia bancaria cuando exista.

### RN-087

Un pago combinado debe quedar desglosado.

Ejemplo:

```text
Efectivo:      $20.000
Transferencia: $30.000
----------------------
Total:         $50.000
```

### RN-088

La suma de pagos debe coincidir con el importe exigible, considerando la política de vuelto o saldo.

### RN-089

No debe generarse una venta pagada parcialmente como completamente pagada.

---

# 17. EFECTIVO

### RN-090

El efectivo de una venta afecta la caja correspondiente.

### RN-091

Las operaciones no monetarias no deben incrementar artificialmente el efectivo.

### RN-092

El vuelto debe registrarse correctamente.

### RN-093

Un retiro de efectivo debe tener motivo y responsable.

---

# 18. TRANSFERENCIAS BANCARIAS

### RN-094

Una transferencia debe identificar la cuenta financiera receptora cuando corresponda.

Ejemplo:

```text
Banco Macro
Banco Galicia
Mercado Pago
```

### RN-095

La referencia de transferencia debe conservarse cuando esté disponible.

### RN-096

No debe contabilizarse una transferencia interna como ingreso.

---

# 19. TARJETAS

### RN-097

El pago con tarjeta puede tener estado de acreditación independiente.

Ejemplo:

```text
PENDING
ACCREDITED
REJECTED
CANCELLED
```

### RN-098

La venta no debe confundirse con la acreditación bancaria.

### RN-099

Comisiones, retenciones y costos financieros deben poder modelarse independientemente.

---

# 20. CHEQUES

### RN-100

Un cheque representa un valor financiero.

### RN-101

Debe conservar:

```text
número
importe
fecha
banco
emisor
estado
```

### RN-102

Un cheque rechazado no desaparece del historial.

---

# 21. CAJAS

### RN-103

Cada sesión de caja debe tener:

```text
apertura
movimientos
arqueo
cierre
```

### RN-104

El fondo inicial debe registrarse.

### RN-105

El efectivo esperado debe poder calcularse.

Conceptualmente:

```text
Esperado =
Fondo inicial
+ ventas efectivo
+ ingresos
- egresos
- retiros
- devoluciones efectivo
```

### RN-106

Los pagos no monetarios no forman parte del efectivo físico.

### RN-107

El arqueo registra el efectivo contado físicamente.

### RN-108

La diferencia entre esperado y contado debe conservarse.

---

# 22. ARQUEOS

### RN-109

El arqueo no modifica silenciosamente los movimientos anteriores.

### RN-110

Una diferencia de caja debe generar registro.

### RN-111

El cierre debe identificar:

```text
usuario
fecha
esperado
contado
diferencia
```

### RN-112

Una reapertura debe requerir autorización.

---

# 23. TESORERÍA

### RN-113

Todo movimiento financiero importante debe existir como `FinancialMovement`.

### RN-114

Los saldos no deben ser modificados manualmente.

### RN-115

El saldo debe resultar de movimientos registrados.

### RN-116

Una transferencia interna debe tener:

```text
origen
destino
importe
fecha
usuario
motivo
```

### RN-117

Una transferencia interna no representa ingreso económico.

---

# 24. CUENTAS FINANCIERAS

### RN-118

Una cuenta financiera representa dónde se encuentra dinero o valores.

Tipos:

```text
CASH
BANK
DIGITAL_WALLET
VALUES
VIRTUAL
OTHER
```

### RN-119

Una cuenta puede estar asociada a una sucursal.

### RN-120

Una cuenta puede ser central.

### RN-121

Una cuenta inactiva no debe recibir nuevas operaciones.

### RN-122

La desactivación no elimina su historial.

---

# 25. RESERVAS

### RN-123

Una reserva representa compromiso de stock.

### RN-124

Una reserva debe estar asociada a un cliente cuando la política del negocio lo requiera.

### RN-125

Una reserva reduce el stock disponible.

### RN-126

Una reserva debe tener fecha de vencimiento.

### RN-127

Una reserva vencida libera el stock correspondiente.

### RN-128

La seña es una operación monetaria independiente del concepto de reserva.

### RN-129

La seña debe conservarse.

### RN-130

Al retirar una reserva, la seña se aplica a la venta final sin duplicar el cobro.

### RN-131

La venta final genera la salida de stock definitiva.

---

# 26. PRÉSTAMOS DE PUBLICIDAD

### RN-132

Un préstamo de publicidad no es una venta.

### RN-133

El producto continúa siendo propiedad de la empresa.

### RN-134

El producto prestado deja de estar disponible para venta mientras esté fuera.

### RN-135

La salida debe generar movimiento `MARKETING_LOAN`.

### RN-136

La devolución genera `MARKETING_RETURN`.

### RN-137

Un producto dañado genera el movimiento correspondiente.

### RN-138

Un producto no devuelto debe permanecer identificado como faltante.

### RN-139

Si el producto termina vendido, la venta debe vincularse al préstamo.

### RN-140

La venta posterior no debe descontar stock dos veces.

---

# 27. CAMBIOS

### RN-141

Un cambio debe estar relacionado con la venta original.

### RN-142

La venta original no se sobrescribe.

### RN-143

El producto devuelto genera movimiento de entrada según su condición.

### RN-144

El producto entregado genera movimiento de salida.

### RN-145

Una diferencia a favor de la empresa genera pago.

### RN-146

Una diferencia a favor del cliente genera devolución, crédito o mecanismo configurado por política.

---

# 28. DEVOLUCIONES

### RN-147

Una devolución debe identificar la venta original.

### RN-148

No se puede devolver una cantidad superior a la cantidad elegible.

Conceptualmente:

```text
Cantidad vendida
- cantidad previamente devuelta
- cantidad previamente cambiada
= cantidad disponible para devolución
```

### RN-149

La condición del producto determina su destino.

Puede ser:

```text
AVAILABLE
REVIEW
DAMAGED
DEFECTIVE
RETURN_TO_SUPPLIER
OTHER
```

---

# 29. EMPLEADOS

### RN-150

Empleado y usuario son entidades diferentes.

### RN-151

Un empleado puede tener usuario del sistema, pero no necesariamente.

### RN-152

Los cambios salariales deben conservar historial.

### RN-153

Un anticipo es una operación independiente.

### RN-154

El pago de salario genera movimiento financiero.

### RN-155

La liquidación no debe borrar pagos anteriores.

---

# 30. VENTAS A EMPLEADOS

### RN-156

Una venta a empleado sigue siendo una venta.

### RN-157

Debe utilizar la entidad `Sale`.

### RN-158

Debe identificarse el empleado.

### RN-159

El precio/beneficio empleado debe respetar la política configurada.

### RN-160

Una compra diferida no representa dinero recibido hasta que efectivamente se cobre o aplique según la política.

### RN-161

La compra de empleado debe afectar stock igual que una venta normal.

---

# 31. FACTURACIÓN

### RN-162

Venta y factura son entidades diferentes.

### RN-163

Una venta puede requerir facturación según la operación y configuración fiscal.

### RN-164

La factura debe conservar snapshot fiscal del cliente.

### RN-165

La numeración fiscal debe ser controlada por el backend.

### RN-166

La respuesta fiscal debe conservarse.

### RN-167

Una factura autorizada no debe modificarse para corregir información.

### RN-168

Las correcciones fiscales se realizan mediante los comprobantes correspondientes.

### RN-169

Los errores de comunicación fiscal no deben generar automáticamente una segunda factura sin verificar el resultado de la primera solicitud.

---

# 32. DESCUENTOS

### RN-170

No todos los usuarios pueden aplicar descuentos arbitrarios.

### RN-171

Los límites de descuento deben ser configurables.

### RN-172

Los descuentos superiores al límite requieren autorización.

### RN-173

El descuento aplicado debe conservarse en la venta.

---

# 33. CANCELACIONES

### RN-174

Cancelar una operación no significa eliminarla.

### RN-175

Una operación confirmada debe conservar su historial.

### RN-176

Cuando corresponda, la cancelación genera movimientos compensatorios.

### RN-177

Las cancelaciones sensibles deben requerir autorización.

---

# 34. AUDITORÍA

### RN-178

Las operaciones críticas generan `AuditLog`.

### RN-179

El historial de auditoría es append-only.

### RN-180

Debe registrarse el actor.

### RN-181

Debe registrarse la fecha/hora.

### RN-182

Debe registrarse la entidad afectada.

### RN-183

Los cambios relevantes deben conservar before/after.

### RN-184

Las acciones denegadas importantes también pueden auditarse.

---

# 35. REPORTES

### RN-185

Los reportes deben utilizar datos reales del sistema.

### RN-186

Un indicador debe poder rastrearse hasta las operaciones que lo originan.

### RN-187

Los filtros deben ser reproducibles.

### RN-188

Las exportaciones deben respetar permisos.

### RN-189

Las exportaciones sensibles deben quedar auditadas.

---

# 36. CONSISTENCIA FINANCIERA

### RN-190

Una operación interna no debe contabilizarse dos veces.

Ejemplo:

```text
Caja → Banco
```

no significa:

```text
Ingreso +$100.000
```

sino:

```text
Caja -$100.000
Banco +$100.000
```

### RN-191

El total financiero debe poder reconciliarse con sus movimientos.

---

# 37. CONSISTENCIA DE STOCK

### RN-192

Todo movimiento debe afectar una ubicación válida.

### RN-193

No debe existir movimiento sin variante.

### RN-194

La cantidad debe ser mayor que cero.

### RN-195

El tipo de movimiento determina si la cantidad entra o sale.

### RN-196

El sistema debe impedir doble aplicación de un mismo movimiento.

---

# 38. CONCURRENCIA

### RN-197

Las operaciones críticas deben ejecutarse dentro de transacciones cuando sea necesario.

### RN-198

El sistema debe proteger operaciones concurrentes.

Ejemplo:

```text
Stock = 1

POS A → vende
POS B → vende
```

Solo una operación puede consumir la última unidad.

---

# 39. IDEMPOTENCIA

### RN-199

Las operaciones críticas deben poder identificar solicitudes duplicadas.

Especialmente:

```text
Pago
Factura
Transferencia
Recepción
Stock
Devolución
```

### RN-200

Repetir una misma solicitud no debe crear dos operaciones.

---

# 40. DINERO

### RN-201

Los importes monetarios deben utilizar precisión decimal apropiada.

### RN-202

No utilizar `float` para representar dinero en producción.

### RN-203

Todo movimiento financiero debe tener importe positivo y dirección explícita.

### RN-204

Los balances deben derivarse de movimientos.

---

# 41. DATOS HISTÓRICOS

### RN-205

Los documentos históricos deben conservar sus valores relevantes.

Por ejemplo:

```text
Precio aplicado
Costo histórico
Cliente
Sucursal
Usuario
Método de pago
Cuenta financiera
```

No deben depender exclusivamente de la configuración actual.

---

# 42. SEGURIDAD

### RN-206

La autorización debe comprobarse en backend.

### RN-207

Ocultar un botón no constituye una medida de seguridad.

### RN-208

Las operaciones administrativas requieren permisos explícitos.

### RN-209

Los secretos nunca deben almacenarse en auditoría.

### RN-210

Las credenciales no deben formar parte de snapshots.

---

# 43. DEMO

La demo debe implementar las reglas esenciales sin intentar construir toda la infraestructura productiva.

Debe demostrar correctamente:

```text
Producto
↓
Stock
↓
Venta
↓
Pago
↓
Caja
↓
Movimiento financiero
↓
Auditoría
```

También:

```text
Depósito
↓
Transferencia
↓
Remito
↓
En tránsito
↓
Recepción
↓
Stock destino
```

Y:

```text
Reserva
↓
Seña
↓
Retiro
↓
Venta
```

---

# 44. REGLAS QUE OPEN CODE NO DEBE INVENTAR

OpenCode no debe asumir automáticamente:

* políticas de devolución;
* límites de descuento;
* días de reserva;
* porcentajes de comisión;
* condiciones de seña;
* políticas salariales;
* permisos especiales;
* tipos fiscales no definidos;
* reglas contables no documentadas;
* períodos legales de conservación;
* integración fiscal no especificada.

Cuando una regla no esté definida:

```text
NO INVENTAR
      ↓
IDENTIFICAR AMBIGÜEDAD
      ↓
PROPONER OPCIONES
      ↓
ESPERAR DECISIÓN
      ↓
DOCUMENTAR DECISIÓN
```

---

# 45. REGLA DE CONFLICTO

Si dos documentos presentan reglas incompatibles:

```text
NO ELEGIR SILENCIOSAMENTE
```

OpenCode debe:

1. identificar el conflicto;
2. informar los documentos involucrados;
3. explicar la incompatibilidad;
4. proponer una resolución;
5. esperar decisión;
6. actualizar documentación después de la aprobación.

---

# 46. REGLA DE IMPLEMENTACIÓN

Antes de implementar una funcionalidad:

```text
Revisar regla
      ↓
Revisar estado
      ↓
Revisar permisos
      ↓
Revisar modelo de datos
      ↓
Revisar auditoría
      ↓
Implementar
      ↓
Probar
```

No implementar únicamente basándose en una pantalla.

---

# 47. MATRIZ DE REGLAS CRÍTICAS

| Área           | Regla crítica                    |
| -------------- | -------------------------------- |
| Stock          | No editar stock directamente     |
| Venta          | POS no reemplaza caja            |
| Caja           | Solo cajero autorizado finaliza  |
| Pagos          | Métodos pueden combinarse        |
| Finanzas       | Saldos derivan de movimientos    |
| Transferencias | Destino recibe al confirmar      |
| Reservas       | Reserva bloquea stock disponible |
| Señas          | Se aplican una sola vez          |
| Publicidad     | Préstamo ≠ venta                 |
| Cambios        | Venta original permanece intacta |
| Empleados      | Empleado ≠ usuario               |
| Facturación    | Venta ≠ factura                  |
| Auditoría      | Historial append-only            |
| Seguridad      | Permisos validados en backend    |
| Concurrencia   | No vender stock inexistente      |
| Idempotencia   | No duplicar operaciones          |

---

# 48. PRINCIPIO ARQUITECTÓNICO FINAL

Todas las funcionalidades del sistema deben poder expresarse como:

```text
ACTOR
   ↓
PRECONDICIONES
   ↓
OPERACIÓN
   ↓
VALIDACIONES
   ↓
CAMBIO DE ESTADO
   ↓
MOVIMIENTOS
   ↓
DOCUMENTOS
   ↓
AUDITORÍA
```

Ejemplo:

```text
Cajero
   ↓
Venta PENDING_PAYMENT
   ↓
Validar permisos
   ↓
Registrar pago
   ↓
Validar total
   ↓
PAID
   ↓
Stock OUT
   ↓
FinancialMovement
   ↓
Invoice
   ↓
AuditLog
```

Esta estructura debe mantenerse en todos los módulos.

> **Si una funcionalidad no puede explicar claramente qué cambia, por qué cambia, quién puede ejecutarla y cómo queda registrada, todavía no está suficientemente definida para producción.**
