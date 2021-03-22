var api_key = '13db35c5779d693ddad243d21e9d5cba-e566273b-b2967fc4';
var domain = 'mail.careerfairy.io';
var host = 'api.eu.mailgun.net';

const mailgun = require('mailgun-js')({apiKey: api_key, domain: domain, host: host});

module.exports = {
    mailgun
}