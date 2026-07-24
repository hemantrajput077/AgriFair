package com.agri.marketplace.AgriFair.service;

import com.agri.marketplace.AgriFair.dto.OrderRequestDto;
import com.agri.marketplace.AgriFair.dto.OrderResponseDto;
import com.agri.marketplace.AgriFair.dto.OrderStatusUpdateDto;
import com.agri.marketplace.AgriFair.model.*;
import com.agri.marketplace.AgriFair.repository.CropRepository;
import com.agri.marketplace.AgriFair.repository.OrderItemRepository;
import com.agri.marketplace.AgriFair.repository.OrderRepository;
import com.agri.marketplace.AgriFair.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public OrderResponseDto createOrder(Authentication auth, OrderRequestDto requestDto) {
        if (requestDto.getItems() == null || requestDto.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        User customer = userRepository.findByUsername(auth.getName());
        if (customer == null) {
            throw new IllegalArgumentException("Customer not found");
        }

        // Calculate total first
        double totalAmount = 0.0;

        // First loop: calculate total and validate stock
        for (OrderRequestDto.OrderItemDto itemDto : requestDto.getItems()) {
            Crop crop = cropRepository.findById(itemDto.getCropId())
                    .orElseThrow(() -> new IllegalArgumentException("Crop not found: " + itemDto.getCropId()));

            // Check if sufficient quantity is available
            if (crop.getQuantity() < itemDto.getQuantity()) {
                throw new IllegalArgumentException("Insufficient quantity for crop: " + crop.getProductName());
            }

            totalAmount += crop.getPrice() * itemDto.getQuantity();
        }

        // Create and save the order with total amount
        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedDate(LocalDateTime.now());
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Second loop: create order items and deduct inventory
        for (OrderRequestDto.OrderItemDto itemDto : requestDto.getItems()) {
            Crop crop = cropRepository.findById(itemDto.getCropId())
                    .orElseThrow(() -> new IllegalArgumentException("Crop not found: " + itemDto.getCropId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setCrop(crop);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setPrice(crop.getPrice());

            orderItemRepository.save(orderItem);

            // Deduct quantity from crop inventory
            crop.setQuantity(crop.getQuantity() - itemDto.getQuantity());
            cropRepository.save(crop);
        }

        return mapToResponseDto(savedOrder);
    }

    public List<OrderResponseDto> getMyOrders(Authentication auth) {
        User customer = userRepository.findByUsername(auth.getName());
        if (customer == null) {
            throw new IllegalArgumentException("Customer not found");
        }

        List<Order> orders = orderRepository.findByCustomerOrderByCreatedDateDesc(customer);
        return orders.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public OrderResponseDto getOrderById(Authentication auth, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        User customer = userRepository.findByUsername(auth.getName());

        // Check if the order belongs to the authenticated customer
        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Unauthorized access to order");
        }

        return mapToResponseDto(order);
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatusUpdateDto statusDto) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        order.setStatus(statusDto.getStatus());
        Order updatedOrder = orderRepository.save(order);

        return mapToResponseDto(updatedOrder);
    }

    private OrderResponseDto mapToResponseDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setCustomerUsername(order.getCustomer().getUsername());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedDate(order.getCreatedDate());

        List<OrderItem> items = orderItemRepository.findByOrder(order);
        List<OrderResponseDto.OrderItemResponseDto> itemDtos = items.stream()
                .map(item -> {
                    OrderResponseDto.OrderItemResponseDto itemDto = new OrderResponseDto.OrderItemResponseDto();
                    itemDto.setId(item.getId());
                    itemDto.setCropId(item.getCrop().getId());
                    itemDto.setProductName(item.getCrop().getProductName());
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setPrice(item.getPrice());
                    itemDto.setSubtotal(item.getPrice() * item.getQuantity());
                    return itemDto;
                })
                .collect(Collectors.toList());

        dto.setItems(itemDtos);
        return dto;
    }
}
