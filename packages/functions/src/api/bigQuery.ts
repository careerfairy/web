import { BigQuery } from "@google-cloud/bigquery"
import {
   BigQueryUserResponse,
   GetUserFilters,
} from "@careerfairy/shared-lib/bigQuery/types"

export interface IBigQueryRepository {
   getUsers(
      page: number,
      limit: number | false,
      orderBy: string,
      sortOrder: "DESC" | "ASC",
      filters: GetUserFilters
   ): Promise<BigQueryUserResponse[]>
}

export class BigQueryRepository implements IBigQueryRepository {
   /**
    * Create a new instance
    * @param client
    */
   private readonly dataset = "careerfairy-e1fd9.firestore_export"
   private readonly userDataTable = `\`${this.dataset}.userData_raw_latest\``

   constructor(private readonly client: BigQuery) {}

   /**
    * Get users
    */
   public async getUsers(
      page = 1,
      limit: number | false = 10,
      orderBy = "firstName",
      sortOrder: "DESC" | "ASC" = "DESC",
      filters: GetUserFilters = {
         universityCountryCodes: [],
         universityCodes: [],
         universityName: "",
         fieldOfStudyIds: [],
         levelOfStudyIds: [],
         countriesOfInterest: [],
      }
   ): Promise<BigQueryUserResponse[]> {
      const universityCodesString = filters.universityCodes
         ?.map((a) => `"${a}"`)
         .join(",")
      const universityCountryCodesString = filters.universityCountryCodes
         ?.map((a) => `"${a}"`)
         .join(",")
      const fieldOfStudyIdsString = filters.fieldOfStudyIds
         ?.map((a) => `"${a}"`)
         .join(",")
      const levelOfStudyIdsString = filters.levelOfStudyIds
         ?.map((a) => `"${a}"`)
         .join(",")
      const countriesOfInterestString = filters.countriesOfInterest
         ?.map((a) => a)
         .join("|")

      const whereQueries = []
      if (filters.universityName) {
         whereQueries.push(
            `LOWER(JSON_VALUE(DATA, "$.university.name")) like '%${filters.universityName}%'`
         )
      }
      if (universityCountryCodesString.length > 0) {
         whereQueries.push(
            `JSON_VALUE(DATA, "$.universityCountryCode") IN (${universityCountryCodesString})`
         )
      }
      if (universityCodesString.length > 0) {
         whereQueries.push(
            `JSON_VALUE(DATA, "$.university.code") IN (${universityCodesString})`
         )
      }
      if (fieldOfStudyIdsString.length > 0) {
         whereQueries.push(
            `JSON_VALUE(DATA, "$.fieldOfStudy.id") IN (${fieldOfStudyIdsString})`
         )
      }
      if (levelOfStudyIdsString.length > 0) {
         whereQueries.push(
            `JSON_VALUE(DATA, "$.levelOfStudy.id") IN (${levelOfStudyIdsString})`
         )
      }
      if (countriesOfInterestString.length > 0) {
         whereQueries.push(
            `REGEXP_CONTAINS(JSON_EXTRACT(DATA, "$.countriesOfInterest"),"${countriesOfInterestString}")`
         )
      }

      const query = `SELECT
               COUNT(*) OVER () as totalHits,
               JSON_VALUE(DATA, "$.firstName") AS firstName,
               JSON_VALUE(DATA, "$.lastName") AS lastName,
               JSON_VALUE(DATA, "$.universityCountryCode") AS universityCountryCode,
               JSON_VALUE(DATA, "$.university.code") AS universityCode,
               JSON_VALUE(DATA, "$.university.name") AS universityName,
               JSON_VALUE(DATA, "$.userEmail") AS userEmail,
               JSON_VALUE(DATA, "$.linkedinUrl") AS linkedinUrl,
               JSON_VALUE(DATA, "$.unsubscribed") AS unsubscribed,
               JSON_VALUE(DATA, "$.fieldOfStudy.name") AS fieldOfStudyName,
               JSON_VALUE(DATA, "$.fieldOfStudy.id") AS fieldOfStudyId,
               JSON_VALUE(DATA, "$.levelOfStudy.name") AS levelOfStudyName,
               JSON_VALUE(DATA, "$.levelOfStudy.id") AS levelOfStudyId,
               JSON_QUERY(DATA, "$.countriesOfInterest") AS countriesOfInterest,

               FROM ${this.userDataTable}
               WHERE
               (JSON_VALUE(DATA, "$.unsubscribed") IN ("false") OR JSON_VALUE(DATA, "$.unsubscribed") IS NULL) 
               ${whereQueries.length ? "AND " + whereQueries.join(" AND ") : ""}
               ORDER BY ${orderBy} ${sortOrder} NULLS LAST
               ${
                  limit === false
                     ? ""
                     : `LIMIT ${limit}
               OFFSET ${page * limit}`
               }
               `
      const options = {
         query: query,
      }

      const [rows] = await this.client.query(options)

      return rows as BigQueryUserResponse[]
   }
}
