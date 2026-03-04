import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { asignarSuscripcion } from '../services/tenantsApi';
import { fetchPlanes } from '../../planes/services/planesApi';
import { Button } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { Tenant, Plan, SuscripcionAsignarPayload } from '../../../types/api';

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
  max-width: 480px;
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

const Select = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${TRANSITION};
  &:focus { outline: none; border-color: ${COLORS.primary}; }
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
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  cursor: pointer;
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

const CurrentPlanInfo = styled.div`
  padding: ${SPACING.md};
  background: ${COLORS.surfaceHover};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textLight};
`;

interface Props {
  tenant: Tenant;
  onClose: () => void;
  onUpdated: () => void;
}

const today = () => new Date().toISOString().split('T')[0];
const oneYearLater = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};

const CambiarPlanModal: React.FC<Props> = ({ tenant, onClose, onUpdated }) => {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [form, setForm] = useState<SuscripcionAsignarPayload>({
    planId: tenant.suscripcion?.planId ?? 0,
    fechaInicio: today(),
    fechaFin: oneYearLater(),
    autoRenovar: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlanes()
      .then(data => setPlanes(Array.isArray(data) ? data : []))
      .catch(() => setPlanes([]));
  }, []);

  const handleSubmit = async () => {
    if (!form.planId) {
      setError('Selecciona un plan.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await asignarSuscripcion(tenant.id, form);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar plan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Cambiar Plan</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>
        <Body>
          {error && <ErrorMsg>{error}</ErrorMsg>}

          <CurrentPlanInfo>
            Negocio: <strong>{tenant.nombre}</strong><br />
            Plan actual: <strong>{tenant.planNombre ?? tenant.suscripcion?.planNombre ?? '—'}</strong>
          </CurrentPlanInfo>

          <Field>
            <Label>Nuevo Plan *</Label>
            <Select value={form.planId} onChange={e => setForm(prev => ({ ...prev, planId: Number(e.target.value) }))}>
              <option value={0}>Seleccionar plan...</option>
              {planes.filter(p => p.estado).map(p => (
                <option key={p.id} value={p.id}>{p.nombre} — S/ {p.precioMensual}/mes</option>
              ))}
            </Select>
          </Field>

          <Row>
            <Field>
              <Label>Fecha inicio</Label>
              <Input type="date" value={form.fechaInicio} onChange={e => setForm(prev => ({ ...prev, fechaInicio: e.target.value }))} />
            </Field>
            <Field>
              <Label>Fecha fin</Label>
              <Input type="date" value={form.fechaFin} onChange={e => setForm(prev => ({ ...prev, fechaFin: e.target.value }))} />
            </Field>
          </Row>

          <CheckboxLabel>
            <input type="checkbox" checked={form.autoRenovar} onChange={e => setForm(prev => ({ ...prev, autoRenovar: e.target.checked }))} />
            Auto-renovar al vencer
          </CheckboxLabel>
        </Body>
        <Footer>
          <Button $variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Asignar Plan'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default CambiarPlanModal;
