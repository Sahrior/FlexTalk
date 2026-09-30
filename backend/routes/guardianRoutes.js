const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");

const {
    sendGuardianRequest,
    getGuardianRequests,
    acceptGuardianRequest,
    rejectGuardianRequest,
    getMyGuardians,
    getMyPatients
} = require("../controllers/guardianController");

const router = express.Router();

router.post(
    "/request",
    authenticateToken,
    sendGuardianRequest
);

router.get(
    "/requests",
    authenticateToken,
    getGuardianRequests
);

router.put(
    "/requests/:requestId/accept",
    authenticateToken,
    acceptGuardianRequest
);

router.put(
    "/requests/:requestId/reject",
    authenticateToken,
    rejectGuardianRequest
);

router.get(
    "/my-guardians",
    authenticateToken,
    getMyGuardians
);

router.get(
    "/my-patients",
    authenticateToken,
    getMyPatients
);

module.exports = router;