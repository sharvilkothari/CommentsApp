const Comment = require('../models/Comment');

// Get all comments
exports.getAllComments = async (req, res) => {
  try {
    // Helper function to get replies recursively
    const getRepliesRecursively = async (parentId) => {
      console.log(`Getting replies for parent ID: ${parentId}`);
      const replies = await Comment.find({ parentId })
        .sort({ createdAt: 1 }) // Oldest first for replies
        .populate('user', 'username');
      
      console.log(`Found ${replies.length} direct replies for parent ID ${parentId}`);
      
      // Convert mongoose documents to plain objects and get nested replies
      const repliesWithNested = await Promise.all(
        replies.map(async (reply) => {
          const replyObj = reply.toObject();
          console.log(`Processing reply ID: ${replyObj._id}, checking for nested replies`);
          
          // Add user upvote status if a user is making the request
          if (req.user) {
            replyObj.upvotes = replyObj.upvotes || { count: 0, users: [] };
            replyObj.upvotes.userHasUpvoted = replyObj.upvotes.users.some(
              userId => userId.toString() === req.user._id.toString()
            );
          }
          
          // Recursively get nested replies
          replyObj.replies = await getRepliesRecursively(reply._id);
          
          console.log(`Reply ID ${replyObj._id} has ${replyObj.replies.length} nested replies`);
          return replyObj;
        })
      );
      
      return repliesWithNested;
    };
    
    // Get top-level comments (not replies)
    const topLevelComments = await Comment.find({ isReply: false })
      .sort({ createdAt: -1 }) // Newest first
      .populate('user', 'username');
    
    // For each top-level comment, get its replies recursively
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const commentObj = comment.toObject();
        
        // Add user upvote status if a user is making the request
        if (req.user) {
          commentObj.upvotes = commentObj.upvotes || { count: 0, users: [] };
          commentObj.upvotes.userHasUpvoted = commentObj.upvotes.users.some(
            userId => userId.toString() === req.user._id.toString()
          );
        }
        
        // Get all nested replies
        commentObj.replies = await getRepliesRecursively(comment._id);
        return commentObj;
      })
    );
      
    res.status(200).json(commentsWithReplies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { text, parentId } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    
    // Create the new comment
    const newComment = new Comment({
      user: req.user._id,
      username: req.user.username,
      text,
      parentId: parentId || null,
      isReply: !!parentId
    });
    
    const savedComment = await newComment.save();
    
    // Helper function to get parent comment info if needed
    const getParentInfo = async (parentId) => {
      if (!parentId) return null;
      
      try {
        const parent = await Comment.findById(parentId);
        if (!parent) return null;
        
        return {
          id: parent._id,
          text: parent.text.substring(0, 50) + (parent.text.length > 50 ? '...' : ''),
          username: parent.username
        };
      } catch (err) {
        console.error('Error fetching parent comment:', err);
        return null;
      }
    };
    
    // If this is a reply, return it with parent reference and empty replies array
    if (parentId) {
      const parentInfo = await getParentInfo(parentId);
      
      return res.status(201).json({
        ...savedComment._doc,
        parentId,
        parentInfo,
        replies: []
      });
    }
    
    // Otherwise, it's a new top-level comment, so we return it with empty replies array
    res.status(201).json({
      ...savedComment._doc,
      replies: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a specific comment
exports.getComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Helper function to get replies recursively (reused from getAllComments)
    const getRepliesRecursively = async (parentId) => {
      const replies = await Comment.find({ parentId })
        .sort({ createdAt: 1 }) // Oldest first for replies
        .populate('user', 'username');
      
      const repliesWithNested = await Promise.all(
        replies.map(async (reply) => {
          const replyObj = reply.toObject();
          replyObj.replies = await getRepliesRecursively(reply._id);
          return replyObj;
        })
      );
      
      return repliesWithNested;
    };
    
    // If this is a top-level comment, get its replies recursively
    if (!comment.isReply) {
      const commentObj = comment.toObject();
      commentObj.replies = await getRepliesRecursively(comment._id);
      
      return res.status(200).json(commentObj);
    }
    
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new function to get replies for a specific comment
exports.getReplies = async (req, res) => {
  try {
    const parentId = req.params.id;
    
    // Helper function to get replies recursively (reused from above)
    const getRepliesRecursively = async (parentId) => {
      const replies = await Comment.find({ parentId })
        .sort({ createdAt: 1 }) // Oldest first for replies
        .populate('user', 'username');
      
      const repliesWithNested = await Promise.all(
        replies.map(async (reply) => {
          const replyObj = reply.toObject();
          replyObj.replies = await getRepliesRecursively(reply._id);
          return replyObj;
        })
      );
      
      return repliesWithNested;
    };
    
    // Get all nested replies for the given parent
    const repliesWithNested = await getRepliesRecursively(parentId);
    
    res.status(200).json(repliesWithNested);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};// Find parent comment path (for deeply nested comments)
exports.findParentPath = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // Function to recursively find parent chain
    const findParentChain = async (id, chain = []) => {
      if (!id) return chain;
      
      const comment = await Comment.findById(id);
      if (!comment) return chain;
      
      chain.unshift({
        _id: comment._id,
        text: comment.text,
        username: comment.username,
        isReply: comment.isReply,
        createdAt: comment.createdAt
      });
      
      if (comment.parentId) {
        return await findParentChain(comment.parentId, chain);
      }
      
      return chain;
    };
    
    const parentChain = await findParentChain(commentId);
    
    res.status(200).json(parentChain);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};// Upvote a comment
exports.upvoteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;

    // Find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user has already upvoted this comment
    const alreadyUpvoted = comment.upvotes.users.some(id => id.equals(userId));
    
    if (alreadyUpvoted) {
      return res.status(400).json({ message: 'You have already upvoted this comment' });
    }
    
    // Add user to upvotes list and increment count
    comment.upvotes.users.push(userId);
    comment.upvotes.count += 1;
    
    await comment.save();
    
    res.status(200).json({ 
      _id: comment._id,
      upvotes: comment.upvotes.count,
      userHasUpvoted: true
    });
  } catch (error) {
    console.error('Error upvoting comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove upvote from a comment
exports.removeUpvote = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;
    
    // Find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user has upvoted this comment
    const upvoteIndex = comment.upvotes.users.findIndex(id => id.equals(userId));
    
    if (upvoteIndex === -1) {
      return res.status(400).json({ message: 'You have not upvoted this comment' });
    }
    
    // Remove user from upvotes list and decrement count
    comment.upvotes.users.splice(upvoteIndex, 1);
    comment.upvotes.count = Math.max(0, comment.upvotes.count - 1);
    
    await comment.save();
    
    res.status(200).json({ 
      _id: comment._id,
      upvotes: comment.upvotes.count,
      userHasUpvoted: false
    });
  } catch (error) {
    console.error('Error removing upvote:', error);
    res.status(500).json({ message: error.message });
  }
};