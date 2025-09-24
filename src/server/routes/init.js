const express = require("express")
	, router = express.Router()
	, path = require('path')
	, {checkSessionCookie} = require('../middleware/sessionMiddleware')
	, {authUser, signin, checkUserExist, accessUser, createUser, signup, choleraAnalysis, choleraDataset } = require("../controllers/init")
	, {redirectAuth, requireAuthWithPersistence, optionalAuth} = require('../switchers/serverAccessController')

/**
 * AUTHENTIFICATION ET IDENTIFICATION
 * COMPTE UTILISATEUR D'ACCES SYSTEME
 * @function authUser
 * @description : Cette la redirection principale
 * 
 * @function signin
 * @description inspection et cheking des info
 * d'authentification
 * 
 * @function accessUser
 * @description : Cette la redirection principale
 * 
 * @function redirectAuth
 * @description : Cette la redirection principale
 */
router.get("/", checkSessionCookie,  authUser)
router.post("/",checkUserExist, signin)
router.get("/dashboard", accessUser)

router.get("/user/create", signup)
router.get("/admin/starter", requireAuthWithPersistence, accessUser) 

// Routes d'authentification
router.get("/cholera/starter", optionalAuth, accessUser)

// Route pour l'analyse du choléra (côté client uniquement)
router.get('/cholera/cholera-analysis', choleraAnalysis)
router.get('/cholera/cholera-dataset', choleraDataset)

router.post("/user/create", createUser)

module.exports = router