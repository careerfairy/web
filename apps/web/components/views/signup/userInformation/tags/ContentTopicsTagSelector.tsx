import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { ContentTopicsTagValues } from "@careerfairy/shared-lib/constants/tags"
import { Stack, Typography } from "@mui/material"
import { userRepo } from "data/RepositoryInstances"
import { useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import { mapOptions } from "../../utils"
import TagsSelector from "./TagsSelector"

const styles = sxStyles({
   label: {
      color: (theme) => theme.palette.neutral[900],
      fontFamily: "Poppins",
      fontSize: "17.5px",
      fontStyle: "normal",
      fontWeight: "500",
      lineHeight: "28px",
      letterSpacing: "0.131px",
   },
   description: {
      color: (theme) => theme.palette.neutral[900],
      fontFamily: "Poppins",
      fontSize: "12.3px",
      fontStyle: "normal",
      fontWeight: "400",
      lineHeight: "17.52px",
      letterSpacing: "0.131px",
   },
})

export const ContentTopicsTagSelector = () => {
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
            <Stack spacing={0.5}>
               <Typography sx={styles.label} variant="h5">
                  Choose the topics that spark your curiosity!
               </Typography>
               <Typography sx={styles.description}>
                  Select at least 1 to improve your experience:
               </Typography>
            </Stack>
            <TagsSelector
               handleInterestTagChange={handleSelectedInterestsChange}
               tags={ContentTopicsTagValues}
               field="contentTopicsTagIds"
               label={""}
            />
         </Stack>
      </>
   )
}
