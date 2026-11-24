const authenticateToken = require('./middleware/authMiddleware');

require('dotenv').config();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const express = require('express');

const app = express();

const PORT = 5005;

app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        message: 'Coffee Ninja API is running!'
    });
});

const pool = require('./db');


app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({
            message: 'Email and password are required'
        });
    }

    try {
        // Find staff account
        const result = await pool.query(
            'SELECT id, name, email, password_hash FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // Verify password
        const isMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send response
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


app.post('/api/inquiries', authenticateToken, async (req, res) => {
    const { customer_name, contact, subject, description } = req.body;

    // Validate required fields
    if (!customer_name || !contact || !subject || !description) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO inquiries
            (customer_name, contact, subject, description, created_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                customer_name,
                contact,
                subject,
                description,
                req.user.id
            ]
        );

        res.status(201).json({
            message: 'Inquiry created successfully',
            inquiry: result.rows[0]
        });

    } catch (error) {
        console.error('Database error:', error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


app.get('/api/inquiries', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM inquiries ORDER BY created_at DESC'
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Database error:', error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


app.get('/api/inquiries/:id', authenticateToken, async (req, res) => {
    const id  = req.params.id;
    
    try {
        const result = await pool.query(
            'SELECT * FROM inquiries WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Inquiry not found'
            });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


app.patch('/api/inquiries/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['New', 'In Progress', 'Resolved'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            message: 'Invalid status'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE inquiries
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Inquiry not found'
            });
        }

        res.status(200).json({
            message: 'Inquiry status updated successfully',
            inquiry: result.rows[0]
        });

    } catch (error) {
        console.error('Database error:', error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

