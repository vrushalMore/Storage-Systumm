const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

// Define your pendrive path (Make sure this is correct)
const PENDRIVE_PATH = "D:\\";

// Ensure uploads folder exists
const UPLOADS_FOLDER = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_FOLDER);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

// Allow CORS for frontend requests
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    // Move file to pendrive
    const filePath = path.join(UPLOADS_FOLDER, req.file.filename);
    const pendriveFilePath = path.join(PENDRIVE_PATH, req.file.filename);

    // Copy file instead of rename (rename fails due to permissions)
    fs.copyFile(filePath, pendriveFilePath, (err) => {
        if (err) {
            return res.status(500).json({ message: "Failed to copy file to pendrive." });
        }

        // Delete the original file after copying
        fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
                return res.status(500).json({ message: "File copied but failed to delete from uploads." });
            }
            res.json({ message: "File uploaded successfully to pendrive!" });
        });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
