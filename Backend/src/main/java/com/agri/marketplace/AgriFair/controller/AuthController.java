package com.agri.marketplace.AgriFair.controller;
import com.agri.marketplace.AgriFair.model.User;
import com.agri.marketplace.AgriFair.service.UserService;
import com.agri.marketplace.AgriFair.service.FileStorageService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.dao.DataIntegrityViolationException;
import com.agri.marketplace.AgriFair.security.JwtUtil;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private FileStorageService fileStorageService;

    // JSON registration (without profile image)
    @PostMapping(value = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> registerUserJson(@RequestBody UserRegistrationRequest request) {
        return registerUserInternal(request, null);
    }

    // Multipart registration (with optional profile image)
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerUserMultipart(
            @RequestPart("user") UserRegistrationRequest request,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        return registerUserInternal(request, profileImage);
    }

    // Common registration logic
    private ResponseEntity<?> registerUserInternal(UserRegistrationRequest request, MultipartFile profileImage) {
        // basic field validation
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body("Username is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        // duplicate checks
        if (userService.findByUsername(request.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userService.findByEmail(request.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // normalize role
        String role = request.getRole();
        if (role == null || role.isBlank()) {
            role = "ROLE_CUSTOMER";
        } else if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role.toUpperCase();
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(role);
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());

        // Handle profile image upload
        if (profileImage != null && !profileImage.isEmpty()) {
            try {
                String imageUrl = fileStorageService.storeFile(profileImage);
                user.setProfileImage(imageUrl);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Failed to upload profile image: " + e.getMessage());
            }
        }

        try {
            User savedUser = userService.registerUser(user);
            return ResponseEntity.ok("User registered successfully");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body("Username or email already exists");
        }
    }


    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            Map<String, Object> claims = new HashMap<>();
            claims.put("role", authentication.getAuthorities().iterator().next().getAuthority());
            String token = jwtUtil.generateToken(request.getUsername(), claims);

            Map<String, Object> payload = new HashMap<>();
            payload.put("token", token);
            payload.put("username", request.getUsername());
            payload.put("role", claims.get("role"));

            return ResponseEntity.ok(payload);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid Credentials");
        }
    }
}

@Data
class UserRegistrationRequest {
    private String username;
    private String email;
    private String password;
    private String role;
    private String fullName;
    private String phoneNumber;
    // OPTIONALLY: ROLE_FARMER or ROLE_CUSTOMER
}

@Data
class LoginRequest {
    private String username;
    private String password;
}
