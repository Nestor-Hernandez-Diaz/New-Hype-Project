import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../modules/auth/context/AuthContext';

const UserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);

  @media (max-width: 768px) {
    padding: 6px 10px;
    gap: 8px;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
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
  font-size: 14px;
  color: #1f2937;
  line-height: 1.2;
`;

const UserRole = styled.span`
  font-size: 12px;
  color: #6b7280;
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
