// Script de test pour vérifier le chargement des données du choléra
const fs = require('fs');
const path = require('path');

async function testCholeraData() {
    try {
        console.log('🔍 Test du chargement des données du choléra...');
        
        // Vérifier que le fichier existe
        const filePath = path.join(__dirname, 'src/public/docs/cholera-db.json');
        if (!fs.existsSync(filePath)) {
            console.error('❌ Fichier cholera-db.json non trouvé:', filePath);
            return;
        }
        
        console.log('✅ Fichier trouvé:', filePath);
        
        // Charger et analyser les données
        const rawData = fs.readFileSync(filePath, 'utf8');
        const choleraData = JSON.parse(rawData);
        
        console.log('📊 Données chargées:', choleraData.length, 'enregistrements');
        
        // Analyser la structure
        if (choleraData.length > 0) {
            const sample = choleraData[0];
            console.log('📋 Structure des données:');
            console.log('  - Champs disponibles:', Object.keys(sample));
            console.log('  - Exemple:', sample);
            
            // Compter les provinces uniques
            const provinces = new Set(choleraData.map(item => item.Province));
            console.log('🗺️ Provinces uniques:', provinces.size);
            console.log('  - Liste:', Array.from(provinces).slice(0, 5), '...');
            
            // Compter les DPS uniques
            const dps = new Set(choleraData.map(item => item.DPS));
            console.log('🏛️ DPS uniques:', dps.size);
            console.log('  - Liste:', Array.from(dps).slice(0, 5), '...');
            
            // Compter les zones de santé uniques
            const zones = new Set(choleraData.map(item => item.ZoneDeSante));
            console.log('🏥 Zones de santé uniques:', zones.size);
            console.log('  - Liste:', Array.from(zones).slice(0, 5), '...');
            
            // Calculer les totaux
            const totalCas = choleraData.reduce((sum, item) => sum + (parseInt(item.Cas) || 0), 0);
            const totalDeces = choleraData.reduce((sum, item) => sum + (parseInt(item.Décès) || 0), 0);
            
            console.log('📈 Totaux:');
            console.log('  - Total cas:', totalCas.toLocaleString());
            console.log('  - Total décès:', totalDeces.toLocaleString());
            console.log('  - Taux de mortalité:', totalCas > 0 ? ((totalDeces / totalCas) * 100).toFixed(2) + '%' : '0%');
            
            // Période couverte
            const annees = new Set(choleraData.map(item => parseInt(item.Annees) || 0));
            const anneesArray = Array.from(annees).sort();
            console.log('📅 Période couverte:', anneesArray[0], '-', anneesArray[anneesArray.length - 1]);
            
        }
        
        console.log('✅ Test terminé avec succès!');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
    }
}

// Exécuter le test
testCholeraData(); 