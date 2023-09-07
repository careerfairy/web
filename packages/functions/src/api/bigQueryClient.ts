import { BigQuery } from "@google-cloud/bigquery"

const bigQueryClient = new BigQuery({
   projectId: "careerfairy-e1fd9",
   keyFile: require("../keys/big_query_service_account.json"),
   location: "EU",
})

export default bigQueryClient
