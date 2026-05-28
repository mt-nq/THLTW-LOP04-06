package com.btl.clubborrow.service;

import com.btl.clubborrow.dto.request.EquipmentRequest;
import com.btl.clubborrow.dto.response.EquipmentResponse;
import com.btl.clubborrow.entity.Equipment;
import com.btl.clubborrow.exception.ResourceNotFoundException;
import com.btl.clubborrow.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    public List<EquipmentResponse> getAll(String search) {
        List<Equipment> list;
        if (search != null && !search.isBlank()) {
            list = equipmentRepository.findByActiveTrueAndNameContainingIgnoreCase(search);
        } else {
            list = equipmentRepository.findByActiveTrue();
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<EquipmentResponse> getAllForAdmin() {
        return equipmentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public EquipmentResponse getById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thiết bị không tồn tại với id: " + id));
        return toResponse(equipment);
    }

    public EquipmentResponse create(EquipmentRequest request) {
        Equipment equipment = Equipment.builder()
                .name(request.getName())
                .description(request.getDescription())
                .totalQuantity(request.getTotalQuantity())
                .availableQuantity(request.getAvailableQuantity())
                .imageUrl(request.getImageUrl())
                .active(true)
                .build();
        return toResponse(equipmentRepository.save(equipment));
    }

    public EquipmentResponse update(Long id, EquipmentRequest request) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thiết bị không tồn tại với id: " + id));
        equipment.setName(request.getName());
        equipment.setDescription(request.getDescription());
        equipment.setTotalQuantity(request.getTotalQuantity());
        equipment.setAvailableQuantity(request.getAvailableQuantity());
        equipment.setImageUrl(request.getImageUrl());
        return toResponse(equipmentRepository.save(equipment));
    }

    public void delete(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thiết bị không tồn tại với id: " + id));
        // Soft delete
        equipment.setActive(false);
        equipmentRepository.save(equipment);
    }

    public EquipmentResponse toResponse(Equipment e) {
        return EquipmentResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .description(e.getDescription())
                .totalQuantity(e.getTotalQuantity())
                .availableQuantity(e.getAvailableQuantity())
                .imageUrl(e.getImageUrl())
                .active(e.getActive())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
