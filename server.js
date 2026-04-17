const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 3000;

// Читання JSON Lines (ВАЖЛИВО!)
const readFlights = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('flights-1m.json', 'utf-8', (err, data) => {
            if (err) return reject(err);

            try {
                const lines = data.trim().split('\n');
                const flights = lines.map(line => JSON.parse(line));
                resolve(flights);
            } catch (e) {
                reject(e);
            }
        });
    });
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;

    res.setHeader('Content-Type', 'application/json');

    try {
        const flights = await readFlights();

        // 🔹 1. Всі рейси
        if (path === '/flights') {
            res.end(JSON.stringify(flights.slice(0, 100)));
        }

        // 🔹 2. Затримані рейси
        else if (path === '/flights/delayed') {
            const result = flights.filter(f => f.DEP_DELAY > 0);
            res.end(JSON.stringify(result.slice(0, 100)));
        }

        // 🔹 3. Без затримки
        else if (path === '/flights/on-time') {
            const result = flights.filter(f => f.DEP_DELAY <= 0);
            res.end(JSON.stringify(result.slice(0, 100)));
        }

        // 🔹 4. Довгі рейси
        else if (path === '/flights/long') {
            const result = flights.filter(f => f.DISTANCE > 2000);
            res.end(JSON.stringify(result.slice(0, 100)));
        }

        // 🔹 5. За датою
        else if (path === '/flights/by-date') {
            const date = query.date;
            const result = flights.filter(f => f.FL_DATE === date);
            res.end(JSON.stringify(result.slice(0, 100)));
        }

        // ❌ 404
        else {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: 'Not found' }));
        }

    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error.message }));
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});