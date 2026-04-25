const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// MongoDB connect
mongoose.connect("mongodb+srv://simar:simar032003@cluster0.5frdiyd.mongodb.net/followupDB?appName=Cluster0")
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.log(err));
  
// ===== USER MODEL =====
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String
});

const User = mongoose.model("User", userSchema);

// Admin
(async () => {
  const existing = await User.findOne({ username: "CloudTech" });

  if (!existing) {
    const hashed = await bcrypt.hash("032003", 10);

    await User.create({
      username: "CloudTech",
      password: hashed,
      role: "admin"
    });

    console.log("✅ Admin user created");
  }
})();
// ===== LEAD MODEL =====
const leadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  company: String,
  status: String,
  nextFollowUp: Date,
  notes: String,
  user: String,
}, 
{ timestamps: true });

const Lead = mongoose.model("Lead", leadSchema);

// ===== ROUTES =====

// Add Lead
app.post("/add-lead", async (req, res) => {
  const lead = new Lead(req.body);
  await lead.save();
  res.json({ message: "Saved" });
});

// Get Leads
app.get("/leads", async (req, res) => {
  const username = req.headers.username;

  const leads = await Lead.find({ user: username });

  res.json(leads);
  console.log("USERNAME:", req.headers.username);
});

// Register
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username,
    password: hashedPassword,
    role
  });

  res.json({ message: "User created" });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.json({ success: false });

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    res.json({ success: true, role: user.role,username: user.username});
  } else {
    res.json({ success: false });
  }
});

// Today followups
app.get("/today-followups", async (req, res) => {
  const username = req.headers.username;

  const today = new Date().toISOString().split("T")[0];

  const leads = await Lead.find({
    user: username,
    nextFollowUp: {
      $gte: new Date(today),
      $lte: new Date(today)
    }
  });

  res.json(leads);
});

// Update Lead
app.put("/update-lead/:id", async (req, res) => {
  await Lead.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Updated" });
});

// Delete Lead
app.delete("/delete-lead/:id", async (req, res) => {
  await Lead.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

