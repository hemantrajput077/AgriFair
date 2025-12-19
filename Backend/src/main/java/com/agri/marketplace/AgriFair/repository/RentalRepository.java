package com.agri.marketplace.AgriFair.repository;

import com.agri.marketplace.AgriFair.model.Rental;
import com.agri.marketplace.AgriFair.model.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByRenterId(Long renterId);
    List<Rental> findByEquipmentId(Long equipmentId);
    List<Rental> findByStatus(RentalStatus status);
    List<Rental> findByEquipmentIdAndStatusIn(Long equipmentId, List<RentalStatus> status);
    
    @Query("SELECT r FROM Rental r WHERE r.equipment.owner.id = :ownerId")
    List<Rental> findByEquipmentOwnerId(@Param("ownerId") Long ownerId);
}

