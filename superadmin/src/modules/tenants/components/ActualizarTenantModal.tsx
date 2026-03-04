import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { actualizarTenant } from '../services/tenantsApi';
import { Button } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { Tenant, TenantUpdatePayload } from '../../../types/api';

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
  max-width: 560px;
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
  &:focus { outline: none; border-color: ${COLORS.primary}; }
  &::placeholder { color: ${COLORS.textLighter}; }
`;

const Footer = styled.div`
  padding: ${SPACING.lg} ${SPACING.xl};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.md};
`;

const ErrorMsg = styled.div`
  padding: ${SPACING.md};
  background: ${COLORS.errorLight};
  color: ${COLORS.error};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

interface Props {
  tenant: Tenant;
  onClose: () => void;
  onUpdated: () => void;
}

const ActualizarTenantModal: React.FC<Props> = ({ tenant, onClose, onUpdated }) => {
  const [form, setForm] = useState<TenantUpdatePayload>({
    nombre: tenant.nombre,
    email: tenant.email,
    telefono: tenant.telefono,
    direccion: tenant.direccion ?? '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      nombre: tenant.nombre,
      email: tenant.email,
      telefono: tenant.telefono,
      direccion: tenant.direccion ?? '',
    });
  }, [tenant]);

  const set = (field: keyof TenantUpdatePayload, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.nombre || !form.email) {
      setError('El nombre y email son obligatorios.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await actualizarTenant(tenant.id, form);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar negocio');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Actualizar Negocio</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>
        <Body>
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Row>
            <Field>
              <Label>Nombre *</Label>
              <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            </Field>
            <Field>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={e => set('telefono', e.target.value)} />
            </Field>
            <Field>
              <Label>Dirección</Label>
              <Input value={form.direccion} onChange={e => set('direccion', e.target.value)} />
            </Field>
          </Row>
        </Body>
        <Footer>
          <Button $variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default ActualizarTenantModal;
