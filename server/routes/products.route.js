let express = require('express');
let router = express.Router();

const { denyUnauthorized } = require('../middlewares/auth');
const { createProduct, getProducts, deleteProduct, reportLostProduct } = require('../controllers/products.controller');

router.post('/report_lost', async (req, res) => {
  try {
    return await reportLostProduct(req, res);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

router.use(denyUnauthorized);

router.post('/', async (req, res) => {
  try {
    return await createProduct(req, res);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

router.get('/', async (req, res) => {
  try {
    return await getProducts(req, res);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    return await deleteProduct(req, res);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

module.exports = router;
