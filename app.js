require('dotenv').config();

const express = require("express");

const app = express();

app.get('/', (req, res) => {
    res.send("Everything is working!");
});

app.listen(process.env.PORT || 8000, () => {
    console.log(`Server listening on PORT ${process.env.PORT}.`);
});