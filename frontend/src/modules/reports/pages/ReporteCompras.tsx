import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { apiService } from '../../../utils/api';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
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

// Helpers
const formatCurrency = (num: number | undefined | null) => {
  if (num === undefined || num === null || isNaN(Number(num))) return 'S/ 0.00';
  return `S/ ${Number(num).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
 * Backend DTO: ReporteComprasResponse
 * - totalOrdenes: long
 * - montoTotal: BigDecimal
 * - ordenesPendientes: long
 * - ordenesCompletadas: long
 * - porProveedor: [{proveedorId, proveedorNombre, cantidadOrdenes, montoTotal}]
 */

const ReporteCompras: React.FC = () => {
  const [fechaDesde, setFechaDesde] = useState(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [fechaHasta, setFechaHasta] = useState(formatDateInput(new Date()));
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'resumen' | 'proveedores'>('resumen');

  useEffect(() => {
    handleBuscar();
  }, []);

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const res = await apiService.getReporteCompras({
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      });

      if (res.success && res.data) {
        setReporteData(res.data);
      }
    } catch (e) {
      console.error('Error cargando reporte compras', e);
      setReporteData(null);
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
      '                    REPORTE DE COMPRAS                           ',
      '=================================================================',
      `Fecha de Generacion:\t${fecha}\t${hora}`,
      `Periodo Analizado:\t${fechaDesde || 'Todas las fechas'}\tal\t${fechaHasta || 'Hoy'}`,
      '',
      '=================================================================',
      '                    RESUMEN GENERAL                              ',
      '=================================================================',
      'Indicador\tValor',
      `Total Ordenes\t${reporteData.totalOrdenes || 0}`,
      `Monto Total\t${formatCurrency(reporteData.montoTotal)}`,
      `Ordenes Pendientes\t${reporteData.ordenesPendientes || 0}`,
      `Ordenes Completadas\t${reporteData.ordenesCompletadas || 0}`,
      '',
      '=================================================================',
      '                 COMPRAS POR PROVEEDOR                           ',
      '=================================================================',
      'Proveedor\tCantidad Ordenes\tMonto Total\tPorcentaje',
      ...(reporteData.porProveedor || []).map((p: any) => {
        const porcentaje = reporteData.montoTotal > 0
          ? (Number(p.montoTotal) / Number(reporteData.montoTotal) * 100).toFixed(2)
          : '0.00';
        return `${p.proveedorNombre || 'Sin nombre'}\t${p.cantidadOrdenes || 0}\t${formatCurrency(p.montoTotal)}\t${porcentaje}%`;
      }),
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
    a.download = `Reporte_Compras_${fechaDesde || 'completo'}_${fechaHasta || new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Reporte de Compras">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Reporte de Compras</PageTitle>
            <PageSubtitle>Resumen de ordenes de compra y desglose por proveedor</PageSubtitle>
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
            <EmptyIcon>📦</EmptyIcon>
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
              <Tab $active={activeTab === 'proveedores'} onClick={() => setActiveTab('proveedores')}>
                Por Proveedor
              </Tab>
            </TabsHeader>

            <TabContent>
              {activeTab === 'resumen' && (
                <>
                  <SummaryCards>
                    <SummaryCard>
                      <CardTitle>Total Ordenes</CardTitle>
                      <CardValue>{reporteData.totalOrdenes || 0}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Monto Total</CardTitle>
                      <CardValue>{formatCurrency(reporteData.montoTotal)}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Pendientes</CardTitle>
                      <CardValue>{reporteData.ordenesPendientes || 0}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Completadas</CardTitle>
                      <CardValue>{reporteData.ordenesCompletadas || 0}</CardValue>
                    </SummaryCard>
                  </SummaryCards>
                </>
              )}

              {activeTab === 'proveedores' && (
                <Section>
                  <SectionTitle>Compras por Proveedor</SectionTitle>
                  {(reporteData.porProveedor || []).length > 0 ? (
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Proveedor</Th>
                            <Th>Cant. Ordenes</Th>
                            <Th>Monto Total</Th>
                            <Th>Porcentaje</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {reporteData.porProveedor.map((p: any, idx: number) => {
                            const porcentaje = reporteData.montoTotal > 0
                              ? (Number(p.montoTotal) / Number(reporteData.montoTotal) * 100)
                              : 0;
                            return (
                              <Tr key={idx}>
                                <Td style={{ fontWeight: 500 }}>{p.proveedorNombre || 'Sin nombre'}</Td>
                                <Td>{p.cantidadOrdenes || 0}</Td>
                                <Td>{formatCurrency(p.montoTotal)}</Td>
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
                    <EmptyText>No hay datos de proveedores.</EmptyText>
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

export default ReporteCompras;
