// Script de prueba automatizada para el módulo de Ventas
const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Iniciando prueba del módulo de Ventas...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Configurar listener para errores de consola
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Configurar listener para errores de página
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });
  
  try {
    console.log('📍 Navegando a http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    console.log('⏱️  Esperando 3 segundos para que la app cargue...\n');
    await page.waitForTimeout(3000);
    
    // Intentar navegar a la lista de ventas
    console.log('📍 Navegando a /ventas/lista...');
    await page.goto('http://localhost:5173/ventas/lista', { waitUntil: 'networkidle2' });
    
    await page.waitForTimeout(2000);
    
    // Buscar datos del mock
    const pageContent = await page.content();
    
    console.log('🔍 VERIFICACIÓN DE DATOS MOCK:');
    console.log('  ✓ Buscando "V-2024-00001":', pageContent.includes('V-2024-00001') ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO');
    console.log('  ✓ Buscando "María González":', pageContent.includes('María') ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO');
    console.log('  ✓ Buscando "400.00" o "400":', pageContent.includes('400') ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO');
    
    console.log('\n🐛 ERRORES DE CONSOLA:', consoleErrors.length === 0 ? '✅ NINGUNO' : `❌ ${consoleErrors.length} errores`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((err, i) => console.log(`  ${i+1}. ${err}`));
    }
    
    console.log('\n🚨 ERRORES DE PÁGINA:', pageErrors.length === 0 ? '✅ NINGUNO' : `❌ ${pageErrors.length} errores`);
    if (pageErrors.length > 0) {
      pageErrors.forEach((err, i) => console.log(`  ${i+1}. ${err}`));
    }
    
    console.log('\n✅ Prueba completada. Mantén Chrome abierto para inspección manual.');
    console.log('   Presiona Ctrl+C cuando termines de revisar.\n');
    
    // Mantener el navegador abierto
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    await browser.close();
  }
})();
