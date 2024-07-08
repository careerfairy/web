import { GroupedTags } from "@careerfairy/shared-lib/constants/tags"
import { LivestreamEvent } from "@careerfairy/shared-lib/livestreams"
import { useLivestreamSearchAlgolia } from "../live-stream/useLivestreamSearchAlgolia"

export const useLivestreamsByTags = (
   type: "future" | "past",
   tags: GroupedTags,
   limit: number
) => {
   const filters = {
      contentTopicsTagIds: Object.keys(tags.contentTopics),
      businessFunctionsTagIds: Object.keys(tags.businessFunctions),
      languageCode: Object.keys(tags.language),
   }

   const { data, setSize } = useLivestreamSearchAlgolia(
      "",
      {
         arrayFilters: filters,
         dateFilter: type,
      },
      undefined,
      undefined,
      limit
   )

   const hasMorePages = data?.length && data.at(0)?.nbPages > data.length

   return {
      hasMorePages: hasMorePages,
      data: (data?.flatMap((page) => page.deserializedHits) || []).map(
         (hit) => hit as unknown as LivestreamEvent
      ),
      setSize: setSize,
   }
}
