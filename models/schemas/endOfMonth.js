const mongoose = require("mongoose");

const RightOfUseAssetMonthEndSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contract",
    required: true,
  },
  costValue: {
    type: Number,
    required: true,
  },
  accumulatedDepreciation: {
    type: Number,
    required: true,
  },
  remainingMonths: {
    type: Number,
    required: true,
  },
  monthDepreciation: {
    type: Number,
    required: true,
  },
  monthEnd: {
    type: Date,
    required: true,
  },
});

const LiabilityMonthEndSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contract",
    required: true,
  },
  installmentValue: {
    type: Number,
    required: true,
  },
  installmentDate: {
    type: Date,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  presentValueAdjustment: {
    type: Number,
    required: true,
  },
  monthEnd: {
    type: Date,
    required: true,
  },
});

module.exports = { RightOfUseAssetMonthEndSchema, LiabilityMonthEndSchema };
