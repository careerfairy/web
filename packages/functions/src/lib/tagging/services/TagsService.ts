import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { languageOptionCodes } from "@careerfairy/shared-lib/constants/forms"
import {
   BusinessFunctionsTagValues,
   ContentHits,
   ContentHitsCount,
   ContentTopicsTagValues,
   TagsContentHits,
} from "@careerfairy/shared-lib/constants/tags"
import { SearchIndex } from "algoliasearch"

type CategoryHits = {
   [tagId: string]: number
}

/**
 * TODO: Add type safety to field being checked
 * Allows fetching of all tags and their respective content usage count, all through Algolia indexes.
 * With additional values added to the tags there is no need to update this class, unless new categories get added to the
 * overall values for the tags.
 */
export class TagsService {
   constructor(
      private livestreamIndex: SearchIndex,
      private sparksIndex: SearchIndex
   ) {}

   /**
    * Main method for counting a tag hit by searching the received index if the @field field contains
    * the @tag id. The response is then mapped to only the number of hits, since the actual data is not needed.
    * @param index Index for searching tag usage (livestreams, sparks or other future index).
    * @param tag Tag to look for of @type OptionGroup even though only the 'id' field is needed.
    * @param field For for checking the tag usage ('businessFunctionsTagIds', 'contentTopicsTagIds', ...).
    * @returns Promise resolving with a single dictionary for the @field tag.id, where the key is the id of the
    * OptionGroup and value the number of hits obtained for the passed index.
    */
   private async countHit(index: SearchIndex, tag: OptionGroup, field: string) {
      return index
         .search("", {
            filters: generateArrayFilterString({ [field]: [tag.id] }),
         })
         .then((response) => {
            return {
               [tag.id]: response.nbHits,
            }
         })
   }

   private async resolveHits(languageHitsPromises: Promise<CategoryHits>[]) {
      const counts = await Promise.all(languageHitsPromises)
      return Object.assign({}, ...counts)
   }

   private async countLivestreamBusinessFunctionsHits(): Promise<CategoryHits> {
      const businessFunctionHitsPromises = BusinessFunctionsTagValues.map(
         (businessFunction) => {
            return this.countHit(
               this.livestreamIndex,
               businessFunction,
               "businessFunctionsTagIds"
            )
         }
      )

      return this.resolveHits(businessFunctionHitsPromises)
   }

   private async countLivestreamContentTopicsHits(): Promise<CategoryHits> {
      const contentTopicHitsPromises = ContentTopicsTagValues.map(
         (contentTopic) => {
            return this.countHit(
               this.livestreamIndex,
               contentTopic,
               "contentTopicsTagIds"
            )
         }
      )

      return this.resolveHits(contentTopicHitsPromises)
   }

   private async countSparksContentTopicsHits(): Promise<CategoryHits> {
      const contentTopicHitsPromises = ContentTopicsTagValues.map(
         (contentTopic) => {
            return this.countHit(
               this.sparksIndex,
               contentTopic,
               "contentTopicsTagIds"
            )
         }
      )

      return this.resolveHits(contentTopicHitsPromises)
   }

   private async countLivestreamLanguageHits(): Promise<CategoryHits> {
      const languageHitsPromises = languageOptionCodes.map((language) => {
         return this.countHit(this.livestreamIndex, language, "languageCode")
      })

      return this.resolveHits(languageHitsPromises)
   }

   private async countSparksLanguageHits(): Promise<CategoryHits> {
      const languageHitsPromises = languageOptionCodes.map((language) => {
         return this.countHit(this.sparksIndex, language, "languageTagIds")
      })

      return this.resolveHits(languageHitsPromises)
   }

   async countBusinessFunctionsHits(): Promise<ContentHits> {
      const hits = await this.countLivestreamBusinessFunctionsHits()

      const contentHits = Object.keys(hits).map((tagId) => {
         return {
            [tagId]: createContentHit(hits[tagId], 0),
         }
      })

      return Object.assign({}, ...contentHits)
   }

   async countContentTopicsHits(): Promise<ContentHits> {
      const livestreamHits = await this.countLivestreamContentTopicsHits()
      const sparkHits = await this.countSparksContentTopicsHits()

      // Does not matter which keys we use, since all of the tags to be counted are from the set of all values
      const contentHits = Object.keys(livestreamHits).map((tagId) => {
         return {
            [tagId]: createContentHit(livestreamHits[tagId], sparkHits[tagId]),
         }
      })

      return Object.assign({}, ...contentHits)
   }

   async countLanguagesHits(): Promise<ContentHits> {
      const livestreamHits = await this.countLivestreamLanguageHits()
      const sparkHits = await this.countSparksLanguageHits()

      // Does not matter which keys we use, since all of the tags to be counted are from the set of all values
      const contentHits = Object.keys(livestreamHits).map((tagId) => {
         return {
            [tagId]: createContentHit(livestreamHits[tagId], sparkHits[tagId]),
         }
      })

      return Object.assign({}, ...contentHits)
   }

   async countHits(): Promise<TagsContentHits> {
      const hitsPromises = [
         this.countBusinessFunctionsHits(),
         this.countContentTopicsHits(),
         this.countLanguagesHits(),
      ]

      const [businessFunctionHits, contentTopicHits, languageHits] =
         await Promise.all(hitsPromises)

      return {
         businessFunctions: {
            hits: businessFunctionHits,
         },
         contentTopics: {
            hits: contentTopicHits,
         },
         languages: {
            hits: languageHits,
         },
      }
   }
}

/**
 * TODO: Update, should be in base algolia, TYPE SAFE
 * Generates a filter string for arrayInFilters.
 * @param {Record<string, string[]>} arrayFilters - The array filters to apply.
 * @returns {string} The constructed filter string.
 */
export const generateArrayFilterString = (
   arrayFilters: Record<string, string[]>
): string => {
   if (!arrayFilters) return ""
   const filters = []
   // Go through each filter type (e.g., "tags", "categories").
   Object.entries(arrayFilters).forEach(([filterName, filterValues]) => {
      if (filterValues && filterValues.length > 0) {
         // Combine options within a type using "OR" (any option works).
         const filterValueString = filterValues
            .filter(Boolean) // Use only valid options.
            .map((filterValue) => `${filterName}:${filterValue}`)
            .join(" OR ") // Link options with "OR".

         if (filterValueString) {
            filters.push(`(${filterValueString})`) // Enclose in parenthesis to ensure proper grouping
         }
      }
   })

   // Link different filter types with "AND" (all conditions must be met).
   return filters.join(" AND ")
}

const createContentHit = (
   eventsCount: number,
   sparksCount: number
): {
   contentHits: number
   count: ContentHitsCount
} => {
   return {
      contentHits: eventsCount + sparksCount,
      count: {
         livestreams: eventsCount,
         sparks: sparksCount,
      },
   }
}
