export const getServerlessFile = modelName => {
  return `service: orbital-backend-${modelName}
# You can pin your service to only deploy with a specific Serverless version
# Check out our docs for more details
# frameworkVersion: "=X.X.X"
provider:
  name: aws
  runtime: nodejs8.10

  # you can overwrite defaults here
  stage: dev
  region: us-east-1

functions:
  app:
    handler: handler.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY

plugins:
  - serverless-http
  - serverless-offline
  `;
};
