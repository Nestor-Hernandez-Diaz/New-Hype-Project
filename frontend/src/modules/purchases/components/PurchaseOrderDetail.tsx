/**
 * COMPONENTE: PurchaseOrderDetail
 * Vista detallada de una orden de compra
 * Fase 2 - Task 6
 * 
 * ✅ REFACTORIZADO: Reutiliza PurchaseOrderForm con mode='view'
 * Elimina duplicación de código y garantiza consistencia visual
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { Button as SharedButton } from '../../../components/shared';
import { purchaseOrderService } from '../services';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types/purchases.types';
import {
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_STATUS_COLORS,
} from '../types/purchases.types';
import { useNotification } from '../../../context/NotificationContext';
import { media } from '../../../styles/breakpoints';
import PurchaseOrderForm from './PurchaseOrderForm';

// ==================== TIPOS ====================

interface PurchaseOrderDetailProps {
  orderId: string;
  onEdit?: (orderId: string) => void;  // ✅ Solo necesita el ID
  onCreateReceipt?: (orderId: string) => void;  // ✅ Solo necesita el ID
  onClose?: () => void;
}

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING['2xl']};
  box-shadow: ${SHADOWS.md};
  max-width: 1200px;
  margin: 0 auto;
  
  ${media.mobile} {
    padding: ${SPACING.lg};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING['2xl']};
  padding-bottom: ${SPACING.lg};
  border-bottom: 2px solid ${COLORS.neutral[200]};
  flex-wrap: wrap;
  gap: ${SPACING.lg};
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  color: ${COLORS.text.primary};
  margin: 0 0 ${SPACING.sm} 0;
  
  ${media.mobile} {
    font-size: ${TYPOGRAPHY.fontSize.xl};
  }
`;

const Subtitle = styled.p`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.secondary};
  margin: 0;
`;

const StatusBadge = styled.span<{ $status: PurchaseOrderStatus }>`
  padding: ${SPACING.sm} ${SPACING.lg};
  border-radius: ${BORDER_RADIUS.full};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  background-color: ${props => PURCHASE_ORDER_STATUS_COLORS[props.$status] || COLORS.neutral[500]};
  color: ${COLORS.neutral.white};
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  gap: ${SPACING.sm};
  margin-top: ${SPACING.md};
  flex-wrap: wrap;
  
  ${media.mobile} {
    width: 100%;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #007bff;
  font-size: 16px;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #dc3545;
  font-size: 16px;
`;

const ActionButton = styled(SharedButton)<{ $variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background-color: ${COLORS.primary.main};
          color: ${COLORS.neutral.white};
          &:hover:not(:disabled) {
            background-color: ${COLORS.primary.dark};
          }
        `;
      case 'secondary':
        return `
          background-color: ${COLORS.neutral[200]};
          color: ${COLORS.text.primary};
          &:hover:not(:disabled) {
            background-color: ${COLORS.neutral[300]};
          }
        `;
      case 'success':
        return `
          background-color: ${COLORS.status.success};
          color: ${COLORS.neutral.white};
          &:hover:not(:disabled) {
            background-color: #218838;
          }
        `;
      case 'danger':
        return `
          background-color: ${COLORS.status.error};
          color: ${COLORS.neutral.white};
          &:hover:not(:disabled) {
            background-color: #c82333;
          }
        `;
      default:
        return `
          background-color: ${COLORS.primary.main};
          color: ${COLORS.neutral.white};
          &:hover:not(:disabled) {
            background-color: ${COLORS.primary.dark};
          }
        `;
    }
  }}
  
  transition: ${TRANSITIONS.default};
  border: none;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// ==================== COMPONENTE ====================

const PurchaseOrderDetail: React.FC<PurchaseOrderDetailProps> = ({
  orderId,
  onEdit,
  onCreateReceipt,
  onClose,
}) => {
  const { showNotification } = useNotification();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==================== EFECTOS ====================

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  // ==================== FUNCIONES ====================

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await purchaseOrderService.getPurchaseOrderById(orderId);
      setOrder(response.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar detalle de orden';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (newStatus: PurchaseOrderStatus) => {
    if (!order) return;

    const confirmMessage = `¿Está seguro de cambiar el estado a "${PURCHASE_ORDER_STATUS_LABELS[newStatus]}"?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await purchaseOrderService.updatePurchaseOrderStatus(order.id, {
        estado: newStatus,
        observaciones: `Estado cambiado a ${PURCHASE_ORDER_STATUS_LABELS[newStatus]}`,
      });

      showNotification(
        'success',
        'Estado Actualizado',
        `La orden ${order.codigo} cambió a estado ${PURCHASE_ORDER_STATUS_LABELS[newStatus]}`
      );
      fetchOrderDetail();
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cambiar estado';
      showNotification('error', 'Error al cambiar estado', errorMessage);
    }
  };

  const handleDownloadPDF = async () => {
    if (!order) return;

    try {
      showNotification('info', 'Generando PDF', `Preparando documento de la orden ${order.codigo}`);
      
      await purchaseOrderService.downloadPDF(order.id);
      
      showNotification('success', 'PDF Descargado', `Orden ${order.codigo} descargada exitosamente`);
    } catch (err: any) {
      console.error('Error al descargar PDF:', err);
      const errorMessage = err.message || 'No se pudo generar el PDF. Intente nuevamente.';
      showNotification('error', 'Error al descargar PDF', errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const canEdit = order && (order.estado === 'PENDIENTE' || order.estado === 'ENVIADA');
  const canCreateReceipt = order && ['CONFIRMADA', 'EN_RECEPCION', 'PARCIAL'].includes(order.estado);
  const canChangeStatus = order && !['COMPLETADA', 'CANCELADA'].includes(order.estado);

  // ==================== RENDER ====================

  if (loading) {
    return (
      <Container>
        <LoadingState>Cargando detalle de orden...</LoadingState>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container>
        <ErrorState>{error || 'Orden no encontrada'}</ErrorState>
        {onClose && (
          <Actions style={{ justifyContent: 'center' }}>
            <ActionButton $variant="secondary" onClick={onClose}>
              Volver
            </ActionButton>
          </Actions>
        )}
      </Container>
    );
  }

  return (
    <Container>
      {/* Header con badge de estado */}
      <Header>
        <HeaderLeft>
          <Title>Orden de Compra {order.codigo}</Title>
          <Subtitle>Creada el {formatDate(order.createdAt)}</Subtitle>
        </HeaderLeft>
        <StatusBadge $status={order.estado}>
          {PURCHASE_ORDER_STATUS_LABELS[order.estado]}
        </StatusBadge>
      </Header>

      {/* Barra de acciones */}
      <Actions>
        <ActionButton $variant="primary" onClick={handleDownloadPDF}>
          📄 Descargar PDF
        </ActionButton>
        {canEdit && onEdit && (
          <ActionButton $variant="secondary" onClick={() => onEdit(order.id)}>
            ✏️ Editar Orden
          </ActionButton>
        )}
        {canCreateReceipt && onCreateReceipt && (
          <ActionButton $variant="success" onClick={() => onCreateReceipt(order.id)}>
            📦 Crear Recepción
          </ActionButton>
        )}
        {order.estado === 'PENDIENTE' && (
          <ActionButton $variant="success" onClick={() => handleChangeStatus('ENVIADA')}>
            ➡️ Enviar a Proveedor
          </ActionButton>
        )}
        {order.estado === 'ENVIADA' && (
          <ActionButton $variant="success" onClick={() => handleChangeStatus('CONFIRMADA')}>
            ✅ Confirmar Orden
          </ActionButton>
        )}
        {order.estado === 'COMPLETADA' && (
          <ActionButton $variant="success" onClick={() => handleChangeStatus('CERRADA')}>
            🔒 Cerrar Orden
          </ActionButton>
        )}
        {canChangeStatus && ['PENDIENTE', 'ENVIADA', 'CONFIRMADA'].includes(order.estado) && (
          <ActionButton $variant="danger" onClick={() => handleChangeStatus('CANCELADA')}>
            ❌ Cancelar Orden
          </ActionButton>
        )}
        {onClose && (
          <ActionButton $variant="secondary" onClick={onClose}>
            Cerrar
          </ActionButton>
        )}
      </Actions>

      {/* ✅ REUTILIZAR PurchaseOrderForm con mode='view' */}
      <PurchaseOrderForm
        order={order}
        mode="view"
        onCancel={onClose}
      />
    </Container>
  );
};

export default PurchaseOrderDetail;
