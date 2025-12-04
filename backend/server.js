require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import controllers
const authController = require('./src/controllers/auth.controller');
const userController = require('./src/controllers/user.controller');
const challengeController = require('./src/controllers/challenge.controller');
const submissionController = require('./src/controllers/submission.controller');
const scoreboardController = require('./src/controllers/scoreboard.controller');

// Import middlewares
const { authenticate } = require('./src/middlewares/auth.middleware');
const { authorize } = require('./src/middlewares/role.middleware');
const { errorHandler } = require('./src/middlewares/error.middleware');

// Import config
const env = require('./src/config/env');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint - API Information
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CTF Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (Protected)',
      },
      challenges: {
        list: 'GET /api/challenges',
        detail: 'GET /api/challenges/:id',
        create: 'POST /api/challenges (Protected)',
      },
      submissions: {
        submit: 'POST /api/submissions (Protected)',
        my: 'GET /api/submissions/my (Protected)',
      },
      scoreboard: {
        list: 'GET /api/scoreboard',
        my: 'GET /api/scoreboard/me (Protected)',
      },
    },
    documentation: 'See README.md or TESTING.md for full API documentation',
  });
});

// API Root endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'CTF Platform API',
    version: '1.0.0',
    baseUrl: '/api',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/change-password',
      },
      challenges: {
        list: 'GET /api/challenges',
        detail: 'GET /api/challenges/:id',
        create: 'POST /api/challenges',
        update: 'PUT /api/challenges/:id',
        delete: 'DELETE /api/challenges/:id',
      },
      submissions: {
        submit: 'POST /api/submissions',
        my: 'GET /api/submissions/my',
        all: 'GET /api/submissions (Admin Only)',
      },
      scoreboard: {
        list: 'GET /api/scoreboard',
        my: 'GET /api/scoreboard/me',
        user: 'GET /api/scoreboard/:id',
      },
      users: {
        list: 'GET /api/users (Admin Only)',
        detail: 'GET /api/users/:id (Admin Only)',
        update: 'PUT /api/users/:id (Admin Only)',
        delete: 'DELETE /api/users/:id (Admin Only)',
      },
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CTF Platform API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Auth Routes (Public)
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// Auth Routes (Protected)
app.get('/api/auth/profile', authenticate, authController.getProfile);
app.put('/api/auth/profile', authenticate, authController.updateProfile);
app.put('/api/auth/change-password', authenticate, authController.changePassword);

// User Routes (Admin only)
app.get('/api/users', authenticate, authorize('admin'), userController.getAllUsers);
app.get('/api/users/:id', authenticate, authorize('admin'), userController.getUserById);
app.put('/api/users/:id', authenticate, authorize('admin'), userController.updateUser);
app.delete('/api/users/:id', authenticate, authorize('admin'), userController.deleteUser);

// Challenge Routes (Public - but flag hidden for non-admin)
app.get('/api/challenges', challengeController.getAllChallenges);
app.get('/api/challenges/:id', challengeController.getChallengeById);

// Challenge Routes (Protected - Create/Update/Delete)
app.post('/api/challenges', authenticate, challengeController.createChallenge);
app.put('/api/challenges/:id', authenticate, challengeController.updateChallenge);
app.delete('/api/challenges/:id', authenticate, challengeController.deleteChallenge);

// Submission Routes (Protected)
app.post('/api/submissions', authenticate, submissionController.submitFlag);
app.get('/api/submissions/my', authenticate, submissionController.getMySubmissions);
app.get('/api/submissions', authenticate, authorize('admin'), submissionController.getAllSubmissions);

// Scoreboard Routes
app.get('/api/scoreboard', scoreboardController.getScoreboard);
app.get('/api/scoreboard/me', authenticate, scoreboardController.getMyScore);
app.get('/api/scoreboard/:id', scoreboardController.getUserScore);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start server
const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 CTF Platform API Server running on port ${PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Root: http://localhost:${PORT}/api`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use!`);
    console.log(`\n💡 Solutions:`);
    console.log(`   1. Run: npm run kill-port`);
    console.log(`   2. Or change PORT in .env file`);
    console.log(`   3. Or manually kill the process using:`);
    console.log(`      Windows: netstat -ano | findstr :${PORT}`);
    console.log(`      Then: taskkill /PID <PID> /F`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

module.exports = app;

