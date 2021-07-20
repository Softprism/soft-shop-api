const express = require('express');
const router = express.Router();

router.get('/', testServer);
module.exports = router;

function testServer(req, res) {
  res.json('server is online and active')
  // this is just here to verify if the server is online
  //doesn't require JWT
}
