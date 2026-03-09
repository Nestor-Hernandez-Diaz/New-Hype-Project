import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SidebarContent from './SidebarContent';

const SidebarContainer = styled.aside`
  width: 260px;
  background: #000000;
  color: #ffffff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
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
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 900;
    color: #ffffff;
    letter-spacing: -1px;
  }
  
  p {
    margin: 4px 0 0 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;
    letter-spacing: 0.5px;
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
