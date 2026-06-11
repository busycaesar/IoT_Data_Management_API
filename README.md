# CloudShards

## Video Explaination
[<img src="https://img.youtube.com/vi/xJ_gedeHwtw/0.jpg" width="500" height="375"
/>](https://www.youtube.com/embed/xJ_gedeHwtw)

## Description
This microservice project is engineered to efficiently store, retrieve, and manage diverse data fragments through APIs, facilitating seamless integration with IoT devices in industrial environments. The service utilizes **AWS Cognito** for robust authentication, ensuring secure interactions between authorized devices and users. The CI/CD pipeline is meticulously designed to automate comprehensive testing and ensure seamless, reliable deployment.

The **Continuous Integration (CI)** workflow is initiated upon commits being pushed to GitHub. The CI pipeline encompasses a series of rigorous jobs, including executing all unit and integration tests, and performing lint checks across the codebase to enforce stringent coding standards. Following the successful completion of these checks, the Docker container is built and subsequently pushed to DockerHub, ensuring that only validated code is deployed.

The **Continuous Deployment (CD)** workflow is activated when a new version tag is pushed to GitHub. This workflow involves building the latest code and pushing the resulting image to **Amazon ECR**. Utilizing GitHub secrets, AWS credentials are securely configured to log into Amazon ECR. The workflow updates the ECS task definition with the newly built image ID, and the updated task definition is deployed to **Amazon ECS**. This process guarantees that the service operates with the latest version, configured with the appropriate environment variables for production deployment.

## Tech Stack
<img src="https://skillicons.dev/icons?i=nodejs,express,jest,docker,aws,githubactions,dynamodb" />

## System Architecture

![System Architecture](https://github.com/user-attachments/assets/2c9faf12-2476-4e6f-8617-9c0d0bd37140)

## List of APIs
**Note**: All the requests should have the authorization token in the Header. 

### GET 
1. `/v1/fragments`: Get an array of fragments stored by the user.
2. `/v1/fragments/:id`: Get the fragment stored using its id.
3. `/v1/fragments/:id.ext`: Get the fragment stored using its id converted in the required and supported type.
4. `/v1/fragments/:id/info`: Get the metadata of the fragmented using its id.

### POST
1. `/v1/fragments`: Store a new fragment.
- **Requirements**: The header should have a Content Type property, the value of which would be the type of the fragment the user intends to store.
- **Returns**: Once the fragment is stored successfully, this request returns a location property in the response. This property includes a URL which can be used to access the stored fragment.

### PUT
1. `/v1/fragments/:id`: Update an existing fragment.

*Note: Type of the fragment cannot be updated once its created.*

### DELETE
1. `/v1/fragments/:id`: Update an existing fragment.

## How to run the project

Clone this repository and install all the dependencies using `npm install`.

### Start the server in `dev` mode

```bash
npm run dev
```

### Start the server in `prod` mode

```bash
npm start
```
