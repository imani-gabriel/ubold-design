const redirectAuth = (req, res, next)=>{
	if (!req.session.userAccount) {
		res.redirect('/')
	} else {
		next()
	}
}

/**
 * Middleware d'authentification amélioré avec restauration de session
 * Vérifie la session active et tente de restaurer depuis le cookie persistant
 */
const requireAuth = async (req, res, next) => {
	try {
		// Importer le middleware de session
		const { restoreSessionFromCookie, validateActiveSession } = require('../middleware/sessionMiddleware');
		
		// Étape 1: Tenter de restaurer la session depuis le cookie si aucune session active
		if (!req.session.userAccount) {
			await new Promise((resolve, reject) => {
				restoreSessionFromCookie(req, res, (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		}
		
		// Étape 2: Valider la session active
		if (!req.session.userAccount) {
			return res.redirect('/');
		}
		
		// Étape 3: Continuer vers la route protégée
		next();
		
	} catch (error) {
		console.error('Erreur dans le middleware requireAuth:', error);
		res.redirect('/');
	}
};

/**
 * Middleware pour les routes nécessitant une authentification avec persistance
 * Combine restauration, validation et persistance de session
 */
const requireAuthWithPersistence = async (req, res, next) => {
	try {
		// Importer le middleware de session
		const { sessionGuard } = require('../middleware/sessionMiddleware');
		
		// Utiliser le guard complet de session
		await new Promise((resolve, reject) => {
			sessionGuard(req, res, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
		
		next();
		
	} catch (error) {
		console.error('Erreur dans le middleware requireAuthWithPersistence:', error);
		res.redirect('/');
	}
};

/**
 * Middleware optionnel pour vérifier l'authentification sans forcer la redirection
 * Utile pour les routes qui peuvent être accessibles avec ou sans authentification
 */
const optionalAuth = async (req, res, next) => {
	try {
		// Importer le middleware de session
		const { restoreSessionFromCookie } = require('../middleware/sessionMiddleware');
		
		// Tenter de restaurer la session depuis le cookie si aucune session active
		if (!req.session.userAccount) {
			await new Promise((resolve, reject) => {
				restoreSessionFromCookie(req, res, (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
		}
		
		// Continuer dans tous les cas (authentifié ou non)
		next();
		
	} catch (error) {
		console.error('Erreur dans le middleware optionalAuth:', error);
		next(); // Continuer même en cas d'erreur
	}
};
 
module.exports = { redirectAuth, requireAuth, requireAuthWithPersistence, optionalAuth };