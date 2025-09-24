const express = require('express');
const router = express.Router();
const Thematic = require('../models/thematic');

// Route pour obtenir toutes les données de choléra
router.get('/cholera-data', async (req, res) => {
    try {
        // Utiliser la méthode du modèle pour récupérer les données formatées
        const data = await Thematic.getCholeraData();
        
        // Formater les données pour le frontend
        const formattedData = data.map(item => ({
            ZoneDeSante: item.ZoneDeSante,
            Province: item.Province,
            DPS: item.DPS,
            Annees: item.Annees,
            Semaines: item.Semaines,
            Cas: item.Cas,
            Deces: item.Deces,
            Pop: item.Pop // Utiliser Pop au lieu de Population pour la cohérence
        }));
        
        res.json(formattedData);
    } catch (error) {
        console.error('Erreur lors de la récupération des données de choléra:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des données',
            details: error.message 
        });
    }
});

module.exports = router;
