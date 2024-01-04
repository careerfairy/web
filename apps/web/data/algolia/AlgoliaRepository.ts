import algoliaSearchClient from "./AlgoliaInstance"
import { SearchClient } from "algoliasearch"
import { SortType } from "../../components/views/common/filter/FilterMenu"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import { SearchResponse } from "../../types/algolia"
import { initAlgoliaIndex } from "./util"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"

export interface IAlgoliaRepository {
   searchWishes(
      query: string,
      options: SearchWishesOptions
   ): Promise<SearchResponse<Wish>>
   searchLivestreams(query: string): Promise<SearchResponse<LivestreamEvent>>
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

   async searchLivestreams(query: string) {
      const index = initAlgoliaIndex("livestreams")
      return index.search<LivestreamEvent>(query)
   }
}

// Singleton
const algoliaRepo: IAlgoliaRepository = new AlgoliaRepository(
   algoliaSearchClient
)

export default algoliaRepo
