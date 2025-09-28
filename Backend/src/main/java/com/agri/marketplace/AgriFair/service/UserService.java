package com.agri.marketplace.AgriFair.service;

import com.agri.marketplace.AgriFair.model.User;
import com.agri.marketplace.AgriFair.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Set role if needed, e.g. ROLE_CUSTOMER as default
        if (user.getRole() == null) {
            user.setRole("ROLE_CUSTOMER");
        }
        return userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}