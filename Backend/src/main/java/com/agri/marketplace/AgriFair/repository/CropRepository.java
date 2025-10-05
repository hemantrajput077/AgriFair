package com.agri.marketplace.AgriFair.repository;

import com.agri.marketplace.AgriFair.model.Crop;
import com.agri.marketplace.AgriFair.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {

    // Get all crops listed by a specific farmer
    List<Crop> findByFarmer(User farmer);

    // If you want to fetch crops by crop name for searches
    List<Crop> findByProductNameContainingIgnoreCase(String productName);

    // You can add more methods when you need advanced queries
}
