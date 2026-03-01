import React, { useState, FormEvent } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS } from '../../../styles/theme';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%);
  padding: ${SPACING.xl};
`;

const LoginCard = styled.div`
  background: ${COLORS.surface};
  border-radius: ${RADIUS.lg};
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
  background: #000000;
  border-radius: ${RADIUS.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  font-weight: 900;
  color: ${COLORS.surface};
  letter-spacing: -1px;
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
  padding: 12px 15px;
  border: 1.5px solid ${COLORS.border};
  border-radius: ${RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    outline: none;
    border-color: #000000;
    box-shadow: none;
  }

  &::placeholder {
    color: ${COLORS.textLighter};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px ${SPACING.xl};
  background: #000000;
  color: ${COLORS.surface};
  border: none;
  border-radius: ${RADIUS.xl};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    background: #333333;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  margin-top: ${SPACING.lg};
  padding: ${SPACING.md} ${SPACING.lg};
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 10px;
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
