const { createClient } = require('@supabase/supabase-js');
const querystring = require('querystring');

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Twilio sends data as application/x-www-form-urlencoded
    const params = querystring.parse(event.body);
    const updates = {};

    // Twilio parameters: From, Body, MessageSid, To
    const fromPhone = params.From; // Client's phone
    const toPhone = params.To;     // Twilio phone
    const body = params.Body;
    const sid = params.MessageSid;

    if (!fromPhone || !body) {
        return { statusCode: 400, body: 'Missing From or Body' };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST be Service Role Key to bypass RLS if needed, or to look up user

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return { statusCode: 500, body: 'Server Error' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 1. Find the client by phone number to associate the message
        // We need to find which USER owns this client.
        // If multiple users have the same client phone, this is tricky. 
        // For this MVP, we'll take the first match or handle it.

        const { data: clients, error: clientError } = await supabase
            .from('clients')
            .select('id, user_id, first_name, last_name')
            .eq('phone', fromPhone) // Assumes phone format matches exactly (e.g. +1555...)
            .limit(1);

        if (clientError) throw clientError;

        if (!clients || clients.length === 0) {
            console.log(`Received SMS from unknown phone: ${fromPhone}`);
            // Optional: Create a "Lead" or just ignore?
            // For now, we return success to Twilio so it stops retrying
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'text/xml' },
                body: '<Response></Response>'
            };
        }

        const client = clients[0];

        // 2. Insert message into communications table
        const { error: insertError } = await supabase
            .from('communications')
            .insert({
                client_id: client.id,
                user_id: client.user_id,
                type: 'sms',
                direction: 'inbound',
                content: body,
                status: 'received',
                sid: sid,
                is_read: false,
                metadata: { from: fromPhone, to: toPhone }
            });

        if (insertError) throw insertError;

        // 3. Respond to Twilio (Empty TwiML to say "we got it")
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/xml' },
            body: '<Response></Response>'
        };

    } catch (error) {
        console.error('Error processing incoming SMS:', error);
        return { statusCode: 500, body: error.message };
    }
};
