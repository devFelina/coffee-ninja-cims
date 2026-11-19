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
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email FROM users'
        );

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Database error:', error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
});

app.post('/api/inquiries', async (req, res) => {
    const { customer_name, contact, subject, description } = req.body;
    if (!customer_name || !contact || !subject || !description) {
        return res.status(400).json({
            message: 'All fields are required'
        });
    }
    try {
        const result = await pool.query(
            'INSERT INTO inquiries (customer_name, contact, subject, description, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [customer_name, contact, subject, description, 1]
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

app.get('/api/inquiries', async (req, res) =>{
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


app.get('/api/inquiries/:id', async (req, res)=>{
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

