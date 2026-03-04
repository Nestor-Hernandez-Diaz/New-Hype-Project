import React, { useState } from 'react';
import styled from 'styled-components';
import configuracionApi from '../services/configuracionApi';
import type { CatalogItem, CatalogInput } from '../services/configuracionApi';
import { useNotification } from '../../../context/NotificationContext';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../../styles/theme';
import { Button } from '../../../components/shared/Button';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.xl};
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: ${SPACING['2xl']} ${SPACING['2xl']} 0 ${SPACING['2xl']};
  border-bottom: 1px solid ${COLORS.neutral[200]};
  margin-bottom: ${SPACING['2xl']};
`;

const ModalTitle = styled.h2`
  margin: 0 0 ${SPACING.lg} 0;
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text.primary};
`;

const ModalContent = styled.div`
  padding: 0 ${SPACING['2xl']} ${SPACING['2xl']} ${SPACING['2xl']};
`;

const FormGroup = styled.div`
  margin-bottom: ${SPACING.xl};

  label {
    display: block;
    font-size: ${TYPOGRAPHY.fontSize.sm};
    font-weight: ${TYPOGRAPHY.fontWeight.medium};
    color: ${COLORS.text.primary};
    margin-bottom: ${SPACING.xs};
  }

  input, textarea {
    width: 100%;
    padding: ${SPACING.sm} ${SPACING.md};
    border: 1px solid ${COLORS.neutral[300]};
    border-radius: ${BORDER_RADIUS.md};
    font-size: ${TYPOGRAPHY.fontSize.sm};

    &:focus {
      outline: none;
      border-color: ${COLOR_SCALES.primary[500]};
    }

    &:disabled {
      background: ${COLORS.neutral[100]};
      color: ${COLORS.text.secondary};
    }
  }

  .error {
    color: ${COLOR_SCALES.danger[500]};
    font-size: ${TYPOGRAPHY.fontSize.xs};
    margin-top: ${SPACING.sm};
  }

  .hint {
    color: ${COLORS.text.secondary};
    font-size: ${TYPOGRAPHY.fontSize.xs};
    margin-top: ${SPACING.xs};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.lg};
  margin-top: ${SPACING['2xl']};
`;

/** Configuration per catalog type for which extra fields to show */
export interface CatalogConfig {
  catalogType: string;
  label: string;
  fields: {
    nombre?: boolean;
    descripcion?: boolean;
    codigoHex?: boolean;
    logoUrl?: boolean;
    ordenVisualizacion?: boolean;
  };
}

interface CatalogModalProps {
  config: CatalogConfig;
  item?: CatalogItem;
  onClose: (saved: boolean) => void;
}

const CatalogModal: React.FC<CatalogModalProps> = ({ config, item, onClose }) => {
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CatalogInput>({
    codigo: item?.codigo || '',
    nombre: item?.nombre || '',
    descripcion: item?.descripcion || '',
    codigoHex: item?.codigoHex || '',
    logoUrl: item?.logoUrl || '',
    ordenVisualizacion: item?.ordenVisualizacion,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.codigo.trim()) newErrors.codigo = 'El código es requerido';
    else if (formData.codigo.length > 20) newErrors.codigo = 'Máximo 20 caracteres';
    if (config.fields.nombre && formData.nombre && formData.nombre.length > 100) newErrors.nombre = 'Máximo 100 caracteres';
    if (config.fields.codigoHex && formData.codigoHex && !/^#?[0-9A-Fa-f]{0,6}$/.test(formData.codigoHex)) newErrors.codigoHex = 'Código hex inválido (ej: #FF0000)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const payload: CatalogInput = { codigo: formData.codigo };
      if (config.fields.nombre && formData.nombre) payload.nombre = formData.nombre;
      if (config.fields.descripcion && formData.descripcion) payload.descripcion = formData.descripcion;
      if (config.fields.codigoHex && formData.codigoHex) payload.codigoHex = formData.codigoHex;
      if (config.fields.logoUrl && formData.logoUrl) payload.logoUrl = formData.logoUrl;
      if (config.fields.ordenVisualizacion && formData.ordenVisualizacion != null) payload.ordenVisualizacion = Number(formData.ordenVisualizacion);

      if (item) {
        await configuracionApi.updateCatalogItem(config.catalogType, item.id, payload);
        showSuccess(`${config.label} actualizado correctamente`);
      } else {
        await configuracionApi.createCatalogItem(config.catalogType, payload);
        showSuccess(`${config.label} creado correctamente`);
      }
      onClose(true);
    } catch (error: any) {
      showError(error.message || `Error al guardar ${config.label.toLowerCase()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose(false)}>
      <ModalContainer>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>{item ? `Editar ${config.label}` : `Nuevo ${config.label}`}</ModalTitle>
          </ModalHeader>
          <ModalContent>
            <FormGroup>
              <label>Código<span style={{ color: COLOR_SCALES.danger[500] }}>*</span></label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                placeholder="Ej: XS, NEGRO, NIKE"
                maxLength={20}
                disabled={!!item}
              />
              {errors.codigo && <div className="error">{errors.codigo}</div>}
              <div className="hint">Identificador corto. No editable después de crear.</div>
            </FormGroup>

            {config.fields.nombre && (
              <FormGroup>
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre || ''}
                  onChange={handleInputChange}
                  placeholder={`Nombre descriptivo del ${config.label.toLowerCase()}`}
                  maxLength={100}
                />
                {errors.nombre && <div className="error">{errors.nombre}</div>}
              </FormGroup>
            )}

            {config.fields.descripcion && (
              <FormGroup>
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion || ''}
                  onChange={handleInputChange}
                  placeholder="Descripción opcional"
                  rows={3}
                />
              </FormGroup>
            )}

            {config.fields.codigoHex && (
              <FormGroup>
                <label>Código de Color (Hex)</label>
                <div style={{ display: 'flex', gap: SPACING.sm, alignItems: 'center' }}>
                  <input
                    type="text"
                    name="codigoHex"
                    value={formData.codigoHex || ''}
                    onChange={handleInputChange}
                    placeholder="#FF0000"
                    maxLength={7}
                    style={{ flex: 1 }}
                  />
                  {formData.codigoHex && (
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: BORDER_RADIUS.sm,
                      background: formData.codigoHex.startsWith('#') ? formData.codigoHex : `#${formData.codigoHex}`,
                      border: `1px solid ${COLORS.neutral[300]}`,
                      flexShrink: 0,
                    }} />
                  )}
                </div>
                {errors.codigoHex && <div className="error">{errors.codigoHex}</div>}
              </FormGroup>
            )}

            {config.fields.logoUrl && (
              <FormGroup>
                <label>URL del Logo</label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/logo.png"
                />
              </FormGroup>
            )}

            {config.fields.ordenVisualizacion && (
              <FormGroup>
                <label>Orden de Visualización</label>
                <input
                  type="number"
                  name="ordenVisualizacion"
                  value={formData.ordenVisualizacion ?? ''}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
                <div className="hint">Orden en listas y dropdowns (menor = primero)</div>
              </FormGroup>
            )}

            <Actions>
              <Button type="button" $variant="secondary" onClick={() => onClose(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" $variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </Actions>
          </ModalContent>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CatalogModal;
