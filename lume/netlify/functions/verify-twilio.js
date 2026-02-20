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

    const { accountSid, authToken, phoneNumber } = parsed;

    if (!accountSid || !authToken || !phoneNumber) {
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, error: 'Missing required fields: accountSid, authToken, phoneNumber/messagingServiceSid' })
        };
    }

    try {
        const client = twilio(accountSid, authToken);

        // Verify the account is valid by fetching account info
        const account = await client.api.accounts(accountSid).fetch();

        if (account.status !== 'active') {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: false, error: `Twilio account is ${account.status}, not active.` })
            };
        }

        // If it's a Messaging Service SID, verify it exists
        if (phoneNumber.startsWith('MG')) {
            try {
                const service = await client.messaging.v1.services(phoneNumber).fetch();
                return {
                    statusCode: 200,
                    body: JSON.stringify({ success: true, message: `Verified! Messaging Service: ${service.friendlyName}` })
                };
            } catch (e) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({ success: false, error: `Messaging Service SID not found: ${e.message}` })
                };
            }
        }

        // Otherwise it's a phone number - basic validation
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Twilio credentials verified!' })
        };

    } catch (error) {
        console.error('Verification error:', error.message);
        return {
            statusCode: 200,
            body: JSON.stringify({ success: false, error: 'Invalid credentials: ' + error.message })
        };
    }
};
