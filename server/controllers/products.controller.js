const { z } = require('zod');

const Product = require('../models/Product');
const ReportedLost = require('../models/ReportedLost');
const { parseKeywords, matchProductDescription, parseUserMessage } = require('../middlewares/ai');

const { productSchema, reportLostSchema, productIdSchema } = require('./schemas/products.schema');

async function insertProductInDatabase(payload) {
  const { type, brand, model, color } = payload;

  const product = new Product({
    ...payload,
    type: type.toLowerCase(),
    brand: brand?.toLowerCase(),
    model: model?.toLowerCase(),
    color: color?.toLowerCase(),
  });
  return await product.save();
}

async function createProduct(req, res) {
  const parsedPayload = productSchema(req.body);

  // Validate the product schema.
  if (!parsedPayload.success) {
    return res.status(400).send(parsedPayload.error.flatten().fieldErrors);
  }

  // Create the product in the database.
  const createdProduct = await insertProductInDatabase(parsedPayload.data);
  console.info('Product created:', createdProduct);
  return res.sendStatus(201);
}

async function getProducts(_, res) {
  const products = await Product.find({
    deletedAt: { $exists: false },
  }).populate('reportedItem');

  return res.send(products);
}

async function deleteProduct(req, res) {
  const parsedParams = productIdSchema(req.params);

  if (!parsedParams.success) {
    return res.status(400).send(parsedParams.error.flatten().fieldErrors);
  }

  const product = await Product.findById(parsedParams.data.id);

  if (!product) {
    return res.sendStatus(404);
  }

  product.deletedAt = new Date();
  await product.save();

  return res.sendStatus(204);
}

async function reportLostProduct(req, res) {
  const parsedPayload = reportLostSchema(req.body);

  if (!parsedPayload.success) {
    return res.status(400).send(parsedPayload.error.formErrors);
  }

  const { keywords, email, lostTime, message } = parsedPayload.data;

  const reportedLost = new ReportedLost({
    message,
    keywords,
    reportedBy: email,
    lostTime,
  });
  await reportedLost.save();

  let parsedFields;
  if (message) {
    parsedFields = await parseUserMessage(message);
  } else if (keywords) {
    parsedFields = await parseKeywords(keywords.join(','));
  }

  const nonEmptyFields = Object.entries({ ...parsedFields, description: undefined }).reduce((output, [key, value]) => {
    if (value != null) {
      output[key] = value.toLowerCase();
    }

    return output;
  }, {});

  const matchingProducts = await Product.find({ ...nonEmptyFields, deletedAt: { $exists: false } });

  if (matchingProducts.length > 1) {
    // Multiple matches, try to refine the search by description.
    const { match_index: matchingProductIndex } = await matchProductDescription(
      parsedFields.description,
      matchingProducts.map((product) => product.description)
    );

    if (matchingProductIndex !== -1) {
      // If a match is found, update the product with the reported item.
      const product = matchingProducts[matchingProductIndex];

      // If the product already has a reported item, do not update it. Instead, create a new product.
      if (!product.reportedItem) {
        product.reportedItem = reportedLost._id;
        await product.save();

        return res.sendStatus(200);
      }
    }
  }

  if (matchingProducts.length === 1) {
    // Single match, update the product with the reported item.
    const [product] = matchingProducts;
    product.reportedItem = reportedLost._id;
    await product.save();

    return res.sendStatus(200);
  }

  // No matches, create a new product.
  await insertProductInDatabase({
    ...parsedFields,
    reportedItem: reportedLost._id,
    description: parsedFields.description ?? 'reported lost by user',
  });

  return res.sendStatus(200);
}

async function removeReportedItemFromProduct(req, res) {
  const parsedParams = productIdSchema(req.params);

  if (!parsedParams.success) {
    return res.status(400).send(parsedParams.error.flatten().fieldErrors);
  }

  const productId = parsedParams.data.id;
  const product = await Product.findById(productId);

  if (!product) {
    return res.sendStatus(404);
  }

  const softDeleteReport = ReportedLost.findByIdAndUpdate(product.reportedItem, {
    deletedAt: new Date(),
  });

  product.reportedItem = undefined;
  const saveProduct = product.save();

  await Promise.all([softDeleteReport, saveProduct]);

  return res.sendStatus(204);
}

module.exports = {
  createProduct,
  getProducts,
  deleteProduct,
  reportLostProduct,
  removeReportedItemFromProduct,
};
