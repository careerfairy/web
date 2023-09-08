import { SparkEvent } from "@careerfairy/shared-lib/sparks/analytics"
import sparkEvents from "@careerfairy/bigquery-generic-schemas/schema-views/sparkEvents.json"
import { BigQuery, TableMetadata } from "@google-cloud/bigquery"
import bigQueryClient from "../api/bigQueryClient"

const env = process.env.NODE_ENV

/**
 * Class to handle BigQuery operations.
 */
class BigQueryHandler<TRow> {
   private bigQueryClient: BigQuery
   private datasetId: string
   private tableId: string
   private tableOptions: TableMetadata

   /**
    * Create a new BigQueryHandler.
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
      this.tableId = env === "production" ? tableId : `${tableId}_dev`
      this.tableOptions = tableOptions
   }

   /**
    * Insert data into the table.
    * @param {TRow[]} rows - The rows to insert.
    * @returns {Promise<void>}
    */
   public async insertData(rows: TRow[], retryCount = 0): Promise<void> {
      try {
         await this.bigQueryClient
            .dataset(this.datasetId)
            .table(this.tableId)
            .insert(rows)
         console.log(`Inserted ${rows.length} rows`)
      } catch (error) {
         if (error.code === 404 && env !== "production") {
            console.log(
               "🚀 ~ file: BigQueryHandler.ts:51 ~ BigQueryHandler<TRow> ~ insertData ~ error:",
               error
            )
            if (retryCount >= 3) {
               throw new Error("Table creation failed after 3 attempts")
            }
            await this.bigQueryClient
               .dataset(this.datasetId)
               .createTable(this.tableId, this.tableOptions)

            await this.insertData(rows)
         }

         throw error
      }
   }
}

// Singleton instances of BigQueryHandler

export const sparkEventsHandler = new BigQueryHandler<SparkEvent>(
   bigQueryClient,
   "SparkAnalytics",
   "SparkEvents",
   {
      schema: sparkEvents,
      timePartitioning: { type: "DAY", field: "timestamp" },
   }
)

export default BigQueryHandler
