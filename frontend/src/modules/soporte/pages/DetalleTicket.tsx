import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { useNotification } from '../../../context/NotificationContext';
import { soporteApi, type Ticket, type RespuestaTicket } from '../services/soporteApi';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { Button, StatusBadge } from '../../../components/shared';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  padding: 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.md};
  margin-bottom: ${SPACING.lg};
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};
  background: none;
  border: none;
  color: ${COLORS.primary};
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  padding: ${SPACING.xs} ${SPACING.sm};
  border-radius: ${BORDER_RADIUS.small};
  transition: ${TRANSITIONS.normal};

  &:hover {
    background: ${COLOR_SCALES.primary[50]};
  }
`;

const TicketHeader = styled.div`
  background: ${COLORS.white};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.large};
  padding: ${SPACING.xl};
  margin-bottom: ${SPACING.lg};
`;

const TicketTitle = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xl};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.md} 0;
`;

const TicketMeta = styled.div`
  display: flex;
  gap: ${SPACING.xl};
  flex-wrap: wrap;
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.textLight};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};

  strong {
    color: ${COLORS.text};
    font-weight: ${TYPOGRAPHY.fontWeight.medium};
  }
`;

const PrioridadBadge = styled.span<{ $prioridad: string }>`
  display: inline-flex;
  padding: 2px 8px;
  border-radius: ${BORDER_RADIUS.small};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  background: ${props => {
    switch (props.$prioridad) {
      case 'CRITICA': return COLOR_SCALES.danger[50];
      case 'ALTA': return COLOR_SCALES.warning[50];
      case 'MEDIA': return COLOR_SCALES.primary[50];
      case 'BAJA': return COLOR_SCALES.success[50];
      default: return COLORS.borderLight;
    }
  }};
  color: ${props => {
    switch (props.$prioridad) {
      case 'CRITICA': return COLOR_SCALES.danger[700];
      case 'ALTA': return COLOR_SCALES.warning[700];
      case 'MEDIA': return COLOR_SCALES.primary[700];
      case 'BAJA': return COLOR_SCALES.success[700];
      default: return COLORS.textLight;
    }
  }};
`;

const DescripcionBox = styled.div`
  background: ${COLORS.background};
  border: 1px solid ${COLORS.borderLight};
  border-radius: ${BORDER_RADIUS.medium};
  padding: ${SPACING.lg};
  margin-top: ${SPACING.lg};
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.text};
  line-height: 1.6;
  white-space: pre-wrap;
`;

const ConversacionArea = styled.div`
  flex: 1;
  background: ${COLORS.white};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.large};
  display: flex;
  flex-direction: column;
  min-height: 300px;
  overflow: hidden;
`;

const ConversacionHeader = styled.div`
  padding: ${SPACING.md} ${SPACING.xl};
  border-bottom: 1px solid ${COLORS.border};
  font-size: ${TYPOGRAPHY.fontSize.body};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  background: ${COLORS.background};
`;

const MensajesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${SPACING.xl};
  display: flex;
  flex-direction: column;
  gap: ${SPACING.lg};
`;

const MensajeBurbuja = styled.div<{ $esMio: boolean }>`
  max-width: 75%;
  align-self: ${props => props.$esMio ? 'flex-end' : 'flex-start'};
`;

const MensajeContenido = styled.div<{ $esMio: boolean }>`
  padding: ${SPACING.md} ${SPACING.lg};
  border-radius: ${BORDER_RADIUS.large};
  font-size: ${TYPOGRAPHY.fontSize.body};
  line-height: 1.5;
  white-space: pre-wrap;
  background: ${props => props.$esMio ? COLOR_SCALES.primary[500] : COLORS.background};
  color: ${props => props.$esMio ? '#fff' : COLORS.text};
  border: ${props => props.$esMio ? 'none' : `1px solid ${COLORS.border}`};
`;

const MensajeMeta = styled.div<{ $esMio: boolean }>`
  display: flex;
  justify-content: ${props => props.$esMio ? 'flex-end' : 'flex-start'};
  gap: ${SPACING.sm};
  margin-top: ${SPACING.xs};
  padding: 0 ${SPACING.xs};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLight};
`;

const AutorTag = styled.span<{ $tipo: string }>`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${props => props.$tipo === 'PLATFORM' ? COLOR_SCALES.info[600] : COLOR_SCALES.primary[600]};
`;

const InputArea = styled.div`
  padding: ${SPACING.lg} ${SPACING.xl};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  gap: ${SPACING.md};
  background: ${COLORS.background};
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.medium};
  font-size: ${TYPOGRAPHY.fontSize.body};
  font-family: inherit;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  transition: ${TRANSITIONS.normal};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLOR_SCALES.primary[100]};
  }

  &:disabled {
    background: ${COLORS.borderLight};
    cursor: not-allowed;
  }
`;

const TicketCerradoMsg = styled.div`
  padding: ${SPACING.lg} ${SPACING.xl};
  border-top: 1px solid ${COLORS.border};
  text-align: center;
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.small};
  background: ${COLORS.background};
`;

const EmptyConversacion = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${COLORS.textLight};
  gap: ${SPACING.sm};
  padding: ${SPACING.xxl};
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: ${SPACING.xxl};
  color: ${COLORS.textLight};
`;

// ============================================================================
// COMPONENTE
// ============================================================================

const DetalleTicket: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const mensajesRef = useRef<HTMLDivElement>(null);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const loadTicket = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await soporteApi.obtenerTicket(Number(id));
      setTicket(data);
    } catch (error: any) {
      console.error('Error cargando ticket:', error);
      showError('Error al cargar el ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [ticket?.respuestas]);

  const handleEnviar = async () => {
    if (!mensaje.trim() || !ticket) return;

    setEnviando(true);
    try {
      await soporteApi.responderTicket(ticket.id, mensaje.trim());
      setMensaje('');
      showSuccess('Mensaje enviado');
      loadTicket();
    } catch (error: any) {
      showError(error.message || 'Error al enviar el mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const getEstadoVariant = (estado: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (estado) {
      case 'ABIERTO': return 'info';
      case 'EN_PROCESO': return 'warning';
      case 'RESUELTO': return 'success';
      case 'CERRADO': return 'default';
      default: return 'default';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'ABIERTO': return 'Abierto';
      case 'EN_PROCESO': return 'En Proceso';
      case 'RESUELTO': return 'Resuelto';
      case 'CERRADO': return 'Cerrado';
      default: return estado;
    }
  };

  const getPrioridadLabel = (p: string) => {
    switch (p) {
      case 'BAJA': return 'Baja';
      case 'MEDIA': return 'Media';
      case 'ALTA': return 'Alta';
      case 'CRITICA': return 'Crítica';
      default: return p;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const isCerrado = ticket?.estado === 'CERRADO';

  if (loading) {
    return (
      <Layout title="Detalle de Ticket">
        <LoadingContainer>Cargando ticket...</LoadingContainer>
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout title="Ticket no encontrado">
        <Container>
          <TopBar>
            <BackButton onClick={() => navigate('/soporte/tickets')}>
              ← Volver a tickets
            </BackButton>
          </TopBar>
          <LoadingContainer>Ticket no encontrado</LoadingContainer>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title={`Ticket #${ticket.id}`}>
      <Container>
        <TopBar>
          <BackButton onClick={() => navigate('/soporte/tickets')}>
            ← Volver a tickets
          </BackButton>
        </TopBar>

        <TicketHeader>
          <TicketTitle>#{ticket.id} - {ticket.asunto}</TicketTitle>
          <TicketMeta>
            <MetaItem>
              <strong>Estado:</strong>
              <StatusBadge variant={getEstadoVariant(ticket.estado)} dot>
                {getEstadoLabel(ticket.estado)}
              </StatusBadge>
            </MetaItem>
            <MetaItem>
              <strong>Prioridad:</strong>
              <PrioridadBadge $prioridad={ticket.prioridad}>
                {getPrioridadLabel(ticket.prioridad)}
              </PrioridadBadge>
            </MetaItem>
            <MetaItem>
              <strong>Creado:</strong> {formatDate(ticket.createdAt)}
            </MetaItem>
            {ticket.atendidoPor && (
              <MetaItem>
                <strong>Atendido por:</strong> {ticket.atendidoPor}
              </MetaItem>
            )}
          </TicketMeta>
          <DescripcionBox>{ticket.descripcion}</DescripcionBox>
        </TicketHeader>

        <ConversacionArea>
          <ConversacionHeader>
            Conversación ({ticket.respuestas?.length || 0} mensajes)
          </ConversacionHeader>

          <MensajesContainer ref={mensajesRef}>
            {(!ticket.respuestas || ticket.respuestas.length === 0) ? (
              <EmptyConversacion>
                <span style={{ fontSize: '32px' }}>💬</span>
                <span>No hay mensajes aún.</span>
                <span>Escriba un mensaje para iniciar la conversación.</span>
              </EmptyConversacion>
            ) : (
              ticket.respuestas.map((resp) => {
                const esMio = resp.autorTipo === 'TENANT';
                return (
                  <MensajeBurbuja key={resp.id} $esMio={esMio}>
                    <MensajeContenido $esMio={esMio}>
                      {resp.mensaje}
                    </MensajeContenido>
                    <MensajeMeta $esMio={esMio}>
                      <AutorTag $tipo={resp.autorTipo}>
                        {esMio ? (resp.autorNombre || 'Tú') : (resp.autorNombre || 'Soporte')}
                      </AutorTag>
                      <span>·</span>
                      <span>{formatDate(resp.createdAt)}</span>
                    </MensajeMeta>
                  </MensajeBurbuja>
                );
              })
            )}
          </MensajesContainer>

          {isCerrado ? (
            <TicketCerradoMsg>
              Este ticket está cerrado. No se pueden enviar más mensajes.
            </TicketCerradoMsg>
          ) : (
            <InputArea>
              <MessageInput
                placeholder="Escriba su mensaje... (Enter para enviar, Shift+Enter para salto de línea)"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={enviando}
                rows={1}
              />
              <Button
                $variant="primary"
                onClick={handleEnviar}
                disabled={enviando || !mensaje.trim()}
              >
                {enviando ? 'Enviando...' : 'Enviar'}
              </Button>
            </InputArea>
          )}
        </ConversacionArea>
      </Container>
    </Layout>
  );
};

export default DetalleTicket;
