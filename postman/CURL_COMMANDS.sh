#!/bin/bash
# ====================================================================
# CURL COMMANDS - FALLBACK PARA PRESENTACIÓN NEWHYPE ERP
# ====================================================================
# Usar estos comandos si Postman falla durante la presentación
# ====================================================================

BASE_URL="http://spring.informaticapp.com:5001/New-Hype-Project"

# ====================================================================
# 1. OBTENER TOKEN SUPERADMIN
# ====================================================================
echo "=== 1. LOGIN SUPERADMIN ==="
curl -X POST "$BASE_URL/api/v1/platform/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "superadmin@newhype.pe",
    "password": "SuperAdmin2026"
  }' | python3 -m json.tool

# Guardar token (deberá copiar manualmente)
# TOKEN={copiar accessToken de respuesta arriba}

# ====================================================================
# 2. VERIFICAR TOKEN VÁLIDO (GET /auth/me)
# ====================================================================
echo ""
echo "=== 2. VERIFICAR TOKEN ==="
echo "Cambiar {TOKEN} con el copiado arriba"
curl -X GET "$BASE_URL/api/v1/auth/me" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ====================================================================
# 3. CONFIGURAR EMPRESA (RUC + RAZÓN SOCIAL)
# ====================================================================
echo ""
echo "=== 3. CONFIGURAR EMPRESA (PUT) ==="
curl -X PUT "$BASE_URL/api/v1/configuracion/empresa" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "ruc": "20123456789",
    "razonSocial": "ERP Demo Store S.A.C.",
    "direccion": "Jr. Comercio 123, Lima",
    "telefonoEmpresa": "01-555-1234",
    "emailEmpresa": "info@demoestore.com"
  }' | python3 -m json.tool

# ====================================================================
# 4. VERIFICAR CONFIGURACIÓN (GET)
# ====================================================================
echo ""
echo "=== 4. VERIFICAR CONFIGURACIÓN (GET) ==="
curl -X GET "$BASE_URL/api/v1/configuracion/empresa" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ====================================================================
# 5. CREAR CATEGORÍA
# ====================================================================
echo ""
echo "=== 5. CREAR CATEGORÍA ==="
curl -X POST "$BASE_URL/api/v1/configuracion/categorias" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "POLOS",
    "nombre": "Polos",
    "descripcion": "Camisetas tipo polo"
  }' | python3 -m json.tool

# Guardar categoriaId de respuesta: CATEGORIA_ID={id}

# ====================================================================
# 6. CREAR PRODUCTO
# ====================================================================
echo ""
echo "=== 6. CREAR PRODUCTO ==="
curl -X POST "$BASE_URL/api/v1/productos" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "POLO-001",
    "nombre": "Polo Premium Negro",
    "descripcion": "Polo premium de algodón, color negro",
    "categoriaId": {CATEGORIA_ID},
    "precioCompra": 30.00,
    "precioVenta": 79.90,
    "stock": 50,
    "talla": "M",
    "color": "Negro",
    "material": "Algodón 100%"
  }' | python3 -m json.tool

# Guardar productoId: PRODUCTO_ID={id}

# ====================================================================
# 7. CREAR CLIENTE (ENTIDAD COMERCIAL)
# ====================================================================
echo ""
echo "=== 7. CREAR CLIENTE ==="
curl -X POST "$BASE_URL/api/v1/entidades" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "tipoEntidad": "CLIENTE",
    "tipoDocumento": "DNI",
    "numeroDocumento": "12345678",
    "nombres": "Pedro",
    "apellidos": "Martinez",
    "email": "pedro.martinez@email.com",
    "telefono": "999888777",
    "direccion": "Av. Principal 456"
  }' | python3 -m json.tool

# Guardar clienteId: CLIENTE_ID={id}

# ====================================================================
# 8. CREAR VENTA
# ====================================================================
echo ""
echo "=== 8. CREAR VENTA ==="
curl -X POST "$BASE_URL/api/v1/ventas" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "clienteId": {CLIENTE_ID},
    "almacenId": 1,
    "detalles": [
      {
        "productoId": {PRODUCTO_ID},
        "cantidad": 2,
        "precioUnitario": 79.90
      }
    ]
  }' | python3 -m json.tool

# Guardar ventaId: VENTA_ID={id}

# ====================================================================
# 9. CONFIRMAR PAGO
# ====================================================================
echo ""
echo "=== 9. CONFIRMAR PAGO ==="
curl -X POST "$BASE_URL/api/v1/ventas/{VENTA_ID}/confirmar-pago" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "montoRecibido": 200.00,
    "pagos": [
      {
        "metodoPagoId": 1,
        "monto": 188.56,
        "referencia": "EFECTIVO"
      }
    ]
  }' | python3 -m json.tool

# ====================================================================
# 10. VERIFICAR STOCK (Debe ser 48 = 50 - 2)
# ====================================================================
echo ""
echo "=== 10. VERIFICAR STOCK POST-VENTA ==="
curl -X GET "$BASE_URL/api/v1/inventario/stock?almacenId=1&productoId={PRODUCTO_ID}" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ====================================================================
# 11. VER KARDEX (Movimientos de inventario)
# ====================================================================
echo ""
echo "=== 11. VER KARDEX ==="
curl -X GET "$BASE_URL/api/v1/inventario/kardex?productoId={PRODUCTO_ID}&almacenId=1" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ====================================================================
# 12. REPORTE RESUMEN
# ====================================================================
echo ""
echo "=== 12. REPORTE RESUMEN (DASHBOARD) ==="
curl -X GET "$BASE_URL/api/v1/reportes/resumen" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ====================================================================
# 13. REPORTE PRODUCTOS MÁS VENDIDOS
# ====================================================================
echo ""
echo "=== 13. PRODUCTOS MÁS VENDIDOS ==="
curl -X GET "$BASE_URL/api/v1/reportes/productos-mas-vendidos?top=5" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ====================================================================
# 14. REPORTE VENTAS
# ====================================================================
echo ""
echo "=== 14. REPORTE VENTAS ==="
curl -X GET "$BASE_URL/api/v1/reportes/ventas?fechaDesde=2026-01-01&fechaHasta=2026-12-31" \
  -H "Authorization: Bearer {TOKEN}" \
  -H "Content-Type: application/json" | python3 -m json.tool

# ====================================================================
# INSTRUCCIONES:
# ====================================================================
# 1. Copiar el token del comando 1 y reemplazar {TOKEN} en todos
# 2. Ejecutar comando por comando (copiar, pegar, Enter)
# 3. Guardar IDs de las respuestas (categoriaId, productoId, etc)
# 4. Reemplazar placeholders before running next command
# 5. Mostrar respuestas a docentes para demostrar endpoints funcionan
# ====================================================================
