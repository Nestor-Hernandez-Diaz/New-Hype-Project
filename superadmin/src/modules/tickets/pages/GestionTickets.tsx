import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchTickets, fetchTicketById, actualizarTicket } from '../services/ticketsApiNew';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, RADIUS, TRANSITION } from '../../../styles/theme';
import type { Ticket, TicketUpdatePayload } from '../../../types/api';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  gap: ${SPACING.xl};

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  background: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  overflow: hidden;
`;

const PanelHeader = styled.div`
  padding: ${SPACING.lg} ${SPACING.xl};
  border-bottom: 1px solid ${COLORS.border};
  background: ${COLORS.surfaceHover};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TicketCount = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLighter};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

const TicketList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 600px;
  overflow-y: auto;
`;

const TicketItem = styled.li<{ $active: boolean }>`
  border-bottom: 1px solid ${COLORS.border};

  button {
    width: 100%;
    text-align: left;
    border: none;
    background: ${props => (props.$active ? COLORS.surfaceHover : 'transparent')};
    color: ${COLORS.text};
    padding: ${SPACING.md} ${SPACING.xl};
    cursor: pointer;
    transition: ${TRANSITION};
    border-left: 3px solid ${props => (props.$active ? COLORS.primary : 'transparent')};

    &:hover {
      background: ${COLORS.surfaceHover};
    }
  }
`;

const Subject = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin-bottom: ${SPACING.xs};
`;

const Meta = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLight};
  display: flex;
  gap: ${SPACING.sm};
  align-items: center;
`;

const PrioridadDot = styled.span<{ $prioridad: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  background: ${props => {
    switch (props.$prioridad) {
      case 'urgente': return COLORS.error;
      case 'alta': return COLORS.warning;
      case 'media': return COLORS.info;
      default: return COLORS.textLighter;
    }
  }};
`;

const DetailBody = styled.div`
  padding: ${SPACING.xl};
  display: grid;
  gap: ${SPACING.lg};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.md};
`;

const Field = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  padding: ${SPACING.md};
`;

const Label = styled.div`
  font-size: 10px;
  color: ${COLORS.textLighter};
  margin-bottom: ${SPACING.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const Value = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  word-break: break-word;
`;

const StatusBadge = styled.span<{ $estado: string }>`
  display: inline-flex;
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: ${RADIUS.xl};
  font-size: 10px;
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.3px;

  ${({ $estado }) => {
    switch ($estado) {
      case 'abierto':
        return `background: ${COLORS.warningLight}; color: ${COLORS.warning};`;
      case 'en_proceso':
        return `background: ${COLORS.infoLight}; color: ${COLORS.info};`;
      case 'resuelto':
        return `background: ${COLORS.successLight}; color: ${COLORS.success};`;
      case 'cerrado':
        return `background: ${COLORS.surfaceHover}; color: ${COLORS.textLighter};`;
      default:
        return `background: ${COLORS.border}; color: ${COLORS.textLight};`;
    }
  }}
`;

const DescripcionPanel = styled.div`
  background: ${COLORS.surfaceHover};
  border-radius: ${RADIUS.md};
  padding: ${SPACING.lg};
`;

const DescLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${COLORS.textLighter};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin-bottom: ${SPACING.sm};
`;

const DescText = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  line-height: 1.6;
`;

const ActionsPanel = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  padding: ${SPACING.lg};
  display: grid;
  gap: ${SPACING.md};
`;

const ActionsTitle = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
`;

const Row = styled.div`
  display: flex;
  gap: ${SPACING.md};
  flex-wrap: wrap;
`;

const Select = styled.select`
  flex: 1;
  min-width: 160px;
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  transition: ${TRANSITION};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  color: ${COLORS.text};
  resize: vertical;
  transition: ${TRANSITION};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }
`;

const SubmitButton = styled.button`
  border: none;
  border-radius: ${RADIUS.xl};
  padding: ${SPACING.sm} ${SPACING.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: pointer;
  color: ${COLORS.surface};
  background: ${COLORS.primary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  transition: ${TRANSITION};

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingState = styled.div`
  color: ${COLORS.textLighter};
  padding: ${SPACING.xl};
  text-align: center;
`;

const EmptyDetail = styled.div`
  color: ${COLORS.textLighter};
  padding: ${SPACING['3xl']};
  text-align: center;
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const RespuestaPanel = styled.div`
  border-left: 3px solid ${COLORS.primary};
  padding: ${SPACING.md} ${SPACING.lg};
  background: ${COLORS.surfaceHover};
  border-radius: 0 ${RADIUS.md} ${RADIUS.md} 0;
`;

// ============================================================================
// HELPERS
// ============================================================================

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) +
    ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};

// ============================================================================
// COMPONENT
// ============================================================================

const GestionTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [nuevaPrioridad, setNuevaPrioridad] = useState('');
  const [respuesta, setRespuesta] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetchTickets();
      setTickets(res.content);
      if (res.content.length > 0 && !selected) {
        const detail = await fetchTicketById(res.content[0].id);
        setSelected(detail);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTicket = async (ticket: Ticket) => {
    const detail = await fetchTicketById(ticket.id);
    setSelected(detail);
    setNuevoEstado('');
    setNuevaPrioridad('');
    setRespuesta('');
  };

  const handleSubmitUpdate = async () => {
    if (!selected) return;
    const payload: TicketUpdatePayload = {};
    if (nuevoEstado) payload.estado = nuevoEstado;
    if (nuevaPrioridad) payload.prioridad = nuevaPrioridad;
    if (respuesta.trim()) payload.respuesta = respuesta.trim();

    if (!payload.estado && !payload.prioridad && !payload.respuesta) {
      window.alert('Debe modificar al menos un campo.');
      return;
    }

    setIsSaving(true);
    try {
      await actualizarTicket(selected.id, payload);
      setNuevoEstado('');
      setNuevaPrioridad('');
      setRespuesta('');
      await loadTickets();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout title="Tickets de Soporte">
      <Container>
        {/* ── LISTA ── */}
        <Panel>
          <PanelHeader>
            Tickets
            <TicketCount>{tickets.length} total</TicketCount>
          </PanelHeader>
          {isLoading ? (
            <LoadingState>Cargando...</LoadingState>
          ) : (
            <TicketList>
              {tickets.map(t => (
                <TicketItem key={t.id} $active={selected?.id === t.id}>
                  <button onClick={() => handleSelectTicket(t)}>
                    <Subject>{t.asunto}</Subject>
                    <Meta>
                      <PrioridadDot $prioridad={t.prioridad} />
                      <span>{t.tenantNombre}</span>
                      <span>·</span>
                      <StatusBadge $estado={t.estado}>{t.estado.replace('_', ' ')}</StatusBadge>
                    </Meta>
                  </button>
                </TicketItem>
              ))}
            </TicketList>
          )}
        </Panel>

        {/* ── DETALLE ── */}
        <Panel>
          <PanelHeader>Detalle del Ticket</PanelHeader>
          {!selected ? (
            <EmptyDetail>Selecciona un ticket para ver el detalle</EmptyDetail>
          ) : (
            <DetailBody>
              <Grid>
                <Field>
                  <Label>ID</Label>
                  <Value>#{selected.id}</Value>
                </Field>
                <Field>
                  <Label>Estado</Label>
                  <Value><StatusBadge $estado={selected.estado}>{selected.estado.replace('_', ' ')}</StatusBadge></Value>
                </Field>
                <Field>
                  <Label>Prioridad</Label>
                  <Value style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PrioridadDot $prioridad={selected.prioridad} />
                    {selected.prioridad.toUpperCase()}
                  </Value>
                </Field>
                <Field>
                  <Label>Tenant</Label>
                  <Value>{selected.tenantNombre}</Value>
                </Field>
                <Field>
                  <Label>Creado</Label>
                  <Value>{formatDate(selected.createdAt)}</Value>
                </Field>
                <Field>
                  <Label>Atendido por</Label>
                  <Value>{selected.atendidoPor || '—'}</Value>
                </Field>
              </Grid>

              <DescripcionPanel>
                <DescLabel>Descripción</DescLabel>
                <DescText>{selected.descripcion}</DescText>
              </DescripcionPanel>

              {selected.respuesta && (
                <RespuestaPanel>
                  <DescLabel>Respuesta</DescLabel>
                  <DescText>{selected.respuesta}</DescText>
                  {selected.fechaRespuesta && (
                    <div style={{ fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textLighter, marginTop: SPACING.xs }}>
                      {formatDate(selected.fechaRespuesta)}
                    </div>
                  )}
                </RespuestaPanel>
              )}

              <ActionsPanel>
                <ActionsTitle>Acciones</ActionsTitle>
                <Row>
                  <Select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                    <option value="">Cambiar estado...</option>
                    <option value="abierto">Abierto</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cerrado">Cerrado</option>
                  </Select>
                  <Select value={nuevaPrioridad} onChange={e => setNuevaPrioridad(e.target.value)}>
                    <option value="">Cambiar prioridad...</option>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </Select>
                </Row>
                <TextArea
                  placeholder="Escribir respuesta..."
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                />
                <SubmitButton onClick={handleSubmitUpdate} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </SubmitButton>
              </ActionsPanel>
            </DetailBody>
          )}
        </Panel>
      </Container>
    </Layout>
  );
};

export default GestionTickets;
