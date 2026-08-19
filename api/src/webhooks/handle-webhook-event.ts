import { eq } from 'drizzle-orm'
import { WebhookEvent } from './webhook-event.ts'
import { db } from '@/infra/db/client.ts';
import { webhooksTable } from '@/infra/db/tables/webhooks.table.ts';
import { ResourceNotFoundError } from '@/errors/resource-not-found.error.ts';
import { webhookLogsTable } from '@/infra/db/tables/webhook-log.table.ts';
import { SignJWT } from 'jose'
import { uuidv7 } from 'uuidv7';

export async function handleWebhookEvent({
  deliverTo,
  webhookId,
  trigger,
  numberOfRetries,
  payload,
}: WebhookEvent) {
  const webhookLogId = uuidv7()

  const requestBody = JSON.stringify({
    trigger,
    payload,
  });

  try {
    const [webhook] = await db
      .select()
      .from(webhooksTable)
      .where(
        eq(webhooksTable.id, webhookId)
      )

    if(!webhook) {
      throw new ResourceNotFoundError('Organization webhook does not exist anymore.')
    }

    const encoder = new TextEncoder()
    const encodedSigningKey = encoder.encode(webhook.signingKey)

    const signJWT = new SignJWT({})
      .setJti(webhookLogId)
      .setExpirationTime('5 minutes')
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer('mintly')
      .setSubject(deliverTo)

    const jwt = await signJWT.sign(encodedSigningKey)

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Mintly-Signature': jwt,
    }

    await db.insert(webhookLogsTable).values({
      id: webhookLogId,
      ip: "asdasdasdasdasd",
      method: "POST",
      pathname: "",
      webhookId,
      status: 'PENDING',
      statusCode: 200,
      signingKey: webhook.signingKey,
      url: deliverTo,
      body: requestBody,
      headers: requestHeaders,
      errorReason: null,
      numberOfRetries,
    })

    const response = await fetch(deliverTo, {
      method: 'POST',
      body: requestBody,
      headers: requestHeaders,
    })

    const httpCode = response.status
    const responseBody = await response.text()

    const isErrorResponse = !response.ok

    await db
      .update(webhookLogsTable)
      .set({
        body: responseBody,
        statusCode: httpCode,
        errorReason: isErrorResponse
          ? `The endpoint "${deliverTo}" returned an error HTTP code.`
          : null,
        status: isErrorResponse ? 'FAILED' : 'SUCCESS',
        finishedAt: new Date(),
      })
      .where(eq(webhookLogsTable.id, webhookLogId))

    return { success: response.ok }
  } catch (err) {
    await db
      .update(webhookLogsTable)
      .set({
        status: 'FAILED',
        errorReason: `Failed to deliver the message to the endpoint, details: ${JSON.stringify(err)}`,
        finishedAt: new Date(),
      })
      .where(eq(webhookLogsTable.id, webhookLogId))

    return { success: false }
  }
}
