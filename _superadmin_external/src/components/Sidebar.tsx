import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import SidebarContent from './SidebarContent';

const SidebarContainer = styled.aside<{ $mobileOpen?: boolean }>`
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
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    transform: ${props => props.$mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const Overlay = styled.div<{ $visible: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(0, 0, 0, 0.5);
    opacity: ${props => props.$visible ? 1 : 0};
    pointer-events: ${props => props.$visible ? 'auto' : 'none'};
    transition: opacity 0.3s ease;
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
  mobileOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className, mobileOpen, onClose }) => {
  return (
    <>
      <Overlay $visible={!!mobileOpen} onClick={onClose} />
      <SidebarContainer className={className} $mobileOpen={mobileOpen}>
        <SidebarHeader>
          <TitleLink to="/dashboard" onClick={onClose}>
            <h2>New Hype</h2>
            <p>Admin Control Panel</p>
          </TitleLink>
        </SidebarHeader>
        <SidebarContent onItemClick={onClose} />
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
