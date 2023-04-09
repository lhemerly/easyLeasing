const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({
  installment_number: { type: Number, required: true },
  due_date: { type: Date, required: true },
  installment_amount: { type: Number, required: true },
  present_value_adjustment: { type: Number, required: true },
});

const monthlyDataSchema = new mongoose.Schema({
  month: { type: Date, required: true },
  term_remaining: { type: Number, required: true },
  interest_rate: { type: Number, required: true },
  installments: [installmentSchema],
  depreciation_expense: { type: Number, required: true },
  interest_expense: { type: Number, required: true },
  right_of_use_asset_value: { type: Number, required: true },
});

const contractSchema = new mongoose.Schema({
  contract_number: { type: String },
  asset_name: { type: String, required: true },
  asset_description: { type: String, required: true },
  term: { type: Number},
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  interest_rate: { type: Number, required: true },
  supplier: { type: String, required: true },
  installments: [installmentSchema],
  monthly_data: [monthlyDataSchema],
  right_of_use_asset_value: { type: Number },
  accumulated_depreciation: { type: Number }
});

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;