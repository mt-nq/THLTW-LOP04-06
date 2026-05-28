package com.btl.clubborrow.config;

import com.btl.clubborrow.entity.Equipment;
import com.btl.clubborrow.entity.Role;
import com.btl.clubborrow.entity.User;
import com.btl.clubborrow.repository.EquipmentRepository;
import com.btl.clubborrow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initUsers();
        initEquipment();
    }

    private void initUsers() {
        if (!userRepository.existsByEmail("admin@club.edu.vn")) {
            userRepository.save(User.builder()
                .name("Quản Trị Viên")
                .email("admin@club.edu.vn")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .build());
            log.info("Created default admin user: admin@club.edu.vn / Admin@123");
        }

        if (!userRepository.existsByEmail("sinhvien@student.edu.vn")) {
            userRepository.save(User.builder()
                .name("Nguyễn Văn An")
                .email("sinhvien@student.edu.vn")
                .password(passwordEncoder.encode("Student@123"))
                .role(Role.STUDENT)
                .studentId("B21DCCC001")
                .build());
            log.info("Created default student user: sinhvien@student.edu.vn / Student@123");
        }

        if (!userRepository.existsByEmail("tran.thi.b@student.edu.vn")) {
            userRepository.save(User.builder()
                .name("Trần Thị Bình")
                .email("tran.thi.b@student.edu.vn")
                .password(passwordEncoder.encode("Student@123"))
                .role(Role.STUDENT)
                .studentId("B21DCCC002")
                .build());
        }
    }

    private void initEquipment() {
        if (equipmentRepository.count() == 0) {
            equipmentRepository.save(Equipment.builder()
                .name("Máy chiếu Epson EB-X51")
                .description("Máy chiếu độ phân giải XGA, độ sáng 3800 lumen, phù hợp hội trường")
                .totalQuantity(3)
                .availableQuantity(3)
                .imageUrl("https://via.placeholder.com/400x300?text=May+Chieu")
                .active(true).build());

            equipmentRepository.save(Equipment.builder()
                .name("Loa Bluetooth JBL Xtreme 3")
                .description("Loa không dây công suất lớn, chống nước IP67, thời lượng pin 15 giờ")
                .totalQuantity(5)
                .availableQuantity(5)
                .imageUrl("https://via.placeholder.com/400x300?text=Loa+Bluetooth")
                .active(true).build());

            equipmentRepository.save(Equipment.builder()
                .name("Micro không dây Shure BLX288")
                .description("Bộ 2 micro không dây cao cấp, tần số UHF, phù hợp sân khấu")
                .totalQuantity(4)
                .availableQuantity(4)
                .imageUrl("https://via.placeholder.com/400x300?text=Micro")
                .active(true).build());

            equipmentRepository.save(Equipment.builder()
                .name("Máy ảnh Canon EOS 90D")
                .description("Máy ảnh DSLR 32.5MP, quay 4K, phù hợp chụp sự kiện")
                .totalQuantity(2)
                .availableQuantity(2)
                .imageUrl("https://via.placeholder.com/400x300?text=May+Anh")
                .active(true).build());

            equipmentRepository.save(Equipment.builder()
                .name("Tripod chân máy ảnh Manfrotto")
                .description("Chân máy ảnh chuyên nghiệp, chiều cao 180cm, tải trọng 6kg")
                .totalQuantity(6)
                .availableQuantity(6)
                .imageUrl("https://via.placeholder.com/400x300?text=Tripod")
                .active(true).build());

            equipmentRepository.save(Equipment.builder()
                .name("Bàn gấp dã ngoại")
                .description("Bàn gấp đa năng, kích thước 120x60cm, nhẹ, dễ vận chuyển")
                .totalQuantity(10)
                .availableQuantity(10)
                .imageUrl("https://via.placeholder.com/400x300?text=Ban+Gap")
                .active(true).build());

            equipmentRepository.save(Equipment.builder()
                .name("Máy tính xách tay Dell Inspiron")
                .description("Laptop Intel Core i5, RAM 8GB, SSD 256GB, màn hình 15.6 inch")
                .totalQuantity(3)
                .availableQuantity(3)
                .imageUrl("https://via.placeholder.com/400x300?text=Laptop")
                .active(true).build());

            equipmentRepository.save(Equipment.builder()
                .name("Băng rôn + Standee banner")
                .description("Bộ standee banner 2m x 1m có thể thay hình nền, phù hợp triển lãm")
                .totalQuantity(8)
                .availableQuantity(8)
                .imageUrl("https://via.placeholder.com/400x300?text=Banner")
                .active(true).build());

            log.info("Initialized {} equipment items", 8);
        }
    }
}
