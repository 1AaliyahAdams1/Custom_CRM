const express = require("express");
const router = express.Router();
const cityController = require("../controllers/cityController");

router.get("/", cityController.getAllCities);
router.get("/:id", cityController.getCityById);
router.post("/", cityController.createCity);
router.put("/:id", cityController.updateCity);
router.patch("/:id/deactivate", cityController.deactivateCity);
router.patch("/:id/reactivate", cityController.reactivateCity);
router.delete("/:id/delete", cityController.deleteCity);

module.exports = router;
