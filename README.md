# AgriFair - Agricultural Marketplace Platform

AgriFair is a comprehensive agricultural marketplace platform that connects farmers with customers, enabling crop sales and equipment rental services. The platform provides separate dashboards for farmers and customers, along with a robust equipment rental system.

## 🎯 Project Overview

AgriFair is a full-stack web application designed to:
- **Enable farmers** to list and sell their crops with images
- **Allow customers** to browse and purchase agricultural products
- **Facilitate equipment rental** between farmers
- **Manage rental requests** with status tracking (Pending, Approved, Active, Completed, Cancelled)

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Library**: shadcn/ui (Radix UI components)
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: TanStack Query (React Query) 5.83.0
- **Routing**: React Router DOM 6.30.1
- **Form Handling**: React Hook Form 7.61.1 with Zod validation
- **HTTP Client**: Fetch API (native)

#### Backend
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 17
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA with Hibernate
- **Security**: Spring Security with JWT authentication
- **Build Tool**: Maven
- **File Storage**: Local file system (`uploads/` directory)

### Project Structure

```
agrifair/
├── backend/                          # Spring Boot Backend
│   ├── src/main/java/com/agri/marketplace/AgriFair/
│   │   ├── controller/               # REST API Controllers
│   │   ├── model/                    # JPA Entities
│   │   ├── repository/               # JPA Repositories
│   │   ├── service/                  # Business logic layer
│   │   ├── security/                 # Security configuration
│   │   ├── config/                   # Configuration classes
│   │   └── dto/                      # Data Transfer Objects
│   ├── src/main/resources/
│   │   └── application.properties     # Application configuration
│   ├── uploads/                      # User uploaded images
│   ├── pom.xml                       # Maven dependencies
│   └── mvnw                          # Maven wrapper
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── pages/                    # Page components
│   │   ├── components/               # Reusable components
│   │   ├── services/                 # API service layer
│   │   ├── hooks/                    # Custom React hooks
│   │   └── lib/                      # Utility functions
│   ├── public/                       # Static assets
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.ts                # Vite configuration
│
└── docs/                             # Documentation
    ├── setup.md                      # Setup instructions
    ├── api.md                        # API documentation
    └── guides/                       # Additional guides
```
│   └── vite.config.ts
│
└── README.md                        # This file
```

## 🚀 Getting Started

### Prerequisites

- **Java**: JDK 17 or higher
- **Node.js**: v14 or higher (v18+ recommended)
- **MySQL**: 8.0 or higher
- **Maven**: 3.6+ (or use Maven wrapper)
- **npm** or **yarn** or **bun**

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE agrifair;
```

2. Update database credentials in `Backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/agrifair?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build the project (optional, Maven will build on run):
```bash
./mvnw clean install
# On Windows: mvnw.cmd clean install
```

3. Run the Spring Boot application:
```bash
./mvnw spring-boot:run
# On Windows: mvnw.cmd spring-boot:run
```

The backend will start on `http://localhost:8080`

**Note**: The `uploads/` directory will be created automatically for storing uploaded images.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The frontend will start on `http://localhost:5173` (or the next available port)

## 📋 Features

### Authentication & Authorization
- User registration with role selection (FARMER/CUSTOMER)
- JWT-based authentication
- Role-based access control
- Secure password storage

### Farmer Features
- **Crop Management**:
  - Add new crops with images
  - View all listed crops
  - Upload crop photos (optional)
  - Set price, quantity, and organic status
  
- **Equipment Management**:
  - Create equipment listings
  - Upload equipment images
  - Set rental rates
  - Mark availability status

- **Rental Management**:
  - Approve rental requests
  - Start active rentals
  - Complete rentals
  - Cancel rentals

### Customer Features
- **Shopping**:
  - Browse all available crops
  - View crop details and images
  - Search and filter crops
  - Shopping cart functionality (UI ready)

- **Equipment Rental**:
  - Browse available equipment
  - Create rental requests
  - View rental history
  - Manage rental status

### Equipment Rental System
- **Rental Status Flow**:
  1. **PENDING** - Initial request created
  2. **APPROVED** - Owner approved the request
  3. **ACTIVE** - Rental period started
  4. **COMPLETED** - Rental period ended
  5. **CANCELLED** - Rental cancelled

- **Features**:
  - Automatic cost calculation based on rental period
  - Date validation (start date must be in future, end date after start date)
  - Availability checking
  - Equipment owner approval workflow
  - Optional notes field for special requests

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Crops
- `POST /api/crops` (multipart/form-data) - Create crop (FARMER only)
- `GET /api/crops` - Get all crops (public)
- `GET /api/crops/my` - Get farmer's crops (FARMER only)

### Equipment
- `GET /api/v1/equipments` - Get all equipment
- `GET /api/v1/equipments/{id}` - Get equipment by ID
- `GET /api/v1/equipments/available` - Get available equipment
- `GET /api/v1/equipments/owner/{ownerId}` - Get equipment by owner
- `POST /api/v1/equipments` (multipart/form-data) - Create equipment (FARMER only)

### Rentals
- `GET /api/v1/rentals` - Get all rentals
- `GET /api/v1/rentals/{id}` - Get rental by ID
- `POST /api/v1/rentals` - Create rental request
- `PUT /api/v1/rentals/{id}/approve` - Approve rental (owner only)
- `PUT /api/v1/rentals/{id}/start` - Start rental
- `PUT /api/v1/rentals/{id}/complete` - Complete rental
- `PUT /api/v1/rentals/{id}/cancel` - Cancel rental

### Farmers
- `GET /api/v1/farmers` - Get all farmers
- `GET /api/v1/farmers/{id}` - Get farmer by ID
- `POST /api/v1/farmers` - Create farmer profile

## 🔐 Security

- **JWT Authentication**: All protected endpoints require a valid JWT token
- **Role-Based Access**: Endpoints are protected with `@PreAuthorize` annotations
- **CORS Configuration**: Configured for frontend access
- **Password Encryption**: Spring Security BCrypt password encoding
- **File Upload Security**: File size limits (10MB max) and type validation

## 📁 File Upload

- **Storage Location**: `Backend/uploads/` directory
- **Max File Size**: 10MB per file
- **Supported Formats**: Images (JPG, PNG, etc.)
- **Access URL**: `http://localhost:8080/uploads/{filename}`
- **Implementation**: Multipart form data with Spring Boot

## 🛠️ Development

### Backend Development
- Hot reload enabled with Spring Boot DevTools
- Database auto-update with `spring.jpa.hibernate.ddl-auto=update`
- SQL logging enabled in development (`spring.jpa.show-sql=true`)

### Frontend Development
- Hot Module Replacement (HMR) with Vite
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling

### Environment Configuration

**Backend** (`backend/src/main/resources/application.properties`):
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/agrifair
spring.datasource.username=root
spring.datasource.password=root

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# File Upload
spring.servlet.multipart.max-file-size=10MB
file.upload-dir=uploads
```

**Frontend** (`frontend/src/services/api.ts`):
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 🧪 Testing

### Backend Testing
- Use Postman or similar tool to test API endpoints
- Ensure MySQL database is running
- JWT tokens required for protected endpoints

### Frontend Testing
- Start both backend and frontend servers
- Test user flows:
  1. Register → Login → Dashboard
  2. Farmer: Add crops → View crops
  3. Customer: Browse crops → View details
  4. Equipment: Create → Browse → Rent

## 📝 Database Schema

### Users Table
- `id` (Long, Primary Key)
- `username` (String, Unique)
- `email` (String, Unique)
- `password` (String, Encrypted)
- `role` (String: ROLE_FARMER, ROLE_CUSTOMER)

### Farmers Table
- `id` (Long, Primary Key)
- `firstName` (String)
- `secondName` (String)
- `email` (String, Unique)
- `phoneNo` (String, Unique)
- `county` (String)
- `localArea` (String)

### Crops Table
- `id` (Long, Primary Key)
- `productName` (String)
- `description` (String)
- `price` (Double)
- `quantity` (Integer)
- `organic` (Boolean)
- `photoUrl` (String)
- `farmer_id` (Foreign Key → User)

### Equipment Table
- `id` (Long, Primary Key)
- `type` (String)
- `model` (String)
- `available` (Boolean)
- `rate` (Integer)
- `imageUrl` (String)
- `owner_id` (Foreign Key → Farmer)

### Rentals Table
- `id` (Long, Primary Key)
- `renter_id` (Foreign Key → Farmer)
- `equipment_id` (Foreign Key → Equipment)
- `startDate` (LocalDate)
- `endDate` (LocalDate)
- `status` (Enum: PENDING, APPROVED, ACTIVE, COMPLETED, CANCELLED)
- `totalCost` (Double)
- `notes` (String)

## 🚨 Common Issues & Solutions

### Backend Issues

1. **Database Connection Error**:
   - Verify MySQL is running
   - Check credentials in `application.properties`
   - Ensure database exists

2. **Port Already in Use**:
   - Change port in `application.properties`: `server.port=8081`

3. **File Upload Fails**:
   - Check `uploads/` directory exists
   - Verify file size is under 10MB
   - Check file permissions

### Frontend Issues

1. **API Connection Error**:
   - Ensure backend is running on `http://localhost:8080`
   - Check CORS configuration
   - Verify API_BASE_URL in `api.ts`

2. **Authentication Issues**:
   - Clear localStorage: `localStorage.clear()`
   - Check JWT token in browser DevTools
   - Verify token is sent in request headers

3. **Image Not Displaying**:
   - Verify image URL format: `http://localhost:8080/uploads/{filename}`
   - Check backend file serving configuration
   - Ensure image was uploaded successfully

## 📚 Additional Documentation

- `Backend/IMAGE_UPLOAD_GUIDE.md` - Image upload implementation details
- `Backend/REVIEW_SUMMARY.md` - Code review and recommendations
- `NewFrontend/harat-farm-link-main/IMAGE_UPLOAD_FRONTEND.md` - Frontend image upload guide
- `NewFrontend/harat-farm-link-main/RENTAL_FRONTEND_GUIDE.md` - Rental system frontend guide
- `NewFrontend/MIGRATION_GUIDE.md` - Frontend migration documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of an agricultural marketplace platform.

## 👥 Authors

AgriFair Development Team

---

**Note**: This is an active development project. Some features may be in progress or subject to change.

