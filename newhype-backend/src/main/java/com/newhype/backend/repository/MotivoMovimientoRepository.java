package com.newhype.backend.repository;

import com.newhype.backend.entity.MotivoMovimiento;
import com.newhype.backend.entity.MotivoMovimiento.TipoMotivo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MotivoMovimientoRepository extends JpaRepository<MotivoMovimiento, Long> {

    List<MotivoMovimiento> findByTenantId(Long tenantId);

    List<MotivoMovimiento> findByTenantIdAndTipo(Long tenantId, TipoMotivo tipo);

    List<MotivoMovimiento> findByTenantIdAndEstadoTrue(Long tenantId);

    Optional<MotivoMovimiento> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndCodigo(Long tenantId, String codigo);
}
