import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchEstadoPagos } from '../services/pagosApi';
import { ActionButton, StatusBadge } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { EstadoPagosResumen, SuscripcionDetallePago } from '../../../types/api';

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

const DiasIndicator = styled.span<{ $estado: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: ${RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  background: ${props => {
    switch (props.$estado) {
      case 'al_dia': return COLORS.successLight;
      case 'por_vencer': return COLORS.warningLight;
      case 'vencida': return COLORS.errorLight;
      default: return COLORS.surfaceHover;
    }
  }};
  color: ${props => {
    switch (props.$estado) {
      case 'al_dia': return COLORS.success;
      case 'por_vencer': return COLORS.warning;
      case 'vencida': return COLORS.error;
      default: return COLORS.text;
    }
  }};
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

type FiltroEstado = 'todos' | 'al_dia' | 'por_vencer' | 'vencida';

const EstadoPagos: React.FC = () => {
  const [resumen, setResumen] = useState<EstadoPagosResumen | null>(null);
  const [detalle, setDetalle] = useState<SuscripcionDetallePago[]>([]);
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchEstadoPagos();
      setResumen(res.resumen);
      setDetalle(res.detalle);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (nuevoFiltro: FiltroEstado) => {
    setFiltro(nuevoFiltro === filtro ? 'todos' : nuevoFiltro);
  };

  const filteredDetalle = filtro === 'todos'
    ? detalle
    : detalle.filter(d => d.estado === filtro);

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'al_dia': return 'Al día';
      case 'por_vencer': return 'Por vencer';
      case 'vencida': return 'Vencida';
      default: return estado;
    }
  };

  const getStatusForBadge = (estado: string) => {
    switch (estado) {
      case 'al_dia': return 'al_dia';
      case 'por_vencer': return 'por_vencer';
      case 'vencida': return 'vencida';
      default: return estado;
    }
  };

  return (
    <Layout title="Estado de Pagos">
      <StatsGrid>
        <StatCard $color={COLORS.primary} $active={filtro === 'todos'} onClick={() => handleCardClick('todos')}>
          <StatIcon $bgColor={COLORS.primary}>💳</StatIcon>
          <StatLabel>Total Suscripciones</StatLabel>
          <StatValue>{isLoading ? '...' : resumen?.totalSuscripciones ?? 0}</StatValue>
        </StatCard>

        <StatCard $color={COLORS.success} $active={filtro === 'al_dia'} onClick={() => handleCardClick('al_dia')}>
          <StatIcon $bgColor={COLORS.success}>✓</StatIcon>
          <StatLabel>Al Día</StatLabel>
          <StatValue style={{ color: COLORS.success }}>{isLoading ? '...' : resumen?.alDia ?? 0}</StatValue>
        </StatCard>

        <StatCard $color={COLORS.warning} $active={filtro === 'por_vencer'} onClick={() => handleCardClick('por_vencer')}>
          <StatIcon $bgColor={COLORS.warning}>⚠</StatIcon>
          <StatLabel>Por Vencer</StatLabel>
          <StatValue style={{ color: COLORS.warning }}>{isLoading ? '...' : resumen?.porVencer ?? 0}</StatValue>
        </StatCard>

        <StatCard $color={COLORS.error} $active={filtro === 'vencida'} onClick={() => handleCardClick('vencida')}>
          <StatIcon $bgColor={COLORS.error}>✗</StatIcon>
          <StatLabel>Vencidas</StatLabel>
          <StatValue style={{ color: COLORS.error }}>{isLoading ? '...' : resumen?.vencidas ?? 0}</StatValue>
        </StatCard>
      </StatsGrid>

      <SectionTitle>Detalle de Pagos</SectionTitle>

      <FilterBar>
        {(['todos', 'al_dia', 'por_vencer', 'vencida'] as FiltroEstado[]).map(f => (
          <FilterChip key={f} $active={filtro === f} onClick={() => setFiltro(f)}>
            {f === 'todos' ? 'Todos' : getEstadoLabel(f)}
          </FilterChip>
        ))}
      </FilterBar>

      {isLoading ? (
        <LoadingState>Cargando estado de pagos...</LoadingState>
      ) : filteredDetalle.length === 0 ? (
        <EmptyState>No se encontraron registros</EmptyState>
      ) : (
        <TableWrapper>
          <Table>
            <Thead>
              <tr>
                <Th>Tenant</Th>
                <Th>Plan</Th>
                <Th>Estado</Th>
                <Th>Último Pago</Th>
                <Th>Próximo Pago</Th>
                <Th>Días</Th>
                <Th>Monto</Th>
                <Th>Acciones</Th>
              </tr>
            </Thead>
            <Tbody>
              {filteredDetalle.map(item => (
                <Tr key={item.id}>
                  <Td style={{ fontWeight: TYPOGRAPHY.fontWeight.medium }}>{item.tenantNombre}</Td>
                  <Td>{item.plan}</Td>
                  <Td><StatusBadge $status={getStatusForBadge(item.estado)}>{getEstadoLabel(item.estado)}</StatusBadge></Td>
                  <Td>{item.fechaUltimoPago}</Td>
                  <Td>{item.fechaProximoPago}</Td>
                  <Td>
                    <DiasIndicator $estado={item.estado}>
                      {item.diasRestantes > 0 ? `${item.diasRestantes}d` : `${Math.abs(item.diasRestantes)}d vencido`}
                    </DiasIndicator>
                  </Td>
                  <Td style={{ fontWeight: TYPOGRAPHY.fontWeight.bold }}>S/ {item.montoUltimoPago.toFixed(2)}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <ActionButton $variant="view" title="Ver factura">📄</ActionButton>
                      <ActionButton $variant="edit" title="Registrar pago manual">💰</ActionButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableWrapper>
      )}
    </Layout>
  );
};

export default EstadoPagos;
