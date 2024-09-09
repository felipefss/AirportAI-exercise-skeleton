let express = require('express');
let router = express.Router();
const { z } = require('zod');

const { denyUnauthorized } = require('../middlewares/auth');
const { createProduct, getProducts } = require('../controllers/products.controller');

router.use(denyUnauthorized);

router.post('/', async (req, res) => {
  const productSchema = z.object({
    item: z.string(),
    brand: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
    description: z.string(),
  });

  const product = productSchema.safeParse(req.body);

  if (!product.success) {
    return res.status(400).send(product.error.flatten().fieldErrors);
  }

  // Create the product in the database.
  try {
    const createdProduct = await createProduct(product.data);
    console.info('Product created:', createdProduct);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }

  return res.sendStatus(201);
});

router.get('/', async (req, res) => {
  try {
    const products = await getProducts();
    return res.send(products);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
});

module.exports = router;
