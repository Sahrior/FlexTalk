CREATE DATABASE IF NOT EXISTS sign_language_glove;

USE sign_language_glove;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'guardian') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guardian_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    guardian_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (guardian_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    UNIQUE (patient_id, guardian_id)
);

CREATE TABLE patient_guardians (
    relationship_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    guardian_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (guardian_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    UNIQUE (patient_id, guardian_id)
);

CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    message_text VARCHAR(255) NOT NULL,
    message_type ENUM('normal', 'emergency') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);