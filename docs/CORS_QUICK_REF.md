# QUICK REFERENCE - CORS Configuration

## Files

| File | Status | Location |
|------|--------|----------|
| `CorsConfig.java` | ✨ NEW | `src/main/java/.../config/CorsConfig.java` |
| `SecurityConfig.java` | 🔄 MODIFIED | `src/main/java/.../config/SecurityConfig.java` |

## CorsConfig.java - Full Code

```java
package com.newhype.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
public class CorsConfig {

    private static final String[] ALLOWED_ORIGINS = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "https://tudominio.com"
    };

    private static final String[] ALLOWED_METHODS = {
        "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"
    };

    private static final String[] ALLOWED_HEADERS = {
        "Authorization", "Content-Type", "Accept", "X-Requested-With"
    };

    private static final String[] EXPOSED_HEADERS = {
        "Authorization", "Content-Type"
    };

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(Arrays.asList(ALLOWED_ORIGINS));
        cors.setAllowedMethods(Arrays.asList(ALLOWED_METHODS));
        cors.setAllowedHeaders(Arrays.asList(ALLOWED_HEADERS));
        cors.setExposedHeaders(Arrays.asList(EXPOSED_HEADERS));
        cors.setAllowCredentials(true);
        cors.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
```

## SecurityConfig.java - Changes Only

**ADD to imports:**
```java
import org.springframework.web.cors.CorsConfigurationSource;
```

**ADD to class:**
```java
private final CorsConfigurationSource corsConfigurationSource;

public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                      CorsConfigurationSource corsConfigurationSource) {
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    this.corsConfigurationSource = corsConfigurationSource;
}
```

**ADD inside `securityFilterChain()` method, FIRST line of http:**
```java
http
    .cors(cors -> cors.configurationSource(corsConfigurationSource))  // ← ADD THIS
    .csrf(csrf -> csrf.disable())
    // rest of config...
```

## Build Command

```bash
cd c:\Dev\New-Hype-Project
.\mvnw.cmd clean package -DskipTests
```

Expected: `BUILD SUCCESS`

## Deploy Command

```bash
# Upload JAR
scp target/newhype-backend-1.0.0.jar ventas@spring.informaticapp.com:~/New-Hype-Project/

# Restart
ssh ventas@spring.informaticapp.com
pkill -f java
nohup java -jar ~/New-Hype-Project/newhype-backend-1.0.0.jar > app.log 2>&1 &
```

## Test

```javascript
// From http://localhost:5174
fetch('http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ nombre: 'Test', apellido: 'User', email: 'test@test.com' })
})
.then(r => r.json())
.then(d => console.log('✓ CORS Works:', d))
.catch(e => console.error('✗ Error:', e));
```

## Customize Origins

Edit `CorsConfig.java` line 14:
```java
"http://localhost:5174",
"https://yourdomain.com"  // ← CHANGE HERE
```

Then recompile & deploy.

## Important Notes

- ✓ Still requires JWT for protected endpoints
- ✓ Multi-tenancy NOT affected
- ✓ Role permissions NOT affected
- ✓ Postman still works (ignores CORS)
- ⚠️ Don't use `"*"` in production

---

**CORS is now configured!**
