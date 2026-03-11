import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchDashboardIngresos } from '../services/dashboardApi';
import { fetchEstadoPagos } from '../../pagos/services/pagosApi';
import { fetchAuditLogs } from '../../auditoria/services/auditoriaApi';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { DashboardIngresos, EstadoPagosResumen, AuditLog } from '../../../types/api';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${SPACING.xl};
  margin-bottom: ${SPACING['3xl']};

  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
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

const StatChange = styled.div<{ $positive?: boolean }>`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${props => props.$positive ? COLORS.success : COLORS.error};
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

// ============================================================================
// HELPERS
// ============================================================================

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

const getAuditIcon = (accion: string) => {
  const a = accion?.toLowerCase() ?? '';
  if (a.includes('login') || a.includes('sesion') || a.includes('auth'))
    return (
      <svg viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
    );
  if (a.includes('pago') || a.includes('cobro') || a.includes('factur'))
    return (
      <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
    );
  if (a.includes('plan') || a.includes('suscrip'))
    return (
      <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
    );
  if (a.includes('tenant') || a.includes('negocio') || a.includes('crear') || a.includes('registr'))
    return (
      <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    );
  // default: shield/audit icon
  return (
    <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
  );
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardIngresos | null>(null);
  const [estadoPagos, setEstadoPagos] = useState<EstadoPagosResumen | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [dashData, pagosResumen, logsRes] = await Promise.all([
        fetchDashboardIngresos(),
        fetchEstadoPagos().catch(() => null),
        fetchAuditLogs({ size: 10, page: 0 }).catch(() => null),
      ]);
      setData(dashData);
      setEstadoPagos(pagosResumen);
      // API returns { success, data: AuditLog[], pagination } — apiFetch unwraps to AuditLog[]
      const logs = Array.isArray(logsRes) ? logsRes : (logsRes as any)?.content ?? [];
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  return (
    <Layout title="Dashboard Global">
      <StatsGrid>
        <StatCard>
          <StatLabel>Total Negocios</StatLabel>
          <StatValue>{data?.totalTenants ?? 0}</StatValue>
          <StatChange $positive>{data?.tenantsActivos ?? 0} activos</StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>Ingresos del Mes</StatLabel>
          <StatValue>S/ {data?.ingresosMesActual?.toFixed(2) ?? '0.00'}</StatValue>
          <StatChange $positive={Number(data?.porcentajeCrecimiento ?? 0) >= 0}>
            {Number(data?.porcentajeCrecimiento ?? 0) >= 0 ? '+' : ''}{data?.porcentajeCrecimiento ?? 0}% vs mes anterior
          </StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>Mes Anterior</StatLabel>
          <StatValue>S/ {data?.ingresosMesAnterior?.toFixed(2) ?? '0.00'}</StatValue>
          <StatChange $positive>Referencia</StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>Por Vencer</StatLabel>
          <StatValue style={{ color: COLORS.warning }}>{estadoPagos?.porVencer ?? 0}</StatValue>
          <StatChange $positive={false}>Suscripciones próximas a vencer</StatChange>
        </StatCard>

        <StatCard>
          <StatLabel>Vencidos</StatLabel>
          <StatValue style={{ color: COLORS.error }}>{estadoPagos?.vencidas ?? 0}</StatValue>
          <StatChange $positive={false}>Suscripciones vencidas</StatChange>
        </StatCard>
      </StatsGrid>

      <ActivitySection>
        <ActivityTitle>Actividad Reciente del Sistema</ActivityTitle>
        {logsLoading ? (
          <div style={{ textAlign: 'center', padding: SPACING['2xl'], color: COLORS.textLighter }}>Cargando actividad...</div>
        ) : auditLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: SPACING['2xl'], color: COLORS.textLight }}>No se encontraron registros de auditoría</div>
        ) : (
          <ActivityList>
            {auditLogs.map(log => (
              <ActivityItem key={log.id} $type={log.accion}>
                <ActivityIcon>{getAuditIcon(log.accion)}</ActivityIcon>
                <ActivityContent>
                  <ActivityDescription>
                    <strong>{log.accion}</strong> — {log.detalle || 'Sin detalle'}
                  </ActivityDescription>
                  <ActivityTime>
                    {log.tenantNombre && <span style={{ marginRight: '8px', color: COLORS.textLight }}>{log.tenantNombre}</span>}
                    {log.nombreUsuario && <span style={{ marginRight: '8px' }}>por {log.nombreUsuario}</span>}
                    {log.createdAt ? getTimeAgo(new Date(log.createdAt)) : ''}
                    {log.ipAddress && <span style={{ marginLeft: '8px', opacity: 0.6 }}>· {log.ipAddress}</span>}
                  </ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))}
          </ActivityList>
        )}
      </ActivitySection>
    </Layout>
  );
};

export default Dashboard;
