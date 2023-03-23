import functions = require("firebase-functions")
import config from "./config"
import { admin } from "./api/firestoreAdmin"
import { getEarliestEventBufferTime } from "@careerfairy/shared-lib/livestreams"

export const bundleFutureLivestreams = functions
   .region(config.region)
   .https.onRequest(async (_, res) => {
      const data = await admin
         .firestore()
         .collection("livestreams")
         .where("start", ">", getEarliestEventBufferTime())
         .where("test", "==", false)
         .get()

      console.log("Total reads: ", data.size)

      // Build the bundle from the query results
      const bundleBuffer = admin
         .firestore()
         .bundle("future-livestreams")
         .add("future-livestreams-query", data)
         .build()

      // Cache the response for up to 5 minutes;
      // see https://firebase.google.com/docs/hosting/manage-cache
      res.set("Cache-Control", "public, max-age=300, s-maxage=600")

      res.end(bundleBuffer)
   })
