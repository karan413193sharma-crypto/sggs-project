const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

/* -------------------- MongoDB -------------------- */
mongoose
  .connect("mongodb://localhost:27017/myAppDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* -------------------- Uploads Folder (GLOBAL) -------------------- */
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

/* -------------------- Schemas -------------------- */
const adminSchema = new mongoose.Schema({
  name: String,
  phone: Number,
  email: { type: String, unique: true },
  program: String,
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  fullName: String,
  dob: Date,
  gender: String,
  category: String,
  fatherName: String,
  motherName: String,
  previousSchool: String,
  course: String,
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const newsSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});

/* -------------------- Models -------------------- */
const Admin = mongoose.model("Admin", adminSchema);
const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);
const News = mongoose.model("News", newsSchema);

/* -------------------- Auth Middleware -------------------- */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    req.admin = jwt.verify(token, "SECRET_KEY");
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
};

/* -------------------- Multer -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Only images allowed"))
});

/* -------------------- Auth -------------------- */
const adminCredentials = { UserId: "karan", password: "12345678" };

app.post("/login", (req, res) => {
  const { UserId, password } = req.body;

  if (
    UserId === adminCredentials.UserId &&
    password === adminCredentials.password
  ) {
    const token = jwt.sign({ role: "admin" }, "SECRET_KEY", { expiresIn: "1h" });
    return res.json({ token });
  }
  res.status(401).json({ message: "Invalid credentials" });
});

/* -------------------- CRUD -------------------- */
app.post("/admins", async (req, res) => {
  await Admin.create(req.body);
  res.json({ message: "Admin saved" });
});

app.post("/users", async (req, res) => {
  await User.create(req.body);
  res.json({ message: "User saved" });
});

app.post("/messages", async (req, res) => {
  await Message.create(req.body);
  res.json({ message: "Message saved" });
});

app.get("/admins", authMiddleware, async (req, res) => {
  res.json(await Admin.find().sort({ createdAt: -1 }));
});

app.get("/users", authMiddleware, async (req, res) => {
  res.json(await User.find().sort({ createdAt: -1 }));
});

app.get("/messages", authMiddleware, async (req, res) => {
  res.json(await Message.find().sort({ createdAt: -1 }));
});

/* -------------------- Month Filter -------------------- */
const monthFilter = model => async (req, res) => {
  const { year, month } = req.params;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const data = await model.find({
    createdAt: { $gte: start, $lt: end }
  });

  res.json(data);
};

app.get("/admins/:year/:month", authMiddleware, monthFilter(Admin));
app.get("/users/:year/:month", authMiddleware, monthFilter(User));
app.get("/messages/:year/:month", authMiddleware, monthFilter(Message));

/* -------------------- News Upload -------------------- */
app.post(
  "/news",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Image required" });

    const news = await News.create({
      title: req.body.title,
      description: req.body.description,
      image: `/uploads/${req.file.filename}`
    });

    res.status(201).json(news);
  }
);

// PUBLIC: latest 5 news
app.get("/news", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 }).limit(5);
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

// PUBLIC: single news by ID
app.get("/news/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

// PROTECTED: delete news (admin only)
app.delete("/news/:id", authMiddleware, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    if (news.image) {
      const imgPath = path.join(uploadDir, path.basename(news.image));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "News deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});


/* -------------------- Server -------------------- */
const PORT = 4005;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
