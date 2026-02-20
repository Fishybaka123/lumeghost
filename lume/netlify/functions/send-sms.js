const twilio = require('twilio');

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ success: false, error: 'Method Not Allowed' }) };
    }

    let parsed;
    try {
        parsed = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Invalid JSON body' }) };
    }

    const { to, body, accountSid: reqSid, authToken: reqToken, fromNumber: reqFrom, messagingServiceSid: reqMsgSid } = parsed;

    if (!to || !body) {
        return { statusCode: 400, body: JSON.stringify({ success: false, error: 'Missing "to" or "body"' }) };
    }

    // Prioritize request params (Multi-tenant), fallback to Env (Single-tenant/Dev)
    const accountSid = reqSid || process.env.TWILIO_ACCOUNT_SID;
    const authToken = reqToken || process.env.TWILIO_AUTH_TOKEN;
    const fromValue = reqFrom || reqMsgSid || process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromValue) {
        return { statusCode: 500, body: JSON.stringify({ success: false, error: 'Missing Twilio credentials. Please configure in Settings > Integrations.' }) };
    }

    try {
        const client = twilio(accountSid, authToken);

        // Detect Messaging Service SID (starts with "MG") vs phone number
        const messageParams = { body, to };
        if (fromValue.startsWith('MG')) {
            messageParams.messagingServiceSid = fromValue;
        } else {
            messageParams.from = fromValue;
        }

        console.log('Sending SMS:', { to, fromType: fromValue.startsWith('MG') ? 'MessagingService' : 'PhoneNumber' });

        const message = await client.messages.create(messageParams);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, sid: message.sid })
        };
    } catch (error) {
        console.error('Twilio Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
