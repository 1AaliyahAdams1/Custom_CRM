const express = require('express');
const router = express.Router();
const { runEFMSync } = require('../../utils/scheduler');

router.post('/trigger', (req, res) => {
  try {
    runEFMSync().catch(err => console.error('Background sync error:', err));
    
    res.json({ success: true, message: 'EFM sync started successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
