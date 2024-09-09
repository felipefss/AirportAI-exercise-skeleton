/**
 * App routes definitions.
 */
'use strict';

let express = require('express');
let router = express.Router();
const authRoutes = require('./auth');

const { verifyToken } = require('../middlewares/auth');

router.use('/auth', authRoutes);

// The following routes are protected by the verifyToken middleware
router.use(verifyToken);

router.get('*', function (req, res) {
  return res.sendStatus(404);
});

module.exports = router;
