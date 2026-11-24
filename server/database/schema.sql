
-- Coffee Ninja Customer Inquiry Management System
-- Database schema

-- 1. Staff users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customer inquiries table
CREATE TABLE inquiries (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    contact VARCHAR(30) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'New',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_inquiry_status
        CHECK (status IN ('New', 'In Progress', 'Resolved')),

    CONSTRAINT inquiries_created_by_fkey
        FOREIGN KEY (created_by)
        REFERENCES users(id)
);
