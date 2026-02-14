package com.newhype.backend.service;

import com.newhype.backend.dto.usuario.*;
import com.newhype.backend.entity.Rol;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.RolRepository;
import com.newhype.backend.repository.UsuarioRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RolService {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;

    public RolService(RolRepository rolRepository, UsuarioRepository usuarioRepository) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public RolResponse crear(CrearRolRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        if (rolRepository.findByTenantIdAndNombre(tenantId, request.getNombre()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un rol con ese nombre");
        }

        Rol rol = Rol.builder()
                .tenantId(tenantId)
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .permisos(request.getPermisos())
                .build();

        rol = rolRepository.save(rol);
        return toResponse(rol, 0L);
    }

    @Transactional(readOnly = true)
    public List<RolResponse> listar() {
        Long tenantId = TenantContext.getCurrentTenantId();
        List<Rol> roles = rolRepository.findByTenantId(tenantId);

        return roles.stream().map(rol -> {
            long count = usuarioRepository.countByTenantIdAndRolId(tenantId, rol.getId());
            return toResponse(rol, count);
        }).collect(Collectors.toList());
    }

    @Transactional
    public RolResponse actualizar(Long id, CrearRolRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Rol rol = rolRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol", id));

        if (Boolean.TRUE.equals(rol.getEsSistema())) {
            throw new IllegalArgumentException("No se pueden modificar roles del sistema");
        }

        // Check name uniqueness if changed
        if (!rol.getNombre().equals(request.getNombre())) {
            if (rolRepository.findByTenantIdAndNombre(tenantId, request.getNombre()).isPresent()) {
                throw new IllegalArgumentException("Ya existe un rol con ese nombre");
            }
        }

        rol.setNombre(request.getNombre());
        rol.setDescripcion(request.getDescripcion());
        rol.setPermisos(request.getPermisos());

        rol = rolRepository.save(rol);
        long count = usuarioRepository.countByTenantIdAndRolId(tenantId, rol.getId());
        return toResponse(rol, count);
    }

    @Transactional
    public RolResponse cambiarEstado(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();

        Rol rol = rolRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Rol", id));

        if (Boolean.TRUE.equals(rol.getEsSistema())) {
            throw new IllegalArgumentException("No se pueden desactivar roles del sistema");
        }

        // Validate no users assigned if deactivating
        if (Boolean.TRUE.equals(rol.getEstado())) {
            long count = usuarioRepository.countByTenantIdAndRolId(tenantId, rol.getId());
            if (count > 0) {
                throw new IllegalArgumentException("No se puede desactivar un rol con " + count + " usuario(s) asignado(s)");
            }
        }

        rol.setEstado(!rol.getEstado());
        rol = rolRepository.save(rol);
        long count = usuarioRepository.countByTenantIdAndRolId(tenantId, rol.getId());
        return toResponse(rol, count);
    }

    private RolResponse toResponse(Rol rol, Long cantidadUsuarios) {
        return RolResponse.builder()
                .id(rol.getId())
                .nombre(rol.getNombre())
                .descripcion(rol.getDescripcion())
                .permisos(rol.getPermisos())
                .esSistema(rol.getEsSistema())
                .estado(rol.getEstado())
                .cantidadUsuarios(cantidadUsuarios)
                .createdAt(rol.getCreatedAt())
                .updatedAt(rol.getUpdatedAt())
                .build();
    }
}
