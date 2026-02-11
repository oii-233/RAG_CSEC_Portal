const express = require('express');
const { body } = require('express-validator');
const {
    askQuestion,
    uploadDocument,
    getDocuments
} = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/chat/ask
 * @desc    Ask chatbot a question
 * @access  Private
 */
router.post(
    '/ask',
    protect,
    [
        body('question')
            .trim()
            .notEmpty()
            .withMessage('Question is required')
            .isLength({ min: 3, max: 1000 })
            .withMessage('Question must be between 3 and 1000 characters')
    ],
    askQuestion
);

/**
 * @route   POST /api/chat/upload
 * @desc    Upload document for RAG system
 * @access  Private (Admin only)
 */
router.post(
    '/upload',
    protect,
    authorize('admin', 'staff'),
    [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required')
            .isLength({ min: 3, max: 200 })
            .withMessage('Title must be between 3 and 200 characters'),
        body('content')
            .trim()
            .notEmpty()
            .withMessage('Content is required')
            .isLength({ min: 10 })
            .withMessage('Content must be at least 10 characters'),
        body('category')
            .optional()
            .isIn(['safety', 'emergency', 'policy', 'procedure', 'resource', 'other'])
            .withMessage('Invalid category'),
        body('tags')
            .optional()
            .isArray()
            .withMessage('Tags must be an array')
    ],
    uploadDocument
);

/**
 * @route   GET /api/chat/documents
 * @desc    Get all documents
 * @access  Private
 */
router.get('/documents', protect, getDocuments);

module.exports = router;
