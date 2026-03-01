import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, RADIUS } from '../../../styles/theme';
import {
  cambiarEstadoTicket,
  fetchTicketDetalle,
  fetchTicketHistorial,
  fetchTickets,
  responderTicket,
  type TicketDetalle,
  type TicketEvento,
} from '../services/ticketsApi';

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
`;

const TicketList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
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
`;

const DetailBody = styled.div`
  padding: ${SPACING.xl};
  display: grid;
  gap: ${SPACING.lg};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: ${SPACING.lg};
`;

const Field = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  padding: ${SPACING.md};
`;

const Label = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLight};
  margin-bottom: ${SPACING.xs};
  text-transform: uppercase;
`;

const Value = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  word-break: break-word;
`;

const StatusBadge = styled.span<{ $estado: TicketDetalle['estado'] }>`
  display: inline-flex;
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: ${RADIUS.xl};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};

  ${({ $estado }) => {
    switch ($estado) {
      case 'abierto':
        return `background: ${COLORS.warningLight}; color: ${COLORS.warning};`;
      case 'en_proceso':
        return `background: ${COLORS.infoLight}; color: ${COLORS.info};`;
      case 'resuelto':
        return `background: ${COLORS.successLight}; color: ${COLORS.success};`;
      default:
        return `background: ${COLORS.border}; color: ${COLORS.textLight};`;
    }
  }}
`;

const LoadingText = styled.div`
  color: ${COLORS.textLight};
  padding: ${SPACING.xl};
`;

const EmptyState = styled.div`
  color: ${COLORS.textLight};
  padding: ${SPACING.xl};
`;

const ActionsPanel = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  padding: ${SPACING.lg};
  display: grid;
  gap: ${SPACING.md};
`;

const Row = styled.div`
  display: flex;
  gap: ${SPACING.md};
  flex-wrap: wrap;
`;

const Select = styled.select`
  flex: 1;
  min-width: 180px;
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  color: ${COLORS.text};
  background: ${COLORS.surface};
`;

const Input = styled.input`
  flex: 1;
  min-width: 220px;
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  color: ${COLORS.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 88px;
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  color: ${COLORS.text};
  resize: vertical;
`;

const Button = styled.button`
  border: none;
  border-radius: ${RADIUS.xl};
  padding: ${SPACING.sm} ${SPACING.md};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: pointer;
  color: ${COLORS.surface};
  background: ${COLORS.primary};

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const MutedText = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLight};
`;

const TimelinePanel = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  padding: ${SPACING.lg};
`;

const TimelineTitle = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  margin-bottom: ${SPACING.md};
`;

const TimelineList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: ${SPACING.sm};
`;

const TimelineItem = styled.li`
  border-left: 3px solid ${COLORS.primary};
  padding: ${SPACING.xs} 0 ${SPACING.xs} ${SPACING.md};
`;

const TimelineText = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
`;

const TimelineMeta = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLight};
  margin-top: ${SPACING.xs};
`;

const DetalleTickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketDetalle[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetalle | null>(null);
  const [historial, setHistorial] = useState<TicketEvento[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<TicketDetalle['estado']>('abierto');
  const [respuesta, setRespuesta] = useState('');
  const [atendidoPor, setAtendidoPor] = useState('');
  const [isSavingEstado, setIsSavingEstado] = useState(false);
  const [isSavingRespuesta, setIsSavingRespuesta] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoadingList(true);
      const data = await fetchTickets();
      setTickets(data);
      setSelectedId(data[0]?.id ?? null);
      setIsLoadingList(false);
    };

    loadTickets();
  }, []);

  useEffect(() => {
    const pollTickets = async () => {
      const data = await fetchTickets();
      setTickets(data);
      setSelectedId((currentSelectedId) => {
        if (currentSelectedId && data.some(ticket => ticket.id === currentSelectedId)) {
          return currentSelectedId;
        }
        return data[0]?.id ?? null;
      });
    };

    const intervalId = window.setInterval(() => {
      pollTickets();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const loadTicketDetail = async () => {
      if (!selectedId) {
        setSelectedTicket(null);
        return;
      }

      setIsLoadingDetail(true);
      const response = await fetchTicketDetalle(selectedId);
      const historialData = await fetchTicketHistorial(selectedId);
      setSelectedTicket(response?.data ?? null);
      setHistorial(historialData);
      setNuevoEstado(response?.data?.estado ?? 'abierto');
      setRespuesta(response?.data?.respuesta ?? '');
      setAtendidoPor(response?.data?.atendidoPor ?? '');
      setIsLoadingDetail(false);
    };

    loadTicketDetail();
  }, [selectedId]);

  const refreshList = async () => {
    const data = await fetchTickets();
    setTickets(data);
  };

  const refreshHistorial = async (id: number) => {
    const historialData = await fetchTicketHistorial(id);
    setHistorial(historialData);
  };

  const handleGuardarEstado = async () => {
    if (!selectedId) return;
    setIsSavingEstado(true);
    setFeedback('');
    const result = await cambiarEstadoTicket(selectedId, nuevoEstado);
    if (result?.success) {
      setSelectedTicket(result.data);
      await refreshList();
      await refreshHistorial(selectedId);
      setFeedback('Estado actualizado correctamente.');
    }
    setIsSavingEstado(false);
  };

  const handleGuardarRespuesta = async () => {
    if (!selectedId || !respuesta.trim() || !atendidoPor.trim()) return;
    setIsSavingRespuesta(true);
    setFeedback('');
    const result = await responderTicket(selectedId, respuesta.trim(), atendidoPor.trim());
    if (result?.success) {
      setSelectedTicket(result.data);
      await refreshList();
      await refreshHistorial(selectedId);
      setFeedback('Respuesta registrada correctamente.');
    }
    setIsSavingRespuesta(false);
  };

  return (
    <Layout title="Detalle de Tickets">
      <Container>
        <Panel>
          <PanelHeader>Tickets registrados</PanelHeader>
          {isLoadingList ? (
            <LoadingText>Cargando tickets...</LoadingText>
          ) : (
            <TicketList>
              {tickets.map(ticket => (
                <TicketItem key={ticket.id} $active={ticket.id === selectedId}>
                  <button onClick={() => setSelectedId(ticket.id)}>
                    <Subject>{ticket.asunto}</Subject>
                    <Meta>
                      #{ticket.id} · {ticket.tenantNombre}
                    </Meta>
                  </button>
                </TicketItem>
              ))}
            </TicketList>
          )}
        </Panel>

        <Panel>
          <PanelHeader>Respuesta Postman (detalle)</PanelHeader>
          {isLoadingDetail ? (
            <LoadingText>Cargando detalle...</LoadingText>
          ) : !selectedTicket ? (
            <EmptyState>Selecciona un ticket para ver el detalle.</EmptyState>
          ) : (
            <DetailBody>
              <ActionsPanel>
                <Label>Acciones rápidas</Label>
                <Row>
                  <Select
                    value={nuevoEstado}
                    onChange={(event) => setNuevoEstado(event.target.value as TicketDetalle['estado'])}
                  >
                    <option value="abierto">abierto</option>
                    <option value="en_proceso">en_proceso</option>
                    <option value="resuelto">resuelto</option>
                    <option value="cerrado">cerrado</option>
                  </Select>
                  <Button onClick={handleGuardarEstado} disabled={isSavingEstado}>
                    {isSavingEstado ? 'Guardando...' : 'Guardar estado'}
                  </Button>
                </Row>

                <Row>
                  <Input
                    value={atendidoPor}
                    onChange={(event) => setAtendidoPor(event.target.value)}
                    placeholder="atendidoPor (correo o usuario)"
                  />
                </Row>
                <TextArea
                  value={respuesta}
                  onChange={(event) => setRespuesta(event.target.value)}
                  placeholder="Escribe una respuesta para el ticket"
                />
                <Row>
                  <Button
                    onClick={handleGuardarRespuesta}
                    disabled={isSavingRespuesta || !respuesta.trim() || !atendidoPor.trim()}
                  >
                    {isSavingRespuesta ? 'Guardando...' : 'Guardar respuesta'}
                  </Button>
                </Row>
                {feedback ? <MutedText>{feedback}</MutedText> : null}
              </ActionsPanel>

              <Grid>
                <Field>
                  <Label>success</Label>
                  <Value>true</Value>
                </Field>
                <Field>
                  <Label>message</Label>
                  <Value>Ticket encontrado correctamente</Value>
                </Field>
                <Field>
                  <Label>id</Label>
                  <Value>{selectedTicket.id}</Value>
                </Field>
                <Field>
                  <Label>tenantId</Label>
                  <Value>{selectedTicket.tenantId}</Value>
                </Field>
                <Field>
                  <Label>tenantNombre</Label>
                  <Value>{selectedTicket.tenantNombre}</Value>
                </Field>
                <Field>
                  <Label>usuarioPlataformaId</Label>
                  <Value>{selectedTicket.usuarioPlataformaId}</Value>
                </Field>
                <Field>
                  <Label>atendidoPor</Label>
                  <Value>{selectedTicket.atendidoPor || 'Sin asignar'}</Value>
                </Field>
                <Field>
                  <Label>asunto</Label>
                  <Value>{selectedTicket.asunto}</Value>
                </Field>
                <Field>
                  <Label>descripcion</Label>
                  <Value>{selectedTicket.descripcion}</Value>
                </Field>
                <Field>
                  <Label>prioridad</Label>
                  <Value>{selectedTicket.prioridad}</Value>
                </Field>
                <Field>
                  <Label>estado</Label>
                  <StatusBadge $estado={selectedTicket.estado}>{selectedTicket.estado}</StatusBadge>
                </Field>
                <Field>
                  <Label>respuesta</Label>
                  <Value>{selectedTicket.respuesta || 'Sin respuesta'}</Value>
                </Field>
                <Field>
                  <Label>fechaRespuesta</Label>
                  <Value>{selectedTicket.fechaRespuesta || 'Sin fecha'}</Value>
                </Field>
                <Field>
                  <Label>createdAt</Label>
                  <Value>{selectedTicket.createdAt}</Value>
                </Field>
                <Field>
                  <Label>updatedAt</Label>
                  <Value>{selectedTicket.updatedAt}</Value>
                </Field>
              </Grid>

              <TimelinePanel>
                <TimelineTitle>Historial de cambios</TimelineTitle>
                {historial.length === 0 ? (
                  <MutedText>Sin eventos registrados.</MutedText>
                ) : (
                  <TimelineList>
                    {historial.map(evento => (
                      <TimelineItem key={evento.id}>
                        <TimelineText>{evento.descripcion}</TimelineText>
                        <TimelineMeta>
                          {evento.tipo} · {evento.usuario} · {new Date(evento.fecha).toLocaleString('es-PE')}
                        </TimelineMeta>
                      </TimelineItem>
                    ))}
                  </TimelineList>
                )}
              </TimelinePanel>
            </DetailBody>
          )}
        </Panel>
      </Container>
    </Layout>
  );
};

export default DetalleTickets;
