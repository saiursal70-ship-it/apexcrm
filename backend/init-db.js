const db = require('./config/db');

async function fixDatabase() {
  try {
    console.log('⏳ Updating users table structure...');

    // Drop old incomplete table if it exists
    await db.query(`DROP TABLE IF EXISTS users;`);

    // Create complete users table matching your register form
    const createUsersTableSQL = `
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255),
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profile_image VARCHAR(500),
        avatar VARCHAR(500),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db.query(createUsersTableSQL);
    console.log('✅ "users" table updated with all required fields!');

  } catch (err) {
    console.error('❌ Error updating database:', err.message);
  } finally {
    process.exit();
  }
}

fixDatabase();