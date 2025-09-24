const mongoose = require('mongoose');
const Thematic = require('../models/thematic');

// Configuration MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/observa';

async function createOptimizedIndexes() {
    try {
        console.log('Connexion à MongoDB...');
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 50
        });

        console.log('Création des index optimisés pour 1M+ enregistrements...');

        const collection = Thematic.collection;

        // 1. Index composé principal pour les requêtes de tri et pagination
        console.log('Création de l\'index composé principal...');
        await collection.createIndex(
            { Annees: -1, Semaines: -1, ZoneDeSante: 1 },
            { 
                name: 'main_sort_index',
                background: true,
                unique: false
            }
        );

        // 2. Index pour les recherches par province
        console.log('Création de l\'index Province...');
        await collection.createIndex(
            { Province: 1 },
            { 
                name: 'province_index',
                background: true,
                sparse: true
            }
        );

        // 3. Index pour les recherches par zone de santé
        console.log('Création de l\'index ZoneDeSante...');
        await collection.createIndex(
            { ZoneDeSante: 1 },
            { 
                name: 'zone_sante_index',
                background: true,
                sparse: true
            }
        );

        // 4. Index pour les recherches par DPS
        console.log('Création de l\'index DPS...');
        await collection.createIndex(
            { DPS: 1 },
            { 
                name: 'dps_index',
                background: true,
                sparse: true
            }
        );

        // 5. Index pour les filtres sur les cas
        console.log('Création de l\'index Cas...');
        await collection.createIndex(
            { Cas: 1 },
            { 
                name: 'cas_index',
                background: true
            }
        );

        // 6. Index pour les filtres sur les décès
        console.log('Création de l\'index Deces...');
        await collection.createIndex(
            { Deces: 1 },
            { 
                name: 'deces_index',
                background: true
            }
        );

        // 7. Index composé pour les statistiques par province
        console.log('Création de l\'index composé Province + Cas...');
        await collection.createIndex(
            { Province: 1, Cas: -1 },
            { 
                name: 'province_cas_index',
                background: true
            }
        );

        // 8. Index composé pour les statistiques par zone
        console.log('Création de l\'index composé ZoneDeSante + Cas...');
        await collection.createIndex(
            { ZoneDeSante: 1, Cas: -1 },
            { 
                name: 'zone_cas_index',
                background: true
            }
        );

        // 9. Index pour les agrégations temporelles
        console.log('Création de l\'index temporel...');
        await collection.createIndex(
            { Annees: 1, Semaines: 1 },
            { 
                name: 'temporal_index',
                background: true
            }
        );

        // 10. Index textuel pour les recherches de texte (optionnel)
        console.log('Création de l\'index textuel...');
        await collection.createIndex(
            { 
                Province: 'text', 
                ZoneDeSante: 'text', 
                DPS: 'text' 
            },
            { 
                name: 'text_search_index',
                background: true,
                weights: {
                    Province: 3,
                    ZoneDeSante: 2,
                    DPS: 1
                }
            }
        );

        // Afficher les index créés
        console.log('\nIndex créés avec succès !');
        const indexes = await collection.indexes();
        console.log('\nIndex existants:');
        indexes.forEach((index, i) => {
            console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
        });

        // Statistiques de la collection
        const stats = await collection.stats();
        console.log('\nStatistiques de la collection:');
        console.log(`- Nombre de documents: ${stats.count.toLocaleString()}`);
        console.log(`- Taille des données: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`- Taille du stockage: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`- Nombre d'index: ${stats.nindexes}`);
        console.log(`- Taille moyenne des objets: ${stats.avgObjSize} bytes`);

        // Recommandations de performance
        console.log('\nRecommandations de performance:');
        console.log('✅ Utilisez .hint() pour forcer l\'utilisation d\'index spécifiques');
        console.log('✅ Utilisez .lean() pour les requêtes en lecture seule');
        console.log('✅ Utilisez .select() pour limiter les champs retournés');
        console.log('✅ Utilisez .maxTimeMS() pour éviter les requêtes longues');
        console.log('✅ Utilisez le streaming pour les gros volumes (>10k enregistrements)');
        console.log('✅ Utilisez le cache pour les statistiques fréquemment demandées');

    } catch (error) {
        console.error('Erreur lors de la création des index:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Déconnexion de MongoDB');
    }
}

// Exécuter le script
if (require.main === module) {
    createOptimizedIndexes();
}

module.exports = { createOptimizedIndexes }; 