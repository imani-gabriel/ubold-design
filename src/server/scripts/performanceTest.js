const mongoose = require('mongoose');
const Thematic = require('../models/thematic');

// Configuration MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/observa';

// Fonction pour mesurer le temps d'exécution
function measureTime(fn) {
    return async (...args) => {
        const start = Date.now();
        const result = await fn(...args);
        const end = Date.now();
        return { result, executionTime: end - start };
    };
}

// Tests de performance
async function runPerformanceTests() {
    try {
        console.log('Connexion à MongoDB...');
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 50
        });

        const collection = Thematic.collection;
        const stats = await collection.stats();
        
        console.log(`\n=== TESTS DE PERFORMANCE POUR ${stats.count.toLocaleString()} ENREGISTREMENTS ===\n`);

        // Test 1: Compter tous les documents
        console.log('1. Test de comptage total...');
        const countTest = measureTime(() => Thematic.countDocuments({}));
        const countResult = await countTest();
        console.log(`   ⏱️  Temps: ${countResult.executionTime}ms`);
        console.log(`   📊 Résultat: ${countResult.result.toLocaleString()} documents\n`);

        // Test 2: Récupération avec pagination (1000 enregistrements)
        console.log('2. Test de récupération paginée (1000 enregistrements)...');
        const paginationTest = measureTime(() => 
            Thematic.find({})
                .sort({ Annees: -1, Semaines: -1 })
                .limit(1000)
                .lean()
                .hint({ Annees: 1, Semaines: 1 })
        );
        const paginationResult = await paginationTest();
        console.log(`   ⏱️  Temps: ${paginationResult.executionTime}ms`);
        console.log(`   📊 Résultat: ${paginationResult.result.length} documents récupérés\n`);

        // Test 3: Filtrage par province
        console.log('3. Test de filtrage par province...');
        const provinceTest = measureTime(() => 
            Thematic.find({ Province: { $regex: 'Kinshasa', $options: 'i' } })
                .limit(1000)
                .lean()
                .hint({ Province: 1 })
        );
        const provinceResult = await provinceTest();
        console.log(`   ⏱️  Temps: ${provinceResult.executionTime}ms`);
        console.log(`   📊 Résultat: ${provinceResult.result.length} documents trouvés\n`);

        // Test 4: Agrégation pour statistiques
        console.log('4. Test d\'agrégation pour statistiques...');
        const aggregationTest = measureTime(() => 
            Thematic.aggregate([
                {
                    $group: {
                        _id: '$Province',
                        totalCas: { $sum: '$Cas' },
                        totalDeces: { $sum: '$Deces' }
                    }
                },
                { $sort: { totalCas: -1 } },
                { $limit: 10 }
            ]).hint({ Province: 1 })
        );
        const aggregationResult = await aggregationTest();
        console.log(`   ⏱️  Temps: ${aggregationResult.executionTime}ms`);
        console.log(`   📊 Résultat: ${aggregationResult.result.length} provinces analysées\n`);

        // Test 5: Recherche textuelle
        console.log('5. Test de recherche textuelle...');
        const textSearchTest = measureTime(() => 
            Thematic.find({ $text: { $search: 'Kinshasa' } })
                .limit(100)
                .lean()
        );
        const textSearchResult = await textSearchTest();
        console.log(`   ⏱️  Temps: ${textSearchResult.executionTime}ms`);
        console.log(`   📊 Résultat: ${textSearchResult.result.length} documents trouvés\n`);

        // Test 6: Filtrage complexe
        console.log('6. Test de filtrage complexe...');
        const complexFilterTest = measureTime(() => 
            Thematic.find({
                Annees: { $gte: 2020 },
                Cas: { $gte: 10 },
                Province: { $regex: 'Kinshasa', $options: 'i' }
            })
                .sort({ Annees: -1, Semaines: -1 })
                .limit(500)
                .lean()
                .hint({ Annees: 1, Semaines: 1, Province: 1 })
        );
        const complexFilterResult = await complexFilterTest();
        console.log(`   ⏱️  Temps: ${complexFilterResult.executionTime}ms`);
        console.log(`   📊 Résultat: ${complexFilterResult.result.length} documents trouvés\n`);

        // Test 7: Test de streaming (simulation)
        console.log('7. Test de streaming (simulation)...');
        const streamingTest = measureTime(async () => {
            const cursor = Thematic.find({})
                .sort({ Annees: -1, Semaines: -1 })
                .limit(10000)
                .lean()
                .hint({ Annees: 1, Semaines: 1 })
                .cursor({ batchSize: 1000 });

            let count = 0;
            for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
                count++;
                if (count % 1000 === 0) {
                    await new Promise(resolve => setImmediate(resolve));
                }
            }
            return count;
        });
        const streamingResult = await streamingTest();
        console.log(`   ⏱️  Temps: ${streamingResult.executionTime}ms`);
        console.log(`   📊 Résultat: ${streamingResult.result} documents traités\n`);

        // Test 8: Performance des index
        console.log('8. Test de performance des index...');
        const indexes = await collection.indexes();
        console.log(`   📊 Nombre d'index: ${indexes.length}`);
        
        for (const index of indexes) {
            const indexTest = measureTime(() => 
                Thematic.find({})
                    .hint(index.key)
                    .limit(100)
                    .lean()
            );
            const indexResult = await indexTest();
            console.log(`   🔍 Index ${index.name}: ${indexResult.executionTime}ms`);
        }

        // Résumé des performances
        console.log('\n=== RÉSUMÉ DES PERFORMANCES ===');
        console.log(`📈 Base de données: ${stats.count.toLocaleString()} documents`);
        console.log(`💾 Taille: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`🔍 Index: ${stats.nindexes} index créés`);
        
        // Recommandations
        console.log('\n=== RECOMMANDATIONS ===');
        if (stats.count > 1000000) {
            console.log('🚀 Volume élevé détecté - Utilisez le streaming pour les gros volumes');
        }
        if (stats.nindexes < 5) {
            console.log('⚠️  Peu d\'index détectés - Exécutez le script createIndexes.js');
        }
        console.log('✅ Utilisez .lean() pour les requêtes en lecture seule');
        console.log('✅ Utilisez .hint() pour forcer l\'utilisation d\'index spécifiques');
        console.log('✅ Utilisez .maxTimeMS() pour éviter les requêtes longues');
        console.log('✅ Utilisez le cache pour les statistiques fréquentes');

    } catch (error) {
        console.error('Erreur lors des tests de performance:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDéconnexion de MongoDB');
    }
}

// Exécuter les tests
if (require.main === module) {
    runPerformanceTests();
}

module.exports = { runPerformanceTests }; 