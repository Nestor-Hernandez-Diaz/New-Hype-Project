package com.newhype.backend.repository;

import com.newhype.backend.entity.SesionCaja;
import com.newhype.backend.entity.SesionCaja.EstadoSesion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SesionCajaRepository extends JpaRepository<SesionCaja, Long> {

    Optional<SesionCaja> findByIdAndTenantId(Long id, Long tenantId);

    List<SesionCaja> findByTenantIdAndEstado(Long tenantId, EstadoSesion estado);

    List<SesionCaja> findByTenantIdAndCajaRegistradoraIdAndEstado(
            Long tenantId, Long cajaRegistradoraId, EstadoSesion estado);

    List<SesionCaja> findByTenantIdOrderByCreatedAtDesc(Long tenantId);

    Optional<SesionCaja> findByTenantIdAndUsuarioIdAndEstado(
            Long tenantId, Long usuarioId, EstadoSesion estado);
}
