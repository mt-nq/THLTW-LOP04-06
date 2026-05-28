package com.btl.clubborrow.entity;

public enum BorrowStatus {
    PENDING,    // Chờ duyệt
    APPROVED,   // Đã duyệt
    REJECTED,   // Từ chối
    RETURNED,   // Đã trả
    OVERDUE     // Quá hạn
}
