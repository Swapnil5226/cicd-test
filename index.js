const express = require("express");
const multer = require("multer");
const mysql = require("mysql");
const path = require("path");
const fs = require("fs");
const baseUrl = "http://localhost:3000/files/";
const app = express();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null,'');
  //   },
  filename: (req, file, cb) => {
    // const fileName = `${Date.now()}-${file.originalname}`;
    const fileName = `${file.originalname}`;

    cb(null, fileName);
  },
});

const upload = multer({ storage });

// Configure MySQL database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pdf_uploader",
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: ", err);
    return;
  }
  console.log("Connected to the database!");
});

// Define API endpoints
app.post("/upload", upload.single("pdf",2), (req, res) => {
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const sql = "INSERT INTO pdfs (filename) VALUES (?)";
  connection.query(sql, [file.filename], (err, result) => {
    if (err) {
      console.error("Error storing file in database: ", err);
      res.status(500).json({ error: "Error storing file in database" });
      return;
    }

    res.status(200).json({ message: "File uploaded successfully" });
  });
});

app.get("/files", (req, res) => {
  const directoryPath = __dirname + "/Uploader/Files_uploader/uploads";
  // const filePath = path.join(__dirname, baseUrl + '/' + filename);

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files?.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });
    connection.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to retrieve videos" });
      }
    });

    res.status(200).send(fileInfos);
  });
  return;
});

app.get("/files/:name", (req, res) => {
  const fileName = req.params.name;
  const directoryPath = "/Uploader/Files_uploader/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
    connection.query(query, (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to retrieve videos" });
      }
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

