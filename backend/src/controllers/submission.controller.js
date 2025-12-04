const submissionRepository = require('../repositories/submission.repository');
const challengeRepository = require('../repositories/challenge.repository');
const scoreRepository = require('../repositories/score.repository');
const { successResponse, errorResponse } = require('../utils/response');

const submitFlag = async (req, res, next) => {
  try {
    const { challenge_id, flag } = req.body;

    if (!challenge_id || !flag) {
      return errorResponse(res, 400, 'Challenge ID and flag are required');
    }

    // Get challenge
    const challenge = await challengeRepository.findById(challenge_id);
    if (!challenge) {
      return errorResponse(res, 404, 'Challenge not found');
    }

    // Check if user already solved this challenge
    const existingSolve = await submissionRepository.findCorrectByUserAndChallenge(
      req.userId,
      challenge_id
    );

    if (existingSolve) {
      return errorResponse(res, 400, 'You have already solved this challenge');
    }

    // Check if flag is correct
    const isCorrect = challenge.flag === flag;

    // Create submission
    const submissionId = await submissionRepository.create({
      user_id: req.userId,
      challenge_id,
      flag,
      is_correct: isCorrect,
    });

    if (isCorrect) {
      return successResponse(res, 200, 'Flag is correct! Challenge solved!', {
        correct: true,
        submission_id: submissionId,
        points: challenge.points,
      });
    } else {
      return successResponse(res, 200, 'Flag is incorrect', {
        correct: false,
        submission_id: submissionId,
      });
    }
  } catch (error) {
    next(error);
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const { challenge_id, page, limit } = req.query;

    const filters = {
      user_id: req.userId,
    };

    if (challenge_id) {
      filters.challenge_id = challenge_id;
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    filters.limit = limitNum;
    filters.offset = (pageNum - 1) * limitNum;

    const submissions = await submissionRepository.getAll(filters);
    const total = await submissionRepository.count(filters);
    const totalPages = Math.ceil(total / limitNum);

    return successResponse(res, 200, 'Submissions retrieved successfully', {
      submissions,
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

const getAllSubmissions = async (req, res, next) => {
  try {
    const { user_id, challenge_id, is_correct, page, limit } = req.query;

    const filters = {};

    if (user_id) filters.user_id = user_id;
    if (challenge_id) filters.challenge_id = challenge_id;
    if (is_correct !== undefined) filters.is_correct = is_correct === 'true' ? 1 : 0;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    filters.limit = limitNum;
    filters.offset = (pageNum - 1) * limitNum;

    const submissions = await submissionRepository.getAll(filters);
    const total = await submissionRepository.count(filters);
    const totalPages = Math.ceil(total / limitNum);

    return successResponse(res, 200, 'Submissions retrieved successfully', {
      submissions,
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

module.exports = {
  submitFlag,
  getMySubmissions,
  getAllSubmissions,
};

