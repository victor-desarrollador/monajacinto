# SISTEMA DE GESTIÓN MULTISUCURSAL

## 01 — VISIÓN Y ALCANCE

**Documento:** `01_VISION_Y_ALCANCE.md`
**Versión:** 1.0
**Estado:** Draft
**Depende de:** `00_MASTER_SPEC.md`

---

# 1. PROPÓSITO

Este documento define:

* Qué problema resuelve el sistema.
* Para quién se construye.
* Qué procesos cubre.
* Qué funcionalidades forman parte de la DEMO.
* Qué funcionalidades quedan fuera de la DEMO.
* Qué funcionalidades están previstas para PRODUCCIÓN.
* Qué significa que la DEMO esté terminada.
* Qué límites deben respetar los agentes de IA durante el desarrollo.

Este documento debe utilizarse para evitar crecimiento descontrolado del alcance (**scope creep**).

---

# 2. VISIÓN DEL PRODUCTO

El producto será un **sistema integral de gestión comercial, operativa y financiera para una empresa de indumentaria multisucursal**.

El sistema debe centralizar en una única plataforma:

```text
PRODUCTOS
    ↓
INVENTARIO
    ↓
DEPÓSITO
    ↓
COMPRAS
    ↓
TRANSFERENCIAS
    ↓
SUCURSALES
    ↓
VENTAS
    ↓
PAGOS
    ↓
CAJAS
    ↓
TESORERÍA
```

Y además:

```text
RESERVAS
CAMBIOS
PRÉSTAMOS PUBLICITARIOS
EMPLEADOS
REPORTES
AUDITORÍA
FACTURACIÓN
```

La visión final es que la empresa pueda gestionar sus operaciones sin depender de múltiples sistemas desconectados, planillas dispersas o controles manuales.

---

# 3. PROBLEMA QUE RESUELVE

El sistema busca resolver principalmente:

## 3.1 Falta de visibilidad del stock

La empresa necesita conocer:

* Qué productos tiene.
* Qué variantes tiene.
* En qué sucursal están.
* Qué hay en depósito.
* Qué está en tránsito.
* Qué está reservado.
* Qué está prestado.
* Qué está disponible para vender.

---

## 3.2 Falta de trazabilidad

Cada operación debe poder reconstruirse.

Ejemplo:

```text
Compra
 ↓
Recepción
 ↓
Depósito
 ↓
Transferencia
 ↓
Remito
 ↓
Sucursal
 ↓
Venta
 ↓
Pago
 ↓
Caja
 ↓
Factura
```

---

## 3.3 Falta de control financiero

La administración debe poder conocer:

```text
¿Cuánto dinero hay?

¿Dónde está?

¿En qué caja?

¿En qué banco?

¿En qué cuenta?

¿Cuánto ingresó?

¿Cuánto salió?

¿Por qué salió?

¿Quién realizó la operación?

¿Existe diferencia de caja?
```

---

## 3.4 Falta de centralización

La información debe estar conectada.

No deben existir módulos aislados que representen la misma operación de manera diferente.

---

# 4. USUARIOS DEL SISTEMA

El sistema debe contemplar diferentes perfiles:

* Super Admin.
* Administrador.
* Encargado de sucursal.
* Vendedor.
* Cajero.
* Personal de depósito.

Los permisos deberán ser definidos detalladamente en:

`02_ROLES_Y_PERMISOS.md`

---

# 5. ESTRUCTURA DEL NEGOCIO

La DEMO debe representar una empresa con:

```text
1 Empresa
│
├── 5 Sucursales
│
├── 1 Depósito Central
│
└── Administración / Tesorería
```

Cada sucursal deberá poder tener:

```text
Sucursal
├── 1 Caja
├── 2–3 POS
├── Vendedores
└── Stock
```

La cantidad debe ser configurable para permitir crecimiento futuro.

---

# 6. ALCANCE FUNCIONAL DE LA DEMO

La DEMO debe cubrir los procesos fundamentales del negocio.

## 6.1 Dashboard

Debe mostrar información resumida:

* Ventas del día.
* Ventas por sucursal.
* Stock total.
* Productos con bajo stock.
* Reservas activas.
* Transferencias en tránsito.
* Cajas abiertas.
* Diferencias de caja.
* Ingresos.
* Egresos.
* Saldos financieros.

El dashboard debe servir como punto de entrada operativo.

---

# 7. PRODUCTOS

La DEMO debe permitir:

* Crear productos.
* Editar productos.
* Desactivar productos.
* Crear variantes.
* Definir talle.
* Definir color.
* SKU.
* Código de barras.
* Precio de lista.
* Precio mayorista/revendedor.
* Estado.

Debe poder buscarse por:

* Nombre.
* SKU.
* Código de barras.
* Categoría.
* Variante.

---

# 8. INVENTARIO

La DEMO debe permitir consultar stock por:

* Producto.
* Variante.
* Sucursal.
* Depósito.

Debe distinguir:

```text
Físico
Reservado
Disponible
```

Debe registrar movimientos de inventario.

---

# 9. DEPÓSITO

La DEMO debe demostrar el flujo:

```text
Compra
 ↓
Recepción
 ↓
Ingreso al depósito
 ↓
Etiquetado
 ↓
Preparación de transferencia
 ↓
Remito
 ↓
Despacho
```

Debe poder visualizarse qué mercadería está:

* Recibida.
* Preparada.
* Despachada.
* En tránsito.

---

# 10. COMPRAS

La DEMO debe permitir representar:

```text
Proveedor
 ↓
Orden de compra
 ↓
Recepción
 ↓
Ingreso de mercadería
```

Debe contemplar recepción parcial.

Ejemplo:

```text
Pedido:
100 unidades

Recibido:
70 unidades

Pendiente:
30 unidades
```

---

# 11. TRANSFERENCIAS ENTRE SUCURSALES

La DEMO debe permitir:

```text
Origen
 ↓
Solicitud / transferencia
 ↓
Preparación
 ↓
Remito
 ↓
Despacho
 ↓
En tránsito
 ↓
Recepción
 ↓
Confirmación
```

Ejemplo:

```text
Depósito Central
       ↓
Sucursal Centro
```

El stock no debe aparecer mágicamente en destino antes de la recepción correspondiente.

---

# 12. POS Y VENTAS

La DEMO debe representar correctamente la separación:

```text
VENDEDOR
 ↓
POS
 ↓
VENTA
 ↓
PENDIENTE DE COBRO
 ↓
CAJERO
 ↓
PAGO
 ↓
FINALIZACIÓN
```

El vendedor no debe crear una segunda operación para cobrar.

El cajero debe tomar la operación existente.

---

# 13. PAGOS

La DEMO debe soportar:

* Efectivo.
* Transferencia.
* QR.
* Tarjeta.
* Combinación de métodos.

Ejemplo:

```text
Venta: $100.000

Efectivo:      $20.000
Transferencia: $50.000
Tarjeta:       $30.000

TOTAL PAGADO: $100.000
```

No se puede finalizar una venta si:

```text
Pagado < Total
```

o:

```text
Pagado > Total
```

salvo que una regla explícita permita cambio/vuelto.

---

# 14. CAJAS

La DEMO debe permitir:

### Apertura

Registrar:

* Usuario.
* Caja.
* Sucursal.
* Fecha/hora.
* Fondo inicial.

### Operación

Registrar:

* Cobros.
* Ingresos.
* Egresos.
* Retiros.

### Arqueo

Mostrar:

```text
Saldo esperado
Saldo contado
Diferencia
```

### Cierre

Registrar:

* Usuario.
* Fecha/hora.
* Resultado.
* Diferencia.
* Observaciones.

---

# 15. TESORERÍA

La DEMO debe incluir una visión centralizada de las cuentas financieras.

Ejemplo:

```text
CAJA MAYOR
BANCO MACRO
BANCO GALICIA
MERCADO PAGO
CAJA SUCURSAL 1
CAJA SUCURSAL 2
CAJA SUCURSAL 3
CAJA SUCURSAL 4
CAJA SUCURSAL 5
```

Debe poder visualizarse el saldo de cada entidad.

---

# 16. MOVIMIENTOS FINANCIEROS

La DEMO debe representar:

### Ingresos

* Ventas.
* Depósitos.
* Otros ingresos permitidos.

### Egresos

* Gastos.
* Pagos a proveedores.
* Sueldos.
* Retiros.
* Devoluciones.

### Transferencias

Ejemplo:

```text
Caja Sucursal
       ↓
Banco Macro
```

Debe quedar registrado:

* Origen.
* Destino.
* Importe.
* Usuario.
* Fecha.
* Motivo.
* Referencia.

---

# 17. CHEQUES

La DEMO debe contemplar una estructura para registrar:

* Número.
* Banco.
* Importe.
* Fecha de emisión.
* Fecha de vencimiento.
* Beneficiario.
* Estado.

Estados iniciales:

```text
EMITIDO
ENTREGADO
DEPOSITADO
COBRADO
RECHAZADO
ANULADO
```

La lógica financiera avanzada podrá ampliarse posteriormente.

---

# 18. RESERVAS Y SEÑAS

La DEMO debe permitir:

```text
Cliente
 ↓
Producto
 ↓
Reserva
 ↓
Seña
 ↓
Fecha de vencimiento
 ↓
Retiro
```

Debe visualizar:

* Cliente.
* Producto.
* Variante.
* Cantidad.
* Precio.
* Seña.
* Saldo.
* Vencimiento.
* Sucursal.
* Estado.

Estados:

```text
RESERVADA
RETIRADA
CANCELADA
VENCIDA
NO_RETIRADA
```

La unidad reservada debe descontarse del stock disponible.

---

# 19. PRÉSTAMOS PARA PUBLICIDAD

La DEMO debe demostrar:

```text
Producto
 ↓
Salida para publicidad
 ↓
Prestado
 ↓
Retorno
```

Debe contemplar situaciones donde:

* Regresa correctamente.
* Regresa dañado.
* No regresa.
* Se vende.

El sistema debe conservar el historial.

---

# 20. CAMBIOS Y DEVOLUCIONES

La DEMO debe permitir seleccionar una venta existente y generar un cambio.

Ejemplo:

```text
Venta #000123
 ↓
Producto devuelto
 ↓
Producto nuevo
 ↓
Diferencia
```

Debe soportar:

* Mismo precio.
* Precio mayor.
* Precio menor.
* Pago de diferencia.
* Devolución de diferencia.
* Ajuste de stock.

---

# 21. EMPLEADOS

La DEMO debe permitir registrar empleados y asociarlos con:

* Sucursal.
* Rol.
* Estado.
* Operaciones realizadas.

---

# 22. VENTAS DE EMPLEADOS

Debe poder identificarse cuando una venta corresponde a un empleado.

Debe poder registrarse:

* Empleado.
* Producto.
* Venta.
* Descuento.
* Importe.
* Medio de pago.
* Usuario autorizado.

---

# 23. FACTURACIÓN

La DEMO debe simular dos posibilidades:

```text
FACTURA FISCAL
TICKET DE VENTA
```

La integración real con ARCA queda fuera de la DEMO.

La DEMO utilizará:

```text
CAE: DEMO-SIMULADO
```

y la leyenda:

```text
COMPROBANTE DEMOSTRATIVO — SIN VALIDEZ FISCAL
```

No se deben utilizar credenciales reales de ARCA en la DEMO.

---

# 24. REPORTES

La DEMO debe incluir reportes suficientes para demostrar la capacidad analítica del sistema.

## Ventas

* Por día.
* Por sucursal.
* Por vendedor.
* Por producto.
* Por método de pago.

## Stock

* Stock por sucursal.
* Stock disponible.
* Stock reservado.
* Bajo stock.
* Sin movimiento.
* En tránsito.

## Finanzas

* Ingresos.
* Egresos.
* Transferencias.
* Gastos.
* Pagos a proveedores.
* Sueldos.
* Movimientos de caja.

## Caja

* Aperturas.
* Cierres.
* Arqueos.
* Diferencias.

---

# 25. EXPORTACIÓN A EXCEL

La DEMO debe incluir exportación funcional de datos financieros.

Como mínimo:

```text
Fecha
Sucursal
Caja
Cuenta financiera
Tipo de movimiento
Método de pago
Importe
Usuario
Referencia
Estado
Observaciones
```

Debe poder filtrarse antes de exportar.

---

# 26. AUDITORÍA

La DEMO debe demostrar que las operaciones críticas generan trazabilidad.

Ejemplo:

```text
Usuario:
Juan Pérez

Acción:
REGISTRÓ PAGO

Entidad:
Venta

Referencia:
VEN-000123

Fecha:
02/09/2026

Sucursal:
Centro
```

---

# 27. ALCANCE VISUAL DE LA DEMO

La DEMO debe tener apariencia de producto profesional.

Debe incluir:

* Sidebar.
* Dashboard.
* Navegación clara.
* Tablas.
* Filtros.
* Búsqueda.
* Modales/drawers.
* Estados visuales.
* Confirmaciones.
* Alertas.
* Empty states.
* Loading states.
* Error states.

No debe parecer una colección de pantallas independientes.

---

# 28. DATOS DE DEMOSTRACIÓN

La DEMO debe contener datos realistas.

Debe incluir como mínimo:

```text
5 sucursales
1 depósito central
3 POS por sucursal
1 caja por sucursal
Usuarios de diferentes roles
Proveedores
Productos
Variantes
Stock
Transferencias
Ventas
Clientes
Reservas
Préstamos
Cambios
Movimientos financieros
Cuentas bancarias
```

Los datos deben estar relacionados entre sí.

No se deben generar números aleatorios sin relación funcional.

---

# 29. FUERA DEL ALCANCE DE LA DEMO

Las siguientes funcionalidades NO deben implementarse como producción durante esta etapa:

* Integración real con ARCA.
* Facturación fiscal real.
* PostgreSQL productivo.
* Infraestructura cloud definitiva.
* Backups productivos.
* Integración bancaria real.
* Integración real con Mercado Pago.
* Integración real con terminales de tarjetas.
* Automatizaciones productivas.
* Multiempresa productivo completo.
* Contabilidad completa.
* Integración contable externa.
* Sistema de nómina completo.
* Aplicación móvil.
* Arquitectura distribuida.
* Redis.
* WebSockets.
* Escalabilidad horizontal.
* Alta disponibilidad.

Podrán existir interfaces o estructuras preparadas para estas funcionalidades, pero no deben consumir tiempo de desarrollo crítico de la DEMO.

---

# 30. TECNOLOGÍA DE LA DEMO

La DEMO deberá priorizar velocidad de desarrollo y validación funcional.

Stack recomendado:

```text
React
TypeScript
Vite
Tailwind CSS
Componentes UI reutilizables
Mock Data
LocalStorage cuando sea necesario
```

La persistencia de DEMO puede ser local.

No debe implementarse una arquitectura backend compleja únicamente para demostrar pantallas.

---

# 31. PREPARACIÓN PARA PRODUCCIÓN

Aunque la DEMO no sea producción, las entidades y procesos deben diseñarse de manera coherente con una futura arquitectura:

```text
React + TypeScript
        ↓
API
        ↓
Node.js + Express + TypeScript
        ↓
PostgreSQL
        ↓
Prisma
```

La migración futura no debería requerir rediseñar completamente el dominio.

---

# 32. CRITERIO DE PRIORIDAD

Cuando exista una limitación de tiempo, la prioridad será:

## P0 — Crítico

1. Productos.
2. Variantes.
3. Stock.
4. Sucursales.
5. Depósito.
6. Transferencias.
7. POS.
8. Ventas.
9. Pagos.
10. Cajas.
11. Tesorería.

## P1 — Importante

12. Compras.
13. Reservas.
14. Cambios.
15. Préstamos publicitarios.
16. Reportes.
17. Auditoría.
18. Exportación.

## P2 — Complementario

19. Empleados.
20. Ventas de empleados.
21. Cheques avanzados.
22. Funciones futuras de integración.

---

# 33. DEFINICIÓN DE DEMO TERMINADA

La DEMO se considera terminada cuando un usuario puede ejecutar de principio a fin los siguientes escenarios:

### ESCENARIO A — Compra

```text
Proveedor
→ Compra
→ Recepción
→ Depósito
→ Stock
```

### ESCENARIO B — Transferencia

```text
Depósito
→ Transferencia
→ Remito
→ Despacho
→ En tránsito
→ Recepción
→ Sucursal
```

### ESCENARIO C — Venta

```text
Vendedor
→ POS
→ Venta
→ Pendiente de cobro
→ Cajero
→ Pago
→ Finalización
→ Stock
→ Caja
→ Ticket/Factura DEMO
```

### ESCENARIO D — Reserva

```text
Producto
→ Reserva
→ Seña
→ Stock reservado
→ Retiro
→ Finalización
```

### ESCENARIO E — Cambio

```text
Venta
→ Cambio
→ Devolución producto
→ Nuevo producto
→ Diferencia
→ Ajuste stock
```

### ESCENARIO F — Publicidad

```text
Producto
→ Préstamo
→ Salida
→ Retorno / Daño / No retorno
→ Ajuste correspondiente
```

### ESCENARIO G — Caja

```text
Apertura
→ Ventas
→ Pagos
→ Retiros
→ Arqueo
→ Diferencia
→ Cierre
```

### ESCENARIO H — Tesorería

```text
Cobro
→ Cuenta financiera
→ Transferencia
→ Otra cuenta
→ Historial
```

---

# 34. REGLA DE SCOPE

Ningún desarrollador o agente de IA debe agregar una funcionalidad solamente porque:

* "Sería útil".
* "Es buena práctica".
* "Lo suelen tener otros sistemas".
* "Podría servir en el futuro".
* "Es fácil de agregar".

Toda nueva funcionalidad debe clasificarse como:

```text
DEMO
PRODUCCIÓN
FUTURO
FUERA DE ALCANCE
```

Si no está definida, debe consultarse antes de implementarla.

---

# 35. OBJETIVO DE LA DEMO

La DEMO no busca demostrar que el sistema está terminado.

Busca demostrar que:

1. Los procesos fueron correctamente entendidos.
2. La arquitectura funcional es coherente.
3. Las operaciones están conectadas.
4. El negocio puede visualizar cómo funcionaría.
5. El cliente puede detectar modificaciones.
6. Los requerimientos pueden refinarse antes de producción.

La DEMO es, por lo tanto, una herramienta de **validación funcional y descubrimiento de requisitos**.

---

# 36. PRINCIPIO FINAL

La pregunta principal durante el desarrollo debe ser:

> "¿Esta funcionalidad ayuda a demostrar o validar uno de los procesos definidos?"

Si la respuesta es NO:

**No se implementa durante la DEMO.**

Si la respuesta es SÍ:

Debe identificarse a qué módulo, proceso y regla pertenece antes de comenzar a programarla.

---

**Estado:** DRAFT
**Versión:** 1.0
**Última actualización:** 2026-09-02
