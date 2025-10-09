# AgriFair Frontend Migration

This document describes the migration from the old frontend to the new frontend while maintaining backend integration.

## Migration Overview

The frontend has been successfully migrated from `Frontend/frontend_dev/farmer/agricultur-project` to `NewFrontend/harat-farm-link-main` with full backend integration maintained.

## Key Changes Made

### 1. API Integration
- Created `src/services/api.ts` with complete API service layer
- Integrated with existing backend endpoints:
  - `POST /api/auth/login` - User authentication
  - `POST /api/auth/register` - User registration
- Added proper error handling and token management

### 2. Updated Components

#### Login Page (`src/pages/Login.tsx`)
- Changed from email-based to username-based login (matching backend)
- Added API integration with loading states
- Added role-based redirection after login
- Enhanced error handling with toast notifications

#### Signup Page (`src/pages/Signup.tsx`)
- Updated form fields to match backend requirements (username, email, password, role)
- Added API integration with proper validation
- Enhanced user experience with loading states and success/error feedback

#### Navigation (`src/components/Navbar.tsx`)
- Added authentication state management
- Dynamic navigation based on user role
- Logout functionality with proper token cleanup

### 3. New Dashboard Pages

#### Farmer Dashboard (`src/pages/FarmerDashboard.tsx`)
- Complete farmer interface for crop management
- Add new crops functionality
- View existing crops
- Order management (placeholder)
- Statistics overview

#### Customer Dashboard (`src/pages/CustomerDashboard.tsx`)
- Customer shopping interface
- Browse available crops
- Shopping cart functionality
- Order history (placeholder)
- Search and filter capabilities

## Backend Integration Details

### API Endpoints Used
- **Authentication**: `/api/auth/login` and `/api/auth/register`
- **Base URL**: `http://localhost:8080/api` (configurable in `src/services/api.ts`)

### Data Flow
1. User registration → Backend validation → Success/Error response
2. User login → JWT token generation → Token storage → Role-based redirection
3. Protected routes check authentication status
4. Logout clears stored tokens

### Role-Based Access
- **ROLE_FARMER**: Redirected to `/farmer-dashboard`
- **ROLE_CUSTOMER**: Redirected to `/customer-dashboard`

## How to Run

### Prerequisites
1. Backend server running on `http://localhost:8080`
2. MySQL database configured and running
3. Node.js and npm installed

### Steps
1. Navigate to the new frontend directory:
   ```bash
   cd NewFrontend/harat-farm-link-main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Testing the Integration

### 1. Test User Registration
1. Go to `/signup`
2. Fill in the form with:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
   - Role: `farmer` or `customer`
3. Submit the form
4. Should see success message and redirect to login

### 2. Test User Login
1. Go to `/login`
2. Use the credentials from registration
3. Should be redirected to appropriate dashboard based on role

### 3. Test Dashboard Functionality
- **Farmer Dashboard**: Add crops, view statistics
- **Customer Dashboard**: Browse crops, add to cart

## Configuration

### API Base URL
To change the backend URL, update the `API_BASE_URL` constant in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://your-backend-url:port/api';
```

### CORS Configuration
Ensure your backend has CORS configured to allow requests from the frontend. The backend should include:

```java
@CrossOrigin(origins = "http://localhost:5173")
```

## File Structure

```
NewFrontend/harat-farm-link-main/src/
├── services/
│   └── api.ts                 # API service layer
├── pages/
│   ├── Login.tsx              # Updated login page
│   ├── Signup.tsx             # Updated signup page
│   ├── FarmerDashboard.tsx    # New farmer dashboard
│   ├── CustomerDashboard.tsx  # New customer dashboard
│   └── ...                    # Other existing pages
├── components/
│   └── Navbar.tsx             # Updated with auth state
└── App.tsx                     # Updated with new routes
```

## Migration Benefits

1. **Modern UI**: Uses shadcn/ui components with Tailwind CSS
2. **Better UX**: Loading states, error handling, success feedback
3. **Type Safety**: Full TypeScript implementation
4. **Scalable Architecture**: Clean service layer separation
5. **Role-Based Access**: Proper user role management
6. **Responsive Design**: Mobile-friendly interface

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend URL
2. **API Connection**: Verify backend is running on correct port
3. **Database**: Ensure MySQL is running and database is created
4. **Token Issues**: Clear localStorage if authentication problems persist

### Debug Steps
1. Check browser console for errors
2. Verify network requests in DevTools
3. Check backend logs for API errors
4. Ensure all dependencies are installed

## Next Steps

1. **Crop Management API**: Integrate crop CRUD operations
2. **Order Management**: Implement order processing
3. **Real-time Updates**: Add WebSocket for live updates
4. **Payment Integration**: Add payment gateway
5. **Image Upload**: Implement crop image uploads
6. **Search & Filtering**: Enhance search functionality
7. **Notifications**: Add real-time notifications

The migration is complete and the new frontend is fully integrated with the existing backend while providing a much better user experience and modern development practices.
