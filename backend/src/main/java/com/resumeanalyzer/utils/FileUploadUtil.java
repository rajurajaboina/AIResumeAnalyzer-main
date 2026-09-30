package com.resumeanalyzer.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
public class FileUploadUtil {
    
    @Value("${file.upload.dir:./uploads}")
    private String uploadDir;
    
    public String uploadFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath);
        
        return filePath.toString();
    }
    
    public boolean isValidFileType(String filename) {
        String lowerFilename = filename.toLowerCase();
        return lowerFilename.endsWith(".pdf") || lowerFilename.endsWith(".docx");
    }
    
    public boolean isValidFileSize(MultipartFile file, long maxSize) {
        return file.getSize() <= maxSize;
    }
}
