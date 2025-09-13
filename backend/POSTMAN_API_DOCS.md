# Dila Ads Connect - Postman API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "ADVERTISER"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "phone": "+1234567890",
    "isVerified": false,
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADVERTISER"
    }
  }
}
```

### 2. Login User
**POST** `/auth/login`

**Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "profile": { ... }
  }
}
```

### 3. Get Profile
**GET** `/auth/profile`
**Headers:** `Authorization: Bearer <token>`

### 4. Update Profile
**PUT** `/auth/profile`
**Headers:** `Authorization: Bearer <token>`

**Body (JSON):**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "I am an advertiser"
}
```

### 5. Change Password
**PUT** `/auth/change-password`
**Headers:** `Authorization: Bearer <token>`

**Body (JSON):**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## 📋 Billboard Endpoints

### 1. Get All Billboards (Public)
**GET** `/billboards?page=1&limit=10&search=location&location=NYC&minPrice=100&maxPrice=500`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term
- `location` (optional): Filter by location
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `size` (optional): Filter by size

### 2. Get Featured Billboards
**GET** `/billboards/featured`

### 3. Get Billboard by ID
**GET** `/billboards/:id`

### 4. Get My Billboards (Owner Only)
**GET** `/billboards/my/list?page=1&limit=10`
**Headers:** `Authorization: Bearer <token>`

### 5. Create Billboard (Owner Only)
**POST** `/billboards`
**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**
- `name`: "Times Square Billboard"
- `location`: "New York, NY"
- `size`: "10x20 feet"
- `pricePerDay`: 500
- `description`: "Prime location billboard"
- `phone`: "+1234567890"
- `email`: "owner@example.com"
- `image`: (file upload)

### 6. Update Billboard (Owner Only)
**PUT** `/billboards/:id`
**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

### 7. Delete Billboard (Owner Only)
**DELETE** `/billboards/:id`
**Headers:** `Authorization: Bearer <token>`

---

## 📅 Booking Endpoints

### 1. Create Booking Request (Advertiser Only)
**POST** `/bookings`
**Headers:** `Authorization: Bearer <token>`

**Body (JSON):**
```json
{
  "billboardId": "billboard_id",
  "startDate": "2024-02-01",
  "endDate": "2024-02-07",
  "message": "I want to advertise my product"
}
```

### 2. Get My Booking Requests (Advertiser Only)
**GET** `/bookings/my?page=1&limit=10&status=PENDING`
**Headers:** `Authorization: Bearer <token>`

### 3. Get Billboard Booking Requests (Owner Only)
**GET** `/bookings/billboard-requests?page=1&limit=10&status=PENDING`
**Headers:** `Authorization: Bearer <token>`

### 4. Get Booking Request by ID
**GET** `/bookings/:id`
**Headers:** `Authorization: Bearer <token>`

### 5. Update Booking Status (Owner Only)
**PUT** `/bookings/:id/status`
**Headers:** `Authorization: Bearer <token>`

**Body (JSON):**
```json
{
  "status": "APPROVED",
  "responseMessage": "Your booking has been approved"
}
```

### 6. Cancel Booking Request (Advertiser Only)
**PUT** `/bookings/my/:id/cancel`
**Headers:** `Authorization: Bearer <token>`

### 7. Create Dispute
**POST** `/bookings/:id/dispute`
**Headers:** `Authorization: Bearer <token>`

**Body (JSON):**
```json
{
  "disputeReason": "The billboard was not as described"
}
```

---

## 📝 Complaint Endpoints

### 1. Submit Complaint
**POST** `/complaints`
**Headers:** `Authorization: Bearer <token>`

**Body (JSON):**
```json
{
  "subject": "Poor service",
  "description": "The billboard owner was unresponsive"
}
```

### 2. Get My Complaints
**GET** `/complaints/my?page=1&limit=10&status=OPEN`
**Headers:** `Authorization: Bearer <token>`

### 3. Get Complaint by ID
**GET** `/complaints/:id`
**Headers:** `Authorization: Bearer <token>`

---

## 👨‍💼 Admin Endpoints

### 1. Get Dashboard Stats
**GET** `/admin/dashboard`
**Headers:** `Authorization: Bearer <admin-token>`

### 2. Get All Complaints
**GET** `/admin/complaints?page=1&limit=10&status=OPEN`
**Headers:** `Authorization: Bearer <admin-token>`

### 3. Get Complaint by ID
**GET** `/admin/complaints/:id`
**Headers:** `Authorization: Bearer <admin-token>`

### 4. Update Complaint
**PUT** `/admin/complaints/:id`
**Headers:** `Authorization: Bearer <admin-token>`

**Body (JSON):**
```json
{
  "status": "RESOLVED",
  "adminResponse": "Issue has been resolved"
}
```

### 5. Get All Disputes
**GET** `/admin/disputes?page=1&limit=10&status=OPEN`
**Headers:** `Authorization: Bearer <admin-token>`

### 6. Get Dispute by ID
**GET** `/admin/disputes/:id`
**Headers:** `Authorization: Bearer <admin-token>`

### 7. Update Dispute
**PUT** `/admin/disputes/:id`
**Headers:** `Authorization: Bearer <admin-token>`

**Body (JSON):**
```json
{
  "disputeStatus": "RESOLVED"
}
```

### 8. Get Pending Billboards
**GET** `/admin/billboards/pending?page=1&limit=10`
**Headers:** `Authorization: Bearer <admin-token>`

### 9. Approve/Reject Billboard
**PUT** `/admin/billboards/:id/approval`
**Headers:** `Authorization: Bearer <admin-token>`

**Body (JSON):**
```json
{
  "isApproved": true
}
```

---

## 🧪 Testing Workflow

### Step 1: Setup
1. Start your MongoDB server
2. Start the backend server: `npm run dev`
3. Import the Postman collection (create one based on this doc)

### Step 2: Create Test Users
1. **Register an Advertiser:**
   - POST `/auth/register` with role: "ADVERTISER"
   - Save the token for advertiser requests

2. **Register a Billboard Owner:**
   - POST `/auth/register` with role: "OWNER"
   - Save the token for owner requests

3. **Create an Admin User:**
   - You'll need to manually create an admin user in the database
   - Or add an admin creation endpoint

### Step 3: Test Billboard Flow
1. **As Owner:** Create a billboard
2. **As Advertiser:** View available billboards
3. **As Advertiser:** Create a booking request
4. **As Owner:** View and approve/reject booking requests

### Step 4: Test Admin Flow
1. **As Admin:** View dashboard stats
2. **As Admin:** Approve pending billboards
3. **As Admin:** Handle complaints and disputes

---

## 📊 Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔧 Environment Variables for Postman

Create these variables in Postman:
- `base_url`: `http://localhost:3001/api`
- `advertiser_token`: (token from advertiser login)
- `owner_token`: (token from owner login)
- `admin_token`: (token from admin login)

---

## 📝 Sample Test Data

### User Registration Data:
```json
{
  "advertiser": {
    "email": "advertiser@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Advertiser",
    "role": "ADVERTISER"
  },
  "owner": {
    "email": "owner@test.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Owner",
    "role": "OWNER"
  }
}
```

### Billboard Data:
```json
{
  "name": "Times Square Billboard",
  "location": "New York, NY",
  "size": "10x20 feet",
  "pricePerDay": 500,
  "description": "Prime location in Times Square",
  "phone": "+1234567890",
  "email": "owner@example.com"
}
```

This documentation provides everything you need to test all the backend endpoints using Postman!
