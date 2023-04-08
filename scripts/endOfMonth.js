// import the required schemas
const Contract = require("../models/Contract");
const EndOfMonthRightOfUseAsset = require("../models/endOfMonth/RightOfUseAssetMonthEndSchema");
const EndOfMonthLiability = require("../models/endOfMonth/LiabilityMonthEndSchema");

// create an async function to calculate and save the end of month values
const calculateEndOfMonthValues = async (date) => {
  // get all contracts from the database
  const contracts = await Contract.find();

  // iterate through each contract and calculate the end of month values
  for (const contract of contracts) {
    // calculate the monthly depreciation amount
    const totalDepreciation =
      contract.rightOfUseAssetValue / contract.depreciationMonths;
    const monthlyDepreciation = Math.round(totalDepreciation * 100) / 100;

    // calculate the accumulated depreciation
    const previousMonth = new Date(date);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const endOfMonthRightOfUseAsset = await EndOfMonthRightOfUseAsset.findOne({
      contractId: contract._id,
      date: previousMonth,
    });
    const accumulatedDepreciation = endOfMonthRightOfUseAsset
      ? endOfMonthRightOfUseAsset.accumulatedDepreciation + monthlyDepreciation
      : monthlyDepreciation;

    // calculate the remaining months of the contract
    const remainingMonths =
      contract.depreciationMonths -
      (endOfMonthRightOfUseAsset
        ? endOfMonthRightOfUseAsset.remainingMonths
        : 0) -
      1;

    // create an end of month right of use asset object and save it to the database
    const endOfMonthRightOfUseAssetObj = new EndOfMonthRightOfUseAsset({
      contractId: contract._id,
      date,
      costValue: contract.rightOfUseAssetValue,
      accumulatedDepreciation,
      remainingMonths,
      monthlyDepreciation,
    });
    await endOfMonthRightOfUseAssetObj.save();

    // calculate the interest expense and present value adjustment for each installment
    const endOfMonthLiabilityInstallments = [];
    for (const installment of contract.installments) {
      const daysBetween = Math.round(
        (date.getTime() - installment.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      const interestExpense =
        Math.round(
          ((installment.amount * contract.interestRate) / 100 / 365) *
            daysBetween *
            100
        ) / 100;
      const presentValueAdjustment =
        Math.round(
          (installment.amount /
            Math.pow(
              1 + contract.interestRate / 100 / 12,
              remainingMonths + 1
            )) *
            100
        ) / 100;
      const endOfMonthLiabilityInstallmentObj = {
        contractId: contract._id,
        installmentValue: installment.amount,
        installmentDate: installment.date,
        interestRate: contract.interestRate,
        interestExpense,
        presentValueAdjustment,
      };
      endOfMonthLiabilityInstallments.push(endOfMonthLiabilityInstallmentObj);
    }

    // create an end of month liability object and save it to the database
    const endOfMonthLiabilityObj = new EndOfMonthLiability({
      date,
      installments: endOfMonthLiabilityInstallments,
    });
    await endOfMonthLiabilityObj.save();
  }
};

module.exports = calculateEndOfMonthValues;
