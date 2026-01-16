const express = require("express");
const router = express.Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");

/* =========================
   MULTER CONFIG
   ========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/* =========================
   DATA FILES
   ========================= */
const DOUBT_FILE = path.join(__dirname, "..", "doubts.json");
let doubts = fs.existsSync(DOUBT_FILE)
  ? JSON.parse(fs.readFileSync(DOUBT_FILE))
  : [];

function saveDoubts() {
  fs.writeFileSync(DOUBT_FILE, JSON.stringify(doubts, null, 2));
}

/* =========================
   SUBJECT STRUCTURE
   ========================= */
const SUBJECT_STRUCTURE = {
  chemistry: {
    streams: ["physical", "inorganic", "organic"]
  }
};

/* ======================================================
   STUDENT DASHBOARD  (/subjects)
   ====================================================== */
router.get("/", (req, res) => {
  res.send(`
    <link rel="stylesheet" href="/css/dashboard.css">
    <h2>STUDENT DASHBOARD</h2>

    <div class="container">
      <div class="card">
        <h3>Chemistry</h3>
        <a class="btn btn-primary" href="/subjects/student/chemistry">
          Open Chemistry
        </a>
      </div>

      <div class="card">
        <h3>Student Tools</h3>
        <p><a class="btn btn-success" href="/subjects/ask-doubt">Ask Doubt</a></p>
        <p><a class="btn btn-primary" href="/subjects/student/doubts">My Doubts</a></p>
      </div>

      <div class="card">
        <h3>Teacher</h3>
        <p><a class="btn btn-secondary" href="/subjects/teacher/doubts">Teacher Panel</a></p>
      </div>
    </div>
  `);
});

/* ======================================================
   STUDENT → CHEMISTRY
   ====================================================== */
router.get("/student/chemistry", (req, res) => {
  res.send(`
    <h2>CHEMISTRY (Student)</h2>
    <ul>
      <li><a href="/subjects/student/chemistry/physical">Physical Chemistry</a></li>
      <li><a href="/subjects/student/chemistry/inorganic">Inorganic Chemistry</a></li>
      <li><a href="/subjects/student/chemistry/organic">Organic Chemistry</a></li>
    </ul>

    <hr>
    <a href="/subjects/ask-doubt">Ask Doubt</a><br>
    <a href="/subjects/student/doubts">My Doubts</a><br><br>

    <a href="/subjects">⬅ Back</a>
  `);
});

/* ======================================================
   STUDENT → STREAM VIEW (READ ONLY)
   ====================================================== */
router.get("/student/chemistry/:stream", (req, res) => {
  const stream = req.params.stream;

  if (!SUBJECT_STRUCTURE.chemistry.streams.includes(stream)) {
    return res.send("Invalid stream");
  }

  res.send(`
    <h2>${stream.toUpperCase()} CHEMISTRY</h2>
    <p>✔ Daily topics (teacher planned)</p>
    <p>✔ Homework & questions</p>
    <p>✔ Related doubts</p>

    <a href="/subjects/student/chemistry">⬅ Back</a>
  `);
});

/* ======================================================
   ASK DOUBT
   ====================================================== */
router.get("/ask-doubt", (req, res) => {
  res.send(`
    <h2>ASK DOUBT</h2>

    <form method="POST" action="/subjects/ask-doubt" enctype="multipart/form-data">
      <textarea name="doubt" required placeholder="Write your doubt"></textarea><br><br>
      <input type="file" name="image" accept="image/*"><br><br>
      <button type="submit">Submit Doubt</button>
    </form>

    <a href="/subjects">⬅ Back</a>
  `);
});

router.post("/ask-doubt", upload.single("image"), (req, res) => {
  const text = req.body.doubt.trim();

  if (doubts.find(d => d.text === text && d.status === "pending")) {
    return res.send(`
      <h3>❌ Doubt already pending</h3>
      <a href="/subjects/student/doubts">My Doubts</a>
    `);
  }

  doubts.push({
    id: Date.now(),
    text,
    image: req.file ? `uploads/${req.file.filename}` : "",
    reply: "",
    aiHint: "",
    aiAllowed: true,
    status: "pending"
  });

  saveDoubts();
  res.redirect("/subjects/student/doubts");
});

/* ======================================================
   STUDENT → MY DOUBTS
   ====================================================== */
router.get("/student/doubts", (req, res) => {
  let html = `<h2>MY DOUBTS</h2><ul>`;

  doubts.forEach(d => {
    html += `
      <li>
        <b>${d.text}</b><br>
        ${d.image ? `<img src="/${d.image}" width="200"><br>` : ""}
        <b>Status:</b> ${d.status}<br>

        ${
          d.status === "answered"
            ? `<b>Teacher Reply:</b><br>${d.reply}`
            : d.aiAllowed
              ? `<a href="/subjects/student/doubt/${d.id}/ai-hint">🤖 AI Hint</a>`
              : `<i>AI disabled</i>`
        }

        <form method="POST"
              action="/subjects/doubt/${d.id}/delete"
              onsubmit="return confirm('Delete this doubt?');">
          <button style="background:red;color:white;">Delete</button>
        </form>
      </li><hr>
    `;
  });

  html += `</ul><a href="/subjects">⬅ Back</a>`;
  res.send(html);
});

/* ======================================================
   AI HINT
   ====================================================== */
router.get("/student/doubt/:id/ai-hint", (req, res) => {
  const d = doubts.find(x => x.id == req.params.id);
  if (!d || !d.aiAllowed || d.status === "answered") {
    return res.send("AI Hint not available");
  }

  if (!d.aiHint) {
    d.aiHint = "Basics revise karo, given data identify karo, phir approach banao.";
    saveDoubts();
  }

  res.send(`
    <h3>AI Hint</h3>
    <p>${d.aiHint}</p>
    <a href="/subjects/student/doubts">⬅ Back</a>
  `);
});

/* ======================================================
   TEACHER → DOUBTS
   ====================================================== */
router.get("/teacher/doubts", (req, res) => {
  let html = `<h2>TEACHER – DOUBTS</h2><ul>`;

  doubts.forEach(d => {
    html += `
      <li>
        <b>${d.text}</b><br>
        Status: ${d.status}<br>

        <a href="/subjects/teacher/doubt/${d.id}">
          <button>Open</button>
        </a>

        <form method="POST"
              action="/subjects/doubt/${d.id}/delete"
              style="display:inline;"
              onsubmit="return confirm('Delete permanently?');">
          <button style="background:red;color:white;">Delete</button>
        </form>
      </li><hr>
    `;
  });

  html += `</ul><a href="/subjects">⬅ Back</a>`;
  res.send(html);
});

/* ======================================================
   TEACHER → REPLY
   ====================================================== */
router.get("/teacher/doubt/:id", (req, res) => {
  const d = doubts.find(x => x.id == req.params.id);
  if (!d) return res.send("Not found");

  res.send(`
    <h2>Answer Doubt</h2>
    <p>${d.text}</p>
    ${d.image ? `<img src="/${d.image}" width="300"><br>` : ""}

    <form method="POST" action="/subjects/teacher/doubt/${d.id}">
      <textarea name="reply" required></textarea><br><br>
      <button type="submit">Submit Answer</button>
    </form>

    <form method="POST" action="/subjects/teacher/doubt/${d.id}/toggle-ai">
      <button type="submit">
        ${d.aiAllowed ? "Disable AI" : "Enable AI"}
      </button>
    </form>

    <a href="/subjects/teacher/doubts">⬅ Back</a>
  `);
});

router.post("/teacher/doubt/:id", (req, res) => {
  const d = doubts.find(x => x.id == req.params.id);
  if (!d) return res.send("Not found");

  d.reply = req.body.reply;
  d.status = "answered";
  saveDoubts();
  res.redirect("/subjects/teacher/doubts");
});

router.post("/teacher/doubt/:id/toggle-ai", (req, res) => {
  const d = doubts.find(x => x.id == req.params.id);
  if (!d) return res.send("Not found");

  d.aiAllowed = !d.aiAllowed;
  saveDoubts();
  res.redirect(`/subjects/teacher/doubt/${d.id}`);
});

/* ======================================================
   DELETE DOUBT (COMMON)
   ====================================================== */
router.post("/doubt/:id/delete", (req, res) => {
  const id = Number(req.params.id);
  const index = doubts.findIndex(d => d.id === id);
  if (index === -1) return res.send("Not found");

  doubts.splice(index, 1);
  saveDoubts();
  res.redirect("back");
});

module.exports = router;
