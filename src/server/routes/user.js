const express = require("express")
	, router = express.Router()
	, controller = require("../controllers/user");





router.post("/create", controller.create)




router.get("/",controller.root)


module.exports = router