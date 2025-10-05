package com.agri.marketplace.AgriFair.service;

import com.agri.marketplace.AgriFair.dto.CropRequestDto;
import com.agri.marketplace.AgriFair.dto.CropResponseDto;
import com.agri.marketplace.AgriFair.model.Crop;
import com.agri.marketplace.AgriFair.model.User;
import com.agri.marketplace.AgriFair.repository.CropRepository;
import com.agri.marketplace.AgriFair.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CropService {
    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private UserRepository userRepository;

    public CropResponseDto addCrop(Authentication auth, CropRequestDto cropDto) {
        User farmer = userRepository.findByUsername(auth.getName());
        Crop crop = new Crop();
        crop.setProductName(cropDto.getProductName());
        crop.setDescription(cropDto.getDescription());
        crop.setPrice(cropDto.getPrice());
        crop.setQuantity(cropDto.getQuantity());
        crop.setOrganic(cropDto.isOrganic());
        crop.setPhotoUrl(cropDto.getPhotoUrl());
        crop.setFarmer(farmer);
        Crop saved = cropRepository.save(crop);

        CropResponseDto response = new CropResponseDto();
        response.setId(saved.getId());
        response.setProductName(saved.getProductName());
        response.setDescription(saved.getDescription());
        response.setPrice(saved.getPrice());
        response.setQuantity(saved.getQuantity());
        response.setOrganic(saved.isOrganic());
        response.setPhotoUrl(saved.getPhotoUrl());
        response.setFarmerUsername(farmer.getUsername());
        return response;
    }

    public List<CropResponseDto> getCropsByFarmer(Authentication auth) {
        User farmer = userRepository.findByUsername(auth.getName());
        return cropRepository.findByFarmer(farmer)
                .stream().map(crop -> {
                    CropResponseDto dto = new CropResponseDto();
                    dto.setId(crop.getId());
                    dto.setProductName(crop.getProductName());
                    dto.setDescription(crop.getDescription());
                    dto.setPrice(crop.getPrice());
                    dto.setQuantity(crop.getQuantity());
                    dto.setOrganic(crop.isOrganic());
                    dto.setPhotoUrl(crop.getPhotoUrl());
                    dto.setFarmerUsername(farmer.getUsername());
                    return dto;
                }).collect(Collectors.toList());
    }

    public List<CropResponseDto> getAllCrops() {
        return cropRepository.findAll()
                .stream().map(crop -> {
                    CropResponseDto dto = new CropResponseDto();
                    dto.setId(crop.getId());
                    dto.setProductName(crop.getProductName());
                    dto.setDescription(crop.getDescription());
                    dto.setPrice(crop.getPrice());
                    dto.setQuantity(crop.getQuantity());
                    dto.setOrganic(crop.isOrganic());
                    dto.setPhotoUrl(crop.getPhotoUrl());
                    dto.setFarmerUsername(crop.getFarmer().getUsername());
                    return dto;
                }).collect(Collectors.toList());
    }

    // Add update and delete as needed, always verifying ownership via auth
}