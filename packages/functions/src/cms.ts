import functions = require("firebase-functions")
import * as config from "./config"
import { getFieldsOfStudiesByIds } from "./lib/cms"

const SECRET = "bizzy"

/**
 * Return the list of field of studies
 * This endpoint is used by Hygraph cms (custom landing pages)
 *
 * A secret header is used to hide the content from internet crawlers
 * Request needs to have the header secret: $SECRET
 */
export const fieldsOfStudy = functions
   .region(config.region)
   .https.onRequest(async (req, res) => {
      functions.logger.log("-> REQUEST", req)
      if (req.method !== "GET") {
         res.status(401).end()
         return
      }

      if (req.get("secret") !== SECRET) {
         res.status(401).end()
         return
      }

      const fieldsOfStudy = await getFieldsOfStudiesByIds(
         req.get("fieldsOfStudyIds").split(",")
      )

      res.send(fieldsOfStudy)
   })
