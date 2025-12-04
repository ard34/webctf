const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challenge.controller');
const { auth, isAdmin } = require('../middlewares/auth.middleware');

// Admin create challenge
router.post('/', auth, isAdmin, challengeController.createChallenge);

// Admin update challenge
router.put('/:id', auth, isAdmin, challengeController.updateChallenge);

// Admin delete challenge
router.delete('/:id', auth, isAdmin, challengeController.deleteChallenge);

module.exports = router;const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challenge.controller');
const { auth, isAdmin } = require('../middlewares/auth.middleware');

// Create challenge (Admin)
router.post('/', auth, isAdmin, challengeController.createChallenge);

// Update challenge (Admin)
router.put('/:id', auth, isAdmin, challengeController.updateChallenge);

// Delete challenge (Admin)
router.delete('/:id', auth, isAdmin, challengeController.deleteChallenge);

module.exports = router;