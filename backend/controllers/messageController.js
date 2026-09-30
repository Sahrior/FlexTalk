const pool = require("../config/db");


// ========================================
// SEND MESSAGE FROM PATIENT
// ========================================
const sendMessage = async (req, res) => {
    try {
        const patientId = req.user.user_id;

        // Only patients can send glove messages
        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can send glove messages"
            });
        }

        const {
            message,
            message_type
        } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        // Automatically determine message type
        const EMERGENCY_PHRASES = ["EMERGENCY", "I NEED HELP", "CALL DOCTOR"];
        const type = message_type || (
            EMERGENCY_PHRASES.includes(message.trim().toUpperCase())
                ? "emergency"
                : "normal"
        );

        // Validate message type
        if (!["normal", "emergency"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Message type must be normal or emergency"
            });
        }

        // Check whether patient has at least one guardian
        const [guardians] = await pool.execute(
            `SELECT guardian_id
             FROM patient_guardians
             WHERE patient_id = ?`,
            [patientId]
        );

        if (guardians.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No guardian is connected to this patient"
            });
        }

        // Save message
        const [result] = await pool.execute(
            `INSERT INTO messages
            (patient_id, message_text, message_type)
            VALUES (?, ?, ?)`,
            [
                patientId,
                message,
                type
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            message_id: result.insertId
        });

    } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ========================================
// GET PATIENT'S MESSAGE HISTORY
// ========================================
const getPatientMessages = async (req, res) => {
    try {
        const patientId = req.user.user_id;

        // Only patients can access this endpoint
        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can access this endpoint"
            });
        }

        const [messages] = await pool.execute(
            `SELECT
                message_id,
                patient_id,
                message_text,
                message_type,
                created_at
             FROM messages
             WHERE patient_id = ?
             ORDER BY created_at DESC`,
            [patientId]
        );

        return res.json({
            success: true,
            messages
        });

    } catch (error) {
        console.error("PATIENT MESSAGES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ========================================
// GET GUARDIAN'S MESSAGE HISTORY
// ========================================
const getGuardianMessages = async (req, res) => {
    try {
        const guardianId = req.user.user_id;

        // Only guardians can access this endpoint
        if (req.user.role !== "guardian") {
            return res.status(403).json({
                success: false,
                message: "Only guardians can access this endpoint"
            });
        }

        /*
         * messages does not contain guardian_id.
         *
         * So we find messages through the
         * patient_guardians relationship.
         */

        const [messages] = await pool.execute(
            `SELECT
                m.message_id,
                m.patient_id,
                m.message_text,
                m.message_type,
                m.created_at,
                u.name AS patient_name,
                u.email AS patient_email
             FROM messages m
             JOIN users u
                ON m.patient_id = u.user_id
             JOIN patient_guardians pg
                ON m.patient_id = pg.patient_id
             WHERE pg.guardian_id = ?
             ORDER BY m.created_at DESC`,
            [guardianId]
        );

        return res.json({
            success: true,
            messages
        });

    } catch (error) {
        console.error("GUARDIAN MESSAGES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ========================================
// GET EMERGENCY MESSAGES FOR GUARDIAN
// ========================================
const getEmergencyMessages = async (req, res) => {
    try {
        const guardianId = req.user.user_id;

        // Only guardians can access emergency messages
        if (req.user.role !== "guardian") {
            return res.status(403).json({
                success: false,
                message: "Only guardians can access this endpoint"
            });
        }

        const [messages] = await pool.execute(
            `SELECT
                m.message_id,
                m.patient_id,
                m.message_text,
                m.message_type,
                m.created_at,
                u.name AS patient_name,
                u.email AS patient_email
             FROM messages m
             JOIN users u
                ON m.patient_id = u.user_id
             JOIN patient_guardians pg
                ON m.patient_id = pg.patient_id
             WHERE pg.guardian_id = ?
             AND m.message_type = 'emergency'
             ORDER BY m.created_at DESC`,
            [guardianId]
        );

        return res.json({
            success: true,
            messages
        });

    } catch (error) {
        console.error("EMERGENCY MESSAGES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ========================================
// GET NORMAL MESSAGES FOR GUARDIAN
// ========================================
const getNormalMessages = async (req, res) => {
    try {
        const guardianId = req.user.user_id;

        // Only guardians can access normal messages
        if (req.user.role !== "guardian") {
            return res.status(403).json({
                success: false,
                message: "Only guardians can access this endpoint"
            });
        }

        const [messages] = await pool.execute(
            `SELECT
                m.message_id,
                m.patient_id,
                m.message_text,
                m.message_type,
                m.created_at,
                u.name AS patient_name,
                u.email AS patient_email
             FROM messages m
             JOIN users u
                ON m.patient_id = u.user_id
             JOIN patient_guardians pg
                ON m.patient_id = pg.patient_id
             WHERE pg.guardian_id = ?
             AND m.message_type = 'normal'
             ORDER BY m.created_at DESC`,
            [guardianId]
        );

        return res.json({
            success: true,
            messages
        });

    } catch (error) {
        console.error("NORMAL MESSAGES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ========================================
// EXPORT CONTROLLERS
// ========================================
module.exports = {
    sendMessage,
    getPatientMessages,
    getGuardianMessages,
    getEmergencyMessages,
    getNormalMessages
};