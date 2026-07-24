package com.agri.marketplace.AgriFair.dto;

import com.agri.marketplace.AgriFair.model.OrderStatus;
import lombok.Data;

@Data
public class OrderStatusUpdateDto {
    private OrderStatus status;
}
