package com.btl.clubborrow.dto.response;

import com.btl.clubborrow.entity.BorrowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowResponse {
    private Long id;
    // User info
    private Long userId;
    private String userName;
    private String userEmail;
    private String userStudentId;
    // Equipment info
    private Long equipmentId;
    private String equipmentName;
    private String equipmentImageUrl;
    // Borrow info
    private Integer quantity;
    private LocalDate borrowDate;
    private LocalDate returnDate;
    private LocalDate actualReturnDate;
    private BorrowStatus status;
    private String note;
    private String adminNote;
    private boolean isExtended;
    private LocalDateTime createdAt;
}
