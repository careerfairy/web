import {
   SparkEvent,
   SparkSecondWatched,
} from "@careerfairy/shared-lib/sparks/analytics"
import { BigQuery, TableMetadata } from "@google-cloud/bigquery"
import bigQueryClient from "../../api/bigQueryClient"
import { getBigQueryTablePrefix, isProductionEnvironment } from "../../util"
import sparkEvents from "./schema-views/sparkEvents.json"
import sparkSecondsWatched from "./schema-views/sparkSecondsWatched.json"

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

      this.tableId = `${tableId}${getBigQueryTablePrefix()}`

      this.tableOptions = tableOptions
   }

   /**
    * Create a new table.
    * @returns {Promise<void>}
    */
   public async createTable(): Promise<void> {
      await this.bigQueryClient
         .dataset(this.datasetId)
         .createTable(this.tableId, this.tableOptions)
   }

   private async handleInsert(rows: TRow[]): Promise<void> {
      await this.bigQueryClient
         .dataset(this.datasetId)
         .table(this.tableId)
         .insert(rows)
      console.log(`Inserted ${rows.length} rows`)
   }

   /**
    * Insert data into the table.
    * @param {TRow[]} rows - The rows to insert.
    * @returns {Promise<void>}
    */
   public async insertData(rows: TRow[]): Promise<void> {
      try {
         await this.handleInsert(rows)
      } catch (error) {
         // Create the table on the fly if it doesn't exist except in production, we don't want to create tables on the fly in production
         if (error.code === 404 && !isProductionEnvironment()) {
            console.log("Table does not exist. Attempting to create table...")
            await this.createTable()
            console.log(
               "Table created successfully. Note: Data insertion will not be retried in this call." +
                  "Please make another call to insert data." +
                  "It may take up to 30 seconds for the table to be ready for data insertion even though the table has been created."
            )
         } else {
            throw error
         }
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

export const sparkSecondsWatchedHanlder =
   new BigQueryHandler<SparkSecondWatched>(
      bigQueryClient,
      "SparkAnalytics",
      "SparkSecondsWatched",
      {
         schema: sparkSecondsWatched,
         timePartitioning: { type: "DAY", field: "timestamp" },
      }
   )

export default BigQueryHandler
