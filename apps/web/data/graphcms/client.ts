import { GraphQLClient } from "graphql-request"

const graphcmsClient = (preview = false) =>
   new GraphQLClient(process.env.GRAPHCMS_PROJECT_API, {
      headers: {
         "Content-Type": "application/json",
         ...(process.env.GRAPHCMS_TOKEN && {
            Authorization: `Bearer ${
               preview
                  ? process.env.GRAPHCMS_DEV_AUTH_TOKEN
                  : process.env.GRAPHCMS_PROD_AUTH_TOKEN
            }`,
         }),
      },
   })

export { graphcmsClient }
