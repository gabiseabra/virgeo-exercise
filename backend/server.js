const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors())
app.use(bodyParser.json());

const SECRET_KEY = 'SECRET_KEY';
const TOKEN_EXPIRY = '1h'; // Token validity: 1 hour

// Mock user credentials
const USERS = {
  user1: 'password1',
  user2: 'password2',
};

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (USERS[username] && USERS[username] === password) {

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: TOKEN_EXPIRY });
    res.json({ accessToken: token });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Middleware to validate the token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

function generateRandomGeoJSON(numPoints, centerLat, centerLon, maxDistance) {
    const features = [];

    for (let i = 0; i < numPoints; i++) {
      const offsetLat = (Math.random() - 0.5) * maxDistance * 2;
      const offsetLon = (Math.random() - 0.5) * maxDistance * 2;

      const latitude = centerLat + offsetLat;
      const longitude = centerLon + offsetLon;

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        properties: {
          id: i + 1,
          name: `Point ${i + 1}`,
        },
      });
    }

    return {
      type: 'FeatureCollection',
      features,
    };
  }

// Data endpoint (requires a valid token)
app.get('/data', authenticateToken, (_, res) => {
    const numPoints = 1000;
    const centerLat = 52.050203;
    const centerLon = 4.413934;
    const maxDistance = 0.01; // Max distance from the center (degrees)

    const geojsonFeatureCollection = generateRandomGeoJSON(
      numPoints,
      centerLat,
      centerLon,
      maxDistance
    );

    res.json(geojsonFeatureCollection);
});

// Heavy data endpoint (requires a valid token)
app.get('/heavy_data', authenticateToken, (_, res) => {
  const numPoints = 10000;
  const centerLat = 52.050203;
  const centerLon = 4.413934;
  const maxDistance = 0.02; // Max distance from the center (degrees)

  const geojsonFeatureCollection = generateRandomGeoJSON(
    numPoints,
    centerLat,
    centerLon,
    maxDistance
  );

  res.json(geojsonFeatureCollection);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
