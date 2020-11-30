'use strict';
const {PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD} = require('next/constants')
module.exports = (phase, {defaultConfig}) => {
    console.log("-> phase", phase);
    const config = {
        env: {
            REACT_APP_FIREBASE_API_KEY: 'AIzaSyAMx1wVVxqo4fooh0OMVSeSTOqNKzMbch0',
            REACT_APP_FIREBASE_AUTH_DOMAIN: 'careerfairy-e1fd9.firebaseapp.com',
            REACT_APP_FIREBASE_DATABASE_URL: 'https://careerfairy-e1fd9.firebaseio.com',
            REACT_APP_FIREBASE_PROJECT_ID: 'careerfairy-e1fd9',
            REACT_APP_FIREBASE_STORAGE_BUCKET: 'careerfairy-e1fd9.appspot.com',
            REACT_APP_FIREBASE_MESSAGING_SENDER_ID: '993933306494'
        },
        webpackDevMiddleware: config => {
            config.watchOptions = {
                poll: 1000,
                aggregateTimeout: 300,
            }
            return config
        },
    }
    if (phase === PHASE_PRODUCTION_BUILD) {
        config.distDir = '../../dist/client'
    }
    /* config options for all phases except development here */
    return config
}