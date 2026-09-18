import { APIGatewayProxyHandler } from 'aws-lambda';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { db } from './db';
import { success, error } from './responses';

const INVOICES_TABLE = process.env.INVOICES_TABLE!;
const PAYMENTS_TABLE = process.env.PAYMENTS_TABLE!;
const MOCK_USER_ID = 'demo-user-1';

export const handler: APIGatewayProxyHandler = async (event) => {
  const clientId = event.pathParameters?.clientId;
  if (!clientId) return error(400, 'Missing clientId');

  try {
    // 1. Get all invoices for this client
    const { Items: invoices } = await db.send(new QueryCommand({
      TableName: INVOICES_TABLE,
      KeyConditionExpression: 'userId = :u',
      FilterExpression: 'clientId = :c',
      ExpressionAttributeValues: { ':u': MOCK_USER_ID, ':c': clientId }
    }));

    // 2. Get all payments across the entire user account
    const { Items: allPayments } = await db.send(new QueryCommand({
      TableName: PAYMENTS_TABLE,
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues: { ':u': MOCK_USER_ID }
    }));

    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;
    const now = new Date().toISOString();

    // 3. Calculate ledger totals
    for (const inv of invoices || []) {
      if (inv.status === 'cancelled') continue;

      const invAmount = inv.amountMinor || 0;
      const invPayments = (allPayments || []).filter(p => p.invoiceId === inv.invoiceId);
      const paidForInv = invPayments.reduce((sum, p) => sum + (p.amountMinor || 0), 0);
      const balance = invAmount - paidForInv;

      totalInvoiced += invAmount;
      totalPaid += paidForInv;

      // Drafts don't count as outstanding because they haven't been sent to the client yet
      if (inv.status !== 'draft') {
        totalOutstanding += balance;
        
        // If they still owe money and the due date has passed
        if (balance > 0 && inv.dueDate && inv.dueDate < now) {
          totalOverdue += balance;
        }
      }
    }

    return success({
      clientId,
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      totalOverdue
    });
  } catch (err: any) {
    return error(500, err.message);
  }
};