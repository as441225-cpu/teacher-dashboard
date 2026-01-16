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
  <link rel="stylesheet" href="/css/style.css" />
</head>

<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-row">
      <div class="left-links">
        <a href="/subjects/student/physical">Student</a>
        <a href="/subjects">Teacher</a>
        <a href="#">Login</a>
      </div>

      <div class="right-links">
        <a href="#">Latest Events</a>
      </div>
    </div>

    <div class="brand">
      <h1>COACHPEDIA</h1>
      <p>One Stop Solution for Teachers & Students</p>
    </div>
  </div>

  <!-- HERO -->
  <div class="hero">
    <div class="hero-text">
      <h2>Teach Better. Track Smarter.</h2>
      <p>
        Design full-year plans, manage daily topics, attach questions,
        and monitor progress — all from one clean dashboard.
      </p>
      <a href="/subjects">Open Dashboard</a>
    </div>

    <div class="hero-box">
      Built for Educators 🎓
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
