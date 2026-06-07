package com.btl.clubborrow.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @jakarta.validation.constraints.Pattern(regexp = "^[A-Za-z0-9+_.-]+@gmail\\.com$", message = "Email bắt buộc phải có đuôi @gmail.com")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    private String password;

    @NotBlank(message = "Mã sinh viên không được để trống")
    private String studentId;
}
