import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../../styles/theme';
import {
  fetchTicketDetalle,
  fetchTicketHistorial,
  fetchTickets,
  type TicketDetalle,
  type TicketEvento,
} from '../services/ticketsApi';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: ${SPACING.lg};

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.section`
  background: ${COLORS.white};
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  box-shadow: ${SHADOWS.sm};
  overflow: hidden;
`;

const Header = styled.div`
  padding: ${SPACING.md} ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.border};
  background: ${COLORS.background};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text.primary};
`;

const TicketList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const TicketButton = styled.button<{ $active: boolean }>`
  width: 100%;
  text-align: left;
  border: none;
  border-bottom: 1px solid ${COLORS.border};
  padding: ${SPACING.md} ${SPACING.lg};
  cursor: pointer;
  background: ${props => (props.$active ? COLORS.primaryLight : COLORS.white)};

  &:hover {
    background: ${COLORS.background};
  }
`;

const Subject = styled.div`
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.base};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const Meta = styled.div`
  margin-top: ${SPACING.xs};
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.xs};
`;

const Body = styled.div`
  padding: ${SPACING.lg};
  display: grid;
  gap: ${SPACING.md};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: ${SPACING.sm};
`;

const Field = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  padding: ${SPACING.sm} ${SPACING.md};
`;

const Label = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.secondary};
  text-transform: uppercase;
  margin-bottom: ${SPACING.xs};
`;

const Value = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.text.primary};
  word-break: break-word;
`;

const Badge = styled.span<{ $estado: TicketDetalle['estado'] }>`
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: ${TYPOGRAPHY.fontSize.xs};

  ${({ $estado }) => {
    switch ($estado) {
      case 'abierto':
        return `background: ${COLORS.warningBg}; color: ${COLORS.warningText};`;
      case 'en_proceso':
        return `background: ${COLORS.infoBg}; color: ${COLORS.infoText};`;
      case 'resuelto':
        return `background: ${COLORS.successBg}; color: ${COLORS.successText};`;
      default:
        return `background: ${COLORS.borderLight}; color: ${COLORS.text.secondary};`;
    }
  }}
`;

const Timeline = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: 10px;
  padding: ${SPACING.md};
`;

const TimelineTitle = styled.h3`
  margin: 0 0 ${SPACING.md} 0;
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.base};
`;

const TimelineItem = styled.div`
  border-left: 2px solid ${COLORS.primary};
  padding-left: ${SPACING.sm};
  margin-bottom: ${SPACING.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineText = styled.div`
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

const TimelineMeta = styled.div`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  margin-top: ${SPACING.xs};
`;

const Muted = styled.div`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

const DetalleTickets: React.FC = () => {
  const location = useLocation();
  const [tickets, setTickets] = useState<TicketDetalle[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetalle | null>(null);
  const [historial, setHistorial] = useState<TicketEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadList = async () => {
      setLoading(true);
      const data = await fetchTickets();
      setTickets(data);
      const fromNavigation = (location.state as { selectedTicketId?: number } | null)?.selectedTicketId;
      if (fromNavigation && data.some(ticket => ticket.id === fromNavigation)) {
        setSelectedId(fromNavigation);
      } else {
        setSelectedId(data[0]?.id ?? null);
      }
      setLoading(false);
    };

    loadList();
  }, [location.state]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedId) return;
      const [detail, timeline] = await Promise.all([
        fetchTicketDetalle(selectedId),
        fetchTicketHistorial(selectedId),
      ]);
      setSelectedTicket(detail);
      setHistorial(timeline);
    };

    loadDetail();
  }, [selectedId]);

  return (
    <Layout title="Detalle de Tickets">
      <Wrapper>
        <Card>
          <Header>Tickets registrados</Header>
          {loading ? (
            <Body>
              <Muted>Cargando tickets...</Muted>
            </Body>
          ) : (
            <TicketList>
              {tickets.map(ticket => (
                <li key={ticket.id}>
                  <TicketButton
                    $active={ticket.id === selectedId}
                    onClick={() => setSelectedId(ticket.id)}
                  >
                    <Subject>{ticket.asunto}</Subject>
                    <Meta>#{ticket.id} · {ticket.tenantNombre}</Meta>
                  </TicketButton>
                </li>
              ))}
            </TicketList>
          )}
        </Card>

        <Card>
          <Header>Respuesta Postman (detalle)</Header>
          {!selectedTicket ? (
            <Body>
              <Muted>Selecciona un ticket para ver detalle.</Muted>
            </Body>
          ) : (
            <Body>
              <Grid>
                <Field><Label>success</Label><Value>true</Value></Field>
                <Field><Label>message</Label><Value>Ticket encontrado correctamente</Value></Field>
                <Field><Label>id</Label><Value>{selectedTicket.id}</Value></Field>
                <Field><Label>tenantId</Label><Value>{selectedTicket.tenantId}</Value></Field>
                <Field><Label>tenantNombre</Label><Value>{selectedTicket.tenantNombre}</Value></Field>
                <Field><Label>usuarioPlataformaId</Label><Value>{selectedTicket.usuarioPlataformaId}</Value></Field>
                <Field><Label>atendidoPor</Label><Value>{selectedTicket.atendidoPor || 'Sin asignar'}</Value></Field>
                <Field><Label>asunto</Label><Value>{selectedTicket.asunto}</Value></Field>
                <Field><Label>descripcion</Label><Value>{selectedTicket.descripcion}</Value></Field>
                <Field><Label>prioridad</Label><Value>{selectedTicket.prioridad}</Value></Field>
                <Field>
                  <Label>estado</Label>
                  <Value><Badge $estado={selectedTicket.estado}>{selectedTicket.estado}</Badge></Value>
                </Field>
                <Field><Label>respuesta</Label><Value>{selectedTicket.respuesta || 'Sin respuesta'}</Value></Field>
                <Field><Label>fechaRespuesta</Label><Value>{selectedTicket.fechaRespuesta || 'Sin fecha'}</Value></Field>
                <Field><Label>createdAt</Label><Value>{selectedTicket.createdAt}</Value></Field>
                <Field><Label>updatedAt</Label><Value>{selectedTicket.updatedAt}</Value></Field>
              </Grid>

              <Timeline>
                <TimelineTitle>Historial de cambios</TimelineTitle>
                {historial.length === 0 ? (
                  <Muted>Sin eventos registrados.</Muted>
                ) : (
                  historial.map(evento => (
                    <TimelineItem key={evento.id}>
                      <TimelineText>{evento.descripcion}</TimelineText>
                      <TimelineMeta>
                        {evento.tipo} · {evento.usuario} · {new Date(evento.fecha).toLocaleString('es-PE')}
                      </TimelineMeta>
                    </TimelineItem>
                  ))
                )}
              </Timeline>
            </Body>
          )}
        </Card>
      </Wrapper>
    </Layout>
  );
};

export default DetalleTickets;
