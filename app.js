require('dotenv').config();

const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.render("index");
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const preference = req.body.preference;

    console.log(email, password, preference);

    res.redirect('/');
})

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server listening on PORT ${process.env.PORT}.`);
});