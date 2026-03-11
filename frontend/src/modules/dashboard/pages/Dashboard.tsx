import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Layout from '../../../components/Layout';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../styles/theme';
import { StatCard, StatsGrid, StatValue, StatLabel, Card } from '../../../components/shared';
import { apiService } from '../../../utils/api';
import { auditoriaApi, type AuditLog } from '../../audit/services/auditoriaApi';
import { formatDateToLocal } from '../../../utils/dateFormatter';

// ============================================================================
// INTERFACES
// ============================================================================

interface ResumenDashboard {
  ventasHoy: number;
  totalVentasHoy: number;
  ventasMes: number;
  totalVentasMes: number;
  productosStockBajo: number;
  comprasPendientes: number;
  notasCreditoMes: number;
  totalNotasCreditoMes: number;
  productosActivos: number;
  clientesRegistrados: number;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const ActivityCard = styled(Card)`
  grid-column: 1 / -1;
`;

const ActivityTitle = styled.h3`
  margin: 0 0 ${SPACING.xl} 0;
  font-size: ${TYPOGRAPHY.fontSize.h3};
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActivityItem = styled.li`
  padding: ${SPACING.md} 0;
  border-bottom: 1px solid ${COLORS.neutral[200]};
  display: flex;
  align-items: center;
  gap: ${SPACING.md};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.i`
  color: ${COLORS.primary[600]};
  font-size: ${TYPOGRAPHY.fontSize.small};
  min-width: 16px;
`;

const ActivityText = styled.span`
  flex: 1;
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

const ActivityTime = styled.span`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  white-space: nowrap;
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const SkeletonBlock = styled.div`
  background: ${COLORS.neutral[200]};
  border-radius: 4px;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonValue = styled(SkeletonBlock)`
  height: 2rem;
  width: 80px;
  margin: 0 auto ${SPACING.sm};
`;

const SkeletonLabel = styled(SkeletonBlock)`
  height: 0.875rem;
  width: 120px;
  margin: 0 auto;
`;

const SkeletonLine = styled(SkeletonBlock)`
  height: 1rem;
  width: 100%;
  margin-bottom: ${SPACING.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${SPACING.xl};
  color: ${COLORS.text.secondary};
`;

// ============================================================================
// HELPERS
// ============================================================================

function getActionIcon(action: string): string {
  const map: Record<string, string> = {
    LOGIN: 'fas fa-sign-in-alt',
    LOGOUT: 'fas fa-sign-out-alt',
    CREATE: 'fas fa-plus-circle',
    UPDATE: 'fas fa-edit',
    DELETE: 'fas fa-trash',
    SALE: 'fas fa-shopping-cart',
  };
  return map[action] || 'fas fa-circle';
}

function formatCurrency(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ============================================================================
// COMPONENT
// ============================================================================

const Dashboard: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [resumenRes, logsRes] = await Promise.all([
          apiService.getResumenDashboard(),
          auditoriaApi.getAuditLogs({ limit: 10 }),
        ]);

        if (resumenRes.success && resumenRes.data) {
          setResumen(resumenRes.data as ResumenDashboard);
        }

        if (logsRes.logs) {
          setLogs(logsRes.logs);
        }
      } catch (err) {
        setError('No se pudieron cargar los datos del dashboard');
        console.error('Error al cargar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout title="Dashboard">
      <StatsGrid>
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <StatCard key={i} $color={COLORS.neutral[300]}>
                <SkeletonValue />
                <SkeletonLabel />
              </StatCard>
            ))}
          </>
        ) : error || !resumen ? (
          <StatCard $color={COLORS.neutral[300]} style={{ gridColumn: '1 / -1' }}>
            <ErrorMessage>{error || 'Sin datos disponibles'}</ErrorMessage>
          </StatCard>
        ) : (
          <>
            <StatCard $color="#27ae60">
              <StatValue $color="#27ae60">{formatCurrency(resumen.totalVentasHoy)}</StatValue>
              <StatLabel>Ventas de Hoy ({resumen.ventasHoy})</StatLabel>
            </StatCard>

            <StatCard $color="#3498db">
              <StatValue $color="#3498db">{resumen.productosActivos}</StatValue>
              <StatLabel>Productos Activos</StatLabel>
            </StatCard>

            <StatCard $color="#f39c12">
              <StatValue $color="#f39c12">{resumen.clientesRegistrados}</StatValue>
              <StatLabel>Clientes Registrados</StatLabel>
            </StatCard>

            <StatCard $color="#e74c3c">
              <StatValue $color="#e74c3c">{resumen.comprasPendientes}</StatValue>
              <StatLabel>Compras Pendientes</StatLabel>
            </StatCard>
          </>
        )}
      </StatsGrid>

      <ActivityCard>
        <ActivityTitle>Actividad Reciente</ActivityTitle>
        {loading ? (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonLine key={i} />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <ErrorMessage>No hay actividad reciente registrada</ErrorMessage>
        ) : (
          <ActivityList>
            {logs.map((log) => (
              <ActivityItem key={log.id}>
                <ActivityIcon className={getActionIcon(log.action)} />
                <ActivityText>{log.details || log.action}</ActivityText>
                <ActivityTime>{formatDateToLocal(log.timestamp)}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityList>
        )}
      </ActivityCard>
    </Layout>
  );
};

export default Dashboard;
