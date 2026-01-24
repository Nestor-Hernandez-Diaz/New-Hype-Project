import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import CategoriasTable from '../components/CategoriasTable';
import UnidadesTable from '../components/UnidadesTable';

const Container = styled.div`
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
`;

const TabsContainer = styled.div`
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 2rem;
`;

const TabList = styled.div`
  display: flex;
  gap: 1rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: ${props => props.$active ? '#2563eb' : '#6b7280'};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#2563eb' : 'transparent'};
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #2563eb;
  }
`;

const TabPanel = styled.div`
  animation: fadeIn 0.2s;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

type TabType = 'categorias' | 'unidades';

const ConfiguracionProductos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('categorias');

  return (
    <Layout title="Configuración de Productos">
    <Container>
      <Header>
        <Title>Configuración de Productos</Title>
        <Subtitle>Gestiona las categorías y unidades de medida de tus productos</Subtitle>
      </Header>

      <TabsContainer>
        <TabList>
          <Tab
            $active={activeTab === 'categorias'}
            onClick={() => setActiveTab('categorias')}
          >
            Categorías
          </Tab>
          <Tab
            $active={activeTab === 'unidades'}
            onClick={() => setActiveTab('unidades')}
          >
            Unidades de Medida
          </Tab>
        </TabList>
      </TabsContainer>

      <TabPanel>
        {activeTab === 'categorias' && <CategoriasTable />}
        {activeTab === 'unidades' && <UnidadesTable />}
      </TabPanel>
    </Container>
  </Layout>
  );
};

export default ConfiguracionProductos;
