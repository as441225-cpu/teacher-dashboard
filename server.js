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

  <!-- ✅ EXTERNAL CSS -->
  <link rel="stylesheet" href="/css/style.css" />
</head>

<body>

  <!-- NAVBAR -->
  <div class="navbar">
    <div class="logo">📘 Coachpedia</div>
    <div class="nav-links">
      <a href="/subjects/student/physical">Student</a>
      <a href="/subjects">Teacher</a>
      <a href="#">Login</a>
    </div>
  </div>

  <!-- HERO SECTION -->
  <div class="hero">
    <div class="hero-text">
      <h1>One Stop Solution for Teachers & Students</h1>
      <p>
        Plan lectures, manage topics, attach questions and track progress —
        all in one simple and powerful dashboard.
      </p>
      <a href="/subjects">Open Dashboard</a>
    </div>

    <div class="hero-box">
      Smart Teaching 📊
    </div>
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
