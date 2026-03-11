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
  StatusBadge,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText
} from '../../../components/shared';
import { formatDateToLocal } from '../../../utils/dateFormatter';

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
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Backend DTO: ReporteCajaResponse
 * - totalSesiones: long
 * - totalVentas: BigDecimal
 * - totalDiferencias: BigDecimal
 * - sesiones: [{
 *     sesionId, cajaId, cajaNombre, usuarioId, usuarioNombre,
 *     fechaApertura, fechaCierre, montoApertura, montoCierre,
 *     totalVentas, diferencia, estado
 *   }]
 */

const ReporteCaja: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'sesiones'>('resumen');
  const [fechaDesde, setFechaDesde] = useState(formatDateInput(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [fechaHasta, setFechaHasta] = useState(formatDateInput(new Date()));
  const [reporteData, setReporteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleBuscar();
  }, []);

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const res = await apiService.getReporteCaja({
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      });

      if (res.success && res.data) {
        setReporteData(res.data);
      }
    } catch (e) {
      console.error('Error cargando reporte caja', e);
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
      '                    REPORTE DE CAJA                              ',
      '=================================================================',
      `Fecha de Generacion:\t${fecha}\t${hora}`,
      `Periodo Analizado:\t${fechaDesde || 'Todas las fechas'}\tal\t${fechaHasta || 'Hoy'}`,
      '',
      '=================================================================',
      '                    RESUMEN GENERAL                              ',
      '=================================================================',
      'Indicador\tValor',
      `Total Sesiones\t${reporteData.totalSesiones || 0}`,
      `Total Ventas\t${formatCurrency(reporteData.totalVentas)}`,
      `Total Diferencias\t${formatCurrency(reporteData.totalDiferencias)}`,
      '',
      '=================================================================',
      '                 DETALLE DE SESIONES                             ',
      '=================================================================',
      'Caja\tUsuario\tApertura\tCierre\tMonto Apertura\tMonto Cierre\tVentas\tDiferencia\tEstado',
      ...(reporteData.sesiones || []).map((s: any) =>
        `${s.cajaNombre || '-'}\t${s.usuarioNombre || '-'}\t${formatDateToLocal(s.fechaApertura)}\t${formatDateToLocal(s.fechaCierre)}\t${formatCurrency(s.montoApertura)}\t${formatCurrency(s.montoCierre)}\t${formatCurrency(s.totalVentas)}\t${formatCurrency(s.diferencia)}\t${s.estado || '-'}`
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
    a.download = `Reporte_Caja_${fechaDesde || 'completo'}_${fechaHasta || new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getEstadoVariant = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'ABIERTA': return 'info';
      case 'CERRADA': return 'success';
      default: return 'default';
    }
  };

  return (
    <Layout title="Reporte de Caja">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Reporte de Caja</PageTitle>
            <PageSubtitle>Sesiones de caja, ventas y diferencias</PageSubtitle>
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
              {loading ? 'Buscando...' : 'Buscar'}
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
            <EmptyIcon>💰</EmptyIcon>
            <EmptyTitle>Sin datos disponibles</EmptyTitle>
            <EmptyText>Seleccione los filtros y haga clic en "Buscar".</EmptyText>
          </EmptyState>
        )}

        {!loading && reporteData && (
          <TabsContainer>
            <TabsHeader>
              <Tab $active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
                Resumen General
              </Tab>
              <Tab $active={activeTab === 'sesiones'} onClick={() => setActiveTab('sesiones')}>
                Sesiones Detalladas
              </Tab>
            </TabsHeader>

            <TabContent>
              {activeTab === 'resumen' && (
                <>
                  <SummaryCards>
                    <SummaryCard>
                      <CardTitle>Total Sesiones</CardTitle>
                      <CardValue>{reporteData.totalSesiones || 0}</CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Total Ventas</CardTitle>
                      <CardValue style={{ color: COLOR_SCALES.success[600] }}>
                        {formatCurrency(reporteData.totalVentas)}
                      </CardValue>
                    </SummaryCard>
                    <SummaryCard>
                      <CardTitle>Total Diferencias</CardTitle>
                      <CardValue style={{ color: reporteData.totalDiferencias !== 0 ? COLOR_SCALES.danger[600] : 'inherit' }}>
                        {formatCurrency(reporteData.totalDiferencias)}
                      </CardValue>
                    </SummaryCard>
                  </SummaryCards>
                </>
              )}

              {activeTab === 'sesiones' && (
                <Section>
                  <SectionTitle>Detalle de Sesiones de Caja</SectionTitle>
                  {(reporteData.sesiones || []).length > 0 ? (
                    <TableContainer>
                      <Table>
                        <Thead>
                          <tr>
                            <Th>Caja</Th>
                            <Th>Usuario</Th>
                            <Th>Apertura</Th>
                            <Th>Cierre</Th>
                            <Th>Mto. Apertura</Th>
                            <Th>Mto. Cierre</Th>
                            <Th>Ventas</Th>
                            <Th>Diferencia</Th>
                            <Th>Estado</Th>
                          </tr>
                        </Thead>
                        <Tbody>
                          {reporteData.sesiones.map((s: any, idx: number) => (
                            <Tr key={idx}>
                              <Td style={{ fontWeight: 600 }}>{s.cajaNombre || '-'}</Td>
                              <Td>{s.usuarioNombre || '-'}</Td>
                              <Td>{formatDateToLocal(s.fechaApertura)}</Td>
                              <Td>{formatDateToLocal(s.fechaCierre)}</Td>
                              <Td>{formatCurrency(s.montoApertura)}</Td>
                              <Td>{formatCurrency(s.montoCierre)}</Td>
                              <Td style={{ color: COLOR_SCALES.success[600], fontWeight: 600 }}>
                                {formatCurrency(s.totalVentas)}
                              </Td>
                              <Td style={{
                                color: s.diferencia && Number(s.diferencia) !== 0 ? COLOR_SCALES.danger[600] : 'inherit',
                                fontWeight: s.diferencia && Number(s.diferencia) !== 0 ? 600 : 400
                              }}>
                                {formatCurrency(s.diferencia)}
                              </Td>
                              <Td>
                                <StatusBadge variant={getEstadoVariant(s.estado)} dot>
                                  {s.estado || '-'}
                                </StatusBadge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <EmptyText>No hay sesiones de caja en el periodo seleccionado.</EmptyText>
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

export default ReporteCaja;
