import { ContentTopicsTagValues } from "@careerfairy/shared-lib/constants/tags"
import { TagsSelector } from "./TagsSelector"

export const ContentTopicsTagSelector = () => {
   return (
      <TagsSelector
         tags={ContentTopicsTagValues}
         field="contentTopicsTagIds"
         label="Choose the topics that spark your curiosity!"
         description="Select at least 1 to improve your experience:"
      />
   )
}
