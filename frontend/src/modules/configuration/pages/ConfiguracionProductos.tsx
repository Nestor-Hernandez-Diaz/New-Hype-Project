import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import CategoriasTable from '../components/CategoriasTable';
import UnidadesTable from '../components/UnidadesTable';
import CatalogTable from '../components/CatalogTable';
import type { CatalogConfig } from '../components/CatalogModal';

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
  overflow-x: auto;
`;

const TabList = styled.div`
  display: flex;
  gap: 0.25rem;
  min-width: max-content;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: 0.8125rem;
  color: ${props => props.$active ? '#2563eb' : '#6b7280'};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.$active ? '#2563eb' : 'transparent'};
  margin-bottom: -2px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

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

type TabType = 'categorias' | 'unidades' | 'tallas' | 'colores' | 'marcas' | 'materiales' | 'generos';

const CATALOG_CONFIGS: Record<string, CatalogConfig> = {
  tallas: {
    catalogType: 'tallas',
    label: 'Talla',
    fields: { descripcion: true, ordenVisualizacion: true },
  },
  colores: {
    catalogType: 'colores',
    label: 'Color',
    fields: { nombre: true, codigoHex: true },
  },
  marcas: {
    catalogType: 'marcas',
    label: 'Marca',
    fields: { nombre: true, logoUrl: true },
  },
  materiales: {
    catalogType: 'materiales',
    label: 'Material',
    fields: { descripcion: true },
  },
  generos: {
    catalogType: 'generos',
    label: 'Género',
    fields: { descripcion: true },
  },
};

const ConfiguracionProductos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('categorias');

  return (
    <Layout title="Configuración de Productos">
    <Container>
      <Header>
        <Title>Configuración de Productos</Title>
        <Subtitle>Gestiona categorías, unidades, tallas, colores, marcas, materiales y géneros</Subtitle>
      </Header>

      <TabsContainer>
        <TabList>
          <Tab $active={activeTab === 'categorias'} onClick={() => setActiveTab('categorias')}>
            Categorías
          </Tab>
          <Tab $active={activeTab === 'unidades'} onClick={() => setActiveTab('unidades')}>
            Unidades
          </Tab>
          <Tab $active={activeTab === 'tallas'} onClick={() => setActiveTab('tallas')}>
            Tallas
          </Tab>
          <Tab $active={activeTab === 'colores'} onClick={() => setActiveTab('colores')}>
            Colores
          </Tab>
          <Tab $active={activeTab === 'marcas'} onClick={() => setActiveTab('marcas')}>
            Marcas
          </Tab>
          <Tab $active={activeTab === 'materiales'} onClick={() => setActiveTab('materiales')}>
            Materiales
          </Tab>
          <Tab $active={activeTab === 'generos'} onClick={() => setActiveTab('generos')}>
            Géneros
          </Tab>
        </TabList>
      </TabsContainer>

      <TabPanel>
        {activeTab === 'categorias' && <CategoriasTable />}
        {activeTab === 'unidades' && <UnidadesTable />}
        {activeTab === 'tallas' && <CatalogTable config={CATALOG_CONFIGS.tallas} />}
        {activeTab === 'colores' && <CatalogTable config={CATALOG_CONFIGS.colores} />}
        {activeTab === 'marcas' && <CatalogTable config={CATALOG_CONFIGS.marcas} />}
        {activeTab === 'materiales' && <CatalogTable config={CATALOG_CONFIGS.materiales} />}
        {activeTab === 'generos' && <CatalogTable config={CATALOG_CONFIGS.generos} />}
      </TabPanel>
    </Container>
  </Layout>
  );
};

export default ConfiguracionProductos;
