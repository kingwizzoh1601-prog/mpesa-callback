const express = require('express');
const axios = require("axios");

const app = express();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(express.json());

/* =========================
   🧠 PRICING ENGINE
========================= */
const PRICING_ENGINE = {
    19:  { category: "data", name: "1GB 1 Hour", validity: "1h", value: "1GB" },
    50:  { category: "data", name: "1.5GB 3 Hours", validity: "3h", value: "1.5GB" },
    55:  { category: "data", name: "1.25GB Till Midnight", validity: "midnight", value: "1.25GB" },
    24:  { category: "data", name: "250MB 24 Hours", validity: "24h", value: "250MB" },
    99:  { category: "data", name: "1GB 24 Hours", validity: "24h", value: "1GB" },
    49:  { category: "data", name: "350MB 7 Days", validity: "7d", value: "350MB" },
    300: { category: "data", name: "2.5GB 7 Days", validity: "7d", value: "2.5GB" },
    700: { category: "data", name: "6GB 7 Days", validity: "7d", value: "6GB" },

    23:  { category: "minutes", name: "45 Minutes", validity: "3h", value: "45min" },
    51:  { category: "minutes", name: "50 Minutes Till Midnight", validity: "midnight", value: "50min" },
    500: { category: "minutes", name: "300 Minutes 30 Days", validity: "30d", value: "300min" },
    999: { category: "minutes", name: "800 Minutes 30 Days", validity: "30d", value: "800min" },

    1001:{ category: "combo", name: "8GB + 400 Minutes", validity: "30d", value: "bundle" },

    22:  { category: "data", name: "1GB Tunukiwa", validity: "1h", value: "1GB" },
    52:  { category: "data", name: "1.5GB Tunukiwa", validity: "3h", value: "1.5GB" },
    100: { category: "data", name: "2GB Tunukiwa", validity: "24h", value: "2GB" },

    5:   { category: "sms", name: "20 SMS", validity: "24h", value: "20sms" },
    10:  { category: "sms", name: "200 SMS", validity: "24h", value: "200sms" },
    30:  { category: "sms", name: "1000 SMS", validity: "7d", value: "1000sms" }
};

/* =========================
   🚀 CALLBACK HANDLER
========================= */
app.post('/callback', async (req, res) => {
    try {
        const callbackData = req.body.Body?.stkCallback;
        const resultCode = callbackData?.ResultCode;

        console.log("=== CALLBACK RECEIVED ===");
        console.log(JSON.stringify(req.body, null, 2));

        if (resultCode === 0) {

            let amount = null;
            let phone = null;

            const metadata = callbackData.CallbackMetadata?.Item || [];

            metadata.forEach(item => {
                if (item.Name === "Amount") amount = item.Value;
                if (item.Name === "PhoneNumber") phone = item.Value;
            });

            console.log("💰 Amount:", amount);
            console.log("📞 Phone:", phone);

            await routePackage(amount, phone);

        } else {
            console.log("❌ Payment failed or cancelled");
        }

        res.json({ success: true });

    } catch (err) {
        console.log("Callback error:", err.message);
        res.status(500).json({ error: "server error" });
    }
});

/* =========================
   🎯 ROUTER ENGINE
========================= */
async function routePackage(amount, phone) {

    const pkg = PRICING_ENGINE[amount];

    if (!pkg) {
        console.log("⚠️ Unknown package:", amount);
        return;
    }

    console.log("📦 PACKAGE:", pkg);

    switch (pkg.category) {

        case "data":
            await sendData(phone, pkg);
            break;

        case "minutes":
            await sendMinutes(phone, pkg);
            break;

        case "sms":
            await sendSms(phone, pkg);
            break;

        case "combo":
            await sendCombo(phone, pkg);
            break;
    }
}

/* =========================
   📦 BUNDLE EXECUTION (MOCK)
========================= */
function sendData(phone, pkg) {
    console.log(`📶 DATA SENT to ${phone}`);
    console.log(`👉 ${pkg.name}`);
}

function sendMinutes(phone, pkg) {
    console.log(`📞 MINUTES SENT to ${phone}`);
    console.log(`👉 ${pkg.name}`);
}

function sendSms(phone, pkg) {
    console.log(`✉️ SMS SENT to ${phone}`);
    console.log(`👉 ${pkg.name}`);
}

function sendCombo(phone, pkg) {
    console.log(`🔥 COMBO SENT to ${phone}`);
    console.log(`👉 ${pkg.name}`);
}

/* =========================
   🩺 HEALTH CHECK
========================= */
app.get('/', (req, res) => {
    res.json({
        status: "running",
        env: NODE_ENV,
        time: new Date().toISOString()
    });
});

/* =========================
   🚀 START SERVER
========================= */
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
