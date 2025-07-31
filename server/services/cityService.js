const cityRepo = require("../data/cityRepository");

const getAllCities = async () => {
  return await cityRepo.getAllCities();
};

const getCityById = async (cityId) => {
  if (!cityId) throw new Error("CityID is required");
  return await cityRepo.getCityById(cityId);
};

const createCity = async (data) => {
  const { CityName, StateProvinceID } = data;
  if (!CityName || !StateProvinceID) throw new Error("Missing required fields");
  return await cityRepo.createCity(data);
};

const updateCity = async (cityId, data) => {
  if (!cityId) throw new Error("CityID is required");
  return await cityRepo.updateCity(cityId, data);
};

const deactivateCity = async (cityId) => {
  if (!cityId) throw new Error("CityID is required");
  return await cityRepo.deactivateCity(cityId);
};

const reactivateCity = async (cityId) => {
  if (!cityId) throw new Error("CityID is required");
  return await cityRepo.reactivateCity(cityId);
};

const deleteCity = async (cityId) => {
  if (!cityId) throw new Error("CityID is required");
  return await cityRepo.deleteCity(cityId);
};

module.exports = {
  getAllCities,
  getCityById,
  createCity,
  updateCity,
  deactivateCity,
  reactivateCity,
  deleteCity,
};
