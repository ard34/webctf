const database = require('../config/database');

const create = async (submissionData) => {
  const { user_id, challenge_id, flag, is_correct } = submissionData;
  const [result] = await database.execute(
    `INSERT INTO submissions (user_id, challenge_id, flag, is_correct, submitted_at) 
     VALUES (?, ?, ?, ?, NOW())`,
    [user_id, challenge_id, flag, is_correct]
  );
  return result.insertId;
};

const findByUserAndChallenge = async (user_id, challenge_id) => {
  const [rows] = await database.execute(
    'SELECT * FROM submissions WHERE user_id = ? AND challenge_id = ? ORDER BY submitted_at DESC',
    [user_id, challenge_id]
  );
  return rows;
};

const findCorrectByUserAndChallenge = async (user_id, challenge_id) => {
  const [rows] = await database.execute(
    'SELECT * FROM submissions WHERE user_id = ? AND challenge_id = ? AND is_correct = 1 LIMIT 1',
    [user_id, challenge_id]
  );
  return rows[0] || null;
};

const getAll = async (filters = {}) => {
  let query = `SELECT s.*, u.username, c.title as challenge_title 
    FROM submissions s 
    JOIN users u ON s.user_id = u.id 
    JOIN challenges c ON s.challenge_id = c.id 
    WHERE 1=1`;
  const params = [];

  if (filters.user_id) {
    query += ' AND s.user_id = ?';
    params.push(filters.user_id);
  }

  if (filters.challenge_id) {
    query += ' AND s.challenge_id = ?';
    params.push(filters.challenge_id);
  }

  if (filters.is_correct !== undefined) {
    query += ' AND s.is_correct = ?';
    params.push(filters.is_correct);
  }

  query += ' ORDER BY s.submitted_at DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }
  }

  const [rows] = await database.execute(query, params);
  return rows;
};

const count = async (filters = {}) => {
  let query = 'SELECT COUNT(*) as total FROM submissions WHERE 1=1';
  const params = [];

  if (filters.user_id) {
    query += ' AND user_id = ?';
    params.push(filters.user_id);
  }

  if (filters.challenge_id) {
    query += ' AND challenge_id = ?';
    params.push(filters.challenge_id);
  }

  if (filters.is_correct !== undefined) {
    query += ' AND is_correct = ?';
    params.push(filters.is_correct);
  }

  const [rows] = await database.execute(query, params);
  return rows[0].total;
};

module.exports = {
  create,
  findByUserAndChallenge,
  findCorrectByUserAndChallenge,
  getAll,
  count,
};

