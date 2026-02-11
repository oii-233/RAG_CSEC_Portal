require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
        next();
    });
}

// ============================================
// ROUTES
// ============================================

// Health check route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'ASTU Smart Campus Safety API - Server is running',
        timestamp: new Date(),
        version: '1.0.0'
    });
});

// API status route
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: 'operational',
        database: 'connected',
        timestamp: new Date()
    });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - Route not found
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ============================================
// SERVER INITIALIZATION
// ============================================

const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start listening
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('🚀 ASTU Smart Campus Safety Backend');
            console.log('='.repeat(50));
            console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`🌐 Server URL: http://localhost:${PORT}`);
            console.log(`📡 API Base: http://localhost:${PORT}/api`);
            console.log('='.repeat(50));
            console.log('📚 Available Routes:');
            console.log('   GET  /api/status          - API status');
            console.log('   POST /api/auth/signup     - Register user');
            console.log('   POST /api/auth/login      - Login user');
            console.log('   GET  /api/auth/me         - Get current user');
            console.log('   POST /api/chat/ask        - Ask chatbot');
            console.log('   POST /api/chat/upload     - Upload document (admin)');
            console.log('   GET  /api/chat/documents  - Get documents');
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();
