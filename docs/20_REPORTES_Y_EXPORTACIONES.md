# 20_REPORTES_Y_EXPORTACIONES.md

# VM DIGITAL STUDIO — SISTEMA DE GESTIÓN MULTISUCURSAL

## Módulo 20 — Reportes y Exportaciones

**Versión:** 1.0
**Estado:** Especificación funcional
**Prioridad:** Alta
**Dependencias:** Todos los módulos operativos

---

# 1. OBJETIVO

El módulo de reportes debe transformar los datos operativos del sistema en información útil para tomar decisiones.

No debe limitarse a mostrar tablas.

Debe permitir responder preguntas como:

```text
¿Cuánto vendimos?

¿Qué sucursal vende más?

¿Qué productos se venden más?

¿Qué productos están inmovilizados?

¿Cuánto stock tenemos realmente?

¿Qué mercadería está en tránsito?

¿Cuánto dinero tenemos?

¿Cuánto hay en efectivo?

¿Cuánto hay en bancos?

¿Cuánto tenemos en Mercado Pago?

¿Cuánto debemos a proveedores?

¿Cuánto se facturó?

¿Cuántas devoluciones hubo?

¿Cuánto dinero entró y salió?

¿Qué empleado vendió más?

¿Qué productos están reservados?

¿Qué mercadería está prestada para publicidad?
```

---

# 2. PRINCIPIO FUNDAMENTAL

Los reportes no deben modificar información operativa.

```text
Datos operativos
      ↓
Consultas
      ↓
Agregaciones
      ↓
Reportes
      ↓
Exportación
```

Nunca:

```text
Reporte
 ↓
modifica stock
```

ni:

```text
Reporte
 ↓
modifica caja
```

ni:

```text
Reporte
 ↓
modifica ventas
```

---

# 3. FUENTES DE INFORMACIÓN

Los reportes utilizarán información proveniente de:

* Ventas.
* Productos.
* Variantes.
* Inventario.
* Movimientos de stock.
* Compras.
* Proveedores.
* Transferencias.
* Remitos.
* Cajas.
* Arqueos.
* Tesorería.
* Cuentas financieras.
* Pagos.
* Reservas.
* Señas.
* Préstamos de publicidad.
* Cambios.
* Devoluciones.
* Empleados.
* Sueldos.
* Facturación.
* Auditoría.

---

# 4. FILTROS GLOBALES

Todos los reportes deben poder filtrar, cuando corresponda, por:

```text
Fecha desde
Fecha hasta
Sucursal
Depósito
Producto
Categoría
Marca
Variante
Empleado
Usuario
Cliente
Proveedor
Estado
Método de pago
Cuenta financiera
Punto de venta
Caja
```

---

# 5. FILTRO TEMPORAL

El sistema debe ofrecer períodos rápidos:

```text
Hoy
Ayer
Últimos 7 días
Últimos 30 días
Este mes
Mes anterior
Este año
Año anterior
Personalizado
```

---

# 6. SUCURSAL

Los usuarios con permisos globales pueden consultar:

```text
Todas las sucursales
```

o:

```text
Sucursal Centro
Sucursal Norte
Sucursal Sur
```

Un usuario limitado a una sucursal no debe poder consultar información de otras sucursales.

---

# 7. DASHBOARD GENERAL

El dashboard principal debe mostrar:

```text
VENTAS
$XX.XXX.XXX

UNIDADES
XXXX

TICKET PROMEDIO
$XX.XXX

STOCK
XXXX unidades

RESERVAS
XX

TRANSFERENCIAS
XX

CAJA
$XX.XXX

BANCOS
$XX.XXX

MERCADO PAGO
$XX.XXX
```

---

# 8. VENTAS

Reporte:

```text
Ventas
```

Columnas:

```text
Fecha
Hora
Número
Sucursal
POS
Vendedor
Cliente
Subtotal
Descuento
Total
Método de pago
Estado
Factura
```

---

# 9. VENTAS POR SUCURSAL

Debe permitir comparar:

```text
Sucursal       Ventas       Unidades
------------------------------------
Centro         $X           XXX
Norte          $X           XXX
Sur            $X           XXX
```

Indicadores:

```text
Facturación
Cantidad de operaciones
Unidades vendidas
Ticket promedio
```

---

# 10. TICKET PROMEDIO

Fórmula conceptual:

```text
Ticket promedio =
Ventas netas / cantidad de ventas
```

Debe aclararse qué estados se incluyen.

Por defecto:

```text
Excluir:
CANCELLED
REFUNDED
```

---

# 11. PRODUCTOS MÁS VENDIDOS

Reporte:

```text
Producto
Unidades
Facturación
Margen
Participación
```

Ejemplo:

```text
1. Remera básica       240
2. Campera             185
3. Jean                160
4. Buzo                143
```

---

# 12. PRODUCTOS POR VARIANTE

Debe poder analizarse:

```text
Producto
 ├── Negro / S
 ├── Negro / M
 ├── Negro / L
 ├── Blanco / S
 └── Blanco / M
```

Esto es fundamental para indumentaria.

Un producto puede venderse muy bien mientras una variante específica tiene baja rotación.

---

# 13. ROTACIÓN

El sistema debe calcular indicadores de rotación.

Conceptualmente:

```text
Rotación =
Unidades vendidas / stock promedio
```

Debe quedar documentada la fórmula exacta utilizada.

---

# 14. DÍAS DE STOCK

Indicador:

```text
Días de stock =
Stock disponible / consumo promedio diario
```

Ejemplo:

```text
Stock:
100 unidades

Venta promedio:
5 unidades/día

Días de stock:
20
```

---

# 15. PRODUCTOS DE BAJA ROTACIÓN

Debe detectar:

```text
Stock alto
+
Ventas bajas
=
Producto inmovilizado
```

Configuración:

```text
30 días
60 días
90 días
Personalizado
```

---

# 16. PRODUCTOS SIN VENTA

Detectar productos que:

```text
Tienen stock
```

pero:

```text
No registraron ventas
```

durante el período seleccionado.

---

# 17. REPOSICIÓN

Reporte:

```text
Producto
Sucursal
Stock físico
Reservado
Disponible
En tránsito
Punto de reposición
Necesidad estimada
```

Ejemplo:

```text
Campera X
Centro

Físico:       4
Reservado:    1
Disponible:   3
Mínimo:       8

Reponer:      5
```

---

# 18. STOCK GLOBAL

Debe permitir visualizar:

```text
Depósito central
Sucursal Centro
Sucursal Norte
Sucursal Sur
En tránsito
```

Ejemplo:

```text
Producto       Depósito   Centro   Norte   Tránsito
---------------------------------------------------
Campera X        50         8       4        10
Jean Y           30         6       7         4
```

---

# 19. STOCK FÍSICO

Representa la cantidad físicamente atribuida a una ubicación.

No debe confundirse con:

```text
Disponible
```

---

# 20. STOCK RESERVADO

Representa unidades comprometidas por reservas activas.

```text
Stock reservado
```

debe estar separado del disponible.

---

# 21. STOCK DISPONIBLE

Regla:

```text
Disponible =
Físico - Reservado
```

El modelo debe quedar preparado para ampliar la fórmula si se incorporan otros estados de bloqueo.

---

# 22. STOCK EN TRÁNSITO

Debe mostrarse separado:

```text
Origen
Destino
Producto
Cantidad
Fecha
Remito
Estado
```

Una transferencia en tránsito no debe aparecer como stock disponible en destino.

---

# 23. MOVIMIENTOS DE STOCK

Reporte de auditoría:

```text
Fecha
Producto
Variante
Ubicación
Tipo de movimiento
Cantidad
Usuario
Referencia
Documento
```

Ejemplo:

```text
03/09
Campera M
Centro
SALE
-1
Juan
Venta V-00125
```

---

# 24. COMPRAS

Reporte:

```text
Proveedor
Orden
Fecha
Sucursal/Depósito
Total
Estado
Recibido
Pendiente
```

---

# 25. COMPRAS POR PROVEEDOR

Permitir analizar:

```text
Proveedor
Cantidad de órdenes
Monto comprado
Cantidad recibida
Pendiente
```

---

# 26. COSTO DE MERCADERÍA

Debe permitir consultar:

```text
Costo unitario
Costo total
Costo histórico
Costo promedio
```

La definición exacta del método de valuación debe quedar configurada antes de producción.

No asumir automáticamente FIFO/promedio/etc.

---

# 27. PROVEEDORES

Indicadores:

```text
Total comprado
Facturas recibidas
Pagos realizados
Saldo pendiente
Devoluciones
```

---

# 28. TRANSFERENCIAS

Reporte:

```text
Número
Origen
Destino
Fecha
Estado
Cantidad de unidades
Remito
Responsable
```

Estados:

```text
PENDING
APPROVED
PREPARING
DISPATCHED
IN_TRANSIT
PARTIALLY_RECEIVED
RECEIVED
CANCELLED
```

---

# 29. TRANSFERENCIAS PENDIENTES

Debe existir un indicador:

```text
TRANSFERENCIAS EN TRÁNSITO
```

Ejemplo:

```text
Centro → Norte
12 unidades
Remito R-00045
Despachado hace 2 días
```

---

# 30. REMITOS

Reporte:

```text
Número
Tipo
Origen
Destino
Fecha
Estado
Responsable
Cantidad
```

---

# 31. CAJA

Reporte diario:

```text
Caja
Sucursal
Fecha
Apertura
Ventas efectivo
Entradas
Salidas
Retiros
Devoluciones
Cierre esperado
Cierre contado
Diferencia
Responsable
```

---

# 32. ARQUEOS

Debe mostrar:

```text
Fecha
Caja
Usuario
Monto esperado
Monto contado
Diferencia
Estado
```

---

# 33. DIFERENCIAS DE CAJA

Ejemplo:

```text
Esperado:
$500.000

Contado:
$498.500

Diferencia:
-$1.500
```

La diferencia no debe desaparecer.

Debe quedar registrada.

---

# 34. TESORERÍA

Dashboard:

```text
EFECTIVO
$XXX

BANCOS
$XXX

MERCADO PAGO
$XXX

VALORES
$XXX

TOTAL
$XXX
```

---

# 35. ¿DÓNDE ESTÁ EL DINERO?

Debe existir un reporte central:

```text
¿DÓNDE ESTÁ EL DINERO?
```

Ejemplo:

```text
Caja Centro       $500.000
Caja Norte        $320.000
Banco Galicia     $4.500.000
Banco Macro       $2.300.000
Mercado Pago      $1.200.000
Cheques           $600.000
--------------------------------
TOTAL             $9.420.000
```

---

# 36. MOVIMIENTOS FINANCIEROS

Reporte:

```text
Fecha
Tipo
Origen
Destino
Sucursal
Cuenta
Método
Monto
Referencia
Usuario
Estado
```

---

# 37. MÉTODOS DE PAGO

Reporte:

```text
Efectivo
Transferencia
QR
Débito
Crédito
Cheque
Otro
```

Mostrar:

```text
Cantidad
Monto
Participación %
```

---

# 38. CUENTAS FINANCIERAS

Reporte:

```text
Cuenta
Tipo
Sucursal
Saldo
Movimientos
```

Ejemplo:

```text
Caja Centro
Banco Galicia
Banco Macro
Mercado Pago
Cheques
```

---

# 39. TRANSFERENCIAS BANCARIAS

Debe diferenciar:

```text
Método:
TRANSFERENCIA
```

de:

```text
Cuenta:
BANCO GALICIA
```

Esto permite saber dónde ingresó realmente el dinero.

---

# 40. TARJETAS

Reporte:

```text
Débito
Crédito
Cantidad
Monto bruto
Comisiones
Retenciones
Monto esperado
Monto acreditado
Pendiente
```

La conciliación real con adquirentes/procesadores debe incorporarse cuando exista integración.

---

# 41. RESERVAS

Reporte:

```text
Reserva
Cliente
Sucursal
Fecha
Vencimiento
Productos
Total
Seña
Saldo
Estado
```

Estados:

```text
RESERVADA
RETIRADA
CANCELADA
VENCIDA
NO_RETIRADA
```

---

# 42. SEÑAS

Indicadores:

```text
Señas cobradas
Señas pendientes
Saldo pendiente
Reservas vencidas
```

---

# 43. PRÉSTAMOS DE PUBLICIDAD

Reporte:

```text
Producto
Responsable
Campaña
Fecha salida
Fecha prevista
Fecha devolución
Estado
```

Indicadores:

```text
Prestados
Devueltos
Dañados
No devueltos
Vendidos
```

---

# 44. CAMBIOS

Reporte:

```text
Fecha
Venta original
Cliente
Sucursal
Producto devuelto
Producto entregado
Diferencia
Motivo
Usuario
```

---

# 45. DEVOLUCIONES

Indicadores:

```text
Cantidad
Monto
Porcentaje sobre ventas
Motivos
Productos
Sucursales
```

---

# 46. EMPLEADOS

Reporte:

```text
Empleado
Ventas
Unidades
Ticket promedio
Descuentos
Cambios
Devoluciones
```

---

# 47. VENTAS DE EMPLEADOS

Debe permitir:

```text
Ventas normales
Ventas de empleados
```

por separado.

Indicadores:

```text
Cantidad
Monto
Descuento
Pagado
Pendiente
```

---

# 48. SUELDOS

Reporte:

```text
Empleado
Período
Sueldo
Bonificaciones
Descuentos
Adelantos
Neto
Pagado
Pendiente
```

No debe reemplazar un sistema contable/laboral especializado si la empresa necesita liquidación legal completa.

---

# 49. FACTURACIÓN

Reporte:

```text
Fecha
Tipo
Punto de venta
Número
Cliente
Total
CAE
Estado
```

---

# 50. FACTURACIÓN POR TIPO

Mostrar:

```text
Factura A
Factura B
Factura C
Notas de crédito
Notas de débito
```

---

# 51. FACTURAS RECHAZADAS

Indicador crítico:

```text
FACTURAS RECHAZADAS
```

Mostrar:

```text
Comprobante
Fecha
Sucursal
Error
Estado
Intentos
```

---

# 52. AUDITORÍA

Reporte global:

```text
Fecha
Usuario
Acción
Módulo
Entidad
ID
Antes
Después
IP
Referencia
```

No todos los campos deben estar visibles para todos los roles.

---

# 53. ACTIVIDAD DEL SISTEMA

Dashboard:

```text
Últimas operaciones
```

Ejemplo:

```text
09:42 Juan creó venta V-00125
09:43 María finalizó pago
09:43 Factura B autorizada
09:50 Pedro recibió transferencia
10:01 Depósito despachó remito R-00045
```

---

# 54. REPORTES POR ROL

## Super Admin

Acceso global.

## Administrador

Acceso a las sucursales autorizadas.

## Gerente

Acceso a indicadores y operaciones autorizadas.

## Vendedor

Reportes limitados a sus operaciones.

## Cajero

Caja y operaciones relacionadas.

## Depósito

Stock, transferencias, recepción y despacho.

## Tesorería

Dinero y cuentas financieras.

## Recursos Humanos

Empleados y sueldos.

---

# 55. PERMISOS

No utilizar únicamente:

```text
role === "ADMIN"
```

Debe existir autorización granular.

Ejemplo:

```text
reports.sales.view
reports.stock.view
reports.cash.view
reports.treasury.view
reports.hr.view
reports.audit.view
reports.export
```

---

# 56. EXPORTACIONES

Los reportes deben poder exportarse.

Formatos mínimos:

```text
XLSX
CSV
```

Opcional:

```text
PDF
```

---

# 57. EXCEL

La exportación XLSX debe preservar:

* encabezados;
* tipos de datos;
* fechas;
* números;
* moneda;
* filtros;
* totales;
* columnas relevantes.

---

# 58. CSV

Debe soportar:

```text
UTF-8
```

y manejar correctamente:

* acentos;
* separadores;
* comillas;
* saltos de línea.

---

# 59. EXPORTACIÓN GRANDE

No cargar millones de registros en memoria.

Para grandes volúmenes:

```text
Consulta
 ↓
Job
 ↓
Generación
 ↓
Archivo
 ↓
Descarga
```

La arquitectura debe quedar preparada para procesamiento asíncrono.

---

# 60. NOMBRE DE ARCHIVOS

Formato recomendado:

```text
ventas_sucursal-centro_2026-09-01_2026-09-03.xlsx
```

Ejemplo:

```text
stock_global_2026-09-03.xlsx
```

---

# 61. EXPORTACIÓN AUDITADA

Registrar:

```text
Usuario
Reporte
Filtros
Fecha
Formato
Cantidad de registros
```

Esto permite saber quién exportó información.

---

# 62. INFORMACIÓN SENSIBLE

No todos los reportes deben contener todos los datos.

Especial cuidado con:

```text
CUIT
Domicilio
Datos bancarios
Información salarial
Datos de clientes
Datos fiscales
```

Aplicar mínimo privilegio.

---

# 63. FILTROS CONSISTENTES

Todos los reportes deben utilizar una estructura de filtros consistente.

Conceptualmente:

```text
ReportFilter
 ├── dateFrom
 ├── dateTo
 ├── branchId
 ├── warehouseId
 ├── status
 ├── userId
 └── ...
```

---

# 64. REPORT SERVICE

El backend debe separar:

```text
Controller
Service
Query
Exporter
```

Ejemplo:

```text
ReportsController
      ↓
SalesReportService
      ↓
SalesReportQuery
      ↓
XlsxExporter
```

---

# 65. NO DUPLICAR LÓGICA

No crear:

```text
VentasDashboard
VentasReport
VentasExport
```

con tres implementaciones distintas del cálculo.

Debe existir una fuente común:

```text
SalesMetricsService
```

y luego:

```text
Dashboard
Report
Export
```

utilizan los mismos resultados.

---

# 66. MÉTRICAS

Las métricas deben tener definición documentada.

Ejemplo:

```text
Ventas netas
```

debe indicar exactamente:

```text
Ventas completadas
-
Devoluciones
-
Notas de crédito
```

según la definición financiera adoptada.

No debe existir una métrica llamada:

```text
"Ventas"
```

sin definición.

---

# 67. CONSISTENCIA

Los reportes deben consultar datos consistentes.

Ejemplo:

```text
Dashboard:
$10.000.000

Reporte de ventas:
$10.000.000
```

Si existen diferencias por filtros o tiempos de actualización, deben estar explícitamente indicadas.

---

# 68. TIEMPO REAL

El sistema puede mostrar:

```text
Actualizado:
09:45:32
```

Si un reporte utiliza datos cacheados:

```text
Última actualización:
09:40
```

No mostrar información antigua como si fuera tiempo real.

---

# 69. CACHÉ

Para dashboards pesados puede utilizarse:

```text
Redis
```

pero no debe ser obligatorio para la demo.

La fuente de verdad continúa siendo PostgreSQL.

---

# 70. REPORTES DIARIOS

Debe existir un resumen diario:

```text
VENTAS DEL DÍA

Ventas:
$XXX

Unidades:
XXX

Ticket:
$XXX

Efectivo:
$XXX

Transferencias:
$XXX

Tarjetas:
$XXX

Devoluciones:
$XXX
```

---

# 71. CIERRE DIARIO

Debe permitir comparar:

```text
Ventas
+
Pagos
+
Caja
+
Facturación
```

para detectar inconsistencias.

---

# 72. CONTROL DE INTEGRIDAD

Ejemplo:

```text
Venta:
$100.000

Pagos:
$100.000

Factura:
$100.000
```

Correcto.

Si:

```text
Venta:
$100.000

Pagos:
$90.000
```

debe aparecer como inconsistencia si la operación exige pago completo.

---

# 73. REPORTES DE EXCEPCIONES

Crear una sección:

```text
EXCEPCIONES
```

con:

```text
Facturas rechazadas
Ventas pendientes
Transferencias atrasadas
Reservas vencidas
Diferencias de caja
Movimientos sospechosos
Stock negativo
Pagos pendientes
Compras parcialmente recibidas
Préstamos vencidos
```

---

# 74. DASHBOARD EJECUTIVO

Vista para dirección:

```text
┌───────────────────────────────┐
│ VENTAS                        │
│ $XX.XXX.XXX                   │
├───────────────────────────────┤
│ STOCK                         │
│ XXXX unidades                 │
├───────────────────────────────┤
│ DINERO                        │
│ $XX.XXX.XXX                   │
├───────────────────────────────┤
│ RESERVAS                      │
│ XX                            │
├───────────────────────────────┤
│ ALERTAS                       │
│ XX                            │
└───────────────────────────────┘
```

---

# 75. COMPARACIONES

Permitir comparar:

```text
Hoy vs ayer
Este mes vs mes anterior
Sucursal A vs sucursal B
Producto A vs producto B
Año actual vs año anterior
```

---

# 76. CRECIMIENTO

Ejemplo:

```text
Ventas agosto:
$10.000.000

Ventas septiembre:
$12.000.000

Crecimiento:
+20%
```

La fórmula debe estar documentada.

---

# 77. GRÁFICOS

El frontend puede utilizar gráficos para:

* ventas por día;
* ventas por sucursal;
* métodos de pago;
* productos;
* stock;
* movimientos;
* facturación.

Los gráficos deben complementar la tabla, no reemplazarla.

---

# 78. DETALLE DESDE EL REPORTE

Cuando el usuario selecciona:

```text
Venta V-00125
```

debe poder navegar hacia la operación original si tiene permiso.

Ejemplo:

```text
Reporte
 ↓
Venta
 ↓
Cliente
 ↓
Pagos
 ↓
Factura
```

---

# 79. TRAZABILIDAD

Todo indicador importante debe poder rastrearse hasta datos fuente.

Ejemplo:

```text
Ventas del día
 ↓
12 operaciones
 ↓
V-001
V-002
V-003
...
```

Esto permite auditoría.

---

# 80. PERFORMANCE

Los reportes deben utilizar:

* índices adecuados;
* consultas agregadas;
* paginación;
* filtros en backend;
* selección de columnas;
* consultas optimizadas.

No descargar toda la base al navegador.

---

# 81. PAGINACIÓN

Las tablas deben soportar:

```text
25
50
100
250
```

registros por página.

---

# 82. ORDENAMIENTO

Permitir ordenar por:

```text
Fecha
Monto
Sucursal
Producto
Cantidad
Estado
```

El ordenamiento de grandes conjuntos debe ejecutarse en backend.

---

# 83. BÚSQUEDA

Los reportes deben soportar búsqueda contextual.

Ejemplo:

```text
Buscar:
Campera
```

o:

```text
V-00125
```

o:

```text
Juan
```

---

# 84. DEMO — REPORTES PRINCIPALES

La demo debe mostrar como mínimo:

```text
Dashboard general
Ventas
Ventas por sucursal
Productos más vendidos
Stock
Stock por sucursal
Movimientos de stock
Caja
Tesorería
Reservas
Transferencias
Facturación
Empleados
```

---

# 85. DEMO — EXPORTACIÓN

Debe poder demostrarse:

```text
Reporte de ventas
 ↓
Filtrar:
01/09/2026 → 03/09/2026
Sucursal Centro
 ↓
Exportar XLSX
```

Resultado:

```text
ventas_centro_2026-09-01_2026-09-03.xlsx
```

---

# 86. DEMO — ¿DÓNDE ESTÁ EL DINERO?

Mostrar:

```text
Caja Centro        $500.000
Caja Norte         $320.000
Banco Galicia    $4.500.000
Mercado Pago     $1.200.000
Cheques            $600.000
--------------------------------
TOTAL            $7.120.000
```

Los valores son demostrativos.

---

# 87. DEMO — EXCEPCIONES

Mostrar:

```text
3 facturas rechazadas
1 reserva vencida
2 transferencias en tránsito
1 diferencia de caja
4 productos bajo mínimo
```

---

# 88. REGLAS DE NEGOCIO

### Regla 1

Los reportes no modifican datos operativos.

### Regla 2

Toda métrica debe tener definición.

### Regla 3

Los filtros deben aplicarse en backend.

### Regla 4

Los permisos también se aplican a los reportes.

### Regla 5

La exportación respeta los permisos del usuario.

### Regla 6

Los datos sensibles deben protegerse.

### Regla 7

Los reportes deben poder rastrearse hasta sus operaciones originales.

### Regla 8

No duplicar lógica de cálculo entre dashboard, reporte y exportación.

### Regla 9

La fuente de verdad es la base de datos operativa.

### Regla 10

Redis/cache, si existe, nunca reemplaza la fuente de verdad.

### Regla 11

Las exportaciones deben quedar auditadas.

### Regla 12

Los datos históricos no deben alterarse para modificar reportes pasados.

---

# 89. CRITERIOS DE ACEPTACIÓN

* [ ] Dashboard general funcional.
* [ ] Reporte de ventas.
* [ ] Ventas por sucursal.
* [ ] Productos más vendidos.
* [ ] Rotación.
* [ ] Productos sin venta.
* [ ] Reposición.
* [ ] Stock global.
* [ ] Stock físico.
* [ ] Stock reservado.
* [ ] Stock disponible.
* [ ] Stock en tránsito.
* [ ] Movimientos de stock.
* [ ] Compras.
* [ ] Proveedores.
* [ ] Transferencias.
* [ ] Remitos.
* [ ] Caja.
* [ ] Arqueos.
* [ ] Tesorería.
* [ ] Cuentas financieras.
* [ ] Métodos de pago.
* [ ] Reservas.
* [ ] Préstamos de publicidad.
* [ ] Cambios.
* [ ] Devoluciones.
* [ ] Empleados.
* [ ] Ventas de empleados.
* [ ] Sueldos.
* [ ] Facturación.
* [ ] Auditoría.
* [ ] Excepciones.
* [ ] Filtros.
* [ ] Paginación.
* [ ] Ordenamiento.
* [ ] Búsqueda.
* [ ] XLSX.
* [ ] CSV.
* [ ] Auditoría de exportaciones.
* [ ] Control de permisos.
* [ ] Navegación hacia operación original.

---

# 90. DEMO VS PRODUCCIÓN

## DEMO

Implementar:

```text
Dashboard
Ventas
Stock
Caja
Tesorería
Reservas
Transferencias
Facturación
Empleados
Exportación XLSX
Filtros
Gráficos
Datos simulados
```

## PRODUCCIÓN

Agregar:

```text
Queries optimizadas
Índices
Paginación avanzada
Cache
Jobs
Exportaciones grandes
Monitoreo
Auditoría avanzada
Control de permisos granular
Conciliaciones
Data retention
Backups
```

---

# 91. PRINCIPIO FINAL

El módulo de reportes debe responder una pregunta central:

> **¿Qué está pasando en el negocio y por qué?**

La arquitectura debe permitir pasar de:

```text
INDICADOR
   ↓
REPORTE
   ↓
OPERACIÓN
   ↓
DOCUMENTO
   ↓
AUDITORÍA
```

Por ejemplo:

```text
Ventas:
$12.500.000
       ↓
125 operaciones
       ↓
Venta V-00125
       ↓
Factura B-0003-001258
       ↓
Pago
       ↓
Movimiento financiero
       ↓
Auditoría
```

De esta forma, el sistema no solamente muestra números.

**Permite explicar de dónde salió cada número.**
