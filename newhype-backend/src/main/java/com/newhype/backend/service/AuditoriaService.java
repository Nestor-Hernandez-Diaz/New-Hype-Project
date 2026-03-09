package com.newhype.backend.service;

import com.newhype.backend.entity.Auditoria;
import com.newhype.backend.repository.AuditoriaRepository;
import com.newhype.backend.security.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;

    public AuditoriaService(AuditoriaRepository auditoriaRepository) {
        this.auditoriaRepository = auditoriaRepository;
    }

    @Transactional
    public void registrar(String accion, String detalle, Long tenantId, Long usuarioId,
                          String entidad, Long entidadId, HttpServletRequest request) {
        Auditoria log = Auditoria.builder()
                .tenantId(tenantId)
                .usuarioId(usuarioId)
                .accion(accion)
                .entidad(entidad)
                .entidadId(entidadId)
                .detalle(detalle)
                .ipAddress(request != null ? request.getRemoteAddr() : null)
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .build();
        auditoriaRepository.save(log);
    }

    @Transactional
    public void registrar(String accion, String detalle, Long tenantId, Long usuarioId, HttpServletRequest request) {
        registrar(accion, detalle, tenantId, usuarioId, null, null, request);
    }

    @Transactional
    public void registrar(String accion, String detalle, Long tenantId, Long usuarioId) {
        registrar(accion, detalle, tenantId, usuarioId, null, null, null);
    }

    public Page<Auditoria> buscarLogs(Long tenantId, String accion, Long usuarioId,
                                       LocalDateTime desde, LocalDateTime hasta,
                                       int page, int size) {
        return auditoriaRepository.buscar(tenantId, accion, usuarioId, desde, hasta,
                PageRequest.of(page, size));
    }

    public Page<Auditoria> getActividadUsuario(Long tenantId, Long usuarioId, int page, int size) {
        return auditoriaRepository.findByTenantIdAndUsuarioIdOrderByCreatedAtDesc(
                tenantId, usuarioId, PageRequest.of(page, size));
    }
}
