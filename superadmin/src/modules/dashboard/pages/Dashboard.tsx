import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchSucursales } from '../../sucursales/services/sucursalesApi';
import { fetchSuscripciones } from '../../suscripciones/services/suscripcionesApi';
import { fetchEstadisticas } from '../../usuarios/services/usuariosApi';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';

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
  type: 'sucursal' | 'suscripcion' | 'usuario' | 'pago';
  description: string;
  timestamp: Date;
}

const MOCK_ACTIVITIES: ActivityLog[] = [
  {
    id: '1',
    type: 'sucursal',
    description: 'Sucursal "Boutique Fashion" fue activada exitosamente',
    timestamp: new Date(Date.now() - 15 * 60000)
  },
  {
    id: '2',
    type: 'suscripcion',
    description: 'Suscripción renovada para "Urban Style" - Plan Anual',
    timestamp: new Date(Date.now() - 45 * 60000)
  },
  {
    id: '3',
    type: 'usuario',
    description: 'Nuevo usuario creado: Ana Vendedora (Boutique Fashion)',
    timestamp: new Date(Date.now() - 2 * 3600000)
  },
  {
    id: '4',
    type: 'pago',
    description: 'Pago confirmado: S/ 990.00 - Urban Style (Plan Anual)',
    timestamp: new Date(Date.now() - 3 * 3600000)
  },
  {
    id: '5',
    type: 'usuario',
    description: 'Usuario suspendido: Jorge Almacén por inactividad',
    timestamp: new Date(Date.now() - 5 * 3600000)
  },
  {
    id: '6',
    type: 'suscripcion',
    description: 'Suscripción de "Boutique Fashion" próxima a vencer (7 días)',
    timestamp: new Date(Date.now() - 86400000)
  },
  {
    id: '7',
    type: 'sucursal',
    description: 'Nueva sucursal registrada: "Urban Style"',
    timestamp: new Date(Date.now() - 2 * 86400000)
  },
  {
    id: '8',
    type: 'pago',
    description: 'Pago confirmado: S/ 99.00 - Boutique Fashion (Plan Mensual)',
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
    case 'sucursal':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'suscripcion':
      return (
        <svg viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case 'usuario':
      return (
        <svg viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
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
  const [stats, setStats] = useState({
    totalSucursales: 0,
    sucursalesActivas: 0,
    ingresosMensuales: 0,
    totalUsuarios: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [sucursales, suscripciones, usuarios] = await Promise.all([
      fetchSucursales(),
      fetchSuscripciones(),
      fetchEstadisticas(),
    ]);

    const activas = sucursales.filter(s => s.estado === 'activa').length;
    const ingresos = suscripciones
      .filter(s => s.estado === 'activa')
      .reduce((acc, s) => {
        const mensual = s.plan.tipo === 'anual' ? s.precioFinal / 12 : s.precioFinal;
        return acc + mensual;
      }, 0);

    setStats({
      totalSucursales: sucursales.length,
      sucursalesActivas: activas,
      ingresosMensuales: ingresos,
      totalUsuarios: usuarios.totalUsuarios,
    });
  };

  return (
    <Layout title="Dashboard Global">
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Sucursales</StatLabel>
          <StatValue>{stats.totalSucursales}</StatValue>
          <StatChange positive>+{stats.sucursalesActivas} activas</StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>Sucursales Activas</StatLabel>
          <StatValue>{stats.sucursalesActivas}</StatValue>
          <StatChange positive>{stats.totalSucursales > 0 ? Math.round((stats.sucursalesActivas / stats.totalSucursales) * 100) : 0}% del total</StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>Ingresos Mensuales</StatLabel>
          <StatValue>S/ {stats.ingresosMensuales.toFixed(2)}</StatValue>
          <StatChange positive>Estimado mensual</StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>Usuarios Totales</StatLabel>
          <StatValue>{stats.totalUsuarios}</StatValue>
          <StatChange positive>Todos los sistemas</StatChange>
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
