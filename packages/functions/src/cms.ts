import functions = require("firebase-functions")
import { isLocalEnvironment, logGraphqlErrorAndThrow } from "./util"
import HygraphClient from "./api/hygraph"
import config from "./config"

export const syncFieldsOfStudyToHygraph = functions
   .region(config.region)
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
