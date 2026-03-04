import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../styles/theme';
import {
  createRequirement,
  deleteRequirement,
  fetchRequirements,
  updateRequirement
} from '../services/superadminApi';
import {
  FiltersCard,
  Input,
  Select,
  FormGroup,
  Label,
  RequiredMark,
  ValidationMessage,
  StatsGrid,
  StatCard,
  StatValue,
  StatLabel,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  StatusBadge,
  Button,
  ActionButton,
  ButtonGroup,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText
} from '../../../components/shared';
import type { SuperadminRequirement } from '../services/superadminApi';

const Container = styled.div`
  padding: ${SPACING['2xl']};
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
`;

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

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${SPACING.lg};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FilterLabel = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.textLight};
`;

const ResultsCount = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.textLight};
  margin-bottom: ${SPACING.md};
`;

const LoadingText = styled.p`
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.textLight};
  margin: 0 0 ${SPACING.md} 0;
`;

const ErrorBanner = styled.div`
  background: ${COLORS.dangerBg};
  color: ${COLORS.dangerText};
  padding: ${SPACING.md} ${SPACING.lg};
  border-radius: 10px;
  margin-bottom: ${SPACING.md};
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${SPACING.lg};
`;

const ModalContent = styled.div`
  background: ${COLORS.white};
  border-radius: 14px;
  width: 100%;
  max-width: 680px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: ${SPACING.xl};
  border-bottom: 1px solid ${COLORS.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.h3};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
`;

const ModalBody = styled.div`
  padding: ${SPACING.xl};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: ${SPACING.lg};
`;

const ModalFooter = styled.div`
  padding: ${SPACING.xl};
  border-top: 1px solid ${COLORS.border};
  display: flex;
  justify-content: flex-end;
`;

const getPriorityVariant = (priority: SuperadminRequirement['priority']) => {
  switch (priority) {
    case 'Critica':
      return 'danger';
    case 'Alta':
      return 'warning';
    case 'Media':
      return 'info';
    default:
      return 'default';
  }
};

const getStatusVariant = (status: SuperadminRequirement['status']) => {
  switch (status) {
    case 'Nuevo':
      return 'info';
    case 'Actualizado':
      return 'success';
    default:
      return 'default';
  }
};

const RequerimientosSuperadmin: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('todas');
  const [requirements, setRequirements] = useState<SuperadminRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<SuperadminRequirement>({
    code: '',
    name: '',
    area: '',
    priority: 'Media',
    status: 'Nuevo'
  });
  const [formErrors, setFormErrors] = useState<{ code?: string; name?: string; area?: string }>({});

  useEffect(() => {
    const loadRequirements = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const data = await fetchRequirements();
        setRequirements(data);
      } catch (error) {
        console.error('Error loading requirements:', error);
        setErrorMessage('No se pudieron cargar los requerimientos.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRequirements();
  }, []);

  const areas = useMemo(() => {
    const uniqueAreas = Array.from(new Set(requirements.map((item) => item.area)));
    return ['todas', ...uniqueAreas];
  }, [requirements]);

  const filteredRequirements = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return requirements.filter((item) => {
      const matchesSearch = !normalizedSearch
        || item.code.toLowerCase().includes(normalizedSearch)
        || item.name.toLowerCase().includes(normalizedSearch)
        || item.area.toLowerCase().includes(normalizedSearch);
      const matchesArea = areaFilter === 'todas' || item.area === areaFilter;
      return matchesSearch && matchesArea;
    });
  }, [searchTerm, areaFilter, requirements]);

  const totalCriticas = useMemo(
    () => requirements.filter((item) => item.priority === 'Critica').length,
    [requirements]
  );

  const openCreateModal = () => {
    setEditingCode(null);
    setFormErrors({});
    setErrorMessage('');
    setFormData({
      code: '',
      name: '',
      area: '',
      priority: 'Media',
      status: 'Nuevo'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: SuperadminRequirement) => {
    setEditingCode(item.code);
    setFormErrors({});
    setErrorMessage('');
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (field: keyof SuperadminRequirement, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: { code?: string; name?: string; area?: string } = {};
    if (!formData.code.trim()) {
      errors.code = 'El codigo es obligatorio.';
    }
    if (!formData.name.trim()) {
      errors.name = 'El nombre es obligatorio.';
    }
    if (!formData.area.trim()) {
      errors.area = 'El area es obligatoria.';
    }

    const normalizedCode = formData.code.trim().toUpperCase();
    const exists = requirements.some((item) => item.code === normalizedCode);
    if (!editingCode && exists) {
      errors.code = 'El codigo ya existe.';
    }
    if (editingCode && editingCode !== normalizedCode && exists) {
      errors.code = 'El codigo ya existe.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const payload: SuperadminRequirement = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      area: formData.area.trim()
    };

    setIsSaving(true);
    setErrorMessage('');

    try {
      if (editingCode) {
        const updated = await updateRequirement(payload);
        setRequirements(updated);
      } else {
        const created = await createRequirement(payload);
        setRequirements(created);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving requirement:', error);
      setErrorMessage('No se pudo guardar el requerimiento.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!window.confirm('Deseas eliminar este requerimiento?')) {
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      const updated = await deleteRequirement(code);
      setRequirements(updated);
    } catch (error) {
      console.error('Error deleting requirement:', error);
      setErrorMessage('No se pudo eliminar el requerimiento.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout title="Superadmin">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Requerimientos Funcionales</PageTitle>
            <PageSubtitle>
              Administracion de venta de ropa y accesorios para la plataforma SaaS.
            </PageSubtitle>
          </div>
          <HeaderActions>
            <Button $variant="primary" onClick={openCreateModal} disabled={isLoading}>
              Nuevo requerimiento
            </Button>
          </HeaderActions>
        </PageHeader>

        {errorMessage && <ErrorBanner>{errorMessage}</ErrorBanner>}

        <StatsGrid>
          <StatCard $color={COLORS.primary}>
            <StatValue $color={COLORS.primary}>{requirements.length}</StatValue>
            <StatLabel>Total de Requerimientos</StatLabel>
          </StatCard>
          <StatCard $color={COLORS.danger}>
            <StatValue $color={COLORS.danger}>{totalCriticas}</StatValue>
            <StatLabel>Prioridad Critica</StatLabel>
          </StatCard>
          <StatCard $color={COLORS.success}>
            <StatValue $color={COLORS.success}>{areas.length - 1}</StatValue>
            <StatLabel>Areas Administradas</StatLabel>
          </StatCard>
        </StatsGrid>

        <FiltersCard>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Buscar</FilterLabel>
              <Input
                placeholder="Codigo, nombre o area"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Area</FilterLabel>
              <Select
                value={areaFilter}
                onChange={(event) => setAreaFilter(event.target.value)}
              >
                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area === 'todas' ? 'Todas las areas' : area}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </FiltersGrid>
        </FiltersCard>

        {isLoading ? (
          <LoadingText>Cargando requerimientos...</LoadingText>
        ) : (
          <ResultsCount>
            Mostrando {filteredRequirements.length} requerimientos funcionales.
          </ResultsCount>
        )}

        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>Codigo</Th>
                <Th>Nombre</Th>
                <Th>Area</Th>
                <Th>Prioridad</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRequirements.map((item) => (
                <Tr key={item.code}>
                  <Td>{item.code}</Td>
                  <Td>{item.name}</Td>
                  <Td>{item.area}</Td>
                  <Td>
                    <StatusBadge variant={getPriorityVariant(item.priority)}>
                      {item.priority}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <StatusBadge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ButtonGroup>
                      <ActionButton
                        $variant="edit"
                        onClick={() => openEditModal(item)}
                        disabled={isSaving}
                      >
                        Editar
                      </ActionButton>
                      <ActionButton
                        $variant="delete"
                        onClick={() => handleDelete(item.code)}
                        disabled={isSaving}
                      >
                        Eliminar
                      </ActionButton>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {!isLoading && filteredRequirements.length === 0 && (
            <EmptyState>
              <EmptyIcon>📌</EmptyIcon>
              <EmptyTitle>Sin resultados</EmptyTitle>
              <EmptyText>No hay requerimientos con los filtros actuales.</EmptyText>
            </EmptyState>
          )}
        </TableContainer>
      </Container>

      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingCode ? 'Editar requerimiento' : 'Nuevo requerimiento'}
              </ModalTitle>
              <Button $variant="outline" onClick={closeModal} disabled={isSaving}>
                Cerrar
              </Button>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>
                  Codigo <RequiredMark>*</RequiredMark>
                </Label>
                <Input
                  value={formData.code}
                  onChange={(event) => handleInputChange('code', event.target.value)}
                  placeholder="RF-SUP-016"
                  $hasError={Boolean(formErrors.code)}
                  disabled={isSaving}
                />
                {formErrors.code && (
                  <ValidationMessage $type="error">{formErrors.code}</ValidationMessage>
                )}
              </FormGroup>
              <FormGroup>
                <Label>
                  Nombre <RequiredMark>*</RequiredMark>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(event) => handleInputChange('name', event.target.value)}
                  placeholder="Descripcion del requerimiento"
                  $hasError={Boolean(formErrors.name)}
                  disabled={isSaving}
                />
                {formErrors.name && (
                  <ValidationMessage $type="error">{formErrors.name}</ValidationMessage>
                )}
              </FormGroup>
              <FormGroup>
                <Label>
                  Area <RequiredMark>*</RequiredMark>
                </Label>
                <Input
                  value={formData.area}
                  onChange={(event) => handleInputChange('area', event.target.value)}
                  placeholder="Gestion de Tiendas"
                  $hasError={Boolean(formErrors.area)}
                  disabled={isSaving}
                />
                {formErrors.area && (
                  <ValidationMessage $type="error">{formErrors.area}</ValidationMessage>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Prioridad</Label>
                <Select
                  value={formData.priority}
                  onChange={(event) => handleInputChange('priority', event.target.value)}
                  disabled={isSaving}
                >
                  <option value="Critica">Critica</option>
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Estado</Label>
                <Select
                  value={formData.status}
                  onChange={(event) => handleInputChange('status', event.target.value)}
                  disabled={isSaving}
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Actualizado">Actualizado</option>
                </Select>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <ButtonGroup>
                <Button $variant="secondary" onClick={closeModal} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button $variant="primary" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </ButtonGroup>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Layout>
  );
};

export default RequerimientosSuperadmin;
