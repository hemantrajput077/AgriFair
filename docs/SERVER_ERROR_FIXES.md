# Server Error Fixes

## Issues Fixed

### 1. Repository Method Naming Issue
**Problem:** Spring Data JPA couldn't parse `findByEquipment_Owner_Id` method name
**Solution:** Changed to use `@Query` annotation with explicit JPQL query
**File:** `RentalRepository.java`

**Before:**
```java
List<Rental> findByEquipment_Owner_Id(Long ownerId);
```

**After:**
```java
@Query("SELECT r FROM Rental r WHERE r.equipment.owner.id = :ownerId")
List<Rental> findByEquipmentOwnerId(@Param("ownerId") Long ownerId);
```

### 2. Null Pointer Protection in createRental
**Problem:** If username is null/empty and rental.getRenter() is also null, it would throw NullPointerException
**Solution:** Added null check before accessing rental.getRenter().getId()
**File:** `RentalService.java`

**Added:**
```java
if (rental.getRenter() == null || rental.getRenter().getId() == null) {
    throw new IllegalArgumentException("Renter is required. Please ensure you are logged in.");
}
```

### 3. Missing Authentication Checks
**Problem:** Controller methods could throw NullPointerException if Authentication is null
**Solution:** 
- Added `@PreAuthorize("hasRole('ROLE_FARMER')")` annotations
- Added null checks for Authentication object
**File:** `RentalController.java`

**Added to all endpoints:**
- `@PreAuthorize("hasRole('ROLE_FARMER')")` annotation
- Null check: `if (auth == null) { return ResponseEntity.status(HttpStatus.UNAUTHORIZED)... }`

### 4. Missing Import
**Problem:** Missing import for `@PreAuthorize`
**Solution:** Added import statement
**File:** `RentalController.java`

```java
import org.springframework.security.access.prepost.PreAuthorize;
```

## Files Modified

1. `backend/src/main/java/com/agri/marketplace/AgriFair/repository/RentalRepository.java`
   - Changed repository method to use @Query annotation
   - Added necessary imports

2. `backend/src/main/java/com/agri/marketplace/AgriFair/service/RentalService.java`
   - Added null check in createRental method
   - Updated method call to use new repository method name

3. `backend/src/main/java/com/agri/marketplace/AgriFair/controller/RentalController.java`
   - Added @PreAuthorize annotations
   - Added null checks for Authentication
   - Added missing import

## Testing

After these fixes, the server should:
- ✅ Compile without errors
- ✅ Start successfully
- ✅ Handle null authentication gracefully
- ✅ Properly query rentals by equipment owner
- ✅ Require authentication for rental operations

## Notes

- All rental endpoints now require ROLE_FARMER authentication
- The repository query uses JPQL which is more reliable than method name parsing
- Null checks prevent runtime exceptions

