
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function createStaff() {
    try {
        const name = 'Admin';
        const email = 'admin@coffeeninja.com';
        const password = 'Admin@12345';

        // Generate a secure password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert staff account into PostgreSQL
        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO NOTHING
             RETURNING id, name, email`,
            [name, email, hashedPassword]
        );

        if (result.rows.length === 0) {
            console.log('Staff account already exists.');
        } else {
            console.log('Staff account created:', result.rows[0]);
        }

    } catch (error) {
        console.error('Error creating staff:', error);
    } finally {
        await pool.end();
    }
}

createStaff();
