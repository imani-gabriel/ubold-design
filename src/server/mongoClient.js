require('dotenv').config();
// Module de connexion MongoDB modulaire et CRUD générique
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/observa';
const dbName = process.env.MONGO_DB || 'observa';

let client = null;
let db = null;
async function connect() {
    if (db) return db;
    client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Augmente le pool de connexions
        socketTimeoutMS: 300000, // 5 min timeout
    });
    db = client.db(dbName);
    return db;
}

async function close() {
    if (client) await client.close();
    db = null;
    client = null;
}

// CRUD génériques
async function create(collection, data) {
    const database = await connect();
    const result = await database.collection(collection).insertOne(data);
    return result.ops ? result.ops[0] : result;
}

async function read(collection, query = {}, options = {}) {
    const database = await connect();
    return await database.collection(collection).find(query, options).toArray();
}

async function readOne(collection, query = {}, options = {}) {
    const database = await connect();
    return await database.collection(collection).findOne(query, options);
}

async function update(collection, query, updateDoc, options = {}) {
    const database = await connect();
    const result = await database.collection(collection).updateMany(query, { $set: updateDoc }, options);
    return result;
}

async function remove(collection, query, options = {}) {
    const database = await connect();
    const result = await database.collection(collection).deleteMany(query, options);
    return result;
}

// Fonction utilitaire pour obtenir une collection directement
async function getCollection(collectionName) {
    const db = await connect();
    return db.collection(collectionName);
}

module.exports = {
    connect,
    close,
    create,
    read,
    readOne,
    update,
    remove,
    getCollection, // Export de la nouvelle fonction
    ObjectId
};
