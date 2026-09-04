# SISTEMA DE GESTIÓN MULTISUCURSAL

## 02 — ROLES Y PERMISOS

**Documento:** `02_ROLES_Y_PERMISOS.md`
**Versión:** 1.0
**Estado:** Draft
**Depende de:** `00_MASTER_SPEC.md`, `01_VISION_Y_ALCANCE.md`

---

# 1. PROPÓSITO

Este documento define el sistema de roles, permisos y restricciones de acceso.

El objetivo es garantizar que cada usuario pueda realizar únicamente las operaciones correspondientes a sus responsabilidades.

El sistema debe implementar **RBAC — Role-Based Access Control**.

Los permisos deberán ser suficientemente granulares para diferenciar entre:

* Ver.
* Crear.
* Editar.
* Aprobar.
* Ejecutar.
* Cancelar.
* Eliminar.
* Exportar.
* Cerrar.
* Autorizar.

---

# 2. PRINCIPIO FUNDAMENTAL

El sistema no debe controlar únicamente:

> "¿Puede entrar a este módulo?"

Debe controlar:

> "¿Puede ejecutar esta acción específica sobre esta entidad y en este contexto?"

Ejemplo:

Un vendedor puede acceder a ventas.

Pero eso no significa que pueda:

* Cobrar.
* Cerrar caja.
* Anular una venta finalizada.
* Modificar precios arbitrariamente.
* Ajustar stock.
* Autorizar descuentos especiales.

---

# 3. ROLES INICIALES

Se definen los siguientes roles:

```text id="5otb8d"
SUPER_ADMIN
ADMIN
BRANCH_MANAGER
SELLER
CASHIER
WAREHOUSE
```

Los nombres son identificadores internos.

La interfaz puede mostrar nombres comerciales diferentes si el negocio lo solicita.

---

# 4. SUPER ADMIN

## 4.1 Alcance

Acceso global a toda la empresa.

Puede consultar y administrar todas las sucursales, depósito, usuarios, operaciones y configuraciones.

---

## 4.2 Usuarios

Puede:

* Ver usuarios.
* Crear usuarios.
* Editar usuarios.
* Activar/desactivar usuarios.
* Asignar roles.
* Asignar sucursales.
* Restablecer acceso según política de seguridad.

---

## 4.3 Sucursales

Puede:

* Crear sucursales.
* Editar sucursales.
* Activar/desactivar sucursales.
* Configurar cajas.
* Configurar POS.
* Consultar operaciones.

---

## 4.4 Productos

Puede:

* Crear.
* Editar.
* Desactivar.
* Configurar variantes.
* Configurar SKU.
* Configurar códigos de barras.
* Configurar precios.
* Consultar historial.

---

## 4.5 Inventario

Puede:

* Consultar stock global.
* Consultar stock por sucursal.
* Consultar stock por depósito.
* Consultar stock reservado.
* Consultar stock disponible.
* Consultar movimientos.
* Realizar ajustes autorizados.
* Consultar auditoría.

---

## 4.6 Finanzas

Acceso global a:

* Cajas.
* Tesorería.
* Cuentas financieras.
* Transferencias.
* Gastos.
* Pagos.
* Sueldos.
* Cheques.
* Movimientos financieros.
* Reportes.

---

# 5. ADMIN

## 5.1 Alcance

Administra la operación general de la empresa de acuerdo con los permisos asignados.

Puede tener acceso a:

* Productos.
* Inventario.
* Compras.
* Proveedores.
* Depósito.
* Transferencias.
* Ventas.
* Reportes.
* Finanzas.
* Usuarios según configuración.

No necesariamente posee todos los privilegios del SUPER_ADMIN.

---

# 6. ENCARGADO DE SUCURSAL

Identificador:

```text id="xw1d9n"
BRANCH_MANAGER
```

## 6.1 Alcance

El encargado está asociado a una o más sucursales específicas.

Por defecto, no puede administrar operaciones fuera de su ámbito.

---

## 6.2 Puede consultar

* Stock de su sucursal.
* Ventas.
* Vendedores.
* Cajas.
* Reservas.
* Cambios.
* Transferencias relacionadas.
* Reportes de su sucursal.

---

## 6.3 Puede operar

Según permisos:

* Crear reservas.
* Gestionar cambios.
* Solicitar transferencias.
* Confirmar recepción.
* Consultar movimientos.
* Gestionar operaciones internas.

---

## 6.4 Restricciones

No puede:

* Modificar información global de la empresa.
* Administrar otras sucursales sin permiso.
* Modificar cuentas financieras globales.
* Alterar ventas finalizadas sin autorización.
* Eliminar movimientos financieros.
* Borrar movimientos de stock.

---

# 7. VENDEDOR

Identificador:

```text id="o9qv2b"
SELLER
```

## 7.1 Objetivo

El vendedor trabaja principalmente desde un POS.

---

## 7.2 Puede

### Productos

* Buscar productos.
* Consultar precios.
* Consultar variantes.
* Consultar stock permitido.

### Ventas

* Crear ventas.
* Agregar productos.
* Modificar cantidades antes del envío.
* Aplicar descuentos permitidos.
* Identificar cliente.
* Enviar venta a cobro.

### Reservas

* Crear reservas.
* Registrar datos del cliente.
* Registrar seña si el flujo lo permite.
* Consultar reservas propias/sucursal.

---

## 7.3 Estado de venta

Cuando el vendedor termina de preparar la venta:

```text id="6z2p6x"
PENDING_PAYMENT
```

La venta queda disponible para el cajero.

---

## 7.4 NO puede

Por defecto:

* Cobrar una venta.
* Finalizar una venta cobrada.
* Abrir caja.
* Cerrar caja.
* Realizar arqueos.
* Registrar retiros de caja.
* Modificar movimientos financieros.
* Realizar ajustes de stock.
* Modificar precios globales.
* Anular operaciones finalizadas.
* Emitir facturación fiscal real.
* Autorizar descuentos fuera de su límite.

---

# 8. CAJERO

Identificador:

```text id="o7q5e2"
CASHIER
```

## 8.1 Objetivo

El cajero es responsable del cobro y control de caja.

---

## 8.2 Puede

### Caja

* Abrir caja.
* Consultar caja.
* Registrar movimientos.
* Registrar ingresos.
* Registrar egresos autorizados.
* Registrar retiros.
* Realizar arqueo.
* Cerrar caja.

### Ventas

* Consultar ventas pendientes de cobro.
* Seleccionar una venta.
* Ver detalle.
* Registrar pagos.
* Registrar pagos combinados.
* Seleccionar cuenta financiera cuando corresponda.
* Finalizar la venta.

---

## 8.3 Cobros combinados

Puede registrar:

```text id="jckmrv"
EFECTIVO
+
TRANSFERENCIA
+
QR
+
TARJETA
```

Siempre respetando:

```text id="g4k8yw"
SUMA DE PAGOS = TOTAL DE VENTA
```

---

## 8.4 Restricciones

El cajero no debe poder:

* Alterar libremente el precio base de productos.
* Modificar stock manualmente.
* Eliminar ventas.
* Eliminar movimientos financieros.
* Modificar ventas finalizadas sin autorización.

---

# 9. DEPÓSITO

Identificador:

```text id="u8fz6v"
WAREHOUSE
```

## 9.1 Objetivo

Gestionar físicamente la mercadería.

---

## 9.2 Puede

### Compras

* Consultar órdenes.
* Registrar recepción.
* Registrar recepción parcial.
* Confirmar cantidades recibidas.

### Inventario

* Consultar stock de depósito.
* Registrar movimientos permitidos.
* Preparar mercadería.

### Etiquetado

* Generar etiquetas.
* Imprimir etiquetas.

### Transferencias

* Preparar transferencias.
* Confirmar preparación.
* Generar/gestionar remito.
* Despachar mercadería.

---

## 9.3 Restricciones

No puede:

* Cobrar ventas.
* Cerrar cajas.
* Modificar movimientos financieros.
* Modificar precios comerciales salvo permiso.
* Eliminar ventas.
* Confirmar operaciones fuera de su responsabilidad.

---

# 10. MATRIZ GENERAL DE PERMISOS

Leyenda:

```text
✓ = Permitido
○ = Permitido según autorización
— = No permitido
```

| Módulo / Acción         | Super Admin | Admin | Encargado | Vendedor | Cajero | Depósito |
| ----------------------- | ----------: | ----: | --------: | -------: | -----: | -------: |
| Dashboard global        |           ✓ |     ✓ |         ○ |        — |      ○ |        ○ |
| Ver productos           |           ✓ |     ✓ |         ✓ |        ✓ |      ✓ |        ✓ |
| Crear productos         |           ✓ |     ✓ |         ○ |        — |      — |        — |
| Editar productos        |           ✓ |     ✓ |         ○ |        — |      — |        — |
| Ver stock               |           ✓ |     ✓ |         ✓ |        ✓ |      ✓ |        ✓ |
| Ajustar stock           |           ✓ |     ✓ |         ○ |        — |      — |        ○ |
| Ver compras             |           ✓ |     ✓ |         ○ |        — |      — |        ✓ |
| Crear compra            |           ✓ |     ✓ |         ○ |        — |      — |        ○ |
| Recibir mercadería      |           ✓ |     ✓ |         ○ |        — |      — |        ✓ |
| Ver transferencias      |           ✓ |     ✓ |         ✓ |        ○ |      — |        ✓ |
| Crear transferencia     |           ✓ |     ✓ |         ✓ |        — |      — |        ✓ |
| Preparar transferencia  |           ✓ |     ✓ |         ○ |        — |      — |        ✓ |
| Despachar transferencia |           ✓ |     ✓ |         ○ |        — |      — |        ✓ |
| Confirmar recepción     |           ✓ |     ✓ |         ✓ |        — |      — |        ✓ |
| Crear venta             |           ✓ |     ✓ |         ✓ |        ✓ |      ○ |        — |
| Ver ventas              |           ✓ |     ✓ |         ✓ |        ✓ |      ✓ |        — |
| Cobrar venta            |           ✓ |     ✓ |         ○ |        — |      ✓ |        — |
| Finalizar venta         |           ✓ |     ✓ |         ○ |        — |      ✓ |        — |
| Abrir caja              |           ✓ |     ✓ |         ○ |        — |      ✓ |        — |
| Arqueo                  |           ✓ |     ✓ |         ○ |        — |      ✓ |        — |
| Cerrar caja             |           ✓ |     ✓ |         ○ |        — |      ✓ |        — |
| Crear reserva           |           ✓ |     ✓ |         ✓ |        ✓ |      ○ |        — |
| Gestionar cambios       |           ✓ |     ✓ |         ✓ |        ○ |      ○ |        — |
| Préstamos publicidad    |           ✓ |     ✓ |         ✓ |        ○ |      — |        ✓ |
| Ver tesorería           |           ✓ |     ✓ |         ○ |        — |      ○ |        — |
| Operar tesorería        |           ✓ |     ✓ |         — |        — |      — |        — |
| Ver cuentas financieras |           ✓ |     ✓ |         ○ |        — |      ○ |        — |
| Registrar gasto         |           ✓ |     ✓ |         ○ |        — |      ○ |        — |
| Ver reportes            |           ✓ |     ✓ |         ✓ |        ○ |      ○ |        ○ |
| Exportar Excel          |           ✓ |     ✓ |         ○ |        — |      ○ |        ○ |
| Ver auditoría           |           ✓ |     ○ |         — |        — |      — |        — |
| Gestionar usuarios      |           ✓ |     ○ |         — |        — |      — |        — |
| Configuración global    |           ✓ |     ○ |         — |        — |      — |        — |

---

# 11. PERMISOS GRANULARES

Los roles no deben ser el único mecanismo de autorización.

El sistema debe permitir permisos específicos.

Ejemplos:

```text id="fqu5du"
products.read
products.create
products.update
products.delete

inventory.read
inventory.adjust

sales.read
sales.create
sales.update
sales.cancel
sales.finalize

payments.create
payments.refund

cash.open
cash.close
cash.count
cash.withdraw

reservations.create
reservations.cancel

transfers.create
transfers.dispatch
transfers.receive

finance.read
finance.create
finance.approve
finance.export

reports.read
reports.export

audit.read
```

---

# 12. LÍMITES POR SUCURSAL

Un usuario puede estar asociado a:

```text id="j3ot5j"
1 sucursal
```

o:

```text id="tq3x7q"
múltiples sucursales
```

El sistema debe aplicar el alcance correspondiente.

Ejemplo:

```text id="7p8e0g"
Usuario:
Vendedor Centro

Sucursal permitida:
Centro

Puede:
✓ Ver stock Centro
✓ Crear ventas Centro
✓ Crear reservas Centro

No puede:
✗ Ver operaciones internas de otra sucursal
✗ Modificar stock de otra sucursal
✗ Cobrar en otra caja
```

El SUPER_ADMIN puede operar globalmente.

---

# 13. RESTRICCIONES FINANCIERAS

Las operaciones financieras sensibles deben poder requerir autorización.

Ejemplos:

* Retiro elevado de caja.
* Anulación de movimiento.
* Devolución importante.
* Descuento extraordinario.
* Ajuste financiero.
* Pago a proveedor.
* Transferencia entre cuentas.
* Corrección de arqueo.

El sistema deberá soportar posteriormente reglas como:

```text id="4m4ycb"
OPERACIÓN
→ REQUIERE AUTORIZACIÓN
→ USUARIO AUTORIZADOR
→ FECHA
→ RESULTADO
```

---

# 14. DESCUENTOS

Los descuentos deben estar sujetos a permisos.

Ejemplo conceptual:

```text id="5ip2iq"
Vendedor
→ descuento hasta límite permitido

Encargado
→ límite superior

Administrador
→ límite superior

Super Admin
→ autorización global
```

Los límites exactos serán configurables cuando el cliente defina su política comercial.

No se deben inventar porcentajes durante la DEMO.

---

# 15. ANULACIONES

Una operación finalizada no debe eliminarse físicamente.

Debe utilizarse una operación de:

```text id="8xqm0a"
CANCELACIÓN
```

o el mecanismo correspondiente.

Debe quedar:

```text id="9z7k4w"
Operación original
↓
Cancelación
↓
Usuario
↓
Motivo
↓
Fecha
↓
Auditoría
```

---

# 16. ELIMINACIÓN DE DATOS

Las entidades operativas críticas no deben eliminarse físicamente después de haber generado operaciones.

Ejemplos:

* Ventas.
* Pagos.
* Movimientos financieros.
* Movimientos de stock.
* Transferencias confirmadas.
* Arqueos.
* Cierres de caja.
* Facturas.
* Auditoría.

En estos casos se utilizarán estados, anulaciones o correcciones trazables.

---

# 17. PRINCIPIO DE MENOR PRIVILEGIO

Cada usuario debe disponer únicamente de los permisos necesarios para realizar su trabajo.

No se debe otorgar acceso administrativo por comodidad.

---

# 18. AUDITORÍA DE PERMISOS

Los cambios de permisos deben registrarse.

Ejemplo:

```text id="9x2b2r"
Usuario afectado:
Juan

Cambio:
SELLER → CASHIER

Realizado por:
Administrador

Fecha:
02/09/2026

Motivo:
Cambio de función
```

---

# 19. REGLA PARA OPEN CODE / AGENTES IA

Antes de crear una acción en una interfaz:

1. Identificar la entidad.
2. Identificar la operación.
3. Identificar el permiso requerido.
4. Verificar el rol.
5. Verificar el alcance de sucursal.
6. Verificar si requiere autorización.
7. Implementar validación también en backend en producción.

Nunca confiar únicamente en ocultar botones.

---

# 20. REGLA DEMO

Durante la DEMO se puede utilizar un sistema simplificado de permisos, pero la estructura debe representar el modelo real.

No se debe crear una arquitectura que obligue a rehacer completamente RBAC durante la etapa productiva.

---

# 21. DECISIONES PENDIENTES

Las siguientes reglas deben confirmarse con el cliente:

* Límites exactos de descuentos.
* Qué anulaciones requieren autorización.
* Qué monto de retiro requiere autorización.
* Qué usuarios pueden aprobar gastos.
* Qué usuarios pueden aprobar pagos a proveedores.
* Qué usuarios pueden modificar precios.
* Qué usuarios pueden realizar ajustes de stock.
* Qué usuarios pueden visualizar salarios.
* Qué usuarios pueden visualizar tesorería.
* Qué operaciones requieren doble autorización.

Hasta que sean confirmadas:

**No inventar valores definitivos.**

---

# 22. CRITERIO DE ACEPTACIÓN

El sistema debe ser capaz de demostrar:

### Vendedor

Puede crear una venta, pero no cobrarla.

### Cajero

Puede tomar la venta pendiente, registrar pagos y finalizarla.

### Depósito

Puede recibir y despachar mercadería, pero no cobrar ventas.

### Encargado

Puede gestionar su sucursal, pero no administrar globalmente la empresa.

### Administrador

Puede gestionar operaciones generales según sus permisos.

### Super Admin

Puede visualizar y administrar globalmente.

La separación debe mantenerse incluso si el usuario intenta acceder directamente a una ruta protegida.

---

# 23. PRINCIPIO FINAL

La seguridad del sistema no depende de la interfaz.

Ocultar un botón NO constituye autorización.

La autorización real debe estar basada en:

```text id="a8blnq"
USUARIO
+
ROL
+
PERMISO
+
ALCANCE
+
CONTEXTO
```

En producción estas reglas deberán validarse en backend.

---

**Estado:** DRAFT
**Versión:** 1.0
**Última actualización:** 2026-09-02
