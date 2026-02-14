package com.newhype.backend.service;

import com.newhype.backend.dto.auth.*;
import com.newhype.backend.entity.*;
import com.newhype.backend.repository.*;
import com.newhype.backend.security.JwtUtil;
import com.newhype.backend.security.TenantContext;
import com.newhype.backend.security.TokenBlacklist;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final TenantRepository tenantRepository;
    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioPlataformaRepository usuarioPlataformaRepository;
    private final ClienteTiendaRepository clienteTiendaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TokenBlacklist tokenBlacklist;

    public AuthService(TenantRepository tenantRepository,
                       RolRepository rolRepository,
                       UsuarioRepository usuarioRepository,
                       UsuarioPlataformaRepository usuarioPlataformaRepository,
                       ClienteTiendaRepository clienteTiendaRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       TokenBlacklist tokenBlacklist) {
        this.tenantRepository = tenantRepository;
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.usuarioPlataformaRepository = usuarioPlataformaRepository;
        this.clienteTiendaRepository = clienteTiendaRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.tokenBlacklist = tokenBlacklist;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        String nombreTienda = request.getNombreTienda() != null
                ? request.getNombreTienda()
                : "Tienda de " + request.getNombre();

        String subdominio = nombreTienda.toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        String baseSubdominio = subdominio;
        int counter = 1;
        while (tenantRepository.existsBySubdominio(subdominio)) {
            subdominio = baseSubdominio + "-" + counter++;
        }

        Tenant tenant = Tenant.builder()
                .nombre(nombreTienda)
                .subdominio(subdominio)
                .propietarioNombre(request.getNombre() + " " + request.getApellido())
                .propietarioTipoDocumento("DNI")
                .propietarioNumeroDocumento("00000000")
                .email(request.getEmail())
                .build();
        tenant = tenantRepository.save(tenant);

        Rol rol = Rol.builder()
                .tenantId(tenant.getId())
                .nombre("ADMIN")
                .descripcion("Administrador del tenant")
                .permisos("{\"all\": true}")
                .esSistema(true)
                .build();
        rol = rolRepository.save(rol);

        String username = request.getEmail().split("@")[0];
        String baseUsername = username;
        int usernameCounter = 1;
        while (usuarioRepository.existsByTenantIdAndUsername(tenant.getId(), username)) {
            username = baseUsername + usernameCounter++;
        }

        Usuario usuario = Usuario.builder()
                .tenantId(tenant.getId())
                .rolId(rol.getId())
                .email(request.getEmail())
                .username(username)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .build();
        usuario = usuarioRepository.save(usuario);

        String accessToken = jwtUtil.generateAccessToken(usuario.getId(), tenant.getId(), rol.getNombre());
        String refreshToken = jwtUtil.generateRefreshToken(usuario.getId(), tenant.getId(), "tenant");

        UserInfoResponse userInfo = UserInfoResponse.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .username(usuario.getUsername())
                .rol(rol.getNombre())
                .tenantId(tenant.getId())
                .tenantNombre(tenant.getNombre())
                .scope("tenant")
                .build();

        return AuthResponse.of(accessToken, refreshToken, jwtUtil.getJwtExpirationMs(), "tenant", userInfo);
    }

    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        if (usuario.getEstado() == null || !usuario.getEstado()) {
            throw new BadCredentialsException("Usuario deshabilitado");
        }

        Tenant tenant = tenantRepository.findById(usuario.getTenantId())
                .orElseThrow(() -> new BadCredentialsException("Tenant no encontrado"));

        String rolNombre = "USER";
        Rol rol = rolRepository.findById(usuario.getRolId()).orElse(null);
        if (rol != null) rolNombre = rol.getNombre();

        String accessToken = jwtUtil.generateAccessToken(usuario.getId(), tenant.getId(), rolNombre);
        String refreshToken = jwtUtil.generateRefreshToken(usuario.getId(), tenant.getId(), "tenant");

        UserInfoResponse userInfo = UserInfoResponse.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .username(usuario.getUsername())
                .rol(rolNombre)
                .tenantId(tenant.getId())
                .tenantNombre(tenant.getNombre())
                .scope("tenant")
                .build();

        return AuthResponse.of(accessToken, refreshToken, jwtUtil.getJwtExpirationMs(), "tenant", userInfo);
    }

    public AuthResponse platformLogin(PlatformLoginRequest request) {
        UsuarioPlataforma user = usuarioPlataformaRepository.findByEmail(request.getEmailOrUsername())
                .or(() -> usuarioPlataformaRepository.findByUsername(request.getEmailOrUsername()))
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        if (user.getEstado() == null || !user.getEstado()) {
            throw new BadCredentialsException("Usuario deshabilitado");
        }

        String accessToken = jwtUtil.generatePlatformAccessToken(user.getId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), null, "platform");

        UserInfoResponse userInfo = UserInfoResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nombre(user.getNombreCompleto())
                .username(user.getUsername())
                .rol("SUPERADMIN")
                .scope("platform")
                .build();

        return AuthResponse.of(accessToken, refreshToken, jwtUtil.getJwtExpirationMs(), "platform", userInfo);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String token = request.getRefreshToken();

        if (!jwtUtil.validateToken(token)) {
            throw new BadCredentialsException("Refresh token inválido");
        }

        String type = jwtUtil.extractType(token);
        if (!"refresh".equals(type)) {
            throw new BadCredentialsException("Token no es de tipo refresh");
        }

        Long userId = jwtUtil.extractUserId(token);
        Long tenantId = jwtUtil.extractTenantId(token);
        String scope = jwtUtil.extractScope(token);

        String accessToken;
        if ("platform".equals(scope)) {
            accessToken = jwtUtil.generatePlatformAccessToken(userId);
        } else {
            Usuario usuario = usuarioRepository.findById(userId)
                    .orElseThrow(() -> new BadCredentialsException("Usuario no encontrado"));
            String rolNombre = "USER";
            Rol rol = rolRepository.findById(usuario.getRolId()).orElse(null);
            if (rol != null) rolNombre = rol.getNombre();
            accessToken = jwtUtil.generateAccessToken(userId, tenantId, rolNombre);
        }

        String newRefreshToken = jwtUtil.generateRefreshToken(userId, tenantId, scope);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getJwtExpirationMs() / 1000)
                .scope(scope)
                .build();
    }

    public UserInfoResponse me() {
        Long userId = TenantContext.getCurrentUserId();
        String scope = TenantContext.getCurrentScope();

        if ("platform".equals(scope)) {
            UsuarioPlataforma user = usuarioPlataformaRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            return UserInfoResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .nombre(user.getNombreCompleto())
                    .username(user.getUsername())
                    .rol("SUPERADMIN")
                    .scope("platform")
                    .build();
        } else {
            Usuario usuario = usuarioRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            Tenant tenant = tenantRepository.findById(usuario.getTenantId()).orElse(null);
            String rolNombre = "USER";
            Rol rol = rolRepository.findById(usuario.getRolId()).orElse(null);
            if (rol != null) rolNombre = rol.getNombre();

            return UserInfoResponse.builder()
                    .id(usuario.getId())
                    .email(usuario.getEmail())
                    .nombre(usuario.getNombre())
                    .apellido(usuario.getApellido())
                    .username(usuario.getUsername())
                    .rol(rolNombre)
                    .tenantId(usuario.getTenantId())
                    .tenantNombre(tenant != null ? tenant.getNombre() : null)
                    .scope("tenant")
                    .build();
        }
    }

    // ── New endpoints ──

    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (token != null) {
            tokenBlacklist.blacklist(token);
        }
    }

    public boolean checkEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    @Transactional
    public AuthResponse storefrontLogin(StorefrontLoginRequest request) {
        ClienteTienda cliente = clienteTiendaRepository
                .findByTenantIdAndEmail(request.getTenantId(), request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas"));

        if (cliente.getPasswordHash() == null) {
            throw new BadCredentialsException("Cliente sin contraseña configurada");
        }

        if (!passwordEncoder.matches(request.getPassword(), cliente.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        if (cliente.getEstado() == null || !cliente.getEstado()) {
            throw new BadCredentialsException("Cliente deshabilitado");
        }

        cliente.setUltimoAcceso(LocalDateTime.now());
        clienteTiendaRepository.save(cliente);

        String accessToken = jwtUtil.generateAccessToken(cliente.getId(), request.getTenantId(), "CLIENTE");
        String refreshToken = jwtUtil.generateRefreshToken(cliente.getId(), request.getTenantId(), "storefront");

        UserInfoResponse userInfo = UserInfoResponse.builder()
                .id(cliente.getId())
                .email(cliente.getEmail())
                .nombre(cliente.getNombre())
                .apellido(cliente.getApellido())
                .rol("CLIENTE")
                .tenantId(request.getTenantId())
                .scope("storefront")
                .build();

        return AuthResponse.of(accessToken, refreshToken, jwtUtil.getJwtExpirationMs(), "storefront", userInfo);
    }
}
