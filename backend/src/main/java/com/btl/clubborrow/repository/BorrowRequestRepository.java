package com.btl.clubborrow.repository;

import com.btl.clubborrow.entity.BorrowRequest;
import com.btl.clubborrow.entity.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    List<BorrowRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<BorrowRequest> findAllByOrderByCreatedAtDesc();

    List<BorrowRequest> findByStatus(BorrowStatus status);

    // Yêu cầu đã được duyệt, sắp đến hạn trả (ngày mai)
    List<BorrowRequest> findByStatusAndReturnDate(BorrowStatus status, LocalDate returnDate);

    // Yêu cầu quá hạn (đã duyệt nhưng returnDate < hôm nay và chưa trả)
    List<BorrowRequest> findByStatusAndReturnDateBefore(BorrowStatus status, LocalDate date);

    // Thống kê thiết bị mượn nhiều trong tháng
    @Query("SELECT b.equipment.id, b.equipment.name, SUM(b.quantity) as borrowCount " +
           "FROM BorrowRequest b " +
           "WHERE MONTH(b.createdAt) = :month AND YEAR(b.createdAt) = :year " +
           "AND b.status IN ('APPROVED', 'RETURNED', 'OVERDUE') " +
           "GROUP BY b.equipment.id, b.equipment.name " +
           "ORDER BY borrowCount DESC")
    List<Object[]> findMonthlyStatistics(@Param("month") int month, @Param("year") int year);

    // Đếm tổng đang mượn (APPROVED)
    long countByStatus(BorrowStatus status);

    // Tính tổng số lượng thiết bị theo trạng thái
    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM BorrowRequest b WHERE b.status = :status")
    long sumQuantityByStatus(@Param("status") BorrowStatus status);

    // Tính tổng số lượng thiết bị đang chờ duyệt cho một thiết bị cụ thể
    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM BorrowRequest b WHERE b.equipment.id = :equipmentId AND b.status = 'PENDING'")
    int sumPendingQuantityByEquipmentId(@Param("equipmentId") Long equipmentId);

    // Tính tổng số lượng thiết bị đang chờ duyệt gom nhóm theo ID thiết bị
    @Query("SELECT b.equipment.id, SUM(b.quantity) FROM BorrowRequest b WHERE b.status = 'PENDING' GROUP BY b.equipment.id")
    List<Object[]> sumPendingQuantitiesGroupedByEquipmentId();
}
