const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For handling form submissions

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// CSV Writer Setup
const csvFilePath = path.join(__dirname, 'data/kshudha-case-data.csv');

// Create the 'data' directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// CSV writer with headers
const writer = csvWriter({
    path: csvFilePath,
    header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'address', title: 'Address' }
    ],
    append: true
});

// Check if CSV file exists and is empty, if so write headers
if (!fs.existsSync(csvFilePath) || fs.readFileSync(csvFilePath, 'utf8').length === 0) {
    fs.writeFileSync(csvFilePath, 'Name,Email,Phone,Address\n'); // Writing headers
}

// Route to save form data
app.post('/save', (req, res) => {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    writer.writeRecords([{ name, email, phone, address }])
        .then(() => {
            res.status(200).json({ message: 'Data saved successfully!' });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while saving data.' });
        });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
