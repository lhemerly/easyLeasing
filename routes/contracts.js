const express = require("express");
const router = express.Router();
const connector = require("../middleware/connector");

router.post("/contracts", connector.createContract);
router.get("/contracts/:id", connector.getContractById);
router.get("/contracts", connector.getAllContracts);
router.post("/contracts/:id/close-month", connector.closeMonth);
router.post(
  "/contracts/:id/revert-month-closing",
  connector.revertMonthClosing
);
router.put("/contracts/:id/installments", connector.updateInstallments);

module.exports = router;
