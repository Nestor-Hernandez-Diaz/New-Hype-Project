import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import {
  fetchEstadoPagos,
  fetchDetallePagos,
  type EstadoPagosData,
  type SuscripcionDetallePago,
} from '../services/estadoPagosApi';
import { fetchSuscripcion, renovarSuscripcion } from '../services/suscripcionesApi';
import { actualizarSucursal } from '../../sucursales/services/sucursalesApi';
import { ActionButton, StatusBadge } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../../styles/theme';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${SPACING.xl};
  margin-bottom: ${SPACING['2xl']};
`;

const StatCard = styled.div<{ $color?: string; $active?: boolean }>`
  background: ${COLORS.surface};
  border: 2px solid ${props => props.$active ? (props.$color || COLORS.border) : COLORS.border};
  border-radius: 12px;
  padding: ${SPACING.xl};
  box-shadow: ${props => props.$active ? SHADOWS.md : SHADOWS.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${props => props.$color || COLORS.primary};
    box-shadow: ${SHADOWS.md};
    transform: translateY(-2px);
  }
`;

const StatIcon = styled.div<{ $bgColor: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${SPACING.md};

  svg {
    width: 24px;
    height: 24px;
    stroke: white;
    stroke-width: 2;
    fill: none;
  }
`;

const StatLabel = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textLight};
  margin-bottom: ${SPACING.xs};
`;

const StatValue = styled.div`
  font-size: ${TYPOGRAPHY.fontSize['3xl']};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
`;

const SectionTitle = styled.h2`
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  margin-bottom: ${SPACING.lg};
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${SPACING.sm};
  margin-bottom: ${SPACING.xl};
  flex-wrap: wrap;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: ${SPACING.sm} ${SPACING.lg};
  border: 1px solid ${props => props.$active ? COLORS.superadmin : COLORS.border};
  background: ${props => props.$active ? COLORS.superadmin : COLORS.surface};
  color: ${props => props.$active ? '#fff' : COLORS.text};
  border-radius: 8px;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${COLORS.superadmin};
    background: ${props => props.$active ? COLORS.superadminDark : COLORS.surfaceHover};
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 980px;
  background: ${COLORS.surface};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${SHADOWS.sm};
`;

const Thead = styled.thead`
  background: ${COLORS.surfaceHover};
`;

const Th = styled.th`
  padding: ${SPACING.lg};
  text-align: left;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-top: 1px solid ${COLORS.border};

  &:hover {
    background: ${COLORS.surfaceHover};
  }
`;

const Td = styled.td`
  padding: ${SPACING.lg};
  color: ${COLORS.text};
`;

const DiasIndicator = styled.span<{ $estado: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: 8px;
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
  font-size: ${TYPOGRAPHY.fontSize.base};
`;

// ============================================================================
// HELPERS
// ============================================================================

type FiltroEstado = 'todos' | 'al_dia' | 'por_vencer' | 'vencida';

const getVencimientoByPlan = (plan: 'mensual' | 'anual'): string => {
  const fecha = new Date();
  if (plan === 'anual') {
    fecha.setFullYear(fecha.getFullYear() + 1);
  } else {
    fecha.setMonth(fecha.getMonth() + 1);
  }
  return fecha.toISOString().split('T')[0];
};

const getEstadoLabel = (estado: string): string => {
  switch (estado) {
    case 'al_dia': return 'Al día';
    case 'por_vencer': return 'Por vencer';
    case 'vencida': return 'Vencida';
    default: return estado;
  }
};

const getStatusForBadge = (estado: string): string => {
  switch (estado) {
    case 'al_dia': return 'activa';
    case 'por_vencer': return 'pendiente';
    case 'vencida': return 'vencida';
    default: return estado;
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

const EstadoPagos: React.FC = () => {
  const [resumen, setResumen] = useState<EstadoPagosData | null>(null);
  const [detalle, setDetalle] = useState<SuscripcionDetallePago[]>([]);
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadDetalle();
  }, [filtro]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [estadoRes, detalleRes] = await Promise.all([
        fetchEstadoPagos(),
        fetchDetallePagos('todos'),
      ]);
      setResumen(estadoRes.data);
      setDetalle(detalleRes);
    } catch (error) {
      console.error('Error cargando estado de pagos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDetalle = async () => {
    try {
      const data = await fetchDetallePagos(filtro);
      setDetalle(data);
    } catch (error) {
      console.error('Error cargando detalle:', error);
    }
  };

  const handleCardClick = (nuevoFiltro: FiltroEstado) => {
    setFiltro(nuevoFiltro === filtro ? 'todos' : nuevoFiltro);
  };

  const handleVerEditar = async (item: SuscripcionDetallePago) => {
    const suscripcion = await fetchSuscripcion(item.id);
    if (!suscripcion) {
      window.alert('No se encontró la suscripción asociada.');
      return;
    }

    const nombreActualizado = window.prompt('Editar nombre de sucursal', item.sucursalNombre);
    if (!nombreActualizado?.trim()) return;

    const planInput = window.prompt('Editar plan (mensual/anual)', suscripcion.plan.tipo);
    if (!planInput) return;

    const planNormalizado = planInput.trim().toLowerCase();
    const planActual: 'mensual' | 'anual' = planNormalizado === 'anual' ? 'anual' : 'mensual';

    await actualizarSucursal(suscripcion.sucursalId, {
      nombre: nombreActualizado.trim(),
      planActual,
      fechaVencimiento: getVencimientoByPlan(planActual),
    });

    await loadData();
  };

  const handleNotificar = async (item: SuscripcionDetallePago) => {
    if (!window.confirm(`¿Marcar como gestionada y renovar suscripción de ${item.sucursalNombre}?`)) {
      return;
    }

    await renovarSuscripcion(item.id);
    await loadData();
  };

  return (
    <Layout title="Estado de Pagos">
      {/* ── Dashboard Cards ── */}
      <StatsGrid>
        <StatCard
          $color={COLORS.superadmin}
          $active={filtro === 'todos'}
          onClick={() => handleCardClick('todos')}
        >
          <StatIcon $bgColor={COLORS.superadmin}>
            <svg viewBox="0 0 24 24">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </StatIcon>
          <StatLabel>Total Suscripciones</StatLabel>
          <StatValue>{isLoading ? '...' : resumen?.totalSuscripciones ?? 0}</StatValue>
        </StatCard>

        <StatCard
          $color={COLORS.success}
          $active={filtro === 'al_dia'}
          onClick={() => handleCardClick('al_dia')}
        >
          <StatIcon $bgColor={COLORS.success}>
            <svg viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </StatIcon>
          <StatLabel>Al Día</StatLabel>
          <StatValue>{isLoading ? '...' : resumen?.alDia ?? 0}</StatValue>
        </StatCard>

        <StatCard
          $color={COLORS.warning}
          $active={filtro === 'por_vencer'}
          onClick={() => handleCardClick('por_vencer')}
        >
          <StatIcon $bgColor={COLORS.warning}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </StatIcon>
          <StatLabel>Por Vencer (7d)</StatLabel>
          <StatValue>{isLoading ? '...' : resumen?.porVencer ?? 0}</StatValue>
        </StatCard>

        <StatCard
          $color={COLORS.error}
          $active={filtro === 'vencida'}
          onClick={() => handleCardClick('vencida')}
        >
          <StatIcon $bgColor={COLORS.error}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </StatIcon>
          <StatLabel>Vencidas</StatLabel>
          <StatValue>{isLoading ? '...' : resumen?.vencidas ?? 0}</StatValue>
        </StatCard>
      </StatsGrid>

      {/* ── Filtros ── */}
      <SectionTitle>
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, stroke: COLORS.text, strokeWidth: 2, fill: 'none' }}>
          <path d="M4 6h16M4 12h10M4 18h6" />
        </svg>
        Detalle de Pagos por Suscripción
      </SectionTitle>

      <FilterBar>
        {(['todos', 'al_dia', 'por_vencer', 'vencida'] as FiltroEstado[]).map(f => (
          <FilterButton
            key={f}
            $active={filtro === f}
            onClick={() => setFiltro(f)}
          >
            {f === 'todos' ? 'Todos' : getEstadoLabel(f)}
          </FilterButton>
        ))}
      </FilterBar>

      {/* ── Tabla de Detalle ── */}
      {isLoading ? (
        <EmptyState>Cargando estado de pagos...</EmptyState>
      ) : detalle.length === 0 ? (
        <EmptyState>No se encontraron suscripciones con el filtro seleccionado.</EmptyState>
      ) : (
        <TableWrapper>
        <Table>
          <Thead>
            <Tr>
              <Th>Sucursal</Th>
              <Th>Plan</Th>
              <Th>Estado</Th>
              <Th>Último Pago</Th>
              <Th>Próximo Pago</Th>
              <Th>Monto Pendiente</Th>
              <Th>Días Restantes</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {detalle.map(item => (
              <Tr key={item.id}>
                <Td>
                  <div style={{ fontWeight: 600 }}>{item.sucursalNombre}</div>
                  <div style={{ fontSize: '12px', color: COLORS.textLight }}>
                    {item.metodoPago}
                  </div>
                </Td>
                <Td style={{ fontWeight: 500 }}>{item.plan}</Td>
                <Td>
                  <StatusBadge $status={getStatusForBadge(item.estado)}>
                    {getEstadoLabel(item.estado)}
                  </StatusBadge>
                </Td>
                <Td>{new Date(item.fechaUltimoPago).toLocaleDateString('es-PE')}</Td>
                <Td>{new Date(item.fechaProximoPago).toLocaleDateString('es-PE')}</Td>
                <Td>
                  <span style={{
                    fontWeight: 600,
                    color: item.montoPendiente > 0 ? COLORS.error : COLORS.success,
                  }}>
                    S/ {item.montoPendiente.toFixed(2)}
                  </span>
                </Td>
                <Td>
                  <DiasIndicator $estado={item.estado}>
                    {item.diasRestantes > 0
                      ? `${item.diasRestantes}d`
                      : item.diasRestantes === 0
                        ? 'Hoy'
                        : `${Math.abs(item.diasRestantes)}d vencido`}
                  </DiasIndicator>
                </Td>
                <Td>
                  <ActionButton
                    $variant="view"
                    onClick={() => handleVerEditar(item)}
                  >
                    Ver/Editar
                  </ActionButton>
                  {item.estado === 'vencida' && (
                    <>
                      {' '}
                      <ActionButton
                        $variant="activate"
                        onClick={() => handleNotificar(item)}
                      >
                        Notificar
                      </ActionButton>
                    </>
                  )}
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
