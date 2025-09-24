const mongoose = require("mongoose")

, User =  new mongoose.Schema({
	avatar : { type: String, required : false},
	account : {
		password : { type: String, required : true},
        login : { type: String, required : true},
	}
})

,	Users = mongoose.model('users',User);

exports.createUserAccount = async (userData) => {
    const newUser = new Users(userData);
    try {
        return await newUser.save();
    } catch (error) {
        console.log(error);
    }
}

exports.findUserAccount = async (filterData) => {
    try {
        return await Users.findOne(filterData);
    } catch (error) {
        console.log(error);
    }
}

exports.findAllUserAccount = async (filter) => {
    try {
        return await Users.find(filter);
    } catch (error) {
        console.log(error);
    }
}

