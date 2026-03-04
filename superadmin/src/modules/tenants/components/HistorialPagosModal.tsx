import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchPagosTenant } from '../services/tenantsApi';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { Tenant, PagoTenant } from '../../../types/api';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${SPACING.xl};
`;

const Modal = styled.div`
  background: ${COLORS.surface};
  border-radius: ${RADIUS.lg};
  box-shadow: ${SHADOWS.lg};
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: ${SPACING.xl};
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${COLORS.textLight};
  padding: 4px;
  transition: ${TRANSITION};
  &:hover { color: ${COLORS.text}; }
`;

const Body = styled.div`
  padding: ${SPACING.xl};
  overflow-y: auto;
  flex: 1;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: ${SPACING.sm} ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLight};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid ${COLORS.border};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: ${SPACING.sm} ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  border-bottom: 1px solid ${COLORS.border};
  white-space: nowrap;
`;

const StatusBadge = styled.span<{ $estado: string }>`
  padding: 2px 10px;
  border-radius: ${RADIUS.full};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  background: ${({ $estado }) =>
    $estado === 'PAGADO' ? '#dcfce7' :
    $estado === 'PENDIENTE' ? '#fef9c3' :
    $estado === 'VENCIDO' ? '#fef2f2' : COLORS.surfaceHover};
  color: ${({ $estado }) =>
    $estado === 'PAGADO' ? '#166534' :
    $estado === 'PENDIENTE' ? '#854d0e' :
    $estado === 'VENCIDO' ? '#991b1b' : COLORS.text};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING['2xl']};
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${SPACING['2xl']};
  color: ${COLORS.textLight};
`;

const Footer = styled.div`
  padding: ${SPACING.lg} ${SPACING.xl};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const TotalLabel = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textLight};
`;

const TotalAmount = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
`;

interface Props {
  tenant: Tenant;
  onClose: () => void;
}

const formatDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('es-PE') : '—';
const formatMoney = (n?: number | null) => n != null ? `S/ ${n.toFixed(2)}` : '—';

const HistorialPagosModal: React.FC<Props> = ({ tenant, onClose }) => {
  const [pagos, setPagos] = useState<PagoTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchPagosTenant(tenant.id)
      .then(data => setPagos(Array.isArray(data) ? data : []))
      .catch(() => setPagos([]))
      .finally(() => setIsLoading(false));
  }, [tenant.id]);

  const total = pagos.reduce((sum, p) => sum + (p.monto ?? 0), 0);

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Historial de Pagos — {tenant.nombre}</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>
        <Body>
          {isLoading ? (
            <LoadingState>Cargando pagos...</LoadingState>
          ) : pagos.length === 0 ? (
            <EmptyState>No se encontraron pagos para este negocio.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Fecha</Th>
                  <Th>Periodo</Th>
                  <Th>Método</Th>
                  <Th>Estado</Th>
                  <Th>Monto</Th>
                  <Th>Referencia</Th>
                </tr>
              </thead>
              <tbody>
                {pagos.map(p => (
                  <tr key={p.id}>
                    <Td>{formatDate(p.fechaPago)}</Td>
                    <Td>{formatDate(p.periodoInicio)} — {formatDate(p.periodoFin)}</Td>
                    <Td>{p.metodoPago ?? '—'}</Td>
                    <Td><StatusBadge $estado={p.estado ?? ''}>{p.estado ?? '—'}</StatusBadge></Td>
                    <Td>{formatMoney(p.monto)}</Td>
                    <Td>{p.referenciaTransaccion ?? '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Body>
        <Footer>
          <TotalLabel>Total pagado: <TotalAmount>{formatMoney(total)}</TotalAmount></TotalLabel>
          <button
            onClick={onClose}
            style={{
              padding: `${SPACING.sm} ${SPACING.lg}`,
              background: COLORS.primary,
              color: COLORS.surface,
              border: 'none',
              borderRadius: RADIUS.md,
              cursor: 'pointer',
              fontSize: TYPOGRAPHY.fontSize.sm,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
            }}
          >
            Cerrar
          </button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default HistorialPagosModal;
