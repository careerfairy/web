import { GraphQLClient } from "graphql-request"
import { isLocalEnvironment } from "../util"

// Project: Production
let url =
   "https://api-eu-central-1.hygraph.com/v2/cl1dnfxuh12bb01xi1m2yabcw/master"

if (isLocalEnvironment()) {
   url = ""
}

export default class HygraphClient {
   readonly client: GraphQLClient

   constructor(hygraphApiKey: string) {
      this.client = new GraphQLClient(url, {
         headers: {
            authorization: `Bearer ${hygraphApiKey}`,
         },
      })
   }

   upsertFieldOfStudy(fieldOfStudyId: string, fieldOfStudyName: string) {
      // language=GraphQL
      return this.client.request(
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
         { fieldOfStudyId, fieldOfStudyName }
      )
   }

   deleteFieldOfStudy(fieldOfStudyId: string) {
      // language=GraphQL
      return this.client.request(
         `mutation deleteFieldOfStudy($fieldOfStudyId: String!){
                 deleteFieldOfStudy(where: { fieldOfStudyId: $fieldOfStudyId }) {
                     fieldOfStudyId
                 }
             }`,
         { fieldOfStudyId }
      )
   }
}
