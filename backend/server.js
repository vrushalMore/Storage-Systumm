const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

const UPLOADS_FOLDER = path.join(__dirname, "uploads");
const PENDRIVE_PATH = "D:\\";

if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_FOLDER);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = path.join(UPLOADS_FOLDER, req.file.filename);
    const pendriveFilePath = path.join(PENDRIVE_PATH, req.file.filename);

    fs.copyFile(filePath, pendriveFilePath, (err) => {
        if (err) {
            console.error("File copy error:", err);
            return res.status(500).json({ message: "File uploaded but failed to copy to pendrive." });
        }

        console.log(`File successfully uploaded to: ${pendriveFilePath}`);
        res.json({ message: "File uploaded successfully to both uploads and pendrive!" });
    });
});

app.get("/files", (req, res) => {
    fs.readdir(UPLOADS_FOLDER, (err, files) => {
        if (err) {
            return res.status(500).json({ message: "Failed to read uploads folder." });
        }
        res.json(files);
    });
});

app.use("/uploads", express.static(UPLOADS_FOLDER));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
   