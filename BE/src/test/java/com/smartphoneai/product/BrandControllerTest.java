package com.smartphoneai.product;

import com.smartphoneai.controller.BrandController;
import com.smartphoneai.dto.response.BrandResponse;
import com.smartphoneai.service.BrandService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.List;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class BrandControllerTest {
    @Test void returnsBrandList() throws Exception {
        var service = mock(BrandService.class);
        when(service.list()).thenReturn(List.of(new BrandResponse("1", "Demo")));
        var mvc = MockMvcBuilders.standaloneSetup(new BrandController(service)).build();
        mvc.perform(get("/api/brands"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Demo"))
                .andExpect(jsonPath("$[0].id").value("1"));
    }
}
