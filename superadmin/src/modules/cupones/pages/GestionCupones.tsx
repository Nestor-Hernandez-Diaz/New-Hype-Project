import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchCupones } from '../services/cuponesApi';
import { Button } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { Cupon } from '../../../types/api';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING['2xl']};
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 800px;
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

const CodeBadge = styled.code`
  padding: ${SPACING.xs} ${SPACING.sm};
  border-radius: ${RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  background: ${COLORS.surfaceHover};
  color: ${COLORS.text};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  letter-spacing: 1px;
`;

const TypeBadge = styled.span<{ $tipo: string }>`
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: ${RADIUS.xl};
  font-size: 10px;
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => props.$tipo === 'PORCENTAJE' ? COLORS.infoLight : COLORS.warningLight};
  color: ${props => props.$tipo === 'PORCENTAJE' ? COLORS.info : COLORS.warning};
`;

const UsosBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UsosBg = styled.div`
  width: 100%;
  height: 6px;
  background: ${COLORS.surfaceHover};
  border-radius: 3px;
  overflow: hidden;
`;

const UsosFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${props => Math.min(props.$pct, 100)}%;
  background: ${props => props.$pct >= 90 ? COLORS.error : props.$pct >= 70 ? COLORS.warning : COLORS.success};
  border-radius: 3px;
  transition: width 0.5s ease;
`;

const UsosLabel = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLight};
`;

const EstadoBadge = styled.span<{ $activo: boolean }>`
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: ${RADIUS.xl};
  font-size: 10px;
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  text-transform: uppercase;
  background: ${props => props.$activo ? COLORS.successLight : COLORS.surfaceHover};
  color: ${props => props.$activo ? COLORS.success : COLORS.textLighter};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${SPACING['3xl']};
  color: ${COLORS.textLighter};
`;

// ============================================================================
// COMPONENT
// ============================================================================

const GestionCupones: React.FC = () => {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCupones();
  }, []);

  const loadCupones = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCupones();
      setCupones(data);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    total: cupones.length,
    activos: cupones.filter(c => c.activo).length,
    usosTotal: cupones.reduce((sum, c) => sum + c.usosActuales, 0),
  };

  return (
    <Layout title="Gestión de Cupones">
      <StatsRow>
        <StatCard>
          <StatLabel>Total Cupones</StatLabel>
          <StatValue>{isLoading ? '...' : stats.total}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Activos</StatLabel>
          <StatValue style={{ color: COLORS.success }}>{isLoading ? '...' : stats.activos}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Usos Totales</StatLabel>
          <StatValue>{isLoading ? '...' : stats.usosTotal}</StatValue>
        </StatCard>
      </StatsRow>

      <PageHeader>
        <h2 style={{ margin: 0, fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.text }}>
          Cupones Promocionales
        </h2>
        <Button onClick={() => window.alert('Modal de crear cupón — próximamente')}>
          + Nuevo Cupón
        </Button>
      </PageHeader>

      {isLoading ? (
        <LoadingState>Cargando cupones...</LoadingState>
      ) : (
        <TableWrapper>
          <Table>
            <Thead>
              <tr>
                <Th>Código</Th>
                <Th>Tipo</Th>
                <Th>Valor</Th>
                <Th>Expiración</Th>
                <Th>Usos</Th>
                <Th>Estado</Th>
              </tr>
            </Thead>
            <Tbody>
              {cupones.map(cupon => {
                const pctUsos = (cupon.usosActuales / cupon.usosMaximos) * 100;
                return (
                  <Tr key={cupon.id}>
                    <Td><CodeBadge>{cupon.codigo}</CodeBadge></Td>
                    <Td><TypeBadge $tipo={cupon.tipoDescuento}>{cupon.tipoDescuento === 'PORCENTAJE' ? '%' : 'S/'}</TypeBadge></Td>
                    <Td style={{ fontWeight: TYPOGRAPHY.fontWeight.bold }}>
                      {cupon.tipoDescuento === 'PORCENTAJE' ? `${cupon.valorDescuento}%` : `S/ ${cupon.valorDescuento}`}
                    </Td>
                    <Td>{cupon.fechaExpiracion}</Td>
                    <Td>
                      <UsosBar>
                        <UsosLabel>{cupon.usosActuales} / {cupon.usosMaximos}</UsosLabel>
                        <UsosBg><UsosFill $pct={pctUsos} /></UsosBg>
                      </UsosBar>
                    </Td>
                    <Td><EstadoBadge $activo={cupon.activo}>{cupon.activo ? 'Activo' : 'Inactivo'}</EstadoBadge></Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableWrapper>
      )}
    </Layout>
  );
};

export default GestionCupones;
