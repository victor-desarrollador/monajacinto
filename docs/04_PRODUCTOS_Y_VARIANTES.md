# SISTEMA DE GESTIÓN MULTISUCURSAL
## 04 — PRODUCTOS Y VARIANTES

**Documento:** `04_PRODUCTOS_Y_VARIANTES.md`  
**Versión:** 1.0  
**Estado:** Draft  
**Depende de:** `00_MASTER_SPEC.md`, `01_VISION_Y_ALCANCE.md`, `02_ROLES_Y_PERMISOS.md`, `03_SUCURSALES_Y_POS.md`

---

# 1. PROPÓSITO

Este documento define cómo el sistema representa, identifica, clasifica, vende y controla los productos comercializados por la empresa.

El sistema está orientado principalmente a una tienda de indumentaria.

Debe soportar:

- Productos.
- Categorías.
- Marcas.
- Modelos.
- Colores.
- Talles.
- Variantes.
- SKU.
- Código de barras.
- Precio de venta.
- Precio mayorista.
- Costos.
- Stock por variante.
- Stock por sucursal.
- Stock en depósito.
- Stock reservado.
- Disponibilidad.
- Estado del producto.
- Historial de cambios.

---

# 2. PRINCIPIO FUNDAMENTAL

El sistema debe diferenciar:

```text
PRODUCTO / MODELO
        ↓
VARIANTES
        ↓
STOCK
```

Ejemplo:

```text
Producto:
Remera Básica

Variantes:

Negro / S
Negro / M
Negro / L
Negro / XL

Blanco / S
Blanco / M
Blanco / L
Blanco / XL
```

Cada variante representa una unidad comercial identificable.

---

# 3. PRODUCTO

Entidad conceptual:

```text
Product
```

El producto representa el modelo comercial.

Ejemplo:

```text
Remera Básica
```

No representa necesariamente una unidad física individual.

---

# 4. DATOS DEL PRODUCTO

Campos conceptuales:

```text
id
companyId
name
description
categoryId
brandId
productType
status
createdAt
updatedAt
```

Puede incorporar posteriormente:

- Temporada.
- Colección.
- Género.
- Material.
- Proveedor principal.
- Imagen.
- Imágenes adicionales.
- Etiquetas.
- Observaciones.

---

# 5. CATEGORÍAS

Los productos deben poder organizarse mediante categorías.

Ejemplos:

```text
Remeras
Camisas
Pantalones
Jeans
Vestidos
Buzos
Camperas
Abrigos
Accesorios
```

Las categorías deben ser configurables.

No deben estar hardcodeadas.

---

# 6. SUBCATEGORÍAS

El sistema puede soportar una jerarquía:

```text
Indumentaria
│
├── Remeras
├── Camisas
├── Pantalones
└── Camperas
```

La profundidad de categorías debe mantenerse simple durante la DEMO.

No implementar un árbol excesivamente complejo sin necesidad comercial.

---

# 7. MARCA

Entidad:

```text
Brand
```

Permite identificar la marca del producto.

Ejemplo:

```text
Marca:
Nike
Adidas
Marca propia
Sin marca
```

La lista debe ser configurable.

---

# 8. TIPO DE PRODUCTO

El sistema puede clasificar productos mediante:

```text
CLOTHING
ACCESSORY
OTHER
```

La clasificación exacta puede ampliarse posteriormente.

---

# 9. VARIANTE

Entidad:

```text
ProductVariant
```

La variante representa la combinación concreta de atributos que puede ser almacenada, vendida y controlada.

Ejemplo:

```text
Producto:
Camisa Oxford

Variante:
Azul / M
```

Otra:

```text
Azul / L
```

Son variantes diferentes.

---

# 10. ATRIBUTOS DE VARIANTE

Los principales atributos para indumentaria serán:

```text
COLOR
SIZE
```

Ejemplo:

```text
Color: Negro
Talle: M
```

El modelo debe poder ampliarse posteriormente para atributos adicionales.

Ejemplos:

- Estampado.
- Material.
- Largo.
- Presentación.
- Temporada.

---

# 11. COLOR

Entidad conceptual:

```text
Color
```

Debe permitir almacenar:

```text
id
name
code
status
```

Ejemplos:

```text
Negro
Blanco
Rojo
Azul
Verde
Beige
Rosa
```

El color debe ser reutilizable entre múltiples productos.

---

# 12. TALLE

Entidad conceptual:

```text
Size
```

Ejemplos:

```text
XS
S
M
L
XL
XXL
```

También debe permitir:

```text
36
38
40
42
44
```

y otros sistemas de talles si el negocio los utiliza.

---

# 13. TIPO DE TALLE

El sistema debería permitir distinguir sistemas de talles cuando sea necesario.

Ejemplo:

```text
LETTER
NUMBER
```

Pero la implementación inicial puede mantener una estructura simple.

---

# 14. SKU

Cada variante vendible debe tener un SKU único.

Ejemplo:

```text
REM-BAS-NEG-M
```

o:

```text
CAM-OXF-AZU-L
```

Regla:

> El SKU identifica una variante comercial concreta.

No debe existir el mismo SKU para dos variantes activas diferentes.

---

# 15. SKU Y PRODUCTO

El producto puede tener:

```text
Producto:
Remera Básica
```

y sus variantes:

```text
REM-BAS-NEG-S
REM-BAS-NEG-M
REM-BAS-NEG-L
REM-BAS-BLA-S
REM-BAS-BLA-M
REM-BAS-BLA-L
```

El SKU pertenece a la variante, no al modelo general.

---

# 16. CÓDIGO DE BARRAS

Cada variante puede tener un código de barras.

Ejemplo:

```text
Código:
779XXXXXXXXX
```

Debe ser posible buscar una variante mediante:

- SKU.
- Código de barras.
- Nombre.
- Color.
- Talle.

---

# 17. UNICIDAD

Debe existir unicidad para:

```text
SKU
```

y, cuando corresponda:

```text
BARCODE
```

No se debe permitir registrar dos variantes activas con el mismo identificador.

---

# 18. IDENTIFICACIÓN RÁPIDA EN POS

El POS debe poder encontrar una variante rápidamente.

Flujo:

```text
Escanear código
↓
Buscar barcode
↓
Encontrar variante
↓
Mostrar producto
↓
Mostrar color/talle
↓
Agregar al carrito
```

También debe existir búsqueda manual.

---

# 19. PRECIO

La variante debe poder utilizar información comercial de precio.

Como mínimo:

```text
salePrice
resellerPrice
costPrice
```

Sin embargo, debe evitarse duplicar innecesariamente precios entre producto y variante.

La arquitectura debe permitir implementar posteriormente:

```text
PriceList
```

para manejar múltiples listas.

---

# 20. PRECIO DE VENTA

Ejemplo:

```text
Precio público:
$45.000
```

Es el precio comercial utilizado normalmente en POS.

---

# 21. PRECIO REVENDEDOR

Ejemplo:

```text
Precio revendedor:
$38.000
```

Debe poder seleccionarse según el tipo de cliente o condición comercial.

La aplicación debe permitir posteriormente configurar diferentes listas de precios.

---

# 22. COSTO

La variante puede tener un costo de referencia.

Ejemplo:

```text
Costo:
$22.000
```

El costo es importante para:

- Margen.
- Rentabilidad.
- Reportes.
- Compras.
- Análisis de productos.

El costo no debe mostrarse necesariamente a vendedores.

---

# 23. MARGEN

El sistema podrá calcular:

```text
Margen = Precio de venta - Costo
```

y:

```text
Margen % =
((Precio de venta - Costo) / Precio de venta) × 100
```

El cálculo debe utilizar el costo vigente definido para la operación correspondiente.

---

# 24. STOCK NO PERTENECE AL PRODUCTO GENERAL

Esta regla es crítica.

El stock debe asociarse a:

```text
VARIANTE
+
UBICACIÓN
```

Ejemplo:

```text
Remera Básica
Negro / M
```

puede tener:

```text
Sucursal Centro: 8
Sucursal Norte: 3
Depósito: 15
```

---

# 25. INVENTARIO POR UBICACIÓN

Conceptualmente:

```text
Inventory
```

debe relacionar:

```text
variantId
locationId
physicalQuantity
reservedQuantity
```

y calcular:

```text
availableQuantity
```

como:

```text
availableQuantity =
physicalQuantity - reservedQuantity
```

---

# 26. STOCK FÍSICO

Representa las unidades físicamente existentes en una ubicación.

Ejemplo:

```text
Físico: 10
```

---

# 27. STOCK RESERVADO

Representa unidades comprometidas por reservas activas.

Ejemplo:

```text
Físico: 10
Reservado: 3
```

Entonces:

```text
Disponible: 7
```

---

# 28. STOCK DISPONIBLE

Regla:

```text
Disponible =
Stock físico
-
Stock reservado
```

El stock disponible es el que puede ofrecerse para una nueva venta, sujeto a otras reglas del negocio.

---

# 29. STOCK EN TRÁNSITO

Las mercaderías transferidas entre ubicaciones no deben considerarse automáticamente disponibles en destino.

Ejemplo:

```text
Depósito
↓
Despachado
↓
En tránsito
↓
Sucursal
```

Mientras está en tránsito debe poder identificarse separadamente.

---

# 30. ESTADOS DE INVENTARIO

El sistema debe distinguir al menos:

```text
PHYSICAL
RESERVED
IN_TRANSIT
AVAILABLE
```

No necesariamente todos serán columnas independientes.

La implementación definitiva deberá seguir `05_INVENTARIO_Y_STOCK.md`.

---

# 31. UBICACIONES

El stock puede existir en:

```text
DEPÓSITO CENTRAL
SUCURSAL 1
SUCURSAL 2
SUCURSAL 3
SUCURSAL 4
SUCURSAL 5
```

En el futuro pueden existir sububicaciones.

Ejemplo:

```text
Depósito
├── Sector A
├── Sector B
└── Sector C
```

No es obligatorio implementarlo en la DEMO.

---

# 32. ESTADO DEL PRODUCTO

Estados:

```text
ACTIVE
INACTIVE
```

Un producto inactivo no debe aparecer para nuevas operaciones comerciales normales.

Sin embargo, su historial debe permanecer disponible.

---

# 33. ESTADO DE LA VARIANTE

Una variante puede tener:

```text
ACTIVE
INACTIVE
```

Esto permite desactivar una combinación concreta.

Ejemplo:

```text
Remera Básica

Negro / S → ACTIVE
Negro / M → ACTIVE
Negro / L → INACTIVE
```

---

# 34. PRODUCTO SIN STOCK

Un producto sin stock no debe eliminarse.

Debe seguir existiendo para:

- Historial.
- Reportes.
- Ventas anteriores.
- Compras anteriores.
- Reposición futura.
- Análisis de rotación.

---

# 35. PRODUCTO DESCATALOGADO

Si un producto deja de venderse:

```text
Producto
↓
INACTIVE
```

No se debe borrar.

Las operaciones históricas deben continuar mostrando correctamente:

- Nombre.
- Variante.
- SKU.
- Precio histórico.
- Movimientos.

---

# 36. FOTOGRAFÍAS

El producto podrá tener:

```text
mainImage
images[]
```

Las imágenes pertenecen normalmente al producto/modelo.

Si una variante requiere imágenes específicas, podrá soportarse posteriormente.

No es necesario complicar la DEMO con gestión avanzada de imágenes.

---

# 37. ETIQUETAS

El sistema debe permitir generar etiquetas para variantes.

Una etiqueta puede contener:

```text
Marca
Producto
Color
Talle
SKU
Código de barras
Precio
```

Ejemplo conceptual:

```text
--------------------------------
      VM CLOTHING
      REMERA BÁSICA

Color: NEGRO
Talle: M

$45.000

SKU: REM-BAS-NEG-M
||||||||||||||||||
Código de barras
--------------------------------
```

---

# 38. GENERACIÓN DE ETIQUETAS

El depósito podrá seleccionar:

```text
Producto
↓
Variantes
↓
Cantidad de etiquetas
↓
Generar
↓
Imprimir
```

Ejemplo:

```text
REM-BAS-NEG-M
Cantidad:
20 etiquetas
```

---

# 39. PRODUCTOS RECIBIDOS DE PROVEEDOR

Cuando se recibe mercadería:

```text
Proveedor
↓
Compra
↓
Recepción
↓
Producto / Variante
↓
Stock depósito
```

La recepción debe utilizar la variante correcta.

No crear automáticamente un nuevo producto si la variante ya existe.

---

# 40. PREVENCIÓN DE DUPLICADOS

Antes de crear:

```text
Producto
```

el sistema debe permitir buscar coincidencias.

Antes de crear:

```text
Variante
```

debe validar:

```text
SKU
Barcode
Producto + Color + Talle
```

según las reglas de unicidad configuradas.

---

# 41. REGLA CONTRA DUPLICACIÓN

Nunca crear:

```text
Remera Negra M
```

como un producto completamente independiente si corresponde a una variante de:

```text
Remera Básica
```

La estructura correcta será:

```text
Producto:
Remera Básica

Variante:
Negro / M
```

---

# 42. CAMBIO DE PRECIO

Los cambios de precio deben quedar auditados.

Debe poder conocerse:

```text
Precio anterior
Precio nuevo
Usuario
Fecha
Motivo
```

Las ventas históricas no deben recalcularse automáticamente con el precio actual.

---

# 43. PRECIO HISTÓRICO

Una venta debe conservar el precio aplicado en el momento de la operación.

Ejemplo:

```text
Precio actual:
$50.000

Precio de venta histórica:
$45.000
```

La venta debe continuar mostrando:

```text
$45.000
```

---

# 44. DESCUENTO

El descuento aplicado durante una venta no debe modificar el precio base del producto.

Ejemplo:

```text
Precio:
$50.000

Descuento:
10%

Precio final:
$45.000
```

Debe quedar registrado:

```text
precioBase
discountType
discountValue
finalPrice
```

La autorización dependerá de `02_ROLES_Y_PERMISOS.md`.

---

# 45. PRODUCTO PARA REVENTA

Cuando una operación utilice precio revendedor:

```text
Lista:
RESELLER
```

El sistema debe identificar qué lista fue utilizada.

No modificar el precio base de la variante.

---

# 46. PRODUCTOS CON MÚLTIPLES PRECIOS

La arquitectura debe permitir posteriormente:

```text
PUBLICO
MAYORISTA
REVENDEDOR
PROMOCIONAL
```

Cada lista puede tener un precio diferente.

La DEMO puede comenzar con:

```text
PUBLICO
REVENDEDOR
```

---

# 47. COSTO DE MERCADERÍA

Cuando se reciba una compra, el sistema debe poder registrar el costo de adquisición.

Ejemplo:

```text
Proveedor:
$20.000

Precio venta:
$45.000
```

La forma definitiva de calcular costo promedio, último costo o costo histórico se definirá en:

`05_INVENTARIO_Y_STOCK.md`

y:

`07_COMPRAS_Y_PROVEEDORES.md`.

No inventar una metodología de valuación definitiva todavía.

---

# 48. PRODUCTOS DE PUBLICIDAD

Los productos retirados para publicidad deben seguir siendo identificables por variante.

Ejemplo:

```text
Remera Básica
Negro / M
SKU: REM-BAS-NEG-M
```

Si sale de la sucursal para publicidad:

```text
Movimiento:
MARKETING_LOAN
```

Debe mantener trazabilidad.

La gestión completa se define en:

`15_PRESTAMOS_PUBLICIDAD.md`.

---

# 49. PRODUCTOS RESERVADOS

Una variante puede tener:

```text
Físico: 8
Reservado: 2
Disponible: 6
```

Una reserva no debe crear un producto diferente.

Debe modificar el estado/disponibilidad de la variante mediante inventario.

La gestión completa estará en:

`14_RESERVAS_Y_SEÑAS.md`.

---

# 50. PRODUCTOS DEVUELTOS / CAMBIOS

Un producto devuelto debe continuar utilizando la misma variante.

Ejemplo:

```text
Venta
↓
Cambio
↓
Devuelve:
Camisa Azul / M
↓
Ingresa nuevamente al inventario
```

El sistema no debe crear una nueva variante para representar el cambio.

---

# 51. TRAZABILIDAD

Cada variante debe poder responder:

```text
¿Qué producto es?

¿Qué color tiene?

¿Qué talle tiene?

¿Cuál es su SKU?

¿Cuál es su código de barras?

¿Cuánto cuesta?

¿Cuánto stock existe?

¿Dónde está?

¿Cuánto está reservado?

¿Cuánto está disponible?

¿De qué proveedor provino?

¿Qué movimientos tuvo?

¿En qué ventas apareció?
```

---

# 52. MODELO CONCEPTUAL

Relación:

```text
Company
   │
   ├── Product
   │      │
   │      ├── Category
   │      ├── Brand
   │      │
   │      └── ProductVariant
   │             │
   │             ├── Color
   │             ├── Size
   │             ├── SKU
   │             ├── Barcode
   │             ├── Prices
   │             └── Inventory
   │
   └── Locations
          │
          └── Inventory
```

---

# 53. EJEMPLO COMPLETO

## Producto

```text
Nombre:
Remera Básica

Categoría:
Remeras

Marca:
Marca Propia
```

## Variantes

```text
SKU: REM-BAS-NEG-S
Color: Negro
Talle: S

SKU: REM-BAS-NEG-M
Color: Negro
Talle: M

SKU: REM-BAS-NEG-L
Color: Negro
Talle: L

SKU: REM-BAS-BLA-S
Color: Blanco
Talle: S

SKU: REM-BAS-BLA-M
Color: Blanco
Talle: M
```

## Stock

```text
REM-BAS-NEG-M

Depósito:
15

Sucursal Centro:
5

Sucursal Norte:
3

Sucursal Sur:
2

Reservado:
2
```

Disponible por ubicación:

```text
Depósito:
15

Centro:
5 - 2 reservadas = 3 disponibles

Norte:
3

Sur:
2
```

---

# 54. BÚSQUEDA GLOBAL

El sistema debe permitir buscar por:

```text
Nombre
SKU
Barcode
Categoría
Marca
Color
Talle
```

Ejemplo:

```text
Buscar:
REM-BAS-NEG-M
```

Resultado:

```text
Remera Básica
Negro / M
SKU: REM-BAS-NEG-M
Stock disponible: 8
```

---

# 55. FILTROS

El catálogo administrativo debe permitir filtrar por:

- Categoría.
- Marca.
- Color.
- Talle.
- Estado.
- Stock.
- Sucursal.
- Precio.
- SKU.
- Barcode.

---

# 56. ALERTA DE STOCK

Las variantes pueden tener un nivel mínimo configurable.

Ejemplo:

```text
Stock actual:
2

Stock mínimo:
5

Estado:
REPOSICIÓN NECESARIA
```

Esto permitirá posteriormente construir:

- Alertas.
- Reportes de reposición.
- Recomendaciones de compra.

---

# 57. STOCK MÍNIMO Y MÁXIMO

La arquitectura puede soportar:

```text
minimumStock
maximumStock
```

por variante y ubicación.

Esto permitirá definir políticas diferentes por sucursal.

Ejemplo:

```text
Sucursal Centro:
mínimo 5

Sucursal Norte:
mínimo 2
```

No es obligatorio implementar reglas avanzadas de reposición en la primera DEMO.

---

# 58. IMPORTACIÓN MASIVA

La versión productiva deberá contemplar la posibilidad de importar productos mediante Excel/CSV.

Ejemplo de columnas:

```text
Producto
Categoría
Marca
Color
Talle
SKU
Barcode
Costo
Precio
Precio Revendedor
Stock
```

La DEMO puede utilizar datos precargados.

---

# 59. REGLAS DE NEGOCIO

### Regla 1

Un producto puede tener múltiples variantes.

### Regla 2

Una variante pertenece a un único producto.

### Regla 3

Una variante puede tener color y talle.

### Regla 4

Cada variante debe tener un SKU único.

### Regla 5

El barcode debe ser único cuando exista.

### Regla 6

El stock pertenece a la variante y ubicación.

### Regla 7

El stock reservado no debe confundirse con stock disponible.

### Regla 8

Los productos no deben eliminarse si poseen historial operativo.

### Regla 9

Las ventas históricas conservan el precio aplicado.

### Regla 10

Un descuento no modifica el precio base.

### Regla 11

Cambiar de usuario en un POS no modifica ventas anteriores.

### Regla 12

Una variante existente no debe duplicarse durante una recepción.

### Regla 13

Un cambio de prenda no crea un producto nuevo.

### Regla 14

Una reserva no crea un producto nuevo.

### Regla 15

Un préstamo publicitario no crea un producto nuevo.

---

# 60. DEMO

La DEMO debe incluir suficientes productos para demostrar:

```text
5 sucursales
+
Depósito central
+
Variantes
+
Talles
+
Colores
+
SKU
+
Barcode
+
Stock distribuido
+
Stock reservado
+
Precios
+
Precio revendedor
```

Debe existir variedad suficiente para demostrar:

- Ventas.
- Transferencias.
- Reservas.
- Cambios.
- Reposición.
- Préstamos publicitarios.
- Reportes.

---

# 61. DATOS DEMO SUGERIDOS

Ejemplos:

```text
Remera Básica
Camisa Oxford
Jean Slim
Pantalón Cargo
Buzo Oversize
Campera Denim
Vestido Midi
```

Cada producto debe tener varias combinaciones de:

```text
Color
+
Talle
```

---

# 62. PREPARACIÓN PARA PRODUCCIÓN

El modelo debe poder evolucionar hacia:

```text
Product
ProductVariant
Category
Brand
Color
Size
Barcode
PriceList
PriceListItem
Inventory
StockMovement
```

La estructura definitiva de base de datos se definirá en:

`24_MODELO_DE_DATOS.md`

No implementar un modelo definitivo de base de datos antes de aprobar ese documento.

---

# 63. CRITERIOS DE ACEPTACIÓN

El módulo se considera correcto cuando:

### Producto

Se puede crear un producto.

### Variante

Se pueden crear variantes por color/talle.

### Identificación

Cada variante tiene SKU único.

### Código

Puede asociarse un barcode.

### Precios

Puede existir precio público y precio revendedor.

### Stock

El stock puede visualizarse por sucursal.

### Reservas

El stock reservado se diferencia del disponible.

### Búsqueda

El POS puede localizar una variante por SKU/barcode/nombre.

### Historial

Los productos con operaciones no se eliminan físicamente.

### Etiquetas

Se pueden generar etiquetas de variantes.

---

# 64. PRINCIPIO FINAL

El sistema debe pensar la indumentaria de esta forma:

```text
PRODUCTO
"Remera Básica"
        │
        ├── NEGRO / S
        ├── NEGRO / M
        ├── NEGRO / L
        ├── BLANCO / S
        ├── BLANCO / M
        └── BLANCO / L
                 │
                 ↓
              SKU
                 │
                 ↓
              STOCK
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
     DEPÓSITO  SUC 1    SUC 2
```

**El producto representa el modelo comercial.**

**La variante representa la unidad comercial diferenciable.**

**El inventario representa dónde se encuentra y cuál es su disponibilidad.**

Esta separación debe mantenerse en todo el sistema.

---

**Estado:** DRAFT  
**Versión:** 1.0  
**Última actualización:** 2026-09-02
