const functions = require('firebase-functions');
const next = require('next');

const app = next({conf: {distDir: "dist/client"}});
const handler = app.getRequestHandler();

exports.production = functions.https.onRequest(async (req, res) => {
    await app.prepare().then(() => {
        return handler(req, res);
    });
});

exports.testing = functions.https.onRequest(async (req, res) => {
    await app.prepare().then(() => {
        return handler(req, res);
    });
});

exports.testing2 = functions.https.onRequest(async (req, res) => {
    await app.prepare().then(() => {
        return handler(req, res);
    });
});

exports.personalHabib = functions.https.onRequest(async (req, res) => {
    await app.prepare().then(() => {
        return handler(req, res);
    });
});