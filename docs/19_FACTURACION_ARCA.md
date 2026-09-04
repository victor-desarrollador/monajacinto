# 19_FACTURACION_ARCA.md

# VM DIGITAL STUDIO — SISTEMA DE GESTIÓN MULTISUCURSAL

## Módulo 19 — Facturación ARCA

**Versión:** 1.0
**Estado:** Especificación funcional
**Prioridad:** Crítica
**Dependencias:** Ventas, clientes, sucursales, POS, caja, pagos, productos, auditoría

---

# 1. OBJETIVO

El módulo de facturación debe permitir transformar una operación comercial del sistema en un comprobante fiscal válido ante ARCA cuando corresponda.

Debe manejar de forma separada:

```text
Venta comercial
      ↓
Comprobante fiscal
      ↓
Solicitud de autorización
      ↓
ARCA
      ↓
CAE / CAEA
      ↓
Comprobante autorizado
```

### Principio fundamental

> **Una venta no es una factura.**

Una `Sale` representa la operación comercial.

Una `Invoice` representa el comprobante fiscal asociado.

Esto permite que el sistema pueda manejar:

* ventas pendientes;
* ventas canceladas;
* facturas rechazadas;
* reintentos;
* notas de crédito;
* contingencias;
* comprobantes autorizados;
* comprobantes anulados/corregidos mediante documentos posteriores.

---

# 2. ALCANCE

El módulo debe contemplar:

* Facturas electrónicas.
* Notas de crédito.
* Notas de débito.
* Facturas A.
* Facturas B.
* Facturas C.
* Facturas E cuando corresponda.
* Punto de venta.
* Numeración.
* Solicitud de CAE.
* CAE.
* Fecha de vencimiento del CAE.
* Respuesta ARCA.
* Errores y rechazos.
* Consulta de comprobantes.
* Consulta del último comprobante autorizado.
* Asociación con la venta.
* Asociación con cliente.
* Representación gráfica.
* QR cuando corresponda.
* Auditoría.
* Contingencia.

La disponibilidad concreta de cada tipo de comprobante debe depender de la condición fiscal y configuración real del contribuyente.

ARCA establece que los tipos de comprobantes dependen de la condición del emisor y del receptor; por ejemplo, en determinados escenarios corresponden comprobantes A, B o C.

---

# 3. RESPONSABILIDAD FISCAL

El sistema debe distinguir entre:

```text
Reglas comerciales
```

y:

```text
Reglas fiscales
```

Ejemplo:

```text
Sale
total = $100.000
```

es una regla comercial.

Mientras que:

```text
Invoice
tipo = B
CAE = XXXXX
```

es una operación fiscal.

---

# 4. VENTA VS FACTURA

Modelo:

```text
Sale
 ├── SaleItems
 ├── Payments
 ├── Customer
 └── Invoice
       ├── InvoiceItems
       ├── Authorization
       └── FiscalData
```

Una venta puede existir antes de tener comprobante autorizado.

Ejemplo:

```text
Sale:
COMPLETED

Invoice:
PENDING
```

Posteriormente:

```text
Invoice:
AUTHORIZED
```

---

# 5. CONDICIÓN FISCAL DEL EMISOR

La empresa debe tener configurada su condición fiscal.

Ejemplos:

```text
RESPONSABLE_INSCRIPTO
MONOTRIBUTISTA
EXENTO
OTRO
```

Esta configuración influye en los comprobantes que pueden emitirse.

No debe estar hardcodeada en el frontend.

---

# 6. CONDICIÓN FISCAL DEL CLIENTE

El cliente puede tener:

```text
CONSUMIDOR_FINAL
RESPONSABLE_INSCRIPTO
MONOTRIBUTISTA
EXENTO
NO_RESPONSABLE
OTRO
```

El sistema debe utilizar esta información para determinar el tipo de comprobante aplicable según las reglas fiscales configuradas.

---

# 7. TIPOS DE COMPROBANTE

El sistema debe contemplar como mínimo:

```text
FACTURA_A
FACTURA_B
FACTURA_C
FACTURA_E

NOTA_CREDITO_A
NOTA_CREDITO_B
NOTA_CREDITO_C
NOTA_CREDITO_E

NOTA_DEBITO_A
NOTA_DEBITO_B
NOTA_DEBITO_C
NOTA_DEBITO_E
```

La configuración final debe respetar las habilitaciones fiscales reales del contribuyente.

ARCA actualmente contempla facturas, recibos y notas de crédito/débito de distintas clases dentro del régimen de factura electrónica.

---

# 8. FACTURA A

Debe soportar los escenarios autorizados por ARCA.

Actualmente ARCA contempla:

```text
A
A con leyenda "Pago en CBU informada"
A con leyenda "Operación sujeta a retención"
```

La aplicabilidad depende de la situación fiscal del emisor.

El sistema no debe asumir que todo Responsable Inscripto puede emitir cualquier variante de A.

---

# 9. FACTURA B

Debe soportarse para las operaciones donde corresponda.

Ejemplo:

```text
Emisor:
Responsable Inscripto

Cliente:
Consumidor Final

Comprobante:
Factura B
```

ARCA establece el uso de comprobantes B para determinadas operaciones de responsables inscriptos con consumidores finales, exentos y otros sujetos indicados por la normativa.

---

# 10. FACTURA C

Debe soportarse para contribuyentes que correspondan.

Ejemplo:

```text
Emisor:
Monotributista

Comprobante:
Factura C
```

ARCA indica que monotributistas o sujetos exentos en IVA emiten comprobantes C para sus operaciones, salvo las excepciones correspondientes.

---

# 11. FACTURA E

Debe existir soporte arquitectónico para exportaciones.

No necesariamente forma parte del demo inicial.

```text
Sale
 ↓
Export Operation
 ↓
Invoice E
```

---

# 12. PUNTO DE VENTA

El sistema debe manejar explícitamente el:

```text
pointOfSale
```

No debe confundirse con:

```text
POS terminal
```

Son conceptos diferentes.

### POS terminal

Es el dispositivo/sistema desde donde opera el vendedor.

### Punto de venta fiscal

Es el identificador utilizado para la facturación.

Ejemplo:

```text
POS físico:
TERMINAL-02

Punto de venta fiscal:
0003
```

---

# 13. NUMERACIÓN

El comprobante debe conservar:

```text
invoiceType
pointOfSale
invoiceNumber
```

Ejemplo:

```text
Factura B

Punto de venta:
0003

Número:
00001258
```

La combinación debe ser tratada como identificador fiscal relevante.

No debe generarse una numeración independiente únicamente en frontend.

---

# 14. CORRELATIVIDAD

El sistema debe controlar la numeración.

Nunca:

```text
Factura:
00001258
```

y luego:

```text
Factura:
00001258
```

para otro comprobante del mismo punto de venta/tipo cuando no corresponda.

La numeración fiscal debe seguir las reglas y autorizaciones correspondientes.

---

# 15. AUTORIZACIÓN

La factura electrónica debe pasar por un proceso de autorización.

Conceptualmente:

```text
Invoice
   ↓
Build request
   ↓
ARCA Web Service
   ↓
Response
   ↓
AUTHORIZED / REJECTED
```

ARCA mantiene webservices oficiales para factura electrónica; `WSFEv1` contempla comprobantes A, B, C y M sin detalle de ítems, además de CAE/CAEA para los comprobantes contemplados por el servicio.

---

# 16. WSFEV1

La arquitectura debe aislar la integración ARCA.

No colocar llamadas SOAP directamente dentro de:

```text
SaleController
```

Debe existir una capa:

```text
ARCAService
```

o:

```text
FiscalProvider
```

Ejemplo:

```text
SaleService
      ↓
InvoiceService
      ↓
ARCAService
      ↓
WSFEv1
```

---

# 17. CREDENCIALES

Las credenciales fiscales nunca deben almacenarse:

* en frontend;
* en Git;
* en archivos públicos;
* en variables expuestas al navegador;
* dentro del repositorio.

Deben estar protegidas mediante:

```text
Environment Variables
Secret Manager
```

cuando corresponda.

---

# 18. CERTIFICADOS

La integración productiva puede requerir certificados digitales y credenciales de autenticación.

La arquitectura debe separar:

```text
Development
Testing / Homologación
Production
```

Nunca utilizar certificados productivos dentro del entorno de desarrollo.

---

# 19. ENTORNOS

Debe existir:

```text
ARCA_ENV=HOMOLOGACION
```

para pruebas.

Y:

```text
ARCA_ENV=PRODUCCION
```

para operaciones reales.

El cambio debe ser explícito.

---

# 20. ESTADOS DE FACTURA

Estados mínimos:

```text
DRAFT
PENDING_AUTHORIZATION
AUTHORIZED
REJECTED
CANCELLED
VOIDED
CONTINGENCY
```

### DRAFT

Factura preparada pero no enviada.

### PENDING_AUTHORIZATION

Solicitud enviada/proceso pendiente.

### AUTHORIZED

ARCA autorizó.

### REJECTED

ARCA rechazó.

### CANCELLED

Cancelada según la lógica interna permitida.

### VOIDED

Estado utilizado únicamente cuando corresponda según la lógica fiscal.

### CONTINGENCY

Operación emitida bajo procedimiento de contingencia.

---

# 21. CAE

Una factura electrónica autorizada debe almacenar:

```text
CAE
CAE_EXPIRATION_DATE
```

Ejemplo:

```text
CAE:
71234567890123

Vencimiento:
2026-09-15
```

El CAE debe conservarse como dato fiscal histórico.

---

# 22. RESPUESTA DE ARCA

No almacenar únicamente:

```text
success = true
```

Debe conservarse información suficiente para auditoría y diagnóstico.

Ejemplo conceptual:

```text
ARCAAuthorization
 ├── requestId
 ├── responseCode
 ├── result
 ├── cae
 ├── caeExpirationDate
 ├── observations
 ├── errors
 ├── rawResponseReference
 └── timestamps
```

---

# 23. ERRORES

Debe distinguirse:

```text
ERROR DE RED
ERROR DE AUTENTICACIÓN
ERROR DE VALIDACIÓN
RECHAZO FISCAL
ERROR INTERNO
TIMEOUT
```

No todos significan lo mismo.

---

# 24. TIMEOUT

Caso crítico:

```text
Sistema envía factura
       ↓
ARCA procesa
       ↓
Timeout
```

El sistema no debe asumir automáticamente:

```text
REJECTED
```

porque puede haber sido autorizada.

Debe existir una estrategia de consulta.

Conceptualmente:

```text
TIMEOUT
  ↓
QUERY ARCA
  ↓
AUTHORIZED / NOT FOUND / ERROR
```

---

# 25. IDEMPOTENCIA

Una solicitud fiscal no debe duplicar comprobantes.

Debe existir una referencia interna:

```text
invoiceRequestId
```

o mecanismo equivalente.

Antes de reintentar:

```text
¿La operación ya fue autorizada?
```

Debe consultarse.

---

# 26. CONSULTA DE COMPROBANTE

Debe existir una función conceptual:

```text
getInvoiceStatus()
```

que permita verificar el estado fiscal.

También debe contemplarse la consulta del último comprobante autorizado para evitar problemas de numeración.

---

# 27. SEPARACIÓN DE NUMERACIÓN

El backend debe ser responsable de:

```text
pointOfSale
invoiceType
invoiceNumber
```

Nunca el navegador.

Ejemplo:

```text
Frontend:
"emitir factura"

Backend:
determina número
      ↓
arma solicitud
      ↓
ARCA
      ↓
guarda CAE
```

---

# 28. DATOS DEL CLIENTE

La factura debe conservar los datos fiscales necesarios.

Conceptualmente:

```text
Customer
 ├── name
 ├── taxId
 ├── taxCondition
 ├── address
 └── fiscalData
```

Los datos deben quedar congelados en el comprobante emitido.

Si mañana cambia el domicilio del cliente:

> La factura histórica no debe cambiar.

---

# 29. SNAPSHOT FISCAL

La factura debe almacenar un snapshot de los datos utilizados al momento de emisión.

Ejemplo:

```text
Invoice
 ├── customerNameSnapshot
 ├── customerTaxIdSnapshot
 ├── customerTaxConditionSnapshot
 ├── customerAddressSnapshot
 ├── issuerSnapshot
 └── fiscalDataSnapshot
```

Esto protege la integridad histórica.

---

# 30. ITEMS

Cada factura debe conservar:

```text
description
quantity
unitPrice
discount
subtotal
tax
total
```

Cuando corresponda según el webservice utilizado, debe contemplarse el nivel de detalle requerido.

La documentación oficial de ARCA para servicios de factura electrónica define campos como código, descripción, cantidad, unidad de medida y precio unitario para esquemas con detalle de productos.

---

# 31. PRODUCTO VS DESCRIPCIÓN FISCAL

No asumir que:

```text
Product.name
```

es necesariamente suficiente para la representación fiscal.

Debe poder generarse:

```text
fiscalDescription
```

cuando sea necesario.

---

# 32. IMPUESTOS

El modelo debe quedar preparado para:

```text
VAT
OTHER_TAX
PERCEPTION
RETENTION
```

La lógica concreta dependerá de la condición fiscal y operación.

No hardcodear una única alícuota para todo el sistema.

---

# 33. PRECIOS

La factura debe preservar el precio fiscal utilizado.

Ejemplo:

```text
Precio unitario:
$100.000

Cantidad:
2

Subtotal:
$200.000
```

Nunca recalcular una factura histórica utilizando el precio actual del producto.

---

# 34. DESCUENTOS

Los descuentos deben quedar registrados.

Ejemplo:

```text
Precio:
$100.000

Descuento:
$10.000

Neto:
$90.000
```

Esto es especialmente importante para:

* promociones;
* descuentos autorizados;
* ventas de empleados;
* campañas;
* devoluciones.

---

# 35. RELACIÓN CON LA VENTA

Una factura debe tener:

```text
saleId
```

cuando derive de una venta.

Ejemplo:

```text
Sale:
V-000123

Invoice:
B-0003-00001258
```

---

# 36. RELACIÓN CON PAGOS

La factura y el pago son entidades distintas.

```text
Invoice
     +
Payment
```

Una factura puede:

* estar pagada;
* estar parcialmente pagada;
* estar pendiente;
* haber sido emitida antes de cobrar.

No mezclar:

```text
fiscal status
```

con:

```text
payment status
```

---

# 37. FACTURACIÓN EN CAJA

Flujo:

```text
POS
 ↓
Sale
 ↓
Cashier
 ↓
Payment
 ↓
Sale completed
 ↓
Invoice
 ↓
ARCA
 ↓
CAE
 ↓
Comprobante
```

La interfaz puede permitir que la facturación se dispare durante la finalización de la operación.

---

# 38. ERROR DE FACTURACIÓN

Si:

```text
Payment = OK
ARCA = REJECTED
```

no debe eliminarse la venta.

Debe quedar:

```text
Sale:
COMPLETED

Payment:
PAID

Invoice:
REJECTED
```

Luego se debe resolver la emisión fiscal mediante un flujo controlado.

---

# 39. FACTURA RECHAZADA

Nunca cambiar manualmente:

```text
REJECTED → AUTHORIZED
```

El sistema debe obtener una nueva autorización válida.

---

# 40. NOTA DE CRÉDITO

Las devoluciones y correcciones fiscales deben utilizar notas de crédito cuando corresponda.

Modelo:

```text
Original Invoice
      ↓
Return / Exchange
      ↓
Credit Note
      ↓
ARCA
```

ARCA indica que las notas de crédito y débito deben relacionarse con comprobantes de las operaciones originarias y cumplir las formalidades correspondientes.

---

# 41. NOTA DE DÉBITO

Debe existir soporte para operaciones que requieran incrementar el importe fiscal de una operación previa.

Modelo:

```text
Original Invoice
      ↓
Debit Note
      ↓
ARCA
```

No debe utilizarse como mecanismo genérico para corregir cualquier error.

---

# 42. CAMBIOS Y DEVOLUCIONES

El módulo:

```text
16_CAMBIOS_Y_DEVOLUCIONES.md
```

debe ser la fuente de la operación comercial.

Facturación solamente representa la consecuencia fiscal.

```text
ReturnExchange
      ↓
Financial adjustment
      ↓
Stock adjustment
      ↓
Fiscal document
```

---

# 43. CONTINGENCIA

El sistema debe contemplar que la facturación electrónica puede tener contingencias.

ARCA contempla modalidades y mecanismos específicos para situaciones de contingencia.

El sistema debe registrar:

```text
contingency
reason
startedAt
endedAt
operator
reference
```

---

# 44. NO INVENTAR CAE

Durante el demo:

```text
CAE DEMO
```

debe ser claramente ficticio.

Nunca generar un número que parezca real y presentarlo como autorizado.

---

# 45. DEMO

La demo debe mostrar:

```text
COMPROBANTE DEMOSTRATIVO
SIN VALIDEZ FISCAL
```

Y:

```text
CAE:
SIMULADO
```

No debe conectarse accidentalmente a producción.

---

# 46. REPRESENTACIÓN GRÁFICA

Debe poder generarse una representación del comprobante.

Ejemplo:

```text
----------------------------------
          EMPRESA XYZ
          CUIT XX-XXXXXXXX-X

FACTURA B

Punto de Venta: 0003
Comprobante: 00001258

Fecha: 03/09/2026

Cliente:
Consumidor Final

----------------------------------

Producto       Cant.       Total
Campera          1        $120.000

----------------------------------
TOTAL                    $120.000

CAE: XXXXX
Vto: XX/XX/XXXX

Código QR
----------------------------------
```

En demo:

```text
CAE SIMULADO
SIN VALIDEZ FISCAL
```

---

# 47. QR

La arquitectura debe dejar preparado el comprobante para incorporar la información QR exigida cuando corresponda.

No hardcodear una imagen ficticia en producción.

El contenido debe generarse a partir de los datos fiscales válidos.

---

# 48. ALMACENAMIENTO

La factura debe guardar como mínimo:

```text
Invoice
 ├── id
 ├── saleId
 ├── type
 ├── pointOfSale
 ├── number
 ├── issueDate
 ├── customerId
 ├── customerSnapshot
 ├── subtotal
 ├── taxes
 ├── total
 ├── status
 ├── cae
 ├── caeExpirationDate
 ├── authorizationResult
 ├── observations
 ├── errors
 ├── environment
 ├── createdAt
 └── updatedAt
```

---

# 49. AUTORIZACIÓN

Entidad conceptual:

```text
InvoiceAuthorization
```

Campos:

```text
id
invoiceId
environment
requestId
attemptNumber
requestedAt
respondedAt
result
cae
caeExpirationDate
observations
errors
createdAt
```

Esto permite conservar historial de intentos.

---

# 50. AUDITORÍA

Registrar:

```text
Quién
Qué
Cuándo
Venta
Factura
Punto de venta
Número
Solicitud
Respuesta
Resultado
Error
Reintento
```

Especialmente:

```text
AUTHORIZATION_REQUESTED
AUTHORIZATION_APPROVED
AUTHORIZATION_REJECTED
AUTHORIZATION_RETRY
INVOICE_CANCELLED
CREDIT_NOTE_CREATED
DEBIT_NOTE_CREATED
```

---

# 51. SEGURIDAD

Las credenciales fiscales son información crítica.

Debe aplicarse:

* Secret management.
* Cifrado cuando corresponda.
* Acceso mínimo.
* Auditoría.
* Rotación.
* Separación de entornos.
* Prohibición de exposición al frontend.

---

# 52. PRODUCCIÓN — ARQUITECTURA

```text
React
  ↓
Node / Express
  ↓
InvoiceService
  ↓
FiscalProvider
  ↓
ARCAAdapter
  ↓
WSFEv1
  ↓
ARCA
```

El sistema debe poder reemplazar:

```text
ARCAAdapter
```

sin modificar:

```text
SaleService
```

---

# 53. FISCAL PROVIDER

Diseñar una abstracción:

```text
FiscalProvider
```

Ejemplo conceptual:

```text
authorizeInvoice()
getInvoice()
getLastAuthorizedNumber()
createCreditNote()
createDebitNote()
```

Implementación:

```text
ARCAFiscalProvider
```

Esto permite futuras integraciones sin acoplar todo el dominio.

---

# 54. PRODUCCIÓN — TRANSACCIÓN

La emisión fiscal debe coordinar:

```text
Sale
Invoice
Authorization
```

con cuidado.

No debe mantenerse una transacción de base de datos abierta mientras se espera indefinidamente una respuesta externa.

Se recomienda:

```text
1. Crear intento
2. Persistir estado
3. Solicitar autorización
4. Procesar respuesta
5. Persistir resultado
6. Actualizar estado
```

---

# 55. RETRY

Los reintentos deben diferenciar:

```text
Retry seguro
```

de:

```text
Retry peligroso
```

Un timeout no debe generar automáticamente otra factura sin consultar primero el estado.

---

# 56. HOMOLOGACIÓN

Antes de producción debe existir una fase de pruebas:

```text
Development
   ↓
ARCA Homologación
   ↓
Validación
   ↓
Producción
```

El sistema debe poder utilizar credenciales y endpoints diferentes por entorno.

---

# 57. PUNTO DE VENTA POR SUCURSAL

La arquitectura debe permitir:

```text
Sucursal Centro
   ↓
Punto de venta fiscal 0001

Sucursal Norte
   ↓
Punto de venta fiscal 0002

Sucursal Sur
   ↓
Punto de venta fiscal 0003
```

La configuración real dependerá de cómo la empresa organice sus puntos de venta ante ARCA.

No asumir que:

```text
1 sucursal = 1 punto fiscal
```

obligatoriamente.

---

# 58. VARIOS POS

Una sucursal puede tener:

```text
POS 01
POS 02
POS 03
```

pero compartir un punto de venta fiscal.

Por lo tanto:

```text
POS terminal ≠ punto de venta fiscal
```

El backend debe controlar la numeración.

---

# 59. REPORTES

Debe permitir:

### Facturación

* Facturas emitidas.
* Facturas autorizadas.
* Facturas rechazadas.
* Notas de crédito.
* Notas de débito.
* Facturación por sucursal.
* Facturación por período.

### Fiscal

* CAE.
* Vencimiento.
* Punto de venta.
* Numeración.
* Tipo de comprobante.
* Errores ARCA.

### Operativo

* Ventas sin factura.
* Facturas pendientes.
* Rechazos.
* Reintentos.
* Contingencias.

---

# 60. DASHBOARD

Ejemplo:

```text
FACTURACIÓN — AGOSTO

Ventas:
$25.400.000

Facturado:
$24.900.000

Pendiente:
$500.000

Autorizadas:
842

Rechazadas:
7

Notas de crédito:
12
```

---

# 61. ALERTAS

Alertas posibles:

```text
Factura rechazada
CAE próximo a vencer
Problema de autenticación
Servicio ARCA no disponible
Numeración inconsistente
Factura pendiente
Contingencia activa
```

---

# 62. DEMO — ESCENARIO PRINCIPAL

Venta:

```text
Producto:
Campera

Total:
$120.000
```

Cliente:

```text
Consumidor Final
```

Sistema determina:

```text
Factura B
```

Genera:

```text
Punto de venta:
0003

Número:
00000125
```

Simulación:

```text
ARCA:
AUTHORIZED
```

Resultado:

```text
CAE:
SIMULADO

Estado:
AUTHORIZED_DEMO
```

Representación:

```text
COMPROBANTE DEMOSTRATIVO
SIN VALIDEZ FISCAL
```

---

# 63. DEMO — RECHAZO

Simular:

```text
Sale:
COMPLETED

Invoice:
PENDING_AUTHORIZATION
```

ARCA simulada:

```text
REJECTED
```

Mostrar:

```text
Motivo:
Datos fiscales inválidos
```

Permitir:

```text
Revisar
Corregir
Reintentar
```

---

# 64. DEMO — TIMEOUT

Simular:

```text
REQUEST
 ↓
TIMEOUT
```

Estado:

```text
PENDING_VERIFICATION
```

Después:

```text
Consulta
 ↓
AUTHORIZED
```

Esto demuestra que el sistema no duplica comprobantes.

---

# 65. DEMO — NOTA DE CRÉDITO

Venta:

```text
$120.000
```

Devolución:

```text
$120.000
```

Sistema:

```text
ReturnExchange
 ↓
CreditNote
 ↓
Simulated ARCA
```

Resultado:

```text
NC B
Estado:
AUTHORIZED_DEMO
```

---

# 66. REGLAS DE NEGOCIO

### Regla 1

Una venta no es una factura.

### Regla 2

Una factura no es un pago.

### Regla 3

La numeración fiscal es responsabilidad del backend.

### Regla 4

Nunca inventar un CAE real.

### Regla 5

Nunca guardar credenciales fiscales en frontend.

### Regla 6

Nunca asumir que timeout = rechazo.

### Regla 7

Antes de reintentar una solicitud incierta debe verificarse su estado.

### Regla 8

Una factura autorizada no se edita.

### Regla 9

Las correcciones fiscales utilizan documentos fiscales posteriores cuando corresponda.

### Regla 10

Las notas de crédito deben relacionarse con la operación original.

### Regla 11

Los datos fiscales históricos deben conservarse como snapshot.

### Regla 12

Demo y producción deben estar completamente separados.

### Regla 13

Toda autorización debe ser auditable.

### Regla 14

Los puntos de venta fiscales no deben confundirse con las terminales POS.

### Regla 15

El sistema debe soportar múltiples sucursales y múltiples POS sin duplicar la numeración fiscal.

---

# 67. CRITERIOS DE ACEPTACIÓN

* [ ] Existe entidad Invoice.
* [ ] Invoice está relacionada con Sale.
* [ ] Se puede seleccionar tipo de comprobante.
* [ ] Se puede configurar punto de venta.
* [ ] La numeración es controlada por backend.
* [ ] Se conserva el número fiscal.
* [ ] Se conserva CAE.
* [ ] Se conserva vencimiento del CAE.
* [ ] Se registra respuesta de ARCA.
* [ ] Se diferencian errores y rechazos.
* [ ] Se soportan reintentos seguros.
* [ ] Se contempla timeout.
* [ ] Se contempla consulta posterior.
* [ ] Se soportan notas de crédito.
* [ ] Se soportan notas de débito.
* [ ] Se conserva snapshot fiscal.
* [ ] Se registra auditoría.
* [ ] Las credenciales permanecen fuera del frontend.
* [ ] Demo utiliza datos simulados.
* [ ] Demo muestra "SIN VALIDEZ FISCAL".
* [ ] Existe separación homologación/producción.
* [ ] La arquitectura no acopla ventas directamente a ARCA.

---

# 68. DEMO VS PRODUCCIÓN

## DEMO

Implementar:

```text
Invoice
Sale → Invoice
Tipos A/B/C simulados
Punto de venta
Numeración simulada
CAE simulado
Autorización simulada
Rechazo simulado
Timeout simulado
Nota de crédito simulada
Representación gráfica
Auditoría
```

## PRODUCCIÓN

Implementar:

```text
ARCA
WSFEv1 / servicio correspondiente
Autenticación
Certificados
Homologación
Producción
CAE real
Consulta
Reintentos
Contingencia
Notas de crédito/débito
Seguridad
Auditoría
Monitoreo
```

---

# 69. PRINCIPIO FINAL

La arquitectura fiscal debe quedar:

```text
                 ┌──────────────┐
                 │     SALE     │
                 └──────┬───────┘
                        │
                        ↓
                 ┌──────────────┐
                 │   INVOICE    │
                 └──────┬───────┘
                        │
                        ↓
                ┌─────────────────┐
                │ FiscalProvider   │
                └────────┬────────┘
                         │
                         ↓
                 ┌──────────────┐
                 │ ARCA Adapter │
                 └──────┬───────┘
                        │
                        ↓
                      ARCA
                        │
              ┌─────────┴─────────┐
              ↓                   ↓
         AUTHORIZED             REJECTED
              │
              ↓
             CAE
              │
              ↓
       COMPROBANTE FISCAL
```

El objetivo es que **ARCA sea una integración del dominio fiscal y no el corazón de todo el sistema**.

La venta debe seguir funcionando como operación comercial; la facturación debe encargarse de su representación fiscal y autorización correspondiente.
