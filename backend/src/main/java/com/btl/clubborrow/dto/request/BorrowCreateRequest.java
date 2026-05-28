package com.btl.clubborrow.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BorrowCreateRequest {
    @NotNull(message = "Thiết bị không được để trống")
    private Long equipmentId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải >= 1")
    private Integer quantity;

    @NotNull(message = "Ngày mượn không được để trống")
    private LocalDate borrowDate;

    @NotNull(message = "Ngày trả không được để trống")
    @Future(message = "Ngày trả phải là ngày trong tương lai")
    private LocalDate returnDate;

    private String note;
}
