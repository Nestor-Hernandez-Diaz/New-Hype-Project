import React, { createContext, useCallback, useContext, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, RADIUS } from '../styles/theme';

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};

// ============================================================================
// ANIMATIONS
// ============================================================================

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0);    opacity: 1; }
  to   { transform: translateX(100%); opacity: 0; }
`;

const progressShrink = keyframes`
  from { width: 100%; }
  to   { width: 0%; }
`;

// ============================================================================
// STYLED
// ============================================================================

const Container = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  width: 100%;
  pointer-events: none;
`;

const getColors = (type: ToastType) => {
  switch (type) {
    case 'success': return { bg: COLORS.successLight, border: COLORS.success, icon: COLORS.success };
    case 'error':   return { bg: COLORS.errorLight,   border: COLORS.error,   icon: COLORS.error };
    case 'warning': return { bg: COLORS.warningLight,  border: COLORS.warning, icon: COLORS.warning };
    case 'info':    return { bg: COLORS.infoLight,     border: COLORS.info,    icon: COLORS.info };
  }
};

const ToastItem = styled.div<{ $type: ToastType; $exiting: boolean; $duration: number }>`
  pointer-events: auto;
  display: flex;
  gap: ${SPACING.md};
  padding: ${SPACING.md} ${SPACING.lg};
  border-radius: ${RADIUS.lg};
  background: ${COLORS.surface};
  border-left: 4px solid ${props => getColors(props.$type).border};
  box-shadow: ${SHADOWS.lg};
  animation: ${props => props.$exiting ? css`${slideOut} 0.3s ease forwards` : css`${slideIn} 0.35s ease`};
  position: relative;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $type: ToastType; $duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${props => getColors(props.$type).border};
  animation: ${progressShrink} ${props => props.$duration}ms linear forwards;
  border-radius: 0 0 0 ${RADIUS.lg};
`;

const IconArea = styled.div<{ $type: ToastType }>`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => getColors(props.$type).bg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToastTitle = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text};
  margin-bottom: 2px;
`;

const ToastMessage = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.textLight};
  line-height: 1.4;
`;

const CloseBtn = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: ${COLORS.textLighter};
  padding: 2px;
  font-size: 16px;
  line-height: 1;
  &:hover { color: ${COLORS.text}; }
`;

// ============================================================================
// ICONS
// ============================================================================

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const color = getColors(type).icon;
  const size = 18;

  switch (type) {
    case 'success':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'error':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case 'warning':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'info':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
};

// ============================================================================
// PROVIDER
// ============================================================================

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const removeToast = useCallback((id: string) => {
    setExiting(prev => new Set(prev).add(id));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      setExiting(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message: string, duration = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { id, type, title, message, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string, d?: number) => showToast('success', 'Éxito', msg, d), [showToast]);
  const error   = useCallback((msg: string, d?: number) => showToast('error',   'Error', msg, d ?? 6000), [showToast]);
  const warning = useCallback((msg: string, d?: number) => showToast('warning', 'Atención', msg, d ?? 5000), [showToast]);
  const info    = useCallback((msg: string, d?: number) => showToast('info',    'Info', msg, d), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <Container>
        {toasts.map(t => (
          <ToastItem key={t.id} $type={t.type} $exiting={exiting.has(t.id)} $duration={t.duration}>
            <ProgressBar $type={t.type} $duration={t.duration} />
            <IconArea $type={t.type}>
              <ToastIcon type={t.type} />
            </IconArea>
            <Content>
              <ToastTitle>{t.title}</ToastTitle>
              <ToastMessage>{t.message}</ToastMessage>
            </Content>
            <CloseBtn onClick={() => removeToast(t.id)}>✕</CloseBtn>
          </ToastItem>
        ))}
      </Container>
    </ToastContext.Provider>
  );
};
