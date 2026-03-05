import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useProducts } from '../context/ProductContext';
import type { Producto } from '@monorepo/shared-types';
import { useNotification } from '../../../context/NotificationContext';
import configuracionApi from '../../configuration/services/configuracionApi';
import type { ProductCategory, UnitOfMeasure } from '../../configuration/types/configuracion';
import type { CatalogItem } from '../../configuration/services/configuracionApi';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { Button, Input, Select, Label, RequiredMark, ValidationMessage, ButtonGroup } from '../../../components/shared';
import ProductImageManager from './ProductImageManager';

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.md};
  margin-bottom: ${SPACING.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
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
`;

const SectionDivider = styled.div`
  margin: ${SPACING.xl} 0 ${SPACING.lg};
  padding-top: ${SPACING.lg};
  border-top: 2px solid ${COLOR_SCALES.primary[100]};
`;

interface EditProductFormData {
  productCode: string;
  productName: string;
  descripcion: string;
  category: string;
  costPrice: string;
  price: string;
  currentStock: string;
  unit: string;
  minStock: string;
  talla: string;
  color: string;
  marca: string;
  material: string;
  genero: string;
}

// Fallback options used only if API catalog is empty
const TALLA_OPTIONS_FALLBACK = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Único', 'Ajustable'] as const;
const GENERO_OPTIONS_FALLBACK = [
  { value: 'MUJER', label: 'Mujer' },
  { value: 'HOMBRE', label: 'Hombre' },
  { value: 'UNISEX', label: 'Unisex' },
  { value: 'NIÑO', label: 'Niño' },
] as const;

interface EditarProductoModalProps {
  product: Producto;
  onClose: () => void;
}

const EditarProductoModal: React.FC<EditarProductoModalProps> = ({ product, onClose }) => {
  const { updateProduct } = useProducts();
  const { showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [categorias, setCategorias] = useState<ProductCategory[]>([]);
  const [unidades, setUnidades] = useState<UnitOfMeasure[]>([]);
  const [tallasApi, setTallasApi] = useState<CatalogItem[]>([]);
  const [coloresApi, setColoresApi] = useState<CatalogItem[]>([]);
  const [marcasApi, setMarcasApi] = useState<CatalogItem[]>([]);
  const [materialesApi, setMaterialesApi] = useState<CatalogItem[]>([]);
  const [generosApi, setGenerosApi] = useState<CatalogItem[]>([]);

  // Extraer valor inicial defensivo para category y unit (usar IDs)
  const initialCategory = product.categoriaId ? String(product.categoriaId) : '';

  const initialUnit = product.unidadMedidaId ? String(product.unidadMedidaId) : '';

  const [formData, setFormData] = useState<EditProductFormData>({
    productCode: product.codigoProducto,
    productName: product.nombreProducto,
    descripcion: product.descripcion || '',
    category: initialCategory,
    costPrice: product.precioCosto?.toString() || '',
    price: product.precioVenta?.toString() || '',
    currentStock: product.stockActual?.toString() || '0',
    unit: initialUnit,
    minStock: product.stockMinimo?.toString() || '',
    // Use catalog IDs if available (from mapBackendProducto), fallback to string values
    talla: (product as any).tallaId ? String((product as any).tallaId) : (product.talla || ''),
    color: (product as any).colorId ? String((product as any).colorId) : (product.color || ''),
    marca: (product as any).marcaId ? String((product as any).marcaId) : (product.marca || ''),
    material: (product as any).materialId ? String((product as any).materialId) : (product.material || ''),
    genero: (product as any).generoId ? String((product as any).generoId) : (product.genero || ''),
  });

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
          console.log('[EditarProductoModal] Maestros cargados:', { categorias: cats.length, unidades: units.length, tallas: tallas.length, colores: colores.length, marcas: marcas.length, materiales: materiales.length, generos: generos.length });
        }
      } catch (e) {
        console.error('[EditarProductoModal] Error cargando maestros:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Opciones de categorías desde maestros (con ID)
  const categoryOptions = useMemo(() => {
    return categorias
      .map(c => ({ id: String(c.id), nombre: c.nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [categorias]);

  // Opciones de unidades desde maestros (con ID)
  const unitOptions = useMemo(() => {
    return unidades
      .map(u => ({ id: String(u.id), nombre: u.nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [unidades]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
      const minStock = formData.minStock.trim() ? parseInt(formData.minStock) : undefined;

      // Usar updateProduct del contexto que llama a productosRealApi.actualizarProducto()
      // con el mapping correcto (categoriaId, unidadMedidaId como números)
      // IMPORTANT: backend PUT requires sku (@NotBlank), so always include codigoProducto
      await updateProduct(String(product.id), {
        codigoProducto: formData.productCode,
        nombreProducto: formData.productName,
        descripcion: formData.descripcion.trim() || undefined,
        categoriaId: Number(formData.category),
        unidadMedidaId: Number(formData.unit),
        precioVenta: parseFloat(formData.price),
        precioCosto: parseFloat(formData.costPrice),
        stockMinimo: minStock,
        activo: product.activo ?? true,
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
      } as any);

      onClose();
    } catch (err) {
      // El contexto ya muestra la notificación de error
      console.error('Error actualizando producto:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit}>
      <FormGrid>
        <FormGroup>
          <Label htmlFor="productCode">Código</Label>
          <Input id="productCode" name="productCode" type="text" value={formData.productCode} disabled />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="productName">
            Nombre
            <RequiredMark />
          </Label>
          <Input id="productName" name="productName" type="text" value={formData.productName} onChange={handleInputChange} />
          {errors.productName && <ValidationMessage $type="error">{errors.productName}</ValidationMessage>}
        </FormGroup>
        <FormGroup style={{ gridColumn: '1 / -1' }}>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea 
            id="descripcion" 
            name="descripcion" 
            rows={3}
            maxLength={500}
            value={formData.descripcion} 
            onChange={handleInputChange}
            placeholder="Descripción detallada del producto (opcional, máx 500 caracteres)"
          />
          <CharCounter>
            {formData.descripcion.length}/500 caracteres
          </CharCounter>
          {errors.descripcion && <ValidationMessage $type="error">{errors.descripcion}</ValidationMessage>}
        </FormGroup>
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
          <Label htmlFor="currentStock">Stock</Label>
          <Input id="currentStock" name="currentStock" type="number" min="0" value={formData.currentStock} disabled />
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
      </FormGrid>
      <ButtonGroup style={{ justifyContent: 'flex-end' }}>
        <Button type="button" $variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" $variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </ButtonGroup>
    </form>

    <SectionDivider>
      <ProductImageManager productoId={Number(product.id)} />
    </SectionDivider>
    </>
  );
};

export default EditarProductoModal;