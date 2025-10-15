const express = require("express");
const router = express.Router();
const CategoryService = require("../services/categoryService");

// Get all categories
router.get("/", async (req, res) => {
  try {
    console.log("🟢 Route: GET /api/categories - Fetching categories");
    const categories = await CategoryService.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error("🔴 Route Error [GET /api/categories]:", error);
    res.status(500).json({ error: error.message || "Failed to fetch categories" });
  }
});

// Create new category
router.post("/", async (req, res) => {
  try {
    console.log("🟢 Route: POST /api/categories - Request body:", req.body);
    if (!req.body || !req.body.CategoryName) {
      return res.status(400).json({ error: "CategoryName is required" });
    }
    const newCategory = await CategoryService.createCategory({
      CategoryName: req.body.CategoryName,
      Active: req.body.Active !== false,
    });
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("🔴 Route Error [POST /api/categories]:", error);
    res.status(500).json({ error: error.message || "Failed to create category" });
  }
});

module.exports = router;


