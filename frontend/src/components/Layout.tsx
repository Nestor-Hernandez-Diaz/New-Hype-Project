import React from 'react';
import Sidebar from './Sidebar';
import UserInfo from './UserInfo';
import AlertasBadge from './AlertasBadge';
import MobileNav from './MobileNav';
import SidebarContent from './SidebarContent';
import { DashboardContainer, MainContent, MainHeader, ContentBody } from '../styles/GlobalStyles';
import { media } from '../styles/breakpoints';
import styled from 'styled-components';
import { SPACING, COLORS } from '../styles/theme';

const MobileMainContent = styled(MainContent)`
  ${media.tablet} {
    padding-top: 60px; /* Espacio para la barra de navegación móvil */
  }
`;

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  className?: string;
}

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.lg};
  
  ${media.mobile} {
    gap: ${SPACING.sm};
  }
`;

const Footer = styled.footer`
  padding: 12px ${SPACING.xl};
  font-size: 13px;
  color: ${COLORS.textMuted};
  border-top: 1px solid ${COLORS.border};
  background: linear-gradient(180deg, ${COLORS.background} 0%, #eef1f5 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
  flex-shrink: 0;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  a {
    color: ${COLORS.primary};
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s ease;
    &:hover { color: ${COLORS.primaryHover}; }
  }

  ${media.mobile} {
    font-size: 11px;
    gap: 14px;
    padding: 10px ${SPACING.md};
  }
`;

const Layout: React.FC<LayoutProps> = ({ children, title, className }) => {
  return (
    <>
      <MobileNav>
        <SidebarContent onItemClick={() => {}} />
      </MobileNav>
      <DashboardContainer className={className}>
        <Sidebar />
        <MobileMainContent>
          <MainHeader>
            <h1>{title}</h1>
            <HeaderRight>
              <AlertasBadge />
              <UserInfo />
            </HeaderRight>
          </MainHeader>
          <ContentBody>
            {children}
          </ContentBody>
          <Footer>
            <span>✉ <a href="mailto:mariosoporte@gmail.com">mariosoporte@gmail.com</a></span>
            <span>📞 <a href="tel:+51999666321">+51 999 666 321</a></span>
          </Footer>
        </MobileMainContent>
      </DashboardContainer>
    </>
  );
};

export default Layout;