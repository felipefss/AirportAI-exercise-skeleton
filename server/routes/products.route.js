let express = require('express');
let router = express.Router();
const { z } = require('zod');

const { denyUnauthorized } = require('../middlewares/auth');
const { createProduct, getProducts, deleteProduct } = require('../controllers/products.controller');

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

router.delete('/:id', async (req, res) => {
  const deleteSchema = z.object({
    id: z.string(),
  });

  const data = deleteSchema.safeParse(req.params);

  if (!data.success) {
    return res.status(400).send(data.error.flatten().fieldErrors);
  }

  try {
    const deletedProduct = await deleteProduct(data.data.id);

    if (!deletedProduct) {
      return res.sendStatus(404);
    }
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }

  return res.sendStatus(204);
});

module.exports = router;
