import requests, json, time

BASE = "http://spring.informaticapp.com:5001/New-Hype-Project/api/v1"
TS = str(int(time.time()))[-6:]
results = []

def test(name, method, url, headers=None, body=None):
    try:
        r = getattr(requests, method)(url, headers=headers, json=body, timeout=15)
        d = r.json()
        ok = d.get("success", False)
        status = "PASS" if ok else "FAIL"
        results.append((name, status, r.status_code))
        print(f"  [{status}] {name} (HTTP {r.status_code})")
        if not ok:
            print(f"         -> {d.get('message','')}")
        return d
    except Exception as e:
        results.append((name, "ERROR", str(e)))
        print(f"  [ERROR] {name}: {e}")
        return None

# 1. SUPERADMIN LOGIN
print("== SUPERADMIN ==")
d = test("Superadmin login", "post", f"{BASE}/platform/auth/login", body={
    "emailOrUsername": "superadmin@newhype.pe", "password": "SuperAdmin2026"
})
SA = d["data"]["accessToken"]
SAH = {"Authorization": f"Bearer {SA}", "Content-Type": "application/json"}

# 2. CREAR PLAN
print("== PLAN + TENANT ==")
d = test("Crear plan", "post", f"{BASE}/platform/planes", headers=SAH, body={
    "nombre": f"Plan Prod {TS}", "descripcion": "Plan E2E Prod", "precioMensual": 99.90,
    "precioAnual": 999.00, "maxUsuarios": 10, "maxProductos": 1000, "maxAlmacenes": 5, "estado": True
})
PLAN_ID = d["data"]["id"]

# 3. CREAR TENANT
d = test("Crear tenant", "post", f"{BASE}/platform/tenants", headers=SAH, body={
    "nombre": f"Tienda Prod {TS}", "subdominio": f"prod{TS}", "propietarioNombre": "Propietario Prod",
    "propietarioTipoDocumento": "DNI", "propietarioNumeroDocumento": f"88{TS}001",
    "email": f"admin{TS}@prod.pe", "adminPassword": "Prod2026xx", "planId": PLAN_ID
})
TENANT_ID = d["data"]["id"]

# 4. TENANT LOGIN
print("== TENANT LOGIN ==")
d = test("Tenant login", "post", f"{BASE}/auth/login", body={
    "email": f"admin{TS}@prod.pe", "password": "Prod2026xx"
})
TK = d["data"]["accessToken"]
TH = {"Authorization": f"Bearer {TK}", "Content-Type": "application/json"}

# 5. CONFIG EMPRESA (RUC = 11 digitos exactos)
print("== CONFIG EMPRESA ==")
d = test("Config empresa", "put", f"{BASE}/configuracion/empresa", headers=TH, body={
    "razonSocial": f"Empresa Prod {TS} SAC", "ruc": f"20{TS}001",
    "direccion": "Av Produccion 100", "telefono": "999888777",
    "email": f"empresa{TS}@prod.pe", "igv": 18.00
})

# 6. SERIE BOLETA
d = test("Crear serie BOLETA", "post", f"{BASE}/configuracion/series-comprobantes", headers=TH, body={
    "tipoComprobante": "BOLETA", "serie": f"B{TS[0:3]}", "numeroActual": 0, "activo": True
})
SERIE_ID = d["data"]["id"] if d and d.get("success") else None

# 7. METODO PAGO (requiere: codigo, nombre, tipo)
d = test("Crear metodo pago", "post", f"{BASE}/configuracion/metodos-pago", headers=TH, body={
    "codigo": "EFE", "nombre": "Efectivo", "tipo": "EFECTIVO", "requiereReferencia": False
})
METODO_ID = d["data"]["id"] if d and d.get("success") else None

# 8. ALMACEN
d = test("Crear almacen", "post", f"{BASE}/almacenes", headers=TH, body={
    "nombre": f"Almacen Prod {TS}", "codigo": f"ALP{TS}", "direccion": "Deposito Central", "activo": True
})
ALM_ID = d["data"]["id"] if d and d.get("success") else None

# 9. CAJA
d = test("Crear caja", "post", f"{BASE}/configuracion/cajas-registradoras", headers=TH, body={
    "nombre": f"Caja Prod {TS}", "codigo": f"CP{TS}", "almacenId": ALM_ID, "activa": True
})
CAJA_ID = d["data"]["id"] if d and d.get("success") else None

# 10. CATEGORIA (requiere: codigo, nombre)
print("== CATALOGO ==")
d = test("Crear categoria", "post", f"{BASE}/configuracion/categorias", headers=TH, body={
    "codigo": f"RP{TS}", "nombre": f"Ropa Prod {TS}", "descripcion": "Categoria de prueba"
})
CAT_ID = d["data"]["id"] if d and d.get("success") else None

# 11. PRODUCTO (precioCosto en vez de precioCompra, sin slug/activo/esLiquidacion)
d = test("Crear producto", "post", f"{BASE}/productos", headers=TH, body={
    "nombre": f"Polo Prod {TS}", "sku": f"SKU-P{TS}",
    "descripcion": "Polo de prueba E2E", "precioVenta": 59.90, "precioCosto": 30.00,
    "categoriaId": CAT_ID
})
PROD_ID = d["data"]["id"] if d and d.get("success") else None

# 12. AJUSTE STOCK (DTO plano: productoId, almacenId, tipo, cantidad, motivo)
d = test("Ajuste stock +50", "post", f"{BASE}/inventario/ajustes", headers=TH, body={
    "productoId": PROD_ID, "almacenId": ALM_ID, "tipo": "AJUSTE_INGRESO",
    "cantidad": 50, "motivo": "Stock inicial E2E"
})

# 13. CLIENTE (DNI = 8 digitos exactos)
print("== VENTA ==")
d = test("Crear cliente", "post", f"{BASE}/entidades", headers=TH, body={
    "tipoEntidad": "CLIENTE", "tipoDocumento": "DNI", "numeroDocumento": f"77{TS[0:6]}",
    "razonSocial": f"Cliente Prod {TS}", "email": f"cli{TS}@prod.pe"
})
CLI_ID = d["data"]["id"] if d and d.get("success") else None

# 14. SESION CAJA
d = test("Abrir sesion caja", "post", f"{BASE}/caja/sesiones", headers=TH, body={
    "cajaRegistradoraId": CAJA_ID, "montoApertura": 100.00
})
SESION_ID = d["data"]["id"] if d and d.get("success") else None

# 15. VENTA
d = test("Crear venta", "post", f"{BASE}/ventas", headers=TH, body={
    "clienteId": CLI_ID, "tipoComprobante": "BOLETA", "serieComprobanteId": SERIE_ID,
    "sesionCajaId": SESION_ID, "almacenId": ALM_ID,
    "items": [{"productoId": PROD_ID, "cantidad": 2, "precioUnitario": 59.90}]
})
VENTA_ID = d["data"]["id"] if d and d.get("success") else None

# 16. CONFIRMAR PAGO (montoRecibido + pagos[] con metodoPagoId, monto, referencia)
d = test("Confirmar pago", "post", f"{BASE}/ventas/{VENTA_ID}/confirmar-pago", headers=TH, body={
    "montoRecibido": 141.36,
    "pagos": [{"metodoPagoId": METODO_ID, "monto": 141.36, "referencia": "Efectivo E2E"}]
})

# 17. REPORTES (rutas correctas: /resumen, /ventas, /inventario)
print("== REPORTES ==")
hoy = time.strftime("%Y-%m-%d")
test("Reporte resumen (dashboard)", "get", f"{BASE}/reportes/resumen", headers=TH)
test("Reporte ventas", "get", f"{BASE}/reportes/ventas?fechaDesde={hoy}&fechaHasta={hoy}", headers=TH)
test("Reporte inventario", "get", f"{BASE}/reportes/inventario", headers=TH)
test("Reporte productos top", "get", f"{BASE}/reportes/productos-mas-vendidos", headers=TH)
test("Reporte financiero", "get", f"{BASE}/reportes/financiero?fechaDesde={hoy}&fechaHasta={hoy}", headers=TH)
test("Reporte compras", "get", f"{BASE}/reportes/compras", headers=TH)
test("Reporte caja", "get", f"{BASE}/reportes/caja", headers=TH)

# 18. STOREFRONT
print("== STOREFRONT ==")
test("Storefront catalogo", "get", f"{BASE}/storefront/productos?tenantId={TENANT_ID}", headers=None)
test("Storefront categorias", "get", f"{BASE}/storefront/categorias?tenantId={TENANT_ID}", headers=None)

d = test("Storefront register", "post", f"{BASE}/storefront/auth/register", body={
    "email": f"cliente{TS}@prod.pe", "password": "Cliente2026", "nombre": f"Cliente Prod {TS}",
    "apellido": "E2E", "telefono": "999111222", "tenantId": TENANT_ID
})
if d and d.get("success"):
    ST = d["data"]["accessToken"]
    STH = {"Authorization": f"Bearer {ST}", "Content-Type": "application/json"}
    test("Storefront perfil", "get", f"{BASE}/storefront/perfil", headers=STH)
    d2 = test("Storefront crear pedido", "post", f"{BASE}/storefront/pedidos", headers=STH, body={
        "items": [{"productoId": PROD_ID, "cantidad": 1}],
        "direccionEnvio": "Av. Produccion 200", "instrucciones": "Pedido E2E prod"
    })
    if d2 and d2.get("success"):
        PED_ID = d2["data"]["id"]
        test("Storefront mis pedidos", "get", f"{BASE}/storefront/pedidos", headers=STH)
        test("Storefront detalle pedido", "get", f"{BASE}/storefront/pedidos/{PED_ID}", headers=STH)

# RESUMEN
print()
print("=" * 55)
passed = sum(1 for _, s, _ in results if s == "PASS")
failed = sum(1 for _, s, _ in results if s == "FAIL")
errors = sum(1 for _, s, _ in results if s == "ERROR")
print(f"  RESULTADOS: {passed} PASS / {failed} FAIL / {errors} ERROR")
print(f"  TOTAL:      {len(results)} tests")
print("=" * 55)
if failed > 0 or errors > 0:
    print()
    print("FALLIDOS:")
    for name, status, code in results:
        if status != "PASS":
            print(f"  [{status}] {name} ({code})")
