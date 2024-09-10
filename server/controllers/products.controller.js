const { z } = require('zod');

const Product = require('../models/Product');

// TODO: consider when the product is created via a passenger reporting a lost item.
async function createProduct(req, res) {
  const productSchema = z.object({
    item: z.string(),
    brand: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
    description: z.string(),
  });

  const parsedPayload = productSchema.safeParse(req.body);

  if (!parsedPayload.success) {
    return res.status(400).send(parsedPayload.error.flatten().fieldErrors);
  }

  // Create the product in the database.
  const product = new Product(parsedPayload.data);
  const createdProduct = await product.save();
  console.info('Product created:', createdProduct);
  return res.sendStatus(201);
}

async function getProducts(_, res) {
  const products = await Product.find();

  return res.send(products);
}

async function deleteProduct(req, res) {
  const deleteSchema = z.object({
    id: z.string(),
  });

  const parsedParams = deleteSchema.safeParse(req.params);

  if (!parsedParams.success) {
    return res.status(400).send(parsedParams.error.flatten().fieldErrors);
  }

  const deletedProduct = await Product.findByIdAndDelete(parsedParams.data.id);

  if (!deletedProduct) {
    return res.sendStatus(404);
  }

  return res.sendStatus(204);
}

async function reportLostProduct(req, res) {
  const reportLostSchema = z
    .object({
      message: z.string(),
      keywords: z.string().transform((value) => {
        const keywords = value.split(',');

        // Remove any whitespace from the keywords.
        return keywords.map((keyword) => keyword.trim());
      }),
      lostTime: z.string().datetime(),
    })
    .partial({
      keywords: true,
      message: true,
    })
    .refine((data) => data.message || data.keywords, {
      message: 'Either message or keywords must be provided',
    });

  const parsedPayload = reportLostSchema.safeParse(req.body);

  if (!parsedPayload.success) {
    return res.status(400).send(parsedPayload.error.formErrors);
  }

  console.log(parsedPayload.data);

  return res.sendStatus(200);
}

module.exports = {
  createProduct,
  getProducts,
  deleteProduct,
  reportLostProduct,
};
