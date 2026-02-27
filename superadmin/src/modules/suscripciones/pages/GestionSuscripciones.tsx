import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { fetchSuscripciones, renovarSuscripcion, cancelarSuscripcion, type Suscripcion } from '../services/suscripcionesApi';
import { ActionButton, StatusBadge } from '../../../components/shared';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../../styles/theme';

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

const PlanBadge = styled.span<{ $tipo: string }>`
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: 12px;
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  background: ${props => props.$tipo === 'anual' ? COLORS.superadminLight : COLORS.infoLight};
  color: ${props => props.$tipo === 'anual' ? COLORS.superadminDark : COLORS.info};
  text-transform: uppercase;
`;

const GestionSuscripciones: React.FC = () => {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuscripciones();
  }, []);

  const loadSuscripciones = async () => {
    setIsLoading(true);
    const data = await fetchSuscripciones();
    setSuscripciones(data);
    setIsLoading(false);
  };

  const handleRenovar = async (id: string) => {
    if (confirm('¿Confirmar renovación de suscripción?')) {
      await renovarSuscripcion(id);
      loadSuscripciones();
    }
  };

  const handleCancelar = async (id: string) => {
    if (confirm('¿Estás seguro de cancelar esta suscripción?')) {
      await cancelarSuscripcion(id);
      loadSuscripciones();
    }
  };

  const activas = suscripciones.filter(s => s.estado === 'activa').length;
  const vencidas = suscripciones.filter(s => s.estado === 'vencida').length;
  const ingresosMensuales = suscripciones
    .filter(s => s.estado === 'activa')
    .reduce((acc, s) => {
      const mensual = s.plan.tipo === 'anual' ? s.precioFinal / 12 : s.precioFinal;
      return acc + mensual;
    }, 0);

  return (
    <Layout title="Planes & Suscripciones">

        <StatsGrid>
          <StatCard>
            <StatLabel>Total Suscripciones</StatLabel>
            <StatValue>{suscripciones.length}</StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Suscripciones Activas</StatLabel>
            <StatValue>{activas}</StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Vencidas</StatLabel>
            <StatValue>{vencidas}</StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Ingresos Mensuales</StatLabel>
            <StatValue>S/ {ingresosMensuales.toFixed(2)}</StatValue>
          </StatCard>
        </StatsGrid>

        {isLoading ? (
          <div>Cargando...</div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Sucursal</Th>
                <Th>Plan</Th>
                <Th>Precio</Th>
                <Th>Inicio</Th>
                <Th>Vencimiento</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {suscripciones.map(suscripcion => (
                <Tr key={suscripcion.id}>
                  <Td>
                    <div style={{ fontWeight: 600 }}>{suscripcion.sucursalNombre}</div>
                    <div style={{ fontSize: '12px', color: COLORS.textLight }}>
                      {suscripcion.metodoPago}
                    </div>
                  </Td>
                  <Td>
                    <PlanBadge $tipo={suscripcion.plan.tipo}>
                      {suscripcion.plan.nombre}
                    </PlanBadge>
                  </Td>
                  <Td style={{ fontWeight: 600 }}>S/ {suscripcion.precioFinal}</Td>
                  <Td>{new Date(suscripcion.fechaInicio).toLocaleDateString('es-PE')}</Td>
                  <Td>{new Date(suscripcion.fechaVencimiento).toLocaleDateString('es-PE')}</Td>
                  <Td>
                    <StatusBadge $status={suscripcion.estado}>{suscripcion.estado}</StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton 
                      $variant="view"
                      onClick={() => alert(`Ver detalles de ${suscripcion.sucursalNombre}`)}
                    >
                      Ver
                    </ActionButton>
                    {' '}
                    {suscripcion.estado === 'vencida' ? (
                      <ActionButton $variant="activate" onClick={() => handleRenovar(suscripcion.id)}>
                        Renovar
                      </ActionButton>
                    ) : (
                      <ActionButton $variant="deactivate" onClick={() => handleCancelar(suscripcion.id)}>
                        Cancelar
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

export default GestionSuscripciones;
