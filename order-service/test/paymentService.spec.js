require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sinon = require('sinon');
const { processPayment } = require('../services/paymentService');

describe('Payment Service Tests', () => {
  let stripeMock;

  beforeEach(() => {
    stripeMock = sinon.stub(stripe.paymentIntents, 'create');
  });

  afterEach(() => {
    stripeMock.restore();
  });

  it('should process a payment successfully', async () => {
    const req = {
      body: {
        amount: 5000, // Amount in cents
        paymentMethodId: 'pm_valid',
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    // Mock Stripe's payment intent creation
    stripeMock.resolves({
      id: 'pi_1',
      amount: req.body.amount,
      status: 'succeeded',
    });

    await processPayment(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(
      res.json.calledWith({
        id: 'pi_1',
        amount: req.body.amount,
        status: 'succeeded',
      })
    ).to.be.true;
  });

  // Add more tests for payment failures...
});
