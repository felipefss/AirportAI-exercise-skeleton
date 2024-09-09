const Product = require('../models/Product');

// TODO: consider when the product is created via a passenger reporting a lost item.
async function createProduct(payload) {
  const product = new Product(payload);
  return await product.save();
}

async function getProducts() {
  return await Product.find();
}

module.exports = {
  createProduct,
  getProducts,
};
