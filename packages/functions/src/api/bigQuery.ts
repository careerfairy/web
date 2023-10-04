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
   private readonly userDataTable = `\`${this.dataset}.userData_schema_userData_latest\``

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
            `LOWER(university_name) like '%${filters.universityName}%'`
         )
      }
      if (universityCountryCodesString.length > 0) {
         whereQueries.push(
            `universityCountryCode IN (${universityCountryCodesString})`
         )
      }
      if (universityCodesString.length > 0) {
         whereQueries.push(`university_code IN (${universityCodesString})`)
      }
      if (fieldOfStudyIdsString.length > 0) {
         whereQueries.push(`fieldOfStudy_id IN (${fieldOfStudyIdsString})`)
      }
      if (levelOfStudyIdsString.length > 0) {
         whereQueries.push(`levelOfStudy_id IN (${levelOfStudyIdsString})`)
      }
      if (countriesOfInterestString.length > 0) {
         whereQueries.push(
            `REGEXP_CONTAINS(countriesOfInterest, "${countriesOfInterestString}")`
         )
      }

      const query = `
      SELECT
         COUNT(*) OVER () AS totalHits,
         firstName,
         lastName,
         universityCountryCode,
         university_code AS universityCode,
         university_name AS universityName,
         userEmail,
         linkedinUrl,
         unsubscribed,
         fieldOfStudy_name AS fieldOfStudyName,
         fieldOfStudy_id AS fieldOfStudyId,
         levelOfStudy_name AS levelOfStudyName,
         levelOfStudy_id AS levelOfStudyId,
         countriesOfInterest,
         lastActivityAt
      FROM 
         ${this.userDataTable}
      WHERE
         (unsubscribed = false OR unsubscribed IS NULL) 
         AND TIMESTAMP(lastActivityAt) >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 18 MONTH))
         ${whereQueries.length ? "AND " + whereQueries.join(" AND ") : ""}
      ORDER BY 
         ${orderBy} ${sortOrder} NULLS LAST
      ${limit === false ? "" : `LIMIT ${limit} OFFSET ${page * limit}`}
      `
      const options = {
         query: query,
      }

      const [rows] = await this.client.query(options)

      return rows as BigQueryUserResponse[]
   }
}
