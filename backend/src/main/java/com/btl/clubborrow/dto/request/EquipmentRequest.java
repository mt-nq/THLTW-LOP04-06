package com.btl.clubborrow.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EquipmentRequest {
    @NotBlank(message = "Tên thiết bị không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Số lượng tổng không được để trống")
    @Min(value = 0, message = "Số lượng phải >= 0")
    private Integer totalQuantity;

    @NotNull(message = "Số lượng khả dụng không được để trống")
    @Min(value = 0, message = "Số lượng phải >= 0")
    private Integer availableQuantity;

    private String imageUrl;
}
