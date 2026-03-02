import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchPlanes, toggleEstadoPlan } from '../services/planesApi';
import { Button, ActionButton } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { Plan } from '../../../types/api';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING['2xl']};
`;

const PlanesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${SPACING.xl};
`;

const PlanCard = styled.div<{ $inactive?: boolean }>`
  background: ${COLORS.surface};
  border: 1.5px solid ${props => props.$inactive ? COLORS.border : COLORS.primary};
  border-radius: ${RADIUS.lg};
  padding: ${SPACING.xl};
  box-shadow: ${SHADOWS.sm};
  transition: ${TRANSITION};
  opacity: ${props => props.$inactive ? 0.6 : 1};
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${SHADOWS.md};
  }
`;

const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.lg};
`;

const PlanName = styled.h3`
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.xs} 0;
`;

const PlanDesc = styled.p`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textLight};
  margin: 0 0 ${SPACING.lg} 0;
  line-height: 1.4;
`;

const PriceSection = styled.div`
  display: flex;
  gap: ${SPACING.xl};
  margin-bottom: ${SPACING.lg};
  padding-bottom: ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.border};
`;

const PriceBlock = styled.div`
  display: flex;
  flex-direction: column;
`;

const PriceLabel = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${COLORS.textLighter};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin-bottom: 2px;
`;

const PriceValue = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xl};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
`;

const LimitsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.sm};
  margin-bottom: ${SPACING.lg};
`;

const LimitItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${SPACING.sm};
  background: ${COLORS.surfaceHover};
  border-radius: ${RADIUS.sm};
`;

const LimitLabel = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${COLORS.textLighter};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

const LimitValue = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
`;

const PlanFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TenantCount = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textLight};

  strong {
    color: ${COLORS.text};
    font-weight: ${TYPOGRAPHY.fontWeight.bold};
  }
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: ${RADIUS.xl};
  font-size: 10px;
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => props.$active ? COLORS.successLight : COLORS.surfaceHover};
  color: ${props => props.$active ? COLORS.success : COLORS.textLighter};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${SPACING['3xl']};
  color: ${COLORS.textLighter};
`;

// ============================================================================
// HELPERS
// ============================================================================

const formatLimit = (n: number): string => {
  if (n >= 999999) return '∞';
  return n.toLocaleString();
};

// ============================================================================
// COMPONENT
// ============================================================================

const GestionPlanes: React.FC = () => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlanes();
  }, []);

  const loadPlanes = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPlanes();
      setPlanes(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEstado = async (plan: Plan) => {
    const accion = plan.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} el plan "${plan.nombre}"?`)) return;
    await toggleEstadoPlan(plan.id);
    await loadPlanes();
  };

  return (
    <Layout title="Gestión de Planes">
      <PageHeader>
        <div>
          <h2 style={{ margin: 0, fontSize: TYPOGRAPHY.fontSize.xl, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.text }}>
            Planes de Suscripción
          </h2>
          <p style={{ margin: `${SPACING.xs} 0 0`, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textLight }}>
            {planes.filter(p => p.activo).length} planes activos · {planes.reduce((sum, p) => sum + p.tenantCount, 0)} tenants suscritos
          </p>
        </div>
        <Button onClick={() => window.alert('Modal de crear plan — próximamente')}>
          + Nuevo Plan
        </Button>
      </PageHeader>

      {isLoading ? (
        <LoadingState>Cargando planes...</LoadingState>
      ) : (
        <PlanesGrid>
          {planes.map(plan => (
            <PlanCard key={plan.id} $inactive={!plan.activo}>
              <PlanHeader>
                <div>
                  <PlanName>{plan.nombre}</PlanName>
                  <StatusBadge $active={plan.activo}>
                    {plan.activo ? 'Activo' : 'Inactivo'}
                  </StatusBadge>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <ActionButton $variant="edit" title="Editar plan">✏️</ActionButton>
                  <ActionButton
                    $variant={plan.activo ? 'delete' : 'view'}
                    onClick={() => handleToggleEstado(plan)}
                    title={plan.activo ? 'Desactivar' : 'Activar'}
                  >
                    {plan.activo ? '⏸' : '▶'}
                  </ActionButton>
                </div>
              </PlanHeader>

              <PlanDesc>{plan.descripcion}</PlanDesc>

              <PriceSection>
                <PriceBlock>
                  <PriceLabel>Mensual</PriceLabel>
                  <PriceValue>S/ {plan.precioMensual}</PriceValue>
                </PriceBlock>
                <PriceBlock>
                  <PriceLabel>Anual</PriceLabel>
                  <PriceValue>S/ {plan.precioAnual}</PriceValue>
                </PriceBlock>
              </PriceSection>

              <LimitsGrid>
                <LimitItem>
                  <LimitLabel>Productos</LimitLabel>
                  <LimitValue>{formatLimit(plan.maxProductos)}</LimitValue>
                </LimitItem>
                <LimitItem>
                  <LimitLabel>Usuarios</LimitLabel>
                  <LimitValue>{formatLimit(plan.maxUsuarios)}</LimitValue>
                </LimitItem>
                <LimitItem>
                  <LimitLabel>Almacenes</LimitLabel>
                  <LimitValue>{formatLimit(plan.maxAlmacenes)}</LimitValue>
                </LimitItem>
                <LimitItem>
                  <LimitLabel>Ventas / mes</LimitLabel>
                  <LimitValue>{formatLimit(plan.maxVentasMes)}</LimitValue>
                </LimitItem>
              </LimitsGrid>

              <PlanFooter>
                <TenantCount>
                  <strong>{plan.tenantCount}</strong> tenants suscritos
                </TenantCount>
                <span style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textLighter }}>
                  Prueba: {plan.periodoPruebaDias}d · {plan.moduloIds.length} módulos
                </span>
              </PlanFooter>
            </PlanCard>
          ))}
        </PlanesGrid>
      )}
    </Layout>
  );
};

export default GestionPlanes;
