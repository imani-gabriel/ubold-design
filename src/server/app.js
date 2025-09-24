require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Configuration pour augmenter la limite de taille du payload
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// Augmenter la limite de taille du payload
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true })); 