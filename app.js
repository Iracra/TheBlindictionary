const express = require("express");
const app = express();
const port = 3000; // You can choose any port you like
const path = require("path");
const axios = require("axios");

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));



// Add a custom route for serving JavaScript files with the correct MIME type
app.get("/views/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "script.js"), {
    headers: {
      "Content-Type": "application/javascript"
    }
  });
});


app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
