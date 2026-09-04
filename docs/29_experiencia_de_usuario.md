# 29 — EXPERIENCIA DE USUARIO, UI/UX Y DISEÑO DEL SISTEMA

## VM Digital Studio — Sistema de Gestión Multisucursal

**Versión:** 1.0
**Estado:** Diseño UX/UI
**Clasificación:** Frontend / UX / Design System
**Prioridad:** Alta

---

# 1. OBJETIVO

Este documento define la experiencia de usuario y arquitectura visual del sistema.

El objetivo es construir una interfaz:

* rápida;
* clara;
* profesional;
* consistente;
* responsive;
* accesible;
* orientada a operaciones;
* adaptada a cada rol;
* preparada para crecer.

El sistema no debe parecer un conjunto de formularios administrativos.

Debe sentirse como una plataforma empresarial coherente.

---

# 2. PRINCIPIO UX CENTRAL

El sistema debe responder rápidamente a tres preguntas:

```text
¿Dónde estoy?
¿Qué puedo hacer?
¿Qué acaba de pasar?
```

Cada pantalla debe comunicar:

```text
Contexto
Estado
Acciones
Resultado
```

---

# 3. PRINCIPIO DE DISEÑO

La interfaz debe priorizar:

```text
Claridad > decoración
Velocidad > animaciones innecesarias
Información > elementos ornamentales
Consistencia > creatividad aislada
```

No diseñar cada módulo como una aplicación diferente.

---

# 4. ARQUITECTURA GLOBAL

La aplicación tendrá una estructura tipo:

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
├──────────────┬──────────────────────────────┤
│              │                              │
│ Sidebar      │ Main Content                 │
│              │                              │
│ Dashboard    │                              │
│ Ventas       │                              │
│ Caja         │                              │
│ Inventario   │                              │
│ Depósito     │                              │
│ Compras      │                              │
│ Transfer.    │                              │
│ Reservas     │                              │
│ Préstamos    │                              │
│ Cambios      │                              │
│ Tesorería    │                              │
│ Reportes     │                              │
│ Admin        │                              │
│              │                              │
└──────────────┴──────────────────────────────┘
```

En mobile:

```text
Header
   ↓
Main
   ↓
Bottom navigation / menú
```

según el contexto de la pantalla.

---

# 5. NAVEGACIÓN

La navegación principal debe agrupar módulos por función.

## Operaciones

```text
Ventas
Caja
Reservas
Cambios y devoluciones
```

## Inventario

```text
Productos
Stock
Depósito
Transferencias
Préstamos
```

## Administración

```text
Compras
Proveedores
Empleados
Tesorería
Facturación
```

## Información

```text
Dashboard
Reportes
Auditoría
```

## Configuración

```text
Empresa
Sucursales
POS
Usuarios
Roles
Permisos
Parámetros
```

---

# 6. NAVEGACIÓN SEGÚN ROL

No todos los usuarios necesitan ver todo.

Ejemplo:

### Vendedor

```text
Dashboard
Ventas
Reservas
Cambios
```

### Cajero

```text
Dashboard
Ventas
Caja
Reservas
Cambios
```

### Depósito

```text
Dashboard
Inventario
Depósito
Compras
Transferencias
Préstamos
```

### Gerente

```text
Dashboard
Ventas
Caja
Inventario
Compras
Transferencias
Reservas
Préstamos
Reportes
```

### Administrador

Acceso completo según permisos.

---

# 7. RBAC VISUAL

El frontend puede ocultar acciones que el usuario no puede ejecutar.

Pero:

> **La UI nunca reemplaza la autorización del backend.**

Ejemplo:

```text
Usuario sin permiso
        ↓
Botón "Anular venta" oculto
```

Pero además:

```text
POST /sales/:id/cancel
        ↓
Backend
        ↓
Permission check
```

Debe rechazarlo si no corresponde.

---

# 8. HEADER

El Header debe mostrar contexto operativo.

Ejemplo:

```text
VMDS
Sucursal Centro
POS 02

[Buscar]        [Notificaciones] [Usuario]
```

Debe ser posible identificar rápidamente:

* empresa;
* sucursal;
* POS;
* usuario;
* sesión.

---

# 9. CAMBIO DE SUCURSAL

Los usuarios autorizados pueden cambiar de sucursal.

Ejemplo:

```text
Sucursal:
[ Centro ▼ ]

Sucursal Norte
Sucursal Sur
Sucursal Centro
```

El cambio debe actualizar:

```text
context
permissions
inventory
cash
reports
```

No debe modificar datos históricos.

---

# 10. DASHBOARD

El dashboard debe ser diferente según el rol.

No debe mostrar cien métricas.

Debe mostrar información accionable.

---

# 11. DASHBOARD GERENCIAL

Ejemplo:

```text
Ventas hoy
$1.245.000

Transacciones
48

Ticket promedio
$25.937

Stock disponible
1.248

Reservas activas
17

Transferencias pendientes
4
```

Debajo:

```text
Ventas por sucursal
Productos más vendidos
Alertas
Movimientos recientes
```

---

# 12. ALERTAS

Las alertas deben ser accionables.

Ejemplos:

```text
⚠ 3 transferencias pendientes de recepción

⚠ 5 reservas vencen hoy

⚠ 2 productos con stock crítico

⚠ Arqueo con diferencia

⚠ Compra parcialmente recibida
```

Cada alerta debe permitir navegar hacia la operación correspondiente.

---

# 13. ESTADOS VISUALES

Todo módulo debe contemplar:

```text
Loading
Empty
Success
Error
Warning
Disabled
Processing
Completed
```

No dejar pantallas en blanco.

---

# 14. EMPTY STATES

Ejemplo:

```text
No hay reservas activas.

[Crear reserva]
```

En lugar de:

```text
tabla vacía
```

El estado vacío debe explicar qué sucede y qué acción puede realizarse.

---

# 15. LOADING STATES

Evitar bloquear toda la aplicación innecesariamente.

Preferir:

```text
Skeleton
Inline loading
Button loading
Table loading
```

Ejemplo:

```text
[ Finalizando venta... ]
```

El usuario debe saber que la operación está ejecutándose.

---

# 16. ERROR STATES

Los errores deben ser comprensibles.

Malo:

```text
500 Internal Server Error
```

Mejor:

```text
No pudimos finalizar la venta.

El stock de "Remera Negra — M"
cambió mientras procesábamos la operación.

Actualizá el stock e intentá nuevamente.
```

El sistema puede mostrar detalles técnicos en logs, no necesariamente al usuario.

---

# 17. CONFIRMACIONES

Las acciones destructivas o sensibles requieren confirmación.

Ejemplos:

```text
Anular venta
Cerrar caja
Cancelar reserva
Confirmar devolución
Despachar transferencia
Ajustar stock
```

La confirmación debe explicar consecuencias.

Ejemplo:

```text
¿Confirmar cierre de caja?

Efectivo esperado:
$250.000

Efectivo contado:
$248.000

Diferencia:
-$2.000

Esta operación quedará registrada.
```

---

# 18. TOASTS

Utilizar notificaciones breves para resultados simples.

Ejemplo:

```text
✓ Producto agregado

✓ Reserva creada

✓ Transferencia enviada
```

No usar toast para información crítica que el usuario necesita conservar.

---

# 19. MODALES

Usar modal cuando:

* la acción sea puntual;
* el usuario no necesite abandonar la pantalla;
* la cantidad de información sea limitada.

No convertir toda la aplicación en una colección de modales.

Operaciones complejas deben utilizar páginas o paneles dedicados.

---

# 20. TABLAS

Las tablas deben ser optimizadas para trabajo operativo.

Ejemplo:

```text
SKU
Producto
Variante
Sucursal
Stock
Disponible
Precio
Estado
Acciones
```

Debe soportarse:

```text
Search
Filter
Sort
Pagination
Column visibility
Export
```

según el módulo.

---

# 21. BÚSQUEDA GLOBAL

Debe existir una búsqueda rápida.

Ejemplo:

```text
Buscar producto, SKU, cliente, venta...
```

Resultados:

```text
Productos
Ventas
Clientes
Reservas
Transferencias
```

Debe respetar permisos.

---

# 22. BÚSQUEDA DE PRODUCTOS

En POS debe priorizarse:

```text
Código de barras
SKU
Nombre
Color
Talle
```

La búsqueda debe ser rápida.

---

# 23. POS — PRINCIPIO UX

El POS es una herramienta operacional.

Debe minimizar clicks.

El vendedor debe poder:

```text
Buscar
Seleccionar
Agregar
Confirmar
Enviar a caja
```

sin navegar por múltiples pantallas.

---

# 24. POS

Diseño recomendado:

```text
┌──────────────────────────────────────────────┐
│ Buscar producto / escanear código            │
├──────────────────────┬───────────────────────┤
│                      │                       │
│ Productos            │ Venta actual         │
│                      │                       │
│ Remera Negra M       │ Remera Negra M x2     │
│ Camisa Blanca L      │ Camisa Blanca L x1    │
│ Pantalón 42          │                       │
│                      │ Subtotal              │
│                      │ Descuento             │
│                      │ TOTAL                 │
│                      │                       │
│                      │ [Enviar a Caja]       │
└──────────────────────┴───────────────────────┘
```

---

# 25. VARIANTES EN POS

Nunca vender simplemente:

```text
Remera Negra
```

si existen variantes.

Debe seleccionarse:

```text
Producto
Color
Talle
SKU
```

Ejemplo:

```text
Remera Básica

Color:
● Negro

Talle:
S  M  L  XL
```

---

# 26. STOCK EN POS

Mostrar información útil:

```text
Disponible en esta sucursal: 4
```

Opcionalmente:

```text
Otras sucursales:
Centro: 4
Norte: 8
Sur: 2
```

según permisos y necesidades.

---

# 27. DESCUENTOS

El descuento debe ser explícito.

Ejemplo:

```text
Subtotal     $100.000
Descuento      -$10.000
Total          $90.000
```

Mostrar:

```text
Descuento autorizado por:
Usuario
```

cuando corresponda.

---

# 28. VENTA PENDIENTE

Después de que el vendedor termina:

```text
PENDING_PAYMENT
```

Debe visualizarse:

```text
Venta #V-000123
Total: $150.000

Estado:
Pendiente de cobro

POS:
02

Vendedor:
Juan

[Cancelar]
```

El vendedor no debe finalizar el cobro si no tiene permiso.

---

# 29. CAJA — UX

El cajero debe tener una pantalla de trabajo diferente.

```text
Ventas pendientes
     ↓
Seleccionar venta
     ↓
Método de pago
     ↓
Confirmar
     ↓
Comprobante
```

---

# 30. PAGOS

Interfaz:

```text
Total:
$150.000

Pago 1
[Efectivo]
$50.000

Pago 2
[Transferencia]
$100.000

Total aplicado:
$150.000

[Finalizar venta]
```

Mostrar:

```text
Pendiente: $0
```

---

# 31. TRANSFERENCIAS

Si método:

```text
TRANSFERENCIA
```

mostrar:

```text
Entidad:
[Banco Macro ▼]

Cuenta:
[Cuenta Corriente]

Referencia:
[____________]

Importe:
[$100.000]
```

La información requerida depende de las reglas definidas.

---

# 32. TARJETAS

Para crédito/débito:

```text
Método
Tarjeta
Monto
```

Posteriormente pueden incorporarse:

```text
Operador
Terminal
Cuotas
Lote
Comisión
Retenciones
Fecha de acreditación
```

La UX debe estar preparada para ello sin exigir toda esta complejidad en la Demo.

---

# 33. CAJA ABIERTA

Mostrar siempre:

```text
Caja #1
Estado: ABIERTA

Apertura:
$50.000

Efectivo actual estimado:
$180.000
```

Y acciones:

```text
Movimiento de efectivo
Retiro
Ingreso
Arqueo
Cerrar caja
```

---

# 34. ARQUEO

Pantalla:

```text
Efectivo esperado:
$180.000

Conteo físico:

$1000 × 50
$500 × 20
$200 × 10
...

Total contado:
$178.000

Diferencia:
-$2.000
```

Botón:

```text
[Confirmar arqueo]
```

---

# 35. DEPÓSITO

El depósito requiere una interfaz más orientada a logística.

Dashboard:

```text
Recepciones pendientes
Preparaciones
Transferencias
Mercadería en tránsito
Incidencias
```

---

# 36. RECEPCIÓN DE MERCADERÍA

La interfaz debe comparar:

```text
Esperado
Recibido
Diferencia
```

Ejemplo:

```text
SKU        Esperado   Recibido   Diferencia

REM-001       20         20          0
CAM-002       15         12         -3
PAN-003       10         10          0
```

La diferencia debe requerir tratamiento según reglas.

---

# 37. PICKING

El operador debe poder trabajar rápidamente.

Ejemplo:

```text
Transferencia TR-00124

1. Remera Negra M × 5
2. Camisa Blanca L × 3
3. Pantalón Azul 42 × 2

[Iniciar picking]
```

Y marcar:

```text
✓ 5/5
✓ 3/3
2/2
```

---

# 38. REMITO

Debe mostrar:

```text
Origen
Destino
Productos
Cantidades
Responsable
Fecha
Número
Estado
```

Acciones:

```text
Ver
Imprimir
Descargar
Despachar
```

---

# 39. RESERVAS

La pantalla debe mostrar:

```text
Reserva #R-00123
Cliente
Productos
Seña
Saldo
Vencimiento
Estado
```

Estados visuales:

```text
RESERVADA
VENCIDA
RETIRADA
CANCELADA
```

---

# 40. RESERVA NUEVA

Flujo:

```text
Cliente
 ↓
Producto
 ↓
Cantidad
 ↓
Fecha vencimiento
 ↓
Seña
 ↓
Confirmar
```

Mostrar claramente:

```text
Total
Seña
Saldo
Vencimiento
```

---

# 41. PRÉSTAMOS PUBLICITARIOS

Debe existir una vista de seguimiento.

```text
Producto
Responsable
Campaña
Salida
Retorno esperado
Estado
```

Ejemplo:

```text
Remera Negra M
Campaña Verano
Entregada: 01/09
Retorno: 05/09
Estado: PRESTADA
```

---

# 42. CAMBIOS Y DEVOLUCIONES

La UX debe comenzar desde la venta original.

```text
Buscar venta
 ↓
Seleccionar producto
 ↓
Elegir cambio/devolución
 ↓
Indicar motivo
 ↓
Seleccionar producto nuevo
 ↓
Calcular diferencia
 ↓
Confirmar
```

Nunca obligar al usuario a reconstruir manualmente la venta original.

---

# 43. TESORERÍA

La tesorería debe responder visualmente:

> **¿Dónde está el dinero?**

Ejemplo:

```text
Caja sucursales
$850.000

Banco Macro
$2.450.000

Galicia
$1.230.000

Mercado Pago
$760.000

Valores
$300.000
```

---

# 44. MOVIMIENTOS FINANCIEROS

Tabla:

```text
Fecha
Tipo
Cuenta
Entrada
Salida
Referencia
Usuario
Estado
```

Ejemplo:

```text
03/09
VENTA
Banco Macro
+$150.000
V-00123
Juan
Confirmado
```

---

# 45. REPORTES

Todos los reportes deben tener filtros consistentes.

```text
Desde
Hasta
Sucursal
Usuario
Producto
Método
Estado
```

Acciones:

```text
Aplicar
Limpiar
Exportar
```

---

# 46. DETALLE DE OPERACIÓN

Cada operación importante debe tener una vista de detalle.

Ejemplo:

```text
Venta #V-00123

Estado: COMPLETED

Cliente
Vendedor
POS
Sucursal

Productos
Pagos
Factura

Movimientos
Auditoría
```

Esto permite reconstruir la operación desde una sola pantalla.

---

# 47. TIMELINE

Para operaciones críticas utilizar timeline.

Ejemplo:

```text
10:31  Venta creada
10:32  Enviada a caja
10:33  Pago registrado
10:33  Stock actualizado
10:33  Factura autorizada
10:33  Venta completada
```

Esto es especialmente útil para soporte y auditoría.

---

# 48. ESTADOS VISUALES CONSISTENTES

Utilizar una convención global.

Ejemplo:

```text
DRAFT
PENDING
PROCESSING
APPROVED
COMPLETED
CANCELLED
FAILED
```

Cada estado debe tener:

```text
label
icon
visual treatment
```

No utilizar diferentes nombres para el mismo concepto.

---

# 49. COLORES SEMÁNTICOS

Los colores deben comunicar significado.

Conceptualmente:

```text
Success → operación correcta
Warning → requiere atención
Error → problema
Info → información
Neutral → estado normal
```

No depender exclusivamente del color.

También utilizar:

```text
icon
text
label
```

para accesibilidad.

---

# 50. ACCESIBILIDAD

Objetivo:

```text
WCAG
```

como referencia de diseño.

Debe contemplarse:

* contraste;
* foco visible;
* navegación por teclado;
* labels;
* estados;
* mensajes de error;
* tamaño de targets;
* lectores de pantalla;
* no depender exclusivamente del color.

---

# 51. RESPONSIVE

No significa simplemente:

```text
Desktop reducido
```

Cada contexto debe tener adaptación.

### Desktop

Ideal para:

```text
Administración
Reportes
Depósito
Tesorería
```

### Tablet

Ideal para:

```text
POS
Inventario
Depósito
```

### Mobile

Ideal para:

```text
Consulta
Dashboard
Reservas
Alertas
Aprobaciones
```

---

# 52. POS RESPONSIVE

En mobile:

```text
Buscar
 ↓
Productos
 ↓
Carrito
 ↓
Resumen
 ↓
Enviar a caja
```

Debe evitarse una interfaz demasiado comprimida.

---

# 53. ATAJOS DE TECLADO

Para POS desktop se recomienda soportar posteriormente:

```text
F2 → Buscar producto
F4 → Cliente
F8 → Descuento
F10 → Enviar a caja
ESC → Cancelar modal
```

Los atajos definitivos deben configurarse según pruebas reales con usuarios.

---

# 54. ESCÁNER DE CÓDIGO DE BARRAS

Debe tratarse como un dispositivo de entrada.

Flujo:

```text
Scan
 ↓
SKU
 ↓
Find variant
 ↓
Add item
```

Si no existe:

```text
Producto no encontrado
```

No crear automáticamente productos por un SKU desconocido sin autorización.

---

# 55. FEEDBACK DE OPERACIÓN

Cuando una operación crítica se completa:

```text
✓ Venta finalizada
```

mostrar también:

```text
Venta #V-00123
Total $150.000
Factura #0001-00000123
```

si corresponde.

---

# 56. PREVENCIÓN DE DOBLE CLICK

Botones críticos deben bloquear reenvíos accidentales.

Ejemplo:

```text
[Finalizando...]
```

Mientras la operación está en curso.

Esto complementa, pero no reemplaza, la idempotencia del backend.

---

# 57. FORMULARIOS

Todos deben utilizar:

```text
Label
Input
Help text
Validation
Error
Required indicator
```

Ejemplo:

```text
Código de barras *
[________________]

El código debe ser único.
```

---

# 58. VALIDACIÓN

La validación debe existir en:

```text
Frontend
+
Backend
```

Frontend:

```text
UX rápida
```

Backend:

```text
Autoridad
```

---

# 59. DISEÑO DE COMPONENTES

Crear un Design System reutilizable.

Componentes:

```text
Button
Input
Select
Combobox
DatePicker
Modal
Drawer
Table
Badge
Card
Tabs
Toast
Alert
Dropdown
Pagination
Skeleton
EmptyState
ErrorState
```

---

# 60. COMPONENTES DE NEGOCIO

Además de componentes genéricos:

```text
ProductCard
ProductVariantSelector
StockBadge
PaymentMethodSelector
CashSummary
SaleStatusBadge
ReservationStatus
TransferStatus
AuditTimeline
FinancialMovementRow
```

---

# 61. DESIGN TOKENS

Centralizar:

```text
Typography
Spacing
Radius
Shadows
Borders
Breakpoints
Motion
Semantic colors
```

No colocar valores arbitrarios por toda la aplicación.

---

# 62. TIPOGRAFÍA

Debe priorizarse:

```text
Legibilidad
Jerarquía
Densidad apropiada
Números fácilmente distinguibles
```

Especial atención a:

```text
precios
cantidades
SKU
totales
fechas
```

---

# 63. NÚMEROS Y DINERO

Los importes deben tener formato consistente.

Ejemplo:

```text
$ 150.000,00
```

según configuración regional.

Nunca mostrar:

```text
150000
```

en interfaces destinadas a usuarios finales cuando pueda generar confusión.

---

# 64. FECHAS

Usar formato consistente.

Ejemplo:

```text
03/09/2026
```

Para información detallada:

```text
03/09/2026 18:32
```

El backend debe almacenar fechas en un formato temporal consistente y la UI convertirlas a la zona horaria correspondiente.

---

# 65. DENSIDAD DE INFORMACIÓN

Este sistema maneja mucha información.

La UI debe permitir una densidad alta sin convertirse en caos.

Utilizar:

```text
Cards
Tables
Sections
Tabs
Collapsible details
```

según contexto.

---

# 66. NO SOBRECARGAR EL DASHBOARD

No colocar:

```text
20 gráficos
15 KPIs
10 tablas
```

en la pantalla inicial.

El dashboard debe priorizar:

```text
Qué está pasando
Qué requiere atención
Qué acción debo tomar
```

---

# 67. CONFIRMACIÓN DE OPERACIONES CRÍTICAS

Para acciones sensibles puede requerirse:

```text
Confirmación
+
Motivo
+
Usuario
```

Ejemplo:

```text
Ajustar stock

Cantidad: -5

Motivo:
[Mercadería dañada]

[Confirmar ajuste]
```

---

# 68. AUDITORÍA VISIBLE

Usuarios autorizados deben poder acceder a:

```text
Quién
Qué
Cuándo
Dónde
Antes
Después
Referencia
```

No mostrar información sensible innecesaria.

---

# 69. UX DE ERRORES DE NEGOCIO

Ejemplo:

```text
No se puede completar la venta.

Stock insuficiente.

SKU: REM-001
Variante: Negro / M
Disponible: 1
Solicitado: 2
```

Esto es mucho mejor que:

```text
Error 409
```

---

# 70. UX DE CONFLICTOS

Ejemplo:

```text
Esta operación cambió mientras la estabas procesando.

El stock disponible ahora es:

1 unidad

Revisá la venta antes de continuar.
```

Nunca ocultar conflictos importantes.

---

# 71. UX DE ESTADOS DE RED

Si se pierde conexión:

```text
Sin conexión
```

debe quedar claro.

No asumir que una operación se completó.

Especialmente en:

```text
Venta
Pago
Transferencia
Caja
Factura
```

---

# 72. REGLA DE OPERACIONES CRÍTICAS

Nunca mostrar:

```text
✓ Operación realizada
```

hasta que el frontend tenga una respuesta válida del backend.

Excepto procesos explícitamente asincrónicos, donde debe mostrarse:

```text
Procesando
```

o:

```text
Pendiente de confirmación
```

---

# 73. UX DE PROCESOS ASINCRÓNICOS

Ejemplo:

```text
Factura
 ↓
Solicitando autorización
 ↓
Procesando
 ↓
Autorizada
```

o:

```text
No autorizada
```

Nunca ocultar el estado.

---

# 74. IMPRESIÓN

Documentos que pueden requerir impresión:

```text
Etiquetas
Remitos
Comprobantes
Arqueos
Reportes
```

La interfaz debe ofrecer:

```text
Vista previa
Imprimir
Descargar
```

según permisos.

---

# 75. MODO DEMO

La Demo debe tener indicadores claros.

Ejemplo:

```text
DEMO
```

y en facturación:

```text
COMPROBANTE DEMOSTRATIVO
SIN VALIDEZ FISCAL
```

No debe existir posibilidad de confundir una simulación con una factura fiscal real.

---

# 76. UX DE SEGURIDAD

Cuando una acción requiere permisos:

```text
No tenés permisos para realizar esta acción.
```

No mostrar detalles internos de autorización.

Para operaciones que requieren aprobación:

```text
Esta operación requiere autorización de un usuario con permisos superiores.
```

---

# 77. UX DE ADMINISTRACIÓN

Administración debe priorizar configuración y no operaciones diarias.

Secciones:

```text
Empresa
Sucursales
POS
Cajas
Usuarios
Roles
Permisos
Listas de precios
Métodos de pago
Cuentas financieras
Parámetros
```

---

# 78. MOBILE NAVIGATION

No intentar replicar toda la sidebar en mobile.

Utilizar:

```text
Inicio
Operaciones
Inventario
Más
```

o una navegación equivalente basada en las tareas más frecuentes.

---

# 79. MOBILE PARA GERENTES

Priorizar:

```text
Dashboard
Alertas
Ventas
Caja
Aprobaciones
Reportes
```

---

# 80. UX DE APROBACIONES

Una acción pendiente debe mostrar:

```text
Qué
Quién
Cuándo
Importe
Sucursal
Motivo
```

y:

```text
[Aprobar]
[Rechazar]
```

si el usuario tiene permisos.

---

# 81. PRINCIPIO DE REVERSIBILIDAD

Antes de una acción irreversible o difícil de revertir:

```text
Mostrar consecuencias
```

Ejemplo:

```text
Cerrar caja

Esta acción finalizará la sesión actual.
Luego no podrás registrar nuevas operaciones
en esta sesión.
```

---

# 82. CONSISTENCIA GLOBAL

Si existe:

```text
Estado
```

en ventas:

```text
Badge
```

debe verse igual en:

```text
Dashboard
Detalle
Tabla
Reportes
```

No crear cinco representaciones diferentes.

---

# 83. UX Y ARQUITECTURA TÉCNICA

El frontend debe consumir:

```text
API
```

No acceder directamente a:

```text
Database
```

ni contener reglas críticas de negocio.

Arquitectura:

```text
UI
 ↓
Hooks / Query layer
 ↓
API client
 ↓
REST API
 ↓
Business services
```

---

# 84. REGLA FRONTEND

El frontend:

```text
Muestra
Solicita
Valida UX
Comunica
```

El backend:

```text
Autoriza
Valida
Ejecuta
Transacciona
Persiste
Audita
```

---

# 85. PERFORMANCE UX

Prioridades:

```text
Fast initial load
Fast product search
Fast POS interactions
Fast table filtering
Optimistic UI solo cuando sea seguro
Pagination
Lazy loading
Caching donde corresponda
```

No utilizar optimizaciones prematuras.

---

# 86. OBSERVABILIDAD UX

Errores del frontend deben poder correlacionarse con:

```text
requestId
operationId
user
route
timestamp
```

cuando corresponda.

Esto permite investigar:

```text
Usuario reporta:
"No pude finalizar una venta."
```

y encontrar la operación correspondiente en backend.

---

# 87. UX DE SOPORTE

Cada operación importante debe permitir acceder a su identificador.

Ejemplo:

```text
Venta #V-00123
Operación:
OP-87FD21
```

Esto facilita soporte técnico.

---

# 88. UX DE HISTORIAL

El usuario debe poder volver desde una operación a su origen.

Ejemplo:

```text
Factura
 ↓
Venta
 ↓
Cliente
 ↓
Pagos
 ↓
Movimientos
```

Y:

```text
Transferencia
 ↓
Remito
 ↓
Picking
 ↓
Stock
```

---

# 89. DISEÑO PARA ERRORES HUMANOS

El sistema debe prevenir errores antes de que ocurran.

Ejemplos:

```text
Cantidad = -5
```

→ bloquear.

```text
Pago total ≠ venta
```

→ bloquear.

```text
Stock insuficiente
```

→ advertir/bloquear.

```text
Transferencia ya recibida
```

→ bloquear.

```text
Reserva vencida
```

→ advertir.

---

# 90. DISEÑO PARA VELOCIDAD

En operaciones repetitivas:

```text
menos clicks
menos navegación
menos escritura
más búsqueda
más shortcuts
más defaults inteligentes
```

Pero:

> La velocidad nunca debe eliminar controles de integridad.

---

# 91. UX PARA EL CLIENTE FINAL

Aunque el sistema sea interno, debe considerar al cliente en:

```text
Reserva
Venta
Cambio
Devolución
Comprobante
```

La información presentada debe ser clara y profesional.

---

# 92. TEST UX

La calidad UX debe validarse con tareas reales.

Ejemplos:

```text
Crear venta en menos pasos posibles
Encontrar una reserva
Cerrar caja
Recepcionar transferencia
Buscar una venta anterior
Procesar un cambio
```

Medir:

```text
Tiempo
Errores
Clicks
Confusión
Necesidad de ayuda
```

---

# 93. ACCEPTANCE CRITERIA UX

Una pantalla se considera terminada cuando:

* [ ] tiene contexto claro;
* [ ] tiene estados de loading;
* [ ] tiene empty state;
* [ ] tiene error state;
* [ ] tiene validaciones;
* [ ] respeta permisos;
* [ ] funciona responsive;
* [ ] mantiene consistencia visual;
* [ ] tiene feedback de acciones;
* [ ] no permite errores obvios;
* [ ] es accesible razonablemente;
* [ ] puede utilizarse con datos reales de prueba.

---

# 94. DESIGN SYSTEM — DEFINITION OF DONE

Debe existir:

```text
Tokens
Components
Patterns
Layouts
States
Forms
Tables
Navigation
Feedback
Accessibility rules
```

y documentación suficiente para que nuevas pantallas no inventen estilos diferentes.

---

# 95. REGLAS NO NEGOCIABLES

### Regla 1

> POS y Caja deben tener experiencias separadas.

### Regla 2

> El frontend no es la autoridad de negocio.

### Regla 3

> Toda operación crítica necesita feedback.

### Regla 4

> Los errores deben ser comprensibles.

### Regla 5

> No existen pantallas sin estados vacío/error/loading.

### Regla 6

> No depender únicamente del color.

### Regla 7

> Los datos monetarios deben tener jerarquía visual clara.

### Regla 8

> Las operaciones críticas deben requerir confirmación cuando corresponda.

### Regla 9

> La interfaz debe adaptarse al rol.

### Regla 10

> La velocidad operacional no puede comprometer integridad.

---

# 96. EXPERIENCIA OBJETIVO

El usuario debería sentir:

```text
Entro
 ↓
Sé dónde estoy
 ↓
Veo qué tengo que hacer
 ↓
Encuentro rápidamente el dato
 ↓
Realizo la operación
 ↓
El sistema confirma
 ↓
Sé qué cambió
 ↓
Puedo rastrearlo
```

No:

```text
Buscar menú
 ↓
Abrir pantalla
 ↓
Completar formulario
 ↓
Abrir otra pantalla
 ↓
Volver
 ↓
No saber si guardó
```

---

# 97. PRINCIPIO FINAL

La UX del sistema debe esconder la complejidad técnica sin esconder la realidad operacional.

El usuario no necesita conocer:

```text
Prisma
PostgreSQL
transactions
idempotency keys
StockMovement
FinancialMovement
ARCAAdapter
```

Pero la interfaz debe permitirle ejecutar correctamente las operaciones que producen esos efectos.

La experiencia ideal es:

```text
COMPLEJIDAD INTERNA
        ↓
   SISTEMA ROBUSTO
        ↓
   INTERFAZ SIMPLE
        ↓
   OPERACIÓN CLARA
```

---

# 98. ESTADO DEL BLUEPRINT

Módulos definidos:

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
28 — Testing y Quality Assurance
29 — UX/UI y Diseño del Sistema
```

## SIGUIENTE MÓDULO

```text
30 — ESTRUCTURA DEL PROYECTO, MONOREPO Y CONVENCIONES DE CÓDIGO
```

Este módulo llevará todo el blueprint al terreno de **OpenCode/desarrollo real**: estructura exacta de carpetas, `apps/web`, `apps/api`, `packages`, Prisma, módulos backend/frontend, naming conventions, imports, tipos compartidos, validación, configuración, `.env`, `AGENTS.md`, documentación y reglas para que el proyecto pueda crecer sin convertirse en código desordenado.
