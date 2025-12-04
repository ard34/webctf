require('dotenv').config();
const readline = require('readline');
const database = require('../src/config/database');
const { hashPassword } = require('../src/utils/hash');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdmin = async () => {
  try {
    console.log('=== CTF Platform - Create Admin User ===\n');

    // Get admin credentials
    const username = await question('Enter admin username: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    
    if (!username || !email || !password) {
      console.error('Error: Username, email, and password are required!');
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('Error: Invalid email format!');
      process.exit(1);
    }

    // Validate password length
    if (password.length < 6) {
      console.error('Error: Password must be at least 6 characters long!');
      process.exit(1);
    }

    console.log('\nCreating admin user...');

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Check if user already exists
    const [existingUsers] = await database.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      console.error('Error: User with this username or email already exists!');
      process.exit(1);
    }

    // Insert admin user
    const [result] = await database.execute(
      `INSERT INTO users (username, email, password, role, created_at, updated_at) 
       VALUES (?, ?, ?, 'admin', NOW(), NOW())`,
      [username, email, hashedPassword]
    );

    if (result.affectedRows > 0) {
      console.log('\n✅ Admin user created successfully!');
      console.log(`   Username: ${username}`);
      console.log(`   Email: ${email}`);
      console.log(`   Role: admin`);
      console.log(`   User ID: ${result.insertId}`);
    } else {
      console.error('Error: Failed to create admin user!');
      process.exit(1);
    }

  } catch (error) {
    console.error('Error creating admin user:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('\n⚠️  Database table "users" does not exist. Please run database migrations first.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to database. Please check your database configuration.');
    }
    process.exit(1);
  } finally {
    rl.close();
    await database.end();
    process.exit(0);
  }
};

// Run the script
createAdmin();

