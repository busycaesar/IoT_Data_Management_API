// tests/unit/get.test.js

const request = require('supertest');
const app = require('../../src/app');
const Fragment = require('../../src/model/fragment');
const hash = require('../../src/hash');
const markdownIt = require('markdown-it');
const md = markdownIt();
const fs = require('fs');
const absolutePath = 'tests/unit/sampleFile';

describe('GET /v1/fragments', () => {
  // Making sure for all the unauthorized requests, the status code of 401 is sent!
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // Checking the credentials for all the authorized requests!
  test('incorrect credentials are denied', () =>
    // Sending an invalid email and password using the auth subfunction of request function!
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    // Storing the response of the get request along with passing true credentials!
    const response = await request(app).get('/v1/fragments').auth('user1@email.com', 'ps1');
    // Making sure the status code of the response is correct!
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('Okay!');
    // Making sure that the data of Array type is returned in the response!
    expect(Array.isArray(response.body.fragments)).toBe(true);
  });

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users gets an array of correct fragments id', async () => {
    // Create fragments
    const hashedOwnerId = hash('user1@email.com');
    const fragMetadata1 = new Fragment({ id: 'rdmId', ownerId: hashedOwnerId, type: 'text/plain' }),
      fragMetadata2 = new Fragment({ id: 'rdmId2', ownerId: hashedOwnerId, type: 'text/plain' });
    // Store the fragments for the authenticated user!
    fragMetadata1.save();
    fragMetadata2.save();
    // Request the fragments for the autheticated user!
    // Storing the response of the get request along with passing true credentials!
    const response = await request(app).get('/v1/fragments').auth('user1@email.com', 'ps1');
    // Make sure the returned array is the same id as the stored ones!
    expect(response.body.fragments[0]).toBe('rdmId');
    expect(response.body.fragments[1]).toBe('rdmId2');
  });
});

describe('GET /v1/fragments/?expand=1', () => {
  test('Whole metadata is returned with expand query', async () => {
    // Create fragments
    const hashedOwnerId = hash('user1@email.com');
    const fragMetadata1 = new Fragment({ id: 'rdmId', ownerId: hashedOwnerId, type: 'text/plain' }),
      fragMetadata2 = new Fragment({ id: 'rdmId2', ownerId: hashedOwnerId, type: 'text/plain' });
    // Store the fragments for the authenticated user!
    fragMetadata1.save();
    fragMetadata2.save();
    // Request the fragments for the autheticated user!
    // Storing the response of the get request along with passing true credentials!
    const response = await request(app)
      .get('/v1/fragments/?expand=1')
      .auth('user1@email.com', 'ps1');
    // Make sure the returned array is the same id as the stored ones!
    expect(response.body.fragments[0].id).toBe('rdmId');
    expect(response.body.fragments[1].id).toBe('rdmId2');
    expect(response.body.fragments[0].ownerId).toBe(hashedOwnerId);
    expect(response.body.fragments[1].ownerId).toBe(hashedOwnerId);
  });
});

describe('GET /v1/fragments/:id/info', () => {
  const path = (id = 123) => `/v1/fragments/${id}/info`;

  // Authenticated user should get 404 if the fragment associated with the id passed doesnt exists!
  test('authenticated user passing the incorrect fragment id receive 404', async () => {
    // Passing the correct credentials with incorrect fragment id!
    const response = await request(app).get(path()).auth('user1@email.com', 'ps1');
    // Making sure it returns 404 since the id is incorrect!
    expect(response.status).toBe(404);
  });

  // Authenticated user should get 404 if the fragment associated with the id passed doesnt exists!
  test('authenticated user passing the correct fragment id receive the fragment data', async () => {
    // Getting the hash value of the owner's email!
    const hashId = hash('user1@email.com');
    // Creating the sample fragment metadata!
    const fragMetadata = new Fragment({
      id: 'dev',
      ownerId: hashId,
      type: 'text/plain',
    });
    // Storing the fragment metadata!
    fragMetadata.save();
    // Passing the correct credentials with incorrect fragment id!
    const response = await request(app).get(path('dev')).auth('user1@email.com', 'ps1');
    // Making sure it returns 404 since the id is incorrect!
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('Okay!');
    expect(response.body.fragment.id).toBe('dev');
    expect(response.body.fragment.ownerId).toBe(hashId);
  });
});

describe('GET /v1/fragments/:id.ext', () => {
  test('Authenticated user gets error with the incorrect fragment id', async () => {
    // Make GET request with invalid fragment id.
    const response = await request(app).get('/v1/fragments/657').auth('user1@email.com', 'ps1');
    // Make sure it returns Error 404.
    expect(response.status).toBe(404);
  });

  test('Authenticated user gets error with the unsupported and invalid extension requirement with valid fragment id', async () => {
    // Get owner id.
    const ownerId = hash('user1@email.com');
    // Create sample data.
    const data = 'Sample text/plain data';
    // Create a fragment metadata.
    const metaData = { id: '705PM', ownerId: ownerId, type: 'text/plain', size: 10 };
    // Create a fragment object.
    const fragment = new Fragment(metaData);
    // Store data into fragment object.
    await fragment.setData(data);
    // Store the fragment object.
    await fragment.save();
    // Make the get request
    const response1 = await request(app)
        .get('/v1/fragments/705PM.png')
        .auth('user1@email.com', 'ps1'),
      response2 = await request(app).get('/v1/fragments/705PM.dev').auth('user1@email.com', 'ps1');
    // Make sure it return Error code 415.
    expect(response1.status && response2.status).toBe(415);
  });

  test("Authenticated user gets the existing fragment's data with the expected content-type", async () => {
    // Get owner id
    const ownerId = hash('user1@email.com');
    // Create a fragment data (type = text/plain)
    const data =
      'Today is 11th of March 2024 and I am working in my CCP assignment 2. It is really fun learning cloud computing.';
    // Create a fragment metadata
    const metaData = { id: '122PM', ownerId: ownerId, type: 'text/plain' };
    const fragment = new Fragment(metaData);
    await fragment.setData(data);
    // Store the fragment
    await fragment.save();
    // Make the get request
    const response = await request(app).get('/v1/fragments/122PM').auth('user1@email.com', 'ps1');
    // Make sure the exact data is received with the same content type.
    expect(response.text).toBe(data);
  });

  test("Authenticated user gets the existing fragment's data converted to a supported content-type", async () => {
    // Get owner id
    const ownerId = hash('user1@email.com');
    // Create a fragment data (type = text/markdown)
    const markdownData = `
      # Sample Markdown Data

      This is a sample markdown text stored in a JavaScript variable.

      ## Lists
      - Item 1
      - Item 2
      - Item 3

      ## Code Example
      \`\`\`javascript
      function greet(name) {
          console.log("Hello, " + name + "!");
      }
      greet("World");
      \`\`\` `;
    // Create a fragment metadata
    const metaData = { id: '529PM', ownerId: ownerId, type: 'text/markdown' };
    // Create a fragment object and pass the metadata.
    const fragment = new Fragment(metaData);
    // Store the data into the fragment object.
    await fragment.setData(markdownData);
    // Store the fragment
    await fragment.save();
    // Make the get request
    const response = await request(app)
      .get('/v1/fragments/529PM.html')
      .auth('user1@email.com', 'ps1');
    // Make sure the data is received of HTML type.
    expect(response.text).toBe(md.render(markdownData));
  });

  test("Authenticated user gets the existing fragment's data converted to a supported content-type for image", async () => {
    //  Post the image data.
    const data = fs.readFileSync(`${absolutePath}/profile.jpeg`);
    const response = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'ps1')
        .set('Content-Type', 'image/jpeg')
        .send(data),
      // Getting the metadata from of the data posted!
      fragmentId = response.body.fragment.id;
    // Request the image in png extension.
    const getResponse = await request(app)
      .get(`/v1/fragments/${fragmentId}.png`)
      .auth('user1@email.com', 'ps1');
    expect(getResponse.headers['content-type']).toBe('image/png');
  });

  test("Authenticated user gets the existing fragment's data converted to a supported content-type for application/json", async () => {
    //  Post the data.
    const data = fs.readFileSync(`${absolutePath}/sample.json`, 'utf-8');
    const response = await request(app)
        .post('/v1/fragments')
        .auth('user1@email.com', 'ps1')
        .set('Content-Type', 'application/json')
        .send(data),
      // Getting the metadata from of the data posted!
      fragmentId = response.body.fragment.id;
    // Request the image in png extension.
    const getResponse = await request(app)
      .get(`/v1/fragments/${fragmentId}.txt`)
      .auth('user1@email.com', 'ps1');
    expect(getResponse.headers['content-type']).toMatch(/^text\/plain/);
  });
});
