const mongoose = require("mongoose")

, Team =  new mongoose.Schema({
	
	label : { type: String, required : true },
	hot : { type: String, required : true }
});


module.exports = mongoose.model('team',Team)

let teams = module.exports = mongoose.model('team',Team);
