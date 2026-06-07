package com.btl.clubborrow.entity;

public enum NotificationType {
    APPROVED,           // Yêu cầu được duyệt
    REJECTED,           // Yêu cầu bị từ chối
    RETURN_REMINDER,    // Nhắc nhở sắp đến hạn trả
    OVERDUE_WARNING,    // Cảnh báo quá hạn
    EXTENDED            // Đã gia hạn
}
