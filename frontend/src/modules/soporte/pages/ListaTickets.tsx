import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import { useNotification } from '../../../context/NotificationContext';
import { soporteApi, type Ticket, type CrearTicketData } from '../services/soporteApi';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import {
  Button,
  Input,
  Select,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  StatusBadge,
  PaginationContainer,
  PaginationInfo,
  PaginationButtons,
  PageButton,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText
} from '../../../components/shared';

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  padding: 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const TitleSection = styled.div``;

const PageTitle = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.small};
  margin: ${SPACING.xs} 0 0 0;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  padding: ${SPACING['2xl']};
  width: 90%;
  max-width: 560px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  font-size: ${TYPOGRAPHY.fontSize.xl};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  margin: 0 0 ${SPACING.xl} 0;
`;

const FormGroup = styled.div`
  margin-bottom: ${SPACING.lg};
`;

const FormLabel = styled.label`
  display: block;
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
  margin-bottom: ${SPACING.xs};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.medium};
  font-size: ${TYPOGRAPHY.fontSize.body};
  font-family: inherit;
  resize: vertical;
  transition: ${TRANSITIONS.normal};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLOR_SCALES.primary[100]};
  }
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.md};
  margin-top: ${SPACING.xl};
`;

const PrioridadBadge = styled.span<{ $prioridad: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
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

const AsuntoLink = styled.span`
  color: ${COLORS.primary};
  cursor: pointer;
  font-weight: ${TYPOGRAPHY.fontWeight.medium};

  &:hover {
    text-decoration: underline;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: ${SPACING.xxl};
  color: ${COLORS.textLight};
`;

// ============================================================================
// COMPONENTE
// ============================================================================

const ListaTickets: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [nuevoTicket, setNuevoTicket] = useState<CrearTicketData>({
    asunto: '',
    descripcion: '',
    prioridad: 'MEDIA',
  });

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await soporteApi.listarTickets(currentPage, 15);
      setTickets(result.tickets);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (error: any) {
      console.error('Error cargando tickets:', error);
      showError('Error al cargar los tickets');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleCrearTicket = async () => {
    if (!nuevoTicket.asunto.trim() || !nuevoTicket.descripcion.trim()) {
      showError('El asunto y la descripción son obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      await soporteApi.crearTicket(nuevoTicket);
      showSuccess('Ticket creado exitosamente');
      setShowModal(false);
      setNuevoTicket({ asunto: '', descripcion: '', prioridad: 'MEDIA' });
      setCurrentPage(0);
      loadTickets();
    } catch (error: any) {
      showError(error.message || 'Error al crear el ticket');
    } finally {
      setSubmitting(false);
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

  const getPrioridadLabel = (prioridad: string) => {
    switch (prioridad) {
      case 'BAJA': return 'Baja';
      case 'MEDIA': return 'Media';
      case 'ALTA': return 'Alta';
      case 'CRITICA': return 'Crítica';
      default: return prioridad;
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

  const startIndex = currentPage * 15;

  return (
    <Layout title="Soporte - Tickets">
      <Container>
        <PageHeader>
          <TitleSection>
            <PageTitle>Soporte y Tickets</PageTitle>
            <PageSubtitle>Gestione sus tickets de soporte técnico</PageSubtitle>
          </TitleSection>
          <Button $variant="primary" onClick={() => setShowModal(true)}>
            + Nuevo Ticket
          </Button>
        </PageHeader>

        <TableContainer>
          {loading ? (
            <LoadingContainer>Cargando tickets...</LoadingContainer>
          ) : tickets.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🎫</EmptyIcon>
              <EmptyTitle>No hay tickets</EmptyTitle>
              <EmptyText>Cree un nuevo ticket para solicitar soporte técnico.</EmptyText>
            </EmptyState>
          ) : (
            <>
              <Table>
                <Thead>
                  <Tr>
                    <Th style={{ width: '60px' }}>#</Th>
                    <Th>Asunto</Th>
                    <Th style={{ width: '100px' }}>Prioridad</Th>
                    <Th style={{ width: '120px' }}>Estado</Th>
                    <Th style={{ width: '140px' }}>Atendido por</Th>
                    <Th style={{ width: '160px' }}>Creado</Th>
                    <Th style={{ width: '160px' }}>Actualizado</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tickets.map((ticket) => (
                    <Tr key={ticket.id}>
                      <Td style={{ fontWeight: 600, color: COLORS.textLight }}>
                        {ticket.id}
                      </Td>
                      <Td>
                        <AsuntoLink onClick={() => navigate(`/soporte/tickets/${ticket.id}`)}>
                          {ticket.asunto}
                        </AsuntoLink>
                      </Td>
                      <Td>
                        <PrioridadBadge $prioridad={ticket.prioridad}>
                          {getPrioridadLabel(ticket.prioridad)}
                        </PrioridadBadge>
                      </Td>
                      <Td>
                        <StatusBadge variant={getEstadoVariant(ticket.estado)} dot>
                          {getEstadoLabel(ticket.estado)}
                        </StatusBadge>
                      </Td>
                      <Td>{ticket.atendidoPor || '-'}</Td>
                      <Td style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>
                        {formatDate(ticket.createdAt)}
                      </Td>
                      <Td style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>
                        {formatDate(ticket.updatedAt)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {totalPages > 1 && (
                <PaginationContainer>
                  <PaginationInfo>
                    Mostrando {startIndex + 1} - {Math.min(startIndex + 15, totalElements)} de {totalElements}
                  </PaginationInfo>
                  <PaginationButtons>
                    <PageButton
                      onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                    >
                      Anterior
                    </PageButton>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 5) {
                        page = i;
                      } else if (currentPage <= 2) {
                        page = i;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 5 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <PageButton
                          key={page}
                          $active={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page + 1}
                        </PageButton>
                      );
                    })}
                    <PageButton
                      onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Siguiente
                    </PageButton>
                  </PaginationButtons>
                </PaginationContainer>
              )}
            </>
          )}
        </TableContainer>

        {/* Modal Crear Ticket */}
        {showModal && (
          <ModalOverlay onClick={() => !submitting && setShowModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalTitle>Nuevo Ticket de Soporte</ModalTitle>

              <FormGroup>
                <FormLabel>Asunto *</FormLabel>
                <Input
                  type="text"
                  placeholder="Describa brevemente el problema"
                  value={nuevoTicket.asunto}
                  onChange={(e) => setNuevoTicket(prev => ({ ...prev, asunto: e.target.value }))}
                  maxLength={200}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Prioridad</FormLabel>
                <Select
                  value={nuevoTicket.prioridad}
                  onChange={(e) => setNuevoTicket(prev => ({ ...prev, prioridad: e.target.value }))}
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Crítica</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <FormLabel>Descripción *</FormLabel>
                <TextArea
                  placeholder="Explique el problema con detalle..."
                  value={nuevoTicket.descripcion}
                  onChange={(e) => setNuevoTicket(prev => ({ ...prev, descripcion: e.target.value }))}
                />
              </FormGroup>

              <ModalButtons>
                <Button $variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button $variant="primary" onClick={handleCrearTicket} disabled={submitting}>
                  {submitting ? 'Creando...' : 'Crear Ticket'}
                </Button>
              </ModalButtons>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </Layout>
  );
};

export default ListaTickets;
