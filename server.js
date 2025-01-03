const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Simple user storage (replace with actual database)
const users = new Map();

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Routes
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.post("/signup", (req, res) => {
  const { username, password, email } = req.body;

  if (users.has(username)) {
    return res.status(400).send("Username already exists");
  }

  users.set(username, { password, email });
  res.redirect("/login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);

  if (user && user.password === password) {
    req.session.authenticated = true;
    req.session.username = username;
    res.redirect("/home");
  } else {
    res.redirect("/login?error=1");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/home", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/profile", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "profile.html"));
});

app.get("/about", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
