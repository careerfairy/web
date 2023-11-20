import BigQueryServiceCore from "./IBigQueryService"
import { BigQuery, TableMetadata } from "@google-cloud/bigquery"
import { isProductionEnvironment } from "../../util"
import { logger } from "firebase-functions"

class BigQueryCRUDService<TRow> extends BigQueryServiceCore {
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
      super(bigQueryClient, datasetId, tableId, tableOptions)
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
      logger.log(`Inserted ${rows.length} rows`)
   }

   /**
    * Insert data into the table.
    * @param {TRow[]} rows - The rows to insert.
    * @returns {Promise<void>}
    */
   public async insertData(rows: TRow[]): Promise<void> {
      await this.handleInsert(rows).catch(this.createTableOnError)
   }

   /**
    * Handle error when inserting data into the table.
    * If the table does not exist and the environment is not production, create a new one.
    * @param {any} error - The error object.
    */
   protected createTableOnError = async (error: any) => {
      if (error.code === 404 && !isProductionEnvironment()) {
         logger.warn("Table does not exist. Attempting to create table...")
         await this.createTable()
         logger.info(
            "Table created successfully. Note: Data insertion will not be retried in this call." +
               "Please make another call to insert data." +
               "It may take up to 30 seconds for the table to be ready for data insertion even though the table has been created."
         )
      } else {
         throw error
      }
   }

   public async read() {
      throw new Error("Not implemented.")
   }

   public async delete() {
      throw new Error("Not implemented.")
   }
}

export default BigQueryCRUDService
