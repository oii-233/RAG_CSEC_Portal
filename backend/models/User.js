const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Handles user authentication and profile data
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
            trim: true,
            maxlength: [50, 'Name cannot be more than 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false // Don't return password by default in queries
        },
        role: {
            type: String,
            enum: ['student', 'admin', 'staff'],
            default: 'student'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields
    }
);

/**
 * Pre-save middleware to hash password before saving to database
 * Only hashes if password is modified
 */
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        console.log('🔐 Hashing password for user:', this.email);

        // Generate salt with 10 rounds
        const salt = await bcrypt.genSalt(10);

        // Hash password
        this.password = await bcrypt.hash(this.password, salt);

        console.log('✅ Password hashed successfully');
        next();
    } catch (error) {
        console.error('❌ Error hashing password:', error);
        next(error);
    }
});

/**
 * Method to compare entered password with hashed password in database
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    try {
        return await bcrypt.compare(enteredPassword, this.password);
    } catch (error) {
        console.error('❌ Error comparing passwords:', error);
        throw error;
    }
};

/**
 * Method to get user object without sensitive data
 * @returns {Object} User object without password
 */
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
