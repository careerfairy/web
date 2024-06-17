import {
   BusinessFunctionsTagValues,
   ContentTopicsTagValues,
} from "@careerfairy/shared-lib/constants/tags"
import { OptionGroup } from "@careerfairy/shared-lib/dist/commonTypes"
import { Stack } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { userRepo } from "data/RepositoryInstances"
import { useCallback } from "react"
import { errorLogAndNotify } from "util/CommonUtil"
import { useAuth } from "../../../../HOCs/AuthProvider"
import TagsSelector from "../userInformation/tags/TagsSelector"
import { mapOptions } from "../utils"

const InterestsInformation = () => {
   const { userData } = useAuth()

   const handleSelectedInterestsChange = useCallback(
      async (userEmail: string, name: string, selectedTags: OptionGroup[]) => {
         try {
            return await userRepo.updateAdditionalInformation(userEmail, {
               [name]: mapOptions(selectedTags),
            })
         } catch (error) {
            errorLogAndNotify(error)
         }
      },
      []
   )

   const BUSINESS_FUNCTIONS_INTERESTS_LABEL =
      "What kind of work are you excited about?"

   const CONTENT_TOPIC_INTERESTS_LABEL =
      "Choose the topics that spark your curiosity!"

   return (
      <ConditionalWrapper condition={Boolean(userData)}>
         <Stack
            gap={"32px"}
            direction={"column"}
            spacing={2}
            data-testid={"registration-interests-information-step"}
         >
            <TagsSelector
               handleInterestTagChange={handleSelectedInterestsChange}
               tags={ContentTopicsTagValues}
               field="contentTopicsTagIds"
               label={CONTENT_TOPIC_INTERESTS_LABEL}
            />
            <TagsSelector
               handleInterestTagChange={handleSelectedInterestsChange}
               tags={BusinessFunctionsTagValues}
               field="businessFunctionsTagIds"
               label={BUSINESS_FUNCTIONS_INTERESTS_LABEL}
            />
         </Stack>
      </ConditionalWrapper>
   )
}

export default InterestsInformation
