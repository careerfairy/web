import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { languageOptionCodes } from "@careerfairy/shared-lib/constants/forms"
import {
   BusinessFunctionsTagValues,
   ContentHits,
   ContentHitsCount,
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

      const languagesCounter = this.getInitialContentHits(languageOptionCodes)

      this.buildLivestreamsCount(
         businessFunctionsCounter,
         contentTopicsCounter,
         languagesCounter
      ).buildSparksCount(contentTopicsCounter, languagesCounter)

      return {
         businessFunctions: {
            hits: businessFunctionsCounter,
         },
         contentTopics: {
            hits: contentTopicsCounter,
         },
         languages: {
            hits: languagesCounter,
         },
      }
   }

   private buildLivestreamsCount(
      businessFunctionsCounter: ContentHits,
      contentTopicsCounter: ContentHits,
      languagesCounter: ContentHits
   ): TagsHitsDataParser {
      this.events.forEach((event) => {
         event.businessFunctionsTagIds?.forEach((tagId) => {
            this.setTagCount(
               tagId,
               businessFunctionsCounter,
               (hit) => ++hit.livestreams
            )
         })

         event.contentTopicsTagIds?.forEach((tagId) => {
            this.setTagCount(
               tagId,
               contentTopicsCounter,
               (hit) => ++hit.livestreams
            )
         })
         if (
            Boolean(event.language?.code) &&
            Boolean(languagesCounter[event.language?.code])
         ) {
            this.setTagCount(
               event.language?.code,
               languagesCounter,
               (hit) => ++hit.livestreams
            )
         }
      })
      return this
   }

   private buildSparksCount(
      contentTopicsCounter: ContentHits,
      languagesCounter: ContentHits
   ): TagsHitsDataParser {
      this.sparks?.forEach((spark) => {
         spark.contentTopicsTagIds?.forEach((tagId) => {
            this.setTagCount(tagId, contentTopicsCounter, (hit) => ++hit.sparks)
         })

         spark.languageTagIds?.forEach((tagId) => {
            this.setTagCount(tagId, languagesCounter, (hit) => ++hit.sparks)
         })
      })
      return this
   }
   private setTagCount(
      tagId: string,
      contentHits: ContentHits,
      setCount: (hit: ContentHitsCount) => void
   ) {
      ++contentHits[tagId].contentHits
      setCount(contentHits[tagId].count)
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
