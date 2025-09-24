const thematicModel = require("../models/thematic");
const userModel = require("../models/user");
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const excelServiceFactory = require('../services/excelService');
const { getCollection } = require('../mongoClient');


// Config multer (stockage local dans dossier 'uploads')
const obsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("Upload storage", req.file, req.body);
        const uploadDir = path.join(__dirname, '../../store/doc-analyze/');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Préfixer avec date pour éviter les collisions
        const uniqueSuffix = 'obs-'+Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});


exports.create= async (req, res) => {
    
	try {
		const newThematic = await thematicModel.create(req.body);
        res.status(200).json({data:newThematic})
	} catch (err) {
		console.log(err);
	}

}

exports.read = async (req, res) => {
	/* try {
		const data = await thematicModel.read();
		console.log('Thematic data:', data);
        return ;
		res.status(200).json(data);
	} catch (err) {
		console.error('Error reading thematic data:', err);
		res.status(500).json({ error: 'Internal server error', details: err.message });
	} */
    const data = await thematicModel.read();
    console.log("data", data);
    return
    res.status(200).json(data);
}

const upload = multer({
    storage: obsStorage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
    fileFilter: function (req, file, cb) {
        // Autoriser seulement xlsx, xls, csv
        const allowed = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non supporté'));
        }
    }
});

exports.uploadFileToAnalyse = async (req, res) => {
    upload.single('file')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Aucun fichier reçu.' });
        }
        try {
            // Récupérer la collection souhaitée (par défaut 'records' si non spécifiée)
            const collectionName = req.body.collection || 'thematic';
            const collection = await getCollection(collectionName);
            
            // Initialiser le service avec la collection
            const excelService = excelServiceFactory(collection);
            
            // Traiter le fichier Excel
            const buffer = fs.readFileSync(req.file.path);
            const result = await excelService.processExcel(buffer);
            
            // Supprimer le fichier après traitement
            fs.unlinkSync(req.file.path);
            
            // Réponse de succès
            res.status(200).json({
                success: true,
                message: 'Fichier traité avec succès',
                collection: collectionName,
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                res: result
            });
            
        } catch (error) {
            // En cas d'erreur, supprimer le fichier s'il existe
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            console.error('Erreur lors du traitement du fichier:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Une erreur est survenue lors du traitement du fichier'
            });
        }
    });
};


