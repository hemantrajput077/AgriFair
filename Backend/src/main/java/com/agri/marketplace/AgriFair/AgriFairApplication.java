package com.agri.marketplace.AgriFair;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity(prePostEnabled = true)
public class AgriFairApplication {
	public static void main(String[] args) {
		SpringApplication.run(AgriFairApplication.class, args);
	}
}


