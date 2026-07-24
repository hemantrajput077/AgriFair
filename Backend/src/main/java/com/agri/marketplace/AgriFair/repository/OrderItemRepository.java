package com.agri.marketplace.AgriFair.repository;

import com.agri.marketplace.AgriFair.model.Order;
import com.agri.marketplace.AgriFair.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Get all items for a specific order
    List<OrderItem> findByOrder(Order order);
}
