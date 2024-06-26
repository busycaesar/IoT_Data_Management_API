// src/routes/api/index.js

// Creating a router to mount API endpoints!
const express = require('express');
const router = express.Router();
require('dotenv').config();

const { getFragments, getFragmentUsingId, getFragmentInfoUsingId } = require('./get');
const { postFragment } = require('./post');
const { deleteFragment } = require('./delete');
const { updateFragment } = require('./put');
const rawBody = require('./rawBody');

// HTTP request methods for /fragments API!

// GET method!
router.get('/fragments', getFragments);
router.get('/fragments/:id', getFragmentUsingId);
router.get('/fragments/:id/info', getFragmentInfoUsingId);

// POST method
router.post('/fragments', rawBody(), postFragment);

// PUT method
router.put('/fragments/:id', rawBody(), updateFragment);

// DELETE method
router.delete('/fragments/:id', deleteFragment);

module.exports = router;
