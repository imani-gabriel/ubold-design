const mongoose = require("mongoose")

	, ThematicSchema = new mongoose.Schema({

		Annees: { type: Number, required: true, index: true },
		Semaines: { type: Number, required: true, index: true },
		ZoneDeSante: { type: String, required: true, index: true },
		Pop: { type: Number, required: true, index: true },
		Province: { type: String, required: true, index: true },
		DPS: { type: String, required: true, index: true },
		Cas: { type: Number, required: true, index: true },
		Deces: { type: Number, required: true, index: true },
		createAt: { type: Date, default: Date.now, required: true },
	}),
	Thematic = mongoose.model('thematics', ThematicSchema);

exports.create = async (thematicData) => {
	const newThematic = new Thematic(thematicData);
	try {
		return await newThematic.save();
	} catch (err) {
		console.log(err);
	}
}

exports.update = async (filter, updateData) => {
	try {
		return await Thematic.updateOne(filter, updateData);
	} catch (err) {
		console.log(err);
	}
}

exports.delete = async (filter) => {
	try {
		return await Thematic.deleteOne(filter);
	} catch (err) {
		console.log(err);
	}
}

exports.read = async (filter = {}) => {
	try {
		console.log("MODEL PROCESS");
		return JSON.stringify(await Thematic.find({}).count());
	} catch (err) {
		console.log(err);
	}
}

