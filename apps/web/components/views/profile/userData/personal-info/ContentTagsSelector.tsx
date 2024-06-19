import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { Stack } from "@mui/material"
import Selector from "components/views/signup/userInformation/tags/Selector"
import { mapOptions } from "components/views/signup/utils"
import { userRepo } from "data/RepositoryInstances"
import { useCallback } from "react"
import { errorLogAndNotify } from "util/CommonUtil"

type ContentTagsSelectorProps = {
   tags: OptionGroup[]
   field: "businessFunctionsTagIds" | "contentTopicsTagIds"
}

export const ContentTagsSelector = (props: ContentTagsSelectorProps) => {
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

   return (
      <>
         <Stack spacing={1}>
            <Selector
               handleInterestTagChange={handleSelectedInterestsChange}
               tags={props.tags}
               field={props.field}
            />
         </Stack>
      </>
   )
}
