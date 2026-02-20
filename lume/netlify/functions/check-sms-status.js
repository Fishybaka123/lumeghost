const twilio = require('twilio');

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let parsed;
    try {
        parsed = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { accountSid, authToken, messageSid } = parsed;

    if (!accountSid || !authToken || !messageSid) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing accountSid, authToken, or messageSid' }) };
    }

    try {
        const client = twilio(accountSid, authToken);
        const message = await client.messages(messageSid).fetch();

        return {
            statusCode: 200,
            body: JSON.stringify({
                sid: message.sid,
                status: message.status,
                errorCode: message.errorCode,
                errorMessage: message.errorMessage,
                to: message.to,
                from: message.from,
                dateSent: message.dateSent,
                dateCreated: message.dateCreated,
                direction: message.direction,
                price: message.price
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
