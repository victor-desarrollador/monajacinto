# 21 — AUDITORÍA Y TRAZABILIDAD

## 1. OBJETIVO

El sistema debe permitir reconstruir de forma confiable cualquier operación realizada dentro de la empresa.

La auditoría no es solamente un historial visual.

Debe permitir determinar:

* quién realizó una acción;
* qué acción realizó;
* sobre qué entidad;
* qué datos estaban antes;
* qué datos quedaron después;
* cuándo ocurrió;
* desde qué sucursal;
* desde qué POS o dispositivo, cuando corresponda;
* qué operación originó el cambio;
* qué documentos están relacionados;
* si la acción fue exitosa o rechazada;
* quién autorizó una operación cuando requirió aprobación.

### Principio central

> **Nada importante debe poder cambiar silenciosamente.**

Las operaciones críticas deben dejar una evidencia trazable.

---

# 2. ALCANCE

La auditoría debe cubrir como mínimo:

* autenticación;
* usuarios;
* permisos;
* sucursales;
* POS;
* cajas;
* productos;
* variantes;
* stock;
* compras;
* proveedores;
* recepción de mercadería;
* transferencias;
* remitos;
* ventas;
* pagos;
* cajas;
* arqueos;
* tesorería;
* cuentas financieras;
* reservas;
* señas;
* préstamos de publicidad;
* cambios;
* devoluciones;
* empleados;
* sueldos;
* ventas a empleados;
* facturación;
* reportes;
* exportaciones;
* configuraciones críticas.

---

# 3. PRINCIPIOS DE AUDITORÍA

## 3.1 Append-only

Los registros de auditoría deben ser conceptualmente **append-only**.

Una entrada de auditoría creada no debe modificarse para ocultar o alterar el historial.

Si existe un error:

```text
Evento original
      ↓
Nuevo evento correctivo
```

No:

```text
Evento original
      ↓
Editar historial
```

---

# 4. QUÉ DEBE REGISTRARSE

Cada evento de auditoría debería contener, como mínimo:

```text
AuditLog
├── id
├── timestamp
├── actorId
├── actorRole
├── action
├── entityType
├── entityId
├── operationId
├── referenceType
├── referenceId
├── branchId
├── posId
├── cashRegisterId
├── result
├── reason
├── beforeSnapshot
├── afterSnapshot
├── metadata
├── requestId
├── createdAt
└── severity
```

No todos los campos serán obligatorios para todos los eventos.

---

# 5. ACTOR

Cada acción relevante debe poder asociarse a un actor.

Ejemplo:

```text
actorId: usr_001
actorRole: CASHIER
```

Debe distinguirse entre:

* usuario que ejecutó;
* usuario que autorizó;
* usuario que creó originalmente la operación;
* usuario que realizó una acción posterior.

Ejemplo:

```text
Creada por: vendedor
Autorizada por: encargado
Finalizada por: cajero
```

Esto es especialmente importante para operaciones con permisos elevados.

---

# 6. ACCIONES

Las acciones deben utilizar una nomenclatura consistente.

Ejemplos:

```text
CREATE
UPDATE
DELETE_REQUEST
CANCEL
APPROVE
REJECT
FINALIZE
CONFIRM
RECEIVE
DISPATCH
TRANSFER
PAY
REFUND
CLOSE
OPEN
EXPORT
LOGIN
LOGOUT
LOGIN_FAILED
PERMISSION_DENIED
```

No es necesario registrar únicamente cambios de datos.

También deben registrarse acciones relevantes que hayan sido rechazadas.

---

# 7. RESULTADO DE LA ACCIÓN

Cada evento debe poder indicar:

```text
SUCCESS
FAILED
REJECTED
DENIED
CANCELLED
```

Ejemplo:

```text
Action:
FINALIZE_SALE

Result:
DENIED

Reason:
USER_HAS_NO_CASHIER_PERMISSION
```

Esto permite detectar intentos de realizar operaciones fuera de las responsabilidades del usuario.

---

# 8. BEFORE / AFTER

Para cambios relevantes se recomienda conservar una representación del estado anterior y posterior.

Ejemplo:

```json
{
  "before": {
    "salePrice": 45000
  },
  "after": {
    "salePrice": 49000
  }
}
```

Esto permite determinar exactamente qué cambió.

No debe utilizarse para almacenar información sensible innecesaria.

Los datos sensibles deben:

* ocultarse;
* enmascararse;
* excluirse;
* o almacenarse mediante referencias seguras.

---

# 9. OPERATION ID

Una operación de negocio puede generar múltiples eventos.

Por eso debe existir un identificador común:

```text
operationId
```

Ejemplo:

```text
OP-2026-000153
```

Una venta puede generar:

```text
SALE_CREATED
PAYMENT_CREATED
STOCK_MOVEMENT_CREATED
CASH_MOVEMENT_CREATED
INVOICE_CREATED
SALE_COMPLETED
```

Todos pueden compartir:

```text
operationId = OP-2026-000153
```

Esto permite reconstruir la operación completa.

---

# 10. REQUEST ID

A nivel técnico debe existir un identificador de solicitud:

```text
requestId
```

Ejemplo:

```text
REQ-8f32a91c
```

Sirve para relacionar:

```text
Frontend
   ↓
API
   ↓
Service
   ↓
Database
```

con una misma solicitud técnica.

Esto facilita debugging y análisis de incidentes.

---

# 11. RELACIÓN ENTRE AUDITORÍA Y DOCUMENTOS

Los eventos deben poder relacionarse con documentos y operaciones.

Ejemplo:

```text
AuditLog
    ↓
Sale
    ↓
Payment
    ↓
FinancialMovement
    ↓
Invoice
```

Otro ejemplo:

```text
Transfer
    ↓
Remito
    ↓
StockMovement OUT
    ↓
StockMovement IN
```

La auditoría debe permitir navegar entre estos elementos.

---

# 12. AUDITORÍA DE STOCK

Los cambios de stock son críticos.

Debe registrarse:

```text
qué variante
qué cantidad
origen
destino
tipo de movimiento
usuario
fecha
operación relacionada
documento relacionado
```

Ejemplo:

```text
Variant:
REM-NEG-M

Movement:
TRANSFER_OUT

Quantity:
5

From:
Depósito Central

To:
Sucursal Centro

User:
Juan

Reference:
TRF-00023
```

Nunca debería existir:

```text
Stock = 25 → Stock = 30
```

sin explicación.

Debe existir un movimiento que explique:

```text
+5
ADJUSTMENT_IN
motivo: diferencia de inventario
usuario: supervisor
```

---

# 13. AUDITORÍA DE VENTAS

Una venta debe poder reconstruirse.

Ejemplo:

```text
Venta #000154
│
├── Creación
├── Productos agregados
├── Descuento
├── Envío a cobro
├── Pago
├── Facturación
├── Movimiento de stock
├── Movimiento financiero
└── Finalización
```

Si una venta es cancelada posteriormente:

```text
Venta creada
      ↓
Pagada
      ↓
Facturada
      ↓
Cancelada
      ↓
Movimiento compensatorio
```

Nunca debe desaparecer del historial.

---

# 14. AUDITORÍA DE CAJA

Debe registrar:

* apertura;
* fondo inicial;
* ingresos;
* egresos;
* devoluciones;
* retiros;
* depósitos;
* arqueo;
* diferencia;
* cierre;
* reapertura autorizada, si existe.

Ejemplo:

```text
Caja #CAJA-CENTRO
Sesión #CS-00128

Apertura:
$100.000

Esperado:
$435.000

Contado:
$430.000

Diferencia:
-$5.000
```

La diferencia debe permanecer registrada.

No debe modificarse posteriormente para hacer coincidir artificialmente el sistema con el efectivo.

---

# 15. AUDITORÍA DE TESORERÍA

Debe registrarse cada movimiento financiero:

```text
SALE
SUPPLIER_PAYMENT
EXPENSE
WITHDRAWAL
DEPOSIT
TRANSFER
REFUND
SALARY
ADJUSTMENT
```

También:

```text
cuenta origen
cuenta destino
importe
usuario
aprobador
fecha
referencia
motivo
```

Especial atención a:

```text
BANCO → MERCADO PAGO
CAJA → BANCO
CAJA → CAJA MAYOR
CAJA MAYOR → BANCO
```

Los movimientos internos no deben contabilizarse como nuevos ingresos.

---

# 16. AUDITORÍA DE COMPRAS

Debe poder reconstruirse:

```text
Proveedor
   ↓
Orden de compra
   ↓
Recepción
   ↓
Diferencias
   ↓
Stock
   ↓
Factura proveedor
   ↓
Pago
```

Si se recibió menos mercadería de la esperada:

```text
Esperado: 100
Recibido: 95
Diferencia: -5
```

debe quedar registrada.

---

# 17. AUDITORÍA DE TRANSFERENCIAS

Debe registrarse:

```text
Solicitud
Aprobación
Preparación
Picking
Remito
Despacho
TRANSFER_OUT
IN_TRANSIT
Recepción
TRANSFER_IN
```

Si la sucursal recibe una cantidad diferente:

```text
Enviado: 10
Recibido: 9
Diferencia: 1
```

debe quedar registrada junto con el incidente correspondiente.

---

# 18. AUDITORÍA DE RESERVAS

Registrar:

```text
Reserva creada
Productos reservados
Seña registrada
Extensión
Cancelación
Vencimiento
Retiro
Conversión a venta
```

Debe poder determinarse:

```text
quién reservó
qué producto
para qué cliente
cuánto dejó
hasta cuándo
qué ocurrió finalmente
```

---

# 19. AUDITORÍA DE PRÉSTAMOS DE PUBLICIDAD

Registrar:

```text
Solicitud
Aprobación
Entrega
Salida de stock
Extensión
Devolución
Devolución parcial
Daño
Pérdida
Venta
Cancelación
```

Ejemplo:

```text
Producto:
CAM-001 / Talle M

Salida:
MARKETING_LOAN

Responsable:
Usuario X

Motivo:
Producción campaña verano

Resultado:
DAMAGED
```

---

# 20. AUDITORÍA DE CAMBIOS Y DEVOLUCIONES

Nunca modificar la venta original para simular un cambio.

Debe existir:

```text
Venta original
      ↓
Cambio/devolución
      ↓
Movimiento stock
      ↓
Nuevo pago o devolución
```

Debe registrarse:

* venta original;
* motivo;
* producto devuelto;
* producto entregado;
* diferencia;
* método de devolución/pago;
* autorización;
* usuario;
* sucursal donde se procesó.

---

# 21. AUDITORÍA DE EMPLEADOS

Debe cubrir:

* alta;
* baja;
* cambios de rol;
* cambios de sucursal;
* cambios salariales;
* anticipos;
* liquidaciones;
* pagos;
* compras de empleados;
* autorizaciones especiales.

Los cambios salariales deben conservar historial.

Ejemplo:

```text
01/01:
$800.000

01/07:
$950.000

01/09:
$1.100.000
```

No reemplazar el valor histórico.

---

# 22. AUDITORÍA DE FACTURACIÓN

Registrar:

```text
Solicitud de factura
Tipo de comprobante
Punto de venta
Número
Respuesta ARCA
CAE
Vencimiento CAE
Estado
Error
Reintento
Nota de crédito
Nota de débito
```

Especialmente importante distinguir:

```text
REQUESTED
AUTHORIZED
REJECTED
FAILED
PENDING
```

Un timeout no debe interpretarse automáticamente como factura no emitida.

Debe poder investigarse el resultado antes de repetir una operación para evitar duplicados.

---

# 23. AUDITORÍA DE AUTORIZACIONES

Las acciones sensibles pueden requerir autorización.

Ejemplos:

```text
Descuento excepcional
Anulación de venta
Devolución
Ajuste de stock
Retiro de dinero
Pago a proveedor
Cambio de precio
Reapertura de caja
```

Debe quedar:

```text
requestedBy
approvedBy
approvedAt
reason
```

Ejemplo:

```text
Ajuste stock
Solicitado por: Vendedor
Autorizado por: Supervisor
Motivo: diferencia inventario
```

---

# 24. PERMISOS Y ACCIONES DENEGADAS

También se recomienda auditar intentos importantes rechazados.

Ejemplo:

```text
Usuario: vendedor01
Acción: CLOSE_CASH_REGISTER
Resultado: DENIED
Motivo: ROLE_NOT_ALLOWED
```

Esto ayuda a detectar:

* errores de permisos;
* intentos incorrectos;
* configuraciones defectuosas;
* comportamientos sospechosos.

---

# 25. LOGIN Y SEGURIDAD

Registrar eventos relevantes:

```text
LOGIN
LOGOUT
LOGIN_FAILED
PASSWORD_CHANGED
ACCOUNT_LOCKED
SESSION_EXPIRED
PERMISSION_DENIED
```

La información técnica asociada debe manejarse de acuerdo con las necesidades de seguridad y privacidad del sistema.

Cuando sea apropiado pueden registrarse:

```text
IP
user-agent
device/session identifier
```

pero no deben almacenarse datos innecesarios.

---

# 26. INFORMACIÓN SENSIBLE

La auditoría no debe convertirse en una copia indiscriminada de toda la base de datos.

No almacenar innecesariamente:

* contraseñas;
* tokens;
* secretos;
* credenciales;
* datos completos de tarjetas;
* información sensible que no sea necesaria.

Para información financiera o bancaria utilizar:

```text
masked value
reference
accountId
institution
```

cuando sea suficiente.

---

# 27. AUDITORÍA DE EXPORTACIONES

Exportar información también debe poder auditarse.

Ejemplo:

```text
Usuario:
superadmin

Acción:
EXPORT

Reporte:
Ventas

Filtro:
01/08/2026 → 31/08/2026

Formato:
XLSX

Resultado:
SUCCESS
```

Esto es especialmente importante para información financiera y datos de clientes.

---

# 28. AUDITORÍA DE CONFIGURACIONES

Deben registrarse cambios críticos como:

* precios;
* listas de precios;
* impuestos;
* permisos;
* roles;
* sucursales;
* cuentas financieras;
* métodos de pago;
* límites;
* políticas de devolución;
* parámetros de reservas;
* configuración fiscal.

Ejemplo:

```text
Precio anterior:
$50.000

Precio nuevo:
$55.000

Usuario:
Administrador

Motivo:
Actualización de temporada
```

---

# 29. SEVERIDAD

Los eventos pueden clasificarse:

```text
INFO
WARNING
CRITICAL
SECURITY
```

Ejemplos:

```text
INFO:
Venta completada

WARNING:
Diferencia de arqueo

CRITICAL:
Ajuste importante de stock

SECURITY:
Múltiples LOGIN_FAILED
```

Esto permitirá posteriormente construir alertas.

---

# 30. TIMELINE DE OPERACIÓN

La interfaz debe permitir visualizar una operación como una línea temporal.

Ejemplo:

```text
09:42:11  Venta creada
09:42:18  Producto agregado
09:43:02  Venta enviada a caja
09:44:15  Pago registrado
09:44:17  Stock descontado
09:44:19  Factura autorizada
09:44:21  Venta finalizada
```

Esto debe ser una herramienta de diagnóstico, no simplemente una lista de logs.

---

# 31. RECONSTRUCCIÓN DE UNA OPERACIÓN

Desde una venta debería poder navegarse hacia:

```text
Venta
 ├── Cliente
 ├── Vendedor
 ├── POS
 ├── Caja
 ├── Productos
 ├── Stock movements
 ├── Payments
 ├── Financial movements
 ├── Invoice
 └── Audit timeline
```

Desde un movimiento financiero:

```text
FinancialMovement
      ↓
Operation
      ↓
Sale / Expense / Supplier Payment / Refund
      ↓
AuditLog
```

El objetivo es poder responder:

> **¿De dónde salió este número?**

---

# 32. CORRELATION ID

Además de `operationId` y `requestId`, puede existir:

```text
correlationId
```

para agrupar operaciones relacionadas.

Ejemplo:

```text
Venta
   ↓
Cambio
   ↓
Devolución
   ↓
Nueva venta
```

Todas pueden formar parte de una misma cadena comercial.

---

# 33. IDEMPOTENCIA

Las operaciones críticas deben soportar idempotencia.

Especialmente:

* pagos;
* facturación;
* transferencias;
* recepción;
* movimientos de stock;
* devoluciones.

Ejemplo:

```text
requestId = REQ-123
```

Si la misma solicitud llega dos veces:

```text
Primera:
procesada

Segunda:
detectada como duplicada
```

No debe generar:

```text
2 ventas
2 pagos
2 facturas
2 movimientos de stock
```

---

# 34. CONCURRENCIA

La auditoría debe convivir con operaciones concurrentes.

Ejemplo:

```text
POS 1 → vende último talle M
POS 2 → intenta vender último talle M
```

El sistema debe impedir que ambos consuman la misma unidad.

La auditoría debe permitir saber:

```text
qué operación ganó
qué operación fue rechazada
por qué
```

---

# 35. RETENCIÓN

La política de retención de auditoría debe ser configurable y definirse de acuerdo con:

* necesidades operativas;
* seguridad;
* volumen;
* obligaciones aplicables;
* política de la empresa.

No asumir un período legal fijo sin validación específica.

Para producción puede implementarse archivado de eventos históricos.

---

# 36. INTEGRIDAD AVANZADA

Como endurecimiento futuro, puede incorporarse una estrategia de integridad criptográfica.

Ejemplo conceptual:

```text
Evento 1
hash → ABC

Evento 2
previousHash = ABC
hash → DEF

Evento 3
previousHash = DEF
hash → GHI
```

Esto permitiría detectar modificaciones posteriores del historial.

No es obligatorio para la demo.

Puede considerarse una mejora de producción dependiendo del nivel de riesgo requerido.

---

# 37. MODELO CONCEPTUAL

```text
                    ┌───────────────┐
                    │    Usuario    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Operación   │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
           Stock          Dinero        Fiscal
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                    ┌───────────────┐
                    │   AuditLog    │
                    └───────┬───────┘
                            │
                            ▼
                    Timeline completa
```

---

# 38. ROLES

## Vendedor

Puede consultar:

* sus operaciones;
* historial permitido;
* estados de ventas.

No puede modificar auditoría.

## Cajero

Puede consultar:

* operaciones de caja;
* pagos;
* arqueos;
* movimientos relacionados.

No puede eliminar auditoría.

## Encargado

Puede consultar auditoría de su sucursal.

## Depósito

Puede consultar auditoría relacionada con:

* recepción;
* stock;
* transferencias;
* remitos.

## Tesorería

Puede consultar:

* movimientos financieros;
* cuentas;
* cajas;
* pagos;
* transferencias.

## Super Admin

Puede consultar auditoría global.

Ningún rol operativo debería poder borrar o alterar el historial de auditoría.

---

# 39. BÚSQUEDA Y FILTROS

La pantalla de auditoría debe permitir filtrar por:

```text
Fecha
Usuario
Sucursal
POS
Caja
Acción
Entidad
Entidad ID
Operación
Resultado
Severidad
```

Ejemplo:

```text
Sucursal: Centro
Usuario: Juan
Entidad: Sale
Fecha: 01/09/2026 → 03/09/2026
```

---

# 40. DETALLE DEL EVENTO

Al abrir un evento:

```text
Evento #AUD-000123

Fecha:
03/09/2026 10:42:18

Usuario:
Juan Pérez

Rol:
CASHIER

Acción:
FINALIZE_SALE

Entidad:
Sale #000154

Operación:
OP-2026-000153

Sucursal:
Centro

Resultado:
SUCCESS
```

Luego:

```text
Estado anterior
Estado posterior
Documentos relacionados
Eventos relacionados
```

---

# 41. DASHBOARD DE AUDITORÍA

El dashboard puede mostrar:

```text
Eventos hoy
Operaciones críticas
Acciones rechazadas
Diferencias de caja
Ajustes de stock
Devoluciones
Cancelaciones
Cambios de precios
Exportaciones
Intentos de acceso fallidos
```

No debe utilizarse como sustituto del análisis detallado.

---

# 42. ALERTAS FUTURAS

La auditoría permitirá implementar posteriormente reglas como:

```text
> X ajustes de stock en un día
> X devoluciones realizadas por usuario
> múltiples descuentos excepcionales
> múltiples LOGIN_FAILED
> diferencia de caja superior al límite
> gran cantidad de cancelaciones
> cambios masivos de precios
```

Estas alertas no son obligatorias para la demo.

---

# 43. DEMO

La demo debe mostrar al menos un caso completo.

## Caso 1 — Venta

```text
Vendedor crea venta
        ↓
Venta enviada a caja
        ↓
Cajero cobra
        ↓
Stock actualizado
        ↓
Factura simulada
        ↓
Venta finalizada
```

Luego abrir:

```text
Auditoría → Venta #000001
```

y visualizar toda la cadena.

---

## Caso 2 — Ajuste de stock

```text
Supervisor solicita ajuste
        ↓
Indica motivo
        ↓
Sistema registra movimiento
        ↓
Auditoría registra before/after
```

Debe poder visualizarse:

```text
Stock:
10 → 12

Motivo:
Diferencia inventario

Usuario:
Supervisor
```

---

## Caso 3 — Caja

```text
Apertura
↓
Ventas
↓
Retiro
↓
Arqueo
↓
Diferencia
↓
Cierre
```

Todo debe quedar trazable.

---

## Caso 4 — Acción rechazada

```text
Vendedor intenta cerrar caja
        ↓
Sistema rechaza
        ↓
PERMISSION_DENIED
        ↓
AuditLog
```

---

# 44. DEMO VS PRODUCCIÓN

## DEMO

Puede utilizar:

* almacenamiento local;
* mock data;
* IDs simplificados;
* snapshots JSON;
* timeline simulada;
* auditoría en memoria/localStorage.

Debe demostrar el concepto correctamente.

## PRODUCCIÓN

Debe utilizar:

* PostgreSQL;
* transacciones;
* append-only audit records;
* índices;
* permisos;
* request IDs;
* operation IDs;
* correlation IDs;
* snapshots controlados;
* masking de información sensible;
* políticas de retención;
* monitoreo;
* backups;
* protección contra manipulación;
* controles de acceso.

---

# 45. REGLAS DE NEGOCIO

### Regla 1

Una operación crítica debe generar auditoría.

### Regla 2

El historial no se modifica para ocultar errores.

### Regla 3

Las correcciones generan nuevos eventos.

### Regla 4

Los movimientos de stock deben poder relacionarse con una operación.

### Regla 5

Los movimientos financieros deben poder rastrearse hasta su origen.

### Regla 6

Las autorizaciones deben identificar solicitante y aprobador.

### Regla 7

Las acciones denegadas importantes deben poder auditarse.

### Regla 8

Los datos sensibles no deben almacenarse innecesariamente.

### Regla 9

La auditoría debe permitir reconstruir una operación completa.

### Regla 10

La auditoría no debe depender exclusivamente de la interfaz.

### Regla 11

El backend debe ser responsable de generar los eventos críticos.

### Regla 12

Un usuario operativo no puede eliminar su propio historial.

---

# 46. CRITERIOS DE ACEPTACIÓN

El módulo se considera correctamente implementado cuando:

* [ ] las operaciones críticas generan AuditLog;
* [ ] cada evento identifica actor;
* [ ] cada evento tiene timestamp;
* [ ] las operaciones tienen correlation/operation ID cuando corresponde;
* [ ] se registra entidad y referencia;
* [ ] existen resultados SUCCESS/FAILED/DENIED;
* [ ] los cambios relevantes permiten visualizar before/after;
* [ ] los movimientos de stock son trazables;
* [ ] los movimientos financieros son trazables;
* [ ] las ventas pueden reconstruirse;
* [ ] los arqueos quedan registrados;
* [ ] las autorizaciones quedan registradas;
* [ ] las acciones críticas rechazadas quedan registradas;
* [ ] no se puede borrar el historial desde roles operativos;
* [ ] la auditoría puede filtrarse;
* [ ] existe timeline;
* [ ] puede navegarse desde una operación hacia sus documentos relacionados;
* [ ] la información sensible está protegida;
* [ ] la demo muestra al menos una operación completa.

---

# 47. PRINCIPIO FINAL

La auditoría no debe ser un módulo aislado.

Debe ser una **capa transversal del sistema**.

Cada módulo debe producir eventos trazables:

```text
DEPÓSITO
   ↓
COMPRAS
   ↓
TRANSFERENCIAS
   ↓
STOCK
   ↓
VENTAS
   ↓
CAJAS
   ↓
TESORERÍA
   ↓
FACTURACIÓN
   ↓
AUDITORÍA
```

La pregunta que el sistema debe poder responder siempre es:

> **¿Qué pasó con esta operación y cómo puedo demostrarlo?**

La respuesta debe surgir de los datos del sistema, no de explicaciones manuales.

**Principio arquitectónico:**

> **Todo cambio importante debe tener actor, momento, motivo, referencia y evidencia.**
