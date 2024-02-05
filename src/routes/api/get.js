// src/routes/api/get.js

// Creating a router to mount API endpoints!
const express = require('express');
const router = express.Router();

// Importing all the utility functions helpful in creating the response!
const { createSuccessResponse, createErrorResponse } = require('../../response');
const {
  findFragmentWith,
  getAllFragments,
  convertFragment,
  analyzeIdParam,
  getFragmentType,
  getFragmentMetaData,
} = require('./fragmentsUtility');

// This API sends all the fragments of the user in an array!
router.get('/', (req, res) => {
  // If the requst has a query "expand = 1", the user is send all the fragments along with its meta data. Otherwise, just an array of fragments!
  //const fragments = getAllFragments(req.query.expand);
  res.status(200).json(createSuccessResponse({ fragments: [] }));
});

// This API get the id and sends the fragment associated with that id!
router.get('/:id', (req, res) => {
  // Checking the id send by the user!
  const { id } = req.params.id;

  // Analysing the id send by the user to check if the entension is included with the id or not!
  const { fragmentId, extension } = analyzeIdParam(id);

  // Getting the fragment with the id passed by the client!
  const fragment = findFragmentWith(fragmentId);

  // If no fragment exist with the passed id, responding with the error message!
  if (!fragment) {
    res
      .status(404)
      .json(
        createErrorResponse(
          404,
          `Check the id! There is no fragment stored with the id ${fragmentId}!`
        )
      );
    return;
  }

  // Storing the type of the fragment, if there is an extension type passed by the client or using the existing type of the fragment used while storing the fragment!
  const fragmentType = extension || getFragmentType(fragment);

  // Converting the fragment into the required type!
  const convertedFragment = convertFragment(fragment, fragmentType);

  // If the fragment cannot be converted into the required type, sending the appropriate error message!
  if (!convertedFragment) {
    res
      .status(415)
      .json(
        createErrorResponse(415, 'The fragment cannot be converted into the extension specified!')
      );
    return;
  }

  // Finally responding with the converted fragment!
  res.status(200).json(createSuccessResponse({ fragment: convertedFragment }));
});

// This API get the id and sends the metadata of the fragment associated with that id!
router.get('/:id/info', (req, res) => {
  // Checking the id send by the user!
  const { id } = req.params.id;
  const fragment = findFragmentWith(id);

  if (!fragment) {
    res
      .status(404)
      .json(
        createErrorResponse(404, `Check the id! There is no fragment stored with the id ${id}!`)
      );
    return;
  }

  // Getting the meta data of the fragment!
  const fragmentMetaData = getFragmentMetaData(fragment);

  // Responding to the request with the meta data of the fragment!
  res.status(201).json(createSuccessResponse({ fragment: fragmentMetaData }));
});

module.exports = router;
