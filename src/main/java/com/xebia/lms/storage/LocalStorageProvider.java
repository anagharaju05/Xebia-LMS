package com.xebia.lms.storage;

import com.xebia.lms.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class LocalStorageProvider implements StorageProvider {

    private static final String STORAGE_DIR = "storage-uploads";

    public LocalStorageProvider() {
        try {
            Files.createDirectories(Paths.get(STORAGE_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize local storage directory", e);
        }
    }

    @Override
    public UploadResponse upload(File file) {
        if (file == null || !file.exists()) {
            throw new BadRequestException("File does not exist or is empty");
        }

        try {
            String extension = "";
            int i = file.getName().lastIndexOf('.');
            if (i > 0) {
                extension = file.getName().substring(i);
            }

            String fileKey = UUID.randomUUID().toString() + extension;
            Path targetPath = Paths.get(STORAGE_DIR).resolve(fileKey);
            Files.copy(file.toPath(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/files/" + fileKey;

            return UploadResponse.builder()
                    .fileKey(fileKey)
                    .fileUrl(fileUrl)
                    .fileSize(file.length())
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to local storage", e);
        }
    }

    @Override
    public void delete(String fileKey) {
        if (fileKey == null || fileKey.isBlank()) {
            return;
        }
        try {
            Path filePath = Paths.get(STORAGE_DIR).resolve(fileKey);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file from local storage", e);
        }
    }

    @Override
    public String generateSignedUrl(String fileKey) {
        if (fileKey == null || fileKey.isBlank()) {
            return "";
        }
        // Simulated signed URL
        return "http://localhost:8080/files/" + fileKey + "?token=" + UUID.randomUUID().toString().substring(0, 8);
    }
}
