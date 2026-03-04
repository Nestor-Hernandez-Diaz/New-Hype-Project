import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { 
  fetchUsuarios, 
  fetchEstadisticas, 
  cambiarEstadoUsuario,
  type UsuarioSistema,
  type EstadisticasUsuarios 
} from '../services/usuariosApi';
import { Button, ActionButton, StatusBadge } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../../styles/theme';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${SPACING.xl};
  margin-bottom: ${SPACING['2xl']};
`;

const StatCard = styled.div`
  background: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  padding: ${SPACING.xl};
  box-shadow: ${SHADOWS.sm};
`;

const StatLabel = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textLight};
  margin-bottom: ${SPACING.sm};
`;

const StatValue = styled.div`
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
`;

const Filters = styled.div`
  background: ${COLORS.surface};
  border: 1px solid ${COLORS.border};
  border-radius: 12px;
  padding: ${SPACING.xl};
  margin-bottom: ${SPACING.xl};
  display: flex;
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Label = styled.label`
  display: block;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
  margin-bottom: ${SPACING.sm};
`;

const Select = styled.select`
  width: 100%;
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.border};
  border-radius: 6px;
  font-size: ${TYPOGRAPHY.fontSize.base};
  color: ${COLORS.text};
  background: ${COLORS.surface};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${COLORS.superadmin};
  }
`;

const Table = styled.table`
  width: 100%;
  background: ${COLORS.surface};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: ${SHADOWS.sm};
`;

const Thead = styled.thead`
  background: ${COLORS.surfaceHover};
`;

const Th = styled.th`
  padding: ${SPACING.lg};
  text-align: left;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-top: 1px solid ${COLORS.border};
  
  &:hover {
    background: ${COLORS.surfaceHover};
  }
`;

const Td = styled.td`
  padding: ${SPACING.lg};
  color: ${COLORS.text};
`;

const RolBadge = styled.span<{ $rol: string }>`
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: 12px;
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  text-transform: capitalize;
  
  ${props => {
    switch (props.$rol) {
      case 'admin':
        return `background: ${COLORS.superadminLight}; color: ${COLORS.superadminDark};`;
      case 'vendedor':
        return `background: ${COLORS.infoLight}; color: ${COLORS.info};`;
      case 'almacenero':
        return `background: ${COLORS.warningLight}; color: ${COLORS.warning};`;
      default:
        return `background: ${COLORS.border}; color: ${COLORS.textLight};`;
    }
  }}
`;

const GestionUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioSistema[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<UsuarioSistema[]>([]);
  const [stats, setStats] = useState<EstadisticasUsuarios | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroRol, setFiltroRol] = useState<string>('todos');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [usuarios, filtroEstado, filtroRol]);

  const loadData = async () => {
    setIsLoading(true);
    const [usuariosData, statsData] = await Promise.all([
      fetchUsuarios(),
      fetchEstadisticas(),
    ]);
    setUsuarios(usuariosData);
    setStats(statsData);
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...usuarios];

    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(u => u.estado === filtroEstado);
    }

    if (filtroRol !== 'todos') {
      filtered = filtered.filter(u => u.rol === filtroRol);
    }

    setFilteredUsuarios(filtered);
  };

  const handleCambiarEstado = async (id: string, estado: 'activo' | 'inactivo' | 'suspendido') => {
    await cambiarEstadoUsuario(id, estado);
    loadData();
  };

  return (
    <Layout title="Usuarios del Sistema">
      <PageHeader>
        <Button $variant="primary" onClick={() => alert('Crear usuario (próximamente)')}>
          + Nuevo Usuario
        </Button>
      </PageHeader>

      {stats && (
          <StatsGrid>
            <StatCard>
              <StatLabel>Total Usuarios</StatLabel>
              <StatValue>{stats.totalUsuarios}</StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>Usuarios Activos</StatLabel>
              <StatValue>{stats.usuariosActivos}</StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>Administradores</StatLabel>
              <StatValue>{stats.usuariosPorRol.admin}</StatValue>
            </StatCard>

            <StatCard>
              <StatLabel>Vendedores</StatLabel>
              <StatValue>{stats.usuariosPorRol.vendedor}</StatValue>
            </StatCard>
          </StatsGrid>
        )}

        <Filters>
          <FilterGroup>
            <Label>Estado</Label>
            <Select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="suspendido">Suspendidos</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Rol</Label>
            <Select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="admin">Administrador</option>
              <option value="vendedor">Vendedor</option>
              <option value="almacenero">Almacenero</option>
            </Select>
          </FilterGroup>
        </Filters>

        {isLoading ? (
          <div>Cargando...</div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Usuario</Th>
                <Th>Sucursal</Th>
                <Th>Rol</Th>
                <Th>Último Acceso</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsuarios.map(usuario => (
                <Tr key={usuario.id}>
                  <Td>
                    <div style={{ fontWeight: 600 }}>
                      {usuario.nombre} {usuario.apellido}
                    </div>
                    <div style={{ fontSize: '12px', color: COLORS.textLight }}>
                      {usuario.email}
                    </div>
                  </Td>
                  <Td>{usuario.sucursalNombre}</Td>
                  <Td>
                    <RolBadge $rol={usuario.rol}>{usuario.rol}</RolBadge>
                  </Td>
                  <Td>
                    {usuario.ultimoAcceso 
                      ? new Date(usuario.ultimoAcceso).toLocaleDateString('es-PE')
                      : 'Nunca'
                    }
                  </Td>
                  <Td>
                    <StatusBadge $status={usuario.estado}>{usuario.estado}</StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton 
                      $variant="view"
                      onClick={() => alert(`Ver usuario ${usuario.nombre}`)}
                    >
                      Ver
                    </ActionButton>
                    {' '}
                    {usuario.estado === 'activo' ? (
                      <ActionButton 
                        $variant="deactivate"
                        onClick={() => handleCambiarEstado(usuario.id, 'inactivo')}
                      >
                        Desactivar
                      </ActionButton>
                    ) : (
                      <ActionButton 
                        $variant="activate"
                        onClick={() => handleCambiarEstado(usuario.id, 'activo')}
                      >
                        Activar
                      </ActionButton>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
    </Layout>
  );
};

export default GestionUsuarios;
