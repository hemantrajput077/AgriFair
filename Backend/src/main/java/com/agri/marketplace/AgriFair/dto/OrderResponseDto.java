package com.agri.marketplace.AgriFair.dto;

import com.agri.marketplace.AgriFair.model.OrderStatus;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponseDto {
    private Long id;
    private String customerUsername;
    private Double totalAmount;
    private OrderStatus status;
    private LocalDateTime createdDate;
    private List<OrderItemResponseDto> items;

    @Data
    public static class OrderItemResponseDto {
        private Long id;
        private Long cropId;
        private String productName;
        private Integer quantity;
        private Double price;
        private Double subtotal;
    }
}
