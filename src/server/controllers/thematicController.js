const Thematic = require('../models/thematic');
const mongoose = require('mongoose');
const bulkImportService = require('../services/bulkImportService');

// Configuration MongoDB optimisée
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10, // Augmenter le pool de connexions
    bufferMaxEntries: 0 // Désactiver le buffering
};

// Buffer pour accumuler les données
let dataBuffer = [];
const BUFFER_SIZE = 10000; // Taille optimale du buffer

exports.bulkImportCholeraData = async (req, res) => {
    console.log("Importation des données cholera");
    try {
        const { data } = req.body;
        console.log("Données reçues:", data);

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aucune donnée fournie ou format invalide'
            });
        }

        return console.log(`Début de l'importation de ${data.length} enregistrements`);

        // Traitement des données par chunks pour optimiser les performances
        const CHUNK_SIZE = 1000;
        const chunks = [];
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            chunks.push(data.slice(i, i + CHUNK_SIZE));
        }

        let totalProcessed = 0;
        let totalErrors = 0;
        const detailedErrors = [];

        for (const chunk of chunks) {
            try {
                const result = await bulkImportService.processChunk(chunk);
                totalProcessed += result.totalProcessed;
                
                if (result.invalidData && result.invalidData.length > 0) {
                    totalErrors += result.invalidData.length;
                    detailedErrors.push(...result.invalidData);
                }

                console.log(`Chunk traité: ${result.totalProcessed} enregistrements traités, ${result.invalidData?.length || 0} erreurs`);
            } catch (error) {
                console.error('Erreur lors du traitement du chunk:', error);
                totalErrors += chunk.length;
                detailedErrors.push({
                    chunk: chunks.indexOf(chunk) + 1,
                    error: error.message
                });
            }
        }

        // Finalisation de l'import
        const finalResult = await bulkImportService.finalize();

        console.log(`Importation terminée: ${totalProcessed} enregistrements importés, ${totalErrors} erreurs`);

        res.status(200).json({
            success: true,
            message: 'Importation terminée',
            summary: {
                totalRecords: data.length,
                totalProcessed,
                totalErrors,
                successRate: ((totalProcessed / data.length) * 100).toFixed(2) + '%'
            },
            details: {
                errors: detailedErrors
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'importation en masse:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'importation en masse',
            error: error.message
        });
    }
};

// Fonction pour traiter le buffer
async function processBuffer() {
    if (dataBuffer.length === 0) return;

    try {
        // Désactiver temporairement les index
        await Thematic.collection.dropIndexes();

        // Insertion en masse avec ordered: false pour optimiser les performances
        const result = await Thematic.collection.bulkWrite(
            dataBuffer.map(doc => ({
                insertOne: { document: doc }
            })),
            { ordered: false }
        );

        // Réactiver les index en arrière-plan
        await Thematic.collection.createIndex(
            { 'dataTempo.year': 1, 'dataTempo.week': 1 },
            { background: true }
        );

        // Vider le buffer
        dataBuffer = [];

        return result;
    } catch (error) {
        console.error('Erreur lors du traitement du buffer:', error);
        throw error;
    }
}

// Middleware pour nettoyer le buffer à la fin de l'import
exports.finalizeImport = async (req, res) => {
    try {
        const result = await bulkImportService.finalize();
        
        res.status(200).json({
            success: true,
            message: 'Importation finalisée avec succès',
            stats: {
                totalProcessed: result.totalProcessed
            }
        });
    } catch (error) {
        console.error('Erreur lors de la finalisation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la finalisation',
            error: error.message
        });
    }
}; 