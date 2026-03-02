import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchTenants, cambiarEstadoTenant, enviarRecordatorioPago } from '../services/tenantsApi';
import { Button, ActionButton, StatusBadge } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { Tenant } from '../../../types/api';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xl};
  flex-wrap: wrap;
  gap: ${SPACING.md};
`;

const Title = styled.h2`
  font-size: ${TYPOGRAPHY.fontSize.xl};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.lg};
  margin-bottom: ${SPACING['2xl']};
`;

const StatCard = styled.div`
  background: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.lg};
  padding: ${SPACING.xl};
  box-shadow: ${SHADOWS.sm};
  transition: ${TRANSITION};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${SHADOWS.md};
  }
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${COLORS.textLighter};
  margin-bottom: ${SPACING.xs};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const StatValue = styled.div`
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
`;

const FiltersBar = styled.div`
  display: flex;
  gap: ${SPACING.md};
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

const SearchInput = styled.input`
  padding: ${SPACING.sm} ${SPACING.lg};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  min-width: 240px;
  transition: ${TRANSITION};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }

  &::placeholder {
    color: ${COLORS.textLighter};
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 1000px;
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

const TenantInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TenantName = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
`;

const TenantSub = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLighter};
`;

const PlanBadge = styled.span`
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: ${RADIUS.xl};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  background: ${COLORS.surfaceHover};
  color: ${COLORS.text};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING['3xl']};
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.base};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${SPACING['3xl']};
  color: ${COLORS.textLighter};
`;

// ============================================================================
// COMPONENT
// ============================================================================

type FiltroEstado = 'todos' | 'ACTIVA' | 'SUSPENDIDA' | 'PRUEBA' | 'CANCELADA';

const GestionTenants: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const res = await fetchTenants();
      setTenants(res.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspender = async (tenant: Tenant) => {
    const motivo = tenant.estado === 'ACTIVA'
      ? window.prompt('Motivo de suspensión:')
      : undefined;
    if (tenant.estado === 'ACTIVA' && !motivo) return;

    const nuevoEstado = tenant.estado === 'SUSPENDIDA' ? 'ACTIVA' : 'SUSPENDIDA';
    await cambiarEstadoTenant(tenant.id, { estado: nuevoEstado, motivo: motivo ?? undefined });
    await loadTenants();
  };

  const handleRecordatorio = async (tenant: Tenant) => {
    if (!window.confirm(`¿Enviar recordatorio de pago a ${tenant.nombre}?`)) return;
    await enviarRecordatorioPago(tenant.id);
    window.alert('Recordatorio enviado');
  };

  const getEstadoForBadge = (estado: string) => {
    switch (estado) {
      case 'ACTIVA':    return 'activa';
      case 'SUSPENDIDA': return 'suspendida';
      case 'PRUEBA':    return 'pendiente';
      case 'CANCELADA': return 'cancelada';
      default:          return estado;
    }
  };

  const filteredTenants = tenants
    .filter(t => filtro === 'todos' || t.estado === filtro)
    .filter(t => {
      if (!busqueda) return true;
      const q = busqueda.toLowerCase();
      return t.nombre.toLowerCase().includes(q) ||
             t.email.toLowerCase().includes(q) ||
             t.subdominio.toLowerCase().includes(q);
    });

  const stats = {
    total: tenants.length,
    activos: tenants.filter(t => t.estado === 'ACTIVA').length,
    suspendidos: tenants.filter(t => t.estado === 'SUSPENDIDA').length,
    prueba: tenants.filter(t => t.estado === 'PRUEBA').length,
  };

  return (
    <Layout title="Gestión de Tenants">
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Tenants</StatLabel>
          <StatValue>{isLoading ? '...' : stats.total}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Activos</StatLabel>
          <StatValue style={{ color: COLORS.success }}>{isLoading ? '...' : stats.activos}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Suspendidos</StatLabel>
          <StatValue style={{ color: COLORS.error }}>{isLoading ? '...' : stats.suspendidos}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>En Prueba</StatLabel>
          <StatValue style={{ color: COLORS.info }}>{isLoading ? '...' : stats.prueba}</StatValue>
        </StatCard>
      </StatsGrid>

      <PageHeader>
        <Title>Listado de Tenants</Title>
        <Button onClick={() => window.alert('Modal de crear tenant — próximamente')}>
          + Nuevo Tenant
        </Button>
      </PageHeader>

      <FiltersBar>
        {(['todos', 'ACTIVA', 'SUSPENDIDA', 'PRUEBA', 'CANCELADA'] as FiltroEstado[]).map(f => (
          <FilterChip key={f} $active={filtro === f} onClick={() => setFiltro(f)}>
            {f === 'todos' ? 'Todos' : f.charAt(0) + f.slice(1).toLowerCase()}
          </FilterChip>
        ))}
        <SearchInput
          placeholder="Buscar por nombre, email o subdominio..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </FiltersBar>

      {isLoading ? (
        <LoadingState>Cargando tenants...</LoadingState>
      ) : filteredTenants.length === 0 ? (
        <EmptyState>No se encontraron tenants</EmptyState>
      ) : (
        <TableWrapper>
          <Table>
            <Thead>
              <tr>
                <Th>Tenant</Th>
                <Th>Propietario</Th>
                <Th>Plan</Th>
                <Th>Estado</Th>
                <Th>Vencimiento</Th>
                <Th>Acciones</Th>
              </tr>
            </Thead>
            <Tbody>
              {filteredTenants.map(tenant => (
                <Tr key={tenant.id}>
                  <Td>
                    <TenantInfo>
                      <TenantName>{tenant.nombre}</TenantName>
                      <TenantSub>{tenant.subdominio} · {tenant.email}</TenantSub>
                    </TenantInfo>
                  </Td>
                  <Td>{tenant.propietarioNombre}</Td>
                  <Td><PlanBadge>{tenant.planNombre}</PlanBadge></Td>
                  <Td><StatusBadge $status={getEstadoForBadge(tenant.estado)}>{tenant.estado}</StatusBadge></Td>
                  <Td>{tenant.fechaVencimiento}</Td>
                  <Td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <ActionButton $variant="view" title="Ver detalle">👁</ActionButton>
                      <ActionButton $variant="edit" onClick={() => handleSuspender(tenant)} title={tenant.estado === 'SUSPENDIDA' ? 'Activar' : 'Suspender'}>
                        {tenant.estado === 'SUSPENDIDA' ? '▶' : '⏸'}
                      </ActionButton>
                      <ActionButton $variant="view" onClick={() => handleRecordatorio(tenant)} title="Enviar recordatorio">📧</ActionButton>
                      <ActionButton $variant="delete" title="Eliminar">🗑</ActionButton>
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

export default GestionTenants;
