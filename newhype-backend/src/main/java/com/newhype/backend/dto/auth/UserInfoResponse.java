package com.newhype.backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserInfoResponse {

    private Long id;
    private String email;
    private String nombre;
    private String apellido;
    private String username;
    private String rol;
    private Long tenantId;
    private String tenantNombre;
    private String scope;
}
