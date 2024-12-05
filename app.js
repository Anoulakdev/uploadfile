const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();

// Ensure the uploads/user directory exists
const userDir = path.join(__dirname, "uploads/user");
if (!fs.existsSync(userDir)) {
  fs.mkdirSync(userDir, { recursive: true });
}

// Ensure the uploads/document directory exists
const documentDir = path.join(__dirname, "uploads/document");
if (!fs.existsSync(documentDir)) {
  fs.mkdirSync(documentDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

// Storage configuration for Users
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/user");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Storage configuration for Documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/document");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Multer instances
const uploadUser = multer({ storage: userStorage });
const uploadDocument = multer({ storage: documentStorage });

// Upload user files
app.post("/upload/user", uploadUser.single("user_image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.status(200).json({
    message: "User file uploaded successfully",
    filename: req.file.filename,
  });
});

// Upload documents
app.post(
  "/upload/document",
  uploadDocument.single("filedocument"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.status(200).json({
      message: "Document uploaded successfully",
      filename: req.file,
    });
  }
);

// GET Route for serving the file by name (user images)
app.get("/upload/user/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads/user", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// GET Route for serving the file by name (documents)
app.get("/upload/document/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads/document", req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// DELETE Route to delete a user file
app.delete("/upload/user/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads/user", req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); // Delete the file
    res.status(200).json({ message: "User file deleted successfully" });
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// DELETE Route to delete a document file
app.delete("/upload/document/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads/document", req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); // Delete the file
    res.status(200).json({ message: "Document file deleted successfully" });
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
