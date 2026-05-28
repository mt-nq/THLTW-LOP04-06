package com.btl.clubborrow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.from-email}")
    private String fromEmail;

    @Value("${app.from-name}")
    private String fromName;

    @Async
    public void sendApprovalEmail(String toEmail, String toName, String equipmentName,
                                   String borrowDate, String returnDate) {
        String subject = "✅ Yêu cầu mượn thiết bị đã được duyệt";
        String content = buildEmailTemplate(
            "Yêu cầu mượn của bạn đã được duyệt!",
            toName,
            "<p>Yêu cầu mượn <strong>" + equipmentName + "</strong> của bạn đã được <span style='color:#52c41a;font-weight:bold'>DUYỆT</span>.</p>" +
            "<p>📅 Ngày mượn: <strong>" + borrowDate + "</strong></p>" +
            "<p>📅 Ngày trả: <strong>" + returnDate + "</strong></p>" +
            "<p>Vui lòng đến nhận thiết bị đúng hạn và trả đúng thời gian quy định.</p>"
        );
        sendHtmlEmail(toEmail, subject, content);
    }

    @Async
    public void sendRejectionEmail(String toEmail, String toName, String equipmentName, String reason) {
        String subject = "❌ Yêu cầu mượn thiết bị bị từ chối";
        String content = buildEmailTemplate(
            "Yêu cầu mượn của bạn đã bị từ chối",
            toName,
            "<p>Rất tiếc, yêu cầu mượn <strong>" + equipmentName + "</strong> của bạn đã bị <span style='color:#ff4d4f;font-weight:bold'>TỪ CHỐI</span>.</p>" +
            (reason != null && !reason.isBlank() ? "<p>📝 Lý do: <em>" + reason + "</em></p>" : "") +
            "<p>Bạn có thể gửi yêu cầu mới hoặc liên hệ quản trị viên để biết thêm chi tiết.</p>"
        );
        sendHtmlEmail(toEmail, subject, content);
    }

    @Async
    public void sendReturnReminderEmail(String toEmail, String toName, String equipmentName, String returnDate) {
        String subject = "⏰ Nhắc nhở: Thiết bị sắp đến hạn trả";
        String content = buildEmailTemplate(
            "Nhắc nhở trả thiết bị",
            toName,
            "<p>Thiết bị <strong>" + equipmentName + "</strong> bạn đang mượn sắp đến hạn trả.</p>" +
            "<p>📅 Hạn trả: <strong style='color:#fa8c16'>" + returnDate + "</strong></p>" +
            "<p>Vui lòng trả thiết bị đúng hạn để tránh bị ghi nhận quá hạn.</p>"
        );
        sendHtmlEmail(toEmail, subject, content);
    }

    @Async
    public void sendOverdueEmail(String toEmail, String toName, String equipmentName, String returnDate) {
        String subject = "🚨 CẢNH BÁO: Thiết bị đã quá hạn trả!";
        String content = buildEmailTemplate(
            "Thiết bị đã quá hạn trả",
            toName,
            "<p>Thiết bị <strong>" + equipmentName + "</strong> bạn đang mượn đã <span style='color:#ff4d4f;font-weight:bold'>QUÁ HẠN TRẢ</span>.</p>" +
            "<p>📅 Hạn trả đã qua: <strong style='color:#ff4d4f'>" + returnDate + "</strong></p>" +
            "<p>Vui lòng trả thiết bị ngay lập tức. Liên hệ quản trị viên nếu cần thêm thông tin.</p>"
        );
        sendHtmlEmail(toEmail, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildEmailTemplate(String heading, String name, String bodyContent) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family:Arial,sans-serif;background:#f5f5f5;padding:20px'>" +
               "<div style='max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)'>" +
               "<div style='background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center'>" +
               "<h1 style='color:#fff;margin:0;font-size:24px'>🎓 Hệ Thống Mượn Đồ CLB</h1></div>" +
               "<div style='padding:30px'>" +
               "<h2 style='color:#333'>" + heading + "</h2>" +
               "<p style='color:#555'>Xin chào <strong>" + name + "</strong>,</p>" +
               bodyContent +
               "</div>" +
               "<div style='background:#f0f0f0;padding:15px;text-align:center;color:#999;font-size:12px'>" +
               "© 2024 Hệ Thống Quản Lý Mượn Đồ Câu Lạc Bộ Sinh Viên</div></div></body></html>";
    }
}
