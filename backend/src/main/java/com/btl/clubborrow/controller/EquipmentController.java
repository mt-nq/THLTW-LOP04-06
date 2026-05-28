package com.btl.clubborrow.controller;

import com.btl.clubborrow.dto.request.EquipmentRequest;
import com.btl.clubborrow.dto.response.ApiResponse;
import com.btl.clubborrow.dto.response.EquipmentResponse;
import com.btl.clubborrow.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    // Sinh viên và Admin đều xem được
    @GetMapping
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean admin) {
        List<EquipmentResponse> list = admin
                ? equipmentService.getAllForAdmin()
                : equipmentService.getAll(search);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(equipmentService.getById(id)));
    }

    // Chỉ Admin
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> create(@Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm thiết bị thành công", equipmentService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> update(
            @PathVariable Long id, @Valid @RequestBody EquipmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thiết bị thành công", equipmentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thiết bị thành công", null));
    }
}
