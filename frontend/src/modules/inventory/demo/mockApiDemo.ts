/**
 * ============================================
 * DEMO - Prueba del Mock API de Inventario
 * ============================================
 * 
 * Este archivo demuestra el uso del Mock API refactorizado
 * Puedes importarlo en cualquier componente para probarlo
 */

import { inventoryMockApi } from '../services/inventoryMockApi';

/**
 * Función de demostración completa
 */
export async function demoInventoryMockApi() {
  console.log('🚀 DEMO: Mock API de Inventario');
  console.log('═'.repeat(60));
  
  try {
    // 1. Obtener stock
    console.log('\n📦 1. Obteniendo stock...');
    const stockResponse = await inventoryMockApi.getStock({ 
      page: 1, 
      limit: 10 
    });
    console.log(`   ✅ ${stockResponse.data.length} productos en stock`);
    console.log('   Primeros 3 items:', stockResponse.data.slice(0, 3).map(i => ({
      codigo: i.codigo,
      nombre: i.nombre,
      cantidad: i.cantidad,
      estado: i.estado
    })));

    // 2. Filtrar por almacén
    console.log('\n🏢 2. Filtrando por Almacén Principal...');
    const filteredStock = await inventoryMockApi.getStock({
      almacenId: 'WH-PRINCIPAL'
    });
    console.log(`   ✅ ${filteredStock.data.length} productos en Almacén Principal`);

    // 3. Buscar productos
    console.log('\n🔍 3. Buscando "laptop"...');
    const searchResults = await inventoryMockApi.searchProducts('laptop');
    console.log(`   ✅ ${searchResults.length} resultados:`, searchResults);

    // 4. Obtener kardex
    console.log('\n📋 4. Obteniendo movimientos kardex...');
    const kardexResponse = await inventoryMockApi.getKardex({
      warehouseId: 'WH-PRINCIPAL',
      page: 1,
      pageSize: 5
    });
    console.log(`   ✅ ${kardexResponse.data.length} movimientos`);
    console.log('   Últimos movimientos:', kardexResponse.data.map(m => ({
      fecha: new Date(m.fecha).toLocaleDateString(),
      tipo: m.tipo,
      producto: m.nombre,
      cantidad: m.cantidad
    })));

    // 5. Obtener alertas
    console.log('\n⚠️  5. Obteniendo alertas de stock...');
    const alertas = await inventoryMockApi.getAlertas();
    console.log(`   Stock Bajo: ${alertas.stockBajo.length} productos`);
    console.log(`   Stock Crítico: ${alertas.stockCritico.length} productos`);
    
    if (alertas.stockCritico.length > 0) {
      console.log('   🚨 Productos críticos:', alertas.stockCritico.map(i => ({
        codigo: i.codigo,
        nombre: i.nombre,
        cantidad: i.cantidad,
        minimo: i.stockMinimo
      })));
    }

    // 6. Crear un ajuste
    console.log('\n✏️  6. Creando ajuste de inventario...');
    const ajuste = await inventoryMockApi.createAjuste({
      productId: 'PRD-003',
      warehouseId: 'WH-PRINCIPAL',
      cantidadAjuste: 3,
      reasonId: 'REASON-DEMO',
      observaciones: 'Ajuste de prueba desde demo'
    });
    console.log(`   ✅ ${ajuste.message}`);

    // 7. Verificar actualización
    console.log('\n🔄 7. Verificando actualización del stock...');
    const updatedStock = await inventoryMockApi.getStock({ q: 'TEC-001' });
    console.log('   Stock actualizado:', {
      codigo: updatedStock.data[0]?.codigo,
      nombre: updatedStock.data[0]?.nombre,
      cantidad: updatedStock.data[0]?.cantidad,
      estado: updatedStock.data[0]?.estado
    });

    console.log('\n✅ DEMO COMPLETADA EXITOSAMENTE');
    console.log('═'.repeat(60));
    
    return {
      success: true,
      stockResponse,
      kardexResponse,
      alertas
    };
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA DEMO:', error);
    console.log('═'.repeat(60));
    throw error;
  }
}

// Si se ejecuta en el navegador, exponer la función globalmente
if (typeof window !== 'undefined') {
  (window as any).demoInventory = demoInventoryMockApi;
  console.log('💡 Ejecuta en la consola: demoInventory()');
}
