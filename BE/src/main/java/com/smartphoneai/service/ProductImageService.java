package com.smartphoneai.service;

import org.springframework.web.multipart.MultipartFile;

public interface ProductImageService {
    String upload(MultipartFile file);
    Image read(String filename);
    record Image(byte[] bytes, String contentType) {}
}
