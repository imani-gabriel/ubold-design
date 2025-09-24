const mongoose = require('mongoose');
const Thematic = require('../models/thematic');

// Configuration MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/observa';

// Données de test
const PROVINCES = [
    'Kinshasa', 'Kongo Central', 'Kwango', 'Kwilu', 'Mai-Ndombe',
    'Kasai', 'Kasai Central', 'Kasai Oriental', 'Lomami', 'Sankuru',
    'Maniema', 'Sud-Kivu', 'Nord-Kivu', 'Ituri', 'Haut-Uele',
    'Bas-Uele', 'Tshopo', 'Mongala', 'Ubangi Nord', 'Ubangi Sud',
    'Equateur', 'Tshuapa'
];

const DPS_LIST = [
    'DPS Kinshasa', 'DPS Kongo Central', 'DPS Kwango', 'DPS Kwilu',
    'DPS Mai-Ndombe', 'DPS Kasai', 'DPS Kasai Central', 'DPS Kasai Oriental',
    'DPS Lomami', 'DPS Sankuru', 'DPS Maniema', 'DPS Sud-Kivu',
    'DPS Nord-Kivu', 'DPS Ituri', 'DPS Haut-Uele', 'DPS Bas-Uele',
    'DPS Tshopo', 'DPS Mongala', 'DPS Ubangi Nord', 'DPS Ubangi Sud',
    'DPS Equateur', 'DPS Tshuapa'
];

const ZONES_SANTE = [
    'Zone de Santé Kinshasa', 'Zone de Santé Matete', 'Zone de Santé Limete',
    'Zone de Santé Ngaliema', 'Zone de Santé Mont-Ngafula', 'Zone de Santé Selembao',
    'Zone de Santé Bumbu', 'Zone de Santé Masina', 'Zone de Santé Kimbanseke',
    'Zone de Santé N\'Sele', 'Zone de Santé Maluku', 'Zone de Santé N\'Djili',
    'Zone de Santé Kisenso', 'Zone de Santé Lemba', 'Zone de Santé Ngaba',
    'Zone de Santé Bandalungwa', 'Zone de Santé Barumbu', 'Zone de Santé Gombe',
    'Zone de Santé Kalamu', 'Zone de Santé Kasa-Vubu', 'Zone de Santé Lingwala'
];

// Fonction pour générer des données aléatoires
function generateRandomData(year, week, province, dps, zone) {
    const baseCases = Math.floor(Math.random() * 100) + 1;
    const baseDeaths = Math.floor(Math.random() * 20) + 1;
    
    // Variation saisonnière (plus de cas en saison des pluies)
    const seasonalFactor = 1 + (Math.sin((week / 52) * Math.PI) * 0.3);
    
    // Variation par province (certaines provinces plus touchées)
    const provinceFactor = province.includes('Kinshasa') ? 2.5 : 
                          province.includes('Kasai') ? 1.8 : 
                          province.includes('Kivu') ? 1.5 : 1.0;
    
    const cases = Math.floor(baseCases * seasonalFactor * provinceFactor);
    const deaths = Math.floor(baseDeaths * seasonalFactor * provinceFactor * 0.8);
    const population = Math.floor(Math.random() * 50000) + 10000;
    
    return {
        Annees: year,
        Semaines: week,
        ZoneDeSante: zone,
        Pop: population,
        Province: province,
        DPS: dps,
        Cas: cases,
        Deces: deaths,
        createAt: new Date()
    };
}

// Fonction pour générer des données par batch
async function generateBatch(startYear, endYear, batchSize = 1000) {
    const batch = [];
    
    for (let year = startYear; year <= endYear; year++) {
        for (let week = 1; week <= 52; week++) {
            for (let i = 0; i < PROVINCES.length; i++) {
                const province = PROVINCES[i];
                const dps = DPS_LIST[i];
                const zone = ZONES_SANTE[i % ZONES_SANTE.length];
                
                batch.push(generateRandomData(year, week, province, dps, zone));
                
                // Insérer par batch pour optimiser les performances
                if (batch.length >= batchSize) {
                    await Thematic.insertMany(batch, { ordered: false });
                    console.log(`✅ Batch inséré: ${batch.length} enregistrements (${year}, semaine ${week})`);
                    batch.length = 0; // Vider le batch
                }
            }
        }
    }
    
    // Insérer le dernier batch s'il reste des données
    if (batch.length > 0) {
        await Thematic.insertMany(batch, { ordered: false });
        console.log(`✅ Dernier batch inséré: ${batch.length} enregistrements`);
    }
}

// Fonction principale pour générer les données
async function generateTestData() {
    try {
        console.log('Connexion à MongoDB...');
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 50
        });

        // Vérifier si des données existent déjà
        const existingCount = await Thematic.countDocuments({});
        if (existingCount > 0) {
            console.log(`⚠️  Des données existent déjà (${existingCount.toLocaleString()} enregistrements)`);
            const response = await askConfirmation('Voulez-vous continuer et ajouter plus de données ? (y/N)');
            if (!response) {
                console.log('Génération annulée');
                return;
            }
        }

        console.log('\n=== GÉNÉRATION DE DONNÉES DE TEST ===');
        console.log('Génération de données pour 2000-2025 (26 années)');
        console.log(`${PROVINCES.length} provinces × 52 semaines × 26 années = ${PROVINCES.length * 52 * 26} enregistrements potentiels\n`);

        const startTime = Date.now();
        
        // Générer les données par période
        await generateBatch(2000, 2025, 5000);
        
        const endTime = Date.now();
        const totalTime = (endTime - startTime) / 1000;
        
        // Statistiques finales
        const finalCount = await Thematic.countDocuments({});
        const stats = await Thematic.collection.stats();
        
        console.log('\n=== RÉSUMÉ DE LA GÉNÉRATION ===');
        console.log(`✅ Enregistrements générés: ${finalCount.toLocaleString()}`);
        console.log(`⏱️  Temps total: ${totalTime.toFixed(2)} secondes`);
        console.log(`🚀 Vitesse: ${(finalCount / totalTime).toFixed(0)} enregistrements/seconde`);
        console.log(`💾 Taille des données: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        console.log(`💾 Taille du stockage: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
        
        // Recommandations
        console.log('\n=== PROCHAINES ÉTAPES ===');
        console.log('1. Exécutez le script createIndexes.js pour optimiser les performances');
        console.log('2. Exécutez le script performanceTest.js pour tester les performances');
        console.log('3. Utilisez les nouvelles routes API optimisées');

    } catch (error) {
        console.error('Erreur lors de la génération des données:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDéconnexion de MongoDB');
    }
}

// Fonction utilitaire pour demander confirmation (simulation)
async function askConfirmation(question) {
    // En production, vous pourriez utiliser readline ou une autre méthode
    console.log(question);
    return true; // Pour l'exemple, on accepte automatiquement
}

// Exécuter le script
if (require.main === module) {
    generateTestData();
}

module.exports = { generateTestData }; 