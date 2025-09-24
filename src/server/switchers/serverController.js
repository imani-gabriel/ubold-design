const express = require("express")
const session = require("express-session");
const { Socket } = require("socket.io");
const { v4: uuidV4 } = require('uuid');
const MAX_AGE = 1000 * 60 * 60 * 24 * 3
//,	mongoURL = "mongodb+srv://inoha:VMuk1kAuOT7oOSp4@obs-cluster-1.zkovelh.mongodb.net/observa-db"
,   mongoURL = "mongodb://localhost:27017/observa-db"
const {
	PORT = process.env.PORT || 3001,
	NODE_ENV = 'development',
	SESS_NAME = 'session-obs',
	SESS_SECRET = uuidV4(),
	SESS_LIFETIME = MAX_AGE,
    IN_PROD = NODE_ENV === "production",
} = process.env;

const sessionMiddleware = session({
    name : SESS_NAME ,
    resave : false,
    saveUninitialized : true,
    secret : SESS_SECRET,
    cookie :{
        maxAge : SESS_LIFETIME,
        sameSite : true,
        secure : IN_PROD
    }
})

const initializeSession = (req, res, next) => {
	if (req.session.userAccount) {
		res.locals.userAccount = req.session.userAccount
	}
	next();
}

const corsConfig = {origin : 'http://localhost:'+PORT, credentials : "true",}

const wrap = (expressMiddleware) => (socket, next) => expressMiddleware(socket.request, {}, next)
 
module.exports = {sessionMiddleware,initializeSession, PORT, mongoURL, wrap, corsConfig };