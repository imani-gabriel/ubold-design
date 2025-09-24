const express = require("express")
,	session = require("express-session")
,	cookieParser = require('cookie-parser')
,	expressLayouts = require('express-ejs-layouts')
,	app = express()
,	fs = require('fs')
,	cors = require('cors')
,	https = require('https')
,	server = require('http').Server(app)
,	{ v4: uuidV4 } = require('uuid')
,	{ config } = require("process")
,	path = require("path")
,	mongoose = require("mongoose")
,   db = mongoose.connection
,	user = require("./server/routes/user")  
,	thematic = require("./server/routes/thematic")
,	started = require("./server/routes/init")
,   {authorizeUser} = require('./server/switchers/socketIOController')
,	{sessionMiddleware, initializeSession, PORT, mongoURL, wrap, corsConfig} = require('./server/switchers/serverController')
,	io = require('socket.io')(server, { cors : corsConfig})

app.use(cookieParser())
app.use(cors({origin:corsConfig}))
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set('layout', 'layouts/main')
app.use(express.static(path.join(__dirname,"public")))
app.use(express.static(path.join(__dirname,"store")))
app.use("/cholera/starter", express.static(path.join(__dirname, "public")));
app.use("/healthcare/workspace", express.static(path.join(__dirname, "public")));
app.use("/healthcare/workspace/dashboard", express.static(path.join(__dirname, "public")));
app.use("/cholera/cholera-analysis", express.static(path.join(__dirname, "public")));
app.use("/cholera/cholera-dataset", express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}))

app.use(sessionMiddleware);
app.use(initializeSession);

mongoose.set('strictQuery', true)
mongoose.connect(mongoURL);

db.on("error", (error) => console.log(error))
db.once("open", () => console.log("Connect to Database OBS-LABS"))

app.use("/user", user);
app.use("/thematic", thematic);
app.use("/healthcare/workspace", started);
app.get("*", (req, res) => {
	return res.redirect("/healthcare/workspace/")
})

io.use(wrap(sessionMiddleware))
io.use(authorizeUser);

io.on('connection', socket => {
	console.log("socket session connected");
})

server.listen(PORT,()=>{
	console.log(`Start server at ${Date()}, sur le port ${PORT}`)
})