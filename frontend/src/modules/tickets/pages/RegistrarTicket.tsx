import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../../styles/theme';
import {
  crearTicket,
  fetchEmpresasTicket,
  type EmpresaTicketOption,
  type TicketDetalle,
} from '../services/ticketsApi';

const Card = styled.section`
  background: ${COLORS.white};
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  box-shadow: ${SHADOWS.sm};
  padding: ${SPACING.xl};
  max-width: 860px;
`;

const Description = styled.p`
  margin: 0 0 ${SPACING.lg} 0;
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.body};
`;

const Form = styled.form`
  display: grid;
  gap: ${SPACING.md};
`;

const FormGroup = styled.div`
  display: grid;
  gap: ${SPACING.xs};
`;

const Label = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

const Input = styled.input`
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: ${SPACING.sm} ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.text.primary};
`;

const TextArea = styled.textarea`
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: ${SPACING.sm} ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.text.primary};
  resize: vertical;
  min-height: 120px;
`;

const Select = styled.select`
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: ${SPACING.sm} ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.text.primary};
`;

const Actions = styled.div`
  display: flex;
  gap: ${SPACING.sm};
`;

const Button = styled.button<{ $variant?: 'secondary' }>`
  border: 1px solid ${props => (props.$variant === 'secondary' ? COLORS.border : COLORS.primary)};
  background: ${props => (props.$variant === 'secondary' ? COLORS.white : COLORS.primary)};
  color: ${props => (props.$variant === 'secondary' ? COLORS.text.primary : COLORS.white)};
  border-radius: 8px;
  padding: ${SPACING.sm} ${SPACING.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: pointer;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  margin-top: ${SPACING.sm};
  color: ${COLORS.successText};
  background: ${COLORS.successBg};
  border: 1px solid ${COLORS.success};
  border-radius: 8px;
  padding: ${SPACING.sm} ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

const RegistrarTicket: React.FC = () => {
  const navigate = useNavigate();
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<TicketDetalle['prioridad']>('media');
  const [empresas, setEmpresas] = useState<EmpresaTicketOption[]>([]);
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const empresasFiltradas = empresas.filter((empresa) =>
    empresa.tenantNombre.toLowerCase().includes(filtroEmpresa.trim().toLowerCase()),
  );

  useEffect(() => {
    const loadEmpresas = async () => {
      const data = await fetchEmpresasTicket();
      setEmpresas(data);
    };

    loadEmpresas();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!asunto.trim() || !descripcion.trim() || !empresaSeleccionada) {
      return;
    }

    const empresa = empresas.find(item => String(item.tenantId) === empresaSeleccionada);
    if (!empresa) {
      return;
    }

    setSaving(true);
    const ticket = await crearTicket({
      asunto: asunto.trim(),
      descripcion: descripcion.trim(),
      prioridad,
      tenantId: empresa.tenantId,
      tenantNombre: empresa.tenantNombre,
      usuarioPlataformaId: empresa.usuarioPlataformaId,
    });

    setSuccessMessage(`Ticket #${ticket.id} registrado correctamente.`);
    setSaving(false);

    setTimeout(() => {
      navigate('/tickets/detalle', { state: { selectedTicketId: ticket.id } });
    }, 900);
  };

  return (
    <Layout title="Registrar Ticket">
      <Card>
        <Description>
          Desde aquí tu empresa puede reportar incidencias o solicitudes. Completa los datos y envía el ticket.
        </Description>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="empresa">Empresa afectada</Label>
            <Input
              id="empresa-filtro"
              value={filtroEmpresa}
              onChange={(event) => setFiltroEmpresa(event.target.value)}
              placeholder="Buscar empresa por nombre"
            />
            <Select
              id="empresa"
              value={empresaSeleccionada}
              onChange={(event) => setEmpresaSeleccionada(event.target.value)}
            >
              <option value="">Selecciona una empresa</option>
              {empresasFiltradas.map(empresa => (
                <option key={empresa.tenantId} value={String(empresa.tenantId)}>
                  {empresa.tenantNombre}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="asunto">Asunto</Label>
            <Input
              id="asunto"
              value={asunto}
              onChange={(event) => setAsunto(event.target.value)}
              placeholder="Ejemplo: Error al generar reporte de ventas"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="descripcion">Descripción del problema</Label>
            <TextArea
              id="descripcion"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              placeholder="Describe el problema, cuándo ocurre y qué esperabas que pasara."
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select
              id="prioridad"
              value={prioridad}
              onChange={(event) => setPrioridad(event.target.value as TicketDetalle['prioridad'])}
            >
              <option value="baja">baja</option>
              <option value="media">media</option>
              <option value="alta">alta</option>
              <option value="urgente">urgente</option>
            </Select>
          </FormGroup>

          <Actions>
            <Button type="submit" disabled={saving || !empresaSeleccionada || !asunto.trim() || !descripcion.trim()}>
              {saving ? 'Enviando...' : 'Enviar Ticket'}
            </Button>
            <Button type="button" $variant="secondary" onClick={() => navigate('/tickets/detalle')}>
              Ver Tickets
            </Button>
          </Actions>
        </Form>

        {successMessage ? <Message>{successMessage}</Message> : null}
      </Card>
    </Layout>
  );
};

export default RegistrarTicket;
