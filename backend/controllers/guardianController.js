const pool = require("../config/db");


// PATIENT → SEND GUARDIAN REQUEST
const sendGuardianRequest = async (req, res) => {
    try {
        const patientId = req.user.user_id;
        const { guardianEmail } = req.body;

        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can send guardian requests"
            });
        }

        if (!guardianEmail) {
            return res.status(400).json({
                success: false,
                message: "Guardian email is required"
            });
        }

        const [guardians] = await pool.execute(
            `SELECT user_id, name, email, role
             FROM users
             WHERE email = ? AND role = 'guardian'`,
            [guardianEmail]
        );

        if (guardians.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Guardian account not found"
            });
        }

        const guardian = guardians[0];

        if (guardian.user_id === patientId) {
            return res.status(400).json({
                success: false,
                message: "You cannot add yourself"
            });
        }

        const [existingLink] = await pool.execute(
            `SELECT *
             FROM patient_guardians
             WHERE patient_id = ?
             AND guardian_id = ?`,
            [
                patientId,
                guardian.user_id
            ]
        );

        if (existingLink.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This guardian is already connected"
            });
        }

        const [existingRequest] = await pool.execute(
            `SELECT request_id
             FROM guardian_requests
             WHERE patient_id = ?
             AND guardian_id = ?
             AND status = 'pending'`,
            [
                patientId,
                guardian.user_id
            ]
        );

        if (existingRequest.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Guardian request is already pending"
            });
        }

        await pool.execute(
            `INSERT INTO guardian_requests
            (patient_id, guardian_id, status)
            VALUES (?, ?, 'pending')`,
            [
                patientId,
                guardian.user_id
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Guardian request sent successfully"
        });

    } catch (error) {
        console.error("SEND GUARDIAN REQUEST ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// GUARDIAN → SEE REQUESTS
const getGuardianRequests = async (req, res) => {
    try {
        const guardianId = req.user.user_id;

        if (req.user.role !== "guardian") {
            return res.status(403).json({
                success: false,
                message: "Only guardians can view guardian requests"
            });
        }

        const [requests] = await pool.execute(
            `SELECT
                gr.request_id,
                gr.status,
                gr.created_at,
                u.user_id AS patient_id,
                u.name AS patient_name,
                u.email AS patient_email
             FROM guardian_requests gr
             JOIN users u
                ON gr.patient_id = u.user_id
             WHERE gr.guardian_id = ?
             ORDER BY gr.created_at DESC`,
            [guardianId]
        );

        return res.json({
            success: true,
            requests
        });

    } catch (error) {
        console.error("GET GUARDIAN REQUESTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// GUARDIAN → ACCEPT REQUEST
const acceptGuardianRequest = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const guardianId = req.user.user_id;
        const requestId = req.params.requestId;

        if (req.user.role !== "guardian") {
            return res.status(403).json({
                success: false,
                message: "Only guardians can accept requests"
            });
        }

        await connection.beginTransaction();

        const [requests] = await connection.execute(
            `SELECT
                request_id,
                patient_id,
                guardian_id,
                status
             FROM guardian_requests
             WHERE request_id = ?
             AND guardian_id = ?
             FOR UPDATE`,
            [
                requestId,
                guardianId
            ]
        );

        if (requests.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Guardian request not found"
            });
        }

        const request = requests[0];

        if (request.status !== "pending") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "This request has already been processed"
            });
        }

        await connection.execute(
            `UPDATE guardian_requests
             SET status = 'accepted'
             WHERE request_id = ?`,
            [requestId]
        );

        await connection.execute(
            `INSERT INTO patient_guardians
            (patient_id, guardian_id)
            VALUES (?, ?)`,
            [
                request.patient_id,
                guardianId
            ]
        );

        await connection.commit();

        return res.json({
            success: true,
            message: "Guardian request accepted"
        });

    } catch (error) {
        await connection.rollback();

        console.error("ACCEPT GUARDIAN REQUEST ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });

    } finally {
        connection.release();
    }
};


// GUARDIAN → REJECT REQUEST
const rejectGuardianRequest = async (req, res) => {
    try {
        const guardianId = req.user.user_id;
        const requestId = req.params.requestId;

        if (req.user.role !== "guardian") {
            return res.status(403).json({
                success: false,
                message: "Only guardians can reject requests"
            });
        }

        const [result] = await pool.execute(
            `UPDATE guardian_requests
             SET status = 'rejected'
             WHERE request_id = ?
             AND guardian_id = ?
             AND status = 'pending'`,
            [
                requestId,
                guardianId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Pending request not found"
            });
        }

        return res.json({
            success: true,
            message: "Guardian request rejected"
        });

    } catch (error) {
        console.error("REJECT GUARDIAN REQUEST ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// PATIENT → SEE GUARDIANS
const getMyGuardians = async (req, res) => {
    try {
        const patientId = req.user.user_id;

        if (req.user.role !== "patient") {
            return res.status(403).json({
                success: false,
                message: "Only patients can access this endpoint"
            });
        }

        const [guardians] = await pool.execute(
            `SELECT
                u.user_id,
                u.name,
                u.email
             FROM patient_guardians pg
             JOIN users u
                ON pg.guardian_id = u.user_id
             WHERE pg.patient_id = ?`,
            [patientId]
        );

        return res.json({
            success: true,
            guardians
        });

    } catch (error) {
        console.error("GET MY GUARDIANS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// GUARDIAN → SEE PATIENTS
const getMyPatients = async (req, res) => {
    try {
        const guardianId = req.user.user_id;

        if (req.user.role !== "guardian") {
            return res.status(403).json({
                success: false,
                message: "Only guardians can access this endpoint"
            });
        }

        const [patients] = await pool.execute(
            `SELECT
                u.user_id,
                u.name,
                u.email
             FROM patient_guardians pg
             JOIN users u
                ON pg.patient_id = u.user_id
             WHERE pg.guardian_id = ?`,
            [guardianId]
        );

        return res.json({
            success: true,
            patients
        });

    } catch (error) {
        console.error("GET MY PATIENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    sendGuardianRequest,
    getGuardianRequests,
    acceptGuardianRequest,
    rejectGuardianRequest,
    getMyGuardians,
    getMyPatients
};