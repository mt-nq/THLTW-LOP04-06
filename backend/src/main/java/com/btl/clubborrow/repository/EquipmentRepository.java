package com.btl.clubborrow.repository;

import com.btl.clubborrow.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByActiveTrue();
    List<Equipment> findByActiveTrueAndNameContainingIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(e.totalQuantity), 0) FROM Equipment e WHERE e.active = true")
    long sumTotalQuantity();
}
