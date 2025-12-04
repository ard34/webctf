const database = require('../config/database');

const findById = async (id) => {
  const [rows] = await database.execute(
    `SELECT c.*, 
     (SELECT COUNT(*) FROM submissions s WHERE s.challenge_id = c.id AND s.is_correct = 1) as solve_count
     FROM challenges c WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const getAll = async (filters = {}) => {
  let query = `SELECT c.*, 
    (SELECT COUNT(*) FROM submissions s WHERE s.challenge_id = c.id AND s.is_correct = 1) as solve_count
    FROM challenges c WHERE 1=1`;
  const params = [];

  if (filters.category) {
    query += ' AND c.category = ?';
    params.push(filters.category);
  }

  if (filters.difficulty) {
    query += ' AND c.difficulty = ?';
    params.push(filters.difficulty);
  }

  if (filters.search) {
    query += ' AND (c.title LIKE ? OR c.description LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY c.created_at DESC';

  // Handle pagination without using placeholders for LIMIT/OFFSET
  const limit = Number(filters.limit) || 0;
  const offset = Number(filters.offset) || 0;

  if (limit > 0) {
    // Safe because limit/offset berasal dari server, bukan input langsung user
    query += ` LIMIT ${limit}`;
    if (offset > 0) {
      query += ` OFFSET ${offset}`;
    }
  }

  const [rows] = await database.execute(query, params);
  return rows;
};

const create = async (challengeData) => {
  const { title, description, category, difficulty, points, flag, author_id } = challengeData;
  const [result] = await database.execute(
    `INSERT INTO challenges (title, description, category, difficulty, points, flag, author_id, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [title, description, category, difficulty, points, flag, author_id]
  );
  return result.insertId;
};

const update = async (id, challengeData) => {
  const { title, description, category, difficulty, points, flag } = challengeData;
  await database.execute(
    `UPDATE challenges 
     SET title = ?, description = ?, category = ?, difficulty = ?, points = ?, flag = ?, updated_at = NOW() 
     WHERE id = ?`,
    [title, description, category, difficulty, points, flag, id]
  );
  return findById(id);
};

const remove = async (id) => {
  await database.execute('DELETE FROM challenges WHERE id = ?', [id]);
  return true;
};

const count = async () => {
  const [rows] = await database.execute('SELECT COUNT(*) as total FROM challenges');
  return rows[0].total;
};

module.exports = {
  findById,
  getAll,
  create,
  update,
  remove,
  count,
};

