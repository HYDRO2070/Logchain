const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const crypto = require('crypto');
require('dotenv').config();

// API Routes

// GET /verify - Check the chain's integrity
router.get('/verify', async (req, res) => {
    try {
        const logs = await Log.find().sort({ _id: 1 });
        let isValid = true;

        for (let i = 1; i < logs.length; i++) {
            const currentLog = logs[i];
            const previousLog = logs[i - 1];

            const recalculatedHash = crypto
                .createHash('sha256')
                .update(
                    JSON.stringify({
                        eventType: currentLog.eventType,
                        timestamp: currentLog.timestamp,
                        sourceApp: currentLog.sourceApp,
                        dataPayload: currentLog.dataPayload,
                        previousHash: currentLog.previousHash,
                    })
                )
                .digest('hex');

            if (currentLog.previousHash !== previousLog.hash || currentLog.hash !== recalculatedHash) {
                isValid = false;
                break;
            }
        }

        res.status(200).json({ isValid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Page Routes (EJS Views)

// GET / - Homepage to display logs
router.get('/', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 });
        const response = await fetch(`${process.env.BASE_URL}/verify`);
        const { isValid } = await response.json();
        // const isValid = true;
        res.render('index', { logs, isValid });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching logs');
    }
});


// GET /submit-log - Render log submission form
router.get('/submit-log', (req, res) => {
    res.render('submit-log');
});

// POST /submit-log - Handle log submission from form
router.post('/submit-log', async (req, res) => {
    const { eventType, timestamp, sourceApp, dataPayload } = req.body;

    if (!eventType || !timestamp || !sourceApp || !dataPayload) {
        return res.status(400).send('Missing required fields');
    }
    try {
        const payload = JSON.parse(dataPayload);
        const previousLog = await Log.findOne().sort({ _id: -1 });
        const previousHash = previousLog ? previousLog.hash : null;

        const hash = crypto
            .createHash('sha256')
            .update(JSON.stringify({ eventType, timestamp, sourceApp, dataPayload: payload, previousHash }))
            .digest('hex');

        const log = new Log({ eventType, timestamp, sourceApp, dataPayload: payload, hash, previousHash });
        await log.save();

        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving log');
    }
});


router.get('/query-log', async (req, res) => {
    const { eventType, start, end, sourceApp } = req.query;

    const filter = {};
    if (eventType) filter.eventType = eventType;
    if (sourceApp) filter.sourceApp = sourceApp;
    if (start && end) filter.timestamp = { $gte: new Date(start), $lte: new Date(end) };

    try {
        const logs = await Log.find(filter).sort({ timestamp: -1 });
        res.render('query', { logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// GET /verify-logs - Verification Page
router.get('/verify-logs', async (req, res) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}/verify`);
        const { isValid } = await response.json();
        res.render('verify', { isValid });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error verifying logs');
    }
});




module.exports = router;
