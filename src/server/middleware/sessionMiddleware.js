const md5 = require('md5');
const { findUserAccount } = require('../models/user');

/**
 * Middleware pour vérifier et valider les cookies de session
 * Vérifie l'intégrité du cookie 'obs-auth-account' et restaure la session si valide
 */
const verifySessionCookie = async (req, res, next) => {
    try {
        // Si la session est déjà active, continuer
        if (req.session.userAccount) {
            return next();
        }

        // Vérifier si le cookie 'remember me' existe
        const authCookie = req.cookies['obs-auth-account'];
        if (!authCookie) {
            return next();
        }

        // Parser le cookie pour extraire l'ID utilisateur et le hash
        const [userId, cookieHash] = authCookie.split('`');
        if (!userId || !cookieHash) {
            // Cookie invalide, le supprimer
            res.clearCookie('obs-auth-account');
            return next();
        }

        // Trouver l'utilisateur dans la base de données
        const user = await findUserAccount({ _id: userId });
        if (!user) {
            // Utilisateur non trouvé, supprimer le cookie
            res.clearCookie('obs-auth-account');
            return next();
        }

        // Vérifier l'intégrité du hash du cookie
        const expectedHash = md5(`${md5(user.account.password)}-${md5(userId)}`);
        if (cookieHash !== expectedHash) {
            // Hash invalide, supprimer le cookie
            res.clearCookie('obs-auth-account');
            return next();
        }

        // Restaurer la session utilisateur
        req.session.userAccount = user;
        
        // Étendre la durée de vie du cookie
        res.cookie(
            'obs-auth-account',
            authCookie,
            { 
                maxAge: 1000 * 3600 * 24 * 7, // 7 jours
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            }
        );

        console.log('Session restaurée depuis le cookie persistant pour:', user.account.login);
        next();

    } catch (error) {
        console.error('Erreur lors de la vérification du cookie de session:', error);
        // En cas d'erreur, supprimer le cookie et continuer
        res.clearCookie('obs-auth-account');
        next();
    }
};




/**
 * Middleware pour persister la session utilisateur
 * Met à jour le cookie 'remember me' et rafraîchit la session
 */
const persistSession = (req, res, next) => {
    // Si l'utilisateur n'est pas connecté, continuer
    if (!req.session.userAccount) {
        return next();
    }

    // Rafraîchir la session
    req.session._garbage = Date();
    req.session.touch();

    // Si un cookie 'remember me' existe, le rafraîchir
    if (req.cookies['obs-auth-account']) {
        const authCookie = req.cookies['obs-auth-account'];
        res.cookie(
            'obs-auth-account',
            authCookie,
            { 
                maxAge: 1000 * 3600 * 24 * 7, // 7 jours
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            }
        );
    }

    next();
};

/**
 * Middleware pour restaurer automatiquement la session depuis le cookie
 * Doit être appliqué avant les routes protégées
 */
const restoreSessionFromCookie = async (req, res, next) => {
    try {
        // Si la session est déjà active, continuer
        if (req.session.userAccount) {
            return next();
        }

        // Vérifier et restaurer depuis le cookie
        await verifySessionCookie(req, res, () => {
            // Continuer vers le prochain middleware
            next();
        });

    } catch (error) {
        console.error('Erreur lors de la restauration de session:', error);
        next();
    }
};

/**
 * Middleware pour valider la session active
 * Vérifie si la session est valide et non expirée
 */
const validateActiveSession = (req, res, next) => {
    if (!req.session.userAccount) {
        return res.redirect('/');
    }

    // Vérifier si la session est expirée
    if (req.session.cookie.expires && req.session.cookie.expires < new Date()) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Erreur lors de la destruction de session expirée:', err);
            }
            res.clearCookie('obs-auth-account');
            return res.redirect('/');
        });
    }

    next();
};

/**
 * Middleware combiné pour la gestion complète des sessions
 * Combine vérification, restauration et validation
 */
const sessionGuard = async (req, res, next) => {
    try {
        // Étape 1: Tenter de restaurer depuis le cookie si pas de session active
        if (!req.session.userAccount) {
            await restoreSessionFromCookie(req, res, () => {});
        }

        // Étape 2: Valider la session (redirige si invalide)
        await validateActiveSession(req, res, () => {});

        // Étape 3: Persister la session si active
        await persistSession(req, res, () => {});

        next();

    } catch (error) {
        console.error('Erreur dans le session guard:', error);
        res.redirect('/');
    }
};

/**
 * Middleware global pour la vérification automatique de session
 * Vérifie si un cookie 'remember me' existe et restaure automatiquement la session
 * S'applique à toutes les routes pour maintenir l'utilisateur connecté
 */
const globalSessionAuth = async (req, res, next) => {
    try {
        console.log("Tester les sessions et cookies", req.session.userAccount, req.cookies['obs-auth-account']);
        
        // Si la session est déjà active, continuer
        if (req.session.userAccount) {
            console.log("Global session auth");
            return next();
        }
        
        // Vérifier si le cookie 'remember me' existe
        const authCookie = req.cookies['obs-auth-account'];
        if (authCookie && req.session.userAccount) {
            console.log("Global cookies auth");
            return next();
        }
        
        // Parser le cookie pour extraire l'ID utilisateur et le hash
        const [userId, cookieHash] = authCookie.split('`');
        if (!userId || !cookieHash) {
            return next();
        }
        
        // Trouver l'utilisateur dans la base de données
        const user = await findUserAccount({ _id: userId });
        if (!user) {
            return next();
        }
        
        // Vérifier l'intégrité du hash du cookie
        const expectedHash = md5(`${md5(user.account.password)}-${md5(userId)}`);
        if (cookieHash !== expectedHash) {
            return next();
        }
        
        // Restaurer la session utilisateur
        req.session.userAccount = user;
        
        // Étendre la durée de vie du cookie
        res.cookie(
            'obs-auth-account',
            authCookie,
            { 
                maxAge: 1000 * 3600 * 24 * 7, // 7 jours
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            }
        );
        
        console.log('Session restaurée automatiquement par middleware global pour:', user.account.login);
        next();
        
    } catch (error) {
        console.error('Erreur dans le middleware global d\'authentification:', error);
        next(); // Continuer même en cas d'erreur
    }
};

const checkSessionCookie = async(req, res, next) => {
    try {
        // Si la session est déjà active, continuer
        if (req.cookies['obs-auth-account']) {
            // Trouver l'utilisateur dans la base de données
            // Vérifier l'intégrité du hash du cookie
            
            const _id = req.cookies['obs-auth-account'].split('`')[0];
            const cookieHash = req.cookies['obs-auth-account'].split('`')[1];
            const user = await findUserAccount({ _id });

            console.log("User trouvé", user);
            const expectedHash = md5(`${md5(user.account.password)}-${md5(_id)}`);

            console.log("Cookie trouvé : \n", req.cookies['obs-auth-account']+'\n', cookieHash+'\n', expectedHash+'\n', cookieHash == expectedHash);
            
            if (cookieHash === expectedHash && user) {
                req.session.userAccount = user;
                // Hash invalide, supprimer le cookie
                console.log("Cookie invalide, supprimer le cookie");
                res.redirect('/healthcare/workspace/dashboard/')
                
            }
            
        }
        next()

    } catch (error) {
        console.error('Erreur lors de la vérification du cookie de session:', error);
        // En cas d'erreur, supprimer le cookie et continuer
        
        res.clearCookie('obs-auth-account');
        next()
    }
}

module.exports = {
    verifySessionCookie,
    persistSession,
    restoreSessionFromCookie,
    validateActiveSession,
    sessionGuard,
    globalSessionAuth,
    checkSessionCookie
};
