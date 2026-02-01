/**
 * 📦 PÁGINA: PurchaseOrdersPage - ÓRDENES DE COMPRA
 * 
 * Gestión completa de Órdenes de Compra refactorizada con Context
 * Conectado a PurchasesContext con useReducer y Mock API
 * 
 * @packageDocumentation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { COLOR_SCALES, SPACING, BORDER_RADIUS } from '../../../styles/theme';
import Layout from '../../../components/Layout';
import Modal from '../../../components/Modal';
import { PurchaseOrderList, PurchaseOrderForm, PurchaseOrderDetail } from '../components';
import { usePurchases } from '../context/PurchasesContext';
import { useNotification } from '../../../context/NotificationContext';
import type { OrdenCompra } from '@monorepo/shared-types';

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding: 0;
`;

const ErrorContainer = styled.div`
  background: ${COLOR_SCALES.danger[50]};
  border: 1px solid ${COLOR_SCALES.danger[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.lg};
  color: ${COLOR_SCALES.danger[700]};
  margin-bottom: ${SPACING.lg};
`;

// ==================== COMPONENT ====================

const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: urlOrderId } = useParams<{ id?: string }>();
  const { notify } = useNotification();

  // Context
  const { ordenes, loading, error, loadOrdenes, getOrdenById, crearOrden, actualizarOrden, eliminarOrden, cambiarEstadoOrden } = usePurchases();

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrdenCompra | null>(null);

  // Auto-load órdenes
  useEffect(() => {
    loadOrdenes();
  }, [loadOrdenes]);

  // Abrir detalle desde URL
  useEffect(() => {
    if (urlOrderId) {
      handleView(urlOrderId);
    }
  }, [urlOrderId]);

  // ==================== HANDLERS ====================

  const handleCreate = () => {
    setSelectedOrder(null);
    setShowCreateModal(true);
  };

  const handleEdit = (order: OrdenCompra) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleView = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowDetailModal(true);
  };

  const handleDelete = async (orderId: string) => {
    await eliminarOrden(orderId);
    notify({ 
      type: 'success', 
      message: 'Orden eliminada correctamente',
      title: 'Éxito'
    });
  };

  const handleRefresh = async () => {
    await loadOrdenes();
    notify({ type: 'info', message: 'Lista actualizada', title: 'Éxito' });
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    await loadOrdenes();
    notify({ 
      type: 'success', 
      message: 'Orden creada correctamente',
      title: 'Éxito'
    });
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    await loadOrdenes();
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedOrder(null);
    setSelectedOrderId(null);
    if (urlOrderId) {
      navigate('/compras/ordenes', { replace: true });
    }
  };

  const handleCreateReceipt = (orderId: string) => {
    setShowDetailModal(false);
    navigate(`/compras/recepciones/crear?ordenId=${orderId}`);
  };

  const handleEditFromDetail = (orderId: string) => {
    const orden = getOrdenById(orderId);
    if (orden) {
      handleEdit(orden);
      setShowDetailModal(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <Layout title="Órdenes de Compra">
      <Container>
        {error && (
          <ErrorContainer>
            <strong>Error:</strong> {error}
          </ErrorContainer>
        )}

        <PurchaseOrderList
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          onCreate={handleCreate}
        />

        <Modal
          isOpen={showCreateModal}
          onClose={handleCancel}
          title="Nueva Orden de Compra"
          size="large"
        >
          <PurchaseOrderForm
            onSuccess={handleCreateSuccess}
            onCancel={handleCancel}
          />
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={handleCancel}
          title="Editar Orden de Compra"
          size="large"
        >
          {selectedOrder && (
            <PurchaseOrderForm
              order={selectedOrder}
              onSuccess={handleEditSuccess}
              onCancel={handleCancel}
            />
          )}
        </Modal>

        <Modal
          isOpen={showDetailModal}
          onClose={handleCancel}
          title="Detalle de Orden de Compra"
          size="large"
        >
          {selectedOrderId && (
            <PurchaseOrderDetail
              orderId={selectedOrderId}
              onEdit={handleEditFromDetail}
              onCreateReceipt={handleCreateReceipt}
              onClose={handleCancel}
            />
          )}
        </Modal>
      </Container>
    </Layout>
  );
};

export default PurchaseOrdersPage;
