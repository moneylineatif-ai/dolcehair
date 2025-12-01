# AID MVP - Full-Stack Web Application

A full-stack web application built with React + TypeScript (Vite) frontend and Node.js + Express + TypeScript backend.

## 🚀 Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework (mobile-first, responsive)
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Context API** - Global state management for authentication

### Backend
- **Node.js** with **Express**
- **TypeScript** - Type-safe JavaScript
- **In-Memory Storage** - No database required (data resets on server restart)
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management

## 📁 Project Structure

```
aid-mvp/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Dashboard.tsx (Mechanic)
│   │   │   └── Map.tsx (Customer)
│   │   ├── components/    # Reusable components
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/       # React Context
│   │   │   └── AuthContext.tsx
│   │   ├── App.tsx        # Main app component with routing
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles with Tailwind
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                 # Backend Express API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   │   └── auth.ts   # Authentication routes
│   │   ├── db/           # Database configuration
│   │   │   └── index.ts
│   │   └── index.ts      # Express server entry point
│   ├── package.json
│   └── tsconfig.json
├── .env.example           # Environment variables template
├── .gitignore
├── package.json          # Root package.json with scripts
└── README.md

```

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

**Note:** This project uses **in-memory storage** (no database setup required!)

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```
   This will install dependencies for root, server, and client.

   Or install manually:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

3. **Configure environment variables** (optional):
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env with your configuration
   # Update database credentials, API keys, etc.
   ```

### Running the Application

#### Development Mode (Recommended)

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

#### Run Separately

**Frontend only**:
```bash
npm run dev:client
# or
cd client && npm run dev
```

**Backend only**:
```bash
npm run dev:server
# or
cd server && npm run dev
```

### Building for Production

Build the frontend:
```bash
npm run build
# or
cd client && npm run build
```

The production build will be in `client/dist/`.

Start the production server:
```bash
cd server
npm run build
npm start
```

## 📍 Routes

- `/` - Home/Landing page (public)
- `/login` - Login page (public)
- `/signup` - Sign up page (public, includes role selection)
- `/dashboard` - Mechanic dashboard (protected, mechanic role only)
- `/map` - Customer map view (protected, customer role only)

### Authentication & Authorization

- **User Roles**: `customer` or `mechanic`
- **Protected Routes**: Routes are protected based on user role
- **JWT Tokens**: Stored in localStorage, sent with API requests
- **Auto-redirect**: Users are redirected to appropriate pages based on their role after login/signup

## 🔧 Environment Variables

Create a `.env` file in the root directory (use `.env.example` as a template):

```env
# Server
PORT=3001

# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=aid_mvp
DB_PASSWORD=postgres
DB_PORT=5432

# API Keys
VITE_MAPBOX_TOKEN=your_mapbox_token_here
# Get your free token at https://account.mapbox.com/access-tokens/

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_in_production

# Client URL
CLIENT_URL=http://localhost:5173
```

## ✅ Verification

1. **Frontend**: Navigate to http://localhost:5173 - You should see the "Hello World" landing page
2. **Backend**: Check http://localhost:3001/api/health - Should return `{ status: 'ok', ... }`
3. **Database**: The server will automatically initialize the database schema on startup
4. **Authentication**: 
   - Try signing up with role "Customer" or "Mechanic"
   - Login and verify role-based redirects
   - Test protected routes (should redirect if not authenticated or wrong role)

## 🔐 Authentication Features

- **User Registration**: Email/password with role selection (Customer or Mechanic)
- **User Login**: Email/password authentication
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access Control**: Routes protected by user role
- **Persistent Sessions**: User stays logged in across page refreshes
- **Auto-redirect**: Users redirected to role-appropriate pages after login

## 🐛 Troubleshooting

### Port Already in Use
If port 3001 or 5173 is already in use:
- Change `PORT` in `.env` for backend
- Change `server.port` in `client/vite.config.ts` for frontend

### Data Persistence
- **Note:** Data is stored in-memory and will be lost when the server restarts
- The example user (Aid@gmail.com / 123) is automatically created on server start

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be v18+)

## 🗺️ Map Integration

The application uses **Mapbox GL JS** for map functionality. To use the map:

1. **Get a Mapbox token** (free tier available):
   - Sign up at https://account.mapbox.com/
   - Create an access token
   - Add it to your `.env` file as `VITE_MAPBOX_TOKEN`

2. **Features**:
   - User geolocation (with permission prompt)
   - Interactive map with mechanic markers
   - Click markers to see mechanic details
   - Distance calculation from user location
   - Responsive design (mobile & desktop)
   - Fallback handling for geolocation denial

3. **Mock Data**: The map displays mock mechanics data for testing. Replace with real API data when ready.

## 🔄 Real-Time Features

The application now includes real-time updates using Socket.IO:

### For Mechanics:
- **Availability Toggle**: Toggle online/offline status from dashboard
- **Location Tracking**: Automatically captures and updates location every 10 seconds when online
- **Real-Time Broadcast**: Location changes are broadcast to all customers instantly

### For Customers:
- **Live Map Updates**: See mechanics appear/disappear as they toggle availability
- **Real-Time Location**: Watch mechanics move on the map in real-time
- **Instant Notifications**: Get notified when mechanics come online or go offline

### Technical Details:
- **Socket.IO**: WebSocket-based real-time communication
- **Database**: PostgreSQL stores mechanic locations and availability
- **Auto Cleanup**: Mechanics automatically go offline on logout or disconnect

## 📝 Next Steps

- Implement service request functionality
- Add service request history
- Implement push notifications
- Add mechanic ratings and reviews
- Add tests

## 📄 License

ISC

