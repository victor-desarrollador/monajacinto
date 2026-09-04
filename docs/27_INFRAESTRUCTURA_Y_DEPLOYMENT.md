# 27 — INFRAESTRUCTURA Y DEPLOYMENT

## VM Digital Studio — Sistema de Gestión Multisucursal

**Versión:** 1.0
**Estado:** Diseño técnico
**Clasificación:** Arquitectura / Infraestructura / DevOps
**Prioridad:** Alta

---

# 1. OBJETIVO

Este documento define la infraestructura necesaria para ejecutar el sistema de gestión multisucursal de forma:

* segura;
* reproducible;
* escalable;
* mantenible;
* observable;
* recuperable ante fallos;
* separada entre Demo, Staging y Producción.

La infraestructura debe permitir comenzar con una instalación relativamente simple y evolucionar posteriormente sin tener que rediseñar todo el sistema.

Principio:

> **La infraestructura debe acompañar al sistema, no convertirse en una dependencia que limite su evolución.**

---

# 2. ARQUITECTURA OBJETIVO

La arquitectura objetivo será:

```text
                         INTERNET
                            │
                            ▼
                    ┌───────────────┐
                    │    DOMAIN     │
                    │   HTTPS/TLS   │
                    └───────┬───────┘
                            │
             ┌──────────────┴──────────────┐
             │                             │
             ▼                             ▼
      ┌─────────────┐              ┌─────────────┐
      │   FRONTEND  │              │     API     │
      │ React + TS   │─────────────▶│ Node/Express│
      │    Vite      │    HTTPS     │     TS      │
      └─────────────┘              └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │ PostgreSQL  │
                                   │   Prisma    │
                                   └─────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
                ARCA/Fiscal           Storage              Jobs/Queue
                Provider              Documents            (futuro)
```

---

# 3. COMPONENTES PRINCIPALES

La plataforma estará dividida en componentes independientes.

## 3.1 Frontend

Tecnología:

```text
React
TypeScript
Vite
```

Responsabilidades:

* interfaz de usuario;
* navegación;
* formularios;
* dashboards;
* POS;
* caja;
* inventario;
* depósito;
* compras;
* transferencias;
* reservas;
* préstamos;
* cambios;
* empleados;
* reportes;
* administración.

El frontend:

> **NO es la autoridad de negocio.**

No debe decidir por sí mismo:

* si una venta puede finalizar;
* si hay stock disponible;
* si un usuario puede realizar una operación;
* si una caja está abierta;
* si un descuento está permitido;
* si una transferencia puede recibirse;
* si una factura puede emitirse.

Todas estas decisiones corresponden al backend.

---

# 4. API

Tecnología objetivo:

```text
Node.js
TypeScript
Express
Prisma
```

Responsabilidades:

* autenticación;
* autorización;
* reglas de negocio;
* validación;
* transacciones;
* persistencia;
* stock;
* dinero;
* caja;
* tesorería;
* facturación;
* auditoría;
* reportes;
* integraciones.

Arquitectura:

```text
HTTP Request
     │
     ▼
Middleware
     │
     ├── Auth
     ├── Rate Limit
     ├── Validation
     ├── Scope
     └── Logging
     │
     ▼
Controller
     │
     ▼
Application Service
     │
     ▼
Domain Rules
     │
     ▼
Repository / Prisma
     │
     ▼
PostgreSQL
```

---

# 5. BASE DE DATOS

Base de datos objetivo:

```text
PostgreSQL
```

PostgreSQL será la fuente persistente principal del sistema.

Debe almacenar:

* usuarios;
* empleados;
* sucursales;
* POS;
* cajas;
* productos;
* variantes;
* inventario;
* movimientos de stock;
* proveedores;
* compras;
* recepciones;
* transferencias;
* remitos;
* ventas;
* pagos;
* reservas;
* préstamos;
* cambios;
* cuentas financieras;
* movimientos financieros;
* facturas;
* auditoría;
* configuraciones.

---

# 6. PRINCIPIO DE PERSISTENCIA

No se debe depender de información almacenada exclusivamente en:

```text
localStorage
sessionStorage
estado React
variables de memoria
```

en producción.

Estos mecanismos pueden utilizarse durante la Demo.

En producción:

```text
Frontend
   ↓
API
   ↓
PostgreSQL
```

debe ser el flujo principal.

---

# 7. DOCKER

La infraestructura debe estar preparada para Docker.

Ejemplo:

```text
docker-compose.yml
```

puede contener inicialmente:

```text
app
api
postgres
```

y posteriormente:

```text
redis
worker
```

si son necesarios.

Arquitectura futura:

```text
Docker Network
│
├── web
├── api
├── postgres
├── redis
└── worker
```

---

# 8. SEPARACIÓN DE SERVICIOS

No se debe comenzar creando microservicios innecesarios.

Arquitectura inicial recomendada:

> **Modular Monolith**

Es decir:

```text
Una API
Una aplicación backend
Una base de datos
Múltiples módulos internos
```

Ejemplo:

```text
apps/api
│
├── modules/
│   ├── auth
│   ├── users
│   ├── branches
│   ├── products
│   ├── inventory
│   ├── warehouse
│   ├── purchases
│   ├── transfers
│   ├── sales
│   ├── payments
│   ├── cash
│   ├── treasury
│   ├── reservations
│   ├── marketing-loans
│   ├── exchanges
│   ├── employees
│   ├── invoices
│   ├── reports
│   └── audit
```

Esto permite desarrollar rápidamente sin perder modularidad.

---

# 9. DOMINIOS

La aplicación deberá utilizar dominios separados.

Ejemplo:

```text
https://empresa.com
```

Frontend.

API:

```text
https://api.empresa.com
```

Esto permite separar:

```text
Frontend deployment
API deployment
Database infrastructure
```

sin modificar el modelo funcional.

---

# 10. HTTPS

Toda comunicación de producción debe utilizar HTTPS.

Nunca se debe ejecutar el sistema productivo con:

```text
http://
```

para operaciones que transmitan:

* credenciales;
* información de clientes;
* empleados;
* ventas;
* pagos;
* información financiera;
* tokens;
* sesiones.

Arquitectura:

```text
Browser
   │
 HTTPS
   ▼
Reverse Proxy / CDN
   │
 HTTPS
   ▼
API
```

---

# 11. CERTIFICADOS TLS

La infraestructura debe encargarse de:

* emisión;
* renovación;
* validación;
* configuración;

de certificados TLS.

La aplicación no debe gestionar manualmente certificados dentro del código.

---

# 12. VARIABLES DE ENTORNO

Nunca almacenar secretos directamente en:

```text
Git
frontend
source code
Dockerfile
README
```

Ejemplo:

```env
NODE_ENV=production

DATABASE_URL=...

JWT_SECRET=...

ARCA_CERTIFICATE=...

ARCA_PRIVATE_KEY=...

ARCA_CUIT=...

CORS_ORIGIN=...

REDIS_URL=...
```

Los valores reales deben existir únicamente en el entorno correspondiente.

---

# 13. ARCHIVO `.env.example`

El repositorio debe contener:

```text
.env.example
```

pero nunca:

```text
.env
```

con credenciales reales.

Ejemplo:

```env
NODE_ENV=
DATABASE_URL=
JWT_SECRET=
CORS_ORIGIN=

ARCA_ENVIRONMENT=
ARCA_CUIT=
ARCA_CERTIFICATE=
ARCA_PRIVATE_KEY=

REDIS_URL=
STORAGE_BUCKET=
```

---

# 14. ENTORNOS

Debe existir una separación conceptual entre:

```text
DEVELOPMENT
STAGING
PRODUCTION
```

Y durante el desarrollo inicial:

```text
DEMO
```

---

# 15. DEVELOPMENT

Uso:

* desarrollo local;
* pruebas;
* debugging;
* migraciones;
* experimentación.

Puede utilizar:

```text
localhost
Docker
PostgreSQL local
datos seed
ARCA simulada
```

---

# 16. DEMO

La Demo tiene como objetivo:

> Validar el producto con el cliente.

No es producción.

Puede utilizar:

```text
React
Mock API
localStorage
datos simulados
facturación simulada
```

Pero debe respetar la arquitectura conceptual definitiva.

Debe mostrar claramente:

```text
MODO DEMO
```

y en comprobantes:

```text
COMPROBANTE DEMOSTRATIVO
SIN VALIDEZ FISCAL
```

---

# 17. STAGING

Staging debe representar lo más fielmente posible Producción.

Debe utilizar:

```text
Frontend real
API real
PostgreSQL real
migraciones reales
autenticación real
roles reales
integraciones sandbox/simuladas
```

Su objetivo:

> Detectar problemas antes de afectar Producción.

---

# 18. PRODUCTION

Producción contiene:

```text
Datos reales
Usuarios reales
Ventas reales
Stock real
Dinero real
Facturación real
Auditoría real
```

Por eso debe tener controles adicionales.

---

# 19. REGLA FUNDAMENTAL DE ENTORNOS

Nunca mezclar:

```text
Demo → Producción
Staging → Producción
Development → Producción
```

especialmente:

```text
credenciales ARCA
DATABASE_URL
JWT_SECRET
tokens
webhooks
claves privadas
```

---

# 20. DATABASE MIGRATIONS

Las modificaciones de estructura deben realizarse mediante migraciones.

Ejemplo:

```text
prisma migrate
```

Nunca modificar manualmente tablas productivas como método habitual.

Flujo:

```text
Schema change
      ↓
Migration
      ↓
Review
      ↓
Staging
      ↓
Backup
      ↓
Production
```

---

# 21. SEED

El sistema debe tener datos iniciales reproducibles.

Ejemplo:

```text
seed.ts
```

Puede crear:

```text
Empresa Demo
Sucursal Centro
Sucursal Norte
Sucursal Sur

Caja Centro
Caja Norte
Caja Sur

POS-01
POS-02
POS-03

Usuarios demo

Productos demo
Variantes demo

Proveedor demo
Clientes demo
```

Los seeds de Demo/Staging no deben utilizar datos reales.

---

# 22. BACKUPS

La base de datos debe tener backups periódicos.

Como mínimo debe contemplarse:

```text
Backup automático
Backup manual
Retención
Verificación
Restauración
```

Un backup que nunca fue restaurado/testeado no debe considerarse una estrategia completa de recuperación.

Principio:

> **Backup sin prueba de restore = backup no validado.**

---

# 23. ESTRATEGIA DE BACKUP

Conceptualmente:

```text
PostgreSQL
     │
     ├── Backup diario
     │
     ├── Backup periódico adicional
     │
     └── Backup antes de cambios críticos
```

Los backups deben almacenarse fuera de la misma instancia física cuando sea posible.

---

# 24. RESTORE

Debe existir un procedimiento documentado:

```text
Detectar incidente
       ↓
Aislar sistema
       ↓
Determinar backup válido
       ↓
Restaurar
       ↓
Validar integridad
       ↓
Reabrir servicio
```

Debe existir documentación para que otra persona pueda ejecutar el procedimiento.

---

# 25. DISASTER RECOVERY

Se debe definir posteriormente:

```text
RPO
RTO
```

### RPO

Cuánta información se acepta perder.

Ejemplo:

```text
RPO = 24 horas
```

significaría que potencialmente se podría perder hasta un día de información.

### RTO

Cuánto tiempo puede tardar la recuperación.

Ejemplo:

```text
RTO = 4 horas
```

Estos valores deben acordarse según las necesidades reales del cliente.

No deben inventarse durante la implementación.

---

# 26. STORAGE

Documentos como:

* comprobantes;
* remitos;
* etiquetas;
* archivos;
* imágenes de productos;
* documentos de proveedores;

no deberían depender indefinidamente del filesystem local del servidor.

Arquitectura futura:

```text
Application
     │
     ▼
Storage abstraction
     │
     ▼
Object Storage
```

Esto permite cambiar posteriormente de proveedor sin modificar los módulos de negocio.

---

# 27. LOGS

La aplicación debe producir logs estructurados.

Ejemplo:

```json
{
  "level": "info",
  "event": "sale.finalized",
  "operationId": "OP-12345",
  "userId": "USR-10",
  "branchId": "BR-01",
  "saleId": "SALE-10023"
}
```

Los logs deben ayudar a diagnosticar:

* errores;
* excepciones;
* lentitud;
* fallos de integración;
* autenticación;
* operaciones críticas.

---

# 28. AUDITORÍA ≠ LOG

No confundir:

```text
Application Log
```

con:

```text
Audit Log
```

Los logs ayudan a operar técnicamente el sistema.

La auditoría demuestra qué ocurrió desde el punto de vista del negocio.

Ejemplo:

```text
LOG:
POST /sales/123/finalize → 200

AUDIT:
Usuario Juan finalizó venta SALE-123
Sucursal Centro
Caja CAJA-01
Monto $125.000
Fecha/hora
Métodos de pago
```

---

# 29. HEALTH CHECK

La API debe tener un endpoint de salud.

Ejemplo:

```text
GET /health
```

Debe poder determinar:

```text
API funcionando
Database disponible
Dependencias críticas disponibles
```

Puede existir además:

```text
GET /ready
```

para readiness.

---

# 30. MONITOREO

Producción debe permitir detectar:

* API caída;
* database caída;
* errores elevados;
* latencia elevada;
* falta de espacio;
* consumo excesivo de memoria;
* problemas de almacenamiento;
* errores ARCA;
* fallos de jobs.

No es necesario implementar observabilidad avanzada durante la Demo.

---

# 31. REVERSE PROXY

La API no debería quedar directamente expuesta sin protección.

Arquitectura:

```text
Internet
   ↓
DNS
   ↓
Reverse Proxy / CDN
   ↓
API
```

El reverse proxy puede encargarse de:

* TLS;
* routing;
* headers;
* rate limiting;
* protección adicional;
* compresión;
* terminación HTTPS.

---

# 32. FRONTEND DEPLOYMENT

El frontend es principalmente estático.

Por lo tanto puede desplegarse mediante una plataforma de hosting/CDN.

Ejemplo conceptual:

```text
Git
 ↓
CI/CD
 ↓
Build
 ↓
Static deployment
 ↓
CDN
```

El frontend no debe contener secretos.

---

# 33. API DEPLOYMENT

La API puede ejecutarse como:

```text
Docker container
```

Ejemplo:

```text
api:
  image: vmgs-api
  restart: unless-stopped
```

La API debe ser stateless siempre que sea posible.

La sesión/autenticación no debe depender de memoria local de una instancia específica si posteriormente se escala horizontalmente.

---

# 34. POSTGRESQL DEPLOYMENT

PostgreSQL puede comenzar en una instancia administrada o servidor dedicado según el presupuesto y necesidades del cliente.

Debe priorizarse:

```text
Persistencia
Backup
Restore
Seguridad
Actualizaciones
Monitorización
```

por encima de simplemente “tener PostgreSQL funcionando”.

---

# 35. RED

Separar conceptualmente:

```text
Public
Private
Database
```

La base de datos no debería estar directamente expuesta a Internet.

Idealmente:

```text
Internet
   │
   ▼
Frontend/API
   │
   ▼
Private Network
   │
   ▼
PostgreSQL
```

---

# 36. FIREWALL

Solo deben exponerse los puertos estrictamente necesarios.

Ejemplo conceptual:

```text
80/443 → Web
SSH    → Administración restringida
5432   → NO público
```

Los valores exactos dependerán del proveedor y arquitectura final.

---

# 37. SSH

La administración del servidor debe utilizar:

* claves SSH;
* usuarios individuales;
* mínimo privilegio;
* deshabilitación de accesos innecesarios;
* registro de accesos.

No se debe compartir una cuenta administrativa entre todo el equipo.

---

# 38. CI/CD

El flujo recomendado:

```text
Developer
    │
    ▼
Git Push
    │
    ▼
CI
    │
    ├── Lint
    ├── Typecheck
    ├── Tests
    ├── Build
    └── Security checks
    │
    ▼
Staging
    │
    ▼
Validation
    │
    ▼
Production
```

---

# 39. BRANCHING

Una estrategia simple puede utilizar:

```text
main
develop
feature/*
fix/*
```

No es necesario imponer una metodología compleja si el equipo inicial es pequeño.

Lo importante es que:

```text
main
```

represente código potencialmente desplegable.

---

# 40. DEPLOYMENT AUTOMÁTICO

No todo cambio debe ir automáticamente a producción.

Recomendación:

```text
Pull Request
     ↓
CI
     ↓
Review
     ↓
Merge
     ↓
Staging
     ↓
Validation
     ↓
Production approval
     ↓
Deploy
```

Para operaciones financieras y fiscales, este control es especialmente importante.

---

# 41. ROLLBACK

Todo deployment debe tener una estrategia de rollback.

Ejemplo:

```text
Production v1.8
      ↓
Deploy v1.9
      ↓
Error
      ↓
Rollback
      ↓
Production v1.8
```

Pero:

> **Rollback de código ≠ rollback de datos.**

Una migración de base de datos debe diseñarse cuidadosamente porque no siempre puede revertirse simplemente volviendo al código anterior.

---

# 42. ZERO-DOWNTIME

No es un requisito inicial de la Demo.

Para Producción puede evaluarse posteriormente.

Especialmente si el negocio necesita operar durante:

* horarios comerciales;
* promociones;
* eventos;
* temporadas de alta demanda.

---

# 43. ESCALABILIDAD

La primera versión no necesita Kubernetes.

Arquitectura razonable:

```text
1 Frontend
1 API
1 PostgreSQL
```

Posteriormente:

```text
CDN
   │
   ▼
Load Balancer
   │
   ├── API #1
   ├── API #2
   └── API #3
        │
        ▼
      Redis
        │
        ▼
    PostgreSQL
```

La arquitectura debe permitir llegar allí sin necesidad de reescribir el dominio.

---

# 44. REDIS

Redis es opcional.

No debe instalarse simplemente porque “una aplicación empresarial necesita Redis”.

Podrá utilizarse posteriormente para:

* cache;
* rate limiting distribuido;
* sesiones;
* locks distribuidos;
* jobs;
* colas;
* realtime;
* procesamiento asíncrono.

Durante la Demo:

> Redis NO es obligatorio.

---

# 45. WORKERS

Algunas tareas no deberían bloquear una request HTTP.

Ejemplos futuros:

```text
Generación de reportes grandes
Exportaciones XLSX
Procesamiento de documentos
Notificaciones
Sincronizaciones
Procesamiento fiscal
Jobs periódicos
```

Arquitectura futura:

```text
API
 │
 ▼
Queue
 │
 ▼
Worker
 │
 ▼
Task
```

---

# 46. ARCA

La integración fiscal debe permanecer aislada.

```text
Application
     │
     ▼
FiscalProvider
     │
     ▼
ARCAAdapter
     │
     ▼
WSFEv1
```

La infraestructura debe permitir separar:

```text
ARCA DEMO / TEST
```

de:

```text
ARCA PRODUCCIÓN
```

Nunca deben compartirse credenciales o certificados entre ambientes.

---

# 47. DOMINIOS Y DNS

La infraestructura puede utilizar una estructura como:

```text
empresa.com
www.empresa.com
api.empresa.com
```

Opcionalmente:

```text
admin.empresa.com
staging.empresa.com
api-staging.empresa.com
```

Los dominios exactos se definirán con el cliente.

---

# 48. CORS

La API debe aceptar requests únicamente desde orígenes autorizados.

Ejemplo conceptual:

```text
Production:
https://empresa.com

Staging:
https://staging.empresa.com
```

No utilizar:

```text
*
```

como configuración permanente de Producción cuando no sea necesario.

---

# 49. RATE LIMITING

Debe aplicarse especialmente a:

```text
login
password reset
public endpoints
webhooks
ARCA-related endpoints
```

El objetivo es evitar abuso y reducir impacto de ataques automatizados.

---

# 50. DEPLOYMENT DE DEMO

Para la semana de Demo:

```text
Frontend
   ↓
Deployment sencillo

Backend
   ↓
Mock / API simplificada

Database
   ↓
Opcional

ARCA
   ↓
Simulada
```

El objetivo es velocidad de validación.

No se debe gastar tiempo configurando una infraestructura empresarial completa antes de saber si el cliente aprueba el producto.

---

# 51. DEPLOYMENT DE PRODUCCIÓN

Una vez aprobado el sistema:

```text
Frontend
       ↓
Production deployment

API
       ↓
Docker

PostgreSQL
       ↓
Production DB

Backup
       ↓
Automated

Monitoring
       ↓
Enabled

HTTPS
       ↓
Mandatory

ARCA
       ↓
Production credentials

Audit
       ↓
Enabled
```

---

# 52. MATRIZ DEMO VS PRODUCCIÓN

| Componente | Demo                  | Producción                 |
| ---------- | --------------------- | -------------------------- |
| Frontend   | React/Vite            | React/Vite                 |
| Backend    | Mock/API simplificada | Node/Express               |
| PostgreSQL | Opcional              | Obligatorio                |
| Prisma     | Opcional              | Sí                         |
| Redis      | No                    | Según necesidad            |
| Docker     | Opcional              | Recomendado                |
| HTTPS      | Sí                    | Obligatorio                |
| ARCA       | Simulada              | Real                       |
| Backup     | No crítico            | Obligatorio                |
| Monitoring | Básico                | Sí                         |
| Audit      | Simulada              | Real                       |
| CI/CD      | Básico                | Sí                         |
| Secrets    | Demo                  | Secret management          |
| Storage    | Local                 | Object Storage recomendado |
| Rollback   | Simple                | Planificado                |
| Restore    | No crítico            | Obligatorio probar         |

---

# 53. ESTRUCTURA DEL REPOSITORIO

La infraestructura puede quedar organizada:

```text
project/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── types/
│   ├── validation/
│   ├── config/
│   └── ui/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── infra/
│   ├── docker/
│   ├── nginx/
│   ├── scripts/
│   ├── backup/
│   └── deployment/
│
├── tests/
│
├── docs/
│
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

---

# 54. CONFIGURACIÓN CENTRALIZADA

Las configuraciones deben validarse al iniciar la aplicación.

Ejemplo conceptual:

```text
DATABASE_URL       required
JWT_SECRET         required
CORS_ORIGIN        required
ARCA_ENVIRONMENT   required
```

Si falta una variable crítica:

```text
Application startup
       ↓
Configuration validation
       ↓
ERROR
       ↓
Application does not start
```

Es preferible fallar temprano que ejecutar el sistema con una configuración incompleta.

---

# 55. SEGURIDAD DE PRODUCCIÓN

Antes de desplegar:

```text
HTTPS
Firewall
Secrets
CORS
Rate limiting
Headers
Authentication
RBAC
Database permissions
Backups
Audit
Logs
Monitoring
```

deben estar revisados.

---

# 56. ACTUALIZACIONES

Debe existir una política para actualizar:

* Node.js;
* dependencias;
* Docker images;
* PostgreSQL;
* sistema operativo;
* certificados;
* librerías de seguridad.

No actualizar directamente en Producción sin probar primero cuando el cambio pueda afectar compatibilidad.

---

# 57. DEPENDENCIAS

Antes de cada release:

```text
npm audit
```

y herramientas equivalentes deben formar parte de la estrategia de seguridad.

No significa aceptar automáticamente cualquier actualización.

Cada actualización debe evaluarse según:

```text
security
compatibility
breaking changes
business impact
```

---

# 58. OBSERVABILIDAD MÍNIMA

Producción debe permitir responder:

### ¿Está funcionando?

```text
Health check
```

### ¿Está lento?

```text
Latency
```

### ¿Está fallando?

```text
Error rate
```

### ¿Qué operación falló?

```text
operationId
requestId
```

### ¿Qué usuario la ejecutó?

```text
AuditLog
```

### ¿Qué ocurrió con el dinero/stock?

```text
FinancialMovement
StockMovement
```

---

# 59. IDENTIFICADORES DE CORRELACIÓN

Cada operación importante debe poder seguirse mediante:

```text
requestId
operationId
```

Ejemplo:

```text
requestId = REQ-123
operationId = OP-456
saleId = SALE-100
paymentId = PAY-100
invoiceId = INV-100
```

Esto permite reconstruir el recorrido completo de una operación.

---

# 60. PRINCIPIO DE FALLA SEGURA

Cuando una dependencia crítica falla:

```text
ARCA unavailable
Database unavailable
Payment integration unavailable
Storage unavailable
```

el sistema debe evitar estados inconsistentes.

Ejemplo:

No permitir:

```text
Venta marcada como PAID
```

si realmente no se registró correctamente el pago.

No permitir:

```text
Stock descontado
```

si la operación comercial no quedó correctamente persistida.

Esto se logra mediante:

```text
Transactions
Idempotency
State machines
Compensating operations
```

---

# 61. DEPLOYMENT Y OPERACIONES CRÍTICAS

Las siguientes operaciones requieren especial cuidado:

```text
Migraciones DB
Cambios de esquema
Cambios ARCA
Cambios de autenticación
Cambios financieros
Cambios de stock
Cambios de permisos
```

Deben pasar por:

```text
Development
   ↓
Tests
   ↓
Staging
   ↓
Backup
   ↓
Production
```

cuando corresponda.

---

# 62. CHECKLIST PRE-PRODUCCIÓN

## Infraestructura

* [ ] Dominio configurado
* [ ] DNS configurado
* [ ] HTTPS funcionando
* [ ] Reverse proxy configurado
* [ ] Firewall configurado
* [ ] PostgreSQL protegido
* [ ] Backups configurados
* [ ] Restore probado
* [ ] Logs activos
* [ ] Health check funcionando

## Aplicación

* [ ] Build exitoso
* [ ] Typecheck exitoso
* [ ] Tests críticos exitosos
* [ ] Variables de entorno verificadas
* [ ] CORS configurado
* [ ] Rate limiting activo
* [ ] RBAC probado
* [ ] Auditoría activa

## Fiscal

* [ ] Ambiente ARCA correcto
* [ ] Credenciales correctas
* [ ] Certificados correctos
* [ ] Punto de venta configurado
* [ ] Contingencia definida

## Datos

* [ ] Migraciones aplicadas
* [ ] Índices verificados
* [ ] Seed no contiene datos de Demo
* [ ] Datos iniciales validados

---

# 63. DEFINITION OF DONE — INFRAESTRUCTURA

Este módulo se considera terminado cuando:

* [ ] existe arquitectura de deployment definida;
* [ ] Demo puede desplegarse rápidamente;
* [ ] Production tiene arquitectura separada;
* [ ] PostgreSQL está protegido;
* [ ] HTTPS está definido;
* [ ] secrets están separados;
* [ ] backups están definidos;
* [ ] restore está documentado;
* [ ] CI/CD está definido;
* [ ] rollback está definido;
* [ ] health checks existen;
* [ ] logs existen;
* [ ] auditoría existe;
* [ ] ARCA está aislada por ambiente;
* [ ] no existen credenciales productivas en Git;
* [ ] el deployment puede reproducirse.

---

# 64. REGLAS NO NEGOCIABLES

### Regla 1

> Nunca guardar secretos productivos en Git.

### Regla 2

> Nunca exponer PostgreSQL directamente a Internet sin una justificación y protección explícitas.

### Regla 3

> Demo, Staging y Producción deben estar separados.

### Regla 4

> Backup y restore forman una única estrategia.

### Regla 5

> Rollback de código no implica rollback de datos.

### Regla 6

> El frontend nunca es autoridad de negocio.

### Regla 7

> Las credenciales ARCA de Producción nunca deben utilizarse en Demo.

### Regla 8

> No introducir Redis, Kubernetes o microservicios sin una necesidad concreta.

### Regla 9

> La infraestructura debe poder evolucionar sin modificar las reglas centrales del dominio.

### Regla 10

> Una operación financiera o de stock nunca debe depender exclusivamente de memoria de la aplicación.

---

# 65. ARQUITECTURA FINAL RESUMIDA

```text
                         INTERNET
                            │
                            ▼
                    ┌───────────────┐
                    │ DNS / HTTPS   │
                    └───────┬───────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
          ┌─────────────┐       ┌─────────────┐
          │  React/Vite │       │ Reverse     │
          │   Frontend  │       │ Proxy/CDN   │
          └─────────────┘       └──────┬──────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │ Node/Express│
                                │     API     │
                                └──────┬──────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
               PostgreSQL          Storage             Queue
                    │                                    │
                    │                                    ▼
                    │                                  Worker
                    │
                    ├── Stock
                    ├── Sales
                    ├── Payments
                    ├── Cash
                    ├── Treasury
                    ├── Reservations
                    ├── Transfers
                    ├── Purchases
                    ├── Employees
                    ├── Invoices
                    └── Audit
                                       │
                                       ▼
                                  FiscalProvider
                                       │
                                       ▼
                                  ARCA Adapter
                                       │
                                       ▼
                                     WSFEv1
```

---

# 66. PRINCIPIO ARQUITECTÓNICO FINAL

La infraestructura completa debe respetar esta cadena:

```text
Usuario
   ↓
Frontend
   ↓
API
   ↓
Reglas de negocio
   ↓
Transacción
   ↓
PostgreSQL
   ↓
Movimientos
   ↓
Auditoría
   ↓
Observabilidad
   ↓
Backup
```

La infraestructura no debe modificar las reglas del negocio.

Debe proporcionar el entorno necesario para que esas reglas puedan ejecutarse de forma segura, persistente y recuperable.

> **Frontend muestra.
> API decide.
> PostgreSQL persiste.
> Movimientos explican.
> Auditoría demuestra.
> Infraestructura protege y mantiene disponible.**

---

# 67. ESTADO DEL BLUEPRINT

Con este módulo quedan definidos:

```text
19 — Facturación ARCA
20 — Reportes y Exportaciones
21 — Auditoría y Trazabilidad
22 — Reglas de Negocio
23 — Estados y Transiciones
24 — Modelo de Datos
25 — Arquitectura Técnica
26 — Seguridad
27 — Infraestructura y Deployment
```

El siguiente módulo lógico es:

```text
28 — TESTING Y QUALITY ASSURANCE
```

que definirá la estrategia de pruebas unitarias, integración, API, flujos completos, pruebas de stock/dinero, concurrencia, regresión, Demo y criterios de aceptación.
