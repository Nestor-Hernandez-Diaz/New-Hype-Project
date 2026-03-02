import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { crearTenant } from '../services/tenantsApi';
import { fetchPlanes } from '../../planes/services/planesApi';
import { Button } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { TenantCreatePayload, Plan } from '../../../types/api';

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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.md};

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
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

// ============================================================================
// COMPONENT
// ============================================================================

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const INITIAL: TenantCreatePayload = {
  nombre: '',
  subdominio: '',
  propietarioNombre: '',
  propietarioTipoDocumento: 'DNI',
  propietarioNumeroDocumento: '',
  email: '',
  telefono: '',
  direccion: '',
  planId: 0,
  adminPassword: '',
};

const CrearTenantModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [form, setForm] = useState<TenantCreatePayload>({ ...INITIAL });
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlanes()
      .then(data => setPlanes(Array.isArray(data) ? data : []))
      .catch(() => setPlanes([]));
  }, []);

  const set = (field: keyof TenantCreatePayload, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.nombre || !form.subdominio || !form.email || !form.planId || !form.adminPassword) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await crearTenant(form);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tenant');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Nuevo Tenant</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        <Body>
          {error && <ErrorMsg>{error}</ErrorMsg>}

          <Row>
            <Field>
              <Label>Nombre del negocio *</Label>
              <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Mi Tienda" />
            </Field>
            <Field>
              <Label>Subdominio *</Label>
              <Input value={form.subdominio} onChange={e => set('subdominio', e.target.value)} placeholder="mi-tienda" />
            </Field>
          </Row>

          <Row>
            <Field>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="admin@tienda.com" />
            </Field>
            <Field>
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="987654321" />
            </Field>
          </Row>

          <Field>
            <Label>Dirección</Label>
            <Input value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Av. Principal 123, Lima" />
          </Field>

          <Row>
            <Field>
              <Label>Nombre del propietario *</Label>
              <Input value={form.propietarioNombre} onChange={e => set('propietarioNombre', e.target.value)} placeholder="Juan Pérez" />
            </Field>
            <Field>
              <Label>Tipo documento</Label>
              <Select value={form.propietarioTipoDocumento} onChange={e => set('propietarioTipoDocumento', e.target.value)}>
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">Carné de Extranjería</option>
              </Select>
            </Field>
          </Row>

          <Row>
            <Field>
              <Label>Nro. documento *</Label>
              <Input value={form.propietarioNumeroDocumento} onChange={e => set('propietarioNumeroDocumento', e.target.value)} placeholder="12345678" />
            </Field>
            <Field>
              <Label>Plan *</Label>
              <Select value={form.planId} onChange={e => set('planId', Number(e.target.value))}>
                <option value={0}>Seleccionar plan...</option>
                {planes.filter(p => p.estado).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — S/ {p.precioMensual}/mes</option>
                ))}
              </Select>
            </Field>
          </Row>

          <Field>
            <Label>Contraseña del admin *</Label>
            <Input type="password" value={form.adminPassword} onChange={e => set('adminPassword', e.target.value)} placeholder="Mínimo 8 caracteres" />
          </Field>
        </Body>

        <Footer>
          <Button $variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Creando...' : 'Crear Tenant'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default CrearTenantModal;
