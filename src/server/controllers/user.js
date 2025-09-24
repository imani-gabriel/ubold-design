const  userModel = require("../models/user")


exports.root = async (req, res) => {
	res.render("pages/");
}

exports.create = async (req, res) => {
	const userData = { contact : { mail : req.body.userMail, phone : req.body.userPhone}, fullname: req.body.userFullname, role: req.body.userAccount} 
		, newUser = new userModel(userData)
	newUser.save()
		.then( data => {
			res.json(data).status(200)
		})
		.catch( err => console.log(err) );
}

