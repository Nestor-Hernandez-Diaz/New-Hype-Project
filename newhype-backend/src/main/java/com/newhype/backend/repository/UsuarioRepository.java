package com.newhype.backend.repository;

import com.newhype.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>, JpaSpecificationExecutor<Usuario> {

    Optional<Usuario> findByTenantIdAndEmail(Long tenantId, String email);

    Optional<Usuario> findByTenantIdAndUsername(Long tenantId, String username);

    Optional<Usuario> findByEmail(String email);

    boolean existsByTenantIdAndEmail(Long tenantId, String email);

    boolean existsByTenantIdAndUsername(Long tenantId, String username);

    boolean existsByEmail(String email);
}
