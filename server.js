const express = require('express');
const path = require('path');
const { getPublicToken } = require('./services/forge.js');
const { getFacilities, getStockOverview, getArticleDetail, getDeliveryOptions } = require('./services/sap.js');
const { FORGE_MODEL_URN, PORT } = require('./config.js');

let app = express();
app.use(express.static(path.join(__dirname, 'wwwroot')));
app.get('/config.json', (req, res) => { res.json({ FORGE_MODEL_URN }); });
app.get('/api/auth/token', async function(req, res, next) {
    try {
        res.json(await getPublicToken());
    } catch(err) {
        next(err);
    }
});
app.get('/api/procurement/facilities', async function(req, res, next) {
    try {
        res.json(await getFacilities());
    } catch (err) {
        next(err);
    }
});
app.get('/api/procurement/stock', async function(req, res, next) {
    try {
        res.json(await getStockOverview());
    } catch (err) {
        next(err);
    }
});
app.get('/api/procurement/stock/:part', async function(req, res, next) {
    try {
        res.json(await getArticleDetail(req.params.part));
    } catch (err) {
        next(err);
    }
});
app.get('/api/procurement/delivery-options', async function(req, res, next) {
    try {
        res.json(await getDeliveryOptions());
    } catch (err) {
        next(err);
    }
});
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
