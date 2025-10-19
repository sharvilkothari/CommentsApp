# MERN Stack Comments Application

A modern, feature-rich comments application built with the MERN stack (MongoDB, Express, React, Node.js). Users can register/login, view and post comments, reply to comments in nested threads, upvote comments, and enjoy a modern UI experience.

## Project Structure

```
/
├── frontend/         # React frontend with Vite
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx          # Authentication component wrapper
│   │   │   ├── Auth.css          # Styles for authentication components
│   │   │   ├── Comment.jsx       # Comment component
│   │   │   ├── CommentForm.jsx   # Form for adding new comments
│   │   │   ├── CommentForm.css   # Styles for comment form
│   │   │   ├── CommentItem.jsx   # Individual comment item component
│   │   │   ├── CommentItem.css   # Styles for comment items
│   │   │   ├── CommentList.jsx   # Component to display list of comments
│   │   │   ├── CommentList.css   # Styles for comment list
│   │   │   ├── ImageContainer.jsx # Image display component
│   │   │   ├── ImageContainer.css # Styles for image container
│   │   │   ├── LoadingState.jsx  # Loading and error state component
│   │   │   ├── LoadingState.css  # Styles for loading states
│   │   │   ├── LoginForm.jsx     # Login form component
│   │   │   ├── RegisterForm.jsx  # Registration form component
│   │   │   ├── ReplyForm.jsx     # Form for replying to comments
│   │   │   ├── ReplyForm.css     # Styles for reply form
│   │   │   └── UserProfile.jsx   # User profile component
│   │   │   └── UserProfile.css   # Styles for user profile
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx   # Authentication context provider
│   │   ├── images/
│   │   │   └── dummy.jpg         # Sample image for the app
│   │   ├── App.jsx              # Main application component
│   │   ├── App.css              # Main application styles
│   │   ├── styles.css           # Global styles
│   │   ├── index.css            # Root styles
│   │   └── main.jsx             # Entry point
│   ├── index.html
│   └── vite.config.js
└── backend/          # Express + MongoDB backend
    ├── controllers/
    │   ├── authController.js    # Authentication logic
    │   └── commentController.js # Comment handling logic
    ├── middleware/
    │   └── authMiddleware.js    # Authentication middleware
    ├── models/
    │   ├── Comment.js           # Comment MongoDB model
    │   └── User.js              # User MongoDB model
    ├── routes/
    │   ├── authRoutes.js        # Authentication routes
    │   └── commentRoutes.js     # Comment routes
    └── server.js               # Express server setup
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=
   MONGO_URI=
   JWT_SECRET=
   ```
   Note: Adjust the MONGO_URI if you're using MongoDB Atlas or a different configuration, and use a strong random string for JWT_SECRET in production.

4. Start the backend server:
   ```
   npm run dev
   ```
   The server will start on http://localhost:5000.

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```
   Note: Adjust the VITE_API_BASE_URL to match your backend server location if different.

4. Start the Vite development server:
   ```
   npm run dev
   ```
   The application will open in your browser at http://localhost:3000.

## Features

### User Authentication
- User registration with username, email, and password
- User login with email and password
- JWT-based authentication
- Secure password handling
- Persistent login with localStorage

### Comments System
- View all comments (requires authentication)
- Post new comments (requires authentication)
- Reply to comments with nested thread structure
- Multi-level nested replies (reply to replies)
- Automatic username association with comments
- Upvote and remove upvote on comments
- Comment count tracking

### UI/UX Features
- Modern, responsive design
- Animated transitions and interactions
- User avatar representation
- Toast notifications for user actions
- Loading states with visual feedback
- Error handling with user-friendly messages
- Toggle to show/hide comments
- Featured image display for content context

## API Endpoints

### Comments API
- `GET /api/comments` - Get all comments with their replies (requires authentication)
- `POST /api/comments` - Create a new comment or reply (requires authentication)
- `GET /api/comments/:id` - Get a specific comment by ID (requires authentication)
- `GET /api/comments/:id/replies` - Get replies for a specific comment (requires authentication)
- `POST /api/comments/:id/upvote` - Upvote a comment (requires authentication)
- `DELETE /api/comments/:id/upvote` - Remove upvote from a comment (requires authentication)

### Authentication API
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile (requires authentication)

## Technologies Used

### Frontend
- React.js with hooks and context API
- Vite for fast development and bundling
- CSS for styling (component-specific CSS files)
- Axios for API requests
- JWT for authentication

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JSON Web Tokens (JWT) for authentication
- bcrypt for password hashing
- dotenv for environment variables

## Future Enhancements

- Comment editing and deletion
- User profile customization
- Rich text formatting in comments
- Image uploads in comments
- Social media sharing
- Advanced sorting and filtering options
- Real-time updates with WebSockets