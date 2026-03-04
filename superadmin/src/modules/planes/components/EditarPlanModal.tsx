import React, { useState } from 'react';
import styled from 'styled-components';
import { actualizarPlan } from '../services/planesApi';
import { Button } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { Plan, PlanUpdatePayload } from '../../../types/api';

// ============================================================================
// STYLED — reutiliza la misma estética que CrearPlanModal
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
  max-width: 780px;
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
  padding: ${SPACING.xs};
  line-height: 1;
  transition: ${TRANSITION};
  &:hover { color: ${COLORS.text}; }
`;

const Body = styled.div`
  padding: ${SPACING.xl};
  display: grid;
  gap: ${SPACING.lg};
  overflow-y: auto;
  flex: 1;
`;

const SectionTitle = styled.h3`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  padding-bottom: ${SPACING.xs};
  border-bottom: 1px solid ${COLORS.border};
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.md};
`;

const Row3 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${SPACING.md};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const Label = styled.label`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${COLORS.textLighter};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
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

const TextArea = styled.textarea`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  transition: ${TRANSITION};
  &:focus { outline: none; border-color: ${COLORS.primary}; }
`;

const Footer = styled.div`
  padding: ${SPACING.lg} ${SPACING.xl};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.md};
  flex-shrink: 0;
`;

const ErrorMsg = styled.div`
  color: ${COLORS.error};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  padding: ${SPACING.sm} ${SPACING.md};
  background: ${COLORS.errorLight};
  border-radius: ${RADIUS.sm};
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  cursor: pointer;
`;

// ============================================================================
// MODULOS
// ============================================================================
const MODULOS_DISPONIBLES = [
  { id: 1, nombre: 'Inventario' },
  { id: 2, nombre: 'Ventas' },
  { id: 3, nombre: 'Compras' },
  { id: 4, nombre: 'Clientes' },
  { id: 5, nombre: 'Reportes' },
  { id: 6, nombre: 'Usuarios' },
  { id: 7, nombre: 'Configuración' },
  { id: 8, nombre: 'Dashboard' },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface Props {
  plan: Plan;
  onClose: () => void;
  onUpdated: () => void;
}

const EditarPlanModal: React.FC<Props> = ({ plan, onClose, onUpdated }) => {
  const [form, setForm] = useState<PlanUpdatePayload>({
    nombre: plan.nombre ?? '',
    descripcion: plan.descripcion ?? '',
    precioMensual: plan.precioMensual ?? 0,
    precioAnual: plan.precioAnual ?? 0,
    maxProductos: plan.maxProductos ?? 100,
    maxUsuarios: plan.maxUsuarios ?? 5,
    maxAlmacenes: plan.maxAlmacenes ?? 1,
    maxVentasMes: plan.maxVentasMes ?? 500,
    periodoPruebaDias: plan.periodoPruebaDias ?? 14,
    modulos: plan.modulos ?? [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof PlanUpdatePayload, value: string | number | number[]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleModulo = (id: number) => {
    setForm(prev => ({
      ...prev,
      modulos: prev.modulos.includes(id)
        ? prev.modulos.filter(m => m !== id)
        : [...prev.modulos, id],
    }));
  };

  const toggleAllModulos = () => {
    setForm(prev => ({
      ...prev,
      modulos: prev.modulos.length === MODULOS_DISPONIBLES.length
        ? []
        : MODULOS_DISPONIBLES.map(m => m.id),
    }));
  };

  const handleSubmit = async () => {
    if (!form.nombre || form.precioMensual <= 0) {
      setError('El nombre y precio mensual son obligatorios.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await actualizarPlan(plan.id, form);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar plan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Editar Plan — {plan.nombre}</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        <Body>
          {error && <ErrorMsg>{error}</ErrorMsg>}

          <Row>
            <Field>
              <Label>Nombre del plan *</Label>
              <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} />
            </Field>
            <Field>
              <Label>Período de prueba (días)</Label>
              <Input type="number" value={form.periodoPruebaDias || ''} onChange={e => set('periodoPruebaDias', e.target.value === '' ? 0 : +e.target.value)} />
            </Field>
          </Row>

          <Field>
            <Label>Descripción</Label>
            <TextArea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
          </Field>

          <SectionTitle>Precios</SectionTitle>
          <Row>
            <Field>
              <Label>Precio mensual (S/) *</Label>
              <Input type="number" step="0.01" value={form.precioMensual || ''} onChange={e => set('precioMensual', e.target.value === '' ? 0 : +e.target.value)} />
            </Field>
            <Field>
              <Label>Precio anual (S/)</Label>
              <Input type="number" step="0.01" value={form.precioAnual || ''} onChange={e => set('precioAnual', e.target.value === '' ? 0 : +e.target.value)} />
            </Field>
          </Row>

          <SectionTitle>Límites</SectionTitle>
          <Row3>
            <Field>
              <Label>Max productos</Label>
              <Input type="number" value={form.maxProductos || ''} onChange={e => set('maxProductos', e.target.value === '' ? 0 : +e.target.value)} />
            </Field>
            <Field>
              <Label>Max usuarios</Label>
              <Input type="number" value={form.maxUsuarios || ''} onChange={e => set('maxUsuarios', e.target.value === '' ? 0 : +e.target.value)} />
            </Field>
            <Field>
              <Label>Max almacenes</Label>
              <Input type="number" value={form.maxAlmacenes || ''} onChange={e => set('maxAlmacenes', e.target.value === '' ? 0 : +e.target.value)} />
            </Field>
          </Row3>
          <Row>
            <Field>
              <Label>Max ventas/mes</Label>
              <Input type="number" value={form.maxVentasMes || ''} onChange={e => set('maxVentasMes', e.target.value === '' ? 0 : +e.target.value)} />
            </Field>
          </Row>

          <SectionTitle>Módulos incluidos</SectionTitle>
          <CheckboxRow style={{ fontWeight: 600, paddingBottom: '4px', borderBottom: `1px solid ${COLORS.border}`, marginBottom: '4px' }}>
            <input
              type="checkbox"
              checked={form.modulos.length === MODULOS_DISPONIBLES.length}
              onChange={toggleAllModulos}
            />
            Seleccionar todos
          </CheckboxRow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: SPACING.md }}>
            {MODULOS_DISPONIBLES.map(m => (
              <CheckboxRow key={m.id}>
                <input
                  type="checkbox"
                  checked={form.modulos.includes(m.id)}
                  onChange={() => toggleModulo(m.id)}
                />
                {m.nombre}
              </CheckboxRow>
            ))}
          </div>
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

export default EditarPlanModal;
