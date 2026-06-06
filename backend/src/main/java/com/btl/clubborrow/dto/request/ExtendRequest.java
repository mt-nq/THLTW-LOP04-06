package com.btl.clubborrow.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExtendRequest {
    @NotNull(message = "Ngày trả mới không được để trống")
    private LocalDate newReturnDate;
}
