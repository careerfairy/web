import {
   CompetitorCompanyBigQueryResult,
   CompetitorCompanyStats,
   CompetitorStatsFromBigQuery,
   CompetitorTopCompaniesBase,
   CompetitorTopCompaniesData,
} from "@careerfairy/shared-lib/sparks/analytics"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import { ISparkFunctionsRepository } from "../SparkFunctionsRepository"
import { convertSparkToCompetitorStaticCardData } from "./utils"

interface ITopCompaniesBuilder {
   buildTopCompaniesByIndustrySparksIdsLookup(): ITopCompaniesBuilder
   fetchSparksData(
      sparksRepo: ISparkFunctionsRepository
   ): Promise<ITopCompaniesBuilder>
   initAuxiliaryLookups(): ITopCompaniesBuilder
   buildTopCompaniesByIndustry(): ITopCompaniesBuilder
   buildTopCompaniesOnAllIndustries(): ITopCompaniesBuilder
   result(): CompetitorTopCompaniesData
}

export class TopCompaniesBuilder implements ITopCompaniesBuilder {
   private readonly bigQueryResults: CompetitorCompanyBigQueryResult[]
   private readonly bigQueryResultsNoDuplicateSparks: CompetitorCompanyBigQueryResult[]

   private readonly NUM_SPARKS_LIMIT: number
   private readonly MIN_COMPANIES_PER_INDUSTRY = 3
   private readonly MAX_COMPANIES_PER_INDUSTRY = 5

   private readonly groupId: string

   // Lookup for company stats for "All Industries"
   private companyStatDataLookup: Record<string, CompetitorCompanyStats> = {}

   // Lookup for company stats for each industry
   private companyStatDataByIndustryLookup: Record<
      string,
      Record<string, CompetitorCompanyStats>
   > = {}

   private companyRankingByIndustryLookup: Record<
      string,
      Record<string, number>
   > = {}

   private sparkStatsLookup: Record<string, CompetitorStatsFromBigQuery> = {}

   private sparksIdsByIndustryAndCompanyLookup: Record<
      string,
      Record<string, Array<string>>
   > = undefined

   private sparksLookup: Record<string, Spark> = {}

   private sparks: Spark[] = []

   private topCompaniesByIndustry: CompetitorTopCompaniesData = {}

   constructor(
      bigQueryResults: CompetitorCompanyBigQueryResult[],
      numSparksLimit: number,
      groupId: string
   ) {
      this.bigQueryResults = bigQueryResults
      this.bigQueryResultsNoDuplicateSparks =
         this.removeDuplicateSparks(bigQueryResults)
      this.NUM_SPARKS_LIMIT = numSparksLimit
      this.groupId = groupId
   }

   private removeDuplicateSparks(
      bigQueryResults: CompetitorCompanyBigQueryResult[]
   ): CompetitorCompanyBigQueryResult[] {
      const visitedItems = new Set<string>()
      const bigQueryResultsNoDuplicateSparks = []
      for (const item of bigQueryResults) {
         if (!visitedItems.has(item.sparkId)) {
            bigQueryResultsNoDuplicateSparks.push(item)
            visitedItems.add(item.sparkId)
         }
      }

      return bigQueryResultsNoDuplicateSparks
   }

   private sparksIdsByIndustryAndCompanyLookupIsRequired(): void {
      if (this.sparksIdsByIndustryAndCompanyLookup === undefined) {
         throw new Error(
            "Sparks ids by industry and company lookup is required"
         )
      }
   }

   buildTopCompaniesByIndustrySparksIdsLookup() {
      // Creates lookup for sparks ids by industry and company
      for (const item of this.bigQueryResults) {
         if (!this.sparksIdsByIndustryAndCompanyLookup[item.industry]) {
            this.sparksIdsByIndustryAndCompanyLookup[item.industry] = {}
         }

         const numOfSparkIdsAlreadyAdded =
            this.sparksIdsByIndustryAndCompanyLookup?.[item.industry]?.[
               item.groupId
            ]?.length || 0

         if (numOfSparkIdsAlreadyAdded < this.NUM_SPARKS_LIMIT) {
            if (
               !this.sparksIdsByIndustryAndCompanyLookup[item.industry][
                  item.groupId
               ]
            ) {
               this.sparksIdsByIndustryAndCompanyLookup[item.industry][
                  item.groupId
               ] = []
            }

            this.sparksIdsByIndustryAndCompanyLookup[item.industry][
               item.groupId
            ].push(item.sparkId)
         }
      }

      // Deletes companies that are not in the top 5
      // Deletes industries that don't have enough companies
      for (const industry of Object.keys(
         this.sparksIdsByIndustryAndCompanyLookup
      )) {
         let topCompanyCounter = 1
         const companies = Object.keys(
            this.sparksIdsByIndustryAndCompanyLookup[industry]
         )
         for (const groupId of companies) {
            if (topCompanyCounter > 5 && groupId !== this.groupId) {
               delete this.sparksIdsByIndustryAndCompanyLookup[industry][
                  groupId
               ]
            }
            topCompanyCounter++
         }

         const hasEnoughCompanies =
            companies.length >= this.MIN_COMPANIES_PER_INDUSTRY

         if (!hasEnoughCompanies) {
            delete this.sparksIdsByIndustryAndCompanyLookup[industry]
         }
      }

      return this
   }

   private getSparkIdsForTopCompaniesByIndustry() {
      this.sparksIdsByIndustryAndCompanyLookupIsRequired()

      return Array.from(
         new Set(
            Object.values(this.sparksIdsByIndustryAndCompanyLookup) // Gets all top companies data e.g. [{ companyA: [id1, id2, id3] }, { companyB: [id2, id3, id4] }, ...]
               .flatMap(Object.values) // Flattens the array of sparks ids e.g. [[id1, id2, id3], [id2, id3, id4]]
               .flat() // Flattens the array of sparks ids e.g. [id1, id2, id3, id2, id3, id4]
         ) // Removes duplicates e.g. [id1, id2, id3, id4]
      ) // Converts to array
   }

   private getTopCompanyIdsOverall(): Set<string> {
      // Get all sparks ids for "All Industries" companies
      const companyIdsSet = new Set<string>()

      for (const item of this.bigQueryResults) {
         if (companyIdsSet.size < this.MAX_COMPANIES_PER_INDUSTRY) {
            companyIdsSet.add(item.groupId)
         }
      }

      return companyIdsSet
   }

   private getSparkIdsForTopCompanyIdsOverall(
      topCompanyIds: Set<string>
   ): Record<string, string[]> {
      const companySparksIds: Record<string, string[]> = {}

      for (const item of this.bigQueryResults) {
         if (!topCompanyIds.has(item.groupId)) {
            continue
         }

         if (!companySparksIds[item.groupId]) {
            companySparksIds[item.groupId] = []
         }

         if (companySparksIds[item.groupId].length < this.NUM_SPARKS_LIMIT) {
            companySparksIds[item.groupId].push(item.sparkId)
         }
      }

      return companySparksIds
   }

   private getSparkIdsForAllIndustryCompanies() {
      this.sparksIdsByIndustryAndCompanyLookupIsRequired()

      const topCompaniesIdsSet = this.getTopCompanyIdsOverall()
      const topCompaniesSparksIds =
         this.getSparkIdsForTopCompanyIdsOverall(topCompaniesIdsSet)

      let thisCompanyTopSparksIdsOverall: string[] = []

      if (!topCompaniesIdsSet.has(this.groupId)) {
         const companyRanking =
            this.bigQueryResults.findIndex(
               (item) => item.groupId === this.groupId
            ) + 1
         if (companyRanking >= 0) {
            thisCompanyTopSparksIdsOverall = this.bigQueryResults
               .filter((item) => item.groupId === this.groupId)
               .slice(0, this.NUM_SPARKS_LIMIT)
               .map((item) => item.sparkId)
         }
      }

      const allIndustrySparksIdsToFetch = Array.from(
         new Set(Object.values(topCompaniesSparksIds).flat())
      )

      return [...allIndustrySparksIdsToFetch, ...thisCompanyTopSparksIdsOverall]
   }

   async fetchSparksData(sparksRepo: ISparkFunctionsRepository) {
      this.buildTopCompaniesByIndustrySparksIdsLookup()
      const topCompanySparksIds = this.getSparkIdsForTopCompaniesByIndustry()
      const allIndustrySparksIds = this.getSparkIdsForAllIndustryCompanies()
      const sparksIdsToFetch = Array.from(
         new Set([...topCompanySparksIds, ...allIndustrySparksIds])
      )

      this.sparks = await sparksRepo.getSparksByIds(sparksIdsToFetch)

      return this
   }

   private getCompanyGeneralStatsLookup(): Record<
      string,
      CompetitorCompanyStats
   > {
      const totalAveragesAux: Record<
         string,
         {
            num_items: number
            avg_watched_time: number
            avg_watched_percentage: number
         }
      > = {}

      for (const item of this.bigQueryResultsNoDuplicateSparks) {
         if (!totalAveragesAux[item.groupId]) {
            totalAveragesAux[item.groupId] = {
               num_items: 0,
               avg_watched_time: 0,
               avg_watched_percentage: 0,
            }
         }

         totalAveragesAux[item.groupId].num_items += 1
         totalAveragesAux[item.groupId].avg_watched_time +=
            item.avg_watched_time
         totalAveragesAux[item.groupId].avg_watched_percentage +=
            item.avg_watched_percentage
      }

      const lookup: Record<string, CompetitorCompanyStats> = {}

      for (const item of this.bigQueryResults) {
         if (!lookup[item.groupId]) {
            lookup[item.groupId] = {
               totalViews: 0,
               uniqueViewers: 0,
               avg_watched_time: 0,
               avg_watched_percentage: 0,
               engagement: 0,
            }
         }

         lookup[item.groupId].totalViews += item.plays || 0
         lookup[item.groupId].uniqueViewers += item.uniqueViewers || 0
         lookup[item.groupId].engagement += item.engagement || 0

         const numDataPoints = totalAveragesAux[item.groupId].num_items || 1
         lookup[item.groupId].avg_watched_time =
            (totalAveragesAux[item.groupId]?.avg_watched_time || 0) /
            numDataPoints
         lookup[item.groupId].avg_watched_percentage =
            (totalAveragesAux[item.groupId]?.avg_watched_percentage || 0) /
            numDataPoints
      }

      return lookup
   }

   private getCompanyStatsByIndustryLookup(): Record<
      string,
      Record<string, CompetitorCompanyStats>
   > {
      const totalAveragesByIndustryAux: Record<
         string,
         Record<
            string,
            {
               num_items: number
               avg_watched_time: number
               avg_watched_percentage: number
            }
         >
      > = {}

      for (const item of this.bigQueryResults) {
         if (!totalAveragesByIndustryAux[item.industry]) {
            totalAveragesByIndustryAux[item.industry] = {}
         }

         if (!totalAveragesByIndustryAux[item.industry][item.groupId]) {
            totalAveragesByIndustryAux[item.industry][item.groupId] = {
               num_items: 0,
               avg_watched_time: 0,
               avg_watched_percentage: 0,
            }
         }

         totalAveragesByIndustryAux[item.industry][item.groupId].num_items += 1
         totalAveragesByIndustryAux[item.industry][
            item.groupId
         ].avg_watched_time += item.avg_watched_time
         totalAveragesByIndustryAux[item.industry][
            item.groupId
         ].avg_watched_percentage += item.avg_watched_percentage
      }

      const lookup: Record<string, Record<string, CompetitorCompanyStats>> = {}

      for (const item of this.bigQueryResults) {
         if (!lookup[item.industry]) {
            lookup[item.industry] = {}
         }

         if (!lookup[item.industry][item.groupId]) {
            lookup[item.industry][item.groupId] = {
               totalViews: 0,
               uniqueViewers: 0,
               avg_watched_time: 0,
               avg_watched_percentage: 0,
               engagement: 0,
            }
         }

         const numberOfDataPoints =
            totalAveragesByIndustryAux[item.industry]?.[item.groupId]
               ?.num_items || 1
         const stats = lookup[item.industry][item.groupId]

         stats.totalViews += item.plays || 0
         stats.uniqueViewers += item.uniqueViewers || 0
         stats.avg_watched_time =
            totalAveragesByIndustryAux[item.industry]?.[item.groupId]
               ?.avg_watched_time / numberOfDataPoints
         stats.avg_watched_percentage =
            totalAveragesByIndustryAux[item.industry]?.[item.groupId]
               ?.avg_watched_percentage / numberOfDataPoints
         stats.engagement += item.engagement || 0
      }

      return lookup
   }

   private getCompanyRankingByIndustryLookup(
      sparksIdsLookup: Record<string, Record<string, Array<string>>>
   ): Record<string, Record<string, number>> {
      const lookup: Record<string, Record<string, number>> = {}

      for (const industry of Object.keys(sparksIdsLookup)) {
         const sparksIdsByCompany = Object.keys(sparksIdsLookup[industry])

         for (let i = 0; i < sparksIdsByCompany.length; i++) {
            const groupId = sparksIdsByCompany[i]

            if (!lookup[groupId]) {
               lookup[groupId] = {}
            }
            lookup[groupId][industry] = i + 1
         }
      }

      return lookup
   }

   private getSparkStatsLookup(): Record<string, CompetitorStatsFromBigQuery> {
      const lookup: Record<string, CompetitorStatsFromBigQuery> = {}

      for (const item of this.bigQueryResults) {
         lookup[item.sparkId] = {
            plays: item.plays,
            avg_watched_time: item.avg_watched_time,
            avg_watched_percentage: item.avg_watched_percentage,
            engagement: item.engagement,
         }
      }

      return lookup
   }

   private getSparksLookup(): Record<string, Spark> {
      return this.sparks.reduce((acc, spark) => {
         acc[spark.id] = spark
         return acc
      }, {})
   }

   initAuxiliaryLookups() {
      this.sparksIdsByIndustryAndCompanyLookupIsRequired()

      this.companyStatDataLookup = this.getCompanyGeneralStatsLookup()
      this.companyStatDataByIndustryLookup =
         this.getCompanyStatsByIndustryLookup()
      this.companyRankingByIndustryLookup =
         this.getCompanyRankingByIndustryLookup(
            this.sparksIdsByIndustryAndCompanyLookup
         )
      this.sparkStatsLookup = this.getSparkStatsLookup()
      this.sparksLookup = this.getSparksLookup()

      return this
   }

   buildTopCompaniesByIndustry() {
      for (const industry of Object.keys(
         this.sparksIdsByIndustryAndCompanyLookup
      )) {
         if (!this.topCompaniesByIndustry[industry]) {
            this.topCompaniesByIndustry[industry] = []
         }

         for (const groupId of Object.keys(
            this.sparksIdsByIndustryAndCompanyLookup[industry]
         )) {
            const group =
               this.sparksLookup[
                  this.sparksIdsByIndustryAndCompanyLookup[industry][groupId][0]
               ].group
            const companyData = {
               rank: this.companyRankingByIndustryLookup[groupId][industry],
               logo: group.logoUrl,
               name: group.universityName,
               totalViews:
                  this.companyStatDataByIndustryLookup[industry][groupId]
                     .totalViews,
               uniqueViewers:
                  this.companyStatDataByIndustryLookup[industry][groupId]
                     .uniqueViewers,
               avg_watched_time:
                  this.companyStatDataByIndustryLookup[industry][groupId]
                     .avg_watched_time,
               avg_watched_percentage:
                  this.companyStatDataByIndustryLookup[industry][groupId]
                     .avg_watched_percentage,
               engagement:
                  this.companyStatDataByIndustryLookup[industry][groupId]
                     .engagement,
            }

            this.topCompaniesByIndustry[industry].push({
               companyData,
               sparks: this.sparksIdsByIndustryAndCompanyLookup[industry][
                  groupId
               ].map((sparkId) => ({
                  data: convertSparkToCompetitorStaticCardData(
                     this.sparksLookup[sparkId]
                  ),
                  stats: {
                     plays: this.sparkStatsLookup[sparkId].plays,
                     avg_watched_time:
                        this.sparkStatsLookup[sparkId].avg_watched_time,
                     avg_watched_percentage:
                        this.sparkStatsLookup[sparkId].avg_watched_percentage,
                     engagement: this.sparkStatsLookup[sparkId].engagement,
                  },
               })),
            })
         }
      }

      return this
   }

   buildTopCompaniesOnAllIndustries() {
      const auxResult: CompetitorTopCompaniesBase[] = []
      const topCompaniesIdsSet = this.getTopCompanyIdsOverall()
      const topCompaniesSparksIds =
         this.getSparkIdsForTopCompanyIdsOverall(topCompaniesIdsSet)
      const topCompaniesIdsSetArray = Array.from(topCompaniesIdsSet)

      for (let i = 0; i < topCompaniesIdsSetArray.length; i++) {
         const groupId = topCompaniesIdsSetArray[i]

         if (!topCompaniesSparksIds[groupId]) {
            continue
         }

         const sparks = topCompaniesSparksIds[groupId]
            .filter((sparkId) => this.sparksLookup[sparkId])
            .map((sparkId) => ({
               data: convertSparkToCompetitorStaticCardData(
                  this.sparksLookup[sparkId]
               ),
               stats: {
                  plays: this.sparkStatsLookup[sparkId].plays,
                  avg_watched_time:
                     this.sparkStatsLookup[sparkId].avg_watched_time,
                  avg_watched_percentage:
                     this.sparkStatsLookup[sparkId].avg_watched_percentage,
                  engagement: this.sparkStatsLookup[sparkId].engagement,
               },
            }))

         if (sparks.length === 0) {
            continue
         }

         const companyData =
            this.sparksLookup[topCompaniesSparksIds[groupId][0]].group

         auxResult.push({
            companyData: {
               rank: i + 1,
               logo: companyData.logoUrl,
               name: companyData.universityName,
               totalViews: this.companyStatDataLookup[groupId].totalViews,
               uniqueViewers: this.companyStatDataLookup[groupId].uniqueViewers,
               avg_watched_time:
                  this.companyStatDataLookup[groupId].avg_watched_time,
               avg_watched_percentage:
                  this.companyStatDataLookup[groupId].avg_watched_percentage,
               engagement: this.companyStatDataLookup[groupId].engagement,
            },
            sparks: sparks,
         })
      }

      if (!topCompaniesIdsSet.has(this.groupId)) {
         const companyRanking =
            this.bigQueryResults.findIndex(
               (item) => item.groupId === this.groupId
            ) + 1
         if (companyRanking >= 0) {
            const topCompanySparks = this.bigQueryResults.filter(
               (item) => item.groupId === this.groupId
            )

            if (topCompanySparks.length > 0) {
               const sparks = topCompanySparks
                  .slice(0, this.NUM_SPARKS_LIMIT)
                  .map((item) => {
                     const spark = this.sparksLookup[item.sparkId]
                     return {
                        data: convertSparkToCompetitorStaticCardData(spark),
                        stats: {
                           plays: this.sparkStatsLookup[item.sparkId].plays,
                           avg_watched_time:
                              this.sparkStatsLookup[item.sparkId]
                                 .avg_watched_time,
                           avg_watched_percentage:
                              this.sparkStatsLookup[item.sparkId]
                                 .avg_watched_percentage,
                           engagement:
                              this.sparkStatsLookup[item.sparkId].engagement,
                        },
                     }
                  })

               const companyData =
                  this.sparksLookup[topCompanySparks[0].sparkId].group

               auxResult.push({
                  companyData: {
                     rank: companyRanking,
                     logo: companyData.logoUrl,
                     name: companyData.universityName,
                     totalViews:
                        this.companyStatDataLookup[this.groupId].totalViews,
                     uniqueViewers:
                        this.companyStatDataLookup[this.groupId].uniqueViewers,
                     avg_watched_time:
                        this.companyStatDataLookup[this.groupId]
                           .avg_watched_time,
                     avg_watched_percentage:
                        this.companyStatDataLookup[this.groupId]
                           .avg_watched_percentage,
                     engagement:
                        this.companyStatDataLookup[this.groupId].engagement,
                  },
                  sparks: sparks,
               })
            }
         }
      }

      this.topCompaniesByIndustry["all"] = auxResult

      return this
   }

   result(): CompetitorTopCompaniesData {
      return this.topCompaniesByIndustry
   }
}
