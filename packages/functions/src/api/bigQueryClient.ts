import { BigQuery, BigQueryOptions } from "@google-cloud/bigquery"
import path from "path"
import { isTestEnvironment } from "../util"

const getOptions = (): BigQueryOptions => {
   if (isTestEnvironment()) {
      return {}
   }
   return {
      projectId: "careerfairy-e1fd9",
      keyFilename: path.resolve(
         __dirname,
         "../keys/big_query_service_account.json"
      ),
      location: "EU",
   }
}

const bigQueryClient = new BigQuery(getOptions())

export default bigQueryClient
