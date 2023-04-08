const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  rightOfUseAssetValue: {
    type: Number,
    required: true,
  },
  installments: {
    type: [
      {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
      },
    ],
    required: true,
  },
  depreciationSchedule: {
    type: [
      {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
      },
    ],
    default: [],
  },
  interestRate: {
    type: Number,
    required: true,
  },
});

module.exports = ContractSchema;
