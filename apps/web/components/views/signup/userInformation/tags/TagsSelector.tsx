import { OptionGroup } from "@careerfairy/shared-lib/commonTypes"
import { UserData } from "@careerfairy/shared-lib/users"
import { Stack, Typography } from "@mui/material"
import ConditionalWrapper from "components/util/ConditionalWrapper"
import { userRepo } from "data/RepositoryInstances"
import { useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import { errorLogAndNotify } from "util/CommonUtil"
import { mapOptions } from "../../utils"
import { Selector } from "./Selector"

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
type TagsSelectorProps = {
   tags: OptionGroup[]
   field: keyof Pick<
      UserData,
      "businessFunctionsTagIds" | "contentTopicsTagIds"
   >
   label?: string
   description?: string
   labelSx?: any
   descriptionSx?: any
}

export const TagsSelector = (props: TagsSelectorProps) => {
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
               <ConditionalWrapper condition={Boolean(props.label)}>
                  <Typography sx={props.labelSx ? props.labelSx : styles.label}>
                     {props.label}
                  </Typography>
               </ConditionalWrapper>
               <ConditionalWrapper condition={Boolean(props.description)}>
                  <Typography
                     sx={
                        props.descriptionSx
                           ? props.descriptionSx
                           : styles.description
                     }
                  >
                     {props.description}
                  </Typography>
               </ConditionalWrapper>
            </Stack>
            <Selector
               handleInterestTagChange={handleSelectedInterestsChange}
               tags={props.tags}
               field={props.field}
            />
         </Stack>
      </>
   )
}
