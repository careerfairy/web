import algoliaIndexes from "./AlgoliaInstance"
import { SearchClient } from "algoliasearch"
import { SortType } from "../../components/views/wishlist/FilterMenu"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import { SearchResponse } from "../../types/algolia"
import interests from "../../../../packages/seed-data/src/interests"

export interface IAlgoliaRepository {
   searchWishes(
      query: string,
      options: SearchWishesOptions
   ): Promise<SearchResponse<Wish>>
}
interface SearchWishesOptions {
   sortType?: SortType
   targetInterestIds?: string[]
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
      const filters = options?.targetInterestIds
         ?.filter((s) => s.length)
         ?.map((interestId) => `interestIds:${interestId}`)
         .join(" OR ")
      return index.search<Wish>(query, {
         ...(options?.targetInterestIds && {
            filters: filters,
         }),
      })
   }
}

// Singleton
const algoliaRepo: IAlgoliaRepository = new AlgoliaRepository(algoliaIndexes)

export default algoliaRepo
