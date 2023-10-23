require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");
const secret = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const app = express();

app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

async function connect() {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
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
  },
  preference: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

connect();

app.get("/", (req, res) => {
  const successFlash = req.flash("success", "Successfully Registered!");
  const token = req.cookies.token;
  console.log(token);
  res.render("index", { successFlash, token });
});

app.get("/register", (req, res) => {
  const errorFlash = req.flash("error");
  const token = req.cookies.token;
  res.render("register", { errorFlash, token });
});

app.get("/login", async (req, res) => {
  const errorFlash = req.flash("error");
  const token = req.cookies.token;
  console.log(token);
  res.render("login", { errorFlash, token });
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (!user) {
    req.flash("error", "Our server puppies couldn't find you! Try again.");
    return res.redirect("/login");
  } else {
    const token = jwt.sign({ userId: user._id }, secret, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

    try {
      return res.redirect(302, `/user_profile?userId=${user._id}`);
    } catch (err) {
      req.flash("error", "Something happened. Our server puppies are on it!");
      return res.redirect(302, "/login");
    }
  }
});

app.get("/user_profile", (req, res) => {
  const errorFlash = req.flash("error");
  const successFlash = req.flash("success");
  const token = req.cookies.token;
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      res.redirect(302, "/register");
    } else {
      const user = User.findById(decoded.userId).exec()
      .then(user => {
        res.render("user_profile", { user, errorFlash, successFlash, token });
      });
    }
  });
});

app.post("/register", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    req.flash("error", "Our server puppies found someone with that email!");
    return res.redirect("/register");
  } else {
    const newUser = new User({
      email: req.body.email.trim(),
      password: req.body.password.trim(),
      preference: req.body.preference,
    });

    const token = jwt.sign({ userId: newUser._id }, secret, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });

    try {
      await newUser.save();
      req.flash("success", "User registration successful!");
      return res.redirect(302, "/user_profile");
    } catch (err) {
      console.log(err);
      req.flash("error", "Something happened. Our server puppies are on it!");
      return res.redirect(302, "/register");
    }
  }
});

app.get("/logout", (req, res) => {
  const token = req.cookies.token;
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("token");
      res.redirect(302, "/login");
    }
  });
});

app.post("/user_profile/edit", (req, res) => {
  const token = req.cookies.token;
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      const errorFlash = req.flash("error", "Session expired. Please login.");
      return res.redirect(302, "/login");
    } else {
      const updatedData = {
        email: req.body.email,
        password: req.body.password,
        preference: req.body.preference,
      }
      User.findOneAndUpdate({_id: decoded.userId}, updatedData).exec()
      .then(user => {
        console.log(user);
        const successFlash = req.flash("success", "Successfully updated!");
        return res.redirect(302, "/user_profile");
      })
      .catch(error => {
        console.log(error);
      });
    }
  });
});

app.get("/user_profile/delete", (req, res) => {
  const token = req.cookies.token;
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      const errorFlash = req.flash("error", "Session expired. Please login.");
      return res.redirect(302, "/login");
    } else {
      User.findOneAndDelete({_id: decoded.userId}).exec()
      .then(deletedUser => {
        console.log(deletedUser);
      })
      .catch(error => {
        console.log(error);
      });
      const successFlash = req.flash("success", "Successfully deleted!");
      return res.redirect(302, "/login");
    }
  });
})

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server listening on PORT ${process.env.PORT}.`);
});
