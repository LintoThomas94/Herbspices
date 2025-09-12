const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config();
const db = require("./config/db");
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");

// Middlewares
const sessionMiddleware = require("./middlewares/session");
const passportMiddleware = require("./middlewares/passport");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler")

// Connect DB
db();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(passportMiddleware);

// View engine
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin"),
  path.join(__dirname, "views/shared"),
]);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", userRouter);
app.use("/admin", adminRouter);

// Error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

module.exports = app;
