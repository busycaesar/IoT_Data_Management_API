// src/index.js

// This helps to read variables from .env file! 
require('dotenv').config();

// Helps to log any crash/information required/vital while debugging!
const logger = require('./logger');

// If the app crashes due to an uncaught exception, it will be logged first.
process.on('uncaughtException',(err, origin)=>{
	logger.fatal({err, origin}, 'uncaughtException');
	throw err;
});

process.on('unhandledRejection',(reason, promise)=>{
	logger.fatal({reason, origin},'unhandledRejection');
	throw reason;
});

require('./server');
