package com.agri.marketplace.AgriFair.repository;

import com.agri.marketplace.AgriFair.model.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Optional<Farmer> findByEmail(String email);
    Optional<Farmer> findByPhoneNo(String phoneNo);
}

