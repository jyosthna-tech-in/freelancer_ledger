import { APIGatewayProxyHandler } from 'aws-lambda';
import { GetCommand, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { db } from './db';
import { success, error } from './responses';

const PAYMENTS_TABLE = process.env.PAYMENTS_TABLE!;
const INVOICES_TABLE = process.env.INVOICES_TABLE!;
const MOCK_USER_ID = 'demo-user-1';

export const handler: APIGatewayProxyHandler = async (event) => {
  const method = event.httpMethod;
  const invoiceId = event.pathParameters?.invoiceId;
  const paymentId = event.pathParameters?.paymentId;

  try {
    // GET /invoices/{invoiceId}/payments
    if (method === 'GET' && invoiceId) {
      const { Items } = await db.send(new QueryCommand({
        TableName: PAYMENTS_TABLE,
        KeyConditionExpression: 'userId = :u',
        FilterExpression: 'invoiceId = :i',
        ExpressionAttributeValues: { ':u': MOCK_USER_ID, ':i': invoiceId }
      }));
      return success(Items || []);
    }

    // POST /invoices/{invoiceId}/payments
    if (method === 'POST' && invoiceId) {
      const body = JSON.parse(event.body || '{}');
      const newPaymentAmount = body.amountMinor || 0;

      // 1. Fetch the invoice to check the total
      const { Item: invoice } = await db.send(new GetCommand({
        TableName: INVOICES_TABLE,
        Key: { userId: MOCK_USER_ID, invoiceId }
      }));
      if (!invoice) return error(404, 'Invoice not found');

      // 2. Fetch existing payments to calculate what has already been paid
      const { Items: payments } = await db.send(new QueryCommand({
        TableName: PAYMENTS_TABLE,
        KeyConditionExpression: 'userId = :u',
        FilterExpression: 'invoiceId = :i',
        ExpressionAttributeValues: { ':u': MOCK_USER_ID, ':i': invoiceId }
      }));
      const totalPaidSoFar = (payments || []).reduce((sum, p) => sum + (p.amountMinor || 0), 0);

      // 3. Prevent overpayment
      if (totalPaidSoFar + newPaymentAmount > invoice.amountMinor) {
        return error(400, 'Payment would exceed invoice total');
      }

      // 4. Save the payment
      const newPayment = {
        userId: MOCK_USER_ID,
        paymentId: randomUUID(),
        invoiceId,
        amountMinor: newPaymentAmount,
        createdAt: new Date().toISOString()
      };
      await db.send(new PutCommand({ TableName: PAYMENTS_TABLE, Item: newPayment }));
      return success(newPayment, 201);
    }

    // DELETE /payments/{paymentId}
    if (method === 'DELETE' && paymentId) {
      await db.send(new DeleteCommand({
        TableName: PAYMENTS_TABLE,
        Key: { userId: MOCK_USER_ID, paymentId }
      }));
      return success({ deleted: true });
    }

    return error(400, 'Unsupported route');
  } catch (err: any) {
    return error(500, err.message);
  }
};