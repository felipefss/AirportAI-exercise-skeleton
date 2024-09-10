let express = require('express');
let router = express.Router();

const { denyUnauthorized } = require('../middlewares/auth');
const { createProduct, getProducts, deleteProduct } = require('../controllers/products.controller');

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
