import React, { useState } from 'react';
import styled from 'styled-components';
import { crearPlan } from '../services/planesApi';
import { Button } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { PlanCreatePayload } from '../../../types/api';

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
  max-width: 640px;
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
  padding: ${SPACING.xs};
  line-height: 1;
  transition: ${TRANSITION};
  &:hover { color: ${COLORS.text}; }
`;

const Body = styled.div`
  padding: ${SPACING.xl};
  display: grid;
  gap: ${SPACING.lg};
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
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const Row3 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${SPACING.md};
  @media (max-width: 600px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 400px) { grid-template-columns: 1fr; }
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
// MODULOS DISPONIBLES  (se podrá cargar del backend después)
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
  onClose: () => void;
  onCreated: () => void;
}

const INITIAL: PlanCreatePayload = {
  nombre: '',
  descripcion: '',
  precioMensual: 0,
  precioAnual: 0,
  maxProductos: 100,
  maxUsuarios: 5,
  maxAlmacenes: 1,
  maxVentasMes: 500,
  periodoPruebaDias: 14,
  modulos: [],
};

const CrearPlanModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState<PlanCreatePayload>({ ...INITIAL });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof PlanCreatePayload, value: string | number | number[]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleModulo = (id: number) => {
    setForm(prev => ({
      ...prev,
      modulos: prev.modulos.includes(id)
        ? prev.modulos.filter(m => m !== id)
        : [...prev.modulos, id],
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
      await crearPlan(form);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear plan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Nuevo Plan</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        <Body>
          {error && <ErrorMsg>{error}</ErrorMsg>}

          <Row>
            <Field>
              <Label>Nombre del plan *</Label>
              <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Básico Plus" />
            </Field>
            <Field>
              <Label>Período de prueba (días)</Label>
              <Input type="number" value={form.periodoPruebaDias} onChange={e => set('periodoPruebaDias', +e.target.value)} />
            </Field>
          </Row>

          <Field>
            <Label>Descripción</Label>
            <TextArea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Ideal para tiendas pequeñas..." />
          </Field>

          <SectionTitle>Precios</SectionTitle>
          <Row>
            <Field>
              <Label>Precio mensual (S/) *</Label>
              <Input type="number" step="0.01" value={form.precioMensual} onChange={e => set('precioMensual', +e.target.value)} />
            </Field>
            <Field>
              <Label>Precio anual (S/)</Label>
              <Input type="number" step="0.01" value={form.precioAnual} onChange={e => set('precioAnual', +e.target.value)} />
            </Field>
          </Row>

          <SectionTitle>Límites</SectionTitle>
          <Row3>
            <Field>
              <Label>Max productos</Label>
              <Input type="number" value={form.maxProductos} onChange={e => set('maxProductos', +e.target.value)} />
            </Field>
            <Field>
              <Label>Max usuarios</Label>
              <Input type="number" value={form.maxUsuarios} onChange={e => set('maxUsuarios', +e.target.value)} />
            </Field>
            <Field>
              <Label>Max almacenes</Label>
              <Input type="number" value={form.maxAlmacenes} onChange={e => set('maxAlmacenes', +e.target.value)} />
            </Field>
          </Row3>
          <Row>
            <Field>
              <Label>Max ventas/mes</Label>
              <Input type="number" value={form.maxVentasMes} onChange={e => set('maxVentasMes', +e.target.value)} />
            </Field>
          </Row>

          <SectionTitle>Módulos incluidos</SectionTitle>
          <Row>
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
          </Row>
        </Body>

        <Footer>
          <Button $variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Creando...' : 'Crear Plan'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default CrearPlanModal;
