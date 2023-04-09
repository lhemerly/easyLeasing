const Contract = require("../models/Contract");
const {
  calculateTerm,
  generateInstallments,
  calculateRightOfUseAsset,
} = require("../helpers/calculations");

/**
 * Create a new contract
 * @param {contractData} contractData
 * @returns {Contract} contract
 */
async function createContract(contractData) {
  try {
    const contractCount = await Contract.countDocuments();
    const contractNumber = `C${contractCount + 1}`;
    contractData.contractNumber = contractNumber;

    if (!contractData.term) {
      const term = calculateTerm(
        contractData.start_date,
        contractData.end_date
      );
      contractData.term = term;
    }

    if (!contractData.installments) {
      const installments = generateInstallments(
        contractData.amount,
        contractData.start_date,
        contractData.term,
        contractData.interest_rate
      );
      contractData.installments = installments;
    }

    contractData.right_of_use_asset_value = calculateRightOfUseAsset(
      contractData.installments
    );
    contractData.accumulated_depreciation = 0;

    const contract = new Contract(contractData);
    await contract.save();
    console.log("Contract created successfully:", contract);
    return contract;
  } catch (err) {
    console.error("Error creating contract:", err);
    throw err;
  }
}

/**
 * Get all contracts
 * @returns {Array} contracts
 */
async function getAllContracts() {
  try {
    const contracts = await Contract.find();
    console.log("Contracts retrieved successfully:", contracts);
    return contracts;
  } catch (err) {
    console.error("Error getting contracts:", err);
    throw err;
  }
}

/**
 * Get a contract by ID
 * @param {number} contractId
 * @returns contract
 */
async function getContractById(contractId) {
  try {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      console.error("Contract not found");
      return null;
    }
    console.log("Contract retrieved successfully:", contract);
    return contract;
  } catch (err) {
    console.error("Error getting contract:", err);
    throw err;
  }
}

/**
 * Get contracts by criteria
 * @param {str} assetName
 * @param {str} assetDescription
 * @param {str} supplier
 * @returns
 */
async function getContractsByCriteria(assetName, assetDescription, supplier) {
  try {
    let filter = {};

    if (assetName) {
      filter.asset_name = assetName;
    }

    if (assetDescription) {
      filter.asset_description = assetDescription;
    }

    if (supplier) {
      filter.supplier = supplier;
    }

    const contracts = await Contract.find(filter);

    if (contracts.length === 0) {
      console.log("No contracts found");
      return [];
    }

    console.log("Contracts found:", contracts);
    return contracts;
  } catch (err) {
    console.error("Error getting contracts:", err);
    return getAllContracts();
  }
}

/**
 * update a contract by ID
 * @param {number} contractId
 * @param {contractData} updatedContractData
 * @returns contract|null
 */
async function updateContractById(contractId, updatedContractData) {
  try {
    const contract = await Contract.findByIdAndUpdate(
      contractId,
      updatedContractData,
      { new: true }
    );
    if (!contract) {
      console.error("Contract not found");
      return null;
    }
    console.log("Contract updated successfully:", contract);
    return contract;
  } catch (err) {
    console.error("Error updating contract:", err);
    throw err;
  }
}

/**
 * delete a contract by ID
 * @param {number} contractId
 * @returns contract|null
 */
async function deleteContractById(contractId) {
  try {
    const contract = await Contract.findByIdAndDelete(contractId);
    if (!contract) {
      console.error("Contract not found");
      return null;
    }
    console.log("Contract deleted successfully:", contract);
    return contract;
  } catch (err) {
    console.error("Error deleting contract:", err);
    throw err;
  }
}

/**
 * update contract installments
 * @param {number} contractId
 * @param {number} installmentAmount
 * @param {number} term
 * @returns
 */
async function updateInstallments(contractId, installmentAmount, term = null) {
  try {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      console.error("Contract not found");
      return null;
    }

    let updatedContract = null;
    if (term !== null) {
      // Update contract term
      const oldTerm = contract.term;
      const newTerm = term;
      const oldDepreciation = contract.right_of_use_asset_value / oldTerm;
      const newDepreciation = contract.right_of_use_asset_value / newTerm;
      const newAccumulatedDepreciation =
        contract.accumulated_depreciation +
        (newDepreciation - oldDepreciation) *
          (oldTerm - contract.current_period);
      const newRightOfUseAssetValue =
        newAccumulatedDepreciation +
        (contract.term - contract.current_period) * newDepreciation;

      // Update the contract document
      updatedContract = await Contract.findByIdAndUpdate(
        contractId,
        {
          $set: {
            term: newTerm,
            accumulated_depreciation: newAccumulatedDepreciation,
            right_of_use_asset_value: newRightOfUseAssetValue,
            changes: updatedChanges,
          },
        },
        { new: true }
      );

      console.log("Contract term updated successfully:", updatedContract);
    }

    // Update future installments with the new amount
    const futureInstallments = contract.installments.slice(
      contract.current_period
    );
    const updatedFutureInstallments = futureInstallments.map(
      (installment, index) => {
        const remainingPeriods = futureInstallments.length - index;
        const presentValue =
          installmentAmount / (1 + contract.interest_rate) ** remainingPeriods;
        const updatedInstallment = {
          ...installment,
          value: installment.value + installmentAmount,
          present_value: installment.present_value + presentValue,
        };
        return updatedInstallment;
      }
    );
    const updatedInstallments = [
      ...contract.installments.slice(0, contract.current_period),
      ...updatedFutureInstallments,
    ];

    // Calculate present value of the total added/subtracted amount
    const totalPresentValue = updatedFutureInstallments.reduce(
      (total, installment) => {
        return total + installment.present_value;
      },
      0
    );

    // Update right of use asset cost
    const newRightOfUseAssetValue = updatedContract
      ? updatedContract.right_of_use_asset_value + totalPresentValue
      : contract.right_of_use_asset_value + totalPresentValue;
    const newAccumulatedDepreciation = updatedContract
      ? updatedContract.accumulated_depreciation
      : contract.accumulated_depreciation +
        (newRightOfUseAssetValue - contract.right_of_use_asset_value) /
          contract.term;
    const depreciation = newRightOfUseAssetValue / contract.term;

    // Update the contract document
    updatedContract = updatedContract || contract;
    updatedContract = await Contract.findByIdAndUpdate(
      contractId,
      {
        $set: {
          installments: updatedInstallments,
          right_of_use_asset_value: newRightOfUseAssetValue,
          accumulated_depreciation: newAccumulatedDepreciation,
          depreciation,
          changes: updatedChanges,
        },
      },
      { new: true }
    );

    console.log("Contract installments updated successfully:", updatedContract);
    return updatedContract;
  } catch (err) {
    console.error("Error updating contract installments:", err);
    throw err;
  }
}

/**
 * month closing
 * @param {number} month
 */

const monthClosing = async (month) => {
  // Check if the previous month has been closed
  const previousMonth = month - 1;
  const contracts = await Contract.find({ "changes.month": previousMonth });
  const allClosed = contracts.every((contract) => {
    const changes = contract.changes.filter(
      (change) => change.month === previousMonth
    );
    return changes.length > 0 && changes[0].endOfPeriodAssetValue !== undefined;
  });
  if (!allClosed) {
    throw new Error(
      `Cannot close month ${month}. Month ${previousMonth} has not been closed.`
    );
  }

  // Find all contracts with changes for the specified month
  contracts = await Contract.find({ "changes.month": month });

  // Loop through all contracts with changes for the specified month
  for (const contract of contracts) {
    // Calculate the present value of future installments as of the month being closed
    const interestRate = contract.interestRate / 12;
    let presentValue = 0;
    for (const installment of contract.installments) {
      if (installment.month >= month) {
        presentValue +=
          installment.value /
          Math.pow(1 + interestRate, installment.month - month + 1);
      }
    }

    // Calculate the month-end values
    const remainingMonths = contract.term - month + 1;
    const endOfPeriodAssetValue = presentValue;
    const depreciationAmount =
      (contract.rightOfUseAssetValue - endOfPeriodAssetValue) / remainingMonths;

    // Update the contract with the month-end values
    const changes = contract.changes.filter((change) => change.month !== month);
    changes.push({
      month: month,
      endOfPeriodAssetValue: endOfPeriodAssetValue,
      depreciationAmount: depreciationAmount,
      presentValue: presentValue,
    });
    contract.rightOfUseAssetValue = endOfPeriodAssetValue;
    contract.accumulatedDepreciation += depreciationAmount;
    contract.changes = changes;

    // Save the updated contract
    await contract.save();
  }
};

/**
 * revert month closing
 * @param {number} contractId
 * @param {Date} startMonth
 * @param {Date} endMonth
 */
async function revertMonthClosing(contractId, startMonth, endMonth) {
  const contract = await Contract.findById(contractId);

  if (!contract) {
    throw new Error("Contract not found");
  }

  const { changes } = contract;

  // Check if any month after endMonth is already closed
  const futureMonthClosed = changes.some((change) => {
    return change.month > endMonth && change.endOfMonth === true;
  });

  if (futureMonthClosed) {
    throw new Error("Cannot revert a month in a closed period");
  }

  // Find the changes for the specified range of months
  const rangeChanges = changes.filter((change) => {
    return change.month >= startMonth && change.month <= endMonth;
  });

  // Revert the changes for each month in the range
  for (const change of rangeChanges) {
    // Revert the endOfMonth flag
    change.endOfMonth = false;

    // Revert the right of use asset value
    const { value: changeValue } = change.change;
    const { value: assetValue, presentValue: presentValue } =
      change.rightOfUseAsset;

    if (changeValue < 0) {
      // Revert a subtraction of future installments
      const presentValueChange = calculatePresentValue(
        -changeValue,
        contract.interestRate,
        change.month
      );
      change.rightOfUseAsset.presentValue = presentValue - presentValueChange;
      change.rightOfUseAsset.value = assetValue - presentValueChange;
    } else {
      // Revert an addition of future installments
      const presentValueChange = calculatePresentValue(
        changeValue,
        contract.interestRate,
        change.month
      );
      change.rightOfUseAsset.presentValue = presentValue + presentValueChange;
      change.rightOfUseAsset.value = assetValue + presentValueChange;
    }

    // Revert the monthly depreciation and interest expense
    const { value: depreciationValue, presentValue: depreciationPresentValue } =
      change.depreciation;
    const { value: interestValue, presentValue: interestPresentValue } =
      change.interestExpense;
    change.depreciation.presentValue =
      depreciationPresentValue -
      depreciationValue / (endMonth - startMonth + 1);
    change.depreciation.value =
      depreciationValue - depreciationValue / (endMonth - startMonth + 1);
    change.interestExpense.presentValue =
      interestPresentValue - interestValue / (endMonth - startMonth + 1);
    change.interestExpense.value =
      interestValue - interestValue / (endMonth - startMonth + 1);

    // Save the changes
    await contract.save();
  }
}

module.exports = {
  createContract,
  getAllContracts,
  getContractById,
  getContractsByCriteria,
  updateContractById,
  deleteContractById,
  updateInstallments,
  monthClosing,
  revertMonthClosing,
};
