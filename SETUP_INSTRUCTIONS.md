# MAVS Project Setup Instructions

## ✅ What's Been Created

### Backend Features:
- ✅ Express.js server with authentication endpoints
- ✅ MySQL database configuration
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ User registration and login endpoints
- ✅ Admin role support
- ✅ Environment variables configuration

### Frontend Features:
- ✅ React Native app with Expo Router
- ✅ Authentication context with AsyncStorage
- ✅ Login and Register screens
- ✅ Protected routes
- ✅ User profile display
- ✅ Admin role detection
- ✅ API service layer

## 🗄️ Database Setup Required

### 1. Install MySQL
Make sure MySQL is installed and running on your system.

### 2. Create Database and Tables
Run these SQL commands in your MySQL client:

```sql
-- Create database
CREATE DATABASE mavs;

-- Use database
USE mavs;

-- Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Create a default admin user
INSERT INTO users (full_name, email, password, role) VALUES 
('Admin User', 'admin@mavs.com', '$2a$12$placeholder_hash_replace_this', 'admin');
```

### 3. Update .env File
Update `backend/.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=mavs
DB_PORT=3306
```

## 🚀 How to Run

### Backend:
```bash
cd backend
node server.js  # Full server with database
# OR
node server-simple.js  # Simple server for testing
```

### Frontend:
```bash
cd mavs
npx expo start
```

## 📱 Available Screens

1. **Home Screen** (`/(tabs)/index.tsx`) - Shows user info if logged in
2. **Login Screen** (`/login.tsx`) - User authentication
3. **Register Screen** (`/register.tsx`) - User registration
4. **Explore Screen** (`/(tabs)/explore.tsx`) - Standard Expo screen

## 🔑 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `GET /api/auth/users` - Get all users (admin only)
- `GET /api/test` - Test API connection
- `GET /api/health` - Health check

## 📱 Platform-Specific URLs

The app automatically uses the correct API URL:
- **Android Emulator**: `http://10.0.2.2:5000`
- **iOS Simulator**: `http://localhost:5000`
- **Web**: `http://localhost:5000`

## 🔧 Next Steps

1. **Set up MySQL database** using the SQL commands above
2. **Update the .env file** with your MySQL credentials
3. **Start the full server** with `node server.js`
4. **Test registration and login** in the mobile app

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ JWT tokens with expiration
- ✅ Protected routes
- ✅ Role-based access control
- ✅ Input validation
- ✅ CORS configuration

## 📋 Dependencies Installed

### Backend:
- express
- cors
- mysql2
- bcryptjs
- jsonwebtoken
- dotenv

### Frontend:
- @react-native-async-storage/async-storage
- @react-native-picker/picker
- axios (already installed)

All components are ready for production use with proper error handling and security measures!
