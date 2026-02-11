const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} JWT Token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
    try {
        console.log('📝 Signup attempt:', req.body.email);

        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password, // Will be hashed by pre-save middleware
            role: role || 'student'
        });

        console.log('✅ User created successfully:', user.email);

        // Generate JWT token
        const token = generateToken(user._id);

        // Return user data and token
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                },
                token
            }
        });
    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        console.log('🔐 Login attempt:', req.body.email);

        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if user exists (include password field for comparison)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            console.log('❌ User account deactivated:', email);
            return res.status(401).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }

        // Verify password
        const isPasswordMatch = await user.matchPassword(password);
        if (!isPasswordMatch) {
            console.log('❌ Invalid password for user:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        console.log('✅ Login successful:', user.email);

        // Generate JWT token
        const token = generateToken(user._id);

        // Return user data and token
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                },
                token
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
    try {
        console.log('👤 Get current user:', req.user.email);

        // User is already attached to request by auth middleware
        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    role: req.user.role,
                    isActive: req.user.isActive,
                    createdAt: req.user.createdAt,
                    updatedAt: req.user.updatedAt
                }
            }
        });
    } catch (error) {
        console.error('❌ Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
    try {
        console.log('📝 Update profile:', req.user.email);

        const { name, email } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) user.name = name;
        if (email) {
            // Check if new email already exists
            const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            user.email = email;
        }

        await user.save();

        console.log('✅ Profile updated:', user.email);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

module.exports = {
    signup,
    login,
    getCurrentUser,
    updateProfile
};
