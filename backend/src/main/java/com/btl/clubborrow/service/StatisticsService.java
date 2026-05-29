package com.btl.clubborrow.service;

import com.btl.clubborrow.dto.response.BorrowResponse;
import com.btl.clubborrow.dto.response.DashboardStats;
import com.btl.clubborrow.entity.BorrowStatus;
import com.btl.clubborrow.repository.BorrowRequestRepository;
import com.btl.clubborrow.repository.EquipmentRepository;
import com.btl.clubborrow.scheduler.OverdueCheckScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final EquipmentRepository equipmentRepository;
    private final BorrowService borrowService;
    private final OverdueCheckScheduler overdueCheckScheduler;

    public DashboardStats getDashboardStats() {
        // Cập nhật trạng thái quá hạn trước khi lấy dữ liệu
        overdueCheckScheduler.checkOverdueRequests();

        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        List<Object[]> rawStats = borrowRequestRepository.findMonthlyStatistics(month, year);
        List<DashboardStats.MonthlyStatItem> monthlyStats = new ArrayList<>();
        for (Object[] row : rawStats) {
            monthlyStats.add(DashboardStats.MonthlyStatItem.builder()
                    .equipmentId(((Number) row[0]).longValue())
                    .equipmentName((String) row[1])
                    .borrowCount(((Number) row[2]).longValue())
                    .build());
        }

        return DashboardStats.builder()
                .totalEquipment(equipmentRepository.sumTotalQuantity())
                .totalBorrowing(borrowRequestRepository.sumQuantityByStatus(BorrowStatus.APPROVED))
                .totalPending(borrowRequestRepository.sumQuantityByStatus(BorrowStatus.PENDING))
                .totalOverdue(borrowRequestRepository.sumQuantityByStatus(BorrowStatus.OVERDUE))
                .monthlyStats(monthlyStats)
                .build();
    }

    public List<DashboardStats.MonthlyStatItem> getMonthlyStatistics(int month, int year) {
        // Cập nhật trạng thái quá hạn trước khi lấy dữ liệu
        overdueCheckScheduler.checkOverdueRequests();

        List<Object[]> rawStats = borrowRequestRepository.findMonthlyStatistics(month, year);
        List<DashboardStats.MonthlyStatItem> result = new ArrayList<>();
        for (Object[] row : rawStats) {
            result.add(DashboardStats.MonthlyStatItem.builder()
                    .equipmentId(((Number) row[0]).longValue())
                    .equipmentName((String) row[1])
                    .borrowCount(((Number) row[2]).longValue())
                    .build());
        }
        return result;
    }

    public List<BorrowResponse> getOverdueList() {
        // Cập nhật trạng thái quá hạn trước khi lấy dữ liệu
        overdueCheckScheduler.checkOverdueRequests();

        return borrowRequestRepository.findByStatus(BorrowStatus.OVERDUE)
                .stream().map(borrowService::toResponse).collect(Collectors.toList());
    }
}
