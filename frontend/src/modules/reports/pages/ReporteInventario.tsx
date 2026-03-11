import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { apiService } from '../../../utils/api';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import {
  Button,
  Select,
  FiltersCard,
  SummaryCard,
  SummaryCards,
  CardTitle,
  CardValue,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText
} from '../../../components/shared';

// Helpers
const formatCurrency = (num: number | undefined | null) => {
  if (num === undefined || num === null || isNaN(Number(num))) return 'S/ 0.00';
  return `S/ ${Number(num).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ============================================================================
// ESTILOS
// ============================================================================

const Container = styled.div`
  padding: ${SPACING['2xl']};
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const PageTitle = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.small};
  margin: ${SPACING.xs} 0 0 0;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.lg};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FilterLabel = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.textLight};
`;

const FilterButtonsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.md};
  margin-top: ${SPACING.lg};
`;

const TabsContainer = styled.div`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  border: 1px solid ${COLORS.border};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const TabsHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${COLORS.border};
  background-color: ${COLORS.background};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: ${SPACING.md} ${SPACING.xl};
  border: none;
  background: ${props => props.$active ? COLORS.white : 'transparent'};
  color: ${props => props.$active ? COLORS.primary : COLORS.textLight};
  font-weight: ${props => props.$active ? TYPOGRAPHY.fontWeight.semibold : TYPOGRAPHY.fontWeight.medium};
  font-size: ${TYPOGRAPHY.fontSize.small};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? COLORS.primary : 'transparent'};
  transition: ${TRANSITIONS.normal};
  margin-bottom: -1px;

  &:hover {
    background-color: ${props => props.$active ? COLORS.white : COLORS.borderLight};
    color: ${props => props.$active ? COLORS.primary : COLORS.text};
  }
`;

const TabContent = styled.div`
  padding: ${SPACING.xl};
`;

const Section = styled.div`
  background: ${COLORS.white};
  padding: ${SPACING.xl};
  border-radius: ${BORDER_RADIUS.large};
  border: 1px solid ${COLORS.border};
  margin-bottom: ${SPACING.xl};
`;

const SectionTitle = styled.h3`
  font-size: ${TYPOGRAPHY.fontSize.h3};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.lg} 0;
`;

const PercentageBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${COLORS.primaryLight};
  color: ${COLORS.primary};
  border-radius: ${BORDER_RADIUS.small};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Backend DTO: ReporteInventarioResponse
 * - totalProductos: long
 * - productosConStock: long
 * - productosStockBajo: long
 * - productosSinStock: long
 * - valorizacionTotal: BigDecimal
 * - porAlmacen: [{almacenId, almacenNombre, totalItems, stockBajo, valorizacion}]
 */

const ReporteInventario: React.FC = () => {
  const [almacenId, setAlmacenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'almacenes'>('resumen');
  const [almacenes, setAlmacenes] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    loadAlmacenes();
    handleBuscar();
  }, []);

  const loadAlmacenes = async () => {
    try {
      const res = await apiService.getWarehouses();
      const data = res.data as any;
      let warehouses = [];

      if (data?.data?.rows) {
        warehouses = data.data.rows;
      } else if (data?.rows) {
        warehouses = data.rows;
      } else if (Array.isArray(data)) {
        warehouses = data;
      }

      setAlmacenes(warehouses.filter((w: any) => w.activo !== false));
    } catch (error) {
      console.error('Error cargando almacenes:', error);
    }
  };

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const res = await apiService.getReporteInventario({
        almacenId: almacenId || undefined,
      });

      if (res.success && res.data) {
        setReporteData(res.data);
      }
    } catch (e) {
      console.error('Error cargando reporte inventario', e);
      setReporteData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setAlmacenId('');
  };

  const handleExportar = () => {
    if (!reporteData) return;

    const fecha = new Date().toLocaleDateString('es-PE');
    const hora = new Date().toLocaleTimeString('es-PE');

    const csvLines = [
      '=================================================================',
      '                  REPORTE DE INVENTARIO                          ',
      '=================================================================',
      `Fecha de Generacion:\t${fecha}\t${hora}`,
      `Almacen Filtrado:\t${almacenId || 'Todos los almacenes'}`,
      '',
      '=================================================================',
      '                    RESUMEN GENERAL                              ',
      '=================================================================',
      'Indicador\tValor',
      `Total Productos\t${reporteData.totalProductos || 0}`,
      `Productos con Stock\t${reporteData.productosConStock || 0}`,
      `Productos Stock Bajo\t${reporteData.productosStockBajo || 0}`,
      `Productos Sin Stock\t${reporteData.productosSinStock || 0}`,
      `Valorizacion Total\t${formatCurrency(reporteData.valorizacionTotal)}`,
      '',
      '=================================================================',
      '                  STOCK POR ALMACEN                              ',
      '=================================================================',
      'Almacen\tTotal Items\tStock Bajo\tValorizacion',
      ...(reporteData.porAlmacen || []).map((a: any) =>
        `${a.almacenNombre || 'Sin nombre'}\t${a.totalItems || 0}\t${a.stockBajo || 0}\t${formatCurrency(a.valorizacion)}`
      ),
      '',
      '=================================================================',
      `Reporte generado por: Sistema de Gestion New Hype`,
      '================================================================='
    ];

    const csvContent = '\uFEFF' + csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Inventario_${almacenId ? 'Almacen_' + almacenId : 'Todos'}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Reporte de Inventario">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Reporte de Inventario</PageTitle>
            <PageSubtitle>Stock actual, valorizacion y desglose por almacen</PageSubtitle>
          </div>
          <Button $variant="success" onClick={handleExportar} disabled={!reporteData || loading}>
            Exportar Reporte
          </Button>
        </PageHeader>

        <FiltersCard>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Almacen</FilterLabel>
              <Select
                value={almacenId}
                onChange={(e) => setAlmacenId(e.target.value)}
              >
                <option value="">Todos los almacenes</option>
                {almacenes.map(alm => (
                  <option key={alm.id} value={alm.id}>{alm.nombre}</option>
                ))}
              </Select>
            </FilterGroup>
          </FiltersGrid>
          <FilterButtonsRow>
            <Button $variant="secondary" onClick={handleLimpiar}>
              Limpiar
            </Button>
            <Button $variant="primary" onClick={handleBuscar} disabled={loading}>
              {loading ? 'Generando...' : 'Generar Reporte'}
            </Button>
          </FilterButtonsRow>
        </FiltersCard>

        {loading && (
          <EmptyState>
            <EmptyIcon>⏳</EmptyIcon>
            <EmptyTitle>Cargando reporte...</EmptyTitle>
          </EmptyState>
        )}

        {!loading && !reporteData && (
          <EmptyState>
            <EmptyIcon>📦</EmptyIcon>
            <EmptyTitle>Sin datos disponibles</EmptyTitle>
            <EmptyText>Haga clic en "Generar Reporte" para ver el inventario.</EmptyText>
          </EmptyState>
        )}

        {!loading && reporteData && (
          <TabsContainer>
            <TabsHeader>
              <Tab $active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
                Resumen General
              </Tab>
              <Tab $active={activeTab === 'almacenes'} onClick={() => setActiveTab('almacenes')}>
                Por Almacen
              </Tab>
            </TabsHeader>

            <TabContent>
              {activeTab === 'resumen' && (
                <>
                  <SummaryCards>
                    <SummaryCard>
                      <CardTitle>Total Productos</CardTitle>
                      <CardValue>{reporteData.totalProductos || 0}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Con Stock</CardTitle>
                      <CardValue>{reporteData.productosConStock || 0}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Stock Bajo</CardTitle>
                      <CardValue style={{ color: reporteData.productosStockBajo > 0 ? COLOR_SCALES.danger[600] : 'inherit' }}>
                        {reporteData.productosStockBajo || 0}
                      </CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Sin Stock</CardTitle>
                      <CardValue style={{ color: reporteData.productosSinStock > 0 ? COLOR_SCALES.danger[600] : 'inherit' }}>
                        {reporteData.productosSinStock || 0}
                      </CardValue>
                    </SummaryCard>
                  </SummaryCards>

                  <Section>
                    <SectionTitle>Valorizacion Total del Inventario</SectionTitle>
                    <CardValue style={{ fontSize: '1.5rem' }}>{formatCurrency(reporteData.valorizacionTotal)}</CardValue>
                  </Section>
                </>
              )}

              {activeTab === 'almacenes' && (
                <Section>
                  <SectionTitle>Stock por Almacen</SectionTitle>
                  {(reporteData.porAlmacen || []).length > 0 ? (
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Almacen</Th>
                            <Th>Total Items</Th>
                            <Th>Stock Bajo</Th>
                            <Th>Valorizacion</Th>
                            <Th>% del Total</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {reporteData.porAlmacen.map((a: any, idx: number) => {
                            const porcentaje = reporteData.valorizacionTotal > 0
                              ? (Number(a.valorizacion) / Number(reporteData.valorizacionTotal) * 100)
                              : 0;
                            return (
                              <Tr key={idx}>
                                <Td style={{ fontWeight: 500 }}>{a.almacenNombre || 'Sin nombre'}</Td>
                                <Td>{a.totalItems || 0}</Td>
                                <Td style={{ color: a.stockBajo > 0 ? COLOR_SCALES.danger[600] : 'inherit', fontWeight: a.stockBajo > 0 ? 600 : 400 }}>
                                  {a.stockBajo || 0}
                                </Td>
                                <Td>{formatCurrency(a.valorizacion)}</Td>
                                <Td>
                                  <PercentageBadge>{porcentaje.toFixed(1)}%</PercentageBadge>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <EmptyText>No hay datos de almacenes.</EmptyText>
                  )}
                </Section>
              )}
            </TabContent>
          </TabsContainer>
        )}
      </Container>
    </Layout>
  );
};

export default ReporteInventario;
