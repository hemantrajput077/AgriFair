# Image Upload Feature Guide

## What Was Fixed

1. **Security Role Bug**: Fixed `hasRole('FARMER')` → `hasRole('ROLE_FARMER')` in CropController
2. **Image Upload Support**: Added image upload functionality for both Crop and Equipment

## How Image Upload Works

### For Crops (`/api/crops`)

**Endpoint**: `POST /api/crops`
**Content-Type**: `multipart/form-data`
**Authentication**: Required (Bearer Token with ROLE_FARMER)

**Request Format**:
- `crop` (JSON string): Crop data
- `image` (File, optional): Image file (JPG, PNG, etc.)

**Example using Postman**:
1. Set method to `POST`
2. URL: `http://localhost:8080/api/crops`
3. Authorization: Bearer Token (from login)
4. Body → form-data:
   - Key: `crop` (type: Text)
     Value: `{"productName":"Wheat","description":"Organic wheat","price":150.0,"quantity":100,"organic":true}`
   - Key: `image` (type: File)
     Value: Select your image file

**Response**:
```json
{
  "id": 1,
  "productName": "Wheat",
  "description": "Organic wheat",
  "price": 150.0,
  "quantity": 100,
  "organic": true,
  "photoUrl": "/uploads/abc123-def456.jpg",
  "farmerUsername": "farmer_admin"
}
```

### For Equipment (`/api/v1/equipments`)

**Endpoint**: `POST /api/v1/equipments`
**Content-Type**: `multipart/form-data`
**Authentication**: Required (Bearer Token)

**Request Format**:
- `equipment` (JSON string): Equipment data
- `image` (File, optional): Image file

**Example using Postman**:
1. Set method to `POST`
2. URL: `http://localhost:8080/api/v1/equipments`
3. Authorization: Bearer Token
4. Body → form-data:
   - Key: `equipment` (type: Text)
     Value: `{"type":"Tractor","model":"Mahindra 575 DI","available":true,"rate":3500,"owner":{"id":1}}`
   - Key: `image` (type: File)
     Value: Select your image file

**Response**:
```json
{
  "id": 1,
  "type": "Tractor",
  "model": "Mahindra 575 DI",
  "available": true,
  "rate": 3500,
  "imageUrl": "/uploads/xyz789-abc123.jpg",
  "owner": {
    "id": 1
  }
}
```

## File Storage

- **Storage Location**: `uploads/` directory (created automatically in project root)
- **File Naming**: UUID-based unique filenames to prevent conflicts
- **Access**: Images accessible via `http://localhost:8080/uploads/filename.jpg`
- **Max File Size**: 10MB (configurable in `application.properties`)

## Configuration

File upload settings in `application.properties`:
```properties
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=uploads
```

## Notes

- Image upload is **optional** - you can still provide `photoUrl`/`imageUrl` as a string if you prefer
- If both file and URL are provided, file takes precedence
- Supported image formats: JPG, PNG, GIF, etc. (any format accepted by Spring)
- Images are stored on the server filesystem (not in database)

## Testing

1. **Test Crop Upload**:
   - Login as farmer → Get JWT token
   - POST to `/api/crops` with form-data (crop JSON + image file)
   - Verify response contains `photoUrl`
   - Access image via `http://localhost:8080/uploads/...`

2. **Test Equipment Upload**:
   - Create a farmer first (POST `/api/v1/farmers`)
   - POST to `/api/v1/equipments` with form-data (equipment JSON + image file)
   - Verify response contains `imageUrl`
   - Access image via `http://localhost:8080/uploads/...`

