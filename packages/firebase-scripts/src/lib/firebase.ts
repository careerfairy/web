import { useProd } from "../"
import { App, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { credential } from "firebase-admin"
var serviceAccount = require("../../keys/production_credentials.json")

import { AppOptions } from "firebase-admin/lib/app/core"

let config: AppOptions = {
   projectId: "careerfairy-e1fd9",
}

/**
 * We want to by default target the local emulators for the scripts
 *
 * If the argument NEXT_PUBLIC_FIREBASE_EMULATORS=false the scripts will target prod,
 * if not they will target the emulators
 */

if (!useProd) {
   process.env["FIREBASE_AUTH_EMULATOR_HOST"] = "127.0.0.1:9099"
   process.env["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080"
}
if (useProd) {
   config["credential"] = credential.cert(serviceAccount)
}

const app: App = initializeApp(config)

export const auth = getAuth(app)
export const firestore = getFirestore(app)
