package com.newhype.backend.repository;

import com.newhype.backend.entity.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long>, JpaSpecificationExecutor<Producto> {

    Page<Producto> findByTenantIdAndEstadoTrue(Long tenantId, Pageable pageable);

    Optional<Producto> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndSku(Long tenantId, String sku);

    @Query("SELECT p FROM Producto p WHERE p.tenantId = :tenantId AND p.estado = true " +
           "AND (LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Producto> buscar(@Param("tenantId") Long tenantId, @Param("q") String q, Pageable pageable);

    @Modifying
    @Query("UPDATE Producto p SET p.enLiquidacion = true, p.porcentajeLiquidacion = :porcentaje, " +
           "p.fechaInicioLiquidacion = :fechaInicio, p.fechaFinLiquidacion = :fechaFin, " +
           "p.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE p.tenantId = :tenantId AND p.id IN :ids AND p.estado = true")
    int marcarLiquidacion(@Param("tenantId") Long tenantId,
                          @Param("ids") List<Long> ids,
                          @Param("porcentaje") BigDecimal porcentaje,
                          @Param("fechaInicio") LocalDate fechaInicio,
                          @Param("fechaFin") LocalDate fechaFin);
}
