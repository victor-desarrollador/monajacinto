# 26 — SEGURIDAD

## 1. OBJETIVO

Definir los requisitos de seguridad técnicos y operativos del sistema de gestión multSucursal.

El sistema controla información y operaciones críticas:

* dinero;
* cajas;
* cuentas financieras;
* stock;
* ventas;
* compras;
* proveedores;
* clientes;
* empleados;
* sueldos;
* reservas;
* transferencias;
* facturación;
* auditoría.

Por lo tanto, la seguridad no debe considerarse una funcionalidad adicional.

Debe formar parte de la arquitectura desde el inicio.

---

# 2. PRINCIPIO FUNDAMENTAL

El sistema debe asumir que:

```text
El usuario puede equivocarse.
El usuario puede intentar realizar una operación no autorizada.
El cliente puede enviar datos manipulados.
El frontend puede ser manipulado.
Una request puede repetirse.
Una integración externa puede fallar.
```

Por lo tanto:

> **La seguridad y las reglas de negocio deben validarse en el backend.**

Nunca confiar únicamente en el frontend.

---

# 3. MODELO DE SEGURIDAD

La seguridad se divide en:

```text
Autenticación
     ↓
Identificación
     ↓
Autorización
     ↓
Alcance
     ↓
Validación
     ↓
Ejecución
     ↓
Auditoría
```

Ejemplo:

```text
Usuario inicia sesión
        ↓
Sistema identifica usuario
        ↓
Sistema obtiene roles/permisos
        ↓
Sistema determina sucursal autorizada
        ↓
Backend valida operación
        ↓
Ejecuta operación
        ↓
Registra auditoría
```

---

# 4. AUTENTICACIÓN

Todo usuario que acceda al sistema debe estar autenticado.

La autenticación debe controlar:

* identidad;
* credenciales;
* sesión;
* expiración;
* revocación;
* estado del usuario.

Estados posibles:

```text
ACTIVE
INACTIVE
BLOCKED
PENDING
```

Un usuario `INACTIVE` o `BLOCKED` no puede iniciar nuevas sesiones.

---

# 5. CONTRASEÑAS

Las contraseñas nunca deben almacenarse directamente.

Incorrecto:

```text
password = "123456"
```

Correcto:

```text
passwordHash = <hash seguro>
```

Debe utilizarse un algoritmo moderno de hashing de contraseñas.

Nunca almacenar:

```text
password
passwordPlain
passwordEncrypted
```

como mecanismo principal de almacenamiento.

---

# 6. POLÍTICA DE CONTRASEÑAS

La política exacta debe definirse durante implementación, pero debe contemplar como mínimo:

* longitud suficiente;
* rechazo de contraseñas extremadamente débiles;
* protección contra credenciales comprometidas cuando corresponda;
* almacenamiento mediante hash;
* recuperación segura.

No establecer requisitos arbitrarios que incentiven contraseñas predecibles.

---

# 7. SESIONES

Una sesión autenticada debe tener:

```text
sessionId
userId
createdAt
expiresAt
lastActivityAt
revokedAt
```

Opcionalmente:

```text
ip
userAgent
device
```

si resulta necesario para seguridad y auditoría.

---

# 8. REVOCACIÓN

Debe ser posible invalidar sesiones.

Casos:

```text
usuario bloqueado
cambio de credenciales
logout global
sospecha de compromiso
administrador revoca sesión
```

Una sesión revocada no debe volver a utilizarse.

---

# 9. AUTENTICACIÓN DE API

El frontend nunca debe poder ejecutar operaciones administrativas simplemente porque conoce un endpoint.

Ejemplo:

```text
POST /api/cash/registers/:id/close
```

requiere:

```text
authenticated user
+
permission
+
branch scope
+
business validation
```

---

# 10. RBAC

El sistema utilizará control de acceso basado en roles.

Conceptualmente:

```text
User
  ↓
Role
  ↓
Permissions
```

Ejemplo:

```text
CAJERO
 ├── sales.read
 ├── payments.create
 ├── cash.open
 ├── cash.close
 └── cash.count
```

Mientras:

```text
VENDEDOR
 ├── products.read
 ├── sales.create
 └── reservations.create
```

---

# 11. PERMISOS GRANULARES

No utilizar únicamente:

```text
isAdmin = true
```

El sistema debe utilizar permisos explícitos.

Ejemplo:

```text
sales.create
sales.read
sales.cancel
sales.discount
cash.open
cash.close
cash.adjust
inventory.read
inventory.adjust
inventory.transfer
purchases.create
purchases.receive
treasury.read
treasury.transfer
employees.read
employees.pay
```

La lista definitiva se define en el módulo de roles y permisos.

---

# 12. PRINCIPIO DE MÍNIMO PRIVILEGIO

Cada usuario debe disponer solamente de los permisos necesarios.

Ejemplo:

```text
Vendedor
```

no necesita:

```text
treasury.transfer
cash.close
employee.pay
inventory.adjust
```

aunque técnicamente pueda acceder al sistema.

---

# 13. SEPARACIÓN DE FUNCIONES

Las operaciones sensibles deben separar responsabilidades.

Ejemplo:

```text
Vendedor
   ↓
crea venta

Cajero
   ↓
cobra y finaliza

Administrador
   ↓
autoriza determinadas excepciones
```

Esto reduce el riesgo de fraude y errores.

---

# 14. POS ≠ CAJA

La seguridad debe respetar esta separación.

El vendedor puede:

```text
crear venta
```

pero no necesariamente:

```text
cobrar
cerrar caja
hacer arqueo
retirar dinero
```

El cajero puede:

```text
finalizar venta
```

pero no necesariamente:

```text
modificar stock arbitrariamente
```

---

# 15. ALCANCE POR EMPRESA

Todas las operaciones deben estar asociadas al contexto:

```text
companyId
```

El backend debe verificar que el usuario tenga acceso a la empresa correspondiente.

Nunca confiar en un `companyId` enviado desde el frontend.

---

# 16. ALCANCE POR SUCURSAL

Cuando corresponda:

```text
company
   ↓
branch
   ↓
user
```

El backend debe verificar:

```text
¿Este usuario puede operar en esta sucursal?
```

antes de ejecutar la operación.

---

# 17. EJEMPLO DE ATAQUE

Un usuario autorizado para:

```text
Branch A
```

intenta:

```text
GET /api/sales/BRANCH-B-SALE-ID
```

El sistema no debe responder simplemente porque el ID existe.

Debe validar:

```text
user scope
+
sale branch
+
permission
```

Resultado:

```text
FORBIDDEN
```

o una respuesta equivalente apropiada.

---

# 18. IDOR

Debe evitarse el acceso directo a recursos mediante IDs manipulados.

Ejemplo peligroso:

```text
GET /api/employees/123
```

No significa que el usuario pueda consultar cualquier empleado `123`.

Debe comprobarse:

```text
resource ownership/scope
+
permission
```

---

# 19. VALIDACIÓN DE INPUT

Todo dato recibido desde:

```text
frontend
API
importación
integración
webhook
```

debe considerarse no confiable.

Validar:

* tipo;
* formato;
* longitud;
* rango;
* enum;
* relaciones;
* permisos;
* estado.

---

# 20. VALIDACIÓN DE NEGOCIO

La validación sintáctica no es suficiente.

Ejemplo:

```text
quantity = 1
```

puede ser técnicamente válido.

Pero:

```text
stockAvailable = 0
```

hace que la operación sea inválida.

Por eso deben existir:

```text
schema validation
+
business validation
```

---

# 21. SQL INJECTION

No construir consultas SQL mediante concatenación insegura.

Preferir:

```text
Prisma
parameterized queries
```

No utilizar:

```text
"SELECT * FROM users WHERE id = " + userInput
```

---

# 22. XSS

Los datos introducidos por usuarios no deben interpretarse automáticamente como HTML/JavaScript.

Especial atención a:

* nombres;
* observaciones;
* notas;
* clientes;
* proveedores;
* productos;
* comentarios.

El frontend debe escapar/renderizar datos de manera segura.

---

# 23. CSRF

La estrategia depende del mecanismo de autenticación.

Si se utilizan cookies autenticadas, debe contemplarse protección CSRF apropiada.

Si se utiliza otro mecanismo, deben evaluarse sus riesgos equivalentes.

No asumir que CORS reemplaza CSRF protection.

---

# 24. CORS

La API debe permitir solamente orígenes autorizados.

Desarrollo:

```text
localhost
```

Producción:

```text
dominio oficial del frontend
```

No habilitar indiscriminadamente:

```text
*
```

en producción.

---

# 25. HTTPS

Toda comunicación de producción debe utilizar HTTPS.

Especialmente:

```text
login
ventas
pagos
clientes
empleados
cuentas
facturación
```

Nunca transmitir credenciales mediante HTTP plano.

---

# 26. SECURITY HEADERS

El backend debe aplicar headers de seguridad apropiados.

Por ejemplo:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
```

y otros según la arquitectura final.

No agregar headers solamente por cumplir una checklist: deben configurarse correctamente para la aplicación.

---

# 27. RATE LIMITING

Debe existir protección contra abuso.

Especialmente:

```text
login
password recovery
API pública
webhooks
endpoints sensibles
```

Ejemplo conceptual:

```text
muchos intentos fallidos
       ↓
rate limit
       ↓
bloqueo temporal / challenge
```

Los límites exactos se definirán durante hardening.

---

# 28. LOGIN

Debe registrarse información suficiente para detectar abusos.

Ejemplos:

```text
login success
login failure
logout
account blocked
password changed
session revoked
```

No registrar contraseñas.

---

# 29. SECRETOS

Nunca almacenar secretos dentro del repositorio.

No subir:

```text
.env
private keys
ARCA credentials
API keys
database passwords
JWT secrets
```

El repositorio debe contener:

```text
.env.example
```

sin valores sensibles.

---

# 30. CREDENCIALES ARCA

Las credenciales/certificados fiscales deben tratarse como secretos de infraestructura.

Separar:

```text
DEMO
HOMOLOGACIÓN
PRODUCCIÓN
```

Nunca utilizar credenciales productivas en la demo.

---

# 31. CERTIFICADOS

Los certificados y claves privadas deben:

* estar protegidos;
* tener permisos restrictivos;
* no exponerse al frontend;
* no almacenarse en el repositorio;
* utilizarse solamente desde backend/infrastructure.

---

# 32. TOKENS

Tokens de terceros deben:

```text
ser secretos
tener alcance limitado cuando sea posible
rotarse
revocarse
```

Nunca enviarlos al navegador si no es necesario.

---

# 33. DATOS SENSIBLES

La aplicación debe minimizar la exposición de:

* datos bancarios;
* credenciales;
* información fiscal;
* información salarial;
* información personal.

Mostrar únicamente lo necesario.

Ejemplo:

```text
Banco Galicia
Alias: vm*******
```

en lugar de exponer innecesariamente todos los datos.

---

# 34. EMPLEADOS

Los datos de empleados requieren controles adicionales.

Por ejemplo:

```text
salario
adelantos
deudas
compras
pagos
```

no deben estar disponibles para cualquier usuario.

---

# 35. INFORMACIÓN FINANCIERA

Las cuentas financieras deben tener permisos diferenciados.

Ejemplo:

```text
Vendedor
→ no necesita consultar tesorería global.

Cajero
→ necesita consultar movimientos de su caja.

Tesorero
→ necesita consultar y operar cuentas financieras.

Administrador
→ acceso según política.
```

---

# 36. STOCK

No otorgar permiso general:

```text
inventory.adjust
```

a todos los usuarios.

Un ajuste de stock debe:

```text
requerir permiso
tener motivo
registrar usuario
registrar fecha
registrar cantidad
registrar referencia
crear StockMovement
```

---

# 37. DINERO

Nunca permitir:

```text
UPDATE financialAccount
SET balance = ...
```

como operación normal.

El dinero debe modificarse mediante:

```text
FinancialMovement
```

o el mecanismo transaccional correspondiente.

---

# 38. CAJA

No permitir modificar:

```text
expectedCash
countedCash
difference
```

sin dejar evidencia.

El arqueo debe registrar:

```text
quién
cuándo
sesión
efectivo contado
esperado
diferencia
```

---

# 39. OPERACIONES HISTÓRICAS

No permitir eliminar directamente:

```text
ventas
pagos
movimientos de stock
movimientos financieros
arqueos
facturas
transferencias
```

Una operación incorrecta debe corregirse mediante:

```text
operación compensatoria
```

cuando corresponda.

---

# 40. AUDITORÍA

Las operaciones críticas deben generar `AuditLog`.

Como mínimo:

```text
usuario
acción
entidad
entityId
fecha/hora
company
branch
operationId
```

Cuando corresponda:

```text
before
after
reason
requestId
```

---

# 41. AUDITORÍA DE SEGURIDAD

Registrar eventos como:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
PASSWORD_CHANGED
SESSION_REVOKED
USER_CREATED
USER_DISABLED
ROLE_CHANGED
PERMISSION_CHANGED
```

---

# 42. AUDITORÍA DE NEGOCIO

También:

```text
SALE_CREATED
SALE_FINALIZED
SALE_CANCELLED
PAYMENT_CREATED
CASH_OPENED
CASH_CLOSED
STOCK_ADJUSTED
TRANSFER_DISPATCHED
TRANSFER_RECEIVED
RESERVATION_CREATED
RESERVATION_CANCELLED
LOAN_CREATED
EXCHANGE_CREATED
INVOICE_AUTHORIZED
```

La lista definitiva seguirá el módulo de auditoría.

---

# 43. LOGS ≠ AUDITLOG

Son conceptos distintos.

### Application Log

Sirve para:

```text
errores técnicos
performance
debugging
requests
infraestructura
```

### AuditLog

Sirve para:

```text
responsabilidad
trazabilidad
operaciones de negocio
seguridad
```

No utilizar uno como sustituto del otro.

---

# 44. PII

Los datos personales deben tratarse con minimización.

No mostrar información personal innecesariamente en:

```text
logs
errores
pantallas
exports
```

---

# 45. EXPORTACIONES

Los reportes exportados pueden contener información sensible.

Por lo tanto:

```text
exportación
 ↓
permission
 ↓
generación
 ↓
audit
```

Debe registrarse:

```text
quién exportó
qué reporte
qué filtros
cuándo
```

según el nivel de auditoría definido.

---

# 46. ARCHIVOS

Los documentos adjuntos deben controlarse.

Ejemplos:

```text
facturas
remitos
comprobantes
documentos
```

Validar:

* tipo;
* tamaño;
* nombre;
* almacenamiento;
* permisos de acceso.

Nunca confiar únicamente en la extensión del archivo.

---

# 47. WEBHOOKS

Los webhooks externos deben validarse.

Cuando el proveedor lo permita:

```text
firma
secret
timestamp
idempotency
```

No procesar cualquier request simplemente porque conoce el endpoint.

---

# 48. IDEMPOTENCIA Y SEGURIDAD

Una request repetida puede provocar:

```text
doble pago
doble venta
doble movimiento
doble factura
```

Por eso las operaciones críticas deben tener mecanismos de idempotencia.

Ejemplo:

```text
Idempotency-Key
```

---

# 49. CONCURRENCIA

La seguridad también incluye consistencia.

Ejemplo:

```text
Stock = 1
```

Dos POS realizan simultáneamente:

```text
venta = 1
```

El sistema debe garantizar que no se produzca:

```text
stock = -1
```

---

# 50. CONTROL DE ESTADOS

No aceptar cambios de estado arbitrarios enviados desde frontend.

Incorrecto:

```text
PATCH sale
{
  "status": "PAID"
}
```

Correcto:

```text
POST /sales/:id/finalize
```

El backend determina si la transición es válida.

---

# 51. PERMISOS PARA EXCEPCIONES

Las excepciones deben requerir permisos especiales.

Ejemplos:

```text
descuento extraordinario
ajuste de stock
anulación de venta
devolución fuera de política
retiro extraordinario de caja
modificación financiera
```

---

# 52. DOBLE AUTORIZACIÓN

Para determinadas operaciones críticas puede implementarse:

```text
usuario ejecuta
      ↓
requiere aprobación
      ↓
usuario autorizado aprueba
      ↓
operación ejecutada
```

Esto puede utilizarse posteriormente para:

* movimientos financieros importantes;
* ajustes;
* descuentos especiales;
* anulaciones;
* operaciones administrativas.

Los umbrales deben ser definidos por el negocio.

---

# 53. PROTECCIÓN CONTRA FRAUDE

El sistema debe conservar señales suficientes para detectar comportamientos anómalos.

Ejemplos:

```text
muchas anulaciones
muchos descuentos
muchos ajustes
muchos retiros
muchas devoluciones
```

La primera versión solamente necesita registrar los datos.

Detección automática puede incorporarse posteriormente.

---

# 54. AUDITORÍA DE CAMBIOS DE PERMISOS

Un cambio de permisos es crítico.

Registrar:

```text
actor
usuario afectado
rol anterior
rol nuevo
permisos anteriores
permisos nuevos
fecha
motivo
```

No modificar silenciosamente permisos.

---

# 55. PROTECCIÓN DE ADMINISTRADORES

Las cuentas administrativas deben tener controles reforzados.

Evitar compartir:

```text
admin/admin
```

o cuentas genéricas.

Cada persona debe tener su propia identidad.

---

# 56. CUENTAS COMPARTIDAS

No utilizar:

```text
cajero
vendedor
admin
```

como usuarios compartidos en producción.

La trazabilidad requiere saber:

```text
PERSONA REAL
```

que ejecutó la operación.

---

# 57. BACKUPS

Los backups deben protegerse igual que la base de datos.

Contemplar:

```text
acceso restringido
cifrado cuando corresponda
control de acceso
restauración
```

No almacenar backups sensibles en ubicaciones públicas.

---

# 58. RESTORE TEST

Un backup no se considera suficiente hasta comprobar que puede restaurarse.

Proceso:

```text
Backup
 ↓
Restore
 ↓
Validation
 ↓
Successful
```

La frecuencia exacta se definirá en infraestructura.

---

# 59. DEPENDENCIAS

Mantener dependencias actualizadas.

Utilizar:

```text
npm audit
dependabot / equivalente
lockfile
```

cuando corresponda.

No instalar paquetes innecesarios.

---

# 60. SUPPLY CHAIN

Antes de incorporar una dependencia:

```text
¿Es necesaria?
¿Está mantenida?
¿Tiene historial razonable?
¿Tiene vulnerabilidades conocidas?
¿Necesita permisos excesivos?
```

Evitar dependencias desconocidas para funciones críticas.

---

# 61. FRONTEND

Nunca asumir que ocultar un botón constituye seguridad.

Esto:

```text
if (!canCloseCash) {
   hideButton()
}
```

sirve para UX.

Pero debe existir además:

```text
backend authorization
```

---

# 62. BACKEND

Toda operación sensible debe verificar:

```text
authenticated
authorized
scoped
valid
```

antes de ejecutarse.

---

# 63. DATABASE

La aplicación debe utilizar un usuario de base de datos con los permisos necesarios.

No utilizar innecesariamente una cuenta con privilegios administrativos completos.

---

# 64. PRODUCCIÓN VS DEMO

### DEMO

Puede utilizar:

```text
mock users
fake credentials
simulated fiscal data
localStorage
mock API
```

Pero debe quedar claramente identificado.

### PRODUCCIÓN

Debe utilizar:

```text
real authentication
real database
secure secrets
HTTPS
audit
backup
RBAC
real integrations
```

---

# 65. DATOS DE DEMO

Nunca cargar datos reales del cliente en:

```text
repositorio
capturas públicas
demo pública
logs
fixtures públicos
```

La demo debe utilizar datos ficticios.

---

# 66. CHECKLIST DE SEGURIDAD PRE-PRODUCCIÓN

```text
[ ] HTTPS
[ ] Authentication
[ ] Password hashing
[ ] Session management
[ ] RBAC
[ ] Branch scoping
[ ] Company scoping
[ ] Input validation
[ ] Business validation
[ ] CORS
[ ] CSRF strategy
[ ] Security headers
[ ] Rate limiting
[ ] Secret management
[ ] ARCA credentials protected
[ ] AuditLog
[ ] Application logging
[ ] Idempotency
[ ] Concurrency controls
[ ] Database permissions
[ ] Backup
[ ] Restore test
[ ] Dependency audit
[ ] Error handling
[ ] Export permissions
[ ] File upload security
[ ] Webhook verification
```

---

# 67. CHECKLIST DE AUTORIZACIÓN

Para cada endpoint crítico:

```text
[ ] ¿Requiere autenticación?
[ ] ¿Qué permiso requiere?
[ ] ¿Qué rol puede ejecutarlo?
[ ] ¿Qué sucursales puede afectar?
[ ] ¿Puede afectar otra empresa?
[ ] ¿Requiere aprobación?
[ ] ¿Genera auditoría?
[ ] ¿Es idempotente?
[ ] ¿Es transaccional?
```

---

# 68. MODELO DE AMENAZAS MÍNIMO

Se deben contemplar al menos:

```text
Credenciales robadas
Usuario interno malicioso
Usuario con permisos excesivos
IDOR
SQL Injection
XSS
CSRF
Brute Force
Replay
Double Submit
Data Leakage
Secret Leakage
Malicious File Upload
Webhook Spoofing
Concurrent Operations
```

---

# 69. PRINCIPIO ZERO TRUST

No asumir:

```text
"Está dentro de la red, entonces es confiable."
```

Cada request debe validarse según:

```text
identidad
permisos
contexto
recurso
operación
```

---

# 70. REGLA DE SEGURIDAD PARA EL SISTEMA

Para toda operación importante:

```text
¿QUIÉN?
   ↓
¿QUÉ PERMISO TIENE?
   ↓
¿SOBRE QUÉ EMPRESA?
   ↓
¿SOBRE QUÉ SUCURSAL?
   ↓
¿QUÉ QUIERE HACER?
   ↓
¿EL ESTADO LO PERMITE?
   ↓
¿LA OPERACIÓN ES VÁLIDA?
   ↓
¿DEBE APROBARSE?
   ↓
¿QUÉ MOVIMIENTOS GENERA?
   ↓
¿QUÉ AUDITORÍA DEJA?
```

---

# 71. REGLA DE ORO

Ningún usuario debe poder producir un cambio crítico simplemente manipulando:

```text
frontend
request
JSON
URL
ID
status
price
quantity
branchId
companyId
```

El backend debe reconstruir y validar el contexto real.

---

# 72. DEFINITION OF DONE — SEGURIDAD

El módulo de seguridad se considera implementado cuando:

* [ ] autenticación funcional;
* [ ] contraseñas protegidas;
* [ ] sesiones controladas;
* [ ] RBAC implementado;
* [ ] permisos granulares;
* [ ] alcance por empresa;
* [ ] alcance por sucursal;
* [ ] validación backend;
* [ ] protección de endpoints;
* [ ] auditoría;
* [ ] protección de secretos;
* [ ] HTTPS en producción;
* [ ] rate limiting;
* [ ] estrategia CSRF;
* [ ] seguridad de archivos;
* [ ] protección de webhooks;
* [ ] idempotencia;
* [ ] controles de concurrencia;
* [ ] backups;
* [ ] restore probado.

---

# 73. PRINCIPIO FINAL

> **La seguridad no consiste en esconder botones. Consiste en impedir operaciones no autorizadas incluso cuando el cliente intenta manipular directamente la API.**

El sistema debe asumir que el frontend puede ser alterado, las requests pueden repetirse y los usuarios pueden intentar ejecutar operaciones fuera de su alcance.

Por eso:

```text
Frontend
   ↓
UX

Backend
   ↓
Security + Business Rules

Database
   ↓
Integrity

Audit
   ↓
Evidence
```

La arquitectura debe garantizar que una operación crítica solamente pueda ocurrir cuando:

```text
IDENTIDAD
+
PERMISO
+
ALCANCE
+
REGLA DE NEGOCIO
+
ESTADO VÁLIDO
+
INTEGRIDAD
```

sean correctos.
