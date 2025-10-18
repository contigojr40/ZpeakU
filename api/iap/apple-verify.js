const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const body = fs.readFileSync(path.join(process.cwd(), "apple-merchant.txt"), "utf8");
  res.setHeader("Content-Type", "text/plain");
  res.status(200).send(body);
};