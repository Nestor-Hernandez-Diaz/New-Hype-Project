import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { fetchTickets, fetchTicketById, actualizarTicket, agregarRespuesta } from '../services/ticketsApiNew';
import { COLORS, SHADOWS, SPACING, TYPOGRAPHY, RADIUS, TRANSITION } from '../../../styles/theme';
import type { Ticket, TicketUpdatePayload } from '../../../types/api';
import { useToast } from '../../../context/ToastContext';

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

const FiltersBar = styled.div`
  padding: ${SPACING.md} ${SPACING.xl};
  border-bottom: 1px solid ${COLORS.border};
  background: linear-gradient(180deg, ${COLORS.surfaceHover} 0%, ${COLORS.surface} 100%);
  display: grid;
  gap: ${SPACING.sm};
`;

const FiltersTitle = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLighter};
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${SPACING.sm};
`;

const SearchInput = styled.input`
  flex: 1 1 220px;
  width: 100%;
  min-width: 180px;
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

const ResetButton = styled.button`
  flex: 0 0 auto;
  border: 1px solid ${COLORS.border};
  background: ${COLORS.surface};
  color: ${COLORS.textLight};
  border-radius: ${RADIUS.md};
  padding: ${SPACING.sm} ${SPACING.md};
  cursor: pointer;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  transition: ${TRANSITION};

  &:hover {
    border-color: ${COLORS.primary};
    color: ${COLORS.primary};
  }
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
      case 'CRITICA': return COLORS.error;
      case 'ALTA': return COLORS.warning;
      case 'MEDIA': return COLORS.info;
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
      case 'ABIERTO':
        return `background: ${COLORS.warningLight}; color: ${COLORS.warning};`;
      case 'EN_PROCESO':
        return `background: ${COLORS.infoLight}; color: ${COLORS.info};`;
      case 'RESUELTO':
        return `background: ${COLORS.successLight}; color: ${COLORS.success};`;
      case 'CERRADO':
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

const FilterSelect = styled(Select)`
  flex: 1 1 150px;
  min-width: 140px;
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

// ── Conversación (hilo de respuestas) ──

const ConversacionPanel = styled.div`
  border: 1px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  overflow: hidden;
`;

const ConversacionHeader = styled.div`
  padding: ${SPACING.md} ${SPACING.lg};
  border-bottom: 1px solid ${COLORS.border};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  background: ${COLORS.surfaceHover};
`;

const MensajesContainer = styled.div`
  max-height: 320px;
  overflow-y: auto;
  padding: ${SPACING.md} ${SPACING.lg};
  display: flex;
  flex-direction: column;
  gap: ${SPACING.md};
`;

const MensajeBurbuja = styled.div<{ $esPlatform: boolean }>`
  max-width: 80%;
  align-self: ${props => props.$esPlatform ? 'flex-end' : 'flex-start'};
`;

const MensajeContenido = styled.div<{ $esPlatform: boolean }>`
  padding: ${SPACING.sm} ${SPACING.md};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  line-height: 1.5;
  white-space: pre-wrap;
  background: ${props => props.$esPlatform ? COLORS.primary : COLORS.surfaceHover};
  color: ${props => props.$esPlatform ? '#fff' : COLORS.text};
  border: ${props => props.$esPlatform ? 'none' : `1px solid ${COLORS.border}`};
`;

const MensajeMeta = styled.div<{ $esPlatform: boolean }>`
  display: flex;
  justify-content: ${props => props.$esPlatform ? 'flex-end' : 'flex-start'};
  gap: ${SPACING.sm};
  margin-top: 2px;
  padding: 0 ${SPACING.xs};
  font-size: 10px;
  color: ${COLORS.textLighter};
`;

const AutorTag = styled.span<{ $tipo: string }>`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${props => props.$tipo === 'PLATFORM' ? COLORS.info : COLORS.primary};
`;

const HiloInputArea = styled.div`
  padding: ${SPACING.md} ${SPACING.lg};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  gap: ${SPACING.sm};
  background: ${COLORS.surfaceHover};
`;

const HiloInput = styled.textarea`
  flex: 1;
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
  resize: none;
  min-height: 40px;
  max-height: 100px;
  font-family: inherit;
  transition: ${TRANSITION};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
  }

  &:disabled {
    background: ${COLORS.surfaceHover};
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  border: none;
  border-radius: ${RADIUS.md};
  padding: ${SPACING.sm} ${SPACING.md};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: pointer;
  color: ${COLORS.surface};
  background: ${COLORS.primary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  transition: ${TRANSITION};
  white-space: nowrap;

  &:hover { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const EmptyConversacion = styled.div`
  padding: ${SPACING.xl};
  text-align: center;
  color: ${COLORS.textLighter};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const TicketCerradoMsg = styled.div`
  padding: ${SPACING.md} ${SPACING.lg};
  border-top: 1px solid ${COLORS.border};
  text-align: center;
  color: ${COLORS.textLighter};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  background: ${COLORS.surfaceHover};
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  // List filters
  const [estadoFiltro, setEstadoFiltro] = useState(() => searchParams.get('estado') ?? '');
  const [prioridadFiltro, setPrioridadFiltro] = useState(() => searchParams.get('prioridad') ?? '');
  const [busquedaFiltro, setBusquedaFiltro] = useState(() => searchParams.get('q') ?? '');

  // Form state
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [nuevaPrioridad, setNuevaPrioridad] = useState('');
  const [mensajeHilo, setMensajeHilo] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  // Polling: recargar ticket seleccionado cada 8s para ver mensajes nuevos
  const selectedRef = useRef<Ticket | null>(null);
  selectedRef.current = selected;

  useEffect(() => {
    const interval = setInterval(async () => {
      const current = selectedRef.current;
      if (!current) return;
      try {
        const detail = await fetchTicketById(current.id);
        setSelected(detail);
      } catch {
        // silenciar errores de polling
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (estadoFiltro) nextParams.set('estado', estadoFiltro);
    if (prioridadFiltro) nextParams.set('prioridad', prioridadFiltro);

    const query = busquedaFiltro.trim();
    if (query) nextParams.set('q', query);

    const next = nextParams.toString();
    const current = searchParams.toString();

    if (next !== current) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [estadoFiltro, prioridadFiltro, busquedaFiltro, searchParams, setSearchParams]);

  const filteredTickets = tickets.filter((ticket) => {
    const byEstado = !estadoFiltro || ticket.estado === estadoFiltro;
    const byPrioridad = !prioridadFiltro || ticket.prioridad === prioridadFiltro;

    const search = busquedaFiltro.trim().toLowerCase();
    const hayBusqueda = !search
      || ticket.asunto.toLowerCase().includes(search)
      || ticket.tenantNombre.toLowerCase().includes(search)
      || String(ticket.id).includes(search);

    return byEstado && byPrioridad && hayBusqueda;
  });

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const res = await fetchTickets();
      const list = Array.isArray(res) ? res : [];
      setTickets(list);
      if (list.length > 0 && !selected) {
        const detail = await fetchTicketById(list[0].id);
        setSelected(detail ?? null);
      }
    } catch (err) {
      console.error('Error cargando tickets:', err);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTicket = async (ticket: Ticket) => {
    const detail = await fetchTicketById(ticket.id);
    setSelected(detail);
    setNuevoEstado('');
    setNuevaPrioridad('');
    setMensajeHilo('');
  };

  const handleSubmitUpdate = async () => {
    if (!selected) return;
    const payload: TicketUpdatePayload = {};
    if (nuevoEstado) payload.estado = nuevoEstado;
    if (nuevaPrioridad) payload.prioridad = nuevaPrioridad;

    if (!payload.estado && !payload.prioridad) {
      toast.warning('Seleccione un estado o prioridad a cambiar.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await actualizarTicket(selected.id, payload);
      setSelected(updated);
      setNuevoEstado('');
      setNuevaPrioridad('');
      toast.success('Ticket actualizado.');
      await loadTickets();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnviarMensaje = async () => {
    if (!selected || !mensajeHilo.trim()) return;

    setEnviandoMensaje(true);
    try {
      const updated = await agregarRespuesta(selected.id, mensajeHilo.trim());
      setSelected(updated);
      setMensajeHilo('');
      toast.success('Mensaje enviado.');
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      toast.error('Error al enviar el mensaje.');
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const handleKeyDownHilo = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviarMensaje();
    }
  };

  return (
    <Layout title="Tickets de Soporte">
      <Container>
        {/* ── LISTA ── */}
        <Panel>
          <PanelHeader>
            Tickets
            <TicketCount>{filteredTickets.length} visibles / {tickets.length} total</TicketCount>
          </PanelHeader>
          <FiltersBar>
            <FiltersTitle>Filtros rapidos</FiltersTitle>
            <FiltersRow>
              <SearchInput
                placeholder="Buscar por asunto, negocio o ID..."
                value={busquedaFiltro}
                onChange={(e) => setBusquedaFiltro(e.target.value)}
              />
              <FilterSelect value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
                <option value="">Todos los estados</option>
                <option value="ABIERTO">Abierto</option>
                <option value="EN_PROCESO">En proceso</option>
                <option value="RESUELTO">Resuelto</option>
                <option value="CERRADO">Cerrado</option>
              </FilterSelect>
              <FilterSelect value={prioridadFiltro} onChange={(e) => setPrioridadFiltro(e.target.value)}>
                <option value="">Todas las prioridades</option>
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </FilterSelect>
              <ResetButton
                type="button"
                onClick={() => {
                  setEstadoFiltro('');
                  setPrioridadFiltro('');
                  setBusquedaFiltro('');
                }}
              >
                Limpiar
              </ResetButton>
            </FiltersRow>
          </FiltersBar>
          {isLoading ? (
            <LoadingState>Cargando...</LoadingState>
          ) : (
            <TicketList>
              {filteredTickets.map(t => (
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
              {filteredTickets.length === 0 && (
                <EmptyDetail>No hay tickets que coincidan con los filtros.</EmptyDetail>
              )}
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
                  <Label>Negocio</Label>
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

              {/* ── Hilo de conversación ── */}
              <ConversacionPanel>
                <ConversacionHeader>
                  Conversación ({selected.respuestas?.length || 0} mensajes)
                </ConversacionHeader>

                <MensajesContainer>
                  {(!selected.respuestas || selected.respuestas.length === 0) ? (
                    <EmptyConversacion>
                      No hay mensajes aún. Escriba un mensaje para iniciar la conversación.
                    </EmptyConversacion>
                  ) : (
                    selected.respuestas.map((resp) => {
                      const esPlatform = resp.autorTipo === 'PLATFORM';
                      return (
                        <MensajeBurbuja key={resp.id} $esPlatform={esPlatform}>
                          <MensajeContenido $esPlatform={esPlatform}>
                            {resp.mensaje}
                          </MensajeContenido>
                          <MensajeMeta $esPlatform={esPlatform}>
                            <AutorTag $tipo={resp.autorTipo}>
                              {esPlatform ? (resp.autorNombre || 'Soporte') : (resp.autorNombre || 'Tenant')}
                            </AutorTag>
                            <span>·</span>
                            <span>{formatDate(resp.createdAt)}</span>
                          </MensajeMeta>
                        </MensajeBurbuja>
                      );
                    })
                  )}
                </MensajesContainer>

                {selected.estado === 'CERRADO' ? (
                  <TicketCerradoMsg>
                    Este ticket está cerrado. No se pueden enviar más mensajes.
                  </TicketCerradoMsg>
                ) : (
                  <HiloInputArea>
                    <HiloInput
                      placeholder="Escribir mensaje... (Enter para enviar)"
                      value={mensajeHilo}
                      onChange={(e) => setMensajeHilo(e.target.value)}
                      onKeyDown={handleKeyDownHilo}
                      disabled={enviandoMensaje}
                      rows={1}
                    />
                    <SendButton
                      onClick={handleEnviarMensaje}
                      disabled={enviandoMensaje || !mensajeHilo.trim()}
                    >
                      {enviandoMensaje ? 'Enviando...' : 'Enviar'}
                    </SendButton>
                  </HiloInputArea>
                )}
              </ConversacionPanel>

              <ActionsPanel>
                <ActionsTitle>Acciones administrativas</ActionsTitle>
                <Row>
                  <Select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
                    <option value="">Cambiar estado...</option>
                    <option value="ABIERTO">Abierto</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="RESUELTO">Resuelto</option>
                    <option value="CERRADO">Cerrado</option>
                  </Select>
                  <Select value={nuevaPrioridad} onChange={e => setNuevaPrioridad(e.target.value)}>
                    <option value="">Cambiar prioridad...</option>
                    <option value="BAJA">Baja</option>
                    <option value="MEDIA">Media</option>
                    <option value="ALTA">Alta</option>
                    <option value="CRITICA">Crítica</option>
                  </Select>
                </Row>
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
