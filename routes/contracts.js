const express = require("express");
const router = express.Router();
const Contract = require("../models/Contract");

// Create a new contract
router.post("/contracts", async (req, res) => {
  try {
    const contract = new Contract(req.body);
    await contract.save();
    res.status(201).send(contract);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Read all contracts
router.get("/contracts", async (req, res) => {
  try {
    const contracts = await Contract.find();
    res.send(contracts);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Read a contract by ID
router.get("/contracts/:id", async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).send();
    }
    res.send(contract);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update a contract by ID
router.patch("/contracts/:id", async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contract) {
      return res.status(404).send();
    }
    res.send(contract);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete a contract by ID
router.delete("/contracts/:id", async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) {
      return res.status(404).send();
    }
    res.send(contract);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
