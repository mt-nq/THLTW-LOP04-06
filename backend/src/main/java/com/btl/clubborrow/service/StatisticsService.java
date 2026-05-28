package com.btl.clubborrow.service;

import com.btl.clubborrow.dto.response.BorrowResponse;
import com.btl.clubborrow.dto.response.DashboardStats;
import com.btl.clubborrow.entity.BorrowStatus;
import com.btl.clubborrow.repository.BorrowRequestRepository;
import com.btl.clubborrow.repository.EquipmentRepository;
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

    public DashboardStats getDashboardStats() {
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
                .totalEquipment(equipmentRepository.count())
                .totalBorrowing(borrowRequestRepository.countByStatus(BorrowStatus.APPROVED))
                .totalPending(borrowRequestRepository.countByStatus(BorrowStatus.PENDING))
                .totalOverdue(borrowRequestRepository.countByStatus(BorrowStatus.OVERDUE))
                .monthlyStats(monthlyStats)
                .build();
    }

    public List<DashboardStats.MonthlyStatItem> getMonthlyStatistics(int month, int year) {
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
        return borrowRequestRepository.findByStatus(BorrowStatus.OVERDUE)
                .stream().map(borrowService::toResponse).collect(Collectors.toList());
    }
}
