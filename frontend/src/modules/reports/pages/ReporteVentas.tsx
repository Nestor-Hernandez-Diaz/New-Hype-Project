import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { apiService } from '../../../utils/api';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import {
  Button,
  Input,
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
import { formatDateOnly } from '../../../utils/dateFormatter';

// Helpers
const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);
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

const RankBadge = styled.span<{ $rank: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: ${props => props.$rank <= 3 ? COLOR_SCALES.warning[100] : COLORS.borderLight};
  color: ${props => props.$rank <= 3 ? COLOR_SCALES.warning[600] : COLORS.textLight};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.xs};
`;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Backend DTO: ReporteVentasResponse
 * - totalVentas: long (count)
 * - montoTotal: BigDecimal
 * - montoIgv: BigDecimal
 * - montoDescuentos: BigDecimal
 * - ticketPromedio: BigDecimal
 * - ventasPorDia: [{fecha, cantidad, total}]
 * - ventasPorTipo: [{tipoComprobante, cantidad, total}]
 *
 * Also uses: ProductosMasVendidosResponse
 * - totalProductosVendidos: long
 * - productos: [{productoId, sku, nombre, categoriaNombre, cantidadVendida, montoTotal}]
 */

const ReporteVentas: React.FC = () => {
  const [fechaDesde, setFechaDesde] = useState(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [fechaHasta, setFechaHasta] = useState(formatDateInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<any>(null);
  const [topProductos, setTopProductos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'resumen' | 'detalles' | 'analisis'>('resumen');

  useEffect(() => {
    handleBuscar();
  }, []);

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const [resVentas, resTopProd] = await Promise.all([
        apiService.getReporteVentas({
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
        }),
        apiService.getReporteProductosMasVendidos({
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
          top: 10,
        }),
      ]);

      if (resVentas.success && resVentas.data) {
        setReporteData(resVentas.data);
      } else {
        setReporteData(null);
      }

      if (resTopProd.success && resTopProd.data) {
        setTopProductos(resTopProd.data.productos || []);
      } else {
        setTopProductos([]);
      }
    } catch (e) {
      console.error('Error cargando reporte ventas:', e);
      setReporteData(null);
      setTopProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFechaDesde(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
    setFechaHasta(formatDateInput(new Date()));
  };

  const handleExportar = () => {
    if (!reporteData) return;

    const fecha = new Date().toLocaleDateString('es-PE');
    const hora = new Date().toLocaleTimeString('es-PE');

    const csvLines = [
      '=================================================================',
      '                    REPORTE DE VENTAS                           ',
      '=================================================================',
      `Fecha de Generacion:\t${fecha}\t${hora}`,
      `Periodo Analizado:\t${fechaDesde || 'Todas las fechas'}\tal\t${fechaHasta || 'Hoy'}`,
      '',
      '=================================================================',
      '                    RESUMEN GENERAL                              ',
      '=================================================================',
      'Indicador\tValor',
      `Total de Ventas (monto)\t${formatCurrency(reporteData.montoTotal)}`,
      `Cantidad de Ventas\t${reporteData.totalVentas || 0}`,
      `Ticket Promedio\t${formatCurrency(reporteData.ticketPromedio)}`,
      `IGV Total\t${formatCurrency(reporteData.montoIgv)}`,
      `Descuentos Total\t${formatCurrency(reporteData.montoDescuentos)}`,
      '',
      '=================================================================',
      '              VENTAS POR TIPO DE COMPROBANTE                    ',
      '=================================================================',
      'Tipo Comprobante\tCantidad\tMonto Total',
      ...(reporteData.ventasPorTipo || []).map((t: any) =>
        `${t.tipoComprobante}\t${t.cantidad}\t${formatCurrency(t.total)}`
      ),
      '',
      '=================================================================',
      '                   VENTAS POR DIA                                ',
      '=================================================================',
      'Fecha\tCantidad de Ventas\tTotal del Dia',
      ...(reporteData.ventasPorDia || []).map((v: any) =>
        `${formatDateOnly(v.fecha)}\t${v.cantidad}\t${formatCurrency(v.total)}`
      ),
      '',
      '=================================================================',
      '            TOP 10 PRODUCTOS MAS VENDIDOS                       ',
      '=================================================================',
      'Ranking\tSKU\tProducto\tCategoria\tCantidad Vendida\tTotal',
      ...topProductos.map((p: any, idx: number) =>
        `#${idx + 1}\t${p.sku || '-'}\t${p.nombre}\t${p.categoriaNombre || '-'}\t${p.cantidadVendida}\t${formatCurrency(p.montoTotal)}`
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
    a.download = `Reporte_Ventas_${fechaDesde || 'completo'}_${fechaHasta || new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Reporte de Ventas">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Reporte de Ventas</PageTitle>
            <PageSubtitle>Resumen de ventas, desglose por tipo de comprobante y productos top</PageSubtitle>
          </div>
          <Button $variant="success" onClick={handleExportar} disabled={!reporteData || loading}>
            Exportar Reporte
          </Button>
        </PageHeader>

        <FiltersCard>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Fecha Desde</FilterLabel>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Fecha Hasta</FilterLabel>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
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
            <EmptyIcon>📊</EmptyIcon>
            <EmptyTitle>Sin datos disponibles</EmptyTitle>
            <EmptyText>Seleccione un rango de fechas y haga clic en "Generar Reporte".</EmptyText>
          </EmptyState>
        )}

        {!loading && reporteData && (
          <TabsContainer>
            <TabsHeader>
              <Tab $active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
                Resumen General
              </Tab>
              <Tab $active={activeTab === 'detalles'} onClick={() => setActiveTab('detalles')}>
                Detalles por Periodo
              </Tab>
              <Tab $active={activeTab === 'analisis'} onClick={() => setActiveTab('analisis')}>
                Top Productos
              </Tab>
            </TabsHeader>

            <TabContent>
              {activeTab === 'resumen' && (
                <>
                  <SummaryCards>
                    <SummaryCard>
                      <CardTitle>Monto Total Ventas</CardTitle>
                      <CardValue>{formatCurrency(reporteData.montoTotal)}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Cantidad de Ventas</CardTitle>
                      <CardValue>{reporteData.totalVentas || 0}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Ticket Promedio</CardTitle>
                      <CardValue>{formatCurrency(reporteData.ticketPromedio)}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>IGV Total</CardTitle>
                      <CardValue>{formatCurrency(reporteData.montoIgv)}</CardValue>
                    </SummaryCard>
                  </SummaryCards>

                  <Section>
                    <SectionTitle>Ventas por Tipo de Comprobante</SectionTitle>
                    {(reporteData.ventasPorTipo || []).length > 0 ? (
                      <TableContainer>
                        <Table>
                          <Thead>
                            <tr>
                              <Th>Tipo Comprobante</Th>
                              <Th>Cantidad</Th>
                              <Th>Total</Th>
                              <Th>Porcentaje</Th>
                            </tr>
                          </Thead>
                          <Tbody>
                            {reporteData.ventasPorTipo.map((t: any, idx: number) => {
                              const porcentaje = reporteData.montoTotal > 0
                                ? (Number(t.total) / Number(reporteData.montoTotal) * 100)
                                : 0;
                              return (
                                <Tr key={idx}>
                                  <Td>{t.tipoComprobante}</Td>
                                  <Td>{t.cantidad}</Td>
                                  <Td>{formatCurrency(t.total)}</Td>
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
                      <EmptyText>No hay datos de tipos de comprobante.</EmptyText>
                    )}
                  </Section>
                </>
              )}

              {activeTab === 'detalles' && (
                <Section>
                  <SectionTitle>Ventas por Dia</SectionTitle>
                  {(reporteData.ventasPorDia || []).length > 0 ? (
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Fecha</Th>
                            <Th>Cantidad</Th>
                            <Th>Total</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {reporteData.ventasPorDia.map((v: any, idx: number) => (
                            <Tr key={idx}>
                              <Td>{formatDateOnly(v.fecha)}</Td>
                              <Td>{v.cantidad}</Td>
                              <Td>{formatCurrency(v.total)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <EmptyText>No hay ventas en el periodo seleccionado.</EmptyText>
                  )}
                </Section>
              )}

              {activeTab === 'analisis' && (
                <Section>
                  <SectionTitle>Top 10 Productos Mas Vendidos</SectionTitle>
                  {topProductos.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>#</Th>
                            <Th>SKU</Th>
                            <Th>Producto</Th>
                            <Th>Categoria</Th>
                            <Th>Cantidad</Th>
                            <Th>Total</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {topProductos.map((p: any, idx: number) => (
                            <Tr key={idx}>
                              <Td><RankBadge $rank={idx + 1}>{idx + 1}</RankBadge></Td>
                              <Td>{p.sku || '-'}</Td>
                              <Td style={{ fontWeight: idx < 3 ? 600 : 400 }}>{p.nombre}</Td>
                              <Td>{p.categoriaNombre || '-'}</Td>
                              <Td>{p.cantidadVendida}</Td>
                              <Td>{formatCurrency(p.montoTotal)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <EmptyText>No hay datos de productos vendidos en este periodo.</EmptyText>
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

export default ReporteVentas;
