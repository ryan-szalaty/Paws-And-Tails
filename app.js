require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const { create } = require("domain");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function connect() {
  try {
    await mongoose.connect(
      `mongodb+srv://rszalaty:${process.env.MONGODB_PASS}@cluster0.kuzogfn.mongodb.net/`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`Connected to database.`);
  } catch (error) {
    console.log(`Error Description: ${error}`);
  }
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  preference: {
    type: String,
    required: true,
    unique: true,
  },
});

const User = mongoose.model("User", userSchema);

async function createUser(user) {
    await user.save();
}

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const preference = req.body.preference;
  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
    preference: req.body.preference,
  });
  connect();
  createUser(newUser);
  res.redirect("/");
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server listening on PORT ${process.env.PORT}.`);
});
