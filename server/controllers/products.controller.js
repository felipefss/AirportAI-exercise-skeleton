const { z } = require('zod');

const Product = require('../models/Product');
const ReportedLost = require('../models/ReportedLost');
const { parseKeywords, matchProductDescription } = require('../middlewares/ai');

async function insertProductInDatabase(payload) {
  const { item, brand, model, color, description } = payload;

  const product = new Product({
    ...payload,
    item: item.toLowerCase(),
    brand: brand?.toLowerCase(),
    model: model?.toLowerCase(),
    color: color?.toLowerCase(),
    description,
  });
  return await product.save();
}

// TODO: consider when the product is created via a passenger reporting a lost item.
async function createProduct(req, res) {
  const productSchema = z.object({
    item: z.string(),
    brand: z.string().optional(),
    model: z.string().optional(),
    color: z.string().optional(),
    description: z.string().refine((value) => value.length > 0, {
      message: 'Description must be provided',
    }),
  });

  const parsedPayload = productSchema.safeParse(req.body);

  if (!parsedPayload.success) {
    return res.status(400).send(parsedPayload.error.flatten().fieldErrors);
  }

  // Create the product in the database.
  const createdProduct = await insertProductInDatabase(parsedPayload.data);
  console.info('Product created:', createdProduct);
  return res.sendStatus(201);
}

async function getProducts(_, res) {
  const products = await Product.find().populate('reportedItem');

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
      email: z.string().email(),
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

  const { keywords, email, lostTime } = parsedPayload.data;

  // TODO: make concurrent promises to save reported lost and find a matching product
  const reportedLost = new ReportedLost({
    keywords,
    reportedBy: email,
    lostTime,
  });
  await reportedLost.save();

  const { item, brand, model, color, description } = await parseKeywords(keywords.join(','));

  // TODO: search the item by only the populated fields
  const matchingProducts = await Product.find({
    item: item.toLowerCase(),
    $or: [{ brand: brand?.toLowerCase() }, { model: model?.toLowerCase() }, { color: color?.toLowerCase() }],
  });

  if (matchingProducts.length > 1) {
    // Multiple matches, try to refine the search by description.
    const matchingProductIndex = await matchProductDescription(
      description,
      matchingProducts.map((product) => product.description)
    );

    if (matchingProductIndex !== -1) {
      // If a match is found, update the product with the reported item.
      const product = matchingProducts[matchingProductIndex];
      product.reportedItem = reportedLost._id;
      await product.save();

      return res.sendStatus(201);
    }
  }

  if (matchingProducts.length === 1) {
    // Single match, update the product with the reported item.
    const [product] = matchingProducts;
    product.reportedItem = reportedLost._id;
    await product.save();

    return res.sendStatus(201);
  }

  // No matches, create a new product.
  await insertProductInDatabase({ item, brand, model, color, description, reportedItem: reportedLost._id });

  return res.sendStatus(201);
}

module.exports = {
  createProduct,
  getProducts,
  deleteProduct,
  reportLostProduct,
};
