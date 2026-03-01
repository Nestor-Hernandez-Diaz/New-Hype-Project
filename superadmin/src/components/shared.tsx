import styled from 'styled-components';
import { TYPOGRAPHY, COLORS, RADIUS, TRANSITION } from '../styles/theme';

// ============================================================================
// TIPOS DE BOTONES
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
export type ActionButtonVariant = 'view' | 'edit' | 'delete' | 'activate' | 'deactivate';

export interface ButtonProps {
  $variant?: ButtonVariant;
}

export interface ActionButtonProps {
  $variant?: ActionButtonVariant;
}

// ============================================================================
// BUTTON PRINCIPAL
// ============================================================================

export const Button = styled.button<ButtonProps>`
  font-family: ${TYPOGRAPHY.fontFamily.base};
  padding: 12px 30px;
  border: none;
  border-radius: ${RADIUS.xl};
  font-size: 13px;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: pointer;
  transition: ${TRANSITION};
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #000000;
          color: #ffffff;
          &:hover:not(:disabled) {
            background: #333333;
            transform: translateY(-1px);
          }
        `;
      case 'success':
        return `
          background: ${COLORS.success};
          color: #ffffff;
          &:hover:not(:disabled) {
            background: #16a34a;
            transform: translateY(-1px);
          }
        `;
      case 'danger':
        return `
          background: ${COLORS.error};
          color: #ffffff;
          &:hover:not(:disabled) {
            background: #dc2626;
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #000000;
          border: 1.5px solid #000000;
          &:hover:not(:disabled) {
            background: #000000;
            color: #ffffff;
          }
        `;
      default: // secondary
        return `
          background: ${COLORS.surface};
          color: ${COLORS.text};
          border: 1.5px solid ${COLORS.border};
          &:hover:not(:disabled) {
            background: ${COLORS.surfaceHover};
            border-color: ${COLORS.borderDark};
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// ============================================================================
// ACTION BUTTON (para tablas)
// ============================================================================

export const ActionButton = styled.button<ActionButtonProps>`
  font-family: ${TYPOGRAPHY.fontFamily.base};
  padding: 8px 16px;
  border: none;
  border-radius: ${RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: pointer;
  transition: ${TRANSITION};
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;

  ${props => {
    switch (props.$variant) {
      case 'view':
        return `background: #f5f5f5; color: #525252; border: 1px solid #e5e5e5;`;
      case 'edit':
        return `background: #000000; color: #ffffff;`;
      case 'delete':
        return `background: #fef2f2; color: #ef4444; border: 1px solid #fecaca;`;
      case 'activate':
        return `background: #f0fdf4; color: #22c55e; border: 1px solid #bbf7d0;`;
      case 'deactivate':
        return `background: #fef2f2; color: #ef4444; border: 1px solid #fecaca;`;
      default:
        return `background: ${COLORS.surfaceHover}; color: ${COLORS.textLight}; border: 1px solid ${COLORS.border};`;
    }
  }}

  &:hover:not(:disabled) {
    opacity: 0.85;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// ============================================================================
// BUTTON GROUP
// ============================================================================

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

// ============================================================================
// STATUS BADGE
// ============================================================================

export const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 10px;
  border-radius: ${RADIUS.xl};
  font-size: 11px;
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  text-transform: capitalize;
  display: inline-block;
  
  ${props => {
    switch (props.$status) {
      case 'activa':
      case 'activo':
      case 'pagado':
      case 'al_dia':
        return `
          background: ${COLORS.successLight};
          color: #16a34a;
        `;
      case 'suspendida':
      case 'suspendido':
      case 'pendiente':
      case 'por_vencer':
        return `
          background: ${COLORS.warningLight};
          color: #d97706;
        `;
      case 'vencida':
      case 'vencido':
      case 'inactivo':
      case 'fallido':
      case 'cancelada':
        return `
          background: ${COLORS.errorLight};
          color: #dc2626;
        `;
      default:
        return `
          background: #f5f5f5;
          color: ${COLORS.textLight};
        `;
    }
  }}
`;
