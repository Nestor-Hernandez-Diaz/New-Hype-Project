import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import {
  fetchSucursales,
  cambiarEstadoSucursal,
  crearSucursal,
  actualizarSucursal,
  type Sucursal,
} from '../services/sucursalesApi';
import { crearUsuario } from '../../usuarios/services/usuariosApi';
import { Button, ActionButton, StatusBadge } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../../styles/theme';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
`;

const PlanBadge = styled.span<{ $plan: string }>`
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: 12px;
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  background: ${props => props.$plan === 'anual' ? COLORS.superadminLight : COLORS.infoLight};
  color: ${props => props.$plan === 'anual' ? COLORS.superadminDark : COLORS.info};
  text-transform: uppercase;
`;

const CreateButton = styled(Button)`
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 900px;
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

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();

const splitOwnerName = (fullName: string): { nombre: string; apellido: string } => {
  const cleaned = fullName.trim();
  if (!cleaned) {
    return { nombre: 'Sin', apellido: 'Nombre' };
  }

  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) {
    return { nombre: parts[0], apellido: 'Propietario' };
  }

  return {
    nombre: parts[0],
    apellido: parts.slice(1).join(' '),
  };
};

const getVencimientoByPlan = (plan: 'mensual' | 'anual'): string => {
  const fecha = new Date();
  if (plan === 'anual') {
    fecha.setFullYear(fecha.getFullYear() + 1);
  } else {
    fecha.setMonth(fecha.getMonth() + 1);
  }
  return fecha.toISOString().split('T')[0];
};

const GestionSucursales: React.FC = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    setIsLoading(true);
    const data = await fetchSucursales();
    setSucursales(data);
    setIsLoading(false);
  };

  const handleSuspender = async (id: string) => {
    await cambiarEstadoSucursal(id, 'suspendida');
    loadSucursales();
  };

  const handleActivar = async (id: string) => {
    await cambiarEstadoSucursal(id, 'activa');
    loadSucursales();
  };

  const handleCrearSucursal = async () => {
    const nombre = window.prompt('Nombre de la sucursal');
    if (!nombre?.trim()) return;

    const propietarioNombreCompleto = window.prompt('Nombre completo del propietario');
    if (!propietarioNombreCompleto?.trim()) return;

    const planInput = window.prompt('Plan (mensual/anual)', 'mensual');
    if (!planInput) return;

    const planNormalizado = planInput.trim().toLowerCase();
    const planActual: 'mensual' | 'anual' = planNormalizado === 'anual' ? 'anual' : 'mensual';
    const propietario = splitOwnerName(propietarioNombreCompleto);
    const slug = toSlug(nombre);
    const hoy = new Date().toISOString().split('T')[0];

    const emailPropietario = `${toSlug(propietario.nombre)}.admin@${slug || 'sucursal'}.pe`;

    const nuevaSucursal = await crearSucursal({
      nombre: nombre.trim(),
      ruc: `20${Math.floor(100000000 + Math.random() * 899999999)}`,
      direccion: 'Dirección pendiente',
      telefono: '900000000',
      email: `${slug || 'sucursal'}@tienda.pe`,
      planActual,
      fechaInicio: hoy,
      fechaVencimiento: getVencimientoByPlan(planActual),
      estado: 'activa',
      propietario: {
        nombre: propietario.nombre,
        apellido: propietario.apellido,
        email: emailPropietario,
        telefono: '900000000',
      },
    });

    // Crear automáticamente el usuario admin de la nueva sucursal
    await crearUsuario({
      email: emailPropietario,
      nombre: propietario.nombre,
      apellido: propietario.apellido,
      telefono: '900000000',
      sucursalId: nuevaSucursal.id,
      sucursalNombre: nuevaSucursal.nombre,
      rol: 'admin',
      estado: 'activo',
      permisos: ['ventas', 'inventario', 'reportes', 'usuarios', 'configuracion'],
    });

    await loadSucursales();
  };

  const handleEditarSucursal = async (sucursal: Sucursal) => {
    const nombreActualizado = window.prompt('Editar nombre de sucursal', sucursal.nombre);
    if (!nombreActualizado?.trim()) return;

    const planInput = window.prompt('Editar plan (mensual/anual)', sucursal.planActual);
    if (!planInput) return;
    const planNormalizado = planInput.trim().toLowerCase();
    const planActual: 'mensual' | 'anual' = planNormalizado === 'anual' ? 'anual' : 'mensual';

    await actualizarSucursal(sucursal.id, {
      nombre: nombreActualizado.trim(),
      planActual,
      fechaVencimiento: getVencimientoByPlan(planActual),
    });

    await loadSucursales();
  };

  return (
    <Layout title="Gestión de Sucursales">
      <PageHeader>
        <CreateButton $variant="primary" onClick={handleCrearSucursal}>
          + Nueva Sucursal
        </CreateButton>
      </PageHeader>

        {isLoading ? (
          <div>Cargando...</div>
        ) : (
          <TableWrapper>
          <Table>
            <Thead>
              <Tr>
                <Th>Sucursal</Th>
                <Th>Propietario</Th>
                <Th>Plan</Th>
                <Th>Vencimiento</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sucursales.map(sucursal => (
                <Tr key={sucursal.id}>
                  <Td>
                    <div style={{ fontWeight: 600 }}>{sucursal.nombre}</div>
                    <div style={{ fontSize: '12px', color: COLORS.textLight }}>
                      RUC: {sucursal.ruc}
                    </div>
                  </Td>
                  <Td>
                    <div>{sucursal.propietario.nombre} {sucursal.propietario.apellido}</div>
                    <div style={{ fontSize: '12px', color: COLORS.textLight }}>
                      {sucursal.propietario.email}
                    </div>
                  </Td>
                  <Td>
                    <PlanBadge $plan={sucursal.planActual}>{sucursal.planActual}</PlanBadge>
                  </Td>
                  <Td>{new Date(sucursal.fechaVencimiento).toLocaleDateString('es-PE')}</Td>
                  <Td>
                    <StatusBadge $status={sucursal.estado}>{sucursal.estado}</StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton 
                      $variant="view"
                      onClick={() => handleEditarSucursal(sucursal)}
                    >
                      Ver/Editar
                    </ActionButton>
                    {' '}
                    {sucursal.estado === 'activa' ? (
                      <ActionButton 
                        $variant="deactivate"
                        onClick={() => handleSuspender(sucursal.id)}
                      >
                        Suspender
                      </ActionButton>
                    ) : (
                      <ActionButton 
                        $variant="activate"
                        onClick={() => handleActivar(sucursal.id)}
                      >
                        Activar
                      </ActionButton>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          </TableWrapper>
        )}
    </Layout>
  );
};

export default GestionSucursales;
