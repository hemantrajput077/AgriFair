package com.agri.marketplace.AgriFair.service;

import com.agri.marketplace.AgriFair.model.Farmer;
import com.agri.marketplace.AgriFair.repository.FarmerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FarmerService {

    private final FarmerRepository farmerRepository;

    public FarmerService(FarmerRepository farmerRepository) {
        this.farmerRepository = farmerRepository;
    }

    public List<Farmer> getFarmers() {
        return farmerRepository.findAll();
    }

    public Farmer getFarmerById(Long id) {
        return farmerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Farmer not found: " + id));
    }

    @Transactional
    public Farmer createFarmer(Farmer farmer) {
        farmerRepository.findByEmail(farmer.getEmail())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email already registered: " + existing.getEmail());
                });

        farmerRepository.findByPhoneNo(farmer.getPhoneNo())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Phone already registered: " + existing.getPhoneNo());
                });

        return farmerRepository.save(farmer);
    }
}

