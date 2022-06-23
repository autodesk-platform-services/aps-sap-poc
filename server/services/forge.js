const { AuthenticationClient } = require('forge-server-utils');
const { FORGE_CLIENT_ID, FORGE_CLIENT_SECRET } = require('../config.js');

let auth = new AuthenticationClient(FORGE_CLIENT_ID, FORGE_CLIENT_SECRET);

async function getPublicToken() {
    const result = await auth.authenticate(['viewables:read']);
    return result;
}

module.exports = {
    getPublicToken
};
