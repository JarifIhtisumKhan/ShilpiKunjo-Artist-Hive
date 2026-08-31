-- ShilpiKunjo (Artist Hive) - CSE370 MariaDB DDL Schema

CREATE DATABASE IF NOT EXISTS shilpikunjo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shilpikunjo;

-- 1. Core Users & Specialization
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Admins (
    admin_id INT PRIMARY KEY,
    FOREIGN KEY (admin_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Artists (
    artist_id INT PRIMARY KEY,
    bio TEXT,
    portfolio_links TEXT,
    availability_status VARCHAR(20) DEFAULT 'Available',
    FOREIGN KEY (artist_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ArtistExpertise (
    artist_id INT,
    expertise VARCHAR(100) NOT NULL,
    PRIMARY KEY (artist_id, expertise),
    FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Artworks & Feed Interactions
CREATE TABLE IF NOT EXISTS Artworks (
    art_id INT AUTO_INCREMENT PRIMARY KEY,
    artist_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Digital, Hand-drawn, Animation
    description TEXT,
    media_url TEXT NOT NULL,
    react_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ArtworkComments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    art_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (art_id) REFERENCES Artworks(art_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Art Challenges & Submissions
CREATE TABLE IF NOT EXISTS Challenges (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    deadline DATE NOT NULL,
    banner_url TEXT,
    participation_limit INT,
    status VARCHAR(20) DEFAULT 'Active',
    FOREIGN KEY (creator_id) REFERENCES Users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ChallengeSubmissions (
    submission_id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT NOT NULL,
    art_id INT NOT NULL,
    artist_id INT NOT NULL,
    vote_count INT DEFAULT 0,
    rank INT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_challenge_submission UNIQUE (challenge_id, art_id),
    FOREIGN KEY (challenge_id) REFERENCES Challenges(challenge_id) ON DELETE CASCADE,
    FOREIGN KEY (art_id) REFERENCES Artworks(art_id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Courses & Learning Platform
CREATE TABLE IF NOT EXISTS Courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    instructor_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL, -- Beginner, Intermediate, Advanced
    pricing DECIMAL(10, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS CourseContent (
    content_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_url TEXT NOT NULL,
    sequence_order INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS CourseEnrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    completion_status VARCHAR(20) DEFAULT 'In Progress',
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_enrollment UNIQUE (course_id, user_id),
    FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Freelance Commissions & Task Tracking
CREATE TABLE IF NOT EXISTS Commissions (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    artist_id INT,
    requirements TEXT NOT NULL,
    description TEXT,
    price_offered DECIMAL(10, 2) NOT NULL,
    deadline DATE NOT NULL,
    current_status VARCHAR(30) DEFAULT 'Requested', -- Requested, Accepted, In Progress, Review, Completed, Rejected
    media_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Users(user_id),
    FOREIGN KEY (artist_id) REFERENCES Artists(artist_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

