// src/routes/api/get.js

// Importing all the utility functions helpful in creating the response!
const { createSuccessResponse, createErrorResponse } = require('../../response');
const Fragment = require('../../model/fragment');
const logger = require('../../logger');

// This API sends all the fragments of the user in an array!
const getFragments = async (req, res) => {
  logger.info(`Get all the fragments of user ${req.user}`);
  // Get the owner id from the request object.
  const ownerId = req.user;
  // If the requst has a query "expand = 1", the user is send all the fragments along with its meta data. Otherwise, just an array of fragments!
  try {
    const userFragments = await Fragment.getAllFragments(ownerId, req.query.expand);
    logger.info({ userFragments }, "List of user's fragment.");
    res.status(200).json(createSuccessResponse({ fragments: userFragments }));
  } catch (error) {
    logger.error('Internal Server Error');
    res.status(500).json(createErrorResponse(500, 'Internal Server Error!'));
  }
};

// This function separates the fragment id and the requested extension from the query in the url.
const extractExtensionRequested = (query) => {
  let fragmentId = query,
    requestedExtension = '';
  // Get the index of the "period".
  const extensionIndex = query.lastIndexOf('.');
  // If the period is present, update the value of fragmentId and requestedExtension.
  if (extensionIndex >= 0) {
    fragmentId = query.substring(0, extensionIndex);
    const receivedExtension = query.substring(extensionIndex);
    if (receivedExtension) requestedExtension = receivedExtension || 'None';
  }
  // Return the data.
  return { fragmentId, requestedExtension };
};

// This API get the id and sends the fragment associated with that id!
const getFragmentUsingId = async (req, res) => {
  // Get the fragment id send by the user.
  const { id } = req.params;
  // Get the requested extension if passed in the query.
  const { fragmentId, requestedExtension } = extractExtensionRequested(id);
  // Get the owner id from the request object.
  const ownerId = req.user;
  let fragmentMetaData, fragment;

  try {
    // Get the fragments meta data using the fragment id and owner id.
    fragmentMetaData = await Fragment.getFragment(ownerId, fragmentId);

    logger.debug({ fragmentMetaData }, `Fragment metadata ${id}`);

    // Create the fragment object by passing the fragment metadata.
    fragment = new Fragment(fragmentMetaData);
  } catch (error) {
    logger.error(`No fragments found with id ${id}`);
    res
      .status(404)
      .json(
        createErrorResponse(404, `Check the id! There is no fragment stored with the id ${id}!`)
      );
    return;
  }

  if (requestedExtension) {
    logger.debug(`Return the fragment in type ${requestedExtension}`);
    // Make sure that the request extension is convertable from the current extension.
    if (fragment.formats.includes(requestedExtension)) {
      // Call the function to get the data converted into the required format.
      try {
        const fragmentData = await fragment.getConvertedInto(requestedExtension);
        logger.debug({ fragmentData }, `Fragment data converted into ${requestedExtension}`);
        res.status(200).type(fragment.mimeTypeOf(requestedExtension)).send(fragmentData);
        return;
      } catch (error) {
        res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
        return;
      }
    } else {
      logger.error({ requestedExtension }, 'Unsupport extension demanded!');
      res
        .status(415)
        .json(
          createErrorResponse(415, 'The fragment cannot be converted into the extension specified!')
        );
      return;
    }
  }

  // Get fragment data.
  const fragmentData = await fragment.getData();

  // Send the requested fragments.
  res.status(200).type(fragment.mimeType).send(fragmentData);
};

// This API get the id and sends the metadata of the fragment associated with that id!
const getFragmentInfoUsingId = async (req, res) => {
  logger.debug('Get fragment info');
  // Getting the fragment id!
  const fragmentId = req.params.id;
  // Getting the fragment metadata with the fragment and owner id!
  const fragmentMetaData = await Fragment.getFragment(req.user, fragmentId);

  logger.debug(`Get fragment metadata of ${fragmentId}`);

  // Making sure the fragment meta data associated with the id received exists!
  if (!fragmentMetaData) {
    logger.warn({ fragmentId }, 'Non existing fragment id!');
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

  logger.debug({ fragmentMetaData }, 'Fragment Metadata');
  // Responding to the request with the meta data of the fragment!
  res.status(201).json(createSuccessResponse({ fragment: fragmentMetaData }));
};

module.exports = {
  getFragments,
  getFragmentUsingId,
  getFragmentInfoUsingId,
};
