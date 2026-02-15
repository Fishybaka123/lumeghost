const twilio = require('twilio');

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { to, body } = JSON.parse(event.body);

    if (!to || !body) {
        return { statusCode: 400, body: 'Missing "to" or "body"' };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        return { statusCode: 500, body: 'Missing Twilio credentials' };
    }

    try {
        const client = twilio(accountSid, authToken);

        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, sid: message.sid })
        };
    } catch (error) {
        console.error('Twilio Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: error.message })
        };
    }
};
