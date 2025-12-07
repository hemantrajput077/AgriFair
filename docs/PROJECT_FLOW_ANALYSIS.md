# AgriFair Project Flow Analysis & Logical Flaws

## Current Project Architecture

### User Model Structure
- **User** (Authentication): `id`, `username`, `email`, `password`, `role` (ROLE_FARMER/ROLE_CUSTOMER)
- **Farmer** (Profile): `id`, `firstName`, `secondName`, `email`, `phoneNo`, `county`, `localArea`
- **Issue**: User and Farmer are **separate entities** with no direct relationship!

### Current Flow

#### 1. Authentication Flow
- User registers/logs in → Gets JWT token with username and role
- Token stored in localStorage
- Frontend uses token for API calls
- **Problem**: No way to get Farmer ID from User username!

#### 2. Equipment Module Flow
**Current (FLAWED):**
1. Farmer logs in
2. Goes to Create Equipment page
3. **Manually selects owner from dropdown** (all farmers shown)
4. Creates equipment with selected owner
5. Equipment saved with owner

**Issues:**
- ❌ Owner selection dropdown shows ALL farmers (security issue)
- ❌ Logged-in farmer can create equipment for other farmers
- ❌ No automatic owner assignment
- ❌ No validation that logged-in user matches selected owner

#### 3. Rental Module Flow
**Current (FLAWED):**
1. User views equipment inventory
2. Clicks "Request Rental"
3. **Manually selects renter from dropdown** (all farmers shown)
4. Selects equipment and dates
5. Creates rental request with status PENDING
6. Owner can approve → status APPROVED
7. Renter can start → status ACTIVE
8. Renter can complete → status COMPLETED

**Issues:**
- ❌ Renter selection dropdown shows ALL farmers
- ❌ Logged-in user can request rental for other farmers
- ❌ No automatic renter assignment
- ❌ No payment flow
- ❌ My Rentals shows all rentals, not personalized
- ❌ No separation between "Rentals I Requested" vs "Rentals Requested for My Equipment"

#### 4. Crop Module Flow
**Current (WORKING):**
1. Farmer logs in
2. Creates crop → automatically linked to User (via username from JWT)
3. Crop has `farmer` field pointing to User
4. **Note**: Crop uses User, but Equipment uses Farmer - **INCONSISTENCY!**

## Critical Logical Flaws Identified

### 1. ✅ Equipment Owner Assignment (CONFIRMED FLAW)
**Your Observation:** "If farmer is logged in and add equipment, owner should be the logged-in farmer by default"

**Current Code:**
```typescript
// frontend/src/pages/CreateEquipment.tsx
<Select value={equipmentData.ownerId} onValueChange={...}>
  {farmers.map((farmer) => (
    <SelectItem value={farmer.id.toString()}>
      {farmer.firstName} {farmer.secondName}
    </SelectItem>
  ))}
</Select>
```

**Problems:**
- Shows dropdown to select ANY farmer
- No automatic assignment from logged-in user
- Security vulnerability: Can create equipment for others

**Correct Flow:**
- Get logged-in user's username from JWT
- Find Farmer by email (or create User-Farmer link)
- Auto-set owner to logged-in farmer
- Remove owner selection dropdown

### 2. ✅ Rental Renter Assignment (CONFIRMED FLAW)
**Your Observation:** "When I request rental, I should be the renter, not select from dropdown"

**Current Code:**
```typescript
// frontend/src/pages/CreateRental.tsx
<Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
  {farmers.map((farmer) => (
    <SelectItem value={farmer.id.toString()}>
      {farmer.firstName} {farmer.secondName}
    </SelectItem>
  ))}
</Select>
```

**Problems:**
- Shows dropdown to select ANY farmer as renter
- No automatic assignment from logged-in user
- Security vulnerability: Can request rentals for others

**Correct Flow:**
- Get logged-in user's username from JWT
- Find Farmer by email/username
- Auto-set renter to logged-in farmer
- Remove renter selection dropdown

### 3. ✅ My Rentals Personalization (CONFIRMED FLAW)
**Your Observation:** "My Rentals should show rental requests farmer got, he can approve, then renter can confirm and pay"

**Current Code:**
```typescript
// frontend/src/pages/MyRentals.tsx
const { data: rentals = [] } = useQuery({
  queryKey: ["rentals", selectedFarmerId],
  queryFn: () => {
    if (selectedFarmerId) {
      return rentalApi.getRentalsByFarmer(parseInt(selectedFarmerId));
    }
    return rentalApi.getRentals(); // Returns ALL rentals!
  },
});
```

**Problems:**
- Shows ALL rentals if no farmer selected
- No separation between:
  - Rentals I requested (as renter)
  - Rentals requested for my equipment (as owner)
- No payment flow
- Anyone can approve any rental (no ownership check)

**Correct Flow:**
1. **For Equipment Owners:**
   - Show rentals where `equipment.owner.id == loggedInFarmer.id`
   - Filter by status: PENDING (awaiting approval)
   - Owner can: Approve, Reject
   - After approval: Wait for payment confirmation

2. **For Renters:**
   - Show rentals where `renter.id == loggedInFarmer.id`
   - Filter by status: APPROVED (awaiting payment)
   - Renter can: Confirm & Pay → Start Rental
   - After payment: Status → ACTIVE

3. **Payment Flow:**
   - After owner approves → Status: APPROVED
   - Renter sees payment button
   - After payment → Status: PAID (or directly ACTIVE)
   - Owner can start rental → Status: ACTIVE

### 4. Authorization Issues
**Problems:**
- No check that equipment owner matches logged-in user when creating equipment
- No check that rental approver is the equipment owner
- No check that rental starter is the renter
- Backend doesn't validate ownership

### 5. User-Farmer Relationship Missing
**Critical Issue:**
- User table: Authentication (username, email, password, role)
- Farmer table: Profile (firstName, secondName, email, phoneNo, county, localArea)
- **NO LINK between User and Farmer!**

**Solutions:**
1. Add `userId` to Farmer table (OneToOne relationship)
2. Or add `farmerId` to User table
3. Or use email as link (but email might not be unique across both)

### 6. Inconsistent Entity Usage
- **Crop**: Uses `User` as farmer (via username from JWT)
- **Equipment**: Uses `Farmer` as owner
- **Rental**: Uses `Farmer` as renter and equipment owner
- **Problem**: No consistent way to link User → Farmer

## Correct Logical Flow

### Equipment Creation Flow
```
1. User logs in (ROLE_FARMER)
2. JWT token contains username
3. Backend extracts username from Authentication
4. Find Farmer by email (matching User.email)
5. Auto-assign equipment.owner = foundFarmer
6. Save equipment
7. Frontend: Remove owner dropdown, show "Owner: You" as read-only
```

### Rental Request Flow
```
1. User (ROLE_FARMER) views equipment inventory
2. Clicks "Request Rental" on equipment
3. Frontend: Auto-set renter = loggedInFarmer (from JWT)
4. User selects dates
5. Submit → Backend creates rental with:
   - renter = loggedInFarmer (from JWT)
   - equipment = selected equipment
   - status = PENDING
6. Equipment owner receives notification
```

### Rental Approval Flow
```
1. Equipment Owner logs in
2. Views "My Rentals" → Shows rentals for their equipment
3. Sees PENDING rentals
4. Owner clicks "Approve"
5. Backend validates: rental.equipment.owner.id == loggedInFarmer.id
6. Status → APPROVED
7. Equipment.available → false
8. Renter receives notification
```

### Payment & Start Flow
```
1. Renter logs in
2. Views "My Rentals" → Shows rentals they requested
3. Sees APPROVED rentals
4. Clicks "Confirm & Pay"
5. Payment processed (integrate payment gateway)
6. Status → PAID (or ACTIVE)
7. Renter clicks "Start Rental"
8. Backend validates: rental.renter.id == loggedInFarmer.id
9. Status → ACTIVE
10. Rental period begins
```

### Rental Completion Flow
```
1. Rental period ends (or renter completes early)
2. Renter clicks "Complete Rental"
3. Backend validates: rental.renter.id == loggedInFarmer.id
4. Status → COMPLETED
5. Equipment.available → true
6. Owner receives payment
```

## Required Fixes

### Backend Fixes

1. **Link User to Farmer**
   - Add relationship: `Farmer.userId` → `User.id`
   - Or: `User.farmerId` → `Farmer.id`
   - Create service method: `getFarmerByUsername(String username)`

2. **Equipment Controller**
   - Extract username from `Authentication auth`
   - Find Farmer by username/email
   - Auto-set `equipment.owner = foundFarmer`
   - Remove owner from request body

3. **Rental Controller**
   - Extract username from `Authentication auth` (for create)
   - Find Farmer by username
   - Auto-set `rental.renter = foundFarmer`
   - Add ownership validation for approve/start/complete

4. **Rental Service - Authorization**
   ```java
   public Rental approveRental(Long rentalId, Authentication auth) {
       Rental rental = getRentalById(rentalId);
       Farmer owner = getFarmerByUsername(auth.getName());
       
       // Validate ownership
       if (!rental.getEquipment().getOwner().getId().equals(owner.getId())) {
           throw new IllegalStateException("Only equipment owner can approve");
       }
       
       // ... rest of approval logic
   }
   ```

5. **New Endpoints**
   - `GET /api/v1/rentals/my-requests` - Rentals I requested (as renter)
   - `GET /api/v1/rentals/my-equipment` - Rentals for my equipment (as owner)

### Frontend Fixes

1. **CreateEquipment.tsx**
   - Remove owner selection dropdown
   - Auto-set owner from logged-in user
   - Show "Owner: [Your Name]" as read-only

2. **CreateRental.tsx**
   - Remove renter selection dropdown
   - Auto-set renter from logged-in user
   - Show "Renter: [Your Name]" as read-only

3. **MyRentals.tsx**
   - Split into two tabs:
     - "Rentals I Requested" (as renter)
     - "Rentals for My Equipment" (as owner)
   - Add payment button for APPROVED rentals
   - Show appropriate actions based on role

4. **JWT Decoding**
   - Decode JWT to get username
   - Store username in context/state
   - Use for auto-filling owner/renter

5. **Payment Integration**
   - Add payment button for APPROVED rentals
   - Integrate payment gateway (Razorpay/Stripe)
   - Update rental status after payment

## Additional Flaws Found

### 7. Equipment Availability Logic
- Equipment set to unavailable on approval
- Should check for overlapping rentals
- Current: `ensureEquipmentAvailableForPeriod()` exists but may have issues

### 8. Rental Status Transitions
- Missing status: `PAID` (between APPROVED and ACTIVE)
- No validation for status transitions
- Anyone can call any status change endpoint

### 9. No Notifications
- No email/SMS notifications for:
  - New rental request
  - Rental approved
  - Payment received
  - Rental started/completed

### 10. No Reviews/Ratings
- No feedback system after rental completion
- No way to rate equipment or renter

### 11. Equipment Search/Filter
- No search by type, location, price range
- No filtering capabilities

### 12. Crop Module Inconsistency
- Crop uses User, Equipment uses Farmer
- Should standardize: Either both use User or both use Farmer
- Recommendation: Use Farmer for both (more detailed profile)

## Implementation Priority

### High Priority (Critical Flaws)
1. ✅ Fix Equipment Owner Assignment
2. ✅ Fix Rental Renter Assignment  
3. ✅ Fix My Rentals Personalization
4. Link User to Farmer
5. Add Authorization Checks

### Medium Priority
6. Add Payment Flow
7. Split My Rentals into Owner/Renter views
8. Add Status Validation

### Low Priority
9. Add Notifications
10. Add Reviews/Ratings
11. Improve Search/Filter

## Summary

Your identified flaws are **100% correct**:
1. ✅ Equipment owner should default to logged-in farmer
2. ✅ Rental renter should default to logged-in farmer
3. ✅ My Rentals should be personalized with proper approval/payment flow

The main root cause is: **No link between User (authentication) and Farmer (profile)**, causing the system to require manual selection instead of automatic assignment.

