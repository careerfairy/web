import { SparkEvent } from "@careerfairy/shared-lib/sparks/analytics"
import { BigQuery } from "@google-cloud/bigquery"
import bigQueryClient from "../api/bigQueryClient"

const env = process.env.NODE_ENV

/**
 * Class to handle BigQuery operations.
 */
class BigQueryHandler<TRow> {
   private bigQueryClient: BigQuery
   private datasetId: string
   private tableId: string

   /**
    * Create a new BigQueryHandler.
    * @param {BigQuery} bigQueryClient - The BigQuery client.
    * @param {string} datasetId - The ID of the dataset.
    * @param {string} tableId - The ID of the table.
    */
   constructor(bigQueryClient: BigQuery, datasetId: string, tableId: string) {
      this.bigQueryClient = bigQueryClient
      this.datasetId = datasetId
      this.tableId = tableId
   }

   /**
    * Insert data into the table.
    * @param {TRow[]} rows - The rows to insert.
    * @returns {Promise<void>}
    */
   public async insertData(rows: TRow[]): Promise<void> {
      try {
         console.log(
            "🚀 ~ file: BigQueryHandler.ts:38 ~ BigQueryHandler<TRow> ~ insertData ~ env:",
            process.env.NODE_ENV
         )
         await this.bigQueryClient
            .dataset(this.datasetId)
            .table(this.tableId + `_${env}`)
            .insert(rows)
      } catch (error) {
         if (error.code === 404) {
            console.log(
               "🚀 ~ file: BigQueryHandler.ts:38 ~ BigQueryHandler<TRow> ~ insertData ~ error.code:",
               error.code
            )
         }
      }
      console.log(`Inserted ${rows.length} rows`)
   }

   /**
    * Increment a field in a row.
    * @param {string} rowId - The ID of the row.
    * @param {string} fieldName - The name of the field.
    * @param {number} incrementBy - The amount to increment by.
    * @returns {Promise<void>}
    */
   public async incrementField(
      rowId: string,
      fieldName: keyof TRow & string,
      incrementBy: number
   ): Promise<void> {
      const query = `
      UPDATE \`${this.datasetId}.${this.tableId}\`
      SET ${fieldName} = ${fieldName} + ${incrementBy}
      WHERE id = '${rowId}'
    `

      const [job] = await this.bigQueryClient.createQueryJob({ query })
      await job.getQueryResults()
   }
}

// Singleton instances of BigQueryHandler
export const sparkEventsHandler = new BigQueryHandler<SparkEvent>(
   bigQueryClient,
   "SparkAnalytics",
   "SparkEvents"
)

export default BigQueryHandler
