import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useAuth } from '../../auth/context/AuthContext';
import { useUsers } from '../context/UsersContext';
import NuevoRolModal from '../components/NuevoRolModal';
import EditarRolModal from '../components/EditarRolModal';
import type { Rol } from '@monorepo/shared-types';
import { TYPOGRAPHY, COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '../../../styles/theme';
import {
  Button,
  ActionButton,
  Input,
  Select,
  StatusBadge,
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
  EmptyState,
  EmptyTitle,
  EmptyText
} from '../../../components/shared';

// ============================================================================
// INTERFACES
// ============================================================================

interface RoleFormData {
  nombreRol: string;
  descripcion?: string;
  permisos: string[];
}

interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  system: number;
  custom: number;
  totalUsers: number;
  usersWithoutRole: number;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  padding: 1rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
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

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled(Input)`
  min-width: 250px;
`;

const FilterSelect = styled(Select)`
  min-width: 150px;
`;

const PermissionCount = styled.span`
  background: ${COLORS.infoBg};
  color: ${COLORS.infoText};
  padding: 0.25rem 0.75rem;
  border-radius: ${BORDER_RADIUS.large};
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const TypeBadge = styled.span<{ $isSystem?: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${BORDER_RADIUS.large};
  font-size: ${TYPOGRAPHY.fontSize.small};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  font-family: ${TYPOGRAPHY.fontFamily};
  ${props => props.$isSystem
    ? `background: ${COLORS.infoBg}; color: ${COLORS.infoText};`
    : `background: ${COLORS.warningBg}; color: ${COLORS.warningText};`
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: ${TYPOGRAPHY.fontSize.body};
  color: ${COLORS.textLight};
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const DeleteConfirmModal = styled.div`
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

const DeleteConfirmContent = styled.div`
  background: ${COLORS.white};
  border-radius: ${BORDER_RADIUS.large};
  padding: ${SPACING.xl};
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const DeleteConfirmTitle = styled.h3`
  margin: 0 0 ${SPACING.md} 0;
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const DeleteConfirmMessage = styled.p`
  margin: 0 0 ${SPACING.xl} 0;
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.body};
  line-height: 1.5;
`;

const DeleteConfirmActions = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
`;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ListaRoles: React.FC = () => {
  const { hasPermission } = useAuth();
  const { roles, loading, loadRoles, addRole, updateRole, changeRoleStatus } = useUsers();

  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<'all' | 'system' | 'custom'>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Rol | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Rol | null>(null);

  // Permisos
  const canCreate = hasPermission('users.create');
  const canUpdate = hasPermission('users.update');

  // Cargar roles al montar (el Context ya lo hace en useEffect, esto es redundante pero por si acaso)
  useEffect(() => {
    if (!roles || roles.length === 0) {
      loadRoles();
    }
  }, []);

  // Filtrado de roles
  const filteredRoles = useMemo(() => {
    return (roles || []).filter(role => {
      // Filtro de búsqueda
      const matchesSearch =
        role.nombreRol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.descripcion && role.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtro de estado (activo es boolean en el tipo Rol)
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && role.activo) ||
        (filterStatus === 'inactive' && !role.activo);

      // Filtro de tipo
      const matchesType =
        filterType === 'all' ||
        (filterType === 'system' && role.esSistema) ||
        (filterType === 'custom' && !role.esSistema);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [roles, searchTerm, filterStatus, filterType]);

  // Calcular estadísticas desde roles
  const stats = useMemo(() => {
    const total = roles?.length || 0;
    const active = (roles || []).filter(r => r.activo).length;
    const inactive = total - active;
    
    const system = (roles || []).filter(r => r.esSistema).length;
    const custom = total - system;
    const totalUsers = (roles || []).reduce((sum, r) => sum + (r.cantidadUsuarios || 0), 0);

    return {
      total,
      active,
      inactive,
      system,
      custom,
      totalUsers,
      usersWithoutRole: 0
    };
  }, [roles]);

  // Handlers
  const handleCreateRole = async (roleData: RoleFormData) => {
    try {
      await addRole(roleData);
      setShowNewModal(false);
    } catch (error: any) {
      // El error ya fue mostrado por el Context
      throw error;
    }
  };

  const handleEditRole = async (roleId: string, roleData: Partial<RoleFormData>) => {
    try {
      await updateRole(roleId, roleData);
      setShowEditModal(false);
      setSelectedRole(null);
    } catch (error: any) {
      // El error ya fue mostrado por el Context
      throw error;
    }
  };

  const handleDeleteClick = (role: Rol) => {
    setRoleToDelete(role);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    try {
      await changeRoleStatus(roleToDelete.id, false);
    } catch (error) {
      // Error already shown by context
    } finally {
      setIsDeleteConfirmOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setRoleToDelete(null);
  };

  const handleActivateRole = async (role: Rol) => {
    try {
      await changeRoleStatus(role.id, true);
    } catch (error) {
      // Error already shown by context
    }
  };

  const openEditModal = (role: Rol) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Layout title="Gestión de Roles">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Gestión de Roles</PageTitle>
            <PageSubtitle>Administra los roles del sistema y sus permisos de acceso</PageSubtitle>
          </div>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <FilterSelect value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </FilterSelect>
            <FilterSelect value={filterType} onChange={e => setFilterType(e.target.value as any)}>
              <option value="all">Todos los tipos</option>
              <option value="system">Sistema</option>
              <option value="custom">Personalizados</option>
            </FilterSelect>
            {canCreate && (
              <Button $variant="primary" onClick={() => setShowNewModal(true)}>
                + Nuevo Rol
              </Button>
            )}
          </SearchContainer>
        </PageHeader>

        {/* Estadísticas */}
        {stats && (
          <StatsGrid>
            <StatCard $color="#3498db">
              <StatValue $color="#3498db">{stats.total}</StatValue>
              <StatLabel>Total de Roles</StatLabel>
            </StatCard>
            <StatCard $color="#28a745">
              <StatValue $color="#28a745">{stats.active}</StatValue>
              <StatLabel>Roles Activos</StatLabel>
            </StatCard>
            <StatCard $color="#17a2b8">
              <StatValue $color="#17a2b8">{stats.system}</StatValue>
              <StatLabel>Roles del Sistema</StatLabel>
            </StatCard>
            <StatCard $color="#f0ad4e">
              <StatValue $color="#f0ad4e">{stats.totalUsers}</StatValue>
              <StatLabel>Usuarios Asignados</StatLabel>
            </StatCard>
            <StatCard $color="#dc3545">
              <StatValue $color="#dc3545">{stats.usersWithoutRole}</StatValue>
              <StatLabel>Sin Rol Asignado</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        {/* Tabla de roles */}
        {loading ? (
          <LoadingSpinner>Cargando roles...</LoadingSpinner>
        ) : filteredRoles.length === 0 ? (
          <TableContainer>
            <EmptyState>
              <EmptyTitle>No se encontraron roles</EmptyTitle>
              <EmptyText>
                {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                  ? 'No hay roles que coincidan con los filtros aplicados.'
                  : 'Aún no se han creado roles en el sistema.'}
              </EmptyText>
              {canCreate && (
                <Button $variant="primary" onClick={() => setShowNewModal(true)}>
                  + Crear Primer Rol
                </Button>
              )}
            </EmptyState>
          </TableContainer>
        ) : (
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Tipo</Th>
                  <Th>Descripción</Th>
                  <Th>Permisos</Th>
                  <Th>Usuarios</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRoles.map(role => (
                  <Tr key={role.id}>
                    <Td>
                      <strong>{role.nombreRol}</strong>
                    </Td>
                    <Td>
                      <TypeBadge $isSystem={role.esSistema}>
                        {role.esSistema ? 'Sistema' : 'Personalizado'}
                      </TypeBadge>
                    </Td>
                    <Td>{role.descripcion || 'Sin descripción'}</Td>
                    <Td>
                      <PermissionCount>
                        {role.esSistema && role.permisos.length === 0
                          ? 'Acceso total'
                          : `${role.permisos.length} permisos`}
                      </PermissionCount>
                    </Td>
                    <Td>{role.cantidadUsuarios || 0} usuarios</Td>
                    <Td>
                      <StatusBadge variant={role.activo ? 'success' : 'danger'} dot>
                        {role.activo ? 'Activo' : 'Inactivo'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      {canUpdate && (
                        <>
                          <ActionButton
                            $variant="edit"
                            onClick={() => openEditModal(role)}
                          >
                            Editar
                          </ActionButton>
                          {role.activo ? (
                            !role.esSistema && (
                              <ActionButton
                                $variant="delete"
                                onClick={() => handleDeleteClick(role)}
                              >
                                Eliminar
                              </ActionButton>
                            )
                          ) : (
                            <ActionButton
                              $variant="activate"
                              onClick={() => handleActivateRole(role)}
                            >
                              Activar
                            </ActionButton>
                          )}
                        </>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Modales */}
        {showNewModal && (
          <NuevoRolModal
            onClose={() => setShowNewModal(false)}
            onSubmit={(data: any) => handleCreateRole({ nombreRol: data.name, descripcion: data.description, permisos: data.permissions })}
          />
        )}

        {showEditModal && selectedRole && (
          <EditarRolModal
            role={selectedRole ? { id: selectedRole.id, name: selectedRole.nombreRol, description: selectedRole.descripcion || '', permissions: selectedRole.permisos || [], isActive: selectedRole.activo, isSystem: selectedRole.esSistema || false } : undefined}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRole(null);
            }}
            onSubmit={(data: any) => handleEditRole(selectedRole!.id, { nombreRol: data.name, descripcion: data.description, permisos: data.permissions })}
          />
        )}

        {/* Modal de Confirmación de Eliminación */}
        {isDeleteConfirmOpen && roleToDelete && (
          <DeleteConfirmModal onClick={handleCancelDelete}>
            <DeleteConfirmContent onClick={(e) => e.stopPropagation()}>
              <DeleteConfirmTitle>¿Eliminar Rol?</DeleteConfirmTitle>
              <DeleteConfirmMessage>
                ¿Estás seguro de que deseas eliminar el rol{' '}
                <strong>{roleToDelete.nombreRol}</strong>?
                Esta acción marcará el rol como inactivo.
              </DeleteConfirmMessage>
              <DeleteConfirmActions>
                <Button $variant="secondary" onClick={handleCancelDelete}>
                  Cancelar
                </Button>
                <ActionButton $variant="delete" onClick={handleConfirmDelete}>
                  Eliminar
                </ActionButton>
              </DeleteConfirmActions>
            </DeleteConfirmContent>
          </DeleteConfirmModal>
        )}
      </Container>
    </Layout>
  );
};

export default ListaRoles;
