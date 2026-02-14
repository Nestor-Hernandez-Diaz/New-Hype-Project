package com.newhype.backend.service;

import com.newhype.backend.dto.producto.*;
import com.newhype.backend.entity.ImagenProducto;
import com.newhype.backend.entity.Producto;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.ImagenProductoRepository;
import com.newhype.backend.repository.ProductoRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final ImagenProductoRepository imagenProductoRepository;

    public ProductoService(ProductoRepository productoRepository,
                           ImagenProductoRepository imagenProductoRepository) {
        this.productoRepository = productoRepository;
        this.imagenProductoRepository = imagenProductoRepository;
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        if (productoRepository.existsByTenantIdAndSku(tenantId, request.getSku())) {
            throw new IllegalArgumentException("Ya existe un producto con SKU: " + request.getSku());
        }

        String slug = request.getNombre().toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        Producto producto = Producto.builder()
                .tenantId(tenantId)
                .sku(request.getSku())
                .nombre(request.getNombre())
                .slug(slug)
                .descripcion(request.getDescripcion())
                .categoriaId(request.getCategoriaId())
                .tallaId(request.getTallaId())
                .colorId(request.getColorId())
                .marcaId(request.getMarcaId())
                .materialId(request.getMaterialId())
                .generoId(request.getGeneroId())
                .unidadMedidaId(request.getUnidadMedidaId())
                .codigoBarras(request.getCodigoBarras())
                .imagenUrl(request.getImagenUrl())
                .precioCosto(request.getPrecioCosto())
                .precioVenta(request.getPrecioVenta())
                .stockMinimo(request.getStockMinimo())
                .controlaInventario(request.getControlaInventario())
                .build();

        producto = productoRepository.save(producto);
        return toResponse(producto);
    }

    @Transactional(readOnly = true)
    public Page<ProductoResponse> listar(String nombre, Long categoriaId, Pageable pageable) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Specification<Producto> spec = Specification.where(tenantIdEquals(tenantId))
                .and(estadoActivo());

        if (nombre != null && !nombre.isBlank()) {
            spec = spec.and(nombreContains(nombre));
        }
        if (categoriaId != null) {
            spec = spec.and(categoriaIdEquals(categoriaId));
        }

        return productoRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerPorId(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Producto producto = productoRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        return toResponse(producto);
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Producto producto = productoRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));

        producto.setSku(request.getSku());
        producto.setNombre(request.getNombre());
        producto.setSlug(request.getNombre().toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", ""));
        producto.setDescripcion(request.getDescripcion());
        producto.setCategoriaId(request.getCategoriaId());
        producto.setTallaId(request.getTallaId());
        producto.setColorId(request.getColorId());
        producto.setMarcaId(request.getMarcaId());
        producto.setMaterialId(request.getMaterialId());
        producto.setGeneroId(request.getGeneroId());
        producto.setUnidadMedidaId(request.getUnidadMedidaId());
        producto.setCodigoBarras(request.getCodigoBarras());
        producto.setImagenUrl(request.getImagenUrl());
        producto.setPrecioCosto(request.getPrecioCosto());
        producto.setPrecioVenta(request.getPrecioVenta());
        producto.setStockMinimo(request.getStockMinimo());
        producto.setControlaInventario(request.getControlaInventario());

        producto = productoRepository.save(producto);
        return toResponse(producto);
    }

    @Transactional
    public void eliminar(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Producto producto = productoRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        producto.setEstado(false);
        productoRepository.save(producto);
    }

    // ── New endpoints ──

    @Transactional
    public ProductoResponse cambiarEstado(Long id, EstadoRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Producto producto = productoRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
        producto.setEstado(request.getEstado());
        producto = productoRepository.save(producto);
        return toResponse(producto);
    }

    @Transactional(readOnly = true)
    public Page<ProductoResponse> buscar(String q, int page, int size) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("nombre").ascending());
        return productoRepository.buscar(tenantId, q, pageable).map(this::toResponse);
    }

    @Transactional
    public int marcarLiquidacion(LiquidacionRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return productoRepository.marcarLiquidacion(
                tenantId,
                request.getProductoIds(),
                request.getPorcentaje(),
                request.getFechaInicio(),
                request.getFechaFin()
        );
    }

    @Transactional(readOnly = true)
    public List<ImagenResponse> listarImagenes(Long productoId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        productoRepository.findByIdAndTenantId(productoId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productoId));

        return imagenProductoRepository.findByProductoIdOrderByOrdenAsc(productoId)
                .stream()
                .map(this::toImagenResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ImagenResponse agregarImagen(Long productoId, ImagenResponse request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        productoRepository.findByIdAndTenantId(productoId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productoId));

        ImagenProducto imagen = ImagenProducto.builder()
                .productoId(productoId)
                .url(request.getUrl())
                .altText(request.getAltText())
                .orden(request.getOrden())
                .esPrincipal(request.getEsPrincipal())
                .build();

        imagen = imagenProductoRepository.save(imagen);
        return toImagenResponse(imagen);
    }

    @Transactional
    public void eliminarImagen(Long productoId, Long imagenId) {
        Long tenantId = TenantContext.getCurrentTenantId();
        productoRepository.findByIdAndTenantId(productoId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", productoId));

        ImagenProducto imagen = imagenProductoRepository.findByIdAndProductoId(imagenId, productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Imagen", imagenId));

        imagenProductoRepository.delete(imagen);
    }

    // ── Specifications ──

    private Specification<Producto> tenantIdEquals(Long tenantId) {
        return (root, query, cb) -> cb.equal(root.get("tenantId"), tenantId);
    }

    private Specification<Producto> estadoActivo() {
        return (root, query, cb) -> cb.equal(root.get("estado"), true);
    }

    private Specification<Producto> nombreContains(String nombre) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("nombre")), "%" + nombre.toLowerCase() + "%");
    }

    private Specification<Producto> categoriaIdEquals(Long categoriaId) {
        return (root, query, cb) -> cb.equal(root.get("categoriaId"), categoriaId);
    }

    // ── Mappers ──

    private ProductoResponse toResponse(Producto p) {
        return ProductoResponse.builder()
                .id(p.getId())
                .sku(p.getSku())
                .nombre(p.getNombre())
                .slug(p.getSlug())
                .descripcion(p.getDescripcion())
                .categoriaId(p.getCategoriaId())
                .categoriaNombre(p.getCategoria() != null ? p.getCategoria().getNombre() : null)
                .tallaId(p.getTallaId())
                .colorId(p.getColorId())
                .marcaId(p.getMarcaId())
                .materialId(p.getMaterialId())
                .generoId(p.getGeneroId())
                .unidadMedidaId(p.getUnidadMedidaId())
                .codigoBarras(p.getCodigoBarras())
                .imagenUrl(p.getImagenUrl())
                .precioCosto(p.getPrecioCosto())
                .precioVenta(p.getPrecioVenta())
                .stockMinimo(p.getStockMinimo())
                .controlaInventario(p.getControlaInventario())
                .enLiquidacion(p.getEnLiquidacion())
                .porcentajeLiquidacion(p.getPorcentajeLiquidacion())
                .estado(p.getEstado())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private ImagenResponse toImagenResponse(ImagenProducto img) {
        return ImagenResponse.builder()
                .id(img.getId())
                .productoId(img.getProductoId())
                .url(img.getUrl())
                .altText(img.getAltText())
                .orden(img.getOrden())
                .esPrincipal(img.getEsPrincipal())
                .createdAt(img.getCreatedAt())
                .build();
    }
}
