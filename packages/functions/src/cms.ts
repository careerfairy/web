import functions = require("firebase-functions")
import { onDocumentWritten } from "firebase-functions/firestore"
import HygraphClient from "./api/hygraph"
import { isLocalEnvironment, logGraphqlErrorAndThrow } from "./util"

export const syncFieldsOfStudyToHygraph = onDocumentWritten(
   "fieldsOfStudy/{fieldOfStudyId}",
   async (event) => {
      if (isLocalEnvironment()) return // Don't run/sync anything on local environment

      const fieldOfStudyId = event.params.fieldOfStudyId
      const isCreate =
         event.data?.after.exists === true &&
         event.data?.before.exists === false
      const isDelete =
         event.data?.after.exists === false &&
         event.data?.before.exists === true
      const isUpdate =
         event.data?.after.exists === true && event.data?.before.exists === true

      try {
         const hygraph = new HygraphClient(process.env.HYGRAPH_MUTATION_KEY)
         if (isCreate || isUpdate) {
            const fieldOfStudy = event.data?.after.data()
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
   }
)
