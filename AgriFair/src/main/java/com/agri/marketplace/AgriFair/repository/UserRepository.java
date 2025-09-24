package com.agri.marketplace.AgriFair.repository;
import com.agri.marketplace.AgriFair.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

    @Repository
    public interface UserRepository extends JpaRepository<User, Long> {
        User findByUsername(String username);
    }

