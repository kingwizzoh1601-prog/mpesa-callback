const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_SECRET = process.env.MPESA_SECRET;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Server is running',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// M-Pesa Callback Handler
app.post('/callback', (req, res) => {
    try {
        console.log('=== M-Pesa Callback Received ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        // Validate callback data
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                ResultCode: 1,
                ResultDesc: 'Invalid request body'
            });
        }

        // Extract callback data
        const callbackData = req.body.Body?.stkCallback || req.body;
        const resultCode = callbackData?.ResultCode;
        const resultDesc = callbackData?.ResultDesc;

        console.log('Result Code:', resultCode);
        console.log('Result Description:', resultDesc);

        // Process the callback based on result code
        if (resultCode === 0) {
            console.log('✓ Payment successful');
            // Update your database with successful transaction
            // Example: saveTransaction(callbackData);
        } else {
            console.log('✗ Payment failed or cancelled');
            // Handle failed payment
        }

        // Return success response
        res.status(200).json({
            ResultCode: 0,
            ResultDesc: 'Callback received successfully'
        });

    } catch (error) {
        console.error('Error processing callback:', error);
        res.status(500).json({
            ResultCode: 1,
            ResultDesc: 'Internal server error'
        });
    }
});

// Environment validation on startup
if (NODE_ENV === 'production') {
    if (!MPESA_CONSUMER_KEY || !MPESA_SECRET || !MPESA_SHORTCODE) {
        console.warn('⚠️  Warning: M-Pesa environment variables are not set');
        console.warn('Make sure to set MPESA_CONSUMER_KEY, MPESA_SECRET, and MPESA_SHORTCODE on Render');
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
    console.log(`📝 Environment: ${NODE_ENV}`);
    console.log(`💰 M-Pesa Shortcode: ${MPESA_SHORTCODE || 'Not configured'}`);
});