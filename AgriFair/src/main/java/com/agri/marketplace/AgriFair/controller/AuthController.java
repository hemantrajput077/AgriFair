package com.agri.marketplace.AgriFair.controller;
import com.agri.marketplace.AgriFair.model.User;
import com.agri.marketplace.AgriFair.service.UserService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        if(userService.findByUsername(request.getUsername()) != null){
            return ResponseEntity.badRequest().body("Username already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole()); // e.g., ROLE_FARMER or ROLE_CUSTOMER
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return ResponseEntity.ok("User logged in successfully.");
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid Credentials");
        }
    }
}

@Data
class UserRegistrationRequest {
    private String username;
    private String password;
    private String role;  // OPTIONALLY: ROLE_FARMER or ROLE_CUSTOMER
}

@Data
class LoginRequest {
    private String username;
    private String password;
}
