const database = require('../config/database');

const create = async (tokenData) => {
  const { user_id, token, expires_at } = tokenData;
  const [result] = await database.execute(
    `INSERT INTO tokens (user_id, token, expires_at, created_at) 
     VALUES (?, ?, ?, NOW())`,
    [user_id, token, expires_at]
  );
  return result.insertId;
};

const findByToken = async (token) => {
  const [rows] = await database.execute(
    'SELECT * FROM tokens WHERE token = ? AND expires_at > NOW()',
    [token]
  );
  return rows[0] || null;
};

const remove = async (token) => {
  await database.execute('DELETE FROM tokens WHERE token = ?', [token]);
  return true;
};

const removeByUserId = async (user_id) => {
  await database.execute('DELETE FROM tokens WHERE user_id = ?', [user_id]);
  return true;
};

const removeExpired = async () => {
  await database.execute('DELETE FROM tokens WHERE expires_at < NOW()');
  return true;
};

module.exports = {
  create,
  findByToken,
  remove,
  removeByUserId,
  removeExpired,
};

