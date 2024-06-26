// src/auth/basic-auth.js

const auth = require('http-auth');
const authPassport = require('http-auth-passport');
const authorize = require('./auth-middleware');

// Making sure that the HTPASSWD_FILE is defined before performing any logic!
if (!process.env.HTPASSWD_FILE)
  throw new Error('Missing expected environmental variable: HTPASSWD_FILE!');

module.exports.strategy = () =>
  // This passport authentication strategy, looks for a username/password pair in the authorization header!
  authPassport(
    auth.basic({
      file: process.env.HTPASSWD_FILE,
    })
  );

module.exports.authenticate = () => authorize('http');
