import { RequestDocument, Variables } from "graphql-request"
import { GraphQLClient } from "graphql-request"

const graphcmsClient = (preview = false) =>
   new GraphQLClient(process.env.GRAPHCMS_PROJECT_API, {
      headers: {
         ...(process.env.GRAPHCMS_PROD_AUTH_TOKEN && {
            Authorization: `Bearer ${
               preview
                  ? process.env.GRAPHCMS_DEV_AUTH_TOKEN
                  : process.env.GRAPHCMS_PROD_AUTH_TOKEN
            }`,
         }),
      },
   })

interface Options {
   variables: Variables
   preview: boolean
}

const fetchAPI = async (query: RequestDocument, options?: Options) => {
   try {
      const client = graphcmsClient(options?.preview)
      return await client.request(query, options?.variables)
   } catch (errors) {
      console.error(errors)
      throw new Error("Failed to fetch API")
   }
}

export { graphcmsClient, fetchAPI }
