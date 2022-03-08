const {
    FORGE_CLIENT_ID,
    FORGE_CLIENT_SECRET,
    FORGE_MODEL_URN,
    SAP_HANA_SERVER,
    SAP_HANA_PORT,
    SAP_HANA_SPACE,
    SAP_HANA_VIEW,
    SAP_HANA_USERNAME,
    SAP_HANA_PASSWORD,
    PORT
} = process.env;

if (!FORGE_CLIENT_ID || !FORGE_CLIENT_SECRET || !FORGE_MODEL_URN) {
    console.warn('Some of the required Forge env. variables are missing.');
    process.exit(1);
}

if (!SAP_HANA_SERVER || !SAP_HANA_PORT || !SAP_HANA_SPACE || !SAP_HANA_VIEW || !SAP_HANA_USERNAME || !SAP_HANA_PASSWORD) {
    console.warn('Some of the required Forge env. variables are missing.');
    process.exit(1);
}

module.exports = {
    FORGE_CLIENT_ID,
    FORGE_CLIENT_SECRET,
    FORGE_MODEL_URN,
    SAP_HANA_SERVER,
    SAP_HANA_PORT,
    SAP_HANA_SPACE,
    SAP_HANA_VIEW,
    SAP_HANA_USERNAME,
    SAP_HANA_PASSWORD,
    PORT: PORT || 3000
};
