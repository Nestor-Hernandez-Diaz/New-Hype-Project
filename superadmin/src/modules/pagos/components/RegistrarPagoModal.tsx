import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { registrarPagoManual } from '../services/pagosApi';
import { fetchTenants } from '../../tenants/services/tenantsApi';
import { Button } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { PagoManualPayload, Tenant } from '../../../types/api';
import { useToast } from '../../../context/ToastContext';

// ============================================================================
// STYLED
// ============================================================================

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
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  padding: ${SPACING.xl};
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: flex;
  flex-direction: column;
  gap: ${SPACING.lg};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.lg};
`;

const Label = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
`;

const Input = styled.input`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${TRANSITION};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }

  &::placeholder { color: ${COLORS.textLighter}; }
`;

const Select = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${TRANSITION};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const Footer = styled.div`
  padding: ${SPACING.lg} ${SPACING.xl};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.md};
`;



// ============================================================================
// COMPONENT
// ============================================================================

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const METODOS_PAGO = [
  'TRANSFERENCIA',
  'TARJETA',
  'YAPE',
  'PLIN',
  'EFECTIVO',
];

const RegistrarPagoModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [form, setForm] = useState<PagoManualPayload>({
    tenantId: 0,
    monto: 0,
    metodoPago: 'TRANSFERENCIA',
    referenciaTransaccion: '',
    cuponCodigo: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchTenants({ size: 200 })
      .then(res => {
        const list = Array.isArray(res) ? res : res?.content ?? [];
        setTenants(list);
      })
      .catch(() => setTenants([]));
  }, []);

  const set = (field: keyof PagoManualPayload, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.tenantId) { toast.warning('Selecciona un negocio'); return; }
    if (!form.monto || form.monto <= 0) { toast.warning('El monto debe ser mayor a 0'); return; }
    if (!form.referenciaTransaccion.trim()) { toast.warning('La referencia es obligatoria'); return; }

    setIsSaving(true);
    try {
      const payload: PagoManualPayload = {
        ...form,
        cuponCodigo: form.cuponCodigo?.trim() || undefined,
      };
      await registrarPagoManual(payload);
      toast.success('Pago registrado exitosamente');
      setTimeout(() => onCreated(), 1200);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar pago');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Registrar Pago Manual</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        <Body>

          <Field>
            <Label>Negocio *</Label>
            <Select value={form.tenantId} onChange={e => set('tenantId', Number(e.target.value))}>
              <option value={0}>Seleccionar negocio...</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </Select>
          </Field>

          <Row>
            <Field>
              <Label>Monto (S/) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.monto || ''}
                onChange={e => set('monto', parseFloat(e.target.value) || 0)}
                placeholder="49.90"
              />
            </Field>
            <Field>
              <Label>Método de Pago *</Label>
              <Select value={form.metodoPago} onChange={e => set('metodoPago', e.target.value)}>
                {METODOS_PAGO.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </Field>
          </Row>

          <Field>
            <Label>Referencia de Transacción *</Label>
            <Input
              value={form.referenciaTransaccion}
              onChange={e => set('referenciaTransaccion', e.target.value)}
              placeholder="TRF-2026-XXX"
            />
          </Field>

          <Field>
            <Label>Código de Cupón (opcional)</Label>
            <Input
              value={form.cuponCodigo ?? ''}
              onChange={e => set('cuponCodigo', e.target.value)}
              placeholder="DESCUENTO20"
            />
          </Field>
        </Body>

        <Footer>
          <Button $variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Registrando...' : 'Registrar Pago'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default RegistrarPagoModal;
