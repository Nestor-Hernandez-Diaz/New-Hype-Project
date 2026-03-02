import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchAuditLogs } from '../services/auditoriaApi';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { AuditLog } from '../../../types/api';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const FiltersBar = styled.div`
  display: flex;
  gap: ${SPACING.md};
  margin-bottom: ${SPACING.xl};
  flex-wrap: wrap;
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FilterLabel = styled.label`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${COLORS.textLighter};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const FilterInput = styled.input`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  min-width: 160px;
  transition: ${TRANSITION};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const FilterSelect = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  cursor: pointer;
  transition: ${TRANSITION};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
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

const AccionBadge = styled.span<{ $accion: string }>`
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: ${RADIUS.xl};
  font-size: 10px;
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${props => {
    if (props.$accion.includes('LOGIN')) return COLORS.infoLight;
    if (props.$accion.includes('CREAR') || props.$accion.includes('REGISTR')) return COLORS.successLight;
    if (props.$accion.includes('ACTUALIZAR') || props.$accion.includes('CAMBIAR')) return COLORS.warningLight;
    if (props.$accion.includes('ELIMINAR') || props.$accion.includes('SUSPEND')) return COLORS.errorLight;
    return COLORS.surfaceHover;
  }};
  color: ${props => {
    if (props.$accion.includes('LOGIN')) return COLORS.info;
    if (props.$accion.includes('CREAR') || props.$accion.includes('REGISTR')) return COLORS.success;
    if (props.$accion.includes('ACTUALIZAR') || props.$accion.includes('CAMBIAR')) return COLORS.warning;
    if (props.$accion.includes('ELIMINAR') || props.$accion.includes('SUSPEND')) return COLORS.error;
    return COLORS.textLight;
  }};
`;

const TenantCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const TenantName = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
`;

const TenantEmail = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLighter};
`;

const IpBadge = styled.code`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLight};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${SPACING['3xl']};
  color: ${COLORS.textLighter};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING['3xl']};
  color: ${COLORS.textLight};
`;

const ResultCount = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textLight};
  margin-bottom: ${SPACING.lg};
`;

// ============================================================================
// HELPERS
// ============================================================================

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};

// ============================================================================
// COMPONENT
// ============================================================================

const LogsAuditoria: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('');
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuditLogs({
        accion: filtroAccion || undefined,
        fechaDesde: filtroFechaDesde || undefined,
        fechaHasta: filtroFechaHasta || undefined,
      });
      setLogs(res.content);
    } finally {
      setIsLoading(false);
    }
  };

  const acciones = [...new Set(logs.map(l => l.accion))];

  return (
    <Layout title="Auditoría Global">
      <FiltersBar>
        <FilterGroup>
          <FilterLabel>Acción</FilterLabel>
          <FilterSelect value={filtroAccion} onChange={e => setFiltroAccion(e.target.value)}>
            <option value="">Todas</option>
            {acciones.map(a => <option key={a} value={a}>{a}</option>)}
          </FilterSelect>
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>Desde</FilterLabel>
          <FilterInput type="date" value={filtroFechaDesde} onChange={e => setFiltroFechaDesde(e.target.value)} />
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>Hasta</FilterLabel>
          <FilterInput type="date" value={filtroFechaHasta} onChange={e => setFiltroFechaHasta(e.target.value)} />
        </FilterGroup>
      </FiltersBar>

      <ResultCount>
        {isLoading ? 'Cargando...' : `${logs.length} registros encontrados`}
      </ResultCount>

      {isLoading ? (
        <LoadingState>Cargando logs de auditoría...</LoadingState>
      ) : logs.length === 0 ? (
        <EmptyState>No se encontraron registros</EmptyState>
      ) : (
        <TableWrapper>
          <Table>
            <Thead>
              <tr>
                <Th>Fecha</Th>
                <Th>Tenant</Th>
                <Th>Acción</Th>
                <Th>Entidad</Th>
                <Th>Detalles</Th>
                <Th>IP</Th>
              </tr>
            </Thead>
            <Tbody>
              {logs.map(log => (
                <Tr key={log.id}>
                  <Td style={{ whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</Td>
                  <Td>
                    <TenantCell>
                      <TenantName>{log.tenantNombre}</TenantName>
                      <TenantEmail>{log.usuarioEmail}</TenantEmail>
                    </TenantCell>
                  </Td>
                  <Td><AccionBadge $accion={log.accion}>{log.accion}</AccionBadge></Td>
                  <Td>{log.entidad} #{log.entidadId}</Td>
                  <Td>{log.detalles}</Td>
                  <Td><IpBadge>{log.ip}</IpBadge></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableWrapper>
      )}
    </Layout>
  );
};

export default LogsAuditoria;
