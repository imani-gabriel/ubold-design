const express = require("express")
	, router = express.Router()
	, thematicController = require("../controllers/thematic");


router.post("/create-data", thematicController.create)
router.get("/read-data", thematicController.read)
router.post("/upload-file-to-analyse", thematicController.uploadFileToAnalyse)


module.exports = router