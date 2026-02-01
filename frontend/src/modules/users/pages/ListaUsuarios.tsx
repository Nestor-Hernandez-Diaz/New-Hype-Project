import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useAuth } from '../../auth/context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { useUsers } from '../context/UsersContext';
import NuevoUsuarioModal from '../components/NuevoUsuarioModal';
import EditarUsuarioModal from '../components/EditarUsuarioModal';
import type { Usuario } from '@monorepo/shared-types';

// ============================================================================
// IMPORTS DEL SISTEMA DE DISEÑO UNIFICADO
// ============================================================================
import { TYPOGRAPHY, COLORS, BORDER_RADIUS, SPACING } from '../../../styles/theme';
import { 
  StatusBadge, 
  Button, 
  ActionButton,
  Input,
  Select,
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
  PaginationContainer,
  PaginationInfo,
  PaginationButtons,
  PageButton,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText,
  ButtonGroup
} from '../../../components/shared';

// ============================================================================
// INTERFACES
// ============================================================================

interface Role {
  id: string;
  codigoRol: string;
  nombreRol: string;
  descripcion?: string;
  permisos: string[];
  activo: boolean;
}

interface UserFormData {
  usuario: string;
  email: string;
  nombres: string;
  apellidos: string;
  password?: string;
  activo: boolean;
  rolId: string;
}

// ============================================================================
// STYLED COMPONENTS (Solo los específicos de esta página)
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

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${BORDER_RADIUS.round};
  background: ${COLORS.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${COLORS.white};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  margin-right: 0.75rem;
  font-family: ${TYPOGRAPHY.fontFamily};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserName = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
`;

const UserEmail = styled.div`
  font-family: ${TYPOGRAPHY.fontFamily};
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.textLight};
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
  font-family: ${TYPOGRAPHY.fontFamily};
  color: ${COLORS.textLight};
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
  font-size: ${TYPOGRAPHY.fontSize.large};
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

const ListaUsuarios: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showError, showInfo } = useNotification();
  
  // ✅ USAR CONTEXT EN LUGAR DE apiService
  const { 
    users: usuarios, 
    loading, 
    pagination,
    loadUsers, 
    addUser, 
    updateUser, 
    deleteUser, 
    changeUserStatus 
  } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('activo');
  const [isNuevoUsuarioModalOpen, setIsNuevoUsuarioModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Resetear a página 1 cuando cambian los filtros de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    loadUsers({
      page: currentPage,
      limit: pageSize,
      q: searchTerm || undefined,
      estadoUsuario: statusFilter === 'activo' ? 'ACTIVO' : statusFilter === 'inactivo' ? 'INACTIVO' : undefined
    });
  }, [currentPage, pageSize, searchTerm, statusFilter, loadUsers]);

  // Funciones de paginación
  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };



  const filteredUsers = usuarios || []; // Los filtros se aplican en el backend

  const stats = useMemo(() => {
    const totalUsers = pagination?.total || 0;
    const activeUsers = (usuarios || []).filter(user => user.activo).length;
    const inactiveUsers = (usuarios || []).filter(user => !user.activo).length;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers
    };
  }, [usuarios, pagination]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  };

  const formatLastAccess = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-PE');
  };

  const handleEditUser = (userId: string) => {
    const user = usuarios.find(u => u.id === userId);
    if (user) {
      console.log('✏️ [ListaUsuarios] Editing user:', {
        id: user.id,
        usuario: user.usuario,
        rolId: user.rolId,
        hasRole: !!user.rol,
        roleName: user.rol?.nombreRol
      });
      setSelectedUser(user);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveUser = async (userData: UserFormData) => {
    try {
      if (selectedUser) {
        console.log('💾 [ListaUsuarios] Updating user:', selectedUser.id, userData);
        await updateUser(selectedUser.id, {
          usuario: userData.usuario,
          email: userData.email,
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          activo: userData.activo,
          rolId: userData.rolId
        });
        showInfo('Usuario actualizado exitosamente');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Error al actualizar el usuario');
    } finally {
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteClick = (user: Usuario) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      showInfo('Usuario eliminado exitosamente');
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      showError('No se pudo eliminar el usuario');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await changeUserStatus(userId, true);
      showInfo('Usuario activado exitosamente');
    } catch (error) {
      console.error('Error activating user:', error);
      showError('No se pudo activar el usuario');
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      if (!userData.rolId) {
        throw new Error('Debe seleccionar un rol para el usuario');
      }
      
      await addUser({
        usuario: userData.usuario,
        email: userData.email,
        password: userData.password,
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        activo: userData.activo !== undefined ? userData.activo : true,
        rolId: userData.rolId
      });
      
      showInfo('Usuario creado exitosamente');
      setIsNuevoUsuarioModalOpen(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      showError(error.message || 'Error al crear el usuario');
    }
  };

  const handleOpenCreateModal = () => {
    setIsNuevoUsuarioModalOpen(true);
  };

  const handleCloseNuevoUsuarioModal = () => {
    setIsNuevoUsuarioModalOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  return (
    <Layout title="Lista de Usuarios">
      <Container>
        <PageHeader>
          <div>
            <PageTitle>Lista de Usuarios</PageTitle>
            <PageSubtitle>Gestión de usuarios del sistema, roles y permisos de acceso</PageSubtitle>
          </div>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Buscar por nombre, usuario o email..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            />
            <FilterSelect
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </FilterSelect>
            {(searchTerm || statusFilter) && (
              <Button $variant="secondary" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
            <Button $variant="primary" onClick={handleOpenCreateModal}>
              Nuevo Usuario
            </Button>
          </SearchContainer>
        </PageHeader>

        {loading ? (
          <LoadingContainer>Cargando usuarios...</LoadingContainer>
        ) : (
          <StatsGrid>
            <StatCard $color="#3498db">
              <StatValue $color="#3498db">{stats.totalUsers}</StatValue>
              <StatLabel>Total de Usuarios</StatLabel>
            </StatCard>
            <StatCard $color="#28a745">
              <StatValue $color="#28a745">{stats.activeUsers}</StatValue>
              <StatLabel>Usuarios Activos</StatLabel>
            </StatCard>
            <StatCard $color="#dc3545">
              <StatValue $color="#dc3545">{stats.inactiveUsers}</StatValue>
              <StatLabel>Usuarios Inactivos</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        <TableContainer>
          {filteredUsers.length === 0 ? (
            <EmptyState>
              <EmptyIcon>👥</EmptyIcon>
              <EmptyTitle>No se encontraron usuarios</EmptyTitle>
              <EmptyText>
                {(usuarios || []).length === 0 
                  ? 'Aún no se han registrado usuarios en el sistema.'
                  : 'No hay usuarios que coincidan con los filtros aplicados.'
                }
              </EmptyText>
            </EmptyState>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Usuario</Th>
                  <Th>Estado</Th>
                  <Th>Último Acceso</Th>
                  <Th>Acciones</Th>
                </tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <UserInfo>
                        <UserAvatar>
                          {getInitials(user.nombres, user.apellidos)}
                        </UserAvatar>
                        <div>
                          <UserName>{user.nombres} {user.apellidos}</UserName>
                          <UserEmail>{user.email}</UserEmail>
                          <UserEmail>@{user.usuario}</UserEmail>
                        </div>
                      </UserInfo>
                    </Td>
                    <Td>
                      <StatusBadge 
                        variant={user.activo ? 'success' : 'danger'} 
                        dot
                      >
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      {formatLastAccess(user.ultimoAcceso)}
                    </Td>
                    <Td>
                      <ButtonGroup>
                        <ActionButton 
                          $variant="edit"
                          onClick={() => handleEditUser(user.id)}
                        >
                          Editar
                        </ActionButton>
                        {user.id !== currentUser?.id && (
                          user.activo ? (
                            <ActionButton 
                              $variant="delete"
                              onClick={() => handleDeleteClick(user)}
                            >
                              Eliminar
                            </ActionButton>
                          ) : (
                            <ActionButton 
                              $variant="activate"
                              onClick={() => handleActivateUser(user.id)}
                            >
                              Activar
                            </ActionButton>
                          )
                        )}
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
          
          {/* Controles de paginación */}
          {filteredUsers.length > 0 && pagination && (
            <PaginationContainer>
              <PaginationInfo>
                Mostrando {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, pagination.total)} de {pagination.total} resultados
              </PaginationInfo>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
                <Select
                  value={pageSize}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePageSizeChange(Number(e.target.value))}
                  style={{ width: 'auto' }}
                >
                  <option value={5}>5 por página</option>
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </Select>
                
                <div style={{ display: 'flex', gap: SPACING.xs }}>
                  <PageButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </PageButton>
                  
                  {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage <= 2) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 1) {
                      pageNum = pagination.totalPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }
                    return (
                      <PageButton
                        key={pageNum}
                        $active={currentPage === pageNum}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </PageButton>
                    );
                  })}
                  
                  <PageButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages || pagination.totalPages === 0}
                  >
                    Siguiente
                  </PageButton>
                </div>
              </div>
            </PaginationContainer>
          )}
        </TableContainer>
      </Container>
      
      <NuevoUsuarioModal
        isOpen={isNuevoUsuarioModalOpen}
        onClose={handleCloseNuevoUsuarioModal}
        onSave={handleCreateUser}
      />
      
      <EditarUsuarioModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      {isDeleteConfirmOpen && (
        <DeleteConfirmModal onClick={handleCancelDelete}>
          <DeleteConfirmContent onClick={(e) => e.stopPropagation()}>
            <DeleteConfirmTitle>Confirmar Eliminación</DeleteConfirmTitle>
            <DeleteConfirmMessage>
              ¿Está seguro que desea eliminar al usuario {userToDelete?.usuario}?
              Esta acción desactivará el usuario.
            </DeleteConfirmMessage>
            <DeleteConfirmActions>
              <ActionButton $variant="secondary" onClick={handleCancelDelete}>
                Cancelar
              </ActionButton>
              <ActionButton $variant="delete" onClick={handleConfirmDelete}>
                Eliminar
              </ActionButton>
            </DeleteConfirmActions>
          </DeleteConfirmContent>
        </DeleteConfirmModal>
      )}
    </Layout>
  );
};

export default ListaUsuarios;