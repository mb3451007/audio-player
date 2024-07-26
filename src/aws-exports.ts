// src/aws-exports.ts
const awsconfig = {
    Auth: {
      // REQUIRED - Amazon Cognito Region
      region: 'us-east-1',
      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: 'YOUR_USER_POOL_ID',
      // OPTIONAL - Amazon Cognito Web Client ID
      userPoolWebClientId: 'YOUR_WEB_CLIENT_ID',
    },
    Storage: {
      // REQUIRED - Amazon S3 bucket name
      bucket: 'ammar-432840',
      // REQUIRED - Amazon S3 region
      region: 'us-east-1',
    }
  };
  
  export default awsconfig;
  