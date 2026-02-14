package com.newhype.backend.repository;

import com.newhype.backend.entity.UsuarioPlataforma;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioPlataformaRepository extends JpaRepository<UsuarioPlataforma, Long> {

    Optional<UsuarioPlataforma> findByEmail(String email);

    Optional<UsuarioPlataforma> findByUsername(String username);
}
