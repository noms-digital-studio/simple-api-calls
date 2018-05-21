const express = require('express');
const request = require('superagent');
const router = express.Router();
const json2csv = require('nice-json2csv');

const config = require('../config');
const generateApiGatewayToken = require('../authentication/apiGateway');
const generateOauthClientToken = require('../authentication/oauth');

let winston = require('winston');
const logger = new (winston.Logger);

router.use(json2csv.expressDecorator);

router.get('/', function(req, res){

    try {
        const oauthClientToken = generateOauthClientToken();

        let auth = config.nomis.apiGatewayEnabled === 'yes' ? generateApiGatewayToken() : oauthClientToken;
        const loginResult = request
            .post(`${config.nomis.apiUrl}/oauth/token`)
            .set('Authorization', auth)
            .set('Elite-Authorization', oauthClientToken)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(`grant_type=client_credentials`)
            .end((err, loginResult) => {

                logger.info(`Elite2 login result: [${loginResult.status}]`);

                const eliteAuthorisationToken = `${loginResult.body.token_type} ${loginResult.body.access_token}`;
                auth = config.nomis.apiGatewayEnabled === 'yes' ? generateApiGatewayToken() : eliteAuthorisationToken;

                const bookings = request
                    .get(`${config.nomis.apiUrl}/api/bookings?query=agencyId:eq:'LEI'`)
                    .set('Authorization', auth)
                    .set('Elite-Authorization', eliteAuthorisationToken)
                    .set('Page-Limit', 1000)
                    .end((err, bookingsResponse) => {
                        res.csv(bookingsResponse.body, "bookings.csv");
                    });
            });

    } catch (error) {
        if(error.status === 400 || error.status === 401 || error.status === 403) {
            logger.error(`Forbidden Elite2 login:`, error.stack);
            return {};
        }

        logger.error(`Elite 2 login error:`, error.stack);
        throw error;
    }

});

module.exports = router;
