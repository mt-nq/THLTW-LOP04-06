package com.btl.clubborrow.service;

import com.btl.clubborrow.dto.request.BorrowCreateRequest;
import com.btl.clubborrow.dto.request.ExtendBorrowRequest;
import com.btl.clubborrow.dto.request.RejectRequest;
import com.btl.clubborrow.dto.request.ApproveRequest;
import com.btl.clubborrow.dto.response.BorrowResponse;
import com.btl.clubborrow.entity.*;
import com.btl.clubborrow.exception.ResourceNotFoundException;
import com.btl.clubborrow.repository.BorrowRequestRepository;
import com.btl.clubborrow.repository.EquipmentRepository;
import com.btl.clubborrow.repository.UserRepository;
import com.btl.clubborrow.scheduler.OverdueCheckScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final OverdueCheckScheduler overdueCheckScheduler;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ===== Sinh viên =====
    public BorrowResponse createRequest(BorrowCreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Thiết bị không tồn tại"));

        if (equipment.getAvailableQuantity() < request.getQuantity()) {
            throw new RuntimeException("Số lượng thiết bị không đủ. Hiện còn: " + equipment.getAvailableQuantity());
        }
        if (!request.getReturnDate().isAfter(request.getBorrowDate())) {
            throw new RuntimeException("Ngày trả phải sau ngày mượn");
        }

        BorrowRequest borrow = BorrowRequest.builder()
                .user(user)
                .equipment(equipment)
                .quantity(request.getQuantity())
                .borrowDate(request.getBorrowDate())
                .returnDate(request.getReturnDate())
                .status(BorrowStatus.PENDING)
                .note(request.getNote())
                .build();
        return toResponse(borrowRequestRepository.save(borrow));
    }

    public List<BorrowResponse> getMyBorrows(Long userId) {
        // Cập nhật trạng thái quá hạn trước khi lấy dữ liệu
        overdueCheckScheduler.checkOverdueRequests();

        return borrowRequestRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BorrowResponse extendBorrowRequest(Long id, Long userId, ExtendBorrowRequest request) {
        BorrowRequest borrow = getBorrowOrThrow(id);

        if (!borrow.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền gia hạn phiếu mượn này");
        }

        if (borrow.getStatus() != BorrowStatus.APPROVED) {
            throw new RuntimeException("Chỉ có thể gia hạn khi thiết bị đang được mượn");
        }

        if (borrow.isExtended()) {
            throw new RuntimeException("Phiếu mượn này đã được gia hạn trước đó, không thể gia hạn thêm");
        }

        LocalDate now = LocalDate.now();
        LocalDate returnDate = borrow.getReturnDate();
        
        // Chỉ cho phép gia hạn nếu còn <= 3 ngày so với ngày trả, và chưa quá hạn
        if (now.isAfter(returnDate)) {
            throw new RuntimeException("Thiết bị đã quá hạn, không thể gia hạn");
        }
        if (now.plusDays(3).isBefore(returnDate)) {
            throw new RuntimeException("Chỉ có thể gia hạn khi thời gian trả còn từ 3 ngày trở xuống");
        }

        borrow.setReturnDate(returnDate.plusDays(request.getDays()));
        borrow.setExtended(true);
        borrowRequestRepository.save(borrow);

        // Gửi thông báo in-app
        notificationService.createNotification(
            borrow.getUser().getId(),
            "🔄 Gia hạn thành công",
            "Bạn đã gia hạn thành công " + borrow.getEquipment().getName() + " thêm " + request.getDays() + " ngày. Hạn trả mới: " + borrow.getReturnDate().format(DATE_FMT),
            NotificationType.EXTENDED
        );

        return toResponse(borrow);
    }

    // ===== Admin =====
    public List<BorrowResponse> getAll() {
        // Cập nhật trạng thái quá hạn trước khi lấy dữ liệu
        overdueCheckScheduler.checkOverdueRequests();

        return borrowRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BorrowResponse approve(Long id, ApproveRequest request) {
        BorrowRequest borrow = getBorrowOrThrow(id);
        if (borrow.getStatus() != BorrowStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể duyệt yêu cầu ở trạng thái PENDING");
        }

        Equipment equipment = borrow.getEquipment();
        if (equipment.getAvailableQuantity() < borrow.getQuantity()) {
            throw new RuntimeException("Số lượng thiết bị không đủ");
        }

        // Giảm số lượng kho
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() - borrow.getQuantity());
        equipmentRepository.save(equipment);

        borrow.setStatus(BorrowStatus.APPROVED);
        if (request != null && request.getAdminNote() != null) {
            borrow.setAdminNote(request.getAdminNote());
        }
        borrowRequestRepository.save(borrow);

        // Gửi thông báo in-app
        notificationService.createNotification(
            borrow.getUser().getId(),
            "✅ Yêu cầu mượn được duyệt",
            "Yêu cầu mượn " + equipment.getName() + " của bạn đã được duyệt. Hạn trả: " + borrow.getReturnDate().format(DATE_FMT),
            NotificationType.APPROVED
        );

        // Gửi email
        emailService.sendApprovalEmail(
            borrow.getUser().getEmail(),
            borrow.getUser().getName(),
            equipment.getName(),
            borrow.getBorrowDate().format(DATE_FMT),
            borrow.getReturnDate().format(DATE_FMT)
        );

        return toResponse(borrow);
    }

    @Transactional
    public BorrowResponse reject(Long id, RejectRequest request) {
        BorrowRequest borrow = getBorrowOrThrow(id);
        if (borrow.getStatus() != BorrowStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể từ chối yêu cầu ở trạng thái PENDING");
        }

        borrow.setStatus(BorrowStatus.REJECTED);
        borrow.setAdminNote(request.getAdminNote());
        borrowRequestRepository.save(borrow);

        // Gửi thông báo in-app
        notificationService.createNotification(
            borrow.getUser().getId(),
            "❌ Yêu cầu mượn bị từ chối",
            "Yêu cầu mượn " + borrow.getEquipment().getName() + " của bạn đã bị từ chối." +
            (request.getAdminNote() != null ? " Lý do: " + request.getAdminNote() : ""),
            NotificationType.REJECTED
        );

        // Gửi email
        emailService.sendRejectionEmail(
            borrow.getUser().getEmail(),
            borrow.getUser().getName(),
            borrow.getEquipment().getName(),
            request.getAdminNote()
        );

        return toResponse(borrow);
    }

    @Transactional
    public BorrowResponse markReturned(Long id) {
        BorrowRequest borrow = getBorrowOrThrow(id);
        if (borrow.getStatus() != BorrowStatus.APPROVED && borrow.getStatus() != BorrowStatus.OVERDUE) {
            throw new RuntimeException("Chỉ có thể ghi nhận trả với yêu cầu đang mượn");
        }

        Equipment equipment = borrow.getEquipment();
        // Tăng lại số lượng kho
        equipment.setAvailableQuantity(equipment.getAvailableQuantity() + borrow.getQuantity());
        equipmentRepository.save(equipment);

        borrow.setStatus(BorrowStatus.RETURNED);
        borrow.setActualReturnDate(LocalDate.now());
        borrowRequestRepository.save(borrow);

        return toResponse(borrow);
    }

    private BorrowRequest getBorrowOrThrow(Long id) {
        return borrowRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu mượn không tồn tại với id: " + id));
    }

    public BorrowResponse toResponse(BorrowRequest b) {
        return BorrowResponse.builder()
                .id(b.getId())
                .userId(b.getUser().getId())
                .userName(b.getUser().getName())
                .userEmail(b.getUser().getEmail())
                .userStudentId(b.getUser().getStudentId())
                .equipmentId(b.getEquipment().getId())
                .equipmentName(b.getEquipment().getName())
                .equipmentImageUrl(b.getEquipment().getImageUrl())
                .quantity(b.getQuantity())
                .borrowDate(b.getBorrowDate())
                .returnDate(b.getReturnDate())
                .actualReturnDate(b.getActualReturnDate())
                .status(b.getStatus())
                .note(b.getNote())
                .adminNote(b.getAdminNote())
                .isExtended(b.isExtended())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
