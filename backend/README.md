# Dila Ads Connect - Backend API

Express.js backend API for the Dila Ads Connect billboard advertising platform.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management
- **Billboard Management**: CRUD operations for billboard listings
- **Booking System**: Request, approve/reject booking requests
- **Dispute Resolution**: Handle disputes between advertisers and billboard owners
- **Complaint System**: User complaint submission and admin management
- **Admin Dashboard**: Comprehensive admin panel for platform management
- **File Upload**: Image upload for billboards and profiles
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive request validation

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** database with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Bcrypt** for password hashing
- **Express Validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

## Database Schema

### Collections
- `users` - User accounts
- `profiles` - User profile information
- `admins` - Admin users
- `billboards` - Billboard listings
- `bookingrequests` - Booking requests and disputes
- `complaints` - User complaints

### User Roles
- `ADVERTISER` - Can book billboards and submit complaints
- `OWNER` - Can create billboards and manage booking requests
- `ADMIN` - Full platform management access

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /verify-phone` - Verify phone number

### Billboards (`/api/billboards`)
- `GET /` - Get all available billboards (public)
- `GET /featured` - Get featured billboards (public)
- `GET /:id` - Get billboard by ID (public)
- `GET /my/list` - Get user's billboards (owner only)
- `POST /` - Create billboard (owner only)
- `PUT /:id` - Update billboard (owner only)
- `DELETE /:id` - Delete billboard (owner only)

### Bookings (`/api/bookings`)
- `POST /` - Create booking request (advertiser only)
- `GET /my` - Get user's booking requests (advertiser only)
- `GET /billboard-requests` - Get requests for user's billboards (owner only)
- `GET /:id` - Get booking request by ID
- `PUT /:id/status` - Update booking status (owner only)
- `PUT /my/:id/cancel` - Cancel booking request (advertiser only)
- `POST /:id/dispute` - Create dispute

### Complaints (`/api/complaints`)
- `POST /` - Submit complaint
- `GET /my` - Get user's complaints
- `GET /:id` - Get complaint by ID

### Admin (`/api/admin`)
- `GET /dashboard` - Get dashboard statistics
- `GET /complaints` - Get all complaints
- `GET /complaints/:id` - Get complaint by ID
- `PUT /complaints/:id` - Update complaint
- `GET /disputes` - Get all disputes
- `GET /disputes/:id` - Get dispute by ID
- `PUT /disputes/:id` - Update dispute
- `GET /billboards/pending` - Get pending billboard approvals
- `PUT /billboards/:id/approval` - Approve/reject billboard

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `env.example` to `.env` and configure:
```bash
cp env.example .env
```

Required environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS

### 3. Database Setup
Make sure MongoDB is running on your system. The application will automatically create the database and collections when you start the server.

### 4. Start Development Server
```bash
npm run dev
```

### 5. Create Admin User
You'll need to manually create an admin user in the database or add an admin endpoint.

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── billboardController.js
│   │   ├── bookingController.js
│   │   ├── adminController.js
│   │   └── complaintController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── billboards.js
│   │   ├── bookings.js
│   │   ├── complaints.js
│   │   └── admin.js
│   └── server.js
├── prisma/
│   └── schema.prisma
├── uploads/
├── package.json
├── env.example
└── README.md
```

## Security Features

- **JWT Authentication** with configurable expiration
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent abuse
- **Input Validation** on all endpoints
- **CORS Protection** with configurable origins
- **Security Headers** via Helmet
- **File Upload Validation** with type and size limits
- **Role-based Access Control** for different user types

## Error Handling

The API includes comprehensive error handling for:
- Database errors (MongoDB/Mongoose)
- Authentication errors (JWT)
- Validation errors
- File upload errors
- Custom business logic errors

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Adding New Features
1. Create/update Mongoose models if needed
2. Create controller functions
3. Add validation middleware
4. Create routes
5. Update this README

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure file upload directory
5. Set up reverse proxy (nginx)
6. Enable HTTPS
7. Configure monitoring and logging

## API Documentation

For detailed API documentation, refer to the individual route files or use tools like Postman to explore the endpoints.

