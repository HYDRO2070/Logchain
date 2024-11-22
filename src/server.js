const express = require('express');
const connectDB = require('./db');
const routes = require('./routes');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Views folder

app.use(express.static('public'));

app.set('layout', 'layout');
// Connect to MongoDB
connectDB();

// Use the routes
app.use(routes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
