const  {createUserAccount, findUserAccount} = require("../models/user")
,	md5 = require('md5')
,   multer = require("multer")
,   obsStorage = multer.diskStorage({
                    destination: (req, file, cb) => {
                        cb(null, './store/userAccount');
                    },
                    filename: (req, file, cb) => {
						
                        console.log("Fichier uploader : ", file);
                        cb(null, ((`OBS-${Math.random().toString(7, 7).substr(2, 5)}-${(0 | new Date % 9e6).toString(36)}-IMG.`).toUpperCase() + file.originalname.split('.')[1]))
                    }
                })
, obsUpload = multer({
    storage: obsStorage
}).single("obsFile");

exports.authUser = async (req, res) => {
	// Sinon, afficher la page d'authentification
	res.render("index", {layout:"./layouts/auth", targetPage : "auth"});
}

exports.accessUser = async (req, res) => {
	res.render("pages/dashboard", {layout:"./layouts/main", targetPage : "dashboard", userAccount : req.session.userAccount})
}

exports.choleraAnalysis = async (req, res) => {
	res.render("pages/master/cholera-analysis", {layout:"./layouts/main"})
}

exports.choleraDataset = async (req, res) => {
	res.render("pages/master/cholera-dataset", {layout:"./layouts/main"})
}

exports.signup = async(req, res) => {
		const { userlogin, userpassword, } = req.body
	 const newUser = await createUserAccount({
		account:{password:md5(userpassword), login:userlogin},
	})
	console.log(newUser); 
}

exports.signin = async(req, res) => {
	const { account, _id} = res.existingUser
	console.log("REDIRECT TEST : ", account, _id);
		
		console.log("ACCESS DETECTED");
		
		if (res.existingUser) {
			console.log("User trouvé RES.EXISTINGUSER", res.existingUser);
			
			req.session.userAccount = res.existingUser
			if(req.body['remember-session']){
				res.cookie(
					'obs-auth-account',
					_id+'`'+md5(`${md5(account.password)}-${md5(_id)}`),
					{ maxAge : 1000 * 3600 * 24 * 7, httpOnly:true}
				)
			}
			return res.redirect("/healthcare/workspace/dashboard/")
		}
		res.redirect("/")
}

exports.createUser = async (req, res) => {
    await obsUpload(req, res, err => {
		return console.log("Include in obsUpload", req.body, req.file);
        const { number, role, zone, description, district, city, manager, idSchool}  = JSON.parse(req.body['user-data'])
        ,   address = `${number}|${rue}|${district}|${city}|${zone}`
		,	avatar = req.file.filename
		,	account = {role}
		,	newUserData = {contact:{mail,phone},firstname, lastname, name}
        createUserAccount(newUserData)
            .then(data => {
                console.log(data);
                return res.json({ flash:"succMsg", data:JSON.stringify(data)})
            }).catch(err=>{ return console.log(err)})
    })
}

// Middleware pour vérifier l'existence d'un utilisateur
exports.checkUserExist = async (req, res, next) => {
    try {
        const {userlogin, userpassword } = req.body;
        console.log("User login : ", userlogin);
        console.log("User password : ", md5(userpassword));
        if (!userlogin) {
			return res.redirect("/")
		}
        
        // Vérifier si l'utilisateur existe dans la base de données
        const existingUser = await findUserAccount({ "account.login":userlogin, "account.password":md5(userpassword) });
        
        if (existingUser) {
            // L'utilisateur existe, on attache les infos à la requête pour les utiliser plus tard
			console.log("user exist",existingUser);
			
            res.existingUser = existingUser;
            return next();
        } else {
            // L'utilisateur n'existe pas
			console.log("User not found");
			return res.redirect("/")
        }
        
    } catch (error) {
        console.error("Erreur lors de la vérification de l'utilisateur:", error);
    
		return res.redirect("/")
    }
}

exports.redirectAuth = async (req, res, next) => {
    if (!req.session.userAccount) {
        return res.redirect("/")
    }
    next()
}

