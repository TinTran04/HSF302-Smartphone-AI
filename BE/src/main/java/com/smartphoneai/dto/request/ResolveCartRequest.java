package com.smartphoneai.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ResolveCartRequest(@NotNull @Size(max = 100) List<@Valid CartItemRequest> items) {}
