import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  // Point to LocalStack instead of real AWS
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://host.docker.internal:4566',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

export const db = DynamoDBDocumentClient.from(client);