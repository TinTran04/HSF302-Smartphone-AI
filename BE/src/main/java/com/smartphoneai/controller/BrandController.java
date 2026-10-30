package com.smartphoneai.controller;

import com.smartphoneai.dto.response.BrandResponse;
import com.smartphoneai.service.BrandService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {
    private final BrandService service;
    public BrandController(BrandService service) { this.service = service; }
    @GetMapping
    public List<BrandResponse> list() { return service.list(); }
}
