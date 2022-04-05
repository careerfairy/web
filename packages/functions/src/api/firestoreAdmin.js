const admin = require("firebase-admin")
const { isLocalEnvironment } = require("../util")

const options = {}

/**
 * Only load the credentials if we're running from prod (gcloud functions)
 * Local testing shouldn't target prod
 */
if (!isLocalEnvironment()) {
   const serviceAccount = require("../keys/admin.json")
   options["credential"] = admin.credential.cert(serviceAccount)
   console.log("Using firebase production credentials")
}

admin.initializeApp(options)

module.exports = {
   admin,
}
