/**
 * App routes definitions.
 */
'use strict';

let express = require('express');
let router = express.Router();
const authRoutes = require('./auth.route');
const productsRoutes = require('./products.route');

const { getUserRole } = require('../middlewares/auth');

router.use('/auth', authRoutes);
router.use(getUserRole);

router.use('/products', productsRoutes);

router.get('*', function (req, res) {
  return res.sendStatus(404);
});

module.exports = router;
