require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const flash = require('express-flash');
const secret = process.env.SECRET_KEY;
const mongoose = require("mongoose");
const axios = require('axios');
const app = express();

app.use(session({
    secret,
    resave: false,
    saveUninitialized: true,
}));

app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

async function connect() {
    try {
        await mongoose.connect(
            `${process.env.MONGODB_URL}`,
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
    },
});

const User = mongoose.model("User", userSchema);

connect();

app.get("/", (req, res) => {
    const successFlash = req.flash('success', 'Successfully Registered!');
    res.render("index", {successFlash});
});

app.get("/register", (req, res) => {
    const errorFlash = req.flash('error');
    res.render("register", {errorFlash});
});

app.post("/register", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
        req.flash('error', 'Our server puppies found someone with that email!');
        return res.redirect("/register");
    } else {
        const newUser = new User({
            email: req.body.email,
            password: req.body.password,
            preference: req.body.preference,
        });
        await newUser.save();
        req.flash('success', 'User registration successful.');
        return res.redirect("/");
    }
});

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server listening on PORT ${process.env.PORT}.`);
});
