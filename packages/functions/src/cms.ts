import functions = require("firebase-functions")
import { isLocalEnvironment, logGraphqlErrorAndThrow } from "./util"
import HygraphClient from "./api/hygraph"
import * as config from "./config"
import { getFieldsOfStudy } from "./lib/cms"

const SECRET = "bizzy"

export const syncFieldsOfStudyToHygraph = functions
   // Make the secret available to this function
   .runWith({ secrets: ["HYGRAPH_MUTATION_KEY"] })
   .firestore.document("fieldsOfStudy/{fieldOfStudyId}")
   .onWrite(async (change, context) => {
      if (isLocalEnvironment()) return // Don't run/sync anything on local environment

      const fieldOfStudyId = context.params.fieldOfStudyId
      const isCreate =
         change.after.exists === true && change.before.exists === false
      const isDelete =
         change.after.exists === false && change.before.exists === true
      const isUpdate =
         change.after.exists === true && change.before.exists === true

      try {
         const hygraph = new HygraphClient(process.env.HYGRAPH_MUTATION_KEY)
         if (isCreate || isUpdate) {
            const fieldOfStudy = change.after.data()
            await hygraph.upsertFieldOfStudy(fieldOfStudyId, fieldOfStudy.name)

            functions.logger.log(
               `${
                  isCreate ? "Created" : "Updated"
               } field of study ${fieldOfStudyId} on hygraph with data ${JSON.stringify(
                  { fieldOfStudyId, fieldOfStudyName: fieldOfStudy.name }
               )}`
            )
            return
         }

         if (isDelete) {
            await hygraph.deleteFieldOfStudy(fieldOfStudyId)
            functions.logger.info(
               `Deleted field of study from Hygraph: ${fieldOfStudyId}`
            )
         }
      } catch (e) {
         logGraphqlErrorAndThrow(
            `Error ${
               isDelete ? "deleting" : isCreate ? "creating" : "updating"
            } field of study with Id ${fieldOfStudyId} to hygraph with `,
            e
         )
      }
   })


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
      if (req.method !== "GET") {
         res.status(401).end()
         return
      }

      if (req.get("secret") !== SECRET) {
         res.status(401).end()
         return
      }

      const fieldsOfStudy = await getFieldsOfStudy()

      res.send(fieldsOfStudy)
   })
