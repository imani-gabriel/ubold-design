const Thematic = require('../models/thematic');
const mongoose = require('mongoose');

// Configuration MongoDB optimisée pour gros volumes
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 20, // Augmenter le pool de connexions
    bufferMaxEntries: 0,
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false
};

// Configuration pour le traitement par chunks
const CHUNK_SIZE = 5000; // Taille optimale pour MongoDB
const MAX_MEMORY_USAGE = 100 * 1024 * 1024; // 100MB max en mémoire

// Cache Redis-like en mémoire pour les statistiques
const statsCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Contrôleur optimisé pour obtenir toutes les données (avec streaming et chunks)
exports.getAllCholeraData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000; // Augmenter la limite par défaut
        const skip = (page - 1) * limit;
        const useStreaming = req.query.stream === 'true';
        const fields = req.query.fields ? req.query.fields.split(',') : null;

        console.log(`Demande de données: page ${page}, limite ${limit}, streaming: ${useStreaming}`);

        // Optimisation 1: Compter avec index
        const totalRecords = await Thematic.countDocuments({}).hint({ Annees: 1, Semaines: 1 });

        if (useStreaming && totalRecords > 10000) {
            // Utiliser le streaming pour les gros volumes
            return await streamCholeraData(req, res, totalRecords);
        }

        // Optimisation 2: Projection pour réduire la taille des données
        const projection = fields ? 
            fields.reduce((acc, field) => { acc[field] = 1; return acc; }, {}) : 
            { _id: 0 };

        // Optimisation 3: Requête avec index et lean()
        const data = await Thematic.find({})
            .select(projection)
            .sort({ Annees: -1, Semaines: -1, ZoneDeSante: 1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .hint({ Annees: 1, Semaines: 1, ZoneDeSante: 1 })
            .maxTimeMS(30000); // Timeout de 30 secondes

        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            data: data,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            performance: {
                queryTime: Date.now(),
                dataSize: JSON.stringify(data).length,
                optimized: true
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des données',
            error: error.message
        });
    }
};

// Fonction de streaming pour gros volumes
async function streamCholeraData(req, res, totalRecords) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;

        console.log('Utilisation du streaming pour gros volume de données...');

        // Configuration du streaming
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');

        // En-tête de la réponse
        res.write('{"success":true,"data":[');

        let isFirst = true;
        let processedCount = 0;

        // Utiliser le curseur MongoDB pour le streaming
        const cursor = Thematic.find({})
            .sort({ Annees: -1, Semaines: -1, ZoneDeSante: 1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .hint({ Annees: 1, Semaines: 1, ZoneDeSante: 1 })
            .cursor({ batchSize: 1000 });

        // Traitement par chunks
        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            if (!isFirst) {
                res.write(',');
            }
            res.write(JSON.stringify(doc));
            isFirst = false;
            processedCount++;

            // Libérer la mémoire périodiquement
            if (processedCount % 1000 === 0) {
                await new Promise(resolve => setImmediate(resolve));
            }
        }

        // Fermer la réponse
        res.write(`],"pagination":{"currentPage":${page},"totalRecords":${totalRecords},"limit":${limit}}}`);
        res.end();

        console.log(`Streaming terminé: ${processedCount} enregistrements traités`);

    } catch (error) {
        console.error('Erreur lors du streaming:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Erreur lors du streaming des données',
                error: error.message
            });
        }
    }
}

// Contrôleur optimisé pour les statistiques globales (avec cache)
exports.getCholeraStatistics = async (req, res) => {
    try {
        const cacheKey = 'global_stats';
        const now = Date.now();

        // Vérifier le cache
        if (statsCache.has(cacheKey)) {
            const cached = statsCache.get(cacheKey);
            if (now - cached.timestamp < CACHE_TTL) {
                console.log('Utilisation des statistiques en cache');
                return res.status(200).json({
                    success: true,
                    statistics: cached.data,
                    fromCache: true
                });
            }
        }

        console.log('Calcul des statistiques globales avec agrégation optimisée...');

        // Optimisation: Agrégation avec pipeline optimisé
        const stats = await Thematic.aggregate([
            {
                $facet: {
                    // Statistiques de base
                    basicStats: [
                        {
                            $group: {
                                _id: null,
                                totalRecords: { $sum: 1 },
                                totalCas: { $sum: '$Cas' },
                                totalDeces: { $sum: '$Deces' },
                                minAnnee: { $min: '$Annees' },
                                maxAnnee: { $max: '$Annees' }
                            }
                        }
                    ],
                    // Comptage des provinces et zones
                    counts: [
                        {
                            $group: {
                                _id: null,
                                provinces: { $addToSet: '$Province' },
                                zones: { $addToSet: '$ZoneDeSante' }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRecords: { $arrayElemAt: ['$basicStats.totalRecords', 0] },
                    totalCas: { $arrayElemAt: ['$basicStats.totalCas', 0] },
                    totalDeces: { $arrayElemAt: ['$basicStats.totalDeces', 0] },
                    minAnnee: { $arrayElemAt: ['$basicStats.minAnnee', 0] },
                    maxAnnee: { $arrayElemAt: ['$basicStats.maxAnnee', 0] },
                    provincesCount: { $size: { $arrayElemAt: ['$counts.provinces', 0] } },
                    zonesCount: { $size: { $arrayElemAt: ['$counts.zones', 0] } }
                }
            }
        ]).hint({ Annees: 1, Semaines: 1 }).maxTimeMS(60000);

        const result = stats[0] || {
            totalRecords: 0,
            totalCas: 0,
            totalDeces: 0,
            minAnnee: null,
            maxAnnee: null,
            provincesCount: 0,
            zonesCount: 0
        };

        // Calculer le taux de mortalité
        result.tauxMortalite = result.totalCas > 0 ? 
            ((result.totalDeces / result.totalCas) * 100).toFixed(2) : 0;

        // Mettre en cache
        statsCache.set(cacheKey, {
            data: result,
            timestamp: now
        });

        res.status(200).json({
            success: true,
            statistics: result,
            fromCache: false
        });

    } catch (error) {
        console.error('Erreur lors du calcul des statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du calcul des statistiques',
            error: error.message
        });
    }
};

// Contrôleur optimisé pour filtrer les données
exports.filterCholeraData = async (req, res) => {
    try {
        const filters = req.body;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;
        const useIndex = req.query.useIndex !== 'false';

        console.log('Filtrage optimisé des données avec:', filters);

        // Optimisation: Construire le filtre avec index
        const mongoFilter = buildOptimizedMongoFilter(filters);

        // Optimisation: Compter avec index
        const totalRecords = await Thematic.countDocuments(mongoFilter)
            .hint(useIndex ? { Annees: 1, Semaines: 1, ZoneDeSante: 1 } : {})
            .maxTimeMS(30000);
        
        // Optimisation: Requête avec projection et index
        const data = await Thematic.find(mongoFilter)
            .select({ _id: 0 })
            .sort({ Annees: -1, Semaines: -1, ZoneDeSante: 1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .hint(useIndex ? { Annees: 1, Semaines: 1, ZoneDeSante: 1 } : {})
            .maxTimeMS(30000);

        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            data: data,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            filters: filters,
            performance: {
                queryTime: Date.now(),
                dataSize: JSON.stringify(data).length,
                optimized: true
            }
        });

    } catch (error) {
        console.error('Erreur lors du filtrage des données:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du filtrage des données',
            error: error.message
        });
    }
};

// Contrôleur optimisé pour obtenir les valeurs uniques
exports.getUniqueValues = async (req, res) => {
    try {
        const { field } = req.params;
        const cacheKey = `unique_${field}`;
        const now = Date.now();

        // Vérifier le cache
        if (statsCache.has(cacheKey)) {
            const cached = statsCache.get(cacheKey);
            if (now - cached.timestamp < CACHE_TTL) {
                return res.status(200).json({
                    success: true,
                    field: field,
                    values: cached.data.values,
                    count: cached.data.count,
                    fromCache: true
                });
            }
        }

        console.log(`Récupération optimisée des valeurs uniques pour: ${field}`);

        const validFields = ['Annees', 'Semaines', 'Province', 'DPS', 'ZoneDeSante'];
        if (!validFields.includes(field)) {
            return res.status(400).json({
                success: false,
                message: 'Champ invalide',
                validFields: validFields
            });
        }

        // Optimisation: Agrégation avec index
        const uniqueValues = await Thematic.aggregate([
            {
                $group: {
                    _id: `$${field}`,
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    _id: { $ne: null }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    value: '$_id',
                    count: 1
                }
            }
        ]).hint({ [field]: 1 }).maxTimeMS(30000);

        const result = {
            values: uniqueValues.map(item => item.value),
            count: uniqueValues.length,
            details: uniqueValues
        };

        // Mettre en cache
        statsCache.set(cacheKey, {
            data: result,
            timestamp: now
        });

        res.status(200).json({
            success: true,
            field: field,
            ...result,
            fromCache: false
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des valeurs uniques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des valeurs uniques',
            error: error.message
        });
    }
};

// Contrôleur pour obtenir les données par province (optimisé)
exports.getDataByProvince = async (req, res) => {
    try {
        const { province } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;

        console.log(`Récupération optimisée pour la province: ${province}`);

        const filter = { Province: { $regex: province, $options: 'i' } };
        const totalRecords = await Thematic.countDocuments(filter)
            .hint({ Province: 1 })
            .maxTimeMS(30000);
        
        const data = await Thematic.find(filter)
            .select({ _id: 0 })
            .sort({ Annees: -1, Semaines: -1, ZoneDeSante: 1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .hint({ Province: 1, Annees: 1, Semaines: 1 })
            .maxTimeMS(30000);

        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            province: province,
            data: data,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des données par province:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des données par province',
            error: error.message
        });
    }
};

// Contrôleur pour obtenir les données par zone (optimisé)
exports.getDataByZone = async (req, res) => {
    try {
        const { zone } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;

        console.log(`Récupération optimisée pour la zone: ${zone}`);

        const filter = { ZoneDeSante: { $regex: zone, $options: 'i' } };
        const totalRecords = await Thematic.countDocuments(filter)
            .hint({ ZoneDeSante: 1 })
            .maxTimeMS(30000);
        
        const data = await Thematic.find(filter)
            .select({ _id: 0 })
            .sort({ Annees: -1, Semaines: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .hint({ ZoneDeSante: 1, Annees: 1, Semaines: 1 })
            .maxTimeMS(30000);

        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            zone: zone,
            data: data,
            pagination: {
                currentPage: page,
                totalPages,
                totalRecords,
                limit,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des données par zone:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des données par zone',
            error: error.message
        });
    }
};

// Fonction utilitaire optimisée pour construire le filtre MongoDB
function buildOptimizedMongoFilter(filters) {
    const mongoFilter = {};

    if (filters.annee) {
        mongoFilter.Annees = parseInt(filters.annee);
    }

    if (filters.semaine) {
        mongoFilter.Semaines = parseInt(filters.semaine);
    }

    if (filters.province) {
        mongoFilter.Province = { $regex: filters.province, $options: 'i' };
    }

    if (filters.dps) {
        mongoFilter.DPS = { $regex: filters.dps, $options: 'i' };
    }

    if (filters.zone) {
        mongoFilter.ZoneDeSante = { $regex: filters.zone, $options: 'i' };
    }

    if (filters.casMin || filters.casMax) {
        mongoFilter.Cas = {};
        if (filters.casMin) mongoFilter.Cas.$gte = parseInt(filters.casMin);
        if (filters.casMax) mongoFilter.Cas.$lte = parseInt(filters.casMax);
    }

    if (filters.decesMin || filters.decesMax) {
        mongoFilter.Deces = {};
        if (filters.decesMin) mongoFilter.Deces.$gte = parseInt(filters.decesMin);
        if (filters.decesMax) mongoFilter.Deces.$lte = parseInt(filters.decesMax);
    }

    return mongoFilter;
}

// Contrôleur optimisé pour les statistiques par province
exports.getProvinceStatistics = async (req, res) => {
    try {
        const cacheKey = 'province_stats';
        const now = Date.now();

        // Vérifier le cache
        if (statsCache.has(cacheKey)) {
            const cached = statsCache.get(cacheKey);
            if (now - cached.timestamp < CACHE_TTL) {
                return res.status(200).json({
                    success: true,
                    statistics: cached.data,
                    fromCache: true
                });
            }
        }

        console.log('Calcul optimisé des statistiques par province...');

        const stats = await Thematic.aggregate([
            {
                $group: {
                    _id: '$Province',
                    totalCas: { $sum: '$Cas' },
                    totalDeces: { $sum: '$Deces' },
                    zones: { $addToSet: '$ZoneDeSante' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    province: '$_id',
                    totalCas: 1,
                    totalDeces: 1,
                    zonesCount: { $size: '$zones' },
                    count: 1,
                    tauxMortalite: {
                        $cond: [
                            { $gt: ['$totalCas', 0] },
                            { $multiply: [{ $divide: ['$totalDeces', '$totalCas'] }, 100] },
                            0
                        ]
                    }
                }
            },
            {
                $sort: { totalCas: -1 }
            }
        ]).hint({ Province: 1 }).maxTimeMS(60000);

        // Mettre en cache
        statsCache.set(cacheKey, {
            data: stats,
            timestamp: now
        });

        res.status(200).json({
            success: true,
            statistics: stats,
            fromCache: false
        });

    } catch (error) {
        console.error('Erreur lors du calcul des statistiques par province:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du calcul des statistiques par province',
            error: error.message
        });
    }
};

// Contrôleur pour vider le cache
exports.clearCache = async (req, res) => {
    try {
        statsCache.clear();
        console.log('Cache vidé avec succès');
        
        res.status(200).json({
            success: true,
            message: 'Cache vidé avec succès',
            cacheSize: 0
        });
    } catch (error) {
        console.error('Erreur lors du vidage du cache:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du vidage du cache',
            error: error.message
        });
    }
};

// Contrôleur pour obtenir les informations de performance
exports.getPerformanceInfo = async (req, res) => {
    try {
        const stats = await Thematic.db.db().stats();
        const collectionStats = await Thematic.db.db().collection('thematics').stats();
        
        res.status(200).json({
            success: true,
            database: {
                collections: stats.collections,
                dataSize: stats.dataSize,
                storageSize: stats.storageSize,
                indexes: stats.indexes
            },
            collection: {
                count: collectionStats.count,
                size: collectionStats.size,
                avgObjSize: collectionStats.avgObjSize,
                indexes: collectionStats.nindexes
            },
            cache: {
                size: statsCache.size,
                entries: Array.from(statsCache.keys())
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des infos de performance:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des infos de performance',
            error: error.message
        });
    }
}; 