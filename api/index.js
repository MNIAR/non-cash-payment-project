const express = require('express');
const router = express.Router();
router.use("/user", require("./user"));
router.use("/shopping", require("./shopping"));

module.exports = router;