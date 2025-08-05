const express = require("express");
const router = express.Router();
const stateController = require("../controllers/stateProvinceController");

router.get("/", stateController.getAllStates);
router.get("/:id", stateController.getStateById);
router.post("/", stateController.createState);
router.put("/:id", stateController.updateState);
router.patch("/deactivate/:id", stateController.deactivateState);
router.patch("/reactivate/:id", stateController.reactivateState);
router.delete("/:id/delete", stateController.deleteState);

router.get("/name/:name", stateController.getIDByStateProvince);

module.exports = router;
