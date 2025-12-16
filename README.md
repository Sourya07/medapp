# Medical Store App 🏥

A comprehensive mobile medical store application similar to 1mg/PharmEasy, built with React Native (Expo) and Node.js backend. Users can browse medicines from nearby stores, place orders, and track pickups.

## 📱 Features

### User Features
- **OTP-based Authentication**: Secure mobile number login
- **Location-based Discovery**: Find medical stores within 50km radius
- **Medicine Search**: Browse and search medicines with filtering
- **Shopping Cart**: Add medicines, manage quantities
- **Order Management**: Place orders and track status (Pending → Ready → Picked Up)
- **Store Locator**: View store locations on map

### Admin Features (API)
- Store management (CRUD operations)
- Medicine inventory management
- Order status updates
- Image uploads for medicines

## 🛠 Tech Stack

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose (with geospatial indexing)
- JWT Authentication
- Twilio (OTP/SMS)
- Cloudinary (Image uploads)

### Mobile App
- React Native + Expo
- TypeScript
- React Navigation
- Expo Location & Secure Store
- React Native Maps
- Axios

## 📂 Project Structure

```
medical/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── utils/          # OTP, upload utilities
│   │   └── index.ts        # Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── mobile/
    ├── src/
    │   ├── screens/        # App screens
    │   ├── context/        # React Context providers
    │   ├── navigation/     # Navigation setup
    │   ├── services/       # API client
    │   └── types/          # TypeScript types
    ├── App.tsx
    ├── app.json
    ├── package.json
    └── .env.example
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator or physical device

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   - MongoDB URI
   - JWT secrets
   - Twilio credentials (or use development mode)
   - Cloudinary credentials

4. **Start the server**:
   ```bash
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm start
   ```

   Server runs on `http://localhost:5000`

### Mobile App Setup

1. **Navigate to mobile directory**:
   ```bash
   cd mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   - `API_URL`: Your backend URL
     - For iOS simulator: `http://localhost:5000/api`
     - For Android emulator: `http://10.0.2.2:5000/api`
     - For physical device: `http://YOUR_LOCAL_IP:5000/api`
   - `GOOGLE_MAPS_API_KEY`: Your Google Maps API key

4. **Start Expo**:
   ```bash
   npm start
   ```

5. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 📡 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/update-location` - Update user location

### Stores
- `GET /api/stores/nearby` - Get stores within 50km (requires auth)
- `GET /api/stores/:id` - Get store details
- `POST /api/stores` - Create store (admin)
- `PUT /api/stores/:id` - Update store (admin)
- `DELETE /api/stores/:id` - Delete store (admin)

### Medicines
- `GET /api/medicines/search` - Search medicines (requires auth)
- `GET /api/medicines/:id` - Get medicine details
- `GET /api/medicines/store/:storeId` - Get medicines by store
- `POST /api/medicines` - Create medicine (admin)
- `PUT /api/medicines/:id` - Update medicine (admin)
- `DELETE /api/medicines/:id` - Delete medicine (admin)
- `POST /api/medicines/upload-image` - Upload medicine image (admin)

### Orders
- `POST /api/orders` - Create order (requires auth)
- `GET /api/orders/history` - Get order history (requires auth)
- `GET /api/orders/:id` - Get order details (requires auth)
- `PUT /api/orders/:id/status` - Update order status (admin)
- `GET /api/orders/store/:storeId` - Get store orders (admin)

### Admin
- `POST /api/admin/login` - Admin login
- `POST /api/admin/create` - Create admin account

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/medical-store
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Mobile (.env)
```
API_URL=http://192.168.1.100:5000/api
GOOGLE_MAPS_API_KEY=your-maps-api-key
```

## 🧪 Testing

### Create Admin Account
```bash
curl -X POST http://localhost:5000/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

### Create Sample Store
```bash
curl -X POST http://localhost:5000/api/admin/stores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Apollo Pharmacy",
    "address": "123 Main St, Mumbai",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "contactNumber": "9876543210",
    "serviceRadius": 50
  }'
```

### Create Sample Medicine
```bash
curl -X POST http://localhost:5000/api/admin/medicines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Paracetamol 500mg",
    "description": "Pain relief and fever reducer",
    "price": 50,
    "quantity": 100,
    "prescriptionRequired": false,
    "store": "STORE_ID_HERE"
  }'
```

## 📝 Development Mode Features

- **OTP Development Mode**: When `NODE_ENV=development`, OTPs are logged to console instead of sending SMS
- **Auto-login**: Access tokens persist in secure storage for seamless experience

## 🎨 Key Features Implementation

### Geospatial Queries
MongoDB 2dsphere index enables efficient location-based queries:
```javascript
// Find stores within 50km
Store.aggregate([
  {
    $geoNear: {
      near: { type: 'Point', coordinates: [lng, lat] },
      distanceField: 'distance',
      maxDistance: 50000, // meters
      spherical: true
    }
  }
])
```

### OTP Authentication
- 6-digit OTP with 10-minute expiration
- JWT access token (7 days) + refresh token (30 days)
- Secure token storage using Expo SecureStore

### Order Lifecycle
1. User adds medicines to cart
2. Places order (validates stock, same store)
3. Admin updates status: Pending → Ready
4. User picks up order
5. Admin marks: Ready → Picked Up

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Secure token storage on mobile
- Input validation
- CORS protection
- Environment variable protection

## 📱 Mobile App Screens

1. **Login** - OTP-based authentication
2. **Home** - Nearby stores list with location
3. **Medicine Search** - Search and filter medicines
4. **Cart** - Review and manage cart
5. **Checkout** - Place order
6. **Order History** - Past orders
7. **Order Details** - Track order status
8. **Map** - Store location viewer

## 🚧 Future Enhancements

- [ ] Prescription image upload
- [ ] Payment gateway integration
- [ ] Push notifications for order updates
- [ ] Medicine recommendations
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Admin web dashboard
- [ ] Real-time order tracking

## 📄 License

ISC

## 👥 Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ for better healthcare accessibility
