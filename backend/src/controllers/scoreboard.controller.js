const scoreRepository = require('../repositories/score.repository');
const { successResponse, errorResponse } = require('../utils/response');

const getScoreboard = async (req, res, next) => {
  try {
    let limit = Number(req.query.limit);
    if (!Number.isFinite(limit) || limit <= 0) {
      limit = 100;
    }
    limit = Math.min(Math.floor(limit), 1000);

    const scoreboard = await scoreRepository.getScoreboard(limit);

    const scoreboardWithRank = scoreboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return successResponse(res, 200, 'Scoreboard retrieved successfully', {
      scoreboard: scoreboardWithRank,
    });
  } catch (error) {
    next(error);
  }
};

const getMyScore = async (req, res, next) => {
  try {
    if (req.userId === undefined || req.userId === null) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    const uid = Number(req.userId);
    if (!Number.isFinite(uid) || uid <= 0) {
      return errorResponse(res, 400, 'Invalid user id');
    }

    const score = await scoreRepository.getUserScore(uid);

    // Jika user ada tapi belum punya submission, score akan tetap ada (fallback 0) dari repository
    if (!score) {
      return errorResponse(res, 404, 'User not found');
    }

    const rank = await scoreRepository.getUserRank(uid);

    return successResponse(res, 200, 'Score retrieved successfully', {
      score: {
        ...score,
        rank: rank?.rank ?? null,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to retrieve my score', {
      detail: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
};

const getUserScore = async (req, res, next) => {
  try {
    const uid = Number(req.params.id);
    if (!Number.isFinite(uid) || uid <= 0) {
      return errorResponse(res, 400, 'Invalid user id');
    }

    const score = await scoreRepository.getUserScore(uid);
    if (!score) {
      return errorResponse(res, 404, 'User not found');
    }

    const rank = await scoreRepository.getUserRank(uid);

    return successResponse(res, 200, 'User score retrieved successfully', {
      score: {
        ...score,
        rank: rank?.rank ?? null,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to retrieve user score', {
      detail: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
};

module.exports = {
  getScoreboard,
  getMyScore,
  getUserScore,
};

