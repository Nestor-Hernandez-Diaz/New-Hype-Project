import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { Button } from '../../../components/shared/Button';
import { Input } from '../../../components/shared/Input';
import { Label } from '../../../components/shared/Label';
import { getProductImages, addProductImage, deleteProductImage } from '../services/productosRealApi';
import type { ProductImage, AddImageInput } from '../services/productosRealApi';

// ============================================================================
// Animations
// ============================================================================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// ============================================================================
// Styled Components
// ============================================================================

const Container = styled.div`
  animation: ${fadeIn} 0.3s ease;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.md};
`;

const SectionTitle = styled.h3`
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
`;

const ImageCount = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text.secondary};
  background: ${COLORS.neutral[100]};
  padding: 2px ${SPACING.sm};
  border-radius: ${BORDER_RADIUS.full};
`;

const SectionSubtitle = styled.p`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.secondary};
  margin: 0 0 ${SPACING.lg} 0;
`;

const AddImageSection = styled.div`
  background: ${COLORS.neutral[50]};
  border: 2px dashed ${COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.lg};
  padding: ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
  transition: ${TRANSITIONS.normal};

  &:focus-within {
    border-color: ${COLOR_SCALES.primary[300]};
    background: ${COLOR_SCALES.primary[50]}33;
  }
`;

const AddImageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: ${SPACING.lg};
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm};
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: ${SPACING.md};
  align-items: end;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${SPACING.sm};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.primary};
  cursor: pointer;
  padding: ${SPACING.xs} 0;

  input[type="checkbox"] {
    accent-color: ${COLOR_SCALES.primary[500]};
    width: 16px;
    height: 16px;
  }
`;

const PreviewPanel = styled.div<{ $hasImage: boolean }>`
  width: 180px;
  height: 140px;
  border-radius: ${BORDER_RADIUS.lg};
  overflow: hidden;
  border: 2px solid ${props => props.$hasImage ? COLOR_SCALES.primary[200] : COLORS.neutral[200]};
  background: ${COLORS.neutral[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${TRANSITIONS.normal};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 180px;
  }
`;

const PreviewPlaceholder = styled.div`
  text-align: center;
  padding: ${SPACING.md};
  color: ${COLORS.text.muted};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  line-height: 1.4;
`;

const ValidationStatus = styled.div<{ $type: 'success' | 'error' | 'loading' }>`
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  margin-top: 2px;
  color: ${props => {
    switch (props.$type) {
      case 'success': return COLOR_SCALES.success[600];
      case 'error': return COLOR_SCALES.danger[600];
      case 'loading': return COLOR_SCALES.warning[600];
    }
  }};
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${SPACING.md};
`;

const ImageCard = styled.div<{ $isPrimary?: boolean; $isDragging?: boolean; $isDragOver?: boolean }>`
  position: relative;
  border-radius: ${BORDER_RADIUS.lg};
  overflow: hidden;
  border: 2px solid ${props => {
    if (props.$isDragOver) return COLOR_SCALES.primary[400];
    if (props.$isPrimary) return COLOR_SCALES.primary[500];
    return COLORS.neutral[200];
  }};
  background: ${props => props.$isDragOver ? COLOR_SCALES.primary[50] : COLORS.neutral[50]};
  box-shadow: ${props => props.$isDragging ? SHADOWS.lg : SHADOWS.sm};
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  cursor: grab;
  user-select: none;

  &:hover {
    box-shadow: ${SHADOWS.md};
  }

  &:active {
    cursor: grabbing;
  }
`;

const DragHandle = styled.div`
  position: absolute;
  top: ${SPACING.xs};
  left: ${SPACING.xs};
  background: rgba(0, 0, 0, 0.55);
  color: white;
  padding: 2px 6px;
  border-radius: ${BORDER_RADIUS.sm};
  font-size: 10px;
  z-index: 2;
  opacity: 0;
  transition: ${TRANSITIONS.fast};
  pointer-events: none;

  ${ImageCard}:hover & {
    opacity: 1;
  }
`;

const PrimaryRibbon = styled.div`
  position: absolute;
  top: ${SPACING.xs};
  right: ${SPACING.xs};
  background: ${COLOR_SCALES.primary[500]};
  color: white;
  padding: 3px ${SPACING.sm};
  border-radius: ${BORDER_RADIUS.full};
  font-size: 11px;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: ${SHADOWS.sm};
`;

const ImagePreviewArea = styled.div`
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: ${COLORS.neutral[100]};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const ImageErrorPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${SPACING.xs};
  color: ${COLORS.text.muted};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  padding: ${SPACING.md};
  text-align: center;
`;

const ImageInfo = styled.div`
  padding: ${SPACING.sm} ${SPACING.md};
  min-height: 28px;
`;

const AltText = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ImageActions = styled.div`
  display: flex;
  gap: ${SPACING.xs};
  padding: ${SPACING.xs} ${SPACING.md} ${SPACING.sm};
`;

const SetPrimaryButton = styled.button<{ $isActive?: boolean }>`
  flex: 1;
  padding: 6px ${SPACING.sm};
  border: 2px solid ${props => props.$isActive ? COLOR_SCALES.primary[400] : COLOR_SCALES.warning[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  cursor: ${props => props.$isActive ? 'default' : 'pointer'};
  transition: ${TRANSITIONS.default};
  background: ${props => props.$isActive ? COLOR_SCALES.primary[50] : COLOR_SCALES.warning[50]};
  color: ${props => props.$isActive ? COLOR_SCALES.primary[700] : COLOR_SCALES.warning[700]};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &:hover:not(:disabled) {
    ${props => !props.$isActive && `
      background: ${COLOR_SCALES.warning[100]};
      border-color: ${COLOR_SCALES.warning[400]};
    `}
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeleteButton = styled.button`
  padding: 6px ${SPACING.sm};
  border: 1px solid ${COLOR_SCALES.danger[200]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  cursor: pointer;
  transition: ${TRANSITIONS.default};
  background: ${COLOR_SCALES.danger[50]};
  color: ${COLOR_SCALES.danger[600]};

  &:hover:not(:disabled) {
    background: ${COLOR_SCALES.danger[100]};
    border-color: ${COLOR_SCALES.danger[300]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyImages = styled.div`
  text-align: center;
  padding: ${SPACING['2xl']};
  color: ${COLORS.text.secondary};
  background: ${COLORS.neutral[50]};
  border-radius: ${BORDER_RADIUS.lg};
  border: 2px dashed ${COLORS.neutral[300]};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${SPACING.xl};
  color: ${COLOR_SCALES.primary[500]};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  animation: ${pulse} 1.5s ease infinite;
`;

// ============================================================================
// URL Validation Helper
// ============================================================================

function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url.trim()) {
      resolve(false);
      return;
    }
    try {
      new URL(url);
    } catch {
      resolve(false);
      return;
    }
    const img = new Image();
    const timer = setTimeout(() => {
      img.onload = null;
      img.onerror = null;
      resolve(false);
    }, 8000);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = url;
  });
}

// ============================================================================
// Component
// ============================================================================

interface ProductImageManagerProps {
  productoId: number;
}

const ProductImageManager: React.FC<ProductImageManagerProps> = ({ productoId }) => {
  const { showSuccess, showError } = useNotification();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [settingPrimary, setSettingPrimary] = useState<number | null>(null);

  // Add form state
  const [newUrl, setNewUrl] = useState('');
  const [newAltText, setNewAltText] = useState('');
  const [makePrimary, setMakePrimary] = useState(false);

  // URL validation
  const [urlValidation, setUrlValidation] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const validationTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // ------- Data fetching -------

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProductImages(productoId);
      setImages(data.sort((a, b) => a.orden - b.orden));
    } catch (error: any) {
      showError(error.message || 'Error al cargar imágenes');
    } finally {
      setLoading(false);
    }
  }, [productoId]);

  useEffect(() => {
    if (productoId) fetchImages();
  }, [productoId, fetchImages]);

  // ------- URL Validation with debounce -------

  useEffect(() => {
    if (!newUrl.trim()) {
      setUrlValidation('idle');
      setPreviewSrc(null);
      return;
    }

    // Basic URL format check
    try {
      new URL(newUrl);
    } catch {
      setUrlValidation('invalid');
      setPreviewSrc(null);
      return;
    }

    setUrlValidation('validating');
    if (validationTimerRef.current) clearTimeout(validationTimerRef.current);

    validationTimerRef.current = setTimeout(() => {
      validateImageUrl(newUrl).then(isValid => {
        setUrlValidation(isValid ? 'valid' : 'invalid');
        setPreviewSrc(isValid ? newUrl : null);
      });
    }, 500);

    return () => {
      if (validationTimerRef.current) clearTimeout(validationTimerRef.current);
    };
  }, [newUrl]);

  // ------- Add Image -------

  const handleAddImage = async () => {
    if (!newUrl.trim()) {
      showError('La URL de la imagen es requerida');
      return;
    }

    if (urlValidation === 'invalid') {
      showError('La URL no corresponde a una imagen válida. Verifica el enlace.');
      return;
    }

    setAdding(true);
    try {
      const input: AddImageInput = {
        url: newUrl.trim(),
        altText: newAltText.trim() || undefined,
        orden: images.length,
        esPrincipal: makePrimary || images.length === 0,
      };
      await addProductImage(productoId, input);
      showSuccess('Imagen agregada correctamente');
      setNewUrl('');
      setNewAltText('');
      setMakePrimary(false);
      setUrlValidation('idle');
      setPreviewSrc(null);
      fetchImages();
    } catch (error: any) {
      showError(error.message || 'Error al agregar imagen');
    } finally {
      setAdding(false);
    }
  };

  // ------- Delete Image -------

  const handleDeleteImage = async (imagenId: number) => {
    if (!window.confirm('¿Eliminar esta imagen del producto?')) return;

    try {
      await deleteProductImage(productoId, imagenId);
      showSuccess('Imagen eliminada');
      fetchImages();
    } catch (error: any) {
      showError(error.message || 'Error al eliminar imagen');
    }
  };

  // ------- Set as Primary -------

  const handleSetPrimary = async (image: ProductImage) => {
    if (image.esPrincipal) return;

    setSettingPrimary(image.id);
    try {
      // Strategy: delete the target image and re-add with esPrincipal: true
      // The backend should auto-unset the previous primary
      await deleteProductImage(productoId, image.id);
      await addProductImage(productoId, {
        url: image.url,
        altText: image.altText,
        orden: 0,
        esPrincipal: true,
      });
      showSuccess('Imagen marcada como principal');
      fetchImages();
    } catch (error: any) {
      showError(error.message || 'Error al marcar como principal');
      fetchImages();
    } finally {
      setSettingPrimary(null);
    }
  };

  // ------- Drag & Drop -------

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Required for Firefox
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const reordered = [...images];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    setImages(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // ------- Image load error in grid -------

  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

  const handleImageError = (imageId: number) => {
    setBrokenImages(prev => new Set(prev).add(imageId));
  };

  // ------- Render -------

  const isProcessing = adding || settingPrimary !== null;

  return (
    <Container>
      <SectionHeader>
        <SectionTitle>
          Imágenes del Producto
          {images.length > 0 && <ImageCount>{images.length}</ImageCount>}
        </SectionTitle>
      </SectionHeader>
      <SectionSubtitle>
        Agrega URLs de imágenes para el Storefront. Arrastra las tarjetas para reordenar.
      </SectionSubtitle>

      {/* ---------- Add Image Form ---------- */}
      <AddImageSection>
        <AddImageGrid>
          <FormFields>
            <div>
              <Label htmlFor="img-url-add">URL de imagen</Label>
              <Input
                id="img-url-add"
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && urlValidation === 'valid' && handleAddImage()}
                placeholder="https://ejemplo.com/imagen-producto.jpg"
                disabled={isProcessing}
              />
              {urlValidation === 'validating' && (
                <ValidationStatus $type="loading">Validando imagen...</ValidationStatus>
              )}
              {urlValidation === 'valid' && (
                <ValidationStatus $type="success">Imagen válida</ValidationStatus>
              )}
              {urlValidation === 'invalid' && newUrl.trim() && (
                <ValidationStatus $type="error">URL inválida o no es una imagen accesible</ValidationStatus>
              )}
            </div>

            <FormRow>
              <div>
                <Label htmlFor="img-alt-add">Texto alternativo</Label>
                <Input
                  id="img-alt-add"
                  type="text"
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  placeholder="Descripción breve de la imagen"
                  disabled={isProcessing}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.xs }}>
                {images.length > 0 && (
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={makePrimary}
                      onChange={(e) => setMakePrimary(e.target.checked)}
                      disabled={isProcessing}
                    />
                    Imagen principal
                  </CheckboxLabel>
                )}
                <Button
                  type="button"
                  $variant="primary"
                  onClick={handleAddImage}
                  disabled={isProcessing || !newUrl.trim() || urlValidation === 'invalid'}
                  style={{ whiteSpace: 'nowrap', width: '100%' }}
                >
                  {adding ? 'Agregando...' : '+ Agregar imagen'}
                </Button>
              </div>
            </FormRow>
          </FormFields>

          {/* Real-time Preview */}
          <PreviewPanel $hasImage={!!previewSrc}>
            {previewSrc ? (
              <img src={previewSrc} alt="Vista previa" />
            ) : (
              <PreviewPlaceholder>
                {newUrl.trim()
                  ? urlValidation === 'validating'
                    ? 'Cargando vista previa...'
                    : 'No se pudo cargar la imagen'
                  : 'Vista previa aparecerá aquí al ingresar una URL válida'
                }
              </PreviewPlaceholder>
            )}
          </PreviewPanel>
        </AddImageGrid>
      </AddImageSection>

      {/* ---------- Images Grid ---------- */}
      {loading ? (
        <LoadingState>Cargando imágenes del producto...</LoadingState>
      ) : images.length === 0 ? (
        <EmptyImages>
          No hay imágenes registradas.
          <p>Agrega URLs de imágenes para mostrar en el Storefront.</p>
        </EmptyImages>
      ) : (
        <ImagesGrid>
          {images.map((img, index) => (
            <ImageCard
              key={img.id}
              $isPrimary={img.esPrincipal}
              $isDragging={draggedIndex === index}
              $isDragOver={dragOverIndex === index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <DragHandle>&#x2630; Arrastrar</DragHandle>

              {img.esPrincipal && (
                <PrimaryRibbon>&#9733; Principal</PrimaryRibbon>
              )}

              <ImagePreviewArea>
                {brokenImages.has(img.id) ? (
                  <ImageErrorPlaceholder>
                    <span style={{ fontSize: '24px' }}>&#128247;</span>
                    Error al cargar
                  </ImageErrorPlaceholder>
                ) : (
                  <img
                    src={img.url}
                    alt={img.altText || 'Imagen del producto'}
                    onError={() => handleImageError(img.id)}
                  />
                )}
              </ImagePreviewArea>

              <ImageInfo>
                {img.altText && <AltText title={img.altText}>{img.altText}</AltText>}
              </ImageInfo>

              <ImageActions>
                <SetPrimaryButton
                  $isActive={img.esPrincipal}
                  onClick={() => handleSetPrimary(img)}
                  disabled={img.esPrincipal || isProcessing}
                  title={img.esPrincipal ? 'Esta es la imagen principal' : 'Marcar como imagen principal'}
                >
                  {settingPrimary === img.id
                    ? 'Aplicando...'
                    : img.esPrincipal
                      ? '\u2605 Principal'
                      : '\u2606 Hacer principal'}
                </SetPrimaryButton>
                <DeleteButton
                  onClick={() => handleDeleteImage(img.id)}
                  disabled={isProcessing}
                  title="Eliminar imagen"
                >
                  Eliminar
                </DeleteButton>
              </ImageActions>
            </ImageCard>
          ))}
        </ImagesGrid>
      )}
    </Container>
  );
};

export default ProductImageManager;
