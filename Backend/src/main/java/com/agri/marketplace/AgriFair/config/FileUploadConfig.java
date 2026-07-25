package com.agri.marketplace.AgriFair.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path for uploads directory
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadPathString = uploadPath.toUri().toString();

        // Map /uploads/** URLs to the uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPathString + "/")
                .setCachePeriod(3600); // Cache for 1 hour

        System.out.println("Serving uploads from: " + uploadPathString);
    }
}
