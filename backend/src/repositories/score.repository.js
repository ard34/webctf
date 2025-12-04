const database = require('../config/database');

const getUserScore = async (user_id) => {
  const uid = Number(user_id);
  if (!Number.isFinite(uid) || uid <= 0) {
    return null;
  }

  try {
    const [rows] = await database.execute(
      `SELECT 
        u.id,
        u.username,
        COUNT(DISTINCT s.challenge_id) as solved_challenges,
        COALESCE(SUM(c.points), 0) as total_points,
        MAX(s.submitted_at) as last_solve_time
      FROM users u
      LEFT JOIN submissions s ON u.id = s.user_id AND s.is_correct = 1
      LEFT JOIN challenges c ON s.challenge_id = c.id
      WHERE u.id = ?
      GROUP BY u.id, u.username`,
      [uid]
    );
    if (!rows[0]) {
      const [userRows] = await database.execute(
        `SELECT u.id, u.username FROM users u WHERE u.id = ?`,
        [uid]
      );
      if (userRows[0]) {
        return {
          id: userRows[0].id,
          username: userRows[0].username,
          solved_challenges: 0,
          total_points: 0,
          last_solve_time: null,
        };
      }
      return null;
    }
    return rows[0] || null;
  } catch (err) {
    throw new Error(`getUserScore failed: ${err.message}`);
  }
};

const getScoreboard = async (limit = 100) => {
  let safeLimit = Number(limit);
  if (!Number.isFinite(safeLimit) || safeLimit <= 0) {
    safeLimit = 100;
  }
  safeLimit = Math.min(Math.floor(safeLimit), 1000);

  const sql = `
    SELECT 
      u.id,
      u.username,
      COUNT(DISTINCT s.challenge_id) as solved_challenges,
      COALESCE(SUM(c.points), 0) as total_points,
      MAX(s.submitted_at) as last_solve_time
    FROM users u
    LEFT JOIN submissions s ON u.id = s.user_id AND s.is_correct = 1
    LEFT JOIN challenges c ON s.challenge_id = c.id
    GROUP BY u.id, u.username
    ORDER BY total_points DESC, last_solve_time ASC
    LIMIT ${safeLimit}
  `;
  try {
    const [rows] = await database.query(sql);
    return rows;
  } catch (err) {
    throw new Error(`getScoreboard failed: ${err.message}`);
  }
};

const getUserRank = async (user_id) => {
  const uid = Number(user_id);
  if (!Number.isFinite(uid) || uid <= 0) {
    return null;
  }

  try {
    const [userPointRows] = await database.execute(
      `SELECT COALESCE(SUM(c.points), 0) AS user_points
       FROM users u
       LEFT JOIN submissions s ON u.id = s.user_id AND s.is_correct = 1
       LEFT JOIN challenges c ON s.challenge_id = c.id
       WHERE u.id = ?`,
      [uid]
    );
    const userPoints = userPointRows?.[0]?.user_points ?? 0;

    const [rankCountRows] = await database.execute(
      `SELECT COUNT(*) AS higher_count
       FROM (
         SELECT u2.id, COALESCE(SUM(c2.points), 0) AS points
         FROM users u2
         LEFT JOIN submissions s2 ON u2.id = s2.user_id AND s2.is_correct = 1
         LEFT JOIN challenges c2 ON s2.challenge_id = c2.id
         GROUP BY u2.id
       ) AS P
       WHERE P.points > ?`,
      [userPoints]
    );
    const rank = Number(rankCountRows?.[0]?.higher_count ?? 0) + 1;

    const [userInfoRows] = await database.execute(
      `SELECT 
         u.id,
         u.username,
         COALESCE((SELECT COUNT(DISTINCT s3.challenge_id) FROM submissions s3 WHERE s3.user_id = u.id AND s3.is_correct = 1), 0) AS solved_challenges,
         ? AS total_points,
         (SELECT MAX(s4.submitted_at) FROM submissions s4 WHERE s4.user_id = u.id AND s4.is_correct = 1) AS last_solve_time
       FROM users u
       WHERE u.id = ?`,
      [userPoints, uid]
    );

    if (!userInfoRows[0]) {
      return null;
    }

    return {
      ...userInfoRows[0],
      rank,
    };
  } catch (err) {
    throw new Error(`getUserRank failed: ${err.message}`);
  }
};

module.exports = {
  getUserScore,
  getScoreboard,
  getUserRank,
};

