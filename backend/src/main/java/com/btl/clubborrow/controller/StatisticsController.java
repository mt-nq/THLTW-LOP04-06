package com.btl.clubborrow.controller;

import com.btl.clubborrow.dto.response.ApiResponse;
import com.btl.clubborrow.dto.response.BorrowResponse;
import com.btl.clubborrow.dto.response.DashboardStats;
import com.btl.clubborrow.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(statisticsService.getDashboardStats()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<DashboardStats.MonthlyStatItem>>> getMonthly(
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {
        if (month == 0) month = LocalDate.now().getMonthValue();
        if (year == 0) year = LocalDate.now().getYear();
        return ResponseEntity.ok(ApiResponse.success(statisticsService.getMonthlyStatistics(month, year)));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<BorrowResponse>>> getOverdue() {
        return ResponseEntity.ok(ApiResponse.success(statisticsService.getOverdueList()));
    }
}
