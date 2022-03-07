const express = require('express');
const path = require('path');
const morgan = require('morgan');
const { getPublicToken } = require('./services/forge.js');
const { listSuppliers } = require('./services/sap.js');
const { FORGE_MODEL_URN, PORT } = require('./config.js');

const app = express();

app.set('view engine', 'pug');
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.render('index', { urn: FORGE_MODEL_URN }));
app.get('/api/auth/token', async function(req, res, next) {
    try {
        const token = await getPublicToken();
        res.json(token);
    } catch(err) {
        next(err);
    }
});
app.get('/api/procurement/suppliers', async function(req, res, next) {
    try {
        const suppliers = await listSuppliers(req.query.part);
        res.json(suppliers);
    } catch (err) {
        next(err);
    }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
