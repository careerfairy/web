import functions = require("firebase-functions")
import { GraphQLClient } from "graphql-request"
import { isLocalEnvironment, logGraphqlErrorAndThrow } from "./util"

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
         logGraphqlErrorAndThrow(
            `Error ${
               isDelete ? "deleting" : isCreate ? "creating" : "updating"
            } field of study with Id ${fieldOfStudyId} to hygraph with `,
            e
         )
      }
   })
