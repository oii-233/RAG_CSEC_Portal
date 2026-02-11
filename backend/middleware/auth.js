const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token
 * Middleware to authenticate users and attach user to request
 */
const protect = async (req, res, next) => {
    let token;

    try {
        // Check if authorization header exists and starts with 'Bearer'
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            // Extract token from 'Bearer <token>'
            token = req.headers.authorization.split(' ')[1];

            console.log('🔐 Token received:', token.substring(0, 20) + '...');
        }

        // Check if token exists
        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('✅ Token verified for user ID:', decoded.id);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.log('❌ User not found for token');
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user is active
            if (!req.user.isActive) {
                console.log('❌ User account is deactivated');
                return res.status(401).json({
                    success: false,
                    message: 'User account is deactivated'
                });
            }

            console.log('✅ User authenticated:', req.user.email);
            next();
        } catch (error) {
            console.error('❌ Token verification failed:', error.message);

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired, please login again'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

/**
 * Authorize user roles
 * Middleware to check if user has required role
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (!roles.includes(req.user.role)) {
            console.log(`❌ User ${req.user.email} with role ${req.user.role} not authorized`);
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }

        console.log(`✅ User ${req.user.email} authorized with role ${req.user.role}`);
        next();
    };
};

module.exports = { protect, authorize };
