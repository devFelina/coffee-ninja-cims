require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authenticateToken = require('./middleware/authMiddleware');

const app = express();
const PORT = 5005;

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173'
}));


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
    const { customer_name, contact, subject, description } = req.body || {};

    // Check that all fields are strings
    const fields = { customer_name, contact, subject, description };

    for (const [field, value] of Object.entries(fields)) {
        if (typeof value !== 'string' || value.trim() === '') {
            return res.status(400).json({
                message: `${field} is required and must be valid text`
            });
        }
    }

    // Remove unnecessary spaces
    const customerName = customer_name.trim();
    const contactMethod = contact.trim();
    const inquirySubject = subject.trim();
    const inquiryDescription = description.trim();

    // Check maximum lengths
    if (customerName.length > 100) {
        return res.status(400).json({
            message: 'Customer name cannot exceed 100 characters'
        });
    }

    if (contactMethod.length > 30) {
        return res.status(400).json({
            message: 'Contact method cannot exceed 30 characters'
        });
    }

    if (inquirySubject.length > 150) {
        return res.status(400).json({
            message: 'Subject cannot exceed 150 characters'
        });
    }

    if (inquiryDescription.length > 2000) {
        return res.status(400).json({
            message: 'Description cannot exceed 2000 characters'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO inquiries
            (customer_name, contact, subject, description, created_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                customerName,
                contactMethod,
                inquirySubject,
                inquiryDescription,
                req.user.id
            ]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/inquiries', authenticateToken, async (req, res) => {
    const { search, status } = req.query;

    const validStatuses = ['New', 'In Progress', 'Resolved'];

    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            message: 'Invalid status filter'
        });
    }

    try {
        let query = 'SELECT * FROM inquiries';
        
        // Only retrieve inquiries created by the logged-in staff member.
        const conditions = ['created_by = $1'];
        const values = [req.user.id];

        if (search) {
            values.push(`%${search.trim()}%`);

            conditions.push(
                `(customer_name ILIKE $${values.length}
                OR subject ILIKE $${values.length})`
            );
        }

        if (status) {
            values.push(status);
            conditions.push(`status = $${values.length}`);
        }

        query += ' WHERE ' + conditions.join(' AND ');
        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, values);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Database error:', error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});


app.get('/api/inquiries/:id', authenticateToken, async (req, res) => {
    const id = Number(req.params.id);

    // Validate inquiry ID
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'Invalid inquiry ID' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM inquiries WHERE id = $1 AND created_by = $2',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




app.patch('/api/inquiries/:id/status', authenticateToken, async (req, res) => {
    const { status } = req.body;
    const id = Number(req.params.id);

    const validStatuses = ['New', 'In Progress', 'Resolved'];

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: 'Invalid inquiry ID' });
    }

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const result = await pool.query(
            `UPDATE inquiries
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND created_by = $3
             RETURNING *`,
            [status, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

