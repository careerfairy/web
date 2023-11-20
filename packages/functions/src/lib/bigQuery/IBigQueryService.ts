import { BigQuery } from "@google-cloud/bigquery"

/**
 * Class to handle BigQuery operations.
 */
class BigQueryServiceCore {
   protected bigQueryClient: BigQuery

   /**
    * Create a new BigQueryServiceCore.
    * @param {BigQuery} bigQueryClient - The BigQuery client.
    */
   constructor(bigQueryClient: BigQuery) {
      this.bigQueryClient = bigQueryClient
   }

   public async query(sqlQuery: string, params?: object) {
      const query = {
         query: sqlQuery,
         params: params,
      }
      return this.bigQueryClient.query(query)
   }
   public async query(sqlQuery: string, params?: object) {
      const query = {
         query: sqlQuery,
         params: params,
      }
      return this.bigQueryClient.query(query)
   }
}

export default BigQueryServiceCore
