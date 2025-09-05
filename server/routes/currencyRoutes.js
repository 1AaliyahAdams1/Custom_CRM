const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");

// Routes
router.get("/", currencyController.getAllCurrencies);
router.get("/:id", currencyController.getCurrencyById);
router.post("/", currencyController.createCurrency);
router.put("/:id", currencyController.updateCurrency);
router.patch("/:id/deactivate", currencyController.deactivateCurrency);
router.patch("/:id/reactivate", currencyController.reactivateCurrency);
router.delete("/:id", currencyController.hardDeleteCurrency);

module.exports = router;
