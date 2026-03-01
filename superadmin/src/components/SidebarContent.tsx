import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../modules/auth/context/AuthContext';

const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const SidebarNav = styled.nav`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 0;
  
  /* Estilos para el scrollbar */
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.4);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
`;

const NavItem = styled.li<{ $isActive?: boolean }>`
  margin-bottom: 2px;

  a {
    display: flex;
    align-items: center;
    padding: 14px 20px;
    color: ${props => props.$isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'};
    background-color: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    border-radius: 0;
    margin: 0;
    border-left: ${props => props.$isActive ? '3px solid #ffffff' : '3px solid transparent'};

    &:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    svg {
      margin-right: 14px;
      width: 20px;
      height: 20px;
      stroke: currentColor;
      stroke-width: 2;
      fill: none;
    }

    span {
      font-weight: 500;
      font-size: 14px;
      letter-spacing: 0.2px;
    }
  }
`;

const LogoutSection = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 12px 18px;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: #ffffff;
    border-color: #ffffff;
    color: #000000;
  }

  svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }
`;

interface SidebarContentProps {
  onItemClick?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ onItemClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onItemClick) onItemClick();
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard Global' },
    { path: '/sucursales', label: 'Sucursales' },
    { path: '/suscripciones', label: 'Planes & Suscripciones' },
    { path: '/suscripciones/estado-pagos', label: 'Estado de Pagos' },
    { path: '/usuarios', label: 'Usuarios del Sistema' },
    { path: '/tickets/detalle', label: 'Detalle de Tickets' },
  ];

  const getIcon = (path: string) => {
    switch (path) {
      case '/dashboard':
        return (
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        );
      case '/sucursales':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case '/suscripciones':
        return (
          <svg viewBox="0 0 24 24">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        );
      case '/suscripciones/estado-pagos':
        return (
          <svg viewBox="0 0 24 24">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
            <path d="M7 15h0.01" />
            <path d="M11 15h2" />
          </svg>
        );
      case '/usuarios':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      case '/tickets/detalle':
        return (
          <svg viewBox="0 0 24 24">
            <path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
            <line x1="7" y1="10" x2="17" y2="10" />
            <line x1="7" y1="13" x2="14" y2="13" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <SidebarWrapper>
      <SidebarNav>
        <ul>
          {menuItems.map((item) => (
            <NavItem key={item.path} $isActive={location.pathname === item.path}>
              <Link to={item.path} onClick={onItemClick}>
                {getIcon(item.path)}
                <span>{item.label}</span>
              </Link>
            </NavItem>
          ))}
        </ul>
      </SidebarNav>

      <LogoutSection>
        <LogoutButton onClick={handleLogout}>
          <svg viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar Sesión
        </LogoutButton>
      </LogoutSection>
    </SidebarWrapper>
  );
};

export default SidebarContent;
