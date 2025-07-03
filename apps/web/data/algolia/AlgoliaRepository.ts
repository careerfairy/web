import { SearchResponse } from "@algolia/client-search"
import { CompanyReplicaType } from "@careerfairy/shared-lib/groups/search"
import { LivestreamReplicaType } from "@careerfairy/shared-lib/livestreams/search"

import { CustomJobReplicaType } from "@careerfairy/shared-lib/customJobs/search"
import { SparkReplicaType } from "@careerfairy/shared-lib/sparks/search"
import { Wish } from "@careerfairy/shared-lib/wishes"
import { SearchClient, SearchIndex } from "algoliasearch"
import {
   AlgoliaCompanyResponse,
   AlgoliaCustomJobResponse,
   AlgoliaLivestreamResponse,
   AlgoliaSparkResponse,
} from "types/algolia"
import { getWorkflowId, isTestEnvironment } from "util/CommonUtil"
import { SortType } from "../../components/views/common/filter/FilterMenu"
import algoliaSearchClient from "./AlgoliaInstance"
import { initAlgoliaIndex } from "./util"

export interface IAlgoliaRepository {
   searchWishes(
      query: string,
      options: SearchWishesOptions
   ): Promise<SearchResponse<Wish>>
   searchLivestreams(
      query: string,
      filters: string,
      page: number,
      targetReplica?: LivestreamReplicaType,
      itemsPerPage?: number
   ): Promise<SearchResponse<AlgoliaLivestreamResponse>>

   searchSparks(
      query: string,
      filters: string,
      page: number,
      targetReplica?: SparkReplicaType,
      itemsPerPage?: number
   ): Promise<SearchResponse<AlgoliaSparkResponse>>
   searchCompanies(
      query: string,
      filters: string,
      page: number,
      targetReplica?: CompanyReplicaType,
      itemsPerPage?: number
   ): Promise<SearchResponse<AlgoliaCompanyResponse>>

   searchCustomJobs(
      query: string,
      filters: string,
      page: number,
      targetReplica?: CustomJobReplicaType,
      itemsPerPage?: number
   ): Promise<SearchResponse<AlgoliaCustomJobResponse>>
}
interface SearchWishesOptions {
   sortType?: SortType
   targetInterestIds?: string[]
   hitsPerPage?: number
   page?: number
}
class AlgoliaRepository implements IAlgoliaRepository {
   constructor(private readonly algoliaIndexes: SearchClient) {}

   getWishSortIndex(sortType: SortType) {
      switch (sortType) {
         case "dateAsc":
            return "wishes_created_asc"
         case "dateDesc":
            return "wishes_created_desc"
         case "upvotesAsc":
            return "wishes_upvotes_asc"
         case "upvotesDesc":
            return "wishes_upvotes_desc"
         default:
            return "wishes_created_desc"
      }
   }

   async searchWishes(
      query: string,
      options: SearchWishesOptions
   ): Promise<SearchResponse<Wish>> {
      const index = this.algoliaIndexes.initIndex(
         this.getWishSortIndex(options?.sortType)
      )
      const interestFilters = options?.targetInterestIds
         ?.filter((s) => s.length)
         ?.map((interestId) => `interestIds:"${interestId}"`)
         .join(" OR ")
      const filters =
         "isPublic:true AND isDeleted:false" +
         (interestFilters ? ` AND ${interestFilters}` : "")
      return index.search<Wish>(query, {
         filters: filters,
         ...(options?.hitsPerPage && { hitsPerPage: options.hitsPerPage }),
         ...(options?.page && { page: options.page }),
      })
   }

   async searchLivestreams(
      query: string,
      filters: string,
      page: number,
      targetReplica?: LivestreamReplicaType,
      itemsPerPage?: number
   ) {
      const index = initAlgoliaIndex(
         targetReplica ? targetReplica : "livestreams"
      )

      return handleSearch<AlgoliaLivestreamResponse>(
         index,
         query,
         filters,
         page,
         itemsPerPage
      )
   }

   async searchSparks(
      query: string,
      filters: string,
      page: number,
      targetReplica?: SparkReplicaType,
      itemsPerPage?: number
   ) {
      const index = initAlgoliaIndex(targetReplica ? targetReplica : "sparks")

      return handleSearch<AlgoliaSparkResponse>(
         index,
         query,
         filters,
         page,
         itemsPerPage
      )
   }

   async searchCompanies(
      query: string,
      filters: string,
      page: number,
      targetReplica?: CompanyReplicaType,
      itemsPerPage?: number
   ) {
      const index = initAlgoliaIndex(
         targetReplica ? targetReplica : "companies"
      )

      return handleSearch<AlgoliaCompanyResponse>(
         index,
         query,
         filters,
         page,
         itemsPerPage
      )
   }

   async searchCustomJobs(
      query: string,
      filters: string,
      page: number,
      targetReplica?: CustomJobReplicaType,
      itemsPerPage?: number
   ) {
      const index = initAlgoliaIndex(
         targetReplica ? targetReplica : "customJobs"
      )

      return handleSearch<AlgoliaCustomJobResponse>(
         index,
         query,
         filters,
         page,
         itemsPerPage
      )
   }
}

/**
 * A wrapper for search operations, adjusting queries for test environments.
 */
const handleSearch = <AlgoliaResponseType>(
   index: SearchIndex,
   query: string,
   filters: string,
   page: number,
   itemsPerPage?: number
) => {
   const isTest = isTestEnvironment()
   const workflowId = getWorkflowId()

   if (isTest) {
      // This console log is required to ensure the compiler outputs the workflow ID for the CI
      console.log(`🚀 - Workflow ID: ${workflowId}`)
   }

   // Use the workflow ID to filter Algolia results
   // This ensures each test run gets isolated data
   return index.search<AlgoliaResponseType>(query, {
      hitsPerPage: itemsPerPage,
      filters: (isTest ? `workflowId:${workflowId} AND ` : "") + filters,
      page,
      cacheable: !isTest, // Disable caching for test environments as time is limited
   })
}

// Singleton
const algoliaRepo: IAlgoliaRepository = new AlgoliaRepository(
   algoliaSearchClient
)

export default algoliaRepo
