const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router.get("/", accountController.getAllAccounts);
router.get("/:id", accountController.getAccountById);
router.post("/", accountController.createAccount);
router.put("/:id", accountController.updateAccount);
router.patch("/:id/deactivate", accountController.deactivateAccount);
router.patch("/:id/reactivate", accountController.reactivateAccount);
router.delete("/:id/delete", accountController.deleteAccount);

module.exports = router;
