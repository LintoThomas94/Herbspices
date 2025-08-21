const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const db = require("./config/db");
const userRouter = require("./routes/userRouter");

// Connect to DB
db();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set("view engine", "ejs");
app.set("views", [
    path.join(__dirname, "views/user"),
    path.join(__dirname, "views/admin"),
    path.join(__dirname, "views/shared"),
]);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", userRouter);
app.use((req, res) => {
res.status(404).render('pageError');
});

app.use((err,req,res,next)=>{
        console.error(' Error:', err.stack || err.message);

       res.status(404).render('pageError');

})

// Start server
app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
});

module.exports = app;
