const express = require('express');
const axios = require("axios");

const app = express();

// ======================
// ENV CONFIG
// ======================
const PORT = process.env.PORT || 3000;
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_SECRET = process.env.MPESA_SECRET;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ======================
// PRICING TABLE (PRODUCT ENGINE)
// ======================
const PRODUCTS = {
    19: { type: "data", value: "1GB (1hr)" },
    24: { type: "data", value: "250MB (24hrs)" },
    49: { type: "data", value: "350MB (7 days)" },
    50: { type: "data", value: "1.5GB (3hrs)" },
    55: { type: "data", value: "1.25GB (Till Midnight)" },
    99: { type: "data", value: "1GB (24hrs)" },
    300: { type: "data", value: "2.5GB (7 days)" },
    700: { type: "data", value: "6GB (7 days)" },

    22: { type: "data", value: "1GB (1hr)" },
    52: { type: "data", value: "1.5GB (3hrs)" },
    100: { type: "data", value: "2GB (24hrs)" },

    23: { type: "minutes", value: "45 mins (3hrs)" },
    51: { type: "minutes", value: "50 mins (Till Midnight)" },
    500: { type: "minutes", value: "300 mins (30 days)" },
    999: { type: "minutes", value: "800 mins (30 days)" },
    1001: { type: "combo", value: "8GB + 400 mins (30 days)" },

    5: { type: "sms", value: "20 SMS (24hrs)" },
    10: { type: "sms", value: "200 SMS (24hrs)" },
    30: { type: "sms", value: "1000 SMS (7 days)" }
};

// ======================
// MIDDLEWARE
// ======================
app.use(express.json());

// ======================
// HEALTH CHECK
// ======================
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'Server is running',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// ======================
// CALLBACK (M-PESA)
// ======================
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

// ======================
// ROUTER ENGINE
// ======================
function routePackage(amount, phone) {
    console.log("🎯 Routing package:", amount, phone);

    const product = PRODUCTS[amount];

    if (!product) {
        console.log("⚠️ Unknown package:", amount);
        return;
    }

    console.log("📦 Selected product:", product);

    // TEMP DELIVERY (we upgrade later to real APIs)
    sendAirtime(phone, amount);
}

// ======================
// AIRTIME SENDER (PLACEHOLDER)
// ======================
async function sendAirtime(phone, amount) {
    try {
        const response = await axios({
            method: "POST",
            url: "https://api.africastalking.com/version1/airtime/send",
            headers: {
                apiKey: process.env.AT_API_KEY,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: new URLSearchParams({
                username: process.env.AT_USERNAME,
                recipients: JSON.stringify([
                    {
                        phoneNumber: phone,
                        amount: `KES ${amount}`
                    }
                ])
            })
        });

        console.log("📡 AIRTIME SENT:", response.data);

    } catch (error) {
        console.log("❌ Airtime Error:", error.response?.data || error.message);
    }
}

// ======================
// START SERVER
// ======================
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
    console.log(`📝 Environment: ${NODE_ENV}`);
    console.log(`💰 M-Pesa Shortcode: ${MPESA_SHORTCODE || 'Not configured'}`);
});
