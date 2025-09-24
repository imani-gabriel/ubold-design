const express = require('express');
const router = express.Router();
const thematicController = require('../controllers/thematicController');

// Route pour l'importation en masse des données
router.post('/bulk-import-cholera', thematicController.bulkImportCholeraData);

// Route pour finaliser l'importation
router.post('/finalize-import', thematicController.finalizeImport);

module.exports = router; 