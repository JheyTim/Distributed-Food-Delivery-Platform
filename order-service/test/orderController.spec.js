require('dotenv').config();
const {
  placeOrder,
  getOrderById,
} = require('../controllers/orderController');
const Order = require('../models/Order');

describe('Order Controller Unit Tests', () => {

  describe('placeOrder', () => {
    it('should place an order and return it', async () => {
      const req = {
        body: {
          customer: 'customerId',
          restaurant: 'restaurantId',
          items: [{ foodItem: 'Pizza', quantity: 2, price: 1500 }],
          deliveryAddress: '1234 Main St',
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        send: sinon.stub(),
      };

      // Mock Order.prototype.save
      const saveStub = sinon.stub(Order.prototype, 'save').resolves(req.body);

      await placeOrder(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(req.body)).to.be.true;
      expect(saveStub.calledOnce).to.be.true;
    });
  });

  describe('getOrderById', () => {
    it('should return an order by ID', async () => {
      const req = { params: { id: 'orderId' } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        send: sinon.stub(),
      };

      const mockOrder = {
        _id: 'orderId',
        customer: 'customerId',
        restaurant: 'restaurantId',
        items: [{ foodItem: 'Pizza', quantity: 2, price: 1500 }],
      };

      // Mock Order.findById
      sinon.stub(Order, 'findById').resolves(mockOrder);

      await getOrderById(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith(mockOrder)).to.be.true;
    });
  });

  // More tests for updateOrderStatus and cancelOrder...
});
