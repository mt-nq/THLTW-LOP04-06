package com.btl.clubborrow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private Long totalEquipment;
    private Long totalBorrowing;    // Đang mượn (APPROVED)
    private Long totalPending;      // Chờ duyệt
    private Long totalOverdue;      // Quá hạn
    private List<MonthlyStatItem> monthlyStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStatItem {
        private Long equipmentId;
        private String equipmentName;
        private Long borrowCount;
    }
}
