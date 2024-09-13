const expect = require('chai').expect;
const server = require('../app');
const request = require('supertest');
const sinon = require('sinon');
const Product = require('../server/models/Product');
// const mongoose = require('mongoose');

const apiRequest = request(server);

// Stubs
const product = {
  type: 'phone',
  brand: 'samsung',
  model: 'galaxy s21',
  color: 'black',
  description: 'transparent cover',
};

const createdProduct = {
  ...product,
  _id: '1',
  createdAt: new Date('2024-09-13').toISOString(),
};

sinon.stub(Product.prototype, 'save').resolves(product);

const findMock = {
  populate: sinon.stub().withArgs('reportedItem').returns([createdProduct]),
  exec: sinon.stub(),
};
sinon.stub(Product, 'find').returns(findMock);

describe('Product', function () {
  describe('Agent routes', function () {
    it('should create a new product', async function () {
      const response = await apiRequest.post('/products').send(product).set('Authorization', 'Bearer some-hash');
      expect(response.status).to.equal(201);
    });

    it('should get all products', async function () {
      const response = await apiRequest.get('/products').set('Authorization', 'Bearer some-hash');
      console.log(response.body);
      expect(response.status).to.equal(200);
      expect(response.body[0]).to.deep.equal(createdProduct);
    });
  });

  describe('Passenger routes', function () {});
});
