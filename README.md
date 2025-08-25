# MAVS - Member Management System

A comprehensive member management system built with React Native (Expo) frontend and Node.js backend.

## 🚀 Features

- **User Authentication**: Secure login/register with JWT tokens
- **Role-based Access**: Admin and User roles with different permissions
- **Member Management**: Complete CRUD operations for member data
- **Admin Dashboard**: Statistics and member overview
- **Excel Export**: Download member data in Excel format
- **Form Submission**: User-friendly member registration forms
- **Profile Management**: View submitted forms and user information

## 📱 Tech Stack

### Frontend (React Native)
- **Expo Router**: File-based navigation
- **TypeScript**: Type-safe development
- **Expo File System**: File handling and sharing
- **Authentication Context**: Global auth state management

### Backend (Node.js)
- **Express.js**: Web framework
- **MySQL**: Database with mysql2
- **JWT**: Authentication tokens
- **XLSX**: Excel file generation
- **bcryptjs**: Password hashing

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL Database
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=mavs
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_here
```

5. Set up database:
```bash
mysql -u root -p < database.sql
```

6. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to mavs directory:
```bash
cd mavs
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Members (Protected)
- `GET /api/members` - Get all members (Admin only)
- `POST /api/members` - Create member
- `GET /api/members/my-members` - Get user's members
- `GET /api/members/admin/stats` - Get member statistics (Admin only)
- `GET /api/members/admin/export-excel` - Export to Excel (Admin only)

## 👥 User Roles

### Admin Features
- View all members and statistics
- Export member data to Excel
- Access admin dashboard
- User management capabilities

### User Features
- Submit member registration forms
- View their own submitted forms
- Profile management

## 🏗️ Project Structure

```
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth middleware
│   ├── routes/         # API routes
│   ├── config/         # Database config
│   └── server.js       # Main server file
└── mavs/
    ├── app/            # Expo Router pages
    ├── components/     # Reusable components
    ├── context/        # Auth context
    ├── services/       # API service layer
    └── constants/      # App constants
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization
- CORS protection

## 📱 Mobile Features

- Cross-platform (iOS & Android)
- File sharing for Excel exports
- Responsive design
- Native navigation

## 🚀 Deployment

### Backend Deployment
1. Set up production database
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Build for production: `expo build`
2. Deploy to app stores or use Expo's hosting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email [your-email] or create an issue in the repository.
