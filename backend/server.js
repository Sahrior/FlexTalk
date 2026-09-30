require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const guardianRoutes = require("./routes/guardianRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();


// MIDDLEWARE

app.use(
    cors({
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
    })
);

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// TEST ROUTE

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Sign Language Glove Backend is running"
    });
});


// API ROUTES

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/guardians",
    guardianRoutes
);

app.use(
    "/api/messages",
    messageRoutes
);


// 404

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});


// ERROR HANDLER

app.use((error, req, res, next) => {
    console.error("SERVER ERROR:", error);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});


// START SERVER

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`Sign Language Glove Backend`);
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    console.log(`=================================`);
});