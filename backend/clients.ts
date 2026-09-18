import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { db } from './db';
import { success, error } from './responses';

const TABLE_NAME = process.env.CLIENTS_TABLE!;
// Hardcoded temporarily until Patch 9 (Local Auth)
const MOCK_USER_ID = 'demo-user-1'; 

export const handler: APIGatewayProxyHandler = async (event) => {
  const method = event.httpMethod;
  const clientId = event.pathParameters?.clientId;

  try {
    if (method === 'GET' && !clientId) {
      // List all clients for this user
      const { Items } = await db.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'userId = :u',
        ExpressionAttributeValues: { ':u': MOCK_USER_ID }
      }));
      return success(Items || []);
    }

    if (method === 'POST') {
      // Create a new client
      const body = JSON.parse(event.body || '{}');
      const newClient = {
        userId: MOCK_USER_ID,
        clientId: randomUUID(),
        name: body.name,
        email: body.email,
        createdAt: new Date().toISOString()
      };
      await db.send(new PutCommand({ TableName: TABLE_NAME, Item: newClient }));
      return success(newClient, 201);
    }

    if (method === 'GET' && clientId) {
      // Get one specific client
      const { Item } = await db.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId: MOCK_USER_ID, clientId }
      }));
      return Item ? success(Item) : error(404, 'Client not found');
    }

    if (method === 'DELETE' && clientId) {
      // Delete a client
      await db.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { userId: MOCK_USER_ID, clientId }
      }));
      return success({ deleted: true });
    }

    return error(400, 'Unsupported route');
  } catch (err: any) {
    return error(500, err.message);
  }
};