# 26 — SEGURIDAD

## VM Digital Studio — Sistema de Gestión Multisucursal

**Versión:** 1.0
**Estado:** Especificación funcional y técnica
**Clasificación:** CRÍTICO
**Aplica a:** Frontend, Backend, Base de Datos, Infraestructura, Integraciones y Operaciones

---

# 1. OBJETIVO

El objetivo de este módulo es definir el modelo de seguridad integral del sistema de gestión multisucursal.

El sistema administra información y operaciones críticas:

* usuarios;
* empleados;
* sucursales;
* productos;
* stock;
* depósitos;
* compras;
* proveedores;
* ventas;
* cajas;
* arqueos;
* cuentas financieras;
* tesorería;
* reservas;
* señas;
* préstamos de prendas;
* cambios y devoluciones;
* sueldos;
* ventas a empleados;
* facturación;
* información de clientes;
* movimientos de dinero;
* auditoría.

Por lo tanto, la seguridad no debe limitarse a proteger el login.

Debe proteger:

> **identidad + permisos + alcance + reglas de negocio + estados + datos + operaciones + trazabilidad.**

---

# 2. PRINCIPIOS FUNDAMENTALES

El sistema deberá implementar los siguientes principios.

## 2.1 Denegar por defecto

Si un usuario no posee explícitamente un permiso, la operación debe ser rechazada.

Nunca:

```text
si no está prohibido → permitir
```

Debe funcionar como:

```text
si no está permitido → rechazar
```

---

## 2.2 Mínimo privilegio

Cada usuario tendrá solamente los permisos necesarios para realizar su trabajo.

Ejemplo:

Un vendedor puede:

* consultar productos;
* consultar stock permitido;
* crear ventas;
* enviar ventas a caja;
* crear reservas.

Pero no puede:

* cerrar caja;
* modificar dinero;
* eliminar ventas;
* modificar stock arbitrariamente;
* modificar precios globales;
* aprobar devoluciones especiales;
* acceder a tesorería central.

---

## 2.3 Separación de funciones

Las operaciones críticas deberán evitar concentrar demasiadas responsabilidades en una misma persona.

Ejemplo:

```text
VENDEDOR
   ↓
crea venta
   ↓
PENDIENTE_DE_COBRO
   ↓
CAJERO
   ↓
cobra
   ↓
finaliza operación
```

El vendedor no debe convertirse automáticamente en cajero.

---

## 2.4 Backend como autoridad

El frontend nunca será considerado una frontera de seguridad.

El frontend puede ocultar botones, pero eso solamente mejora UX.

La seguridad real debe estar en:

```text
API
 ↓
Autenticación
 ↓
Autorización
 ↓
Scope
 ↓
Reglas de negocio
 ↓
Base de datos
```

Nunca confiar únicamente en:

```text
disabled={true}
```

o:

```text
if (role === "ADMIN")
```

en React.

---

# 3. MODELO DE AMENAZAS

El sistema deberá contemplar como mínimo:

### Amenazas internas

* vendedor intentando modificar una venta;
* cajero intentando alterar una operación histórica;
* empleado accediendo a información salarial ajena;
* usuario accediendo a otra sucursal;
* modificación manual de stock;
* modificación de precios sin autorización;
* devolución fraudulenta;
* descuentos no autorizados;
* manipulación de caja;
* creación de movimientos financieros falsos.

### Amenazas externas

* robo de credenciales;
* acceso no autorizado a API;
* ataques de fuerza bruta;
* IDOR;
* inyección SQL;
* XSS;
* CSRF cuando corresponda;
* abuso de endpoints;
* robo de tokens;
* exposición de secretos;
* manipulación de webhooks;
* explotación de dependencias vulnerables.

---

# 4. AUTENTICACIÓN

## 4.1 Identidad

Cada usuario debe poseer una identidad única.

No se deben utilizar cuentas compartidas para operaciones normales.

Ejemplo incorrecto:

```text
cajero
contraseña123
```

Ejemplo correcto:

```text
usuario: maria.gomez
rol: CAJERO
sucursal: Centro
```

Esto permite saber quién realizó cada operación.

---

# 5. CONTRASEÑAS

Las contraseñas nunca deben almacenarse en texto plano.

Debe utilizarse un algoritmo moderno de hashing resistente a ataques offline.

Preferencia:

```text
Argon2id
```

Alternativa aceptable si la infraestructura o librería lo requiere:

```text
bcrypt
```

Nunca:

```text
MD5
SHA1
SHA256(password)
```

sin un esquema de password hashing apropiado.

---

# 6. POLÍTICA DE CONTRASEÑAS

La política deberá establecer como mínimo:

* longitud mínima configurable;
* rechazo de contraseñas extremadamente débiles;
* protección contra credenciales comprometidas cuando sea viable;
* posibilidad de cambio de contraseña;
* recuperación segura;
* invalidación de sesiones después de cambios críticos;
* nunca mostrar contraseñas existentes.

No implementar reglas absurdamente complejas que incentiven contraseñas inseguras.

La longitud tendrá prioridad sobre requisitos arbitrarios de símbolos.

---

# 7. SESIONES

El sistema deberá administrar sesiones de usuario.

Una sesión debe estar asociada a:

```text
userId
sessionId
createdAt
expiresAt
lastActivityAt
ip / metadata cuando corresponda
userAgent cuando sea necesario
revokedAt
```

Las sesiones deberán poder ser revocadas.

Ejemplo:

```text
ADMIN
 ↓
"cerrar todas las sesiones de usuario"
```

---

# 8. TOKENS

Si se utilizan JWT:

* expiración corta para access tokens;
* refresh token separado;
* rotación de refresh tokens;
* revocación;
* protección contra reutilización;
* no almacenar secretos dentro del payload;
* no confiar en claims sin validación.

El JWT no reemplaza la autorización.

Ejemplo:

```text
JWT dice:
role = VENDEDOR
```

Eso no significa que el backend pueda permitir cualquier operación de vendedor.

Debe verificarse:

```text
usuario
+
rol
+
permiso
+
empresa
+
sucursal
+
recurso
+
estado
```

---

# 9. AUTORIZACIÓN

Se utilizará RBAC como base:

```text
Role-Based Access Control
```

pero combinado con permisos específicos y alcance organizacional.

Modelo:

```text
User
 ↓
Role
 ↓
Permissions
 ↓
Scope
```

---

# 10. ROLES

Los roles principales estarán definidos en:

`02_ROLES_Y_PERMISOS.md`

Como mínimo deberán contemplarse:

```text
SUPER_ADMIN
ADMIN
GERENTE
ENCARGADO_SUCURSAL
VENDEDOR
CAJERO
DEPOSITO
TESORERIA
CONTABILIDAD
RRHH
AUDITOR
```

Los nombres finales deberán mantenerse consistentes con el módulo 02.

---

# 11. PERMISOS GRANULARES

No utilizar únicamente:

```text
role === ADMIN
```

Los permisos deberán representar acciones.

Ejemplos:

```text
sales.create
sales.read
sales.cancel

payments.create
payments.refund

cash.open
cash.close
cash.adjust

stock.read
stock.adjust

transfers.create
transfers.approve
transfers.dispatch
transfers.receive

purchases.create
purchases.receive

employees.read
employees.salary.read

treasury.read
treasury.transfer
treasury.adjust

reports.read
reports.export

audit.read
```

---

# 12. SCOPE MULTISUCURSAL

Este es uno de los puntos más importantes del sistema.

Un usuario puede tener acceso:

```text
GLOBAL
```

o:

```text
BRANCH
```

o:

```text
WAREHOUSE
```

según su función.

Ejemplo:

```text
Vendedor sucursal Centro
```

debe poder consultar:

```text
Sucursal Centro
```

pero no:

```text
Sucursal Yerba Buena
Sucursal Tafí Viejo
Sucursal San Miguel
```

salvo que posea explícitamente ese alcance.

---

# 13. PREVENCIÓN DE IDOR

El sistema debe prevenir ataques de tipo:

```text
Insecure Direct Object Reference
```

Ejemplo peligroso:

```http
GET /api/sales/8472
```

No alcanza con verificar:

```text
user autenticado = true
```

El backend debe verificar que:

```text
sale.companyId === user.companyId
```

y además:

```text
sale.branchId pertenece al scope del usuario
```

cuando corresponda.

Nunca confiar en IDs enviados por el cliente.

---

# 14. AISLAMIENTO POR EMPRESA

Toda entidad operativa deberá pertenecer a una empresa.

Ejemplo:

```text
companyId
```

El backend deberá filtrar siempre los datos por empresa.

Nunca permitir:

```text
SELECT * FROM sales WHERE id = :id
```

sin comprobar ownership/scope.

Debe existir conceptualmente:

```text
companyId
+
resourceId
```

como criterio de acceso.

---

# 15. AUTORIZACIÓN A NIVEL DE RECURSO

No basta con permisos generales.

Ejemplo:

```text
sales.read
```

no significa necesariamente:

```text
leer cualquier venta del sistema
```

Debe combinarse con:

```text
company scope
branch scope
ownership
resource state
permission
```

---

# 16. OPERACIONES CRÍTICAS

Las siguientes operaciones deberán recibir controles adicionales:

* cierre de caja;
* ajustes de stock;
* devoluciones;
* cambios especiales;
* descuentos altos;
* modificaciones de precios;
* transferencias;
* aprobación de compras;
* pagos a proveedores;
* movimientos de tesorería;
* retiros de dinero;
* depósitos;
* ajustes financieros;
* modificaciones salariales;
* ventas a empleados;
* facturación;
* anulaciones;
* acciones administrativas.

Cuando corresponda deberá existir:

```text
requiere aprobación
```

o:

```text
requiere permiso elevado
```

---

# 17. SEPARACIÓN POS / CAJA

La arquitectura de seguridad debe mantener:

```text
POS
≠
CAJA
```

Un vendedor puede crear:

```text
Sale
```

pero no necesariamente:

```text
Payment
```

o:

```text
CashMovement
```

El backend deberá aplicar esta separación.

---

# 18. PROTECCIÓN DEL STOCK

El usuario no debe poder ejecutar:

```text
UPDATE inventory SET quantity = 100
```

como operación normal.

El stock debe cambiar mediante movimientos.

Ejemplo:

```text
TRANSFER_OUT
SALE
PURCHASE_RECEIPT
RETURN
ADJUSTMENT_IN
ADJUSTMENT_OUT
```

Los ajustes deben requerir:

```text
permiso
motivo
usuario
fecha
referencia
auditoría
```

---

# 19. PROTECCIÓN DEL DINERO

Los saldos financieros no deben ser editables directamente.

No:

```text
account.balance = 500000
```

como operación de negocio.

Debe existir:

```text
FinancialMovement
```

que explique el cambio.

Ejemplo:

```text
CASH_DEPOSIT
TRANSFER
SALE
SUPPLIER_PAYMENT
REFUND
EXPENSE
```

---

# 20. OPERACIONES HISTÓRICAS

Una operación finalizada no debe volver simplemente a:

```text
DRAFT
```

para modificarla.

Ejemplo:

```text
SALE = COMPLETED
```

No permitir:

```text
UPDATE sale
SET total = ...
```

La corrección deberá realizarse mediante:

```text
devolución
cambio
nota de crédito
movimiento compensatorio
ajuste autorizado
```

según corresponda.

---

# 21. VALIDACIÓN DE ENTRADAS

Todo dato proveniente del cliente debe considerarse no confiable.

Validar:

* tipos;
* formatos;
* longitud;
* rangos;
* IDs;
* cantidades;
* precios;
* fechas;
* estados;
* relaciones;
* permisos;
* reglas de negocio.

Utilizar validación runtime.

Ejemplo recomendado:

```text
Zod
```

o una solución equivalente.

TypeScript por sí solo no valida requests HTTP.

---

# 22. PROTECCIÓN CONTRA INYECCIÓN

Las consultas a PostgreSQL deben utilizar:

* Prisma;
* queries parametrizadas;
* validación;
* parámetros seguros.

Nunca concatenar directamente SQL con input del usuario.

Evitar:

```ts
`SELECT * FROM users WHERE name = '${input}'`
```

---

# 23. XSS

Todo contenido proveniente de usuarios debe tratarse como potencialmente peligroso.

Especial atención a:

* nombres;
* observaciones;
* comentarios;
* clientes;
* proveedores;
* productos;
* notas;
* archivos;
* campos HTML.

React ya escapa contenido por defecto, pero no utilizar:

```tsx
dangerouslySetInnerHTML
```

sin sanitización explícita y justificada.

---

# 24. CSRF

La estrategia dependerá del mecanismo de autenticación.

Si se utilizan cookies autenticadas:

* SameSite correctamente configurado;
* Secure;
* HttpOnly;
* protección CSRF cuando corresponda.

Si se utiliza autenticación basada en headers:

```http
Authorization: Bearer ...
```

deberá analizarse el riesgo de XSS/token theft y aplicarse una arquitectura apropiada.

No mezclar mecanismos sin una razón clara.

---

# 25. CORS

El backend no debe aceptar:

```text
Access-Control-Allow-Origin: *
```

en producción si la API utiliza credenciales o si no es estrictamente necesario.

Configurar explícitamente:

```text
WEB_ORIGIN
```

por ambiente.

Ejemplo:

```text
DEVELOPMENT
http://localhost:5173

PRODUCTION
https://dominio-produccion.com
```

---

# 26. HTTPS

Producción deberá utilizar HTTPS.

Nunca transmitir:

* credenciales;
* tokens;
* datos financieros;
* datos personales;
* credenciales ARCA;

por HTTP sin protección.

---

# 27. HEADERS DE SEGURIDAD

El backend deberá utilizar headers de seguridad apropiados.

Se recomienda utilizar una solución como:

```text
Helmet
```

y configurar según la arquitectura real.

Contemplar:

* Content-Security-Policy;
* X-Content-Type-Options;
* Referrer-Policy;
* Frame protections;
* políticas relacionadas con recursos.

No copiar una CSP genérica sin probar el frontend.

---

# 28. RATE LIMITING

Los endpoints sensibles deberán tener límites de frecuencia.

Especialmente:

```text
/login
/password-reset
/refresh
/webhooks
```

y endpoints administrativos sensibles.

Ejemplo:

```text
múltiples intentos fallidos
↓
rate limit
↓
registro de evento
```

No utilizar rate limiting únicamente como mecanismo de seguridad; debe complementar autenticación y detección de abuso.

---

# 29. BLOQUEO Y ABUSO DE CUENTAS

Contemplar:

* múltiples intentos fallidos;
* bloqueo temporal;
* detección de abuso;
* revocación de sesiones;
* recuperación segura.

Evitar respuestas que revelen información sensible.

Por ejemplo, no indicar innecesariamente:

```text
"el usuario existe"
```

cuando se solicita recuperación de contraseña.

---

# 30. SECRETOS

Nunca guardar secretos directamente en:

```text
Git
```

ni:

```text
.env
```

versionado.

Ejemplos:

```text
DATABASE_URL
JWT_SECRET
SESSION_SECRET
ARCA_CERTIFICATE
ARCA_PRIVATE_KEY
API_KEYS
WEBHOOK_SECRET
```

deben gestionarse mediante variables de entorno o secret management.

---

# 31. .ENV

Repositorio:

```text
.env.example
```

Sí.

Repositorio:

```text
.env
```

No.

Ejemplo:

```env
DATABASE_URL=
JWT_SECRET=
ARCA_ENV=
ARCA_CERT_PATH=
ARCA_KEY_PATH=
WEB_ORIGIN=
```

Nunca colocar valores reales en `.env.example`.

---

# 32. CREDENCIALES ARCA

Las credenciales y certificados de ARCA deberán estar completamente aislados del frontend.

Nunca:

```text
React → ARCA directamente
```

Debe existir:

```text
Frontend
   ↓
Backend
   ↓
FiscalProvider
   ↓
ARCAAdapter
   ↓
ARCA
```

Las claves privadas y certificados deben permanecer exclusivamente en backend/infraestructura segura.

---

# 33. DATOS SENSIBLES

El sistema debe minimizar la exposición de:

* contraseñas;
* tokens;
* certificados;
* claves privadas;
* información bancaria;
* datos salariales;
* información personal;
* documentos;
* datos de clientes.

Cuando se muestran datos sensibles:

```text
mostrar solamente lo necesario
```

Ejemplo:

```text
Cuenta: ****1234
```

en lugar de exponer información completa sin necesidad.

---

# 34. LOGS

Diferenciar:

```text
Application Logs
```

de:

```text
Audit Logs
```

Los logs técnicos sirven para:

* errores;
* performance;
* debugging;
* infraestructura;
* requests.

Los AuditLog sirven para:

* quién;
* qué;
* cuándo;
* dónde;
* por qué;
* sobre qué entidad;
* resultado.

No utilizar un único sistema para ambas funciones.

---

# 35. NO REGISTRAR SECRETOS

Nunca escribir en logs:

```text
password
JWT
refreshToken
privateKey
ARCA credentials
full card data
```

Los datos sensibles deberán:

* omitirse;
* enmascararse;
* truncarse;
* anonimizarse cuando corresponda.

---

# 36. AUDITORÍA DE SEGURIDAD

Los eventos relevantes deberán registrarse.

Ejemplos:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
PASSWORD_CHANGED
SESSION_REVOKED
PERMISSION_DENIED
USER_CREATED
USER_ROLE_CHANGED
USER_BRANCH_CHANGED
```

Además de los eventos de negocio definidos en:

`21_AUDITORIA_Y_TRAZABILIDAD.md`

---

# 37. AUDITORÍA DE OPERACIONES CRÍTICAS

Ejemplo:

```text
VENDEDOR
 ↓
intenta cancelar venta
 ↓
403 FORBIDDEN
 ↓
AuditLog
 ↓
PERMISSION_DENIED
```

Debe quedar evidencia suficiente para investigar intentos de abuso.

---

# 38. IDEMPOTENCIA

Operaciones sensibles deberán soportar idempotencia cuando exista riesgo de repetición.

Especialmente:

* pagos;
* facturación;
* transferencias;
* recepción de mercadería;
* movimientos financieros;
* webhooks;
* operaciones externas.

Ejemplo:

```text
Idempotency-Key
```

Si el cliente reintenta una operación por timeout, no debe duplicarse.

---

# 39. CONCURRENCIA

Las operaciones críticas deberán ejecutarse con control de concurrencia.

Ejemplo:

Dos vendedores intentan vender simultáneamente:

```text
última unidad disponible
```

El sistema debe impedir:

```text
stock = -1
```

y evitar doble venta.

Esto debe resolverse en backend + PostgreSQL mediante:

* transacciones;
* constraints;
* locking/versionado cuando corresponda;
* validación dentro de la transacción.

---

# 40. TRANSACCIONES

Las operaciones que modifiquen múltiples entidades deben ser atómicas.

Ejemplo de venta:

```text
Sale
+
SaleItem
+
Payment
+
StockMovement
+
FinancialMovement
+
Invoice
+
AuditLog
```

No debe quedar una venta pagada sin movimiento de stock por una excepción intermedia.

La estrategia exacta dependerá de qué integración sea externa.

Para ARCA:

```text
DB transaction
≠
transacción externa ARCA
```

La integración fiscal debe diseñarse para tolerar:

* timeout;
* retry;
* respuesta desconocida;
* duplicación;
* recuperación.

---

# 41. ARCHIVOS Y DOCUMENTOS

Los archivos subidos deben validarse.

Controlar:

* extensión;
* MIME type;
* tamaño;
* nombre;
* contenido;
* almacenamiento;
* permisos de acceso.

No confiar solamente en:

```text
filename.pdf
```

para determinar el tipo real.

Los archivos privados no deben quedar públicamente accesibles por URL permanente sin autorización.

---

# 42. WEBHOOKS

Los webhooks externos deben verificarse.

Cuando el proveedor lo soporte:

```text
firma
+
timestamp
+
secret
+
anti-replay
```

No aceptar un webhook únicamente porque llegó a:

```text
POST /webhook
```

Registrar:

```text
provider
eventId
signature result
receivedAt
processedAt
status
```

---

# 43. INTEGRIDAD DE BASE DE DATOS

La seguridad también debe existir en PostgreSQL.

Utilizar:

* foreign keys;
* unique constraints;
* check constraints cuando corresponda;
* NOT NULL;
* índices adecuados;
* transacciones;
* tipos correctos.

La aplicación no debe ser la única barrera contra datos inválidos.

---

# 44. DINERO Y PRECISIÓN

Nunca utilizar `float` para representar dinero.

Utilizar:

```text
Decimal
```

o equivalente.

Ejemplo conceptual:

```text
Decimal(14,2)
```

La precisión exacta deberá definirse en el modelo de datos.

---

# 45. CONTROL DE STOCK

Nunca confiar en:

```text
frontend stock = 1
```

como autorización de venta.

El backend debe volver a comprobar el stock durante la operación.

Flujo:

```text
Frontend
 ↓
"hay 1 unidad"
 ↓
Backend consulta estado real
 ↓
valida
 ↓
transaction
 ↓
reserva/descuenta
```

---

# 46. PROTECCIÓN CONTRA DOBLE ENVÍO

Los botones críticos deben manejar estados:

```text
idle
processing
success
error
```

Pero nuevamente:

> La protección real debe existir en backend mediante idempotencia/transacciones.

No depender solamente de:

```text
disabled
```

en React.

---

# 47. CONTROL DE PERMISOS EN FRONTEND

El frontend deberá adaptar la interfaz al usuario.

Ejemplo:

```text
Vendedor:
[ Nueva venta ]
[ Reservar ]
[ Consultar stock ]
```

No mostrar:

```text
[ Cerrar caja ]
[ Ajustar tesorería ]
[ Configuración ARCA ]
```

si no posee permisos.

Pero aunque el botón no exista, el backend debe rechazar la acción si se intenta manualmente.

---

# 48. ESCALAMIENTO DE PRIVILEGIOS

Debe evitarse que un usuario pueda modificarse a sí mismo:

```text
role = SUPER_ADMIN
```

o:

```text
permissions = ["*"]
```

sin autorización.

Los cambios de:

* rol;
* permisos;
* sucursal;
* alcance;

deben requerir privilegios administrativos.

Los cambios deben quedar auditados.

---

# 49. PROTECCIÓN DE ADMINISTRADORES

Las cuentas administrativas deberán tener controles adicionales cuando la infraestructura lo permita.

Recomendado para producción:

```text
MFA
```

especialmente para:

* SUPER_ADMIN;
* ADMIN;
* TESORERIA;
* usuarios con acceso fiscal;
* administración de usuarios/permisos.

---

# 50. SEPARACIÓN DE AMBIENTES

Debe existir separación clara:

```text
DEVELOPMENT
STAGING
PRODUCTION
```

Nunca reutilizar:

```text
credenciales de producción
```

en desarrollo.

Nunca conectar la demo directamente a:

```text
ARCA PRODUCCIÓN
```

---

# 51. ARCA DEMO

Durante el desarrollo/demo:

```text
FiscalProvider
      ↓
MockFiscalProvider
```

No utilizar credenciales reales.

La interfaz deberá indicar claramente:

```text
CAE SIMULADO
```

y:

```text
COMPROBANTE DEMOSTRATIVO
SIN VALIDEZ FISCAL
```

---

# 52. BASE DE DATOS DE PRODUCCIÓN

La base de producción debe:

* tener credenciales independientes;
* no ser accesible públicamente sin necesidad;
* utilizar conexiones seguras;
* tener backups;
* tener política de restauración;
* limitar permisos del usuario de aplicación.

El usuario de aplicación no debería utilizar una cuenta PostgreSQL con privilegios administrativos innecesarios.

---

# 53. BACKUPS

La seguridad de datos requiere backups.

Contemplar:

```text
backup
+
verificación
+
restauración
```

Un backup que nunca fue restaurado/testeado no debe considerarse completamente confiable.

La política concreta de:

* frecuencia;
* retención;
* RPO;
* RTO;

se define en:

`27_INFRAESTRUCTURA_Y_DEPLOYMENT.md`

---

# 54. DEPENDENCIAS

El proyecto deberá controlar dependencias vulnerables.

Utilizar herramientas del ecosistema Node/npm para:

```text
audit
```

y actualizar dependencias regularmente.

Evitar paquetes abandonados o innecesarios.

No agregar una dependencia únicamente porque simplifica unas pocas líneas.

---

# 55. SUPPLY CHAIN

Para dependencias críticas:

* revisar mantenimiento;
* verificar procedencia;
* evitar paquetes sospechosos;
* bloquear versiones cuando sea conveniente;
* revisar cambios importantes;
* utilizar lockfile.

Repositorio:

```text
package-lock.json
```

o equivalente deberá mantenerse bajo control de versiones.

---

# 56. PROTECCIÓN DE LA API

La API deberá contemplar:

```text
Authentication
Authorization
Validation
Rate Limiting
CORS
Security Headers
Logging
Audit
Idempotency
Error Handling
```

No exponer endpoints administrativos sin protección.

---

# 57. RESPUESTAS DE ERROR

No devolver información interna al cliente.

Incorrecto:

```json
{
  "error": "PrismaClientKnownRequestError: SELECT ..."
}
```

Correcto:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tiene permisos para realizar esta operación."
  }
}
```

Los detalles técnicos deben quedar en logs internos.

---

# 58. CÓDIGOS HTTP

Utilizar códigos HTTP coherentes.

Ejemplos:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
```

No utilizar:

```text
200 OK
```

para indicar errores de autorización o validación.

---

# 59. 401 VS 403

Diferenciar:

```text
401
```

cuando la identidad no está autenticada.

Y:

```text
403
```

cuando el usuario está autenticado pero no tiene autorización.

Ejemplo:

```text
Usuario no autenticado
→ 401
```

```text
Vendedor intenta cerrar caja
→ 403
```

---

# 60. PRINCIPIO DE NO EXPOSICIÓN

La API no deberá devolver información que el usuario no necesita.

Ejemplo:

Un vendedor no debería recibir:

```text
salary
bankAccount
treasuryBalance
internalCost
supplierPayment
```

si no posee autorización para ello.

La seguridad debe controlar también:

```text
qué campos puede leer
```

cuando sea necesario.

---

# 61. SEGURIDAD DE REPORTES

Los reportes también deben respetar scope.

Ejemplo:

```text
Vendedor
```

no debe descargar:

```text
ventas globales de todas las sucursales
```

si no tiene permiso.

La misma regla aplica a:

```text
CSV
XLSX
PDF
```

y cualquier exportación.

---

# 62. SEGURIDAD DE TESORERÍA

Tesorería debe considerarse un dominio altamente sensible.

Las operaciones como:

```text
TRANSFER
SUPPLIER_PAYMENT
EXPENSE
CASH_DEPOSIT
CASH_WITHDRAWAL
ADJUSTMENT
```

deberán requerir permisos adecuados.

Las operaciones de alto riesgo podrán requerir:

```text
aprobación
```

según las reglas definidas en módulos anteriores.

---

# 63. SEGURIDAD DE CAJA

Un cajero puede operar únicamente la caja/sesión correspondiente a su alcance.

No debe poder:

```text
cerrar caja de otra sucursal
```

sin autorización.

El cierre debe validar:

```text
cashRegister
+
session
+
branch
+
user
+
state
```

---

# 64. SEGURIDAD DE TRANSFERENCIAS

Una transferencia entre sucursales debe validar:

```text
origin
destination
user scope
status
stock
authorization
```

No permitir que un usuario modifique arbitrariamente:

```text
originBranch
destinationBranch
```

una vez despachada.

---

# 65. SEGURIDAD DE RESERVAS

Las reservas deben validar:

* usuario;
* sucursal;
* stock;
* estado;
* vencimiento;
* cliente;
* depósito/seña.

No permitir liberar stock de una reserva ajena sin autorización.

---

# 66. SEGURIDAD DE PRÉSTAMOS

Los préstamos de publicidad/contenido deben registrar:

```text
responsable
producto
origen
destino
fecha
motivo
estado
```

No permitir marcar:

```text
RETURNED
```

sin que exista una operación de devolución válida.

---

# 67. SEGURIDAD DE CAMBIOS Y DEVOLUCIONES

No permitir una devolución arbitraria.

Debe existir:

```text
originalSaleId
+
originalSaleItemId
+
cantidad disponible para devolver
+
motivo
+
usuario
+
autorización cuando corresponda
```

Nunca permitir:

```text
devolver 2
```

si solamente se vendió:

```text
1
```

---

# 68. SEGURIDAD DE EMPLEADOS

Los datos de empleados requieren acceso restringido.

Especialmente:

* salarios;
* adelantos;
* descuentos;
* cuentas;
* información personal.

Un vendedor normal no debe acceder al módulo salarial.

---

# 69. SEGURIDAD DE VENTAS A EMPLEADOS

Las ventas a empleados deben validar:

```text
employeeId
active employee
price policy
discount policy
authorization
payment/debt policy
```

No permitir seleccionar cualquier `employeeId` y asignar precio especial.

---

# 70. SEGURIDAD FISCAL

Las operaciones fiscales deben:

* mantener numeración controlada;
* impedir duplicados;
* registrar respuesta de ARCA;
* registrar CAE cuando corresponda;
* manejar errores;
* utilizar idempotencia;
* mantener trazabilidad.

No permitir editar manualmente un CAE.

---

# 71. CORRELACIÓN DE OPERACIONES

Las operaciones importantes deberán utilizar identificadores de correlación.

Ejemplo:

```text
operationId
requestId
correlationId
```

Esto permite reconstruir:

```text
Request
 ↓
Controller
 ↓
Service
 ↓
DB Transaction
 ↓
FinancialMovement
 ↓
StockMovement
 ↓
AuditLog
```

---

# 72. OBSERVABILIDAD

Producción debe permitir detectar:

* errores;
* accesos rechazados;
* errores de autorización;
* fallos de integraciones;
* operaciones lentas;
* excepciones;
* fallos de DB;
* fallos de facturación.

Nunca almacenar datos sensibles innecesarios para lograrlo.

---

# 73. ZERO TRUST

El sistema debe asumir:

> Ninguna solicitud es confiable solamente porque provenga de la aplicación.

Cada request deberá validarse.

Conceptualmente:

```text
Request
 ↓
¿Autenticado?
 ↓
¿Usuario activo?
 ↓
¿Permiso?
 ↓
¿Company scope?
 ↓
¿Branch scope?
 ↓
¿Recurso válido?
 ↓
¿Estado válido?
 ↓
¿Regla de negocio?
 ↓
¿Transacción segura?
 ↓
EXECUTE
```

---

# 74. CHECKLIST DE AUTORIZACIÓN

Antes de implementar una acción crítica, OpenCode deberá responder:

```text
1. ¿Quién puede ejecutarla?
2. ¿Qué permiso requiere?
3. ¿En qué empresa?
4. ¿En qué sucursal?
5. ¿Sobre qué recurso?
6. ¿En qué estado debe estar?
7. ¿Requiere aprobación?
8. ¿Qué datos puede modificar?
9. ¿Qué movimientos genera?
10. ¿Qué queda auditado?
11. ¿Puede repetirse?
12. ¿Qué ocurre si dos usuarios la ejecutan simultáneamente?
13. ¿Qué ocurre ante un timeout?
14. ¿Cómo se revierte?
```

Si estas preguntas no tienen respuesta, la operación no está suficientemente definida.

---

# 75. SECURITY BY DESIGN

La seguridad deberá incorporarse desde el diseño.

No:

```text
desarrollar todo
↓
agregar seguridad al final
```

Sino:

```text
diseñar
↓
autorizar
↓
validar
↓
implementar
↓
testear
```

---

# 76. TESTS DE SEGURIDAD

Como mínimo deberán existir pruebas para:

### Autenticación

```text
login válido
login inválido
sesión expirada
sesión revocada
password change
```

### Autorización

```text
vendedor → cerrar caja = DENIED
vendedor → modificar stock = DENIED
cajero → modificar salario = DENIED
```

### Scope

```text
Sucursal A → acceder venta B = DENIED
Sucursal A → stock B = DENIED
```

### IDOR

```text
GET /sales/:id
```

con ID perteneciente a otra sucursal:

```text
403/404 según estrategia
```

---

# 77. TESTS DE CONCURRENCIA

Probar:

```text
dos ventas
última unidad
```

Resultado esperado:

```text
una operación exitosa
otra rechazada
```

No:

```text
stock negativo
```

---

# 78. TESTS DE IDEMPOTENCIA

Ejemplo:

```text
POST /payments
Idempotency-Key: ABC123
```

enviado dos veces.

Resultado:

```text
1 payment
1 financial movement
```

No:

```text
2 payments
2 movements
```

---

# 79. TESTS DE PERMISOS

Debe existir una matriz de pruebas:

| Acción           | Vendedor |    Cajero |      Encargado | Admin |
| ---------------- | -------: | --------: | -------------: | ----: |
| Crear venta      |        ✅ | según rol |              ✅ |     ✅ |
| Finalizar pago   |        ❌ |         ✅ | según política |     ✅ |
| Cerrar caja      |        ❌ |         ✅ |              ✅ |     ✅ |
| Ajustar stock    |        ❌ |         ❌ |  según permiso |     ✅ |
| Ver tesorería    |        ❌ |         ❌ |  según permiso |     ✅ |
| Cambiar permisos |        ❌ |         ❌ |              ❌ |     ✅ |
| Ver salarios     |        ❌ |         ❌ |  según permiso |     ✅ |

La matriz final debe coincidir con `02_ROLES_Y_PERMISOS.md`.

---

# 80. SEGURIDAD EN DEMO

Aunque sea una demo:

Debe existir:

* login o mecanismo de acceso simulado;
* roles;
* permisos;
* separación de sucursales;
* datos ficticios;
* CAE simulado;
* credenciales falsas;
* ausencia de secretos reales.

La demo nunca debe contener:

```text
credenciales reales
certificados reales
clientes reales
datos bancarios reales
```

---

# 81. DIFERENCIA DEMO VS PRODUCCIÓN

| Área           | Demo             | Producción               |
| -------------- | ---------------- | ------------------------ |
| Auth           | Simplificada     | Completa                 |
| RBAC           | Sí               | Sí                       |
| Scope          | Sí               | Sí                       |
| PostgreSQL     | Opcional         | Obligatorio              |
| HTTPS          | Según deployment | Obligatorio              |
| ARCA           | Mock             | Real                     |
| Secrets        | Falsos           | Secret management        |
| MFA            | Opcional         | Recomendado/según riesgo |
| Rate limit     | Básico           | Completo                 |
| Audit          | Sí               | Inmutable/configurado    |
| Backups        | No crítico       | Obligatorio              |
| Monitoring     | Básico           | Completo                 |
| Security tests | Core             | Exhaustivos              |
| Datos          | Ficticios        | Reales protegidos        |

---

# 82. ARQUITECTURA DE SEGURIDAD

La arquitectura conceptual será:

```text
                    INTERNET
                       │
                       ▼
                HTTPS / TLS
                       │
                       ▼
              ┌─────────────────┐
              │    FRONTEND     │
              │ React + Vite    │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ SECURITY LAYER  │
              │ Auth / Session  │
              │ Rate Limit      │
              │ CORS / Headers  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │      API        │
              │ Node + Express  │
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
        Authorization       Validation
              │                 │
              └────────┬────────┘
                       ▼
              ┌─────────────────┐
              │ BUSINESS RULES  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   TRANSACTION   │
              │  Prisma / DB    │
              └────────┬────────┘
                       │
                       ▼
                 PostgreSQL
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        AuditLog             Movements
```

---

# 83. REGLA CRÍTICA

Toda operación crítica deberá satisfacer:

```text
IDENTIDAD
+
PERMISO
+
SCOPE
+
ESTADO
+
REGLA DE NEGOCIO
+
INTEGRIDAD
+
AUDITORÍA
```

---

# 84. NO NEGOCIABLES

OpenCode NO debe implementar:

```text
❌ passwords en texto plano
❌ secrets en Git
❌ autorización solamente en frontend
❌ role check solamente en React
❌ acceso cross-branch sin permiso
❌ UPDATE directo de stock
❌ UPDATE directo de saldos
❌ eliminación física de operaciones históricas
❌ JWT sin expiración
❌ SQL concatenado
❌ CORS abierto indiscriminadamente
❌ ARCA desde frontend
❌ credenciales reales en demo
❌ operaciones financieras sin audit
❌ pagos sin idempotencia cuando corresponda
❌ operaciones críticas sin transacción
```

---

# 85. INTEGRACIÓN CON LOS OTROS MÓDULOS

Este módulo depende y complementa:

```text
02_ROLES_Y_PERMISOS
03_EMPRESA_SUCURSALES_Y_POS
05_INVENTARIO_Y_STOCK
09_VENTAS_Y_POS
10_CAJAS_Y_ARQUEOS
11_TESORERIA_Y_CAJA_MAYOR
12_CUENTAS_FINANCIERAS
13_PAGOS_Y_MOVIMIENTOS_DINERO
14_RESERVAS_Y_SEÑAS
15_PRESTAMOS_PUBLICIDAD
16_CAMBIOS_Y_DEVOLUCIONES
17_EMPLEADOS_Y_SUELDOS
18_VENTAS_DE_EMPLEADOS
19_FACTURACION_ARCA
21_AUDITORIA_Y_TRAZABILIDAD
22_REGLAS_DE_NEGOCIO
23_ESTADOS_Y_TRANSICIONES
24_MODELO_DE_DATOS
25_ARQUITECTURA_TECNICA
27_INFRAESTRUCTURA_Y_DEPLOYMENT
28_TESTING_QA_Y_DEFINITION_OF_DONE
```

No debe duplicar las reglas de esos módulos.

Debe establecer cómo se protegen.

---

# 86. DEFINITION OF DONE — SEGURIDAD

El módulo se considera implementado cuando:

### Identidad

* [ ] usuarios identificables individualmente;
* [ ] password hashing seguro;
* [ ] sesiones controladas;
* [ ] expiración;
* [ ] revocación.

### Autorización

* [ ] RBAC;
* [ ] permisos granulares;
* [ ] scope por empresa;
* [ ] scope por sucursal;
* [ ] protección IDOR;
* [ ] backend enforcement.

### Datos

* [ ] validación runtime;
* [ ] SQL seguro;
* [ ] XSS controlado;
* [ ] CORS configurado;
* [ ] HTTPS producción;
* [ ] secrets protegidos.

### Operaciones

* [ ] transacciones;
* [ ] idempotencia;
* [ ] concurrencia;
* [ ] protección de stock;
* [ ] protección financiera;
* [ ] separación POS/caja.

### Auditoría

* [ ] login auditado;
* [ ] permisos rechazados auditados;
* [ ] operaciones críticas auditadas;
* [ ] secretos excluidos de logs.

### Infraestructura

* [ ] environments separados;
* [ ] `.env.example`;
* [ ] backups;
* [ ] DB protegida;
* [ ] dependencias controladas.

### Testing

* [ ] auth tests;
* [ ] authorization tests;
* [ ] scope tests;
* [ ] IDOR tests;
* [ ] concurrency tests;
* [ ] idempotency tests;
* [ ] security regression tests.

---

# 87. CRITERIOS DE ACEPTACIÓN

El sistema debe poder demostrar como mínimo:

### Caso 1 — vendedor

```text
Login vendedor
↓
Accede a su sucursal
↓
Crea venta
↓
Envía a caja
```

Puede realizarlo.

---

### Caso 2 — vendedor intenta cerrar caja

```text
Vendedor
↓
POST /cash/register/close
↓
403 FORBIDDEN
↓
AuditLog
```

Debe ser rechazado.

---

### Caso 3 — acceso cross-branch

```text
Usuario sucursal A
↓
solicita recurso sucursal B
↓
DENIED
```

---

### Caso 4 — stock

```text
Dos usuarios
↓
última unidad
↓
dos ventas simultáneas
↓
una aprobada
una rechazada
```

Nunca stock negativo.

---

### Caso 5 — pago duplicado

```text
request
↓
timeout
↓
retry
↓
same Idempotency-Key
```

Resultado:

```text
un único movimiento
```

---

### Caso 6 — operación histórica

```text
Venta COMPLETED
↓
usuario intenta editar total
↓
DENIED
```

La corrección debe realizarse mediante la operación correspondiente.

---

# 88. PRINCIPIO FINAL

La seguridad del sistema no debe depender de una sola tecnología.

No es:

```text
JWT + bcrypt
```

La seguridad real es:

```text
IDENTIDAD
        +
AUTENTICACIÓN
        +
AUTORIZACIÓN
        +
SCOPE
        +
VALIDACIÓN
        +
REGLAS DE NEGOCIO
        +
TRANSACCIONES
        +
CONCURRENCIA
        +
IDEMPOTENCIA
        +
INTEGRIDAD DB
        +
AUDITORÍA
        +
INFRAESTRUCTURA
        +
TESTING
```

El objetivo final es que ninguna persona pueda realizar una operación crítica simplemente porque descubrió un endpoint o modificó una petición HTTP.

El sistema debe responder siempre:

> **Quién sos, qué podés hacer, sobre qué datos podés hacerlo, en qué estado está la operación y si la operación es válida.**

Ese es el modelo de seguridad base para VM Digital Studio.

---

## REGLA PARA OPENCODE

Antes de implementar cualquier funcionalidad, OpenCode deberá verificar:

```text
AUTH
→ ¿Quién es el usuario?

RBAC
→ ¿Qué permiso tiene?

SCOPE
→ ¿Sobre qué empresa/sucursal/recurso puede operar?

STATE
→ ¿La operación puede ejecutarse en este estado?

BUSINESS RULE
→ ¿Cumple las reglas del dominio?

TRANSACTION
→ ¿Los cambios son atómicos?

IDEMPOTENCY
→ ¿Puede ejecutarse dos veces accidentalmente?

AUDIT
→ ¿Queda evidencia?

SECURITY
→ ¿Existe alguna forma de bypass?

TEST
→ ¿Existe una prueba que demuestre que está protegido?
```

Si cualquiera de estos puntos falla, la implementación **no está terminada**.
