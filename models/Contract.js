const mongoose = require("mongoose");
const ContractSchema = require("./contractSchema");

const Contract = mongoose.model("Contract", ContractSchema);

// CREATE
async function createContract(contractData) {
  try {
    const contract = new Contract(contractData);
    const savedContract = await contract.save();
    return savedContract;
  } catch (err) {
    throw new Error(`Error creating contract: ${err.message}`);
  }
}

// READ
async function getContractById(contractId) {
  try {
    const contract = await Contract.findById(contractId);
    if (!contract) throw new Error(`Contract not found for id: ${contractId}`);
    return contract;
  } catch (err) {
    throw new Error(`Error getting contract by id: ${err.message}`);
  }
}

async function getAllContracts() {
  try {
    const contracts = await Contract.find();
    return contracts;
  } catch (err) {
    throw new Error(`Error getting all contracts: ${err.message}`);
  }
}

// UPDATE
async function updateContract(contractId, updates) {
  try {
    const contract = await getContractById(contractId);
    Object.keys(updates).forEach((key) => {
      contract[key] = updates[key];
    });
    const savedContract = await contract.save();
    return savedContract;
  } catch (err) {
    throw new Error(`Error updating contract: ${err.message}`);
  }
}

// DELETE
async function deleteContract(contractId) {
  try {
    const contract = await getContractById(contractId);
    await contract.remove();
    return contract;
  } catch (err) {
    throw new Error(`Error deleting contract: ${err.message}`);
  }
}

// Export CRUD functions
module.exports = {
  createContract,
  getContractById,
  getAllContracts,
  updateContract,
  deleteContract,
};
