const express = require("express");
const app = express();
const path = require("path");

// =======================
// STATIC FILES (CSS / images etc.)
// =======================
app.use(express.static(path.join(__dirname, "public")));

// =======================
// ROUTES
// =======================
const subjectRoutes = require("./routes/subjectRoutes");
app.use("/subjects", subjectRoutes);

// =======================
// HOME / LANDING PAGE
// =======================
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Coachpedia – One Stop Solution</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #eef2ff, #f8fafc);
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .box {
      background: white;
      padding: 45px;
      border-radius: 14px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.12);
      max-width: 420px;
    }
    h1 {
      margin-bottom: 10px;
      color: #1e293b;
      font-size: 32px;
    }
    p {
      color: #475569;
      margin-bottom: 28px;
      font-size: 16px;
    }
    a {
      text-decoration: none;
      background: #4f46e5;
      color: white;
      padding: 14px 26px;
      border-radius: 8px;
      font-weight: bold;
      display: inline-block;
      transition: 0.2s ease;
    }
    a:hover {
      background: #4338ca;
      transform: translateY(-2px);
    }
  </style>
</head>

<body>
  <div class="box">
    <h1>📘 Coachpedia</h1>
    <p>One Stop Solution for Teachers & Students</p>
    <a href="/subjects">Open Dashboard</a>
  </div>
</body>
</html>
  `);
});

// =======================
// SERVER START (RENDER SAFE)
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
