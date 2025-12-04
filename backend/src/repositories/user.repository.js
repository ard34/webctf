const database = require('../config/database');

const findById = async (id) => {
  const [rows] = await database.execute(
    'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

const findByUsername = async (username) => {
  const [rows] = await database.execute(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
  return rows[0] || null;
};

const findByEmail = async (email) => {
  const [rows] = await database.execute(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
};

const create = async (userData) => {
  const { username, email, password, role = 'user' } = userData;
  const [result] = await database.execute(
    `INSERT INTO users (username, email, password, role, created_at, updated_at) 
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [username, email, password, role]
  );
  return result.insertId;
};

const update = async (id, userData) => {
  const { username, email } = userData;
  await database.execute(
    'UPDATE users SET username = ?, email = ?, updated_at = NOW() WHERE id = ?',
    [username, email, id]
  );
  return findById(id);
};

const updatePassword = async (id, hashedPassword) => {
  await database.execute(
    'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
    [hashedPassword, id]
  );
};

const getAll = async (limit = 50, offset = 0) => {
  const [rows] = await database.execute(
    `SELECT id, username, email, role, created_at, updated_at 
     FROM users 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
};

const count = async () => {
  const [rows] = await database.execute('SELECT COUNT(*) as total FROM users');
  return rows[0].total;
};

module.exports = {
  findById,
  findByUsername,
  findByEmail,
  create,
  update,
  updatePassword,
  getAll,
  count,
};

