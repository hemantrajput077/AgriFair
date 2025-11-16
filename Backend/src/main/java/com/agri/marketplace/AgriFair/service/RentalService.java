package com.agri.marketplace.AgriFair.service;

import com.agri.marketplace.AgriFair.model.Equipment;
import com.agri.marketplace.AgriFair.model.Farmer;
import com.agri.marketplace.AgriFair.model.Rental;
import com.agri.marketplace.AgriFair.model.RentalStatus;
import com.agri.marketplace.AgriFair.repository.EquipmentRepository;
import com.agri.marketplace.AgriFair.repository.FarmerRepository;
import com.agri.marketplace.AgriFair.repository.RentalRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;

@Service
public class RentalService {

    private static final List<RentalStatus> ACTIVE_STATUSES =
            List.copyOf(EnumSet.of(RentalStatus.PENDING, RentalStatus.APPROVED, RentalStatus.ACTIVE));

    private final RentalRepository rentalRepository;
    private final FarmerRepository farmerRepository;
    private final EquipmentRepository equipmentRepository;

    public RentalService(RentalRepository rentalRepository,
                         FarmerRepository farmerRepository,
                         EquipmentRepository equipmentRepository) {
        this.rentalRepository = rentalRepository;
        this.farmerRepository = farmerRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public List<Rental> getAllRentals() {
        return rentalRepository.findAll();
    }

    public Rental getRentalById(Long id) {
        return rentalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Rental not found: " + id));
    }

    public List<Rental> getRentalsByFarmer(Long farmerId) {
        return rentalRepository.findByRenterId(farmerId);
    }

    public List<Rental> getRentalsByEquipment(Long equipmentId) {
        return rentalRepository.findByEquipmentId(equipmentId);
    }

    @Transactional
    public Rental createRental(Rental rental) {
        LocalDate start = rental.getStartDate();
        LocalDate end = rental.getEndDate();

        if (start == null || end == null || end.isBefore(start)) {
            throw new IllegalArgumentException("Invalid rental period");
        }

        Farmer renter = farmerRepository.findById(rental.getRenter().getId())
                .orElseThrow(() -> new EntityNotFoundException("Renter not found: " + rental.getRenter().getId()));

        Equipment equipment = equipmentRepository.findById(rental.getEquipment().getId())
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found: " + rental.getEquipment().getId()));

        ensureEquipmentAvailableForPeriod(equipment, start, end, null);

        long rentalDays = ChronoUnit.DAYS.between(start, end) + 1;
        if (rentalDays <= 0) {
            throw new IllegalArgumentException("Rental duration must be at least one day");
        }

        double totalCost = rentalDays * equipment.getRate();

        rental.setRenter(renter);
        rental.setEquipment(equipment);
        rental.setStatus(RentalStatus.PENDING);
        rental.setTotalCost(totalCost);

        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental approveRental(Long rentalId) {
        Rental rental = getRentalById(rentalId);
        if (rental.getStatus() != RentalStatus.PENDING) {
            throw new IllegalStateException("Only pending rentals can be approved");
        }

        ensureEquipmentAvailableForPeriod(
                rental.getEquipment(),
                rental.getStartDate(),
                rental.getEndDate(),
                rentalId
        );

        rental.setStatus(RentalStatus.APPROVED);
        rental.getEquipment().setAvailable(Boolean.FALSE);
        equipmentRepository.save(rental.getEquipment());
        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental startRental(Long rentalId) {
        Rental rental = getRentalById(rentalId);
        if (rental.getStatus() != RentalStatus.APPROVED) {
            throw new IllegalStateException("Only approved rentals can be started");
        }
        if (LocalDate.now().isBefore(rental.getStartDate())) {
            throw new IllegalStateException("Rental start date has not arrived yet");
        }

        rental.setStatus(RentalStatus.ACTIVE);
        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental completeRental(Long rentalId) {
        Rental rental = getRentalById(rentalId);
        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new IllegalStateException("Only active rentals can be completed");
        }

        rental.setStatus(RentalStatus.COMPLETED);
        rental.getEquipment().setAvailable(Boolean.TRUE);
        equipmentRepository.save(rental.getEquipment());
        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental cancelRental(Long rentalId) {
        Rental rental = getRentalById(rentalId);
        if (rental.getStatus() == RentalStatus.COMPLETED) {
            throw new IllegalStateException("Completed rentals cannot be cancelled");
        }

        if (rental.getStatus() == RentalStatus.APPROVED || rental.getStatus() == RentalStatus.ACTIVE) {
            rental.getEquipment().setAvailable(Boolean.TRUE);
            equipmentRepository.save(rental.getEquipment());
        }

        rental.setStatus(RentalStatus.CANCELLED);
        return rentalRepository.save(rental);
    }

    private void ensureEquipmentAvailableForPeriod(Equipment equipment, LocalDate start, LocalDate end, Long excludeRentalId) {
        if (Boolean.FALSE.equals(equipment.getAvailable())) {
            throw new IllegalStateException("Equipment is not available for booking");
        }

        List<Rental> overlapping = rentalRepository
                .findByEquipmentIdAndStatusIn(equipment.getId(), ACTIVE_STATUSES);

        boolean conflict = overlapping.stream()
                .filter(existing -> excludeRentalId == null || !existing.getId().equals(excludeRentalId))
                .anyMatch(existing -> overlaps(existing.getStartDate(), existing.getEndDate(), start, end));

        if (conflict) {
            throw new IllegalStateException("Equipment already booked for selected dates");
        }
    }

    private boolean overlaps(LocalDate existingStart, LocalDate existingEnd, LocalDate newStart, LocalDate newEnd) {
        return !existingStart.isAfter(newEnd) && !newStart.isAfter(existingEnd);
    }
}

