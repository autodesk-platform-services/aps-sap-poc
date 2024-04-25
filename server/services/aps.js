const { SdkManagerBuilder } = require('@aps_sdk/autodesk-sdkmanager');
const { AuthenticationClient, Scopes } = require('@aps_sdk/authentication');
const { APS_CLIENT_ID, APS_CLIENT_SECRET } = require('../config.js');

const sdkManager = SdkManagerBuilder.create().build();
const auth = new AuthenticationClient(sdkManager);

async function getPublicToken() {
    const credentials = await auth.getTwoLeggedToken(APS_CLIENT_ID, APS_CLIENT_SECRET, [Scopes.ViewablesRead]);
    return credentials;
}

module.exports = {
    getPublicToken
};
