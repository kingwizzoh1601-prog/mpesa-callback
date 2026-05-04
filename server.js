const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/callback', (req, res) => {
    console.log('Incoming request:', req.body);
    res.status(200).send('Success');
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});