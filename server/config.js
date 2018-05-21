require('dotenv').config();
const production = process.env.NODE_ENV === 'production';

function get(name, fallback, options = {}) {
    if (process.env[name]) {
        return process.env[name];
    }
    if (fallback !== undefined && (!production || !options.requireInProduction)) {
        return fallback;
    }
    throw new Error('Missing env var ' + name);
}

module.exports = {

    version: 0.1,

    enableTestUtils: get('ENABLE_TEST_UTILS', false),

    nomis: {
        apiUrl: get('NOMIS_API_URL', 'http://localhost:8080'),
        apiGatewayEnabled: get('API_GATEWAY_ENABLED', 'yes'),
        apiGatewayToken: get('NOMIS_GW_TOKEN', 'dummy'),
        apiGatewayPrivateKey: new Buffer(get('NOMIS_GW_KEY', 'dummy'), 'base64').toString('ascii'),
        apiClientId: get('API_CLIENT_ID', 'omicadmin'),
        apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret')
    }
};
