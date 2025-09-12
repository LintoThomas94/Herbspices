module.exports = (err, req, res, next) => {
  console.error("Error:", err.stack || err.message);
  res.status(500).render("pageError");
};
