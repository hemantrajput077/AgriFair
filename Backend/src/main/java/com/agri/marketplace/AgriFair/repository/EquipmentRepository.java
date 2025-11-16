package com.agri.marketplace.AgriFair.repository;

import com.agri.marketplace.AgriFair.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByAvailable(Boolean available);
    List<Equipment> findByOwnerId(Long ownerId);
}

