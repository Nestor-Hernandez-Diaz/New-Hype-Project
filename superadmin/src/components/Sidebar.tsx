import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SidebarContent from './SidebarContent';

const SidebarContainer = styled.aside`
  width: 250px;
  background: #1e293b;
  color: #ffffff;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 0;
  position: sticky;
  top: 0;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  background: #0f172a;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
  
  p {
    margin: 6px 0 0 0;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }
`;

const TitleLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.85;
  }
`;

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <SidebarContainer className={className}>
      <SidebarHeader>
        <TitleLink to="/dashboard">
          <h2>New Hype</h2>
          <p>Admin Control Panel</p>
        </TitleLink>
      </SidebarHeader>
      <SidebarContent />
    </SidebarContainer>
  );
};

export default Sidebar;
