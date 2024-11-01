const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const moment = require('moment'); // Use moment for timestamp formatting
// Add this line to require multer
const multer = require('multer');
const csv = require('csv-parser');

// Set up multer to handle form data
const upload = multer();
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
        { id: 'address', title: 'Address' },
        { id: 'timestamp', title: 'Timestamp' }
    ],
    append: true
});

// Check if CSV file exists and is empty, if so write headers
if (!fs.existsSync(csvFilePath) || fs.readFileSync(csvFilePath, 'utf8').length === 0) {
    fs.writeFileSync(csvFilePath, 'Name,Email,Phone,Address,Timestamp\n'); // Writing headers
}

// Add route for the gallery page
app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gallery.html'));
});
// Route to save form data
app.post('/save', (req, res) => {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Generate timestamp in DD/MM/YY-HH:MM format
    const timestamp = moment().format('DD/MM/YY-HH:mm');

    writer.writeRecords([{ name, email, phone, address, timestamp }])
        .then(() => {
            res.status(200).json({ message: 'Data saved successfully!' });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while saving data.' });
        });
});

// Serve review.html (Review Page)
app.get('/review', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'review.html'));
});

// Fetch reviews
app.get('/reviews', (req, res) => {
    const reviews = [];
    fs.createReadStream(path.join(__dirname, 'data', 'reviews.csv'))
        .pipe(csv({ separator: ';' }))  // Set separator to semicolon
        .on('data', (row) => reviews.push(row))
        .on('end', () => res.json(reviews));
});

// Submit review
app.post('/submit-review', (req, res) => {
    const { name, review, rating } = req.body;
    const date = moment().format('YYYY-MM-DD');

    // Validate that rating is a decimal number between 1 and 5
    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    // Manually format the review entry with a semicolon at the end and newline
    const newEntry = `${name};${review};${rating};${date};\n`;

    console.log(' NEW = ', newEntry)
        // Define the CSV header row
        const headers = "Name;Review;Rating;Date;\n";
    const filePath = path.join(__dirname, 'data/reviews.csv');
    console.log(' FILE =', filePath)
    const writer = csvWriter({
        path: filePath,
        header: [
            { id: 'Name', title: 'Name' },
            { id: 'Review', title: 'Review' },
            { id: 'Rating', title: 'Rating' },
            { id: 'Date', title: 'Date' }
        ],
        append: true,
        fieldDelimiter: ';'  // Use semicolon as a field delimiter
    });

    // Read the current file content
    fs.readFile(filePath, 'utf8', (err, existingData) => {
        if (err && err.code !== 'ENOENT') {
            console.error("Error reading reviews:", err);
            return res.status(500).json({ error: 'Error reading review data' });
        };
    // Check if the headers already exist in the file
    const hasHeaders = existingData && existingData.startsWith(headers);
        // Build the updated data
        const updatedData = hasHeaders
            ? headers + newEntry + existingData.slice(headers.length)  // Keep existing header, prepend new entry
            : headers + newEntry + (existingData || '');               // Add header if missing, prepend new entry
        // Write the updated data back to the file
        fs.writeFile(filePath, updatedData, (writeErr) => {
            if (writeErr) {
                console.error("Error writing review:", writeErr);
                return res.status(500).json({ error: 'Error writing review' });
            }
            res.status(201).json({ message: 'Review submitted successfully' });
        });
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
