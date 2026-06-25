package com.xebia.lms.storage;

import java.io.File;

public interface StorageProvider {
    UploadResponse upload(File file);
    void delete(String fileKey);
    String generateSignedUrl(String fileKey);
}
