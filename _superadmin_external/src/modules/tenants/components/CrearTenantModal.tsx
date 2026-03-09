import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { crearTenant } from '../services/tenantsApi';
import { fetchPlanes } from '../../planes/services/planesApi';
import { Button } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS, TRANSITION } from '../../../styles/theme';
import type { TenantCreatePayload, Plan } from '../../../types/api';
import { useToast } from '../../../context/ToastContext';

// ============================================================================
// SUNAT / RENIEC API — decolecta.com
// ============================================================================

const DECOLECTA_TOKEN = 'sk_13692.ZuQPGpRoPnXVRyMeUuk3jPuNw0nn5VmU';
// Proxy through Vite dev server to avoid CORS (see vite.config.ts)
const DECOLECTA_BASE = '/api/decolecta/v1';

interface ReniecResponse {
  first_name: string;
  first_last_name: string;
  second_last_name: string;
  full_name: string;
  document_number: string;
}

interface SunatResponse {
  razon_social: string;
  numero_documento: string;
  estado: string;
  condicion: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
}

async function consultarDNI(numero: string): Promise<ReniecResponse> {
  const res = await fetch(`${DECOLECTA_BASE}/reniec/dni?numero=${numero}`, {
    headers: { Authorization: `Bearer ${DECOLECTA_TOKEN}` },
  });
  if (!res.ok) throw new Error('DNI no encontrado');
  return res.json();
}

async function consultarRUC(numero: string): Promise<SunatResponse> {
  const res = await fetch(`${DECOLECTA_BASE}/sunat/ruc?numero=${numero}`, {
    headers: { Authorization: `Bearer ${DECOLECTA_TOKEN}` },
  });
  if (!res.ok) throw new Error('RUC no encontrado');
  return res.json();
}

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
  max-width: 720px;
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.md};

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Row3Col = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: ${SPACING.md};
  align-items: end;

  @media (max-width: 520px) {
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

const Input = styled.input<{ $filled?: boolean }>`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${props => props.$filled ? COLORS.success : COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${props => props.$filled ? '#f0fdf4' : COLORS.surface};
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

const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: ${SPACING.sm} ${SPACING.md};
  padding-right: 42px;
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${TRANSITION};
  &:focus { outline: none; border-color: ${COLORS.primary}; }
`;

const TogglePasswordBtn = styled.button`
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${COLORS.textLighter};
  padding: 4px;
  display: flex;
  align-items: center;
  transition: ${TRANSITION};
  &:hover { color: ${COLORS.text}; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const ConsultarBtn = styled.button<{ $loading?: boolean }>`
  padding: ${SPACING.sm} ${SPACING.lg};
  background: ${COLORS.primary};
  color: #fff;
  border: none;
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: ${props => props.$loading ? 'wait' : 'pointer'};
  white-space: nowrap;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: ${TRANSITION};
  opacity: ${props => props.$loading ? 0.7 : 1};

  &:hover:not(:disabled) {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg.spinner {
    animation: ${spin} 0.8s linear infinite;
  }
`;

const Footer = styled.div`
  padding: ${SPACING.lg} ${SPACING.xl};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.md};
  flex-shrink: 0;
`;



const SuccessHint = styled.div`
  color: ${COLORS.success};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  margin-top: -8px;
  display: flex;
  align-items: center;
  gap: 4px;
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
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState('');
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPlanes()
      .then(data => setPlanes(Array.isArray(data) ? data : []))
      .catch(() => setPlanes([]));
  }, []);

  const set = (field: keyof TenantCreatePayload, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear auto-filled highlight when user manually edits
    if (autoFilledFields.has(field)) {
      setAutoFilledFields(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  // ── CONSULTAR DOCUMENTO ──────────────────────────────────────────────────
  const handleConsultar = async () => {
    const tipo = form.propietarioTipoDocumento;
    const numero = form.propietarioNumeroDocumento.trim();

    if (!numero) {
      toast.warning('Ingresa un número de documento para consultar.');
      return;
    }

    if (tipo === 'DNI' && numero.length !== 8) {
      toast.warning('El DNI debe tener 8 dígitos.');
      return;
    }

    if (tipo === 'RUC' && numero.length !== 11) {
      toast.warning('El RUC debe tener 11 dígitos.');
      return;
    }

    if (tipo === 'CE') {
      toast.info('El Carné de Extranjería no tiene consulta automática. Ingresa los datos manualmente.');
      return;
    }

    setConsultSuccess('');
    setIsConsulting(true);

    try {
      if (tipo === 'DNI') {
        const data = await consultarDNI(numero);
        const nombreCompleto = `${data.first_name} ${data.first_last_name} ${data.second_last_name}`.trim();
        setForm(prev => ({
          ...prev,
          propietarioNombre: nombreCompleto,
        }));
        setAutoFilledFields(new Set(['propietarioNombre']));
        setConsultSuccess(`✓ DNI encontrado: ${nombreCompleto}`);
      } else if (tipo === 'RUC') {
        const data = await consultarRUC(numero);
        const direccionCompleta = data.direccion
          ? `${data.direccion}, ${data.distrito}, ${data.provincia}, ${data.departamento}`
              .replace(/,\s*,/g, ',')
              .replace(/,\s*$/, '')
              .trim()
          : '';
        const filled = new Set<string>(['propietarioNombre']);
        setForm(prev => {
          const updated = { ...prev, propietarioNombre: data.razon_social };
          if (!prev.nombre) {
            updated.nombre = data.razon_social;
            filled.add('nombre');
          }
          if (direccionCompleta) {
            updated.direccion = direccionCompleta;
            filled.add('direccion');
          }
          return updated;
        });
        setAutoFilledFields(filled);
        setConsultSuccess(`✓ RUC encontrado: ${data.razon_social} (${data.estado} - ${data.condicion})`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al consultar documento');
    } finally {
      setIsConsulting(false);
    }
  };

  // ── SUBMIT ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.nombre || !form.subdominio || !form.email || !form.planId || !form.adminPassword) {
      toast.warning('Completa todos los campos obligatorios (*).');
      return;
    }
    if (!form.propietarioNombre) {
      toast.warning('El nombre del propietario es obligatorio.');
      return;
    }
    if (!form.propietarioNumeroDocumento) {
      toast.warning('El número de documento es obligatorio.');
      return;
    }
    if (form.adminPassword.length < 8) {
      toast.warning('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setIsSaving(true);
    try {
      await crearTenant(form);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear negocio');
    } finally {
      setIsSaving(false);
    }
  };

  const docMaxLength = form.propietarioTipoDocumento === 'DNI' ? 8
    : form.propietarioTipoDocumento === 'RUC' ? 11 : 12;

  const canConsult = form.propietarioTipoDocumento !== 'CE'
    && form.propietarioNumeroDocumento.trim().length > 0;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Header>
          <Title>Nuevo Negocio</Title>
          <CloseBtn onClick={onClose}>✕</CloseBtn>
        </Header>

        <Body>
          {/* ── FILA 1: Nombre del negocio + Subdominio ──────────────── */}
          <Row>
            <Field>
              <Label>Nombre del negocio *</Label>
              <Input
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                placeholder="Mi Tienda S.A.C."
                $filled={autoFilledFields.has('nombre')}
              />
            </Field>
            <Field>
              <Label>Subdominio *</Label>
              <Input
                value={form.subdominio}
                onChange={e => set('subdominio', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="mi-tienda"
              />
            </Field>
          </Row>

          {/* ── FILA 2: Tipo doc + Nro doc + Botón Consultar ─────────── */}
          <Row3Col>
            <Field>
              <Label>Tipo doc.</Label>
              <Select
                value={form.propietarioTipoDocumento}
                onChange={e => {
                  set('propietarioTipoDocumento', e.target.value);
                  setConsultSuccess('');
                }}
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">C. Extranjería</option>
              </Select>
            </Field>
            <Field>
              <Label>Nro. documento *</Label>
              <Input
                value={form.propietarioNumeroDocumento}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  set('propietarioNumeroDocumento', val);
                  setConsultSuccess('');
                }}
                placeholder={form.propietarioTipoDocumento === 'RUC' ? '20XXXXXXXXX' : 'XXXXXXXX'}
                maxLength={docMaxLength}
              />
            </Field>
            <ConsultarBtn
              onClick={handleConsultar}
              disabled={!canConsult || isConsulting}
              $loading={isConsulting}
              type="button"
            >
              {isConsulting ? (
                <>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Buscando...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Consultar
                </>
              )}
            </ConsultarBtn>
          </Row3Col>
          {consultSuccess && <SuccessHint>{consultSuccess}</SuccessHint>}

          {/* ── FILA 3: Nombre propietario + Teléfono ────────────────── */}
          <Row>
            <Field>
              <Label>Nombre del propietario *</Label>
              <Input
                value={form.propietarioNombre}
                onChange={e => set('propietarioNombre', e.target.value)}
                placeholder="Juan Pérez García"
                $filled={autoFilledFields.has('propietarioNombre')}
              />
            </Field>
            <Field>
              <Label>Teléfono</Label>
              <Input
                value={form.telefono}
                onChange={e => set('telefono', e.target.value.replace(/\D/g, ''))}
                placeholder="987654321"
                maxLength={9}
              />
            </Field>
          </Row>

          {/* ── FILA 4: Plan + Email ─────────────────────────────────── */}
          <Row>
            <Field>
              <Label>Plan *</Label>
              <Select value={form.planId} onChange={e => set('planId', Number(e.target.value))}>
                <option value={0}>Seleccionar plan...</option>
                {planes.filter(p => p.estado).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — S/ {p.precioMensual}/mes</option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="admin@tienda.com"
              />
            </Field>
          </Row>

          {/* ── FILA 5: Dirección (full width) ───────────────────────── */}
          <Field>
            <Label>Dirección</Label>
            <Input
              value={form.direccion}
              onChange={e => set('direccion', e.target.value)}
              placeholder="Av. Principal 123, Lima"
              $filled={autoFilledFields.has('direccion')}
            />
          </Field>

          {/* ── FILA 6: Contraseña con toggle ────────────────────────── */}
          <Field>
            <Label>Contraseña del admin *</Label>
            <PasswordWrapper>
              <PasswordInput
                type={showPassword ? 'text' : 'password'}
                value={form.adminPassword}
                onChange={e => set('adminPassword', e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
              <TogglePasswordBtn
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </TogglePasswordBtn>
            </PasswordWrapper>
          </Field>
        </Body>

        <Footer>
          <Button $variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Creando...' : 'Crear Negocio'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default CrearTenantModal;
