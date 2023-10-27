type Variables = { [p: string]: any }
interface Options {
   variables: Variables
   preview: boolean
}
import { GraphQLClient } from "graphql-request"

const fetchAPI = async <TData>(query: string, options?: Options) => {
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
