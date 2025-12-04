// Script untuk test koneksi database
require('dotenv').config();
const database = require('./src/config/database');

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📝 Config:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'ctf_platform'}`);
    console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : '(empty)'}`);
    console.log('');

    const [rows] = await database.execute('SELECT 1 as test');
    
    console.log('✅ Database connection successful!');
    console.log('✅ Test query result:', rows);
    
    // Test if database exists and has tables
    try {
      const [dbRows] = await database.execute('SHOW TABLES');
      console.log('✅ Database tables found:', dbRows.length);
      if (dbRows.length > 0) {
        const tables = dbRows.map(r => Object.values(r)[0]);
        console.log('   Tables:', tables.join(', '));
        
        // Check required tables
        const requiredTables = ['users', 'challenges', 'submissions', 'tokens'];
        const missingTables = requiredTables.filter(t => !tables.includes(t));
        
        if (missingTables.length > 0) {
          console.log('');
          console.log('⚠️  Missing required tables:', missingTables.join(', '));
          console.log('💡 Solution: Import database.sql');
          console.log('   Run: mysql -u root -p < database.sql');
        } else {
          console.log('✅ All required tables exist!');
        }
      } else {
        console.log('');
        console.log('⚠️  No tables found in database!');
        console.log('💡 Solution: Import database.sql');
        console.log('   Run: mysql -u root -p < database.sql');
      }
    } catch (err) {
      console.log('⚠️  Could not list tables:', err.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('❌ Error:', error.message);
    console.error('');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Solution:');
      console.log('   1. Check your MySQL password in .env file');
      console.log('   2. Test login: mysql -u root -p');
      console.log('   3. Update DB_PASSWORD in backend/.env');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Solution:');
      console.log('   1. Create database: mysql -u root -p');
      console.log('   2. Run: CREATE DATABASE ctf_platform;');
      console.log('   3. Or import: mysql -u root -p < database.sql');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Solution:');
      console.log('   1. Make sure MySQL service is running');
      console.log('   2. Check XAMPP Control Panel or Services');
    }
    
    process.exit(1);
  }
}

testConnection();

