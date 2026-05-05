const express = require('express');
const axios = require("axios");

const app = express();

const PORT = process.env.PORT || 3000;
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_SECRET = process.env.MPESA_SECRET;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Server is running',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// ✅ CLEAN CALLBACK (FIXED)
app.post('/callback', (req, res) => {
    try {
        console.log('=== M-Pesa Callback Received ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        const callbackData = req.body.Body?.stkCallback;

        const resultCode = callbackData?.ResultCode;

        console.log('Result Code:', resultCode);

        if (resultCode === 0) {
            console.log('✓ Payment successful');

            let amount = null;
            let phone = null;

            const metadata = callbackData.CallbackMetadata?.Item || [];

            metadata.forEach(item => {
                if (item.Name === "Amount") amount = item.Value;
                if (item.Name === "PhoneNumber") phone = item.Value;
            });

            console.log("💰 Amount:", amount);
            console.log("📞 Phone:", phone);

            routePackage(amount, phone);

        } else {
            console.log('✗ Payment failed or cancelled');
        }

        res.status(200).json({
            ResultCode: 0,
            ResultDesc: 'Callback processed successfully'
        });

    } catch (error) {
        console.error('❌ Error processing callback:', error);

        res.status(500).json({
            ResultCode: 1,
            ResultDesc: 'Internal server error'
        });
    }
});

// 🎯 ROUTER
function routePackage(amount, phone) {
    console.log("🎯 Routing package:", amount, phone);

    if (amount == 10) {
        sendAirtime(phone, 10);
    } else {
        console.log("⚠️ Unknown package:", amount);
    }
}

// 📡 AIRTIME FUNCTION
async function sendAirtime(phone, amount) {
    try {
        const response = await axios({
            method: "POST",
            url: "https://api.africastalking.com/version1/airtime/send",
            headers: {
                apiKey: process.env.AT_API_KEY,
                "Content-Type": "application/json"
            },
            data: {
                username: process.env.AT_USERNAME,
                recipients: [
                    {
                        phoneNumber: phone,
                        amount: `KES ${amount}`
                    }
                ]
            }
        });

        console.log("📡 AIRTIME SENT:", response.data);

    } catch (error) {
        console.log("❌ Airtime Error:", error.response?.data || error.message);
    }
                         }
