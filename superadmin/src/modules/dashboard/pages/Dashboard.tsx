import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchDashboardIngresos } from '../services/dashboardApi';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { DashboardIngresos } from '../../../types/api';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${SPACING.xl};
  margin-bottom: ${SPACING['3xl']};
`;

const StatCard = styled.div`
  background: ${COLORS.surface};
  border-radius: ${RADIUS.lg};
  padding: ${SPACING.xl};
  box-shadow: ${SHADOWS.sm};
  transition: ${TRANSITION};

  &:hover {
    transform: translateY(-3px);
    box-shadow: ${SHADOWS.md};
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${COLORS.textLighter};
  margin-bottom: ${SPACING.sm};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const StatValue = styled.div`
  font-size: ${TYPOGRAPHY.fontSize['3xl']};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
  margin-bottom: ${SPACING.xs};
`;

const StatChange = styled.div<{ positive?: boolean }>`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${props => props.positive ? COLORS.success : COLORS.error};
`;

const ActivitySection = styled.div`
  background: ${COLORS.surface};
  border-radius: ${RADIUS.lg};
  padding: ${SPACING.xl};
  box-shadow: ${SHADOWS.sm};
`;

const ActivityTitle = styled.h2`
  font-size: 14px;
  margin-bottom: ${SPACING.lg};
  color: ${COLORS.text};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  padding-bottom: 12px;
  border-bottom: 1px solid ${COLORS.border};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.md};
`;

const ActivityItem = styled.div<{ $type: string }>`
  display: flex;
  align-items: flex-start;
  gap: ${SPACING.md};
  padding: 14px 16px;
  border-radius: ${RADIUS.sm};
  background: ${COLORS.surfaceHover};
  transition: ${TRANSITION};

  &:hover {
    background: ${COLORS.border};
  }
`;

const ActivityIcon = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #525252;
  background: #ffffff;
  border-radius: ${RADIUS.sm};

  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityDescription = styled.div`
  font-size: 13px;
  color: ${COLORS.text};
  margin-bottom: ${SPACING.xs};
  line-height: 1.5;
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

const ActivityTime = styled.div`
  font-size: 11px;
  color: ${COLORS.textLighter};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  letter-spacing: 0.3px;
`;

interface ActivityLog {
  id: string;
  type: 'tenant' | 'plan' | 'pago' | 'ticket';
  description: string;
  timestamp: Date;
}

const MOCK_ACTIVITIES: ActivityLog[] = [
  {
    id: '1',
    type: 'tenant',
    description: 'Tenant "Boutique Fashion María" fue activado exitosamente',
    timestamp: new Date(Date.now() - 15 * 60000)
  },
  {
    id: '2',
    type: 'plan',
    description: 'Plan Enterprise asignado a "Urban Style Store"',
    timestamp: new Date(Date.now() - 45 * 60000)
  },
  {
    id: '3',
    type: 'pago',
    description: 'Pago confirmado: S/ 990.00 - Urban Style Store (Plan Enterprise)',
    timestamp: new Date(Date.now() - 2 * 3600000)
  },
  {
    id: '4',
    type: 'ticket',
    description: 'Ticket #1024 resuelto: "Error al generar boleta" - Boutique Fashion',
    timestamp: new Date(Date.now() - 3 * 3600000)
  },
  {
    id: '5',
    type: 'tenant',
    description: 'Nuevo tenant registrado: "Trendy Kids"',
    timestamp: new Date(Date.now() - 5 * 3600000)
  },
  {
    id: '6',
    type: 'plan',
    description: 'Suscripción de "Sport Zone Lima" próxima a vencer (7 días)',
    timestamp: new Date(Date.now() - 86400000)
  },
  {
    id: '7',
    type: 'pago',
    description: 'Pago confirmado: S/ 99.00 - Trendy Kids (Plan Básico)',
    timestamp: new Date(Date.now() - 2 * 86400000)
  },
  {
    id: '8',
    type: 'ticket',
    description: 'Nuevo ticket urgente #1028: "No puedo iniciar sesión" - Elegance Plus',
    timestamp: new Date(Date.now() - 3 * 86400000)
  }
];

const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Hace unos segundos';
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  const days = Math.floor(seconds / 86400);
  return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'tenant':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'plan':
      return (
        <svg viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'ticket':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
          <line x1="7" y1="10" x2="17" y2="10" />
        </svg>
      );
    case 'pago':
      return (
        <svg viewBox="0 0 24 24">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardIngresos | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const data = await fetchDashboardIngresos();
    setData(data);
  };

  return (
    <Layout title="Dashboard Global">
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Tenants</StatLabel>
          <StatValue>{data?.porPlan.reduce((a, p) => a + p.cantidadTenants, 0) ?? 0}</StatValue>
          <StatChange positive>Registrados en plataforma</StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>MRR (Ingresos Recurrentes)</StatLabel>
          <StatValue>S/ {data?.mrr.toFixed(2) ?? '0.00'}</StatValue>
          <StatChange positive>Mensual</StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>Ingresos Totales</StatLabel>
          <StatValue>S/ {data?.ingresosTotales.toFixed(2) ?? '0.00'}</StatValue>
          <StatChange positive>Acumulado</StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>Top Tenant</StatLabel>
          <StatValue>{data?.topTenants[0]?.tenantNombre ?? '—'}</StatValue>
          <StatChange positive>S/ {data?.topTenants[0]?.totalPagado.toFixed(2) ?? '0.00'}</StatChange>
        </StatCard>
      </StatsGrid>

      <ActivitySection>
        <ActivityTitle>Actividad Reciente del Sistema</ActivityTitle>
        <ActivityList>
          {MOCK_ACTIVITIES.map(activity => (
            <ActivityItem key={activity.id} $type={activity.type}>
              <ActivityIcon>{getActivityIcon(activity.type)}</ActivityIcon>
              <ActivityContent>
                <ActivityDescription>{activity.description}</ActivityDescription>
                <ActivityTime>{getTimeAgo(activity.timestamp)}</ActivityTime>
              </ActivityContent>
            </ActivityItem>
          ))}
        </ActivityList>
      </ActivitySection>
    </Layout>
  );
};

export default Dashboard;
