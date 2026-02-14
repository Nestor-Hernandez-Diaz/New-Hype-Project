package com.newhype.backend.repository;

import com.newhype.backend.entity.SerieComprobante;
import com.newhype.backend.entity.SerieComprobante.TipoComprobante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SerieComprobanteRepository extends JpaRepository<SerieComprobante, Long> {

    List<SerieComprobante> findByTenantId(Long tenantId);

    List<SerieComprobante> findByTenantIdAndTipoComprobante(Long tenantId, TipoComprobante tipoComprobante);

    Optional<SerieComprobante> findByIdAndTenantId(Long id, Long tenantId);

    boolean existsByTenantIdAndTipoComprobanteAndSerie(Long tenantId, TipoComprobante tipoComprobante, String serie);
}
