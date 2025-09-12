

const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const passport = require("./config/passport");

require("dotenv").config();
const db = require("./config/db");
const userRouter = require("./routes/userRouter");
const adminRouter=require("./routes/adminRouter");

// Connect to DB
db();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
secret:process.env.SESSION_SECRET,
resave:false,
saveUninitialized:true,
cookie:{
    secure:false,
    httpOnly:true,
    maxAge:72*60*60*1000
}
}))

app.use(passport.initialize());
app.use(passport.session());

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
app.use('/admin',adminRouter);
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


