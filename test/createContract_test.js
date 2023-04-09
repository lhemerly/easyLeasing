const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const Contract = require('../models/Contract');

const { expect } = chai;
chai.use(chaiHttp);

describe('POST /contracts', () => {
  beforeEach(async () => {
    await Contract.deleteMany({});
  });

  it('should create a new contract', async () => {
    const contractData = {
      asset_name: 'Test Asset',
      asset_description: 'This is a test asset',
      supplier: 'Test Supplier',
      start_date: '2022-01-01',
      end_date: '2024-01-01',
      interest_rate: 0.003,
      amount: 100000
    };

    const res = await chai.request(app)
      .post('/contracts')
      .send(contractData);

    expect(res).to.have.status(201);
    expect(res.body.data).to.be.an('object');
    expect(res.body.data).to.have.property('asset_name', 'Test Asset');
    expect(res.body.data).to.have.property('asset_description', 'This is a test asset');
    expect(res.body.data).to.have.property('supplier', 'Test Supplier');
    expect(res.body.data).to.have.property('start_date', '2022-01-01T00:00:00.000Z');
    expect(res.body.data).to.have.property('end_date', '2024-01-01T00:00:00.000Z');
    expect(res.body.data).to.have.property('term', 24);
    expect(res.body.data).to.have.property('interest_rate', 0.003);
    expect(res.body.data).to.have.property('installments').that.is.an('array').with.lengthOf(24);
    expect(res.body.data).to.have.property('right_of_use_asset_value', 2315349.35);
    expect(res.body.data).to.have.property('accumulated_depreciation', 0);

    const createdContract = await Contract.findOne({ asset_name: 'Test Asset' });
    expect(createdContract).to.be.an('object');
    expect(res.body.data).to.have.property('asset_name', 'Test Asset');
    expect(res.body.data).to.have.property('asset_description', 'This is a test asset');
    expect(res.body.data).to.have.property('supplier', 'Test Supplier');
    expect(res.body.data).to.have.property('start_date', '2022-01-01T00:00:00.000Z');
    expect(res.body.data).to.have.property('end_date', '2024-01-01T00:00:00.000Z');
    expect(res.body.data).to.have.property('term', 24);
    expect(res.body.data).to.have.property('interest_rate', 0.003);
    expect(res.body.data).to.have.property('installments').that.is.an('array').with.lengthOf(24);
    expect(res.body.data).to.have.property('right_of_use_asset_value', 2315349.35);
    expect(res.body.data).to.have.property('accumulated_depreciation', 0);
  });
});



 
