import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchSucursales, cambiarEstadoSucursal, type Sucursal } from '../services/sucursalesApi';
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

  return (
    <Layout title="Gestión de Sucursales">
      <PageHeader>
        <CreateButton $variant="primary" onClick={() => alert('Crear sucursal (próximamente)')}>
          + Nueva Sucursal
        </CreateButton>
      </PageHeader>

        {isLoading ? (
          <div>Cargando...</div>
        ) : (
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
                      onClick={() => alert(`Ver detalles de ${sucursal.nombre}`)}
                    >
                      Ver
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
        )}
    </Layout>
  );
};

export default GestionSucursales;
