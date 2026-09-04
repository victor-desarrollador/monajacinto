# 27 — INFRAESTRUCTURA Y DEPLOYMENT

## VM Digital Studio — Sistema de Gestión Multisucursal

**Versión:** 1.0
**Estado:** Especificación funcional y técnica
**Clasificación:** CRÍTICO
**Aplica a:** Frontend, Backend, Base de Datos, Integraciones, Seguridad, CI/CD, Backups y Operaciones

---

# 1. OBJETIVO

Definir la infraestructura necesaria para ejecutar, desplegar, actualizar, mantener, respaldar y recuperar el sistema de gestión multisucursal.

La infraestructura debe permitir evolucionar desde:

```text
DEMO
 ↓
DESARROLLO
 ↓
STAGING
 ↓
PRODUCCIÓN
```

sin tener que rediseñar completamente el sistema.

La infraestructura debe priorizar:

* seguridad;
* estabilidad;
* trazabilidad;
* recuperación;
* simplicidad;
* mantenibilidad;
* escalabilidad progresiva;
* separación de ambientes.

No se busca construir una infraestructura empresarial sobredimensionada para la primera versión.

---

# 2. PRINCIPIO DE INFRAESTRUCTURA

La regla principal será:

> **La infraestructura debe ser proporcional al sistema actual, pero preparada para crecer.**

No implementar desde el comienzo:

```text
Kubernetes
Service Mesh
Microservicios
Kafka
Cluster PostgreSQL
Redis Cluster
Multi-region
```

si el volumen real del sistema no lo requiere.

La arquitectura inicial recomendada es:

```text
MODULAR MONOLITH
+
DOCKER
+
POSTGRESQL
+
REVERSE PROXY
```

con posibilidad de incorporar servicios adicionales posteriormente.

---

# 3. ARQUITECTURA OBJETIVO

Arquitectura base:

```text
                    INTERNET
                       │
                       ▼
                 DNS / DOMAIN
                       │
                       ▼
                  HTTPS / TLS
                       │
                       ▼
             ┌──────────────────┐
             │ REVERSE PROXY    │
             │ Nginx / Caddy    │
             └────────┬─────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
   ┌──────────────┐       ┌──────────────┐
   │   FRONTEND   │       │   BACKEND    │
   │ React + Vite │       │ Node/Express │
   └──────────────┘       └───────┬──────┘
                                  │
                                  ▼
                           ┌─────────────┐
                           │ PostgreSQL  │
                           └─────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
                 Storage       Worker       Backups
```

---

# 4. COMPONENTES

La infraestructura estará compuesta conceptualmente por:

```text
Frontend
Backend API
PostgreSQL
Reverse Proxy
Storage
Worker opcional
Queue opcional
Monitoring
Backup
CI/CD
DNS
HTTPS
```

No todos son obligatorios en la demo.

---

# 5. FRONTEND

Tecnología objetivo:

```text
React
TypeScript
Vite
```

El frontend será una aplicación estática después del build.

Proceso:

```text
Source
 ↓
npm install
 ↓
npm run build
 ↓
dist/
 ↓
hosting/CDN
```

El frontend no debe contener:

```text
DATABASE_URL
JWT_SECRET
ARCA_PRIVATE_KEY
ARCA_CERTIFICATE
```

ni cualquier secreto de backend.

---

# 6. BACKEND

Tecnología objetivo:

```text
Node.js
TypeScript
Express
```

El backend será responsable de:

* autenticación;
* autorización;
* reglas de negocio;
* transacciones;
* persistencia;
* integraciones;
* auditoría;
* reportes;
* facturación;
* movimientos de stock;
* movimientos financieros.

El frontend nunca debe conectarse directamente a PostgreSQL.

---

# 7. BASE DE DATOS

Base de datos objetivo:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

Arquitectura:

```text
Frontend
   ↓
API
   ↓
Prisma
   ↓
PostgreSQL
```

Nunca:

```text
Frontend
   ↓
PostgreSQL
```

---

# 8. MODULAR MONOLITH

La primera versión de producción utilizará preferentemente un:

```text
Modular Monolith
```

Esto significa:

```text
una aplicación backend
```

pero organizada por dominios.

Ejemplo:

```text
modules/
├── auth/
├── users/
├── branches/
├── products/
├── inventory/
├── warehouse/
├── purchases/
├── transfers/
├── sales/
├── cash/
├── treasury/
├── financial-accounts/
├── reservations/
├── marketing-loans/
├── exchanges/
├── employees/
├── payroll/
├── invoicing/
├── reports/
└── audit/
```

Esto permite mantener límites claros sin introducir complejidad innecesaria.

---

# 9. DOCKER

Producción podrá ejecutarse mediante Docker.

Contenedores iniciales:

```text
frontend
backend
postgres
reverse-proxy
```

Opcionales:

```text
worker
redis
monitoring
```

No agregar servicios únicamente por seguir una arquitectura de moda.

---

# 10. COMUNICACIÓN INTERNA

Dentro de Docker:

```text
backend
   ↓
postgres:5432
```

El backend utilizará el nombre del servicio Docker correspondiente.

No depender de:

```text
localhost
```

para comunicación entre contenedores.

Ejemplo conceptual:

```env
DATABASE_URL=postgresql://user:password@postgres:5432/app
```

La configuración final dependerá del deployment real.

---

# 11. RED

La infraestructura deberá separar:

### Red pública

Acceso:

```text
HTTPS
```

### Red privada

Comunicación interna:

```text
Backend
PostgreSQL
Worker
Redis
```

PostgreSQL no debe exponerse públicamente si no existe una necesidad explícita.

---

# 12. FIREWALL

La infraestructura de producción deberá aplicar mínimo privilegio también a nivel de red.

Permitir únicamente lo necesario.

Ejemplo conceptual:

```text
Internet
 ↓
443 HTTPS
 ↓
Reverse Proxy
 ↓
Backend
 ↓
PostgreSQL
```

No:

```text
Internet
 ↓
5432 PostgreSQL
```

sin una justificación excepcional y controles adicionales.

---

# 13. REVERSE PROXY

Se podrá utilizar:

```text
Nginx
```

o:

```text
Caddy
```

como reverse proxy.

Responsabilidades:

* HTTPS;
* terminación TLS;
* routing;
* headers;
* compresión cuando corresponda;
* servir frontend si aplica;
* proxy hacia API.

---

# 14. DOMINIO

Producción deberá utilizar un dominio controlado por el cliente/empresa.

Ejemplo conceptual:

```text
app.empresa.com
```

API:

```text
api.empresa.com
```

o:

```text
app.empresa.com/api
```

La decisión deberá tomarse según la estrategia de deployment.

---

# 15. HTTPS / TLS

Producción deberá utilizar HTTPS.

El certificado debe renovarse automáticamente cuando la infraestructura lo permita.

No almacenar certificados privados dentro del repositorio Git.

---

# 16. VARIABLES DE ENTORNO

Separar configuración de código.

Ejemplo:

```env
NODE_ENV=
PORT=
DATABASE_URL=
WEB_ORIGIN=
SESSION_SECRET=
JWT_SECRET=
ARCA_ENV=
ARCA_CERT_PATH=
ARCA_KEY_PATH=
STORAGE_ENDPOINT=
STORAGE_BUCKET=
```

Nunca hardcodear secretos.

---

# 17. AMBIENTES

Existirán como mínimo:

```text
development
staging
production
```

La demo puede utilizar:

```text
demo
```

como ambiente separado o como configuración específica de development.

---

# 18. DEVELOPMENT

Características:

```text
local
datos ficticios
ARCA mock
logs detallados
hot reload
```

Puede utilizar:

```text
Docker Compose
```

para simplificar el entorno.

---

# 19. STAGING

Staging debe representar lo más fielmente posible producción.

Ejemplo:

```text
Frontend staging
Backend staging
PostgreSQL staging
ARCA sandbox/mock según disponibilidad
```

Nunca utilizar datos reales innecesarios.

---

# 20. PRODUCTION

Producción debe tener:

* HTTPS;
* PostgreSQL protegido;
* secretos reales protegidos;
* backups;
* monitoring;
* logs;
* migrations controladas;
* deployment controlado;
* rollback de aplicación;
* estrategia de recuperación.

---

# 21. DEMO

La demo debe ser deliberadamente simple.

Puede utilizar:

```text
React
+
mock/localStorage
```

o:

```text
React
+
API simplificada
+
PostgreSQL
```

dependiendo del tiempo disponible.

No es obligatorio implementar toda la infraestructura productiva durante la semana de demo.

---

# 22. ARCA Y AMBIENTES

Nunca conectar la demo directamente a ARCA producción.

Arquitectura:

```text
Demo
 ↓
MockFiscalProvider
```

Producción:

```text
Production
 ↓
FiscalProvider
 ↓
ARCAAdapter
 ↓
ARCA
```

Las credenciales deben ser independientes por ambiente.

---

# 23. MIGRACIONES

El esquema de PostgreSQL debe evolucionar mediante migraciones.

Utilizar:

```text
Prisma Migrate
```

Las migraciones deberán quedar versionadas.

Nunca realizar cambios estructurales manuales en producción sin registrar el procedimiento.

---

# 24. DEPLOYMENT DE MIGRACIONES

Una migración productiva debe ejecutarse como parte de un proceso controlado.

Conceptualmente:

```text
Deploy
 ↓
Backup/checkpoint
 ↓
Migration
 ↓
Application
 ↓
Health check
```

No actualizar arbitrariamente el schema desde el frontend.

---

# 25. SEED

Los seeds deben diferenciar:

```text
development
demo
test
```

de:

```text
production
```

Nunca insertar datos demo automáticamente en producción.

---

# 26. HEALTH CHECK

El backend deberá exponer endpoints internos de salud.

Por ejemplo:

```text
GET /health
```

para indicar que la aplicación está ejecutándose.

Y opcionalmente:

```text
GET /ready
```

para indicar que puede atender tráfico.

La respuesta no debe revelar:

* secrets;
* stack traces;
* credenciales;
* información interna innecesaria.

---

# 27. READINESS

El concepto de readiness debe diferenciar:

```text
Application running
```

de:

```text
Application ready
```

Ejemplo:

```text
Backend arrancó
 ↓
DB todavía no disponible
 ↓
NOT READY
```

Esto permite que el deployment detecte correctamente el problema.

---

# 28. LOGGING

La aplicación deberá generar logs estructurados.

Preferentemente:

```text
JSON
```

incluyendo cuando corresponda:

```text
timestamp
level
service
requestId
operationId
route
status
duration
errorCode
```

No incluir secretos.

---

# 29. APPLICATION LOGS VS AUDIT LOGS

Mantener separación:

```text
Application Logs
```

para infraestructura y debugging.

Y:

```text
AuditLog
```

para trazabilidad de negocio.

Ejemplo:

```text
Application Log:
"POST /sales 200 84ms"
```

vs:

```text
AuditLog:
"User 42 finalized sale 1028"
```

---

# 30. MONITORING

Producción debe permitir conocer:

```text
¿Está funcionando?
¿Está lento?
¿Hay errores?
¿La DB responde?
¿Hay problemas con ARCA?
¿Hay operaciones fallidas?
```

Métricas futuras:

* CPU;
* RAM;
* disk;
* DB connections;
* API latency;
* error rate;
* request rate;
* failed jobs;
* ARCA errors.

---

# 31. ALERTAS

Las alertas deberán priorizar eventos accionables.

Ejemplos:

```text
API caída
DB caída
disk casi lleno
backup fallido
error rate elevado
ARCA integration failure
```

No crear cientos de alertas que generen ruido.

---

# 32. STORAGE

Los documentos/archivos deberán abstraerse mediante una capa de storage.

Ejemplo:

```text
StorageProvider
```

Permite utilizar:

```text
LocalStorageProvider
```

en demo/desarrollo.

Y posteriormente:

```text
S3CompatibleStorageProvider
```

en producción.

Esto evita acoplar el dominio a un proveedor específico.

---

# 33. BACKUPS

La base de datos debe tener backups automatizados.

Debe existir:

```text
Backup
 ↓
Storage seguro
 ↓
Retention
 ↓
Verification
```

Los backups deben almacenarse fuera del mismo volumen principal cuando sea posible.

---

# 34. BACKUP ≠ RECOVERY

No alcanza con generar backups.

Debe probarse:

```text
Backup
 ↓
Restore
 ↓
Database recovered
 ↓
Application starts
 ↓
Data verified
```

La restauración debe probarse periódicamente.

---

# 35. RPO

Definir:

```text
Recovery Point Objective
```

Es decir:

> cuánto tiempo máximo de datos se acepta perder.

Ejemplo conceptual:

```text
RPO = 24h
```

significa que potencialmente podrían perderse hasta 24 horas de información.

El valor definitivo debe acordarse con el cliente según criticidad y costo.

---

# 36. RTO

Definir:

```text
Recovery Time Objective
```

Es decir:

> cuánto tiempo máximo se acepta que el sistema esté fuera de servicio.

Ejemplo:

```text
RTO = 4h
```

El valor final depende de infraestructura y presupuesto.

---

# 37. ESTRATEGIA DE BACKUP

Como mínimo:

```text
Backup diario
+
retención definida
+
copia externa
+
prueba de restauración
```

En producción crítica puede evolucionar a:

```text
full backups
+
incremental/WAL
+
point-in-time recovery
```

si el volumen y presupuesto lo justifican.

---

# 38. DISCO

La infraestructura debe monitorizar:

```text
disk usage
```

Especialmente:

```text
PostgreSQL
Logs
Backups
Storage
Docker volumes
```

Nunca permitir que el disco llegue al 100%.

---

# 39. DOCKER VOLUMES

Los datos persistentes no deben depender de la vida del contenedor.

PostgreSQL:

```text
container
 ↓
persistent volume
```

No:

```text
container eliminado
 ↓
database perdida
```

---

# 40. DATABASE PERSISTENCE

PostgreSQL debe utilizar almacenamiento persistente.

Los siguientes datos requieren especial protección:

```text
database
uploads
backups
certificates/secrets cuando corresponda
```

---

# 41. DEPLOYMENT FRONTEND

Flujo recomendado:

```text
Git
 ↓
CI
 ↓
Install
 ↓
Lint
 ↓
Tests
 ↓
Build
 ↓
Deploy
```

El frontend puede desplegarse en una plataforma de hosting/CDN adecuada.

---

# 42. DEPLOYMENT BACKEND

Flujo:

```text
Git
 ↓
CI
 ↓
Install
 ↓
Lint
 ↓
Tests
 ↓
Build
 ↓
Docker image
 ↓
Deploy
 ↓
Migration
 ↓
Health check
```

---

# 43. CI/CD

La pipeline deberá ejecutar como mínimo:

```text
Install dependencies
Lint
Typecheck
Unit tests
Integration tests
Build
```

Antes del deployment productivo.

Los tests críticos deben bloquear el deployment.

---

# 44. BRANCHING

Estrategia inicial sencilla:

```text
main
develop
feature/*
fix/*
```

o una estrategia equivalente.

Evitar Git Flow excesivamente complejo si el equipo continúa siendo pequeño.

---

# 45. PULL REQUEST

Los cambios importantes deben revisarse antes de entrar a producción.

Checklist:

```text
Código
Tests
Security
Migration
Environment
Documentation
Rollback
```

---

# 46. VERSIONADO

Las releases deberán poder identificarse.

Ejemplo:

```text
v1.0.0
v1.0.1
v1.1.0
```

Utilizar SemVer cuando resulte apropiado.

---

# 47. ROLLBACK DE APLICACIÓN

Si un deployment falla:

```text
nuevo release
 ↓
health check FAIL
 ↓
rollback
 ↓
versión anterior
```

Debe existir una forma clara de volver a la versión anterior.

---

# 48. ROLLBACK DE DATOS

Un rollback de código no siempre implica rollback de DB.

Ejemplo:

```text
Migration ejecutada
↓
Application falla
```

No ejecutar automáticamente:

```text
DROP / reverse migration
```

sin evaluar impacto.

Las migraciones destructivas deben diseñarse cuidadosamente.

Preferir migraciones compatibles hacia adelante cuando sea posible:

```text
expand
 ↓
migrate
 ↓
switch
 ↓
contract
```

---

# 49. ZERO-DOWNTIME

No es obligatorio para la primera versión.

Pero la arquitectura debe evitar depender de operaciones que requieran largos períodos de indisponibilidad.

A medida que el sistema crezca podrán incorporarse:

* rolling deployments;
* health checks;
* múltiples instancias;
* load balancing.

---

# 50. API STATELESS

El backend debería diseñarse preferentemente como stateless respecto del servidor.

La sesión no debería depender de:

```text
RAM local del proceso
```

si se pretende escalar horizontalmente.

Estado compartido:

```text
PostgreSQL
Redis opcional
```

---

# 51. REDIS

Redis es opcional.

Puede utilizarse posteriormente para:

* cache;
* rate limiting distribuido;
* sesiones;
* locks;
* jobs;
* realtime;
* colas.

No debe agregarse solamente porque el proyecto utiliza Node.js.

---

# 52. WORKERS

Los procesos pesados pueden ejecutarse fuera del request principal.

Ejemplos:

```text
export XLSX
generación de PDF
emails
notificaciones
procesamiento de archivos
reintentos externos
reportes pesados
```

Arquitectura:

```text
API
 ↓
Queue
 ↓
Worker
 ↓
Job
```

Esto puede implementarse cuando el volumen lo justifique.

---

# 53. OPERACIONES ASÍNCRONAS

Una operación asíncrona debe tener estado.

Ejemplo:

```text
PENDING
PROCESSING
COMPLETED
FAILED
RETRYING
```

No dejar al frontend esperando indefinidamente un proceso pesado.

---

# 54. ARCA COMO INTEGRACIÓN EXTERNA

ARCA debe tratarse como sistema externo.

Nunca asumir:

```text
API responde siempre
```

Debe contemplarse:

```text
timeout
network failure
rejection
duplicate
unknown result
maintenance
```

El estado de la operación debe poder recuperarse.

---

# 55. SEGURIDAD DE RED

La infraestructura deberá seguir las reglas del módulo:

`26_SEGURIDAD.md`

Incluyendo:

* HTTPS;
* firewall;
* CORS;
* secretos;
* rate limiting;
* DB privada;
* aislamiento de servicios;
* logs;
* backups.

---

# 56. SSH

Si el servidor de producción utiliza SSH:

* utilizar claves;
* evitar contraseñas cuando sea viable;
* restringir acceso;
* mantener actualizado el sistema;
* utilizar firewall;
* evitar exponer servicios innecesarios.

No compartir una única clave privada entre múltiples administradores sin control.

---

# 57. ACTUALIZACIONES DEL SISTEMA

El servidor deberá mantenerse actualizado.

Aplicar:

```text
OS updates
security patches
Docker updates
runtime updates
dependency updates
```

de manera controlada.

En producción crítica, primero validar cambios importantes en staging.

---

# 58. CONTENEDORES

Las imágenes Docker deberán:

* utilizar imágenes base confiables;
* minimizar paquetes innecesarios;
* evitar ejecutar como root cuando sea posible;
* fijar versiones razonablemente;
* actualizar dependencias;
* no incluir secretos.

---

# 59. DOCKERFILE

Preferir builds reproducibles.

Conceptualmente:

```text
Build Stage
 ↓
compile
 ↓
Production Stage
 ↓
minimal runtime
```

No enviar:

```text
node_modules de desarrollo
source innecesario
secretos
```

a la imagen final.

---

# 60. CONFIGURACIÓN

La configuración debe estar separada del código.

Ejemplo:

```text
Código
+
Environment
+
Secret configuration
```

Nunca:

```text
Código
+
password hardcodeada
```

---

# 61. DATABASE CONNECTION POOL

El backend deberá controlar las conexiones a PostgreSQL.

No abrir una conexión nueva sin límite por cada request.

La configuración deberá contemplar:

```text
pool size
timeouts
connection limits
```

según el entorno.

---

# 62. MIGRACIONES Y BACKUPS

Antes de una migración potencialmente riesgosa:

```text
Backup
 ↓
Migration
 ↓
Verification
```

Las migraciones críticas deberán documentar:

```text
impacto
riesgo
rollback strategy
```

---

# 63. DEPLOYMENT MANUAL VS AUTOMÁTICO

Durante demo:

```text
manual deployment
```

es aceptable.

Producción:

```text
CI/CD controlado
```

es preferible.

No significa que todo deployment deba ejecutarse automáticamente sin aprobación.

Puede existir:

```text
CI
 ↓
Staging
 ↓
Approval
 ↓
Production
```

---

# 64. PRODUCCIÓN CON APROBACIÓN

Para cambios sensibles:

```text
Pull Request
 ↓
CI
 ↓
Staging
 ↓
QA
 ↓
Approval
 ↓
Production
```

Especialmente:

* migraciones;
* cambios financieros;
* facturación;
* seguridad;
* permisos.

---

# 65. DOMINIOS Y DNS

La configuración DNS debe quedar documentada.

Ejemplo:

```text
app.domain.com
api.domain.com
```

Los cambios DNS deben quedar registrados.

---

# 66. CORS Y DOMINIOS

El frontend y backend deben conocer sus dominios válidos.

Ejemplo:

```env
WEB_ORIGIN=https://app.domain.com
```

No:

```env
WEB_ORIGIN=*
```

en producción cuando no sea necesario.

---

# 67. RATE LIMITING INFRAESTRUCTURA

Puede existir una primera capa en:

```text
Reverse Proxy
```

y una segunda capa en:

```text
Backend
```

Especialmente para:

```text
auth
webhooks
admin
exports
```

---

# 68. EXPORTACIONES

Los reportes grandes no deben bloquear indefinidamente la API.

Para archivos pequeños:

```text
request
 ↓
generate
 ↓
download
```

Para archivos grandes:

```text
request
 ↓
job
 ↓
worker
 ↓
file
 ↓
download
```

---

# 69. TIMEOUTS

Todas las comunicaciones externas deben tener timeout.

Especialmente:

```text
ARCA
storage
external APIs
database
```

Nunca permitir requests indefinidos.

---

# 70. RETRIES

Los retries deben utilizarse solamente cuando sean seguros.

Especialmente cuidado con:

```text
payment
invoice
financial movement
```

Un retry sin idempotencia puede duplicar dinero.

Regla:

> **Retry sin idempotencia en operaciones financieras es peligroso.**

---

# 71. OBSERVABILIDAD DE DEPLOYMENT

Después de un deployment:

```text
Deploy
 ↓
Health
 ↓
Logs
 ↓
Error rate
 ↓
DB
 ↓
Critical flow
```

Debe comprobarse que:

* API responde;
* DB responde;
* autenticación funciona;
* venta funciona;
* caja funciona;
* stock funciona;
* integraciones críticas funcionan.

---

# 72. SMOKE TEST POST-DEPLOY

Después de producción deberá ejecutarse un smoke test.

Como mínimo:

```text
GET health
Login
Read products
Create test-safe operation
Read dashboard
```

No ejecutar operaciones financieras reales de prueba en producción.

---

# 73. INCIDENT RESPONSE

Debe existir una estrategia mínima para:

```text
Sistema caído
DB caída
ARCA caída
Backup fallido
Seguridad comprometida
Error financiero
Error de stock
```

Respuesta:

```text
Detectar
 ↓
Contener
 ↓
Investigar
 ↓
Recuperar
 ↓
Verificar
 ↓
Documentar
```

---

# 74. INCIDENTES DE SEGURIDAD

Si se detecta:

```text
credencial comprometida
token robado
acceso indebido
```

acciones posibles:

```text
revocar sesión
rotar secreto
bloquear usuario
aislar servicio
revisar AuditLog
revisar logs
```

---

# 75. DATOS DE PRODUCCIÓN

Nunca utilizar una copia de producción en desarrollo sin:

* autorización;
* minimización;
* anonimización cuando corresponda;
* controles de acceso.

Preferentemente utilizar datos sintéticos.

---

# 76. SEPARACIÓN DE CREDENCIALES

Cada ambiente debe tener credenciales distintas.

```text
DEV
≠
STAGING
≠
PRODUCTION
```

Especialmente:

```text
DATABASE
ARCA
JWT
STORAGE
WEBHOOK
API KEYS
```

---

# 77. SECRETS ROTATION

Los secretos críticos deben poder rotarse.

Ejemplo:

```text
DATABASE_PASSWORD
JWT_SECRET
WEBHOOK_SECRET
ARCA credentials
```

La aplicación debe poder actualizar configuración sin requerir cambios de código.

---

# 78. DOCUMENTACIÓN OPERATIVA

La infraestructura deberá documentar:

```text
cómo levantar
cómo desplegar
cómo actualizar
cómo migrar
cómo hacer backup
cómo restaurar
cómo revisar logs
cómo revisar health
cómo rollback
cómo responder a incidentes
```

Esta documentación pertenece a la operación del sistema, no solamente al código.

---

# 79. ESTRUCTURA DE INFRAESTRUCTURA

La estructura recomendada:

```text
infra/
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
│
├── nginx/
│   └── nginx.conf
│
├── scripts/
│   ├── backup.sh
│   ├── restore.sh
│   ├── deploy.sh
│   └── healthcheck.sh
│
└── README.md
```

La estructura final puede adaptarse al proveedor utilizado.

---

# 80. REPOSITORIO

La infraestructura deberá convivir con:

```text
apps/
packages/
prisma/
docs/
infra/
tests/
scripts/
```

y documentación:

```text
AGENTS.md
CHANGELOG.md
```

---

# 81. AGENTS.MD

`AGENTS.md` deberá contener instrucciones operativas para agentes de desarrollo.

Especialmente:

```text
arquitectura
reglas
testing
seguridad
migrations
deployment
no-go rules
```

Pero:

> `AGENTS.md` no reemplaza esta documentación.

Es una guía operativa para agentes, mientras que los módulos son la especificación del sistema.

---

# 82. MONITORING FUTURO

Cuando el sistema crezca puede incorporarse:

```text
Metrics
Logs aggregation
Tracing
Error tracking
Dashboards
Alerting
```

No es necesario introducir una plataforma compleja en la primera demo.

---

# 83. ESCALABILIDAD

La arquitectura debe permitir evolucionar:

```text
1 instancia API
        ↓
2+ instancias API
        ↓
Load Balancer
        ↓
Redis
        ↓
Workers
        ↓
DB optimization
```

sin modificar el dominio del negocio.

---

# 84. ESCALABILIDAD DE POSTGRESQL

Primera etapa:

```text
1 PostgreSQL
```

Posteriormente:

```text
backup
+
replica
+
read replica
```

si el volumen lo requiere.

No implementar replicas antes de necesitarlas.

---

# 85. ESCALABILIDAD DEL FRONTEND

El frontend es principalmente estático.

Puede utilizar:

```text
CDN
+
cache
```

sin necesidad de modificar el dominio de negocio.

---

# 86. ESCALABILIDAD DEL BACKEND

Mantener el backend:

```text
stateless
```

siempre que sea posible.

Esto permite:

```text
API x1
```

evolucionar a:

```text
API x2
API x3
API xN
```

---

# 87. PRINCIPIO DE NO SOBREINGENIERÍA

No implementar infraestructura compleja antes de que exista una necesidad real.

Prioridad:

```text
Correcto
 ↓
Seguro
 ↓
Observable
 ↓
Escalable
```

No:

```text
Complejo
 ↓
Costoso
 ↓
Difícil de mantener
```

---

# 88. DEMO — INFRAESTRUCTURA MÍNIMA

Para la demo de una semana:

```text
React + Vite
+
mock/localStorage
```

o:

```text
React
+
Node/Express
+
PostgreSQL
+
Docker
```

según el alcance acordado.

Obligatorio:

```text
datos ficticios
ARCA simulado
sin secretos reales
```

No obligatorio:

```text
Redis
Workers
Kubernetes
Monitoring avanzado
Multi-region
HA
```

---

# 89. PRODUCCIÓN — INFRAESTRUCTURA BASE

La primera producción debería apuntar a:

```text
Domain
 ↓
HTTPS
 ↓
Reverse Proxy
 ↓
Frontend
 ↓
Backend
 ↓
PostgreSQL
```

más:

```text
Backup
Monitoring
Secrets
Audit
CI/CD
```

---

# 90. CHECKLIST DE PRODUCCIÓN

Antes de poner el sistema en producción:

### Aplicación

* [ ] frontend build correcto;
* [ ] backend build correcto;
* [ ] migrations verificadas;
* [ ] health check funcionando.

### Seguridad

* [ ] HTTPS;
* [ ] CORS;
* [ ] secrets;
* [ ] rate limit;
* [ ] DB privada;
* [ ] RBAC;
* [ ] scope.

### Base de datos

* [ ] PostgreSQL persistente;
* [ ] backup;
* [ ] restore probado;
* [ ] migrations;
* [ ] índices.

### Operación

* [ ] logs;
* [ ] monitoring;
* [ ] alertas básicas;
* [ ] rollback;
* [ ] documentación.

### Fiscal

* [ ] ARCA production correctamente aislado;
* [ ] certificados protegidos;
* [ ] environment correcto;
* [ ] pruebas de integración.

---

# 91. DEFINITION OF DONE

El módulo 27 estará completo cuando:

* [ ] existan ambientes separados;
* [ ] Docker esté correctamente definido;
* [ ] PostgreSQL tenga persistencia;
* [ ] backend pueda desplegarse reproduciblemente;
* [ ] frontend pueda desplegarse reproduciblemente;
* [ ] HTTPS esté configurado en producción;
* [ ] secrets estén fuera de Git;
* [ ] migrations estén versionadas;
* [ ] health checks funcionen;
* [ ] logs estructurados funcionen;
* [ ] backups automáticos existan;
* [ ] restore haya sido probado;
* [ ] rollback de aplicación esté documentado;
* [ ] CI ejecute tests;
* [ ] production deployment esté controlado;
* [ ] ARCA esté separado por ambiente;
* [ ] infraestructura no exponga PostgreSQL innecesariamente;
* [ ] documentación operacional exista.

---

# 92. CRITERIOS DE ACEPTACIÓN

### Caso 1 — Deployment

```text
Git
 ↓
CI
 ↓
Tests
 ↓
Build
 ↓
Deploy
 ↓
Health
```

Resultado:

```text
SUCCESS
```

---

### Caso 2 — DB

```text
PostgreSQL
 ↓
restart container
 ↓
data remains
```

La información no debe perderse.

---

### Caso 3 — Backup

```text
Backup
 ↓
Destroy test DB
 ↓
Restore
 ↓
Application
```

Resultado:

```text
Data recovered
```

---

### Caso 4 — Seguridad

```text
Internet
 ↓
5432
```

Resultado esperado:

```text
NO ACCESS
```

---

### Caso 5 — Deployment fallido

```text
New release
 ↓
Health FAIL
 ↓
Rollback
```

Resultado:

```text
Previous release operational
```

---

# 93. REGLAS NO NEGOCIABLES

OpenCode NO debe implementar:

```text
❌ PostgreSQL público sin necesidad
❌ secrets en Git
❌ credenciales reales en demo
❌ ARCA producción en demo
❌ datos persistentes dentro del container
❌ deployment sin migraciones controladas
❌ deployment sin health check
❌ backup sin estrategia de restore
❌ rollback automático de DB sin evaluación
❌ localhost como dependencia entre containers
❌ servicios innecesarios
❌ Kubernetes sin requerimiento real
❌ Redis sin necesidad real
❌ microservicios prematuros
```

---

# 94. ORDEN DE IMPLEMENTACIÓN

La infraestructura deberá implementarse progresivamente:

```text
FASE 1
Docker básico
        ↓
Backend
        ↓
PostgreSQL
```

```text
FASE 2
Migrations
        ↓
Seeds
        ↓
Health checks
```

```text
FASE 3
Reverse proxy
        ↓
HTTPS
        ↓
Domain
```

```text
FASE 4
Secrets
        ↓
Backups
        ↓
Restore
```

```text
FASE 5
CI/CD
        ↓
Staging
        ↓
Production
```

```text
FASE 6
Monitoring
        ↓
Alerts
        ↓
Optimization
```

---

# 95. ARQUITECTURA FINAL

La infraestructura objetivo queda:

```text
                         INTERNET
                            │
                            ▼
                         DOMAIN
                            │
                            ▼
                      HTTPS / TLS
                            │
                            ▼
                   ┌────────────────┐
                   │ Reverse Proxy  │
                   └───────┬────────┘
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
           ┌────────────┐    ┌────────────┐
           │  FRONTEND  │    │   BACKEND  │
           │ React/Vite │    │ Express/TS │
           └────────────┘    └──────┬─────┘
                                    │
                              ┌─────▼─────┐
                              │ PostgreSQL│
                              └─────┬─────┘
                                    │
                  ┌─────────────────┼────────────────┐
                  ▼                 ▼                ▼
               Backups          Audit/Data        Storage
                                   
                                   
                       ┌─────────────────────┐
                       │ External Services   │
                       │                     │
                       │ ARCA                │
                       │ Email               │
                       │ Notifications        │
                       └─────────────────────┘
```

Con evolución futura:

```text
                         LOAD BALANCER
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
               API 1        API 2        API N
                 │            │            │
                 └────────────┼────────────┘
                              │
                            Redis
                              │
                            Queue
                              │
                           Workers
                              │
                          PostgreSQL
```

---

# 96. PRINCIPIO FINAL

La infraestructura debe ser:

```text
SEGURA
+
REPRODUCIBLE
+
OBSERVABLE
+
RECUPERABLE
+
MANTENIBLE
+
ESCALABLE
```

pero también:

```text
SIMPLE
```

para el tamaño actual del proyecto.

La arquitectura inicial recomendada es:

> **Docker + PostgreSQL + Backend Node/Express + Frontend React/Vite + Reverse Proxy + HTTPS + Backups + CI/CD**

y no una plataforma distribuida innecesariamente compleja.

El sistema debe poder crecer sin que la infraestructura se convierta en el cuello de botella, pero tampoco debe convertir un sistema multisucursal en una plataforma DevOps sobredimensionada.

---

## REGLA PARA OPENCODE

Antes de crear o modificar infraestructura, OpenCode debe verificar:

```text
1. ¿Qué ambiente estoy modificando?
2. ¿Estoy tocando producción?
3. ¿Existe backup?
4. ¿Existe migration?
5. ¿Existe rollback?
6. ¿Hay secretos involucrados?
7. ¿Estoy exponiendo algún servicio?
8. ¿Existe health check?
9. ¿El cambio está documentado?
10. ¿CI lo valida?
11. ¿El cambio rompe compatibilidad?
12. ¿Realmente necesito agregar esta tecnología?
```

Si una nueva tecnología no resuelve una necesidad concreta, **no debe agregarse automáticamente**.

El objetivo no es tener la infraestructura más compleja.

El objetivo es tener la infraestructura **más confiable que el proyecto necesita**.
