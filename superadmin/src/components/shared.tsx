import styled from 'styled-components';
import { TYPOGRAPHY, COLORS, SHADOWS, SPACING } from '../styles/theme';

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
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: ${TYPOGRAPHY.fontSize.base};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: ${COLORS.superadmin};
          color: ${COLORS.surface};
          &:hover:not(:disabled) {
            background: ${COLORS.superadminDark};
            transform: translateY(-1px);
            box-shadow: ${SHADOWS.md};
          }
        `;
      case 'success':
        return `
          background: ${COLORS.success};
          color: ${COLORS.surface};
          &:hover:not(:disabled) {
            background: #0d9668;
          }
        `;
      case 'danger':
        return `
          background: ${COLORS.error};
          color: ${COLORS.surface};
          &:hover:not(:disabled) {
            background: #dc2626;
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${COLORS.superadmin};
          border: 1px solid ${COLORS.superadmin};
          &:hover:not(:disabled) {
            background: ${COLORS.superadminLight}22;
          }
        `;
      default: // secondary
        return `
          background: ${COLORS.surface};
          color: ${COLORS.text};
          border: 1px solid ${COLORS.border};
          &:hover:not(:disabled) {
            background: ${COLORS.surfaceHover};
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
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  ${props => {
    switch (props.$variant) {
      case 'view':
        return `background: #d1ecf1; color: #17a2d8;`;
      case 'edit':
        return `background: #3498db; color: #ffffff;`;
      case 'delete':
        return `background: #dc3545; color: #ffffff;`;
      case 'activate':
        return `background: #28a745; color: #ffffff;`;
      case 'deactivate':
        return `background: #f8d7da; color: #dc3545;`;
      default:
        return `background: ${COLORS.surfaceHover}; color: ${COLORS.textLight};`;
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
  padding: ${SPACING.xs} ${SPACING.md};
  border-radius: 12px;
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  text-transform: capitalize;
  display: inline-block;
  
  ${props => {
    switch (props.$status) {
      case 'activa':
      case 'activo':
      case 'pagado':
        return `
          background: ${COLORS.successLight};
          color: ${COLORS.success};
        `;
      case 'suspendida':
      case 'suspendido':
      case 'pendiente':
        return `
          background: ${COLORS.warningLight};
          color: ${COLORS.warning};
        `;
      case 'vencida':
      case 'vencido':
      case 'inactivo':
      case 'fallido':
        return `
          background: ${COLORS.errorLight};
          color: ${COLORS.error};
        `;
      default:
        return `
          background: ${COLORS.border};
          color: ${COLORS.textLight};
        `;
    }
  }}
`;
