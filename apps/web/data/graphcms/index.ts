type Variables = { [p: string]: any }
interface Options {
   variables: Variables
   preview: boolean
}
import { GraphQLClient } from "graphql-request"

const fetchAPI = async <TData>(query: string, options?: Options) => {
   // Check if GraphCMS configuration is available
   if (!process.env.GRAPHCMS_PROJECT_API) {
      console.warn("GRAPHCMS_PROJECT_API environment variable is not configured.")
      throw new Error("GraphCMS configuration is missing")
   }

   return new GraphQLClient(process.env.GRAPHCMS_PROJECT_API, {
      headers: {
         ...(process.env.GRAPHCMS_PROD_AUTH_TOKEN && {
            Authorization: `Bearer ${
               options?.preview
                  ? process.env.GRAPHCMS_DEV_AUTH_TOKEN
                  : process.env.GRAPHCMS_PROD_AUTH_TOKEN
            }`,
         }),
      },
   }).request<TData>(query, options?.variables)
}

export { fetchAPI }
