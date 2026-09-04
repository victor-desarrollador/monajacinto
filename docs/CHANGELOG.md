# CHANGELOG.md

# VM Digital Studio — Sistema de Gestión Multisucursal

Historial oficial de cambios, decisiones y evolución del proyecto.

---

## Formato

Este proyecto utiliza una estructura inspirada en **Keep a Changelog**.

Las categorías principales son:

* **Added** — funcionalidades o componentes nuevos.
* **Changed** — cambios en funcionalidades existentes.
* **Fixed** — correcciones.
* **Security** — cambios relacionados con seguridad.
* **Infrastructure** — cambios de infraestructura/deployment.
* **Architecture** — decisiones o modificaciones arquitectónicas.
* **Documentation** — documentación nueva o actualizada.
* **Testing** — cambios relacionados con QA y pruebas.
* **Fiscal** — cambios relacionados con facturación y normativa fiscal.

---

# [Unreleased]

Estado actual del proyecto.

## Added

### Documentación funcional

Se definió la especificación integral del sistema mediante 28 módulos:

1. `01_VISION_Y_ALCANCE.md`
2. `02_ROLES_Y_PERMISOS.md`
3. `03_EMPRESA_SUCURSALES_Y_POS.md`
4. `04_PRODUCTOS_VARIANTES_Y_PRECIOS.md`
5. `05_INVENTARIO_Y_STOCK.md`
6. `06_DEPOSITO.md`
7. `07_COMPRAS_Y_PROVEEDORES.md`
8. `08_TRANSFERENCIAS_Y_REMITOS.md`
9. `09_VENTAS_Y_POS.md`
10. `10_CAJAS_Y_ARQUEOS.md`
11. `11_TESORERIA_Y_CAJA_MAYOR.md`
12. `12_CUENTAS_FINANCIERAS.md`
13. `13_PAGOS_Y_MOVIMIENTOS_DINERO.md`
14. `14_RESERVAS_Y_SEÑAS.md`
15. `15_PRESTAMOS_PUBLICIDAD.md`
16. `16_CAMBIOS_Y_DEVOLUCIONES.md`
17. `17_EMPLEADOS_Y_SUELDOS.md`
18. `18_VENTAS_DE_EMPLEADOS.md`
19. `19_FACTURACION_ARCA.md`
20. `20_REPORTES_Y_EXPORTACIONES.md`
21. `21_AUDITORIA_Y_TRAZABILIDAD.md`
22. `22_REGLAS_DE_NEGOCIO.md`
23. `23_ESTADOS_Y_TRANSICIONES.md`
24. `24_MODELO_DE_DATOS.md`
25. `25_ARQUITECTURA_TECNICA.md`
26. `26_SEGURIDAD.md`
27. `27_INFRAESTRUCTURA_Y_DEPLOYMENT.md`
28. `28_TESTING_QA_Y_DEFINITION_OF_DONE.md`

### AI Engineering

Se agregó:

```text
AGENTS.md
```

como contrato operativo para agentes de IA que trabajen sobre el repositorio.

Define:

* arquitectura;
* reglas de negocio críticas;
* seguridad;
* stock;
* dinero;
* estados;
* auditoría;
* testing;
* deployment;
* reglas para OpenCode;
* Definition of Done;
* restricciones contra sobreingeniería.

---

# Arquitectura del sistema

Se estableció como arquitectura objetivo un **modular monolith**.

```text
React + TypeScript + Vite
            ↓
          HTTPS
            ↓
Node.js + Express + TypeScript
            ↓
        Business Services
            ↓
          Prisma
            ↓
       PostgreSQL
```

La arquitectura prioriza:

* simplicidad;
* modularidad;
* seguridad;
* consistencia;
* trazabilidad;
* mantenibilidad;
* escalabilidad progresiva.

No se adopta microservicios como arquitectura inicial.

---

# Frontend

Arquitectura objetivo:

```text
React
TypeScript
Vite
```

El frontend es responsable de:

* interfaz;
* navegación;
* formularios;
* UX;
* validaciones de experiencia de usuario;
* presentación de estados;
* interacción con la API.

Las reglas críticas permanecen en backend.

---

# Backend

Arquitectura:

```text
Routes
 ↓
Controllers
 ↓
Validation
 ↓
Services
 ↓
Domain Logic
 ↓
Repositories
 ↓
Prisma
 ↓
PostgreSQL
```

El backend es la autoridad para:

* permisos;
* stock;
* precios;
* descuentos;
* pagos;
* estados;
* dinero;
* facturación;
* operaciones críticas.

---

# Base de datos

Se estableció:

```text
PostgreSQL
+
Prisma ORM
```

como persistencia principal.

El modelo contempla:

* empresa;
* sucursales;
* POS;
* cajas;
* usuarios;
* empleados;
* depósitos;
* productos;
* variantes;
* precios;
* inventario;
* movimientos de stock;
* proveedores;
* compras;
* recepciones;
* transferencias;
* remitos;
* clientes;
* ventas;
* pagos;
* cuentas financieras;
* movimientos financieros;
* tesorería;
* reservas;
* préstamos de publicidad;
* cambios y devoluciones;
* sueldos;
* ventas de empleados;
* facturación;
* auditoría.

---

# Stock

Se estableció como principio fundamental:

> **El stock no se edita; el stock cambia mediante movimientos trazables.**

Se definieron conceptos:

```text
Physical Stock
Reserved Stock
Available Stock
In-Transit Stock
```

y movimientos como:

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

Se estableció que el stock negativo debe estar prohibido por defecto.

---

# POS y Caja

Se estableció una separación estricta:

```text
POS ≠ Caja
```

Modelo operativo:

```text
Vendedor
 ↓
POS
 ↓
Venta
 ↓
PENDING_PAYMENT
 ↓
Cajero
 ↓
Pago
 ↓
PAID
 ↓
COMPLETED
```

Cada sucursal posee:

```text
1 Caja
+
2–3 POS
```

El vendedor no realiza el cierre de caja.

El cajero es responsable del cobro y arqueo.

---

# Tesorería

Se estableció una separación entre:

```text
Venta
Pago
Caja
Cuenta financiera
Movimiento financiero
Tesorería
```

Los balances no deben ser editados manualmente como fuente de verdad.

Los cambios monetarios deben estar respaldados por movimientos financieros trazables.

---

# Cuentas financieras

Se definieron cuentas como:

```text
CASH
BANK
DIGITAL_WALLET
VALUES
VIRTUAL
OTHER
```

Ejemplos:

```text
Caja Sucursal Centro
Banco Macro
Banco Galicia
Mercado Pago
Cheques
```

Se estableció que:

```text
paymentMethod ≠ financialAccount
```

Una transferencia puede utilizar una cuenta financiera bancaria específica.

Un QR puede impactar en una billetera digital específica.

---

# Pagos

Se definieron métodos:

```text
EFECTIVO
TRANSFERENCIA
QR
DEBITO
CREDITO
CHEQUE
OTRO
```

Se soportan pagos combinados.

Regla:

```text
SUM(payments) = sale total
```

cuando la venta requiera pago completo.

Se contemplan además:

* vuelto;
* pagos parciales;
* transferencias;
* tarjetas;
* cheques;
* señas;
* devoluciones;
* pagos a proveedores;
* gastos;
* retiros;
* depósitos;
* transferencias internas.

---

# Reservas y señas

Se estableció la separación:

```text
Reserva ≠ Venta
Seña ≠ Venta
```

Una reserva compromete stock.

La seña representa un anticipo monetario.

Al retirar:

```text
Reservation
 ↓
Sale
 ↓
Payment application
 ↓
Stock exit
```

Debe evitarse el doble cobro y el doble movimiento de stock.

---

# Préstamos de publicidad

Se incorporó el concepto de préstamo de productos para:

* fotografía;
* campañas;
* publicidad;
* redes sociales;
* contenido.

El producto puede salir temporalmente del inventario disponible sin convertirse automáticamente en venta.

Se contemplan estados:

```text
DELIVERED
RETURN_PENDING
RETURNED
DAMAGED
MISSING
SOLD
```

---

# Cambios y devoluciones

Se estableció que la venta original nunca debe sobrescribirse.

Los cambios y devoluciones generan nuevas operaciones relacionadas.

Ejemplo:

```text
Original Sale
     ↓
ReturnExchange
     ↓
Compensating Stock/Financial Movements
```

Se contemplan:

* cambios de talle;
* cambios de color;
* devoluciones;
* defectos;
* diferencias de precio;
* reintegros;
* ingreso/salida de stock;
* autorización.

---

# Empleados

Se estableció separación conceptual:

```text
User
Employee
Salary
FinancialMovement
```

Los empleados pueden tener:

* salario;
* historial salarial;
* bonos;
* descuentos;
* adelantos;
* compras internas.

---

# Ventas de empleados

Una venta a empleado continúa siendo una venta:

```text
Sale.saleType = EMPLOYEE
```

Puede utilizar:

* precio empleado;
* descuento autorizado;
* pago inmediato;
* cuenta/deuda;
* descuento posterior según política.

El stock se descuenta mediante el mismo mecanismo de una venta normal.

---

# Facturación ARCA

Se estableció una arquitectura desacoplada:

```text
Sale
 ↓
FiscalProvider
 ↓
ARCAAdapter
 ↓
WSFEv1
```

La integración fiscal no debe estar acoplada directamente a toda la aplicación.

Durante la demo se utilizará:

```text
MockFiscalProvider
```

No se utilizará facturación fiscal real en la demo.

Los comprobantes de demostración deben identificarse como:

```text
CAE DEMO / SIMULADO
COMPROBANTE DEMOSTRATIVO
SIN VALIDEZ FISCAL
```

---

# Auditoría

Se estableció una política de trazabilidad para operaciones críticas.

La auditoría debe permitir determinar:

```text
WHO
WHAT
WHEN
WHERE
WHY
REFERENCE
OPERATION
```

Las operaciones históricas no deben eliminarse para ocultar errores.

---

# Estados y transiciones

Se establecieron máquinas de estado para las principales entidades.

Las transiciones deben:

* ser explícitas;
* validarse en backend;
* respetar reglas de negocio;
* ser auditables;
* ser idempotentes cuando corresponda;
* ejecutarse dentro de transacciones cuando sea necesario.

No se permite cambiar estados arbitrariamente desde frontend.

---

# Seguridad

Se establecieron como principios:

```text
Deny by default
Least privilege
Backend authority
Separation of duties
Company scope
Branch scope
Resource authorization
```

Se contemplan:

* autenticación;
* RBAC;
* protección contra IDOR;
* validación runtime;
* CORS;
* CSRF;
* XSS;
* rate limiting;
* HTTPS;
* secrets;
* protección de credenciales ARCA;
* auditoría de eventos de seguridad;
* idempotencia;
* concurrencia;
* transacciones;
* seguridad de archivos;
* protección de webhooks.

---

# Infraestructura

Arquitectura objetivo:

```text
Internet
   ↓
HTTPS
   ↓
Reverse Proxy
   ↓
Frontend / API
   ↓
PostgreSQL
```

Se definieron ambientes separados:

```text
development
demo
staging
production
```

Se contempla:

* Docker;
* PostgreSQL;
* reverse proxy;
* TLS;
* backups;
* restore;
* health checks;
* logging;
* monitoring;
* CI/CD;
* rollback;
* secrets;
* firewall;
* aislamiento fiscal.

No se requiere Kubernetes para la primera arquitectura productiva.

---

# Demo

Se estableció que la demo tiene como objetivo:

```text
validar requisitos
+
demostrar flujo
+
detectar cambios
+
obtener aprobación
```

La demo no representa una producción completa.

Durante la semana inicial se prioriza:

```text
70–80%
del núcleo operativo
```

antes que implementar toda la infraestructura definitiva.

---

# Testing y QA

Se estableció una estrategia integral de pruebas:

```text
Unit
Integration
E2E
Security
Concurrency
Idempotency
Regression
Business Acceptance
```

Las operaciones críticas deben tener cobertura reforzada.

El sistema no se considera terminado simplemente porque:

```text
compila
```

o:

```text
la interfaz funciona
```

---

# Definition of Done

Una funcionalidad se considera terminada cuando corresponda:

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

---

# Principios globales

## 1. Stock

> El stock no se edita; se transforma mediante movimientos trazables.

## 2. Dinero

> El dinero se controla mediante movimientos financieros, no mediante balances editables.

## 3. Seguridad

> El frontend nunca es la autoridad.

## 4. Historial

> Las operaciones históricas no se borran para corregir errores.

## 5. Estados

> Las transiciones son operaciones de negocio, no simples cambios de strings.

## 6. Auditoría

> Toda operación crítica debe poder reconstruirse.

## 7. Arquitectura

> La complejidad debe introducirse solamente cuando exista una necesidad real.

## 8. Testing

> No se declara una funcionalidad terminada sin evidencia de validación apropiada.

---

# Decisiones arquitectónicas importantes

### Modular Monolith

Se decidió comenzar con un monolito modular en lugar de microservicios.

### PostgreSQL

Se estableció PostgreSQL como fuente principal de persistencia.

### Prisma

Se utilizará Prisma como ORM.

### React + TypeScript + Vite

Frontend objetivo.

### Node.js + Express + TypeScript

Backend objetivo.

### ARCA desacoplado

Fiscalidad mediante provider/adapter.

### Redis opcional

No forma parte obligatoria de la arquitectura inicial.

### WebSockets opcionales

Solo introducirlos cuando exista una necesidad real de tiempo real.

### Kubernetes descartado inicialmente

No se considera necesario para la primera versión productiva.

---

# Convenciones para agentes de IA

`AGENTS.md` establece las reglas para agentes como OpenCode.

Los agentes deben:

* leer documentación antes de modificar código;
* respetar las reglas de negocio;
* no inventar reglas;
* validar permisos en backend;
* proteger stock y dinero;
* considerar concurrencia;
* considerar idempotencia;
* generar auditoría;
* agregar tests;
* ejecutar tests;
* evitar sobreingeniería;
* actualizar documentación;
* actualizar changelog.

---

# Historial de versiones

## 0.1.0 — Especificación inicial

### Added

* Definición del alcance general del sistema.
* Identificación de necesidades del negocio multisucursal.
* Concepto de sucursales.
* POS.
* Caja.
* Depósito.
* Inventario.
* Compras.
* Ventas.
* Reservas.
* Préstamos de publicidad.
* Cambios y devoluciones.
* Tesorería.
* Facturación.
* Reportes.

---

## 0.2.0 — Diseño funcional

### Added

* Roles y permisos.
* Productos y variantes.
* Precios.
* Stock.
* Compras y proveedores.
* Transferencias.
* Remitos.
* Ventas.
* Pagos.
* Cajas.
* Tesorería.
* Cuentas financieras.
* Reservas y señas.
* Préstamos de publicidad.
* Cambios y devoluciones.
* Empleados.
* Ventas de empleados.

### Changed

Se profundizó la separación entre:

```text
operación
pago
movimiento
cuenta
stock
```

---

## 0.3.0 — Fiscalidad

### Added

* Modelo de facturación.
* Integración conceptual con ARCA.
* Arquitectura `FiscalProvider`.
* Adaptador ARCA.
* Manejo conceptual de CAE.
* Separación demo/producción.
* Facturación desacoplada del dominio de ventas.

### Security

* Aislamiento de credenciales fiscales.
* Prohibición de credenciales ARCA en frontend o repositorio.

---

## 0.4.0 — Trazabilidad

### Added

* Auditoría.
* Operation ID.
* Request/correlation ID.
* Historial de operaciones.
* Compensating operations.
* Reglas de reconstrucción histórica.

### Changed

Se estableció que las operaciones históricas no deben sobrescribirse.

---

## 0.5.0 — Reglas de negocio

### Added

* Matriz de reglas.
* Máquinas de estado.
* Transiciones válidas.
* Reglas de concurrencia.
* Reglas de idempotencia.
* Reglas de integridad financiera.
* Reglas de integridad de inventario.

---

## 0.6.0 — Modelo de datos

### Added

* Modelo conceptual completo.
* Relaciones entre módulos.
* Constraints.
* Identificadores.
* Numeración documental.
* Money precision.
* Multi-branch scope.
* Integridad referencial.
* Estrategia de soft delete.

---

## 0.7.0 — Arquitectura técnica

### Added

* Arquitectura React/TypeScript/Vite.
* Arquitectura Node/Express/TypeScript.
* Prisma.
* PostgreSQL.
* Modular monolith.
* Arquitectura por features.
* Services.
* Repositories.
* API REST.
* Validación runtime.
* Integraciones desacopladas.

---

## 0.8.0 — Seguridad

### Added

* Threat model.
* Authentication.
* RBAC.
* Authorization.
* Branch/company scoping.
* IDOR protection.
* Rate limiting.
* CORS.
* CSRF.
* XSS protection.
* Security headers.
* Secrets management.
* Security logging.
* Input validation.
* Webhook security.
* Idempotency.
* Concurrency controls.

### Security

Se estableció la seguridad como requisito transversal de todos los módulos.

---

## 0.9.0 — Infraestructura

### Added

* Docker.
* PostgreSQL container.
* Backend container.
* Frontend deployment.
* Reverse proxy.
* HTTPS/TLS.
* Environment separation.
* Backup strategy.
* Restore strategy.
* Health checks.
* Logging.
* Monitoring.
* CI/CD.
* Rollback strategy.

### Architecture

Se consolidó el modelo:

```text
Frontend
 ↓
Backend
 ↓
PostgreSQL
```

como arquitectura inicial.

---

## 1.0.0 — Sistema de especificación consolidado

### Added

Se consolidaron los 28 módulos oficiales:

```text
01 → Vision
02 → Roles
03 → Empresa/Sucursales/POS
04 → Productos
05 → Inventario
06 → Depósito
07 → Compras
08 → Transferencias
09 → Ventas
10 → Cajas
11 → Tesorería
12 → Cuentas financieras
13 → Pagos
14 → Reservas
15 → Préstamos
16 → Cambios
17 → Empleados
18 → Ventas empleados
19 → ARCA
20 → Reportes
21 → Auditoría
22 → Reglas
23 → Estados
24 → Modelo de datos
25 → Arquitectura
26 → Seguridad
27 → Infraestructura
28 → Testing / QA / DoD
```

### Added

```text
AGENTS.md
CHANGELOG.md
```

### Architecture

El proyecto cuenta con una especificación funcional y técnica integral previa a la implementación productiva.

### Security

Seguridad integrada transversalmente en:

* autenticación;
* autorización;
* stock;
* dinero;
* fiscalidad;
* auditoría;
* infraestructura.

### Testing

Testing establecido como requisito de Definition of Done.

---

# Estado actual

```text
Proyecto:
Sistema de Gestión Multisucursal

Versión documental:
1.0.0

Módulos:
28

Estado:
Especificación consolidada

Arquitectura:
Modular Monolith

Frontend:
React + TypeScript + Vite

Backend:
Node.js + Express + TypeScript

ORM:
Prisma

Database:
PostgreSQL

Fiscal:
ARCA mediante adapter/provider

Infraestructura:
Docker + Reverse Proxy + HTTPS + PostgreSQL

Testing:
Unit + Integration + E2E + Security + Concurrency + Idempotency + Regression

AI Engineering:
AGENTS.md

Estado de implementación:
Pendiente / según roadmap del proyecto
```

---

# Próximos cambios esperados

Las próximas entradas de este archivo deberán registrar cambios reales del repositorio, no funcionalidades hipotéticas.

Especialmente:

```text
[Added]
[Changed]
[Fixed]
[Security]
[Infrastructure]
[Architecture]
[Testing]
[Documentation]
[Fiscal]
```

Cada entrada significativa debe incluir:

```text
qué cambió
por qué cambió
qué módulos afecta
si requiere migración
si requiere testing adicional
si afecta producción
```

---

# Regla del CHANGELOG

> **El CHANGELOG registra hechos del proyecto. No debe utilizarse para inventar funcionalidades futuras ni para declarar como implementado aquello que solamente está documentado.**

---

**Fin de `CHANGELOG.md`.**
