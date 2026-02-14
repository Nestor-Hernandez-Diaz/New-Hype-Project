package com.newhype.backend.service;

import com.newhype.backend.dto.usuario.*;
import com.newhype.backend.entity.Rol;
import com.newhype.backend.entity.Usuario;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.RolRepository;
import com.newhype.backend.repository.UsuarioRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          RolRepository rolRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponse crear(CrearUsuarioRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        if (usuarioRepository.existsByTenantIdAndEmail(tenantId, request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado en este tenant");
        }
        if (usuarioRepository.existsByTenantIdAndUsername(tenantId, request.getUsername())) {
            throw new IllegalArgumentException("El username ya está registrado en este tenant");
        }

        Rol rol = rolRepository.findByIdAndTenantId(request.getRolId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol", request.getRolId()));

        Usuario usuario = Usuario.builder()
                .tenantId(tenantId)
                .email(request.getEmail())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .rolId(request.getRolId())
                .build();

        usuario = usuarioRepository.save(usuario);
        return toResponse(usuario, rol);
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponse> listar(Long rolId, Boolean estado, String q, Pageable pageable) {
        Long tenantId = TenantContext.getCurrentTenantId();
        return usuarioRepository.buscar(tenantId, rolId, estado, q, pageable)
                .map(u -> {
                    Rol rol = u.getRol();
                    return toResponse(u, rol);
                });
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPorId(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Usuario usuario = usuarioRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
        Rol rol = usuario.getRol();
        return toResponseDetalle(usuario, rol);
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Usuario usuario = usuarioRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        // Validate email uniqueness if changed
        if (!usuario.getEmail().equals(request.getEmail()) &&
            usuarioRepository.existsByTenantIdAndEmail(tenantId, request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado en este tenant");
        }

        Rol rol = rolRepository.findByIdAndTenantId(request.getRolId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol", request.getRolId()));

        usuario.setEmail(request.getEmail());
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setRolId(request.getRolId());

        usuario = usuarioRepository.save(usuario);
        return toResponse(usuario, rol);
    }

    @Transactional
    public void cambiarPassword(Long id, CambiarPasswordRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Usuario usuario = usuarioRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        usuario.setPasswordHash(passwordEncoder.encode(request.getNuevaPassword()));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public UsuarioResponse cambiarEstado(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long currentUserId = TenantContext.getCurrentUserId();

        Usuario usuario = usuarioRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));

        if (usuario.getId().equals(currentUserId)) {
            throw new IllegalArgumentException("No puedes desactivarte a ti mismo");
        }

        usuario.setEstado(!usuario.getEstado());
        usuario = usuarioRepository.save(usuario);
        Rol rol = usuario.getRol();
        return toResponse(usuario, rol);
    }

    private UsuarioResponse toResponse(Usuario u, Rol rol) {
        return UsuarioResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .username(u.getUsername())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .rolId(u.getRolId())
                .rolNombre(rol != null ? rol.getNombre() : null)
                .estado(u.getEstado())
                .ultimoAcceso(u.getUltimoAcceso())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }

    private UsuarioResponse toResponseDetalle(Usuario u, Rol rol) {
        return UsuarioResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .username(u.getUsername())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .rolId(u.getRolId())
                .rolNombre(rol != null ? rol.getNombre() : null)
                .permisos(rol != null ? rol.getPermisos() : null)
                .estado(u.getEstado())
                .ultimoAcceso(u.getUltimoAcceso())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}
