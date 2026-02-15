"""NewHype ERP - E2E Smoke Test (simulates Postman collection flow)"""
import requests
import json
import sys
import time

BASE = "http://localhost:8080/api/v1"
RESULTS = []
TS = str(int(time.time()))[-6:]  # unique suffix for idempotent runs

def test(name, response, checks=None):
    status = response.status_code
    try:
        data = response.json()
    except:
        data = {}
    ok = status == 200 and data.get('success', False)
    if checks and ok:
        for check_name, check_fn in checks.items():
            try:
                if not check_fn(data):
                    ok = False
                    print(f"  CHECK FAIL: {check_name}")
            except Exception as e:
                ok = False
                print(f"  CHECK ERROR: {check_name}: {e}")
    icon = "PASS" if ok else "FAIL"
    RESULTS.append((name, icon))
    print(f"  [{icon}] {name} (HTTP {status})")
    if not ok and data.get('message'):
        print(f"         -> {data['message']}")
    return data

# ============================================================
print("\n=== 01. SUPERADMIN LOGIN ===")
r = requests.post(f"{BASE}/platform/auth/login", json={
    "emailOrUsername": "superadmin@newhype.pe",
    "password": "SuperAdmin2026"
})
d = test("Platform Login", r)
SA_TOKEN = d.get('data', {}).get('accessToken', '')
SA_HEADERS = {"Authorization": f"Bearer {SA_TOKEN}", "Content-Type": "application/json"}

# ============================================================
print("\n=== 02. CREATE PLAN + TENANT ===")
r = requests.post(f"{BASE}/platform/planes", headers=SA_HEADERS, json={
    "nombre": f"Plan E2E {TS}", "codigo": f"E2E-{TS}", "descripcion": "Plan E2E test",
    "precioMensual": 99.90, "precioAnual": 999.00,
    "limiteUsuarios": 5, "limiteProductos": 500, "limiteAlmacenes": 2
})
d = test("Create Plan", r)
plan_id = d.get('data', {}).get('id')

r = requests.post(f"{BASE}/platform/tenants", headers=SA_HEADERS, json={
    "nombre": f"E2E Store {TS}", "subdominio": f"e2e{TS}",
    "propietarioNombre": "Carlos Rodriguez", "propietarioTipoDocumento": "DNI",
    "propietarioNumeroDocumento": f"456{TS}", "email": f"admin{TS}@e2e.pe",
    "telefono": "987654321", "direccion": "Av. Test 123",
    "planId": plan_id, "adminPassword": "TenantAdmin2026"
})
d = test("Create Tenant", r, {"has_id": lambda d: d['data'].get('id') is not None})
tenant_id = d.get('data', {}).get('id')

# ============================================================
print("\n=== 03. TENANT LOGIN ===")
r = requests.post(f"{BASE}/auth/login", json={
    "email": f"admin{TS}@e2e.pe", "password": "TenantAdmin2026"
})
d = test("Tenant Login", r, {"scope_tenant": lambda d: d['data']['scope'] == 'tenant'})
T_TOKEN = d.get('data', {}).get('accessToken', '')
T_HEADERS = {"Authorization": f"Bearer {T_TOKEN}", "Content-Type": "application/json"}

# ============================================================
print("\n=== 04. CONFIGURAR EMPRESA ===")
r = requests.put(f"{BASE}/configuracion/empresa", headers=T_HEADERS, json={
    "ruc": "20512345678", "razonSocial": "E2E Fashion Store S.A.C.",
    "nombreComercial": "E2E Fashion", "direccion": "Av. Test 123",
    "igvActivo": True, "igvPorcentaje": 18, "moneda": "PEN"
})
test("Config Empresa", r)

r = requests.post(f"{BASE}/configuracion/series-comprobantes", headers=T_HEADERS, json={
    "tipoComprobante": "BOLETA", "serie": "B001", "numeroInicio": 1
})
test("Create Serie B001", r)

r = requests.post(f"{BASE}/configuracion/metodos-pago", headers=T_HEADERS, json={
    "codigo": "EFE", "nombre": "Efectivo", "tipo": "EFECTIVO", "requiereReferencia": False
})
d = test("Create Metodo Pago", r)
metodo_pago_id = d.get('data', {}).get('id')

r = requests.post(f"{BASE}/almacenes", headers=T_HEADERS, json={
    "codigo": "ALM-01", "nombre": "Almacen E2E"
})
d = test("Create Almacen", r)
almacen_id = d.get('data', {}).get('id')

r = requests.post(f"{BASE}/configuracion/cajas-registradoras", headers=T_HEADERS, json={
    "codigo": "CAJA-01", "nombre": "Caja E2E"
})
d = test("Create Caja", r)
caja_id = d.get('data', {}).get('id')

# ============================================================
print("\n=== 05. CREAR CATEGORIA + PRODUCTO + STOCK ===")
r = requests.post(f"{BASE}/configuracion/categorias", headers=T_HEADERS, json={
    "codigo": f"POL{TS}", "nombre": f"Polos E2E {TS}", "slug": f"polos-e2e-{TS}"
})
d = test("Create Categoria", r)
categoria_id = d.get('data', {}).get('id')

r = requests.post(f"{BASE}/productos", headers=T_HEADERS, json={
    "sku": f"E2E-{TS}", "nombre": f"Polo Test {TS}",
    "categoriaId": categoria_id, "precioCosto": 35.00, "precioVenta": 79.90,
    "stockMinimo": 5, "controlaInventario": True
})
d = test("Create Producto", r, {"has_slug": lambda d: d['data'].get('slug') is not None})
producto_id = d.get('data', {}).get('id')
producto_slug = d.get('data', {}).get('slug')
precio_venta = d.get('data', {}).get('precioVenta', 79.90)

r = requests.post(f"{BASE}/inventario/ajustes", headers=T_HEADERS, json={
    "productoId": producto_id, "almacenId": almacen_id,
    "tipo": "AJUSTE_INGRESO", "cantidad": 50, "motivo": "Stock inicial E2E"
})
test("Ajuste Inventario +50", r)

# ============================================================
print("\n=== 06. FLUJO DE VENTA ===")
r = requests.post(f"{BASE}/entidades", headers=T_HEADERS, json={
    "tipoEntidad": "CLIENTE", "tipoDocumento": "DNI", "numeroDocumento": "76543210",
    "nombres": "Pedro", "apellidos": "Martinez"
})
d = test("Create Cliente", r)
cliente_id = d.get('data', {}).get('id')

r = requests.post(f"{BASE}/caja/sesiones", headers=T_HEADERS, json={
    "cajaRegistradoraId": caja_id, "montoApertura": 500.00
})
d = test("Abrir Sesion Caja", r)
sesion_id = d.get('data', {}).get('id')

r = requests.post(f"{BASE}/ventas", headers=T_HEADERS, json={
    "sesionCajaId": sesion_id, "clienteId": cliente_id, "almacenId": almacen_id,
    "tipoComprobante": "BOLETA", "serie": "B001",
    "items": [{"productoId": producto_id, "cantidad": 2, "precioUnitario": precio_venta, "descuento": 0}]
})
d = test("Crear Venta", r, {"estado_pendiente": lambda d: d['data']['estado'] == 'PENDIENTE'})
venta_id = d.get('data', {}).get('id')

r = requests.post(f"{BASE}/ventas/{venta_id}/confirmar-pago", headers=T_HEADERS, json={
    "montoRecibido": 200.00,
    "pagos": [{"metodoPagoId": metodo_pago_id, "monto": 200.00}]
})
test("Confirmar Pago", r, {"estado_completada": lambda d: d['data']['estado'] == 'COMPLETADA'})

# ============================================================
print("\n=== 07. REPORTES ===")
endpoints_rep = ["resumen", "ventas", "inventario", "compras", "financiero", "caja", "productos-mas-vendidos?top=5"]
for ep in endpoints_rep:
    r = requests.get(f"{BASE}/reportes/{ep}", headers=T_HEADERS)
    test(f"Reporte /{ep.split('?')[0]}", r)

# ============================================================
print("\n=== 08. STOREFRONT B2C ===")
r = requests.get(f"{BASE}/storefront/productos?tenantId={tenant_id}&page=0&size=10")
test("Catalogo Publico", r)

r = requests.get(f"{BASE}/storefront/categorias?tenantId={tenant_id}")
test("Categorias Publicas", r)

r = requests.get(f"{BASE}/storefront/productos/{producto_slug}?tenantId={tenant_id}")
test("Producto por Slug", r)

r = requests.post(f"{BASE}/storefront/auth/register", json={
    "tenantId": tenant_id, "email": f"maria{TS}@e2e.com", "password": "Cliente2026",
    "nombre": "Maria", "apellido": "Garcia"
})
d = test("Registrar Cliente B2C", r)
C_TOKEN = d.get('data', {}).get('accessToken', '')
C_HEADERS = {"Authorization": f"Bearer {C_TOKEN}", "Content-Type": "application/json"}

r = requests.get(f"{BASE}/storefront/perfil", headers=C_HEADERS)
test("Ver Perfil", r)

r = requests.put(f"{BASE}/storefront/perfil", headers=C_HEADERS, json={
    "nombre": "Maria Elena", "direccion": "Calle Flores 789, Miraflores"
})
test("Actualizar Perfil", r)

r = requests.post(f"{BASE}/storefront/pedidos", headers=C_HEADERS, json={
    "items": [{"productoId": producto_id, "cantidad": 3}],
    "direccionEnvio": "Calle Flores 789, Miraflores",
    "instrucciones": "Tocar timbre 302"
})
d = test("Crear Pedido", r, {"has_codigo": lambda d: d['data']['codigo'].startswith('PED-')})
pedido_id = d.get('data', {}).get('id')

r = requests.get(f"{BASE}/storefront/pedidos?page=0&size=10", headers=C_HEADERS)
test("Listar Mis Pedidos", r)

r = requests.get(f"{BASE}/storefront/pedidos/{pedido_id}", headers=C_HEADERS)
test("Detalle Pedido", r)

r = requests.patch(f"{BASE}/storefront/pedidos/{pedido_id}/cancelar", headers=C_HEADERS)
test("Cancelar Pedido", r, {"estado_cancelado": lambda d: d['data']['estado'] == 'CANCELADO'})

# ============================================================
print("\n" + "=" * 60)
passed = sum(1 for _, s in RESULTS if s == "PASS")
failed = sum(1 for _, s in RESULTS if s == "FAIL")
print(f"TOTAL: {passed}/{len(RESULTS)} PASSED | {failed} FAILED")
if failed > 0:
    print("FAILURES:")
    for name, status in RESULTS:
        if status == "FAIL":
            print(f"  - {name}")
print("=" * 60)
sys.exit(0 if failed == 0 else 1)
