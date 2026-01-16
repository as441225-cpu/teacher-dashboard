const express = require("express");
const app = express();

// 👇 CSS / STATIC FILES
app.use(express.static(__dirname));

// 👇 ROUTES IMPORT
const subjectRoutes = require("./routes/subjectRoutes");

// 👇 ROUTES USE
app.use("/subjects", subjectRoutes);

// 👇 HOME CHECK
app.get("/", (req, res) => {
  res.send("Server running OK");
});

// 👇 START SERVER
app.listen(5000, () => {
  console.log("Server 5000 port pe chal gaya");
});
