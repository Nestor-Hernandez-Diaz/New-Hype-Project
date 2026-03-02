import React, { useState } from 'react';
import styled from 'styled-components';
import { crearCupon } from '../services/cuponesApi';
import { Button } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { CuponCreatePayload } from '../../../types/api';

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
  max-width: 500px;
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.md};
  @media (max-width: 500px) { grid-template-columns: 1fr; }
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

const Select = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  cursor: pointer;
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

const Hint = styled.span`
  font-size: 10px;
  color: ${COLORS.textLighter};
`;

// ============================================================================
// COMPONENT
// ============================================================================

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const INITIAL: CuponCreatePayload = {
  codigo: '',
  tipoDescuento: 'PORCENTAJE',
  valorDescuento: 0,
  fechaExpiracion: '',
  usosMaximos: 100,
};

const CrearCuponModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState<CuponCreatePayload>({ ...INITIAL });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof CuponCreatePayload, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.codigo || form.valorDescuento <= 0 || !form.fechaExpiracion) {
      setError('Código, valor y fecha de expiración son obligatorios.');
      return;
    }
    if (form.tipoDescuento === 'PORCENTAJE' && form.valorDescuento > 100) {
      setError('El porcentaje no puede ser mayor a 100.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await crearCupon(form);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cupón');
    } finally {
      setIsSaving(false);
    }
  };

  // Default fecha a 30 días desde hoy
  const defaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Nuevo Cupón</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        <Body>
          {error && <ErrorMsg>{error}</ErrorMsg>}

          <Field>
            <Label>Código del cupón *</Label>
            <Input
              value={form.codigo}
              onChange={e => set('codigo', e.target.value.toUpperCase())}
              placeholder="DESCUENTO20"
              style={{ fontFamily: 'monospace', letterSpacing: '1.5px' }}
            />
            <Hint>Solo letras, números y guiones. Se convierte a mayúsculas.</Hint>
          </Field>

          <Row>
            <Field>
              <Label>Tipo de descuento *</Label>
              <Select value={form.tipoDescuento} onChange={e => set('tipoDescuento', e.target.value)}>
                <option value="PORCENTAJE">Porcentaje (%)</option>
                <option value="MONTO_FIJO">Monto Fijo (S/)</option>
              </Select>
            </Field>
            <Field>
              <Label>Valor *</Label>
              <Input
                type="number"
                step={form.tipoDescuento === 'PORCENTAJE' ? '1' : '0.01'}
                min="0"
                max={form.tipoDescuento === 'PORCENTAJE' ? '100' : undefined}
                value={form.valorDescuento}
                onChange={e => set('valorDescuento', +e.target.value)}
                placeholder={form.tipoDescuento === 'PORCENTAJE' ? '20' : '50.00'}
              />
            </Field>
          </Row>

          <Row>
            <Field>
              <Label>Fecha de expiración *</Label>
              <Input
                type="date"
                value={form.fechaExpiracion || defaultDate()}
                onChange={e => set('fechaExpiracion', e.target.value)}
              />
            </Field>
            <Field>
              <Label>Usos máximos</Label>
              <Input
                type="number"
                min="1"
                value={form.usosMaximos}
                onChange={e => set('usosMaximos', +e.target.value)}
              />
            </Field>
          </Row>
        </Body>

        <Footer>
          <Button $variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Creando...' : 'Crear Cupón'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default CrearCuponModal;
