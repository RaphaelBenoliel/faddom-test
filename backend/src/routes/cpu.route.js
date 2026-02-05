const express = require('express');
const { getCpu } = require('../controllers/cpu.controller');

const router = express.Router();

router.post('/cpu', getCpu);

module.exports = router;
