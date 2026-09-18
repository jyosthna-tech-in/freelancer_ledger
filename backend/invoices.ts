import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand, PutCommand, DeleteCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { db } from './db';
import { success, error } from './responses';

const TABLE_NAME = process.env.INVOICES_TABLE!;
const MOCK_USER_ID = 'demo-user-1'; 

export const handler: APIGatewayProxyHandler = async (event) => {
  const method = event.httpMethod;
  const invoiceId = event.pathParameters?.invoiceId;
  const clientId = event.pathParameters?.clientId;

  try {
    // GET /clients/{clientId}/invoices
    if (method === 'GET' && clientId && !invoiceId) {
      const { Items } = await db.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'userId = :u',
        FilterExpression: 'clientId = :c',
        ExpressionAttributeValues: { ':u': MOCK_USER_ID, ':c': clientId }
      }));
      return success(Items || []);
    }

    // POST /clients/{clientId}/invoices
    if (method === 'POST' && clientId) {
      const body = JSON.parse(event.body || '{}');
      const newInvoice = {
        userId: MOCK_USER_ID,
        invoiceId: randomUUID(),
        clientId: clientId,
        amountMinor: body.amountMinor || 0, // Cents/minor units only
        status: 'draft',
        dueDate: body.dueDate,
        description: body.description,
        createdAt: new Date().toISOString()
      };
      await db.send(new PutCommand({ TableName: TABLE_NAME, Item: newInvoice }));
      return success(newInvoice, 201);
    }

    // GET /invoices/{invoiceId}
    if (method === 'GET' && invoiceId) {
      const { Item } = await db.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: { userId: MOCK_USER_ID, invoiceId }
      }));
      return Item ? success(Item) : error(404, 'Invoice not found');
    }

    // PUT /invoices/{invoiceId}
    if (method === 'PUT' && invoiceId) {
      const body = JSON.parse(event.body || '{}');
      const { Attributes } = await db.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { userId: MOCK_USER_ID, invoiceId },
        UpdateExpression: 'set #s = :s, amountMinor = :a',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':s': body.status, ':a': body.amountMinor },
        ReturnValues: 'ALL_NEW'
      }));
      return success(Attributes);
    }

    // DELETE /invoices/{invoiceId}
    if (method === 'DELETE' && invoiceId) {
      await db.send(new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { userId: MOCK_USER_ID, invoiceId }
      }));
      return success({ deleted: true });
    }

    return error(400, 'Unsupported route');
  } catch (err: any) {
    return error(500, err.message);
  }
};