import { GraphQLClient } from "graphql-request"

const hygraphUrl = process.env.NEXT_PUBLIC_TALENT_GUIDE_HYGRAPH_URL
const hygraphToken = process.env.HYGRAPH_TALENT_GUIDE_PROD_TOKEN
const hygraphPreviewToken = process.env.HYGRAPH_TALENT_GUIDE_PREVIEW_TOKEN

if (!hygraphUrl || !hygraphToken || !hygraphPreviewToken) {
   const missingConfigs = [
      !hygraphUrl && "NEXT_PUBLIC_TALENT_GUIDE_HYGRAPH_URL",
      !hygraphToken && "HYGRAPH_TALENT_GUIDE_PROD_TOKEN",
      !hygraphPreviewToken && "HYGRAPH_TALENT_GUIDE_PREVIEW_TOKEN",
   ].filter(Boolean)
   throw new Error(
      `Missing Hygraph environment variables: ${missingConfigs.join(", ")}`
   )
}

/**
 * Creates a GraphQL client for the Talent Guide API.
 *
 * @param {boolean} preview - Determines whether to use the preview token and draft stage.
 * @returns {GraphQLClient} A configured GraphQL client for the Talent Guide API.
 *
 * @description
 * This function creates a GraphQL client with the appropriate authentication and stage settings.
 * If preview is true, it uses the preview token and the DRAFT stage.
 * If preview is false, it uses the production token and the PUBLISHED stage.
 * The client also includes a request middleware to automatically add the stage to every request.
 */
export const createTalentGuideClient = (preview: boolean) => {
   const token = preview ? hygraphPreviewToken : hygraphToken
   const stage = preview ? "DRAFT" : "PUBLISHED"

   return new GraphQLClient(hygraphUrl, {
      headers: {
         Authorization: `Bearer ${token}`,
      },
      // Add the stage to every request
      requestMiddleware: (request) => {
         if (request.variables) {
            request.variables = { ...request.variables, stage }
         } else {
            request.variables = { stage }
         }
         return request
      },
   })
}
