package com.agri.marketplace.AgriFair.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequestDto {
    private List<OrderItemDto> items;

    @Data
    public static class OrderItemDto {
        private Long cropId;
        private Integer quantity;
    }
}
