const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Get all comments (protected route - requires authentication)
router.get('/', protect, commentController.getAllComments);

// Create a new comment (protected route - requires authentication)
router.post('/', protect, commentController.createComment);

// Get a specific comment (protected route)
router.get('/:id', protect, commentController.getComment);

// Get replies for a specific comment (protected route)
router.get('/:id/replies', protect, commentController.getReplies);

// Get parent path for a nested comment (protected route)
router.get('/:commentId/parents', protect, commentController.findParentPath);

// Upvote a comment (protected route)
router.post('/:id/upvote', protect, commentController.upvoteComment);

// Remove upvote from a comment (protected route)
router.delete('/:id/upvote', protect, commentController.removeUpvote);

module.exports = router;