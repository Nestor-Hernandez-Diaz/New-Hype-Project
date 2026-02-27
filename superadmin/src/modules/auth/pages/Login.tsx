import React, { useState, FormEvent } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../../styles/theme';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${COLORS.superadmin} 0%, ${COLORS.superadminDark} 100%);
  padding: ${SPACING.xl};
`;

const LoginCard = styled.div`
  background: ${COLORS.surface};
  border-radius: 16px;
  box-shadow: ${SHADOWS.xl};
  padding: ${SPACING['3xl']};
  width: 100%;
  max-width: 420px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${SPACING['2xl']};
`;

const LogoIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto ${SPACING.lg};
  background: linear-gradient(135deg, ${COLORS.superadmin}, ${COLORS.superadminLight});
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.surface};
`;

const Title = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  color: ${COLORS.text};
  margin-bottom: ${SPACING.sm};
`;

const Subtitle = styled.p`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const Form = styled.form`
  margin-top: ${SPACING['2xl']};
`;

const FormGroup = styled.div`
  margin-bottom: ${SPACING.xl};
`;

const Label = styled.label`
  display: block;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
  margin-bottom: ${SPACING.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${SPACING.md} ${SPACING.lg};
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  font-size: ${TYPOGRAPHY.fontSize.base};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${COLORS.superadmin};
    box-shadow: 0 0 0 3px ${COLORS.superadminLight}33;
  }

  &::placeholder {
    color: ${COLORS.textLighter};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: ${SPACING.md} ${SPACING.xl};
  background: linear-gradient(135deg, ${COLORS.superadmin}, ${COLORS.superadminDark});
  color: ${COLORS.surface};
  border: none;
  border-radius: 8px;
  font-size: ${TYPOGRAPHY.fontSize.base};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${SHADOWS.lg};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  margin-top: ${SPACING.lg};
  padding: ${SPACING.md} ${SPACING.lg};
  background: ${COLORS.errorLight};
  color: ${COLORS.error};
  border-radius: 8px;
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const InfoBox = styled.div`
  margin-top: ${SPACING.xl};
  padding: ${SPACING.lg};
  background: ${COLORS.infoLight};
  border-left: 4px solid ${COLORS.info};
  border-radius: 4px;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <LogoIcon>SA</LogoIcon>
          <Title>Superadmin</Title>
          <Subtitle>Panel de Control Global</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="superadmin@newhype.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </FormGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>

        <InfoBox>
          <strong>DEMO ACCESS</strong><br />
          Email: superadmin@newhype.com<br />
          Contraseña: super2026
        </InfoBox>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
