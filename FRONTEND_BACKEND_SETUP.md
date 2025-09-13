# 🚀 Frontend-Backend Connection Setup

## Quick Setup Guide

### 1. Start the Backend Server
```bash
cd dila-ads-connect/backend
npm install
npm run dev
```
The backend will run on `http://localhost:3001`

### 2. Start the Frontend Server
```bash
cd dila-ads-connect
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`

### 3. Environment Configuration
Create a `.env.local` file in the frontend root directory:
```env
VITE_API_URL=http://localhost:3001/api
```

## ✅ What's Been Updated

### **New API Client (`src/lib/api.ts`)**
- Replaces Supabase client with custom Express API client
- Handles JWT authentication
- Manages all API endpoints (auth, billboards, bookings, complaints)

### **Updated Auth Hook (`src/hooks/useAuth.tsx`)**
- Uses new API client instead of Supabase
- Maintains same interface for components
- Handles JWT token storage and management

### **New Custom Hooks**
- `useBillboards.tsx` - Billboard operations
- `useBookings.tsx` - Booking request management  
- `useComplaints.tsx` - Complaint handling

### **Updated Components**
- `FeaturedBillboards.tsx` - Now uses new API
- `Signup.tsx` - Updated for new auth flow
- `Login.tsx` - Updated for new auth flow

## 🔄 API Endpoints Mapping

| Frontend Hook | Backend Endpoint | Description |
|---------------|------------------|-------------|
| `useAuth.signUp()` | `POST /auth/register` | User registration |
| `useAuth.signIn()` | `POST /auth/login` | User login |
| `useAuth.getProfile()` | `GET /auth/profile` | Get user profile |
| `useBillboards.getBillboards()` | `GET /billboards` | Get all billboards |
| `useBillboards.getFeaturedBillboards()` | `GET /billboards/featured` | Get featured billboards |
| `useBillboards.createBillboard()` | `POST /billboards` | Create billboard |
| `useBookings.createBookingRequest()` | `POST /bookings` | Create booking request |
| `useComplaints.createComplaint()` | `POST /complaints` | Submit complaint |

## 🧪 Testing the Connection

### 1. Test Authentication
1. Go to `http://localhost:5173/signup`
2. Create a new account
3. Check if you're redirected to the appropriate dashboard

### 2. Test Billboard Display
1. Go to `http://localhost:5173/`
2. Check if featured billboards load from the backend
3. Verify billboard details display correctly

### 3. Test Billboard Creation (Owner)
1. Register as an "OWNER" role
2. Go to dashboard
3. Try creating a new billboard
4. Check if it appears in the featured billboards

## 🔧 Troubleshooting

### Common Issues:

**1. CORS Errors**
- Make sure backend is running on port 3001
- Check that CORS is configured in backend server.js

**2. Authentication Issues**
- Verify JWT token is being stored in localStorage
- Check that Authorization header is being sent

**3. API Connection Issues**
- Verify `VITE_API_URL` environment variable
- Check browser network tab for failed requests
- Ensure backend server is running

**4. Data Format Issues**
- Check that API responses match expected format
- Verify field names match between frontend and backend

## 📊 Data Flow

```
Frontend Component → Custom Hook → API Client → Backend API → MongoDB
```

### Example Flow:
1. User clicks "Sign Up" button
2. `Signup.tsx` calls `useAuth.signUp()`
3. `useAuth` calls `apiClient.register()`
4. `apiClient` makes HTTP request to `POST /auth/register`
5. Backend creates user in MongoDB
6. Backend returns JWT token
7. Frontend stores token and updates user state
8. User is redirected to dashboard

## 🎯 Next Steps

1. **Test all authentication flows**
2. **Test billboard CRUD operations**
3. **Test booking request workflow**
4. **Test complaint submission**
5. **Update remaining components** (Dashboard, Advertiser pages, etc.)

## 📝 Notes

- The frontend now uses JWT tokens instead of Supabase sessions
- All API calls go through the custom `apiClient`
- File uploads for billboards are handled via FormData
- Error handling is consistent across all API calls
- The UI remains the same, only the data layer has changed

Happy coding! 🚀
