const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// GET endpoint for db.json
app.get('/db.json', (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Error reading database' });
    }
});

// PUT endpoint for db.json
app.put('/db.json', (req, res) => {
    try {
        fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(req.body, null, 2));
        res.json(req.body);
    } catch (error) {
        res.status(500).json({ error: 'Error writing to database' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});