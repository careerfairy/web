import { BusinessFunctionsTagValues } from "@careerfairy/shared-lib/constants/tags"
import { TagsSelector } from "./TagsSelector"

export const BusinessFunctionsTagSelector = () => {
   return (
      <TagsSelector
         tags={BusinessFunctionsTagValues}
         field="businessFunctionsTagIds"
         label="What kind of work are you excited about?"
         description="Select at least 1 to improve your experience:"
      />
   )
}
