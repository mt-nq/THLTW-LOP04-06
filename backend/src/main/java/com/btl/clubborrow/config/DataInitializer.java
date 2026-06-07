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

        if (!userRepository.existsByEmail("sinhvien@gmail.com")) {
            userRepository.save(User.builder()
                    .name("Nguyễn Văn An")
                    .email("sinhvien@gmail.com")
                    .password(passwordEncoder.encode("Student@123"))
                    .role(Role.STUDENT)
                    .studentId("B21DCCC001")
                    .build());
            log.info("Created default student user: sinhvien@gmail.com / Student@123");
        }

        if (!userRepository.existsByEmail("tran.thi.b@gmail.com")) {
            userRepository.save(User.builder()
                    .name("Trần Thị Bình")
                    .email("tran.thi.b@gmail.com")
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
                    .imageUrl("https://bizweb.dktcdn.net/thumb/grande/100/487/147/products/epson-eb-x51-large.jpg?v=1721624203553")
                    .active(true).build());

            equipmentRepository.save(Equipment.builder()
                    .name("Loa Bluetooth JBL Xtreme 3")
                    .description("Loa không dây công suất lớn, chống nước IP67, thời lượng pin 15 giờ")
                    .totalQuantity(5)
                    .availableQuantity(5)
                    .imageUrl("https://sm.pcmag.com/t/pcmag_uk/review/j/jbl-xtreme/jbl-xtreme-3_rh31.1200.jpg")
                    .active(true).build());

            equipmentRepository.save(Equipment.builder()
                    .name("Micro không dây Shure BLX288")
                    .description("Bộ 2 micro không dây cao cấp, tần số UHF, phù hợp sân khấu")
                    .totalQuantity(4)
                    .availableQuantity(4)
                    .imageUrl("https://ninjasom.vtexassets.com/arquivos/ids/177658-800-auto?v=637753504501770000&width=800&height=auto&aspect=true")
                    .active(true).build());

            equipmentRepository.save(Equipment.builder()
                    .name("Máy ảnh Canon EOS 90D")
                    .description("Máy ảnh DSLR 32.5MP, quay 4K, phù hợp chụp sự kiện")
                    .totalQuantity(2)
                    .availableQuantity(2)
                    .imageUrl("https://giangnamcamera.com/wp-content/uploads/2023/07/Canon-EOS-90D-Kit-18-135mm-USM-1.jpg")
                    .active(true).build());

            equipmentRepository.save(Equipment.builder()
                    .name("Tripod chân máy ảnh Manfrotto")
                    .description("Chân máy ảnh chuyên nghiệp, chiều cao 180cm, tải trọng 6kg")
                    .totalQuantity(6)
                    .availableQuantity(6)
                    .imageUrl("https://zshop.vn/images/companies/1/professional-photo-tripod-befree-live-mvkbfrl-live.jpg?1616231718421")
                    .active(true).build());

            equipmentRepository.save(Equipment.builder()
                    .name("Bàn gấp dã ngoại")
                    .description("Bàn gấp đa năng, kích thước 120x60cm, nhẹ, dễ vận chuyển")
                    .totalQuantity(10)
                    .availableQuantity(10)
                    .imageUrl("https://img.lazcdn.com/g/ff/kf/S16d1f989d5504fda99222a1877b5cd9aY.jpg_720x720q80.jpg")
                    .active(true).build());

            equipmentRepository.save(Equipment.builder()
                    .name("Máy tính xách tay Dell Inspiron")
                    .description("Laptop Intel Core i5, RAM 8GB, SSD 256GB, màn hình 15.6 inch")
                    .totalQuantity(3)
                    .availableQuantity(3)
                    .imageUrl("https://phucanhcdn.com/media/product/35108_laptop_dell_inspiron_3576_70182245_1.jpg")
                    .active(true).build());

            equipmentRepository.save(Equipment.builder()
                    .name("Băng rôn + Standee banner")
                    .description("Bộ standee banner 2m x 1m có thể thay hình nền, phù hợp triển lãm")
                    .totalQuantity(8)
                    .availableQuantity(8)
                    .imageUrl("https://electroimagellc.com/wp-content/uploads/2013/08/Banner_MockUp_web-1024x768.jpg")
                    .active(true).build());

            log.info("Initialized {} equipment items with custom product images", 8);
        } else {
            // Self-healing migration block: Ensure all equipment images are synced with their premium URLs
            equipmentRepository.findAll().forEach(eq -> {
                String lowerName = eq.getName().toLowerCase();
                boolean updated = false;

                if (lowerName.contains("chiếu")) {
                    String target = "https://bizweb.dktcdn.net/thumb/grande/100/487/147/products/epson-eb-x51-large.jpg?v=1721624203553";
                    if (!target.equals(eq.getImageUrl())) {
                        eq.setImageUrl(target);
                        updated = true;
                    }
                } else if (lowerName.contains("loa")) {
                    String target = "https://sm.pcmag.com/t/pcmag_uk/review/j/jbl-xtreme/jbl-xtreme-3_rh31.1200.jpg";
                    if (!target.equals(eq.getImageUrl())) {
                        eq.setImageUrl(target);
                        updated = true;
                    }
                } else if (lowerName.contains("micro")) {
                    String target = "https://ninjasom.vtexassets.com/arquivos/ids/177658-800-auto?v=637753504501770000&width=800&height=auto&aspect=true";
                    if (!target.equals(eq.getImageUrl())) {
                        eq.setImageUrl(target);
                        updated = true;
                    }
                } else if (lowerName.contains("tripod") || lowerName.contains("chân máy")) {
                    String target = "https://zshop.vn/images/companies/1/professional-photo-tripod-befree-live-mvkbfrl-live.jpg?1616231718421";
                    if (!target.equals(eq.getImageUrl())) {
                        eq.setImageUrl(target);
                        updated = true;
                    }
                } else if (lowerName.contains("máy ảnh") || lowerName.contains("canon") || lowerName.contains("eos")) {
                    String target = "https://giangnamcamera.com/wp-content/uploads/2023/07/Canon-EOS-90D-Kit-18-135mm-USM-1.jpg";
                    if (!target.equals(eq.getImageUrl())) {
                        eq.setImageUrl(target);
                        updated = true;
                    }
                } else if (lowerName.contains("bàn")) {
                    String target = "https://img.lazcdn.com/g/ff/kf/S16d1f989d5504fda99222a1877b5cd9aY.jpg_720x720q80.jpg";
                    if (!target.equals(eq.getImageUrl())) {
                        eq.setImageUrl(target);
                        updated = true;
                    }
                } else if (lowerName.contains("máy tính") || lowerName.contains("dell") || lowerName.contains("laptop")) {
                    String target = "https://phucanhcdn.com/media/product/35108_laptop_dell_inspiron_3576_70182245_1.jpg";
                    if (!target.equals(eq.getImageUrl())) {
                        eq.setImageUrl(target);
                        updated = true;
                    }
                } else if (lowerName.contains("băng rôn") || lowerName.contains("standee") || lowerName.contains("banner")) {
                    String target = "https://electroimagellc.com/wp-content/uploads/2013/08/Banner_MockUp_web-1024x768.jpg";
                    if (!target.equals(eq.getImageUrl())) {
                        eq.setImageUrl(target);
                        updated = true;
                    }
                }

                if (updated) {
                    equipmentRepository.save(eq);
                }
            });
            log.info("Successfully synced database equipment images with premium URLs.");
        }
    }
}
