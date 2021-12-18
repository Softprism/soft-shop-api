const express = require("express");

const router = express.Router();

module.exports = router;

function testServer(req, res) {
  res.json({
    status: true,
    msg: "server is online"
  });
  // this is just here to verify if the server is online
  // doesn't require JWT
}
router.get("/", testServer);
