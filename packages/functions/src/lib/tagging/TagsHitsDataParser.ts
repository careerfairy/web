import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import {
   BusinessFunctionsTagValues,
   ContentHits,
   ContentTopicsTagValues,
   TagsContentHits,
} from "@careerfairy/shared-lib/constants/tags"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"

export class TagsHitsDataParser {
   constructor(private events: LivestreamEvent[], private sparks: Spark[]) {}

   public build(): TagsContentHits {
      const businessFunctionsCounter = this.getInitialContentHits(
         BusinessFunctionsTagValues
      )
      const contentTopicsCounter = this.getInitialContentHits(
         ContentTopicsTagValues
      )

      this.events.forEach((event) => {
         event.businessFunctionsTagIds?.forEach((tagId) => {
            ++businessFunctionsCounter[tagId].contentHits
            ++businessFunctionsCounter[tagId].count.livestreams
         })

         event.contentTopicsTagIds?.forEach((tagId) => {
            ++contentTopicsCounter[tagId].contentHits
            ++contentTopicsCounter[tagId].count.livestreams
         })
      })

      this.sparks.forEach((spark) => {
         spark.contentTopicsTagIds?.forEach((tagId) => {
            ++contentTopicsCounter[tagId].contentHits
            ++contentTopicsCounter[tagId].count.sparks
         })
      })

      return null
   }

   private getInitialContentHits(tags: OptionGroup[]): ContentHits {
      return Object.fromEntries(
         tags.map((tag) => {
            return [
               tag.id,
               {
                  contentHits: 0,
                  count: {
                     sparks: 0,
                     livestreams: 0,
                  },
               },
            ]
         })
      )
   }
}
