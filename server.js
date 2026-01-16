const express = require("express");
const app = express();
const path = require("path");

/* =======================
   BODY PARSERS
   ======================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* =======================
   STATIC FILES
   ======================= */
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =======================
   ROUTES
   ======================= */
const subjectRoutes = require("./routes/subjectRoutes");
app.use("/subjects", subjectRoutes);

/* =======================
   COLOURED LANDING PAGE
   ======================= */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Coachpedia</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    .container {
      padding: 30px;
      max-width: 1100px;
      margin: auto;
    }
    h1 {
      text-align: center;
      font-size: 42px;
    }
    h2 {
      margin-top: 40px;
      border-bottom: 2px solid rgba(255,255,255,0.3);
      padding-bottom: 5px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .card {
      background: rgba(255,255,255,0.15);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      transition: transform 0.2s, background 0.2s;
    }
    .card:hover {
      transform: translateY(-5px);
      background: rgba(255,255,255,0.25);
    }
    .card a {
      text-decoration: none;
      color: white;
      font-size: 18px;
      font-weight: bold;
      display: block;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      opacity: 0.8;
      font-size: 14px;
    }
  </style>
</head>

<body>
  <div class="container">

    <h1>🎓 COACHPEDIA</h1>
    <p style="text-align:center;">One Stop Solution for Students & Teachers</p>

    <h2>👨‍🎓 Student Zone</h2>
    <div class="grid">
      <div class="card"><a href="/subjects/physical">Physical Chemistry</a></div>
      <div class="card"><a href="/subjects/organic">Organic Chemistry</a></div>
      <div class="card"><a href="/subjects/inorganic">Inorganic Chemistry</a></div>
      <div class="card"><a href="/subjects/notes/physical">Notes</a></div>
      <div class="card"><a href="/subjects/question-bank">Question Bank</a></div>
      <div class="card"><a href="/subjects/ask-doubt">Ask Doubt</a></div>
      <div class="card"><a href="/subjects/student/doubts">My Doubts</a></div>
    </div>

    <h2>🧑‍🏫 Teacher Zone</h2>
    <div class="grid">
      <div class="card"><a href="/subjects">Teacher Dashboard</a></div>
      <div class="card"><a href="/subjects/teacher/plan">Teacher Planner</a></div>
      <div class="card"><a href="/subjects/teacher/doubts">Teacher Doubts</a></div>
    </div>

    <div class="footer">
      © 2026 Coachpedia | NEET / JEE Platform
    </div>

  </div>
</body>
</html>
  `);
});

/* =======================
   SERVER START
   ======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
