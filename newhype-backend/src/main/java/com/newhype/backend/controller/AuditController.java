package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.entity.Auditoria;
import com.newhype.backend.entity.Usuario;
import com.newhype.backend.repository.UsuarioRepository;
import com.newhype.backend.security.TenantContext;
import com.newhype.backend.service.AuditoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Auditoría", description = "Logs de auditoría a nivel tenant")
public class AuditController {

    private final AuditoriaService auditoriaService;
    private final UsuarioRepository usuarioRepository;

    public AuditController(AuditoriaService auditoriaService,
                           UsuarioRepository usuarioRepository) {
        this.auditoriaService = auditoriaService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/logs")
    @Operation(summary = "Listar logs de auditoría del tenant")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action) {

        Long tenantId = TenantContext.getCurrentTenantId();

        LocalDateTime desde = parseDate(dateFrom, true);
        LocalDateTime hasta = parseDate(dateTo, false);
        Long userIdLong = parseLong(userId);

        int pageIndex = Math.max(0, page - 1);

        Page<Auditoria> resultado = auditoriaService.buscarLogs(
                tenantId, action, userIdLong, desde, hasta, pageIndex, limit);

        // Resolver nombres de usuario
        Set<Long> userIds = resultado.getContent().stream()
                .map(Auditoria::getUsuarioId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> userNames = new HashMap<>();
        if (!userIds.isEmpty()) {
            usuarioRepository.findAllById(userIds).forEach(u ->
                    userNames.put(u.getId(), u.getNombre() + " " + u.getApellido())
            );
        }

        List<Map<String, Object>> logs = resultado.getContent().stream()
                .map(a -> {
                    Map<String, Object> log = new LinkedHashMap<>();
                    log.put("id", String.valueOf(a.getId()));
                    log.put("action", a.getAccion());
                    log.put("user", userNames.getOrDefault(a.getUsuarioId(),
                            a.getUsuarioId() != null ? "Usuario #" + a.getUsuarioId() : "Sistema"));
                    log.put("timestamp", a.getCreatedAt() != null ? a.getCreatedAt().toString() : null);
                    log.put("details", a.getDetalle());
                    log.put("ipAddress", a.getIpAddress());
                    log.put("userAgent", a.getUserAgent());
                    return log;
                })
                .collect(Collectors.toList());

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page", page);
        pagination.put("limit", limit);
        pagination.put("total", resultado.getTotalElements());
        pagination.put("totalPages", resultado.getTotalPages());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("logs", logs);
        response.put("pagination", pagination);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/my-activity")
    @Operation(summary = "Obtener actividad del usuario actual")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyActivity(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        Long tenantId = TenantContext.getCurrentTenantId();
        Long userId = TenantContext.getCurrentUserId();

        int pageIndex = Math.max(0, page - 1);

        Page<Auditoria> resultado = auditoriaService.getActividadUsuario(
                tenantId, userId, pageIndex, limit);

        List<Map<String, Object>> activities = resultado.getContent().stream()
                .map(a -> {
                    Map<String, Object> activity = new LinkedHashMap<>();
                    activity.put("id", String.valueOf(a.getId()));
                    activity.put("action", a.getAccion());
                    activity.put("timestamp", a.getCreatedAt() != null ? a.getCreatedAt().toString() : null);
                    activity.put("details", a.getDetalle());
                    activity.put("ipAddress", a.getIpAddress());
                    return activity;
                })
                .collect(Collectors.toList());

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page", page);
        pagination.put("limit", limit);
        pagination.put("total", resultado.getTotalElements());
        pagination.put("totalPages", resultado.getTotalPages());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("activities", activities);
        response.put("pagination", pagination);

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/user-activity/{userId}")
    @Operation(summary = "Obtener actividad de un usuario específico (admin)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserActivity(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        Long tenantId = TenantContext.getCurrentTenantId();

        int pageIndex = Math.max(0, page - 1);

        Page<Auditoria> resultado = auditoriaService.getActividadUsuario(
                tenantId, userId, pageIndex, limit);

        // Resolver info del usuario
        Usuario usuario = usuarioRepository.findById(userId).orElse(null);

        List<Map<String, Object>> activities = resultado.getContent().stream()
                .map(a -> {
                    Map<String, Object> activity = new LinkedHashMap<>();
                    activity.put("id", String.valueOf(a.getId()));
                    activity.put("action", a.getAccion());
                    activity.put("timestamp", a.getCreatedAt() != null ? a.getCreatedAt().toString() : null);
                    activity.put("details", a.getDetalle());
                    activity.put("ipAddress", a.getIpAddress());
                    return activity;
                })
                .collect(Collectors.toList());

        Map<String, Object> pagination = new LinkedHashMap<>();
        pagination.put("page", page);
        pagination.put("limit", limit);
        pagination.put("total", resultado.getTotalElements());
        pagination.put("totalPages", resultado.getTotalPages());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("activities", activities);
        response.put("pagination", pagination);

        if (usuario != null) {
            Map<String, Object> userInfo = new LinkedHashMap<>();
            userInfo.put("id", String.valueOf(usuario.getId()));
            userInfo.put("name", usuario.getNombre() + " " + usuario.getApellido());
            userInfo.put("email", usuario.getEmail());
            response.put("user", userInfo);
        }

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ── Helpers ──

    private LocalDateTime parseDate(String dateStr, boolean startOfDay) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            return startOfDay ? date.atStartOfDay() : date.atTime(23, 59, 59);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    private Long parseLong(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
