const contractController = require('../controllers/ContractController');

function createContract(req, res, next) {
  const { asset_name, asset_description, supplier, start_date, end_date, interest_rate, amount } = req.body;
  contractController.createContract({
    asset_name,
    asset_description,
    supplier,
    start_date,
    end_date,
    interest_rate,
    amount
  })
    .then(contract => {
      res.status(201).json({ data: contract });
    })
    .catch(next);
}

function getContractById(req, res, next) {
  const { id } = req.params;
  contractController.getContractById(id)
    .then(contract => {
      if (!contract) {
        return res.status(404).json({ error: 'Contract not found' });
      }
      res.status(200).json({ data: contract });
    })
    .catch(next);
}

function getAllContracts(req, res, next) {
  const { asset_name, asset_description, supplier } = req.query;
  contractController.getAllContracts({ asset_name, asset_description, supplier })
    .then(contracts => {
      res.status(200).json({ data: contracts });
    })
    .catch(next);
}

function closeMonth(req, res, next) {
  const { id } = req.params;
  const { month } = req.body;
  contractController.closeMonth(id, month)
    .then(contract => {
      res.status(200).json({ data: contract });
    })
    .catch(next);
}

function revertMonthClosing(req, res, next) {
  const { id } = req.params;
  const { from_month, to_month } = req.body;
  contractController.revertMonthClosing(id, from_month, to_month)
    .then(contract => {
      res.status(200).json({ data: contract });
    })
    .catch(next);
}

function updateInstallments(req, res, next) {
  const { id } = req.params;
  const { installment_amount, term } = req.body;
  contractController.updateInstallments(id, installment_amount, term)
    .then(contract => {
      res.status(200).json({ data: contract });
    })
    .catch(next);
}

module.exports = {
  createContract,
  getContractById,
  getAllContracts,
  closeMonth,
  revertMonthClosing,
  updateInstallments
};
