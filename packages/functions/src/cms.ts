import functions = require("firebase-functions")
import * as config from "./config"
import { getFieldOfStudyById } from "./lib/cms"
import { GraphQLClient } from "graphql-request"
import { isLocalEnvironment, logGraphqlError } from "./util"

const SECRET = "bizzy"

/**
 * Return the list of field of studies
 * This endpoint is used by Hygraph cms (custom landing pages)
 *
 * A secret header is used to hide the content from internet crawlers
 * Request needs to have the header secret: $SECRET
 */
export const fieldOfStudy = functions
   .region(config.region)
   .https.onRequest(async (req, res) => {
      if (req.method !== "GET") {
         res.status(401).end()
         return
      }
      if (!req.query.id) {
         res.status(401).end()
         return
      }

      if (req.get("secret") !== SECRET) {
         res.status(401).end()
         return
      }

      const fieldOfStudy = await getFieldOfStudyById(req.query.id.toString())

      if (!fieldOfStudy) {
         res.status(404).end()
         return
      }

      res.send(fieldOfStudy)
   })

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
         const hygraph = new GraphQLClient(
            "https://api-eu-central-1.hygraph.com/v2/cl1dnfxuh12bb01xi1m2yabcw/master",
            {
               headers: {
                  authorization: `Bearer ${process.env.HYGRAPH_MUTATION_KEY}`,
               },
            }
         )
         if (isCreate || isUpdate) {
            const fieldOfStudy = change.after.data()
            // language=GraphQL
            await hygraph.request(
               `mutation createFieldOfStudy($fieldOfStudyId: String!, $fieldOfStudyName: String!){
                 upsertFieldOfStudy(
                     where: { fieldOfStudyId: $fieldOfStudyId }
                     upsert: {
                         create: { fieldOfStudyName: $fieldOfStudyName, fieldOfStudyId: $fieldOfStudyId }
                         update: { fieldOfStudyName: $fieldOfStudyName, fieldOfStudyId: $fieldOfStudyId }
                     }
                 ) {
                     fieldOfStudyName
                     id
                     fieldOfStudyId
                 }

                 publishFieldOfStudy(where : {fieldOfStudyId:$fieldOfStudyId}) {
                     fieldOfStudyId
                 }
             }`,
               { fieldOfStudyId, fieldOfStudyName: fieldOfStudy.name }
            )
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
            // language=GraphQL
            await hygraph.request(
               `mutation deleteFieldOfStudy($fieldOfStudyId: String!){
                 deleteFieldOfStudy(where: { fieldOfStudyId: $fieldOfStudyId }) {
                     fieldOfStudyId
                 }
             }`,
               { fieldOfStudyId }
            )
            functions.logger.info(
               `Deleted field of study from Hygraph: ${fieldOfStudyId}`
            )
         }
      } catch (e) {
         functions.logger.error(
            `Error ${
               isDelete ? "deleting" : isCreate ? "creating" : "updating"
            } field of study with Id ${fieldOfStudyId} to hygraph with `,
            e
         )
         logGraphqlError(e)
         throw new functions.https.HttpsError("unknown", e)
      }
   })
