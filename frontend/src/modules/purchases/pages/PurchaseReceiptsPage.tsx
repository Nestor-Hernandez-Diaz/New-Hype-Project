/**
 * 📬 PÁGINA: PurchaseReceiptsPage - RECEPCIONES DE COMPRA
 * 
 * Gestión completa de Recepciones de Compra refactorizada con Context
 * Conectado a PurchasesContext con useReducer y Mock API
 * 
 * @packageDocumentation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { COLOR_SCALES, SPACING, BORDER_RADIUS } from '../../../styles/theme';
import Layout from '../../../components/Layout';
import Modal from '../../../components/Modal';
import { PurchaseReceiptList, PurchaseReceiptForm, PurchaseReceiptDetail } from '../components';
import { usePurchases } from '../context/PurchasesContext';
import { useNotification } from '../../../context/NotificationContext';
import type { Recepcion } from '@monorepo/shared-types';

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

const PurchaseReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: urlReceiptId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const { notify } = useNotification();

  // Context
  const { recepciones, loading, error, loadRecepciones, getRecepcionById, crearRecepcion, actualizarRecepcion, eliminarRecepcion, cambiarEstadoRecepcion } = usePurchases();

  // Query params
  const preselectedOrderId = searchParams.get('ordenId') || undefined;

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  // Auto-load recepciones
  useEffect(() => {
    loadRecepciones();
  }, [loadRecepciones]);

  // Abrir detalle desde URL
  useEffect(() => {
    if (urlReceiptId) {
      handleView(urlReceiptId);
    }
  }, [urlReceiptId]);

  // Abrir modal crear si viene ordenId en query
  useEffect(() => {
    if (preselectedOrderId && !showCreateModal) {
      setShowCreateModal(true);
    }
  }, [preselectedOrderId]);

  // ==================== HANDLERS ====================

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleView = (receiptId: string) => {
    setSelectedReceiptId(receiptId);
    setShowDetailModal(true);
  };

  const handleDelete = async (receiptId: string) => {
    await eliminarRecepcion(receiptId);
    notify({ 
      type: 'success', 
      message: 'Recepción eliminada correctamente',
      title: 'Éxito'
    });
  };

  const handleRefresh = async () => {
    await loadRecepciones();
    notify({ type: 'info', message: 'Lista actualizada', title: 'Éxito' });
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    await loadRecepciones();
    notify({ 
      type: 'success', 
      message: 'Recepción creada correctamente',
      title: 'Éxito'
    });
    
    // Limpiar query params
    if (preselectedOrderId) {
      navigate('/compras/recepciones', { replace: true });
    }
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setShowDetailModal(false);
    setSelectedReceiptId(null);
    
    // Limpiar URL
    if (urlReceiptId || preselectedOrderId) {
      navigate('/compras/recepciones', { replace: true });
    }
  };

  // ==================== RENDER ====================

  return (
    <Layout title="Recepciones de Compra">
      <Container>
        {error && (
          <ErrorContainer>
            <strong>Error:</strong> {error}
          </ErrorContainer>
        )}

        <PurchaseReceiptList
          onCreate={handleCreate}
          onView={handleView}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />

        <Modal
          isOpen={showCreateModal}
          onClose={handleCancel}
          title="Nueva Recepción de Compra"
          size="large"
        >
          <PurchaseReceiptForm
            preselectedOrderId={preselectedOrderId}
            onSuccess={handleCreateSuccess}
            onCancel={handleCancel}
          />
        </Modal>

        <Modal
          isOpen={showDetailModal}
          onClose={handleCancel}
          title="Detalle de Recepción de Compra"
          size="large"
        >
          {selectedReceiptId && (
            <PurchaseReceiptDetail
              receiptId={selectedReceiptId}
              onConfirm={handleRefresh}
              onClose={handleCancel}
            />
          )}
        </Modal>
      </Container>
    </Layout>
  );
};

export default PurchaseReceiptsPage;
