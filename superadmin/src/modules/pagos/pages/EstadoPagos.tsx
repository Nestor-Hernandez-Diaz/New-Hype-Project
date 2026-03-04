import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchEstadoPagos, fetchAllPagos } from '../services/pagosApi';
import { Button, ActionButton, StatusBadge } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { EstadoPagosResumen, PagoTenant } from '../../../types/api';
import RegistrarPagoModal from '../components/RegistrarPagoModal';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.lg};
  margin-bottom: ${SPACING['2xl']};
`;

const StatCard = styled.div<{ $color?: string; $active?: boolean }>`
  background: ${COLORS.surface};
  border: 2px solid ${props => props.$active ? (props.$color || COLORS.border) : COLORS.border};
  border-radius: ${RADIUS.lg};
  padding: ${SPACING.xl};
  box-shadow: ${props => props.$active ? SHADOWS.md : SHADOWS.sm};
  cursor: pointer;
  transition: ${TRANSITION};

  &:hover {
    border-color: ${props => props.$color || COLORS.primary};
    box-shadow: ${SHADOWS.md};
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div<{ $bgColor: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${RADIUS.md};
  background: ${props => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${SPACING.md};
  font-size: 20px;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${COLORS.textLighter};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin-bottom: ${SPACING.xs};
`;

const StatValue = styled.div`
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
`;

const SectionTitle = styled.h2`
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  margin-bottom: ${SPACING.lg};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${SPACING.sm};
  margin-bottom: ${SPACING.xl};
  flex-wrap: wrap;
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  padding: ${SPACING.sm} ${SPACING.lg};
  border: 1.5px solid ${props => props.$active ? COLORS.primary : COLORS.border};
  background: ${props => props.$active ? COLORS.primary : COLORS.surface};
  color: ${props => props.$active ? '#fff' : COLORS.text};
  border-radius: ${RADIUS.xl};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: ${TRANSITION};

  &:hover {
    border-color: ${COLORS.primary};
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 900px;
  background: ${COLORS.surface};
  border-radius: ${RADIUS.lg};
  overflow: hidden;
  box-shadow: ${SHADOWS.sm};
`;

const Thead = styled.thead`
  background: ${COLORS.surfaceHover};
`;

const Th = styled.th`
  padding: ${SPACING.lg};
  text-align: left;
  font-size: 11px;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLighter};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-top: 1px solid ${COLORS.border};
  transition: ${TRANSITION};

  &:hover {
    background: ${COLORS.surfaceHover};
  }
`;

const Td = styled.td`
  padding: ${SPACING.lg};
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING['3xl']};
  color: ${COLORS.textLight};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${SPACING['3xl']};
  color: ${COLORS.textLighter};
`;

// ============================================================================
// COMPONENT
// ============================================================================

type FiltroEstado = 'todos' | 'CONFIRMADO' | 'PENDIENTE' | 'RECHAZADO';

const EstadoPagos: React.FC = () => {
  const [resumen, setResumen] = useState<EstadoPagosResumen | null>(null);
  const [pagos, setPagos] = useState<PagoTenant[]>([]);
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistrar, setShowRegistrar] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [res, allPagos] = await Promise.all([
        fetchEstadoPagos().catch(() => null),
        fetchAllPagos().catch(() => []),
      ]);
      setResumen(res ?? null);
      setPagos(allPagos);
    } catch (err) {
      console.error('Error cargando pagos:', err);
      setResumen(null);
      setPagos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPagos = filtro === 'todos'
    ? pagos
    : pagos.filter(p => p.estado === filtro);

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADO': return 'Confirmado';
      case 'PENDIENTE': return 'Pendiente';
      case 'RECHAZADO': return 'Rechazado';
      default: return estado;
    }
  };

  const getStatusForBadge = (estado: string) => {
    switch (estado) {
      case 'CONFIRMADO': return 'al_dia';
      case 'PENDIENTE': return 'por_vencer';
      case 'RECHAZADO': return 'vencida';
      default: return estado;
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <Layout title="Pagos">
      <StatsGrid>
        <StatCard $color={COLORS.primary}>
          <StatIcon $bgColor={COLORS.primary}>💳</StatIcon>
          <StatLabel>Total Suscripciones</StatLabel>
          <StatValue>{isLoading ? '...' : resumen?.totalSuscripciones ?? 0}</StatValue>
        </StatCard>

        <StatCard $color={COLORS.success}>
          <StatIcon $bgColor={COLORS.success}>✓</StatIcon>
          <StatLabel>Al Día</StatLabel>
          <StatValue style={{ color: COLORS.success }}>{isLoading ? '...' : resumen?.alDia ?? 0}</StatValue>
        </StatCard>

        <StatCard $color={COLORS.warning}>
          <StatIcon $bgColor={COLORS.warning}>⚠</StatIcon>
          <StatLabel>Por Vencer</StatLabel>
          <StatValue style={{ color: COLORS.warning }}>{isLoading ? '...' : resumen?.porVencer ?? 0}</StatValue>
        </StatCard>

        <StatCard $color={COLORS.error}>
          <StatIcon $bgColor={COLORS.error}>✗</StatIcon>
          <StatLabel>Vencidas</StatLabel>
          <StatValue style={{ color: COLORS.error }}>{isLoading ? '...' : resumen?.vencidas ?? 0}</StatValue>
        </StatCard>
      </StatsGrid>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
        <SectionTitle style={{ marginBottom: 0 }}>Detalle de Pagos</SectionTitle>
        <Button onClick={() => setShowRegistrar(true)}>+ Registrar Pago</Button>
      </div>

      <FilterBar>
        {(['todos', 'CONFIRMADO', 'PENDIENTE', 'RECHAZADO'] as FiltroEstado[]).map(f => (
          <FilterChip key={f} $active={filtro === f} onClick={() => setFiltro(f)}>
            {f === 'todos' ? `Todos (${pagos.length})` : `${getEstadoLabel(f)} (${pagos.filter(p => p.estado === f).length})`}
          </FilterChip>
        ))}
      </FilterBar>

      {isLoading ? (
        <LoadingState>Cargando estado de pagos...</LoadingState>
      ) : filteredPagos.length === 0 ? (
        <EmptyState>No se encontraron registros</EmptyState>
      ) : (
        <TableWrapper>
          <Table>
            <Thead>
              <tr>
                <Th>Negocio</Th>
                <Th>Fecha Pago</Th>
                <Th>Periodo</Th>
                <Th>Método</Th>
                <Th>Estado</Th>
                <Th>Monto</Th>
                <Th>Referencia</Th>
                <Th>Acciones</Th>
              </tr>
            </Thead>
            <Tbody>
              {filteredPagos.map(pago => (
                <Tr key={pago.id}>
                  <Td style={{ fontWeight: TYPOGRAPHY.fontWeight.medium }}>{pago.tenantNombre}</Td>
                  <Td>{formatDate(pago.fechaPago)}</Td>
                  <Td>{formatDate(pago.periodoInicio)} – {formatDate(pago.periodoFin)}</Td>
                  <Td>{pago.metodoPago}</Td>
                  <Td><StatusBadge $status={getStatusForBadge(pago.estado)}>{getEstadoLabel(pago.estado)}</StatusBadge></Td>
                  <Td style={{ fontWeight: TYPOGRAPHY.fontWeight.bold }}>S/ {pago.monto.toFixed(2)}</Td>
                  <Td style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textLighter }}>{pago.referenciaTransaccion}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <ActionButton $variant="view" title="Ver factura">📄</ActionButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableWrapper>
      )}
      {showRegistrar && (
        <RegistrarPagoModal
          onClose={() => setShowRegistrar(false)}
          onCreated={() => { setShowRegistrar(false); loadData(); }}
        />
      )}
    </Layout>
  );
};

export default EstadoPagos;
