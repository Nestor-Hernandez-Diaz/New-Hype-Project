package com.newhype.backend.repository;

import com.newhype.backend.entity.ClienteTienda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteTiendaRepository extends JpaRepository<ClienteTienda, Long> {

    Optional<ClienteTienda> findByTenantIdAndEmail(Long tenantId, String email);
}
