# AGENTS.md

# VM Digital Studio — Sistema de Gestión Multisucursal

## AI Agent Engineering Instructions

**Proyecto:** Sistema de Gestión Empresarial Multisucursal para Indumentaria
**Agencia:** VM Digital Studio
**Documento:** `AGENTS.md`
**Versión:** 1.0
**Estado:** Normativa de implementación para agentes de IA
**Alcance:** Todo el repositorio

---

# 1. PROPÓSITO

Este archivo define las reglas que cualquier agente de IA, incluyendo OpenCode, debe seguir al analizar, modificar, crear, refactorizar, probar o desplegar código de este proyecto.

Este archivo tiene prioridad operativa sobre decisiones improvisadas del agente.

Antes de implementar una funcionalidad, el agente debe comprender:

```text
REQUISITO
    ↓
REGLA DE NEGOCIO
    ↓
ESTADO
    ↓
MODELO DE DATOS
    ↓
ARQUITECTURA
    ↓
SEGURIDAD
    ↓
IMPLEMENTACIÓN
    ↓
TESTING
    ↓
AUDITORÍA
```

No implementar directamente desde una descripción superficial de una pantalla.

---

# 2. DOCUMENTACIÓN AUTORITATIVA

La especificación funcional está definida por:

```text
docs/
├── 01_VISION_Y_ALCANCE.md
├── 02_ROLES_Y_PERMISOS.md
├── 03_EMPRESA_SUCURSALES_Y_POS.md
├── 04_PRODUCTOS_VARIANTES_Y_PRECIOS.md
├── 05_INVENTARIO_Y_STOCK.md
├── 06_DEPOSITO.md
├── 07_COMPRAS_Y_PROVEEDORES.md
├── 08_TRANSFERENCIAS_Y_REMITOS.md
├── 09_VENTAS_Y_POS.md
├── 10_CAJAS_Y_ARQUEOS.md
├── 11_TESORERIA_Y_CAJA_MAYOR.md
├── 12_CUENTAS_FINANCIERAS.md
├── 13_PAGOS_Y_MOVIMIENTOS_DINERO.md
├── 14_RESERVAS_Y_SEÑAS.md
├── 15_PRESTAMOS_PUBLICIDAD.md
├── 16_CAMBIOS_Y_DEVOLUCIONES.md
├── 17_EMPLEADOS_Y_SUELDOS.md
├── 18_VENTAS_DE_EMPLEADOS.md
├── 19_FACTURACION_ARCA.md
├── 20_REPORTES_Y_EXPORTACIONES.md
├── 21_AUDITORIA_Y_TRAZABILIDAD.md
├── 22_REGLAS_DE_NEGOCIO.md
├── 23_ESTADOS_Y_TRANSICIONES.md
├── 24_MODELO_DE_DATOS.md
├── 25_ARQUITECTURA_TECNICA.md
├── 26_SEGURIDAD.md
├── 27_INFRAESTRUCTURA_Y_DEPLOYMENT.md
└── 28_TESTING_QA_Y_DEFINITION_OF_DONE.md
```

Documentos complementarios:

```text
AGENTS.md
CHANGELOG.md
```

---

# 3. REGLA DE LECTURA ANTES DE IMPLEMENTAR

Antes de modificar una funcionalidad existente o implementar una nueva, el agente debe localizar la documentación relacionada.

Como mínimo debe revisar:

1. módulo funcional;
2. reglas de negocio;
3. estados y transiciones;
4. modelo de datos;
5. arquitectura técnica;
6. seguridad;
7. testing/Definition of Done.

Ejemplo:

Para implementar una venta:

```text
09_VENTAS_Y_POS
22_REGLAS_DE_NEGOCIO
23_ESTADOS_Y_TRANSICIONES
24_MODELO_DE_DATOS
25_ARQUITECTURA_TECNICA
26_SEGURIDAD
28_TESTING_QA_Y_DEFINITION_OF_DONE
```

---

# 4. REGLA PRINCIPAL

> **El frontend solicita. El backend decide. La base de datos persiste. Los movimientos explican los cambios. La auditoría demuestra lo ocurrido. Los tests demuestran que funciona.**

Nunca invertir esta responsabilidad.

---

# 5. ARQUITECTURA

Arquitectura objetivo:

```text
React + TypeScript + Vite
          ↓
        HTTPS
          ↓
Node.js + Express + TypeScript
          ↓
       Services
          ↓
        Prisma
          ↓
     PostgreSQL
```

Integraciones:

```text
Application
     ↓
Provider interface
     ↓
Adapter
     ↓
External service
```

Para fiscalidad:

```text
FiscalProvider
      ↓
 ARCAAdapter
      ↓
   WSFEv1
```

---

# 6. ARQUITECTURA MODULAR

El sistema debe mantenerse como un **modular monolith** mientras la escala no justifique otra arquitectura.

No introducir microservicios simplemente porque sea técnicamente posible.

No introducir Kubernetes por defecto.

No introducir Redis por defecto.

No introducir event-driven architecture compleja sin una necesidad real.

Prioridad:

```text
simple
→
modular
→
testeable
→
seguro
→
escalable
```

---

# 7. ESTRUCTURA DEL REPOSITORIO

La estructura objetivo:

```text
/
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── config/
│   └── ...
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│
├── docs/
├── tests/
├── scripts/
├── infra/
│
├── AGENTS.md
├── CHANGELOG.md
├── README.md
├── .env.example
└── package.json
```

El agente debe respetar la estructura existente si el repositorio ya fue inicializado de otra forma, salvo que exista una razón documentada para modificarla.

---

# 8. BACKEND

Separar responsabilidades:

```text
route/controller
        ↓
validation
        ↓
service
        ↓
domain/business logic
        ↓
repository/data access
        ↓
Prisma
        ↓
PostgreSQL
```

No colocar lógica empresarial compleja dentro de:

* controllers;
* routes;
* componentes React;
* queries improvisadas.

---

# 9. FRONTEND

El frontend debe encargarse principalmente de:

* presentación;
* navegación;
* formularios;
* interacción;
* validación UX;
* feedback;
* estados visuales.

No debe ser la autoridad de:

* permisos;
* stock;
* precios finales;
* dinero;
* estados críticos;
* facturación.

---

# 10. BACKEND COMO AUTORIDAD

Nunca confiar en:

```text
role
branchId
price
discount
total
stock
permissions
status
```

enviados por el cliente sin validación.

El backend debe determinar qué puede hacer el usuario.

---

# 11. SEGURIDAD

Aplicar:

```text
Authentication
+
Authorization
+
Company scope
+
Branch scope
+
Resource authorization
+
Business rules
```

El patrón mental debe ser:

```text
¿Quién?
+
¿Qué puede hacer?
+
¿Sobre qué recurso?
+
¿En qué empresa?
+
¿En qué sucursal?
+
¿En qué estado está?
```

---

# 12. RBAC

No utilizar únicamente:

```text
if (user.role === "ADMIN")
```

para todas las decisiones.

Preferir permisos explícitos cuando corresponda:

```text
sales.create
sales.finalize
cash.close
inventory.adjust
transfer.approve
treasury.view
treasury.manage
employees.salary.manage
invoice.issue
```

Los nombres concretos deben seguir la especificación del módulo 02.

---

# 13. POS ≠ CAJA

Regla crítica:

```text
POS
=
terminal donde se registra la venta

CAJA
=
unidad donde se gestiona el cobro y arqueo
```

Flujo:

```text
SELLER
↓
Sale
↓
PENDING_PAYMENT
↓
CASHIER
↓
Payment
↓
PAID
↓
COMPLETED
```

Nunca hacer que el vendedor cierre la caja simplemente porque utiliza el POS.

---

# 14. STOCK

Regla crítica:

> **El stock no se edita arbitrariamente. El stock cambia como consecuencia de movimientos trazables.**

No implementar:

```text
inventory.quantity = newQuantity
```

como mecanismo general de modificación.

Preferir:

```text
StockMovement
↓
transaction
↓
inventory state
```

---

# 15. MOVIMIENTOS DE STOCK

Toda salida o entrada relevante debe tener:

```text
type
quantity
variant
location
user
timestamp
reference
operationId
```

cuando corresponda.

Ejemplos:

```text
PURCHASE_RECEIPT
SALE
TRANSFER_OUT
TRANSFER_IN
RESERVATION
RESERVATION_RELEASE
MARKETING_LOAN
MARKETING_RETURN
EXCHANGE_OUT
EXCHANGE_IN
ADJUSTMENT_IN
ADJUSTMENT_OUT
```

No inventar tipos sin revisar la documentación.

---

# 16. STOCK NEGATIVO

Por defecto:

```text
availableStock < 0
```

debe ser rechazado.

No solucionar stock negativo ocultándolo en frontend.

No utilizar:

```text
Math.max(stock, 0)
```

para ocultar inconsistencias.

Si existe una excepción de negocio, debe estar explícitamente definida.

---

# 17. DINERO

Regla crítica:

> **El dinero no se controla mediante balances editables; se controla mediante movimientos financieros trazables.**

Entidades conceptualmente separadas:

```text
Operation
Payment
FinancialMovement
FinancialAccount
CashMovement
```

No mezclarlas.

---

# 18. DINERO Y PRECISIÓN

Nunca utilizar `float` para dinero.

Utilizar:

```text
Decimal
```

o mecanismo equivalente seguro.

Ejemplo:

```text
100000.10
```

debe conservar precisión exacta.

---

# 19. PAGOS

Una venta puede tener:

```text
Payment #1
Payment #2
Payment #3
```

si se permite pago combinado.

Debe cumplirse:

```text
SUM(payments)
=
sale total
```

cuando la operación requiera pago completo.

---

# 20. MÉTODO DE PAGO ≠ CUENTA FINANCIERA

Ejemplo:

```text
paymentMethod = TRANSFERENCIA

financialAccount =
Banco Macro
```

o:

```text
paymentMethod = QR

financialAccount =
Mercado Pago
```

No almacenar ambas cosas como si fueran el mismo concepto.

---

# 21. CAJA

Cada sucursal puede tener:

```text
1 CashRegister
+
2–3 POS terminals
```

Los POS no crean cajas adicionales.

La caja tiene sesiones:

```text
OPEN
↓
ACTIVE
↓
CLOSING
↓
CLOSED
```

según los estados definidos.

---

# 22. ARQUEO

Nunca corregir automáticamente una diferencia.

Debe conservarse:

```text
expected
counted
difference
user
timestamp
```

Ejemplo:

```text
Expected = $500.000
Counted = $498.000
Difference = -$2.000
```

La diferencia es información, no un error que deba ocultarse.

---

# 23. TESORERÍA

No confundir:

```text
Ventas
Caja
Cuentas financieras
Tesorería
```

Una transferencia interna:

```text
Caja
↓
Banco
```

no representa un ingreso nuevo.

---

# 24. TRANSFERENCIAS DE STOCK

No colocar stock en destino antes de la recepción.

Flujo:

```text
REQUEST
↓
APPROVED
↓
PREPARING
↓
DISPATCHED
↓
IN_TRANSIT
↓
RECEIVED
```

El `TRANSFER_OUT` ocurre en el origen según las reglas del módulo 08.

El `TRANSFER_IN` ocurre al confirmar recepción.

---

# 25. RESERVAS

Una reserva:

```text
reserva
≠
venta
≠
depósito/seña
```

Una reserva afecta:

```text
reserved stock
```

No debe generar una salida física de inventario por sí sola.

Al retirar:

```text
Reservation
↓
Sale
↓
Stock exit
```

sin doble descuento.

---

# 26. PRÉSTAMOS DE PUBLICIDAD

Un préstamo no es una venta.

Estados como:

```text
DELIVERED
RETURNED
DAMAGED
MISSING
SOLD
```

deben mantenerse diferenciados.

Nunca eliminar simplemente el producto del stock porque salió para publicidad.

---

# 27. CAMBIOS Y DEVOLUCIONES

Nunca sobrescribir la venta original.

Crear una operación relacionada:

```text
Original Sale
↓
ReturnExchange
```

con movimientos compensatorios.

---

# 28. EMPLEADOS

Mantener separación:

```text
User
≠
Employee
≠
Salary
≠
FinancialMovement
```

Una venta de empleado sigue siendo una venta:

```text
Sale.saleType = EMPLOYEE
```

cuando así corresponda.

---

# 29. FACTURACIÓN ARCA

La facturación fiscal debe estar aislada mediante:

```text
FiscalProvider
```

No acoplar toda la aplicación directamente a ARCA.

Arquitectura:

```text
Sale
 ↓
FiscalProvider
 ↓
ARCAAdapter
 ↓
WSFEv1
```

Durante demo:

```text
MockFiscalProvider
```

Nunca conectar accidentalmente demo con producción fiscal.

---

# 30. IDEMPOTENCIA

Toda operación crítica que pueda recibir retries debe considerar idempotencia.

Especialmente:

* finalizar venta;
* pagos;
* facturación;
* transferencias;
* movimientos financieros;
* webhooks;
* operaciones externas.

Ejemplo:

```text
POST /sales/:id/finalize
```

enviado dos veces no debe producir dos operaciones.

---

# 31. CONCURRENCIA

Las operaciones críticas deben protegerse contra race conditions.

Especialmente:

```text
stock
reservations
payments
cash
financial accounts
sales
```

Usar transacciones y mecanismos apropiados de concurrencia.

No asumir que dos requests nunca llegarán simultáneamente.

---

# 32. TRANSACCIONES

Una operación que cambia varias entidades relacionadas debe utilizar una transacción cuando la atomicidad lo requiera.

Ejemplo:

```text
Sale
+
Payment
+
StockMovement
+
FinancialMovement
+
AuditLog
```

no debe quedar parcialmente aplicada.

---

# 33. AUDITORÍA

Toda operación crítica debe generar auditoría.

Debe permitir determinar:

```text
WHO
WHAT
WHEN
WHERE
WHY
REFERENCE
OPERATION
```

Nunca borrar el historial para “corregir” una operación.

---

# 34. OPERACIONES HISTÓRICAS

Una operación completada/autorizada no debe regresar arbitrariamente a:

```text
DRAFT
```

Para corregirla utilizar:

```text
refund
exchange
cancellation
adjustment
compensating operation
```

según el caso.

---

# 35. SOFT DELETE

No eliminar físicamente entidades históricas críticas si eso rompe trazabilidad.

Especial cuidado con:

* productos;
* variantes;
* usuarios;
* cuentas;
* proveedores;
* documentos;
* operaciones;
* auditoría.

La estrategia concreta debe seguir el modelo de datos.

---

# 36. VALIDACIÓN

Toda entrada externa debe validarse.

Preferir validación runtime mediante herramientas como:

```text
Zod
```

o equivalente definido en el proyecto.

Validar:

* tipos;
* rangos;
* formatos;
* relaciones;
* permisos;
* reglas de negocio.

---

# 37. ERRORES

Utilizar respuestas HTTP consistentes.

Conceptualmente:

```text
400 → request inválida
401 → no autenticado
403 → no autorizado
404 → recurso inexistente/no accesible
409 → conflicto
422 → regla/validación de negocio
429 → rate limit
500 → error interno
```

No exponer stack traces o secretos al usuario final.

---

# 38. LOGGING

Los logs deben ayudar a diagnosticar problemas.

Utilizar:

```text
requestId
correlationId
operationId
```

cuando corresponda.

Nunca registrar:

```text
passwords
tokens
API keys
secret keys
credenciales ARCA
datos sensibles innecesarios
```

---

# 39. REPORTES

Los reportes deben derivar de fuentes confiables.

No crear cálculos paralelos que contradigan:

```text
Sales
StockMovement
FinancialMovement
CashMovement
```

Un indicador debe poder rastrearse hasta sus datos de origen.

---

# 40. TESTING OBLIGATORIO

Toda funcionalidad significativa debe incluir pruebas apropiadas.

Como mínimo considerar:

```text
Unit
Integration
E2E
Security
Concurrency
Idempotency
Regression
```

No todas son necesarias para cada función simple, pero sí para operaciones críticas.

---

# 41. CRITICAL PATH

Debe mantenerse funcionando:

```text
LOGIN
↓
PRODUCT
↓
STOCK
↓
SALE
↓
PAYMENT
↓
CASH / TREASURY
↓
INVOICE
↓
AUDIT
↓
REPORT
```

Una regresión en este flujo bloquea release.

---

# 42. DEFINITION OF DONE

Una funcionalidad NO está terminada solamente porque:

```text
compila
```

o:

```text
la pantalla funciona
```

Debe cumplir:

```text
Requirement
+
Business Rules
+
State
+
Authorization
+
Persistence
+
Integrity
+
Audit
+
Tests
```

cuando corresponda.

---

# 43. CAMBIOS DE MODELO

Antes de modificar Prisma:

1. revisar relaciones existentes;
2. revisar constraints;
3. revisar operaciones relacionadas;
4. revisar migraciones;
5. revisar tests;
6. evaluar impacto histórico.

No cambiar el modelo simplemente para hacer que una implementación rápida funcione.

---

# 44. MIGRACIONES

Nunca modificar una migration ya aplicada en un ambiente compartido/productivo.

Crear una nueva migration.

Validar:

```text
fresh database
+
existing database
```

cuando corresponda.

---

# 45. DATOS HISTÓRICOS

Nunca romper referencias históricas para simplificar código.

Ejemplo:

Una venta debe seguir pudiendo identificar:

```text
producto
variante
precio histórico
cliente
sucursal
usuario
pago
factura
```

aunque el producto actual cambie.

---

# 46. PRECIOS

No asumir que cambiar el precio actual modifica ventas históricas.

Las operaciones comerciales deben conservar sus snapshots históricos necesarios.

---

# 47. SUCURSALES

Toda operación debe estar correctamente asociada al contexto empresarial.

Evitar:

```text
query global sin companyId
```

cuando el recurso requiere scope.

Aplicar:

```text
Company scope
+
Branch scope
```

según permisos.

---

# 48. NO CROSS-BRANCH ACCESS

Un usuario de:

```text
Sucursal A
```

no debe acceder automáticamente a:

```text
Sucursal B
```

simplemente porque conoce el ID del recurso.

Las excepciones deben ser explícitas para roles autorizados.

---

# 49. API DESIGN

Preferir endpoints que representen acciones de negocio.

Ejemplo:

```text
POST /sales/:id/finalize
```

en lugar de:

```text
PATCH /sales/:id
{
  "status": "COMPLETED"
}
```

El backend debe ejecutar la lógica correspondiente.

---

# 50. ESTADOS

No cambiar estados arbitrariamente desde el frontend.

Las transiciones deben ser explícitas.

Ejemplo:

```text
DRAFT
→
PENDING_PAYMENT
→
PAYMENT_IN_PROGRESS
→
PAID
→
COMPLETED
```

La implementación debe consultar el módulo 23.

---

# 51. NO INVENTAR REGLAS

Si una funcionalidad no está suficientemente especificada:

```text
NO INVENTAR
```

Primero:

1. buscar documentación;
2. revisar reglas;
3. revisar modelo;
4. revisar código existente;
5. identificar contradicción o vacío.

Si continúa existiendo una ambigüedad importante, detener la implementación de esa parte y documentar la decisión necesaria.

---

# 52. NO SOBREINGENIERÍA

No introducir:

```text
microservices
Kubernetes
Kafka
Redis
event sourcing
CQRS
GraphQL
```

solo por moda o complejidad arquitectónica.

Utilizar la solución más simple que cumpla:

```text
seguridad
consistencia
trazabilidad
performance
mantenibilidad
```

---

# 53. DEPENDENCIAS

Antes de agregar una dependencia:

1. comprobar si ya existe una solución;
2. comprobar compatibilidad;
3. evaluar mantenimiento;
4. evaluar seguridad;
5. evaluar tamaño;
6. justificar la necesidad.

No agregar librerías redundantes.

---

# 54. CÓDIGO

Priorizar:

```text
clarity
type safety
small functions
explicit business logic
testability
maintainability
```

Evitar:

```text
magic numbers
magic strings
duplicated business rules
giant controllers
giant React components
hidden side effects
```

---

# 55. TYPESCRIPT

Evitar:

```text
any
```

salvo casos justificados.

Preferir:

```text
unknown
```

y narrowing explícito cuando sea necesario.

Los tipos deben representar el dominio real.

---

# 56. COMPONENTES FRONTEND

Evitar componentes monolíticos.

Preferir:

```text
pages
features
components
hooks
services
schemas
types
```

según estructura del proyecto.

La lógica crítica no debe quedar escondida en componentes visuales.

---

# 57. BACKEND SERVICES

Los services deben representar operaciones del dominio.

Ejemplo:

```text
finalizeSale()
receivePurchase()
dispatchTransfer()
receiveTransfer()
createReservation()
completeExchange()
closeCashRegister()
issueInvoice()
```

Preferir nombres de acciones explícitas.

---

# 58. REPOSITORIES

El acceso a datos debe mantenerse separado de la lógica empresarial cuando la arquitectura lo requiera.

No repartir queries Prisma arbitrariamente por toda la aplicación.

---

# 59. PERFORMANCE

Optimizar después de medir.

Antes de introducir cache:

```text
medir
↓
identificar bottleneck
↓
optimizar
↓
medir nuevamente
```

No cachear datos críticos de stock o dinero sin una estrategia de invalidación y consistencia clara.

---

# 60. CACHE

Redis es opcional.

Si se introduce:

* documentar qué se cachea;
* TTL;
* invalidación;
* fallback;
* consistencia;
* impacto en operaciones críticas.

Nunca convertir Redis en fuente primaria de verdad para dinero o stock.

---

# 61. ASYNC / QUEUES

Los trabajos asíncronos pueden utilizarse para:

* reportes pesados;
* exports;
* notificaciones;
* tareas externas;
* procesamiento que no debe bloquear requests.

Pero una operación crítica debe mantener claramente definido cuándo se considera confirmada.

---

# 62. ARCHIVOS

Uploads deben validarse.

Comprobar:

* tipo;
* tamaño;
* extensión;
* contenido;
* nombre;
* permisos;
* almacenamiento.

No confiar solamente en MIME enviado por el cliente.

---

# 63. WEBHOOKS

Los webhooks externos deben:

```text
verify
+
authenticate
+
validate
+
idempotently process
+
audit
```

Nunca procesar ciegamente un webhook.

---

# 64. ARCA Y CREDENCIALES

Las credenciales fiscales:

```text
no deben estar en Git
no deben estar en frontend
no deben estar en logs
no deben estar hardcodeadas
```

Utilizar secrets/environment configuration.

---

# 65. ENVIRONMENTS

Separar estrictamente:

```text
development
demo
staging
production
```

Nunca asumir que:

```text
NODE_ENV
```

por sí solo garantiza aislamiento.

Las credenciales y servicios deben estar separados.

---

# 66. DEMO

La demo puede utilizar:

```text
mock/localStorage
mock API
mock ARCA
dataset controlado
```

siempre que esté claramente identificada.

La demo NO debe fingir ser producción.

---

# 67. ARCA EN DEMO

Toda factura simulada debe mostrar claramente:

```text
CAE DEMO / SIMULADO
COMPROBANTE DEMOSTRATIVO
SIN VALIDEZ FISCAL
```

No utilizar CAE real en la demo.

---

# 68. PRODUCCIÓN

Producción debe contemplar:

```text
Docker
PostgreSQL
HTTPS
reverse proxy
secrets
backup
restore
monitoring
logging
health checks
CI/CD
rollback
security
ARCA production configuration
```

según el alcance definido.

---

# 69. BACKUPS

Antes de declarar infraestructura productiva como completa:

```text
backup
↓
restore
↓
verification
```

debe haber sido probado.

---

# 70. DEPLOYMENT

Nunca asumir:

```text
"docker compose up"
=
producción lista
```

Debe existir:

* configuración;
* migraciones;
* secrets;
* health checks;
* backup;
* rollback;
* monitoreo.

---

# 71. GIT

Usar commits pequeños y descriptivos.

Preferir:

```text
feat:
fix:
refactor:
test:
docs:
chore:
security:
infra:
```

cuando el flujo del repositorio lo permita.

No realizar commits gigantes que mezclen:

```text
feature
+
refactor
+
infra
+
docs
```

sin necesidad.

---

# 72. ANTES DE COMMIT

El agente debe ejecutar, según disponibilidad:

```text
lint
typecheck
unit tests
integration tests
build
```

y E2E cuando corresponda.

No afirmar que una prueba pasó si no fue ejecutada.

---

# 73. CAMBIOS DE ALTO RIESGO

Considerar alto riesgo cualquier cambio relacionado con:

```text
stock
payments
cash
treasury
financial accounts
ARCA
authentication
authorization
database migrations
concurrency
```

Estos cambios requieren pruebas adicionales y revisión cuidadosa.

---

# 74. REGLA DE NO REGRESIÓN

Antes de cerrar un cambio:

```text
¿Qué funcionalidades existentes puede romper?
```

El agente debe identificar dependencias.

No limitarse a probar solamente el nuevo código.

---

# 75. DIAGNÓSTICO DE BUGS

Ante un bug:

```text
reproducir
↓
aislar
↓
identificar causa
↓
corregir causa
↓
crear regression test
↓
ejecutar suite
```

No aplicar parches cosméticos que oculten el problema.

---

# 76. NO SILENT FAILURE

No ocultar errores críticos.

Incorrecto:

```text
try {
  ...
} catch {
  return []
}
```

si eso transforma una falla real en datos aparentemente válidos.

Los errores deben manejarse explícitamente.

---

# 77. OBSERVABILIDAD

Cuando una operación crítica falla debe ser posible identificar:

```text
requestId
operationId
user
endpoint
timestamp
error
```

sin exponer información sensible.

---

# 78. CAMBIOS DOCUMENTALES

Si una implementación modifica una regla funcional, también debe revisarse:

```text
docs/
CHANGELOG.md
AGENTS.md
tests
```

No dejar la documentación contradiciendo el código.

---

# 79. CHANGELOG

Todo cambio significativo debe registrarse en:

```text
CHANGELOG.md
```

especialmente:

* features;
* cambios de reglas;
* correcciones críticas;
* cambios de modelo;
* cambios de arquitectura;
* seguridad;
* infraestructura;
* fiscalidad.

---

# 80. DEFINITION OF DONE DEL AGENTE

Antes de declarar una tarea terminada:

```text
[ ] Entendí el requisito.
[ ] Revisé documentación relacionada.
[ ] Revisé reglas de negocio.
[ ] Revisé estados.
[ ] Revisé modelo de datos.
[ ] Revisé seguridad.
[ ] Implementé la solución.
[ ] Validé entradas.
[ ] Validé autorización.
[ ] Consideré concurrencia.
[ ] Consideré idempotencia.
[ ] Consideré auditoría.
[ ] Agregué/actualicé tests.
[ ] Ejecuté tests.
[ ] Revisé regresiones.
[ ] Actualicé documentación si corresponde.
[ ] Actualicé CHANGELOG si corresponde.
```

---

# 81. REGLA ESPECIAL PARA STOCK

Antes de cualquier modificación de inventario responder:

```text
¿Qué movimiento genera?
¿Por qué?
¿Quién lo ejecuta?
¿En qué ubicación?
¿Qué referencia tiene?
¿Qué pasa si falla?
¿Qué pasa si se repite?
¿Qué pasa si ocurre simultáneamente?
```

Si no existe respuesta clara:

```text
NO IMPLEMENTAR
```

---

# 82. REGLA ESPECIAL PARA DINERO

Antes de cualquier modificación financiera responder:

```text
¿Qué operación lo genera?
¿Qué Payment lo origina?
¿Qué FinancialMovement genera?
¿En qué FinancialAccount impacta?
¿Es entrada, salida o transferencia?
¿Puede repetirse?
¿Quién lo autoriza?
¿Cómo se audita?
```

---

# 83. REGLA ESPECIAL PARA PERMISOS

Antes de cualquier endpoint sensible responder:

```text
¿Quién puede ejecutarlo?
¿Sobre qué empresa?
¿Sobre qué sucursal?
¿Sobre qué recurso?
¿En qué estado?
```

---

# 84. REGLA ESPECIAL PARA ESTADOS

Nunca implementar:

```text
status = "..."
```

como sustituto de una transición empresarial compleja.

Preferir acciones de dominio:

```text
approve()
dispatch()
receive()
finalize()
cancel()
refund()
close()
```

que validen la transición.

---

# 85. REGLA ESPECIAL PARA OPERACIONES HISTÓRICAS

Nunca:

```text
DELETE
```

para ocultar una operación empresarial ya ejecutada.

Preferir:

```text
compensation
cancellation
refund
return
adjustment
```

según el dominio.

---

# 86. REGLA ESPECIAL PARA FRONTEND

Nunca confiar en que:

```text
botón oculto
=
seguridad
```

Ocultar acciones mejora UX.

La seguridad real está en backend.

---

# 87. REGLA ESPECIAL PARA BASE DE DATOS

PostgreSQL es fuente persistente de verdad para el sistema.

No utilizar:

```text
localStorage
sessionStorage
frontend state
Redis
```

como fuente definitiva de:

* dinero;
* stock;
* ventas;
* usuarios;
* auditoría.

---

# 88. REGLA ESPECIAL PARA REPORTES

Si dos reportes muestran valores distintos para la misma métrica:

```text
NO ocultar la diferencia.
```

Investigar:

```text
fuente
filtros
fecha
scope
duplicación
movimientos
```

hasta determinar la causa.

---

# 89. REGLA ESPECIAL PARA DEMO

La demo debe priorizar:

```text
claridad
flujo
credibilidad
validación con cliente
```

No complejidad técnica innecesaria.

Debe demostrar el núcleo del negocio.

---

# 90. REGLA ESPECIAL PARA PRODUCCIÓN

Producción debe priorizar:

```text
seguridad
integridad
trazabilidad
recuperación
observabilidad
mantenibilidad
```

---

# 91. PRIORIDAD DE DECISIONES

Cuando exista conflicto entre:

```text
rapidez
simplicidad
funcionalidad
seguridad
integridad
```

las operaciones críticas deben priorizar:

```text
integridad
>
seguridad
>
consistencia
>
trazabilidad
>
funcionalidad
>
optimización
>
rapidez de implementación
```

---

# 92. QUÉ NO HACER

El agente NO debe:

```text
- inventar reglas de negocio;
- modificar estados arbitrariamente;
- confiar en permisos del frontend;
- editar stock directamente;
- editar balances financieros directamente;
- duplicar entidades innecesariamente;
- crear microservicios sin necesidad;
- conectar demo a ARCA real;
- guardar secretos en código;
- eliminar operaciones históricas;
- ignorar errores;
- saltarse tests críticos;
- declarar tests ejecutados cuando no lo fueron;
- modificar migraciones aplicadas;
- ocultar inconsistencias.
```

---

# 93. ORDEN DE IMPLEMENTACIÓN

Cuando se construya una funcionalidad compleja:

```text
1. Domain model
2. Database
3. Validation
4. Business service
5. Transaction
6. Authorization
7. Audit
8. API
9. Frontend
10. Tests
11. Documentation
12. Changelog
```

El orden puede adaptarse cuando el desarrollo incremental lo requiera, pero las responsabilidades deben mantenerse.

---

# 94. FLUJO DE TRABAJO DEL AGENTE

```text
READ
 ↓
UNDERSTAND
 ↓
PLAN
 ↓
IMPLEMENT
 ↓
TEST
 ↓
REVIEW
 ↓
DOCUMENT
 ↓
REPORT
```

No comenzar escribiendo código antes de entender el contexto.

---

# 95. PLAN ANTES DE CAMBIOS GRANDES

Para cambios significativos, el agente debe primero producir internamente un plan que identifique:

```text
archivos afectados
módulos afectados
entidades afectadas
reglas afectadas
estados afectados
riesgos
tests necesarios
```

Después implementar.

---

# 96. MINIMIZAR SUPERFICIE DE CAMBIO

Modificar solamente lo necesario.

Evitar refactors masivos mientras se implementa una feature no relacionada.

Si un refactor es necesario:

```text
documentar motivo
separar cambios cuando sea posible
agregar tests
```

---

# 97. CRITERIO DE CALIDAD DEL CÓDIGO

El código debe poder ser entendido por otro desarrollador sin depender del agente que lo generó.

Priorizar:

```text
explicit > clever
simple > complex
typed > any
tested > assumed
audited > invisible
```

---

# 98. DOCUMENTACIÓN COMO CONTRATO

La documentación no es decoración.

Los módulos `01–28` representan el contrato funcional y técnico del sistema.

Si el código contradice la documentación:

```text
detectar
analizar
resolver
documentar
```

No asumir automáticamente que el código tiene razón.

---

# 99. REGLA DE CONSISTENCIA GLOBAL

Antes de introducir una nueva entidad, servicio o mecanismo, verificar si ya existe un concepto equivalente.

Ejemplo:

No crear:

```text
MoneyMovement
CashTransaction
FinancialOperation
TreasuryEntry
```

para representar cuatro veces el mismo concepto si `FinancialMovement` ya cumple esa responsabilidad.

Evitar duplicación conceptual.

---

# 100. PRINCIPIO FINAL

El sistema debe permanecer fiel a esta arquitectura conceptual:

```text
              USER
               │
               ▼
          FRONTEND
               │
               ▼
             API
               │
               ▼
       BUSINESS SERVICES
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
     STOCK    MONEY    FISCAL
       │       │        │
       └───────┼────────┘
               ▼
          POSTGRESQL
               │
       ┌───────┴───────┐
       ▼               ▼
    AUDIT            REPORTS
```

---

# 101. REGLA MAESTRA

> **No implementar una funcionalidad simplemente porque puede implementarse. Implementarla solamente cuando pueda explicarse qué cambia, por qué cambia, quién puede hacerlo, en qué estado puede hacerlo, cómo se persiste, cómo se audita y cómo se prueba.**

---

# 102. INSTRUCCIÓN FINAL PARA OPENCODE

Cuando trabajes en este repositorio:

```text
LEE AGENTS.md
LEE LA DOCUMENTACIÓN RELACIONADA
RESPETA LAS REGLAS
NO INVENTES
IMPLEMENTA DE FORMA INCREMENTAL
PROTEGE STOCK Y DINERO
VALIDA EN BACKEND
AUDITA OPERACIONES CRÍTICAS
ESCRIBE TESTS
EJECUTA LOS TESTS
NO DECLARES ÉXITO SIN EVIDENCIA
ACTUALIZA DOCUMENTACIÓN CUANDO CORRESPONDA
ACTUALIZA CHANGELOG CUANDO CORRESPONDA
```

La calidad del sistema es responsabilidad del proceso completo, no solamente del código.

---

# 103. ESTADO DEL DOCUMENTO

```text
Documento:
AGENTS.md

Versión:
1.0

Propósito:
AI Agent Engineering Instructions

Aplica a:
Todo el repositorio

Módulos funcionales:
01–28

Documentos complementarios:
CHANGELOG.md

Estado:
ACTIVO
```

**Fin de `AGENTS.md`.**
