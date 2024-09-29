
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Use bodyParser to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Handle review submission and save it to reviews.csv
app.post('/submit-review', (req, res) => {
    const { name, review, rating } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const csvLine = `${name},${review},${rating},${date}\n`;

    // Append the review to the CSV file
    fs.appendFile(path.join(__dirname, 'data/reviews.csv'), csvLine, (err) => {
        if (err) {
            return res.status(500).send('Error saving the review.');
        }
        res.send('<h2>Thank you for your review!</h2><a href="/">Go back to Home</a>');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
