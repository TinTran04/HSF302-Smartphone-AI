package com.smartphoneai.dto.request;
import jakarta.validation.constraints.*;
public record ShippingInfo(@NotBlank @Size(max=255) String fullName,
        @NotBlank @Pattern(regexp="[+0-9][0-9 -]{8,14}") String phone,
        @NotBlank @Size(max=255) String address, @Size(max=255) String note) {
    public ShippingInfo normalized() { return new ShippingInfo(fullName.trim(), phone.trim(), address.trim(), note == null ? "" : note.trim()); }
}
