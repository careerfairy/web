import { isLocalEnvironment } from "@careerfairy/shared-lib/utils"
import { BigQuery, BigQueryOptions } from "@google-cloud/bigquery"

let options: BigQueryOptions = {
   projectId: "careerfairy-e1fd9",
   keyFile: require("../keys/big_query_service_account.json"),
   location: "EU",
}

if (isLocalEnvironment()) {
   options = {}
}

const bigQueryClient = new BigQuery(options)

export default bigQueryClient
