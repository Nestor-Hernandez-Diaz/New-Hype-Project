/**
 * ============================================
 * COMPONENTE DE PRUEBA - Mock API
 * ============================================
 * 
 * Este componente demuestra el uso del Mock API
 * Agrégalo temporalmente a tu router para probarlo
 */

import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import styled from 'styled-components';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, sans-serif;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 2rem;
`;

const Section = styled.section`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h2`
  color: #34495e;
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: #2980b9;
  }
  
  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ecf0f1;
  }
  
  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #2c3e50;
  }
  
  tr:hover {
    background: #f8f9fa;
  }
`;

const Badge = styled.span<{ variant: 'success' | 'warning' | 'danger' }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  
  ${props => props.variant === 'success' && `
    background: #d4edda;
    color: #155724;
  `}
  
  ${props => props.variant === 'warning' && `
    background: #fff3cd;
    color: #856404;
  `}
  
  ${props => props.variant === 'danger' && `
    background: #f8d7da;
    color: #721c24;
  `}
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  font-size: 1.125rem;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatCard = styled.div`
  background: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
  
  h3 {
    margin: 0;
    font-size: 0.875rem;
    color: #7f8c8d;
    text-transform: uppercase;
  }
  
  p {
    margin: 0.5rem 0 0;
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
  }
`;

export const InventoryMockTest: React.FC = () => {
  const {
    stockItems,
    movimientos,
    alertas,
    loading,
    error,
    pagination,
    fetchStock,
    fetchKardex,
    crearAjuste,
    fetchAlertas,
    getStockStats,
    clearError
  } = useInventory();

  const [activeTab, setActiveTab] = useState<'stock' | 'kardex' | 'alertas'>('stock');

  useEffect(() => {
    // Cargar datos iniciales
    fetchStock();
    fetchKardex({ warehouseId: 'WH-PRINCIPAL' });
    fetchAlertas();
  }, []);

  const stats = getStockStats();

  const handleTestAjuste = async () => {
    try {
      await crearAjuste({
        productId: 'PRD-003',
        warehouseId: 'WH-PRINCIPAL',
        cantidadAjuste: 3,
        reasonId: 'TEST',
        observaciones: 'Ajuste de prueba desde componente test'
      });
    } catch (err) {
      console.error('Error al crear ajuste:', err);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'NORMAL':
        return <Badge variant="success">Normal</Badge>;
      case 'BAJO':
        return <Badge variant="warning">Bajo</Badge>;
      case 'CRITICO':
        return <Badge variant="danger">Crítico</Badge>;
      default:
        return <span>{estado}</span>;
    }
  };

  return (
    <Container>
      <Title>🧪 Prueba de Mock API - Inventario</Title>
      
      {error && (
        <ErrorMessage>
          {error}
          <Button onClick={clearError} style={{ marginLeft: '1rem' }}>Cerrar</Button>
        </ErrorMessage>
      )}

      <Section>
        <SectionTitle>📊 Estadísticas</SectionTitle>
        <Stats>
          <StatCard>
            <h3>Total Productos</h3>
            <p>{stats.totalProductos}</p>
          </StatCard>
          <StatCard>
            <h3>Stock Bajo</h3>
            <p style={{ color: '#f39c12' }}>{stats.stockBajo}</p>
          </StatCard>
          <StatCard>
            <h3>Stock Crítico</h3>
            <p style={{ color: '#e74c3c' }}>{stats.stockCritico}</p>
          </StatCard>
        </Stats>
      </Section>

      <Section>
        <SectionTitle>🛠️ Acciones</SectionTitle>
        <Button onClick={() => fetchStock()} disabled={loading}>
          🔄 Recargar Stock
        </Button>
        <Button onClick={() => fetchKardex({ warehouseId: 'WH-PRINCIPAL' })} disabled={loading}>
          📋 Recargar Kardex
        </Button>
        <Button onClick={handleTestAjuste} disabled={loading}>
          ✏️ Probar Ajuste
        </Button>
        <Button onClick={() => fetchStock({ almacenId: 'WH-PRINCIPAL' })} disabled={loading}>
          🏢 Filtrar Almacén Principal
        </Button>
      </Section>

      <Section>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <Button 
            onClick={() => setActiveTab('stock')}
            style={{ background: activeTab === 'stock' ? '#2c3e50' : '#95a5a6' }}
          >
            📦 Stock ({stockItems.length})
          </Button>
          <Button 
            onClick={() => setActiveTab('kardex')}
            style={{ background: activeTab === 'kardex' ? '#2c3e50' : '#95a5a6' }}
          >
            📋 Kardex ({movimientos.length})
          </Button>
          <Button 
            onClick={() => setActiveTab('alertas')}
            style={{ background: activeTab === 'alertas' ? '#2c3e50' : '#95a5a6' }}
          >
            ⚠️ Alertas ({alertas.stockBajo.length + alertas.stockCritico.length})
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner>Cargando...</LoadingSpinner>
        ) : (
          <>
            {activeTab === 'stock' && (
              <>
                <SectionTitle>Stock de Productos</SectionTitle>
                <Table>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Almacén</th>
                      <th>Cantidad</th>
                      <th>Stock Mín.</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockItems.map(item => (
                      <tr key={item.stockByWarehouseId}>
                        <td><strong>{item.codigo}</strong></td>
                        <td>{item.nombre}</td>
                        <td>{item.almacen}</td>
                        <td>{item.cantidad}</td>
                        <td>{item.stockMinimo || '-'}</td>
                        <td>{getEstadoBadge(item.estado)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {pagination.stock && (
                  <p style={{ marginTop: '1rem', color: '#7f8c8d' }}>
                    Mostrando {stockItems.length} de {pagination.stock.total} productos
                  </p>
                )}
              </>
            )}

            {activeTab === 'kardex' && (
              <>
                <SectionTitle>Movimientos Kardex</SectionTitle>
                <Table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Stock Antes</th>
                      <th>Stock Después</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos.map(mov => (
                      <tr key={mov.id}>
                        <td>{new Date(mov.fecha).toLocaleDateString()}</td>
                        <td>{mov.nombre}</td>
                        <td>
                          <Badge variant={
                            mov.tipo === 'ENTRADA' ? 'success' : 
                            mov.tipo === 'SALIDA' ? 'danger' : 
                            'warning'
                          }>
                            {mov.tipo}
                          </Badge>
                        </td>
                        <td>{mov.cantidad > 0 ? '+' : ''}{mov.cantidad}</td>
                        <td>{mov.stockAntes}</td>
                        <td>{mov.stockDespues}</td>
                        <td>{mov.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}

            {activeTab === 'alertas' && (
              <>
                <SectionTitle>Alertas de Stock</SectionTitle>
                {alertas.stockCritico.length > 0 && (
                  <>
                    <h3 style={{ color: '#e74c3c' }}>🚨 Stock Crítico</h3>
                    <Table>
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Producto</th>
                          <th>Almacén</th>
                          <th>Cantidad</th>
                          <th>Stock Mín.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alertas.stockCritico.map(item => (
                          <tr key={item.stockByWarehouseId}>
                            <td><strong>{item.codigo}</strong></td>
                            <td>{item.nombre}</td>
                            <td>{item.almacen}</td>
                            <td style={{ color: '#e74c3c', fontWeight: 'bold' }}>{item.cantidad}</td>
                            <td>{item.stockMinimo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}

                {alertas.stockBajo.length > 0 && (
                  <>
                    <h3 style={{ color: '#f39c12', marginTop: '2rem' }}>⚠️ Stock Bajo</h3>
                    <Table>
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Producto</th>
                          <th>Almacén</th>
                          <th>Cantidad</th>
                          <th>Stock Mín.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alertas.stockBajo.map(item => (
                          <tr key={item.stockByWarehouseId}>
                            <td><strong>{item.codigo}</strong></td>
                            <td>{item.nombre}</td>
                            <td>{item.almacen}</td>
                            <td style={{ color: '#f39c12', fontWeight: 'bold' }}>{item.cantidad}</td>
                            <td>{item.stockMinimo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}

                {alertas.stockBajo.length === 0 && alertas.stockCritico.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '2rem', color: '#27ae60' }}>
                    ✅ No hay alertas de stock
                  </p>
                )}
              </>
            )}
          </>
        )}
      </Section>

      <Section>
        <SectionTitle>📝 Consola de Pruebas</SectionTitle>
        <p>Abre la consola del navegador y ejecuta:</p>
        <pre style={{ 
          background: '#2c3e50', 
          color: '#ecf0f1', 
          padding: '1rem', 
          borderRadius: '4px',
          overflow: 'auto'
        }}>
{`// Importar el Mock API
import { inventoryMockApi } from '@/modules/inventory';

// Obtener stock
const stock = await inventoryMockApi.getStock();
console.table(stock.data);

// Buscar productos
const results = await inventoryMockApi.searchProducts('laptop');

// Crear ajuste
await inventoryMockApi.createAjuste({
  productId: 'PRD-003',
  warehouseId: 'WH-PRINCIPAL',
  cantidadAjuste: 5,
  reasonId: 'TEST',
  observaciones: 'Prueba'
});`}
        </pre>
      </Section>
    </Container>
  );
};

export default InventoryMockTest;
