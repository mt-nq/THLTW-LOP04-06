package com.btl.clubborrow.controller;

import com.btl.clubborrow.dto.request.BorrowCreateRequest;
import com.btl.clubborrow.dto.request.ExtendBorrowRequest;
import com.btl.clubborrow.dto.request.RejectRequest;
import com.btl.clubborrow.dto.request.ApproveRequest;
import com.btl.clubborrow.dto.response.ApiResponse;
import com.btl.clubborrow.dto.response.BorrowResponse;
import com.btl.clubborrow.entity.User;
import com.btl.clubborrow.service.BorrowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrows")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    // Admin: xem tất cả yêu cầu
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BorrowResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(borrowService.getAll()));
    }

    // Sinh viên: xem yêu cầu của mình
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<BorrowResponse>>> getMyBorrows(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(borrowService.getMyBorrows(user.getId())));
    }

    // Sinh viên: tạo yêu cầu mượn
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<BorrowResponse>> create(
            @Valid @RequestBody BorrowCreateRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi yêu cầu mượn thành công", borrowService.createRequest(request, user.getId())));
    }

    // Sinh viên: gia hạn mượn thiết bị
    @PostMapping("/{id}/extend")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<BorrowResponse>> extend(
            @PathVariable Long id,
            @Valid @RequestBody ExtendBorrowRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success("Gia hạn thành công", borrowService.extendBorrowRequest(id, user.getId(), request)));
    }

    // Admin: duyệt yêu cầu
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BorrowResponse>> approve(
            @PathVariable Long id, @RequestBody(required = false) ApproveRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Duyệt yêu cầu thành công", borrowService.approve(id, request)));
    }

    // Admin: từ chối yêu cầu
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BorrowResponse>> reject(
            @PathVariable Long id, @RequestBody RejectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Từ chối yêu cầu thành công", borrowService.reject(id, request)));
    }

    // Admin: ghi nhận trả thiết bị
    @PutMapping("/{id}/return")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BorrowResponse>> markReturned(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ghi nhận trả thành công", borrowService.markReturned(id)));
    }
}
