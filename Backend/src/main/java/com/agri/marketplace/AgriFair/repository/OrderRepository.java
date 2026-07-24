package com.agri.marketplace.AgriFair.repository;

import com.agri.marketplace.AgriFair.model.Order;
import com.agri.marketplace.AgriFair.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Get all orders for a specific customer
    List<Order> findByCustomerOrderByCreatedDateDesc(User customer);

    // Find orders by status
    List<Order> findByStatus(com.agri.marketplace.AgriFair.model.OrderStatus status);
}
