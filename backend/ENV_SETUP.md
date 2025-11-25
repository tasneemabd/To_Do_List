# Backend Environment Setup

Create a `.env` file in the `backend` directory with the following content:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=mongodb://localhost:27017/todo-list?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Setup Instructions

1. Copy the content above into a new file named `.env` in the `backend` directory
2. Replace `JWT_SECRET` with a strong secret key (at least 32 characters)
3. Update `DATABASE_URL` if your MongoDB is hosted elsewhere (e.g., MongoDB Atlas)
4. Adjust `CORS_ORIGIN` if your frontend runs on a different port

## MongoDB Atlas Setup

If using MongoDB Atlas, your DATABASE_URL will look like:
```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/todo-list?retryWrites=true&w=majority
```

Replace `username`, `password`, and `cluster` with your actual MongoDB Atlas credentials.

