import React from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import UserInfo from './UserInfo';

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MainHeader = styled.header`
  background-color: #fff;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 15px 20px;
  }

  @media (max-width: 480px) {
    padding: 12px 15px;
  }

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #333;
    margin: 0;
    
    @media (max-width: 768px) {
      font-size: 24px;
    }
    
    @media (max-width: 480px) {
      font-size: 20px;
    }
  }
`;

const ContentBody = styled.div`
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: #f5f5f5;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 15px;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, className }) => {
  return (
    <DashboardContainer className={className}>
      <Sidebar />
      <MainContent>
        <MainHeader>
          <h1>{title}</h1>
          <UserInfo />
        </MainHeader>
        <ContentBody>
          {children}
        </ContentBody>
      </MainContent>
    </DashboardContainer>
  );
};

export default Layout;
