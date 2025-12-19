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
            List.copyOf(EnumSet.of(RentalStatus.PENDING, RentalStatus.APPROVED, RentalStatus.PAID, RentalStatus.ACTIVE));

    private final RentalRepository rentalRepository;
    private final FarmerRepository farmerRepository;
    private final FarmerService farmerService;
    private final EquipmentRepository equipmentRepository;

    public RentalService(RentalRepository rentalRepository,
                         FarmerRepository farmerRepository,
                         FarmerService farmerService,
                         EquipmentRepository equipmentRepository) {
        this.rentalRepository = rentalRepository;
        this.farmerRepository = farmerRepository;
        this.farmerService = farmerService;
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

    /**
     * Get rentals where the logged-in farmer is the renter
     */
    public List<Rental> getRentalsByRenter(String username) {
        Farmer renter = farmerService.getFarmerByUsername(username);
        return rentalRepository.findByRenterId(renter.getId());
    }

    /**
     * Get rentals for equipment owned by the logged-in farmer
     */
    public List<Rental> getRentalsForMyEquipment(String username) {
        Farmer owner = farmerService.getFarmerByUsername(username);
        return rentalRepository.findByEquipmentOwnerId(owner.getId());
    }

    @Transactional
    public Rental createRental(Rental rental, String username) {
        LocalDate start = rental.getStartDate();
        LocalDate end = rental.getEndDate();

        if (start == null || end == null || end.isBefore(start)) {
            throw new IllegalArgumentException("Invalid rental period");
        }

        // Auto-assign renter from logged-in user
        Farmer renter;
        if (username != null && !username.isEmpty()) {
            renter = farmerService.getFarmerByUsername(username);
        } else {
            // Fallback: use renter from rental if provided
            if (rental.getRenter() == null || rental.getRenter().getId() == null) {
                throw new IllegalArgumentException("Renter is required. Please ensure you are logged in.");
            }
            renter = farmerRepository.findById(rental.getRenter().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Renter not found: " + rental.getRenter().getId()));
        }

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
    public Rental approveRental(Long rentalId, String username) {
        Rental rental = getRentalById(rentalId);
        
        // Authorization: Only equipment owner can approve
        Farmer owner = farmerService.getFarmerByUsername(username);
        if (!rental.getEquipment().getOwner().getId().equals(owner.getId())) {
            throw new IllegalStateException("Only equipment owner can approve rental requests");
        }
        
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
    public Rental confirmPayment(Long rentalId, String username) {
        Rental rental = getRentalById(rentalId);
        
        // Authorization: Only renter can confirm payment
        Farmer renter = farmerService.getFarmerByUsername(username);
        if (!rental.getRenter().getId().equals(renter.getId())) {
            throw new IllegalStateException("Only renter can confirm payment");
        }
        
        if (rental.getStatus() != RentalStatus.APPROVED) {
            throw new IllegalStateException("Only approved rentals can have payment confirmed");
        }

        rental.setStatus(RentalStatus.PAID);
        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental startRental(Long rentalId, String username) {
        Rental rental = getRentalById(rentalId);
        
        // Authorization: Only renter can start rental
        Farmer renter = farmerService.getFarmerByUsername(username);
        if (!rental.getRenter().getId().equals(renter.getId())) {
            throw new IllegalStateException("Only renter can start rental");
        }
        
        if (rental.getStatus() != RentalStatus.PAID && rental.getStatus() != RentalStatus.APPROVED) {
            throw new IllegalStateException("Only paid or approved rentals can be started");
        }
        if (LocalDate.now().isBefore(rental.getStartDate())) {
            throw new IllegalStateException("Rental start date has not arrived yet");
        }

        rental.setStatus(RentalStatus.ACTIVE);
        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental completeRental(Long rentalId, String username) {
        Rental rental = getRentalById(rentalId);
        
        // Authorization: Only renter can complete rental
        Farmer renter = farmerService.getFarmerByUsername(username);
        if (!rental.getRenter().getId().equals(renter.getId())) {
            throw new IllegalStateException("Only renter can complete rental");
        }
        
        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new IllegalStateException("Only active rentals can be completed");
        }

        rental.setStatus(RentalStatus.COMPLETED);
        rental.getEquipment().setAvailable(Boolean.TRUE);
        equipmentRepository.save(rental.getEquipment());
        return rentalRepository.save(rental);
    }

    @Transactional
    public Rental cancelRental(Long rentalId, String username) {
        Rental rental = getRentalById(rentalId);
        
        // Authorization: Either renter or equipment owner can cancel
        Farmer farmer = farmerService.getFarmerByUsername(username);
        boolean isRenter = rental.getRenter().getId().equals(farmer.getId());
        boolean isOwner = rental.getEquipment().getOwner().getId().equals(farmer.getId());
        
        if (!isRenter && !isOwner) {
            throw new IllegalStateException("Only renter or equipment owner can cancel rental");
        }
        
        if (rental.getStatus() == RentalStatus.COMPLETED) {
            throw new IllegalStateException("Completed rentals cannot be cancelled");
        }

        if (rental.getStatus() == RentalStatus.APPROVED || rental.getStatus() == RentalStatus.PAID || rental.getStatus() == RentalStatus.ACTIVE) {
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

