import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import configuracionApi from '../services/configuracionApi';
import type { CatalogItem } from '../services/configuracionApi';
import CatalogModal from './CatalogModal';
import type { CatalogConfig } from './CatalogModal';
import { useNotification } from '../../../context/NotificationContext';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import {
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  StatusBadge
} from '../../../components/shared';

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin: 0;
`;

const FiltersCard = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  padding: ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.md};
  margin-bottom: ${SPACING.lg};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FilterLabel = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text.primary};
`;

const FilterSelect = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  background: ${COLORS.neutral.white};
  color: ${COLORS.text.primary};
  transition: ${TRANSITIONS.default};

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }
`;

const FilterInput = styled(Input)`
  padding: ${SPACING.sm} ${SPACING.md};
`;

const FilterButtonsRow = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
`;

const TableCard = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${SPACING.sm};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: ${SPACING.xs} ${SPACING.sm};
  border: none;
  border-radius: ${BORDER_RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  cursor: pointer;
  transition: ${TRANSITIONS.default};
  background-color: ${props => props.$variant === 'danger' ? COLOR_SCALES.danger[500] : COLOR_SCALES.primary[500]};
  color: ${COLORS.neutral.white};

  &:hover {
    opacity: 0.8;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING['2xl']};
  color: ${COLORS.text.secondary};
`;

const LoadingState = styled(EmptyState)`
  color: ${COLOR_SCALES.primary[500]};
`;

const ColorSwatch = styled.div<{ $color: string }>`
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: ${BORDER_RADIUS.sm};
  background-color: ${props => props.$color};
  border: 1px solid ${COLORS.neutral[300]};
  vertical-align: middle;
  margin-right: ${SPACING.xs};
`;

interface CatalogTableProps {
  config: CatalogConfig;
}

const CatalogTable: React.FC<CatalogTableProps> = ({ config }) => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | undefined>();
  const { showSuccess, showError } = useNotification();

  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('activo');

  const fetchItems = async (status?: string, search?: string) => {
    try {
      setLoading(true);
      const data = await configuracionApi.getCatalogItems(config.catalogType);
      const statusToUse = status !== undefined ? status : filterStatus;
      const searchToUse = search !== undefined ? search : filterSearch;

      let filtered = data;
      if (statusToUse === 'activo') filtered = filtered.filter(i => i.estado);
      else if (statusToUse === 'inactivo') filtered = filtered.filter(i => !i.estado);

      setItems(data);
      applyFilters(filtered, searchToUse);
    } catch (error: any) {
      showError(error.message || `Error al cargar ${config.label.toLowerCase()}s`);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: CatalogItem[], search: string) => {
    let filtered = data;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = data.filter(item =>
        item.codigo.toLowerCase().includes(searchLower) ||
        (item.nombre && item.nombre.toLowerCase().includes(searchLower)) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(searchLower))
      );
    }
    setFilteredItems(filtered);
  };

  useEffect(() => {
    fetchItems('activo', '');
  }, [config.catalogType]);

  const handleSearch = () => fetchItems(filterStatus, filterSearch);

  const handleClearFilters = () => {
    setFilterSearch('');
    setFilterStatus('activo');
    fetchItems('activo', '');
  };

  const handleCreate = () => {
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: CatalogItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`¿Está seguro de desactivar este ${config.label.toLowerCase()}?`)) return;
    try {
      await configuracionApi.deleteCatalogItem(config.catalogType, id);
      showSuccess(`${config.label} desactivado correctamente`);
      fetchItems();
    } catch (error: any) {
      showError(error.message || `Error al desactivar ${config.label.toLowerCase()}`);
    }
  };

  const handleActivate = async (id: number) => {
    if (!window.confirm(`¿Está seguro de activar este ${config.label.toLowerCase()}?`)) return;
    try {
      await configuracionApi.activateCatalogItem(config.catalogType, id);
      showSuccess(`${config.label} activado correctamente`);
      fetchItems();
    } catch (error: any) {
      showError(error.message || `Error al activar ${config.label.toLowerCase()}`);
    }
  };

  const handleModalClose = (saved: boolean) => {
    setIsModalOpen(false);
    setSelectedItem(undefined);
    if (saved) fetchItems();
  };

  const extraColumns = [];
  if (config.fields.nombre) extraColumns.push('Nombre');
  if (config.fields.descripcion) extraColumns.push('Descripción');
  if (config.fields.codigoHex) extraColumns.push('Color');
  if (config.fields.logoUrl) extraColumns.push('Logo');
  if (config.fields.ordenVisualizacion) extraColumns.push('Orden');

  return (
    <Container>
      <Header>
        <div>
          <Title>{config.label}s</Title>
          <Subtitle>Gestiona los {config.label.toLowerCase()}s disponibles para tus productos</Subtitle>
        </div>
        <Button $variant="primary" onClick={handleCreate}>+ Nuevo {config.label}</Button>
      </Header>

      <FiltersCard>
        <FiltersGrid>
          <FilterGroup>
            <FilterLabel>Buscar</FilterLabel>
            <FilterInput
              type="text"
              placeholder="Código o nombre..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Estado</FilterLabel>
            <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="todos">Todos</option>
            </FilterSelect>
          </FilterGroup>
        </FiltersGrid>
        <FilterButtonsRow>
          <Button $variant="secondary" onClick={handleClearFilters}>Limpiar</Button>
          <Button $variant="primary" onClick={handleSearch}>Buscar</Button>
        </FilterButtonsRow>
      </FiltersCard>

      {loading ? (
        <LoadingState>Cargando {config.label.toLowerCase()}s...</LoadingState>
      ) : filteredItems.length === 0 ? (
        <EmptyState>
          {filterSearch ? `No se encontraron ${config.label.toLowerCase()}s` : `No hay ${config.label.toLowerCase()}s registrados`}
        </EmptyState>
      ) : (
        <TableCard>
          <Table>
            <Thead>
              <Tr>
                <Th>Código</Th>
                {extraColumns.map(col => <Th key={col}>{col}</Th>)}
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredItems.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.codigo}</Td>
                  {config.fields.nombre && <Td>{item.nombre || '-'}</Td>}
                  {config.fields.descripcion && <Td>{item.descripcion || '-'}</Td>}
                  {config.fields.codigoHex && (
                    <Td>
                      {item.codigoHex ? (
                        <>
                          <ColorSwatch $color={item.codigoHex.startsWith('#') ? item.codigoHex : `#${item.codigoHex}`} />
                          {item.codigoHex}
                        </>
                      ) : '-'}
                    </Td>
                  )}
                  {config.fields.logoUrl && (
                    <Td>
                      {item.logoUrl ? (
                        <a href={item.logoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>
                          Ver logo
                        </a>
                      ) : '-'}
                    </Td>
                  )}
                  {config.fields.ordenVisualizacion && <Td>{item.ordenVisualizacion ?? '-'}</Td>}
                  <Td>
                    <StatusBadge variant={item.estado ? 'success' : 'danger'} dot>
                      {item.estado ? 'Activo' : 'Inactivo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButtons>
                      <ActionButton onClick={() => handleEdit(item)}>Editar</ActionButton>
                      {item.estado ? (
                        <ActionButton $variant="danger" onClick={() => handleDelete(item.id)}>
                          Desactivar
                        </ActionButton>
                      ) : (
                        <ActionButton onClick={() => handleActivate(item.id)}>
                          Activar
                        </ActionButton>
                      )}
                    </ActionButtons>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableCard>
      )}

      {isModalOpen && (
        <CatalogModal
          config={config}
          item={selectedItem}
          onClose={handleModalClose}
        />
      )}
    </Container>
  );
};

export default CatalogTable;
