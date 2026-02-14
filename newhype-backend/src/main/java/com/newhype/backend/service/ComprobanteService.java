package com.newhype.backend.service;

import com.newhype.backend.dto.venta.DetalleVentaResponse;
import com.newhype.backend.dto.venta.PagoVentaResponse;
import com.newhype.backend.dto.venta.VentaResponse;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class ComprobanteService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public String generarHtml(VentaResponse venta) {
        StringBuilder sb = new StringBuilder();

        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        sb.append("<title>Comprobante ").append(venta.getCodigoVenta()).append("</title>");
        sb.append("<style>");
        sb.append("body{font-family:'Courier New',monospace;max-width:320px;margin:20px auto;font-size:12px;}");
        sb.append(".center{text-align:center;} .line{border-top:1px dashed #000;margin:8px 0;}");
        sb.append("table{width:100%;border-collapse:collapse;} td{padding:2px 0;vertical-align:top;}");
        sb.append(".right{text-align:right;} .bold{font-weight:bold;}");
        sb.append("</style></head><body>");

        // Header
        sb.append("<div class='center bold'>NEW HYPE</div>");
        sb.append("<div class='center'>Sistema de Ventas</div>");
        sb.append("<div class='line'></div>");

        // Tipo comprobante + código
        sb.append("<div class='center bold'>");
        if (venta.getTipoComprobante() != null) {
            sb.append(venta.getTipoComprobante());
        }
        sb.append("</div>");

        if (venta.getSerie() != null && venta.getNumero() != null) {
            sb.append("<div class='center'>").append(venta.getSerie()).append("-").append(venta.getNumero()).append("</div>");
        }

        sb.append("<div class='line'></div>");

        // Info venta
        sb.append("<table>");
        sb.append("<tr><td>Código:</td><td class='right'>").append(venta.getCodigoVenta()).append("</td></tr>");

        if (venta.getFechaEmision() != null) {
            sb.append("<tr><td>Fecha:</td><td class='right'>").append(venta.getFechaEmision().format(FMT)).append("</td></tr>");
        }

        if (venta.getClienteNombre() != null) {
            sb.append("<tr><td>Cliente:</td><td class='right'>").append(venta.getClienteNombre()).append("</td></tr>");
        }

        sb.append("<tr><td>Estado:</td><td class='right'>").append(venta.getEstado()).append("</td></tr>");
        sb.append("</table>");

        sb.append("<div class='line'></div>");

        // Detalle items
        sb.append("<table>");
        sb.append("<tr class='bold'><td>Producto</td><td class='right'>Cant</td><td class='right'>P.U.</td><td class='right'>Subt.</td></tr>");

        if (venta.getDetalles() != null) {
            for (DetalleVentaResponse d : venta.getDetalles()) {
                sb.append("<tr>");
                sb.append("<td>").append(d.getNombreProducto() != null ? d.getNombreProducto() : "Producto #" + d.getProductoId()).append("</td>");
                sb.append("<td class='right'>").append(d.getCantidad()).append("</td>");
                sb.append("<td class='right'>").append(d.getPrecioUnitario()).append("</td>");
                sb.append("<td class='right'>").append(d.getSubtotal()).append("</td>");
                sb.append("</tr>");
            }
        }

        sb.append("</table>");
        sb.append("<div class='line'></div>");

        // Totales
        sb.append("<table>");

        if (venta.getSubtotal() != null) {
            sb.append("<tr><td>Subtotal:</td><td class='right'>S/ ").append(venta.getSubtotal()).append("</td></tr>");
        }
        if (venta.getIgv() != null) {
            sb.append("<tr><td>IGV (18%):</td><td class='right'>S/ ").append(venta.getIgv()).append("</td></tr>");
        }
        if (venta.getDescuento() != null && venta.getDescuento().signum() > 0) {
            sb.append("<tr><td>Descuento:</td><td class='right'>-S/ ").append(venta.getDescuento()).append("</td></tr>");
        }
        if (venta.getTotal() != null) {
            sb.append("<tr class='bold'><td>TOTAL:</td><td class='right'>S/ ").append(venta.getTotal()).append("</td></tr>");
        }

        sb.append("</table>");

        // Pagos
        if (venta.getPagos() != null && !venta.getPagos().isEmpty()) {
            sb.append("<div class='line'></div>");
            sb.append("<div class='bold'>Pagos:</div>");
            sb.append("<table>");
            for (PagoVentaResponse p : venta.getPagos()) {
                sb.append("<tr><td>Método #").append(p.getMetodoPagoId()).append("</td>");
                sb.append("<td class='right'>S/ ").append(p.getMonto()).append("</td></tr>");
            }
            sb.append("</table>");

            if (venta.getMontoRecibido() != null) {
                sb.append("<table>");
                sb.append("<tr><td>Recibido:</td><td class='right'>S/ ").append(venta.getMontoRecibido()).append("</td></tr>");
                if (venta.getMontoCambio() != null) {
                    sb.append("<tr><td>Cambio:</td><td class='right'>S/ ").append(venta.getMontoCambio()).append("</td></tr>");
                }
                sb.append("</table>");
            }
        }

        sb.append("<div class='line'></div>");
        sb.append("<div class='center'>¡Gracias por su compra!</div>");
        sb.append("<div class='center' style='font-size:10px;margin-top:8px;'>New Hype ERP</div>");

        sb.append("</body></html>");

        return sb.toString();
    }
}
