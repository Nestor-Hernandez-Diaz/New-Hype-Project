package com.newhype.backend.service;

import com.newhype.backend.entity.AuditoriaPlataforma;
import com.newhype.backend.repository.AuditoriaPlataformaRepository;
import com.newhype.backend.security.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditoriaPlataformaService {

    private final AuditoriaPlataformaRepository auditoriaRepository;

    public AuditoriaPlataformaService(AuditoriaPlataformaRepository auditoriaRepository) {
        this.auditoriaRepository = auditoriaRepository;
    }

    @Transactional
    public void registrar(String accion, String detalle, Long tenantId, HttpServletRequest request) {
        Long userId = TenantContext.getCurrentUserId();
        AuditoriaPlataforma log = AuditoriaPlataforma.builder()
                .usuarioPlataformaId(userId)
                .tenantId(tenantId)
                .accion(accion)
                .detalle(detalle)
                .ipAddress(request != null ? request.getRemoteAddr() : null)
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .build();
        auditoriaRepository.save(log);
    }

    @Transactional
    public void registrar(String accion, String detalle, Long tenantId) {
        registrar(accion, detalle, tenantId, null);
    }
}
