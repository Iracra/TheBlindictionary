const express = require("express");
const app = express();
const path = require("path"); // Import the 'path' module
const https = require("https");
const fs = require("fs");


const session = require("express-session");
// Serve static files (including CSS and JavaScript)
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "your-secret-key", // Replace with your own secret key
    resave: false,
    saveUninitialized: true
  })
);
app.set("view engine", "ejs");

// Add a custom route for serving JavaScript files with the correct MIME type
app.get("/views/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "script.js"), {
    headers: {
      "Content-Type": "application/javascript"
    }
  });
});

/* app.post("/apply-settings", (req, res) => {
  const { contrastOption } = req.body;
  req.session.contrastOption = contrastOption; // Store the contrast option in the session
  res.redirect("/"); // Redirect back to the main page
}); */

// Add a custom route for serving CSS files with the correct MIME type
app.get("/views/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "style.css"), {
    headers: {
      "Content-Type": "text/css"
    }
  });
});

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/settings", (req, res) => {
  res.render("settings");
});

const port = process.env.PORT || 3000; // Define the port

/* const sslServer = https.createServer({
key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
}, app)
; */

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/* sslServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); */