module.exports = (err, req, res, next) => {
  console.error("Error:", err.stack || err.message);
  res.status(INTERNAL_SERVER_ERROR).render("pageError");
};
