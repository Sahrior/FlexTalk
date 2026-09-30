const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");

const {
    sendMessage,
    getPatientMessages,
    getGuardianMessages,
    getEmergencyMessages,
    getNormalMessages
} = require("../controllers/messageController");

const router = express.Router();


// Patient sends a message
router.post(
    "/",
    authenticateToken,
    sendMessage
);


// Patient gets own message history
router.get(
    "/patient",
    authenticateToken,
    getPatientMessages
);


// Guardian gets all messages from connected patients
router.get(
    "/guardian",
    authenticateToken,
    getGuardianMessages
);


// Guardian gets emergency messages
router.get(
    "/guardian/emergency",
    authenticateToken,
    getEmergencyMessages
);


// Guardian gets normal messages
router.get(
    "/guardian/normal",
    authenticateToken,
    getNormalMessages
);


module.exports = router;