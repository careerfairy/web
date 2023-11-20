import { BigQuery, TableMetadata } from "@google-cloud/bigquery"
import { getBigQueryTablePrefix } from "../../util"

/**
 * Class to handle BigQuery operations.
 */
class BigQueryServiceCore {
   protected bigQueryClient: BigQuery
   protected datasetId: string
   protected tableId: string
   protected tableOptions: TableMetadata

   /**
    * Create a new BigQueryServiceCore.
    * @param {BigQuery} bigQueryClient - The BigQuery client.
    * @param {string} datasetId - The ID of the dataset.
    * @param {string} tableId - The ID of the table.
    * @param {TableMetadata} tableOptions - The options for creating the table.
    */
   constructor(
      bigQueryClient: BigQuery,
      datasetId: string,
      tableId: string,
      tableOptions: TableMetadata
   ) {
      this.bigQueryClient = bigQueryClient
      this.datasetId = datasetId
      this.tableId = `${tableId}${getBigQueryTablePrefix()}`
      this.tableOptions = tableOptions
   }
}

export default BigQueryServiceCore
