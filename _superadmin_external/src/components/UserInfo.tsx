import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../modules/auth/context/AuthContext';

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 24px;
  border: 1px solid #e5e5e5;

  @media (max-width: 768px) {
    padding: 6px 12px;
    gap: 8px;
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 13px;
  color: #0a0a0a;
  line-height: 1.2;
`;

const UserRole = styled.span`
  font-size: 11px;
  color: #a3a3a3;
  font-weight: 500;
`;

const UserInfo: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const initials = `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();

  return (
    <UserContainer>
      <UserAvatar>{initials}</UserAvatar>
      <UserDetails>
        <UserName>{user.nombre} {user.apellido}</UserName>
        <UserRole>Superadministrador</UserRole>
      </UserDetails>
    </UserContainer>
  );
};

export default UserInfo;
