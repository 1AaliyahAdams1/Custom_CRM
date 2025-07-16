const service = require("../services/activityTypeService");

const getAll = async (req, res) => {
  try {
    // Validation done here (if needed)

    const data = await service.getAllActivityTypes(); // Call service to fetch data
    res.json(data); // Respond with JSON array
  } catch (err) {
    // Handle errors with 500 status code
    res.status(500).json({ message: "Failed to fetch activity types" });
  }
};

module.exports = {
  getAll,
};
