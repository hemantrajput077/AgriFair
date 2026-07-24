package com.agri.marketplace.AgriFair.controller;

import com.agri.marketplace.AgriFair.dto.OrderRequestDto;
import com.agri.marketplace.AgriFair.dto.OrderResponseDto;
import com.agri.marketplace.AgriFair.dto.OrderStatusUpdateDto;
import com.agri.marketplace.AgriFair.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody OrderRequestDto requestDto,
            Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            if (requestDto == null || requestDto.getItems() == null || requestDto.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Order must contain at least one item");
            }

            OrderResponseDto order = orderService.createOrder(auth, requestDto);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating order: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            List<OrderResponseDto> orders = orderService.getMyOrders(auth);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching orders: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ROLE_CUSTOMER')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }

            OrderResponseDto order = orderService.getOrderById(auth, id);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching order: " + e.getMessage());
        }
    }

    @PreAuthorize("hasRole('ROLE_FARMER')")
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody OrderStatusUpdateDto statusDto) {
        try {
            if (statusDto == null || statusDto.getStatus() == null) {
                return ResponseEntity.badRequest().body("Status is required");
            }

            OrderResponseDto order = orderService.updateOrderStatus(id, statusDto);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error updating order status: " + e.getMessage());
        }
    }
}
