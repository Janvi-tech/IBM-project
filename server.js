require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Fetch IBM Watson authentication token
async function getAuthToken() {
    try {
        const response = await axios.post('https://iam.cloud.ibm.com/identity/token', null, {
            params: {
                apikey: process.env.API_KEY,
                grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        throw new Error('Failed to retrieve token');
    }
}

// Send data to AutoAI model for predictions
async function getPrediction(data) {
    try {
        const token = await getAuthToken();
        const response = await axios.post(
            process.env.MODEL_DEPLOYMENT_URL,
            { input_data: data.input_data },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data.predictions;
    } catch (error) {
        console.error('Error making prediction:', error);
        throw new Error('Failed to get prediction');
    }
}

// API Endpoint to get predictions
app.post('/predict', async (req, res) => {
    try {
        const inputData = req.body;
        const predictions = await getPrediction(inputData);
        res.json({ predictions });
    } catch (error) {
        res.status(500).json({ error: 'Error processing prediction' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
