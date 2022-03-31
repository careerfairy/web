import { request, RequestDocument, Variables } from "graphql-request"
interface Options {
   variables: Variables
   preview: boolean
}
export async function fetchAPI(query: RequestDocument, options?: Options) {
   try {
      console.log("-> variables", options?.variables)
      console.log(
         "-> process.env.GRAPHCMS_PROJECT_API",
         process.env.GRAPHCMS_PROJECT_API
      )
      return await request(
         process.env.GRAPHCMS_PROJECT_API,
         query,
         options?.variables,
         {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
               options?.preview
                  ? process.env.GRAPHCMS_DEV_AUTH_TOKEN
                  : process.env.GRAPHCMS_PROD_AUTH_TOKEN
            }`,
         }
      )
   } catch (errors) {
      console.log("-> GRAPHCMS_PROJECT_API", process.env.GRAPHCMS_PROJECT_API)
      console.error(errors)
      throw new Error("Failed to fetch API")
   }
}
