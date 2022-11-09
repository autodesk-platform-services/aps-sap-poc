const {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_MODEL_URN,
    SAP_HANA_SERVER,
    SAP_HANA_PORT,
    SAP_HANA_SPACE,
    SAP_HANA_USERNAME,
    SAP_HANA_PASSWORD,
    PORT
} = process.env;

if (!APS_CLIENT_ID || !APS_CLIENT_SECRET || !APS_MODEL_URN) {
    console.warn('Some of the required APS env. variables are missing.');
    process.exit(1);
}

if (!SAP_HANA_SERVER || !SAP_HANA_PORT || !SAP_HANA_SPACE || !SAP_HANA_USERNAME || !SAP_HANA_PASSWORD) {
    console.warn('Some of the required SAP env. variables are missing.');
    process.exit(1);
}

module.exports = {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_MODEL_URN,
    SAP_HANA_SERVER,
    SAP_HANA_PORT,
    SAP_HANA_SPACE,
    SAP_HANA_USERNAME,
    SAP_HANA_PASSWORD,
    PORT: PORT || 3000
};
