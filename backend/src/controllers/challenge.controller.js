const challengeRepository = require('../repositories/challenge.repository');
const { successResponse, errorResponse } = require('../utils/response');

const getAllChallenges = async (req, res, next) => {
  try {
    const { category, difficulty, search, page, limit } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (difficulty) filters.difficulty = difficulty;
    if (search) filters.search = search;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    filters.limit = limitNum;
    filters.offset = (pageNum - 1) * limitNum;

    const challenges = await challengeRepository.getAll(filters);
    const total = await challengeRepository.count();
    const totalPages = Math.ceil(total / limitNum);

    // Remove flag from response for non-admin users
    const sanitizedChallenges = challenges.map(challenge => {
      const { flag, ...challengeData } = challenge;
      if (req.user && req.user.role === 'admin') {
        return challenge;
      }
      return challengeData;
    });

    return successResponse(res, 200, 'Challenges retrieved successfully', {
      challenges: sanitizedChallenges,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getChallengeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const challenge = await challengeRepository.findById(id);

    if (!challenge) {
      return errorResponse(res, 404, 'Challenge not found');
    }

    // Remove flag from response for non-admin users
    if (req.user && req.user.role !== 'admin') {
      const { flag, ...challengeData } = challenge;
      return successResponse(res, 200, 'Challenge retrieved successfully', {
        challenge: challengeData,
      });
    }

    return successResponse(res, 200, 'Challenge retrieved successfully', { challenge });
  } catch (error) {
    next(error);
  }
};

const createChallenge = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, points, flag } = req.body;

    // Validation
    if (!title || !description || !category || !difficulty || !points || !flag) {
      return errorResponse(res, 400, 'All fields are required');
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return errorResponse(res, 400, 'Difficulty must be: easy, medium, or hard');
    }

    if (points < 0 || !Number.isInteger(points)) {
      return errorResponse(res, 400, 'Points must be a positive integer');
    }

    const challengeId = await challengeRepository.create({
      title,
      description,
      category,
      difficulty,
      points,
      flag,
      author_id: req.userId,
    });

    const challenge = await challengeRepository.findById(challengeId);

    return successResponse(res, 201, 'Challenge created successfully', { challenge });
  } catch (error) {
    next(error);
  }
};

const updateChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, difficulty, points, flag } = req.body;

    const challenge = await challengeRepository.findById(id);
    if (!challenge) {
      return errorResponse(res, 404, 'Challenge not found');
    }

    // Only author or admin can update
    if (challenge.author_id !== req.userId && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You can only update your own challenges');
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (difficulty) {
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return errorResponse(res, 400, 'Difficulty must be: easy, medium, or hard');
      }
      updateData.difficulty = difficulty;
    }
    if (points !== undefined) {
      if (points < 0 || !Number.isInteger(points)) {
        return errorResponse(res, 400, 'Points must be a positive integer');
      }
      updateData.points = points;
    }
    if (flag) updateData.flag = flag;

    const updatedChallenge = await challengeRepository.update(id, updateData);

    return successResponse(res, 200, 'Challenge updated successfully', {
      challenge: updatedChallenge,
    });
  } catch (error) {
    next(error);
  }
};

const deleteChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;

    const challenge = await challengeRepository.findById(id);
    if (!challenge) {
      return errorResponse(res, 404, 'Challenge not found');
    }

    // Only author or admin can delete
    if (challenge.author_id !== req.userId && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'You can only delete your own challenges');
    }

    await challengeRepository.remove(id);

    return successResponse(res, 200, 'Challenge deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
};
