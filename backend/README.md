# ASTU Smart Campus Safety Backend

Complete Express.js backend with MongoDB Atlas, JWT Authentication, Voyage AI Embeddings, and Google Gemini Chatbot.

## 📁 Project Structure

```
backend/
├── server.js              # Main Express server
├── package.json           # Dependencies
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── config/
│   └── db.js             # MongoDB connection
├── models/
│   ├── User.js           # User model with bcrypt
│   └── Document.js       # Document model for RAG
├── routes/
│   ├── auth.js           # Authentication routes
│   └── chat.js           # Chatbot routes
├── middleware/
│   └── auth.js           # JWT verification middleware
└── controllers/
    ├── authController.js # Auth logic
    └── chatController.js # Chatbot & RAG logic
```

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file from the template:

```bash
copy .env.example .env
```

Edit `.env` with your actual credentials:

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_please_change_this

# Voyage AI API Key
VOYAGE_API_KEY=pa-xxxxxxxxxxxxxxxxxxxxx

# Google Gemini API Key
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### Step 3: Run the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on http://localhost:5000
```

## 🧪 Testing the API

### Test 1: Health Check

```bash
curl http://localhost:5000/
```

Expected response:
```json
{
  "success": true,
  "message": "ASTU Smart Campus Safety API - Server is running"
}
```

### Test 2: User Signup

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@astu.edu\",\"password\":\"password123\"}"
```

**Save the token from the response!**

### Test 3: User Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@astu.edu\",\"password\":\"password123\"}"
```

### Test 4: Get Current User (Protected Route)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Test 5: Ask Chatbot Question

```bash
curl -X POST http://localhost:5000/api/chat/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d "{\"question\":\"What safety resources are available on campus?\"}"
```

### Test 6: Upload Document (Admin Only)

First, create an admin user by signing up and then manually updating the role in MongoDB to "admin", or modify the signup request:

```bash
curl -X POST http://localhost:5000/api/chat/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d "{\"title\":\"Campus Safety Guide\",\"content\":\"Emergency numbers: Campus Security 911...\",\"category\":\"safety\",\"tags\":[\"emergency\",\"safety\"]}"
```

## 📚 API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |

### Chat Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/chat/ask` | Ask chatbot question | Private |
| POST | `/api/chat/upload` | Upload document | Admin/Staff |
| GET | `/api/chat/documents` | Get all documents | Private |

## 🔑 Features

✅ **JWT Authentication** - 7-day token expiration  
✅ **Bcrypt Password Hashing** - 10 salt rounds  
✅ **MongoDB Atlas Integration** - Cloud database  
✅ **Voyage AI Embeddings** - Text embeddings for RAG  
✅ **Google Gemini AI** - Conversational responses  
✅ **RAG System** - Document-based context  
✅ **Role-Based Access** - Student, Admin, Staff  
✅ **Input Validation** - Express-validator  
✅ **CORS Enabled** - Cross-origin support  
✅ **Error Handling** - Comprehensive error messages  
✅ **Logging** - Detailed console logs  

## 🔧 Troubleshooting

### MongoDB Connection Failed

- Verify your `MONGODB_URI` is correct
- Check MongoDB Atlas network access (allow your IP)
- Ensure database user has proper permissions

### CORS Errors

- Update `FRONTEND_URL` in `.env`
- Verify frontend is running on the correct port

### JWT Token Invalid

- Check `JWT_SECRET` is set in `.env`
- Ensure token is sent in `Authorization: Bearer <token>` format
- Token expires after 7 days - login again

### Voyage AI / Gemini Errors

- Verify API keys are correct in `.env`
- Check API quota/billing status
- See console logs for detailed error messages

## 📝 Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing | Random string (min 32 chars) |
| `VOYAGE_API_KEY` | Voyage AI API key | `pa-xxx...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🎯 Next Steps

1. **Frontend Integration**: Connect your React frontend to these endpoints
2. **Document Upload**: Add sample safety documents for better AI responses
3. **Testing**: Create comprehensive test suite
4. **Deployment**: Deploy to Heroku, Railway, or similar platform
5. **Features**: Add file upload, image support, notifications, etc.

## 📞 Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas and API services are operational

**Good luck with your hackathon! 🚀**
