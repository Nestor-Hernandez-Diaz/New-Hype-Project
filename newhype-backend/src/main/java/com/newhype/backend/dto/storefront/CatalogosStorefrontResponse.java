package com.newhype.backend.dto.storefront;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CatalogosStorefrontResponse {

    private List<ItemCatalogo> tallas;
    private List<ItemColor> colores;
    private List<ItemCatalogo> marcas;
    private List<ItemCatalogo> materiales;
    private List<ItemCatalogo> generos;

    @Data
    @Builder
    public static class ItemCatalogo {
        private Long id;
        private String codigo;
        private String nombre;
    }

    @Data
    @Builder
    public static class ItemColor {
        private Long id;
        private String codigo;
        private String nombre;
        private String codigoHex;
    }
}
