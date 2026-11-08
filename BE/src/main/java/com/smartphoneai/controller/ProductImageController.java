package com.smartphoneai.controller;

import com.smartphoneai.service.ProductImageService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Duration;

@RestController
@RequestMapping("/api/product-images")
public class ProductImageController {
    private final ProductImageService images;
    public ProductImageController(ProductImageService images) { this.images = images; }
    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> read(@PathVariable String filename) {
        var image = images.read(filename);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(image.contentType()))
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePublic().immutable())
                .body(image.bytes());
    }
}
