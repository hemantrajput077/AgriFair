package com.agri.marketplace.AgriFair.service;

import com.agri.marketplace.AgriFair.dto.ProfileResponseDto;
import com.agri.marketplace.AgriFair.dto.ProfileUpdateDto;
import com.agri.marketplace.AgriFair.model.User;
import com.agri.marketplace.AgriFair.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Get user profile by username
     */
    public ProfileResponseDto getProfile(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        return mapToResponseDto(user);
    }

    /**
     * Update user profile (text fields)
     */
    @Transactional
    public ProfileResponseDto updateProfile(String username, ProfileUpdateDto updateDto) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        // Update common fields
        if (updateDto.getFullName() != null) {
            user.setFullName(updateDto.getFullName());
        }
        if (updateDto.getPhoneNumber() != null) {
            user.setPhoneNumber(updateDto.getPhoneNumber());
        }
        if (updateDto.getAddress() != null) {
            user.setAddress(updateDto.getAddress());
        }
        if (updateDto.getCity() != null) {
            user.setCity(updateDto.getCity());
        }
        if (updateDto.getState() != null) {
            user.setState(updateDto.getState());
        }
        if (updateDto.getPincode() != null) {
            user.setPincode(updateDto.getPincode());
        }
        if (updateDto.getBio() != null) {
            user.setBio(updateDto.getBio());
        }

        // Update farmer-specific fields (only if user is a farmer)
        if (user.getRole() != null && user.getRole().contains("FARMER")) {
            if (updateDto.getFarmName() != null) {
                user.setFarmName(updateDto.getFarmName());
            }
            if (updateDto.getFarmSize() != null) {
                user.setFarmSize(updateDto.getFarmSize());
            }
            if (updateDto.getFarmingType() != null) {
                user.setFarmingType(updateDto.getFarmingType());
            }
            if (updateDto.getYearsOfExperience() != null) {
                user.setYearsOfExperience(updateDto.getYearsOfExperience());
            }
        }

        // Update customer-specific fields (only if user is a customer)
        if (user.getRole() != null && user.getRole().contains("CUSTOMER")) {
            if (updateDto.getPreferredDeliveryTime() != null) {
                user.setPreferredDeliveryTime(updateDto.getPreferredDeliveryTime());
            }
        }

        User updatedUser = userRepository.save(user);
        return mapToResponseDto(updatedUser);
    }

    /**
     * Update profile image
     */
    @Transactional
    public ProfileResponseDto updateProfileImage(String username, MultipartFile imageFile) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        try {
            // Delete old image if exists
            if (user.getProfileImage() != null && !user.getProfileImage().isEmpty()) {
                fileStorageService.deleteFile(user.getProfileImage());
            }

            // Upload new image
            String imageUrl = fileStorageService.storeFile(imageFile);
            user.setProfileImage(imageUrl);

            User updatedUser = userRepository.save(user);
            return mapToResponseDto(updatedUser);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update profile image: " + e.getMessage(), e);
        }
    }

    /**
     * Delete profile image
     */
    @Transactional
    public ProfileResponseDto deleteProfileImage(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        // Delete image file if exists
        if (user.getProfileImage() != null && !user.getProfileImage().isEmpty()) {
            try {
                fileStorageService.deleteFile(user.getProfileImage());
            } catch (Exception e) {
                // Log error but continue - file might already be deleted
                System.err.println("Error deleting image file: " + e.getMessage());
            }
        }

        user.setProfileImage(null);
        User updatedUser = userRepository.save(user);
        return mapToResponseDto(updatedUser);
    }

    /**
     * Map User entity to ProfileResponseDto
     */
    private ProfileResponseDto mapToResponseDto(User user) {
        ProfileResponseDto dto = new ProfileResponseDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setFullName(user.getFullName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setProfileImage(user.getProfileImage());
        dto.setAddress(user.getAddress());
        dto.setCity(user.getCity());
        dto.setState(user.getState());
        dto.setPincode(user.getPincode());
        dto.setBio(user.getBio());
        dto.setFarmName(user.getFarmName());
        dto.setFarmSize(user.getFarmSize());
        dto.setFarmingType(user.getFarmingType());
        dto.setYearsOfExperience(user.getYearsOfExperience());
        dto.setPreferredDeliveryTime(user.getPreferredDeliveryTime());
        dto.setIsVerified(user.getIsVerified());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
