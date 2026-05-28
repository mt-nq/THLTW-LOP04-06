package com.btl.clubborrow.scheduler;

import com.btl.clubborrow.entity.BorrowRequest;
import com.btl.clubborrow.entity.BorrowStatus;
import com.btl.clubborrow.entity.NotificationType;
import com.btl.clubborrow.repository.BorrowRequestRepository;
import com.btl.clubborrow.service.EmailService;
import com.btl.clubborrow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OverdueCheckScheduler {

    private final BorrowRequestRepository borrowRequestRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // Chạy 8:00 sáng mỗi ngày - Nhắc nhở sắp đến hạn (ngày mai)
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendReturnReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<BorrowRequest> upcoming = borrowRequestRepository
                .findByStatusAndReturnDate(BorrowStatus.APPROVED, tomorrow);

        log.info("Checking return reminders: {} upcoming returns tomorrow", upcoming.size());

        for (BorrowRequest borrow : upcoming) {
            // Thông báo in-app
            notificationService.createNotification(
                borrow.getUser().getId(),
                "⏰ Nhắc nhở: Sắp đến hạn trả thiết bị",
                "Thiết bị " + borrow.getEquipment().getName() + " sẽ đến hạn trả vào ngày mai (" +
                borrow.getReturnDate().format(DATE_FMT) + "). Vui lòng trả đúng hạn.",
                NotificationType.RETURN_REMINDER
            );

            // Gửi email
            emailService.sendReturnReminderEmail(
                borrow.getUser().getEmail(),
                borrow.getUser().getName(),
                borrow.getEquipment().getName(),
                borrow.getReturnDate().format(DATE_FMT)
            );
        }
    }

    // Chạy 9:00 sáng mỗi ngày - Kiểm tra và đánh dấu quá hạn
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void checkOverdueRequests() {
        LocalDate today = LocalDate.now();
        List<BorrowRequest> overdue = borrowRequestRepository
                .findByStatusAndReturnDateBefore(BorrowStatus.APPROVED, today);

        log.info("Checking overdue requests: {} found", overdue.size());

        for (BorrowRequest borrow : overdue) {
            // Cập nhật trạng thái sang OVERDUE
            borrow.setStatus(BorrowStatus.OVERDUE);
            borrowRequestRepository.save(borrow);

            // Thông báo cảnh báo in-app
            notificationService.createNotification(
                borrow.getUser().getId(),
                "🚨 CẢNH BÁO: Thiết bị quá hạn trả!",
                "Thiết bị " + borrow.getEquipment().getName() + " đã quá hạn trả (hạn: " +
                borrow.getReturnDate().format(DATE_FMT) + "). Vui lòng trả ngay lập tức!",
                NotificationType.OVERDUE_WARNING
            );

            // Gửi email
            emailService.sendOverdueEmail(
                borrow.getUser().getEmail(),
                borrow.getUser().getName(),
                borrow.getEquipment().getName(),
                borrow.getReturnDate().format(DATE_FMT)
            );
        }
    }
}
