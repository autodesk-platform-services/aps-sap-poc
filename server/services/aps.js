const { AuthenticationClient } = require('forge-server-utils');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = require('../config.js');

let auth = new AuthenticationClient(APS_CLIENT_ID, APS_CLIENT_SECRET);

async function getPublicToken() {
    const result = await auth.authenticate(['viewables:read']);
    return result;
}

module.exports = {
    getPublicToken
};
