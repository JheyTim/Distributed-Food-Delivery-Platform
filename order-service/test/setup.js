const chai = require('chai');
const dirtyChai = require('dirty-chai');
const sinon = require('sinon');
const request = require('supertest');

chai.use(dirtyChai);

global.sinon = sinon;
global.expect = chai.expect;
global.request = request;

exports.mochaHooks = {
  beforeEach() {
    sinon.createSandbox();
  },
  afterEach() {
    sinon.restore();
  },
};
