/**
 * App routes definitions.
 */
'use strict';

let express = require('express');
let router = express.Router();
const authRoutes = require('./auth');

router.use('/auth', authRoutes);

router.get('*', function (req, res) {
  return res.sendStatus(404);
});

module.exports = router;
