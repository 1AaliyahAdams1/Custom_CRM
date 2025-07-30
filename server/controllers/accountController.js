const accountService = require("../services/accountService");

const getAllAccounts = async (req, res) => {
  try {
    const accounts = await accountService.listAllAccounts();
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getActiveAccounts = async (req, res) => {
  try {
    const accounts = await accountService.listActiveAccounts();
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getInactiveAccounts = async (req, res) => {
  try {
    const accounts = await accountService.listInactiveAccounts();
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAccountById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const account = await accountService.getAccountById(id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.status(200).json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const userId = req.user?.UserID || 1;
    const result = await accountService.createNewAccount(req.body, userId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAccount = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.UserID || 1;
    const result = await accountService.updateExistingAccount(id, req.body, userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deactivateAccount = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.UserID || 1;
    const result = await accountService.deactivateExistingAccount(id, userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reactivateAccount = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.UserID || 1;
    const result = await accountService.reactivateExistingAccount(id, userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.UserID || 1;
    const result = await accountService.deleteAccountPermanently(id, userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllAccounts,
  getActiveAccounts,
  getInactiveAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deactivateAccount,
  reactivateAccount,
  deleteAccount,
};
