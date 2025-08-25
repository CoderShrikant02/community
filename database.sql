-- Create database
CREATE DATABASE mavs;

-- Use database
USE mavs;

-- Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    family_share VARCHAR(100),
    name VARCHAR(100) NOT NULL,
    address TEXT,
    email VARCHAR(100),
    mobile_no VARCHAR(15),
    service_address TEXT,
    current_city VARCHAR(100),
    current_state VARCHAR(100),
    current_address TEXT,
    age INT,
    swa_gotra VARCHAR(100),
    mame_gotra VARCHAR(100),
    home_town_address TEXT,
    qualification VARCHAR(100),
    specialization VARCHAR(150),
    other_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

