import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useProducts } from '../context/ProductContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiService } from '../../../utils/api';
import configuracionApi from '../../configuration/services/configuracionApi';
import { verificarCodigoProducto } from '../services/productosRealApi';
import type { ProductCategory, UnitOfMeasure } from '../../configuration/types/configuracion';
import type { CatalogItem } from '../../configuration/services/configuracionApi';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, Z_INDEX, TRANSITIONS } from '../../../styles/theme';
import { Button, Input, Select, Label, RequiredMark, ValidationMessage, ButtonGroup } from '../../../components/shared';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.modal};
  padding: ${SPACING.lg};
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const ModalWrapper = styled.div`
  position: relative;
  max-width: 900px;
  width: 95vw;
  max-height: 85vh;
  background: white;
  border-radius: ${BORDER_RADIUS.md};
  box-shadow: ${SHADOWS.xl};
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100vw;
    max-height: 95vh;
    border-radius: 0;
  }
`;

const ModalContent = styled.div`
  max-height: 85vh;
  overflow-y: auto;
  padding: ${SPACING.xl};
  
  @media (max-width: 768px) {
    max-height: 95vh;
    padding: ${SPACING.md};
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xl};
  padding-bottom: ${SPACING.md};
  border-bottom: 2px solid ${COLORS.border};
  
  h2 {
    font-size: ${TYPOGRAPHY.fontSize.h3};
    color: ${COLORS.text.primary};
    margin: 0;
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${COLORS.text.muted};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS.sm};
  transition: ${TRANSITIONS.fast};
  
  &:hover {
    background: ${COLORS.background};
    color: ${COLORS.text.primary};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${SPACING.lg};
  margin-bottom: ${SPACING.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${SPACING.md};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FullWidthGroup = styled(FormGroup)`
  grid-column: 1 / -1;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: ${SPACING.sm};
  border: 2px solid ${COLORS.border};
  border-radius: ${BORDER_RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.body};
  font-family: ${TYPOGRAPHY.fontFamily};
  resize: vertical;
  min-height: 80px;
  transition: ${TRANSITIONS.normal};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.primary}1a;
  }
`;

const CharCounter = styled.small`
  color: ${COLORS.text.muted};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  margin-top: ${SPACING.xs};
  display: block;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const StatusIcon = styled.span<{ $type: 'loading' | 'success' | 'error' }>`
  position: absolute;
  right: ${SPACING.sm};
  top: 38px;
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${props => 
    props.$type === 'loading' ? COLORS.text.muted :
    props.$type === 'success' ? COLORS.success :
    COLORS.danger
  };
`;

interface ProductFormData {
  productCode: string;
  productName: string;
  descripcion: string;
  category: string;
  costPrice: string;
  price: string;
  unit: string;
  minStock: string;
  talla: string;
  color: string;
  marca: string;
  material: string;
  genero: string;
  imagenUrl: string;
}

// Fallback options used only if API catalog is empty
const TALLA_OPTIONS_FALLBACK = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único', 'Ajustable'] as const;
const GENERO_OPTIONS_FALLBACK = [
  { value: 'MUJER', label: 'Mujer' },
  { value: 'HOMBRE', label: 'Hombre' },
  { value: 'UNISEX', label: 'Unisex' },
  { value: 'NIÑO', label: 'Niño' },
] as const;

interface NuevoProductoModalProps {
  onClose: () => void;
}

const NuevoProductoModal: React.FC<NuevoProductoModalProps> = ({ onClose }) => {
  const { addProduct } = useProducts();
  const { showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [codigoExists, setCodigoExists] = useState(false);
  const [checkingCodigo, setCheckingCodigo] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    productCode: '',
    productName: '',
    descripcion: '',
    category: '',
    costPrice: '',
    price: '',
    unit: '',
    minStock: '',
    talla: '',
    color: '',
    marca: '',
    material: '',
    genero: '',
    imagenUrl: ''
  });
  const [categorias, setCategorias] = useState<ProductCategory[]>([]);
  const [unidades, setUnidades] = useState<UnitOfMeasure[]>([]);
  const [tallasApi, setTallasApi] = useState<CatalogItem[]>([]);
  const [coloresApi, setColoresApi] = useState<CatalogItem[]>([]);
  const [marcasApi, setMarcasApi] = useState<CatalogItem[]>([]);
  const [materialesApi, setMaterialesApi] = useState<CatalogItem[]>([]);
  const [generosApi, setGenerosApi] = useState<CatalogItem[]>([]);

  // Cargar maestros de configuración
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, units, tallas, colores, marcas, materiales, generos] = await Promise.all([
          configuracionApi.getActiveCategories(),
          configuracionApi.getActiveUnits(),
          configuracionApi.getTallas().catch(() => []),
          configuracionApi.getColores().catch(() => []),
          configuracionApi.getMarcas().catch(() => []),
          configuracionApi.getMateriales().catch(() => []),
          configuracionApi.getGeneros().catch(() => []),
        ]);
        if (mounted) {
          setCategorias(cats);
          setUnidades(units);
          setTallasApi(tallas.filter(t => t.estado));
          setColoresApi(colores.filter(c => c.estado));
          setMarcasApi(marcas.filter(m => m.estado));
          setMaterialesApi(materiales.filter(m => m.estado));
          setGenerosApi(generos.filter(g => g.estado));
          console.log('[NuevoProductoModal] Maestros cargados:', { categorias: cats.length, unidades: units.length, tallas: tallas.length, colores: colores.length, marcas: marcas.length, materiales: materiales.length, generos: generos.length });
        }
      } catch (e) {
        console.error('[NuevoProductoModal] Error cargando maestros:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Cargar almacenes
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apiService.getWarehouses();
        console.log('[NuevoProductoModal] Warehouses full response:', resp);
        console.log('[NuevoProductoModal] Warehouses resp.data:', resp.data);
        
        // La respuesta puede venir de varias formas según el ResponseHelper del backend
        const respData = resp.data as any;
        let list: any[] = [];
        
        if (respData?.data?.rows) {
          list = respData.data.rows;
        } else if (respData?.rows) {
          list = respData.rows;
        } else if (respData?.warehouses) {
          list = respData.warehouses;
        } else if (Array.isArray(respData)) {
          list = respData;
        }
        
        console.log('[NuevoProductoModal] Parsed warehouse list:', list);
        
        if (Array.isArray(list) && list.length > 0 && mounted) {
          // Filtrar solo almacenes activos
          const activeWarehouses = list.filter((w: any) => w.activo !== false);
          setWarehouseOptions(activeWarehouses.map((w: any) => ({ id: w.id, name: w.nombre })));
          console.log('[NuevoProductoModal] Warehouses loaded:', activeWarehouses.length);
        }
      } catch (e) {
        console.error('[NuevoProductoModal] Error loading warehouses:', e);
        console.warn('[NuevoProductoModal] Usando fallback warehouses');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Opciones de categorías desde maestros (con ID para enviar al backend)
  const categoryOptions = useMemo(() => {
    return categorias
      .map(c => ({ id: String(c.id), nombre: c.nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [categorias]);

  // Opciones de unidades desde maestros (con ID para enviar al backend)
  const unitOptions = useMemo(() => {
    return unidades
      .map(u => ({ id: String(u.id), nombre: u.nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [unidades]);

  // Función debounced para verificar código único
  const checkCodigoUnique = useCallback(
    async (codigo: string) => {
      if (codigo.length < 2) {
        setCodigoExists(false);
        return;
      }

      setCheckingCodigo(true);
      try {
        const exists = await verificarCodigoProducto(codigo);
        setCodigoExists(exists);

        if (exists) {
          setErrors(prev => ({
            ...prev,
            productCode: `El código "${codigo}" ya existe`
          }));
        }
      } catch (error) {
        setCodigoExists(false);
      } finally {
        setCheckingCodigo(false);
      }
    },
    []
  );

  // Debounce timer para evitar múltiples llamadas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.productCode) {
        checkCodigoUnique(formData.productCode);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.productCode, checkCodigoUnique]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Limpiar error de código duplicado cuando el usuario cambia el código
    if (name === 'productCode') {
      setCodigoExists(false);
      if (errors.productCode && errors.productCode.includes('ya existe')) {
        setErrors(prev => ({ ...prev, productCode: undefined }));
      }
    }

    if (name === 'price' && value) {
      const price = Number(value);
      if (isNaN(price) || price <= 0) {
        setErrors(prev => ({ ...prev, price: 'El precio debe ser mayor a 0' }));
      }
    }

    if (name === 'costPrice' && value) {
      const costPrice = Number(value);
      if (isNaN(costPrice) || costPrice < 0) {
        setErrors(prev => ({ ...prev, costPrice: 'El precio de costo debe ser ≥ 0' }));
      }
    }

    if (name === 'minStock' && value) {
      const minStock = Number(value);
      if (isNaN(minStock) || minStock < 0 || !Number.isInteger(minStock)) {
        setErrors(prev => ({ ...prev, minStock: 'El stock mínimo debe ser entero ≥ 0' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string | undefined> = {};

    if (!formData.productCode.trim()) newErrors.productCode = 'El código es requerido';
    else if (codigoExists) newErrors.productCode = `El código "${formData.productCode}" ya existe`;
    
    if (!formData.productName.trim()) newErrors.productName = 'El nombre es requerido';
    if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';

    if (!formData.price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else {
      const price = Number(formData.price);
      if (isNaN(price) || price <= 0) newErrors.price = 'Precio inválido';
    }

    if (!formData.costPrice.trim()) {
      newErrors.costPrice = 'El precio de costo es requerido';
    } else {
      const costPrice = Number(formData.costPrice);
      if (isNaN(costPrice) || costPrice < 0) newErrors.costPrice = 'Precio de costo inválido';
    }

    if (!formData.unit.trim()) newErrors.unit = 'La unidad es requerida';

    if (formData.minStock.trim()) {
      const minStock = Number(formData.minStock);
      if (isNaN(minStock) || minStock < 0 || !Number.isInteger(minStock)) {
        newErrors.minStock = 'Stock mínimo inválido';
      }
    }

    if (formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const minStock = formData.minStock.trim() ? parseInt(formData.minStock) : 0;

      // Usar addProduct del contexto que llama a productosRealApi.crearProducto()
      // con el mapping correcto (codigoProducto→sku, categoriaId→categoriaId, etc.)
      await addProduct({
        codigoProducto: formData.productCode,
        nombreProducto: formData.productName,
        descripcion: formData.descripcion.trim() || undefined,
        categoriaId: Number(formData.category),
        unidadMedidaId: Number(formData.unit),
        precioVenta: parseFloat(formData.price),
        precioCosto: parseFloat(formData.costPrice),
        stockMinimo: minStock,
        // Clothing fields: send IDs when from API catalog, strings as fallback
        tallaId: formData.talla && tallasApi.length > 0 ? Number(formData.talla) : undefined,
        talla: formData.talla && tallasApi.length === 0 ? formData.talla : undefined,
        colorId: formData.color && coloresApi.length > 0 ? Number(formData.color) : undefined,
        color: formData.color && coloresApi.length === 0 ? formData.color.trim() : undefined,
        marcaId: formData.marca && marcasApi.length > 0 ? Number(formData.marca) : undefined,
        marca: formData.marca && marcasApi.length === 0 ? formData.marca.trim() : undefined,
        materialId: formData.material && materialesApi.length > 0 ? Number(formData.material) : undefined,
        material: formData.material && materialesApi.length === 0 ? formData.material.trim() : undefined,
        generoId: formData.genero && generosApi.length > 0 ? Number(formData.genero) : undefined,
        genero: formData.genero && generosApi.length === 0 ? formData.genero : undefined,
        imagenUrl: formData.imagenUrl.trim() || undefined,
      } as any);

      onClose();
    } catch (err) {
      // El contexto ya muestra la notificación de error
      console.error('Error creando producto:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalWrapper>
        <ModalContent>
          <ModalHeader>
            <h2>Crear Nuevo Producto</h2>
            <CloseButton onClick={onClose} type="button">
              ×
            </CloseButton>
          </ModalHeader>
          <form onSubmit={handleSubmit}>
            <FormGrid>
        <FormGroup>
          <Label htmlFor="productCode">
            Código
            <RequiredMark />
          </Label>
          <InputWrapper>
            <Input 
              id="productCode" 
              name="productCode" 
              type="text" 
              value={formData.productCode} 
              onChange={handleInputChange}
              style={{
                borderColor: codigoExists ? COLORS.danger : (formData.productCode && !checkingCodigo && !codigoExists) ? COLORS.success : undefined,
                paddingRight: '30px'
              }}
            />
            {checkingCodigo && <StatusIcon $type="loading">⏳</StatusIcon>}
            {!checkingCodigo && formData.productCode && codigoExists && <StatusIcon $type="error">✗</StatusIcon>}
            {!checkingCodigo && formData.productCode && !codigoExists && <StatusIcon $type="success">✓</StatusIcon>}
          </InputWrapper>
          {errors.productCode && <ValidationMessage $type="error">{errors.productCode}</ValidationMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="productName">
            Nombre
            <RequiredMark />
          </Label>
          <Input id="productName" name="productName" type="text" value={formData.productName} onChange={handleInputChange} />
          {errors.productName && <ValidationMessage $type="error">{errors.productName}</ValidationMessage>}
        </FormGroup>
        <FullWidthGroup>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea 
            id="descripcion" 
            name="descripcion" 
            maxLength={500}
            value={formData.descripcion} 
            onChange={handleInputChange}
            placeholder="Descripción detallada del producto (opcional, máx 500 caracteres)"
          />
          <CharCounter>
            {formData.descripcion.length}/500 caracteres
          </CharCounter>
          {errors.descripcion && <ValidationMessage $type="error">{errors.descripcion}</ValidationMessage>}
        </FullWidthGroup>
        <FormGroup>
          <Label htmlFor="category">
            Categoría
            <RequiredMark />
          </Label>
          <Select id="category" name="category" value={formData.category} onChange={handleInputChange}>
            <option value="">Selecciona una categoría</option>
            {categoryOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.nombre}</option>
            ))}
          </Select>
          {errors.category && <ValidationMessage $type="error">{errors.category}</ValidationMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="costPrice">
            Precio de Costo
            <RequiredMark />
          </Label>
          <Input id="costPrice" name="costPrice" type="number" step="0.01" min="0" value={formData.costPrice} onChange={handleInputChange} />
          {errors.costPrice && <ValidationMessage $type="error">{errors.costPrice}</ValidationMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="price">
            Precio de Venta
            <RequiredMark />
          </Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} />
          {errors.price && <ValidationMessage $type="error">{errors.price}</ValidationMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="unit">
            Unidad
            <RequiredMark />
          </Label>
          <Select id="unit" name="unit" value={formData.unit} onChange={handleInputChange}>
            <option value="">Selecciona unidad</option>
            {unitOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.nombre}</option>
            ))}
          </Select>
          {errors.unit && <ValidationMessage $type="error">{errors.unit}</ValidationMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="minStock">Stock Mínimo</Label>
          <Input 
            id="minStock" 
            name="minStock" 
            type="number" 
            min="0" 
            value={formData.minStock} 
            onChange={handleInputChange}
            placeholder="Opcional: alertas de stock bajo"
          />
          {errors.minStock && <ValidationMessage $type="error">{errors.minStock}</ValidationMessage>}
        </FormGroup>
      </FormGrid>

      <FullWidthGroup style={{ marginTop: SPACING.md }}>
        <Label style={{ fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: 600, color: COLORS.text.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Atributos de Producto (Ropa)
        </Label>
      </FullWidthGroup>
      <FormGrid>
        <FormGroup>
          <Label htmlFor="talla">Talla</Label>
          <Select id="talla" name="talla" value={formData.talla} onChange={handleInputChange}>
            <option value="">Sin talla</option>
            {tallasApi.length > 0
              ? tallasApi.map(t => (
                  <option key={t.id} value={String(t.id)}>{t.codigo}{t.nombre ? ` - ${t.nombre}` : ''}</option>
                ))
              : TALLA_OPTIONS_FALLBACK.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))
            }
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="genero">Género</Label>
          <Select id="genero" name="genero" value={formData.genero} onChange={handleInputChange}>
            <option value="">Sin género</option>
            {generosApi.length > 0
              ? generosApi.map(g => (
                  <option key={g.id} value={String(g.id)}>{g.codigo}{g.nombre ? ` - ${g.nombre}` : ''}</option>
                ))
              : GENERO_OPTIONS_FALLBACK.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))
            }
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="color">Color</Label>
          {coloresApi.length > 0 ? (
            <Select id="color" name="color" value={formData.color} onChange={handleInputChange}>
              <option value="">Sin color</option>
              {coloresApi.map(c => (
                <option key={c.id} value={String(c.id)}>{c.codigo}{c.nombre ? ` - ${c.nombre}` : ''}</option>
              ))}
            </Select>
          ) : (
            <Input id="color" name="color" type="text" value={formData.color} onChange={handleInputChange} placeholder="Ej: Negro, Blanco" />
          )}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="marca">Marca</Label>
          {marcasApi.length > 0 ? (
            <Select id="marca" name="marca" value={formData.marca} onChange={handleInputChange}>
              <option value="">Sin marca</option>
              {marcasApi.map(m => (
                <option key={m.id} value={String(m.id)}>{m.codigo}{m.nombre ? ` - ${m.nombre}` : ''}</option>
              ))}
            </Select>
          ) : (
            <Input id="marca" name="marca" type="text" value={formData.marca} onChange={handleInputChange} placeholder="Ej: New Hype, Nike" />
          )}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="material">Material</Label>
          {materialesApi.length > 0 ? (
            <Select id="material" name="material" value={formData.material} onChange={handleInputChange}>
              <option value="">Sin material</option>
              {materialesApi.map(m => (
                <option key={m.id} value={String(m.id)}>{m.codigo}{m.nombre ? ` - ${m.nombre}` : ''}</option>
              ))}
            </Select>
          ) : (
            <Input id="material" name="material" type="text" value={formData.material} onChange={handleInputChange} placeholder="Ej: Algodón 100%" />
          )}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="imagenUrl">URL de Imagen</Label>
          <Input id="imagenUrl" name="imagenUrl" type="url" value={formData.imagenUrl} onChange={handleInputChange} placeholder="https://ejemplo.com/imagen.jpg" />
        </FormGroup>
      </FormGrid>
      <ButtonGroup style={{ justifyContent: 'flex-end', marginTop: SPACING.xl, paddingTop: SPACING.lg, borderTop: `1px solid ${COLORS.border}` }}>
        <Button type="button" $variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button 
          type="submit" 
          $variant="primary" 
          disabled={isSubmitting || checkingCodigo || codigoExists}
        >
          {isSubmitting ? 'Guardando...' : checkingCodigo ? 'Verificando...' : 'Registrar'}
        </Button>
      </ButtonGroup>
    </form>
        </ModalContent>
      </ModalWrapper>
    </ModalOverlay>
  );
};

export default NuevoProductoModal;