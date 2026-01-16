const express = require("express");
const router = express.Router();
const fs = require("fs");

/* ===== DATA FILES ===== */
const TOPIC_FILE = "./topics.json";
const QUESTION_FILE = "./questions.json";

/* ===== MEMORY ===== */
let topics = {};
let questions = {};

/* ===== LOAD DATA ===== */
if (fs.existsSync(TOPIC_FILE)) {
  topics = JSON.parse(fs.readFileSync(TOPIC_FILE));
}
if (fs.existsSync(QUESTION_FILE)) {
  questions = JSON.parse(fs.readFileSync(QUESTION_FILE));
}

/* ===== SAVE FUNCTIONS ===== */
function saveTopics() {
  fs.writeFileSync(TOPIC_FILE, JSON.stringify(topics, null, 2));
}
function saveQuestions() {
  fs.writeFileSync(QUESTION_FILE, JSON.stringify(questions, null, 2));
}

/* ===== DASHBOARD ===== */
router.get("/", (req, res) => {
  res.send(`
    <h2>CHEMISTRY DASHBOARD</h2>

    <h3>Teacher View</h3>
    <a href="/subjects/physical">Physical</a> |
    <a href="/subjects/organic">Organic</a> |
    <a href="/subjects/inorganic">Inorganic</a>

    <hr>

    <h3>Student View</h3>
    <a href="/subjects/student/physical">Physical (Student)</a> |
    <a href="/subjects/student/organic">Organic (Student)</a> |
    <a href="/subjects/student/inorganic">Inorganic (Student)</a>
  `);
});

/* ===== TEACHER TOPIC PAGE ===== */
function topicPage(res, subject, totalDays) {
  let html = `<h2>${subject.toUpperCase()} – Daily Topics (Teacher)</h2>`;

  for (let day = 1; day <= totalDays; day++) {
    const key = subject + "_" + day;
    const dayTopics = topics[key] || [];

    html += `<b>Day ${day}</b><ul>`;

    dayTopics.forEach((t, i) => {
      if (!t || !t.text) return;
      html += `
        <li>
          ${t.done ? "✅" : "❌"} ${t.text}
          <a href="/subjects/${subject}/toggle?day=${day}&index=${i}">[Toggle]</a>
          <a href="/subjects/${subject}/questions?day=${day}&index=${i}">[Questions]</a>
          <a href="/subjects/${subject}/edit?day=${day}&index=${i}">✏️</a>
          <a href="/subjects/${subject}/delete?day=${day}&index=${i}">❌</a>
        </li>
      `;
    });

    html += `</ul>
      <form method="GET" action="/subjects/${subject}/add">
        <input type="hidden" name="day" value="${day}">
        <input type="text" name="topic" placeholder="Add topic" required>
        <button>Add Topic</button>
      </form>
      <hr>
    `;
  }

  html += `<a href="/subjects">⬅ Back</a>`;
  res.send(html);
}

/* ===== SUBJECT ROUTES ===== */
router.get("/physical", (req, res) => topicPage(res, "physical", 120));
router.get("/organic", (req, res) => topicPage(res, "organic", 150));
router.get("/inorganic", (req, res) => topicPage(res, "inorganic", 95));

/* ===== ADD TOPIC ===== */
router.get("/:subject/add", (req, res) => {
  const { subject } = req.params;
  const { day, topic } = req.query;
  const key = subject + "_" + day;

  if (!topics[key]) topics[key] = [];
  topics[key].push({ text: topic, done: false });
  saveTopics();

  res.redirect("/subjects/" + subject);
});

/* ===== DELETE TOPIC ===== */
router.get("/:subject/delete", (req, res) => {
  const { subject } = req.params;
  const { day, index } = req.query;
  const key = subject + "_" + day;

  if (topics[key]) topics[key].splice(index, 1);
  saveTopics();

  res.redirect("/subjects/" + subject);
});

/* ===== EDIT TOPIC ===== */
router.get("/:subject/edit", (req, res) => {
  const { subject } = req.params;
  const { day, index } = req.query;
  const key = subject + "_" + day;
  const old = topics[key][index];

  res.send(`
    <h3>Edit Topic</h3>
    <form method="GET" action="/subjects/${subject}/update">
      <input type="hidden" name="day" value="${day}">
      <input type="hidden" name="index" value="${index}">
      <input type="text" name="topic" value="${old.text}" required>
      <button>Update</button>
    </form>
    <a href="/subjects/${subject}">Cancel</a>
  `);
});

/* ===== UPDATE TOPIC ===== */
router.get("/:subject/update", (req, res) => {
  const { subject } = req.params;
  const { day, index, topic } = req.query;
  const key = subject + "_" + day;

  topics[key][index].text = topic;
  saveTopics();

  res.redirect("/subjects/" + subject);
});

/* ===== TOGGLE DONE ===== */
router.get("/:subject/toggle", (req, res) => {
  const { subject } = req.params;
  const { day, index } = req.query;
  const key = subject + "_" + day;

  topics[key][index].done = !topics[key][index].done;
  saveTopics();

  res.redirect("/subjects/" + subject);
});

/* ===== QUESTIONS PAGE (TEACHER) ===== */
router.get("/:subject/questions", (req, res) => {
  const { subject } = req.params;
  const { day, index } = req.query;
  const qKey = `${subject}_${day}_${index}`;

  if (!questions[qKey]) questions[qKey] = [];

  let html = `<h3>Questions (Day ${day})</h3><ul>`;

  questions[qKey].forEach((q, i) => {
    if (!q || !q.text) return;
    html += `
      <li>
        Q${i + 1}. ${q.text} <b>(${q.type})</b>
        <a href="/subjects/${subject}/questions/edit?day=${day}&index=${index}&qindex=${i}">✏️</a>
        <a href="/subjects/${subject}/questions/delete?day=${day}&index=${index}&qindex=${i}">❌</a>
      </li>
    `;
  });

  html += `</ul>
    <form method="GET" action="/subjects/${subject}/questions/add">
      <input type="hidden" name="day" value="${day}">
      <input type="hidden" name="index" value="${index}">
      <input type="text" name="text" placeholder="Question text" required>
      <select name="type">
        <option>Homework</option>
        <option>Class</option>
        <option>Test</option>
      </select>
      <button>Add Question</button>
    </form>
    <a href="/subjects/${subject}">⬅ Back</a>
  `;

  res.send(html);
});

/* ===== ADD QUESTION ===== */
router.get("/:subject/questions/add", (req, res) => {
  const { subject } = req.params;
  const { day, index, text, type } = req.query;
  const qKey = `${subject}_${day}_${index}`;

  if (!questions[qKey]) questions[qKey] = [];
  questions[qKey].push({ text, type });
  saveQuestions();

  res.redirect(`/subjects/${subject}/questions?day=${day}&index=${index}`);
});

/* ===== DELETE QUESTION ===== */
router.get("/:subject/questions/delete", (req, res) => {
  const { subject } = req.params;
  const { day, index, qindex } = req.query;
  const qKey = `${subject}_${day}_${index}`;

  questions[qKey].splice(qindex, 1);
  saveQuestions();

  res.redirect(`/subjects/${subject}/questions?day=${day}&index=${index}`);
});

/* ===== EDIT QUESTION ===== */
router.get("/:subject/questions/edit", (req, res) => {
  const { subject } = req.params;
  const { day, index, qindex } = req.query;
  const qKey = `${subject}_${day}_${index}`;
  const q = questions[qKey][qindex];

  res.send(`
    <h3>Edit Question</h3>
    <form method="GET" action="/subjects/${subject}/questions/update">
      <input type="hidden" name="day" value="${day}">
      <input type="hidden" name="index" value="${index}">
      <input type="hidden" name="qindex" value="${qindex}">
      <input type="text" name="text" value="${q.text}" required>
      <select name="type">
        <option ${q.type === "Homework" ? "selected" : ""}>Homework</option>
        <option ${q.type === "Class" ? "selected" : ""}>Class</option>
        <option ${q.type === "Test" ? "selected" : ""}>Test</option>
      </select>
      <button>Update</button>
    </form>
  `);
});

/* ===== UPDATE QUESTION ===== */
router.get("/:subject/questions/update", (req, res) => {
  const { subject } = req.params;
  const { day, index, qindex, text, type } = req.query;
  const qKey = `${subject}_${day}_${index}`;

  questions[qKey][qindex] = { text, type };
  saveQuestions();

  res.redirect(`/subjects/${subject}/questions?day=${day}&index=${index}`);
});

/* ===== STUDENT VIEW ===== */
router.get("/student/:subject", (req, res) => {
  const { subject } = req.params;
  const totalDays =
    subject === "physical" ? 120 :
    subject === "organic" ? 150 : 95;

  let html = `<h2>STUDENT VIEW – ${subject.toUpperCase()}</h2>`;

  for (let day = 1; day <= totalDays; day++) {
    const key = subject + "_" + day;
    const dayTopics = topics[key];
    if (!Array.isArray(dayTopics)) continue;

    let hasData = false;
    let block = `<b>Day ${day}</b><ul>`;

    dayTopics.forEach((t, i) => {
      if (!t || !t.text) return;
      hasData = true;
      block += `<li>${t.done ? "✅" : "❌"} ${t.text}</li>`;

      const qKey = `${subject}_${day}_${i}`;
      if (Array.isArray(questions[qKey])) {
        block += "<ul>";
        questions[qKey].forEach(q => {
          if (q && q.text) {
            block += `<li>• ${q.text} (${q.type})</li>`;
          }
        });
        block += "</ul>";
      }
    });

    block += "</ul><hr>";
    if (hasData) html += block;
  }

  html += `<a href="/subjects">⬅ Dashboard</a>`;
  res.send(html);
});

module.exports = router;
